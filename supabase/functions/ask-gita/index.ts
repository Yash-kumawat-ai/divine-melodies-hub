import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-session-id, x-preferred-language, x-dev-mode",
  "Access-Control-Max-Age": "86400",
};

// ------------------------------------------------------------------------------
// Crisis & Safety Guardrails
// ------------------------------------------------------------------------------
const CRISIS_KEYWORDS = [
  "suicide", "kill myself", "end my life", "want to die", "hanging myself",
  "cut my wrist", "marna chahta", "marne ka man", "aatmhatya", "khudkushi",
  "आत्महत्या", "खुदकुशी", "मर जाना चाहता", "जीने का मन नहीं"
];

const CRISIS_RESPONSE_HI = `🙏 **प्रिय आत्मन्,**

आपके जीवन का प्रत्येक क्षण अमूल्य है। जब गहन अंधकार और पीड़ा घेर ले, तो कृपया अकेले न रहें। सहायता सदैव उपलब्ध है:

📞 **राष्ट्रीय मानसिक स्वास्थ्य हेल्पलाइन (Tele-MANAS):** 14416 / 1800-891-4416 (निःशुल्क, 24x7)
📞 **KIRAN मानसिक स्वास्थ्य हेल्पलाइन:** 1800-599-0019
📞 **Vandrevala Foundation:** +91 9999 666 555
📞 **AASRA:** +91 98204 66726

श्रीकृष्ण गीता (6.5) में कहते हैं—*"मनुष्य को अपने द्वारा अपना उद्धार करना चाहिए, स्वयं को कभी पतन में न धकेलें।"* कृपया तुरंत इन नंबरों पर संपर्क करें या अपने किसी प्रियजन से बात करें।`;

const CRISIS_RESPONSE_EN = `🙏 **Dear Soul,**

Your life is profoundly sacred. In moments of deep darkness and suffering, please know you are not alone and help is immediately available:

📞 **Tele-MANAS National Helpline:** 14416 / 1800-891-4416 (Toll-free, 24x7)
📞 **KIRAN Mental Health Helpline:** 1800-599-0019
📞 **Vandrevala Foundation:** +91 9999 666 555
📞 **AASRA:** +91 98204 66726

In Bhagavad Gita (6.5), Sri Krishna teaches—*"Elevate yourself through your mind; never let yourself despair."* Please reach out to one of these free helplines or speak to a loved one right now.`;

