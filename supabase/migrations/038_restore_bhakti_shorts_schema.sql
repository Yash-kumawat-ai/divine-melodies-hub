-- Migration: Restore category and duration_seconds columns to Bhakti Shorts schema
-- Setup database cron job for daily pull-shorts invocation
-- Setup Row Level Security (RLS) policies

-- 1. Create Enums if they do not exist
;DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'channel_status') THEN
    CREATE TYPE channel_status AS ENUM ('active', 'paused');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interaction_type') THEN
    CREATE TYPE interaction_type AS ENUM ('like', 'save');
  END IF;
END $$;

-- 2. Update whitelisted_channels Table
CREATE TABLE IF NOT EXISTS whitelisted_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id text NOT NULL UNIQUE CHECK (length(trim(channel_id)) > 0),
  channel_name text NOT NULL,
  handle text,
  category text CHECK (category IN ('bhajan','pravachan','darshan','katha')),
  status channel_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure category column exists if table already existed
ALTER TABLE whitelisted_channels ADD COLUMN IF NOT EXISTS category text CHECK (category IN ('bhajan','pravachan','darshan','katha'));

-- 3. Update shorts Table
CREATE TABLE IF NOT EXISTS shorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id text NOT NULL UNIQUE CHECK (length(trim(video_id)) > 0),
  channel_uid uuid NOT NULL REFERENCES whitelisted_channels(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  thumbnail_url text NOT NULL,
  youtube_url text NOT NULL,
  embed_url text NOT NULL,
  duration_seconds int,
  published_at timestamptz NOT NULL,
  hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure duration_seconds exists if table already existed
ALTER TABLE shorts ADD COLUMN IF NOT EXISTS duration_seconds int;

-- 4. Create shorts_interactions Table (self-containment check)
CREATE TABLE IF NOT EXISTS shorts_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  short_id uuid NOT NULL REFERENCES shorts(id) ON DELETE CASCADE,
  interaction_type interaction_type NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, short_id, interaction_type)
);

-- Safely support database transitions where column was video_uid (safe rename/alter)
;DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shorts_interactions' AND column_name = 'video_uid') THEN
    ALTER TABLE shorts_interactions RENAME COLUMN video_uid TO short_id;
  END IF;
END $$;

-- 5. Drop outdated foreign key referencing the old shorts_queue table, and add correct reference
ALTER TABLE shorts_interactions DROP CONSTRAINT IF EXISTS shorts_interactions_video_uid_fkey;
ALTER TABLE shorts_interactions DROP CONSTRAINT IF EXISTS shorts_interactions_short_id_fkey;

ALTER TABLE shorts_interactions 
  ADD CONSTRAINT shorts_interactions_short_id_fkey 
  FOREIGN KEY (short_id) REFERENCES shorts(id) ON DELETE CASCADE;

-- 6. Seed the first channel with category 'pravachan'
INSERT INTO whitelisted_channels (channel_id, channel_name, handle, category, status)
VALUES ('UCEk1jBxAl6fe-_G37G7huQA', 'Bhajan Marg', '@BhajanMarg', 'pravachan', 'active')
ON CONFLICT (channel_id) DO UPDATE
SET category = EXCLUDED.category,
    status = EXCLUDED.status;

-- 7. One-time cleanup: Delete previously imported videos that predate the duration filter or exceed it
DELETE FROM shorts WHERE duration_seconds IS NULL OR duration_seconds >= 120;

-- 8. Setup Daily Ingestion (pg_cron)
-- First enable pg_cron if needed
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Safely unschedule the job if it exists (prevents first-run transaction failure)
DO $$
BEGIN
  PERFORM cron.unschedule('pull-shorts-daily');
EXCEPTION WHEN OTHERS THEN
  NULL; -- job didn't exist yet, ignore and continue
END $$;

SELECT cron.schedule(
  'pull-shorts-daily',
  '0 5 * * *',
  $$ SELECT net.http_post(
       url:='https://khnqyhzlrxwmolyevaqo.supabase.co/functions/v1/pull-shorts',
       headers:=jsonb_build_object(
         'Content-Type', 'application/json',
         'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1)
       ),
       body:='{}'::jsonb
     )
  $$
);

-- 9. Enable Row Level Security (RLS)
ALTER TABLE whitelisted_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE shorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shorts_interactions ENABLE ROW LEVEL SECURITY;

-- 10. Row Level Security Policies (Idempotent Drops and Creates)

-- whitelisted_channels:
DROP POLICY IF EXISTS "Public read active channels" ON whitelisted_channels;
CREATE POLICY "Public read active channels" ON whitelisted_channels
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Admins manage channels" ON whitelisted_channels;
CREATE POLICY "Admins manage channels" ON whitelisted_channels
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- shorts:
DROP POLICY IF EXISTS "Public read visible shorts" ON shorts;
CREATE POLICY "Public read visible shorts" ON shorts
  FOR SELECT USING (
    hidden = false
    AND EXISTS (
      SELECT 1 FROM whitelisted_channels wc
      WHERE wc.id = channel_uid AND wc.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Admins manage shorts" ON shorts;
CREATE POLICY "Admins manage shorts" ON shorts
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- shorts_interactions:
DROP POLICY IF EXISTS "Users read own interactions" ON shorts_interactions;
CREATE POLICY "Users read own interactions" ON shorts_interactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own interactions" ON shorts_interactions;
CREATE POLICY "Users manage own interactions" ON shorts_interactions
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
