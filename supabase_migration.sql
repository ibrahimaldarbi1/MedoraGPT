-- Run this SQL in your Supabase Dashboard SQL Editor
-- Dashboard > SQL Editor > New query > Paste and Run

-- 1. Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null default '',
  university text default '',
  majors text[] default '{}',
  study_goal text default '',
  onboarding_complete boolean default false,
  streak integer default 0,
  last_study_date text default '',
  xp integer default 0,
  badges text[] default '{}',
  daily_stats jsonb default '{"date":"","cardsStudied":0}',
  daily_quests jsonb default '[]',
  last_quest_generation_date text default '',
  created_at timestamptz default now()
);

-- 2. Create courses table
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '',
  instructor text default '',
  color text default 'bg-indigo-500',
  exams jsonb default '[]',
  materials jsonb default '[]',
  created_at timestamptz default now()
);

-- 3. Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.courses enable row level security;

-- 4. RLS Policies for profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 5. RLS Policies for courses
create policy "Users can view their own courses"
  on public.courses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own courses"
  on public.courses for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own courses"
  on public.courses for update
  using (auth.uid() = user_id);

create policy "Users can delete their own courses"
  on public.courses for delete
  using (auth.uid() = user_id);

-- 6. Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