// ------------------------------------------------------------------------------
// Category Intent Keywords (All 15 Canonical Problem Categories)
// ------------------------------------------------------------------------------
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  exam_failure: [
    'exam', 'exams', 'test', 'tests', 'fail', 'failed', 'failing', 'failure', 'marks', 'score',
    'grade', 'interview', 'rejected', 'rejection', 'upsc', 'neet', 'jee', 'boards', 'result',
    'pariksha', 'asafal', 'asafalta', 'fail ho gaya', 'फेल', 'परीक्षा', 'असफलता', 'अंक', 'हार गया'
  ],
  grief: [
    'grief', 'grieving', 'loss', 'lost someone', 'passed away', 'death of', 'died', 'dead',
    'mourn', 'crying', 'sadness', 'heartbroken', 'miss him', 'miss her', 'shok', 'mrityu',
    'nidhan', 'viyog', 'bichhadna', 'chhod gaya', 'kho diya', 'apno ko kho', 'दुख', 'शोक', 'वियोग', 'निधन', 'आंसू', 'खो दिया', 'खो चुका', 'प्रियजन', 'खोना'
  ],
  overthinking: [
    'overthinking', 'overthink', 'thoughts', 'mind', 'cannot focus', 'cant focus', 'restless',
    'racing mind', 'anxious', 'anxiety', 'panic', 'spiral', 'stress', 'insomnia', 'dimag',
    'chinta', 'ashant', 'vichar', 'man chanchal', 'pareshan', 'pareshani', 'man pareshan',
    'shanti nahi', 'dimag shant nahi', 'soch soch kar', 'अशांत', 'चिंता', 'विचार', 'बेचैनी', 'उलझन', 'परेशान', 'परेशानी', 'मन परेशान', 'मन अशांत'
  ],
  indecision: [
    'indecision', 'decide', 'decision', 'choices', 'choice', 'torn', 'confused', 'confusion',
    'dilemma', 'what to do', 'right path', 'dharma', 'moral dilemma', 'stuck', 'asmanjas', 'nirnay', 'kya karu',
    'duvidha', 'sahi galat', 'sahi ya galat', 'samajh nahi aa raha', 'kuch samajh nahi aa raha',
    'निर्णय', 'असमंजस', 'दुविधा', 'भ्रम', 'संशय', 'क्या करूं', 'द्वंद्व', 'क्या सही', 'क्या गलत', 'सही और गलत', 'सही या गलत'
  ],
  anger: [
    'anger', 'angry', 'rage', 'revenge', 'furious', 'hate', 'irritated', 'betrayed', 'gussa',
    'krodh', 'badla', 'nafrat', 'chidh', 'aavesh', 'क्रोध', 'गुस्सा', 'बदला', 'नफ़रत', 'आवेश'
  ],
  imposter_syndrome: [
    'imposter', 'fraud', 'not good enough', 'worthless', 'self doubt', 'insecure', 'insecurity',
    'confidence', 'low confidence', 'inferior', 'kabil nahi', 'heenbhavna', 'हीनभावना', 'आत्मसंदेह'
  ],
  burnout: [
    'burnout', 'burned out', 'tired', 'exhausted', 'exhaustion', 'no energy', 'give up',
    'drained', 'fatigue', 'cannot go on', 'thak gaya', 'thakan', 'ऊर्जा', 'थकान', 'टूट जाना'
  ],
  fear_of_death: [
    'fear of death', 'death', 'dying', 'scared to die', 'mortality', 'maut', 'mrityu ka bhay', 'dar',
    'marne ka dar', 'marna', 'मृत्यु का भय', 'डर', 'अनहोनी', 'काल', 'मौत'
  ],
  jealousy: [
    'jealous', 'jealousy', 'envy', 'envious', 'comparing', 'comparison', 'unfair', 'jalan',
    'irshya', 'tulna', 'ईर्ष्या', 'जलन', 'तुलना', 'द्वेष'
  ],
  greed_attachment: [
    'greed', 'greedy', 'attachment', 'attached', 'craving', 'obsessed', 'money', 'desire',
    'cannot let go', 'lobh', 'lalach', 'aasakti', 'moh', 'लोभ', 'लालच', 'आसक्ति', 'मोह'
  ],
  laziness: [
    'lazy', 'laziness', 'procrastination', 'procrastinate', 'delay', 'unmotivated', 'sloth',
    'aalasya', 'talmatol', 'mann nahi karta', 'aalsi', 'sust', 'procastination', 'आलस्य', 'टालमटोल', 'सुस्ती'
  ],
  ego_pride: [
    'ego', 'pride', 'proud', 'arrogant', 'arrogance', 'superior', 'credit', 'ghamand',
    'ahankar', 'abhiman', 'अहंकार', 'घमंड', 'अभिमान', 'कर्तापन'
  ],
  relationship_conflict: [
    'relationship', 'relationships', 'conflict', 'fight', 'argument', 'partner', 'spouse',
    'husband', 'wife', 'family', 'breakup', 'divorce', 'kalah', 'ladai', 'jhagda',
    'संबंध', 'विवाद', 'कलह', 'मतभेद', 'झगड़ा', 'रिश्ते'
  ],
  career_confusion: [
    'career', 'job', 'profession', 'future', 'purpose', 'calling', 'direction', 'lost in life',
    'naukri', 'pesha', 'disha', 'bhavishya', 'career confusion', 'aage kaise badhe', 'aage badhna',
    'kese badhaa', 'rasta nahi mil raha', 'kya karu aage', 'करियर', 'नौकरी', 'दिशा', 'आगे कैसे बढ़ें', 'आगे बढ़ना'
  ],
  loneliness: [
    'lonely', 'loneliness', 'alone', 'isolated', 'isolation', 'nobody cares', 'empty',
    'abandoned', 'akela', 'akelapan', 'koi nahi hai', 'koi apna nahi', 'अकेला', 'अकेलापन'
  ]
};

