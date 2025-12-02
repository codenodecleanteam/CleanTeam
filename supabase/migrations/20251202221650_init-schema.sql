create extension if not exists "pgcrypto";

create type public.language_code as enum ('en', 'pt', 'es');
create type public.user_role as enum ('superadmin', 'owner', 'admin', 'cleaner');
create type public.cleaner_status as enum ('active', 'inactive');
create type public.schedule_status as enum (
  'scheduled',
  'in_progress',
  'completed',
  'cancelled'
);
create type public.client_frequency as enum (
  'weekly',
  'bi-weekly',
  'monthly',
  'one-time'
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text default 'trial',
  trial_ends_at timestamptz,
  plan_code text default 'standard',
  is_blocked boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  company_id uuid references public.companies (id),
  role public.user_role not null default 'owner',
  name text not null,
  email text not null unique,
  phone text,
  language public.language_code not null default 'en',
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table public.cleaners (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  profile_id uuid unique references public.profiles (id) on delete set null,
  name text not null,
  email text,
  phone text,
  language public.language_code not null default 'en',
  drives boolean not null default false,
  status public.cleaner_status not null default 'active',
  area text,
  notes text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  address text,
  frequency public.client_frequency,
  notes text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table public.schedules (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  client_id uuid not null references public.clients (id),
  job_date date not null,
  start_time timestamptz,
  drive_id uuid not null references public.cleaners (id),
  helper1_id uuid not null references public.cleaners (id),
  helper2_id uuid references public.cleaners (id),
  status public.schedule_status not null default 'scheduled',
  notes text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.schedules (id) on delete cascade,
  cleaner_id uuid references public.cleaners (id) on delete set null,
  start_time timestamptz,
  end_time timestamptz,
  duration_minutes integer,
  issues text,
  extra_tasks text,
  notes text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index companies_subscription_status_idx on public.companies (subscription_status);
create index profiles_company_id_idx on public.profiles (company_id);
create index cleaners_company_id_idx on public.cleaners (company_id);
create index clients_company_id_idx on public.clients (company_id);
create index schedules_company_id_idx on public.schedules (company_id);
create index reports_schedule_id_idx on public.reports (schedule_id);

create or replace function public.is_superadmin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'superadmin'
  );
$$;

create or replace function public.current_company_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select p.company_id
  from public.profiles p
  where p.id = auth.uid()
  limit 1;
$$;

create or replace function public.current_cleaner_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select c.id
  from public.cleaners c
  where c.profile_id = auth.uid()
  limit 1;
$$;

create or replace function public.is_company_member(target_company uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(
    (
      select true
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'superadmin'
      limit 1
    ),
    false
  ) or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.company_id = target_company
  );
$$;

create or replace function public.is_company_admin(target_company uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(
    (
      select true
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'superadmin'
      limit 1
    ),
    false
  ) or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.company_id = target_company
      and p.role in ('owner', 'admin')
  );
$$;

alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.cleaners enable row level security;
alter table public.clients enable row level security;
alter table public.schedules enable row level security;
alter table public.reports enable row level security;

create policy "service role manages companies"
  on public.companies
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "superadmins manage companies"
  on public.companies
  using (public.is_superadmin())
  with check (public.is_superadmin());

create policy "members view their company"
  on public.companies
  for select
  using (public.is_company_member(id));

create policy "admins update their company"
  on public.companies
  for update
  using (public.is_company_admin(id))
  with check (public.is_company_admin(id));

create policy "service role manages profiles"
  on public.profiles
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "users view own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "users update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "superadmins manage profiles"
  on public.profiles
  using (public.is_superadmin())
  with check (public.is_superadmin());

create policy "service role manages cleaners"
  on public.cleaners
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "company members read cleaners"
  on public.cleaners
  for select
  using (public.is_company_member(company_id));

create policy "company admins manage cleaners"
  on public.cleaners
  for all
  using (public.is_company_admin(company_id))
  with check (public.is_company_admin(company_id));

create policy "cleaners manage own record"
  on public.cleaners
  for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "service role manages clients"
  on public.clients
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "company members read clients"
  on public.clients
  for select
  using (public.is_company_member(company_id));

create policy "company admins manage clients"
  on public.clients
  for all
  using (public.is_company_admin(company_id))
  with check (public.is_company_admin(company_id));

create policy "service role manages schedules"
  on public.schedules
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "company members read schedules"
  on public.schedules
  for select
  using (public.is_company_member(company_id));

create policy "company admins manage schedules"
  on public.schedules
  for all
  using (public.is_company_admin(company_id))
  with check (public.is_company_admin(company_id));

create policy "service role manages reports"
  on public.reports
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "company members read reports"
  on public.reports
  for select
  using (
    exists (
      select 1
      from public.schedules s
      where s.id = reports.schedule_id
        and public.is_company_member(s.company_id)
    )
  );

create policy "company admins manage reports"
  on public.reports
  for all
  using (
    exists (
      select 1
      from public.schedules s
      where s.id = reports.schedule_id
        and public.is_company_admin(s.company_id)
    )
  )
  with check (
    exists (
      select 1
      from public.schedules s
      where s.id = reports.schedule_id
        and public.is_company_admin(s.company_id)
    )
  );

create policy "cleaners manage own reports"
  on public.reports
  for all
  using (cleaner_id = public.current_cleaner_id())
  with check (cleaner_id = public.current_cleaner_id());
