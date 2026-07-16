-- Migration 039: Unify Groups Schema (Naam Sangh + Community Feed Groups)
-- Target: Consolidate into a single 'groups' entity with group-scoped chanting

BEGIN;

-- ──────────────────────────────────────────────────────────
-- STEP 1: Extend the 'groups' table
-- ──────────────────────────────────────────────────────────
ALTER TABLE public.groups
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS target_count BIGINT DEFAULT 100000,
ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- ──────────────────────────────────────────────────────────
-- STEP 2: Migrate group + membership data
-- ──────────────────────────────────────────────────────────

-- 1. Copy Japa groups to unified groups (preserving original IDs)
INSERT INTO public.groups (
  id,
  name,
  description,
  image_url,
  invite_code,
  target_count,
  member_count,
  is_public,
  created_by,
  created_at,
  updated_at
)
SELECT 
  id,
  name,
  description,
  image_url,
  invite_code,
  target_count,
  member_count,
  is_public,
  created_by,
  created_at,
  updated_at
FROM public.naam_sangh_groups
ON CONFLICT (id) DO NOTHING;

-- 2. Copy Japa group memberships to group_members
INSERT INTO public.group_members (
  group_id,
  user_id,
  role,
  joined_at
)
SELECT 
  m.group_id,
  m.user_id,
  CASE 
    WHEN m.user_id = g.created_by THEN 'admin'
    ELSE 'member'
  END,
  m.joined_at
FROM public.naam_sangh_members m
JOIN public.naam_sangh_groups g ON m.group_id = g.id
ON CONFLICT (group_id, user_id) DO NOTHING;

-- ──────────────────────────────────────────────────────────
-- STEP 3: Re-point foreign keys
-- ──────────────────────────────────────────────────────────

-- Re-point naam_sangh_member_stats
ALTER TABLE public.naam_sangh_member_stats
DROP CONSTRAINT IF EXISTS naam_sangh_member_stats_group_id_fkey;

ALTER TABLE public.naam_sangh_member_stats
ADD CONSTRAINT naam_sangh_member_stats_group_id_fkey
FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;

-- Re-point naam_sangh_progress
ALTER TABLE public.naam_sangh_progress
DROP CONSTRAINT IF EXISTS naam_sangh_progress_group_id_fkey;

ALTER TABLE public.naam_sangh_progress
ADD CONSTRAINT naam_sangh_progress_group_id_fkey
FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;

-- ──────────────────────────────────────────────────────────
-- STEP 4: Update triggers and functions
-- ──────────────────────────────────────────────────────────

