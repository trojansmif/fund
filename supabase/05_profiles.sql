-- Trojan SMIF · Profiles module
-- Adds editable profile fields to members + avatars storage bucket.
-- Safe to run multiple times.

-- ─────────────────────────── NEW COLUMNS ───────────────────────────
alter table public.members
  add column if not exists avatar_path text,
  add column if not exists bio         text,
  add column if not exists pronouns    text,
  add column if not exists grad_year   text;

-- ─────────────────────────── AVATAR BUCKET ───────────────────────────
-- Public bucket — avatars are not sensitive, lets <img src=...> work
-- without the overhead of minting signed URLs on every page view.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- Members can read any avatar (bucket is public, but RLS still applies).
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
on storage.objects for select
to public
using (bucket_id = 'avatars');

-- Members can upload / replace / delete their own avatar. File name must
-- match their auth uid (we enforce this from the client).
drop policy if exists "avatars_self_write" on storage.objects;
create policy "avatars_self_write"
on storage.objects for all
to authenticated
using (
  bucket_id = 'avatars' and
  (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ─────────────────────────── MEMBER SELF-EDIT POLICY ───────────────────────────
-- Members can update their OWN row (name, bio, linkedin, pronouns, grad
-- year, avatar_path). Admins already have broader update power via
-- separate policies created in the initial schema.
drop policy if exists "members_self_update" on public.members;
create policy "members_self_update" on public.members for update
  to authenticated
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());
