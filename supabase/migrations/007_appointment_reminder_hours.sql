-- How many hours before an appointment to send admin reminder push (0 = off)
ALTER TABLE public.shop_settings
  ADD COLUMN IF NOT EXISTS appointment_reminder_hours integer NOT NULL DEFAULT 24;

UPDATE public.shop_settings
SET appointment_reminder_hours = 24
WHERE id = 1 AND appointment_reminder_hours IS NULL;