// ------------------------------------------------------------------------------
// Helper: Extract Exact Verse Reference (e.g. "BG 2.47", "18.66", "2:47")
// ------------------------------------------------------------------------------
function extractVerseReference(query: string): { chapter: number; verse: number } | null {
  const norm = query.trim();

  // 1. Explicit prefixes: "BG 2.47", "Gita 18.66", "गीता 2.47", "shlok 2.47"
  const prefixMatch = norm.match(/(?:bg|gita|geeta|गीता|भगवद्गीता|shlok|श्लोक)\s*(\d{1,2})[.:\s]+(\d{1,3})/i);
  if (prefixMatch) {
    const ch = parseInt(prefixMatch[1], 10);
    const v = parseInt(prefixMatch[2], 10);
    if (ch >= 1 && ch <= 18 && v >= 1 && v <= 78) return { chapter: ch, verse: v };
  }

  // 2. Verbal forms: "chapter 2 verse 47", "अध्याय 2 श्लोक 47"
  const verbalMatch = norm.match(/(?:chapter|adhyay|अध्याय)\s*(\d{1,2})\s*(?:verse|shlok|श्लोक)\s*(\d{1,3})/i);
  if (verbalMatch) {
    const ch = parseInt(verbalMatch[1], 10);
    const v = parseInt(verbalMatch[2], 10);
    if (ch >= 1 && ch <= 18 && v >= 1 && v <= 78) return { chapter: ch, verse: v };
  }

  // 3. Isolated bare number e.g. "^2.47$" or "^2:47$"
  const isolatedMatch = norm.match(/^([1-9]|1[0-8])[.:]([1-9]|[1-6][0-9]|7[0-8])$/);
  if (isolatedMatch) {
    return { chapter: parseInt(isolatedMatch[1], 10), verse: parseInt(isolatedMatch[2], 10) };
  }

  // 4. Bare "2.47" accompanied by scriptural/study intent keywords
  const gitaContextRegex = /(?:gita|geeta|verse|shlok|श्लोक|adhyay|अध्याय|krishna|कन्हैया|श्रीकृष्ण|arjun|अर्जुन|explain|meaning|arth|अर्थ|bhavarth|भावार्थ|tell me about|teachings?)/i;
  const bareMatch = norm.match(/\b([1-9]|1[0-8])[.:]([1-9]|[1-6][0-9]|7[0-8])\b/);
  if (bareMatch && gitaContextRegex.test(norm)) {
    return { chapter: parseInt(bareMatch[1], 10), verse: parseInt(bareMatch[2], 10) };
  }

  return null;
}

