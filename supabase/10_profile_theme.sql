-- Trojan SMIF · Public profile theme fields
-- Lets each member pick an accent color and font for their public
-- /m/[username] page. Null = site default. Safe to re-run.

alter table public.members
  add column if not exists theme_color text,
  add column if not exists theme_font  text;
