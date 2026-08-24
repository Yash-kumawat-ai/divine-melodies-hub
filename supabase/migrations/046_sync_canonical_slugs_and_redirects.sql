-- ====================================================================
-- MIGRATION 046: HARDENED SEO CANONICAL SLUGS, REDIRECT FLATTENING & GLOBAL NAMESPACE
-- ====================================================================

-- --------------------------------------------------------------------
-- STEP 1: Ensure redirect table & RLS policies exist
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bhajan_slug_redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_slug TEXT NOT NULL UNIQUE,
  to_slug TEXT NOT NULL,
  bhajan_id UUID REFERENCES public.user_uploads(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bhajan_slug_redirects_from_slug 
  ON public.bhajan_slug_redirects(from_slug);

CREATE INDEX IF NOT EXISTS idx_bhajan_slug_redirects_to_slug 
  ON public.bhajan_slug_redirects(to_slug);

ALTER TABLE public.bhajan_slug_redirects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on bhajan_slug_redirects" ON public.bhajan_slug_redirects;
CREATE POLICY "Allow public read on bhajan_slug_redirects" 
  ON public.bhajan_slug_redirects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin write on bhajan_slug_redirects" ON public.bhajan_slug_redirects;
CREATE POLICY "Allow admin write on bhajan_slug_redirects" 
  ON public.bhajan_slug_redirects FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'
    )
  );

-- --------------------------------------------------------------------
-- STEP 2: Function to compute concise canonical slug (<= 50 chars)
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.compute_concise_slug(
  title_input TEXT,
  record_id_input UUID DEFAULT NULL,
  max_len INT DEFAULT 50
)
RETURNS TEXT AS $$
DECLARE
  clean_title TEXT;
  primary_part TEXT;
  ascii_clean TEXT;
  words TEXT[];
  word TEXT;
  result_slug TEXT := '';
  candidate TEXT;
  fallback_id TEXT;
