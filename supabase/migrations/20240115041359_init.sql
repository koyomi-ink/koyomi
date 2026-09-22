-- ============================================================================
-- Koyomi - Initial Database Schema
-- Authorization + RLS foundation
-- ============================================================================

-- ============================================================================
-- 1. EXTENSIONS / PRIVATE SCHEMA
-- ============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "citext";

create schema if not exists private;

-- Secure-by-default for future public-schema objects.
-- Supabase is moving toward explicit Data API grants, so new tables/functions should only become reachable when we explicitly grant access.
alter default privileges in schema public
  revoke all on tables from anon, authenticated;

alter default privileges in schema public
  revoke execute on functions from anon, authenticated;


-- ============================================================================
-- 2. STUDIOS
-- ============================================================================
-- Public-facing studio information lives here.
-- Private billing/settings are kept in separate tables below.

create table public.studios (
  id uuid primary key default gen_random_uuid(),

  slug citext unique not null,
  name text not null,
  bio text,
  avatar_url text,
  currency text not null,

  -- Public UI customization
  theme jsonb not null default '{}'::jsonb,

  social_links jsonb not null default '{}'::jsonb,

  -- Public payment instructions
  payment_instructions jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint studios_currency_format
    check (currency ~ '^[A-Z]{3}$'),

  constraint studios_name_not_blank
    check (length(btrim(name)) > 0),

  constraint studios_theme_is_object
    check (jsonb_typeof(theme) = 'object'),

  constraint studios_social_links_is_object
    check (jsonb_typeof(social_links) = 'object'),

  constraint studios_payment_instructions_is_object
    check (jsonb_typeof(payment_instructions) = 'object')
);


-- ============================================================================
-- 3. PRIVATE STUDIO BILLING
-- ============================================================================

create table public.studio_billing (
  studio_id uuid primary key
    references public.studios(id) on delete cascade,

  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_subscription_status text,
  current_period_end timestamptz,
  stripe_price_id text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================================
-- 4. PRIVATE STUDIO SETTINGS
-- ============================================================================

create table public.studio_settings (
  studio_id uuid primary key
    references public.studios(id) on delete cascade,

  client_communication_settings jsonb not null default '{
    "reminders": {
      "enabled": true,
      "schedule_hours_before": [48, 24],
      "template_mode": "default",
      "custom_text": null
    },
    "follow_ups": {
      "enabled": true,
      "schedule_days_after": [14],
      "template_mode": "default",
      "custom_text": null
    }
  }'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint studio_settings_communication_is_object
    check (jsonb_typeof(client_communication_settings) = 'object')
);


-- ============================================================================
-- 5. ARTISTS / STUDIO MEMBERS
-- ============================================================================
-- V1:
--   One authenticated user = one studio membership = owner.
--
-- Future:
--   Multiple artists can be added to the same studio.
--
-- role is intentionally kept now so the authorization model can expand later.

create table public.artists (
  id uuid primary key
    references auth.users(id) on delete cascade,

  studio_id uuid not null
    references public.studios(id) on delete cascade,

  display_name text not null,

  role text not null default 'owner'
    check (role in ('owner', 'artist')),

  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint artists_display_name_not_blank
    check (length(btrim(display_name)) > 0),

  -- Useful for tenant-aware relationships and indexing.
  unique (studio_id, id)
);


-- ============================================================================
-- 6. PRIVATE ARTIST SETTINGS
-- ============================================================================

create table public.artist_settings (
  artist_id uuid primary key
    references public.artists(id) on delete cascade,

  notification_preferences jsonb not null default '{
    "email_new_request": true,
    "email_booking_cancelled": true,
    "email_daily_digest": false
  }'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint artist_settings_notifications_is_object
    check (jsonb_typeof(notification_preferences) = 'object')
);


-- ============================================================================
-- 7. LOCATIONS & SCHEDULES
-- ============================================================================

