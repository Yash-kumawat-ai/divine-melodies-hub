-- ==============================================================================
-- Migration 047: Ask Guru Ji MVP Schema, Hardened RLS, and Database RPCs
-- Platform: Supabase PostgreSQL
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. User Birth Profiles (1:1 with auth.users)
CREATE TABLE IF NOT EXISTS public.astrology_birth_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  date_of_birth DATE NOT NULL,
  birth_time TIME WITHOUT TIME ZONE NULL,
  birth_time_accuracy TEXT NOT NULL CHECK (birth_time_accuracy IN ('exact', 'approximate', 'unknown')),
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other', 'unspecified')),
  place_query TEXT NOT NULL,
  place_label TEXT NOT NULL,
  country_code TEXT NOT NULL DEFAULT 'IN',
  admin1 TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  timezone_iana TEXT NOT NULL,
  utc_offset_at_birth TEXT NOT NULL,
  input_fingerprint TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.astrology_birth_profiles ENABLE ROW LEVEL SECURITY;

-- Security Hardening: Client SELECT only. Direct client INSERT/UPDATE/DELETE is strictly disallowed.
-- All writes must go through the authenticated save_and_enqueue_birth_profile RPC or service role.
DROP POLICY IF EXISTS "Users read own birth profile" ON public.astrology_birth_profiles;
CREATE POLICY "Users read own birth profile"
  ON public.astrology_birth_profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert/update own birth profile" ON public.astrology_birth_profiles;

-- 3. Structured Astrology Profiles (JSONB Store with profile_completeness)
CREATE TABLE IF NOT EXISTS public.astrology_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'generating', 'partial', 'ready', 'failed')),
  profile_completeness TEXT NOT NULL DEFAULT 'full' CHECK (profile_completeness IN ('full', 'limited')),
  planets_ready BOOLEAN NOT NULL DEFAULT FALSE,
  houses_ready BOOLEAN NOT NULL DEFAULT FALSE,
  core_ready BOOLEAN NOT NULL DEFAULT FALSE,
  dasha_ready BOOLEAN NOT NULL DEFAULT FALSE,
  predictions_ready BOOLEAN NOT NULL DEFAULT FALSE,
  schema_version INT NOT NULL DEFAULT 1,
  ayanamsa TEXT NOT NULL DEFAULT 'Lahiri',
  core_chart JSONB NULL,       -- Lagna, Grahas (sign, degree, house, nakshatra)
  dasha JSONB NULL,            -- Mahadasha, Antardasha
  predictions JSONB NULL,      -- Filtered topic predictions
  raw_snapshots JSONB NULL,    -- Compact debug snapshot
  input_fingerprint TEXT NOT NULL,
  calculated_at TIMESTAMPTZ NULL,
  generation_lock_until TIMESTAMPTZ NULL,
  last_error_code TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.astrology_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own astrology profile" ON public.astrology_profiles;
CREATE POLICY "Users read own astrology profile"
  ON public.astrology_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- 4. Visual Presentation Data (Isolated from Structured Data)
CREATE TABLE IF NOT EXISTS public.astrology_chart_visuals (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  chart_svg TEXT NULL,
  chart_style TEXT NOT NULL DEFAULT 'north_indian',
  input_fingerprint TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.astrology_chart_visuals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own chart visuals" ON public.astrology_chart_visuals;
CREATE POLICY "Users read own chart visuals"
  ON public.astrology_chart_visuals FOR SELECT
  USING (auth.uid() = user_id);

-- 5. Global Rate-Limit Barrier Singleton (15-Second Pacing)
CREATE TABLE IF NOT EXISTS public.vedastro_rate_limit (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  last_dispatched_at TIMESTAMPTZ NOT NULL DEFAULT '1970-01-01 00:00:00+00',
  min_interval_seconds INT NOT NULL DEFAULT 15, -- 15s interval = max 4 req/min for free 5 req/min tier
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.vedastro_rate_limit (id, min_interval_seconds) 
VALUES (1, 15)
ON CONFLICT (id) DO UPDATE SET min_interval_seconds = EXCLUDED.min_interval_seconds;

-- 6. Serialized VedAstro Job Queue
CREATE TABLE IF NOT EXISTS public.vedastro_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'leased', 'completed', 'failed', 'cancelled')),
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 4,
  run_after TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lease_until TIMESTAMPTZ NULL,
  last_error TEXT NULL,
  input_fingerprint TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_vedastro_jobs_active_unique 
  ON public.vedastro_jobs (user_id, job_type) 
  WHERE status IN ('queued', 'leased');