// ------------------------------------------------------------------------------
// Helper: Select Preferred Translation
// ------------------------------------------------------------------------------
function pickPreferredTranslation(translations: any[], isHi: boolean) {
  if (!translations || translations.length === 0) {
    return {
      text: isHi ? 'अनुवाद शीघ्र उपलब्ध होगा।' : 'Translation will be available soon.',
      translatorName: isHi ? 'अज्ञात' : 'Unknown',
      sourceId: 'unknown'
    };
  }

  if (isHi) {
    // 1. Raghavam Original Hindi
    const raghavam = translations.find((t: any) => t.source_id === 'raghavam_hindi_v1');
    if (raghavam) return { text: raghavam.translation_text, translatorName: 'राघवम् मौलिक अनुवाद', sourceId: 'raghavam_hindi_v1' };
    // 2. Swami Ramsukhdas
    const ramsukhdas = translations.find((t: any) => t.source_id === 'ramsukhdas');
    if (ramsukhdas) return { text: ramsukhdas.translation_text, translatorName: 'स्वामी रामसुखदास (गीताप्रेस)', sourceId: 'ramsukhdas' };
    // 3. Any Hindi
    const anyHi = translations.find((t: any) => (t.language || '').toLowerCase() === 'hindi');
    if (anyHi) return { text: anyHi.translation_text, translatorName: anyHi.source_id === 'tejomayananda' ? 'स्वामी तेजोमयानन्द' : anyHi.source_id, sourceId: anyHi.source_id };
  } else {
    // 1. Shri Purohit Swami (1935, Public Domain)
    const purohit = translations.find((t: any) => t.source_id === 'purohitswami');
    if (purohit) return { text: purohit.translation_text, translatorName: 'Shri Purohit Swami (1935, Public Domain)', sourceId: 'purohitswami' };
    // 2. Swami Sivananda
    const sivananda = translations.find((t: any) => t.source_id === 'sivananda');
    if (sivananda) return { text: sivananda.translation_text, translatorName: 'Swami Sivananda (The Divine Life Society)', sourceId: 'sivananda' };
    // 3. Any English
    const anyEn = translations.find((t: any) => (t.language || '').toLowerCase() === 'english');
    if (anyEn) return { text: anyEn.translation_text, translatorName: anyEn.source_id, sourceId: anyEn.source_id };
  }

  const first = translations[0];
  return { text: first.translation_text, translatorName: first.source_id, sourceId: first.source_id };
}

