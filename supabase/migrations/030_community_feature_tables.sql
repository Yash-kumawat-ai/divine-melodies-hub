-- ============================================================
-- Community Feature Tables and Security Policies
-- ============================================================

-- 1) Create Groups Table
CREATE TABLE IF NOT EXISTS public.groups (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT        NOT NULL,
  description  TEXT,
  deity        TEXT        NOT NULL DEFAULT 'rama', -- Ram, Hanuman, Krishna, Shiva, Sai Baba
  slug         TEXT        UNIQUE,
  created_by   UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure slug column exists (safe if table already existed)
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS slug TEXT;

-- Helper function to generate slug from a string
CREATE OR REPLACE FUNCTION public.slugify(value TEXT)
RETURNS TEXT AS $$
DECLARE
  l_slug TEXT;
BEGIN
  -- Lowercase the string
  l_slug := lower(value);
  -- Replace all non-alphanumeric characters with hyphens
  l_slug := regexp_replace(l_slug, '[^a-z0-9]+', '-', 'g');
  -- Remove leading and trailing hyphens
  l_slug := regexp_replace(l_slug, '^-+|-+$', '', 'g');
  
  -- Handle empty or null result
  IF l_slug IS NULL OR l_slug = '' THEN
    l_slug := 'group';
  END IF;
  
  RETURN l_slug;
END;
$$ LANGUAGE plpgsql STRICT IMMUTABLE;

-- Trigger function to automatically generate/validate slug on group creation/update
CREATE OR REPLACE FUNCTION public.handle_group_slug()
RETURNS TRIGGER AS $$
DECLARE
  suffix_counter INT := 1;
  base_slug TEXT;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.slugify(NEW.name);
  ELSE
    NEW.slug := public.slugify(NEW.slug);
  END IF;
  
  base_slug := NEW.slug;
  
  -- Ensure slug uniqueness
  WHILE EXISTS (
    SELECT 1 FROM public.groups 
    WHERE slug = NEW.slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) LOOP
    NEW.slug := base_slug || '-' || suffix_counter;
    suffix_counter := suffix_counter + 1;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_group_slug_generate
  BEFORE INSERT OR UPDATE OF name, slug ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_group_slug();

-- Force an update on all existing rows where slug is NULL to trigger slug generation
UPDATE public.groups SET name = name WHERE slug IS NULL;

-- Now add the UNIQUE constraint on the slug column safely
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'groups_slug_key'
  ) THEN
    ALTER TABLE public.groups ADD CONSTRAINT groups_slug_key UNIQUE (slug);
  END IF;
END;
$$;

-- 2) Create Group Members Table
CREATE TABLE IF NOT EXISTS public.group_members (
  group_id   UUID        NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT        NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

-- Trigger to automatically add group creator as admin
CREATE OR REPLACE FUNCTION public.handle_group_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin')
  ON CONFLICT (group_id, user_id) DO UPDATE SET role = 'admin';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_group_created
  AFTER INSERT ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_group_creation();

-- 3) Create Community Posts Table
CREATE TABLE IF NOT EXISTS public.community_posts (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id            UUID        REFERENCES public.groups(id) ON DELETE CASCADE,
  author_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type                TEXT        NOT NULL CHECK (type IN ('bhajan_share', 'bhajan_request', 'question', 'thought', 'event')),
  title               TEXT,       -- Bhajan Share, Bhajan Request, Event Title
  content             TEXT        NOT NULL, -- Excerpt, Description, Thought, etc.
  image_url           TEXT,       -- Custom image uploaded to Cloudinary
  youtube_url         TEXT,       -- YouTube video URL
  question_options    JSONB,      -- Quick-tap structured choices for Question type
  status              TEXT        NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'removed')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Event fields
  event_datetime      TIMESTAMPTZ,
  event_location      TEXT,
  linked_bhajan_id    UUID        REFERENCES public.user_uploads(id) ON DELETE SET NULL,
  -- Bhajan Request fields
  request_status      TEXT        NOT NULL DEFAULT 'open' CHECK (request_status IN ('open', 'lyrics_submitted', 'in_review', 'added_to_library', 'closed_unresolved')),
  resolved_bhajan_id  UUID        REFERENCES public.user_uploads(id) ON DELETE SET NULL
);

-- 4) Create Post Reactions Table
CREATE TABLE IF NOT EXISTS public.post_reactions (
  post_id    UUID        NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

-- 5) Create Post Comments Table
CREATE TABLE IF NOT EXISTS public.post_comments (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id             UUID        NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content             TEXT        NOT NULL,
  is_lyrics_submission BOOLEAN     NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6) Create Event RSVPs Table