create table public.locations (
  id uuid primary key default gen_random_uuid(),

  studio_id uuid not null
    references public.studios(id) on delete cascade,

  name text not null,
  address text,
  maps_url text,
  description text,

  -- Public visibility and booking availability.
  location_type text not null default 'permanent'
    check (location_type in ('permanent', 'temporary')),

  is_public boolean not null default true,
  is_active boolean not null default true,

  -- Temporary location availability window.
  available_from date,
  available_until date,

  -- Maximum number of days ahead a client may request a booking here.
  max_booking_advance_days integer not null default 90,

  -- Optional information shown when a public location is temporarily disabled.
  reopens_on date,
  unavailable_message text,

  weekly_schedule jsonb not null default '{
    "mon": {
      "active": true,
      "intervals": [
        {
          "start": "10:00",
          "end": "18:00"
        }
      ]
    },
    "tue": {
      "active": true,
      "intervals": [
        {
          "start": "10:00",
          "end": "18:00"
        }
      ]
    },
    "wed": {
      "active": true,
      "intervals": [
        {
          "start": "10:00",
          "end": "18:00"
        }
      ]
    },
    "thu": {
      "active": true,
      "intervals": [
        {
          "start": "10:00",
          "end": "18:00"
        }
      ]
    },
    "fri": {
      "active": true,
      "intervals": [
        {
          "start": "10:00",
          "end": "18:00"
        }
      ]
    },
    "sat": {
      "active": true,
      "intervals": [
        {
          "start": "11:00",
          "end": "17:00"
        }
      ]
    },
    "sun": {
      "active": false,
      "intervals": []
    }
  }'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint locations_name_not_blank
    check (length(btrim(name)) > 0),

  constraint locations_weekly_schedule_is_object
    check (jsonb_typeof(weekly_schedule) = 'object'),

  constraint locations_booking_advance_positive
    check (max_booking_advance_days > 0),

  constraint locations_temporary_dates_valid
    check (
      (location_type = 'permanent' and available_from is null and available_until is null)
      or
      (
        location_type = 'temporary'
        and available_from is not null
        and available_until is not null
        and available_until >= available_from
      )
    ),

  unique (studio_id, id)
);


-- ============================================================================
-- 8. PRICING SET TEMPLATES
-- ============================================================================

create table public.pricing_sets (
  id uuid primary key default gen_random_uuid(),

  studio_id uuid not null
    references public.studios(id) on delete cascade,

  name text not null,

  target_type text not null default 'flash'
    check (target_type in ('flash', 'custom', 'both')),

  min_price numeric(10,2) not null,
  max_price numeric(10,2) not null,
  deposit_amount numeric(10,2) not null,

  estimated_duration_min integer not null default 120,

  tiers jsonb not null default '[]'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint pricing_sets_name_not_blank
    check (length(btrim(name)) > 0),

  constraint pricing_sets_min_price_nonnegative
    check (min_price >= 0),

  constraint pricing_sets_max_price_nonnegative
    check (max_price >= 0),

  constraint pricing_sets_price_range_valid
    check (max_price >= min_price),

  constraint pricing_sets_deposit_nonnegative
    check (deposit_amount >= 0),

  constraint pricing_sets_duration_positive
    check (estimated_duration_min > 0),

  constraint pricing_sets_tiers_is_array
    check (jsonb_typeof(tiers) = 'array'),

  unique (studio_id, id)
);


-- ============================================================================
-- 9. ARTWORK & INVENTORY
-- ============================================================================

create table public.artwork_items (
  id uuid primary key default gen_random_uuid(),

  studio_id uuid not null
    references public.studios(id) on delete cascade,

  artist_id uuid
    references public.artists(id) on delete set null,

  type text not null
    check (type in ('portfolio', 'flash')),

  category text not null,
  image_url text not null,

  crop_settings jsonb not null default '{
    "x": 0,
    "y": 0,
    "zoom": 1
  }'::jsonb,

  is_repeatable boolean not null default false,

  status text not null default 'active'
    check (status in ('active', 'archived')),

  pricing_mode text not null default 'none'
    check (pricing_mode in ('none', 'template', 'custom')),

  pricing_set_id uuid
    references public.pricing_sets(id) on delete set null,

  min_price numeric(10,2),
  max_price numeric(10,2),
  deposit_amount numeric(10,2),
  estimated_duration_min integer,

  tiers jsonb not null default '[]'::jsonb,

  order_index integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint artwork_items_min_price_nonnegative
    check (min_price is null or min_price >= 0),

  constraint artwork_items_max_price_nonnegative
    check (max_price is null or max_price >= 0),

  constraint artwork_items_price_range_valid
    check (
      min_price is null
      or max_price is null
      or max_price >= min_price
    ),

  constraint artwork_items_deposit_nonnegative
    check (deposit_amount is null or deposit_amount >= 0),

  constraint artwork_items_duration_positive
    check (
      estimated_duration_min is null
      or estimated_duration_min > 0
    ),

  constraint artwork_items_crop_settings_is_object
    check (jsonb_typeof(crop_settings) = 'object'),

  constraint artwork_items_tiers_is_array
    check (jsonb_typeof(tiers) = 'array'),

  unique (studio_id, id)
);