CREATE INDEX IF NOT EXISTS idx_vedastro_jobs_pickup 
  ON public.vedastro_jobs (status, run_after) 
  WHERE status = 'queued';

ALTER TABLE public.vedastro_jobs ENABLE ROW LEVEL SECURITY;

-- 7. Ask Guru Ji Conversations (Enforcing Composite Unique Key)
CREATE TABLE IF NOT EXISTS public.guruji_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Conversation with Guru Ji',
  topic TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_guruji_conversations_id_user UNIQUE (id, user_id)
);

ALTER TABLE public.guruji_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own conversations" ON public.guruji_conversations;
CREATE POLICY "Users read own conversations"
  ON public.guruji_conversations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users create own conversations" ON public.guruji_conversations;
CREATE POLICY "Users create own conversations"
  ON public.guruji_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own conversations" ON public.guruji_conversations;
CREATE POLICY "Users delete own conversations"
  ON public.guruji_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- 8. Ask Guru Ji Messages (Strict Composite Foreign Key + RLS Role Protection)
CREATE TABLE IF NOT EXISTS public.guruji_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  topic TEXT NOT NULL DEFAULT 'general',
  context_keys JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_guruji_messages_conversation_owner 
    FOREIGN KEY (conversation_id, user_id) 
    REFERENCES public.guruji_conversations(id, user_id) 
    ON DELETE CASCADE
);

ALTER TABLE public.guruji_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own messages" ON public.guruji_messages;
CREATE POLICY "Users read own messages"
  ON public.guruji_messages FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert user role messages only" ON public.guruji_messages;
CREATE POLICY "Users insert user role messages only"
  ON public.guruji_messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND role = 'user'
    AND EXISTS (
      SELECT 1 FROM public.guruji_conversations c 
      WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  );

-- ==============================================================================
-- 9. Hardened Database Functions (SECURITY DEFINER + search_path Protection)
-- ==============================================================================

