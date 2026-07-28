-- Add real representative photos (Unsplash, one per garment type) to the
-- clothing catalog, since exact branded product photos aren't available
-- through stock photography — search matches by keyword in the item name.

alter table public.clothing_items add column image_url text;

update public.clothing_items set image_url =
  'https://images.unsplash.com/photo-1667900334692-0bf6afe68cbf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400'
where category = 'top'
  and (name ilike '%compression%' or name ilike '%seamless%' or name ilike '%heatgear%'
       or name ilike '%metal vent%' or name ilike '%rush%' or name ilike '%license to train%');

update public.clothing_items set image_url =
  'https://images.unsplash.com/photo-1777264061365-eff8da715b13?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400'
where category = 'top' and (name ilike '%tank%' or name ilike '%stringer%') and image_url is null;

update public.clothing_items set image_url =
  'https://images.unsplash.com/photo-1595909315417-2edd382a56dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400'
where category = 'top' and name ilike '%sports bra%';

update public.clothing_items set image_url =
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400'
where category = 'top' and image_url is null;

update public.clothing_items set image_url =
  'https://images.unsplash.com/photo-1594737626072-90dc274bc2bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400'
where category = 'bottom' and (name ilike '%legging%');

update public.clothing_items set image_url =
  'https://images.unsplash.com/photo-1719528967248-340696683779?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400'
where category = 'bottom'
  and (name ilike '%jogger%' or name ilike '%sweatpant%' or name ilike '%track pant%'
       or name ilike '%fleece%');

update public.clothing_items set image_url =
  'https://images.unsplash.com/photo-1768811515656-3f3ab8bf2c00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400'
where category = 'bottom' and image_url is null;

update public.clothing_items set image_url =
  'https://images.unsplash.com/photo-1778480977007-e1ff1a547984?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400'
where category = 'outerwear';

update public.clothing_items set image_url =
  'https://images.unsplash.com/photo-1561201438-edaf5d205694?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400'
where category = 'footwear' and name ilike '%slide%';

update public.clothing_items set image_url =
  'https://images.unsplash.com/photo-1673229745029-a76cc0030e86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400'
where category = 'footwear' and image_url is null;

update public.clothing_items set image_url =
  'https://images.unsplash.com/photo-1766264183468-c163676c5154?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400'
where category = 'accessory';
