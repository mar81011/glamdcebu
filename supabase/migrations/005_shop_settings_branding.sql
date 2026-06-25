-- Admin-configurable site title and logo URL
ALTER TABLE public.shop_settings
  ADD COLUMN IF NOT EXISTS site_title text NOT NULL DEFAULT 'GLAM''D Cebu',
  ADD COLUMN IF NOT EXISTS logo_url text;

UPDATE public.shop_settings
SET site_title = 'GLAM''D Cebu'
WHERE id = 1 AND (site_title IS NULL OR site_title = '');

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'branding',
  'branding',
  true,
  2097152,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Branding public read" ON storage.objects;
CREATE POLICY "Branding public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'branding');

DROP POLICY IF EXISTS "Branding owner insert" ON storage.objects;
CREATE POLICY "Branding owner insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'branding'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

DROP POLICY IF EXISTS "Branding owner update" ON storage.objects;
CREATE POLICY "Branding owner update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'branding'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

DROP POLICY IF EXISTS "Branding owner delete" ON storage.objects;
CREATE POLICY "Branding owner delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'branding'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );
