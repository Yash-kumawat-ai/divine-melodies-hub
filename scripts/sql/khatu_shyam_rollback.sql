-- Rollback only the curated metadata changes for 12 Khatu Shyam titles.
-- This script does NOT delete rows by default; it safely reverts metadata fields.
-- Use the hard-delete section only if explicitly required.

DO $$
BEGIN
  UPDATE public.user_uploads u
  SET
    singer_name = 'Unknown',
    composer_name = 'Traditional',
    title_hindi = u.title,
    language = COALESCE(NULLIF(u.language, ''), 'Hindi')
  WHERE u.deity_id = 9
    AND LOWER(u.title) IN (
      LOWER('Shyam Charno Mein'),
      LOWER('Adhi Raat Ko Shyam Dhani'),
      LOWER('Mujhe Khatu Bulalo'),
      LOWER('Khatu Wale Teri Mehfil'),
      LOWER('Khatu Wale Das Banale'),
      LOWER('Baba Shyam Hi Shyam'),
      LOWER('Teri Khatu Nagri Mein Zindagi Bitaunga'),
      LOWER('Tera Jadu Khatu Wale'),
      LOWER('Shyam Leele Ghode Wala'),
      LOWER('Shyam Ke Jaisa Koi Lakhdatar'),
      LOWER('Khatu Wala Mere Sath Hai'),
      LOWER('Shyam Khatu Wale')
    );

  RAISE NOTICE 'Khatu metadata rollback completed for curated 12-title set.';
END
$$;

-- Optional hard delete (disabled by default):
-- DELETE FROM public.user_uploads
-- WHERE deity_id = 9
--   AND LOWER(title) IN (
--     LOWER('Shyam Charno Mein'),
--     LOWER('Adhi Raat Ko Shyam Dhani'),
--     LOWER('Mujhe Khatu Bulalo'),
--     LOWER('Khatu Wale Teri Mehfil'),
--     LOWER('Khatu Wale Das Banale'),
--     LOWER('Baba Shyam Hi Shyam'),
--     LOWER('Teri Khatu Nagri Mein Zindagi Bitaunga'),
--     LOWER('Tera Jadu Khatu Wale'),
--     LOWER('Shyam Leele Ghode Wala'),
--     LOWER('Shyam Ke Jaisa Koi Lakhdatar'),
--     LOWER('Khatu Wala Mere Sath Hai'),
--     LOWER('Shyam Khatu Wale')
--   );
