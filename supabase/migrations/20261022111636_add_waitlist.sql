create table public.waitlist (
  id uuid primary key default gen_random_uuid(),

  email citext not null unique,

  created_at timestamptz not null default now(),

  constraint waitlist_email_not_blank
    check (length(btrim(email::text)) > 0)
);

alter table public.waitlist enable row level security;