-- GLAM'D Cebu: service_categories, services, appointments, business_hours,
-- blocked_slots, profiles, shop_settings, push_subscriptions + RLS

create table if not exists public.service_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  brand text not null,
  description text,
  sort_order int default 0
);

create table if not exists public.services (
  id text primary key,
  category_id uuid not null references public.service_categories(id) on delete cascade,
  name text not null,
  price int not null check (price >= 0),
  type text not null check (type in ('main', 'addon')),
  sort_order int default 0,
  is_active boolean default true
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  notes text,
  appointment_at timestamptz not null,
  duration_minutes int not null default 60,
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled','completed')),
  total_price int not null check (total_price >= 0),
  visit_type text not null default 'walk_in' check (visit_type in ('walk_in', 'home_service')),
  home_address text,
  home_service_fee integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.appointment_services (
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  service_id text not null references public.services(id),
  primary key (appointment_id, service_id)
);

create table if not exists public.business_hours (
  day_of_week int primary key check (day_of_week between 0 and 6),
  open_time time not null,
  close_time time not null,
  is_closed boolean not null default false
);

create table if not exists public.blocked_slots (
  id uuid primary key default gen_random_uuid(),
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'owner'
);

create table if not exists public.shop_settings (
  id integer primary key default 1 check (id = 1),
  home_service_fee integer not null default 0,
  updated_at timestamptz not null default now(),
  site_title text not null default 'GLAM''D Cebu',
  logo_url text,
  appointment_reminder_hours integer not null default 24,
  contact_phone text,
  contact_phone_display text,
  contact_address text,
  contact_maps_url text,
  contact_instagram_url text,
  contact_instagram_label text,
  contact_facebook_url text,
  contact_facebook_label text
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_appointments_at on public.appointments(appointment_at);
create index if not exists idx_appointments_status on public.appointments(status);
create index if not exists push_subscriptions_user_id_idx on public.push_subscriptions(user_id);

alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_services enable row level security;
alter table public.business_hours enable row level security;
alter table public.blocked_slots enable row level security;
alter table public.profiles enable row level security;
alter table public.shop_settings enable row level security;
alter table public.push_subscriptions enable row level security;

drop policy if exists service_categories_public_read on public.service_categories;
create policy service_categories_public_read on public.service_categories for select using (true);

drop policy if exists services_read on public.services;
create policy services_read on public.services
  for select
  using (
    is_active = true
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner')
  );

drop policy if exists services_owner_insert on public.services;
create policy services_owner_insert on public.services
  for insert to authenticated
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner'));

drop policy if exists services_owner_update on public.services;
create policy services_owner_update on public.services
  for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner'));

drop policy if exists services_owner_delete on public.services;
create policy services_owner_delete on public.services
  for delete to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner'));

drop policy if exists business_hours_public_read on public.business_hours;
create policy business_hours_public_read on public.business_hours for select using (true);

drop policy if exists business_hours_owner_all on public.business_hours;
create policy business_hours_owner_all on public.business_hours for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner')
) with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner')
);

drop policy if exists blocked_slots_public_read on public.blocked_slots;
create policy blocked_slots_public_read on public.blocked_slots for select using (true);

drop policy if exists blocked_slots_owner_all on public.blocked_slots;
create policy blocked_slots_owner_all on public.blocked_slots for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner')
) with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner')
);

drop policy if exists appointments_public_insert on public.appointments;
create policy appointments_public_insert on public.appointments for insert with check (true);

drop policy if exists appointments_public_read on public.appointments;
create policy appointments_public_read on public.appointments for select to anon, authenticated using (true);

drop policy if exists appointments_owner_all on public.appointments;
create policy appointments_owner_all on public.appointments for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner')
) with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner')
);

drop policy if exists appointment_services_public_insert on public.appointment_services;
create policy appointment_services_public_insert on public.appointment_services for insert with check (true);

drop policy if exists appointment_services_public_read on public.appointment_services;
create policy appointment_services_public_read on public.appointment_services for select to anon, authenticated using (true);

drop policy if exists appointment_services_owner_all on public.appointment_services;
create policy appointment_services_owner_all on public.appointment_services for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner')
) with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner')
);

drop policy if exists profiles_owner_read on public.profiles;
create policy profiles_owner_read on public.profiles for select using (auth.uid() = id);

drop policy if exists shop_settings_public_read on public.shop_settings;
create policy shop_settings_public_read on public.shop_settings for select using (true);

drop policy if exists shop_settings_owner_all on public.shop_settings;
create policy shop_settings_owner_all on public.shop_settings for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner')
) with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner')
);

drop policy if exists push_subscriptions_own on public.push_subscriptions;
create policy push_subscriptions_own on public.push_subscriptions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace view public.public_schedule_counts as
select (appointment_at at time zone 'Asia/Manila')::date as booking_date,
       count(*)::int as booking_count
from public.appointments
where status in ('pending', 'confirmed')
group by 1;

grant select on public.public_schedule_counts to anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role) values (new.id, 'owner')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

