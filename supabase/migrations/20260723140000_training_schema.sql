-- GymCell: Training + Auth core schema
-- Tables: profiles, exercises, workouts, workout_exercises, sets
-- View: personal_records (best estimated 1RM per user/exercise)

create extension if not exists pgcrypto;

create type public.exercise_category as enum (
  'chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio', 'full_body'
);

create type public.equipment_type as enum (
  'barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'kettlebell', 'other'
);

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- profiles
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Profiles are updatable by owner"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row whenever a new auth user signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- exercises (global database + user-created custom exercises)
-- ============================================================

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category public.exercise_category not null,
  equipment public.equipment_type not null,
  instructions text,
  created_by uuid references public.profiles (id) on delete set null,
  is_custom boolean not null default false,
  created_at timestamptz not null default now()
);

create index exercises_name_idx on public.exercises (name);
create index exercises_category_idx on public.exercises (category);

alter table public.exercises enable row level security;

create policy "Exercises are viewable by authenticated users"
  on public.exercises for select
  to authenticated
  using (true);

create policy "Users can create their own custom exercises"
  on public.exercises for insert
  to authenticated
  with check (created_by = auth.uid() and is_custom = true);

create policy "Users can update their own custom exercises"
  on public.exercises for update
  to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "Users can delete their own custom exercises"
  on public.exercises for delete
  to authenticated
  using (created_by = auth.uid());

-- ============================================================
-- workouts
-- ============================================================

create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null default 'Workout',
  notes text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index workouts_user_started_idx on public.workouts (user_id, started_at desc);

alter table public.workouts enable row level security;

create policy "Users can view their own workouts"
  on public.workouts for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can create their own workouts"
  on public.workouts for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update their own workouts"
  on public.workouts for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete their own workouts"
  on public.workouts for delete
  to authenticated
  using (user_id = auth.uid());

create trigger set_workouts_updated_at
  before update on public.workouts
  for each row execute function public.set_updated_at();

-- ============================================================
-- workout_exercises (exercises within a workout, ordered)
-- ============================================================

create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  order_index int not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create index workout_exercises_workout_idx on public.workout_exercises (workout_id, order_index);
create index workout_exercises_exercise_idx on public.workout_exercises (exercise_id);

alter table public.workout_exercises enable row level security;

create policy "Users can view exercises in their own workouts"
  on public.workout_exercises for select
  to authenticated
  using (
    exists (
      select 1 from public.workouts w
      where w.id = workout_id and w.user_id = auth.uid()
    )
  );

create policy "Users can add exercises to their own workouts"
  on public.workout_exercises for insert
  to authenticated
  with check (
    exists (
      select 1 from public.workouts w
      where w.id = workout_id and w.user_id = auth.uid()
    )
  );

create policy "Users can update exercises in their own workouts"
  on public.workout_exercises for update
  to authenticated
  using (
    exists (
      select 1 from public.workouts w
      where w.id = workout_id and w.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workouts w
      where w.id = workout_id and w.user_id = auth.uid()
    )
  );

create policy "Users can remove exercises from their own workouts"
  on public.workout_exercises for delete
  to authenticated
  using (
    exists (
      select 1 from public.workouts w
      where w.id = workout_id and w.user_id = auth.uid()
    )
  );

-- ============================================================
-- sets
-- ============================================================

