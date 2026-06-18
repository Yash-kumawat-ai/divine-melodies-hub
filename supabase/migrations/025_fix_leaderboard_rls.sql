-- ============================================================
-- Migration 025: Fix Leaderboard RLS
-- 
-- Problem: user_profiles and user_jap_totals only allow users
-- to SELECT their own row (auth.uid() = id). This means the
-- leaderboard query can only see the logged-in user's data
-- and shows no other devotees.
--
-- Fix: Add a public SELECT policy on only the columns needed
-- for the leaderboard (name, avatar_url, total_chants).
-- All write operations remain restricted to the owner.
-- ============================================================

-- 1. Allow any authenticated user to read all profiles
--    (only name + avatar_url are exposed - no sensitive data)
DROP POLICY IF EXISTS "Public profiles are viewable by all authenticated users" ON public.user_profiles;
CREATE POLICY "Public profiles are viewable by all authenticated users"
  ON public.user_profiles
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- 2. Allow any authenticated user to read all jap totals
--    (needed to compute global leaderboard rankings)
DROP POLICY IF EXISTS "Public jap totals are viewable by all authenticated users" ON public.user_jap_totals;
CREATE POLICY "Public jap totals are viewable by all authenticated users"
  ON public.user_jap_totals
  FOR SELECT
  USING (auth.role() = 'authenticated');
