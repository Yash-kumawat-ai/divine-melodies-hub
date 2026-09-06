/**
 * Extract Shri Purohit Swami (1935) English translations verbatim from data source.
 * Rule: Zero AI generation. If any verse is missing, record the gap explicitly.
 * Never substitute Sivananda or any other source without explicit user approval.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const TARGET_VERSES = [
  // Chapter 2 (10 verses)
  { chapter: 2, verse: 3 },
  { chapter: 2, verse: 7 },
  { chapter: 2, verse: 13 },
  { chapter: 2, verse: 20 },
  { chapter: 2, verse: 22 },
  { chapter: 2, verse: 23 },
  { chapter: 2, verse: 47 },
  { chapter: 2, verse: 48 },
  { chapter: 2, verse: 62 },
  { chapter: 2, verse: 63 },
  // Chapter 3 (4 verses)
  { chapter: 3, verse: 8 },
  { chapter: 3, verse: 27 },
  { chapter: 3, verse: 35 },
  { chapter: 3, verse: 37 },
  // Chapter 6 (6 verses)
  { chapter: 6, verse: 5 },
  { chapter: 6, verse: 26 },
  { chapter: 6, verse: 30 },
  { chapter: 6, verse: 32 },
  { chapter: 6, verse: 34 },
  { chapter: 6, verse: 35 },
  // Chapter 9 (1 verse)
  { chapter: 9, verse: 29 },
  // Chapter 11 (1 verse)
  { chapter: 11, verse: 33 },
  // Chapter 12 (1 verse)
  { chapter: 12, verse: 13 },
  // Chapter 16 (1 verse)
  { chapter: 16, verse: 21 },
  // Chapter 18 (4 verses)
  { chapter: 18, verse: 39 },
  { chapter: 18, verse: 47 },
  { chapter: 18, verse: 58 },
  { chapter: 18, verse: 66 },
];

const PUROHIT_SWAMI_AUTHOR_ID = 21;

async function extractPurohitSwami() {
  console.log('Fetching raw Gita data to extract Shri Purohit Swami (1935) translations...');
  const [versesResp, transResp] = await Promise.all([
    fetch('https://raw.githubusercontent.com/gita/gita/main/data/verse.json'),
    fetch('https://raw.githubusercontent.com/gita/gita/main/data/translation.json'),
  ]);

  if (!versesResp.ok || !transResp.ok) {
    throw new Error('Failed to fetch Gita verse or translation records from data source.');
  }

  const verses = await versesResp.json();
  const translations = await transResp.json();

  const verseMap = new Map();
  verses.forEach((v) => {
    verseMap.set(`${v.chapter_number}.${v.verse_number}`, v.id);
  });

  const purohitTranslations = translations.filter(
    (t) => t.author_id === PUROHIT_SWAMI_AUTHOR_ID
  );

  console.log(`Loaded ${purohitTranslations.length} total Purohit Swami translations from dataset.`);

  const results = [];
  const missingGaps = [];

  for (const { chapter, verse } of TARGET_VERSES) {
    const key = `${chapter}.${verse}`;
    const verseId = verseMap.get(key);

    if (!verseId) {
      console.error(`Verse ID mapping not found for ${key}`);
      missingGaps.push({ chapter, verse, reason: 'Verse ID missing in catalog' });
      continue;
    }

    const match = purohitTranslations.find((t) => t.verse_id === verseId);

    if (!match || !match.description || !match.description.trim()) {
      console.warn(`GAP DETECTED: Missing Purohit Swami translation for ${key}`);
      missingGaps.push({ chapter, verse, reason: 'Translation description missing or empty' });
      results.push({
        chapter,
        verse,
        verse_id: verseId,
        english_translation: null,
        status: 'GAP_MISSING',
        source: 'Shri Purohit Swami (1935)',
        attribution: 'English translation • Shri Purohit Swami (1935, Public Domain)',
      });
    } else {
      results.push({
        chapter,
        verse,
        verse_id: verseId,
        english_translation: match.description.trim(),
        status: 'VERBATIM_EXTRACTED',
        source: 'Shri Purohit Swami (1935)',
        attribution: 'English translation • Shri Purohit Swami (1935, Public Domain)',
      });
    }
  }

  const outputDir = path.resolve(rootDir, 'src/data/geeta');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.resolve(outputDir, 'purohit_swami_english_v1.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        source: 'Shri Purohit Swami (1935, Faber & Faber)',
        license: 'Public Domain (>60 years post-mortem, d. 1941)',
        extracted_at: new Date().toISOString(),
        total_requested: TARGET_VERSES.length,
        total_extracted: results.filter((r) => r.status === 'VERBATIM_EXTRACTED').length,
        gaps_count: missingGaps.length,
        gaps: missingGaps,
        verses: results,
      },
      null,
      2
    ),
    'utf8'
  );

  console.log(`Saved verbatim Purohit Swami English translations to: ${outputPath}`);
  console.log(`Extracted: ${results.filter((r) => r.status === 'VERBATIM_EXTRACTED').length} / ${TARGET_VERSES.length}`);
  if (missingGaps.length > 0) {
    console.warn(`Identified ${missingGaps.length} gaps. Gaps recorded explicitly in report.`);
  } else {
    console.log('Zero gaps detected! All 28 verses extracted 100% verbatim.');
  }

  return { results, missingGaps };
}

extractPurohitSwami().catch((err) => {
  console.error('Extraction error:', err);
  process.exit(1);
});
