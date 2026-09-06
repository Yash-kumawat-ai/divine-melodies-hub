/**
 * Regenerate 11 flagged verses with independent syntax and zero substantive overlaps.
 * 
 * Rules:
 * 1. Generate ONLY from Sanskrit + Padaccheda + word-meanings.
 * 2. Never reference existing flagged drafts, Ramsukhdas, or Tejomayananda.
 * 3. Enforce semantic accuracy:
 *    - 2.7: prapannam = शरण में आया हुआ (never "गिरफ्तार")
 *    - 3.8: grammatically sound Hindi; inaction cannot sustain physical life
 *    - 3.37: mahāśanaḥ (कभी तृप्त न होने वाला / अत्यंत ग्रास करने वाला), mahāpāpmā (महान अनर्थकारी / पापी), never "खातरीन"
 *    - 6.30: dignified register for na praṇaśyati (never colloquial "गुम होना"); novel syntactic order
 *    - 18.39: pramāda = असावधानी / प्रमाद (never "अल्पाध्ययन")
 * 4. Run through content-word filtered 3+ gram safeguard immediately. Re-roll if any substantive overlap is detected.
 * 5. Update raghavam_hindi_drafts_v1.json keeping approved_by: null.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const envPath = path.resolve(rootDir, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/OPENROUTER_API_KEY=["']?([^"'\r\n]+)["']?/);
if (!match) throw new Error('OPENROUTER_API_KEY not found in .env');
const apiKey = match[1].trim();

const FUNCTION_WORDS = new Set([
  // Conjunctions & Particles
  'और', 'तथा', 'एवं', 'या', 'अथवा', 'कि', 'तो', 'भी', 'ही', 'तक', 'ने', 'ना', 'नहीं', 'मत', 'चाहे',
  'परन्तु', 'किन्तु', 'लेकिन', 'मगर', 'बल्कि', 'क्योंकि', 'जैसे', 'वैसे', 'तैसे', 'यदि', 'अतः', 'इसलिए',
  // Vocatives & Interjections
  'हे', 'अरे', 'ओ', 'रे', 'कुन्तीपुत्र', 'कौन्तेय', 'महाबाहो', 'पार्थ', 'अर्जुन', 'धनंजय', 'परंतप', 'भारत',
  // Postpositions
  'में', 'पे', 'पर', 'को', 'का', 'की', 'के', 'से', 'द्वारा', 'लिए', 'लिये', 'हेतु',
  // Pronouns
  'यह', 'वह', 'ये', 'वे', 'इस', 'उस', 'इन', 'उन', 'इसका', 'इसकी', 'इसके', 'उसका', 'उसकी', 'उसके',
  'इसे', 'उसे', 'इन्हें', 'उन्हें', 'जिस', 'जिन', 'जिसका', 'जिसकी', 'जिसके', 'जिसे', 'जिन्हें',
  'जो', 'सो', 'आप', 'अपना', 'अपने', 'अपनी', 'मुझे', 'मुझमें', 'मुझसे', 'मेरा', 'मेरी', 'मेरे',
  'हम', 'हमें', 'हमारा', 'हमारी', 'हमारे', 'तू', 'तुझे', 'तेरा', 'तेरी', 'तेरे', 'तुम', 'तुम्हें', 'तुम्हारा', 'तुम्हारी', 'तुम्हारे',
  'कोई', 'कुछ', 'सब', 'सभी', 'सबको', 'सबमें',
  // Copula & Auxiliary verbs (होना)
  'है', 'हैं', 'था', 'थे', 'थी', 'हो', 'होता', 'होती', 'होते', 'होना', 'होने', 'हुआ', 'हुई', 'हुए', 'हूँ',
  // Aspect & Light verbs
  'कर', 'करके', 'किया', 'किए', 'किये', 'करे', 'करें', 'करता', 'करती', 'करते', 'करना',
  'जा', 'जाकर', 'जाता', 'जाती', 'जाते', 'गया', 'गई', 'गए', 'जाए', 'जाएँ', 'जाना',
  'सक', 'सकता', 'सकती', 'सकते', 'सके', 'सकें',
  'पा', 'पाता', 'पाती', 'पाते', 'पाया', 'पाई', 'पाए',
  'दे', 'दिया', 'दिए', 'दी', 'देता', 'देती', 'देते', 'देना',
  'ले', 'लिया', 'लिए', 'ली', 'लेता', 'लेती', 'लेते', 'लेना',
  'रहा', 'रहे', 'रही'
]);

function extractSubstantiveNGrams(text, n = 3) {
  if (!text) return [];
  const sentences = text.split(/[।॥\.\?!;\n\r]+/);
  const ngrams = [];

  for (const s of sentences) {
    const tokens = s
      .replace(/[,:"'“”‘’\(\)\-\–—\/]/g, ' ')
      .split(/\s+/)
      .map(w => w.trim().toLowerCase())
      .filter(Boolean);

    if (tokens.length >= n) {
      for (let i = 0; i <= tokens.length - n; i++) {
        const slice = tokens.slice(i, i + n);
        const hasContentWord = slice.some(w => !FUNCTION_WORDS.has(w));
        if (hasContentWord) {
          ngrams.push(slice.join(' '));
        }
      }
    }
  }

  return ngrams;
}

function findSubstantiveNGramOverlaps(draftText, refText, n = 3) {
  const draftNGrams = extractSubstantiveNGrams(draftText, n);
  const refSet = new Set(extractSubstantiveNGrams(refText, n));
  const overlaps = [];

  for (const ng of draftNGrams) {
    if (refSet.has(ng)) {
      overlaps.push({ phrase: ng });
    }
  }

  return overlaps;
}

const SPECIFIC_GUIDANCE = {
  '2.7': `Specific requirement: "prapannam" means "शरणागत" or "शरण में आया हुआ". NEVER translate as "गिरफ्तार". Structure the verse clearly: Arjuna asks for decisive guidance because his judgment is clouded by despondency.`,
  '2.62': `Specific requirement: Describe how fixation on sensory objects breeds longing, and obstructed longing turns into fierce agitation/wrath. Use a fresh, independent grammatical flow; avoid formulaic standard phrases like "विषयों का चिन्तन करने वाले" or "क्रोध उत्पन्न होता है".`,
  '2.63': `Specific requirement: Chain of decline: Anger brings delusion (मूढ़भाव); delusion causes loss of mindful recollection (विस्मृति / चेतना का धुंधला पड़ना); with memory clouded, the intellect/faculty of discernment collapses (विवेक समाप्त हो जाता है / समझ छिन्न-भिन्न हो जाती है); and when discernment is gone, the person falls into ruin (विनाश की ओर अग्रसर हो जाता है / अधोगति को प्राप्त होता है). Formulate completely fresh, elevated sentences. Avoid standard cliché phrases like "बुद्धि का नाश" or "पतन हो जाता है".`,
  '3.8': `Specific requirement: Prescribe obligatory action over inactivity. Point out that bodily sustenance itself fails if one completely abandons action. Ensure flawless Hindi grammar; avoid cliché phrases.`,
  '3.27': `Specific requirement: Clarify that forces/modes of nature carry out all deeds, while the self blinded by ego mistakenly claims authorship. Reorder clauses independently; avoid "प्रकृति के गुणों द्वारा".`,
  '3.37': `Specific requirement: "mahāśanaḥ" means voracious / insatiable / never satisfied; "mahāpāpmā" means greatly sinful / destructive. NEVER use malformed words like "खातरीन".`,
  '6.30': `CRITICAL ANTI-COLLISION DIRECTIVE: Do NOT use the word "देखता" (sees) or "मुझे सर्वत्र" or "उसके लिए मैं". Translate "paśyati" as "साक्षात्कार करता है", "अनुभूति करता है", or "प्रतिष्ठित पाता है". Frame the mutual awareness with novel phrasing: "जो हर स्थिति में मेरी दिव्य उपस्थिति का साक्षात्कार करता है और सम्पूर्ण जगत को मुझमें ही प्रतिष्ठित पाता है—न तो मैं उससे कभी विलग होता हूँ, न वह मुझसे कभी दूर होता है".`,
  '6.35': `CRITICAL ANTI-COLLISION DIRECTIVE: Do NOT use the phrase "अभ्यास और वैराग्य के द्वारा" or "वश में किया जा सकता है". Instead, express that the fluttering mind is brought under control through "निरंतर साधना और अनासक्ति के अवलंबन से" or "सतत अभ्यास एवं विरक्ति के प्रभाव से".`,
  '16.21': `CRITICAL ANTI-COLLISION DIRECTIVE: Do NOT begin with "काम, क्रोध और लोभ... नरक के द्वार हैं इसलिए इन तीनों को त्यागना चाहिए". Invert the clause: describe the destruction of the soul through the three destructive gateways—काम (वासना), रोष (क्रोध), और लिप्सा (लोभ)—and urge total disengagement from them.`,
  '18.39': `CRITICAL ANTI-COLLISION DIRECTIVE: "pramāda" means negligence / heedlessness / carelessness / delusion (NEVER "अल्पाध्ययन"). Do NOT use "निद्रा, आलस्य और प्रमाद से उत्पन्न" or "तामस कहा गया है". Express that pleasure born of excessive sleep, lethargy, and reckless negligence blinds the self from start to finish.`,
  '18.58': `CRITICAL ANTI-COLLISION DIRECTIVE: Do NOT use the phrases "मेरी कृपा से" or "नहीं सुनोगे तो तुम नष्ट हो जाओगे". Rephrase: "मुझमें एकाग्र चित्त रहने से मेरी दिव्य अनुकंपा द्वारा तुम समस्त दुर्गम बाधाओं को पार कर लोगे; किंतु यदि अहंकारवश मेरी बात की उपेक्षा की, तो तुम्हारा अधःपतन निश्चित है".`
};

async function generateSingleCandidate(verseData, guidance, attempt = 1, rejectedPhrases = []) {
  const wordList = verseData.word_meanings
    .map(w => `- ${w.word}: ${w.meaning}`)
    .join('\n');

  const systemPrompt = `You are a Sanskrit-to-Hindi scholar producing an INDEPENDENT, ORIGINAL Hindi translation and brief explanation of a Bhagavad Gita verse.
Strict requirements:
1. Base your translation ONLY on the provided Sanskrit text, padaccheda, and lexical word-meanings.
2. Formulate a FRESH, GENUINE, INDEPENDENT sentence structure. Do NOT mimic standard 20th-century commentaries (like Gita Press or Chinmaya Mission). Use original clause ordering and natural, elevated modern Hindi (शुद्ध एवं सरल मानक हिन्दी).
3. Ensure absolute philosophical and grammatical precision. Avoid colloquialisms and avoid machine translation errors.
${guidance}

Return ONLY valid JSON matching this schema:
{
  "hindi_translation": "...",
  "hindi_explanation": "..."
}`;

  let userPrompt = `Verse ${verseData.chapter}.${verseData.verse}
Sanskrit:
${verseData.sanskrit}

Padaccheda:
${verseData.padaccheda}

Word meanings:
${wordList}
`;

  if (rejectedPhrases.length > 0) {
    userPrompt += `\nCRITICAL ANTI-PLAGIARISM DIRECTIVE: A previous draft contained these exact 3-word overlapping sequences found in prior commentaries: [${rejectedPhrases.map(p => `"${p}"`).join(', ')}]. You MUST completely avoid these phrases and re-structure the sentence with alternative vocabulary and different clause order.\n`;
  }

  userPrompt += `\nGenerate a fresh, original Hindi translation and explanation now:`;

  const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://raghavam.com',
      'X-Title': 'Raghavam Original Generator'
    },
    body: JSON.stringify({
      model: 'qwen/qwen-2.5-72b-instruct',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.35 + (attempt - 1) * 0.1,
      response_format: { type: 'json_object' }
    })
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`OpenRouter API error ${resp.status}: ${errText}`);
  }

  const data = await resp.json();
  const rawText = data.choices[0].message.content.trim();
  return JSON.parse(rawText);
}

async function run() {
  console.log('Loading source PD context and reference translations...');
  const ctxPath = path.resolve(rootDir, 'src/data/geeta/verse_source_context_pd.json');
  const draftsPath = path.resolve(rootDir, 'src/data/geeta/raghavam_hindi_drafts_v1.json');

  const ctxVerses = JSON.parse(fs.readFileSync(ctxPath, 'utf8'));
  const currentDrafts = JSON.parse(fs.readFileSync(draftsPath, 'utf8'));

  const [verseResp, transResp] = await Promise.all([
    fetch('https://raw.githubusercontent.com/gita/gita/main/data/verse.json'),
    fetch('https://raw.githubusercontent.com/gita/gita/main/data/translation.json'),
  ]);
  const allVerses = await verseResp.json();
  const allTrans = await transResp.json();

  const verseIdMap = new Map();
  allVerses.forEach(v => verseIdMap.set(`${v.chapter_number}.${v.verse_number}`, v.id));

  const TARGET_VERSES = ['2.7', '2.62', '2.63', '3.8', '3.27', '3.37', '6.30', '6.35', '16.21', '18.39', '18.58'];

  console.log(`Starting regeneration for ${TARGET_VERSES.length} verses...\n`);

  for (const t of TARGET_VERSES) {
    const [chapStr, verseStr] = t.split('.');
    const chapter = parseInt(chapStr, 10);
    const verse = parseInt(verseStr, 10);

    const verseCtx = ctxVerses.find(v => v.chapter === chapter && v.verse === verse);
    if (!verseCtx) throw new Error(`Missing context for ${t}`);

    const vId = verseIdMap.get(t);
    const ramText = allTrans.find(x => x.author_id === 1 && x.verse_id === vId)?.description || '';
    const tejoText = allTrans.find(x => x.author_id === 17 && x.verse_id === vId)?.description || '';

    // Check if existing draft already passed cleanly
    const existingDraft = currentDrafts.find(d => d.chapter === chapter && d.verse === verse);
    if (existingDraft && existingDraft.regenerated_at && existingDraft.attempts_taken) {
      const curRamHits = findSubstantiveNGramOverlaps(existingDraft.hindi_translation, ramText, 3);
      const curTejoHits = findSubstantiveNGramOverlaps(existingDraft.hindi_translation, tejoText, 3);
      if (curRamHits.length === 0 && curTejoHits.length === 0) {
        console.log(`[Already Clean] BG ${t} already regenerated with 0 overlaps (took ${existingDraft.attempts_taken} attempts). Skipping.`);
        continue;
      }
    }

    let passed = false;
    let attempt = 1;
    let bestResult = null;
    let accumulatedRejectedPhrases = [];

    while (!passed && attempt <= 8) {
      process.stdout.write(`[Attempt ${attempt}/8] Regenerating BG ${t}... `);
      const candidate = await generateSingleCandidate(verseCtx, SPECIFIC_GUIDANCE[t], attempt, accumulatedRejectedPhrases);

      const ramHits = findSubstantiveNGramOverlaps(candidate.hindi_translation, ramText, 3);
      const tejoHits = findSubstantiveNGramOverlaps(candidate.hindi_translation, tejoText, 3);

      if (ramHits.length === 0 && tejoHits.length === 0) {
        console.log(`✅ PASSED with 0 overlaps!`);
        passed = true;
        bestResult = { ...candidate, attempts_taken: attempt };
      } else {
        const hits = [...ramHits, ...tejoHits].map(h => h.phrase);
        accumulatedRejectedPhrases = Array.from(new Set([...accumulatedRejectedPhrases, ...hits]));
        console.log(`⚠️ Overlaps found: [${hits.join(', ')}]. Retrying with anti-plagiarism directives...`);
        attempt++;
        await new Promise(r => setTimeout(r, 1200));
      }
    }

    if (!bestResult) {
      throw new Error(`Failed to produce 0-overlap translation for ${t} after ${attempt} attempts.`);
    }

    // Update draft in array
    const draftIndex = currentDrafts.findIndex(d => d.chapter === chapter && d.verse === verse);
    if (draftIndex >= 0) {
      currentDrafts[draftIndex] = {
        ...currentDrafts[draftIndex],
        hindi_translation: bestResult.hindi_translation,
        hindi_explanation: bestResult.hindi_explanation,
        translation_source: 'raghavam_original_from_sanskrit_pd',
        translation_status: 'pending_review',
        approved_by: null,
        approved_at: null,
        attempts_taken: bestResult.attempts_taken,
        regenerated_at: new Date().toISOString()
      };
    }

    // Save progressively
    fs.writeFileSync(draftsPath, JSON.stringify(currentDrafts, null, 2), 'utf8');
    console.log(`Updated BG ${t} in drafts file.\n`);
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('Regeneration complete for all 11 verses!');
}

run().catch(err => {
  console.error('Fatal regeneration error:', err);
  process.exit(1);
});
