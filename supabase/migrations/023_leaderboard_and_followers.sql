-- Migration 023: Global Leaderboard
-- Create global leaderboard function to fetch top 10 and viewer ranking

-- Clean up any follower-related structures from previous attempts
DROP VIEW IF EXISTS public.public_devotee_profiles;
DROP TRIGGER IF EXISTS trg_user_profiles_username_reserved ON public.user_profiles;
DROP TRIGGER IF EXISTS trg_user_profiles_username_populate ON public.user_profiles;
DROP FUNCTION IF EXISTS public.check_reserved_username();
DROP FUNCTION IF EXISTS public.trg_populate_username_if_null();
DROP FUNCTION IF EXISTS public.generate_unique_username(TEXT, UUID);
DROP TABLE IF EXISTS public.devotee_follows;
DROP TABLE IF EXISTS public.user_japa_daily_stats;
DROP FUNCTION IF EXISTS public.get_devotee_follow_counts(UUID);
DROP FUNCTION IF EXISTS public.get_devotee_stats(UUID);
DROP FUNCTION IF EXISTS public.get_devotee_recent_activity(UUID);
DROP FUNCTION IF EXISTS public.get_leaderboard_rankings(TEXT, TEXT, UUID);
DROP FUNCTION IF EXISTS public.get_leaderboard_rankings(TEXT, TEXT, UUID, BOOLEAN);

-- Create simple global leaderboard function
CREATE OR REPLACE FUNCTION public.get_global_leaderboard(p_viewer_id UUID DEFAULT NULL)
RETURNS TABLE (
  rank BIGINT,
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  total_chants BIGINT
) 
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH all_devotees AS (
    SELECT 
      p.id as devotee_id,
      p.name as devotee_name,
      p.avatar_url as devotee_avatar,
      COALESCE(SUM(t.total_chants), 0)::BIGINT as chants
    FROM public.user_profiles p
    LEFT JOIN public.user_jap_totals t ON t.user_id = p.id
    GROUP BY p.id, p.name, p.avatar_url
  ),
  ranked_devotees AS (
    SELECT
      DENSE_RANK() OVER (ORDER BY ad.chants DESC) as calc_rank,
      ad.devotee_id,
      ad.devotee_name,
      ad.devotee_avatar,
      ad.chants
    FROM all_devotees ad
  )
  SELECT 
    rd.calc_rank as rank,
    rd.devotee_id as user_id,
    rd.devotee_name as display_name,
    rd.devotee_avatar as avatar_url,
    rd.chants as total_chants
  FROM ranked_devotees rd
  WHERE rd.calc_rank <= 10 OR rd.devotee_id = p_viewer_id
  ORDER BY rd.chants DESC, rd.devotee_name ASC;
END;
$$;
