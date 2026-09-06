-- ==============================================================================
-- Migration 059: Ask-Gita Production AI Infrastructure
-- Tables: ask_gita_rate_limits, ask_gita_query_log
-- Indexes: GIN Full-Text Search on translations and verses
-- RPCs: check_and_increment_ask_gita_quota, search_gita_verses_fulltext
-- Platform: Supabase PostgreSQL
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Rate Limiting Table (Unified for Authenticated Devotees & Guests)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ask_gita_rate_limits (
  identifier TEXT NOT NULL,                         -- 'user:<uuid>' or 'guest:<session_or_ip>'
  user_id UUID NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_count INT NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_request_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (identifier)
);

CREATE INDEX IF NOT EXISTS idx_ask_gita_rate_limits_window 
  ON public.ask_gita_rate_limits (window_start);

CREATE INDEX IF NOT EXISTS idx_ask_gita_rate_limits_user 
  ON public.ask_gita_rate_limits (user_id)
  WHERE user_id IS NOT NULL;

-- Enable Row Level Security (No direct public read/write; accessed via SECURITY DEFINER RPC or Service Role)
ALTER TABLE public.ask_gita_rate_limits ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 2. Atomic Quota RPC
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_and_increment_ask_gita_quota(
  p_identifier TEXT,
  p_user_id UUID DEFAULT NULL,
  p_max_requests INT DEFAULT 25,
  p_window_minutes INT DEFAULT 60
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_rec RECORD;
  v_now TIMESTAMPTZ := NOW();
  v_window_interval INTERVAL := (p_window_minutes || ' minutes')::INTERVAL;
BEGIN
  SELECT * INTO v_rec FROM public.ask_gita_rate_limits 
  WHERE identifier = p_identifier 
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.ask_gita_rate_limits (identifier, user_id, request_count, window_start, last_request_at)
    VALUES (p_identifier, p_user_id, 1, v_now, v_now);
    
    RETURN jsonb_build_object(
      'allowed', true,
      'remaining', p_max_requests - 1,
      'used', 1,
      'limit', p_max_requests,
      'reset_at', v_now + v_window_interval
    );
  END IF;

  -- Window expired: reset window
  IF v_now - v_rec.window_start >= v_window_interval THEN
    UPDATE public.ask_gita_rate_limits
    SET request_count = 1,
        user_id = COALESCE(p_user_id, v_rec.user_id),
        window_start = v_now,
        last_request_at = v_now
    WHERE identifier = p_identifier;

    RETURN jsonb_build_object(
      'allowed', true,
      'remaining', p_max_requests - 1,
      'used', 1,
      'limit', p_max_requests,
      'reset_at', v_now + v_window_interval
    );
  END IF;

  -- Quota exceeded
  IF v_rec.request_count >= p_max_requests THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'used', v_rec.request_count,
      'limit', p_max_requests,
      'reset_at', v_rec.window_start + v_window_interval,
      'error', 'RATE_LIMIT_EXCEEDED'
    );
  END IF;

  -- Increment quota
  UPDATE public.ask_gita_rate_limits
  SET request_count = request_count + 1,
      user_id = COALESCE(p_user_id, v_rec.user_id),
      last_request_at = v_now
  WHERE identifier = p_identifier;

  RETURN jsonb_build_object(
    'allowed', true,
    'remaining', p_max_requests - (v_rec.request_count + 1),
    'used', v_rec.request_count + 1,
    'limit', p_max_requests,
    'reset_at', v_rec.window_start + v_window_interval
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 3. Telemetry / Query Log Table (Privacy-Conscious)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ask_gita_query_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NULL,
  query_text TEXT NOT NULL,
  detected_lang TEXT NOT NULL DEFAULT 'hi',
  matched_category TEXT NULL REFERENCES public.gita_problem_categories(id) ON DELETE SET NULL,
  matched_verses UUID[] NULL,
  retrieval_method TEXT NOT NULL DEFAULT 'general',  -- 'exact_verse', 'category', 'full_text', 'llm_only'
  response_preview TEXT NULL,
  response_time_ms INT NULL,
  model_used TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_ask_gita_log_created 
  ON public.ask_gita_query_log (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ask_gita_log_user 
  ON public.ask_gita_query_log (user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ask_gita_log_category 
  ON public.ask_gita_query_log (matched_category)
  WHERE matched_category IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.ask_gita_query_log ENABLE ROW LEVEL SECURITY;

-- Devotees can view only their own query history
CREATE POLICY "Users read own ask_gita query logs"
  ON public.ask_gita_query_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 4. Full-Text Search GIN Indexes for Scripture Retrieval
-- ------------------------------------------------------------------------------
-- Simple dictionary treats Devanagari and transliterated Sanskrit as literal tokens without English stem mutilation
CREATE INDEX IF NOT EXISTS idx_gita_translations_fts 
  ON public.gita_translations 
  USING GIN (to_tsvector('simple', translation_text));

CREATE INDEX IF NOT EXISTS idx_gita_verses_sanskrit_fts 
  ON public.gita_verses 
  USING GIN (to_tsvector('simple', sanskrit));

CREATE INDEX IF NOT EXISTS idx_gita_verses_translit_fts 
  ON public.gita_verses 
  USING GIN (to_tsvector('simple', transliteration));

-- ------------------------------------------------------------------------------
-- 5. Full-Text Search Scripture Retrieval RPC
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.search_gita_verses_fulltext(
  p_query TEXT,
  p_language TEXT DEFAULT NULL,
  p_limit INT DEFAULT 5
)
RETURNS TABLE (
  verse_id UUID,
  chapter_number INT,
  verse_number INT,
  verse_order INT,
  sanskrit TEXT,
  transliteration TEXT,
  source_id TEXT,
  language TEXT,
  translation_text TEXT,
  rank REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id AS verse_id,
    v.chapter_number,
    v.verse_number,
    v.verse_order,
    v.sanskrit,
    v.transliteration,
    t.source_id,
    t.language,
    t.translation_text,
    ts_rank(to_tsvector('simple', t.translation_text), plainto_tsquery('simple', p_query)) AS rank
  FROM public.gita_translations t
  JOIN public.gita_verses v ON v.id = t.verse_id
  WHERE 
    to_tsvector('simple', t.translation_text) @@ plainto_tsquery('simple', p_query)
    AND (p_language IS NULL OR LOWER(t.language) = LOWER(p_language))
  ORDER BY rank DESC, v.verse_order ASC
  LIMIT p_limit;
END;
$$;

-- ------------------------------------------------------------------------------
-- 6. Grants
-- ------------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.check_and_increment_ask_gita_quota(TEXT, UUID, INT, INT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.search_gita_verses_fulltext(TEXT, TEXT, INT) TO anon, authenticated, service_role;
GRANT SELECT, INSERT ON public.ask_gita_query_log TO anon, authenticated, service_role;
GRANT ALL ON public.ask_gita_rate_limits TO service_role;

