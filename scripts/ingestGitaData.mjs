/**
 * Geeta Gyan — Phase 1 Deterministic Ingestion & Validation Script
 * 
 * Source: https://github.com/gita/gita
 * - 18 chapters
 * - 701 verses
 * - 4 curated authors (2 Hindi, 2 English) = 2,804 translations
 * 
 * Usage:
 *   node scripts/ingestGitaData.mjs --validate
 *   node scripts/ingestGitaData.mjs --generate-sql
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const BASE_RAW_URL = 'https://raw.githubusercontent.com/gita/gita/main/data';

// Deterministic UUID v5 generator for verses & translations
const GITA_NAMESPACE = 'e69c1186-0683-4a11-8e8a-0c2fa21db9a1';

export function generateDeterministicUUID(chapter, verse) {
  const input = `${GITA_NAMESPACE}:verse:${chapter}:${verse}`;
  const hash = crypto.createHash('sha1').update(input).digest();
  hash[6] = (hash[6] & 0x0f) | 0x50; // Version 5
  hash[8] = (hash[8] & 0x3f) | 0x80; // RFC 4122
  const hex = hash.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export function generateDeterministicTranslationUUID(verseId, sourceId) {
  const input = `${GITA_NAMESPACE}:trans:${verseId}:${sourceId}`;
  const hash = crypto.createHash('sha1').update(input).digest();
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  const hex = hash.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

// 4 Selected Sources for MVP
export const SELECTED_SOURCES = [
  {
    id: 'ramsukhdas',
    author_id: 1,
    name: 'Sadhaka Sanjivani (Hindi)',
    author: 'Swami Ramsukhdas',
    language: 'hindi',
    tradition: 'Gita Press Tradition',
    role: 'primary',
    license: 'Public Domain / Educational Distribution (Gita Press tradition)',
    attribution: 'Translation by Swami Ramsukhdas (Gita Press)',
  },
  {
    id: 'tejomayananda',
    author_id: 17,
    name: 'Chinmaya Gita (Hindi)',
    author: 'Swami Tejomayananda',
    language: 'hindi',
    tradition: 'Chinmaya Mission',
    role: 'secondary',
    license: 'Dedicated under The Unlicense via VedVyas Foundation compilation',
    attribution: 'Translation by Swami Tejomayananda (Chinmaya Mission)',
  },
  {
    id: 'sivananda',
    author_id: 16,
    name: 'The Bhagavad Gita (English)',
    author: 'Swami Sivananda',
    language: 'english',
    tradition: 'Divine Life Society',
    role: 'primary',
    license: 'Public Domain / Free Spiritual Distribution (Divine Life Society, d. 1963)',
    attribution: 'Translation by Swami Sivananda (The Divine Life Society)',
  },
  {
    id: 'gambhirananda',
    author_id: 19,
    name: 'Bhagavad Gita with Commentary (English)',
    author: 'Swami Gambhirananda',
    language: 'english',
    tradition: 'Ramakrishna Math / Advaita Ashrama',
    role: 'secondary',
    license: 'Advaita Ashrama tradition (d. 1988), dedicated under The Unlicense via VedVyas Foundation compilation',
    attribution: 'Translation by Swami Gambhirananda (Advaita Ashrama / Ramakrishna Math)',
  },
];

export function parseWordMeanings(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const cleaned = raw.trim().replace(/\n+/g, ' ');
  const parts = cleaned.split(';').map(p => p.trim()).filter(Boolean);
  const result = [];
  
  for (const part of parts) {
    const match = part.match(/^(.+?)(?:—|--|-)\s*(.+)$/);
    if (match) {
      result.push({
        word: match[1].trim(),
        meaning: match[2].trim(),
      });
    } else {
      result.push({
        word: part,
        meaning: '',
      });
    }
  }
  return result.length > 0 ? result : null;
}

export function cleanRamsukhdasDescription(text) {
  if (!text) return '';
  return text
    .replace(/\s*\([टिप्पणी\sप०\d\.\-\s]+\)/gu, '')
    .replace(/\s*\(टिप्पणी[^)]*\)/gu, '')
    .trim();
}

export async function fetchRawData() {
  console.log('Fetching source datasets from gita/gita repository...');
  const [chapters, verses, translations] = await Promise.all([
    fetch(`${BASE_RAW_URL}/chapters.json`).then(r => r.json()),
    fetch(`${BASE_RAW_URL}/verse.json`).then(r => r.json()),
    fetch(`${BASE_RAW_URL}/translation.json`).then(r => r.json()),
  ]);

  return { chapters, verses, translations };
}

export function validateDataset({ chapters, verses, translations }) {
  console.log('\n==================================================');
  console.log('       GEETA GYAN PHASE 1 DATA VALIDATION');
  console.log('==================================================\n');

  const report = {
    chaptersCount: chapters.length,
    versesCount: verses.length,
    translationsTotal: translations.length,
    selectedTranslationsCount: 0,
    errors: [],
    authorStats: {},
  };

  // 1. Validate Chapters (Exactly 18)
  if (chapters.length !== 18) {
    report.errors.push(`Expected 18 chapters, found ${chapters.length}`);
  }
  for (let i = 1; i <= 18; i++) {
    const ch = chapters.find(c => c.chapter_number === i);
    if (!ch) report.errors.push(`Missing chapter ${i}`);
    if (!ch.name) report.errors.push(`Missing Sanskrit name in chapter ${i}`);
    if (!ch.summary_hindi && !ch.chapter_summary_hindi) report.errors.push(`Missing Hindi summary in chapter ${i}`);
    if (!ch.summary_english && !ch.chapter_summary) report.errors.push(`Missing English summary in chapter ${i}`);
  }

  // 2. Validate Verses (Exactly 701)
  if (verses.length !== 701) {
    report.errors.push(`Expected 701 verses, found ${verses.length}`);
  }

  const verseSet = new Set();
  const verseIdMap = new Map();

  verses.forEach(v => {
    const key = `${v.chapter_number}.${v.verse_number}`;
    if (verseSet.has(key)) {
      report.errors.push(`Duplicate verse detected: Chapter ${v.chapter_number} Verse ${v.verse_number}`);
    }
    verseSet.add(key);
    verseIdMap.set(v.id, v);

    if (!v.text || !v.text.trim()) {
      report.errors.push(`Empty Sanskrit text in verse ${key}`);
    }
    if (!v.transliteration || !v.transliteration.trim()) {
      report.errors.push(`Empty transliteration in verse ${key}`);
    }
    if (!v.word_meanings || !v.word_meanings.trim()) {
      report.errors.push(`Empty word_meanings in verse ${key}`);
    }
  });

  // Verify Chapter 13 has exactly 35 verses
  const ch13Verses = verses.filter(v => v.chapter_number === 13);
  if (ch13Verses.length !== 35) {
    report.errors.push(`Expected Chapter 13 to have 35 verses, found ${ch13Verses.length}`);
  }

  // 3. Validate Translations for the 4 Selected Sources
  const selectedAuthorIds = new Set(SELECTED_SOURCES.map(s => s.author_id));
  const selectedTranslations = translations.filter(t => selectedAuthorIds.has(t.author_id));
  report.selectedTranslationsCount = selectedTranslations.length;

  if (selectedTranslations.length !== 2804) {
    report.errors.push(`Expected exactly 2804 selected translations, found ${selectedTranslations.length}`);
  }

  SELECTED_SOURCES.forEach(src => {
    const authorTrans = selectedTranslations.filter(t => t.author_id === src.author_id);
    const uniqueVerseIds = new Set(authorTrans.map(t => t.verse_id));
    const emptyDescriptions = authorTrans.filter(t => !t.description || !t.description.trim());
    const invalidVerseRefs = authorTrans.filter(t => !verseIdMap.has(t.verse_id));
    const langMismatches = authorTrans.filter(t => t.lang !== src.language);

    report.authorStats[src.author] = {
      author_id: src.author_id,
      language: src.language,
      role: src.role,
      count: authorTrans.length,
      uniqueVerses: uniqueVerseIds.size,
      emptyDescriptions: emptyDescriptions.length,
      invalidVerseRefs: invalidVerseRefs.length,
      langMismatches: langMismatches.length,
      valid: authorTrans.length === 701 && uniqueVerseIds.size === 701 && emptyDescriptions.length === 0,
    };

    if (authorTrans.length !== 701) {
      report.errors.push(`Author ${src.author} has ${authorTrans.length} verses (expected 701)`);
    }
    if (uniqueVerseIds.size !== 701) {
      report.errors.push(`Author ${src.author} has duplicate verse_ids`);
    }
    if (emptyDescriptions.length > 0) {
      report.errors.push(`Author ${src.author} has ${emptyDescriptions.length} empty descriptions`);
    }
    if (langMismatches.length > 0) {
      report.errors.push(`Author ${src.author} has language mismatches`);
    }
  });

  return report;
}

export function generateSeedSQL({ chapters, verses, translations }) {
  console.log('\nGenerating idempotent seed SQL file...');
  const sqlLines = [];

  sqlLines.push('-- ==============================================================================');
  sqlLines.push('-- Migration 052: Seed Geeta Gyan Core Data (Chapters, Verses, Sources, Translations)');
  sqlLines.push('-- Source: https://github.com/gita/gita (701 Verses, 4 Curated Authors)');
  sqlLines.push('-- Generated: ' + new Date().toISOString());
  sqlLines.push('-- ==============================================================================\n');

  // 1. Seed Sources
  sqlLines.push('-- 1. Seed gita_sources (4 Approved Translators)');
  sqlLines.push('INSERT INTO public.gita_sources (id, author_id, name, author, language, tradition, role, license, attribution) VALUES');
  const sourceRows = SELECTED_SOURCES.map(s => {
    return `(${escapeSQL(s.id)}, ${s.author_id}, ${escapeSQL(s.name)}, ${escapeSQL(s.author)}, ${escapeSQL(s.language)}, ${escapeSQL(s.tradition)}, ${escapeSQL(s.role)}, ${escapeSQL(s.license)}, ${escapeSQL(s.attribution)})`;
  });
  sqlLines.push(sourceRows.join(',\n') + '\nON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attribution = EXCLUDED.attribution, license = EXCLUDED.license;\n');

  // 2. Seed Chapters
  sqlLines.push('-- 2. Seed gita_chapters (18 Chapters)');
  sqlLines.push('INSERT INTO public.gita_chapters (chapter_number, name_sanskrit, name_transliterated, name_translation, name_meaning, verses_count, summary_hindi, summary_english, image_name) VALUES');
  const chapterRows = chapters.map(c => {
    const sHindi = c.chapter_summary_hindi || c.summary_hindi || '';
    const sEnglish = c.chapter_summary || c.summary_english || '';
    return `(${c.chapter_number}, ${escapeSQL(c.name)}, ${escapeSQL(c.name_transliterated)}, ${escapeSQL(c.name_translation)}, ${escapeSQL(c.name_meaning)}, ${c.verses_count}, ${escapeSQL(sHindi)}, ${escapeSQL(sEnglish)}, ${escapeSQL(c.image_name)})`;
  });
  sqlLines.push(chapterRows.join(',\n') + '\nON CONFLICT (chapter_number) DO UPDATE SET summary_hindi = EXCLUDED.summary_hindi, summary_english = EXCLUDED.summary_english;\n');

  // 3. Seed Verses (Batches of 100)
  sqlLines.push('-- 3. Seed gita_verses (701 Verses with Deterministic UUIDs)');
  const verseUUIDMap = new Map(); // verse.id (1..701) -> deterministic UUID

  const BATCH_SIZE = 100;
  for (let i = 0; i < verses.length; i += BATCH_SIZE) {
    const batch = verses.slice(i, i + BATCH_SIZE);
    sqlLines.push('INSERT INTO public.gita_verses (id, chapter_number, verse_number, verse_order, external_id, sanskrit, transliteration, word_meanings, word_meanings_raw) VALUES');
    const batchRows = batch.map(v => {
      const dUUID = generateDeterministicUUID(v.chapter_number, v.verse_number);
      verseUUIDMap.set(v.id, dUUID);
      const parsedMeanings = parseWordMeanings(v.word_meanings);
      const jsonMeanings = parsedMeanings ? JSON.stringify(parsedMeanings) : null;
      return `(${escapeSQL(dUUID)}::uuid, ${v.chapter_number}, ${v.verse_number}, ${v.verse_order}, ${v.externalId}, ${escapeSQL(v.text.trim())}, ${escapeSQL(v.transliteration.trim())}, ${jsonMeanings ? escapeSQL(jsonMeanings) + '::jsonb' : 'NULL'}, ${escapeSQL(v.word_meanings.trim())})`;
    });
    sqlLines.push(batchRows.join(',\n') + '\nON CONFLICT (chapter_number, verse_number) DO UPDATE SET sanskrit = EXCLUDED.sanskrit, transliteration = EXCLUDED.transliteration, word_meanings = EXCLUDED.word_meanings;\n');
  }

  // 4. Seed Translations (2,804 Records in Batches of 100)
  sqlLines.push('-- 4. Seed gita_translations (2,804 Curated Translation Records)');
  const sourceIdMap = new Map(SELECTED_SOURCES.map(s => [s.author_id, s]));
  const selectedTranslations = translations.filter(t => sourceIdMap.has(t.author_id));

  for (let i = 0; i < selectedTranslations.length; i += BATCH_SIZE) {
    const batch = selectedTranslations.slice(i, i + BATCH_SIZE);
    sqlLines.push('INSERT INTO public.gita_translations (id, verse_id, source_id, language, translation_text) VALUES');
    const batchRows = batch.map(t => {
      const src = sourceIdMap.get(t.author_id);
      const verseUUID = verseUUIDMap.get(t.verse_id);
      const transUUID = generateDeterministicTranslationUUID(verseUUID, src.id);
      let desc = t.description;
      if (src.id === 'ramsukhdas') {
        desc = cleanRamsukhdasDescription(desc);
      }
      return `(${escapeSQL(transUUID)}::uuid, ${escapeSQL(verseUUID)}::uuid, ${escapeSQL(src.id)}, ${escapeSQL(src.language)}, ${escapeSQL(desc)})`;
    });
    sqlLines.push(batchRows.join(',\n') + '\nON CONFLICT (verse_id, source_id) DO UPDATE SET translation_text = EXCLUDED.translation_text;\n');
  }

  return sqlLines.join('\n');
}

export function generateSplitSeedSQL({ chapters, verses, translations }) {
  const parts = {};
  const verseUUIDMap = new Map();
  verses.forEach(v => {
    verseUUIDMap.set(v.id, generateDeterministicUUID(v.chapter_number, v.verse_number));
  });

  // Part 1: Sources & Chapters
  const p1 = [];
  p1.push('-- Part 1: Sources (4 rows) and Chapters (18 rows)');
  p1.push('INSERT INTO public.gita_sources (id, author_id, name, author, language, tradition, role, license, attribution) VALUES');
  const sourceRows = SELECTED_SOURCES.map(s => {
    return `(${escapeSQL(s.id)}, ${s.author_id}, ${escapeSQL(s.name)}, ${escapeSQL(s.author)}, ${escapeSQL(s.language)}, ${escapeSQL(s.tradition)}, ${escapeSQL(s.role)}, ${escapeSQL(s.license)}, ${escapeSQL(s.attribution)})`;
  });
  p1.push(sourceRows.join(',\n') + '\nON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, attribution = EXCLUDED.attribution, license = EXCLUDED.license;\n');

  p1.push('INSERT INTO public.gita_chapters (chapter_number, name_sanskrit, name_transliterated, name_translation, name_meaning, verses_count, summary_hindi, summary_english, image_name) VALUES');
  const chapterRows = chapters.map(c => {
    const sHindi = c.chapter_summary_hindi || c.summary_hindi || '';
    const sEnglish = c.chapter_summary || c.summary_english || '';
    return `(${c.chapter_number}, ${escapeSQL(c.name)}, ${escapeSQL(c.name_transliterated)}, ${escapeSQL(c.name_translation)}, ${escapeSQL(c.name_meaning)}, ${c.verses_count}, ${escapeSQL(sHindi)}, ${escapeSQL(sEnglish)}, ${escapeSQL(c.image_name)})`;
  });
  p1.push(chapterRows.join(',\n') + '\nON CONFLICT (chapter_number) DO UPDATE SET summary_hindi = EXCLUDED.summary_hindi, summary_english = EXCLUDED.summary_english;\n');
  parts['052_part1_sources_and_chapters.sql'] = p1.join('\n');

  // Part 2: Verses Chapters 1 to 9
  const BATCH_SIZE = 100;
  const versesCh1to9 = verses.filter(v => v.chapter_number <= 9);
  const p2 = ['-- Part 2: Verses for Chapters 1 through 9 (360 Verses)'];
  for (let i = 0; i < versesCh1to9.length; i += BATCH_SIZE) {
    const batch = versesCh1to9.slice(i, i + BATCH_SIZE);
    p2.push('INSERT INTO public.gita_verses (id, chapter_number, verse_number, verse_order, external_id, sanskrit, transliteration, word_meanings, word_meanings_raw) VALUES');
    const batchRows = batch.map(v => {
      const dUUID = verseUUIDMap.get(v.id);
      const parsedMeanings = parseWordMeanings(v.word_meanings);
      const jsonMeanings = parsedMeanings ? JSON.stringify(parsedMeanings) : null;
      return `(${escapeSQL(dUUID)}::uuid, ${v.chapter_number}, ${v.verse_number}, ${v.verse_order}, ${v.externalId}, ${escapeSQL(v.text.trim())}, ${escapeSQL(v.transliteration.trim())}, ${jsonMeanings ? escapeSQL(jsonMeanings) + '::jsonb' : 'NULL'}, ${escapeSQL(v.word_meanings.trim())})`;
    });
    p2.push(batchRows.join(',\n') + '\nON CONFLICT (chapter_number, verse_number) DO UPDATE SET sanskrit = EXCLUDED.sanskrit, transliteration = EXCLUDED.transliteration, word_meanings = EXCLUDED.word_meanings;\n');
  }
  parts['052_part2_verses_ch1_to_ch9.sql'] = p2.join('\n');

  // Part 3: Verses Chapters 10 to 18
  const versesCh10to18 = verses.filter(v => v.chapter_number >= 10);
  const p3 = ['-- Part 3: Verses for Chapters 10 through 18 (341 Verses)'];
  for (let i = 0; i < versesCh10to18.length; i += BATCH_SIZE) {
    const batch = versesCh10to18.slice(i, i + BATCH_SIZE);
    p3.push('INSERT INTO public.gita_verses (id, chapter_number, verse_number, verse_order, external_id, sanskrit, transliteration, word_meanings, word_meanings_raw) VALUES');
    const batchRows = batch.map(v => {
      const dUUID = verseUUIDMap.get(v.id);
      const parsedMeanings = parseWordMeanings(v.word_meanings);
      const jsonMeanings = parsedMeanings ? JSON.stringify(parsedMeanings) : null;
      return `(${escapeSQL(dUUID)}::uuid, ${v.chapter_number}, ${v.verse_number}, ${v.verse_order}, ${v.externalId}, ${escapeSQL(v.text.trim())}, ${escapeSQL(v.transliteration.trim())}, ${jsonMeanings ? escapeSQL(jsonMeanings) + '::jsonb' : 'NULL'}, ${escapeSQL(v.word_meanings.trim())})`;
    });
    p3.push(batchRows.join(',\n') + '\nON CONFLICT (chapter_number, verse_number) DO UPDATE SET sanskrit = EXCLUDED.sanskrit, transliteration = EXCLUDED.transliteration, word_meanings = EXCLUDED.word_meanings;\n');
  }
  parts['052_part3_verses_ch10_to_ch18.sql'] = p3.join('\n');

  // Part 4: Hindi Translations (Swami Ramsukhdas & Swami Tejomayananda = 1,402 rows)
  const sourceIdMap = new Map(SELECTED_SOURCES.map(s => [s.author_id, s]));
  const hindiTranslations = translations.filter(t => [1, 17].includes(t.author_id));
  const p4 = ['-- Part 4: Hindi Translations (Swami Ramsukhdas & Swami Tejomayananda: 1,402 Records)'];
  for (let i = 0; i < hindiTranslations.length; i += BATCH_SIZE) {
    const batch = hindiTranslations.slice(i, i + BATCH_SIZE);
    p4.push('INSERT INTO public.gita_translations (id, verse_id, source_id, language, translation_text) VALUES');
    const batchRows = batch.map(t => {
      const src = sourceIdMap.get(t.author_id);
      const verseUUID = verseUUIDMap.get(t.verse_id);
      const transUUID = generateDeterministicTranslationUUID(verseUUID, src.id);
      let desc = t.description;
      if (src.id === 'ramsukhdas') {
        desc = cleanRamsukhdasDescription(desc);
      }
      return `(${escapeSQL(transUUID)}::uuid, ${escapeSQL(verseUUID)}::uuid, ${escapeSQL(src.id)}, ${escapeSQL(src.language)}, ${escapeSQL(desc)})`;
    });
    p4.push(batchRows.join(',\n') + '\nON CONFLICT (verse_id, source_id) DO UPDATE SET translation_text = EXCLUDED.translation_text;\n');
  }
  parts['052_part4_translations_hindi.sql'] = p4.join('\n');

  // Part 5: English Translations (Swami Sivananda & Swami Gambhirananda = 1,402 rows)
  const englishTranslations = translations.filter(t => [16, 19].includes(t.author_id));
  const p5 = ['-- Part 5: English Translations (Swami Sivananda & Swami Gambhirananda: 1,402 Records)'];
  for (let i = 0; i < englishTranslations.length; i += BATCH_SIZE) {
    const batch = englishTranslations.slice(i, i + BATCH_SIZE);
    p5.push('INSERT INTO public.gita_translations (id, verse_id, source_id, language, translation_text) VALUES');
    const batchRows = batch.map(t => {
      const src = sourceIdMap.get(t.author_id);
      const verseUUID = verseUUIDMap.get(t.verse_id);
      const transUUID = generateDeterministicTranslationUUID(verseUUID, src.id);
      return `(${escapeSQL(transUUID)}::uuid, ${escapeSQL(verseUUID)}::uuid, ${escapeSQL(src.id)}, ${escapeSQL(src.language)}, ${escapeSQL(t.description)})`;
    });
    p5.push(batchRows.join(',\n') + '\nON CONFLICT (verse_id, source_id) DO UPDATE SET translation_text = EXCLUDED.translation_text;\n');
  }
  parts['052_part5_translations_english.sql'] = p5.join('\n');

  return parts;
}

function escapeSQL(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val.toString();
  return `'${String(val).replace(/'/g, "''")}'`;
}

// CLI Execution
async function main() {
  const args = process.argv.slice(2);
  const shouldGenerateSql = args.includes('--generate-sql');

  try {
    const data = await fetchRawData();
    const report = validateDataset(data);

    console.log('Validation Results:');
    console.log(`- Chapters count: ${report.chaptersCount} (Expected 18)`);
    console.log(`- Verses count: ${report.versesCount} (Expected 701)`);
    console.log(`- Selected translations: ${report.selectedTranslationsCount} (Expected 2,804)`);
    console.log('\nAuthor Breakdown:');
    for (const [author, stats] of Object.entries(report.authorStats)) {
      console.log(`  • ${author} [${stats.language.toUpperCase()} - ${stats.role.toUpperCase()}]: ${stats.count} verses, ${stats.emptyDescriptions} empty, Valid: ${stats.valid}`);
    }

    if (report.errors.length > 0) {
      console.error('\nValidation FAILED with errors:');
      report.errors.forEach(err => console.error(`  ❌ ${err}`));
      process.exit(1);
    }

    console.log('\n✅ ALL VALIDATION CHECKS PASSED PERFECTLY!');

    if (shouldGenerateSql) {
      // 1. Generate full seed file
      const sql = generateSeedSQL(data);
      const outPath = path.join(rootDir, 'supabase/migrations/052_seed_gita_core_data.sql');
      fs.writeFileSync(outPath, sql, 'utf8');
      console.log(`\nSeed SQL successfully written to: ${outPath} (${(Buffer.byteLength(sql) / 1024 / 1024).toFixed(2)} MB)`);

      // 2. Generate chunked seed files for Supabase Web SQL Editor
      const splitParts = generateSplitSeedSQL(data);
      const seedPartsDir = path.join(rootDir, 'supabase/migrations/seed_parts');
      if (!fs.existsSync(seedPartsDir)) fs.mkdirSync(seedPartsDir, { recursive: true });

      console.log('\nGenerating chunked seed files in supabase/migrations/seed_parts/:');
      for (const [filename, content] of Object.entries(splitParts)) {
        const partPath = path.join(seedPartsDir, filename);
        fs.writeFileSync(partPath, content, 'utf8');
        console.log(`  ✔ ${filename} (${(Buffer.byteLength(content) / 1024).toFixed(1)} KB)`);
      }
    }
  } catch (err) {
    console.error('Execution failed:', err);
    process.exit(1);
  }
}

main();
