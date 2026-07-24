-- Expand exercise category taxonomy from broad groups (arms, legs) to the
-- muscle-group granularity a real training app needs, and add equipment
-- types used by the expanded exercise library.
--
-- New enum values must be committed before they can be used in inserts/updates,
-- so this runs as its own migration ahead of 20260724160100.

alter type public.exercise_category add value if not exists 'biceps';
alter type public.exercise_category add value if not exists 'triceps';
alter type public.exercise_category add value if not exists 'forearms';
alter type public.exercise_category add value if not exists 'quads';
alter type public.exercise_category add value if not exists 'hamstrings';
alter type public.exercise_category add value if not exists 'glutes';
alter type public.exercise_category add value if not exists 'calves';
alter type public.exercise_category add value if not exists 'olympic';
alter type public.exercise_category add value if not exists 'mobility';

alter type public.equipment_type add value if not exists 'band';
alter type public.equipment_type add value if not exists 'sled';
alter type public.equipment_type add value if not exists 'medicine_ball';
alter type public.equipment_type add value if not exists 'sandbag';
