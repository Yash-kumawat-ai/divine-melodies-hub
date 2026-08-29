-- ==============================================================================
-- Migration 049: Decoupled Astrology Engine Queue, Neutral Schema & RPCs
-- Platform: Supabase PostgreSQL
-- ==============================================================================

-- 1. Create or Rename Queue Table to astrology_calculation_jobs
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vedastro_jobs') THEN
    ALTER TABLE public.vedastro_jobs RENAME TO astrology_calculation_jobs;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.astrology_calculation_jobs (
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

CREATE UNIQUE INDEX IF NOT EXISTS idx_astrology_calc_jobs_active_unique 
  ON public.astrology_calculation_jobs (user_id, job_type) 
  WHERE status IN ('queued', 'leased');

CREATE INDEX IF NOT EXISTS idx_astrology_calc_jobs_pickup 
  ON public.astrology_calculation_jobs (status, run_after) 
  WHERE status = 'queued';

ALTER TABLE public.astrology_calculation_jobs ENABLE ROW LEVEL SECURITY;

-- Compatibility View if legacy queries look for vedastro_jobs
CREATE OR REPLACE VIEW public.vedastro_jobs AS 
  SELECT * FROM public.astrology_calculation_jobs;

-- 2. Reconcile astrology_profiles status from astrology_calculation_jobs
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

  IF v_status = 'ready' THEN
    RETURN;
  END IF;

  -- 2. Determine expected job set from birth accuracy
  SELECT birth_time_accuracy INTO v_accuracy
  FROM public.astrology_birth_profiles
  WHERE user_id = p_user_id;

  IF v_accuracy = 'unknown' THEN
    v_expected_jobs := ARRAY['planet_positions', 'all_planet_data'];
  ELSE
    v_expected_jobs := ARRAY[
      'planet_positions', 'house_cusps', 'dasha_timeline', 'astrological_insights',
      'all_planet_data', 'all_house_rasi_signs', 'dasa_at_range', 'horoscope_predictions'
    ];
  END IF;

  v_total_expected := CASE WHEN v_accuracy = 'unknown' THEN 1 ELSE 4 END;

  -- 3. Check for active jobs
  SELECT EXISTS (
    SELECT 1
    FROM public.astrology_calculation_jobs j
    WHERE j.user_id = p_user_id
      AND j.input_fingerprint = v_fp
      AND j.status IN ('queued', 'leased')
  ) INTO v_has_active;

  IF v_has_active THEN
    RETURN;
  END IF;

  -- 4. Count completed and failed jobs
  SELECT 
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*) FILTER (WHERE status = 'failed')
  INTO v_completed_count, v_failed_count
  FROM public.astrology_calculation_jobs j
  WHERE j.user_id = p_user_id
    AND j.input_fingerprint = v_fp
    AND j.job_type = ANY(v_expected_jobs);

  -- 5. Invariant enforcement
  IF v_completed_count >= v_total_expected THEN
    UPDATE public.astrology_profiles
    SET status = 'ready',
        last_error_code = NULL,
        updated_at = NOW()
    WHERE user_id = p_user_id
      AND status <> 'ready';

  ELSIF v_completed_count > 0 THEN
    UPDATE public.astrology_profiles
    SET status = 'partial',
        last_error_code = CASE WHEN v_failed_count > 0 THEN 'secondary_jobs_failed' ELSE last_error_code END,
        updated_at = NOW()
    WHERE user_id = p_user_id
      AND status IN ('pending', 'generating');

  ELSIF v_failed_count > 0 THEN
    UPDATE public.astrology_profiles
    SET status = 'failed',
        last_error_code = 'astrology_calculation_failed',
        updated_at = NOW()
    WHERE user_id = p_user_id
      AND status IN ('pending', 'generating');
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.reconcile_astrology_profile_from_jobs(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reconcile_astrology_profile_from_jobs(UUID) TO service_role;

-- 3. Atomically Save and Enqueue Birth Profile
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
  -- Verify authenticated session
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
    v_enqueued_job_types := ARRAY['planet_positions'];
    v_completeness := 'limited';
  ELSE
    v_enqueued_job_types := ARRAY['planet_positions', 'house_cusps', 'dasha_timeline', 'astrological_insights'];
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

  -- 4. Enqueue calculation jobs
  v_should_enqueue := (
    v_existing_fingerprint IS NULL
    OR v_existing_fingerprint <> p_input_fingerprint
    OR COALESCE(p_force_reenqueue, FALSE)
  );

  IF v_should_enqueue THEN
    -- Cancel obsolete active jobs
    UPDATE public.astrology_calculation_jobs
    SET status = 'cancelled',
        updated_at = NOW()
    WHERE user_id = v_effective_user_id
      AND status IN ('queued', 'leased');

    -- Initialize or reset astrology_profiles
    IF (v_existing_fingerprint IS NULL OR v_existing_fingerprint <> p_input_fingerprint) THEN
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
      UPDATE public.astrology_profiles
      SET status = 'pending',
          last_error_code = NULL,
          updated_at = NOW()
      WHERE user_id = v_effective_user_id;
    END IF;

    -- Insert jobs into astrology_calculation_jobs
    IF v_enqueued_job_types IS NOT NULL AND array_length(v_enqueued_job_types, 1) > 0 THEN
      FOREACH v_job_type IN ARRAY v_enqueued_job_types
      LOOP
        IF (v_existing_fingerprint = p_input_fingerprint AND p_force_reenqueue = TRUE) THEN
          SELECT EXISTS (
            SELECT 1 FROM public.astrology_calculation_jobs
            WHERE user_id = v_effective_user_id
              AND input_fingerprint = p_input_fingerprint
              AND job_type = v_job_type
              AND status = 'completed'
          ) INTO v_already_completed;
        ELSE
          v_already_completed := FALSE;
        END IF;

        IF NOT v_already_completed THEN
          INSERT INTO public.astrology_calculation_jobs (
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

-- 4. Atomic Lease RPC for Worker
CREATE OR REPLACE FUNCTION public.lease_next_astrology_job(
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
  v_now TIMESTAMPTZ := NOW();
  v_failed_user UUID;
BEGIN
  -- 1. Recover abandoned/orphaned leases
  UPDATE public.astrology_calculation_jobs
  SET status = CASE WHEN attempts >= max_attempts THEN 'failed' ELSE 'queued' END,
      lease_until = NULL,
      last_error = CASE
        WHEN attempts >= max_attempts THEN 'Max attempts exceeded after lease timeout'
        ELSE last_error
      END,
      updated_at = v_now
  WHERE status = 'leased'
    AND lease_until < v_now;

  -- 2. Reconcile failed profiles
  FOR v_failed_user IN
    SELECT DISTINCT j.user_id
    FROM public.astrology_calculation_jobs j
    JOIN public.astrology_profiles p ON p.user_id = j.user_id AND p.input_fingerprint = j.input_fingerprint
    WHERE j.status = 'failed'
      AND p.status IN ('pending', 'generating')
  LOOP
    PERFORM public.reconcile_astrology_profile_from_jobs(v_failed_user);
  END LOOP;

  -- 3. Atomically lease next candidate
  RETURN QUERY
  WITH next_candidate AS (
    SELECT id
    FROM public.astrology_calculation_jobs
    WHERE status = 'queued'
      AND run_after <= v_now
      AND attempts < max_attempts
    ORDER BY run_after ASC, created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  )
  UPDATE public.astrology_calculation_jobs j
  SET status = 'leased',
      lease_until = v_now + (p_lease_duration_seconds * INTERVAL '1 second'),
      attempts = j.attempts + 1,
      updated_at = v_now
  FROM next_candidate c
  WHERE j.id = c.id
  RETURNING j.id, j.user_id, j.job_type, j.input_fingerprint, j.attempts;
END;
$$;

REVOKE ALL ON FUNCTION public.lease_next_astrology_job(INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lease_next_astrology_job(INT) TO service_role;

-- Backward compatibility overload for legacy workers
CREATE OR REPLACE FUNCTION public.lease_next_vedastro_job(p_lease_duration_seconds INT DEFAULT 120)
RETURNS TABLE (job_id UUID, user_id UUID, job_type TEXT, input_fingerprint TEXT, attempts INT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.lease_next_astrology_job(p_lease_duration_seconds);
END;
$$;
GRANT EXECUTE ON FUNCTION public.lease_next_vedastro_job(INT) TO service_role;

-- 5. Atomic Result Persistence RPC
CREATE OR REPLACE FUNCTION public.persist_astrology_job_result(
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
  -- 1. Find and verify leased job
  SELECT id, user_id, job_type, input_fingerprint, status
  INTO v_job
  FROM public.astrology_calculation_jobs
  WHERE id = p_job_id
    AND user_id = p_user_id
    AND job_type = p_job_type
    AND input_fingerprint = p_input_fingerprint
    AND status = 'leased'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', 'job_not_leased_or_mismatched');
  END IF;

  -- 2. Verify current astrology_profiles fingerprint
  SELECT input_fingerprint, planets_ready, houses_ready, core_ready, dasha_ready, predictions_ready, status
  INTO v_profile
  FROM public.astrology_profiles
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF (v_profile.input_fingerprint IS NULL OR v_profile.input_fingerprint <> p_input_fingerprint) THEN
    UPDATE public.astrology_calculation_jobs
    SET status = 'cancelled',
        updated_at = NOW()
    WHERE id = p_job_id;

    RETURN jsonb_build_object('success', false, 'reason', 'stale_profile_fingerprint');
  END IF;

  -- 3. Fetch birth_time_accuracy
  SELECT birth_time_accuracy INTO v_birth_accuracy
  FROM public.astrology_birth_profiles
  WHERE user_id = p_user_id;

  -- Compute readiness
  v_new_planets_ready := v_profile.planets_ready OR (p_job_type IN ('planet_positions', 'all_planet_data', 'core'));
  v_new_houses_ready := v_profile.houses_ready OR (p_job_type IN ('house_cusps', 'all_house_rasi_signs'));
  v_new_dasha_ready := v_profile.dasha_ready OR (p_job_type IN ('dasha_timeline', 'dasa_at_range', 'dasha'));
  v_new_predictions_ready := v_profile.predictions_ready OR (p_job_type IN ('astrological_insights', 'horoscope_predictions', 'predictions'));

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
    core_chart = CASE WHEN p_job_type IN ('planet_positions', 'house_cusps', 'core', 'all_planet_data', 'all_house_rasi_signs') THEN 
      COALESCE(core_chart, '{}'::jsonb) || p_result_payload 
      ELSE core_chart 
    END,
    profile_completeness = v_completeness,
    planets_ready = v_new_planets_ready,
    houses_ready = v_new_houses_ready,
    core_ready = v_new_core_ready,
    dasha = CASE WHEN p_job_type IN ('dasha_timeline', 'dasha', 'dasa_at_range') THEN p_result_payload ELSE dasha END,
    dasha_ready = v_new_dasha_ready,
    predictions = CASE WHEN p_job_type IN ('astrological_insights', 'predictions', 'horoscope_predictions') THEN p_result_payload ELSE predictions END,
    predictions_ready = v_new_predictions_ready,
    status = v_new_status,
    calculated_at = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id
    AND input_fingerprint = p_input_fingerprint;

  -- 5. Mark job completed
  UPDATE public.astrology_calculation_jobs
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

REVOKE ALL ON FUNCTION public.persist_astrology_job_result(UUID, UUID, TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.persist_astrology_job_result(UUID, UUID, TEXT, TEXT, JSONB) TO service_role;

-- Backward compatibility overload for legacy workers
CREATE OR REPLACE FUNCTION public.persist_vedastro_job_result(p_job_id UUID, p_user_id UUID, p_input_fingerprint TEXT, p_job_type TEXT, p_result_payload JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  RETURN public.persist_astrology_job_result(p_job_id, p_user_id, p_input_fingerprint, p_job_type, p_result_payload);
END;
$$;
GRANT EXECUTE ON FUNCTION public.persist_vedastro_job_result(UUID, UUID, TEXT, TEXT, JSONB) TO service_role;

-- 6. Cron Schedule for Neutral Astrology Worker
DO $$
BEGIN
  PERFORM cron.unschedule('process-vedastro-queue-tick');
  PERFORM cron.unschedule('process-astrology-queue-tick');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

SELECT cron.schedule(
  'process-astrology-queue-tick',
  '* * * * *',
  $$
  SELECT net.http_post(
    url:='https://khnqyhzlrxwmolyevaqo.supabase.co/functions/v1/process-astrology-job',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1)
    ),
    body:='{}'::jsonb
  );
  $$
);
