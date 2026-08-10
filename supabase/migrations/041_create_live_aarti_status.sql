-- Cached live-aarti verification results.
-- Frontend (Hostinger) reads via Edge Function; only the function writes.

CREATE TABLE IF NOT EXISTS public.live_aarti_status (
  temple_id text PRIMARY KEY,
  status text NOT NULL CHECK (status IN ('LIVE', 'UPCOMING', 'OFFLINE', 'STREAM_UNAVAILABLE')),
  live_title text,
  video_id text,
  last_verified_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS live_aarti_status_verified_idx
  ON public.live_aarti_status (last_verified_at DESC);

ALTER TABLE public.live_aarti_status ENABLE ROW LEVEL SECURITY;

-- Public read (safe: no secrets, only stream metadata)
DROP POLICY IF EXISTS "Anyone can read live aarti status" ON public.live_aarti_status;
CREATE POLICY "Anyone can read live aarti status"
  ON public.live_aarti_status
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Writes only via service role (Edge Function). No INSERT/UPDATE/DELETE policies for anon/auth.

COMMENT ON TABLE public.live_aarti_status IS
  'Cached YouTube live verification for temple darshan channels. Refreshed by live-aarti-check Edge Function.';
