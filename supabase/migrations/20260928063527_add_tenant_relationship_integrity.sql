-- =========================================================
-- Tenant relationship integrity
-- Prevent cross-studio references at the database layer.
-- =========================================================


-- ARTWORK ITEMS

alter table public.artwork_items
  add constraint artwork_items_artist_same_studio_fkey
  foreign key (studio_id, artist_id)
  references public.artists (studio_id, id)
  on delete no action;

alter table public.artwork_items
  add constraint artwork_items_pricing_set_same_studio_fkey
  foreign key (studio_id, pricing_set_id)
  references public.pricing_sets (studio_id, id)
  on delete no action;


-- BOOKINGS

alter table public.bookings
  add constraint bookings_artist_same_studio_fkey
  foreign key (studio_id, artist_id)
  references public.artists (studio_id, id)
  on delete no action;

alter table public.bookings
  add constraint bookings_location_same_studio_fkey
  foreign key (studio_id, location_id)
  references public.locations (studio_id, id)
  on delete no action;

alter table public.bookings
  add constraint bookings_artwork_item_same_studio_fkey
  foreign key (studio_id, artwork_item_id)
  references public.artwork_items (studio_id, id)
  on delete no action;

alter table public.bookings
  add constraint bookings_client_same_studio_fkey
  foreign key (studio_id, client_id)
  references public.clients (studio_id, id)
  on delete no action;


-- PRIVATE CLIENT NOTES

alter table public.client_private_notes
  add constraint client_private_notes_client_same_studio_fkey
  foreign key (studio_id, client_id)
  references public.clients (studio_id, id)
  on delete no action;


-- PRIVATE BOOKING NOTES

alter table public.booking_private_notes
  add constraint booking_private_notes_booking_same_studio_fkey
  foreign key (studio_id, booking_id)
  references public.bookings (studio_id, id)
  on delete no action;


-- SCHEDULE OVERRIDES

alter table public.schedule_overrides
  add constraint schedule_overrides_location_same_studio_fkey
  foreign key (studio_id, location_id)
  references public.locations (studio_id, id)
  on delete no action;