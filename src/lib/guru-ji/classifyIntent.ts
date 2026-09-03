/**
 * GURU JI DETERMINISTIC INTENT CLASSIFIER (FROZEN)
 * 
 * Classifies user query into mainIntent, subCategory, third-party flag,
 * and sensitive domain tag. Single source of truth used by both
 * the client context builder, edge function, and offline fallback engine.
 */

import type {
  GuruJiClassification,
  GuruJiMainIntent,
  GuruJiSubCategory,
} from './types';
import type { SensitiveDomain } from '../astrology/vedicConfig';

// 1. Devotional / Bhakti Keywords
const DEVOTIONAL_KEYWORDS = [
  'hanuman chalisa', 'चालीसा', 'chalisa', 'aarti', 'आरती',
  'bhajan', 'भजन', 'mantra', 'मंत्र', 'puja', 'पूजा', 'pooja',
  'stotra', 'स्तोत्र', 'stotram', 'geeta', 'गीता', 'gita',
  'ramayana', 'रामायण', 'sadhana', 'साधना', 'japa', 'जप',
  'kirtan', 'कीर्तन', 'darshan', 'दर्शन', 'mandir', 'मंदिर',
  'temple', 'shloka', 'श्लोक', 'prarthana', 'प्रार्थना',
  'bhakti', 'भक्ति', 'upasana', 'उपासना', 'krishna', 'कृष्ण',
  'shiva', 'शिव', 'hanuman', 'हनुमान', 'ram', 'राम', 'durga', 'दुर्गा',
  'ganesh', 'गणेश', 'vishnu', 'विष्णु', 'laxmi', 'lakshmi', 'लक्ष्मी'
];

// 2. Panchang / Muhurta Keywords
const PANCHANG_KEYWORDS = [
  'panchang', 'पंचांग', 'tithi', 'तिथि', 'muhurta', 'muhurat', 'मुहूर्त',
  'rahu kaal', 'राहु काल', 'choghadiya', 'चौघड़िया', 'shubh muhurat',
  'vrat', 'व्रत', 'upavas', 'उपवास', 'ekadashi', 'एकादशी', 'amavasya', 'अमावस्या',
  'purnima', 'पूर्णिमा', 'sankranti', 'संक्रांति', 'festival', 'त्योहार'
];

// 3. Third-Party Keywords (Relatives / Someone else)
const THIRD_PARTY_KEYWORDS: Array<{ phrase: string; relation: string }> = [
  { phrase: 'mere bete', relation: 'son' },
  { phrase: 'mera beta', relation: 'son' },
  { phrase: 'meri beti', relation: 'daughter' },
  { phrase: 'mere bache', relation: 'child' },
  { phrase: 'mere bacho', relation: 'children' },
  { phrase: 'mere pati', relation: 'husband' },
  { phrase: 'meri patni', relation: 'wife' },
  { phrase: 'meri wife', relation: 'wife' },
  { phrase: 'मेरे बेटे', relation: 'son' },
  { phrase: 'मेरा बेटा', relation: 'son' },
  { phrase: 'मेरी बेटी', relation: 'daughter' },
  { phrase: 'मेरे बच्चे', relation: 'child' },
  { phrase: 'मेरे बच्चों', relation: 'children' },
  { phrase: 'मेरे पति', relation: 'husband' },
  { phrase: 'मेरी पत्नी', relation: 'wife' },
  { phrase: 'मेरे पिता', relation: 'father' },
  { phrase: 'मेरी माता', relation: 'mother' },
  { phrase: 'मेरी माँ', relation: 'mother' },
  { phrase: 'मेरे दोस्त', relation: 'friend' },
  { phrase: 'मेरे भाई', relation: 'brother' },
  { phrase: 'मेरी बहन', relation: 'sister' },
  { phrase: 'किसी और', relation: 'other' },
  { phrase: 'my husband', relation: 'husband' },
  { phrase: 'my wife', relation: 'wife' },
  { phrase: 'my son', relation: 'son' },
  { phrase: 'my daughter', relation: 'daughter' },
  { phrase: 'my child', relation: 'child' },
  { phrase: 'my mother', relation: 'mother' },
  { phrase: 'my father', relation: 'father' },
  { phrase: 'my friend', relation: 'friend' },
  { phrase: 'my brother', relation: 'brother' },
  { phrase: 'my sister', relation: 'sister' },
  { phrase: 'mere pita', relation: 'father' },
  { phrase: 'meri mata', relation: 'mother' },
  { phrase: 'meri ma', relation: 'mother' },
  { phrase: 'mere dost', relation: 'friend' },
  { phrase: 'someone else', relation: 'other' },
  { phrase: 'another person', relation: 'other' },
];

