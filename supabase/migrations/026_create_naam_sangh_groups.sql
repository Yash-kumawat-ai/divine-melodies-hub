-- ============================================================
-- Migration 026: Create Naam Sangh Groups
-- 
-- Adds support for community chanting groups with:
-- - Non-unique group names
-- - Invite codes (e.g., RAMA108) instead of UUIDs for joining
-- - Image URL for card display
-- - Member count cache with triggers
-- - Public / Private group visibility
-- ============================================================

-- 1. Create the groups table
CREATE TABLE IF NOT EXISTS public.naam_sangh_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  target_count INTEGER NOT NULL DEFAULT 100000,
  image_url TEXT,
  invite_code TEXT UNIQUE NOT NULL,
  member_count INTEGER DEFAULT 1,
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create the group memberships table
CREATE TABLE IF NOT EXISTS public.naam_sangh_members (
  group_id UUID REFERENCES public.naam_sangh_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);


-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

-- Enable RLS
ALTER TABLE public.naam_sangh_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.naam_sangh_members ENABLE ROW LEVEL SECURITY;

-- Policies for groups
CREATE POLICY "Anyone can view public groups"
  ON public.naam_sangh_groups
  FOR SELECT
  USING (is_public = true OR auth.uid() IN (
    SELECT user_id FROM public.naam_sangh_members WHERE group_id = id
  ));

CREATE POLICY "Authenticated users can create groups"
  ON public.naam_sangh_groups
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update own groups"
  ON public.naam_sangh_groups
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can delete own groups"
  ON public.naam_sangh_groups
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Policies for memberships
CREATE POLICY "Anyone can view memberships"
  ON public.naam_sangh_members
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can join groups"
  ON public.naam_sangh_members
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can leave groups"
  ON public.naam_sangh_members
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ============================================================
-- Triggers for Automated Member Count Caching
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_naam_sangh_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.naam_sangh_groups
    SET member_count = COALESCE(member_count, 0) + 1
    WHERE id = NEW.group_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.naam_sangh_groups
    SET member_count = GREATEST(1, COALESCE(member_count, 1) - 1)
    WHERE id = OLD.group_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_naam_sangh_member_count_change ON public.naam_sangh_members;
CREATE TRIGGER trg_naam_sangh_member_count_change
AFTER INSERT OR DELETE ON public.naam_sangh_members
FOR EACH ROW
EXECUTE FUNCTION public.update_naam_sangh_member_count();
