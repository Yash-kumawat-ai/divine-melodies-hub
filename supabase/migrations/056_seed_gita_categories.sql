-- ==============================================================================
-- Migration 056: Seed Gita Categories & Verses (Phase 2B)
-- ==============================================================================

-- 1. Seed Problem Categories (15 Curated Categories)
INSERT INTO public.gita_problem_categories (id, title_hindi, title_english, icon_name, sort_order) VALUES
('exam_failure', 'महत्वपूर्ण कार्य या परीक्षा में असफलता', 'Failed at something important', 'GraduationCap', 1),
('grief', 'प्रियजन का वियोग या शोक', 'Loss of a loved one', 'HeartCrack', 2),
('overthinking', 'अशांत मन और ध्यान की कमी', 'Restless mind, cannot focus', 'Brain', 3),
('indecision', 'निर्णय लेने में असमंजस', 'Torn between choices', 'Compass', 4),
('anger', 'क्रोध और प्रतिशोध की भावना', 'Burning with rage or revenge', 'Flame', 5),
('imposter_syndrome', 'स्वयं पर अविश्वास या हीनभावना', 'Feeling like a fraud', 'ShieldAlert', 6),
('burnout', 'मानसिक या शारीरिक थकान', 'No energy left to fight', 'BatteryLow', 7),
('fear_of_death', 'मृत्यु या अनहोनी का भय', 'Fear of death or loss', 'Sunrise', 8),
('jealousy', 'दूसरों से तुलना और ईर्ष्या', 'Comparing self to others', 'Scale', 9),
('greed_attachment', 'अत्यधिक लोभ और आसक्ति', 'Craving and attachment', 'Coins', 10),
('laziness', 'आलस्य और टालमटोल', 'Procrastination and inaction', 'Clock', 11),
('ego_pride', 'अहंकार और कर्तापन का भ्रम', 'Excess pride and ego', 'Crown', 12),
('relationship_conflict', 'अपनों से मतभेद और कलह', 'Conflict with people close to you', 'Users', 13),
('career_confusion', 'जीवन की दिशा और उद्देश्य की खोज', 'Unsure of path and purpose', 'Briefcase', 14),
('loneliness', 'अकेलापन और उपेक्षित महसूस होना', 'Feeling isolated and unseen', 'Sun', 15)
ON CONFLICT (id) DO UPDATE SET 
  title_hindi = EXCLUDED.title_hindi, 
  title_english = EXCLUDED.title_english,
  icon_name = EXCLUDED.icon_name,
  sort_order = EXCLUDED.sort_order;

-- 2. Seed Category Verses (37 Locked Mappings with Dynamic Lookups)
-- If any chapter/verse fails to resolve, UUID NOT NULL aborts transaction immediately
INSERT INTO public.gita_category_verses (category_id, verse_id, sort_order) VALUES
-- [exam_failure] Primary: 2.47 | Supporting: 2.48, 6.5
('exam_failure', (SELECT id FROM public.gita_verses WHERE chapter_number = 2 AND verse_number = 47), 1),
('exam_failure', (SELECT id FROM public.gita_verses WHERE chapter_number = 2 AND verse_number = 48), 2),
('exam_failure', (SELECT id FROM public.gita_verses WHERE chapter_number = 6 AND verse_number = 5), 3),

-- [grief] Primary: 2.13 | Supporting: 2.20, 2.22
('grief', (SELECT id FROM public.gita_verses WHERE chapter_number = 2 AND verse_number = 13), 1),
('grief', (SELECT id FROM public.gita_verses WHERE chapter_number = 2 AND verse_number = 20), 2),
('grief', (SELECT id FROM public.gita_verses WHERE chapter_number = 2 AND verse_number = 22), 3),

-- [overthinking] Primary: 6.26 | Supporting: 6.34, 6.35
('overthinking', (SELECT id FROM public.gita_verses WHERE chapter_number = 6 AND verse_number = 26), 1),
('overthinking', (SELECT id FROM public.gita_verses WHERE chapter_number = 6 AND verse_number = 34), 2),
('overthinking', (SELECT id FROM public.gita_verses WHERE chapter_number = 6 AND verse_number = 35), 3),

-- [indecision] Primary: 2.7 | Supporting: 3.35, 18.47
('indecision', (SELECT id FROM public.gita_verses WHERE chapter_number = 2 AND verse_number = 7), 1),
('indecision', (SELECT id FROM public.gita_verses WHERE chapter_number = 3 AND verse_number = 35), 2),
('indecision', (SELECT id FROM public.gita_verses WHERE chapter_number = 18 AND verse_number = 47), 3),