-- ============================================================================
-- 10. CLIENTS / CRM
-- ============================================================================
-- A client may exist in multiple studios.
--
-- Client identity is deliberately NOT stored here.
-- See client_identities below.

create table public.clients (
  id uuid primary key default gen_random_uuid(),

  studio_id uuid not null
    references public.studios(id) on delete cascade,

  first_name text not null,
  last_name text not null,

  email citext not null,
  phone text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint clients_first_name_not_blank
    check (length(btrim(first_name)) > 0),

  constraint clients_last_name_not_blank
    check (length(btrim(last_name)) > 0),

  constraint clients_email_not_blank
    check (length(btrim(email::text)) > 0),

  unique (studio_id, email),
  unique (studio_id, id)
);


-- ============================================================================
-- 11. PRIVATE CLIENT NOTES
-- ============================================================================
-- Kept separate because clients can read their own contact/profile record,
-- but internal studio notes must remain private to studio staff.

create table public.client_private_notes (
  client_id uuid primary key
    references public.clients(id) on delete cascade,

  studio_id uuid not null
    references public.studios(id) on delete cascade,

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint client_private_notes_client_studio_consistency
    check (studio_id is not null)
);


-- ============================================================================
-- 12. CLIENT IDENTITY LINKS
-- ============================================================================
-- One authenticated Supabase user can be connected to multiple studio-specific
-- client records.
--
-- Example:
--
-- auth.users
--   user A
--      ├── client row in Studio X
--      ├── client row in Studio Y
--      └── client row in Studio Z
--
-- This is what enables a single magic-link login to access cross-studio history.
--
-- This table is intentionally NOT directly exposed through the Data API.
-- Identity linking is a trusted server-side operation that we'll implement
-- in the Server Actions phase.

create table public.client_identities (
  client_id uuid primary key
    references public.clients(id) on delete cascade,

  auth_user_id uuid not null
    references auth.users(id) on delete cascade,

  created_at timestamptz not null default now(),

  unique (auth_user_id, client_id)
);


-- ============================================================================
-- 13. BOOKINGS
-- ============================================================================

create table public.bookings (
  id uuid primary key default gen_random_uuid(),

  studio_id uuid not null
    references public.studios(id) on delete cascade,

  artist_id uuid
    references public.artists(id) on delete set null,

  location_id uuid
    references public.locations(id) on delete set null,

  booking_type text not null
    check (booking_type in ('flash', 'custom', 'time_block')),

  artwork_item_id uuid
    references public.artwork_items(id) on delete set null,

  client_id uuid
    references public.clients(id) on delete set null,

  custom_details jsonb not null default '{}'::jsonb,
  selected_tier jsonb not null default '{}'::jsonb,
  requested_slots jsonb not null default '[]'::jsonb,

  scheduled_slot_start timestamptz,
  scheduled_slot_end timestamptz,

  duration_minutes integer,
  buffer_minutes integer not null default 30,

  quoted_price numeric(10,2),
  deposit_amount numeric(10,2),

  status text not null default 'requested'
    check (status in (
      'requested',
      'reslot_requested',
      'reslot_provided',
      'approved_awaiting_dep',
      'client_marked_paid',
      'confirmed',
      'completed',
      'declined',
      'cancelled'
    )),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint bookings_schedule_valid
    check (
      scheduled_slot_end is null
      or (
        scheduled_slot_start is not null
        and scheduled_slot_end > scheduled_slot_start
      )
    ),

  constraint bookings_duration_positive
    check (
      duration_minutes is null
      or duration_minutes > 0
    ),

  constraint bookings_buffer_nonnegative
    check (buffer_minutes >= 0),

  constraint bookings_quoted_price_nonnegative
    check (quoted_price is null or quoted_price >= 0),

  constraint bookings_deposit_nonnegative
    check (deposit_amount is null or deposit_amount >= 0),

  constraint bookings_custom_details_is_object
    check (jsonb_typeof(custom_details) = 'object'),

  constraint bookings_selected_tier_is_object
    check (jsonb_typeof(selected_tier) = 'object'),

  constraint bookings_requested_slots_is_array
    check (jsonb_typeof(requested_slots) = 'array'),

  unique (studio_id, id)
);


