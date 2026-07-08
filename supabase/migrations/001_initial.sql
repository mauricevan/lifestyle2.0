-- RPM Phase 1 initial schema

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  timezone text not null default 'Europe/Amsterdam',
  evening_report_time time not null default '22:30:00',
  disclaimer_accepted_at timestamptz,
  emergency_contact_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_ep_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  budget integer not null check (budget > 0),
  spent numeric(10, 2) not null default 0,
  remaining numeric(10, 2) not null,
  status text not null check (status in ('vol', 'onderhoud', 'voorlopig')),
  burn_rate_per_hour numeric(10, 2) not null default 15,
  is_hyperfocus_active boolean not null default false,
  sensor_status text not null default 'connected',
  last_sync_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create table if not exists public.baselines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  morning_avg_hr numeric(6, 2) not null,
  rolling_avg_hr numeric(6, 2) not null,
  deviation numeric(6, 2) not null,
  is_provisional boolean not null default false,
  computed_at timestamptz not null default now(),
  unique (user_id, date)
);

create table if not exists public.hr_samples_daily (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  avg_hr numeric(6, 2) not null,
  min_hr numeric(6, 2),
  max_hr numeric(6, 2),
  sample_count integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create table if not exists public.hyperfocus_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  max_hr_delta numeric(6, 2) not null,
  ep_inflated numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.sensor_status_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('connected', 'degraded', 'disconnected')),
  recorded_at timestamptz not null default now()
);

create index if not exists idx_daily_ep_state_user_date on public.daily_ep_state(user_id, date desc);
create index if not exists idx_baselines_user_date on public.baselines(user_id, date desc);
create index if not exists idx_hyperfocus_user_started on public.hyperfocus_events(user_id, started_at desc);

alter table public.profiles enable row level security;
alter table public.daily_ep_state enable row level security;
alter table public.baselines enable row level security;
alter table public.hr_samples_daily enable row level security;
alter table public.hyperfocus_events enable row level security;
alter table public.sensor_status_log enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create policy "daily_ep_state_all_own" on public.daily_ep_state for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "baselines_all_own" on public.baselines for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "hr_samples_all_own" on public.hr_samples_daily for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "hyperfocus_all_own" on public.hyperfocus_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "sensor_log_all_own" on public.sensor_status_log for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.cleanup_old_health_data()
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  delete from public.hr_samples_daily where created_at < now() - interval '90 days';
  delete from public.sensor_status_log where recorded_at < now() - interval '90 days';
  delete from public.hyperfocus_events where created_at < now() - interval '90 days';
end;
$$;
