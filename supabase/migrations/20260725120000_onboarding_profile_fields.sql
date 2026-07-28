-- Onboarding: capture the basics a new user needs to enter once so the
-- app can personalize training/nutrition/outfit suggestions from day one.

create type public.experience_level as enum ('beginner', 'intermediate', 'advanced');
create type public.workout_location as enum ('home', 'gym', 'both');

alter table public.profiles
  add column height_inches numeric(5, 2),
  add column current_weight_lbs numeric(6, 2),
  add column goal_weight_lbs numeric(6, 2),
  add column experience_level public.experience_level,
  add column workout_location public.workout_location,
  add column workouts_per_week smallint check (workouts_per_week between 0 and 14),
  add column onboarding_completed_at timestamptz;
