-- ==============================================================================
-- Migration 048: Hardened Job Failure Reconciliation, Safe Retry & Lease Recovery
-- Platform: Supabase PostgreSQL
-- ==============================================================================

-- 1. Reconcile astrology_profiles status based on total expected job set
CREATE OR REPLACE FUNCTION public.reconcile_astrology_profile_from_jobs(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_fp TEXT;
  v_status TEXT;
  v_core BOOLEAN;
  v_accuracy TEXT;
  v_expected_jobs TEXT[];
  v_total_expected INT;
  v_has_active BOOLEAN;
  v_completed_count INT;
  v_failed_count INT;
BEGIN
  IF p_user_id IS NULL THEN
    RETURN;
  END IF;

  -- 1. Lock and inspect current astrology_profiles state
  SELECT status, core_ready, input_fingerprint
  INTO v_status, v_core, v_fp
  FROM public.astrology_profiles
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- If already ready, do not modify
  IF v_status = 'ready' THEN
    RETURN;
  END IF;

  -- 2. Determine expected job set from birth accuracy
  SELECT birth_time_accuracy INTO v_accuracy
  FROM public.astrology_birth_profiles
  WHERE user_id = p_user_id;

  IF v_accuracy = 'unknown' THEN
    v_expected_jobs := ARRAY['all_planet_data'];
  ELSE
    v_expected_jobs := ARRAY['all_planet_data', 'all_house_rasi_signs', 'dasa_at_range', 'horoscope_predictions'];
  END IF;

  v_total_expected := array_length(v_expected_jobs, 1);

  -- 3. Check for any active (queued or leased) jobs for this fingerprint
  SELECT EXISTS (
    SELECT 1
    FROM public.vedastro_jobs j
    WHERE j.user_id = p_user_id
      AND j.input_fingerprint = v_fp
      AND j.status IN ('queued', 'leased')
  ) INTO v_has_active;

  -- If work is still actively in progress, do not reconcile yet
  IF v_has_active THEN
    RETURN;
  END IF;

  -- 4. Count completed and failed jobs for this fingerprint against expected set
  SELECT 
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*) FILTER (WHERE status = 'failed')
  INTO v_completed_count, v_failed_count
  FROM public.vedastro_jobs j
  WHERE j.user_id = p_user_id
    AND j.input_fingerprint = v_fp
    AND j.job_type = ANY(v_expected_jobs);

  -- 5. Explicit Expected Job Invariant:
  IF v_completed_count = v_total_expected THEN
    -- All expected jobs succeeded
    UPDATE public.astrology_profiles
    SET status = 'ready',
        last_error_code = NULL,
        updated_at = NOW()
    WHERE user_id = p_user_id
      AND status <> 'ready';

  ELSIF v_completed_count > 0 THEN
    -- Partial Kundli is intentionally usable: NEVER downgrade to 'failed'
    UPDATE public.astrology_profiles
    SET status = 'partial',
        last_error_code = CASE WHEN v_failed_count > 0 THEN 'secondary_jobs_failed' ELSE last_error_code END,
        updated_at = NOW()
    WHERE user_id = p_user_id
      AND status IN ('pending', 'generating');

  ELSIF v_failed_count > 0 THEN
    -- Zero completed jobs and all active work exhausted: mark failed
    UPDATE public.astrology_profiles
    SET status = 'failed',
        last_error_code = 'vedastro_jobs_failed',
        updated_at = NOW()
    WHERE user_id = p_user_id
      AND status IN ('pending', 'generating');
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.reconcile_astrology_profile_from_jobs(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reconcile_astrology_profile_from_jobs(UUID) TO service_role;

-- 2. Hardened Lease RPC with Independent Stale Lease Recovery & Reconciliation
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
  v_failed_user UUID;
BEGIN
  -- 1. Always recover abandoned/orphaned leases (INDEPENDENT of rate limit barrier)
  UPDATE public.vedastro_jobs
  SET status = CASE WHEN attempts >= max_attempts THEN 'failed' ELSE 'queued' END,
      lease_until = NULL,
      last_error = CASE
        WHEN attempts >= max_attempts THEN 'Max attempts exceeded after lease timeout'
        ELSE last_error
      END,
      updated_at = v_now
  WHERE status = 'leased'
    AND lease_until < v_now;

  -- 2. Reconcile any pending profiles that have failed jobs and zero active jobs (no arbitrary time window)
  FOR v_failed_user IN
    SELECT DISTINCT j.user_id
    FROM public.vedastro_jobs j
    JOIN public.astrology_profiles p ON p.user_id = j.user_id AND p.input_fingerprint = j.input_fingerprint
    WHERE j.status = 'failed'
      AND p.status IN ('pending', 'generating')
  LOOP
    PERFORM public.reconcile_astrology_profile_from_jobs(v_failed_user);
  END LOOP;

  -- 3. Check Global Rate Limit Barrier
  SELECT last_dispatched_at, min_interval_seconds
  INTO v_last_dispatched, v_min_interval
  FROM public.vedastro_rate_limit
  WHERE id = 1
  FOR UPDATE;

  -- If required interval has not elapsed, exit cleanly without leasing
  IF (v_now < v_last_dispatched + (v_min_interval * INTERVAL '1 second')) THEN
    RETURN;
  END IF;

  -- 4. Atomically lease next eligible candidate (strictly attempts < max_attempts)
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

  -- 5. If a job was leased, record dispatch timestamp
  IF FOUND THEN
    UPDATE public.vedastro_rate_limit
    SET last_dispatched_at = v_now,
        updated_at = v_now
    WHERE id = 1;
  END IF;
END;
$$;

-- 3. Drop legacy overloads and create hardened save_and_enqueue_birth_profile with intelligent retry
DROP FUNCTION IF EXISTS public.save_and_enqueue_birth_profile(DATE, TIME WITHOUT TIME ZONE, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, DOUBLE PRECISION, DOUBLE PRECISION, TEXT, TEXT, TEXT, UUID);
DROP FUNCTION IF EXISTS public.save_and_enqueue_birth_profile(DATE, TIME WITHOUT TIME ZONE, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, DOUBLE PRECISION, DOUBLE PRECISION, TEXT, TEXT, TEXT, UUID, BOOLEAN);

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
  p_user_id UUID DEFAULT NULL,
  p_force_reenqueue BOOLEAN DEFAULT FALSE
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
  v_should_enqueue BOOLEAN;
  v_already_completed BOOLEAN;
BEGIN
  -- Security check
  IF (auth.jwt() ->> 'role' = 'service_role') THEN
    v_effective_user_id := COALESCE(p_user_id, auth.uid());
  ELSE
    v_effective_user_id := auth.uid();
  END IF;

  IF v_effective_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Valid user session required';
  END IF;

  -- Defensive Parameter Validation
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

  -- 1. Determine calculation plan and profile completeness
  IF p_birth_time_accuracy = 'unknown' THEN
    v_enqueued_job_types := ARRAY['all_planet_data'];
    v_completeness := 'limited';
  ELSE
    v_enqueued_job_types := ARRAY['all_planet_data', 'all_house_rasi_signs', 'dasa_at_range', 'horoscope_predictions'];
    v_completeness := 'full';
  END IF;

  -- 2. Get existing profile fingerprint
  SELECT input_fingerprint INTO v_existing_fingerprint
  FROM public.astrology_birth_profiles
  WHERE user_id = v_effective_user_id;

  -- 3. Upsert birth profile record
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

  -- 4. Check if enqueue is required
  v_should_enqueue := (
    v_existing_fingerprint IS NULL
    OR v_existing_fingerprint <> p_input_fingerprint
    OR COALESCE(p_force_reenqueue, FALSE)
  );

  IF v_should_enqueue THEN
    -- Cancel active jobs to avoid stale workers
    UPDATE public.vedastro_jobs
    SET status = 'cancelled',
        updated_at = NOW()
    WHERE user_id = v_effective_user_id
      AND status IN ('queued', 'leased');

    -- Initialize or reset profile status
    IF (v_existing_fingerprint IS NULL OR v_existing_fingerprint <> p_input_fingerprint) THEN
      -- Fresh fingerprint: full reset
      INSERT INTO public.astrology_profiles (
        user_id, status, profile_completeness, planets_ready, houses_ready, core_ready, dasha_ready, predictions_ready,
        last_error_code, input_fingerprint, updated_at
      ) VALUES (
        v_effective_user_id, 'pending', v_completeness, FALSE, FALSE, FALSE, FALSE, FALSE,
        NULL, p_input_fingerprint, NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        status = 'pending',
        profile_completeness = v_completeness,
        planets_ready = FALSE,
        houses_ready = FALSE,
        core_ready = FALSE,
        dasha_ready = FALSE,
        predictions_ready = FALSE,
        last_error_code = NULL,
        core_chart = NULL,
        dasha = NULL,
        predictions = NULL,
        input_fingerprint = EXCLUDED.input_fingerprint,
        updated_at = NOW();
    ELSE
      -- Same fingerprint retry: reset status to pending without wiping already completed datasets
      UPDATE public.astrology_profiles
      SET status = 'pending',
          last_error_code = NULL,
          updated_at = NOW()
      WHERE user_id = v_effective_user_id;
    END IF;

    -- Enqueue required jobs
    IF v_enqueued_job_types IS NOT NULL AND array_length(v_enqueued_job_types, 1) > 0 THEN
      FOREACH v_job_type IN ARRAY v_enqueued_job_types
      LOOP
        -- For same-fingerprint retry, check if this specific job already completed successfully
        IF (v_existing_fingerprint = p_input_fingerprint AND p_force_reenqueue = TRUE) THEN
          SELECT EXISTS (
            SELECT 1 FROM public.vedastro_jobs
            WHERE user_id = v_effective_user_id
              AND input_fingerprint = p_input_fingerprint
              AND job_type = v_job_type
              AND status = 'completed'
          ) INTO v_already_completed;
        ELSE
          v_already_completed := FALSE;
        END IF;

        -- If not completed, insert fresh queued job
        IF NOT v_already_completed THEN
          INSERT INTO public.vedastro_jobs (
            user_id, job_type, status, attempts, input_fingerprint, run_after, last_error, lease_until, updated_at
          ) VALUES (
            v_effective_user_id, v_job_type, 'queued', 0, p_input_fingerprint, NOW(), NULL, NULL, NOW()
          );
        END IF;
      END LOOP;
    END IF;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.save_and_enqueue_birth_profile(DATE, TIME WITHOUT TIME ZONE, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, DOUBLE PRECISION, DOUBLE PRECISION, TEXT, TEXT, TEXT, UUID, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_and_enqueue_birth_profile(DATE, TIME WITHOUT TIME ZONE, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, DOUBLE PRECISION, DOUBLE PRECISION, TEXT, TEXT, TEXT, UUID, BOOLEAN) TO authenticated, service_role;

-- 4. Enable Supabase Realtime WebSocket push for astrology_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'astrology_profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.astrology_profiles;
  END IF;
END $$;
