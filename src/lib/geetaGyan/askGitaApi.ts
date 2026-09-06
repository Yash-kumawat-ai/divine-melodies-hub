import { supabase } from '@/lib/supabaseClient';

export interface ProblemCategory {
  id: string;
  title_hindi: string;
  title_english: string;
  icon_name: string | null;
  sort_order: number;
}

export interface GitaTranslation {
  source_id: string;
  language: string;
  translation_text: string;
}

export interface GitaVerse {
  id: string;
  chapter_number: number;
  verse_number: number;
  verse_order: number;
  sanskrit: string;
  transliteration: string | null;
  translations: GitaTranslation[];
}

export interface CategoryVerse {
  sort_order: number; // 1 = Primary, 2..3 = Supporting
  verse: GitaVerse;
}

export interface CategoryGuidance {
  guidance_hindi: string;
  guidance_english: string;
}

export interface CategoryDetail {
  id: string;
  title_hindi: string;
  title_english: string;
  icon_name: string | null;
  sort_order: number;
  guidance: CategoryGuidance;
  verses: CategoryVerse[];
}

// In-memory cache to guarantee 0ms latency on repeated visits
const categoriesCache: { data: ProblemCategory[] | null; timestamp: number } = {
  data: null,
  timestamp: 0,
};

const categoryDetailCache = new Map<string, { data: CategoryDetail; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Fetch all active problem categories for the catalog grid.
 */
export async function fetchCategories(): Promise<ProblemCategory[]> {
  const now = Date.now();
  if (categoriesCache.data && now - categoriesCache.timestamp < CACHE_TTL_MS) {
    return categoriesCache.data;
  }

  const { data, error } = await supabase
    .from('gita_problem_categories')
    .select('id, title_hindi, title_english, icon_name, sort_order')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Failed to fetch Gita problem categories:', error);
    throw new Error(error.message || 'Failed to load categories');
  }

  const result = (data || []) as ProblemCategory[];
  categoriesCache.data = result;
  categoriesCache.timestamp = now;
  return result;
}

/**
 * Fetch a single category with its guidance, ordered verses (1..3), and translations.
 */
export async function fetchCategoryDetail(categoryId: string): Promise<CategoryDetail> {
  const now = Date.now();
  const cached = categoryDetailCache.get(categoryId);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const { data, error } = await supabase
    .from('gita_problem_categories')
    .select(`
      id,
      title_hindi,
      title_english,
      icon_name,
      sort_order,
      gita_category_guidance (
        guidance_hindi,
        guidance_english
      ),
      gita_category_verses (
        sort_order,
        verse_id,
        gita_verses (
          id,
          chapter_number,
          verse_number,
          verse_order,
          sanskrit,
          transliteration,
          gita_translations (
            source_id,
            language,
            translation_text
          )
        )
      )
    `)
    .eq('id', categoryId)
    .single();

  if (error || !data) {
    console.error(`Failed to fetch detail for category ${categoryId}:`, error);
    throw new Error(error?.message || `Category ${categoryId} not found`);
  }

  // Type assertion for raw DB response
  const rawData = data as any;

  // Extract guidance
  const guidanceRaw = Array.isArray(rawData.gita_category_guidance)
    ? rawData.gita_category_guidance[0]
    : rawData.gita_category_guidance;

  const guidance: CategoryGuidance = {
    guidance_hindi: guidanceRaw?.guidance_hindi || '',
    guidance_english: guidanceRaw?.guidance_english || '',
  };

  // Extract and sort verses by sort_order (1 = Primary, 2..3 = Supporting)
  const rawVerses = Array.isArray(rawData.gita_category_verses) ? rawData.gita_category_verses : [];
  
  const sortedVerses: CategoryVerse[] = rawVerses
    .filter((cv: any) => cv && cv.gita_verses)
    .map((cv: any) => {
      const gv = cv.gita_verses;
      const translations: GitaTranslation[] = Array.isArray(gv.gita_translations)
        ? gv.gita_translations.map((t: any) => ({
            source_id: t.source_id,
            language: t.language,
            translation_text: t.translation_text,
          }))
        : [];

      return {
        sort_order: cv.sort_order,
        verse: {
          id: gv.id,
          chapter_number: gv.chapter_number,
          verse_number: gv.verse_number,
          verse_order: gv.verse_order,
          sanskrit: gv.sanskrit,
          transliteration: gv.transliteration,
          translations,
        },
      };
    })
    .sort((a: CategoryVerse, b: CategoryVerse) => a.sort_order - b.sort_order);

  const detail: CategoryDetail = {
    id: rawData.id,
    title_hindi: rawData.title_hindi,
    title_english: rawData.title_english,
    icon_name: rawData.icon_name,
    sort_order: rawData.sort_order,
    guidance,
    verses: sortedVerses,
  };

  categoryDetailCache.set(categoryId, { data: detail, timestamp: now });
  return detail;
}

