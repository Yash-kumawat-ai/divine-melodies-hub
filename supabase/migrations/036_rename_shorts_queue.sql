-- Migration: Rename shorts_queue to shorts and rename video_uid to short_id in shorts_interactions
-- Safely renames the objects if they exist.

;DO $$
BEGIN
  -- 1. Rename table shorts_queue to shorts
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shorts_queue') THEN
    ALTER TABLE shorts_queue RENAME TO shorts;
    ALTER INDEX IF EXISTS idx_shorts_queue_feed RENAME TO idx_shorts_feed;
    ALTER INDEX IF EXISTS idx_shorts_queue_channel_uid RENAME TO idx_shorts_channel_uid;
  END IF;

  -- 2. Rename column video_uid to short_id in shorts_interactions
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shorts_interactions' AND column_name = 'video_uid') THEN
    ALTER TABLE shorts_interactions RENAME COLUMN video_uid TO short_id;
  END IF;
END $$;
