begin;


-- ============================================================================
-- KOYOMI - MULTI-ARTIST SCHEDULING MODEL
-- ============================================================================
--
-- This migration:
--
--   1. Changes artists from "auth user = artist row" into studio memberships.
--   2. Allows one authenticated user to belong to multiple studios.
--   3. Adds is_bookable separately from membership activity.
--   4. Moves recurring schedules from locations to artist + location.
--   5. Makes schedule overrides artist + location specific.
--   6. Adds overlapping manual/external busy blocks.
--   7. Keeps busy-block private titles separate from operational availability.
--   8. Updates authorization helpers and affected RLS policies.
--   9. Adds tenant-aware database constraints.
--
-- Overlap is deliberately NOT prohibited at the database level.
-- Staff may intentionally create overlapping bookings / blockers.
-- Client conflict prevention belongs to controlled booking logic.
-- ============================================================================



-- ============================================================================
-- 1. ARTISTS BECOME STUDIO MEMBERSHIPS
-- ============================================================================

-- Existing artist IDs currently equal auth.users.id.
-- Preserve those IDs so existing bookings/artwork/settings remain valid.
--
-- New memberships will receive independent UUIDs.

alter table public.artists
  add column auth_user_id uuid;


-- Existing rows map directly to their current Auth identity.
update public.artists
set auth_user_id = id
where auth_user_id is null;


alter table public.artists
  alter column auth_user_id set not null;


alter table public.artists
  add column is_bookable boolean not null default true;


-- The old artists.id FK prevents the same auth user from having an
-- independent artist row in another studio.
alter table public.artists
  drop constraint artists_id_fkey;


-- Artist ID is now an independent application identifier.
alter table public.artists
  alter column id set default gen_random_uuid();


alter table public.artists
  add constraint artists_auth_user_id_fkey
  foreign key (auth_user_id)
  references auth.users(id)
  on delete cascade;


-- One Auth account may have many artist rows,
-- but only one membership in any particular studio.
alter table public.artists
  add constraint artists_auth_user_id_studio_id_key
  unique (auth_user_id, studio_id);


create index idx_artists_auth_user_id
  on public.artists(auth_user_id);



-- ============================================================================
-- 2. ARTIST AVAILABILITY
-- ============================================================================
--
-- Normal recurring availability belongs to:
--
--     artist + location
--
-- rather than to the location itself.
-- ============================================================================

create table public.artist_availability (
  id uuid primary key default gen_random_uuid(),

  studio_id uuid not null
    references public.studios(id) on delete cascade,

  artist_id uuid not null
    references public.artists(id) on delete cascade,

  location_id uuid not null
    references public.locations(id) on delete cascade,

  weekly_schedule jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint artist_availability_weekly_schedule_is_object
    check (jsonb_typeof(weekly_schedule) = 'object'),

  constraint artist_availability_artist_location_key
    unique (artist_id, location_id),

  constraint artist_availability_studio_id_id_key
    unique (studio_id, id),

  constraint artist_availability_artist_same_studio_fkey
    foreign key (studio_id, artist_id)
    references public.artists(studio_id, id),

  constraint artist_availability_location_same_studio_fkey
    foreign key (studio_id, location_id)
    references public.locations(studio_id, id)
);


create index idx_artist_availability_studio_id
  on public.artist_availability(studio_id);

create index idx_artist_availability_artist_id
  on public.artist_availability(artist_id);

create index idx_artist_availability_location_id
  on public.artist_availability(location_id);



-- ============================================================================
-- 3. MIGRATE EXISTING LOCATION SCHEDULES
-- ============================================================================
--
-- Existing location schedules applied to the whole location.
--
-- To preserve existing behavior, give every existing artist in that studio
-- an availability row for each studio location using the location's current
-- weekly schedule.
-- ============================================================================

insert into public.artist_availability (
  studio_id,
  artist_id,
  location_id,
  weekly_schedule
)
select
  l.studio_id,
  a.id,
  l.id,
  l.weekly_schedule
from public.locations l
join public.artists a
  on a.studio_id = l.studio_id;


-- The schedule now belongs to artist_availability.
alter table public.locations
  drop column weekly_schedule;



-- ============================================================================
-- 4. REBUILD SCHEDULE OVERRIDES
-- ============================================================================
--
-- Old:
--   location + date
--
-- New:
--   artist + location + date
--
-- A schedule override changes normal working availability for one date.
-- It is NOT a personal event / blocker, so title is removed.
-- ============================================================================

