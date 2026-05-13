-- ============================================================
-- Migration 019: Newsletter subscribers + user plan column
-- ============================================================

-- FIX #1: Ensure pgcrypto extension exists for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- FIX #2: Guard against missing user_profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_profiles'
  ) THEN
    RAISE EXCEPTION 'Table public.user_profiles does not exist. Run earlier migrations first.';
  END IF;
END $$;

-- FIX #2b: Guard against missing role column on user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'role'
  ) THEN
    RAISE EXCEPTION 'Column public.user_profiles.role does not exist. Run migration 016 first.';
  END IF;
END $$;

-- ============================================================
-- Newsletter subscribers table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  unsubscribed_at TIMESTAMPTZ,
  ip_address INET,
  CONSTRAINT newsletter_email_unique UNIQUE (email),
  CONSTRAINT newsletter_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- FIX #4: Only authenticated users can subscribe (prevents anonymous bot spam)
-- The UNIQUE constraint on email prevents duplicates
DROP POLICY IF EXISTS "Authenticated users can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Authenticated users can subscribe"
  ON public.newsletter_subscribers FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- FIX #3 & #5: Admin SELECT policy — safe because role column is verified above
-- FIX #5: users cannot edit their own role (enforced by user_profiles RLS)
DROP POLICY IF EXISTS "Only admins can read subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Only admins can read subscribers"
  ON public.newsletter_subscribers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- No UPDATE or DELETE policy = nobody can modify/delete rows via API
-- Admins can manage via Supabase dashboard if needed

-- ============================================================
-- FIX #5: Ensure users CANNOT update their own role column
-- Drop and recreate the self-update policy to explicitly exclude role
-- ============================================================
DO $$
BEGIN
  -- Only apply if the restrictive policy doesn't already exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_profiles'
    AND policyname = 'Users can update own profile except role'
  ) THEN
    -- Drop the old permissive policy if it exists
    DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

    CREATE POLICY "Users can update own profile except role"
      ON public.user_profiles FOR UPDATE
      TO authenticated
      USING (id = auth.uid())
      WITH CHECK (
        id = auth.uid()
        AND role IS NOT DISTINCT FROM (SELECT role FROM public.user_profiles WHERE id = auth.uid())
      );
  END IF;
END $$;

-- ============================================================
-- FIX #6 & #7: Add plan column with safe default and flexible constraint
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'user_profiles'
    AND column_name = 'plan'
  ) THEN
    ALTER TABLE public.user_profiles
      ADD COLUMN plan TEXT DEFAULT 'free'
      CONSTRAINT user_plan_valid CHECK (plan IN ('free', 'devotee', 'seva'));
  END IF;
END $$;

-- ============================================================
-- Summary of what this migration does:
--
-- 1. Creates newsletter_subscribers table (email, timestamps)
-- 2. RLS: only authenticated users can subscribe (no anon spam)
-- 3. RLS: only admin/super_admin can read subscriber list
-- 4. RLS: nobody can update/delete subscribers via API
-- 5. Locks down user_profiles.role — users cannot change their own role
-- 6. Adds plan column (free/devotee/seva) to user_profiles
--
-- Dependencies: pgcrypto extension, user_profiles table, role column
-- Non-destructive: does NOT delete tables, users, or data
-- ============================================================
 