-- ============================================================================
-- 14. PRIVATE BOOKING NOTES
-- ============================================================================
-- These notes are for studio staff only. They are kept separate from bookings
-- because clients are allowed to read their own booking rows.

create table public.booking_private_notes (
  booking_id uuid primary key
    references public.bookings(id) on delete cascade,

  studio_id uuid not null
    references public.studios(id) on delete cascade,

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint booking_private_notes_booking_studio_consistency
    check (studio_id is not null)
);


-- ============================================================================
-- 15. SCHEDULE OVERRIDES
-- ============================================================================

create table public.schedule_overrides (
  id uuid primary key default gen_random_uuid(),

  studio_id uuid not null
    references public.studios(id) on delete cascade,

  location_id uuid not null
    references public.locations(id) on delete cascade,

  title text not null,

  override_date date not null,

  is_active boolean not null,

  intervals jsonb not null default '[]'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint schedule_overrides_intervals_is_array
    check (jsonb_typeof(intervals) = 'array'),

  unique (location_id, override_date),
  unique (studio_id, id)
);


-- ============================================================================
-- 16. INDEXES
-- ============================================================================

create index idx_artists_studio_id
  on public.artists(studio_id);

create index idx_locations_studio_id
  on public.locations(studio_id);

create index idx_pricing_sets_studio_id
  on public.pricing_sets(studio_id);

create index idx_artwork_items_studio_id
  on public.artwork_items(studio_id);

create index idx_artwork_items_artist_id
  on public.artwork_items(artist_id);

create index idx_artwork_items_pricing_set_id
  on public.artwork_items(pricing_set_id);

create index idx_clients_studio_id
  on public.clients(studio_id);

create index idx_client_identities_auth_user_id
  on public.client_identities(auth_user_id);

create index idx_client_private_notes_studio_id
  on public.client_private_notes(studio_id);

create index idx_booking_private_notes_studio_id
  on public.booking_private_notes(studio_id);

create index idx_bookings_studio_id
  on public.bookings(studio_id);

create index idx_bookings_artist_id
  on public.bookings(artist_id);

create index idx_bookings_location_id
  on public.bookings(location_id);

create index idx_bookings_artwork_item_id
  on public.bookings(artwork_item_id);

create index idx_bookings_client_id
  on public.bookings(client_id);

create index idx_bookings_status
  on public.bookings(status);

create index idx_bookings_scheduled_slot_start
  on public.bookings(scheduled_slot_start);

create index idx_schedule_overrides_studio_id
  on public.schedule_overrides(studio_id);

create index idx_schedule_overrides_location_id
  on public.schedule_overrides(location_id);

create index idx_schedule_overrides_override_date
  on public.schedule_overrides(override_date);


-- ============================================================================
-- 17. UPDATED_AT FUNCTION
-- ============================================================================

create or replace function private.handle_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ============================================================================
-- 18. UPDATED_AT TRIGGERS
-- ============================================================================

create trigger set_studios_updated_at
before update on public.studios
for each row
execute function private.handle_updated_at();

create trigger set_studio_billing_updated_at
before update on public.studio_billing
for each row
execute function private.handle_updated_at();

create trigger set_studio_settings_updated_at
before update on public.studio_settings
for each row
execute function private.handle_updated_at();

create trigger set_artists_updated_at
before update on public.artists
for each row
execute function private.handle_updated_at();

create trigger set_artist_settings_updated_at
before update on public.artist_settings
for each row
execute function private.handle_updated_at();

create trigger set_locations_updated_at
before update on public.locations
for each row
execute function private.handle_updated_at();

create trigger set_pricing_sets_updated_at
before update on public.pricing_sets
for each row
execute function private.handle_updated_at();

create trigger set_artwork_items_updated_at
before update on public.artwork_items
for each row
execute function private.handle_updated_at();

create trigger set_clients_updated_at
before update on public.clients
for each row
execute function private.handle_updated_at();

create trigger set_client_private_notes_updated_at
before update on public.client_private_notes
for each row
execute function private.handle_updated_at();

create trigger set_booking_private_notes_updated_at
before update on public.booking_private_notes
for each row
execute function private.handle_updated_at();

