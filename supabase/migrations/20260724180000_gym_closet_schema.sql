-- GymCell: Gym Closet + weekly training split schema
-- Tables: clothing_items (catalog), closet_items (user's closet), training_splits

create type public.clothing_category as enum (
  'top', 'bottom', 'outerwear', 'footwear', 'accessory'
);

-- ============================================================
-- clothing_items (shared catalog + user-created custom items)
-- ============================================================

create table public.clothing_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category public.clothing_category not null,
  created_by uuid references public.profiles (id) on delete set null,
  is_custom boolean not null default false,
  created_at timestamptz not null default now()
);

create index clothing_items_name_idx on public.clothing_items (name);
create index clothing_items_category_idx on public.clothing_items (category);

alter table public.clothing_items enable row level security;

create policy "Clothing items are viewable by authenticated users"
  on public.clothing_items for select
  to authenticated
  using (true);

create policy "Users can create their own custom clothing items"
  on public.clothing_items for insert
  to authenticated
  with check (created_by = auth.uid() and is_custom = true);

create policy "Users can update their own custom clothing items"
  on public.clothing_items for update
  to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "Users can delete their own custom clothing items"
  on public.clothing_items for delete
  to authenticated
  using (created_by = auth.uid());

-- ============================================================
-- closet_items (a user's personal closet)
-- ============================================================

create table public.closet_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  clothing_item_id uuid not null references public.clothing_items (id) on delete cascade,
  photo_url text,
  is_favorite boolean not null default false,
  added_at timestamptz not null default now()
);

create index closet_items_user_idx on public.closet_items (user_id);
create unique index closet_items_user_clothing_idx on public.closet_items (user_id, clothing_item_id);

alter table public.closet_items enable row level security;

create policy "Users can view their own closet"
  on public.closet_items for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can add to their own closet"
  on public.closet_items for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update their own closet items"
  on public.closet_items for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can remove their own closet items"
  on public.closet_items for delete
  to authenticated
  using (user_id = auth.uid());

-- ============================================================
-- training_splits (weekly day-of-week -> muscle focus schedule)
-- day_of_week: 0 = Sunday .. 6 = Saturday, matching JS Date#getDay()
-- ============================================================

create table public.training_splits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  muscle_focus public.exercise_category,
  label text,
  updated_at timestamptz not null default now()
);

create unique index training_splits_user_day_idx on public.training_splits (user_id, day_of_week);

alter table public.training_splits enable row level security;

create policy "Users can view their own training split"
  on public.training_splits for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can create their own training split"
  on public.training_splits for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update their own training split"
  on public.training_splits for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete their own training split"
  on public.training_splits for delete
  to authenticated
  using (user_id = auth.uid());

create trigger set_training_splits_updated_at
  before update on public.training_splits
  for each row execute function public.set_updated_at();

-- ============================================================
-- Storage: closet photos, one folder per user (folder name = user id)
-- ============================================================

insert into storage.buckets (id, name, public)
values ('closet-photos', 'closet-photos', true)
on conflict (id) do nothing;

create policy "Closet photos are publicly viewable"
  on storage.objects for select
  using (bucket_id = 'closet-photos');

create policy "Users can upload to their own closet photo folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'closet-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own closet photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'closet-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- Seed a starter clothing catalog
-- ============================================================

insert into public.clothing_items (name, category) values
  ('Compression Shirt', 'top'),
  ('Tank Top', 'top'),
  ('T-Shirt', 'top'),
  ('Long Sleeve Shirt', 'top'),
  ('Sports Bra', 'top'),
  ('Stringer', 'top'),
  ('Sweatpants', 'bottom'),
  ('Joggers', 'bottom'),
  ('Shorts', 'bottom'),
  ('Compression Leggings', 'bottom'),
  ('Track Pants', 'bottom'),
  ('Hoodie', 'outerwear'),
  ('Windbreaker', 'outerwear'),
  ('Zip-Up Jacket', 'outerwear'),
  ('Vest', 'outerwear'),
  ('Training Shoes', 'footwear'),
  ('Running Shoes', 'footwear'),
  ('Lifting Shoes', 'footwear'),
  ('Slides', 'footwear'),
  ('Gym Gloves', 'accessory'),
  ('Wrist Wraps', 'accessory'),
  ('Lifting Belt', 'accessory'),
  ('Cap', 'accessory'),
  ('Beanie', 'accessory'),
  ('Gym Bag', 'accessory'),
  ('Sweatband', 'accessory'),
  ('Knee Sleeves', 'accessory');
