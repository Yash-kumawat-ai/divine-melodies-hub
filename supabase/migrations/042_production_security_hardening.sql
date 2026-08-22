-- ============================================================
-- Migration 042: Production Security Hardening
-- Fixes critical and high-severity RLS vulnerabilities
-- identified during the security audit.
-- Completely idempotent and guarded against missing tables.
-- ============================================================

-- ──────────────────────────────────────────────
-- 1. Fix daily_dohas: Remove public write access
--    (Finding #5 - CRITICAL)
--    Previously: Anyone (including anonymous) could INSERT/UPDATE
-- ──────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'daily_dohas') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can update dohas" ON daily_dohas';
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can insert dohas" ON daily_dohas';
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can read dohas" ON daily_dohas';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can insert dohas" ON daily_dohas';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can update dohas" ON daily_dohas';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can delete dohas" ON daily_dohas';

    EXECUTE 'CREATE POLICY "Anyone can read dohas" ON daily_dohas FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Admins can insert dohas" ON daily_dohas FOR INSERT WITH CHECK (public.has_admin_role(auth.uid()))';
    EXECUTE 'CREATE POLICY "Admins can update dohas" ON daily_dohas FOR UPDATE USING (public.has_admin_role(auth.uid())) WITH CHECK (public.has_admin_role(auth.uid()))';
    EXECUTE 'CREATE POLICY "Admins can delete dohas" ON daily_dohas FOR DELETE USING (public.has_admin_role(auth.uid()))';
  END IF;
END;
$$;


-- ──────────────────────────────────────────────
-- 2. Fix user_profiles PII exposure
--    (Finding #6 - HIGH)
--    Previously: All columns visible to all authenticated users
--    Fix: Replace blanket SELECT with a restricted view for
--    leaderboard/public display, keep full access only for self
-- ──────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Public profiles are viewable by all authenticated users" ON user_profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can view public profile info" ON user_profiles';

    EXECUTE 'CREATE POLICY "Authenticated users can view public profile info" ON user_profiles FOR SELECT USING (
      auth.role() = ''authenticated''
      AND (
        auth.uid() = id
        OR public.has_admin_role(auth.uid())
      )
    )';
  END IF;
END;
$$;

-- Create a safe public view for leaderboard and community display
-- Exposes ONLY non-sensitive fields
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
    EXECUTE 'CREATE OR REPLACE VIEW public_devotee_profiles AS
      SELECT
        id,
        name,
        avatar_url
      FROM user_profiles';

    EXECUTE 'GRANT SELECT ON public_devotee_profiles TO authenticated';
    EXECUTE 'GRANT SELECT ON public_devotee_profiles TO anon';
  END IF;
END;
$$;

-- Recreate the leaderboard function to use only safe columns
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_jap_totals') 
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
    EXECUTE 'CREATE OR REPLACE FUNCTION get_global_leaderboard(p_viewer_id UUID DEFAULT NULL)
    RETURNS TABLE (
      user_id UUID,
      user_name TEXT,
      avatar_url TEXT,
      total_chants BIGINT,
      rank BIGINT
    )
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = public, pg_temp
    AS $fn$
      SELECT
        t.user_id,
        COALESCE(p.name, ''Devotee'') AS user_name,
        p.avatar_url,
        t.total_chants,
        ROW_NUMBER() OVER (ORDER BY t.total_chants DESC) AS rank
      FROM user_jap_totals t
      LEFT JOIN user_profiles p ON p.id = t.user_id
      WHERE t.total_chants > 0
      ORDER BY t.total_chants DESC
      LIMIT 100;
    $fn$';
  END IF;
END;
$$;


