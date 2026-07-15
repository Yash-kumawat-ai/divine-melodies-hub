-- Migration 040: Fix sync_jap_to_group_stats trigger double-counting and support single-update scoping
-- Allows trigger to fire when group_id transitions from NULL to a value, even if completed was already true.

BEGIN;

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
    -- Fire if completed transitioned to true, OR if group_id transitioned from NULL to a group ID while completed is true
    IF (NEW.completed = true AND (OLD.completed IS DISTINCT FROM true)) 
       OR (NEW.completed = true AND OLD.group_id IS NULL AND NEW.group_id IS NOT NULL) THEN
      
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
