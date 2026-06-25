-- Owner can manage services; public only sees active items
DROP POLICY IF EXISTS services_public_read ON public.services;

CREATE POLICY services_read ON public.services
  FOR SELECT
  USING (
    is_active = true
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );

DROP POLICY IF EXISTS services_owner_insert ON public.services;
CREATE POLICY services_owner_insert ON public.services
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );

DROP POLICY IF EXISTS services_owner_update ON public.services;
CREATE POLICY services_owner_update ON public.services
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );

DROP POLICY IF EXISTS services_owner_delete ON public.services;
CREATE POLICY services_owner_delete ON public.services
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );
