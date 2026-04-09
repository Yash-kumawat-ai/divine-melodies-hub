-- Create custom deities table for user-added gods
CREATE TABLE IF NOT EXISTS custom_deities (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on custom_deities
ALTER TABLE custom_deities ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to let users see all deities but only edit their own
CREATE POLICY "Anyone can view custom deities" ON custom_deities
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own deities" ON custom_deities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deities" ON custom_deities
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deities" ON custom_deities
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_custom_deities_user_id ON custom_deities(user_id);
CREATE INDEX idx_custom_deities_created ON custom_deities(created_at DESC);
