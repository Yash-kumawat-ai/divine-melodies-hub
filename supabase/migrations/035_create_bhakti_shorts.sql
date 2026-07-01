DROP MATERIALIZED VIEW IF EXISTS shorts_analytics_summary CASCADE;
DROP TABLE IF EXISTS shorts_watch_history CASCADE;
DROP TABLE IF EXISTS shorts_interactions CASCADE;
DROP TABLE IF EXISTS shorts_queue CASCADE;
DROP TABLE IF EXISTS whitelisted_channels CASCADE;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'channel_status') THEN
        CREATE TYPE channel_status AS ENUM ('active', 'paused');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interaction_type') THEN
        CREATE TYPE interaction_type AS ENUM ('like', 'save');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'short_category') THEN
        CREATE TYPE short_category AS ENUM ('bhajan', 'pravachan', 'darshan', 'katha');
    END IF;
END $$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$;

REVOKE ALL ON FUNCTION is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated, service_role;

CREATE TABLE whitelisted_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id text NOT NULL UNIQUE,
  channel_name text NOT NULL,
  handle text,
  category short_category NOT NULL,
  status channel_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE shorts_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id text NOT NULL UNIQUE,
  channel_uid uuid NOT NULL REFERENCES whitelisted_channels(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  thumbnail_url text NOT NULL,
  duration_seconds int NOT NULL CHECK (duration_seconds > 0),
  published_at timestamptz NOT NULL,
  youtube_url text NOT NULL,
  embed_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE shorts_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_uid uuid NOT NULL REFERENCES shorts_queue(id) ON DELETE CASCADE,
  interaction_type interaction_type NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, video_uid, interaction_type)
);

CREATE INDEX IF NOT EXISTS idx_shorts_queue_feed 
ON shorts_queue(published_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_whitelisted_channels_status 
ON whitelisted_channels(status);

CREATE INDEX IF NOT EXISTS idx_shorts_interactions_lookup 
ON shorts_interactions(user_id, video_uid);

ALTER TABLE whitelisted_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE shorts_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE shorts_interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active channels" ON whitelisted_channels;
CREATE POLICY "Public read active channels" ON whitelisted_channels
FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Admins manage channels" ON whitelisted_channels;
CREATE POLICY "Admins manage channels" ON whitelisted_channels
FOR ALL TO authenticated USING (
    is_admin()
) WITH CHECK (
    is_admin()
);

DROP POLICY IF EXISTS "Public read active shorts" ON shorts_queue;
CREATE POLICY "Public read active shorts" ON shorts_queue
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM whitelisted_channels
        WHERE id = channel_uid
        AND status = 'active'
    )
);

DROP POLICY IF EXISTS "Admins manage shorts" ON shorts_queue;
CREATE POLICY "Admins manage shorts" ON shorts_queue
FOR ALL TO authenticated USING (
    is_admin()
) WITH CHECK (
    is_admin()
);

DROP POLICY IF EXISTS "Users select own interactions" ON shorts_interactions;
CREATE POLICY "Users select own interactions" ON shorts_interactions
FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own interactions" ON shorts_interactions;
CREATE POLICY "Users manage own interactions" ON shorts_interactions
FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

INSERT INTO whitelisted_channels (channel_id, channel_name, handle, category, status)
VALUES ('UCEk1jBxAl6fe-_G37G7huQA', 'Bhajan Marg', '@BhajanMarg', 'pravachan', 'active')
ON CONFLICT (channel_id) DO UPDATE 
SET channel_name = EXCLUDED.channel_name,
    handle = EXCLUDED.handle,
    category = EXCLUDED.category,
    status = EXCLUDED.status;
