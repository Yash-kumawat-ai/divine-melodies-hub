import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const RAGHAVAM_JSON_PATH = path.join(ROOT_DIR, 'src/data/geeta/raghavam_hindi_drafts_v1.json');
const PUROHIT_JSON_PATH = path.join(ROOT_DIR, 'src/data/geeta/purohit_swami_english_v1.json');
const MIGRATION_SQL_PATH = path.join(ROOT_DIR, 'supabase/migrations/058_raghavam_hindi_translations_and_purohit_swami.sql');

function escapeSql(str) {
  if (!str) return '';
  return str.replace(/'/g, "''");
}

function run() {
  console.log('--- Step 1: Stamping approvals on Raghavam Hindi Drafts ---');
  if (!fs.existsSync(RAGHAVAM_JSON_PATH)) {
    throw new Error(`File not found: ${RAGHAVAM_JSON_PATH}`);
  }

  const raghavamData = JSON.parse(fs.readFileSync(RAGHAVAM_JSON_PATH, 'utf8'));
  console.log(`Loaded ${raghavamData.length} records from raghavam_hindi_drafts_v1.json`);

  if (raghavamData.length !== 28) {
    throw new Error(`Expected 28 records, found ${raghavamData.length}`);
  }

  const approvalDate = '2026-09-06';
  const approver = 'Yash Kumawat';

  raghavamData.forEach((record, idx) => {
    if (!record.hindi_translation || !record.hindi_translation.trim()) {
      throw new Error(`Empty hindi_translation for BG ${record.chapter}.${record.verse}`);
    }
    record.translation_status = 'approved';
    record.approved_by = approver;
    record.approved_at = approvalDate;
  });

  fs.writeFileSync(RAGHAVAM_JSON_PATH, JSON.stringify(raghavamData, null, 2), 'utf8');
  console.log(`Successfully updated all 28 records in ${RAGHAVAM_JSON_PATH}`);

  console.log('\n--- Step 2: Loading Purohit Swami English translations ---');
  if (!fs.existsSync(PUROHIT_JSON_PATH)) {
    throw new Error(`File not found: ${PUROHIT_JSON_PATH}`);
  }

  const purohitData = JSON.parse(fs.readFileSync(PUROHIT_JSON_PATH, 'utf8'));
  const purohitVerses = purohitData.verses || [];
  console.log(`Loaded ${purohitVerses.length} verses from purohit_swami_english_v1.json`);

  if (purohitVerses.length !== 28) {
    throw new Error(`Expected 28 Purohit verses, found ${purohitVerses.length}`);
  }

  // Create lookup for Purohit verses
  const purohitMap = new Map();
  for (const pv of purohitVerses) {
    purohitMap.set(`${pv.chapter}.${pv.verse}`, pv);
  }

  // Verify pairing
  for (const rv of raghavamData) {
    const key = `${rv.chapter}.${rv.verse}`;
    if (!purohitMap.has(key)) {
      throw new Error(`Missing Purohit translation for BG ${key}`);
    }
  }

  console.log('\n--- Step 3: Generating migration 058 SQL ---');

  let sql = `-- ==============================================================================
-- Migration 058: Register Raghavam Original Hindi & Purohit Swami English Translations
-- Description:
--   1. Registers 'raghavam_hindi_v1' (Proprietary / Raghavam Editorial) in gita_sources
--   2. Registers 'purohitswami' (1935 Public Domain, Shri Purohit Swami) in gita_sources
--   3. Seeds 28 Approved Raghavam Original Hindi Translations into gita_translations
--   4. Seeds 28 Verbatim Shri Purohit Swami English Translations into gita_translations
--
-- Target: 28 Core Verses powering Ask Gita's 15 Live Problem Categories
-- Author/Sign-off: Yash Kumawat (Approved: 2026-09-06)
-- Safeguard status: 0 substantive n-gram overlaps against Ramsukhdas & Tejomayananda
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. Register Sources in public.gita_sources
-- ------------------------------------------------------------------------------
INSERT INTO public.gita_sources (
  id,
  author_id,
  name,
  author,
  language,
  tradition,
  role,
  license,
  attribution,
  is_active
) VALUES
(
  'raghavam_hindi_v1',
  101,
  'Raghavam Original Hindi Translation (Phase 1)',
  'Raghavam Editorial',
  'hindi',
  'Raghavam Original Translation',
  'primary',
  'Proprietary / Raghavam Editorial',
  'हिंदी अनुवाद • राघवम् मौलिक अनुवाद',
  true
),
(
  'purohitswami',
  21,
  'The Geeta: The Gospel of the Lord Shri Krishna (1935)',
  'Shri Purohit Swami',
  'english',
  'Public Domain Historical Translation (d. 1941, Faber & Faber 1935)',
  'primary',
  'Public Domain',
  'English translation • Shri Purohit Swami (1935, Public Domain)',
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  author = EXCLUDED.author,
  tradition = EXCLUDED.tradition,
  role = EXCLUDED.role,
  license = EXCLUDED.license,
  attribution = EXCLUDED.attribution,
  is_active = EXCLUDED.is_active;

-- ------------------------------------------------------------------------------
-- 2. Seed 28 Approved Raghavam Original Hindi Translations
-- ------------------------------------------------------------------------------
`;

  // Add Raghavam Hindi rows
  raghavamData.forEach((rv, i) => {
    const ch = rv.chapter;
    const v = rv.verse;
    const textEscaped = escapeSql(rv.hindi_translation.trim());
    
    sql += `-- [${i + 1}/28] BG ${ch}.${v} (Raghavam Hindi Original)\n`;
    sql += `INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)\n`;
    sql += `VALUES (\n`;
    sql += `  (SELECT id FROM public.gita_verses WHERE chapter_number = ${ch} AND verse_number = ${v}),\n`;
    sql += `  'raghavam_hindi_v1',\n`;
    sql += `  'hindi',\n`;
    sql += `  '${textEscaped}'\n`;
    sql += `)\n`;
    sql += `ON CONFLICT (verse_id, source_id) DO UPDATE\n`;
    sql += `SET translation_text = EXCLUDED.translation_text;\n\n`;
  });

  sql += `-- ------------------------------------------------------------------------------\n`;
  sql += `-- 3. Seed 28 Verbatim Shri Purohit Swami (1935) English Translations\n`;
  sql += `-- ------------------------------------------------------------------------------\n`;

  // Add Purohit English rows in the same order
  raghavamData.forEach((rv, i) => {
    const ch = rv.chapter;
    const v = rv.verse;
    const pv = purohitMap.get(`${ch}.${v}`);
    const textEscaped = escapeSql(pv.english_translation.trim());

    sql += `-- [${i + 1}/28] BG ${ch}.${v} (Shri Purohit Swami 1935 English)\n`;
    sql += `INSERT INTO public.gita_translations (verse_id, source_id, language, translation_text)\n`;
    sql += `VALUES (\n`;
    sql += `  (SELECT id FROM public.gita_verses WHERE chapter_number = ${ch} AND verse_number = ${v}),\n`;
    sql += `  'purohitswami',\n`;
    sql += `  'english',\n`;
    sql += `  '${textEscaped}'\n`;
    sql += `)\n`;
    sql += `ON CONFLICT (verse_id, source_id) DO UPDATE\n`;
    sql += `SET translation_text = EXCLUDED.translation_text;\n\n`;
  });

  sql += `COMMIT;\n`;

  fs.writeFileSync(MIGRATION_SQL_PATH, sql, 'utf8');
  console.log(`Migration 058 written successfully to: ${MIGRATION_SQL_PATH}`);
  console.log(`Total bytes: ${Buffer.byteLength(sql, 'utf8')}`);
}

run();