create trigger set_bookings_updated_at
before update on public.bookings
for each row
execute function private.handle_updated_at();

create trigger set_schedule_overrides_updated_at
before update on public.schedule_overrides
for each row
execute function private.handle_updated_at();


-- ============================================================================
-- 19. AUTHORIZATION HELPER FUNCTIONS
-- ============================================================================
-- These functions live in the private schema and are not exposed through
-- the Data API.
--
-- SECURITY DEFINER is intentional here: these functions need to inspect
-- membership/identity tables without creating RLS recursion.
--
-- Supabase recommends:
--   - security definer only when necessary
--   - set search_path = ''
--   - fully-qualified table references
--   - restricted function execution privileges


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
    where artists.id = (select auth.uid())
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
    where artists.id = (select auth.uid())
      and artists.studio_id = target_studio_id
      and artists.role = 'owner'
      and artists.is_active = true
  );
$$;


create or replace function private.is_current_client(
  target_client_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.client_identities
    where client_id = target_client_id
      and auth_user_id = (select auth.uid())
  );
$$;


-- ============================================================================
-- 20. PRIVATE SCHEMA / FUNCTION PRIVILEGES
-- ============================================================================

revoke all on schema private from public;
grant usage on schema private to authenticated;

revoke execute on function private.is_studio_member(uuid)
  from public, anon;

revoke execute on function private.is_studio_owner(uuid)
  from public, anon;

revoke execute on function private.is_current_client(uuid)
  from public, anon;

grant execute on function private.is_studio_member(uuid)
  to authenticated;

grant execute on function private.is_studio_owner(uuid)
  to authenticated;

grant execute on function private.is_current_client(uuid)
  to authenticated;


-- ============================================================================
-- 21. ENABLE RLS ON ALL APPLICATION TABLES
-- ============================================================================

alter table public.studios enable row level security;
alter table public.studio_billing enable row level security;
alter table public.studio_settings enable row level security;

alter table public.artists enable row level security;
alter table public.artist_settings enable row level security;

alter table public.locations enable row level security;
alter table public.pricing_sets enable row level security;
alter table public.artwork_items enable row level security;

alter table public.clients enable row level security;
alter table public.client_private_notes enable row level security;
alter table public.booking_private_notes enable row level security;
alter table public.client_identities enable row level security;

alter table public.bookings enable row level security;

alter table public.schedule_overrides enable row level security;


-- ============================================================================
-- 22. DATA API GRANTS
-- ============================================================================
-- Explicit grants are intentional. RLS and grants are separate layers:
--
--   GRANT = can this role reach the object?
--   RLS   = which rows can the role access?
--
-- Supabase is moving toward explicit Data API exposure by default.


-- -------------------------
-- Public-read tables
-- -------------------------

grant select on public.studios
  to anon, authenticated;

grant select on public.artists
  to anon, authenticated;

grant select on public.locations
  to anon, authenticated;

grant select on public.pricing_sets
  to anon, authenticated;

grant select on public.artwork_items
  to anon, authenticated;

grant select on public.schedule_overrides
  to anon, authenticated;


-- -------------------------
-- Authenticated write access
-- -------------------------

grant select on public.studio_billing
  to authenticated;


grant select on public.studio_settings
  to authenticated;

grant insert, update on public.studio_settings
  to authenticated;


grant select on public.artist_settings
  to authenticated;

grant insert, update on public.artist_settings
  to authenticated;


grant select, insert, update, delete
  on public.locations
  to authenticated;


grant select, insert, update, delete
  on public.pricing_sets
  to authenticated;


grant select, insert, update, delete
  on public.artwork_items
  to authenticated;


grant select, insert, delete
  on public.clients
  to authenticated;

-- Client updates are deliberately controlled at the server layer.
-- Give authenticated users only the columns the CRM needs to edit directly.
grant update (
  first_name,
  last_name,
  email,
  phone
)
on public.clients
to authenticated;


grant select, insert, update, delete
  on public.client_private_notes
  to authenticated;


grant select, insert, update, delete
  on public.booking_private_notes
  to authenticated;


grant select, insert, update, delete
  on public.bookings
  to authenticated;



grant select, insert, update, delete
  on public.schedule_overrides
  to authenticated;


-- -------------------------
-- Identity links
-- -------------------------
-- No direct Data API access.
-- Linking is handled by trusted server-side code.

revoke all on public.client_identities
  from anon, authenticated;


