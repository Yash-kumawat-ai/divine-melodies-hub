-- Additional admin management controls, role assignment guardrails, and rate limits

-- Allow super_admin to manage roles for other users.
DROP POLICY IF EXISTS "Super admins can update all profiles" ON user_profiles;
CREATE POLICY "Super admins can update all profiles" ON user_profiles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM user_profiles actor
      WHERE actor.id = auth.uid()
        AND actor.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM user_profiles actor
      WHERE actor.id = auth.uid()
        AND actor.role = 'super_admin'
    )
  );

-- Admins can read all profiles for moderation/account visibility.
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
CREATE POLICY "Admins can read all profiles" ON user_profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1
      FROM user_profiles actor
      WHERE actor.id = auth.uid()
        AND actor.role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- Prevent super_admin self-demotion by trigger (safety).
CREATE OR REPLACE FUNCTION public.guard_super_admin_self_demotion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.id = auth.uid() AND OLD.role = 'super_admin' AND NEW.role <> 'super_admin' THEN
    RAISE EXCEPTION 'Super admin cannot self-demote';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_super_admin_self_demotion ON user_profiles;
CREATE TRIGGER trg_guard_super_admin_self_demotion
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.guard_super_admin_self_demotion();

-- Submission rate limits table (5 submissions/hour/user baseline)
CREATE TABLE IF NOT EXISTS submission_rate_limits (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL DEFAULT 'upload_bhajan',
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT date_trunc('hour', now()),
  request_count INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, action, window_start)
);

CREATE INDEX IF NOT EXISTS submission_rate_limits_user_idx ON submission_rate_limits(user_id, window_start DESC);

ALTER TABLE submission_rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own rate limits" ON submission_rate_limits;
CREATE POLICY "Users can view own rate limits" ON submission_rate_limits
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can upsert own rate limits" ON submission_rate_limits;
CREATE POLICY "Users can upsert own rate limits" ON submission_rate_limits
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.check_submission_rate_limit(p_user_id UUID, p_limit INTEGER DEFAULT 5)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_window TIMESTAMP WITH TIME ZONE := date_trunc('hour', now());
  current_count INTEGER;
BEGIN
  INSERT INTO submission_rate_limits (user_id, action, window_start, request_count)
  VALUES (p_user_id, 'upload_bhajan', current_window, 1)
  ON CONFLICT (user_id, action, window_start)
  DO UPDATE SET request_count = submission_rate_limits.request_count + 1,
                updated_at = now();

  SELECT request_count INTO current_count
  FROM submission_rate_limits
  WHERE user_id = p_user_id
    AND action = 'upload_bhajan'
    AND window_start = current_window;

  RETURN current_count <= p_limit;
END;
$$;
