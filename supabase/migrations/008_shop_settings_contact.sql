-- Admin-editable contact details shown in footer and booking pages
ALTER TABLE public.shop_settings
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS contact_phone_display text,
  ADD COLUMN IF NOT EXISTS contact_address text,
  ADD COLUMN IF NOT EXISTS contact_maps_url text,
  ADD COLUMN IF NOT EXISTS contact_instagram_url text,
  ADD COLUMN IF NOT EXISTS contact_instagram_label text,
  ADD COLUMN IF NOT EXISTS contact_facebook_url text,
  ADD COLUMN IF NOT EXISTS contact_facebook_label text;

UPDATE public.shop_settings
SET
  contact_phone = COALESCE(contact_phone, '09665518594'),
  contact_phone_display = COALESCE(contact_phone_display, '0966 551 8594'),
  contact_address = COALESCE(contact_address, 'South Ridge Residences Blk2 Lot 2'),
  contact_maps_url = COALESCE(
    contact_maps_url,
    'https://www.google.com/maps/search/?api=1&query=South+Ridge+Residences+Cebu'
  ),
  contact_instagram_url = COALESCE(contact_instagram_url, 'https://instagram.com/glam.d21'),
  contact_instagram_label = COALESCE(contact_instagram_label, '@glam.d21'),
  contact_facebook_url = COALESCE(contact_facebook_url, 'https://facebook.com'),
  contact_facebook_label = COALESCE(contact_facebook_label, 'Christine Dela Calzada')
WHERE id = 1;
