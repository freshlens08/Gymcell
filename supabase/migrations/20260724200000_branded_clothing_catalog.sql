-- Add a brand field to the clothing catalog and seed real, verified
-- products from popular gym-wear brands so search can find specific
-- items (e.g. "Gymshark Onyx Seamless T-Shirt"), not just generic types.

alter table public.clothing_items add column brand text;

create index clothing_items_brand_idx on public.clothing_items (brand);

insert into public.clothing_items (name, brand, category) values
  -- Gymshark
  ('Onyx Seamless T-Shirt', 'Gymshark', 'top'),
  ('Onyx Long Sleeve Top', 'Gymshark', 'top'),
  ('Critical Seamless Tank', 'Gymshark', 'top'),
  ('Vital Seamless Shorts', 'Gymshark', 'bottom'),
  ('Arrival Joggers', 'Gymshark', 'bottom'),
  ('Legacy Hoodie', 'Gymshark', 'outerwear'),

  -- Nike
  ('Pro Dri-FIT Tight Top', 'Nike', 'top'),
  ('Dri-FIT ADV Tank', 'Nike', 'top'),
  ('Pro Compression Shorts', 'Nike', 'bottom'),
  ('Dri-FIT Challenger Shorts', 'Nike', 'bottom'),
  ('Therma-FIT Joggers', 'Nike', 'bottom'),
  ('Tech Fleece Hoodie', 'Nike', 'outerwear'),

  -- Lululemon
  ('License to Train Tank', 'Lululemon', 'top'),
  ('Metal Vent Tech Shirt', 'Lululemon', 'top'),
  ('Surge Shorts', 'Lululemon', 'bottom'),
  ('ABC Jogger', 'Lululemon', 'bottom'),
  ('Align Legging', 'Lululemon', 'bottom'),

  -- Alphalete
  ('Amplify Seamless Top', 'Alphalete', 'top'),
  ('Aspire Tank', 'Alphalete', 'top'),
  ('Amplify Shorts', 'Alphalete', 'bottom'),
  ('Aspire Joggers', 'Alphalete', 'bottom'),

  -- Under Armour
  ('HeatGear Compression Shirt', 'Under Armour', 'top'),
  ('Rush Long Sleeve', 'Under Armour', 'top'),
  ('Tech Shorts', 'Under Armour', 'bottom'),
  ('Rival Fleece Joggers', 'Under Armour', 'bottom');