insert into public.shop_settings (
  id, home_service_fee, site_title, appointment_reminder_hours,
  contact_phone, contact_phone_display, contact_address, contact_maps_url,
  contact_instagram_url, contact_instagram_label, contact_facebook_url, contact_facebook_label
) values (
  1, 0, 'GLAM''D Cebu', 24,
  '09665518594', '0966 551 8594', 'South Ridge Residences Blk2 Lot 2',
  'https://www.google.com/maps/search/?api=1&query=South+Ridge+Residences+Cebu',
  'https://instagram.com/glam.d21', '@glam.d21',
  'https://facebook.com', 'Christine Dela Calzada'
)
on conflict (id) do nothing;

insert into public.service_categories (slug, name, brand, description, sort_order) values
  ('lashes-brows', 'Lashes & Brows', 'GLAM''D', 'Classic to mega volume lashes, lifts, and brow lamination.', 1),
  ('nails', 'Nails', 'GLAM''D D', 'Gel nails, extensions, and custom nail art add-ons.', 2)
on conflict (slug) do nothing;

insert into public.services (id, category_id, name, price, type, sort_order) values
  ('lb-classic', (select id from public.service_categories where slug='lashes-brows'), 'Classic', 499, 'main', 1),
  ('lb-hybrid', (select id from public.service_categories where slug='lashes-brows'), 'Hybrid', 699, 'main', 2),
  ('lb-volume', (select id from public.service_categories where slug='lashes-brows'), 'Volume', 899, 'main', 3),
  ('lb-mega', (select id from public.service_categories where slug='lashes-brows'), 'Mega Volume', 999, 'main', 4),
  ('lb-wetset', (select id from public.service_categories where slug='lashes-brows'), 'Wetset', 999, 'main', 5),
  ('lb-lift', (select id from public.service_categories where slug='lashes-brows'), 'Eyelash lift', 399, 'main', 6),
  ('lb-lift-tint', (select id from public.service_categories where slug='lashes-brows'), 'Eyelash lift with tint', 449, 'main', 7),
  ('lb-brow', (select id from public.service_categories where slug='lashes-brows'), 'Brow lamination', 399, 'main', 8),
  ('lb-brow-tint', (select id from public.service_categories where slug='lashes-brows'), 'Brow lamination with tint', 449, 'main', 9),
  ('lb-addon-styles', (select id from public.service_categories where slug='lashes-brows'), 'Cateye, dolleye, squirrel', 99, 'addon', 10),
  ('lb-wispy', (select id from public.service_categories where slug='lashes-brows'), 'Wispy', 299, 'addon', 11),
  ('lb-removal', (select id from public.service_categories where slug='lashes-brows'), 'Removal', 199, 'addon', 12),
  ('n-gel', (select id from public.service_categories where slug='nails'), 'Nail gel plain', 299, 'main', 1),
  ('n-extension', (select id from public.service_categories where slug='nails'), 'Nail Extension plain', 499, 'main', 2),
  ('n-french', (select id from public.service_categories where slug='nails'), 'French tips', 15, 'addon', 3),
  ('n-cateye', (select id from public.service_categories where slug='nails'), 'Cateye', 15, 'addon', 4),
  ('n-ombre', (select id from public.service_categories where slug='nails'), 'Ombre', 15, 'addon', 5),
  ('n-chrome', (select id from public.service_categories where slug='nails'), 'Chrome', 20, 'addon', 6),
  ('n-dual', (select id from public.service_categories where slug='nails'), 'Dual base', 10, 'addon', 7),
  ('n-3d-art', (select id from public.service_categories where slug='nails'), '3D Nail Art', 30, 'addon', 8),
  ('n-handpaint', (select id from public.service_categories where slug='nails'), 'Hand-paint art', 35, 'addon', 9),
  ('n-rhinestone', (select id from public.service_categories where slug='nails'), 'Rhinestone/pearl', 15, 'addon', 10),
  ('n-sticker', (select id from public.service_categories where slug='nails'), 'Sticker', 15, 'addon', 11),
  ('n-jewels', (select id from public.service_categories where slug='nails'), '3D jewels', 15, 'addon', 12)
on conflict (id) do nothing;

insert into public.business_hours (day_of_week, open_time, close_time, is_closed) values
  (0, '09:00', '18:00', true),
  (1, '09:00', '18:00', false),
  (2, '09:00', '18:00', false),
  (3, '09:00', '18:00', false),
  (4, '09:00', '18:00', false),
  (5, '09:00', '18:00', false),
  (6, '09:00', '18:00', false)
on conflict (day_of_week) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'branding',
  'branding',
  true,
  2097152,
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Branding public read" on storage.objects;
create policy "Branding public read" on storage.objects
  for select using (bucket_id = 'branding');

drop policy if exists "Branding owner insert" on storage.objects;
create policy "Branding owner insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'branding'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'owner')
  );

drop policy if exists "Branding owner update" on storage.objects;
create policy "Branding owner update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'branding'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'owner')
  );

drop policy if exists "Branding owner delete" on storage.objects;
create policy "Branding owner delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'branding'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'owner')
  );
