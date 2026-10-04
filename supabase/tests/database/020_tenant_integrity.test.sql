begin;

create extension if not exists pgtap
with schema extensions;

select plan(9);

-- ============================================================================
-- FIXTURES
-- Two completely separate tenants:
--
-- Studio A
--   Artist A
--   Location A
--   Client A
--   Pricing Set A
--   Artwork A
--   Booking A
--
-- Studio B
--   Artist B
--   Location B
--   Client B
--   Pricing Set B
--   Artwork B
--   Booking B
-- ============================================================================


-- ----------------------------------------------------------------------------
-- Auth users
-- ----------------------------------------------------------------------------

insert into auth.users (
  id,
  email
)
values
  (
    '10000000-0000-0000-0000-000000000001',
    'artist-a@example.com'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'artist-b@example.com'
  );


-- ----------------------------------------------------------------------------
-- Studios
-- ----------------------------------------------------------------------------

insert into public.studios (
  id,
  name,
  slug,
  currency
)
values
  (
    '20000000-0000-0000-0000-000000000001',
    'Studio A',
    'studio-a',
    'GBP'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'Studio B',
    'studio-b',
    'USD'
  );


-- ----------------------------------------------------------------------------
-- Artists
-- ----------------------------------------------------------------------------

insert into public.artists (
  id,
  studio_id,
  auth_user_id,
  display_name,
  role,
  is_active,
  is_bookable
)
values
  (
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'Artist A',
    'owner',
    true,
    true
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    'Artist B',
    'owner',
    true,
    true
  );


-- ----------------------------------------------------------------------------
-- Locations
-- ----------------------------------------------------------------------------

insert into public.locations (
  id,
  studio_id,
  name,
  location_type
)
values
  (
    '40000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'Location A',
    'permanent'
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    'Location B',
    'permanent'
  );


-- ----------------------------------------------------------------------------
-- Clients
-- ----------------------------------------------------------------------------

insert into public.clients (
  id,
  studio_id,
  first_name,
  last_name,
  email
)
values
  (
    '50000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'Client',
    'A',
    'client-a@example.com'
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    'Client',
    'B',
    'client-b@example.com'
  );


-- ----------------------------------------------------------------------------
-- Pricing sets
-- ----------------------------------------------------------------------------

insert into public.pricing_sets (
  id,
  studio_id,
  name,
  target_type,
  min_price,
  max_price,
  deposit_amount,
  estimated_duration_min
)
values
  (
    '60000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'Flash Pricing A',
    'flash',
    50,
    100,
    20,
    60
  ),
  (
    '60000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    'Flash Pricing B',
    'flash',
    50,
    100,
    20,
    60
  );


-- ----------------------------------------------------------------------------
-- Artwork
-- ----------------------------------------------------------------------------

insert into public.artwork_items (
  id,
  studio_id,
  artist_id,
  type,
  category,
  image_url,
  pricing_mode,
  pricing_set_id
)
values
  (
    '70000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    'flash',
    'Test',
    'https://example.com/artwork-a.jpg',
    'template',
    '60000000-0000-0000-0000-000000000001'
  ),
  (
    '70000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000002',
    'flash',
    'Test',
    'https://example.com/artwork-b.jpg',
    'template',
    '60000000-0000-0000-0000-000000000002'
  );


-- ----------------------------------------------------------------------------
-- Bookings
-- ----------------------------------------------------------------------------

insert into public.bookings (
  id,
  studio_id,
  artist_id,
  location_id,
  client_id,
  booking_type
)
values
  (
    '80000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000001',
    '50000000-0000-0000-0000-000000000001',
    'custom'
  ),
  (
    '80000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000002',
    '40000000-0000-0000-0000-000000000002',
    '50000000-0000-0000-0000-000000000002',
    'custom'
  );


-- ============================================================================
-- TESTS
-- ============================================================================


-- 1. Artwork from Studio A cannot reference Artist B.

