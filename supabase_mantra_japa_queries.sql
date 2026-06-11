-- =========================================================================
-- SUPABASE MIGRATION: MANTRA JAPA TABLES & FUNCTIONS
-- =========================================================================
-- Copy this entire file and paste it into the Supabase SQL Editor, then click RUN.
-- =========================================================================

-- Step 1: Create mantras table (catalog of all mantras)
CREATE TABLE IF NOT EXISTS mantras (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_hindi TEXT NOT NULL,
  name_english TEXT NOT NULL,
  deity TEXT,
  description_hindi TEXT,
  description_english TEXT,
  meaning_hindi TEXT,
  meaning_english TEXT,
  full_text_hindi TEXT NOT NULL,
  transliteration TEXT,
  image_url TEXT,
  audio_url TEXT,
  recommended_counts INTEGER[] DEFAULT ARRAY[108, 1008],
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE mantras ENABLE ROW LEVEL SECURITY;

-- Everyone can read mantras
CREATE POLICY "Anyone can read mantras"
  ON mantras FOR SELECT
  USING (true);

-- Step 2: Create user_jap_sessions table (individual session logs)
CREATE TABLE IF NOT EXISTS user_jap_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mantra_id UUID NOT NULL REFERENCES mantras(id) ON DELETE CASCADE,
  sankalp TEXT,
  target_count INTEGER NOT NULL DEFAULT 108,
  actual_count INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE user_jap_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see & insert their own sessions
CREATE POLICY "Users manage own sessions"
  ON user_jap_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_jap_sessions_user ON user_jap_sessions(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_jap_sessions_mantra ON user_jap_sessions(mantra_id);

-- Step 3: Create user_jap_totals table (running aggregate per user + mantra)
CREATE TABLE IF NOT EXISTS user_jap_totals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mantra_id UUID NOT NULL REFERENCES mantras(id) ON DELETE CASCADE,
  total_chants BIGINT DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  total_malas INTEGER DEFAULT 0,
  last_session_at TIMESTAMPTZ,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_streak_date DATE,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, mantra_id)
);

-- Enable RLS
ALTER TABLE user_jap_totals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own totals"
  ON user_jap_totals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_jap_totals_user ON user_jap_totals(user_id);

-- Step 4: Create user_sankalpas table (user intentions)
CREATE TABLE IF NOT EXISTS user_sankalpas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_custom BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT false,
  used_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, text)
);

-- Enable RLS
ALTER TABLE user_sankalpas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own sankalpas"
  ON user_sankalpas FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Step 5: Seed the mantras table with data
INSERT INTO mantras (name_hindi, name_english, deity, full_text_hindi, transliteration, sort_order)
VALUES
  ('ॐ जप', 'Om Chanting', 'shiva', 'ॐ', 'Om', 1),
  ('ॐ नमः शिवाय', 'Om Namah Shivaya', 'shiva', 'ॐ नमः शिवाय', 'Om Namah Shivaya', 2),
  ('महामृत्युंजय मंत्र', 'Mahamrityunjaya Mantra', 'shiva', 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात्', 'Om Tryambakam Yajamahe Sugandhim Pushti-Vardhanam Urvarukamiva Bandhanan Mrityor Mukshiya Maamritat', 3),
  ('हरे कृष्ण मंत्र', 'Hare Krishna Mahamantra', 'krishna', 'हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे हरे राम हरे राम राम राम हरे हरे', 'Hare Krishna Hare Krishna Krishna Krishna Hare Hare Hare Rama Hare Rama Rama Rama Hare Hare', 4),
  ('राधे राधे', 'Radhe Radhe', 'krishna', 'राधे राधे गोविंदा', 'Radhe Radhe Govinda', 5),
  ('जय श्री राम', 'Jai Shree Ram', 'rama', 'जय श्री राम', 'Jai Shree Ram', 6),
  ('ॐ नमो नारायणाय', 'Om Namo Narayanaya', 'vishnu', 'ॐ नमो नारायणाय', 'Om Namo Narayanaya', 7),
  ('गायत्री मंत्र', 'Gayatri Mantra', 'surya', 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्', 'Om Bhur Bhuvah Svah Tat Savitur Varenyam Bhargo Devasya Dhimahi Dhiyo Yo Nah Prachodayat', 8)
ON CONFLICT DO NOTHING;

-- Step 6: Create the complete_jap_session RPC function
CREATE OR REPLACE FUNCTION complete_jap_session(
  p_user_id UUID,
  p_mantra_id UUID,
  p_sankalp TEXT DEFAULT NULL,
  p_target_count INTEGER DEFAULT 108,
  p_actual_count INTEGER DEFAULT 108,
  p_duration_seconds INTEGER DEFAULT 0
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_id UUID;
  v_today DATE := CURRENT_DATE;
  v_totals user_jap_totals%ROWTYPE;
  v_new_streak INTEGER;
  v_longest INTEGER;
BEGIN
  -- 1. Insert session log
  INSERT INTO user_jap_sessions (user_id, mantra_id, sankalp, target_count, actual_count, duration_seconds, completed, completed_at)
  VALUES (p_user_id, p_mantra_id, p_sankalp, p_target_count, p_actual_count, p_duration_seconds, true, now())
  RETURNING id INTO v_session_id;

  -- 2. Upsert totals
  INSERT INTO user_jap_totals (user_id, mantra_id, total_chants, total_sessions, total_malas, last_session_at, current_streak, longest_streak, last_streak_date)
  VALUES (p_user_id, p_mantra_id, p_actual_count, 1, FLOOR(p_actual_count / 108), now(), 1, 1, v_today)
  ON CONFLICT (user_id, mantra_id) DO UPDATE SET
    total_chants = user_jap_totals.total_chants + p_actual_count,
    total_sessions = user_jap_totals.total_sessions + 1,
    total_malas = user_jap_totals.total_malas + FLOOR(p_actual_count / 108),
    last_session_at = now(),
    -- Streak logic: if last_streak_date = yesterday, increment; if today, keep; else reset to 1
    current_streak = CASE
      WHEN user_jap_totals.last_streak_date = v_today THEN user_jap_totals.current_streak
      WHEN user_jap_totals.last_streak_date = v_today - 1 THEN user_jap_totals.current_streak + 1
      ELSE 1
    END,
    longest_streak = GREATEST(
      user_jap_totals.longest_streak,
      CASE
        WHEN user_jap_totals.last_streak_date = v_today THEN user_jap_totals.current_streak
        WHEN user_jap_totals.last_streak_date = v_today - 1 THEN user_jap_totals.current_streak + 1
        ELSE 1
      END
    ),
    last_streak_date = v_today,
    updated_at = now();

  -- 3. Fetch updated totals
  SELECT * INTO v_totals FROM user_jap_totals WHERE user_id = p_user_id AND mantra_id = p_mantra_id;

  RETURN json_build_object(
    'session_id', v_session_id,
    'total_chants', v_totals.total_chants,
    'total_sessions', v_totals.total_sessions,
    'total_malas', v_totals.total_malas,
    'current_streak', v_totals.current_streak,
    'longest_streak', v_totals.longest_streak
  );
END;
$$;
