-- 018: Add all columns that migration 008 should have created.
-- Safe to run multiple times (IF NOT EXISTS / idempotent).
-- Run this in Supabase SQL Editor.

-- 1) user_uploads moderation columns
ALTER TABLE public.user_uploads
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS reviewed_by UUID,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS request_changes_notes TEXT,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS archived_by UUID,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS featured_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS featured_by UUID,
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'Hindi',
ADD COLUMN IF NOT EXISTS play_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;

-- 2) user_profiles admin columns
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_admin_activity_at TIMESTAMP WITH TIME ZONE;

-- 3) Extend status constraint to include all values
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_uploads_status_check'
      AND conrelid = 'user_uploads'::regclass
  ) THEN
    ALTER TABLE public.user_uploads DROP CONSTRAINT user_uploads_status_check;
  END IF;
END $$;

ALTER TABLE public.user_uploads
ADD CONSTRAINT user_uploads_status_check CHECK (
  status IN ('pending', 'approved', 'rejected', 'changes_requested', 'resubmitted', 'archived')
);

-- 4) Create admin_audit_logs if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id BIGSERIAL PRIMARY KEY,
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL DEFAULT 'user_upload',
  entity_id BIGINT NOT NULL,
  old_status TEXT,
  new_status TEXT,
  reason TEXT,
  action_ip TEXT,
  action_user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can insert audit logs" ON public.admin_audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.has_admin_role(auth.uid()) AND auth.uid() = admin_user_id);

DROP POLICY IF EXISTS "Admins can read audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can read audit logs" ON public.admin_audit_logs
  FOR SELECT TO authenticated
  USING (public.has_admin_role(auth.uid()));

-- 5) Create useful indexes
CREATE INDEX IF NOT EXISTS user_uploads_reviewed_at_idx ON public.user_uploads(reviewed_at DESC);
CREATE INDEX IF NOT EXISTS admin_audit_logs_created_idx ON public.admin_audit_logs(created_at DESC);

-- Done! Hard-refresh the app after running.
