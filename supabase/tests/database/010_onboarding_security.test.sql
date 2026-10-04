begin;

create extension if not exists pgtap
with schema extensions;

select plan(16);

-- ---------------------------------------------------------
-- Test identities
-- ---------------------------------------------------------

insert into auth.users (
  id,
  email
)
values
  (
    '00000000-0000-0000-0000-000000000001',
    'artist-a@example.com'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'artist-b@example.com'
  );

-- ---------------------------------------------------------
-- RPC permissions
-- ---------------------------------------------------------

select ok(
  has_function_privilege(
    'authenticated',
    'public.complete_onboarding(text,text,text,text)',
    'EXECUTE'
  ),
  'authenticated users can execute complete_onboarding'
);

select ok(
  not has_function_privilege(
    'anon',
    'public.complete_onboarding(text,text,text,text)',
    'EXECUTE'
  ),
  'anonymous users cannot execute complete_onboarding'
);

-- ---------------------------------------------------------
-- User A completes onboarding
-- ---------------------------------------------------------

set local request.jwt.claim.sub =
  '00000000-0000-0000-0000-000000000001';

set local role authenticated;

select lives_ok(
  $$
    select *
    from public.complete_onboarding(
      'Sarah',
      'Swallow Studio',
      'swallow-studio',
      'GBP'
    )
  $$,
  'authenticated user can complete onboarding'
);

reset role;

-- Studio created

select is(
  (
    select count(*)
    from public.studios
    where slug = 'swallow-studio'
  ),
  1::bigint,
  'onboarding creates one studio'
);

-- Owner membership created

select is(
  (
    select count(*)
    from public.artists
    where auth_user_id =
      '00000000-0000-0000-0000-000000000001'
      and role = 'owner'
      and is_active = true
      and is_bookable = true
  ),
  1::bigint,
  'onboarding creates an active bookable owner membership'
);

-- Studio settings created

select is(
  (
    select count(*)
    from public.studio_settings ss
    join public.studios s
      on s.id = ss.studio_id
    where s.slug = 'swallow-studio'
  ),
  1::bigint,
  'onboarding creates studio settings'
);

-- Artist settings created

select is(
  (
    select count(*)
    from public.artist_settings aset
    join public.artists a
      on a.id = aset.artist_id
    where a.auth_user_id =
      '00000000-0000-0000-0000-000000000001'
  ),
  1::bigint,
  'onboarding creates artist settings'
);

-- ---------------------------------------------------------
-- Same account cannot onboard twice
-- ---------------------------------------------------------

set local request.jwt.claim.sub =
  '00000000-0000-0000-0000-000000000001';

set local role authenticated;

select throws_ok(
  $$
    select *
    from public.complete_onboarding(
      'Sarah',
      'Second Studio',
      'second-studio',
      'GBP'
    )
  $$,
  'P0001',
  null,
  'already-onboarded account cannot onboard again'
);

reset role;

select is(
  (
    select count(*)
    from public.artists
    where auth_user_id =
      '00000000-0000-0000-0000-000000000001'
  ),
  1::bigint,
  'repeat onboarding does not create another membership'
);

-- ---------------------------------------------------------
-- Different account cannot claim an existing slug
-- ---------------------------------------------------------

set local request.jwt.claim.sub =
  '00000000-0000-0000-0000-000000000002';

set local role authenticated;

select throws_ok(
  $$
    select *
    from public.complete_onboarding(
      'Another Artist',
      'Another Swallow',
      'swallow-studio',
      'USD'
    )
  $$,
  '23505',
  null,
  'duplicate studio slug is rejected'
);

reset role;

select is(
  (
    select count(*)
    from public.artists
    where auth_user_id =
      '00000000-0000-0000-0000-000000000002'
  ),
  0::bigint,
  'failed onboarding does not create a partial artist membership'
);

-- ---------------------------------------------------------
-- User B successfully creates their own studio
-- ---------------------------------------------------------

set local request.jwt.claim.sub =
  '00000000-0000-0000-0000-000000000002';

set local role authenticated;

select lives_ok(
  $$
    select *
    from public.complete_onboarding(
      'Artist B',
      'Black Cat Tattoo',
      'black-cat-tattoo',
      'USD'
    )
  $$,
  'second authenticated user can create a different studio'
);

reset role;

-- ---------------------------------------------------------
-- Direct studio creation is prohibited
-- ---------------------------------------------------------

set local request.jwt.claim.sub =
  '00000000-0000-0000-0000-000000000001';

set local role authenticated;

select throws_ok(
  $$
    insert into public.studios (
      name,
      slug,
      currency
    )
    values (
      'Bypass Studio',
      'bypass-studio',
      'GBP'
    )
  $$,
  '42501',
  null,
  'authenticated users cannot directly create studios'
);

reset role;

-- ---------------------------------------------------------
-- Owner can update own studio
-- ---------------------------------------------------------

set local request.jwt.claim.sub =
  '00000000-0000-0000-0000-000000000001';

set local role authenticated;

select results_eq(
  $$
    with updated as (
      update public.studios
      set name = 'Swallow Studio Updated'
      where slug = 'swallow-studio'
      returning id
    )
    select count(*)::bigint
    from updated
  $$,
  $$
    values (1::bigint)
  $$,
  'studio owner can update their own studio'
);

reset role;

-- ---------------------------------------------------------
-- Owner cannot update another studio
-- ---------------------------------------------------------

set local request.jwt.claim.sub =
  '00000000-0000-0000-0000-000000000001';

set local role authenticated;

select results_eq(
  $$
    with updated as (
      update public.studios
      set name = 'Should Not Change'
      where slug = 'black-cat-tattoo'
      returning id
    )
    select count(*)::bigint
    from updated
  $$,
  $$
    values (0::bigint)
  $$,
  'studio owner cannot update another studio'
);

reset role;

-- Confirm User B's studio was not modified.

select is(
  (
    select name
    from public.studios
    where slug = 'black-cat-tattoo'
  ),
  'Black Cat Tattoo',
  'cross-studio update leaves the other studio unchanged'
);

select * from finish();

rollback;