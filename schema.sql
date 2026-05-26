-- ═══════════════════════════════════════════════════════════
-- TennisPicks — Supabase Database Schema
-- Run this entire file in your Supabase project:
-- Dashboard → SQL Editor → New Query → paste & run
-- ═══════════════════════════════════════════════════════════


-- ─── 1. PROFILES ────────────────────────────────────────────
-- Stores public usernames linked to Supabase Auth users
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  username   text unique not null,
  email      text,
  created_at timestamptz default now()
);

-- Allow users to read all profiles, only write their own
alter table profiles enable row level security;
create policy "Anyone can read profiles"   on profiles for select using (true);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);


-- ─── 2. PICKS ───────────────────────────────────────────────
-- Stores each user's picks per tournament as a JSON blob
create table if not exists picks (
  id              bigserial primary key,
  user_id         uuid references auth.users(id) on delete cascade,
  tournament_id   text not null,
  picks_json      jsonb not null default '{}',
  updated_at      timestamptz default now(),
  unique (user_id, tournament_id)
);

alter table picks enable row level security;
create policy "Users can read own picks"   on picks for select using (auth.uid() = user_id);
create policy "Users can insert own picks" on picks for insert with check (auth.uid() = user_id);
create policy "Users can update own picks" on picks for update using (auth.uid() = user_id);


-- ─── 3. LEADERBOARD ─────────────────────────────────────────
-- Stores computed scores per user per tournament
create table if not exists leaderboard (
  id              bigserial primary key,
  user_id         uuid references auth.users(id) on delete cascade,
  tournament_id   text not null,
  username        text not null,
  score           int not null default 0,
  correct_picks   int not null default 0,
  total_picks     int not null default 0,
  updated_at      timestamptz default now(),
  unique (user_id, tournament_id)
);

alter table leaderboard enable row level security;
create policy "Anyone can read leaderboard" on leaderboard for select using (true);
create policy "Users can insert own score"  on leaderboard for insert with check (auth.uid() = user_id);
create policy "Users can update own score"  on leaderboard for update using (auth.uid() = user_id);


-- ─── Done! ───────────────────────────────────────────────────
-- Your database is ready. Now:
-- 1. Go to Project Settings → API → copy Project URL and anon key
-- 2. Paste them into your .env file
-- 3. Deploy to Vercel (see DEPLOY.md)
