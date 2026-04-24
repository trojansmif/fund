-- Trojan SMIF · Profile skills + certifications
-- Two text[] arrays so members can list skills (Python, DCF, Excel, etc.)
-- and certifications (CFA I, BIWS, WSP, etc.). Safe to re-run.

alter table public.members
  add column if not exists skills         text[] default '{}',
  add column if not exists certifications text[] default '{}';
