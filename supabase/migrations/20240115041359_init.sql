-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ============================================================================
-- 1. STUDIOS (Tenants)
-- ============================================================================
create table studios (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  bio text,
  avatar_url text,
  currency text not null check (char_length(currency) = 3),
  
  -- UI Design & Customization
  theme jsonb default '{"bg": "#FAF7F2", "surface": "#FFFFFF", "text": "#1A1A1A", "accent": "#2B4C7E"}'::jsonb,
  social_links jsonb default '{}'::jsonb,
  
  -- Payment routing for manual artist deposits
  payment_instructions jsonb default '{}'::jsonb,
  
  -- Koyomi Metered Billing
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_subscription_status text,
  current_period_end timestamptz,
  stripe_price_id text,
  
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ============================================================================
-- 2. ARTISTS / STUDIO MEMBERS (Multi-artist foundation for V2)
-- ============================================================================
create table artists (
  id uuid primary key references auth.users(id) on delete cascade,
  studio_id uuid not null references studios(id) on delete cascade,
  display_name text not null,
  role text default 'owner' check (role in ('owner', 'artist')),
  is_active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ============================================================================
-- 3. LOCATIONS & SCHEDULES
-- ============================================================================
create table locations (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references studios(id) on delete cascade,
  name text not null,
  address text,
  maps_url text,
  
  -- Recurring weekly shifts including interval support for breaks/lunch
  weekly_schedule jsonb not null default '{
    "mon": {"active": true, "intervals": [{"start": "10:00", "end": "18:00"}]},
    "tue": {"active": true, "intervals": [{"start": "10:00", "end": "18:00"}]},
    "wed": {"active": true, "intervals": [{"start": "10:00", "end": "18:00"}]},
    "thu": {"active": true, "intervals": [{"start": "10:00", "end": "18:00"}]},
    "fri": {"active": true, "intervals": [{"start": "10:00", "end": "18:00"}]},
    "sat": {"active": true, "intervals": [{"start": "11:00", "end": "17:00"}]},
    "sun": {"active": false, "intervals": []}
  }'::jsonb,
  
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ============================================================================
-- 4. PRICING SET TEMPLATES
-- ============================================================================
create table pricing_sets (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references studios(id) on delete cascade,
  name text not null,
  target_type text default 'flash' check (target_type in ('flash', 'custom', 'both')),
  min_price numeric(10,2) not null,
  max_price numeric(10,2) not null,
  deposit_amount numeric(10,2) not null,
  estimated_duration_min int not null default 120,
  tiers jsonb default '[]'::jsonb, -- Array of arbitrary size/color tiers
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ============================================================================
-- 5. ARTWORK & INVENTORY
-- ============================================================================
create table artwork_items (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references studios(id) on delete cascade,
  artist_id uuid references artists(id) on delete set null,
  
  type text not null check (type in ('portfolio', 'flash')),
  category text not null,
  image_url text not null,
  crop_settings jsonb default '{"x": 0, "y": 0, "zoom": 1}'::jsonb,
  
  -- Flash-specific lifecycle
  is_repeatable boolean default false not null,
  status text default 'active' check (status in ('active', 'archived')),
  
  -- Flexible pricing: Can use a template OR custom inline values
  pricing_mode text default 'none' check (pricing_mode in ('none', 'template', 'custom')),
  pricing_set_id uuid references pricing_sets(id) on delete set null,
  min_price numeric(10,2),
  max_price numeric(10,2),
  deposit_amount numeric(10,2),
  estimated_duration_min int,
  tiers jsonb default '[]'::jsonb,
  
  order_index int default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ============================================================================
-- 6. CLIENTS (CRM)
-- ============================================================================
create table clients (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references studios(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  notes text, 
  
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  unique(studio_id, email)
);


-- ============================================================================
-- 7. BOOKINGS, TIME BLOCKS & APPOINTMENTS
-- ============================================================================
create table bookings (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references studios(id) on delete cascade,
  artist_id uuid references artists(id) on delete set null,
  location_id uuid references locations(id) on delete set null,
  
  booking_type text not null check (booking_type in ('flash', 'custom', 'time_block')),
  artwork_item_id uuid references artwork_items(id) on delete set null,
  
  -- Replaced raw text fields with the relational CRM link
  client_id uuid references clients(id) on delete set null,

  -- Book-specific notes
  book_notes text,
  
  -- Custom Request Payload
  custom_details jsonb default '{}'::jsonb,
  
  -- Flash Selection Metadata
  selected_tier jsonb default '{}'::jsonb,
  
  -- The Handshake
  requested_slots jsonb default '[]'::jsonb,
  
  -- Confirmed Slot & Duration
  scheduled_slot_start timestamptz,
  scheduled_slot_end timestamptz,
  duration_minutes int,
  buffer_minutes int default 30,
  
  -- Financial Ledger
  quoted_price numeric(10,2),
  deposit_amount numeric(10,2),
  
  -- Status Lifecycle
  status text default 'requested' check (status in (
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
  
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);


-- 8. SCHEDULE OVERRIDES (Date-specific exceptions to the weekly template)
create table schedule_overrides (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id) on delete cascade,

  -- The specific date being overridden (e.g., '2026-10-16')
  override_date date not null,

  -- The new rules for this specific day
  is_active boolean not null,
  intervals jsonb not null default '[]'::jsonb, -- [{"start": "10:00", "end": "14:00"}, {"start": "15:00", "end": "18:00"}]

  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  -- Ensure an artist can't have two different override rules for the same day at the same location
  unique(location_id, override_date)
);

-- ============================================================================
-- 8. AUTOMATED UPDATED_AT TRIGGER
-- ============================================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_studios_updated_at before update on studios for each row execute procedure handle_updated_at();
create trigger set_artists_updated_at before update on artists for each row execute procedure handle_updated_at();
create trigger set_locations_updated_at before update on locations for each row execute procedure handle_updated_at();
create trigger set_pricing_sets_updated_at before update on pricing_sets for each row execute procedure handle_updated_at();
create trigger set_artwork_items_updated_at before update on artwork_items for each row execute procedure handle_updated_at();
create trigger set_bookings_updated_at before update on bookings for each row execute procedure handle_updated_at();
create trigger set_overrides_updated_at before update on schedule_overrides for each row execute procedure handle_updated_at();
create trigger set_clients_updated_at before update on clients for each row execute procedure handle_updated_at();


-- ============================================================================
-- 1. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================
alter table studios enable row level security;
alter table artists enable row level security;
alter table locations enable row level security;
alter table pricing_sets enable row level security;
alter table artwork_items enable row level security;
alter table clients enable row level security;
alter table bookings enable row level security;
alter table schedule_overrides enable row level security;

-- ============================================================================
-- 2. PUBLIC READ POLICIES (For the Digital Hub & Client Checkout)
-- ============================================================================
-- Anyone can view studio profiles, locations, and pricing sets
create policy "Public can view studios" on studios for select using (true);
create policy "Public can view locations" on locations for select using (true);
create policy "Public can view pricing_sets" on pricing_sets for select using (true);
create policy "Public can view artists" on artists for select using (is_active = true);

-- Anyone can view ACTIVE artwork items
create policy "Public can view active artwork" on artwork_items for select using (status = 'active');

-- Anyone can INSERT a new booking request (the client submitting the form)
create policy "Public can insert booking requests" on bookings for insert with check (status = 'requested');

-- ============================================================================
-- 3. TENANT ISOLATION POLICIES (For the Artist Dashboard)
-- ============================================================================
-- Note: We use a subquery to check if the user requesting the data exists 
-- in the `artists` table and belongs to the correct `studio_id`.

-- STUDIOS
create policy "Artists can update their own studio" on studios for update using (
  id in (select studio_id from artists where id = auth.uid())
);

-- ARTISTS (Users can manage their own profile)
create policy "Artists can update their own profile" on artists for update using (
  id = auth.uid()
);

-- LOCATIONS & SCHEDULE OVERRIDES
create policy "Artists can manage their locations" on locations using (
  studio_id in (select studio_id from artists where id = auth.uid())
);
create policy "Artists can manage their overrides" on schedule_overrides using (
  location_id in (select id from locations where studio_id in (select studio_id from artists where id = auth.uid()))
);

-- INVENTORY (Pricing Sets & Artwork)
create policy "Artists can manage pricing sets" on pricing_sets using (
  studio_id in (select studio_id from artists where id = auth.uid())
);
create policy "Artists can manage artwork" on artwork_items using (
  studio_id in (select studio_id from artists where id = auth.uid())
);

-- CRM (Clients & Bookings)
create policy "Artists can manage their clients" on clients using (
  studio_id in (select studio_id from artists where id = auth.uid())
);
create policy "Artists can view and manage their bookings" on bookings for select using (
  studio_id in (select studio_id from artists where id = auth.uid())
);
create policy "Artists can update their bookings" on bookings for update using (
  studio_id in (select studio_id from artists where id = auth.uid())
);

-- ============================================================================
-- CLIENT PORTAL POLICIES
-- ============================================================================

-- 1. CLIENTS TABLE: Allow clients to view and update their own contact info
create policy "Clients can view their own profile" on clients
  for select
  using (email = (auth.jwt() ->> 'email'));

create policy "Clients can update their own profile" on clients
  for update
  using (email = (auth.jwt() ->> 'email'));

-- 2. BOOKINGS TABLE: Allow clients to view their own appointments
create policy "Clients can view their own bookings" on bookings
  for select
  using (
    client_id in (
      select id from clients where email = (auth.jwt() ->> 'email')
    )
  );

-- Optional: Allow clients to cancel or submit payment notes for their booking
create policy "Clients can update their own booking status" on bookings
  for update
  using (
    client_id in (
      select id from clients where email = (auth.jwt() ->> 'email')
    )
  );

-- ============================================================================
-- 4. ANTI-TAMPERING TRIGGERS (Client Portal Security)
-- ============================================================================
create or replace function public.restrict_client_booking_updates()
returns trigger as $$
begin
  -- Check if the person making the update is the client tied to this booking
  if exists (
    select 1 from clients 
    where id = old.client_id 
    and email = auth.jwt() ->> 'email'
  ) then
    -- TAMPERING MITIGATION:
    -- If the client tries to change any of these, we silently revert them to the original data.
    -- They are ONLY allowed to change 'status' and 'requested_slots' via the RLS policy.
    new.quoted_price = old.quoted_price;
    new.deposit_amount = old.deposit_amount;
    new.artwork_item_id = old.artwork_item_id;
    new.duration_minutes = old.duration_minutes;
    new.scheduled_slot_start = old.scheduled_slot_start;
    new.scheduled_slot_end = old.scheduled_slot_end;
    new.book_notes = old.book_notes; 
    new.custom_details = old.custom_details;
    new.selected_tier = old.selected_tier;
  end if;
  
  return new;
end;
$$ language plpgsql;

-- Attach the trigger to fire before any update on the bookings table
create trigger enforce_client_tampering_protection
  before update on bookings
  for each row
  execute procedure restrict_client_booking_updates();