alter table public.schedule_overrides
  rename to schedule_overrides_legacy;


-- PostgreSQL keeps constraint/index names when a table is renamed.
-- Rename the legacy constraints that would collide with the new table.

alter table public.schedule_overrides_legacy
  rename constraint schedule_overrides_pkey
  to schedule_overrides_legacy_pkey;

alter table public.schedule_overrides_legacy
  rename constraint schedule_overrides_studio_id_id_key
  to schedule_overrides_legacy_studio_id_id_key;


-- Prevent the old table from remaining exposed while migration runs.
revoke all on public.schedule_overrides_legacy
  from anon, authenticated;


create table public.schedule_overrides (
  id uuid primary key default gen_random_uuid(),

  studio_id uuid not null
    references public.studios(id) on delete cascade,

  artist_id uuid not null
    references public.artists(id) on delete cascade,

  location_id uuid not null
    references public.locations(id) on delete cascade,

  override_date date not null,

  -- false = artist is unavailable at this location for this date.
  -- true  = intervals replace the normal schedule for this date.
  is_active boolean not null,

  intervals jsonb not null default '[]'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint schedule_overrides_intervals_is_array
    check (jsonb_typeof(intervals) = 'array'),

  constraint schedule_overrides_artist_location_date_key
    unique (artist_id, location_id, override_date),

  constraint schedule_overrides_studio_id_id_key
    unique (studio_id, id),

  constraint schedule_overrides_artist_same_studio_fkey
    foreign key (studio_id, artist_id)
    references public.artists(studio_id, id),

  constraint schedule_overrides_location_same_studio_fkey
    foreign key (studio_id, location_id)
    references public.locations(studio_id, id)
);


-- Preserve existing overrides.
--
-- Old overrides applied to the whole location, so reproduce each override
-- for every current artist belonging to that location's studio.

insert into public.schedule_overrides (
  studio_id,
  artist_id,
  location_id,
  override_date,
  is_active,
  intervals,
  created_at,
  updated_at
)
select
  old.studio_id,
  a.id,
  old.location_id,
  old.override_date,
  old.is_active,
  old.intervals,
  old.created_at,
  old.updated_at
from public.schedule_overrides_legacy old
join public.artists a
  on a.studio_id = old.studio_id;


drop table public.schedule_overrides_legacy;


create index idx_schedule_overrides_studio_id
  on public.schedule_overrides(studio_id);

create index idx_schedule_overrides_artist_id
  on public.schedule_overrides(artist_id);

create index idx_schedule_overrides_location_id
  on public.schedule_overrides(location_id);

create index idx_schedule_overrides_override_date
  on public.schedule_overrides(override_date);



-- ============================================================================
-- 5. BUSY BLOCKS
-- ============================================================================
--
-- Busy blocks are concrete periods where an artist is unavailable.
--
-- They may overlap:
--   - other busy blocks
--   - Google/external calendar events
--   - existing bookings
--
-- location_id NULL means:
--   unavailable regardless of studio location.
--
-- location_id set means:
--   blocker applies specifically to that location.
--
-- No exclusion/overlap constraint is intentional.
-- ============================================================================

create table public.busy_blocks (
  id uuid primary key default gen_random_uuid(),

  studio_id uuid not null
    references public.studios(id) on delete cascade,

  artist_id uuid not null
    references public.artists(id) on delete cascade,

  location_id uuid
    references public.locations(id) on delete cascade,

  source text not null default 'manual'
    check (source in ('manual', 'external')),

  starts_at timestamptz not null,
  ends_at timestamptz not null,

  -- Used later for imported calendar events.
  -- NULL for ordinary manual blockers.
  external_event_id text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint busy_blocks_time_range_valid
    check (ends_at > starts_at),

  constraint busy_blocks_studio_id_id_key
    unique (studio_id, id),

  constraint busy_blocks_artist_same_studio_fkey
    foreign key (studio_id, artist_id)
    references public.artists(studio_id, id),

  constraint busy_blocks_location_same_studio_fkey
    foreign key (studio_id, location_id)
    references public.locations(studio_id, id)
);


create index idx_busy_blocks_studio_id
  on public.busy_blocks(studio_id);

create index idx_busy_blocks_artist_id
  on public.busy_blocks(artist_id);

create index idx_busy_blocks_location_id
  on public.busy_blocks(location_id);

create index idx_busy_blocks_starts_at
  on public.busy_blocks(starts_at);

