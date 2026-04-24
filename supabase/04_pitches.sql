-- Trojan SMIF · Pitch submission + Investment Committee voting
-- Paste into Supabase → SQL Editor → Run (safe to run multiple times)

-- ─────────────────────────── PITCHES TABLE ───────────────────────────
create table if not exists public.pitches (
  id                       uuid primary key default gen_random_uuid(),
  submitted_by_member_id   uuid references public.members(id) on delete set null,
  ticker                   text not null,
  company                  text not null,
  recommendation           text not null check (recommendation in ('BUY','HOLD','SELL')),
  entry_price              numeric,
  target_price             numeric,
  upside_pct               numeric,
  thesis                   text not null,
  catalysts                text,
  risks                    text,
  status                   text not null default 'PITCHED'
                             check (status in ('PITCHED','APPROVED','DENIED','VETOED','WITHDRAWN')),
  faculty_veto_reason      text,
  decided_at               timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index if not exists pitches_status_idx on public.pitches (status);
create index if not exists pitches_submitter_idx on public.pitches (submitted_by_member_id);
create index if not exists pitches_created_idx on public.pitches (created_at desc);

drop trigger if exists pitches_set_updated_at on public.pitches;
create trigger pitches_set_updated_at before update on public.pitches
  for each row execute function public.set_updated_at();

-- ─────────────────────────── VOTES TABLE ───────────────────────────
create table if not exists public.pitch_votes (
  id               uuid primary key default gen_random_uuid(),
  pitch_id         uuid not null references public.pitches(id) on delete cascade,
  voter_member_id  uuid not null references public.members(id) on delete cascade,
  decision         text not null check (decision in ('APPROVE','DENY','VETO')),
  note             text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (pitch_id, voter_member_id)
);

create index if not exists pitch_votes_pitch_idx on public.pitch_votes (pitch_id);
create index if not exists pitch_votes_voter_idx on public.pitch_votes (voter_member_id);

drop trigger if exists pitch_votes_set_updated_at on public.pitch_votes;
create trigger pitch_votes_set_updated_at before update on public.pitch_votes
  for each row execute function public.set_updated_at();

-- ─────────────────────────── STATUS RECOMPUTE ───────────────────────────
-- Rules (applied after every vote insert/update/delete):
--   Any Faculty Advisor VETO → status = 'VETOED' (overrides everything)
--   Else ≥3 Executive Committee APPROVE → 'APPROVED'
--   Else ≥3 Executive Committee DENY    → 'DENIED'
--   Else                                 → 'PITCHED'
-- Withdrawn pitches are left alone.

create or replace function public.recompute_pitch_status()
returns trigger language plpgsql security definer as $$
declare
  target_pitch_id uuid := coalesce(new.pitch_id, old.pitch_id);
  veto_count      integer;
  approve_count   integer;
  deny_count      integer;
  current_status  text;
begin
  select status into current_status from public.pitches where id = target_pitch_id;
  if current_status = 'WITHDRAWN' then
    return coalesce(new, old);
  end if;

  select count(*) into veto_count
  from public.pitch_votes pv
  join public.members m on m.id = pv.voter_member_id
  where pv.pitch_id = target_pitch_id
    and pv.decision = 'VETO'
    and m.team = 'Faculty Advisors';

  if veto_count > 0 then
    update public.pitches
    set status = 'VETOED',
        decided_at = coalesce(decided_at, now())
    where id = target_pitch_id;
    return coalesce(new, old);
  end if;

  select count(*) into approve_count
  from public.pitch_votes pv
  join public.members m on m.id = pv.voter_member_id
  where pv.pitch_id = target_pitch_id
    and pv.decision = 'APPROVE'
    and m.team = 'Executive Committee';

  select count(*) into deny_count
  from public.pitch_votes pv
  join public.members m on m.id = pv.voter_member_id
  where pv.pitch_id = target_pitch_id
    and pv.decision = 'DENY'
    and m.team = 'Executive Committee';

  if approve_count >= 3 then
    update public.pitches set status = 'APPROVED', decided_at = now() where id = target_pitch_id;
  elsif deny_count >= 3 then
    update public.pitches set status = 'DENIED', decided_at = now() where id = target_pitch_id;
  else
    update public.pitches
    set status = 'PITCHED', decided_at = null
    where id = target_pitch_id
      and status in ('PITCHED', 'APPROVED', 'DENIED'); -- don't undo VETO
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists recompute_pitch_status_trg on public.pitch_votes;
create trigger recompute_pitch_status_trg
after insert or update or delete on public.pitch_votes
for each row execute function public.recompute_pitch_status();

-- ─────────────────────────── ROW LEVEL SECURITY ───────────────────────────
alter table public.pitches enable row level security;
alter table public.pitch_votes enable row level security;

-- Pitches: any authenticated Fund member can read
drop policy if exists "pitches_member_read" on public.pitches;
create policy "pitches_member_read" on public.pitches for select
  to authenticated
  using (exists (select 1 from public.members where auth_user_id = auth.uid()));

-- Pitches: members insert their own pitch rows
drop policy if exists "pitches_member_insert" on public.pitches;
create policy "pitches_member_insert" on public.pitches for insert
  to authenticated
  with check (
    submitted_by_member_id in (
      select id from public.members where auth_user_id = auth.uid()
    )
  );

-- Pitches: submitter can update/withdraw their own pitch; admins can update any
drop policy if exists "pitches_owner_update" on public.pitches;
create policy "pitches_owner_update" on public.pitches for update
  to authenticated
  using (
    submitted_by_member_id in (select id from public.members where auth_user_id = auth.uid())
    or exists (select 1 from public.members where auth_user_id = auth.uid() and is_admin = true)
  );

drop policy if exists "pitches_owner_delete" on public.pitches;
create policy "pitches_owner_delete" on public.pitches for delete
  to authenticated
  using (
    submitted_by_member_id in (select id from public.members where auth_user_id = auth.uid())
    or exists (select 1 from public.members where auth_user_id = auth.uid() and is_admin = true)
  );

-- Votes: members read all (transparency); only Exec Committee + Faculty can vote
drop policy if exists "pitch_votes_member_read" on public.pitch_votes;
create policy "pitch_votes_member_read" on public.pitch_votes for select
  to authenticated
  using (exists (select 1 from public.members where auth_user_id = auth.uid()));

drop policy if exists "pitch_votes_ic_write" on public.pitch_votes;
create policy "pitch_votes_ic_write" on public.pitch_votes for all
  to authenticated
  using (
    voter_member_id in (
      select id from public.members
      where auth_user_id = auth.uid()
        and team in ('Executive Committee', 'Faculty Advisors')
    )
  )
  with check (
    voter_member_id in (
      select id from public.members
      where auth_user_id = auth.uid()
        and team in ('Executive Committee', 'Faculty Advisors')
    )
    and (
      decision in ('APPROVE','DENY')
      or (
        decision = 'VETO'
        and exists (
          select 1 from public.members
          where id = voter_member_id and team = 'Faculty Advisors'
        )
      )
    )
  );
