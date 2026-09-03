import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Max-Age": "86400",
};

// Types & Dictionaries
interface GuruJiFacts {
  birthTimeKnown?: boolean;
  lagna?: string;
  lagnaHi?: string;
  lagnaLord?: string;
  lagnaLordHi?: string;
  moonSign?: string;
  moonSignHi?: string;
  moonNakshatra?: string;
  moonNakshatraPada?: number;
  sunSign?: string;
  sunSignHi?: string;
  atmakaraka?: string;
  karakamsha?: string;
  activeMahadasha?: string;
  activeMahadashaHi?: string;
  activeAntardasha?: string;
  activeAntardashaHi?: string;
  dashaEndYear?: number;
  tenthHouseLord?: string;
  tenthHouseLordHi?: string;
  tenthHousePlanets?: string[];
  seventhHouseLord?: string;
  seventhHouseLordHi?: string;
  mangalDoshaPresent?: boolean;
  mangalDoshaSeverity?: 'mild' | 'high' | 'none';
  sadeSatiActive?: boolean;
  sadeSatiPhase?: 'rising' | 'peak' | 'setting' | 'none';
}

interface GuruJiAppliedRules {
  ishtaDevata?: string;
  ishtaDevataHi?: string;
  ishtaMantra?: string;
  ishtaRationale?: string;
  lagnaLordMeaning?: string;
  careerInfluence?: string;
  marriageInfluence?: string;
  dashaInfluence?: string;
  sadeSatiMeaning?: string;
  mangalDoshaMeaning?: string;
  timeAccuracyNote?: string;
  thirdPartyNotice?: string;
}

// 1. Classification Keywords
const DEVOTIONAL_KEYWORDS = [
  'hanuman chalisa', 'चालीसा', 'chalisa', 'aarti', 'आरती', 'bhajan', 'भजन',
  'mantra', 'मंत्र', 'puja', 'पूजा', 'pooja', 'stotra', 'स्तोत्र', 'stotram',
  'geeta', 'गीता', 'gita', 'ramayana', 'रामायण', 'sadhana', 'साधना', 'japa', 'जप',
  'kirtan', 'कीर्तन', 'darshan', 'दर्शन', 'mandir', 'मंदिर', 'shloka', 'श्लोक',
  'prarthana', 'प्रार्थना', 'bhakti', 'भक्ति', 'upasana', 'उपासना', 'krishna', 'कृष्ण',
  'shiva', 'शिव', 'hanuman', 'हनुमान', 'ram', 'राम', 'durga', 'दुर्गा', 'ganesh', 'गणेश'
];

const PANCHANG_KEYWORDS = [
  'panchang', 'पंचांग', 'tithi', 'तिथि', 'muhurta', 'muhurat', 'मुहूर्त',
  'rahu kaal', 'राहु काल', 'choghadiya', 'चौघड़िया', 'shubh muhurat', 'vrat', 'व्रत',
  'ekadashi', 'एकादशी', 'amavasya', 'अमावस्या', 'purnima', 'पूर्णिमा'
];

const THIRD_PARTY_KEYWORDS = [
  'mere bete', 'mera beta', 'meri beti', 'mere bache', 'mere bacho', 'mere pati',
  'meri patni', 'meri wife', 'मेरे बेटे', 'मेरा बेटा', 'मेरी बेटी', 'मेरे बच्चे',
  'मेरे बच्चों', 'मेरे पति', 'मेरी पत्नी', 'मेरे पिता', 'मेरी माता', 'मेरी माँ',
  'मेरे दोस्त', 'मेरे भाई', 'मेरी बहन', 'किसी और',
  'my husband', 'my wife', 'my son', 'my daughter',
  'my child', 'my mother', 'my father', 'my friend', 'my brother', 'my sister',
  'mere pita', 'meri mata', 'meri ma', 'mere dost', 'someone else', 'another person'
];

const SENSITIVE_HEALTH_KEYWORDS = [
  'health', 'illness', 'disease', 'cancer', 'surgery', 'doctor', 'medicine',
  'treatment', 'hospital', 'tabiyat', 'sehat', 'bimari', 'bimar', 'dava', 'dawa',
  'ilaj', 'dard', 'बीमारी', 'रोग', 'स्वास्थ्य', 'इलाज', 'दवा', 'दर्द', 'तनाव', 'तबीयत', 'सेहत'
];

