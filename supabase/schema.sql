-- ==============================================================================
-- IronTrack - Personal Gym Database Schema for Supabase
-- Single-User / Personal Private Database (Zero Sign-In Required)
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Exercises Catalog Table
create table if not exists public.exercises (
  id text primary key default gen_random_uuid()::text,
  user_id text null, -- null = standard global exercise
  name text not null,
  muscle_group text not null,
  equipment text not null,
  default_rest_seconds integer default 90,
  instructions text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Workouts Table
create table if not exists public.workouts (
  id text primary key default gen_random_uuid()::text,
  user_id text default 'owner',
  name text not null,
  start_time timestamp with time zone not null default timezone('utc'::text, now()),
  end_time timestamp with time zone,
  duration_seconds integer default 0,
  notes text,
  total_volume_kg numeric default 0,
  is_completed boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Workout Sets Table
create table if not exists public.workout_sets (
  id text primary key default gen_random_uuid()::text,
  workout_id text references public.workouts on delete cascade not null,
  exercise_id text not null,
  exercise_name text not null,
  set_number integer not null,
  set_type text default 'normal' check (set_type in ('normal', 'warmup', 'drop', 'failure')),
  weight numeric not null default 0,
  reps integer not null default 0,
  rest_seconds integer default 90,
  rpe numeric check (rpe is null or (rpe >= 1 and rpe <= 10)),
  is_completed boolean default true,
  completed_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. User Streaks Table
create table if not exists public.user_streaks (
  user_id text primary key default 'owner',
  current_streak integer default 0,
  longest_streak integer default 0,
  last_workout_date date,
  total_workouts integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ------------------------------------------------------------------------------
-- Row Level Security (RLS) for Personal Instance
-- Since this is your own private Supabase instance and your credentials
-- are stored exclusively on your personal phone, all requests using your
-- Project API key have full access with zero login required.
-- ------------------------------------------------------------------------------
alter table public.exercises enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_sets enable row level security;
alter table public.user_streaks enable row level security;

create policy "Personal workouts access" on public.workouts for all using (true) with check (true);
create policy "Personal sets access" on public.workout_sets for all using (true) with check (true);
create policy "Personal streaks access" on public.user_streaks for all using (true) with check (true);
create policy "Personal exercises access" on public.exercises for all using (true) with check (true);

-- ------------------------------------------------------------------------------
-- Seed Standard Exercise Library
-- ------------------------------------------------------------------------------
insert into public.exercises (id, user_id, name, muscle_group, equipment, default_rest_seconds) values
  ('ex-bench-press', null, 'Barbell Bench Press', 'Chest', 'Barbell', 120),
  ('ex-incline-db-press', null, 'Incline Dumbbell Press', 'Chest', 'Dumbbell', 90),
  ('ex-cable-crossover', null, 'Cable Fly / Crossover', 'Chest', 'Cable', 60),
  ('ex-pushup', null, 'Push-Ups', 'Chest', 'Bodyweight', 60),
  ('ex-dips-chest', null, 'Chest Dips', 'Chest', 'Bodyweight', 90),
  ('ex-barbell-squat', null, 'Barbell Back Squat', 'Legs', 'Barbell', 180),
  ('ex-leg-press', null, 'Leg Press', 'Legs', 'Machine', 120),
  ('ex-romanian-deadlift', null, 'Romanian Deadlift (RDL)', 'Legs', 'Barbell', 120),
  ('ex-bulgarian-split-squat', null, 'Bulgarian Split Squat', 'Legs', 'Dumbbell', 90),
  ('ex-leg-curl', null, 'Lying Leg Curl', 'Legs', 'Machine', 60),
  ('ex-leg-extension', null, 'Leg Extension', 'Legs', 'Machine', 60),
  ('ex-calf-raise', null, 'Standing Calf Raise', 'Legs', 'Machine', 60),
  ('ex-deadlift', null, 'Barbell Conventional Deadlift', 'Back', 'Barbell', 180),
  ('ex-pullup', null, 'Pull-Ups / Chin-Ups', 'Back', 'Bodyweight', 120),
  ('ex-lat-pulldown', null, 'Lat Pulldown', 'Back', 'Cable', 90),
  ('ex-barbell-row', null, 'Bent Over Barbell Row', 'Back', 'Barbell', 120),
  ('ex-seated-cable-row', null, 'Seated Cable Row', 'Back', 'Cable', 90),
  ('ex-dumbbell-row', null, 'Single-Arm Dumbbell Row', 'Back', 'Dumbbell', 90),
  ('ex-overhead-press', null, 'Barbell Overhead Press (OHP)', 'Shoulders', 'Barbell', 120),
  ('ex-db-shoulder-press', null, 'Seated Dumbbell Shoulder Press', 'Shoulders', 'Dumbbell', 90),
  ('ex-lateral-raise', null, 'Dumbbell Lateral Raise', 'Shoulders', 'Dumbbell', 60),
  ('ex-face-pull', null, 'Cable Face Pull', 'Shoulders', 'Cable', 60),
  ('ex-reverse-pec-deck', null, 'Reverse Pec Deck / Rear Delt Fly', 'Shoulders', 'Machine', 60),
  ('ex-barbell-curl', null, 'Barbell Bicep Curl', 'Arms', 'Barbell', 75),
  ('ex-db-hammer-curl', null, 'Dumbbell Hammer Curl', 'Arms', 'Dumbbell', 60),
  ('ex-incline-db-curl', null, 'Incline Dumbbell Curl', 'Arms', 'Dumbbell', 60),
  ('ex-tricep-pushdown', null, 'Tricep Rope Pushdown', 'Arms', 'Cable', 60),
  ('ex-skull-crusher', null, 'EZ-Bar Skull Crusher', 'Arms', 'Barbell', 90),
  ('ex-hanging-leg-raise', null, 'Hanging Leg Raise', 'Core', 'Bodyweight', 60),
  ('ex-plank', null, 'Plank', 'Core', 'Bodyweight', 60),
  ('ex-cable-woodchopper', null, 'Cable Woodchopper', 'Core', 'Cable', 60)
on conflict (id) do nothing;
