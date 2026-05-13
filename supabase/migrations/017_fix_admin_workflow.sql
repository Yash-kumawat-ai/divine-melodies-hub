-- 017: Guarantee admin RLS policies work for moderation workflow.
-- Run once in Supabase SQL Editor after 016.

-- 1) Ensure has_admin_role() exists
CREATE OR REPLACE FUNCTION public.has_admin_role(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = check_user_id
      AND role IN ('moderator', 'admin', 'super_admin')
  );
$$;

-- 2) Admin SELECT on user_uploads (see all, including pending)
DROP POLICY IF EXISTS "Admins can read all uploads" ON public.user_uploads;
CREATE POLICY "Admins can read all uploads" ON public.user_uploads
  FOR SELECT TO authenticated
  USING (
    public.has_admin_role(auth.uid())
    OR auth.uid() = user_id
    OR status = 'approved'
    OR status IS NULL
  );

-- 3) Admin UPDATE on user_uploads (approve / reject / etc.)
DROP POLICY IF EXISTS "Admins can update any uploads" ON public.user_uploads;
CREATE POLICY "Admins can update any uploads" ON public.user_uploads
  FOR UPDATE TO authenticated
  USING (public.has_admin_role(auth.uid()))
  WITH CHECK (public.has_admin_role(auth.uid()));

-- 4) Ensure the signup trigger creates profile rows
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5) Backfill any auth.users missing from user_profiles
INSERT INTO public.user_profiles (id, email, name, role)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)),
  'user'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Done. Hard-refresh app after running.
