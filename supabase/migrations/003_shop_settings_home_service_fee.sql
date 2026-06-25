-- Admin-configurable home service fee (single row)
CREATE TABLE IF NOT EXISTS public.shop_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  home_service_fee integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.shop_settings (id, home_service_fee)
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS home_service_fee integer NOT NULL DEFAULT 0;
