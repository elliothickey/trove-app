-- Baseline snapshot of the schema already live in Supabase. These tables,
-- their RLS policies, and the grants below were created directly against
-- the project (dashboard / SQL editor) in a prior session, before this repo
-- tracked migrations, and have already been RLS-tested with two users.
--
-- This file exists to bring that live state under version control -- it is
-- NOT meant to be run to create anything new. It is written defensively so
-- that running it against the existing database is a no-op:
--   * `create table if not exists` -- does nothing if the table is already there
--   * policy creation is wrapped in a DO block that swallows
--     `duplicate_object`, so an existing policy of the same name is left
--     untouched
-- It never drops or alters existing objects or data.
--
-- All 8 policy names and definitions below were confirmed directly against
-- the live database via `select * from pg_policies where tablename in
-- ('contacts', 'interactions')` and match exactly.

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  employer text,
  school text,
  location text,
  tags text[] not null default '{}',
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  type text not null check (type in ('meeting', 'call', 'email', 'message', 'other')),
  occurred_at timestamptz not null,
  location text,
  summary text not null,
  notes text,
  raw_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.contacts enable row level security;
alter table public.interactions enable row level security;

grant select, insert, update, delete on public.contacts to authenticated;
grant select, insert, update, delete on public.interactions to authenticated;

do $$ begin
  create policy "select own contacts" on public.contacts
    for select using (user_id = auth.uid());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "insert own contacts" on public.contacts
    for insert with check (user_id = auth.uid());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "update own contacts" on public.contacts
    for update using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "delete own contacts" on public.contacts
    for delete using (user_id = auth.uid());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "select own interactions" on public.interactions
    for select using (user_id = auth.uid());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "insert own interactions" on public.interactions
    for insert with check (user_id = auth.uid());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "update own interactions" on public.interactions
    for update using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "delete own interactions" on public.interactions
    for delete using (user_id = auth.uid());
exception when duplicate_object then null;
end $$;
