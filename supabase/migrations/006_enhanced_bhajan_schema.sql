-- Add new columns to user_uploads table for enhanced features
ALTER TABLE user_uploads
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'Hindi',
ADD COLUMN IF NOT EXISTS occasion TEXT[],
ADD COLUMN IF NOT EXISTS mood_tags TEXT[],
ADD COLUMN IF NOT EXISTS festival_tags TEXT[],
ADD COLUMN IF NOT EXISTS difficulty_level TEXT DEFAULT 'Beginner',
ADD COLUMN IF NOT EXISTS audio_duration INTEGER,
ADD COLUMN IF NOT EXISTS audio_quality TEXT[] DEFAULT ARRAY['128'],
ADD COLUMN IF NOT EXISTS play_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;

-- Create ratings table for bhajan reviews
CREATE TABLE IF NOT EXISTS bhajan_ratings (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bhajan_id UUID NOT NULL REFERENCES user_uploads(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, bhajan_id)
);

-- Create user likes table
CREATE TABLE IF NOT EXISTS user_likes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bhajan_id UUID NOT NULL REFERENCES user_uploads(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, bhajan_id)
);

-- Create user playlists table
CREATE TABLE IF NOT EXISTS user_playlists (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create playlist items table
CREATE TABLE IF NOT EXISTS playlist_items (
  id BIGSERIAL PRIMARY KEY,
  playlist_id BIGINT NOT NULL REFERENCES user_playlists(id) ON DELETE CASCADE,
  bhajan_id UUID NOT NULL REFERENCES user_uploads(id) ON DELETE CASCADE,
  item_order INTEGER NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(playlist_id, bhajan_id)
);

-- Create radio stations table
CREATE TABLE IF NOT EXISTS radio_stations (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  genre TEXT NOT NULL,
  deity_id INTEGER,
  occasion TEXT,
  mood TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name)
);

-- Create radio station bhajans (junction table)
CREATE TABLE IF NOT EXISTS radio_station_bhajans (
  id BIGSERIAL PRIMARY KEY,
  station_id BIGINT NOT NULL REFERENCES radio_stations(id) ON DELETE CASCADE,
  bhajan_id UUID NOT NULL REFERENCES user_uploads(id) ON DELETE CASCADE,
  item_order INTEGER NOT NULL,
  UNIQUE(station_id, bhajan_id)
);

-- Create user subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_tier TEXT DEFAULT 'free',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  favorite_deities INTEGER[],
  preferred_language TEXT DEFAULT 'Hindi',
  preferred_occasions TEXT[],
  preferred_moods TEXT[],
  notification_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bhajan_ratings_user_id ON bhajan_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_bhajan_ratings_bhajan_id ON bhajan_ratings(bhajan_id);
CREATE INDEX IF NOT EXISTS idx_user_likes_user_id ON user_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_likes_bhajan_id ON user_likes(bhajan_id);
CREATE INDEX IF NOT EXISTS idx_user_playlists_user_id ON user_playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_playlist_items_playlist_id ON playlist_items(playlist_id);
CREATE INDEX IF NOT EXISTS idx_radio_station_bhajans_station_id ON radio_station_bhajans(station_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_uploads_language ON user_uploads(language);
CREATE INDEX IF NOT EXISTS idx_user_uploads_play_count ON user_uploads(play_count DESC);
CREATE INDEX IF NOT EXISTS idx_user_uploads_rating ON user_uploads(average_rating DESC);

-- Enable RLS on new tables
ALTER TABLE bhajan_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE radio_station_bhajans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bhajan_ratings (public can view, authenticated users can create/update their own)
CREATE POLICY "Anyone can view ratings" ON bhajan_ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own ratings" ON bhajan_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings" ON bhajan_ratings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings" ON bhajan_ratings
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_likes (public can view, authenticated users can manage own)
CREATE POLICY "Anyone can view likes" ON user_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own likes" ON user_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes" ON user_likes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_playlists (users can see their own, public playlists visible to all)
CREATE POLICY "Users can view own playlists" ON user_playlists
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own playlists" ON user_playlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own playlists" ON user_playlists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own playlists" ON user_playlists
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for playlist_items (same visibility as playlists)
CREATE POLICY "Anyone can view playlist items of public playlists" ON playlist_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_playlists 
      WHERE user_playlists.id = playlist_items.playlist_id 
      AND (user_playlists.is_public = true OR user_playlists.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage items in their playlists" ON playlist_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_playlists 
      WHERE user_playlists.id = playlist_items.playlist_id 
      AND user_playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items from their playlists" ON playlist_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_playlists 
      WHERE user_playlists.id = playlist_items.playlist_id 
      AND user_playlists.user_id = auth.uid()
    )
  );

-- RLS Policies for radio stations (public read-only)
CREATE POLICY "Anyone can view radio stations" ON radio_station_bhajans
  FOR SELECT USING (true);

-- RLS Policies for user_subscriptions (users can view own, subscription data private)
CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_preferences (users can view/manage own)
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Drop existing RLS policies on radio_stations if they exist (might need to recreate)
DROP POLICY IF EXISTS "Anyone can view radio stations" ON radio_stations;

-- Create RLS policy for radio_stations (public read-only)
CREATE POLICY "Anyone can view radio stations" ON radio_stations
  FOR SELECT USING (true);

-- Enable RLS on radio_stations
ALTER TABLE radio_stations ENABLE ROW LEVEL SECURITY;