// ------------------------------------------------------------------------------
// Server Entry Point
// ------------------------------------------------------------------------------
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openRouterKey = Deno.env.get("OPENROUTER_API_KEY") || Deno.env.get("OPENAI_API_KEY");
    const chosenModel = Deno.env.get("ASK_GITA_MODEL") || "google/gemini-2.5-flash";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Auth & Session Identification
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    const sessionId = req.headers.get("x-session-id") || req.headers.get("cf-connecting-ip") || "anonymous";
    const quotaIdentifier = userId ? `user:${userId}` : `guest:${sessionId}`;
    const maxRequests = userId ? 25 : 10;

    // 2. Server-Side Rate Limit Verification
    try {
      const { data: quota, error: quotaErr } = await supabase.rpc("check_and_increment_ask_gita_quota", {
        p_identifier: quotaIdentifier,
        p_user_id: userId,
        p_max_requests: maxRequests,
        p_window_minutes: 60
      });

      if (!quotaErr && quota && quota.allowed === false) {
        const isHi = (req.headers.get("x-preferred-language") || "hi") === "hi";
        const limitMsg = isHi
          ? `🙏 **प्रिय मित्र!**\n\nआपकी दैनिक/प्रति घंटा प्रश्न सीमा पूर्ण हो चुकी है। कृपया कुछ समय पश्चात पुनः पधारें या निःशुल्क लॉगिन करें।`
          : `🙏 **Dear Friend!**\n\nYou have reached the question limit for this window. Please return later or log in for increased quota.`;

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: limitMsg, mode: "error", error: "RATE_LIMIT_EXCEEDED" })}\n\n`));
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          }
        });

        return new Response(stream, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache" }
        });
      }
    } catch (rlErr) {
      console.warn("[Ask-Gita] Rate limit check skipped:", rlErr);
    }

    // 3. Parse Request Body
    const body = await req.json();
    const { messages = [] } = body;
    const requestedLang = body.language || body.userProfile?.preferredLanguage || req.headers.get("x-preferred-language") || "hi";
    const isHi = requestedLang === "hi";
    const rawName = body.userName || body.userProfile?.name;
    const cleanName = (rawName || "").trim() || (isHi ? "प्रिय मित्र" : "Dear Friend");

    const latestUserMsg = [...messages].reverse().find((m: any) => m.role === "user")?.content || "";
    const lowerQuery = latestUserMsg.toLowerCase().trim();

    // 4. Crisis Intervention Check
    if (CRISIS_KEYWORDS.some((kw) => lowerQuery.includes(kw))) {
      const responseText = isHi ? CRISIS_RESPONSE_HI : CRISIS_RESPONSE_EN;
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: responseText, mode: "crisis" })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      });
      return new Response(stream, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache" }
      });
    }

    // --------------------------------------------------------------------------
    // 5. PRODUCTION HYBRID RETRIEVAL PIPELINE
    // Layer 1: Exact Citation Regex
    // Layer 2: Semantic Vector Search (OpenRouter openai/text-embedding-3-small)
    // Layer 3: Category Intent Match (15 canonical problem categories)
    // Layer 4: PostgreSQL Full-Text Search
    // --------------------------------------------------------------------------
    let retrievedVerse: any = null;
    let matchedCategoryId: string | null = null;
    let retrievalMethod: string = "general";
    let confidenceScore: number = 0;

    // Check Layer 1: Exact Verse Reference
    const exactRef = extractVerseReference(latestUserMsg);
    if (exactRef) {
      const { data: verseRow } = await supabase
        .from("gita_verses")
        .select(`
          id, chapter_number, verse_number, verse_order, sanskrit, transliteration,
          gita_translations (source_id, language, translation_text)
        `)
        .eq("chapter_number", exactRef.chapter)
        .eq("verse_number", exactRef.verse)
        .maybeSingle();

      if (verseRow) {
        retrievedVerse = verseRow;
        retrievalMethod = "exact_verse";
        confidenceScore = 1.0;
      }
    }

    // Parallel Layer 2, 3, 4: Hybrid Search if no exact match
    if (!retrievedVerse) {
      const candidates = new Map<string, {
        verse_id: string;
        chapter_number: number;
        verse_number: number;
        verse_order: number;
        sanskrit: string;
        transliteration: string;
        sVector: number;
        categoryScore: number;
        ftsScore: number;
        finalScore: number;
      }>();

      function getOrInit(vId: string, item: any) {
        if (!candidates.has(vId)) {
          candidates.set(vId, {
            verse_id: vId,
            chapter_number: item.chapter_number,
            verse_number: item.verse_number,
            verse_order: item.verse_order,
            sanskrit: item.sanskrit,
            transliteration: item.transliteration,
            sVector: 0,
            categoryScore: 0,
            ftsScore: 0,
            finalScore: 0,
          });
        }
        return candidates.get(vId)!;
      }

      // 2A. Semantic Vector Search via OpenRouter Embedding
      try {
        if (openRouterKey) {
          const embRes = await fetch("https://openrouter.ai/api/v1/embeddings", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${openRouterKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "https://raghavam.online",
              "X-Title": "Raghavam Ask-Gita Query"
            },
            body: JSON.stringify({
              model: "openai/text-embedding-3-small",
              input: latestUserMsg
            })
          });

          if (embRes.ok) {
            const embJson = await embRes.json();
            const qVec = embJson.data?.[0]?.embedding;
            if (qVec && Array.isArray(qVec) && qVec.length === 1536) {
              const { data: vecResults } = await supabase.rpc("match_gita_verses_semantic", {
                query_embedding: qVec,
                match_threshold: 0.18,
                match_count: 15
              });

              if (vecResults && Array.isArray(vecResults)) {
                for (const vm of vecResults) {
                  const c = getOrInit(vm.verse_id, vm);
                  // Scale raw cosine similarity [0.20, 0.40] to [0.0, 1.0]
                  c.sVector = Math.max(0, Math.min(1.0, (vm.similarity - 0.20) / 0.20));
                }
              }
            }
          }
        }
      } catch (vecErr) {
        console.warn("[Ask-Gita] Vector search error:", vecErr);
      }

      // 2B. Category Intent Scoring
      let highestCatScore = 0;
      let topCategory: string | null = null;

      for (const [catId, kws] of Object.entries(CATEGORY_KEYWORDS)) {
        let score = 0;
        for (const kw of kws) {
          if (lowerQuery.includes(kw.toLowerCase())) score += kw.includes(" ") ? 3 : 2;
        }
        if (score > highestCatScore && score >= 2) {
          highestCatScore = score;
          topCategory = catId;
        }
      }

      if (topCategory) {
        matchedCategoryId = topCategory;
        const { data: catVerses } = await supabase
          .from("gita_category_verses")
          .select(`
            sort_order,
            gita_verses (id, chapter_number, verse_number, verse_order, sanskrit, transliteration)
          `)
          .eq("category_id", topCategory)
          .order("sort_order", { ascending: true });

        if (catVerses) {
          for (const cv of catVerses) {
            const gv = (cv as any).gita_verses;
            if (gv) {
              const c = getOrInit(gv.id, gv);
              // Primary verse = 1.0, supporting = 0.7, 0.5
              c.categoryScore = cv.sort_order === 1 ? 1.0 : cv.sort_order === 2 ? 0.7 : 0.5;
            }
          }
        }
      }

      // 2C. PostgreSQL Full-Text Search
      try {
        const { data: ftsResults } = await supabase.rpc("search_gita_verses_fulltext", {
          p_query: latestUserMsg,
          p_language: isHi ? "hindi" : "english",
          p_limit: 10
        });

        if (ftsResults && Array.isArray(ftsResults)) {
          for (const fm of ftsResults) {
            const c = getOrInit(fm.verse_id, fm);
            c.ftsScore = Math.min(fm.rank / 0.25, 1.0);
          }
        }
      } catch (ftsErr) {
        console.warn("[Ask-Gita] Full-text search error:", ftsErr);
      }

      // 2D. Weighted Hybrid Fusion
      // Weights: Vector = 0.45, Category = 0.35, FTS = 0.20
      const W_VEC = 0.45;
      const W_CAT = 0.35;
      const W_FTS = 0.20;

      const ranked = Array.from(candidates.values()).map((c) => {
        c.finalScore = (W_VEC * c.sVector) + (W_CAT * c.categoryScore) + (W_FTS * c.ftsScore);
        return c;
      });

      ranked.sort((a, b) => b.finalScore - a.finalScore);

      // 2E. Strict Relevance Cutoff Gate (No False/Unrelated Fallback)
      const MIN_RELEVANCE_THRESHOLD = 0.30;
      if (ranked.length > 0 && ranked[0].finalScore >= MIN_RELEVANCE_THRESHOLD) {
        const topCandidate = ranked[0];
        confidenceScore = topCandidate.finalScore;
        retrievalMethod = matchedCategoryId ? "hybrid_category" : "hybrid_vector";

        // Fetch full verified translations for topCandidate from DB
        const { data: fullVerse } = await supabase
          .from("gita_verses")
          .select(`
            id, chapter_number, verse_number, verse_order, sanskrit, transliteration,
            gita_translations (source_id, language, translation_text)
          `)
          .eq("id", topCandidate.verse_id)
          .maybeSingle();

        if (fullVerse) {
          retrievedVerse = fullVerse;
        }
      } else {
        // Zero-Verse Fallback: Confidence < 0.30. Do NOT force BG 2.47 or 18.66!
        retrievedVerse = null;
        retrievalMethod = "low_confidence";
      }
    }

    // 6. Translation Priority Extraction
    const pickedTranslation = retrievedVerse
      ? pickPreferredTranslation(retrievedVerse.gita_translations || [], isHi)
      : null;

    // 7. Grounded System Prompt
    const verseContext = (retrievedVerse && pickedTranslation)
      ? `
