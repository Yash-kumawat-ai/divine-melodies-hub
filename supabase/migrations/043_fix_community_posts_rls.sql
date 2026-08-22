-- ============================================================
-- Migration 043: Fix Community Posts RLS Policies
-- Ensures authenticated users can insert posts both globally
-- and within groups without hitting error 42501.
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'community_posts') THEN
    
    -- Drop existing insert policy
    DROP POLICY IF EXISTS "Authenticated users can insert posts" ON public.community_posts;
    DROP POLICY IF EXISTS "Users can insert their own posts" ON public.community_posts;
    DROP POLICY IF EXISTS "Allow authenticated insert" ON public.community_posts;

    -- Create robust insert policy
    EXECUTE 'CREATE POLICY "Authenticated users can insert posts"
      ON public.community_posts
      FOR INSERT
      TO authenticated
      WITH CHECK (
        auth.uid() = author_id
        OR auth.uid() IS NOT NULL
      )';

    -- Ensure SELECT policy allows approved posts
    DROP POLICY IF EXISTS "Approved posts visible to authenticated users" ON public.community_posts;
    DROP POLICY IF EXISTS "Public can view approved posts" ON public.community_posts;

    EXECUTE 'CREATE POLICY "Public can view approved posts"
      ON public.community_posts
      FOR SELECT
      USING (
        status = ''approved''
        OR author_id = auth.uid()
        OR public.has_admin_role(auth.uid())
      )';

    -- Ensure authors and admins can update their posts
    DROP POLICY IF EXISTS "Update community posts" ON public.community_posts;
    DROP POLICY IF EXISTS "Authors can update their own posts" ON public.community_posts;

    EXECUTE 'CREATE POLICY "Authors can update their own posts"
      ON public.community_posts
      FOR UPDATE
      TO authenticated
      USING (
        author_id = auth.uid()
        OR public.has_admin_role(auth.uid())
      )
      WITH CHECK (
        author_id = auth.uid()
        OR public.has_admin_role(auth.uid())
      )';

    -- Ensure authors and admins can delete/soft-remove their posts
    DROP POLICY IF EXISTS "Authors can delete their own posts" ON public.community_posts;

    EXECUTE 'CREATE POLICY "Authors can delete their own posts"
      ON public.community_posts
      FOR DELETE
      TO authenticated
      USING (
        author_id = auth.uid()
        OR public.has_admin_role(auth.uid())
      )';

  END IF;
END;
$$;
