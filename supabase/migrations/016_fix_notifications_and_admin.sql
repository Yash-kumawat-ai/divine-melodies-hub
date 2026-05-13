-- ============================================================
-- 016: Fix notifications + admin role in ONE script.
-- Run this ONCE in Supabase SQL Editor.
-- ============================================================

-- ========================
-- PART 1: Ensure role column exists and set YOUR account as super_admin
-- ========================
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Set your email as super_admin (change if your login email is different)
UPDATE public.user_profiles
SET role = 'super_admin'
WHERE email = 'yashkumawatai@gmail.com';

-- ========================
-- PART 2: Recreate moderation_notifications as in-app only (no email columns)
-- ========================
DROP TABLE IF EXISTS public.moderation_notifications CASCADE;

CREATE TABLE public.moderation_notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bhajan_id UUID NOT NULL REFERENCES public.user_uploads(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX moderation_notifications_user_idx
  ON public.moderation_notifications(user_id, created_at DESC);

CREATE INDEX moderation_notifications_unread_idx
  ON public.moderation_notifications(user_id, read)
  WHERE read = FALSE;

ALTER TABLE public.moderation_notifications ENABLE ROW LEVEL SECURITY;

-- ========================
-- PART 3: RLS helper
-- ========================
CREATE OR REPLACE FUNCTION public.has_admin_role(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles up
    WHERE up.id = check_user_id
      AND up.role IN ('moderator', 'admin', 'super_admin')
  );
$$;

-- ========================
-- PART 4: RLS policies — users see own, admins see all
-- ========================
DROP POLICY IF EXISTS "Users can view own moderation notifications" ON public.moderation_notifications;
CREATE POLICY "Users can view own moderation notifications" ON public.moderation_notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_admin_role(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage moderation notifications" ON public.moderation_notifications;
CREATE POLICY "Admins can manage moderation notifications" ON public.moderation_notifications
  FOR ALL TO authenticated
  USING (public.has_admin_role(auth.uid()))
  WITH CHECK (public.has_admin_role(auth.uid()));

-- ========================
-- PART 5: Trigger — notify UPLOADER when admin changes status (approved/rejected/changes_requested)
-- ========================
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
    WHEN 'approved' THEN 'Your bhajan has been approved!'
    WHEN 'rejected' THEN 'Your bhajan submission was rejected'
    ELSE 'Changes requested for your bhajan'
  END;

  event_body := CASE NEW.status
    WHEN 'approved' THEN 'Your bhajan "' || NEW.title || '" is now live on Hari Kirtan.'
    WHEN 'rejected' THEN 'Your bhajan "' || NEW.title || '" was rejected. Reason: ' || COALESCE(NEW.rejection_reason, NEW.admin_notes, 'Not provided.')
    ELSE 'Your bhajan "' || NEW.title || '" needs changes. Notes: ' || COALESCE(NEW.request_changes_notes, NEW.admin_notes, 'Not provided.')
  END;

  INSERT INTO public.moderation_notifications (user_id, bhajan_id, event_type, subject, body)
  VALUES (NEW.user_id, NEW.id, NEW.status, event_subject, event_body);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enqueue_moderation_notification ON public.user_uploads;
CREATE TRIGGER trg_enqueue_moderation_notification
AFTER UPDATE OF status ON public.user_uploads
FOR EACH ROW
EXECUTE FUNCTION public.enqueue_moderation_notification();

-- ========================
-- PART 6: Trigger — notify ALL ADMINS when a user uploads a new bhajan (INSERT with status=pending)
-- ========================
CREATE OR REPLACE FUNCTION public.notify_admins_new_upload()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_row RECORD;
BEGIN
  IF NEW.status IS DISTINCT FROM 'pending' THEN
    RETURN NEW;
  END IF;

  FOR admin_row IN
    SELECT id FROM public.user_profiles
    WHERE role IN ('moderator', 'admin', 'super_admin')
      AND id != NEW.user_id
  LOOP
    INSERT INTO public.moderation_notifications (user_id, bhajan_id, event_type, subject, body)
    VALUES (
      admin_row.id,
      NEW.id,
      'new_upload',
      'New bhajan submitted for review',
      'A new bhajan "' || NEW.title || '" was submitted and is awaiting moderation.'
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admins_new_upload ON public.user_uploads;
CREATE TRIGGER trg_notify_admins_new_upload
AFTER INSERT ON public.user_uploads
FOR EACH ROW
EXECUTE FUNCTION public.notify_admins_new_upload();

-- ========================
-- PART 7: Update event_type constraint to include 'new_upload'
-- ========================
ALTER TABLE public.moderation_notifications
DROP CONSTRAINT IF EXISTS moderation_notifications_event_type_check;

ALTER TABLE public.moderation_notifications
ADD CONSTRAINT moderation_notifications_event_type_check CHECK (
  event_type IN ('approved', 'rejected', 'changes_requested', 'new_upload')
);

-- ========================
-- PART 8: Mark-as-read RPC (in-app only)
-- ========================
CREATE OR REPLACE FUNCTION public.mark_my_moderation_notifications_read()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.moderation_notifications
  SET read = TRUE
  WHERE user_id = auth.uid()
    AND read = FALSE;
$$;

REVOKE ALL ON FUNCTION public.mark_my_moderation_notifications_read() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_my_moderation_notifications_read() TO authenticated;

-- ========================
-- PART 9: Allow admins to read all profiles (needed for admin accounts page)
-- ========================
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.user_profiles;
CREATE POLICY "Admins can read all profiles" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = id
    OR public.has_admin_role(auth.uid())
  );

-- Done! After running this, hard-refresh the app (Ctrl+Shift+R).
