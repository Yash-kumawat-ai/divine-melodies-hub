-- Admin moderation, soft delete, audit, and notification foundations

-- 1) User roles with future-ready levels
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_admin_activity_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_role_check;

ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_role_check CHECK (
  role IN ('user', 'moderator', 'admin', 'super_admin')
);

CREATE INDEX IF NOT EXISTS user_profiles_role_idx ON user_profiles(role);

-- Prevent users from escalating their own role through existing self-update policy.
CREATE OR REPLACE FUNCTION public.guard_profile_privilege_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.id = auth.uid() THEN
    IF NEW.role IS DISTINCT FROM OLD.role OR NEW.mfa_enabled IS DISTINCT FROM OLD.mfa_enabled THEN
      RAISE EXCEPTION 'Not allowed to change role or admin security fields';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_profile_privilege_fields ON user_profiles;
CREATE TRIGGER trg_guard_profile_privilege_fields
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.guard_profile_privilege_fields();

-- 2) Extend moderation status model + soft delete/archive + feature flags
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_uploads_status_check'
      AND conrelid = 'user_uploads'::regclass
  ) THEN
    ALTER TABLE user_uploads DROP CONSTRAINT user_uploads_status_check;
  END IF;
END $$;

ALTER TABLE user_uploads
ADD CONSTRAINT user_uploads_status_check CHECK (
  status IN ('pending', 'approved', 'rejected', 'changes_requested', 'resubmitted', 'archived')
);

ALTER TABLE user_uploads
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS request_changes_notes TEXT,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS archived_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS featured_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS featured_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS email_notification_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS file_scan_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS file_scan_notes TEXT;

ALTER TABLE user_uploads
DROP CONSTRAINT IF EXISTS user_uploads_file_scan_status_check;

ALTER TABLE user_uploads
ADD CONSTRAINT user_uploads_file_scan_status_check CHECK (
  file_scan_status IN ('pending', 'clean', 'infected', 'error', 'not_required')
);

CREATE INDEX IF NOT EXISTS user_uploads_status_idx_new ON user_uploads(status);
CREATE INDEX IF NOT EXISTS user_uploads_archived_at_idx ON user_uploads(archived_at DESC);
CREATE INDEX IF NOT EXISTS user_uploads_featured_idx ON user_uploads(is_featured, featured_at DESC);
CREATE INDEX IF NOT EXISTS user_uploads_reviewed_at_idx ON user_uploads(reviewed_at DESC);

-- 3) Immutable audit logs with IP/user-agent capture
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id BIGSERIAL PRIMARY KEY,
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL DEFAULT 'user_upload',
  entity_id BIGINT NOT NULL REFERENCES user_uploads(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT,
  reason TEXT,
  action_ip TEXT,
  action_user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS admin_audit_logs_admin_idx ON admin_audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS admin_audit_logs_entity_idx ON admin_audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS admin_audit_logs_created_idx ON admin_audit_logs(created_at DESC);

ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 4) Notification outbox (email + in-app)
CREATE TABLE IF NOT EXISTS moderation_notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bhajan_id BIGINT NOT NULL REFERENCES user_uploads(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  email_to TEXT,
  delivery_channel TEXT NOT NULL DEFAULT 'email',
  delivery_status TEXT NOT NULL DEFAULT 'queued',
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE moderation_notifications
DROP CONSTRAINT IF EXISTS moderation_notifications_event_type_check;

ALTER TABLE moderation_notifications
ADD CONSTRAINT moderation_notifications_event_type_check CHECK (
  event_type IN ('approved', 'rejected', 'changes_requested')
);

ALTER TABLE moderation_notifications
DROP CONSTRAINT IF EXISTS moderation_notifications_delivery_status_check;

ALTER TABLE moderation_notifications
ADD CONSTRAINT moderation_notifications_delivery_status_check CHECK (
  delivery_status IN ('queued', 'sent', 'failed')
);

CREATE INDEX IF NOT EXISTS moderation_notifications_user_idx ON moderation_notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS moderation_notifications_status_idx ON moderation_notifications(delivery_status, created_at);

ALTER TABLE moderation_notifications ENABLE ROW LEVEL SECURITY;

-- 5) RLS helpers and policies
CREATE OR REPLACE FUNCTION public.has_admin_role(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_profiles up
    WHERE up.id = check_user_id
      AND up.role IN ('moderator', 'admin', 'super_admin')
  );
