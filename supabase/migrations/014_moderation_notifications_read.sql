-- In-app read state for moderation_notifications (user-facing rows)
-- If the table does not exist, run `015_bootstrap_moderation_notifications.sql` first (UUID bhajan_id).
-- If 015 already ran, you can skip this file — it only adds `read` + RPC when missing.

ALTER TABLE moderation_notificationsADD COLUMN IF NOT EXISTS read BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS moderation_notifications_unread_idx
ON moderation_notifications (user_id, read)
WHERE read = FALSE;

COMMENT ON COLUMN moderation_notifications.read IS 'User has seen this in-app notification (bell / inbox).';

-- Safe bulk mark-as-read for the authenticated uploader (no broad UPDATE policy for users)
CREATE OR REPLACE FUNCTION public.mark_my_moderation_notifications_read()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE moderation_notifications
  SET read = TRUE
  WHERE user_id = auth.uid()
    AND read = FALSE;
$$;

REVOKE ALL ON FUNCTION public.mark_my_moderation_notifications_read() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_my_moderation_notifications_read() TO authenticated;
