-- Networking Tracker schema
-- Run this once against your Neon project (SQL editor in the Neon console,
-- or `psql "$DATABASE_URL" -f db/schema.sql`) after enabling Managed Better
-- Auth + the Data API, so that `auth.user_id()` is available.

create extension if not exists pgcrypto;

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default auth.user_id(),
  name text not null,
  company text not null default '',
  role text not null default '',
  met_at text not null default '',
  notes text not null default '',
  priority text not null check (priority in ('high', 'medium', 'low')),
  created_at timestamptz not null default now()
);

-- Defense-in-depth: even if a client bypassed our Express validation and hit
-- the Data API directly, Postgres itself refuses an empty name or a bad
-- priority value.
alter table public.contacts
  add constraint contacts_name_not_blank check (btrim(name) <> '');

create index if not exists contacts_user_id_idx on public.contacts (user_id);

alter table public.contacts enable row level security;

-- One policy per operation, each scoped to the signed-in user via
-- auth.user_id(), which reads the JWT's `sub` claim as text. WITH CHECK on
-- insert/update re-validates the *resulting* row, so an update can never
-- reassign a contact to someone else's user_id.

create policy contacts_select on public.contacts
  for select
  to authenticated
  using (auth.user_id() = user_id);

create policy contacts_insert on public.contacts
  for insert
  to authenticated
  with check (auth.user_id() = user_id);

create policy contacts_update on public.contacts
  for update
  to authenticated
  using (auth.user_id() = user_id)
  with check (auth.user_id() = user_id);

create policy contacts_delete on public.contacts
  for delete
  to authenticated
  using (auth.user_id() = user_id);
