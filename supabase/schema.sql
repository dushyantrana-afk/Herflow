-- =============================================================================
-- HERFLOW AI · Complete Supabase Schema & Security Setup
-- =============================================================================
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run

-- 1. PROFILES TABLE (linked to auth.users)
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null default 'Student',
  campus text not null default 'IIT Delhi',
  cycle_day integer not null default 14,
  cycle_length integer not null default 28,
  period_length integer not null default 5,
  phase text not null default 'Ovulation window',
  anonymous_default boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using ( (select auth.uid()) = id );

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using ( (select auth.uid()) = id )
  with check ( (select auth.uid()) = id );

create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check ( (select auth.uid()) = id );

-- Auto-create profile trigger on auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, campus)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Student'),
    coalesce(new.raw_user_meta_data->>'campus', 'Campus')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. DISPENSERS TABLE (PadWatch Campus Telemetry)
-- -----------------------------------------------------------------------------
create table if not exists public.dispensers (
  id text primary key,
  name text not null,
  building text not null,
  stock integer not null default 100 check (stock >= 0 and stock <= 100),
  distance text not null default '100 m',
  last_refill text not null default 'Today',
  predicted_empty_in text not null default '3 days',
  x numeric not null default 50,
  y numeric not null default 50,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.dispensers enable row level security;

-- Public can view dispenser stock status
create policy "Anyone can view dispensers"
  on public.dispensers for select
  to anon, authenticated
  using ( true );

-- Initial Dispensers Seed Data
insert into public.dispensers (id, name, building, stock, distance, last_refill, predicted_empty_in, x, y)
values
  ('lib', 'Central Library', 'Ground floor, near lockers', 82, '120 m', '2h ago', '3 days', 30, 34),
  ('hostel', 'Himadri Hostel', 'Common room, Block B', 46, '350 m', 'Yesterday', '1 day', 72, 26),
  ('lhc', 'Lecture Hall Complex', '1st floor washroom', 12, '210 m', '3 days ago', '4 hours', 54, 58),
  ('sports', 'Sports Complex', 'Changing room, west wing', 0, '640 m', '5 days ago', 'Empty', 22, 74),
  ('health', 'Health Centre', 'Reception desk', 95, '480 m', 'Today', '6 days', 82, 70)
on conflict (id) do nothing;


-- 3. PAD REQUESTS TABLE (PeriodMate Emergency Requests)
-- -----------------------------------------------------------------------------
create table if not exists public.pad_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete set null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'completed', 'cancelled')),
  location text not null,
  item text not null,
  anonymous boolean not null default true,
  note text,
  helper_id text,
  helper_alias text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.pad_requests enable row level security;

-- Allow anonymous & authenticated users to submit emergency pad requests
create policy "Anyone can submit a pad request"
  on public.pad_requests for insert
  to anon, authenticated
  with check ( true );

-- Helpers & requesters can read active requests nearby
create policy "Anyone can view pad requests"
  on public.pad_requests for select
  to anon, authenticated
  using ( true );

-- Helpers can accept or update request status
create policy "Anyone can update pad requests"
  on public.pad_requests for update
  to anon, authenticated
  using ( true )
  with check ( true );


-- 4. COMMUNITY POSTS (Pad-to-Pad Board)
-- -----------------------------------------------------------------------------
create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete set null,
  kind text not null check (kind in ('request', 'offer')),
  alias text not null default 'Anonymous',
  location text not null,
  item text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.community_posts enable row level security;

create policy "Anyone can read community posts"
  on public.community_posts for select
  to anon, authenticated
  using ( true );

create policy "Anyone can insert community posts"
  on public.community_posts for insert
  to anon, authenticated
  with check ( true );

-- Initial Community Seed Data
insert into public.community_posts (kind, alias, location, item)
values
  ('request', 'Anonymous', 'LHC, 1st floor', 'Regular pad'),
  ('offer', 'Willow', 'Central Library', '2 × Heavy flow pads'),
  ('request', 'Anonymous', 'Sports Complex', 'Heavy flow pad'),
  ('offer', 'Sage', 'Himadri Hostel', 'Panty liners');


-- 5. SYMPTOM & MOOD CHECK-IN LOGS
-- -----------------------------------------------------------------------------
create table if not exists public.symptom_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  log_date date not null default current_date,
  mood text,
  symptoms text[] default '{}'::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.symptom_logs enable row level security;

create policy "Users can manage own symptom logs"
  on public.symptom_logs for all
  to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );


-- 6. CYCLE HISTORY
-- -----------------------------------------------------------------------------
create table if not exists public.cycle_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  month text not null,
  length integer not null,
  period integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.cycle_history enable row level security;

create policy "Users can manage own cycle history"
  on public.cycle_history for all
  to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );


-- 7. COMMUNITY CHAT MESSAGES (Live Campus Help & Pad Chat)
-- -----------------------------------------------------------------------------
create table if not exists public.community_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete set null,
  sender_name text not null default 'Anonymous Student',
  sender_campus text not null default 'IIT Delhi',
  is_verified boolean not null default true,
  is_anonymous boolean not null default true,
  content text not null,
  message_type text not null default 'chat' check (message_type in ('chat', 'ask_pad', 'offer_pad', 'urgent')),
  item text,
  location text,
  status text not null default 'open' check (status in ('open', 'helped', 'resolved')),
  helped_by text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.community_messages enable row level security;

create policy "Anyone can read community messages"
  on public.community_messages for select
  to anon, authenticated
  using ( true );

create policy "Anyone can insert community messages"
  on public.community_messages for insert
  to anon, authenticated
  with check ( true );

create policy "Anyone can update community message status"
  on public.community_messages for update
  to anon, authenticated
  using ( true )
  with check ( true );

-- Seed Community Chat Messages
insert into public.community_messages (sender_name, sender_campus, is_verified, is_anonymous, content, message_type, item, location, status, helped_by)
values
  ('Pooja · 2nd yr', 'IIT Delhi', true, false, 'Good morning everyone! Just checked and the pad dispenser at Central Library (Ground floor) was just refilled with fresh stock.', 'chat', null, null, 'open', null),
  ('Anonymous Student', 'IIT Delhi', true, true, 'SOS! Period started unexpectedly during class. Can anyone spare a regular or heavy flow pad near Lecture Hall Complex?', 'ask_pad', 'Regular pad', 'LHC, 1st floor washroom', 'helped', 'Riya (Himadri)'),
  ('Riya · Himadri Hostel', 'IIT Delhi', true, false, 'Just handed one over to you outside the LHC washroom! Hope you are feeling better ❤️', 'chat', null, null, 'open', null),
  ('Tanvi K. · PhD', 'IIT Delhi', true, false, 'I have 2 extra heavy flow pads and panty liners in my locker. Happy to share with anyone who needs them today!', 'offer_pad', '2 × Heavy flow pads', 'Central Library, 2nd floor study cubicles', 'open', null);


-- 8. ENABLE REALTIME
-- -----------------------------------------------------------------------------
-- Enable real-time updates for emergency pad requests, dispenser telemetry and community chat
begin;
  -- Add tables to supabase_realtime publication
  alter publication supabase_realtime add table public.pad_requests;
  alter publication supabase_realtime add table public.dispensers;
  alter publication supabase_realtime add table public.community_posts;
  alter publication supabase_realtime add table public.community_messages;
commit;
