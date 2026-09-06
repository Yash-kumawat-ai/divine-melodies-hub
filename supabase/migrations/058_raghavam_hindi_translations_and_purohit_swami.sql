-- ==============================================================================
-- Migration 058: Register Raghavam Original Hindi & Purohit Swami English Translations
-- Description:
--   1. Registers 'raghavam_hindi_v1' (Proprietary / Raghavam Editorial) in gita_sources
--   2. Registers 'purohitswami' (1935 Public Domain, Shri Purohit Swami) in gita_sources
--   3. Seeds 28 Approved Raghavam Original Hindi Translations into gita_translations
--   4. Seeds 28 Verbatim Shri Purohit Swami English Translations into gita_translations
--
-- Target: 28 Core Verses powering Ask Gita's 15 Live Problem Categories
-- Author/Sign-off: Yash Kumawat (Approved: 2026-09-06)
-- Safeguard status: 0 substantive n-gram overlaps against Ramsukhdas & Tejomayananda
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. Register Sources in public.gita_sources
-- ------------------------------------------------------------------------------
INSERT INTO public.gita_sources (
  id,
  author_id,
  name,
  author,
  language,
  tradition,
  role,
  license,
  attribution,
  is_active
) VALUES
(
  'raghavam_hindi_v1',
  101,
  'Raghavam Original Hindi Translation (Phase 1)',
  'Raghavam Editorial',
  'hindi',
  'Raghavam Original Translation',
  'primary',
  'Proprietary / Raghavam Editorial',
  'हिंदी अनुवाद • राघवम् मौलिक अनुवाद',
  true
),
(
  'purohitswami',
  21,
  'The Geeta: The Gospel of the Lord Shri Krishna (1935)',
  'Shri Purohit Swami',
  'english',
  'Public Domain Historical Translation (d. 1941, Faber & Faber 1935)',
  'primary',
  'Public Domain',
  'English translation • Shri Purohit Swami (1935, Public Domain)',
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  author = EXCLUDED.author,
  tradition = EXCLUDED.tradition,
  role = EXCLUDED.role,
  license = EXCLUDED.license,
  attribution = EXCLUDED.attribution,
  is_active = EXCLUDED.is_active;

-- ------------------------------------------------------------------------------
-- 2. Seed 28 Approved Raghavam Original Hindi Translations
-- ------------------------------------------------------------------------------
-- [1/28] BG 2.3 (Raghavam Hindi Original)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 2 AND verse_number = 3),
  'raghavam_hindi_v1',
  'hindi',
  'अर्जुन, कायरता में मत गिर जाना, यह तुम्हारे लिए उचित नहीं है। छोटी सी हृदय की कमजोरी को छोड़कर उठ खड़े हो और शत्रुओं को पराजित कर।'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [2/28] BG 2.7 (Raghavam Hindi Original)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 2 AND verse_number = 7),
  'raghavam_hindi_v1',
  'hindi',
  'मेरी प्रकृति कार्पण्य के दोष से घायल हो गई है, मैं धर्म से भ्रमित हृदय वाला तुमसे पूछता हूँ। जो श्रेयस्कर निश्चित रूप से हो सकता है, उसे मुझे बताओ। मैं तुम्हारा शिष्य हूँ, मुझे शिक्षा दो, मैं तुम्हारी शरण में आया हूँ।'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [3/28] BG 2.13 (Raghavam Hindi Original)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 2 AND verse_number = 13),
  'raghavam_hindi_v1',
  'hindi',
  'जैसे देहधारी को इस शरीर में बाल्यावस्था, युवावस्था और वृद्धावस्था प्राप्त होती है, वैसे ही अन्य शरीर में गमन भी होता है; इस विषय पर धीर मनुष्य भ्रमित नहीं होते।'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [4/28] BG 2.20 (Raghavam Hindi Original)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 2 AND verse_number = 20),
  'raghavam_hindi_v1',
  'hindi',
  'यह आत्मा कभी जन्म नहीं लेती, न ही कभी मरती है। यह एक बार उत्पन्न होने के बाद फिर कभी नहीं होती। यह अजन्मा, नित्य, अमर और प्राचीन है। शरीर के नष्ट होने पर यह नष्ट नहीं होती।'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [5/28] BG 2.22 (Raghavam Hindi Original)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 2 AND verse_number = 22),
  'raghavam_hindi_v1',
  'hindi',
  'जैसे एक व्यक्ति पुराने कपड़ों को छोड़कर नए कपड़ों को पहनता है, वैसे ही आत्मा पुराने शरीरों को छोड़कर नए शरीरों में प्रवेश करती है।'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [6/28] BG 2.23 (Raghavam Hindi Original)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 2 AND verse_number = 23),
  'raghavam_hindi_v1',
  'hindi',
  'हथियार इस आत्मा को नहीं काट सकते, आग इसे नहीं जला सकती, पानी इसे नहीं भीगा सकता और हवा इसे नहीं सुखा सकती।'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [7/28] BG 2.47 (Raghavam Hindi Original)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 2 AND verse_number = 47),
  'raghavam_hindi_v1',
  'hindi',
  'तुम्हारा केवल अपने कर्तव्य का अधिकार है, फलों में कभी भी नहीं। कर्तव्य के परिणाम का कारण न बनो और कार्य से भी अत्यधिक लगाव न रखो।'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [8/28] BG 2.48 (Raghavam Hindi Original)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 2 AND verse_number = 48),
  'raghavam_hindi_v1',
  'hindi',
  'अर्जुन, योग में स्थिर रहकर और सफलता या असफलता के लिए अत्यधिक लगाव छोड़कर कार्य करो। मानसिक संतुलन को योग कहते हैं।'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [9/28] BG 2.62 (Raghavam Hindi Original)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 2 AND verse_number = 62),
  'raghavam_hindi_v1',
  'hindi',
  'जब व्यक्ति इन्द्रिय विषयों पर ध्यान केंद्रित करता है, तो उन विषयों से आसक्ति उत्पन्न होती है। इस आसक्ति से संसार की तृष्णा बढ़ती है, जो अवांछित परिणामों से क्रोध की उत्पत्ति करती है।'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [10/28] BG 2.63 (Raghavam Hindi Original)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 2 AND verse_number = 63),
  'raghavam_hindi_v1',
  'hindi',
  'क्रोध से मूढ़भाव होता है, मूढ़भाव से चेतना धुंधली हो जाती है। चेतना के धुंधले होने से समझ की शक्ति टूट जाती है, और समझ की शक्ति के टूटने से व्यक्ति अपने नाश की ओर बढ़ जाता है।'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [11/28] BG 3.8 (Raghavam Hindi Original)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 3 AND verse_number = 8),
  'raghavam_hindi_v1',
  'hindi',
  'नियत कर्म करना चाहिए, क्योंकि कर्म अकर्म से बेहतर है। शरीर का भी जीवन अकर्म से संभव नहीं होता।'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [12/28] BG 3.27 (Raghavam Hindi Original)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 3 AND verse_number = 27),
  'raghavam_hindi_v1',
  'hindi',
  'सभी प्रकार के कर्म त्रिगुणात्मक प्रकृति द्वारा सम्पन्न होते हैं, लेकिन अहंकार में मोहित आत्मा अपने आपको कर्ता मानता है।'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [13/28] BG 3.35 (Raghavam Hindi Original)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 3 AND verse_number = 35),
  'raghavam_hindi_v1',
  'hindi',
  'अपने स्वाभाविक कर्तव्य में दोष होने पर भी उसे अन्य के कर्तव्य से बेहतर माना जाता है। अपने कर्तव्य में मौत भी बेहतर है, अन्य के कर्तव्य में जीवन भयानक हो सकता है।'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [14/28] BG 3.37 (Raghavam Hindi Original)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 3 AND verse_number = 37),
  'raghavam_hindi_v1',
  'hindi',
  'श्री भगवान बोले—इस प्रकार इच्छा और क्रोध रजोगुण से उत्पन्न हैं। ये दोनों अत्यंत लालची और अत्यंत पापकारी हैं, इन्हें आप इस लोक में शत्रु मान लीजिए।'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [15/28] BG 6.5 (Raghavam Hindi Original)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 6 AND verse_number = 5),
  'raghavam_hindi_v1',
  'hindi',
  'मन का उपयोग करके अपने आत्मा को उठाएँ, और अपने आत्मा को नहीं गिराएँ। अपना मन ही आत्मा का सबसे अच्छा मित्र है और सबसे बड़ा दुश्मन भी।'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [16/28] BG 6.26 (Raghavam Hindi Original)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 6 AND verse_number = 26),
  'raghavam_hindi_v1',
  'hindi',
  'जब-जब यह चंचल तथा अस्थिर मन कहीं भी भटकने लगे, तब-तब इसे वहाँ से हटाकर परमात्मा में ही स्थिर कर लो।'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [17/28] BG 6.30 (Raghavam Hindi Original)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 6 AND verse_number = 30),
  'raghavam_hindi_v1',
  'hindi',
  'जो मुझे सर्वत्र साक्षात्कार करता है और सम्पूर्ण जगत को मुझमें ही प्रतिष्ठित पाता है—न तो मैं उससे कभी विलग होता हूँ, न वह मुझसे कभी दूर होता है।'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [18/28] BG 6.32 (Raghavam Hindi Original)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 6 AND verse_number = 32),
  'raghavam_hindi_v1',
  'hindi',
  'अर्जुन, जो व्यक्ति सबको अपने समान मानकर समान रूप से देखता है, चाहे उसे सुख हो या दुख, वह योगी सर्वोत्तम माना जाता है।'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [19/28] BG 6.34 (Raghavam Hindi Original)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 6 AND verse_number = 34),
  'raghavam_hindi_v1',
  'hindi',
  'हे कृष्ण, मन बहुत चंचल, तूफानी और मजबूत है। मुझे लगता है कि इसका नियंत्रण लगाना बहुत कठिन है, जैसे हवा का नियंत्रण करना।'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [20/28] BG 6.35 (Raghavam Hindi Original)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 6 AND verse_number = 35),
  'raghavam_hindi_v1',
  'hindi',
  'श्री भगवान उवाच—संशय नहीं है, हे महाबाहो, मन अत्यंत चंचल और दुर्नियंत्रित है; तथापि, हे कुन्तीनन्दन, निरंतर साधना और अनासक्ति के अवलंबन से यह नियंत्रित किया जा सकता है।'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [21/28] BG 9.29 (Raghavam Hindi Original)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 9 AND verse_number = 29),
  'raghavam_hindi_v1',
  'hindi',
  'मैं सभी प्राणियों के प्रति समान हूँ; मुझे किसी से द्वेष नहीं है और कोई विशेष प्रिय नहीं। जो लोग निष्काम भक्ति से मेरी सेवा करते हैं, वे मेरे भीतर रहते हैं और मैं भी उनके भीतर रहता हूँ।'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [22/28] BG 11.33 (Raghavam Hindi Original)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 11 AND verse_number = 33),
  'raghavam_hindi_v1',
  'hindi',
  'इसलिए उठो और आदर पाओ, शत्रुओं को पराजित करके समृद्ध राज्य का आनंद लो। मैंने ही इन्हें पहले से ही मार दिया है, तुम निमित्त मात्र हो अर्जुन।'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [23/28] BG 12.13 (Raghavam Hindi Original)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 12 AND verse_number = 13),
  'raghavam_hindi_v1',
  'hindi',
  'जो सभी प्राणियों के प्रति द्वेष रहित, मित्रवत, करुणामय, संपत्ति से निर्लग्न, अहंकार से मुक्त, दुख-सुख में समान और क्षमाशील होते हैं।'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [24/28] BG 16.21 (Raghavam Hindi Original)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 16 AND verse_number = 21),
  'raghavam_hindi_v1',
  'hindi',
  'तीन प्रकार के नरक के द्वार हैं, जो आत्मा का विनाश करते हैं—वासना, क्रोध, और लिप्सा। इन तीनों से छुटकारा पाना चाहिए।'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [25/28] BG 18.39 (Raghavam Hindi Original)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 18 AND verse_number = 39),
  'raghavam_hindi_v1',
  'hindi',
  'जो सुख अधिक नींद, आलस और लापरवाही से उत्पन्न होता है और यह आत्मा को मोहित करता है, वह शुरू से अंत तक तामसिक कहलाता है।'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [26/28] BG 18.47 (Raghavam Hindi Original)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 18 AND verse_number = 47),
  'raghavam_hindi_v1',
  'hindi',
  'अपने स्वाभाविक कर्तव्य को भले या बुरे से करना दूसरे के कर्तव्य को ठीक से करने से बेहतर है। अपनी प्रकृति के अनुसार कर्तव्य करने से मनुष्य दोष का भागी नहीं होता।'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [27/28] BG 18.58 (Raghavam Hindi Original)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 18 AND verse_number = 58),
  'raghavam_hindi_v1',
  'hindi',
  'मुझमें एकाग्र चित्त रहने से मेरी दिव्य अनुकंपा द्वारा तुम समस्त दुर्गम बाधाओं से छुटकारा पाओगे; किंतु यदि अहंकारवश मेरी बात की उपेक्षा की, तो तुम्हारा अधःपतन निश्चित है।'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [28/28] BG 18.66 (Raghavam Hindi Original)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 18 AND verse_number = 66),
  'raghavam_hindi_v1',
  'hindi',
  'सभी धर्मों को छोड़कर मुझमें एकमात्र शरण ले। मैं तुम्हें सभी पापों से मुक्त कर दूंगा, इससे घबराना नहीं है।'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- ------------------------------------------------------------------------------
