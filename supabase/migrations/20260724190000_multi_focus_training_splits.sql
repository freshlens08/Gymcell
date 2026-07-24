-- Allow each training split day to target multiple muscle groups
-- (e.g. Monday = chest + shoulders + triceps), not just one.

alter table public.training_splits
  alter column muscle_focus type public.exercise_category[]
  using (
    case
      when muscle_focus is null then '{}'::public.exercise_category[]
      else array[muscle_focus]
    end
  );

alter table public.training_splits
  alter column muscle_focus set default '{}';

alter table public.training_splits
  alter column muscle_focus set not null;