select throws_ok(
  $$
    insert into public.artwork_items (
      studio_id,
      artist_id,
      type,
      category,
      image_url
    )
    values (
      '20000000-0000-0000-0000-000000000001',
      '30000000-0000-0000-0000-000000000002',
      'portfolio',
      'Cross tenant test',
      'https://example.com/cross-artist.jpg'
    )
  $$,
  '23503',
  null,
  'artwork cannot reference an artist from another studio'
);


-- 2. Artwork from Studio A cannot reference Pricing Set B.

select throws_ok(
  $$
    insert into public.artwork_items (
      studio_id,
      type,
      category,
      image_url,
      pricing_mode,
      pricing_set_id
    )
    values (
      '20000000-0000-0000-0000-000000000001',
      'flash',
      'Cross tenant test',
      'https://example.com/cross-pricing.jpg',
      'template',
      '60000000-0000-0000-0000-000000000002'
    )
  $$,
  '23503',
  null,
  'artwork cannot reference a pricing set from another studio'
);


-- 3. Booking from Studio A cannot reference Artist B.

select throws_ok(
  $$
    insert into public.bookings (
      studio_id,
      artist_id,
      booking_type
    )
    values (
      '20000000-0000-0000-0000-000000000001',
      '30000000-0000-0000-0000-000000000002',
      'custom'
    )
  $$,
  '23503',
  null,
  'booking cannot reference an artist from another studio'
);


-- 4. Booking from Studio A cannot reference Location B.

select throws_ok(
  $$
    insert into public.bookings (
      studio_id,
      location_id,
      booking_type
    )
    values (
      '20000000-0000-0000-0000-000000000001',
      '40000000-0000-0000-0000-000000000002',
      'custom'
    )
  $$,
  '23503',
  null,
  'booking cannot reference a location from another studio'
);


-- 5. Booking from Studio A cannot reference Artwork B.

select throws_ok(
  $$
    insert into public.bookings (
      studio_id,
      artwork_item_id,
      booking_type
    )
    values (
      '20000000-0000-0000-0000-000000000001',
      '70000000-0000-0000-0000-000000000002',
      'flash'
    )
  $$,
  '23503',
  null,
  'booking cannot reference artwork from another studio'
);


-- 6. Booking from Studio A cannot reference Client B.

select throws_ok(
  $$
    insert into public.bookings (
      studio_id,
      client_id,
      booking_type
    )
    values (
      '20000000-0000-0000-0000-000000000001',
      '50000000-0000-0000-0000-000000000002',
      'custom'
    )
  $$,
  '23503',
  null,
  'booking cannot reference a client from another studio'
);


-- 7. Studio A private client notes cannot reference Client B.

select throws_ok(
  $$
    insert into public.client_private_notes (
      studio_id,
      client_id,
      notes
    )
    values (
      '20000000-0000-0000-0000-000000000001',
      '50000000-0000-0000-0000-000000000002',
      'This must never be allowed.'
    )
  $$,
  '23503',
  null,
  'private client notes cannot reference a client from another studio'
);


-- 8. Studio A private booking notes cannot reference Booking B.

select throws_ok(
  $$
    insert into public.booking_private_notes (
      studio_id,
      booking_id,
      notes
    )
    values (
      '20000000-0000-0000-0000-000000000001',
      '80000000-0000-0000-0000-000000000002',
      'This must never be allowed.'
    )
  $$,
  '23503',
  null,
  'private booking notes cannot reference a booking from another studio'
);


-- 9. Studio A schedule override cannot reference Location B.

select throws_ok(
  $$
    insert into public.schedule_overrides (
      studio_id,
      artist_id,
      location_id,
      override_date,
      is_active
    )
    values (
      '20000000-0000-0000-0000-000000000001',
      '30000000-0000-0000-0000-000000000001',
      '40000000-0000-0000-0000-000000000002',
      '2026-10-15',
      true
    )
  $$,
  '23503',
  null,
  'schedule override cannot reference a location from another studio'
);


select * from finish();

rollback;