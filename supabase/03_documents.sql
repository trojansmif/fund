-- Trojan SMIF · Documents module
-- Paste once into Supabase SQL Editor → Run.
-- Creates the `fund-docs` Storage bucket, the `documents` metadata table,
-- and the RLS policies so only admins can upload and only Fund members
-- can download.

-- ─────────────────────────── STORAGE BUCKET ───────────────────────────
-- Private bucket — reads go through signed URLs generated server-side.
insert into storage.buckets (id, name, public)
values ('fund-docs', 'fund-docs', false)
on conflict (id) do nothing;

-- Storage object policies
-- Only admins can upload / update / delete
drop policy if exists "fund_docs_admin_write" on storage.objects;
create policy "fund_docs_admin_write"
on storage.objects for all
to authenticated
using (
  bucket_id = 'fund-docs' and
  exists (
    select 1 from public.members m
    where m.auth_user_id = auth.uid() and m.is_admin = true
  )
)
with check (
  bucket_id = 'fund-docs' and
  exists (
    select 1 from public.members m
    where m.auth_user_id = auth.uid() and m.is_admin = true
  )
);

-- Any authenticated Fund member can read
drop policy if exists "fund_docs_member_read" on storage.objects;
create policy "fund_docs_member_read"
on storage.objects for select
to authenticated
using (
  bucket_id = 'fund-docs' and
  exists (
    select 1 from public.members m
    where m.auth_user_id = auth.uid()
  )
);

-- ─────────────────────────── DOCUMENTS METADATA ───────────────────────────
create table if not exists public.documents (
  id            uuid primary key default gen_random_uuid(),
  storage_path  text unique not null,
  display_name  text not null,
  description   text,
  mime_type     text,
  size_bytes    bigint,
  uploaded_by   uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now()
);

create index if not exists documents_created_idx on public.documents (created_at desc);

alter table public.documents enable row level security;

-- Fund members can read the catalog
drop policy if exists "documents_member_read" on public.documents;
create policy "documents_member_read" on public.documents for select
  to authenticated
  using (
    exists (select 1 from public.members m where m.auth_user_id = auth.uid())
  );

-- Only admins can insert / update / delete metadata
drop policy if exists "documents_admin_write" on public.documents;
create policy "documents_admin_write" on public.documents for all
  to authenticated
  using (
    exists (select 1 from public.members m where m.auth_user_id = auth.uid() and m.is_admin = true)
  )
  with check (
    exists (select 1 from public.members m where m.auth_user_id = auth.uid() and m.is_admin = true)
  );

-- ─────────────────────────── BROADCAST AUDIT LOG ───────────────────────────
create table if not exists public.document_sends (
  id              uuid primary key default gen_random_uuid(),
  document_id     uuid references public.documents(id) on delete cascade,
  sent_by         uuid references auth.users(id) on delete set null,
  channel         text not null check (channel in ('email', 'whatsapp')),
  audience        text not null,          -- 'all' | 'team:<team>' | 'members:<id1,id2,...>'
  recipient_count integer not null default 0,
  message_note    text,
  succeeded       integer not null default 0,
  failed          integer not null default 0,
  error_detail    text,
  created_at      timestamptz not null default now()
);

create index if not exists document_sends_created_idx on public.document_sends (created_at desc);

alter table public.document_sends enable row level security;

drop policy if exists "sends_admin_read" on public.document_sends;
create policy "sends_admin_read" on public.document_sends for select
  to authenticated
  using (
    exists (select 1 from public.members m where m.auth_user_id = auth.uid() and m.is_admin = true)
  );

drop policy if exists "sends_admin_write" on public.document_sends;
create policy "sends_admin_write" on public.document_sends for all
  to authenticated
  using (
    exists (select 1 from public.members m where m.auth_user_id = auth.uid() and m.is_admin = true)
  )
  with check (
    exists (select 1 from public.members m where m.auth_user_id = auth.uid() and m.is_admin = true)
  );