CREATE TABLE IF NOT EXISTS public.event_rsvps (
  post_id     UUID        NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rsvp_status TEXT        NOT NULL CHECK (rsvp_status IN ('interested', 'going')),
  responded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

-- 7) Create Question Option Votes Table
CREATE TABLE IF NOT EXISTS public.question_option_votes (
  post_id      UUID        NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  option_index SMALLINT    NOT NULL,
  voted_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

-- ============================================================
-- INDEXES FOR FASTER QUERIES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_community_posts_group ON public.community_posts(group_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_type ON public.community_posts(type);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_group_created ON public.community_posts (group_id, created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_option_votes ENABLE ROW LEVEL SECURITY;

-- ── Groups Policies ──
CREATE POLICY "Public groups visible to authenticated users"
  ON public.groups FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create groups"
  ON public.groups FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update groups"
  ON public.groups FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete groups"
  ON public.groups FOR DELETE TO authenticated
  USING (auth.uid() = created_by);

-- ── Group Members Policies ──
CREATE POLICY "Members visible to authenticated users"
  ON public.group_members FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can join groups"
  ON public.group_members FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can leave groups"
  ON public.group_members FOR DELETE TO authenticated
  USING (
    -- Either the group itself is being deleted (so its row in public.groups is gone)
    NOT EXISTS (
      SELECT 1 FROM public.groups WHERE id = group_members.group_id
    )
    OR
    (
      -- Authorized to delete:
      (
        auth.uid() = user_id 
        OR 
        EXISTS (
          SELECT 1 FROM public.group_members 
          WHERE group_id = group_members.group_id 
            AND user_id = auth.uid() 
            AND role = 'admin'
        )
      )
      -- AND protection against leaving the group admin-less:
      AND (
        role != 'admin' 
        OR 
        EXISTS (
          SELECT 1 FROM public.group_members 
          WHERE group_id = group_members.group_id 
            AND user_id != group_members.user_id 
            AND role = 'admin'
        )
      )
    )
  );

-- ── Community Posts Policies ──
CREATE POLICY "Approved posts visible to authenticated users"
  ON public.community_posts FOR SELECT TO authenticated
  USING (status = 'approved');

DROP POLICY IF EXISTS "Authenticated users can insert posts" ON public.community_posts;
CREATE POLICY "Authenticated users can insert posts"
  ON public.community_posts
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND status = 'approved'
    AND (
      -- Global community feed
      group_id IS NULL
      OR
      -- Group-specific post
      EXISTS (
        SELECT 1
        FROM public.group_members gm
        WHERE gm.group_id = community_posts.group_id
        AND gm.user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Authors can update their own posts" ON public.community_posts;
DROP POLICY IF EXISTS "Admins or group creators can soft remove posts" ON public.community_posts;
DROP POLICY IF EXISTS "Update community posts" ON public.community_posts;

CREATE POLICY "Update community posts"
  ON public.community_posts
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = author_id
    OR public.has_admin_role(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = community_posts.group_id 
        AND gm.user_id = auth.uid() 
        AND gm.role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() = author_id
    OR
    (
      (
        public.has_admin_role(auth.uid())
        OR EXISTS (
          SELECT 1 FROM public.group_members gm
          WHERE gm.group_id = community_posts.group_id 
            AND gm.user_id = auth.uid() 
            AND gm.role = 'admin'
        )
      )
      AND status = 'removed'
    )
  );

DROP POLICY IF EXISTS "Authors can delete their own posts" ON public.community_posts;
CREATE POLICY "Authors can delete their own posts"
  ON public.community_posts
  FOR DELETE TO authenticated
  USING (
    auth.uid() = author_id
  );

-- ── Post Reactions Policies ──
CREATE POLICY "Reactions visible to authenticated users"
  ON public.post_reactions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can toggle reactions"
  ON public.post_reactions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can remove reactions"
  ON public.post_reactions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ── Post Comments Policies ──
CREATE POLICY "Comments visible to authenticated users"
  ON public.post_comments FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can comment"
  ON public.post_comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Comment authors can delete comments"
  ON public.post_comments FOR DELETE TO authenticated
  USING (auth.uid() = author_id);

-- ── Event RSVPs Policies ──
CREATE POLICY "RSVPs visible to authenticated users"
  ON public.event_rsvps FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can RSVP"
  ON public.event_rsvps FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update RSVP"
  ON public.event_rsvps FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete RSVP"
  ON public.event_rsvps FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ── Question Option Votes Policies ──
CREATE POLICY "Votes visible to authenticated users"
  ON public.question_option_votes FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can vote"
  ON public.question_option_votes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can change vote"
  ON public.question_option_votes FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete vote"
  ON public.question_option_votes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
