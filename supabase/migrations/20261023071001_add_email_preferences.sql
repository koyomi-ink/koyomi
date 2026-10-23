create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  email citext not null,
  message text not null,

  created_at timestamptz not null default now(),

  constraint contact_name_not_blank
    check (length(btrim(name)) > 0),

  constraint contact_message_not_blank
    check (length(btrim(message)) > 0)
);

alter table public.contact_messages enable row level security;

revoke all on public.contact_messages
from anon, authenticated;

grant insert on public.contact_messages
to service_role;