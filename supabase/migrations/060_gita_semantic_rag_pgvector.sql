-- ==============================================================================
-- Migration 060: True Semantic Vector RAG for Bhagavad Gita (701 Verses)
-- Purpose: Enable pgvector, create canonical verse embeddings table,
--          HNSW cosine similarity index, and hardened security RPC.
-- Platform: Supabase PostgreSQL (Idempotent & Production-Safe)
-- ==============================================================================

-- Ensure extensions and public are in search path for the current session
SET search_path TO public, extensions, pg_temp;

-- ------------------------------------------------------------------------------
-- 1. Enable pgvector Extension (Idempotent Schema Check)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
    IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'extensions') THEN
      CREATE EXTENSION vector WITH SCHEMA extensions;
    ELSE
      CREATE EXTENSION vector;
    END IF;
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 2. Canonical Verse Embeddings Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gita_verse_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verse_id UUID NOT NULL REFERENCES public.gita_verses(id) ON DELETE CASCADE,
  chapter_number INT NOT NULL,
  verse_number INT NOT NULL,
  verse_order INT NOT NULL,
  embedding_model TEXT NOT NULL DEFAULT 'openai/text-embedding-3-small',
  semantic_document TEXT NOT NULL,
  embedding vector(1536) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_verse_embedding_model UNIQUE (verse_id, embedding_model)
);

-- B-Tree indexes for fast relational filtering & joins
CREATE INDEX IF NOT EXISTS idx_gita_verse_embeddings_verse_id
  ON public.gita_verse_embeddings (verse_id);

CREATE INDEX IF NOT EXISTS idx_gita_verse_embeddings_ch_v
  ON public.gita_verse_embeddings (chapter_number, verse_number);

-- ------------------------------------------------------------------------------
-- 3. HNSW Vector Index for Cosine Similarity Search
-- Note: m=16 and ef_construction=64 provide balanced recall and index construction
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_gita_verse_embeddings_hnsw
  ON public.gita_verse_embeddings
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- ------------------------------------------------------------------------------
-- 4. Row Level Security (RLS) & Access Control
-- ------------------------------------------------------------------------------
ALTER TABLE public.gita_verse_embeddings ENABLE ROW LEVEL SECURITY;

-- Idempotent policy recreation
DROP POLICY IF EXISTS "Public read access for gita_verse_embeddings" 
  ON public.gita_verse_embeddings;

CREATE POLICY "Public read access for gita_verse_embeddings"
  ON public.gita_verse_embeddings
  FOR SELECT
  USING (true);

-- ------------------------------------------------------------------------------
-- 5. Hardened Semantic Vector Match RPC
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.match_gita_verses_semantic(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.65,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  verse_id UUID,
  chapter_number INT,
  verse_number INT,
  verse_order INT,
  sanskrit TEXT,
  transliteration TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_clamped_threshold FLOAT;
  v_clamped_count INT;
BEGIN
  -- Defensive Guard: Return empty result set if query vector is NULL
  IF query_embedding IS NULL THEN
    RETURN;
  END IF;

  -- Defensive Guard: Clamp parameters to safe boundaries
  v_clamped_threshold := GREATEST(LEAST(COALESCE(match_threshold, 0.65), 1.0), 0.0);
  v_clamped_count := LEAST(GREATEST(COALESCE(match_count, 5), 1), 50);

  RETURN QUERY
  SELECT
    v.id AS verse_id,
    v.chapter_number,
    v.verse_number,
    v.verse_order,
    v.sanskrit,
    v.transliteration,
    (1 - (e.embedding <=> query_embedding))::FLOAT AS similarity
  FROM public.gita_verse_embeddings e
  JOIN public.gita_verses v ON v.id = e.verse_id
  WHERE (1 - (e.embedding <=> query_embedding)) >= v_clamped_threshold
  ORDER BY e.embedding <=> query_embedding ASC
  LIMIT v_clamped_count;
END;
$$;

-- ------------------------------------------------------------------------------
-- 6. Lock Down RPC Permissions
-- ------------------------------------------------------------------------------
-- Revoke default public execution privileges from SECURITY DEFINER function
REVOKE ALL ON FUNCTION public.match_gita_verses_semantic(vector(1536), FLOAT, INT) FROM PUBLIC;

-- Explicitly grant execute only to required Supabase roles
GRANT EXECUTE ON FUNCTION public.match_gita_verses_semantic(vector(1536), FLOAT, INT) 
  TO anon, authenticated, service_role;
