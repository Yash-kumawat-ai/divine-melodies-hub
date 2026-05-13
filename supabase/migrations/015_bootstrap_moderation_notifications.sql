-- Bootstrap moderation_notifications + RLS + triggers + mark-read RPC.
-- Your project uses UUID primary keys on public.user_uploads (see migration 006).
-- Run this whole file once in the Supabase SQL editor.
--
-- If a previous attempt created moderation_notifications with the wrong column types,
-- this drops it first (only this table — no data in it yet in the typical failed-run case).

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

DROP TABLE IF EXISTS public.moderation_notifications CASCADE;

CREATE TABLE public.moderation_notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bhajan_id UUID NOT NULL REFERENCES public.user_uploads(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  email_to TEXT,
  delivery_channel TEXT NOT NULL DEFAULT 'email',
  delivery_status TEXT NOT NULL DEFAULT 'queued',
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT moderation_notifications_event_type_check CHECK (
    event_type IN ('approved', 'rejected', 'changes_requested')
  ),
  CONSTRAINT moderation_notifications_delivery_status_check CHECK (
    delivery_status IN ('queued', 'sent', 'failed')
  )
);

CREATE INDEX moderation_notifications_user_idx
  ON public.moderation_notifications(user_id, created_at DESC);

CREATE INDEX moderation_notifications_status_idx
  ON public.moderation_notifications(delivery_status, created_at);

CREATE INDEX moderation_notifications_unread_idx
  ON public.moderation_notifications(user_id, read)
  WHERE read = FALSE;

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

ALTER TABLE public.moderation_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own moderation notifications" ON public.moderation_notifications;
CREATE POLICY "Users can view own moderation notifications" ON public.moderation_notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_admin_role(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage moderation notifications" ON public.moderation_notifications;
CREATE POLICY "Admins can manage moderation notifications" ON public.moderation_notifications
  FOR ALL TO authenticated
  USING (public.has_admin_role(auth.uid()))
  WITH CHECK (public.has_admin_role(auth.uid()));

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

  INSERT INTO public.moderation_notifications (user_id, bhajan_id, event_type, subject, body, email_to)
  VALUES (NEW.user_id, NEW.id, NEW.status, event_subject, event_body, NULL);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enqueue_moderation_notification ON public.user_uploads;
CREATE TRIGGER trg_enqueue_moderation_notification
AFTER UPDATE OF status ON public.user_uploads
FOR EACH ROW
EXECUTE FUNCTION public.enqueue_moderation_notification();

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

COMMENT ON COLUMN public.moderation_notifications.read IS 'User has seen this in-app notification (bell / inbox).';
