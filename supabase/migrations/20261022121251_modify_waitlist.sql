alter table public.waitlist
  add column name text not null;

alter table public.waitlist
  add constraint waitlist_name_not_blank
  check (length(btrim(name)) > 0);

alter table public.waitlist
  add constraint waitlist_name_length
  check (char_length(name) <= 100);