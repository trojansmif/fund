-- Trojan SMIF · Announcements
-- Admin-posted messages visible to every Fund member on the dashboard Home
-- tab. Fast broadcast channel that sidesteps email deliverability.
-- Safe to re-run.

create table if not exists public.announcements (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  body       text not null,
  tag        text,
  pinned     boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists announcements_created_idx on public.announcements (created_at desc);

drop trigger if exists announcements_set_updated_at on public.announcements;
create trigger announcements_set_updated_at before update on public.announcements
  for each row execute function public.set_updated_at();

alter table public.announcements enable row level security;

drop policy if exists "announcements_member_read" on public.announcements;
create policy "announcements_member_read" on public.announcements for select
  to authenticated
  using (exists (select 1 from public.members where auth_user_id = auth.uid()));

drop policy if exists "announcements_admin_write" on public.announcements;
create policy "announcements_admin_write" on public.announcements for all
  to authenticated
  using (exists (select 1 from public.members where auth_user_id = auth.uid() and is_admin = true))
  with check (exists (select 1 from public.members where auth_user_id = auth.uid() and is_admin = true));
