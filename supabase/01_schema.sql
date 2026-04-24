-- Trojan SMIF · Core schema
-- Paste into Supabase → SQL Editor → New query → Run.
-- Safe to run multiple times (uses IF NOT EXISTS / CREATE OR REPLACE).

-- ─────────────────────────── MEMBERS TABLE ───────────────────────────

create table if not exists public.members (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid unique references auth.users(id) on delete set null,
  username      text unique not null,
  full_name     text not null,
  team          text not null,
  role          text not null,
  linkedin_url  text,
  is_admin      boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.members is 'Trojan SMIF member roster. One row per person; auth_user_id links to Supabase Auth when the member signs up.';
comment on column public.members.username is 'Auto-generated, immutable. Format: firstname.lastname with .2/.3 suffix on collision.';
comment on column public.members.is_admin is 'Grants read/write access to sensitive fund data. Set manually for Exec Committee.';

create index if not exists members_team_idx on public.members (team);
create index if not exists members_auth_user_idx on public.members (auth_user_id);

-- Auto-update updated_at on any row change
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists members_set_updated_at on public.members;
create trigger members_set_updated_at
  before update on public.members
  for each row execute function public.set_updated_at();

-- ─────────────────────────── ROW LEVEL SECURITY ───────────────────────────

alter table public.members enable row level security;

-- Anyone (authenticated or not) can read the public roster: name, team, role,
-- linkedin_url, username. No sensitive columns exist on this table today, so
-- we allow SELECT to the anon role.
drop policy if exists "members_public_read" on public.members;
create policy "members_public_read" on public.members
  for select
  using (true);

-- A member can update ONLY their own row, and only allowed columns.
-- Enforced at the DB layer via RLS: WITH CHECK restricts updates to rows
-- where auth_user_id matches the current JWT's user.
drop policy if exists "members_self_update" on public.members;
create policy "members_self_update" on public.members
  for update
  using (auth.uid() = auth_user_id)
  with check (auth.uid() = auth_user_id);

-- Admins can update any row (used for assigning auth_user_id on first login,
-- changing roles, etc.). Requires is_admin=true on the caller's member row.
drop policy if exists "members_admin_update" on public.members;
create policy "members_admin_update" on public.members
  for update
  using (
    exists (
      select 1 from public.members as m
      where m.auth_user_id = auth.uid() and m.is_admin = true
    )
  );

-- Only the service_role (server-side) can INSERT rows — the seed script and
-- admin scripts. No policy for "anon" or "authenticated" INSERT.
drop policy if exists "members_admin_insert" on public.members;
create policy "members_admin_insert" on public.members
  for insert
  with check (
    exists (
      select 1 from public.members as m
      where m.auth_user_id = auth.uid() and m.is_admin = true
    )
  );

-- No DELETE policy → no one can delete from client. Service role (admin API)
-- can always delete since it bypasses RLS.

-- Lock down the updatable columns for self-update.
-- Members can only change `linkedin_url`. Everything else (role, team,
-- is_admin) is managed by admins.
create or replace function public.guard_member_self_update()
returns trigger language plpgsql as $$
begin
  -- Trusted contexts (service role / SQL Editor) have no user JWT → full access.
  if auth.uid() is null then return new; end if;
  -- Admin user → full access.
  if (select m.is_admin from public.members m where m.auth_user_id = auth.uid()) then
    return new;
  end if;
  if new.username     is distinct from old.username     then raise exception 'username is immutable'; end if;
  if new.full_name    is distinct from old.full_name    then raise exception 'full_name can only be changed by an admin'; end if;
  if new.team         is distinct from old.team         then raise exception 'team can only be changed by an admin'; end if;
  if new.role         is distinct from old.role         then raise exception 'role can only be changed by an admin'; end if;
  if new.is_admin     is distinct from old.is_admin     then raise exception 'is_admin can only be changed by an admin'; end if;
  if new.auth_user_id is distinct from old.auth_user_id then raise exception 'auth_user_id cannot be changed'; end if;
  return new;
end;
$$;

drop trigger if exists members_self_update_guard on public.members;
create trigger members_self_update_guard
  before update on public.members
  for each row execute function public.guard_member_self_update();

-- ─────────────────────────── USC EMAIL GATE ───────────────────────────
-- Reject any signup whose email isn't from an approved USC domain.

create or replace function public.enforce_usc_email()
returns trigger language plpgsql as $$
declare
  lowered text := lower(new.email);
  on_roster boolean;
begin
  -- 1. Marshall domain gate
  if lowered not like '%@marshall.usc.edu' then
    raise exception 'Only USC Marshall emails can register for Trojan SMIF.';
  end if;

  -- 2. SMIF roster gate — email must already exist on public.members
  select exists (select 1 from public.members where lower(email) = lowered)
  into on_roster;

  if not on_roster then
    raise exception 'This email is not on the Trojan SMIF roster. Contact a Fund admin to be added.';
  end if;

  return new;
end;
$$;

drop trigger if exists reject_non_usc_signups on auth.users;
create trigger reject_non_usc_signups
  before insert on auth.users
  for each row execute function public.enforce_usc_email();

-- ─────────────────────────── ATTACH AUTH → MEMBER ROW ───────────────────────────
-- When a member signs in for the first time, link their auth.users row to the
-- existing members row by matching `{username}@usc.edu` to their email.

create or replace function public.attach_auth_to_member()
returns trigger language plpgsql security definer as $$
declare
  local_part text := lower(split_part(new.email, '@', 1));
begin
  update public.members
  set auth_user_id = new.id
  where username = local_part
    and auth_user_id is null;
  return new;
end;
$$;

drop trigger if exists attach_auth_to_member_trg on auth.users;
create trigger attach_auth_to_member_trg
  after insert on auth.users
  for each row execute function public.attach_auth_to_member();