-- ============================================================================
-- 23. STUDIOS RLS
-- ============================================================================

-- Studio pages are public.
create policy "Public can view studios"
on public.studios
for select
to anon, authenticated
using (true);


-- Only studio owners can modify studio settings/profile.
create policy "Studio owners can update their studio"
on public.studios
for update
to authenticated
using (
  (select private.is_studio_owner(id))
)
with check (
  (select private.is_studio_owner(id))
);


-- ============================================================================
-- 24. STUDIO BILLING RLS
-- ============================================================================

create policy "Studio owners can view billing"
on public.studio_billing
for select
to authenticated
using (
  (select private.is_studio_owner(studio_id))
);


-- ============================================================================
-- 25. STUDIO SETTINGS RLS
-- ============================================================================

create policy "Studio owners can view studio settings"
on public.studio_settings
for select
to authenticated
using (
  (select private.is_studio_owner(studio_id))
);


create policy "Studio owners can create studio settings"
on public.studio_settings
for insert
to authenticated
with check (
  (select private.is_studio_owner(studio_id))
);


create policy "Studio owners can update studio settings"
on public.studio_settings
for update
to authenticated
using (
  (select private.is_studio_owner(studio_id))
)
with check (
  (select private.is_studio_owner(studio_id))
);


-- ============================================================================
-- 26. ARTISTS RLS
-- ============================================================================

-- Public users may see active artists.
create policy "Public can view active artists"
on public.artists
for select
to anon, authenticated
using (
  is_active = true
);


-- Studio members may see all artist records inside their own studio,
-- including inactive artists.
create policy "Studio members can view artists in their studio"
on public.artists
for select
to authenticated
using (
  (select private.is_studio_member(studio_id))
);


-- An artist can update their own profile.
-- Column privileges restrict the actual writable columns.
create policy "Artists can update their own profile"
on public.artists
for update
to authenticated
using (
  id = (select auth.uid())
  and is_active = true
)
with check (
  id = (select auth.uid())
  and is_active = true
);


-- No direct INSERT/DELETE policy exists.
-- Artist membership management will be a controlled server-side operation.


-- ============================================================================
-- 27. ARTIST SETTINGS RLS
-- ============================================================================

create policy "Artists can view their own settings"
on public.artist_settings
for select
to authenticated
using (
  artist_id = (select auth.uid())
);


create policy "Artists can create their own settings"
on public.artist_settings
for insert
to authenticated
with check (
  artist_id = (select auth.uid())
);


create policy "Artists can update their own settings"
on public.artist_settings
for update
to authenticated
using (
  artist_id = (select auth.uid())
)
with check (
  artist_id = (select auth.uid())
);


-- ============================================================================
-- 28. LOCATIONS RLS
-- ============================================================================

create policy "Studio members can view their locations"
on public.locations
for select
to authenticated
using (
  (select private.is_studio_member(studio_id))
);


create policy "Studio members can create locations"
on public.locations
for insert
to authenticated
with check (
  (select private.is_studio_member(studio_id))
);


create policy "Studio members can update locations"
on public.locations
for update
to authenticated
using (
  (select private.is_studio_member(studio_id))
)
with check (
  (select private.is_studio_member(studio_id))
);


create policy "Studio members can delete locations"
on public.locations
for delete
to authenticated
using (
  (select private.is_studio_member(studio_id))
);


-- Public read access is intentionally separate.
create policy "Public can view locations"
on public.locations
for select
to anon, authenticated
using (is_public = true);


-- ============================================================================
-- 29. PRICING SETS RLS
-- ============================================================================

create policy "Public can view pricing sets"
on public.pricing_sets
for select
to anon, authenticated
using (true);


create policy "Studio members can view all pricing sets"
on public.pricing_sets
for select
to authenticated
using (
  (select private.is_studio_member(studio_id))
);


create policy "Studio members can create pricing sets"
on public.pricing_sets
for insert
to authenticated
with check (
  (select private.is_studio_member(studio_id))
);


create policy "Studio members can update pricing sets"
on public.pricing_sets
for update
to authenticated
using (
  (select private.is_studio_member(studio_id))
)
with check (
  (select private.is_studio_member(studio_id))
);


create policy "Studio members can delete pricing sets"
on public.pricing_sets
for delete
to authenticated
using (
  (select private.is_studio_member(studio_id))
);


