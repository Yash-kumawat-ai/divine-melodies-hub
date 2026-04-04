-- Create user_uploads table for storing submitted bhajans
CREATE TABLE IF NOT EXISTS user_uploads (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_hindi TEXT NOT NULL,
  deity_id INTEGER NOT NULL,
  singer_name TEXT NOT NULL,
  composer_name TEXT,
  lyrics_hindi TEXT NOT NULL,
  image_url TEXT,
  youtube_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  
  CONSTRAINT user_uploads_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS user_uploads_user_id_idx ON user_uploads(user_id);
CREATE INDEX IF NOT EXISTS user_uploads_status_idx ON user_uploads(status);
CREATE INDEX IF NOT EXISTS user_uploads_deity_id_idx ON user_uploads(deity_id);

-- Enable RLS (Row Level Security)
ALTER TABLE user_uploads ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own uploads
CREATE POLICY "Users can view their own uploads" ON user_uploads
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to create uploads
CREATE POLICY "Users can create uploads" ON user_uploads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own uploads
CREATE POLICY "Users can update their own uploads" ON user_uploads
  FOR UPDATE USING (auth.uid() = user_id);

-- Create storage bucket for bhajan images
INSERT INTO storage.buckets (id, name)
VALUES ('bhajan-uploads', 'bhajan-uploads')
ON CONFLICT DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'bhajan-uploads');

-- Allow users to view their own uploads
CREATE POLICY "Users can view their uploads" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'bhajan-uploads' AND auth.uid()::text = owner);
