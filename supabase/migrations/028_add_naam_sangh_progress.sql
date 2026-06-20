-- ============================================================
-- Migration 028: Add Naam Sangh Progress Table
-- 
-- Tracks aggregate Japa progress for groups.
-- Automatically updates whenever member stats change.
-- ============================================================

-- Ensure required columns exist
ALTER TABLE public.naam_sangh_groups
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Progress table
CREATE TABLE IF NOT EXISTS public.naam_sangh_progress (
  group_id UUID PRIMARY KEY REFERENCES public.naam_sangh_groups(id) ON DELETE CASCADE,
  total_japs BIGINT NOT NULL DEFAULT 0,
  completion_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.naam_sangh_progress ENABLE ROW LEVEL SECURITY;

-- RLS
DROP POLICY IF EXISTS "Anyone can view progress of public groups"
ON public.naam_sangh_progress;

CREATE POLICY "Anyone can view progress of public groups"
ON public.naam_sangh_progress
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.naam_sangh_groups g
    WHERE g.id = naam_sangh_progress.group_id
    AND (
      g.is_public = true
      OR EXISTS (
        SELECT 1
        FROM public.naam_sangh_members m
        WHERE m.group_id = g.id
        AND m.user_id = auth.uid()
      )
    )
  )
);

-- Backfill existing progress rows
INSERT INTO public.naam_sangh_progress (
  group_id,
  total_japs,
  completion_percent,
  updated_at
)
SELECT
  g.id,
  COALESCE(SUM(ms.total_japs), 0),
  CASE
    WHEN g.target_count <= 0 THEN 0
    ELSE LEAST(
      100,
      ROUND(
        (
          COALESCE(SUM(ms.total_japs), 0)::numeric
          / g.target_count::numeric
        ) * 100,
        2
      )
    )
  END,
  now()
FROM public.naam_sangh_groups g
LEFT JOIN public.naam_sangh_member_stats ms
ON ms.group_id = g.id
GROUP BY g.id, g.target_count
ON CONFLICT (group_id)
DO NOTHING;

-- Initialize progress row when group created
CREATE OR REPLACE FUNCTION public.init_naam_sangh_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.naam_sangh_progress (
    group_id,
    total_japs,
    completion_percent,
    updated_at
  )
  VALUES (
    NEW.id,
    0,
    0,
    now()
  )
  ON CONFLICT (group_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_init_naam_sangh_progress
ON public.naam_sangh_groups;

CREATE TRIGGER trg_init_naam_sangh_progress
AFTER INSERT ON public.naam_sangh_groups
FOR EACH ROW
EXECUTE FUNCTION public.init_naam_sangh_progress();

-- Recalculate a group's progress
CREATE OR REPLACE FUNCTION public.recalculate_naam_sangh_progress(
  p_group_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_japs BIGINT;
  v_target_count INTEGER;
  v_percent NUMERIC(5,2);
BEGIN

  SELECT
    COALESCE(SUM(ms.total_japs), 0)
  INTO v_total_japs
  FROM public.naam_sangh_member_stats ms
  WHERE ms.group_id = p_group_id;

  SELECT target_count
  INTO v_target_count
  FROM public.naam_sangh_groups
  WHERE id = p_group_id;

  IF v_target_count IS NULL OR v_target_count <= 0 THEN
    v_percent := 0;
  ELSE
    v_percent := LEAST(
      100,
      ROUND(
        (v_total_japs::numeric / v_target_count::numeric) * 100,
        2
      )
    );
  END IF;

  INSERT INTO public.naam_sangh_progress (
    group_id,
    total_japs,
    completion_percent,
    updated_at
  )
  VALUES (
    p_group_id,
    v_total_japs,
    v_percent,
    now()
  )
  ON CONFLICT (group_id)
  DO UPDATE SET
    total_japs = EXCLUDED.total_japs,
    completion_percent = EXCLUDED.completion_percent,
    updated_at = now();

END;
$$;

-- Update progress whenever member stats change
CREATE OR REPLACE FUNCTION public.update_naam_sangh_progress_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN

  IF TG_OP = 'INSERT' THEN
    PERFORM public.recalculate_naam_sangh_progress(
      NEW.group_id
    );
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.group_id <> OLD.group_id THEN
      PERFORM public.recalculate_naam_sangh_progress(
        OLD.group_id
      );
      PERFORM public.recalculate_naam_sangh_progress(
        NEW.group_id
      );
    ELSE
      PERFORM public.recalculate_naam_sangh_progress(
        NEW.group_id
      );
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.recalculate_naam_sangh_progress(
      OLD.group_id
    );
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_naam_sangh_progress_stats
ON public.naam_sangh_member_stats;

CREATE TRIGGER trg_update_naam_sangh_progress_stats
AFTER INSERT OR UPDATE OR DELETE
ON public.naam_sangh_member_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_naam_sangh_progress_stats();
