-- ====================================================================
-- MIGRATION 045: SEO SLUGS, REDIRECTS & COLLISION-SAFE BACKFILL
-- ====================================================================

-- 1. Add SEO columns to user_uploads if not present
ALTER TABLE public.user_uploads 
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS search_aliases TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS lyrics_transliteration TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- 2. Create the bhajan_slug_redirects table for permanent redirect management
CREATE TABLE IF NOT EXISTS public.bhajan_slug_redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_slug TEXT NOT NULL UNIQUE,
  to_slug TEXT NOT NULL,
  bhajan_id UUID REFERENCES public.user_uploads(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for instant O(1) lookup on incoming requests
CREATE INDEX IF NOT EXISTS idx_bhajan_slug_redirects_from_slug 
  ON public.bhajan_slug_redirects(from_slug);

-- 3. Strict Row Level Security (RLS)
ALTER TABLE public.bhajan_slug_redirects ENABLE ROW LEVEL SECURITY;

-- Allow public read access (essential for web clients, bots, and crawlers)
DROP POLICY IF EXISTS "Allow public read on bhajan_slug_redirects" ON public.bhajan_slug_redirects;
CREATE POLICY "Allow public read on bhajan_slug_redirects" 
  ON public.bhajan_slug_redirects FOR SELECT USING (true);

-- Restrict write/update/delete strictly to verified ADMINS
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

-- 4. Collision-Safe Sequential Allocation Loop in PostgreSQL
DO $$ 
DECLARE
  rec RECORD;
  base_slug TEXT;
  candidate_slug TEXT;
  counter INT;
  is_occupied BOOLEAN;
BEGIN
  -- Process any rows that need slug generation
  FOR rec IN 
    SELECT id, title, slug 
    FROM public.user_uploads 
    WHERE (slug IS NULL OR slug = '' OR slug ~ '^-+$')
    ORDER BY created_at ASC
  LOOP
    -- A. Extract clean ASCII slug from title if valid (at least 3 alphanumeric chars)
    base_slug := TRIM(BOTH '-' FROM LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          TRIM(SPLIT_PART(SPLIT_PART(COALESCE(rec.title, ''), '||', 1), '|', 1)),
          '[^a-zA-Z0-9\s-]', '', 'g'
        ),
        '\s+', '-', 'g'
      )
    ));

    -- B. If no valid ASCII title, fallback to stable bhajan-ID
    IF base_slug IS NULL OR LENGTH(base_slug) < 3 OR base_slug ~ '^-+$' THEN
      base_slug := 'bhajan-' || SUBSTRING(rec.id::text, 1, 8);
    END IF;

    -- C. Sequential Collision Resolution
    candidate_slug := base_slug;
    counter := 1;

    LOOP
      SELECT EXISTS (
        SELECT 1 FROM public.user_uploads 
        WHERE slug = candidate_slug AND id <> rec.id
      ) INTO is_occupied;

      EXIT WHEN NOT is_occupied;

      counter := counter + 1;
      candidate_slug := base_slug || '-' || counter;
    END LOOP;

    -- D. Assign the verified unique slug
    UPDATE public.user_uploads 
    SET slug = candidate_slug 
    WHERE id = rec.id;
  END LOOP;
END $$;

-- 5. Create UNIQUE index on slug (guarantees DB-level atomic race protection)
CREATE UNIQUE INDEX IF NOT EXISTS user_uploads_slug_unique_idx 
  ON public.user_uploads(slug) 
  WHERE slug IS NOT NULL;