/**
 * Helper to extract preferred translation:
 * For 'hi': tries 'raghavam_hindi_v1' (Raghavam Original) -> 'ramsukhdas' -> any 'hindi' -> fallback.
 * For 'en': tries 'purohitswami' (Public Domain 1935) -> 'sivananda' -> 'gambhirananda' -> any 'english' -> fallback.
 */
export function getPreferredTranslation(
  translations: GitaTranslation[],
  targetLanguage: 'hi' | 'en'
): { text: string; source: string; translatorName: string } {
  if (!translations || translations.length === 0) {
    return {
      text: targetLanguage === 'hi' ? 'अनुवाद उपलब्ध नहीं है।' : 'Translation currently unavailable.',
      source: 'unknown',
      translatorName: targetLanguage === 'hi' ? 'अज्ञात' : 'Unknown',
    };
  }

  if (targetLanguage === 'hi') {
    // 1. Primary: Raghavam Original Hindi Translation
    const raghavam = translations.find((t) => t.source_id === 'raghavam_hindi_v1');
    if (raghavam) {
      return {
        text: raghavam.translation_text,
        source: 'raghavam_hindi_v1',
        translatorName: 'राघवम् मौलिक अनुवाद',
      };
    }
    // 2. Secondary fallbacks
    const ramsukhdas = translations.find((t) => t.source_id === 'ramsukhdas');
    if (ramsukhdas) {
      return {
        text: ramsukhdas.translation_text,
        source: 'ramsukhdas',
        translatorName: 'स्वामी रामसुखदास (गीताप्रेस)',
      };
    }
    const anyHindi = translations.find((t) => t.language?.toLowerCase() === 'hindi');
    if (anyHindi) {
      return {
        text: anyHindi.translation_text,
        source: anyHindi.source_id,
        translatorName: anyHindi.source_id === 'tejomayananda' ? 'स्वामी तेजोमयानन्द' : anyHindi.source_id,
      };
    }
  } else {
    // 1. Primary: Shri Purohit Swami (1935, Public Domain)
    const purohit = translations.find((t) => t.source_id === 'purohitswami');
    if (purohit) {
      return {
        text: purohit.translation_text,
        source: 'purohitswami',
        translatorName: 'Shri Purohit Swami (1935, Public Domain)',
      };
    }
    // 2. Secondary fallbacks
    const sivananda = translations.find((t) => t.source_id === 'sivananda');
    if (sivananda) {
      return {
        text: sivananda.translation_text,
        source: 'sivananda',
        translatorName: 'Swami Sivananda (The Divine Life Society)',
      };
    }
    const gambhirananda = translations.find((t) => t.source_id === 'gambhirananda');
    if (gambhirananda) {
      return {
        text: gambhirananda.translation_text,
        source: 'gambhirananda',
        translatorName: 'Swami Gambhirananda',
      };
    }
    const anyEnglish = translations.find((t) => t.language?.toLowerCase() === 'english');
    if (anyEnglish) {
      return {
        text: anyEnglish.translation_text,
        source: anyEnglish.source_id,
        translatorName: anyEnglish.source_id,
      };
    }
  }

  // Fallback to first translation
  const first = translations[0];
  return {
    text: first.translation_text,
    source: first.source_id,
    translatorName: first.source_id,
  };
}

/**
 * Multi-lingual (English, Hindi, Hinglish) semantic keywords and stem triggers
 * for all 15 locked problem categories.
 */