-- ============================================================================
-- 30. ARTWORK RLS
-- ============================================================================

create policy "Public can view active artwork"
on public.artwork_items
for select
to anon, authenticated
using (
  status = 'active'
);


create policy "Studio members can view all artwork"
on public.artwork_items
for select
to authenticated
using (
  (select private.is_studio_member(studio_id))
);


create policy "Studio members can create artwork"
on public.artwork_items
for insert
to authenticated
with check (
  (select private.is_studio_member(studio_id))
  and (
    artist_id is null
    or exists (
      select 1
      from public.artists a
      where a.id = artwork_items.artist_id
        and a.studio_id = artwork_items.studio_id
        and a.is_active = true
    )
  )
  and (
    pricing_set_id is null
    or exists (
      select 1
      from public.pricing_sets p
      where p.id = artwork_items.pricing_set_id
        and p.studio_id = artwork_items.studio_id
    )
  )
);


create policy "Studio members can update artwork"
on public.artwork_items
for update
to authenticated
using (
  (select private.is_studio_member(studio_id))
)
with check (
  (select private.is_studio_member(studio_id))
  and (
    artist_id is null
    or exists (
      select 1
      from public.artists a
      where a.id = artwork_items.artist_id
        and a.studio_id = artwork_items.studio_id
        and a.is_active = true
    )
  )
  and (
    pricing_set_id is null
    or exists (
      select 1
      from public.pricing_sets p
      where p.id = artwork_items.pricing_set_id
        and p.studio_id = artwork_items.studio_id
    )
  )
);


create policy "Studio members can delete artwork"
on public.artwork_items
for delete
to authenticated
using (
  (select private.is_studio_member(studio_id))
);


-- ============================================================================
-- 31. CLIENTS RLS
-- ============================================================================

-- Studio members can access their studio's CRM.
create policy "Studio members can view clients"
on public.clients
for select
to authenticated
using (
  (select private.is_studio_member(studio_id))
);


create policy "Studio members can create clients"
on public.clients
for insert
to authenticated
with check (
  (select private.is_studio_member(studio_id))
);


create policy "Studio members can update clients"
on public.clients
for update
to authenticated
using (
  (select private.is_studio_member(studio_id))
)
with check (
  (select private.is_studio_member(studio_id))
);


create policy "Studio members can delete clients"
on public.clients
for delete
to authenticated
using (
  (select private.is_studio_member(studio_id))
);


-- A client can read their own studio-specific profile.
create policy "Clients can view their own profile"
on public.clients
for select
to authenticated
using (
  (select private.is_current_client(id))
);


-- Client profile mutation is deliberately NOT granted here.
-- Portal changes will go through Server Actions.


-- ============================================================================
-- 32. PRIVATE CLIENT NOTES RLS
-- ============================================================================

create policy "Studio members can view private client notes"
on public.client_private_notes
for select
to authenticated
using (
  (select private.is_studio_member(studio_id))
);


create policy "Studio members can create private client notes"
on public.client_private_notes
for insert
to authenticated
with check (
  (select private.is_studio_member(studio_id))
  and exists (
    select 1
    from public.clients c
    where c.id = client_private_notes.client_id
      and c.studio_id = client_private_notes.studio_id
  )
);


create policy "Studio members can update private client notes"
on public.client_private_notes
for update
to authenticated
using (
  (select private.is_studio_member(studio_id))
)
with check (
  (select private.is_studio_member(studio_id))
  and exists (
    select 1
    from public.clients c
    where c.id = client_private_notes.client_id
      and c.studio_id = client_private_notes.studio_id
  )
);


create policy "Studio members can delete private client notes"
on public.client_private_notes
for delete
to authenticated
using (
  (select private.is_studio_member(studio_id))
);


-- ============================================================================
-- 33. PRIVATE BOOKING NOTES RLS
-- ============================================================================

create policy "Studio members can view private booking notes"
on public.booking_private_notes
for select
to authenticated
using (
  (select private.is_studio_member(studio_id))
);


create policy "Studio members can create private booking notes"
on public.booking_private_notes
for insert
to authenticated
with check (
  (select private.is_studio_member(studio_id))
  and exists (
    select 1
    from public.bookings b
    where b.id = booking_private_notes.booking_id
      and b.studio_id = booking_private_notes.studio_id
  )
);


