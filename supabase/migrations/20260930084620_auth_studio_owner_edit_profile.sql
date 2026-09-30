-- Allow authenticated studio owners to edit
-- the fields used by the Main profile editor.
-- Studio ownership is enforced separately by RLS.

grant update (name, slug, bio)
on table public.studios
to authenticated;