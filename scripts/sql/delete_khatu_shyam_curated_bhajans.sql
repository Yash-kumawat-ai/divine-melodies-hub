-- Delete the 12 curated Khatu Shyam–style rows from public.user_uploads.
-- Run in Supabase → SQL Editor as a role that bypasses RLS (postgres / dashboard).
-- Run delete_khatu_shyam_curated_bhajans_preview.sql first and confirm the rows.
--
-- Matches:
--   • Same 12 titles (case-insensitive), AND
--   • Nil placeholder user OR deity_id Krishna (1) or Khatu Shyam (9).
-- Seeded rows from 011_seed_khatu_shyam_bhajans.sql use deity_id = 9 and a real admin user_id.
-- If preview returns 0 rows, remove the user_id / deity filters below as needed.

DELETE FROM public.user_uploads u
WHERE LOWER(trim(u.title)) IN (
  'shyam charno mein',
  'adhi raat ko shyam dhani',
  'mujhe khatu bulalo',
  'khatu wale teri mehfil',
  'khatu wale das banale',
  'baba shyam hi shyam',
  'teri khatu nagri mein zindagi bitaunga',
  'tera jadu khatu wale',
  'shyam leele ghode wala',
  'shyam ke jaisa koi lakhdatar',
  'khatu wala mere sath hai',
  'shyam khatu wale'
)
AND (
  u.user_id = '00000000-0000-0000-0000-000000000000'::uuid
  OR u.deity_id IN (1, 9)
);
