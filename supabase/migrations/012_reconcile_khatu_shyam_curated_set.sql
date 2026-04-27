-- Reconcile curated Khatu Shyam Ji metadata for the 12-title scraped set.
-- This migration assumes 011_seed_khatu_shyam_bhajans.sql has already inserted base rows.

DO $$
DECLARE
  updated_count INTEGER := 0;
  missing_count INTEGER := 0;
BEGIN
  WITH seed_rows(title, title_hindi, singer_name, composer_name) AS (
    VALUES
      ('Shyam Charno Mein', 'Shyam Charno Mein', 'Unknown', 'Traditional'),
      ('Adhi Raat Ko Shyam Dhani', 'Adhi Raat Ko Shyam Dhani', 'Parveen Jangra', 'Traditional'),
      ('Mujhe Khatu Bulalo', 'Mujhe Khatu Bulalo', 'Unknown', 'Traditional'),
      ('Khatu Wale Teri Mehfil', 'Khatu Wale Teri Mehfil', 'Deepak Sharma', 'Traditional'),
      ('Khatu Wale Das Banale', 'Khatu Wale Das Banale', 'Deepak Sharma', 'Traditional'),
      ('Baba Shyam Hi Shyam', 'Baba Shyam Hi Shyam', 'Deepak Sharma', 'Traditional'),
      ('Teri Khatu Nagri Mein Zindagi Bitaunga', 'Teri Khatu Nagri Mein Zindagi Bitaunga', 'Sanjeev', 'Traditional'),
      ('Tera Jadu Khatu Wale', 'Tera Jadu Khatu Wale', 'Unknown', 'Traditional'),
      ('Shyam Leele Ghode Wala', 'Shyam Leele Ghode Wala', 'Deepak Sharma', 'Traditional'),
      ('Shyam Ke Jaisa Koi Lakhdatar', 'Shyam Ke Jaisa Koi Lakhdatar', 'Gagandeep', 'Traditional'),
      ('Khatu Wala Mere Sath Hai', 'Khatu Wala Mere Sath Hai', 'Unknown', 'Traditional'),
      ('Shyam Khatu Wale', 'Shyam Khatu Wale', 'Unknown', 'Traditional')
  )
  UPDATE public.user_uploads uu
  SET
    deity_id = 9,
    title_hindi = sr.title_hindi,
    singer_name = sr.singer_name,
    composer_name = sr.composer_name,
    status = CASE
      WHEN uu.status IS NULL OR uu.status IN ('pending', 'resubmitted') THEN 'approved'
      ELSE uu.status
    END,
    language = COALESCE(NULLIF(uu.language, ''), 'Hindi')
  FROM seed_rows sr
  WHERE LOWER(uu.title) = LOWER(sr.title)
    AND uu.deity_id IN (1, 9);

  GET DIAGNOSTICS updated_count = ROW_COUNT;

  WITH seed_rows(title) AS (
    VALUES
      ('Shyam Charno Mein'),
      ('Adhi Raat Ko Shyam Dhani'),
      ('Mujhe Khatu Bulalo'),
      ('Khatu Wale Teri Mehfil'),
      ('Khatu Wale Das Banale'),
      ('Baba Shyam Hi Shyam'),
      ('Teri Khatu Nagri Mein Zindagi Bitaunga'),
      ('Tera Jadu Khatu Wale'),
      ('Shyam Leele Ghode Wala'),
      ('Shyam Ke Jaisa Koi Lakhdatar'),
      ('Khatu Wala Mere Sath Hai'),
      ('Shyam Khatu Wale')
  )
  SELECT COUNT(*)
  INTO missing_count
  FROM seed_rows sr
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.user_uploads uu
    WHERE uu.deity_id = 9
      AND LOWER(uu.title) = LOWER(sr.title)
  );

  RAISE NOTICE 'Khatu reconciliation updated % rows; % titles still missing (run migration 011 if > 0).', updated_count, missing_count;
END
$$;
