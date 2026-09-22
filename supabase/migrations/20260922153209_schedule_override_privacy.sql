-- Koyomi - Migration 002
-- Prevent anonymous/public users from reading internal schedule override titles.
-- The title can contain private information (e.g. "Doctor appointment").
-- Public clients only need the scheduling fields.

-- Remove the broad anonymous SELECT grant.
revoke select on public.schedule_overrides from anon;

-- Allow anonymous users to read only fields required for public scheduling.
grant select (
  id,
  studio_id,
  location_id,
  override_date,
  is_active,
  intervals
)
on public.schedule_overrides
 to anon;

-- Authenticated users keep full SELECT access through their existing grant + RLS.