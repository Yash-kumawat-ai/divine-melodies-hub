-- ============================================================
-- Migration 027: Create Naam Sangh Member Stats
-- 
-- Tracks user-specific totals, weekly counts, and streaks inside groups.
-- ============================================================

-- 1. Create the group member stats table
CREATE TABLE IF NOT EXISTS public.naam_sangh_member_stats (
  group_id UUID REFERENCES public.naam_sangh_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_japs BIGINT DEFAULT 0,
  weekly_japs BIGINT DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  PRIMARY KEY (group_id, user_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.naam_sangh_member_stats ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view stats
CREATE POLICY "Anyone can view member stats"
  ON public.naam_sangh_member_stats
  FOR SELECT
  USING (true);


-- ── Triggers for Managing Member Stats Rows & Initialization ───────────

CREATE OR REPLACE FUNCTION public.manage_naam_sangh_member_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_initial_japs BIGINT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Initialize user stats with their existing totals so they don't start from scratch
    SELECT COALESCE(SUM(total_chants), 0) INTO v_initial_japs
    FROM public.user_jap_totals
    WHERE user_id = NEW.user_id;

    INSERT INTO public.naam_sangh_member_stats (group_id, user_id, total_japs, weekly_japs, current_streak)
    VALUES (NEW.group_id, NEW.user_id, v_initial_japs, 0, 0)
    ON CONFLICT (group_id, user_id) DO NOTHING;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.naam_sangh_member_stats
    WHERE group_id = OLD.group_id AND user_id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_naam_sangh_member_stats_change ON public.naam_sangh_members;
CREATE TRIGGER trg_naam_sangh_member_stats_change
AFTER INSERT OR DELETE ON public.naam_sangh_members
FOR EACH ROW
EXECUTE FUNCTION public.manage_naam_sangh_member_stats();


-- ── Triggers to Automatically Increment Japas Across Joined Groups ──────

CREATE OR REPLACE FUNCTION public.update_naam_sangh_member_japs()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed = true AND (OLD.completed = false OR OLD.completed IS NULL) THEN
    -- Increment total_japs for this user across all groups they have joined
    UPDATE public.naam_sangh_member_stats
    SET total_japs = total_japs + NEW.actual_count
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_user_jap_sessions_group_update ON public.user_jap_sessions;
CREATE TRIGGER trg_user_jap_sessions_group_update
AFTER UPDATE ON public.user_jap_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_naam_sangh_member_japs();

CREATE OR REPLACE FUNCTION public.update_naam_sangh_member_japs_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed = true THEN
    UPDATE public.naam_sangh_member_stats
    SET total_japs = total_japs + NEW.actual_count
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_user_jap_sessions_group_insert ON public.user_jap_sessions;
CREATE TRIGGER trg_user_jap_sessions_group_insert
AFTER INSERT ON public.user_jap_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_naam_sangh_member_japs_insert();