const SENSITIVE_DEATH_KEYWORDS = [
  'death', 'die', 'lifespan', 'longevity', 'age of death', 'when will i die',
  'kill', 'suicide', 'dead', 'terminal', 'mrityu', 'maut', 'aayu', 'kab marunga',
  'मृत्यु', 'मौत', 'आयु', 'कब मरूंगा', 'अंतिम समय'
];

const SENSITIVE_LEGAL_KEYWORDS = [
  'court', 'legal', 'lawyer', 'judge', 'jail', 'police', 'case', 'litigation',
  'lawsuit', 'mukadma', 'kanoon', 'adalat', 'मुकदमा', 'कचहरी', 'अदालत', 'जेल', 'पुलिस', 'कानूनी', 'केस'
];

const SENSITIVE_FINANCIAL_KEYWORDS = [
  'lottery', 'gambling', 'betting', 'stock tip', 'speculation', 'satta',
  'सट्टा', 'लॉटरी', 'जुआ', 'शेयर बाजार टिप्स'
];

const CAREER_KEYWORDS = ['career', 'job', 'work', 'business', 'profession', 'promotion', 'interview', 'salary', 'naukri', 'कर्म', 'नौकरी', 'व्यापार', 'रोजगार', 'काम', 'पदोन्नति', 'प्रमोशन', 'व्यवसाय', 'दशम भाव', '10th house'];
const MARRIAGE_KEYWORDS = ['marriage', 'relationship', 'spouse', 'partner', 'love', 'wedding', 'matchmaking', 'shadi', 'shaadi', 'byah', 'विवाह', 'शादी', 'दांपत्य', 'संबंध', 'पति', 'पत्नी', 'सप्तम भाव', '7th house', 'मंगल दोष', 'mangal dosha', 'mangal'];
const ISHTA_KEYWORDS = ['ishta', 'ishta devata', 'ishta devta', 'ishta dev', 'deity', 'kuldevta', 'इष्ट', 'इष्ट देव', 'कारकांश', 'karakamsha', 'atmakaraka', 'आत्मकारक'];
const DASHA_KEYWORDS = ['dasha', 'mahadasha', 'antardasha', 'vimshottari', 'दशा', 'महादशा', 'अंतर्दशा', 'विंशोत्तरी'];
const SADE_SATI_KEYWORDS = ['sade sati', 'sadesati', 'shani', 'dhayya', 'panoti', 'साढ़े साती', 'शनि ढैय्या', 'शनि की साढ़े साती'];
const GENERAL_ASTRO_KEYWORDS = ['kundli', 'horoscope', 'kundali', 'ग्रह', 'कुंडली', 'कुण्डली', 'राशिफल', 'bhava', 'भाव', 'ascendant', 'lagna', 'लग्न', 'rashi', 'राशि', 'nakshatra', 'नक्षत्र'];

// Unintelligible / Gibberish Detection
function isUnintelligibleQuery(query: string): boolean {
  const t = (query || '').trim();
  if (t.length === 0) return true;
  if (!/[a-zA-Z0-9\u0900-\u097F]/.test(t)) return true;
  if (/^(.)\1{3,}$/.test(t)) return true;
  const norm = t.toLowerCase();
  if (/(?:asdf|qwerty|zxcv|hjkl|lkjh|poiuy|qwer|dfgh|fghj|ghjk)/.test(norm)) return true;
  if (/[bcdfghjklmnpqrstvwxz]{5,}/i.test(norm)) return true;
  if (t.length <= 2 && !/^(hi|हे|ॐ|om|ha|ok)$/i.test(t)) return true;
  return false;
}