create index idx_busy_blocks_ends_at
  on public.busy_blocks(ends_at);

-- Common availability lookup:
-- "Which blockers does this artist have around this time?"
create index idx_busy_blocks_artist_time
  on public.busy_blocks(artist_id, starts_at, ends_at);


-- External IDs only need uniqueness when they exist.
create unique index busy_blocks_external_event_key
  on public.busy_blocks(artist_id, external_event_id)
  where external_event_id is not null;



-- ============================================================================
-- 6. PRIVATE BUSY-BLOCK DETAILS
-- ============================================================================
--
-- Operational scheduling needs to know:
--   "Sarah is busy from 14:00 to 15:00."
--
-- It does NOT necessarily need to know:
--   "Sarah has a doctor appointment."
--
-- Keep private labels separate so availability access does not automatically
-- reveal personal information.
-- ============================================================================

create table public.busy_block_private_details (
  busy_block_id uuid primary key
    references public.busy_blocks(id) on delete cascade,

  title text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint busy_block_private_details_title_not_blank
    check (
      title is null
      or length(btrim(title)) > 0
    )
);



-- ============================================================================
-- 7. UPDATED_AT TRIGGERS
-- ============================================================================

create trigger set_artist_availability_updated_at
before update on public.artist_availability
for each row
execute function private.handle_updated_at();


create trigger set_schedule_overrides_updated_at
before update on public.schedule_overrides
for each row
execute function private.handle_updated_at();


create trigger set_busy_blocks_updated_at
before update on public.busy_blocks
for each row
execute function private.handle_updated_at();


create trigger set_busy_block_private_details_updated_at
before update on public.busy_block_private_details
for each row
execute function private.handle_updated_at();



-- ============================================================================
-- 8. UPDATE AUTHORIZATION HELPERS
-- ============================================================================

create or replace function private.is_studio_member(
  target_studio_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.artists
    where artists.auth_user_id = (select auth.uid())
      and artists.studio_id = target_studio_id
      and artists.is_active = true
  );
$$;


create or replace function private.is_studio_owner(
  target_studio_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.artists
    where artists.auth_user_id = (select auth.uid())
      and artists.studio_id = target_studio_id
      and artists.role = 'owner'
      and artists.is_active = true
  );
$$;


-- New helper:
-- Does the current Auth account own this particular artist membership?

create or replace function private.is_current_artist(
  target_artist_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.artists
    where artists.id = target_artist_id
      and artists.auth_user_id = (select auth.uid())
      and artists.is_active = true
  );
$$;


revoke execute on function private.is_current_artist(uuid)
  from public, anon;

grant execute on function private.is_current_artist(uuid)
  to authenticated;



-- ============================================================================
-- 9. RLS ENABLEMENT
-- ============================================================================

alter table public.artist_availability enable row level security;
alter table public.schedule_overrides enable row level security;
alter table public.busy_blocks enable row level security;
alter table public.busy_block_private_details enable row level security;



-- ============================================================================
-- 10. UPDATE ARTIST RLS
-- ============================================================================

drop policy if exists "Artists can update their own profile"
  on public.artists;


create policy "Artists can update their own profile"
on public.artists
for update
to authenticated
using (
  auth_user_id = (select auth.uid())
  and is_active = true
)
with check (
  auth_user_id = (select auth.uid())
  and is_active = true
);


-- Existing public/member SELECT policies remain valid.
--
-- Membership INSERT/DELETE and security-sensitive fields remain controlled
-- by trusted server-side operations.



-- ============================================================================
-- 11. UPDATE ARTIST SETTINGS RLS
-- ============================================================================

drop policy if exists "Artists can view their own settings"
  on public.artist_settings;

drop policy if exists "Artists can create their own settings"
  on public.artist_settings;

drop policy if exists "Artists can update their own settings"
  on public.artist_settings;


create policy "Artists can view their own settings"
on public.artist_settings
for select
to authenticated
using (
  (select private.is_current_artist(artist_id))
);


create policy "Artists can create their own settings"
on public.artist_settings
for insert
to authenticated
with check (
  (select private.is_current_artist(artist_id))
);


create policy "Artists can update their own settings"
on public.artist_settings
for update
to authenticated
using (
  (select private.is_current_artist(artist_id))
)
with check (
  (select private.is_current_artist(artist_id))
);



-- ============================================================================
-- 12. ARTIST AVAILABILITY RLS
-- ============================================================================
--
-- Public:
--   may read availability only for active + bookable artists and public
--   locations.
--
-- Artist:
--   may manage their own availability.
--
-- Studio owner:
--   may manage availability for artists in their studio.
-- ============================================================================