-- 3. Seed 28 Verbatim Shri Purohit Swami (1935) English Translations
-- ------------------------------------------------------------------------------
-- [1/28] BG 2.3 (Shri Purohit Swami 1935 English)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 2 AND verse_number = 3),
  'purohitswami',
  'english',
  'O Arjuna! Why give way to unmanliness? O thou, who art the terror of thy enemies! Shake off such shameful effeminacy and make ready to act!'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [2/28] BG 2.7 (Shri Purohit Swami 1935 English)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 2 AND verse_number = 7),
  'purohitswami',
  'english',
  'My heart is oppressed with pity, and my mind is confused as to what my duty is. Therefore, my Lord, tell me what is best for my spiritual welfare, for I am Your disciple. Please direct me, I pray.'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [3/28] BG 2.13 (Shri Purohit Swami 1935 English)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 2 AND verse_number = 13),
  'purohitswami',
  'english',
  'As the soul experiences infancy, youth, and old age in this body, so finally it passes into another, the wise have no delusion about this.'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [4/28] BG 2.20 (Shri Purohit Swami 1935 English)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 2 AND verse_number = 20),
  'purohitswami',
  'english',
  'It was not born; it will never die, nor, once having been, can it cease to exist. Unborn, eternal, ever-enduring, yet most ancient, the spirit does not die when the body is dead.'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [5/28] BG 2.22 (Shri Purohit Swami 1935 English)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 2 AND verse_number = 22),
  'purohitswami',
  'english',
  'As a man discards his threadbare robes and puts on new ones, so the Spirit throws off its worn-out bodies and takes on fresh ones.'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [6/28] BG 2.23 (Shri Purohit Swami 1935 English)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 2 AND verse_number = 23),
  'purohitswami',
  'english',
  'Weapons cannot cleave it, fire cannot burn it, water cannot drench it, and wind cannot dry it.'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [7/28] BG 2.47 (Shri Purohit Swami 1935 English)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 2 AND verse_number = 47),
  'purohitswami',
  'english',
  'But you have only the right to work, but none to the fruit of it. Let not the fruit of your action be your motive; nor be you enamored of inaction.'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [8/28] BG 2.48 (Shri Purohit Swami 1935 English)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 2 AND verse_number = 48),
  'purohitswami',
  'english',
  'Perform all your actions with your mind concentrated on the Divine, renouncing attachment and looking upon success and failure with an equal eye. Spirituality implies equanimity.'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [9/28] BG 2.62 (Shri Purohit Swami 1935 English)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 2 AND verse_number = 62),
  'purohitswami',
  'english',
  'When a person dwells on the objects of sense, they create an attraction for them; this attraction develops into desire, and desire breeds anger.'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [10/28] BG 2.63 (Shri Purohit Swami 1935 English)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 2 AND verse_number = 63),
  'purohitswami',
  'english',
  'Anger induces delusion; delusion leads to loss of memory; loss of memory results in the shattering of reason; and the destruction of reason leads to destruction.'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [11/28] BG 3.8 (Shri Purohit Swami 1935 English)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 3 AND verse_number = 8),
  'purohitswami',
  'english',
  'Do your duty as prescribed, for action for duty''s sake is superior to inaction. Even the maintenance of the body would be impossible if one remained inactive.'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [12/28] BG 3.27 (Shri Purohit Swami 1935 English)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 3 AND verse_number = 27),
  'purohitswami',
  'english',
  'Action is the product of the qualities inherent in nature. It is only the ignorant man who, misled by personal egotism, says, "I am the doer."'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [13/28] BG 3.35 (Shri Purohit Swami 1935 English)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 3 AND verse_number = 35),
  'purohitswami',
  'english',
  'It is better to do one''s own duty, however lacking in merit, than to do that of another, even though efficiently. It is better to die doing one''s own duty, for doing the duty of another is fraught with danger.'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [14/28] BG 3.37 (Shri Purohit Swami 1935 English)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 3 AND verse_number = 37),
  'purohitswami',
  'english',
  'Lord Shri Krishna: It is desire, it is aversion, born of passion. Desire consumes and corrupts all things. It is the greatest enemy of man.'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [15/28] BG 6.5 (Shri Purohit Swami 1935 English)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 6 AND verse_number = 5),
  'purohitswami',
  'english',
  'Let him seek liberation with the help of his Highest Self, and never disgrace his own Self. For that Self is his only friend; yet it can also be his enemy.'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [16/28] BG 6.26 (Shri Purohit Swami 1935 English)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 6 AND verse_number = 26),
  'purohitswami',
  'english',
  'When the volatile and wavering mind wanders, let him restrain it and bring it back to its allegiance to the Self.'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [17/28] BG 6.30 (Shri Purohit Swami 1935 English)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 6 AND verse_number = 30),
  'purohitswami',
  'english',
  'He who sees Me in everything and everything in Me, I shall never forsake him, nor shall he lose Me.'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [18/28] BG 6.32 (Shri Purohit Swami 1935 English)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 6 AND verse_number = 32),
  'purohitswami',
  'english',
  'O Arjuna! He is the perfect saint who, having been taught by the likeness within himself, sees the same Self everywhere, regardless of whether the outer form be pleasurable or painful.'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [19/28] BG 6.34 (Shri Purohit Swami 1935 English)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 6 AND verse_number = 34),
  'purohitswami',
  'english',
  'My Lord! Verily, the mind is fickle and turbulent, obstinate, and strong; indeed, it is extremely difficult to control, like the wind.'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [20/28] BG 6.35 (Shri Purohit Swami 1935 English)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 6 AND verse_number = 35),
  'purohitswami',
  'english',
  'Lord Shri Krishna replied: Doubtless, O Mighty One, the mind is fickle and exceedingly difficult to restrain; however, O Son of Kunti, with practice and renunciation, it can be done.'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [21/28] BG 9.29 (Shri Purohit Swami 1935 English)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 9 AND verse_number = 29),
  'purohitswami',
  'english',
  'I am the same to all beings; I do not favour any, nor do I hate any. However, those who worship Me devotedly, they live in Me and I in them.'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [22/28] BG 11.33 (Shri Purohit Swami 1935 English)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 11 AND verse_number = 33),
  'purohitswami',
  'english',
  'Then gird up your loins and conquer. Subdue your foes and enjoy the kingdom in prosperity. I have already doomed them. Be thou my instrument, Arjuna!'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [23/28] BG 12.13 (Shri Purohit Swami 1935 English)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 12 AND verse_number = 13),
  'purohitswami',
  'english',
  'He who is incapable of hatred towards any being, who is kind and compassionate, free from selfishness, without pride, equable in pleasure and pain, and forgiving.'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [24/28] BG 16.21 (Shri Purohit Swami 1935 English)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 16 AND verse_number = 21),
  'purohitswami',
  'english',
  'The gates of hell are three: lust, wrath, and avarice; they destroy the Self, so avoid them.'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [25/28] BG 18.39 (Shri Purohit Swami 1935 English)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 18 AND verse_number = 39),
  'purohitswami',
  'english',
  'While the pleasure that drugs the senses from start to finish, which springs from indolence, lethargy, and folly—that pleasure flows from Ignorance.'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [26/28] BG 18.47 (Shri Purohit Swami 1935 English)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 18 AND verse_number = 47),
  'purohitswami',
  'english',
  'It is better to do one''s own duty, however defective it may be, than to follow the duty of another, however well one may perform it. He who does his duty as his own nature reveals it, never commits a sin.'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [27/28] BG 18.58 (Shri Purohit Swami 1935 English)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 18 AND verse_number = 58),
  'purohitswami',
  'english',
  'Fix your mind on Me, and by My grace you will overcome the obstacles in your path. But if, misled by pride, you do not listen, then you will indeed be lost.'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

-- [28/28] BG 18.66 (Shri Purohit Swami 1935 English)
INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)
VALUES (
  (SELECT id FROM public.gita_verses WHERE chapter_number = 18 AND verse_number = 66),
  'purohitswami',
  'english',
  'Give up your earthly duties, surrender yourself to Me alone. Do not be anxious; I will absolve you from all your sins.'
)
ON CONFLICT (verse_id, source_id) DO UPDATE
SET translation_text = EXCLUDED.translation_text;

COMMIT;