// 4. Sensitive Domain Dictionaries
const SENSITIVE_HEALTH_KEYWORDS = [
  'health', 'illness', 'disease', 'cancer', 'surgery', 'doctor', 'medicine',
  'treatment', 'hospital', 'tabiyat', 'sehat', 'bimari', 'bimar', 'dava', 'dawa',
  'ilaj', 'dard', 'बीमारी', 'रोग', 'स्वास्थ्य', 'इलाज', 'दवा',
  'चिकित्सा', 'अस्पताल', 'दर्द', 'तनाव', 'तबीयत', 'सेहत'
];

const SENSITIVE_DEATH_KEYWORDS = [
  'death', 'die', 'lifespan', 'longevity', 'age of death', 'when will i die',
  'kill', 'suicide', 'dead', 'terminal', 'mrityu', 'maut', 'aayu', 'kab marunga',
  'मृत्यु', 'मौत', 'आयु', 'कब मरूंगा', 'अंतिम समय', 'आयु निर्धारण'
];

const SENSITIVE_LEGAL_KEYWORDS = [
  'court', 'legal', 'lawyer', 'judge', 'jail', 'police', 'case', 'litigation',
  'lawsuit', 'mukadma', 'kanoon', 'adalat', 'मुकदमा', 'कचहरी', 'अदालत', 'जेल', 'पुलिस', 'कानूनी', 'केस'
];

const SENSITIVE_FINANCIAL_KEYWORDS = [
  'lottery', 'gambling', 'betting', 'stock tip', 'speculation', 'satta',
  'crypto pump', 'सट्टा', 'लॉटरी', 'जुआ', 'शेयर बाजार टिप्स'
];

// 5. Astrological Sub-Category Dictionaries
const CAREER_KEYWORDS = [
  'career', 'job', 'work', 'business', 'profession', 'promotion', 'interview',
  'salary', 'trade', 'startup', 'कर्म', 'नौकरी', 'व्यापार', 'रोजगार', 'काम',
  'पदोन्नति', 'प्रमोशन', 'व्यवसाय', 'दशम भाव', '10th house', 'tenth house',
  'transfer', 'आजीविका', 'office'
];

const MARRIAGE_KEYWORDS = [
  'marriage', 'relationship', 'spouse', 'partner', 'love', 'wedding', 'matchmaking',
  'divorce', 'match', 'gun milan', 'shadi', 'shaadi', 'byah', 'विवाह', 'शादी', 'दांपत्य', 'संबंध', 'पति',
  'पत्नी', 'सगाई', 'सप्तम भाव', '7th house', 'seventh house', 'मंगल दोष',
  'mangal dosha', 'mangal', 'प्रेम', 'रिश्ता'
];

const ISHTA_KEYWORDS = [
  'ishta', 'ishta devata', 'ishta devta', 'ishta dev', 'deity', 'kuldevta', 'kuldevi',
  'इष्ट', 'इष्ट देव', 'इष्ट देवता', 'कुलदेवता', 'कुलदेवी', 'कारकांश', 'karakamsha',
  'atmakaraka', 'आत्मकारक', 'सच्चा आराध्य'
];

const DASHA_KEYWORDS = [
  'dasha', 'mahadasha', 'antardasha', 'vimshottari', 'timing', 'period',
  'दशा', 'महादशा', 'अंतर्दशा', 'विंशोत्तरी', 'ग्रह दशा', 'समय चक्र', 'काल अवधि'
];

const SADE_SATI_KEYWORDS = [
  'sade sati', 'sadesati', 'shani', 'dhayya', 'panoti', 'साढ़े साती',
  'शनि ढैय्या', 'शनि की साढ़े साती', 'साढेसाती', 'शनि गोचर'
];

const WEALTH_KEYWORDS = [
  'wealth', 'finance', 'money', 'investment', 'debt', 'loan', 'income', 'dhan',
  'धन', 'संपत्ति', 'पैसा', 'आर्थिक', 'लाभ', 'कर्ज', 'ऋण', 'निवेश', 'द्वितीय भाव',
  'एकादश भाव', '2nd house', '11th house'
];

const HEALTH_ASTRO_KEYWORDS = [
  'health', 'illness', 'disease', 'stress', 'mental peace', 'tabiyat', 'sehat',
  'रोग', 'स्वास्थ्य', 'तनाव', 'मानसिक शांति', 'आरोग्य', 'तनु भाव', '1st house',
  'षष्ठ भाव', '6th house', 'तबीयत', 'सेहत'
];

const DOSHA_KEYWORDS = [
  'dosha', 'kaal sarp', 'pitra dosha', 'mangal dosha', 'grahan yoga', 'kalsarp',
  'दोष', 'काल सर्प', 'पितृ दोष', 'मंगल दोष', 'ग्रहण योग', 'कालसर्प'
];