create policy "Public can view bookable artist availability"
on public.artist_availability
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.artists a
    join public.locations l
      on l.id = artist_availability.location_id
    where a.id = artist_availability.artist_id
      and a.studio_id = artist_availability.studio_id
      and a.is_active = true
      and a.is_bookable = true
      and l.studio_id = artist_availability.studio_id
      and l.is_public = true
  )
);


create policy "Artists and owners can create artist availability"
on public.artist_availability
for insert
to authenticated
with check (
  (
    (select private.is_current_artist(artist_id))
    or
    (select private.is_studio_owner(studio_id))
  )

  and exists (
    select 1
    from public.artists a
    where a.id = artist_availability.artist_id
      and a.studio_id = artist_availability.studio_id
  )

  and exists (
    select 1
    from public.locations l
    where l.id = artist_availability.location_id
      and l.studio_id = artist_availability.studio_id
  )
);


create policy "Artists and owners can update artist availability"
on public.artist_availability
for update
to authenticated
using (
  (select private.is_current_artist(artist_id))
  or
  (select private.is_studio_owner(studio_id))
)
with check (
  (
    (select private.is_current_artist(artist_id))
    or
    (select private.is_studio_owner(studio_id))
  )

  and exists (
    select 1
    from public.artists a
    where a.id = artist_availability.artist_id
      and a.studio_id = artist_availability.studio_id
  )

  and exists (
    select 1
    from public.locations l
    where l.id = artist_availability.location_id
      and l.studio_id = artist_availability.studio_id
  )
);


create policy "Artists and owners can delete artist availability"
on public.artist_availability
for delete
to authenticated
using (
  (select private.is_current_artist(artist_id))
  or
  (select private.is_studio_owner(studio_id))
);



-- ============================================================================
-- 13. SCHEDULE OVERRIDES RLS
-- ============================================================================

create policy "Public can view bookable schedule overrides"
on public.schedule_overrides
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.artists a
    join public.locations l
      on l.id = schedule_overrides.location_id
    where a.id = schedule_overrides.artist_id
      and a.studio_id = schedule_overrides.studio_id
      and a.is_active = true
      and a.is_bookable = true
      and l.studio_id = schedule_overrides.studio_id
      and l.is_public = true
  )
);


create policy "Artists and owners can create schedule overrides"
on public.schedule_overrides
for insert
to authenticated
with check (
  (
    (select private.is_current_artist(artist_id))
    or
    (select private.is_studio_owner(studio_id))
  )

  and exists (
    select 1
    from public.artists a
    where a.id = schedule_overrides.artist_id
      and a.studio_id = schedule_overrides.studio_id
  )

  and exists (
    select 1
    from public.locations l
    where l.id = schedule_overrides.location_id
      and l.studio_id = schedule_overrides.studio_id
  )
);


create policy "Artists and owners can update schedule overrides"
on public.schedule_overrides
for update
to authenticated
using (
  (select private.is_current_artist(artist_id))
  or
  (select private.is_studio_owner(studio_id))
)
with check (
  (
    (select private.is_current_artist(artist_id))
    or
    (select private.is_studio_owner(studio_id))
  )

  and exists (
    select 1
    from public.artists a
    where a.id = schedule_overrides.artist_id
      and a.studio_id = schedule_overrides.studio_id
  )

  and exists (
    select 1
    from public.locations l
    where l.id = schedule_overrides.location_id
      and l.studio_id = schedule_overrides.studio_id
  )
);


create policy "Artists and owners can delete schedule overrides"
on public.schedule_overrides
for delete
to authenticated
using (
  (select private.is_current_artist(artist_id))
  or
  (select private.is_studio_owner(studio_id))
);



-- ============================================================================
-- 14. BUSY BLOCKS RLS
-- ============================================================================
--
-- Busy blocks are NOT public Data API data.
--
-- Artists can fully manage their own blockers.
--
-- Studio owners/members may need operational visibility to avoid scheduling
-- conflicts. They may see the busy interval itself, but private titles are
-- stored separately.
-- ============================================================================

create policy "Studio members can view busy blocks"
on public.busy_blocks
for select
to authenticated
using (
  (select private.is_studio_member(studio_id))
);