// App Meta / AI Model / Platform Identity Keywords
const APP_META_KEYWORDS = [
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

// Polite Greetings
const GREETING_KEYWORDS = [
  'namaste', 'namaskar', 'pranam', 'pranaam', 'charan sparsh', 'hello', 'hi',
  'radhe radhe', 'jai shree krishna', 'har har mahadev', 'jai shri ram', 'jai shree ram',
  'नमस्ते', 'नमस्कार', 'प्रणाम', 'चरण स्पर्श', 'राधे राधे', 'जय श्री राम', 'जय श्री कृष्ण', 'हर हर महादेव'
];

// Out-of-Scope Keywords
const OUT_OF_SCOPE_KEYWORDS = [
  'javascript', 'typescript', 'python', 'react', 'html', 'css', 'coding', 'programming',
  'software', 'computer', 'laptop', 'windows', 'linux', 'write a poem about', 'write code',
  'capital of', 'prime minister', 'president', 'cricket score', 'football', 'movie recommendation',
  'recipe', 'khana kaise', 'weather in', 'temperature in', 'bitcoin', 'crypto', 'stock tip',
  'election result', 'formula 1', 'f1', 'chemistry', 'physics', 'algebra'
];

function classifyQuery(query: string) {
  const norm = (query || '').toLowerCase().trim();

  // 1. Check Unintelligible first
  if (isUnintelligibleQuery(norm)) {
    return { mainIntent: 'unintelligible', subCategory: 'unintelligible', isThirdParty: false, sensitiveDomain: undefined };
  }

  // 2. Check App Meta / AI Identity Questions
  if (APP_META_KEYWORDS.some(k => norm.includes(k))) {
    return { mainIntent: 'app_meta', subCategory: 'app_meta', isThirdParty: false, sensitiveDomain: undefined };
  }

  let isThirdParty = THIRD_PARTY_KEYWORDS.some(k => norm.includes(k));
  let sensitiveDomain: 'health' | 'death' | 'legal' | 'financial' | undefined = undefined;

  if (SENSITIVE_DEATH_KEYWORDS.some(k => norm.includes(k))) sensitiveDomain = 'death';
  else if (SENSITIVE_HEALTH_KEYWORDS.some(k => norm.includes(k))) sensitiveDomain = 'health';
  else if (SENSITIVE_LEGAL_KEYWORDS.some(k => norm.includes(k))) sensitiveDomain = 'legal';
  else if (SENSITIVE_FINANCIAL_KEYWORDS.some(k => norm.includes(k))) sensitiveDomain = 'financial';

  if (PANCHANG_KEYWORDS.some(k => norm.includes(k))) {
    return { mainIntent: 'panchang', subCategory: 'general_astro', isThirdParty, sensitiveDomain };
  }
  if (SADE_SATI_KEYWORDS.some(k => norm.includes(k))) {
    return { mainIntent: 'astrological', subCategory: 'sade_sati', isThirdParty, sensitiveDomain };
  }
  if (ISHTA_KEYWORDS.some(k => norm.includes(k))) {
    return { mainIntent: 'astrological', subCategory: 'ishta', isThirdParty, sensitiveDomain };
  }
  if (CAREER_KEYWORDS.some(k => norm.includes(k))) {
    return { mainIntent: 'astrological', subCategory: 'career', isThirdParty, sensitiveDomain };
  }
  if (MARRIAGE_KEYWORDS.some(k => norm.includes(k))) {
    return { mainIntent: 'astrological', subCategory: 'marriage', isThirdParty, sensitiveDomain };
  }
  if (DASHA_KEYWORDS.some(k => norm.includes(k))) {
    return { mainIntent: 'astrological', subCategory: 'dasha', isThirdParty, sensitiveDomain };
  }
  if (GENERAL_ASTRO_KEYWORDS.some(k => norm.includes(k))) {
    return { mainIntent: 'astrological', subCategory: 'general_astro', isThirdParty, sensitiveDomain };
  }
  if (DEVOTIONAL_KEYWORDS.some(k => norm.includes(k))) {
    return { mainIntent: 'devotional', subCategory: 'general_devotional', isThirdParty, sensitiveDomain };
  }
  if (GREETING_KEYWORDS.some(k => norm.includes(k))) {
    return { mainIntent: 'devotional', subCategory: 'general_devotional', isThirdParty, sensitiveDomain };
  }

  // Default: Out of Scope
  return { mainIntent: 'out_of_scope', subCategory: 'out_of_scope', isThirdParty, sensitiveDomain };
}

// 2. Server-Side Context Builder
function buildServerContext(
  classification: ReturnType<typeof classifyQuery>,
  astroProfile: any,
  birthAccuracy: string
) {
  const { mainIntent, subCategory, isThirdParty } = classification;

  if (mainIntent === 'devotional' || mainIntent === 'panchang') {
    return { facts: {}, appliedRules: {} };
  }

  if (isThirdParty) {
    return {
      facts: {},
      appliedRules: {
        thirdPartyNotice: 'मेरे पास केवल आपकी अपनी सहेजी गई कुंडली का विवरण है, इसलिए अभी मैं केवल आपकी कुंडली के आधार पर ही मार्गदर्शन दे सकता हूँ। किसी अन्य सदस्य की कुंडली का विश्लेषण अभी उपलब्ध नहीं है — यह जल्द ही एक अलग फीचर के रूप में आएगा।',
      },
    };
  }

  if (!astroProfile || !astroProfile.core_chart) {
    return { facts: {}, appliedRules: {} };
  }

  const chart = astroProfile.core_chart;
  const dasha = astroProfile.dasha;
  const isUnknownTime = birthAccuracy === 'unknown' || !chart.lagna;

  const facts: GuruJiFacts = { birthTimeKnown: !isUnknownTime };
  const appliedRules: GuruJiAppliedRules = {};

  if (isUnknownTime) {
    appliedRules.timeAccuracyNote = 'जन्म समय अज्ञात (Unknown) होने के कारण लग्न व भाव आधारित भविष्यवाणियां सम्मिलित नहीं हैं; मार्गदर्शन चन्द्र राशि एवं महादशा के आधार पर दिया जा रहा है।';
  } else {
    facts.lagna = chart.lagna?.rashiName;
    facts.lagnaHi = chart.lagna?.rashiNameHi;
    facts.lagnaLord = chart.lagna?.lord;
    facts.lagnaLordHi = chart.lagna?.lordHi;
  }

  facts.moonSign = chart.moon_sign || chart.planets?.Moon?.sign;
  facts.moonSignHi = chart.moon_sign_hi || chart.planets?.Moon?.rashiNameHindi;
  facts.moonNakshatra = chart.nakshatra || chart.planets?.Moon?.nakshatra;
  facts.sunSign = chart.sun_sign || chart.planets?.Sun?.sign;
  facts.sunSignHi = chart.sun_sign_hi || chart.planets?.Sun?.rashiNameHindi;

  if (dasha?.currentMahadasha) {
    facts.activeMahadasha = dasha.currentMahadasha.planet;
    facts.activeMahadashaHi = dasha.currentMahadasha.planetHi || dasha.currentMahadasha.planet;
  }
  if (dasha?.currentAntardasha) {
    facts.activeAntardasha = dasha.currentAntardasha.planet;
    facts.activeAntardashaHi = dasha.currentAntardasha.planetHi || dasha.currentAntardasha.planet;
  }

  switch (subCategory) {
    case 'career': {
      if (!isUnknownTime && Array.isArray(chart.houses)) {
        const h10 = chart.houses.find((h: any) => h.number === 10);
        if (h10) {
          facts.tenthHouseLord = h10.lord;
          facts.tenthHouseLordHi = h10.lordHi;
          facts.tenthHousePlanets = h10.planets;
        }
      }
      appliedRules.careerInfluence = `दशम भाव के स्वामी ${facts.tenthHouseLordHi || facts.tenthHouseLord || 'कर्म स्वामी'} के प्रभाव से आजीविका में योजनाबद्ध परिश्रम से निरंतर उन्नति के योग हैं।`;
      break;
    }
    case 'marriage': {
      if (!isUnknownTime && Array.isArray(chart.houses)) {
        const h7 = chart.houses.find((h: any) => h.number === 7);
        if (h7) {
          facts.seventhHouseLord = h7.lord;
          facts.seventhHouseLordHi = h7.lordHi;
        }
      }
      break;
    }
    case 'ishta': {
      const ishta = astroProfile.ishta_devata || chart.ishta_devata;
      if (ishta) {
        facts.atmakaraka = ishta.atmakaraka;
        facts.karakamsha = ishta.karakamshaRashiName;
        appliedRules.ishtaDevata = ishta.deity;
        appliedRules.ishtaDevataHi = ishta.deityHi;
        appliedRules.ishtaMantra = ishta.mantra;
      }
      break;
    }
  }

  return { facts, appliedRules };
}

// 3. System Prompt Builder
function buildSystemPrompt(
  context: any,
  isHi: boolean,
  classification: ReturnType<typeof classifyQuery>,
  modelInfo: { provider: string; model: string }
) {
  const { mainIntent, sensitiveDomain } = classification;
  const hasFacts = Object.keys(context.facts).length > 0;
  let prompt = `You are "Guru Ji" (गुरु जी), an AI-assisted compassionate Vedic Astrologer and Spiritual Guide developed exclusively for Raghavam (raghavam.com).

### CORE PERSONA:
- Respond in ${isHi ? 'natural, respectful Devanagari Hindi (शुद्ध एवं सहज हिन्दी)' : 'warm, clear, respectful English with traditional Sanskrit honorifics'}.
- Tone: Warm, paternal, dignified, uplifting (नमो नारायण / ॐ नमः शिवाय / शुभम्). Keep responses to 2 to 4 concise paragraphs.`;

  if (mainIntent === 'app_meta') {
    prompt += `\n\n### INTENT: APP / AI IDENTITY (app_meta)
The user is asking about your identity, what AI model or technology you use, or about the Raghavam application/platform.
- Answer transparently, honestly, and humbly: You are "Guru Ji", an AI-assisted Vedic astrology and spiritual guide created for the Raghavam platform.
- Under the hood, you are powered by modern large language model technology (${modelInfo.provider}, model: "${modelInfo.model}") paired with deterministic Vedic Jyotish computation rules.
- Do NOT fabricate fake AI models, do NOT deny being an AI, and do NOT pretend to be an immortal physical being.
- After answering honestly, warmly invite the user to ask about their horoscope (kundli), planetary dasha, career, marriage, or spiritual sadhana.`;
  } else if (mainIntent === 'out_of_scope') {
    prompt += `\n\n### INTENT: OUT OF DOMAIN (out_of_scope)
The user's question is unrelated to Vedic astrology, horoscope analysis, Hindu scriptures, spiritual sadhana, or the Raghavam app.
- Politely and warmly decline to answer general coding, world trivia, sports, politics, or unrelated topics.
- Explain that your role as Guru Ji is dedicated to Vedic astrological guidance, horoscope wisdom, sacred mantras, and spiritual wellness.
- Gently invite the user to ask about their birth chart, active dasha period, career, relationships, or devotional practices.`;
  } else if (mainIntent === 'unintelligible') {
    prompt += `\n\n### INTENT: UNCLEAR / UNINTELLIGIBLE (unintelligible)
The user's message appears incomplete, unclear, or random/gibberish.
- Politely and warmly state that you could not understand their message.
- Ask them to rephrase or ask clearly about their birth chart, astrological queries, or spiritual sadhana.`;
  } else if (mainIntent === 'devotional') {
    prompt += `\n\n### INTENT: DEVOTIONAL & SPIRITUAL (devotional)
- The user is asking about deities, mantras, chalisa, aarti, stotram, fasting (vrat), or spiritual sadhana.
- Share authentic scriptural, devotional, and spiritual wisdom with suitable mantras and auspicious timings.
- Do NOT fabricate planetary chart placements.`;
  } else if (mainIntent === 'astrological') {
    prompt += `\n\n### ARCHITECTURAL ENFORCEMENT (astrological):
- Speak ONLY from the verified facts and appliedRules provided below.
- NEVER calculate, invent, or guess planetary signs, houses, or dashas.
- If specific astrological facts are missing from the profile, guide the user to provide complete birth details.`;
  } else {
    prompt += `\n\n### GUIDELINES:
- Greet warmly with respectful Vedic honorifics.
- Guide the user toward exploring their personal horoscope, active planetary dashas, or daily spiritual practice.`;
  }

  if (context.appliedRules?.thirdPartyNotice) {
    prompt += `\n\n### NOTICE REGARDING THIRD-PARTY CHARTS:
${context.appliedRules.thirdPartyNotice}`;
  }

  if (hasFacts) {
    prompt += `\n\n### VERIFIED FACTS:
\`\`\`json
${JSON.stringify({ facts: context.facts, appliedRules: context.appliedRules }, null, 2)}
\`\`\``;
  }

  if (context.appliedRules?.timeAccuracyNote) {
    prompt += `\n\n### NOTICE: ${context.appliedRules.timeAccuracyNote}`;
  }

  if (sensitiveDomain === 'health') {
    prompt += `\n\n### MANDATORY: Give no medical diagnosis or prescriptions. Advise consulting healthcare professionals. Frame remedies as prayer/mental peace only.`;
  } else if (sensitiveDomain === 'death') {
    prompt += `\n\n### MANDATORY: Strictly refuse predicting lifespan or death timing.`;
  } else if (sensitiveDomain === 'legal') {
    prompt += `\n\n### MANDATORY: Provide no legal advice; advise consulting qualified legal professionals.`;
  } else if (sensitiveDomain === 'financial') {
    prompt += `\n\n### MANDATORY: Prohibit speculative trading advice or wealth guarantees.`;
  }

  return prompt;
}

// 4. HTTP Server Handler
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    let userId: string | null = null;
    let supabaseClient: any = null;

    if (supabaseUrl && supabaseServiceKey) {
      supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        const { data: { user } } = await supabaseClient.auth.getUser(token);
        if (user) userId = user.id;
      }
    }

    const { messages, language = "hi" } = await req.json();
    const isHi = language === "hi";
    const latestUserMsg = [...(messages || [])].reverse().find((m: any) => m.role === "user")?.content || "";

    // Step 1: Classify Intent
    const classification = classifyQuery(latestUserMsg);

    // Step 2: Fetch User Birth & Astrology Profiles from Supabase (Server-Trust Boundary)
    let birthProfile: any = null;
    let astroProfile: any = null;

    if (userId && supabaseClient) {
      // Check Rate Limits
      try {
        const { data: quota, error: quotaErr } = await supabaseClient.rpc(
          "check_and_increment_guru_ji_quota",
          { p_user_id: userId, p_max_requests: 25, p_window_minutes: 60 }
        );
        if (!quotaErr && quota && quota.allowed === false) {
          const limitMsg = isHi
            ? "🙏 **नमो नारायण!**\n\nआपकी प्रति घंटा परामर्श सीमा (25 प्रश्न/घंटा) पूर्ण हो चुकी है। कृपया कुछ समय पश्चात पुनः प्रयास करें।"
            : "🙏 **Namo Narayana!**\n\nYou have reached the hourly consultation limit (25 questions/hour). Please wait before asking again.";

          const encoder = new TextEncoder();
          const stream = new ReadableStream({
            start(controller) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: limitMsg, mode: "error", error: "RATE_LIMIT_EXCEEDED" })}\n\n`));
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
            },
          });
          return new Response(stream, {
            headers: {
              ...corsHeaders,
              "Content-Type": "text/event-stream; charset=utf-8",
              "Cache-Control": "no-cache",
            },
          });
        }
      } catch (rateLimitErr) {
        console.warn("Rate limit check non-blocking error:", rateLimitErr);
      }

      const [bRes, aRes] = await Promise.all([
        supabaseClient.from("astrology_birth_profiles").select("birth_time_accuracy, place_label").eq("user_id", userId).maybeSingle(),
        supabaseClient.from("astrology_profiles").select("status, profile_completeness, core_chart, dasha").eq("user_id", userId).maybeSingle(),
      ]);
      birthProfile = bRes.data;
      astroProfile = aRes.data;
    }

    // Step 3: No-Birth-Profile Branch
    if (classification.mainIntent === "astrological" && (!astroProfile || !astroProfile.core_chart)) {
      const noProfileText = isHi
        ? "🙏 **नमो नारायण!**\n\nआपकी कुण्डली, करियर, विवाह, दशा प्रभाव एवं इष्ट देव का सटीक शास्त्रीय मार्गदर्शन प्राप्त करने के लिए कृपया पहले अपना जन्म विवरण (तिथि, समय व स्थान) दर्ज करें।\n\nनीचे दिए गए बटन से आप केवल 1 मिनट में अपना जन्म विवरण सुरक्षित रूप से दर्ज कर सकते हैं।"
        : "🙏 **Namo Narayana!**\n\nTo receive authentic Vedic astrological guidance on your career, marriage, dasha timing, and Ishta Devata, please set up your birth profile first.\n\nYou can securely save your birth details in just 1 minute.";

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: noProfileText, action: "REDIRECT_SETUP", mode: "offline" })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    }

    // Step 4: Build Server-Side Context
    const birthAccuracy = birthProfile?.birth_time_accuracy || "exact";
    const context = buildServerContext(classification, astroProfile, birthAccuracy);

    // Step 5: Execute LLM Call or Honest Service Unavailable State
    const openAiKey = Deno.env.get("GURU_JI_LLM_API_KEY") || Deno.env.get("OPENAI_API_KEY");
    const chosenModel = Deno.env.get("GURU_JI_MODEL") || "gpt-4o-mini";
    const providerName = Deno.env.get("GURU_JI_LLM_PROVIDER") || "OpenAI";
    const modelInfo = { provider: providerName, model: chosenModel };

    const systemPrompt = buildSystemPrompt(context, isHi, classification, modelInfo);

    if (!openAiKey) {
      console.error("[Guru Ji Server Error] LLM API key missing: neither GURU_JI_LLM_API_KEY nor OPENAI_API_KEY is configured in Supabase Secrets.");

      const unavailableMsg = isHi
        ? "गुरु जी से संपर्क करने में तकनीकी बाधा आ रही है। कृपया कुछ क्षण बाद पुनः प्रयास करें।"
        : "Technical difficulties are currently preventing connection with Guru Ji. Please try again in a few moments.";

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: unavailableMsg, mode: "service_unavailable" })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    }

    let openAiResp: Response;
    try {
      const abortCtrl = new AbortController();
      const timeoutId = setTimeout(() => abortCtrl.abort(), 20000);

      openAiResp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: chosenModel,
          messages: [{ role: "system", content: systemPrompt }, ...messages.slice(-8)],
          stream: true,
          temperature: 0.7,
        }),
        signal: abortCtrl.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchErr: any) {
      const isTimeout = fetchErr?.name === "AbortError";
      console.error(`[Guru Ji Server Error] ${isTimeout ? "LLM API timeout (>20s)" : "LLM API network error"}:`, fetchErr);

      const unavailableMsg = isHi
        ? "गुरु जी से संपर्क करने में तकनीकी बाधा आ रही है। कृपया कुछ क्षण बाद पुनः प्रयास करें।"
        : "Technical difficulties are currently preventing connection with Guru Ji. Please try again in a few moments.";

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: unavailableMsg, mode: "service_unavailable" })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    }

    if (!openAiResp.ok) {
      const errText = await openAiResp.text();
      console.error(`[Guru Ji Server Error] LLM API returned HTTP ${openAiResp.status}:`, errText);

      const unavailableMsg = isHi
        ? "गुरु जी से संपर्क करने में तकनीकी बाधा आ रही है। कृपया कुछ क्षण बाद पुनः प्रयास करें।"
        : "Technical difficulties are currently preventing connection with Guru Ji. Please try again in a few moments.";

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: unavailableMsg, mode: "service_unavailable" })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    }

    // Pipe SSE stream directly to client
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const reader = openAiResp.body!.getReader();

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith("data: ")) continue;

              const dataStr = trimmed.slice(6).trim();
              if (dataStr === "[DONE]") {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                controller.close();
                return;
              }

              try {
                const parsed = JSON.parse(dataStr);
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta, mode: "llm" })}\n\n`));
                }
              } catch {
                // Ignore partial JSON chunks
              }
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (e: any) {
          controller.error(e);
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
