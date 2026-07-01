-- 1. Create table safely if it doesn't exist
CREATE TABLE IF NOT EXISTS daily_dohas (
  id BIGSERIAL PRIMARY KEY,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add columns safely if they do not exist (Non-destructive schema updates)
ALTER TABLE daily_dohas ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE daily_dohas ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE daily_dohas ADD COLUMN IF NOT EXISTS doha TEXT[];
ALTER TABLE daily_dohas ADD COLUMN IF NOT EXISTS meaning TEXT;
ALTER TABLE daily_dohas ADD COLUMN IF NOT EXISTS category TEXT;

-- 3. Drop legacy columns if they exist (Clean up old schema)
ALTER TABLE daily_dohas DROP COLUMN IF EXISTS content;
ALTER TABLE daily_dohas DROP COLUMN IF EXISTS author;

-- 4. Enable Row Level Security safely
ALTER TABLE daily_dohas ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies safely using conditional checks to prevent duplicate errors
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'daily_dohas' AND policyname = 'Anyone can view daily_dohas'
    ) THEN
        CREATE POLICY "Anyone can view daily_dohas" ON daily_dohas FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'daily_dohas' AND policyname = 'Anyone can update daily_dohas (for likes)'
    ) THEN
        CREATE POLICY "Anyone can update daily_dohas (for likes)" ON daily_dohas FOR UPDATE USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'daily_dohas' AND policyname = 'Anyone can insert daily_dohas'
    ) THEN
        CREATE POLICY "Anyone can insert daily_dohas" ON daily_dohas FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- 6. Upsert seed data safely (ON CONFLICT prevents duplicate key errors and preserves existing like counts)
INSERT INTO daily_dohas (id, title, source, doha, meaning, category, likes) VALUES
(
  1,
  'राम नाम की लूट है', 
  'लोकप्रिय', 
  ARRAY['राम नाम की लूट है, लूट सके तो लूट।', 'अंत काल पछताएगा, जब प्राण जाएंगे छूट॥'], 
  'श्रीराम का नाम सबसे अमूल्य धन है, जिसे हर व्यक्ति बिना किसी मूल्य के प्राप्त कर सकता है। जीवन रहते हुए भगवान का स्मरण कर लेना चाहिए, क्योंकि मृत्यु के समय पश्चाताप करने का अवसर नहीं मिलता।', 
  'भक्ति', 
  124
),
(
  2,
  'गोस्वामी तुलसीदास', 
  'रामचरितमानस', 
  ARRAY['श्रीगुरु चरण सरोज रज, निज मन मुकुर सुधारि।', 'बरनउँ रघुबर बिमल जसु, जो दायक फल चारि॥'], 
  'गुरु के चरणों की धूल से अपने मन रूपी दर्पण को निर्मल करके, मैं भगवान श्रीराम के पवित्र यश का वर्णन करता हूँ, जो धर्म, अर्थ, काम और मोक्ष—इन चारों पुरुषार्थों की प्राप्ति कराते हैं।', 
  'भक्ति', 
  98
),
(
  3,
  'राम भक्ति', 
  'रामचरितमानस', 
  ARRAY['सियाराममय सब जग जानी।', 'करउँ प्रणाम जोरि जुग पानी॥'], 
  'मैं सम्पूर्ण संसार में सीताराम का ही स्वरूप देखता हूँ। इसलिए मैं सभी प्राणियों और समस्त सृष्टि को आदरपूर्वक प्रणाम करता हूँ।', 
  'भक्ति', 
  156
),
(
  4,
  'सुंदर एवं शांतिदायक', 
  'रामचरितमानस', 
  ARRAY['रामहि केवल प्रेम पियारा।', 'जानि लेहु जो जाननिहारा॥'], 
  'भगवान श्रीराम को केवल सच्चा प्रेम और निष्कपट भक्ति ही प्रिय है। धन, पद या बाहरी आडंबर से अधिक उनका हृदय प्रेम से प्रसन्न होता है।', 
  'भक्ति', 
  87
),
(
  5,
  'दैनिक प्रेरणा', 
  'रामचरितमानस', 
  ARRAY['परहित सरिस धरम नहि भाई।', 'पर पीड़ा सम नहि अधमाई॥'], 
  'दूसरों का कल्याण करना सबसे बड़ा धर्म है और किसी को कष्ट पहुँचाना सबसे बड़ा पाप है। यही सच्चे धर्म का सार है।', 
  'जीवन मूल्य', 
  112
),
(
  6,
  'शांत एवं जीवनोपयोगी', 
  'रामचरितमानस', 
  ARRAY['मन कर्म वचन राम पद नेहा।', 'होइहि सफल जनम संदेहा॥'], 
  'जो व्यक्ति अपने मन, वचन और कर्म से भगवान श्रीराम के चरणों में प्रेम रखता है, उसका जीवन निश्चित रूप से सफल और सार्थक हो जाता है।', 
  'भक्ति', 
  74
),
(
  7,
  'भक्तिपूर्ण', 
  'रामचरितमानस', 
  ARRAY['राम नाम मणि दीप धरु, जीह देहरी द्वार।', 'तुलसी भीतर बाहेरहुँ, जौं चाहसि उजियार॥'], 
  'यदि जीवन में आंतरिक और बाहरी प्रकाश चाहते हो, तो अपनी वाणी पर श्रीराम के नाम का दीपक सदैव जलाए रखो। राम नाम जीवन को ज्ञान, शांति और प्रकाश से भर देता है।', 
  'भक्ति', 
  143
),
(
  8,
  'श्रीराम स्तुति', 
  'रामचरितमानस', 
  ARRAY['श्रीरामचन्द्र कृपालु भजु मन।', 'हरण भवभय दारुणम्॥'], 
  'हे मन! दयालु श्रीराम का भजन करो। वे संसार के दुख, भय और मोह का नाश करने वाले तथा अपने भक्तों पर असीम कृपा बरसाने वाले हैं।', 
  'स्तुति', 
  215
),
(
  9,
  'प्रेरणादायक', 
  'लोकप्रिय', 
  ARRAY['राम से बड़ा न कोई नाम।', 'राम बिना अधूरा हर काम॥'], 
  'भगवान श्रीराम का नाम जीवन को सही दिशा, शक्ति और शांति प्रदान करता है। उनके स्मरण से प्रत्येक कार्य शुभ और सफल बनने की प्रेरणा मिलती है।', 
  'प्रेरणा', 
  189
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  source = EXCLUDED.source,
  doha = EXCLUDED.doha,
  meaning = EXCLUDED.meaning,
  category = EXCLUDED.category;

-- 7. Reset the auto-increment counter for daily_dohas primary key safely
SELECT setval(pg_get_serial_sequence('daily_dohas', 'id'), coalesce(max(id), 1)) FROM daily_dohas;
