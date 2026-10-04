create table public.auth_rate_limits (
  bucket text not null
    check (bucket in ('ip', 'email')),

  key_hash text not null
    check (key_hash ~ '^[0-9a-f]{64}$'),

  attempt_count integer not null
    check (attempt_count >= 1),

  window_expires_at timestamptz not null,

  primary key (bucket, key_hash)
);

create index auth_rate_limits_expires_idx
  on public.auth_rate_limits (window_expires_at);

alter table public.auth_rate_limits enable row level security;

revoke all
  on table public.auth_rate_limits
  from anon, authenticated;

create or replace function public.consume_auth_rate_limit(
  p_bucket text,
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_allowed boolean;
begin
  if p_bucket not in ('ip', 'email') then
    raise exception 'Invalid rate-limit bucket';
  end if;

  if p_key_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid rate-limit key';
  end if;

  if p_limit < 1 or p_limit > 100 then
    raise exception 'Invalid rate-limit limit';
  end if;

  if p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception 'Invalid rate-limit window';
  end if;

  /*
   * Opportunistic cleanup.
   * At Koyomi's current scale this is plenty;
   * we can move this to a scheduled cleanup later.
   */
  delete from public.auth_rate_limits
  where window_expires_at < v_now - interval '1 day';

  insert into public.auth_rate_limits as rate_limit (
    bucket,
    key_hash,
    attempt_count,
    window_expires_at
  )
  values (
    p_bucket,
    p_key_hash,
    1,
    v_now + make_interval(secs => p_window_seconds)
  )
  on conflict (bucket, key_hash)
  do update
  set
    attempt_count =
      case
        when rate_limit.window_expires_at <= v_now
          then 1
        else rate_limit.attempt_count + 1
      end,

    window_expires_at =
      case
        when rate_limit.window_expires_at <= v_now
          then v_now + make_interval(secs => p_window_seconds)
        else rate_limit.window_expires_at
      end
  returning attempt_count <= p_limit
  into v_allowed;

  return v_allowed;
end;
$$;

revoke all
  on function public.consume_auth_rate_limit(
    text,
    text,
    integer,
    integer
  )
  from public, anon, authenticated;

grant execute
  on function public.consume_auth_rate_limit(
    text,
    text,
    integer,
    integer
  )
  to service_role;