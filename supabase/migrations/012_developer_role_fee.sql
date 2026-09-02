-- Developer fee tracking: ₱10 per booking, paid separately to the developer.

alter table public.appointments
  add column if not exists developer_fee_paid boolean not null default false;

-- Developer account (admin@glamdcebu.com) — full studio access stays on owner accounts.
update public.profiles
set role = 'developer'
where id in (
  select id from auth.users where lower(email) = 'admin@glamdcebu.com'
);

drop policy if exists appointments_developer_fee_update on public.appointments;
create policy appointments_developer_fee_update on public.appointments
  for update
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'developer')
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'developer')
  );
