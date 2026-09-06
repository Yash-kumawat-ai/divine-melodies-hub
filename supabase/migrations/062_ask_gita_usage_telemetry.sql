-- ==============================================================================
-- Migration 062: Ask-Gita OpenRouter Usage & Telemetry (Privacy-First)
-- Table: public.ask_gita_usage_telemetry
-- Purpose: Records exact token usage, model, and cost without storing private prompts or AI responses.
-- Platform: Supabase PostgreSQL
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.ask_gita_usage_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT NOT NULL,                         -- OpenRouter Generation / Request ID (e.g. gen-...)
  model TEXT NOT NULL,                              -- Model identifier (e.g. google/gemini-2.5-flash)
  prompt_tokens INT NOT NULL DEFAULT 0,             -- Input / prompt tokens
  completion_tokens INT NOT NULL DEFAULT 0,         -- Output / completion tokens
  reasoning_tokens INT NOT NULL DEFAULT 0,          -- Reasoning tokens (if provided)
  total_tokens INT NOT NULL DEFAULT 0,              -- Total tokens
  cost NUMERIC(14, 8) NOT NULL DEFAULT 0.00000000, -- Exact USD cost from OpenRouter
  query_language TEXT NOT NULL DEFAULT 'hi',        -- 'hi' | 'en'
  retrieval_method TEXT NOT NULL,                   -- 'exact_verse', 'hybrid_category', 'low_confidence', etc.
  retrieved_verse_ids UUID[] NULL,                  -- Canonical verse IDs retrieved from database
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for performance, auditing, and time-series analytics
CREATE INDEX IF NOT EXISTS idx_ask_gita_usage_created 
  ON public.ask_gita_usage_telemetry (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ask_gita_usage_request_id 
  ON public.ask_gita_usage_telemetry (request_id);

CREATE INDEX IF NOT EXISTS idx_ask_gita_usage_model 
  ON public.ask_gita_usage_telemetry (model);

-- Enable Row Level Security (RLS)
ALTER TABLE public.ask_gita_usage_telemetry ENABLE ROW LEVEL SECURITY;

-- Telemetry is internal infrastructure data: restricted strictly to service_role
GRANT ALL ON public.ask_gita_usage_telemetry TO service_role;