-- [anger] Primary: 2.62 | Supporting: 2.63, 16.21
('anger', (SELECT id FROM public.gita_verses WHERE chapter_number = 2 AND verse_number = 62), 1),
('anger', (SELECT id FROM public.gita_verses WHERE chapter_number = 2 AND verse_number = 63), 2),
('anger', (SELECT id FROM public.gita_verses WHERE chapter_number = 16 AND verse_number = 21), 3),

-- [imposter_syndrome] Primary: 6.5 | Supporting: 2.47
('imposter_syndrome', (SELECT id FROM public.gita_verses WHERE chapter_number = 6 AND verse_number = 5), 1),
('imposter_syndrome', (SELECT id FROM public.gita_verses WHERE chapter_number = 2 AND verse_number = 47), 2),

-- [burnout] Primary: 2.3 | Supporting: 11.33, 18.66
('burnout', (SELECT id FROM public.gita_verses WHERE chapter_number = 2 AND verse_number = 3), 1),
('burnout', (SELECT id FROM public.gita_verses WHERE chapter_number = 11 AND verse_number = 33), 2),
('burnout', (SELECT id FROM public.gita_verses WHERE chapter_number = 18 AND verse_number = 66), 3),

-- [fear_of_death] Primary: 2.20 | Supporting: 2.22, 2.23
('fear_of_death', (SELECT id FROM public.gita_verses WHERE chapter_number = 2 AND verse_number = 20), 1),
('fear_of_death', (SELECT id FROM public.gita_verses WHERE chapter_number = 2 AND verse_number = 22), 2),
('fear_of_death', (SELECT id FROM public.gita_verses WHERE chapter_number = 2 AND verse_number = 23), 3),

-- [jealousy] Primary: 12.13 | Supporting: 3.37
('jealousy', (SELECT id FROM public.gita_verses WHERE chapter_number = 12 AND verse_number = 13), 1),
('jealousy', (SELECT id FROM public.gita_verses WHERE chapter_number = 3 AND verse_number = 37), 2),

-- [greed_attachment] Primary: 16.21 | Supporting: 2.62
('greed_attachment', (SELECT id FROM public.gita_verses WHERE chapter_number = 16 AND verse_number = 21), 1),
('greed_attachment', (SELECT id FROM public.gita_verses WHERE chapter_number = 2 AND verse_number = 62), 2),

-- [laziness] Primary: 3.8 | Supporting: 18.39
('laziness', (SELECT id FROM public.gita_verses WHERE chapter_number = 3 AND verse_number = 8), 1),
('laziness', (SELECT id FROM public.gita_verses WHERE chapter_number = 18 AND verse_number = 39), 2),

-- [ego_pride] Primary: 3.27 | Supporting: 18.58
('ego_pride', (SELECT id FROM public.gita_verses WHERE chapter_number = 3 AND verse_number = 27), 1),
('ego_pride', (SELECT id FROM public.gita_verses WHERE chapter_number = 18 AND verse_number = 58), 2),

-- [relationship_conflict] Primary: 6.32 | Supporting: 12.13
('relationship_conflict', (SELECT id FROM public.gita_verses WHERE chapter_number = 6 AND verse_number = 32), 1),
('relationship_conflict', (SELECT id FROM public.gita_verses WHERE chapter_number = 12 AND verse_number = 13), 2),

-- [career_confusion] Primary: 3.35 | Supporting: 18.47
('career_confusion', (SELECT id FROM public.gita_verses WHERE chapter_number = 3 AND verse_number = 35), 1),
('career_confusion', (SELECT id FROM public.gita_verses WHERE chapter_number = 18 AND verse_number = 47), 2),

-- [loneliness] Primary: 6.30 | Supporting: 9.29
('loneliness', (SELECT id FROM public.gita_verses WHERE chapter_number = 6 AND verse_number = 30), 1),
('loneliness', (SELECT id FROM public.gita_verses WHERE chapter_number = 9 AND verse_number = 29), 2)
ON CONFLICT (category_id, verse_id) DO UPDATE SET sort_order = EXCLUDED.sort_order;

-- 3. Seed Category Guidance Text (HELD OPEN for user's literal copy)
-- ==============================================================================
-- Guidance text blocks will be appended here verbatim using dollar-quoting ($g$...$g$)
-- ==============================================================================
