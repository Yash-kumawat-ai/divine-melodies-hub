-- ==============================================================================
-- Migration 055: Create Gita Problem Categories Schema (Phase 2B)
-- Tables: gita_problem_categories, gita_category_verses, gita_category_guidance
-- Platform: Supabase PostgreSQL
-- ==============================================================================

-- 1. Problem Categories Catalog (15 Curated Categories)
CREATE TABLE IF NOT EXISTS public.gita_problem_categories (
  id TEXT PRIMARY KEY,
  title_hindi TEXT NOT NULL,
  title_english TEXT NOT NULL,
  icon_name TEXT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Category-to-Verse Junction Table (Deterministic 1..3 order)
CREATE TABLE IF NOT EXISTS public.gita_category_verses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id TEXT NOT NULL REFERENCES public.gita_problem_categories(id) ON DELETE CASCADE,
  verse_id UUID NOT NULL REFERENCES public.gita_verses(id) ON DELETE CASCADE,
  sort_order INT NOT NULL CHECK (sort_order BETWEEN 1 AND 3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_cat_verse UNIQUE (category_id, verse_id),
  CONSTRAINT uq_cat_sort UNIQUE (category_id, sort_order)
);

-- 3. Curated Guidance Text Table
CREATE TABLE IF NOT EXISTS public.gita_category_guidance (
  category_id TEXT PRIMARY KEY REFERENCES public.gita_problem_categories(id) ON DELETE CASCADE,
  guidance_hindi TEXT NOT NULL,
  guidance_english TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Row Level Security & Public Read Policies
ALTER TABLE public.gita_problem_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gita_category_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gita_category_guidance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active categories" ON public.gita_problem_categories;
CREATE POLICY "Public read active categories" 
  ON public.gita_problem_categories FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read category verses" ON public.gita_category_verses;
CREATE POLICY "Public read category verses" 
  ON public.gita_category_verses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read category guidance" ON public.gita_category_guidance;
CREATE POLICY "Public read category guidance" 
  ON public.gita_category_guidance FOR SELECT USING (true);

-- Indexes for fast UI joins
CREATE INDEX IF NOT EXISTS idx_gita_category_verses_cat_sort 
  ON public.gita_category_verses(category_id, sort_order ASC);
