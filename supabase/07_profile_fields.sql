-- Trojan SMIF · Extended profile fields
-- Adds school, prior firm, post-grad target, CFA progress, and sectors
-- of interest to the members table. Safe to re-run.

alter table public.members
  add column if not exists undergrad_school text,
  add column if not exists prior_firm       text,
  add column if not exists post_grad_target text,
  add column if not exists cfa_progress     text,
  add column if not exists sectors          text[] default '{}';
