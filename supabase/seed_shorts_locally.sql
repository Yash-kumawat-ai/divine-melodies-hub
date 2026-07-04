-- SQL Seed Script to populate Bhakti Shorts Feed
-- Paste and run this in your Supabase Dashboard SQL Editor (https://supabase.com)

DO $$
DECLARE
  v_channel_uid uuid;
BEGIN
  -- 1. Find the Whitelisted Channel ID dynamically (for Bhajan Marg)
  SELECT id INTO v_channel_uid FROM whitelisted_channels WHERE channel_id = 'UCEk1jBxAl6fe-_G37G7huQA' LIMIT 1;
  
  IF v_channel_uid IS NOT NULL THEN
    -- 2. Insert test shorts under the Bhajan Marg channel
    INSERT INTO shorts (channel_uid, video_id, title, description, thumbnail_url, published_at, youtube_url, embed_url)
    VALUES
    (
      v_channel_uid,
      'eo3P4fNbvRA',
      'राधा नाम की महिमा - पूज्य श्री हित प्रेमानंद जी महाराज',
      'Radha Naam Mahima by Pujya Sri Hit Premanand Ji Maharaj',
      'https://img.youtube.com/vi/eo3P4fNbvRA/hqdefault.jpg',
      NOW() - INTERVAL '1 day',
      'https://youtube.com/watch?v=eo3P4fNbvRA',
      'https://www.youtube-nocookie.com/embed/eo3P4fNbvRA'
    ),
    (
      v_channel_uid,
      '3R30Nf1uWkY',
      'नाम जप क्यों आवश्यक है? - प्रेमानंद जी महाराज',
      'Naam Jap Importance by Pujya Sri Hit Premanand Ji Maharaj',
      'https://img.youtube.com/vi/3R30Nf1uWkY/hqdefault.jpg',
      NOW() - INTERVAL '2 days',
      'https://youtube.com/watch?v=3R30Nf1uWkY',
      'https://www.youtube-nocookie.com/embed/3R30Nf1uWkY'
    ),
    (
      v_channel_uid,
      'aF2W_Zz4lH4',
      'सच्चा प्रेम क्या है? - हित प्रेमानंद जी महाराज',
      'Sacha Prem by Pujya Sri Hit Premanand Ji Maharaj',
      'https://img.youtube.com/vi/aF2W_Zz4lH4/hqdefault.jpg',
      NOW() - INTERVAL '3 days',
      'https://youtube.com/watch?v=aF2W_Zz4lH4',
      'https://www.youtube-nocookie.com/embed/aF2W_Zz4lH4'
    )
    ON CONFLICT (video_id) DO NOTHING;
    
    RAISE NOTICE 'Successfully seeded test shorts!';
  ELSE
    RAISE WARNING 'Bhajan Marg channel UCEk1jBxAl6fe-_G37G7huQA is missing from whitelisted_channels. Run migration or add whitelisted channel first.';
  END IF;
END $$;
