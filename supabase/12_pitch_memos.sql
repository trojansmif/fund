-- Trojan SMIF · Pitch memo attachments + research repository flag
-- Adds a `memo_path` column for uploaded memo/media, and a `share_to_research`
-- flag so submitters can broadcast their pitch to the public Research tab.
-- Also creates a public `pitch-memos` storage bucket. Safe to re-run.

alter table public.pitches
  add column if not exists memo_path        text,
  add column if not exists memo_filename    text,
  add column if not exists share_to_research boolean not null default false;

-- Public bucket — members may want to link their memo from the Research page.
insert into storage.buckets (id, name, public)
values ('pitch-memos', 'pitch-memos', true)
on conflict (id) do update set public = true;

-- A member can upload / replace / delete ONLY their own memos
-- (folder name equals their auth uid).
drop policy if exists "pitch_memos_self_write" on storage.objects;
create policy "pitch_memos_self_write"
on storage.objects for all
to authenticated
using (
  bucket_id = 'pitch-memos' and
  (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'pitch-memos' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Public read (matches bucket flag; explicit policy makes intent clear).
drop policy if exists "pitch_memos_public_read" on storage.objects;
create policy "pitch_memos_public_read"
on storage.objects for select
to public
using (bucket_id = 'pitch-memos');
