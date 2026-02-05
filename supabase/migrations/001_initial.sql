-- MindFlow Database Schema
-- Run this in Supabase SQL Editor

-- Users (extends Supabase auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  language text default 'pl',
  voice_preference text default 'bella', -- ElevenLabs voice ID
  tier text default 'free' check (tier in ('free', 'premium')),
  created_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;

-- Users can read/update their own profile
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();


-- Onboarding answers / User preferences
create table if not exists user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade unique,
  stress_level int check (stress_level >= 1 and stress_level <= 10),
  sleep_quality int check (sleep_quality >= 1 and sleep_quality <= 10),
  goals text[] default '{}', -- ['sleep', 'anxiety', 'focus', 'energy']
  meditation_experience text default 'beginner' check (meditation_experience in ('beginner', 'intermediate', 'advanced')),
  preferred_duration int default 10, -- minutes: 5, 10, 15, 20
  preferred_time text default 'evening' check (preferred_time in ('morning', 'evening', 'anytime')),
  triggers text[] default '{}', -- ['work', 'relationships', 'health', 'money']
  updated_at timestamptz default now()
);

alter table user_preferences enable row level security;

create policy "Users can view own preferences"
  on user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert own preferences"
  on user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own preferences"
  on user_preferences for update
  using (auth.uid() = user_id);


-- Generated meditations
create table if not exists meditations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  script text not null,
  audio_url text, -- Supabase storage URL
  duration_seconds int,
  theme text, -- 'sleep', 'anxiety', 'focus', 'energy', etc.
  language text default 'pl',
  created_at timestamptz default now()
);

alter table meditations enable row level security;

create policy "Users can view own meditations"
  on meditations for select
  using (auth.uid() = user_id);

create policy "Users can insert own meditations"
  on meditations for insert
  with check (auth.uid() = user_id);

-- Index for faster queries
create index if not exists idx_meditations_user_created
  on meditations(user_id, created_at desc);


-- User feedback (for personalization learning)
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  meditation_id uuid references meditations(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  rating int check (rating >= 1 and rating <= 5),
  mood_before int check (mood_before >= 1 and mood_before <= 10),
  mood_after int check (mood_after >= 1 and mood_after <= 10),
  notes text,
  created_at timestamptz default now()
);

alter table feedback enable row level security;

create policy "Users can view own feedback"
  on feedback for select
  using (auth.uid() = user_id);

create policy "Users can insert own feedback"
  on feedback for insert
  with check (auth.uid() = user_id);

-- Index for analytics
create index if not exists idx_feedback_user
  on feedback(user_id, created_at desc);


-- Subscriptions (synced with Stripe)
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text default 'active' check (status in ('active', 'canceled', 'past_due')),
  plan text check (plan in ('monthly', 'yearly')),
  current_period_end timestamptz,
  created_at timestamptz default now()
);

alter table subscriptions enable row level security;

create policy "Users can view own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);

-- Service role can manage subscriptions (for webhooks)
create policy "Service role can manage subscriptions"
  on subscriptions for all
  using (auth.role() = 'service_role');


-- Storage bucket for meditation audio files
-- Run this separately in Supabase Dashboard > Storage:
-- 1. Create bucket named "meditations"
-- 2. Set it to public (or authenticated depending on your needs)
-- 3. Add policy: authenticated users can upload to their own folder


-- Helper functions

-- Get user's streak (consecutive days of meditation)
create or replace function get_meditation_streak(p_user_id uuid)
returns int as $$
declare
  streak int := 0;
  current_date date := current_date;
  check_date date;
  meditation_exists boolean;
begin
  loop
    check_date := current_date - streak;

    select exists(
      select 1 from meditations
      where user_id = p_user_id
      and date(created_at) = check_date
    ) into meditation_exists;

    if meditation_exists then
      streak := streak + 1;
    else
      exit;
    end if;

    -- Safety limit
    if streak > 365 then
      exit;
    end if;
  end loop;

  return streak;
end;
$$ language plpgsql security definer;


-- Get user stats
create or replace function get_user_stats(p_user_id uuid)
returns json as $$
declare
  result json;
begin
  select json_build_object(
    'total_meditations', (select count(*) from meditations where user_id = p_user_id),
    'total_minutes', (select coalesce(sum(duration_seconds), 0) / 60 from meditations where user_id = p_user_id),
    'avg_rating', (select coalesce(avg(rating), 0) from feedback where user_id = p_user_id),
    'avg_mood_improvement', (select coalesce(avg(mood_after - mood_before), 0) from feedback where user_id = p_user_id),
    'streak', get_meditation_streak(p_user_id)
  ) into result;

  return result;
end;
$$ language plpgsql security definer;
