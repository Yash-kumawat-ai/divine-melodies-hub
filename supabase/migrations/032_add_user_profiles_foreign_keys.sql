-- ============================================================
-- 032: ADD FOREIGN KEYS TO USER_PROFILES FOR PostgREST JOINS
-- ============================================================

-- 1. community_posts -> user_profiles (author_id)
ALTER TABLE public.community_posts
  DROP CONSTRAINT IF EXISTS community_posts_author_id_profiles_fkey;

ALTER TABLE public.community_posts
  ADD CONSTRAINT community_posts_author_id_profiles_fkey
  FOREIGN KEY (author_id)
  REFERENCES public.user_profiles(id)
  ON DELETE CASCADE;

-- 2. post_comments -> user_profiles (author_id)
ALTER TABLE public.post_comments
  DROP CONSTRAINT IF EXISTS post_comments_author_id_profiles_fkey;

ALTER TABLE public.post_comments
  ADD CONSTRAINT post_comments_author_id_profiles_fkey
  FOREIGN KEY (author_id)
  REFERENCES public.user_profiles(id)
  ON DELETE CASCADE;

-- 3. group_members -> user_profiles (user_id)
ALTER TABLE public.group_members
  DROP CONSTRAINT IF EXISTS group_members_user_id_profiles_fkey;

ALTER TABLE public.group_members
  ADD CONSTRAINT group_members_user_id_profiles_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.user_profiles(id)
  ON DELETE CASCADE;
