-- Lets each user choose which exercise represents a given muscle region
-- on the Body Map (e.g. "Chest" could track Bench Press or Incline Press).

create table public.muscle_exercise_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  muscle_slug text not null,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  updated_at timestamptz not null default now()
);

create unique index muscle_exercise_preferences_user_muscle_idx
  on public.muscle_exercise_preferences (user_id, muscle_slug);

alter table public.muscle_exercise_preferences enable row level security;

create policy "Users can view their own muscle exercise preferences"
  on public.muscle_exercise_preferences for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can create their own muscle exercise preferences"
  on public.muscle_exercise_preferences for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update their own muscle exercise preferences"
  on public.muscle_exercise_preferences for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete their own muscle exercise preferences"
  on public.muscle_exercise_preferences for delete
  to authenticated
  using (user_id = auth.uid());

create trigger set_muscle_exercise_preferences_updated_at
  before update on public.muscle_exercise_preferences
  for each row execute function public.set_updated_at();