-- ──────────────────────────────────────────────
-- 3. Fix user_jap_totals: Prevent direct score manipulation
--    (Finding #7 - HIGH)
--    Previously: FOR ALL allowed direct UPDATE/DELETE
-- ──────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_jap_totals') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users manage own totals" ON user_jap_totals';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own totals" ON user_jap_totals';
    EXECUTE 'DROP POLICY IF EXISTS "Leaderboard read access" ON user_jap_totals';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can view totals for leaderboard" ON user_jap_totals';

    EXECUTE 'CREATE POLICY "Users can view own totals" ON user_jap_totals FOR SELECT USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Authenticated users can view totals for leaderboard" ON user_jap_totals FOR SELECT USING (auth.role() = ''authenticated'')';
  END IF;
END;
$$;


-- ──────────────────────────────────────────────
-- 4. Fix user_subscriptions: Prevent self-upgrade
--    (Finding #8 - HIGH)
--    Previously: Users could UPDATE subscription_tier freely
-- ──────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_subscriptions') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can update own subscription" ON user_subscriptions';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own subscription" ON user_subscriptions';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage subscriptions" ON user_subscriptions';

    EXECUTE 'CREATE POLICY "Users can view own subscription" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Admins can manage subscriptions" ON user_subscriptions FOR ALL USING (public.has_admin_role(auth.uid()))';
  END IF;
END;
$$;


-- ──────────────────────────────────────────────
-- 5. Fix submission_rate_limits: Prevent self-deletion
--    (Finding #10 - HIGH)
--    Previously: FOR ALL allowed users to DELETE their rate limits
--    Note: Only runs if the table exists in this database
-- ──────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'submission_rate_limits') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can manage own rate limits" ON submission_rate_limits';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own rate limits" ON submission_rate_limits';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage rate limits" ON submission_rate_limits';

    EXECUTE 'CREATE POLICY "Users can view own rate limits" ON submission_rate_limits FOR SELECT USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Admins can manage rate limits" ON submission_rate_limits FOR ALL USING (public.has_admin_role(auth.uid()))';
  END IF;
END;
$$;


-- ──────────────────────────────────────────────
-- 6. Fix group_members: Prevent private group join bypass
--    (Finding #12 - MEDIUM)
--    Previously: Only checked auth.uid() = user_id, not group privacy
-- ──────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'group_members') 
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'groups') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can join groups" ON group_members';
    EXECUTE 'DROP POLICY IF EXISTS "Users can join public groups" ON group_members';

    EXECUTE 'CREATE POLICY "Users can join public groups"
      ON group_members FOR INSERT
      WITH CHECK (
        auth.uid() = user_id
        AND (
          EXISTS (
            SELECT 1 FROM groups g
            WHERE g.id = group_id AND g.is_public = true
          )
          OR EXISTS (
            SELECT 1 FROM groups g
            WHERE g.id = group_id AND g.created_by = auth.uid()
          )
        )
      )';

    EXECUTE 'CREATE OR REPLACE FUNCTION join_group_with_invite(
      p_group_id UUID,
      p_invite_code TEXT
    )
    RETURNS VOID
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public, pg_temp
    AS $fn$
    DECLARE
      v_actual_code TEXT;
      v_is_public BOOLEAN;
    BEGIN
      SELECT invite_code, is_public
      INTO v_actual_code, v_is_public
      FROM groups
      WHERE id = p_group_id;

      IF NOT FOUND THEN
        RAISE EXCEPTION ''Group not found'';
      END IF;

      IF v_is_public THEN
        INSERT INTO group_members (group_id, user_id, role)
        VALUES (p_group_id, auth.uid(), ''member'')
        ON CONFLICT (group_id, user_id) DO NOTHING;
        RETURN;
      END IF;

      IF v_actual_code IS NULL OR v_actual_code != p_invite_code THEN
        RAISE EXCEPTION ''Invalid invite code'';
      END IF;

      INSERT INTO group_members (group_id, user_id, role)
      VALUES (p_group_id, auth.uid(), ''member'')
      ON CONFLICT (group_id, user_id) DO NOTHING;
    END;
    $fn$';

    EXECUTE 'GRANT EXECUTE ON FUNCTION join_group_with_invite(UUID, TEXT) TO authenticated';
  END IF;
END;
$$;


-- ──────────────────────────────────────────────
-- 7. Fix lyrics_cache: Enable RLS
--    (Finding #15 - MEDIUM)
--    Previously: RLS was not enabled at all
-- ──────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'lyrics_cache') THEN
    EXECUTE 'ALTER TABLE lyrics_cache ENABLE ROW LEVEL SECURITY';
    EXECUTE 'REVOKE UPDATE, DELETE ON lyrics_cache FROM authenticated';

    EXECUTE 'DROP POLICY IF EXISTS "Anyone can read lyrics cache" ON lyrics_cache';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated can insert cache entries" ON lyrics_cache';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage lyrics cache" ON lyrics_cache';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage cache" ON lyrics_cache';

    EXECUTE 'CREATE POLICY "Anyone can read lyrics cache" ON lyrics_cache FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Authenticated can insert cache entries" ON lyrics_cache FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
    EXECUTE 'CREATE POLICY "Admins can manage lyrics cache" ON lyrics_cache FOR ALL USING (public.has_admin_role(auth.uid()))';
  END IF;
END;
$$;


-- ──────────────────────────────────────────────
-- 8. Fix complete_jap_session: Add sanity limits on chant counts
--    (Finding #17 - MEDIUM)
--    Previously: Accepted any p_actual_count without validation
-- ──────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_jap_sessions') 
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_jap_totals') THEN
    EXECUTE 'CREATE OR REPLACE FUNCTION complete_jap_session(
      p_user_id      UUID,
      p_mantra_id    UUID,
      p_actual_count INTEGER,
      p_target_count INTEGER,
      p_duration_seconds INTEGER,
      p_group_id     UUID DEFAULT NULL
    )
    RETURNS UUID
    LANGUAGE plpgsql
    SECURITY INVOKER
    SET search_path = public, pg_temp
    AS $fn$
    DECLARE
      v_session_id UUID;
      v_max_reasonable_rate CONSTANT INTEGER := 10;
      v_max_per_session CONSTANT INTEGER := 10000;
    BEGIN
      IF auth.uid() IS DISTINCT FROM p_user_id THEN
        RAISE EXCEPTION ''Caller does not match p_user_id'';
      END IF;

      IF p_actual_count <= 0 THEN
        RAISE EXCEPTION ''Chant count must be positive'';
      END IF;

      IF p_actual_count > v_max_per_session THEN
        RAISE EXCEPTION ''Chant count exceeds maximum allowed per session (%)'', v_max_per_session;
      END IF;

      IF p_duration_seconds > 0 AND p_actual_count > (p_duration_seconds * v_max_reasonable_rate) THEN
        RAISE EXCEPTION ''Chant rate exceeds physically reasonable limit'';
      END IF;

      INSERT INTO user_jap_sessions (
        user_id, mantra_id, actual_count, target_count, duration_seconds, group_id
      )
      VALUES (
        p_user_id, p_mantra_id, p_actual_count, p_target_count, p_duration_seconds, p_group_id
      )
      RETURNING id INTO v_session_id;

      INSERT INTO user_jap_totals (user_id, mantra_id, total_chants, session_count, last_session_at)
      VALUES (p_user_id, p_mantra_id, p_actual_count, 1, NOW())
      ON CONFLICT (user_id, mantra_id)
      DO UPDATE SET
        total_chants    = user_jap_totals.total_chants + EXCLUDED.total_chants,
        session_count   = user_jap_totals.session_count + 1,
        last_session_at = NOW();

      RETURN v_session_id;
    END;
    $fn$';
  END IF;
END;
$$;
