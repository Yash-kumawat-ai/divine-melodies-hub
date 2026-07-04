-- Devotional Shorts Simple Database Schema
-- Idempotent schema definition.

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

-- 2. Create/Update whitelisted_channels Table
CREATE TABLE IF NOT EXISTS whitelisted_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id text NOT NULL UNIQUE CHECK (length(trim(channel_id)) > 0),
  channel_name text NOT NULL,
  handle text,
  status channel_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure updated_at column exists if table was created in a prior run
ALTER TABLE whitelisted_channels ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Ensure UNIQUE index exists on channel_id (if upgrading existing databases)
CREATE UNIQUE INDEX IF NOT EXISTS idx_whitelisted_channels_channel_id 
ON whitelisted_channels(channel_id);

-- Clean up unused columns on whitelisted_channels (safe ALTERs)
ALTER TABLE whitelisted_channels DROP COLUMN IF EXISTS category;
ALTER TABLE whitelisted_channels DROP COLUMN IF EXISTS last_imported_at;

-- Add check constraint to channel_id if table already exists (safe ADD CONSTRAINT)
ALTER TABLE whitelisted_channels DROP CONSTRAINT IF EXISTS channels_channel_id_not_empty;
ALTER TABLE whitelisted_channels ADD CONSTRAINT channels_channel_id_not_empty CHECK (length(trim(channel_id)) > 0);

-- 3. Create/Update shorts Table
CREATE TABLE IF NOT EXISTS shorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id text NOT NULL UNIQUE CHECK (length(trim(video_id)) > 0),
  channel_uid uuid NOT NULL REFERENCES whitelisted_channels(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  thumbnail_url text NOT NULL,
  youtube_url text NOT NULL,
  embed_url text NOT NULL,
  published_at timestamptz NOT NULL,
  hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure updated_at column exists if table was created in a prior run
ALTER TABLE shorts ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Clean up unused columns on shorts (safe ALTERs)
ALTER TABLE shorts DROP COLUMN IF EXISTS duration_seconds;
ALTER TABLE shorts DROP COLUMN IF EXISTS review_status;
ALTER TABLE shorts DROP COLUMN IF EXISTS reviewed_by;
ALTER TABLE shorts DROP COLUMN IF EXISTS reviewed_at;
ALTER TABLE shorts DROP COLUMN IF EXISTS recommendation_score;
ALTER TABLE shorts DROP COLUMN IF EXISTS metadata;

-- Add check constraint to video_id if table already exists (safe ADD CONSTRAINT)
ALTER TABLE shorts DROP CONSTRAINT IF EXISTS shorts_video_id_not_empty;
ALTER TABLE shorts ADD CONSTRAINT shorts_video_id_not_empty CHECK (length(trim(video_id)) > 0);

-- 4. Create/Update shorts_interactions Table
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

-- 5. Hardened is_admin() Helper Function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
END;
$$;

REVOKE ALL ON FUNCTION is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated, service_role;

-- 6. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_shorts_feed ON shorts(hidden, published_at DESC) WHERE hidden = false;
CREATE INDEX IF NOT EXISTS idx_shorts_channel_uid ON shorts(channel_uid);
CREATE INDEX IF NOT EXISTS idx_shorts_interactions_lookup ON shorts_interactions(user_id, short_id);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE whitelisted_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE shorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shorts_interactions ENABLE ROW LEVEL SECURITY;

-- 8. Row Level Security Policies (Idempotent Drops and Creates)

-- whitelisted_channels:
DROP POLICY IF EXISTS "Public read active channels" ON whitelisted_channels;
CREATE POLICY "Public read active channels" ON whitelisted_channels
FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Admins manage channels" ON whitelisted_channels;
CREATE POLICY "Admins manage channels" ON whitelisted_channels
FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- shorts:
DROP POLICY IF EXISTS "Public read active shorts" ON shorts;
DROP POLICY IF EXISTS "public can read approved shorts" ON shorts;
DROP POLICY IF EXISTS "Public read visible shorts" ON shorts;

CREATE POLICY "Public read visible shorts" ON shorts
FOR SELECT USING (
  hidden = false
  AND EXISTS (
    SELECT 1 FROM whitelisted_channels wc
    WHERE wc.id = channel_uid
    AND wc.status = 'active'
  )
);

DROP POLICY IF EXISTS "Admins manage shorts" ON shorts;
CREATE POLICY "Admins manage shorts" ON shorts
FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- shorts_interactions:
DROP POLICY IF EXISTS "Users read own interactions" ON shorts_interactions;
DROP POLICY IF EXISTS "Users select own interactions" ON shorts_interactions;
CREATE POLICY "Users read own interactions" ON shorts_interactions
FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own interactions" ON shorts_interactions;
CREATE POLICY "Users manage own interactions" ON shorts_interactions
FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 9. Triggers to automatically update updated_at on modify
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_whitelisted_channels_updated_at ON whitelisted_channels;
CREATE TRIGGER tr_update_whitelisted_channels_updated_at
BEFORE UPDATE ON whitelisted_channels
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_update_shorts_updated_at ON shorts;
CREATE TRIGGER tr_update_shorts_updated_at
BEFORE UPDATE ON shorts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Seed Default Whitelisted Channel
INSERT INTO whitelisted_channels (channel_id, channel_name, handle, status)
VALUES ('UCEk1jBxAl6fe-_G37G7huQA', 'Bhajan Marg', '@BhajanMarg', 'active')
ON CONFLICT (channel_id) DO UPDATE 
SET channel_name = EXCLUDED.channel_name,
    handle = EXCLUDED.handle,
    status = EXCLUDED.status;