create policy "Artists can create their own busy blocks"
on public.busy_blocks
for insert
to authenticated
with check (
  (select private.is_current_artist(artist_id))

  and exists (
    select 1
    from public.artists a
    where a.id = busy_blocks.artist_id
      and a.studio_id = busy_blocks.studio_id
  )

  and (
    location_id is null
    or exists (
      select 1
      from public.locations l
      where l.id = busy_blocks.location_id
        and l.studio_id = busy_blocks.studio_id
    )
  )
);


create policy "Artists can update their own busy blocks"
on public.busy_blocks
for update
to authenticated
using (
  (select private.is_current_artist(artist_id))
)
with check (
  (select private.is_current_artist(artist_id))

  and exists (
    select 1
    from public.artists a
    where a.id = busy_blocks.artist_id
      and a.studio_id = busy_blocks.studio_id
  )

  and (
    location_id is null
    or exists (
      select 1
      from public.locations l
      where l.id = busy_blocks.location_id
        and l.studio_id = busy_blocks.studio_id
    )
  )
);


create policy "Artists can delete their own busy blocks"
on public.busy_blocks
for delete
to authenticated
using (
  (select private.is_current_artist(artist_id))
);



-- ============================================================================
-- 15. PRIVATE BUSY-BLOCK DETAILS RLS
-- ============================================================================
--
-- Only the Auth account owning the artist membership may read/write the
-- private title.
-- ============================================================================

create policy "Artists can view their own busy block details"
on public.busy_block_private_details
for select
to authenticated
using (
  exists (
    select 1
    from public.busy_blocks b
    where b.id = busy_block_private_details.busy_block_id
      and (select private.is_current_artist(b.artist_id))
  )
);


create policy "Artists can create their own busy block details"
on public.busy_block_private_details
for insert
to authenticated
with check (
  exists (
    select 1
    from public.busy_blocks b
    where b.id = busy_block_private_details.busy_block_id
      and (select private.is_current_artist(b.artist_id))
  )
);


create policy "Artists can update their own busy block details"
on public.busy_block_private_details
for update
to authenticated
using (
  exists (
    select 1
    from public.busy_blocks b
    where b.id = busy_block_private_details.busy_block_id
      and (select private.is_current_artist(b.artist_id))
  )
)
with check (
  exists (
    select 1
    from public.busy_blocks b
    where b.id = busy_block_private_details.busy_block_id
      and (select private.is_current_artist(b.artist_id))
  )
);


create policy "Artists can delete their own busy block details"
on public.busy_block_private_details
for delete
to authenticated
using (
  exists (
    select 1
    from public.busy_blocks b
    where b.id = busy_block_private_details.busy_block_id
      and (select private.is_current_artist(b.artist_id))
  )
);



-- ============================================================================
-- 16. DATA API GRANTS
-- ============================================================================

-- Public booking UI may read normal availability and overrides.
grant select
  on public.artist_availability
  to anon, authenticated;

grant select
  on public.schedule_overrides
  to anon, authenticated;


-- Authenticated artists/owners may manage availability and overrides.
grant insert, update, delete
  on public.artist_availability
  to authenticated;

grant insert, update, delete
  on public.schedule_overrides
  to authenticated;


-- Busy intervals are authenticated operational data only.
revoke all
  on public.busy_blocks
  from anon;

grant select, insert, update, delete
  on public.busy_blocks
  to authenticated;


-- Private busy-block details are never anonymous.
revoke all
  on public.busy_block_private_details
  from anon;

grant select, insert, update, delete
  on public.busy_block_private_details
  to authenticated;



-- ============================================================================
-- 17. ARTIST COLUMN PRIVILEGES
-- ============================================================================
--
-- artists previously had no general UPDATE table privilege.
-- Keep membership/security fields server-controlled.
--
-- Allow a user to change only their display name directly.
-- is_bookable is deliberately controlled through the studio/dashboard server
-- layer because it affects public booking availability.
-- ============================================================================

revoke update on public.artists
  from authenticated;

grant update (display_name)
  on public.artists
  to authenticated;



-- ============================================================================
-- 18. FINAL FUNCTION PRIVILEGE HARDENING
-- ============================================================================

revoke execute on function private.is_studio_member(uuid)
  from public, anon;

revoke execute on function private.is_studio_owner(uuid)
  from public, anon;

revoke execute on function private.is_current_artist(uuid)
  from public, anon;

grant execute on function private.is_studio_member(uuid)
  to authenticated;

grant execute on function private.is_studio_owner(uuid)
  to authenticated;

grant execute on function private.is_current_artist(uuid)
  to authenticated;


commit;