create table public.sets (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null references public.workout_exercises (id) on delete cascade,
  set_number int not null,
  weight numeric(6, 2),
  reps int,
  rpe numeric(3, 1),
  is_warmup boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index sets_workout_exercise_idx on public.sets (workout_exercise_id, set_number);

alter table public.sets enable row level security;

create policy "Users can view sets in their own workouts"
  on public.sets for select
  to authenticated
  using (
    exists (
      select 1 from public.workout_exercises we
      join public.workouts w on w.id = we.workout_id
      where we.id = workout_exercise_id and w.user_id = auth.uid()
    )
  );

create policy "Users can add sets to their own workouts"
  on public.sets for insert
  to authenticated
  with check (
    exists (
      select 1 from public.workout_exercises we
      join public.workouts w on w.id = we.workout_id
      where we.id = workout_exercise_id and w.user_id = auth.uid()
    )
  );

create policy "Users can update sets in their own workouts"
  on public.sets for update
  to authenticated
  using (
    exists (
      select 1 from public.workout_exercises we
      join public.workouts w on w.id = we.workout_id
      where we.id = workout_exercise_id and w.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workout_exercises we
      join public.workouts w on w.id = we.workout_id
      where we.id = workout_exercise_id and w.user_id = auth.uid()
    )
  );

create policy "Users can delete sets in their own workouts"
  on public.sets for delete
  to authenticated
  using (
    exists (
      select 1 from public.workout_exercises we
      join public.workouts w on w.id = we.workout_id
      where we.id = workout_exercise_id and w.user_id = auth.uid()
    )
  );

-- ============================================================
-- personal_records: best estimated 1RM per user/exercise
-- security_invoker means RLS on underlying tables is evaluated
-- as the querying user, not the view owner.
-- ============================================================

create view public.personal_records
with (security_invoker = true)
as
select user_id, exercise_id, exercise_name, weight, reps, estimated_1rm, achieved_at
from (
  select
    w.user_id,
    we.exercise_id,
    e.name as exercise_name,
    s.weight,
    s.reps,
    round((s.weight * (1 + s.reps / 30.0))::numeric, 1) as estimated_1rm,
    s.completed_at as achieved_at,
    row_number() over (
      partition by w.user_id, we.exercise_id
      order by s.weight * (1 + s.reps / 30.0) desc, s.completed_at desc
    ) as rn
  from public.sets s
  join public.workout_exercises we on we.id = s.workout_exercise_id
  join public.workouts w on w.id = we.workout_id
  join public.exercises e on e.id = we.exercise_id
  where s.is_warmup = false
    and s.weight is not null
    and s.reps is not null
    and s.reps > 0
) ranked
where rn = 1;

-- ============================================================
-- Seed a starter global exercise library
-- ============================================================

insert into public.exercises (name, category, equipment) values
  ('Barbell Back Squat', 'legs', 'barbell'),
  ('Barbell Bench Press', 'chest', 'barbell'),
  ('Barbell Deadlift', 'back', 'barbell'),
  ('Overhead Press', 'shoulders', 'barbell'),
  ('Barbell Row', 'back', 'barbell'),
  ('Front Squat', 'legs', 'barbell'),
  ('Romanian Deadlift', 'legs', 'barbell'),
  ('Incline Bench Press', 'chest', 'barbell'),
  ('Dumbbell Bench Press', 'chest', 'dumbbell'),
  ('Dumbbell Shoulder Press', 'shoulders', 'dumbbell'),
  ('Dumbbell Row', 'back', 'dumbbell'),
  ('Dumbbell Lunge', 'legs', 'dumbbell'),
  ('Dumbbell Bicep Curl', 'arms', 'dumbbell'),
  ('Lateral Raise', 'shoulders', 'dumbbell'),
  ('Bulgarian Split Squat', 'legs', 'dumbbell'),
  ('Pull-Up', 'back', 'bodyweight'),
  ('Push-Up', 'chest', 'bodyweight'),
  ('Dip', 'chest', 'bodyweight'),
  ('Plank', 'core', 'bodyweight'),
  ('Hanging Leg Raise', 'core', 'bodyweight'),
  ('Lat Pulldown', 'back', 'cable'),
  ('Cable Tricep Pushdown', 'arms', 'cable'),
  ('Cable Row', 'back', 'cable'),
  ('Leg Press', 'legs', 'machine'),
  ('Leg Extension', 'legs', 'machine'),
  ('Leg Curl', 'legs', 'machine'),
  ('Chest Fly Machine', 'chest', 'machine'),
  ('Kettlebell Swing', 'full_body', 'kettlebell'),
  ('Goblet Squat', 'legs', 'kettlebell'),
  ('Treadmill Run', 'cardio', 'other');
