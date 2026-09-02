-- Work photos shown on the public homepage carousel.

create table if not exists public.work_photos (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  public_url text not null,
  alt text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.work_photos enable row level security;

drop policy if exists work_photos_public_read on public.work_photos;
create policy work_photos_public_read on public.work_photos
  for select using (true);

drop policy if exists work_photos_owner_all on public.work_photos;
create policy work_photos_owner_all on public.work_photos
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'owner')
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'work',
  'work',
  true,
  8388608,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Work photos public read" on storage.objects;
create policy "Work photos public read" on storage.objects
  for select using (bucket_id = 'work');

drop policy if exists "Work photos owner insert" on storage.objects;
create policy "Work photos owner insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'work'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'owner')
  );

drop policy if exists "Work photos owner update" on storage.objects;
create policy "Work photos owner update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'work'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'owner')
  );

drop policy if exists "Work photos owner delete" on storage.objects;
create policy "Work photos owner delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'work'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'owner')
  );
