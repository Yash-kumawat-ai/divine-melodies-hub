-- ==============================================================================
-- Migration 061: Gita Verse Embeddings Ingestion RPC
-- Purpose: Provide a hardened upsert procedure for the 701 canonical verse
--          embeddings backfill. Restricted strictly to service_role.
-- Platform: Supabase PostgreSQL
-- ==============================================================================

-- Ensure extensions and public are in search path
SET search_path TO public, extensions, pg_temp;

-- ------------------------------------------------------------------------------
-- 1. Idempotent Upsert RPC for Canonical Verse Embeddings
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.upsert_gita_verse_embedding(
  p_verse_id UUID,
  p_chapter_number INT,
  p_verse_number INT,
  p_verse_order INT,
  p_embedding_model TEXT,
  p_semantic_document TEXT,
  p_embedding vector(1536)
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  -- Defensive validation
  IF p_verse_id IS NULL OR p_embedding IS NULL THEN
    RAISE EXCEPTION 'p_verse_id and p_embedding must not be null';
  END IF;

  INSERT INTO public.gita_verse_embeddings (
    verse_id,
    chapter_number,
    verse_number,
    verse_order,
    embedding_model,
    semantic_document,
    embedding,
    updated_at
  )
  VALUES (
    p_verse_id,
    p_chapter_number,
    p_verse_number,
    p_verse_order,
    p_embedding_model,
    p_semantic_document,
    p_embedding,
    timezone('utc'::text, now())
  )
  ON CONFLICT (verse_id, embedding_model)
  DO UPDATE SET
    semantic_document = EXCLUDED.semantic_document,
    embedding = EXCLUDED.embedding,
    updated_at = timezone('utc'::text, now());
END;
$$;

-- ------------------------------------------------------------------------------
-- 2. Restrict Permissions: Strictly service_role (No Public / Anon / Authenticated)
-- ------------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.upsert_gita_verse_embedding(UUID, INT, INT, INT, TEXT, TEXT, vector(1536)) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.upsert_gita_verse_embedding(UUID, INT, INT, INT, TEXT, TEXT, vector(1536)) FROM anon;
REVOKE ALL ON FUNCTION public.upsert_gita_verse_embedding(UUID, INT, INT, INT, TEXT, TEXT, vector(1536)) FROM authenticated;

GRANT EXECUTE ON FUNCTION public.upsert_gita_verse_embedding(UUID, INT, INT, INT, TEXT, TEXT, vector(1536)) 
  TO service_role;
