-- Trojan SMIF · Meetings / calendar
-- Admin-managed upcoming meetings. Any Fund member can read; only admins
-- can create / edit / delete. Safe to re-run.

create table if not exists public.meetings (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  starts_at    timestamptz not null,
  ends_at      timestamptz,
  location     text,
  meeting_url  text,
  access_code  text,
  kind         text,
  created_by   uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists meetings_starts_at_idx on public.meetings (starts_at);

drop trigger if exists meetings_set_updated_at on public.meetings;
create trigger meetings_set_updated_at before update on public.meetings
  for each row execute function public.set_updated_at();

alter table public.meetings enable row level security;

drop policy if exists "meetings_member_read" on public.meetings;
create policy "meetings_member_read" on public.meetings for select
  to authenticated
  using (exists (select 1 from public.members where auth_user_id = auth.uid()));

drop policy if exists "meetings_admin_write" on public.meetings;
create policy "meetings_admin_write" on public.meetings for all
  to authenticated
  using (exists (select 1 from public.members where auth_user_id = auth.uid() and is_admin = true))
  with check (exists (select 1 from public.members where auth_user_id = auth.uid() and is_admin = true));
