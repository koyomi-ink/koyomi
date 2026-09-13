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
-- 6. BOOKINGS, TIME BLOCKS & APPOINTMENTS
-- ============================================================================
create table bookings (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references studios(id) on delete cascade,
  artist_id uuid references artists(id) on delete set null,
  location_id uuid references locations(id) on delete set null,
  
  booking_type text not null check (booking_type in ('flash', 'custom', 'time_block'))
  artwork_item_id uuid references artwork_items(id) on delete set null,
  
  -- Client Information (Nullable for internal time blocks)
  client_first_name text,
  client_last_name text,
  client_email text,
  client_phone text,
  client_notes text,
  
  -- Custom Request Payload (Idea description, budget, reference photo URLs)
  custom_details jsonb default '{}'::jsonb,
  
  -- Flash Selection Metadata (e.g., chosen color/size tier)
  selected_tier jsonb default '{}'::jsonb,
  
  -- The Handshake: 3 candidate start times submitted by client
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
    'requested',             -- Client submitted 3 options
    'reslot_requested',      -- Artist requested 3 new dates
    'reslot_provided',       -- Client submitted replacement dates
    'approved_awaiting_dep', -- Artist locked in a slot; awaiting deposit
    'client_marked_paid',    -- Client clicked "I have paid"
    'confirmed',             -- Artist confirmed deposit received
    'completed',             -- Appointment fulfilled
    'declined',              -- Artist declined the request
    'cancelled'              -- Cancelled by client or expired
  )),
  
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);


-- 7. SCHEDULE OVERRIDES (Date-specific exceptions to the weekly template)
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