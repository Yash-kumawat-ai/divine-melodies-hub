/**
 * Generate Raghavam Original Hindi Translations for the 28 Target Verses.
 * 
 * STRICT COMPLIANCE RULES:
 * 1. Sourced ONLY from Sanskrit + Padaccheda + Word-Meanings + Narrative Context.
 * 2. Zero exposure to Ramsukhdas, Tejomayananda, or any external full translation.
 * 3. Status set strictly to "pending_review".
 * 4. approved_by and approved_at MUST be null. (NO auto-stamping approval).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// Read API key
let envContent = '';
if (fs.existsSync(path.resolve(rootDir, '.env'))) {
  envContent += fs.readFileSync(path.resolve(rootDir, '.env'), 'utf8') + '\n';
}
if (fs.existsSync(path.resolve(rootDir, '.env.local'))) {
  envContent += fs.readFileSync(path.resolve(rootDir, '.env.local'), 'utf8') + '\n';
}

const match = envContent.match(/OPENROUTER_API_KEY\s*=\s*([^\r\n]+)/);
if (!match) {
  console.error('OPENROUTER_API_KEY is required in .env');
  process.exit(1);
}
const apiKey = match[1].trim().replace(/^["']|["']$/g, '');

const contextFile = path.resolve(rootDir, 'src/data/geeta/verse_source_context_pd.json');
if (!fs.existsSync(contextFile)) {
  console.error('Source context missing! Run gatherVerseContext.mjs first.');
  process.exit(1);
}

const verseContexts = JSON.parse(fs.readFileSync(contextFile, 'utf8'));

const draftsFile = path.resolve(rootDir, 'src/data/geeta/raghavam_hindi_drafts_v1.json');
let existingDrafts = [];
if (fs.existsSync(draftsFile)) {
  try {
    existingDrafts = JSON.parse(fs.readFileSync(draftsFile, 'utf8'));
  } catch (e) {
    existingDrafts = [];
  }
}

const draftMap = new Map();
existingDrafts.forEach(d => {
  draftMap.set(`${d.chapter}.${d.verse}`, d);
});

const SYSTEM_PROMPT = `You are producing an ORIGINAL Hindi translation of a Bhagavad Gita verse for a commercial product. This must NOT be adapted, paraphrased, or influenced by any existing published Hindi translation (e.g., Gita Press/Ramsukhdas, Chinmaya Mission/Tejomayananda, or any other). You have not been shown any such translation and must not reconstruct one from memory. Work only from the Sanskrit and word-meanings provided below.

Glossary conventions to maintain consistency:
- कर्म (karma) -> कर्तव्य-कर्म / कार्य
- फल (phala) -> परिणाम / फल
- आसक्ति (sanga/asakti) -> अत्यधिक लगाव / मोह
- स्वधर्म (svadharma) -> अपना स्वाभाविक कर्तव्य
- समत्व (samatvam) -> समभाव / मानसिक संतुलन

Produce:
1. hindi_translation — a single clear, modern, simple Hindi (सरल आधुनिक हिन्दी) sentence/passage conveying the verse's literal meaning. Avoid unnecessary Sanskritized phrasing. Preserve philosophical precision.
2. hindi_explanation — 2–4 sentences of original explanatory context in Hindi, again independently composed, not modeled on any known commentary's structure or phrasing.

Return only valid JSON in this exact structure:
{
  "chapter": {chapter},
  "verse": {verse},
  "hindi_translation": "...",
  "hindi_explanation": "...",
  "translator_note": "Original composition from Sanskrit + word-meanings only"
}`;

async function callOpenRouter(verseData, attempt = 1) {
  const wordList = verseData.word_meanings
    .map(w => `- ${w.word}: ${w.meaning}`)
    .join('\n');

  const userPrompt = `Chapter: ${verseData.chapter}
Verse: ${verseData.verse}
Sanskrit:
${verseData.sanskrit}

Padaccheda:
${verseData.padaccheda}

Word-by-word meaning:
${wordList}

Narrative context:
${verseData.narrative_context}`;

  try {
    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://raghavam.com',
        'X-Title': 'Raghavam Translation Generator'
      },
      body: JSON.stringify({
        model: 'qwen/qwen-2.5-72b-instruct',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2
      })
    });

    if (!resp.ok) {
      const errTxt = await resp.text();
      throw new Error(`HTTP ${resp.status}: ${errTxt}`);
    }

    const data = await resp.json();
    const rawContent = data.choices?.[0]?.message?.content || '';

    // Extract JSON block
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`Failed to parse JSON from model output: ${rawContent}`);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      chapter: verseData.chapter,
      verse: verseData.verse,
      sanskrit: verseData.sanskrit,
      transliteration: verseData.transliteration,
      padaccheda: verseData.padaccheda,
      word_meanings: verseData.word_meanings,
      hindi_translation: parsed.hindi_translation?.trim() || '',
      hindi_explanation: parsed.hindi_explanation?.trim() || '',
      translation_source: 'raghavam_hindi_v1',
      translation_status: 'pending_review',
      approved_by: null,
      approved_at: null,
      generated_at: new Date().toISOString()
    };
  } catch (err) {
    if (attempt <= 3) {
      console.warn(`Attempt ${attempt} failed for ${verseData.chapter}.${verseData.verse}, retrying in 3s... (${err.message})`);
      await new Promise(r => setTimeout(r, 3000));
      return callOpenRouter(verseData, attempt + 1);
    }
    throw err;
  }
}

async function runBatch() {
  console.log(`Starting generation for ${verseContexts.length} target verses...`);
  const finalDrafts = [];

  for (let i = 0; i < verseContexts.length; i++) {
    const vc = verseContexts[i];
    const key = `${vc.chapter}.${vc.verse}`;

    if (draftMap.has(key) && draftMap.get(key).hindi_translation) {
      console.log(`[${i + 1}/${verseContexts.length}] Verse ${key} already has draft, using existing.`);
      finalDrafts.push(draftMap.get(key));
      continue;
    }

    console.log(`[${i + 1}/${verseContexts.length}] Generating draft for Chapter ${vc.chapter}, Verse ${vc.verse}...`);
    const draft = await callOpenRouter(vc);
    finalDrafts.push(draft);
    draftMap.set(key, draft);

    // Save incrementally
    fs.writeFileSync(draftsFile, JSON.stringify(finalDrafts, null, 2), 'utf8');

    // Polite delay between requests
    await new Promise(r => setTimeout(r, 1200));
  }

  console.log(`\nSUCCESS: Generated all ${finalDrafts.length} drafts.`);
  console.log(`Drafts saved at: ${draftsFile}`);
  console.log('STATUS: All drafts set to "pending_review". approved_by: null.');
}

runBatch().catch(err => {
  console.error('Fatal generation error:', err);
  process.exit(1);
});