export const CATEGORY_INTENT_TRIGGERS: Record<string, string[]> = {
  exam_failure: [
    'exam', 'exams', 'test', 'tests', 'fail', 'failed', 'failing', 'failure', 'marks', 'score',
    'grade', 'interview', 'rejected', 'rejection', 'upsc', 'neet', 'jee', 'boards', 'result',
    'results', 'attempt', 'preparation', 'study', 'studying', 'pariksha', 'asafal', 'asafalta',
    'fail ho gaya', 'marks kam', 'फेल', 'परीक्षा', 'असफलता', 'अंक', 'इंटरव्यू', 'हार गया'
  ],
  grief: [
    'grief', 'grieving', 'loss', 'lost someone', 'passed away', 'death of', 'died', 'dead',
    'mourn', 'mourning', 'crying', 'sadness', 'heartbroken', 'miss him', 'miss her', 'miss them',
    'shok', 'mrityu', 'nidhan', 'viyog', 'bichhadna', 'chhod gaya', 'chali gayi', 'rip',
    'दुख', 'शोक', 'वियोग', 'मृत्यु', 'निधन', 'प्रियजन', 'अपनों का वियोग', 'आंसू'
  ],
  overthinking: [
    'overthinking', 'overthink', 'thoughts', 'mind', 'cannot focus', 'cant focus', 'restless',
    'racing mind', 'anxious', 'anxiety', 'panic', 'spiral', 'stress', 'insomnia', 'sleep',
    'headache', 'dimag', 'chinta', 'ashant', 'vichar', 'man chanchal', 'shanti nahi', 'sochta rehta',
    'अशांत', 'चिंता', 'विचार', 'मन', 'तनाव', 'ध्यान', 'अनिद्रा', 'बेचैनी', 'उलझन'
  ],
  indecision: [
    'indecision', 'decide', 'decision', 'choices', 'choice', 'torn', 'confused', 'confusion',
    'dilemma', 'what to do', 'right path', 'dharma', 'stuck', 'doubt', 'two options',
    'asmanjas', 'nirnay', 'kya karu', 'duvidha', 'samajh nahi aa raha', 'bhram',
    'निर्णय', 'असमंजस', 'दुविधा', 'भ्रम', 'संशय', 'क्या करूं', 'द्वंद्व'
  ],
  anger: [
    'anger', 'angry', 'rage', 'revenge', 'furious', 'hate', 'hating', 'irritated', 'irritation',
    'betrayed', 'frustrated', 'mad at', 'temper', 'kill', 'destroy', 'gussa', 'krodh', 'badla',
    'nafrat', 'chidh', 'aavesh', 'क्रोध', 'गुस्सा', 'बदला', 'नफ़रत', 'प्रतिशोध', 'आवेश'
  ],
  imposter_syndrome: [
    'imposter', 'fraud', 'not good enough', 'worthless', 'self doubt', 'insecure', 'insecurity',
    'fake', 'unworthy', 'confidence', 'low confidence', 'inferior', 'kabil nahi', 'heenbhavna',
    'vishwas nahi', 'dhokha', 'हीनभावना', 'धोखेबाज़', 'अविश्वास', 'आत्मसंदेह', 'काबिलियत'
  ],
  burnout: [
    'burnout', 'burned out', 'tired', 'exhausted', 'exhaustion', 'no energy', 'give up',
    'giving up', 'quitting', 'drained', 'fatigue', 'cannot go on', 'cant do this', 'heavy',
    'thak gaya', 'thakan', 'himmat toot gayi', 'bas ho gaya', 'ऊर्जा', 'थकान', 'टूट जाना', 'हार मान'
  ],
  fear_of_death: [
    'fear of death', 'death', 'dying', 'scared to die', 'mortality', 'impermanence', 'accident',
    'illness', 'disease', 'terminal', 'cancer', 'mrityu ka bhay', 'dar', 'marne ka dar', 'bhay',
    'marna', 'मृत्यु का भय', 'डर', 'अनहोनी', 'काल', 'मृत्यु का डर', 'मौत'
  ],
  jealousy: [
    'jealous', 'jealousy', 'envy', 'envious', 'comparing', 'comparison', 'others have more',
    'unfair', 'unhappy for them', 'competition', 'jalan', 'irshya', 'tulna', 'hasad',
    'dusron ki tarakki', 'ईर्ष्या', 'जलन', 'तुलना', 'डाह', 'द्वेष'
  ],
  greed_attachment: [
    'greed', 'greedy', 'attachment', 'attached', 'craving', 'cravings', 'obsessed', 'obsession',
    'money', 'desire', 'desires', 'possessions', 'lust', 'cannot let go', 'cant let go',
    'lobh', 'lalach', 'aasakti', 'moh', 'maya', 'kamana', 'लोभ', 'लालच', 'आसक्ति', 'मोह', 'इच्छा'
  ],
  laziness: [
    'lazy', 'laziness', 'procrastination', 'procrastinate', 'procrastinating', 'delay', 'putting off',
    'no motivation', 'unmotivated', 'sloth', 'idle', 'inactivity', 'aalasya', 'talmatol',
    'mann nahi karta', 'aalsi', 'sust', 'आलस्य', 'टालमटोल', 'सुस्ती', 'अकर्म', 'काहिल'
  ],
  ego_pride: [
    'ego', 'pride', 'proud', 'arrogant', 'arrogance', 'superior', 'i did it', 'credit',
    'narcissist', 'boast', 'boasting', 'self important', 'ghamand', 'ahankar', 'abhiman',
    'ahambhav', 'main hu sab kuch', 'अहंकार', 'घमंड', 'अभिमान', 'कर्तापन', 'गर्व'
  ],
  relationship_conflict: [
    'relationship', 'relationships', 'conflict', 'fight', 'fighting', 'argument', 'arguments',
    'misunderstanding', 'partner', 'spouse', 'husband', 'wife', 'parents', 'family', 'friendship',
    'friends', 'breakup', 'divorce', 'cheated', 'matbhed', 'kalah', 'ladai', 'jhagda', 'tanaav',
    'संबंध', 'विवाद', 'कलह', 'मतभेद', 'झगड़ा', 'रिश्ते', 'पति', 'पत्नी', 'परिवार'
  ],
  career_confusion: [
    'career', 'job', 'profession', 'future', 'purpose', 'calling', 'direction', 'lost in life',
    'what should i do with my life', 'career choice', 'resignation', 'unemployed', 'naukri', 'pesha',
    'uddeshya', 'disha', 'bhavishya', 'career kya kare', 'career confusion', 'confused about career',
    'confused about my career', 'career doubt', 'career path', 'stuck in job', 'stuck in career',
    'करियर', 'नौकरी', 'उद्देश्य', 'भविष्य', 'दिशा', 'करियर की उलझन'
  ],
  loneliness: [
    'lonely', 'loneliness', 'alone', 'isolated', 'isolation', 'nobody cares', 'no friends',
    'empty', 'abandoned', 'unseen', 'ignored', 'left out', 'akela', 'akelapan', 'koi nahi hai',
    'koi apna nahi', 'अकेला', 'अकेलापन', 'उपेक्षित', 'एकाकी', 'सूनापन'
  ],
};