BEGIN
  IF title_input IS NULL OR TRIM(title_input) = '' THEN
    IF record_id_input IS NOT NULL THEN
      RETURN 'bhajan-' || SUBSTRING(REPLACE(record_id_input::text, '-', ''), 1, 8);
    END IF;
    RETURN 'bhajan-' || SUBSTRING(MD5(RANDOM()::text), 1, 8);
  END IF;

  -- A. Strip hashtags
  clean_title := REGEXP_REPLACE(title_input, '#\S+', ' ', 'g');

  -- B. Split on ALL strong delimiters (||, |, //, •, ।, –, —, standalone " I ")
  primary_part := (REGEXP_SPLIT_TO_ARRAY(clean_title, '\s*(?:\|\||\||\/\/|\s+I\s+|•|।|–|—)\s*'))[1];
  IF primary_part IS NULL OR TRIM(primary_part) = '' THEN
    primary_part := clean_title;
  END IF;

  -- C. Split on primary sentence/clause delimiters (. or ;)
  primary_part := (REGEXP_SPLIT_TO_ARRAY(primary_part, '\s*(?:\.\s+|;\s+)\s*'))[1];
  IF primary_part IS NULL OR TRIM(primary_part) = '' THEN
    primary_part := clean_title;
  END IF;

  -- D. Strip controlled noise phrases
  primary_part := REGEXP_REPLACE(
    primary_part, 
    '\m(?:official\s+video|official\s+audio|full\s+video|full\s+audio|with\s+lyrics|lyrics\s+video|lyric\s+video|hd\s+video|hd\s+audio|video\s+song|youtube|4k|8k)\M', 
    ' ', 
    'gi'
  );

  -- E. Keep only ASCII alphanumeric and hyphens (stripping special chars & emojis)
  ascii_clean := LOWER(TRIM(REGEXP_REPLACE(REGEXP_REPLACE(primary_part, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', ' ', 'g')));

  -- F. If no valid ASCII text extracted, use deterministic fallback
  IF ascii_clean IS NULL OR LENGTH(ascii_clean) < 2 OR ascii_clean ~ '^-+$' THEN
    IF record_id_input IS NOT NULL THEN
      RETURN 'bhajan-' || SUBSTRING(REPLACE(record_id_input::text, '-', ''), 1, 8);
    END IF;
    RETURN 'bhajan-' || SUBSTRING(MD5(RANDOM()::text), 1, 8);
  END IF;

  -- G. Tokenize, deduplicate consecutive words, and accumulate within max_len
  words := STRING_TO_ARRAY(ascii_clean, ' ');
  
  FOREACH word IN ARRAY words LOOP
    IF word <> '' THEN
      IF result_slug = '' THEN
        candidate := word;
      ELSE
        candidate := result_slug || '-' || word;
      END IF;

      IF LENGTH(candidate) <= max_len THEN
        result_slug := candidate;
      ELSE
        -- If even the very first word exceeds max_len, fallback to bhajan-<id> instead of broken slicing
        IF result_slug = '' THEN
          IF record_id_input IS NOT NULL THEN
            RETURN 'bhajan-' || SUBSTRING(REPLACE(record_id_input::text, '-', ''), 1, 8);
          END IF;
          RETURN SUBSTRING(word, 1, max_len);
        END IF;
        EXIT;
      END IF;
    END IF;
  END LOOP;

  result_slug := TRIM(BOTH '-' FROM result_slug);
  IF result_slug IS NULL OR result_slug = '' THEN
    IF record_id_input IS NOT NULL THEN
      RETURN 'bhajan-' || SUBSTRING(REPLACE(record_id_input::text, '-', ''), 1, 8);
    END IF;
    RETURN 'bhajan-' || SUBSTRING(MD5(RANDOM()::text), 1, 8);
  END IF;

  RETURN result_slug;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- --------------------------------------------------------------------
-- STEP 3: Execute Global Collision-Safe Migration & Redirect Flattening
-- --------------------------------------------------------------------
DO $$
DECLARE
  -- Static reserved namespace (routes + static catalog bhajans + deities)
  static_reserved TEXT[] := ARRAY[
    'live-aarti', 'all-bhajans', 'aarti-chalisa', 'katha', 'recent-bhajans', 
    'meditation', 'panchang', 'temple', 'shorts', 'wallpaper', 'community', 
    'about', 'privacy', 'terms', 'login', 'signup', 'search', 'admin', 
    'pricing', 'blog', 'support', 'upload-bhajan', 'join-community',
    -- Deities
    'krishna', 'shiva', 'hanuman', 'rama', 'durga', 'ganesh', 'sai-baba', 'lakshmi', 'khatu-shyam',
    -- Static Bhajans
    'hare-krishna-mahamantra', 'om-jai-shiv-omkara', 'hanuman-chalisa', 'raghupati-raghav-raja-ram',
    'jai-ambe-gauri', 'ganesh-aarti', 'sai-baba-aarti', 'om-jai-lakshmi-mata', 'achyutam-keshavam',
    'shiv-tandav-stotram', 'bajrang-baan', 'ram-dhun', 'hum-sab-bolenge-happy-birthday-to-you',
    'bolo-to-sahi-bolo-to-sahi', 'aaja-mere-kanhaiya', 'jhalak-pehle-jaisi-dikhani-padegi',
    'maanga-hai-maine-shyam-se-vardaan', 'hai-dukh-bhanjan-maruti-nandan-sun-lo-meri-pukaar',
    'mujhe-aasra-hai-shyam-khatu-wale', 'sunle-kanhaiyan-arji-hamari', 'agar-kismat-se-ai-mere-shyam-tera-deedar-ho-jaye',
    'shyam-ke-charnon-mein-hardam', 'dildar-kanhaiya-ne-mujhko-apnaya-hai', 'mere-dildar-baba-sun-padi-majhdhar-mein-naiya',
    'baba-tumsa-dayalu-dev-dooja-nahin-hai', 'hare-ke-sahare-aaja-tera-das-pukare-aaja', 'sanwara-jab-mere-sath-hai',
    'dekhu-jidhar-udhar-hi-mere-shyam-ka-najara', 'mere-yaar-bansuri-vale', 'kyun-bhool-gaye-shyama',
    'malik-mharo-sanwariyo', 'bar-bar-main-tumhe-pukarun-sun-lo-lakhdatar'
  ];

  rec RECORD;
  computed_base TEXT;
  candidate_slug TEXT;
  suffix_str TEXT;
  allowed_base_len INT;
  counter INT;
  is_occupied BOOLEAN;
  old_slug TEXT;
BEGIN
  -- 1. Pre-clean any existing self-referencing / corrupt redirects
  DELETE FROM public.bhajan_slug_redirects WHERE from_slug = to_slug;

  -- 2. Loop through user_uploads in deterministic creation order
  FOR rec IN 
    SELECT id, title, slug, status 
    FROM public.user_uploads 
    ORDER BY created_at ASC
  LOOP
    old_slug := rec.slug;
    computed_base := public.compute_concise_slug(rec.title, rec.id, 50);

    -- 3. Collision Resolution across Global Namespace (user_uploads + redirects.from_slug + static_reserved)
    candidate_slug := computed_base;
    counter := 1;

    LOOP
      -- Collision check:
      -- 1. Another row in user_uploads with this slug?
      -- 2. An existing redirect with from_slug = candidate_slug belonging to another bhajan?
      -- 3. In static_reserved array?
      SELECT EXISTS (
        SELECT 1 FROM public.user_uploads 
        WHERE LOWER(TRIM(slug)) = LOWER(TRIM(candidate_slug)) AND id <> rec.id
        UNION ALL
        SELECT 1 FROM public.bhajan_slug_redirects 
        WHERE LOWER(TRIM(from_slug)) = LOWER(TRIM(candidate_slug)) AND (bhajan_id IS NULL OR bhajan_id <> rec.id)
        UNION ALL
        SELECT 1 WHERE LOWER(TRIM(candidate_slug)) = ANY(static_reserved)
      ) INTO is_occupied;

      EXIT WHEN NOT is_occupied;

      -- Suffix calculation guaranteed <= 50 characters:
      counter := counter + 1;
      suffix_str := '-' || counter::text;
      allowed_base_len := 50 - LENGTH(suffix_str);
      
      IF LENGTH(computed_base) > allowed_base_len THEN
        -- Re-compute base bounded to allowed length respecting whole words
        candidate_slug := public.compute_concise_slug(rec.title, rec.id, allowed_base_len) || suffix_str;
      ELSE
        candidate_slug := computed_base || suffix_str;
      END IF;
    END LOOP;

    -- 4. Apply the unique canonical slug
    UPDATE public.user_uploads 
    SET slug = candidate_slug 
    WHERE id = rec.id;

    -- 5. Record Redirect & Flatten Chains if slug changed
    IF old_slug IS NOT NULL AND old_slug <> '' AND old_slug <> candidate_slug THEN
      -- A. Flatten existing historical redirects pointing to old_slug -> point directly to candidate_slug
      UPDATE public.bhajan_slug_redirects 
      SET to_slug = candidate_slug 
      WHERE to_slug = old_slug;

      -- B. Upsert the old_slug -> candidate_slug mapping
      INSERT INTO public.bhajan_slug_redirects (from_slug, to_slug, bhajan_id)
      VALUES (old_slug, candidate_slug, rec.id)
      ON CONFLICT (from_slug) DO UPDATE 
        SET to_slug = EXCLUDED.to_slug,
            bhajan_id = EXCLUDED.bhajan_id;

      -- C. Clean any cycles or obsolete reclaimed from_slug
      DELETE FROM public.bhajan_slug_redirects WHERE from_slug = to_slug;
      DELETE FROM public.bhajan_slug_redirects WHERE from_slug = candidate_slug;
    END IF;

  END LOOP;

END $$;

-- --------------------------------------------------------------------
-- STEP 4: Final verification and Unique Index creation
-- --------------------------------------------------------------------
DROP INDEX IF EXISTS idx_user_uploads_slug;
DROP INDEX IF EXISTS idx_user_uploads_slug_unique;

CREATE UNIQUE INDEX idx_user_uploads_slug_unique 
  ON public.user_uploads (LOWER(TRIM(slug))) 
  WHERE slug IS NOT NULL AND slug <> '';
