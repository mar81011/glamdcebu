-- visit_type: walk_in | home_service; home_address for home bookings
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS visit_type text NOT NULL DEFAULT 'walk_in'
    CHECK (visit_type IN ('walk_in', 'home_service')),
  ADD COLUMN IF NOT EXISTS home_address text;