create policy "Studio members can update private booking notes"
on public.booking_private_notes
for update
to authenticated
using (
  (select private.is_studio_member(studio_id))
)
with check (
  (select private.is_studio_member(studio_id))
  and exists (
    select 1
    from public.bookings b
    where b.id = booking_private_notes.booking_id
      and b.studio_id = booking_private_notes.studio_id
  )
);


create policy "Studio members can delete private booking notes"
on public.booking_private_notes
for delete
to authenticated
using (
  (select private.is_studio_member(studio_id))
);


-- 34. CLIENT IDENTITIES RLS
-- ============================================================================
-- No direct policies.
--
-- The table is intentionally inaccessible through the Data API.
-- Server-side trusted logic will create/manage these links after a successful
-- magic-link authentication.


-- ============================================================================
-- 35. BOOKINGS RLS
-- ============================================================================

-- Studio members can see all bookings for their studio.
create policy "Studio members can view bookings"
on public.bookings
for select
to authenticated
using (
  (select private.is_studio_member(studio_id))
);


create policy "Studio members can create bookings"
on public.bookings
for insert
to authenticated
with check (
  (select private.is_studio_member(studio_id))

  and (
    artist_id is null
    or exists (
      select 1
      from public.artists a
      where a.id = bookings.artist_id
        and a.studio_id = bookings.studio_id
    )
  )

  and (
    location_id is null
    or exists (
      select 1
      from public.locations l
      where l.id = bookings.location_id
        and l.studio_id = bookings.studio_id
    )
  )

  and (
    artwork_item_id is null
    or exists (
      select 1
      from public.artwork_items ai
      where ai.id = bookings.artwork_item_id
        and ai.studio_id = bookings.studio_id
    )
  )

  and (
    client_id is null
    or exists (
      select 1
      from public.clients c
      where c.id = bookings.client_id
        and c.studio_id = bookings.studio_id
    )
  )
);


create policy "Studio members can update bookings"
on public.bookings
for update
to authenticated
using (
  (select private.is_studio_member(studio_id))
)
with check (
  (select private.is_studio_member(studio_id))

  and (
    artist_id is null
    or exists (
      select 1
      from public.artists a
      where a.id = bookings.artist_id
        and a.studio_id = bookings.studio_id
    )
  )

  and (
    location_id is null
    or exists (
      select 1
      from public.locations l
      where l.id = bookings.location_id
        and l.studio_id = bookings.studio_id
    )
  )

  and (
    artwork_item_id is null
    or exists (
      select 1
      from public.artwork_items ai
      where ai.id = bookings.artwork_item_id
        and ai.studio_id = bookings.studio_id
    )
  )

  and (
    client_id is null
    or exists (
      select 1
      from public.clients c
      where c.id = bookings.client_id
        and c.studio_id = bookings.studio_id
    )
  )
);


create policy "Studio members can delete bookings"
on public.bookings
for delete
to authenticated
using (
  (select private.is_studio_member(studio_id))
);


-- Clients can view only bookings connected to their authenticated identity.
create policy "Clients can view their own bookings"
on public.bookings
for select
to authenticated
using (
  client_id is not null
  and (select private.is_current_client(client_id))
);


-- Clients do not receive direct INSERT/UPDATE/DELETE access to bookings.
-- Portal changes will go through controlled Server Actions/functions.


-- ============================================================================
-- 36. SCHEDULE OVERRIDES RLS
-- ============================================================================

-- Public schedule information is required for the booking experience.
create policy "Public can view schedule overrides"
on public.schedule_overrides
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.locations l
    where l.id = schedule_overrides.location_id
      and l.is_public = true
  )
);


create policy "Studio members can create schedule overrides"
on public.schedule_overrides
for insert
to authenticated
with check (
  (select private.is_studio_member(studio_id))

  and exists (
    select 1
    from public.locations l
    where l.id = schedule_overrides.location_id
      and l.studio_id = schedule_overrides.studio_id
  )
);


create policy "Studio members can update schedule overrides"
on public.schedule_overrides
for update
to authenticated
using (
  (select private.is_studio_member(studio_id))
)
with check (
  (select private.is_studio_member(studio_id))

  and exists (
    select 1
    from public.locations l
    where l.id = schedule_overrides.location_id
      and l.studio_id = schedule_overrides.studio_id
  )
);


create policy "Studio members can delete schedule overrides"
on public.schedule_overrides
for delete
to authenticated
using (
  (select private.is_studio_member(studio_id))
);