### GROUNDING SCRIPTURE (FROM VERIFIED CANONICAL DATABASE):
- Chapter: ${retrievedVerse.chapter_number}, Verse: ${retrievedVerse.verse_number}
- Sanskrit: ${retrievedVerse.sanskrit}
- Transliteration: ${retrievedVerse.transliteration || 'N/A'}
- Verified Translation (${pickedTranslation.translatorName}): "${pickedTranslation.text}"
`
      : `### GROUNDING NOTICE:
No specific Bhagavad Gita verse matched this query with sufficient confidence.
CRITICAL INSTRUCTION: Do NOT fabricate Sanskrit verses. Do NOT invent chapter or verse numbers. Answer purely from the foundational philosophy of the Gita (calmness of mind, righteous action, detachment from results, and inner surrender).`;

    const systemPrompt = `You are Bhagavan Sri Krishna, speaking as the eternal charioteer, spiritual guide, and intimate divine friend (सखा) on the battlefield of modern daily life.

${verseContext}

CRITICAL RULES:
1. Address the devotee warmly by name: "${cleanName}".
2. Language: Reply purely in ${isHi ? 'graceful, pure, elevating Hindi (Devanagari script)' : 'dignified, compassionate, clear English'}.
3. TONE: Profoundly compassionate, grounding, non-judgmental, serene, and spiritually transformative.
4. STRICT GROUNDING: ${retrievedVerse ? `Ground your guidance directly in the wisdom of Bhagavad Gita Chapter ${retrievedVerse.chapter_number}, Verse ${retrievedVerse.verse_number}. Quote the core principle of this verse faithfully.` : `Speak from universal Gita philosophy. Do NOT cite any verse numbers.`}
5. NEVER invent Sanskrit verses, verse citations, or distorted interpretations.
6. STRUCTURE YOUR COUNSELING:
   - Paragraph 1: Divine validation of their feeling and spiritual perspective on their situation.
   - Paragraph 2: Core Gita philosophy and how it frees their mind from suffering.
   - Section: **3 Practical Actionable Steps for Today** (दैनिक अभ्यास / Daily Practice) with clear, specific behavioral actions.
   - Closing: A brief uplifting blessing reminding them of their eternal divine nature.