const GENERAL_ASTRO_KEYWORDS = [
  'kundli', 'horoscope', 'kundali', 'ग्रह', 'कुंडली', 'कुण्डली', 'राशिफल',
  'bhava', 'भाव', 'ascendant', 'lagna', 'लग्न', 'rashi', 'राशि', 'nakshatra',
  'नक्षत्र', 'astrology', 'ज्योतिष'
];

// 6. Unintelligible / Gibberish Detection
export function isUnintelligibleQuery(query: string): boolean {
  const t = (query || '').trim();
  if (t.length === 0) return true;
  // If no alphanumeric characters and no Devanagari characters
  if (!/[a-zA-Z0-9\u0900-\u097F]/.test(t)) return true;
  // Repetitive characters like "aaaa", ".....", "?????"
  if (/^(.)\1{3,}$/.test(t)) return true;
  // Common keyboard mashing sequences: asdf, qwerty, zxcv, hjkl, etc.
  const norm = t.toLowerCase();
  if (/(?:asdf|qwerty|zxcv|hjkl|lkjh|poiuy|qwer|dfgh|fghj|ghjk)/.test(norm)) return true;
  // 5 or more consecutive consonants without vowels or spaces (e.g. "asdfgh", "bcdfgh", "zzzzz")
  if (/[bcdfghjklmnpqrstvwxz]{5,}/i.test(norm)) return true;
  // Very short non-word tokens (1-2 characters that aren't recognized abbreviations/words)
  if (t.length <= 2 && !/^(hi|हे|ॐ|om|ha|ok)$/i.test(t)) return true;
  return false;
}

// 7. App Meta / AI Model / Platform Identity Keywords
export const APP_META_KEYWORDS = [
  'konsa ai', 'kaun sa ai', 'kon sa ai', 'konsa model', 'kaun sa model', 'kon sa model',
  'which ai', 'what ai', 'which model', 'what model', 'who are you', 'who made you',
  'who developed you', 'who created you', 'who built you', 'who programmed you',
  'kisne banaya', 'tum kaun ho', 'aap kaun ho', 'aap kaun hain', 'tum kon ho', 'aap kon ho',
  'tum kya ho', 'aap kya ho', 'kya tum ai ho', 'kya aap ai ho', 'are you ai', 'are you an ai',
  'are you a bot', 'are you human', 'chatgpt', 'gpt-4', 'gpt', 'openai', 'claude', 'gemini',
  'llm', 'raghavam app', 'raghavam website', 'developer', 'system prompt', 'your prompt',
  'source code', 'backend', 'api key',
  // Hindi
  'कौन सा एआई', 'कौन सा ai', 'कौनसा एआई', 'कौन सा मॉडल', 'तुम कौन हो', 'आप कौन हैं',
  'आप कौन हो', 'तुम क्या हो', 'आप क्या हो', 'किसने बनाया', 'क्या तुम एआई हो', 'क्या आप एआई हैं'
];

// 8. Polite Greetings (should route to devotional/general with respectful welcome)
export const GREETING_KEYWORDS = [
  'namaste', 'namaskar', 'pranam', 'pranaam', 'charan sparsh', 'hello', 'hi',
  'radhe radhe', 'jai shree krishna', 'har har mahadev', 'jai shri ram', 'jai shree ram',
  'नमस्ते', 'नमस्कार', 'प्रणाम', 'चरण स्पर्श', 'राधे राधे', 'जय श्री राम', 'जय श्री कृष्ण', 'हर हर महादेव'
];

// 9. Out-of-Scope Keywords (General non-Vedic, non-spiritual topics)
export const OUT_OF_SCOPE_KEYWORDS = [
  'javascript', 'typescript', 'python', 'react', 'html', 'css', 'coding', 'programming',
  'software', 'computer', 'laptop', 'windows', 'linux', 'write a poem about', 'write code',
  'capital of', 'prime minister', 'president', 'cricket score', 'football', 'movie recommendation',
  'recipe', 'khana kaise', 'weather in', 'temperature in', 'bitcoin', 'crypto', 'stock tip',
  'election result', 'formula 1', 'f1', 'chemistry', 'physics', 'algebra'
];