-- 9.1 Atomic Birth Profile Upsert, Cancellation & Enqueueing (100% Server-Controlled Job Plan)
CREATE OR REPLACE FUNCTION public.save_and_enqueue_birth_profile(
  p_date_of_birth DATE,
  p_birth_time TIME WITHOUT TIME ZONE,
  p_birth_time_accuracy TEXT,
  p_gender TEXT,
  p_place_query TEXT,
  p_place_label TEXT,
  p_country_code TEXT,
  p_admin1 TEXT,
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_timezone_iana TEXT,
  p_utc_offset_at_birth TEXT,
  p_input_fingerprint TEXT,
  p_user_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_effective_user_id UUID;
  v_existing_fingerprint TEXT;
  v_enqueued_job_types TEXT[];
  v_job_type TEXT;
  v_completeness TEXT;
BEGIN
  -- Security: verify auth.uid() unless invoked by service role
  IF (auth.jwt() ->> 'role' = 'service_role') THEN
    v_effective_user_id := COALESCE(p_user_id, auth.uid());
  ELSE
    v_effective_user_id := auth.uid();
  END IF;

  IF v_effective_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Valid user session required';
  END IF;

  -- 0. Defensive Parameter Validation
  IF p_birth_time_accuracy NOT IN ('exact', 'approximate', 'unknown') THEN
    RAISE EXCEPTION 'Invalid birth_time_accuracy: must be exact, approximate, or unknown';
  END IF;

  IF p_gender NOT IN ('male', 'female', 'other', 'unspecified') THEN
    RAISE EXCEPTION 'Invalid gender: must be male, female, other, or unspecified';
  END IF;

  IF p_date_of_birth IS NULL THEN
    RAISE EXCEPTION 'Missing date_of_birth';
  END IF;

  IF p_birth_time_accuracy IN ('exact', 'approximate') AND p_birth_time IS NULL THEN
    RAISE EXCEPTION 'birth_time is required when birth_time_accuracy is exact or approximate';
  END IF;

  IF p_lat IS NULL OR p_lng IS NULL OR p_lat < -90 OR p_lat > 90 OR p_lng < -180 OR p_lng > 180 THEN
    RAISE EXCEPTION 'Invalid geographical coordinates: lat [-90, 90], lng [-180, 180]';
  END IF;

  IF p_timezone_iana IS NULL OR TRIM(p_timezone_iana) = '' THEN
    RAISE EXCEPTION 'Missing timezone_iana';
  END IF;

  IF p_input_fingerprint IS NULL OR TRIM(p_input_fingerprint) = '' THEN
    RAISE EXCEPTION 'Missing input_fingerprint';
  END IF;

  -- 1. Server 100% Determines the Calculation Job Plan & Profile Completeness
  IF p_birth_time_accuracy = 'unknown' THEN
    v_enqueued_job_types := ARRAY['all_planet_data'];
    v_completeness := 'limited';
  ELSE
    v_enqueued_job_types := ARRAY['all_planet_data', 'all_house_rasi_signs', 'dasa_at_range', 'horoscope_predictions'];
    v_completeness := 'full';
  END IF;

  -- 2. Check existing fingerprint
  SELECT input_fingerprint INTO v_existing_fingerprint
  FROM public.astrology_birth_profiles
  WHERE user_id = v_effective_user_id;

  -- 3. Upsert the birth profile
  INSERT INTO public.astrology_birth_profiles (
    user_id, date_of_birth, birth_time, birth_time_accuracy,
    gender, place_query, place_label, country_code, admin1,
    lat, lng, timezone_iana, utc_offset_at_birth, input_fingerprint,
    updated_at
  ) VALUES (
    v_effective_user_id, p_date_of_birth, p_birth_time, p_birth_time_accuracy,
    p_gender, p_place_query, p_place_label, p_country_code, p_admin1,
    p_lat, p_lng, p_timezone_iana, p_utc_offset_at_birth, p_input_fingerprint,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    date_of_birth = EXCLUDED.date_of_birth,
    birth_time = EXCLUDED.birth_time,
    birth_time_accuracy = EXCLUDED.birth_time_accuracy,
    gender = EXCLUDED.gender,
    place_query = EXCLUDED.place_query,
    place_label = EXCLUDED.place_label,
    country_code = EXCLUDED.country_code,
    admin1 = EXCLUDED.admin1,
    lat = EXCLUDED.lat,
    lng = EXCLUDED.lng,
    timezone_iana = EXCLUDED.timezone_iana,
    utc_offset_at_birth = EXCLUDED.utc_offset_at_birth,
    input_fingerprint = EXCLUDED.input_fingerprint,
    updated_at = NOW();

  -- 4. If fingerprint changed or profile is new, atomically cancel obsolete jobs and enqueue new ones
  IF (v_existing_fingerprint IS NULL OR v_existing_fingerprint <> p_input_fingerprint) THEN
    -- Cancel obsolete uncompleted jobs
    UPDATE public.vedastro_jobs
    SET status = 'cancelled',
        updated_at = NOW()
    WHERE user_id = v_effective_user_id
      AND status IN ('queued', 'leased');

    -- Reset or initialize astrology_profiles status
    INSERT INTO public.astrology_profiles (
      user_id, status, profile_completeness, planets_ready, houses_ready, core_ready, dasha_ready, predictions_ready,
      input_fingerprint, updated_at
    ) VALUES (
      v_effective_user_id, 'pending', v_completeness, FALSE, FALSE, FALSE, FALSE, FALSE,
      p_input_fingerprint, NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      status = 'pending',
      profile_completeness = v_completeness,
      planets_ready = FALSE,
      houses_ready = FALSE,
      core_ready = FALSE,
      dasha_ready = FALSE,
      predictions_ready = FALSE,
      input_fingerprint = EXCLUDED.input_fingerprint,
      updated_at = NOW();

    -- Enqueue new server-determined jobs
    IF v_enqueued_job_types IS NOT NULL AND array_length(v_enqueued_job_types, 1) > 0 THEN
      FOREACH v_job_type IN ARRAY v_enqueued_job_types
      LOOP
        INSERT INTO public.vedastro_jobs (
          user_id, job_type, status, input_fingerprint, run_after, updated_at
        ) VALUES (
          v_effective_user_id, v_job_type, 'queued', p_input_fingerprint, NOW(), NOW()
        )
        ON CONFLICT DO NOTHING;
      END LOOP;
    END IF;
  END IF;
END;
$$;

-- 9.2 Hardened Atomic Job Leasing RPC (Enforcing attempts < max_attempts)
CREATE OR REPLACE FUNCTION public.lease_next_vedastro_job(
  p_lease_duration_seconds INT DEFAULT 120
)
RETURNS TABLE (
  job_id UUID,
  user_id UUID,
  job_type TEXT,
  input_fingerprint TEXT,
  attempts INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_last_dispatched TIMESTAMPTZ;
  v_min_interval INT;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  -- 1. Check Global Rate Limit Barrier
  SELECT last_dispatched_at, min_interval_seconds 
  INTO v_last_dispatched, v_min_interval
  FROM public.vedastro_rate_limit
  WHERE id = 1
  FOR UPDATE;

  -- If the required 15s interval has not elapsed, do not lease
  IF (v_now < v_last_dispatched + (v_min_interval * INTERVAL '1 second')) THEN
    RETURN; -- Exit immediately; next worker loop iteration or cron tick will pick it up
  END IF;

  -- 2. Recover abandoned/orphaned leases and enforce max_attempts failure
  UPDATE public.vedastro_jobs
  SET status = CASE WHEN attempts >= max_attempts THEN 'failed' ELSE 'queued' END,
      lease_until = NULL,
      last_error = CASE WHEN attempts >= max_attempts THEN 'Max attempts exceeded after lease timeout' ELSE last_error END,
      updated_at = v_now
  WHERE status = 'leased'
    AND lease_until < v_now;

  -- 3. Atomically lease the next eligible queued job (strictly attempts < max_attempts)
  RETURN QUERY
  WITH next_candidate AS (
    SELECT id
    FROM public.vedastro_jobs
    WHERE status = 'queued'
      AND run_after <= v_now
      AND attempts < max_attempts
    ORDER BY run_after ASC, created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  )
  UPDATE public.vedastro_jobs j
  SET status = 'leased',
      lease_until = v_now + (p_lease_duration_seconds * INTERVAL '1 second'),
      attempts = j.attempts + 1,
      updated_at = v_now
  FROM next_candidate c
  WHERE j.id = c.id
  RETURNING j.id, j.user_id, j.job_type, j.input_fingerprint, j.attempts;

  -- 4. If a job was successfully leased, update the global rate limit timestamp
  IF FOUND THEN
    UPDATE public.vedastro_rate_limit
    SET last_dispatched_at = v_now,
        updated_at = v_now
    WHERE id = 1;
  END IF;
END;
$$;

-- 9.3 Hardened Result Persistence RPC with Profile Completeness & Readiness Semantics
CREATE OR REPLACE FUNCTION public.persist_vedastro_job_result(
  p_job_id UUID,
  p_user_id UUID,
  p_input_fingerprint TEXT,
  p_job_type TEXT,
  p_result_payload JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_job RECORD;
  v_profile RECORD;
  v_birth_accuracy TEXT;
  v_new_planets_ready BOOLEAN;
  v_new_houses_ready BOOLEAN;
  v_new_core_ready BOOLEAN;
  v_new_dasha_ready BOOLEAN;
  v_new_predictions_ready BOOLEAN;
  v_new_status TEXT;
  v_completeness TEXT;
BEGIN
  -- 1. Find and verify the leased job
  SELECT id, user_id, job_type, input_fingerprint, status
  INTO v_job
  FROM public.vedastro_jobs
  WHERE id = p_job_id
    AND user_id = p_user_id
    AND job_type = p_job_type
    AND input_fingerprint = p_input_fingerprint
    AND status = 'leased'
  FOR UPDATE;

  IF NOT FOUND THEN
    -- Job is no longer leased, was cancelled, or fingerprint mismatched
    RETURN jsonb_build_object('success', false, 'reason', 'job_not_leased_or_mismatched');
  END IF;

  -- 2. Verify current astrology_profiles fingerprint
  SELECT input_fingerprint, planets_ready, houses_ready, core_ready, dasha_ready, predictions_ready, status
  INTO v_profile
  FROM public.astrology_profiles
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF (v_profile.input_fingerprint IS NULL OR v_profile.input_fingerprint <> p_input_fingerprint) THEN
    -- Profile changed while job was in flight; mark job cancelled and discard stale payload
    UPDATE public.vedastro_jobs
    SET status = 'cancelled',
        updated_at = NOW()
    WHERE id = p_job_id;

    RETURN jsonb_build_object('success', false, 'reason', 'stale_profile_fingerprint');
  END IF;

  -- 3. Fetch birth_time_accuracy for precise readiness and completeness semantics
  SELECT birth_time_accuracy INTO v_birth_accuracy
  FROM public.astrology_birth_profiles
  WHERE user_id = p_user_id;

  -- Compute readiness flags
  v_new_planets_ready := v_profile.planets_ready OR (p_job_type IN ('all_planet_data', 'core'));
  v_new_houses_ready := v_profile.houses_ready OR (p_job_type = 'all_house_rasi_signs');
  v_new_dasha_ready := v_profile.dasha_ready OR (p_job_type IN ('dasa_at_range', 'dasha'));
  v_new_predictions_ready := v_profile.predictions_ready OR (p_job_type IN ('horoscope_predictions', 'predictions'));

  -- Explicit Readiness & Completeness Semantics:
  IF v_birth_accuracy = 'unknown' THEN
    v_completeness := 'limited';
    v_new_core_ready := v_new_planets_ready;
    v_new_status := CASE WHEN v_new_planets_ready THEN 'ready' ELSE 'partial' END;
  ELSE
    v_completeness := 'full';
    v_new_core_ready := (v_new_planets_ready AND v_new_houses_ready);
    v_new_status := CASE 
      WHEN v_new_core_ready AND v_new_dasha_ready AND v_new_predictions_ready THEN 'ready'
      WHEN v_new_planets_ready OR v_new_houses_ready THEN 'partial'
      ELSE v_profile.status
    END;
  END IF;

  -- 4. Atomically update astrology_profiles
  UPDATE public.astrology_profiles
  SET 
    core_chart = CASE WHEN p_job_type IN ('core', 'all_planet_data', 'all_house_rasi_signs') THEN 
      COALESCE(core_chart, '{}'::jsonb) || p_result_payload 
      ELSE core_chart 
    END,
    profile_completeness = v_completeness,
    planets_ready = v_new_planets_ready,
    houses_ready = v_new_houses_ready,
    core_ready = v_new_core_ready,
    dasha = CASE WHEN p_job_type IN ('dasha', 'dasa_at_range') THEN p_result_payload ELSE dasha END,
    dasha_ready = v_new_dasha_ready,
    predictions = CASE WHEN p_job_type IN ('predictions', 'horoscope_predictions') THEN p_result_payload ELSE predictions END,
    predictions_ready = v_new_predictions_ready,
    status = v_new_status,
    calculated_at = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id
    AND input_fingerprint = p_input_fingerprint;

  -- 5. Mark job completed ONLY AFTER successful profile persistence
  UPDATE public.vedastro_jobs
  SET status = 'completed',
      updated_at = NOW()
  WHERE id = p_job_id;

  RETURN jsonb_build_object(
    'success', true, 
    'status', v_new_status, 
    'profile_completeness', v_completeness, 
    'core_ready', v_new_core_ready
  );
END;
$$;

-- ==============================================================================
-- 10. Explicit Security Permissions (REVOKE from PUBLIC / GRANT to Specific Roles)
-- ==============================================================================

-- 10.1 save_and_enqueue_birth_profile: Accessible by authenticated users & service role
REVOKE ALL ON FUNCTION public.save_and_enqueue_birth_profile(DATE, TIME WITHOUT TIME ZONE, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, DOUBLE PRECISION, DOUBLE PRECISION, TEXT, TEXT, TEXT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_and_enqueue_birth_profile(DATE, TIME WITHOUT TIME ZONE, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, DOUBLE PRECISION, DOUBLE PRECISION, TEXT, TEXT, TEXT, UUID) TO authenticated, service_role;

-- 10.2 lease_next_vedastro_job: Strictly worker-only -> service_role
REVOKE ALL ON FUNCTION public.lease_next_vedastro_job(INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lease_next_vedastro_job(INT) TO service_role;

-- 10.3 persist_vedastro_job_result: Strictly worker-only -> service_role
REVOKE ALL ON FUNCTION public.persist_vedastro_job_result(UUID, UUID, TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.persist_vedastro_job_result(UUID, UUID, TEXT, TEXT, JSONB) TO service_role;

-- ==============================================================================
-- 11. Clean 1-Minute pg_cron Schedule for VedAstro Worker (Zero DB Sleep)
-- ==============================================================================
DO $$
BEGIN
  PERFORM cron.unschedule('process-vedastro-queue-tick');
  PERFORM cron.unschedule('process-vedastro-queue-tick-00');
  PERFORM cron.unschedule('process-vedastro-queue-tick-30');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

SELECT cron.schedule(
  'process-vedastro-queue-tick',
  '* * * * *',
  $$
  SELECT net.http_post(
    url:='https://khnqyhzlrxwmolyevaqo.supabase.co/functions/v1/process-vedastro-job',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1)
    ),
    body:='{}'::jsonb
  );
  $$
);
