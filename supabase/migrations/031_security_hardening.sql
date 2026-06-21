-- ============================================================
-- 031: DATABASE SECURITY HARDENING & LINT FIXES
-- ============================================================

-- 1. MOVE EXTENSIONS TO DEDICATED SCHEMA (Fixes extension_in_public)
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- 2. HARDEN FUNCTION SEARCH PATHS (Fixes function_search_path_mutable)
ALTER FUNCTION public.has_admin_role(UUID) SET search_path = public, pg_temp;
ALTER FUNCTION public.enqueue_moderation_notification() SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;
ALTER FUNCTION public.auto_join_group_creator() SET search_path = public, pg_temp;
ALTER FUNCTION public.refresh_member_count(UUID) SET search_path = public, pg_temp;
ALTER FUNCTION public.trg_refresh_member_count() SET search_path = public, pg_temp;
ALTER FUNCTION public.init_member_stats_on_join() SET search_path = public, pg_temp;
ALTER FUNCTION public.sync_jap_to_group_stats() SET search_path = public, pg_temp;
ALTER FUNCTION public.recalculate_group_progress(UUID) SET search_path = public, pg_temp;
ALTER FUNCTION public.init_group_progress() SET search_path = public, pg_temp;
ALTER FUNCTION public.trg_recalculate_group_progress() SET search_path = public, pg_temp;
ALTER FUNCTION public.slugify(TEXT) SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_group_slug() SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_group_creation() SET search_path = public, pg_temp;

-- 3. ENABLE RLS UPDATE FOR USER NOTIFICATIONS (Allows SECURITY INVOKER for notifications function)
DROP POLICY IF EXISTS "Users can update own notifications" ON public.moderation_notifications;
CREATE POLICY "Users can update own notifications" ON public.moderation_notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. CONVERT CLIENT RPCs TO SECURITY INVOKER (Fixes authenticated_security_definer_function_executable)
-- Since RLS is enabled and users have access to their own data on the tables, we do not need SECURITY DEFINER.

-- Recreate complete_jap_session as SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.complete_jap_session(
  p_user_id UUID,
  p_mantra_id UUID,
  p_sankalp TEXT DEFAULT NULL,
  p_target_count INTEGER DEFAULT 108,
  p_actual_count INTEGER DEFAULT 108,
  p_duration_seconds INTEGER DEFAULT 0
) RETURNS JSON
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_session_id UUID;
  v_today DATE := CURRENT_DATE;
  v_totals user_jap_totals%ROWTYPE;
BEGIN
  -- Security check: users can only submit sessions for their own user_id
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: You can only complete sessions for your own user ID.';
  END IF;

  -- Insert session log
  INSERT INTO public.user_jap_sessions (user_id, mantra_id, sankalp, target_count, actual_count, duration_seconds, completed, completed_at)
  VALUES (p_user_id, p_mantra_id, p_sankalp, p_target_count, p_actual_count, p_duration_seconds, true, now())
  RETURNING id INTO v_session_id;

  -- Upsert totals
  INSERT INTO public.user_jap_totals (user_id, mantra_id, total_chants, total_sessions, total_malas, last_session_at, current_streak, longest_streak, last_streak_date)
  VALUES (p_user_id, p_mantra_id, p_actual_count, 1, FLOOR(p_actual_count / 108), now(), 1, 1, v_today)
  ON CONFLICT (user_id, mantra_id) DO UPDATE SET
    total_chants = user_jap_totals.total_chants + p_actual_count,
    total_sessions = user_jap_totals.total_sessions + 1,
    total_malas = user_jap_totals.total_malas + FLOOR(p_actual_count / 108),
    last_session_at = now(),
    current_streak = CASE
      WHEN user_jap_totals.last_streak_date = v_today THEN user_jap_totals.current_streak
      WHEN user_jap_totals.last_streak_date = v_today - 1 THEN user_jap_totals.current_streak + 1
      ELSE 1
    END,
    longest_streak = GREATEST(
      user_jap_totals.longest_streak,
      CASE
        WHEN user_jap_totals.last_streak_date = v_today THEN user_jap_totals.current_streak
        WHEN user_jap_totals.last_streak_date = v_today - 1 THEN user_jap_totals.current_streak + 1
        ELSE 1
      END
    ),
    last_streak_date = v_today,
    updated_at = now();

  -- Fetch updated totals
  SELECT * INTO v_totals FROM public.user_jap_totals WHERE user_id = p_user_id AND mantra_id = p_mantra_id;

  RETURN json_build_object(
    'session_id', v_session_id,
    'total_chants', v_totals.total_chants,
    'total_sessions', v_totals.total_sessions,
    'current_streak', v_totals.current_streak,
    'longest_streak', v_totals.longest_streak
  );
END;
$$;

-- Recreate mark_my_moderation_notifications_read as SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.mark_my_moderation_notifications_read()
RETURNS void
LANGUAGE sql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  UPDATE public.moderation_notifications
  SET read = TRUE
  WHERE user_id = auth.uid()
    AND read = FALSE;
$$;

-- 5. HARDEN SECURITY DEFINER EXECUTION RIGHTS
-- Revoke execution from public/anon/authenticated on trigger & internal functions
REVOKE EXECUTE ON FUNCTION public.auto_join_group_creator() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_group_creation() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.init_group_progress() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.init_member_stats_on_join() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_admins_new_upload() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recalculate_group_progress(UUID) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.refresh_member_count(UUID) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_jap_to_group_stats() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_recalculate_group_progress() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_refresh_member_count() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_group_slug() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_moderation_notification() FROM public, anon, authenticated;

-- Restrict invoker execution to authenticated users only (protecting complete_jap_session and mark_my_notifications_read)
REVOKE EXECUTE ON FUNCTION public.complete_jap_session(UUID, UUID, TEXT, INTEGER, INTEGER, INTEGER) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.complete_jap_session(UUID, UUID, TEXT, INTEGER, INTEGER, INTEGER) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.mark_my_moderation_notifications_read() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.mark_my_moderation_notifications_read() TO authenticated;

-- 6. SECURE NEWSLETTER RLS INSERT POLICY (Fixes rls_policy_always_true)
-- Restrict authenticated users to only subscribing their own email (verified via their JWT email field)
DROP POLICY IF EXISTS "Authenticated users can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Authenticated users can subscribe"
  ON public.newsletter_subscribers FOR INSERT
  TO authenticated
  WITH CHECK (email = auth.jwt() ->> 'email');
