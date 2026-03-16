-- Migration 001: BISXP initial schema
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Do NOT run this again if already executed.

-- ─── ENQUIRIES ───────────────────────────────────────────────────────────────

create table enquiries (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text,
  email text not null,
  company text,
  business_type text,
  message text not null,
  source text default 'website',
  status text default 'new' check (status in ('new','contacted','qualified','converted','closed')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index on enquiries (status);
create index on enquiries (created_at desc);

-- ─── PROFILES (for admin auth) ────────────────────────────────────────────────

create table profiles (
  id uuid references auth.users primary key,
  email text unique,
  role text default 'admin',
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────

alter table enquiries enable row level security;
alter table profiles enable row level security;

create policy "Anyone can submit enquiry"
  on enquiries for insert with check (true);

create policy "Admin reads all enquiries"
  on enquiries for select using (auth.role() = 'authenticated');

create policy "Admin updates enquiries"
  on enquiries for update using (auth.role() = 'authenticated');

create policy "Profile owner access"
  on profiles for select using (auth.uid() = id);

-- ─── UPDATED_AT TRIGGER ───────────────────────────────────────────────────────

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger enquiries_updated_at
  before update on enquiries
  for each row execute procedure update_updated_at();
