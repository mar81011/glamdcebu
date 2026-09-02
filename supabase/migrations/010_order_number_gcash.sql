-- Guest tracking codes plus GCash payment details.

alter table public.appointments
  add column if not exists order_number text,
  add column if not exists payment_method text not null default 'gcash',
  add column if not exists payment_reference text,
  add column if not exists payment_proof_url text,
  add column if not exists payment_proof_path text;

update public.appointments
set order_number = 'GLAM-' || upper(substr(replace(id::text, '-', ''), 1, 6))
where order_number is null;

alter table public.appointments
  alter column order_number set not null;

create unique index if not exists appointments_order_number_key
  on public.appointments (order_number);

alter table public.shop_settings
  add column if not exists gcash_number text,
  add column if not exists gcash_account_name text,
  add column if not exists gcash_qr_path text,
  add column if not exists gcash_qr_url text,
  add column if not exists gcash_instructions text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payments',
  'payments',
  true,
  8388608,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Payments public read" on storage.objects;
create policy "Payments public read" on storage.objects
  for select using (bucket_id = 'payments');

drop policy if exists "Payments owner insert" on storage.objects;
create policy "Payments owner insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'payments'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'owner')
  );

drop policy if exists "Payments owner update" on storage.objects;
create policy "Payments owner update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'payments'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'owner')
  );

drop policy if exists "Payments owner delete" on storage.objects;
create policy "Payments owner delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'payments'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'owner')
  );