$$;

DROP POLICY IF EXISTS "Admins can read audit logs" ON admin_audit_logs;
CREATE POLICY "Admins can read audit logs" ON admin_audit_logs
  FOR SELECT TO authenticated
  USING (public.has_admin_role(auth.uid()));

DROP POLICY IF EXISTS "Admins can insert audit logs" ON admin_audit_logs;
CREATE POLICY "Admins can insert audit logs" ON admin_audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.has_admin_role(auth.uid()) AND auth.uid() = admin_user_id);

DROP POLICY IF EXISTS "Users can view own moderation notifications" ON moderation_notifications;
CREATE POLICY "Users can view own moderation notifications" ON moderation_notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_admin_role(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage moderation notifications" ON moderation_notifications;
CREATE POLICY "Admins can manage moderation notifications" ON moderation_notifications
  FOR ALL TO authenticated
  USING (public.has_admin_role(auth.uid()))
  WITH CHECK (public.has_admin_role(auth.uid()));

-- Replace over-permissive update policy so users cannot self-approve.
DROP POLICY IF EXISTS "Users can update their own uploads" ON user_uploads;
CREATE POLICY "Users can update own pending submissions" ON user_uploads
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND status IN ('pending', 'resubmitted')
  );

DROP POLICY IF EXISTS "Admins can update any uploads" ON user_uploads;
CREATE POLICY "Admins can update any uploads" ON user_uploads
  FOR UPDATE TO authenticated
  USING (public.has_admin_role(auth.uid()))
  WITH CHECK (public.has_admin_role(auth.uid()));

DROP POLICY IF EXISTS "Admins can read all uploads" ON user_uploads;
CREATE POLICY "Admins can read all uploads" ON user_uploads
  FOR SELECT TO authenticated
  USING (public.has_admin_role(auth.uid()) OR auth.uid() = user_id OR status = 'approved');

-- 6) Queue a moderation notification whenever status changes to user-visible decision states.
CREATE OR REPLACE FUNCTION public.enqueue_moderation_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  event_subject TEXT;
  event_body TEXT;
BEGIN
  IF NEW.status NOT IN ('approved', 'rejected', 'changes_requested') THEN
    RETURN NEW;
  END IF;

  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  event_subject := CASE NEW.status
    WHEN 'approved' THEN 'Your bhajan has been approved'
    WHEN 'rejected' THEN 'Your bhajan submission was rejected'
    ELSE 'Changes requested for your bhajan submission'
  END;

  event_body := CASE NEW.status
    WHEN 'approved' THEN 'Your bhajan "' || NEW.title || '" is now live.'
    WHEN 'rejected' THEN 'Your bhajan "' || NEW.title || '" was rejected. Reason: ' || COALESCE(NEW.rejection_reason, NEW.admin_notes, 'Not provided.')
    ELSE 'Your bhajan "' || NEW.title || '" needs changes. Notes: ' || COALESCE(NEW.request_changes_notes, NEW.admin_notes, 'Not provided.')
  END;

  INSERT INTO moderation_notifications (user_id, bhajan_id, event_type, subject, body, email_to)
  VALUES (NEW.user_id, NEW.id, NEW.status, event_subject, event_body, NULL);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enqueue_moderation_notification ON user_uploads;
CREATE TRIGGER trg_enqueue_moderation_notification
AFTER UPDATE OF status ON user_uploads
FOR EACH ROW
EXECUTE FUNCTION public.enqueue_moderation_notification();
