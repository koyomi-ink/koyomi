-- ============================================================================
-- GENERIC RATE LIMITING
-- ============================================================================
-- Shared by public-facing features such as:
--   - authentication
--   - contact
--   - waitlist
--
-- Each feature receives its own scope so consuming one limiter does not affect
-- another.
-- ============================================================================


create table public.rate_limits (
  scope text not null,
  bucket text not null,
  key_hash text not null,

  attempt_count integer not null default 1,
  window_started_at timestamptz not null default now(),

  primary key (scope, bucket, key_hash),

  constraint rate_limits_scope_not_blank
    check (length(btrim(scope)) > 0),

  constraint rate_limits_bucket_not_blank
    check (length(btrim(bucket)) > 0),

  constraint rate_limits_key_hash_not_blank
    check (length(btrim(key_hash)) > 0),

  constraint rate_limits_attempt_count_positive
    check (attempt_count > 0)
);


-- This table should never be accessed directly by browser roles.
alter table public.rate_limits enable row level security;

revoke all on public.rate_limits
from public, anon, authenticated;


-- ============================================================================
-- CONSUME RATE LIMIT
-- ============================================================================
--
-- Returns:
--   true  -> request is still within the allowed limit
--   false -> limit has been exceeded
--
-- Existing buckets are reset when their time window expires.
--
-- SECURITY DEFINER is intentional:
-- callers execute this function without receiving direct access to the
-- underlying table.
-- ============================================================================

create or replace function public.consume_rate_limit(
  p_scope text,
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
  v_attempt_count integer;
begin
  if length(btrim(p_scope)) = 0 then
    raise exception 'Rate-limit scope must not be blank';
  end if;

  if length(btrim(p_bucket)) = 0 then
    raise exception 'Rate-limit bucket must not be blank';
  end if;

  if length(btrim(p_key_hash)) = 0 then
    raise exception 'Rate-limit key hash must not be blank';
  end if;

  if p_limit <= 0 then
    raise exception 'Rate-limit limit must be greater than zero';
  end if;

  if p_window_seconds <= 0 then
    raise exception 'Rate-limit window must be greater than zero';
  end if;


  insert into public.rate_limits (
    scope,
    bucket,
    key_hash,
    attempt_count,
    window_started_at
  )
  values (
    p_scope,
    p_bucket,
    p_key_hash,
    1,
    v_now
  )

  on conflict (scope, bucket, key_hash)
  do update
  set
    attempt_count =
      case
        when public.rate_limits.window_started_at
          <= v_now - (p_window_seconds * interval '1 second')
        then 1
        else public.rate_limits.attempt_count + 1
      end,

    window_started_at =
      case
        when public.rate_limits.window_started_at
          <= v_now - (p_window_seconds * interval '1 second')
        then v_now
        else public.rate_limits.window_started_at
      end

  returning attempt_count
  into v_attempt_count;


  return v_attempt_count <= p_limit;
end;
$$;


-- Only trusted backend code may invoke the limiter.
revoke all on function public.consume_rate_limit(
  text,
  text,
  text,
  integer,
  integer
)
from public, anon, authenticated;

grant execute on function public.consume_rate_limit(
  text,
  text,
  text,
  integer,
  integer
)
to service_role;