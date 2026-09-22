-- Allow Data API roles to access objects in the public schema.
-- Table-level GRANTs and RLS still determine what they can actually access.

grant usage on schema public
to anon, authenticated, service_role;