export function classifyGuruJiIntent(query: string): GuruJiClassification {
  const normalized = (query || '').toLowerCase().trim();

  // 1. Detect Unintelligible / Gibberish first
  if (isUnintelligibleQuery(normalized)) {
    return {
      mainIntent: 'unintelligible',
      subCategory: 'unintelligible',
      isThirdPartyRequest: false,
    };
  }

  // 2. Detect App Meta / AI Identity Questions
  if (APP_META_KEYWORDS.some(k => normalized.includes(k))) {
    return {
      mainIntent: 'app_meta',
      subCategory: 'app_meta',
      isThirdPartyRequest: false,
    };
  }

  // 3. Detect Third-Party Request
  let isThirdPartyRequest = false;
  let thirdPartyRelation: string | undefined = undefined;

  for (const tp of THIRD_PARTY_KEYWORDS) {
    if (normalized.includes(tp.phrase)) {
      isThirdPartyRequest = true;
      thirdPartyRelation = tp.relation;
      break;
    }
  }

  // 4. Detect Sensitive Domain
  let sensitiveDomain: SensitiveDomain | undefined = undefined;
  if (SENSITIVE_DEATH_KEYWORDS.some(k => normalized.includes(k))) {
    sensitiveDomain = 'death';
  } else if (SENSITIVE_HEALTH_KEYWORDS.some(k => normalized.includes(k))) {
    sensitiveDomain = 'health';
  } else if (SENSITIVE_LEGAL_KEYWORDS.some(k => normalized.includes(k))) {
    sensitiveDomain = 'legal';
  } else if (SENSITIVE_FINANCIAL_KEYWORDS.some(k => normalized.includes(k))) {
    sensitiveDomain = 'financial';
  }

  // 5. Priority Intent Classification:
  // If explicitly asks about Panchang / Muhurta
  if (PANCHANG_KEYWORDS.some(k => normalized.includes(k))) {
    return {
      mainIntent: 'panchang',
      subCategory: 'general_astro',
      isThirdPartyRequest,
      thirdPartyRelation,
      sensitiveDomain,
    };
  }

  // Check Astrological Specific Sub-Categories
  if (SADE_SATI_KEYWORDS.some(k => normalized.includes(k))) {
    return { mainIntent: 'astrological', subCategory: 'sade_sati', isThirdPartyRequest, thirdPartyRelation, sensitiveDomain };
  }
  if (ISHTA_KEYWORDS.some(k => normalized.includes(k))) {
    return { mainIntent: 'astrological', subCategory: 'ishta', isThirdPartyRequest, thirdPartyRelation, sensitiveDomain };
  }
  if (CAREER_KEYWORDS.some(k => normalized.includes(k))) {
    return { mainIntent: 'astrological', subCategory: 'career', isThirdPartyRequest, thirdPartyRelation, sensitiveDomain };
  }
  if (MARRIAGE_KEYWORDS.some(k => normalized.includes(k))) {
    return { mainIntent: 'astrological', subCategory: 'marriage', isThirdPartyRequest, thirdPartyRelation, sensitiveDomain };
  }
  if (DASHA_KEYWORDS.some(k => normalized.includes(k))) {
    return { mainIntent: 'astrological', subCategory: 'dasha', isThirdPartyRequest, thirdPartyRelation, sensitiveDomain };
  }
  if (WEALTH_KEYWORDS.some(k => normalized.includes(k))) {
    return { mainIntent: 'astrological', subCategory: 'wealth', isThirdPartyRequest, thirdPartyRelation, sensitiveDomain };
  }
  if (DOSHA_KEYWORDS.some(k => normalized.includes(k))) {
    return { mainIntent: 'astrological', subCategory: 'dosha', isThirdPartyRequest, thirdPartyRelation, sensitiveDomain };
  }
  if (HEALTH_ASTRO_KEYWORDS.some(k => normalized.includes(k))) {
    return { mainIntent: 'astrological', subCategory: 'health', isThirdPartyRequest, thirdPartyRelation, sensitiveDomain };
  }
  if (GENERAL_ASTRO_KEYWORDS.some(k => normalized.includes(k))) {
    return { mainIntent: 'astrological', subCategory: 'general_astro', isThirdPartyRequest, thirdPartyRelation, sensitiveDomain };
  }

  // Check Devotional / Bhakti
  if (DEVOTIONAL_KEYWORDS.some(k => normalized.includes(k))) {
    return {
      mainIntent: 'devotional',
      subCategory: 'general_devotional',
      isThirdPartyRequest,
      thirdPartyRelation,
      sensitiveDomain,
    };
  }

  // Check Greetings
  if (GREETING_KEYWORDS.some(k => normalized.includes(k))) {
    return {
      mainIntent: 'devotional',
      subCategory: 'general_devotional',
      isThirdPartyRequest,
      thirdPartyRelation,
      sensitiveDomain,
    };
  }

  // Default: Out of Scope (unmatched input is out-of-scope, NOT devotional!)
  return {
    mainIntent: 'out_of_scope',
    subCategory: 'out_of_scope',
    isThirdPartyRequest,
    thirdPartyRelation,
    sensitiveDomain,
  };
}