-- 1. trg_naam_sangh_member_count -> updates groups.member_count based on group_members
CREATE OR REPLACE FUNCTION public.refresh_member_count(p_group_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.groups
  SET
    member_count = (
      SELECT COUNT(*)
      FROM public.group_members
      WHERE group_id = p_group_id
    ),
    updated_at = now()
  WHERE id = p_group_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_refresh_member_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.refresh_member_count(NEW.group_id);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.refresh_member_count(OLD.group_id);
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_naam_sangh_member_count ON public.naam_sangh_members;

DROP TRIGGER IF EXISTS trg_group_member_count ON public.group_members;
CREATE TRIGGER trg_group_member_count
AFTER INSERT OR DELETE ON public.group_members
FOR EACH ROW
EXECUTE FUNCTION public.trg_refresh_member_count();

-- 2. init_member_stats_on_join -> fires on group_members insert
CREATE OR REPLACE FUNCTION public.init_member_stats_on_join()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.naam_sangh_member_stats
      (group_id, user_id, total_japs, weekly_japs, current_streak)
    VALUES
      (NEW.group_id, NEW.user_id, 0, 0, 0)
    ON CONFLICT (group_id, user_id) DO NOTHING;

  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.naam_sangh_member_stats
    WHERE group_id = OLD.group_id AND user_id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_init_member_stats ON public.naam_sangh_members;

DROP TRIGGER IF EXISTS trg_init_member_stats ON public.group_members;
CREATE TRIGGER trg_init_member_stats
AFTER INSERT OR DELETE ON public.group_members
FOR EACH ROW
EXECUTE FUNCTION public.init_member_stats_on_join();

-- 3. recalculate_group_progress -> queries groups instead of naam_sangh_groups
CREATE OR REPLACE FUNCTION public.recalculate_group_progress(p_group_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total  BIGINT;
  v_target BIGINT;
BEGIN
  SELECT COALESCE(SUM(total_japs), 0)
  INTO v_total
  FROM public.naam_sangh_member_stats
  WHERE group_id = p_group_id;

  SELECT target_count
  INTO v_target
  FROM public.groups
  WHERE id = p_group_id;

  INSERT INTO public.naam_sangh_progress
    (group_id, total_japs, completion_percent, updated_at)
  VALUES (
    p_group_id,
    v_total,
    CASE
      WHEN v_target IS NULL OR v_target <= 0 THEN 0
      ELSE LEAST(100, ROUND((v_total::numeric / v_target::numeric) * 100, 2))
    END,
    now()
  )
  ON CONFLICT (group_id) DO UPDATE SET
    total_japs         = EXCLUDED.total_japs,
    completion_percent = EXCLUDED.completion_percent,
    updated_at         = now();
END;
$$;

-- 4. init_group_progress -> fires on groups table instead of naam_sangh_groups
CREATE OR REPLACE FUNCTION public.init_group_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.naam_sangh_progress
    (group_id, total_japs, completion_percent, updated_at)
  VALUES (NEW.id, 0, 0, now())
  ON CONFLICT (group_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_init_group_progress ON public.naam_sangh_groups;

DROP TRIGGER IF EXISTS trg_init_group_progress ON public.groups;
CREATE TRIGGER trg_init_group_progress
AFTER INSERT ON public.groups
FOR EACH ROW
EXECUTE FUNCTION public.init_group_progress();

-- ──────────────────────────────────────────────────────────
-- STEP 5: Rewrite RLS policies
-- ──────────────────────────────────────────────────────────

-- 1. On groups SELECT: restrict view of private groups to members and creators
DROP POLICY IF EXISTS "Public groups visible to authenticated users" ON public.groups;

CREATE POLICY "Groups visible to authenticated users"
  ON public.groups FOR SELECT TO authenticated
  USING (
    is_public = true
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.group_members m
      WHERE m.group_id = id AND m.user_id = auth.uid()
    )
  );

-- 2. On naam_sangh_progress SELECT: lookup via group_members and unified groups
DROP POLICY IF EXISTS "Anyone can view group progress" ON public.naam_sangh_progress;

CREATE POLICY "Anyone can view group progress"
  ON public.naam_sangh_progress
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = naam_sangh_progress.group_id
        AND (
          g.is_public = true
          OR g.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.group_members m
            WHERE m.group_id = g.id AND m.user_id = auth.uid()
          )
        )
    )
  );

-- ──────────────────────────────────────────────────────────
-- STEP 6: Scope chant sessions to one group
-- ──────────────────────────────────────────────────────────

-- 1. Add group_id column to user_jap_sessions
ALTER TABLE public.user_jap_sessions 
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL;

-- 2. Update sync_jap_to_group_stats trigger function to respect group_id scoping
CREATE OR REPLACE FUNCTION public.sync_jap_to_group_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If Japa is personal only (no group selected), do not update group stats
  IF NEW.group_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.completed = true AND (OLD.completed IS DISTINCT FROM true) THEN
      UPDATE public.naam_sangh_member_stats
      SET
        total_japs  = total_japs  + NEW.actual_count,
        weekly_japs = weekly_japs + NEW.actual_count,
        last_jap_at = now()
      WHERE user_id = NEW.user_id AND group_id = NEW.group_id;
    END IF;
  ELSIF TG_OP = 'INSERT' THEN
    IF NEW.completed = true THEN
      UPDATE public.naam_sangh_member_stats
      SET
        total_japs  = total_japs  + NEW.actual_count,
        weekly_japs = weekly_japs + NEW.actual_count,
        last_jap_at = now()
      WHERE user_id = NEW.user_id AND group_id = NEW.group_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

COMMIT;