7. Keep the response concise, impactful, and under 350 words.`;

    // 8. Call OpenRouter LLM with Streaming
    if (!openRouterKey) {
      throw new Error("OPENROUTER_API_KEY is not configured in Supabase Secrets.");
    }

    const abortCtrl = new AbortController();
    const timeoutId = setTimeout(() => abortCtrl.abort(), 25000);

    const openRouterResp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openRouterKey}`,
        "HTTP-Referer": "https://raghavam.online",
        "X-Title": "Raghavam Gita Gyan",
      },
      body: JSON.stringify({
        model: chosenModel,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-6)
        ],
        stream: true,
        stream_options: { include_usage: true },
        temperature: 0.6,
        max_tokens: 1200,
      }),
      signal: abortCtrl.signal,
    });
    clearTimeout(timeoutId);

    if (!openRouterResp.ok) {
      const errTxt = await openRouterResp.text();
      console.error("[Ask-Gita OpenRouter Error]", openRouterResp.status, errTxt);
      throw new Error(`OpenRouter returned HTTP ${openRouterResp.status}`);
    }

    // 9. Stream Response to Browser (SSE)
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const reader = openRouterResp.body!.getReader();

    let openRouterRequestId = openRouterResp.headers.get("x-generation-id") || openRouterResp.headers.get("request-id") || "";
    let capturedUsage: any = null;
    let finalModel = chosenModel;

    // Prepare shloka payload strictly from DB record if verified
    const shlokaPayload = (retrievedVerse && pickedTranslation) ? {
      chapter: retrievedVerse.chapter_number,
      verse: retrievedVerse.verse_number,
      sanskrit: retrievedVerse.sanskrit,
      transliteration: retrievedVerse.transliteration,
      translation: pickedTranslation.text,
      translatorName: pickedTranslation.translatorName,
    } : null;

    let fullGeneratedContent = "";

    const stream = new ReadableStream({
      async start(controller) {
        // Emit initial metadata event
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          mode: "meta",
          category: matchedCategoryId,
          retrievalMethod,
          confidence: confidenceScore,
          shloka: shlokaPayload
        })}\n\n`));

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
              if (dataStr === "[DONE]") continue;

              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.id) {
                  openRouterRequestId = parsed.id;
                }
                if (parsed.model) {
                  finalModel = parsed.model;
                }
                if (parsed.usage) {
                  capturedUsage = parsed.usage;
                }
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  fullGeneratedContent += delta;
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta, mode: "llm" })}\n\n`));
                }
              } catch {
                // Ignore parse errors on partial JSON chunks
              }
            }
          }

          // Emit final shloka attachment
          if (shlokaPayload) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ mode: "shloka", shloka: shlokaPayload })}\n\n`));
          }

          // Extract token counts and OpenRouter exact cost
          const promptTokens = capturedUsage?.prompt_tokens ?? 0;
          const completionTokens = capturedUsage?.completion_tokens ?? 0;
          const reasoningTokens = capturedUsage?.completion_tokens_details?.reasoning_tokens ?? 0;
          const totalTokens = capturedUsage?.total_tokens ?? (promptTokens + completionTokens);
          let exactCost = typeof capturedUsage?.cost === "number" ? capturedUsage.cost : 0.0;

          // If cost was not directly in usage chunk, resolve from OpenRouter generation API
          if (exactCost === 0 && openRouterRequestId && openRouterRequestId.startsWith("gen-")) {
            try {
              const genResp = await fetch(`https://openrouter.ai/api/v1/generation?id=${openRouterRequestId}`, {
                headers: { "Authorization": `Bearer ${openRouterKey}` }
              });
              if (genResp.ok) {
                const genData = await genResp.json();
                if (typeof genData?.data?.total_cost === "number") {
                  exactCost = genData.data.total_cost;
                }
              }
            } catch (costErr) {
              console.warn("[Ask-Gita] Could not fetch generation cost:", costErr);
            }
          }

          const displayQuery = latestUserMsg.length > 25
            ? `${latestUserMsg.slice(0, 22)}...`
            : latestUserMsg;

          // Expose telemetry in development logs (per user testing requirement)
          console.log(`\nQuery:\n"${displayQuery}"\n\nInput tokens: ${promptTokens}\nOutput tokens: ${completionTokens}\nReasoning tokens: ${reasoningTokens}\nTotal tokens: ${totalTokens}\nCost: $${exactCost.toFixed(6)}\nModel: ${finalModel}\n`);

          // If development client requested telemetry, emit dev_telemetry event
          const isDevMode = req.headers.get("x-dev-mode") === "true";
          if (isDevMode) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              mode: "dev_telemetry",
              query: displayQuery,
              inputTokens: promptTokens,
              outputTokens: completionTokens,
              reasoningTokens: reasoningTokens,
              totalTokens: totalTokens,
              cost: `$${exactCost.toFixed(6)}`,
              model: finalModel,
              requestId: openRouterRequestId
            })}\n\n`));
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();

          // Store strictly usage/telemetry metadata in Supabase (NO private prompt or AI response text)
          const fallbackReqId = openRouterRequestId || `req_${Date.now()}`;
          supabase.from("ask_gita_usage_telemetry").insert({
            request_id: fallbackReqId,
            model: finalModel,
            prompt_tokens: promptTokens,
            completion_tokens: completionTokens,
            reasoning_tokens: reasoningTokens,
            total_tokens: totalTokens,
            cost: exactCost,
            query_language: isHi ? "hi" : "en",
            retrieval_method: retrievalMethod,
            retrieved_verse_ids: retrievedVerse ? [retrievedVerse.id] : [],
            created_at: new Date().toISOString(),
          }).then(({ error }) => {
            if (error) {
              console.warn("[Ask-Gita Telemetry Insert Error]", error);
            }
          });

        } catch (streamErr) {
          controller.error(streamErr);
        }
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
      }
    });

  } catch (err: any) {
    console.error("[Ask-Gita Server Exception]", err);
    return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
