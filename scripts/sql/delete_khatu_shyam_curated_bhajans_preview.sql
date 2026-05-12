-- Preview rows that the delete script will remove. Run before delete_khatu_shyam_curated_bhajans.sql

SELECT id, title, deity_id, user_id, status, created_at
FROM public.user_uploads
WHERE LOWER(trim(title)) IN (
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
  user_id = '00000000-0000-0000-0000-000000000000'::uuid
  OR deity_id IN (1, 9)
);
