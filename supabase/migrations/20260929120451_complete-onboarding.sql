begin;

create or replace function public.complete_onboarding(
  p_display_name text,
  p_studio_name text,
  p_studio_slug text,
  p_currency text
)
returns table (
  studio_id uuid,
  artist_id uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_studio_id uuid;
  v_artist_id uuid;
begin
  -- Never trust the caller to tell us who they are.
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  -- Mandatory onboarding is only for users who do not yet
  -- have an active artist membership.
  if exists (
    select 1
    from public.artists
    where auth_user_id = v_user_id
      and is_active = true
  ) then
    raise exception 'Account is already onboarded';
  end if;

  -- Create the studio.
  insert into public.studios (
    name,
    slug,
    currency
  )
  values (
    btrim(p_studio_name),
    lower(btrim(p_studio_slug))::public.citext,
    upper(btrim(p_currency))
  )
  returning id into v_studio_id;

  -- Create the authenticated user's owner membership.
  insert into public.artists (
    studio_id,
    auth_user_id,
    display_name,
    role,
    is_active,
    is_bookable
  )
  values (
    v_studio_id,
    v_user_id,
    btrim(p_display_name),
    'owner',
    true,
    true
  )
  returning id into v_artist_id;

  -- Both settings tables already have defaults for their
  -- actual settings values.
  insert into public.studio_settings (
    studio_id
  )
  values (
    v_studio_id
  );

  insert into public.artist_settings (
    artist_id
  )
  values (
    v_artist_id
  );

  return query
  select
    v_studio_id,
    v_artist_id;
end;
$$;

-- SECURITY DEFINER functions must not accidentally become
-- executable by everyone.
revoke all on function public.complete_onboarding(
  text,
  text,
  text,
  text
) from public;

revoke all on function public.complete_onboarding(
  text,
  text,
  text,
  text
) from anon;

grant execute on function public.complete_onboarding(
  text,
  text,
  text,
  text
) to authenticated;

commit;