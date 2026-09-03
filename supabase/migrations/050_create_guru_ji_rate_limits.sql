-- ==============================================================================
-- Migration 050: Guru Ji Consultation Rate Limiting & Abuse Prevention
-- Platform: Supabase PostgreSQL
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.guru_ji_rate_limits (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_count INT NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_request_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id)
);

CREATE INDEX IF NOT EXISTS idx_guru_ji_rate_limits_window 
  ON public.guru_ji_rate_limits (window_start);

ALTER TABLE public.guru_ji_rate_limits ENABLE ROW LEVEL SECURITY;

-- Server-side RPC to check and increment quota (Default: max 25 requests per hour)
CREATE OR REPLACE FUNCTION public.check_and_increment_guru_ji_quota(
  p_user_id UUID,
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
  SELECT * INTO v_rec FROM public.guru_ji_rate_limits WHERE user_id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.guru_ji_rate_limits (user_id, request_count, window_start, last_request_at)
    VALUES (p_user_id, 1, v_now, v_now);
    RETURN jsonb_build_object('allowed', true, 'remaining', p_max_requests - 1, 'reset_at', v_now + v_window_interval);
  END IF;

  -- If window expired, reset window
  IF v_now - v_rec.window_start >= v_window_interval THEN
    UPDATE public.guru_ji_rate_limits
    SET request_count = 1,
        window_start = v_now,
        last_request_at = v_now
    WHERE user_id = p_user_id;
    RETURN jsonb_build_object('allowed', true, 'remaining', p_max_requests - 1, 'reset_at', v_now + v_window_interval);
  END IF;

  -- Check if limit exceeded
  IF v_rec.request_count >= p_max_requests THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'reset_at', v_rec.window_start + v_window_interval,
      'error', 'RATE_LIMIT_EXCEEDED'
    );
  END IF;

  -- Increment count
  UPDATE public.guru_ji_rate_limits
  SET request_count = request_count + 1,
      last_request_at = v_now
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'allowed', true,
    'remaining', p_max_requests - (v_rec.request_count + 1),
    'reset_at', v_rec.window_start + v_window_interval
  );
END;
$$;
