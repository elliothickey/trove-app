-- Adds normalized child tables for per-contact education, employment, and
-- location history, alongside the existing flat contacts/interactions
-- schema. This migration is additive only: it creates three new tables with
-- their own RLS policies and does not alter or backfill contacts or
-- interactions in any way.
--
-- Each table follows the same ownership pattern already established for
-- interactions (migrations 0001/0002): a denormalized `user_id` column
-- (not just an implied owner via contact_id), row policies keyed on
-- `user_id = auth.uid()`, and insert/update WITH CHECK clauses that also
-- verify the referenced contact belongs to the same user -- the same
-- defensive backstop migration 0002 added for interactions.contact_id.

create table public.contact_education (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  school text not null,
  degree text,
  field_of_study text,
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contact_employment (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  company text not null,
  role text,
  start_date date,
  end_date date,
  is_current boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contact_locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  kind text check (kind in ('hometown', 'current', 'previous')),
  location text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contact_education_user_id_idx on public.contact_education (user_id);
create index contact_education_contact_id_idx on public.contact_education (contact_id);

create index contact_employment_user_id_idx on public.contact_employment (user_id);
create index contact_employment_contact_id_idx on public.contact_employment (contact_id);

create index contact_locations_user_id_idx on public.contact_locations (user_id);
create index contact_locations_contact_id_idx on public.contact_locations (contact_id);

alter table public.contact_education enable row level security;
alter table public.contact_employment enable row level security;
alter table public.contact_locations enable row level security;

grant select, insert, update, delete on public.contact_education to authenticated;
grant select, insert, update, delete on public.contact_employment to authenticated;
grant select, insert, update, delete on public.contact_locations to authenticated;

-- contact_education policies

create policy "select own contact_education" on public.contact_education
  for select using (user_id = auth.uid());

create policy "insert own contact_education" on public.contact_education
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.contacts c
      where c.id = contact_education.contact_id
        and c.user_id = auth.uid()
    )
  );

create policy "update own contact_education" on public.contact_education
  for update using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.contacts c
      where c.id = contact_education.contact_id
        and c.user_id = auth.uid()
    )
  );

create policy "delete own contact_education" on public.contact_education
  for delete using (user_id = auth.uid());

-- contact_employment policies

create policy "select own contact_employment" on public.contact_employment
  for select using (user_id = auth.uid());

create policy "insert own contact_employment" on public.contact_employment
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.contacts c
      where c.id = contact_employment.contact_id
        and c.user_id = auth.uid()
    )
  );

create policy "update own contact_employment" on public.contact_employment
  for update using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.contacts c
      where c.id = contact_employment.contact_id
        and c.user_id = auth.uid()
    )
  );

create policy "delete own contact_employment" on public.contact_employment
  for delete using (user_id = auth.uid());

-- contact_locations policies

create policy "select own contact_locations" on public.contact_locations
  for select using (user_id = auth.uid());

create policy "insert own contact_locations" on public.contact_locations
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.contacts c
      where c.id = contact_locations.contact_id
        and c.user_id = auth.uid()
    )
  );

create policy "update own contact_locations" on public.contact_locations
  for update using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.contacts c
      where c.id = contact_locations.contact_id
        and c.user_id = auth.uid()
    )
  );

create policy "delete own contact_locations" on public.contact_locations
  for delete using (user_id = auth.uid());
