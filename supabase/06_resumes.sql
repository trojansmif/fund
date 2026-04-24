-- Trojan SMIF · Resume upload support
-- Adds a `resume_path` column + private `resumes` storage bucket so each
-- member can upload one PDF resume. Signed URLs only — not public like
-- avatars. Safe to re-run.

alter table public.members
  add column if not exists resume_path text;

-- Private bucket. Downloads go through short-lived signed URLs.
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do update set public = false;

-- A member can upload / replace / delete ONLY their own resume (folder
-- name equals their auth uid).
drop policy if exists "resumes_self_write" on storage.objects;
create policy "resumes_self_write"
on storage.objects for all
to authenticated
using (
  bucket_id = 'resumes' and
  (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'resumes' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Member can read their own resume; admins can read any.
drop policy if exists "resumes_self_read" on storage.objects;
create policy "resumes_self_read"
on storage.objects for select
to authenticated
using (
  bucket_id = 'resumes' and (
    (storage.foldername(name))[1] = auth.uid()::text
    or exists (
      select 1 from public.members m
      where m.auth_user_id = auth.uid() and m.is_admin = true
    )
  )
);
