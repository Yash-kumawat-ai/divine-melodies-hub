-- 020: Keep auth profile creation reliable for email and Google signups.
-- Run after 019.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  profile_name TEXT;
  profile_email TEXT;
BEGIN
  profile_name := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'name', ''),
    NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
    NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''),
    'Devotee'
  );

  profile_email := COALESCE(
    NULLIF(NEW.email, ''),
    CONCAT(NEW.id::TEXT, '@user.local')
  );

  INSERT INTO public.user_profiles (id, email, name)
  VALUES (NEW.id, profile_email, profile_name)
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(NULLIF(public.user_profiles.email, ''), EXCLUDED.email),
    name = COALESCE(NULLIF(public.user_profiles.name, ''), EXCLUDED.name),
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.user_profiles (id, email, name)
SELECT
  users.id,
  COALESCE(
    NULLIF(users.email, ''),
    CONCAT(users.id::TEXT, '@user.local')
  ),
  COALESCE(
    NULLIF(users.raw_user_meta_data->>'name', ''),
    NULLIF(users.raw_user_meta_data->>'full_name', ''),
    NULLIF(split_part(COALESCE(users.email, ''), '@', 1), ''),
    'Devotee'
  )
FROM auth.users AS users
ON CONFLICT (id) DO UPDATE SET
  email = COALESCE(NULLIF(public.user_profiles.email, ''), EXCLUDED.email),
  name = COALESCE(NULLIF(public.user_profiles.name, ''), EXCLUDED.name),
  updated_at = now();
