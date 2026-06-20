-- ============================================================
-- Naam Sangh Complete Schema (Final — Safe Execution Order)
-- 
-- ORDER:
--   STEP 1: Create all tables (no cross-references yet)
--   STEP 2: Create all indexes
--   STEP 3: Enable RLS + create all policies
--   STEP 4: Create all functions + triggers
--   STEP 5: Backfill existing rows
-- ============================================================


-- ============================================================
-- STEP 1: CREATE ALL TABLES
-- ============================================================

-- 026: Groups
CREATE TABLE IF NOT EXISTS public.naam_sangh_groups (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT        NOT NULL,
  description  TEXT,
  image_url    TEXT,
  invite_code  TEXT        NOT NULL UNIQUE
                             CHECK (invite_code ~ '^[A-Z0-9]{4,20}$'),
  target_count BIGINT      NOT NULL DEFAULT 100000,
  member_count INTEGER     NOT NULL DEFAULT 0,
  is_public    BOOLEAN     NOT NULL DEFAULT true,
  created_by   UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 027: Memberships
CREATE TABLE IF NOT EXISTS public.naam_sangh_members (
  group_id  UUID        NOT NULL REFERENCES public.naam_sangh_groups(id) ON DELETE CASCADE,
  user_id   UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

-- 028: Member Stats
CREATE TABLE IF NOT EXISTS public.naam_sangh_member_stats (
  group_id       UUID        NOT NULL REFERENCES public.naam_sangh_groups(id) ON DELETE CASCADE,
  user_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_japs     BIGINT      NOT NULL DEFAULT 0,
  weekly_japs    BIGINT      NOT NULL DEFAULT 0,
  current_streak INTEGER     NOT NULL DEFAULT 0,
  last_jap_at    TIMESTAMPTZ,
  PRIMARY KEY (group_id, user_id)
);

-- 029: Progress Cache
CREATE TABLE IF NOT EXISTS public.naam_sangh_progress (
  group_id           UUID         PRIMARY KEY REFERENCES public.naam_sangh_groups(id) ON DELETE CASCADE,
  total_japs         BIGINT       NOT NULL DEFAULT 0,
  completion_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  updated_at         TIMESTAMPTZ  NOT NULL DEFAULT now()
);


-- ============================================================
-- STEP 2: CREATE ALL INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_naam_sangh_groups_invite_code
  ON public.naam_sangh_groups(invite_code);

CREATE INDEX IF NOT EXISTS idx_naam_sangh_groups_created_by
  ON public.naam_sangh_groups(created_by);

CREATE INDEX IF NOT EXISTS idx_naam_sangh_members_user
  ON public.naam_sangh_members(user_id);

CREATE INDEX IF NOT EXISTS idx_naam_sangh_members_group
  ON public.naam_sangh_members(group_id);

-- Leaderboard index: fast top-chanters per group
CREATE INDEX IF NOT EXISTS idx_naam_sangh_leaderboard
  ON public.naam_sangh_member_stats(group_id, total_japs DESC);


-- ============================================================
-- STEP 3: ENABLE RLS + ALL POLICIES
-- (All tables already exist — no forward-reference errors)
-- ============================================================

ALTER TABLE public.naam_sangh_groups       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.naam_sangh_members      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.naam_sangh_member_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.naam_sangh_progress     ENABLE ROW LEVEL SECURITY;

-- ── naam_sangh_groups policies ────────────────────────────
DROP POLICY IF EXISTS "Public groups visible to all"       ON public.naam_sangh_groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.naam_sangh_groups;
DROP POLICY IF EXISTS "Creators can update own groups"     ON public.naam_sangh_groups;
DROP POLICY IF EXISTS "Creators can delete own groups"     ON public.naam_sangh_groups;

CREATE POLICY "Public groups visible to all"
  ON public.naam_sangh_groups
  FOR SELECT
  USING (
    is_public = true
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.naam_sangh_members m
      WHERE m.group_id = id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create groups"
  ON public.naam_sangh_groups
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update own groups"
  ON public.naam_sangh_groups
  FOR UPDATE
  TO authenticated
  USING     (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can delete own groups"
  ON public.naam_sangh_groups
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- ── naam_sangh_members policies ───────────────────────────
DROP POLICY IF EXISTS "Anyone can view memberships" ON public.naam_sangh_members;
DROP POLICY IF EXISTS "Users can join groups"       ON public.naam_sangh_members;
DROP POLICY IF EXISTS "Users can leave groups"      ON public.naam_sangh_members;

CREATE POLICY "Anyone can view memberships"
  ON public.naam_sangh_members
  FOR SELECT
  USING (true);

CREATE POLICY "Users can join groups"
  ON public.naam_sangh_members
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
  ON public.naam_sangh_members
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ── naam_sangh_member_stats policies ──────────────────────
DROP POLICY IF EXISTS "Anyone can view member stats"    ON public.naam_sangh_member_stats;
DROP POLICY IF EXISTS "System can insert member stats"  ON public.naam_sangh_member_stats;

CREATE POLICY "Anyone can view member stats"
  ON public.naam_sangh_member_stats
  FOR SELECT
  USING (true);

CREATE POLICY "System can insert member stats"
  ON public.naam_sangh_member_stats
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ── naam_sangh_progress policies ──────────────────────────
DROP POLICY IF EXISTS "Anyone can view group progress" ON public.naam_sangh_progress;

CREATE POLICY "Anyone can view group progress"
  ON public.naam_sangh_progress
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.naam_sangh_groups g
      WHERE g.id = naam_sangh_progress.group_id
        AND (
          g.is_public = true
          OR g.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.naam_sangh_members m
            WHERE m.group_id = g.id AND m.user_id = auth.uid()
          )
        )
    )
  );


-- ============================================================
-- STEP 4: ALL FUNCTIONS + TRIGGERS
-- ============================================================

-- ── A. Auto-join creator when group is created ─────────────
CREATE OR REPLACE FUNCTION public.auto_join_group_creator()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.naam_sangh_members (group_id, user_id)
  VALUES (NEW.id, NEW.created_by)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_join_group_creator ON public.naam_sangh_groups;
CREATE TRIGGER trg_auto_join_group_creator
AFTER INSERT ON public.naam_sangh_groups
FOR EACH ROW
EXECUTE FUNCTION public.auto_join_group_creator();


-- ── B. Accurate member count (recalculate — never drift) ───
CREATE OR REPLACE FUNCTION public.refresh_member_count(p_group_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.naam_sangh_groups
  SET
    member_count = (
      SELECT COUNT(*)
      FROM public.naam_sangh_members
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
CREATE TRIGGER trg_naam_sangh_member_count
AFTER INSERT OR DELETE ON public.naam_sangh_members
FOR EACH ROW
EXECUTE FUNCTION public.trg_refresh_member_count();


-- ── C. Initialize stats row on join (starts at 0) ──────────
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
CREATE TRIGGER trg_init_member_stats
AFTER INSERT OR DELETE ON public.naam_sangh_members
FOR EACH ROW
EXECUTE FUNCTION public.init_member_stats_on_join();


-- ── D. Sync Japa completions → member stats in all groups ──
CREATE OR REPLACE FUNCTION public.sync_jap_to_group_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.completed = true AND (OLD.completed IS DISTINCT FROM true) THEN
      UPDATE public.naam_sangh_member_stats
      SET
        total_japs  = total_japs  + NEW.actual_count,
        weekly_japs = weekly_japs + NEW.actual_count,
        last_jap_at = now()
      WHERE user_id = NEW.user_id;
    END IF;
  ELSIF TG_OP = 'INSERT' THEN
    IF NEW.completed = true THEN
      UPDATE public.naam_sangh_member_stats
      SET
        total_japs  = total_japs  + NEW.actual_count,
        weekly_japs = weekly_japs + NEW.actual_count,
        last_jap_at = now()
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_jap_to_group_stats_update ON public.user_jap_sessions;
CREATE TRIGGER trg_sync_jap_to_group_stats_update
AFTER UPDATE ON public.user_jap_sessions
FOR EACH ROW
EXECUTE FUNCTION public.sync_jap_to_group_stats();

DROP TRIGGER IF EXISTS trg_sync_jap_to_group_stats_insert ON public.user_jap_sessions;
CREATE TRIGGER trg_sync_jap_to_group_stats_insert
AFTER INSERT ON public.user_jap_sessions
FOR EACH ROW
EXECUTE FUNCTION public.sync_jap_to_group_stats();


-- ── E. Progress recalculation (source of truth) ────────────
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
  FROM public.naam_sangh_groups
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


-- ── F. Initialize progress row when group is created ───────
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
CREATE TRIGGER trg_init_group_progress
AFTER INSERT ON public.naam_sangh_groups
FOR EACH ROW
EXECUTE FUNCTION public.init_group_progress();


-- ── G. Recalculate progress on every stats change ──────────
CREATE OR REPLACE FUNCTION public.trg_recalculate_group_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.recalculate_group_progress(NEW.group_id);

  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.group_id IS DISTINCT FROM OLD.group_id THEN
      PERFORM public.recalculate_group_progress(OLD.group_id);
    END IF;
    PERFORM public.recalculate_group_progress(NEW.group_id);

  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.recalculate_group_progress(OLD.group_id);
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_group_progress ON public.naam_sangh_member_stats;
CREATE TRIGGER trg_update_group_progress
AFTER INSERT OR UPDATE OR DELETE ON public.naam_sangh_member_stats
FOR EACH ROW
EXECUTE FUNCTION public.trg_recalculate_group_progress();


-- ============================================================
-- STEP 5: BACKFILL (safe — no-ops if tables are empty)
-- ============================================================

INSERT INTO public.naam_sangh_progress
  (group_id, total_japs, completion_percent, updated_at)
SELECT
  g.id,
  COALESCE(SUM(ms.total_japs), 0),
  CASE
    WHEN g.target_count <= 0 THEN 0
    ELSE LEAST(
      100,
      ROUND(
        (COALESCE(SUM(ms.total_japs), 0)::numeric / g.target_count::numeric) * 100,
        2
      )
    )
  END,
  now()
FROM public.naam_sangh_groups g
LEFT JOIN public.naam_sangh_member_stats ms ON ms.group_id = g.id
GROUP BY g.id, g.target_count
ON CONFLICT (group_id) DO NOTHING;
