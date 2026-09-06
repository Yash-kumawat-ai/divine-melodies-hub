/**
 * PRODUCTION INGESTION PIPELINE: 701 CANONICAL BHAGAVAD GITA VERSES
 * 
 * Features:
 * - Reads all 701 canonical verses from public.gita_verses
 * - Compiles deterministic multilingual semantic documents
 * - Embeds via OpenRouter (openai/text-embedding-3-small, 1536-dim)
 * - Conservative batch size (5 verses/batch) with exponential backoff
 * - Idempotent resume (skips already-embedded verses)
 * - Restricted service_role upsert RPC
 * - Multi-lingual Top-K Semantic Retrieval Evaluation
 */

import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// --- 1. Environment & Configuration ---
const envText = fs.readFileSync('.env', 'utf-8');
function getEnv(key) {
  const m = envText.match(new RegExp(`^${key}=["']?([^"'\r\n]+)["']?`, 'm'));
  return m ? m[1].trim() : process.env[key] || '';
}

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL');
const SERVICE_ROLE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY');
const OPENROUTER_API_KEY = getEnv('OPENROUTER_API_KEY');

if (!SUPABASE_URL) {
  console.error('ERROR: VITE_SUPABASE_URL is missing in .env');
  process.exit(1);
}
if (!SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY is required to execute the admin ingestion pipeline.');
  console.error('Please provide it in .env or via: $env:SUPABASE_SERVICE_ROLE_KEY="your-key"');
  process.exit(1);
}
if (!OPENROUTER_API_KEY) {
  console.error('ERROR: OPENROUTER_API_KEY is missing in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const EMBEDDING_MODEL = 'openai/text-embedding-3-small';
const EXPECTED_DIMENSION = 1536;
const BATCH_SIZE = 5; // Conservative batch size
const BATCH_DELAY_MS = 350; // Polite pause between batches

// --- 2. Translation Priority Helpers ---
function pickPreferredTranslations(translations) {
  let hindiText = '';
  let hindiSource = '';
  let englishText = '';
  let englishSource = '';

  // Hindi Priority: raghavam_hindi_v1 -> ramsukhdas -> tejomayananda
  const raghavam = translations.find(t => t.source_id === 'raghavam_hindi_v1');
  const ramsukhdas = translations.find(t => t.source_id === 'ramsukhdas');
  const tejomayananda = translations.find(t => t.source_id === 'tejomayananda');

  if (raghavam) {
    hindiText = raghavam.translation_text;
    hindiSource = 'राघवम् मौलिक अनुवाद';
  } else if (ramsukhdas) {
    hindiText = ramsukhdas.translation_text;
    hindiSource = 'स्वामी रामसुखदास (गीताप्रेस)';
  } else if (tejomayananda) {
    hindiText = tejomayananda.translation_text;
    hindiSource = 'स्वामी तेजोमयानन्द';
  }

  // English Priority: purohitswami -> sivananda -> gambhirananda
  const purohit = translations.find(t => t.source_id === 'purohitswami');
  const sivananda = translations.find(t => t.source_id === 'sivananda');
  const gambhirananda = translations.find(t => t.source_id === 'gambhirananda');

  if (purohit) {
    englishText = purohit.translation_text;
    englishSource = 'Shri Purohit Swami (1935)';
  } else if (sivananda) {
    englishText = sivananda.translation_text;
    englishSource = 'Swami Sivananda';
  } else if (gambhirananda) {
    englishText = gambhirananda.translation_text;
    englishSource = 'Swami Gambhirananda';
  }

  return { hindiText, hindiSource, englishText, englishSource };
}

function buildDeterministicSemanticDocument(verse) {
  const { hindiText, hindiSource, englishText, englishSource } = pickPreferredTranslations(verse.gita_translations || []);

  const parts = [
    `Bhagavad Gita Chapter ${verse.chapter_number}, Verse ${verse.verse_number} (अध्याय ${verse.chapter_number}, श्लोक ${verse.verse_number})`,
    `Sanskrit: ${verse.sanskrit}`,
    `Transliteration: ${verse.transliteration || ''}`,
  ];

  if (hindiText) parts.push(`Hindi Translation (${hindiSource}): ${hindiText}`);
  if (englishText) parts.push(`English Translation (${englishSource}): ${englishText}`);

  return parts.join('\n');
}

// --- 3. OpenRouter Embeddings with Exponential Backoff ---
async function fetchEmbeddingsWithRetry(textBatch, maxRetries = 3) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://raghavam.online',
          'X-Title': 'Raghavam Gita Embeddings Ingestion'
        },
        body: JSON.stringify({
          model: EMBEDDING_MODEL,
          input: textBatch
        })
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`OpenRouter HTTP ${res.status}: ${errBody}`);
      }

      const json = await res.json();
      if (!json.data || !Array.isArray(json.data) || json.data.length !== textBatch.length) {
        throw new Error(`Malformed embedding response: expected ${textBatch.length} items, got ${json.data?.length}`);
      }

      // Assert dimensions
      for (let i = 0; i < json.data.length; i++) {
        const vec = json.data[i].embedding;
        if (!Array.isArray(vec) || vec.length !== EXPECTED_DIMENSION) {
          throw new Error(`Invalid vector dimension at index ${i}: expected ${EXPECTED_DIMENSION}, got ${vec?.length}`);
        }
      }

      return json.data.map(d => d.embedding);

    } catch (err) {
      attempt++;
      if (attempt >= maxRetries) throw err;
      const delay = Math.min(1000 * Math.pow(2, attempt), 8000) + Math.random() * 500;
      console.warn(`[Retry ${attempt}/${maxRetries}] ${err.message}. Retrying in ${Math.round(delay)}ms...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

// --- 4. Main Ingestion Pipeline ---
async function runIngestion() {
  console.log('================================================================');
  console.log('🚀 Starting 701-Verse Canonical Embedding Ingestion');
  console.log(`Model: ${EMBEDDING_MODEL} (1536-dim) | Batch Size: ${BATCH_SIZE}`);
  console.log('================================================================\n');

  // Step 1: Read all 701 canonical verses + translations from database
  console.log('📖 Fetching all 701 canonical verses from Supabase...');
  const { data: verses, error: versesErr } = await supabase
    .from('gita_verses')
    .select(`
      id, chapter_number, verse_number, verse_order, sanskrit, transliteration,
      gita_translations (
        source_id, language, translation_text
      )
    `)
    .order('verse_order', { ascending: true });

  if (versesErr || !verses) {
    console.error('Failed to fetch verses:', versesErr);
    process.exit(1);
  }

  console.log(`✅ Loaded ${verses.length} canonical verses from database.\n`);

  // Step 2: Check already-embedded verses (Idempotent Resume)
  console.log('🔍 Checking existing embeddings in public.gita_verse_embeddings...');
  const { data: existing, error: existingErr } = await supabase
    .from('gita_verse_embeddings')
    .select('verse_id')
    .eq('embedding_model', EMBEDDING_MODEL);

  if (existingErr) {
    console.error('Failed to query existing embeddings:', existingErr);
    process.exit(1);
  }

  const existingSet = new Set((existing || []).map(r => r.verse_id));
  console.log(`ℹ️ Found ${existingSet.size} already-embedded verses.`);

  const pendingVerses = verses.filter(v => !existingSet.has(v.id));
  console.log(`🎯 Pending verses to embed: ${pendingVerses.length}\n`);

  if (pendingVerses.length === 0) {
    console.log('🎉 All 701 verses are already embedded! Proceeding to verification.\n');
  } else {
    // Step 3: Process in conservative batches
    const totalBatches = Math.ceil(pendingVerses.length / BATCH_SIZE);
    let processedCount = 0;

    for (let b = 0; b < totalBatches; b++) {
      const batch = pendingVerses.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);
      const docs = batch.map(v => buildDeterministicSemanticDocument(v));

      const batchLabel = batch.map(v => `${v.chapter_number}.${v.verse_number}`).join(', ');
      process.stdout.write(`[Batch ${b + 1}/${totalBatches}] Embedding BG [${batchLabel}]... `);

      // Call OpenRouter
      const embeddings = await fetchEmbeddingsWithRetry(docs);

      // Upsert into Supabase via service_role RPC
      await Promise.all(batch.map((verse, idx) => {
        return supabase.rpc('upsert_gita_verse_embedding', {
          p_verse_id: verse.id,
          p_chapter_number: verse.chapter_number,
          p_verse_number: verse.verse_number,
          p_verse_order: verse.verse_order,
          p_embedding_model: EMBEDDING_MODEL,
          p_semantic_document: docs[idx],
          p_embedding: embeddings[idx]
        });
      }));

      processedCount += batch.length;
      console.log(`✅ Upserted (${processedCount}/${pendingVerses.length})`);

      // Polite pacing
      await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
    }
    console.log('\n🎉 All pending batches completed successfully!\n');
  }

  // Step 4: Verification Suite
  console.log('================================================================');
  console.log('🔍 Running Post-Ingestion Verification Suite');
  console.log('================================================================');

  const { count: totalEmbeddings } = await supabase
    .from('gita_verse_embeddings')
    .select('*', { count: 'exact', head: true });

  const { count: totalCanonical } = await supabase
    .from('gita_verses')
    .select('*', { count: 'exact', head: true });

  console.log(`1. Total Canonical Verses in DB:     ${totalCanonical}`);
  console.log(`2. Total Verse Embeddings in DB:     ${totalEmbeddings}`);
  console.log(`3. Difference (Missing Embeddings):  ${totalCanonical - totalEmbeddings}`);

  if (totalEmbeddings !== 701 || totalCanonical !== 701) {
    console.error('❌ Verification FAILED: Count is not exactly 701.');
    process.exit(1);
  }
  console.log('✅ Exactly 701 canonical verses and 701 embeddings verified!\n');

  // Step 5: Multi-Lingual Top-K Relevance Evaluation
  console.log('================================================================');
  console.log('🎯 Running Top-K Semantic Retrieval Relevance Evaluation');
  console.log('================================================================\n');

  const evaluationQueries = [
    {
      label: 'Hindi Karma Yoga Query',
      query: 'मुझे अपने कर्मों के फल की बहुत चिंता रहती है, मन बेचैन है',
      expectedSet: ['2.47', '2.48', '18.66'],
      description: 'Focus on duty, release anxious attachment to results'
    },
    {
      label: 'English Restless Mind Query',
      query: 'How do I control my restless and wandering mind?',
      expectedSet: ['6.26', '6.34', '6.35', '6.5'],
      description: 'Gentle patient redirection of chanchala mind'
    },
    {
      label: 'Hinglish Grief & Mortality Query',
      query: 'apno ke bichhadne ka dukh kaise sahe maut ke baad',
      expectedSet: ['2.11', '2.13', '2.20', '2.22'],
      description: 'Immortality of soul and enduring grief'
    }
  ];

  for (const t of evaluationQueries) {
    console.log(`--- [Query]: "${t.query}" (${t.label}) ---`);
    console.log(`    Expected Relevant Targets: { ${t.expectedSet.join(', ')} }`);

    // Generate query embedding via OpenRouter
    const [qEmbedding] = await fetchEmbeddingsWithRetry([t.query]);

    // Query match_gita_verses_semantic RPC (Top 5)
    const { data: matches, error: matchErr } = await supabase.rpc('match_gita_verses_semantic', {
      query_embedding: qEmbedding,
      match_threshold: 0.50,
      match_count: 5
    });

    if (matchErr || !matches) {
      console.error('    ❌ Semantic match RPC error:', matchErr);
      continue;
    }

    let foundTargetInTopK = false;
    matches.forEach((m, idx) => {
      const citation = `${m.chapter_number}.${m.verse_number}`;
      const isTarget = t.expectedSet.includes(citation);
      if (isTarget) foundTargetInTopK = true;

      const star = isTarget ? '★ TARGET MATCH' : '              ';
      console.log(`    Rank #${idx + 1} | BG ${citation.padEnd(5)} | Similarity: ${(m.similarity * 100).toFixed(2)}% | ${star}`);
    });

    if (foundTargetInTopK) {
      console.log(`    ✅ Evaluation SUCCESS: Canonical target verse retrieved in Top-5!\n`);
    } else {
      console.log(`    ⚠️ Evaluation NOTE: Target not in Top-5 (inspect similarity distribution).\n`);
    }
  }

  console.log('================================================================');
  console.log('🏁 Ingestion Pipeline & Evaluation Complete.');
  console.log('================================================================');
}

runIngestion().catch(err => {
  console.error('Fatal ingestion error:', err);
  process.exit(1);
});