export interface MatchResult {
  category: ProblemCategory;
  score: number;
  matchedKeywords: string[];
}

/**
 * Deterministic semantic intent matcher:
 * Scores user query against multi-lingual trigger phrases and returns ranked category matches.
 */
export function matchProblemIntent(
  query: string,
  categories: ProblemCategory[]
): { bestMatch: ProblemCategory | null; suggestions: MatchResult[] } {
  if (!query || !query.trim() || !categories || categories.length === 0) {
    return { bestMatch: null, suggestions: [] };
  }

  const normalized = query.toLowerCase().trim();
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const results: MatchResult[] = [];

  for (const [catId, keywords] of Object.entries(CATEGORY_INTENT_TRIGGERS)) {
    const cat = categoryMap.get(catId);
    if (!cat) continue;

    let score = 0;
    const matched: string[] = [];

    for (const kw of keywords) {
      const lowerKw = kw.toLowerCase();
      if (normalized.includes(lowerKw)) {
        // Multi-word phrases get higher weight than single words
        const weight = lowerKw.includes(' ') ? 4 : lowerKw.length > 5 ? 3 : 2;
        score += weight;
        matched.push(kw);
      }
    }

    // Also check category titles
    if (normalized.includes(cat.title_english.toLowerCase())) {
      score += 5;
      matched.push(cat.title_english);
    }
    if (normalized.includes(cat.title_hindi)) {
      score += 5;
      matched.push(cat.title_hindi);
    }

    if (score > 0) {
      results.push({
        category: cat,
        score,
        matchedKeywords: matched,
      });
    }
  }

  results.sort((a, b) => b.score - a.score);

  const bestMatch = results.length > 0 && results[0].score >= 2 ? results[0].category : null;
  return {
    bestMatch,
    suggestions: results.slice(0, 3),
  };
}

