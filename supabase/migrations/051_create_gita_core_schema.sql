-- ==============================================================================
-- Migration 051: Create Geeta Gyan Core Scripture Schema (Phase 1)
-- Tables: gita_chapters, gita_verses, gita_sources, gita_translations
-- Platform: Supabase PostgreSQL
-- ==============================================================================

-- 1. Gita Chapters Catalog (18 Chapters)
CREATE TABLE IF NOT EXISTS public.gita_chapters (
  chapter_number INT PRIMARY KEY CHECK (chapter_number BETWEEN 1 AND 18),
  name_sanskrit TEXT NOT NULL,
  name_transliterated TEXT NOT NULL,
  name_translation TEXT NOT NULL,
  name_meaning TEXT NOT NULL,
  verses_count INT NOT NULL CHECK (verses_count > 0),
  summary_hindi TEXT NOT NULL,
  summary_english TEXT NOT NULL,
  image_name TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Gita Canonical Verses (701 Shlokas)
CREATE TABLE IF NOT EXISTS public.gita_verses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_number INT NOT NULL REFERENCES public.gita_chapters(chapter_number) ON DELETE RESTRICT,
  verse_number INT NOT NULL CHECK (verse_number > 0),
  verse_order INT NOT NULL UNIQUE CHECK (verse_order BETWEEN 1 AND 701),
  external_id INT NOT NULL,
  sanskrit TEXT NOT NULL,
  transliteration TEXT NOT NULL,
  word_meanings JSONB NULL,
  word_meanings_raw TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_gita_chapter_verse UNIQUE (chapter_number, verse_number)
);

-- 3. Gita Sources Registry (4 Approved Translators)
CREATE TABLE IF NOT EXISTS public.gita_sources (
  id TEXT PRIMARY KEY,
  author_id INT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  author TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('hindi', 'english')),
  tradition TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('primary', 'secondary')),
  license TEXT NOT NULL,
  attribution TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Gita Translations (2,804 Records: 701 Verses x 4 Sources)
CREATE TABLE IF NOT EXISTS public.gita_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verse_id UUID NOT NULL REFERENCES public.gita_verses(id) ON DELETE CASCADE,
  source_id TEXT NOT NULL REFERENCES public.gita_sources(id) ON DELETE RESTRICT,
  language TEXT NOT NULL CHECK (language IN ('hindi', 'english')),
  translation_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_gita_verse_source UNIQUE (verse_id, source_id)
);

-- 5. Performance Indexes (Redundant unique-constraint indexes removed)
-- Note: (chapter_number, verse_number) is already indexed via uq_gita_chapter_verse
-- Note: verse_order is already indexed via verse_order UNIQUE
CREATE INDEX IF NOT EXISTS idx_gita_verses_chapter ON public.gita_verses(chapter_number);
CREATE INDEX IF NOT EXISTS idx_gita_sources_lang_role ON public.gita_sources(language, role);
CREATE INDEX IF NOT EXISTS idx_gita_translations_verse_lang ON public.gita_translations(verse_id, language);
CREATE INDEX IF NOT EXISTS idx_gita_translations_source ON public.gita_translations(source_id);

-- 6. Row Level Security Configuration
ALTER TABLE public.gita_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gita_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gita_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gita_translations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for gita_chapters" ON public.gita_chapters;
CREATE POLICY "Public read access for gita_chapters"
  ON public.gita_chapters FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access for gita_verses" ON public.gita_verses;
CREATE POLICY "Public read access for gita_verses"
  ON public.gita_verses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access for gita_sources" ON public.gita_sources;
CREATE POLICY "Public read access for gita_sources"
  ON public.gita_sources FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read access for gita_translations" ON public.gita_translations;
CREATE POLICY "Public read access for gita_translations"
  ON public.gita_translations FOR SELECT USING (true);
