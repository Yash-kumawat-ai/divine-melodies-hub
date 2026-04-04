-- Add youtube_url column to user_uploads if it doesn't exist
ALTER TABLE user_uploads
ADD COLUMN IF NOT EXISTS youtube_url TEXT;
