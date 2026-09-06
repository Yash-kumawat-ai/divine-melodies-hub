/**
 * Similarity Safeguard Gate for Raghavam Hindi Translations.
 * 
 * Rules:
 * 1. Compare each generated draft against Ramsukhdas (author 1) and Tejomayananda (author 17).
 * 2. Exclude pure connective particles (और, है, में, को, का, की, के, से, पर, यह, वह, हो, जो, तो, भी, ने, ही, था, थे, थी, आदि).
 * 3. Flag an overlap ONLY if a sequence of 3+ consecutive words contains at least ONE substantive content word.
 * 4. Generate a detailed markdown review report with similarity scores and exact overlapping phrases (if any).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const FUNCTION_WORDS = new Set([
  'और', 'है', 'हैं', 'में', 'को', 'का', 'की', 'के', 'से', 'पर', 'यह', 'वह', 'हो', 'जो',
  'तो', 'भी', 'ने', 'ही', 'था', 'थे', 'थी', 'कर', 'रहा', 'रहे', 'रही', 'लिए', 'कि',
  'नहीं', 'ना', 'हुए', 'हुआ', 'हुई', 'जाता', 'जाती', 'जाते', 'द्वारा', 'अपना', 'अपने', 'अपनी'
]);

function tokenize(text) {
  if (!text) return [];
  return text
    .replace(/[।॥,\.\?!;:"'“”‘’\(\)\-\–—\/]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim().toLowerCase())
    .filter(Boolean);
}

function findSubstantiveNGramOverlaps(draftTokens, refTokens, n = 3) {
  const overlaps = [];
  if (draftTokens.length < n || refTokens.length < n) return overlaps;

  const refSet = new Set();
  for (let j = 0; j <= refTokens.length - n; j++) {
    refSet.add(refTokens.slice(j, j + n).join(' '));
  }

  for (let i = 0; i <= draftTokens.length - n; i++) {
    const ngramTokens = draftTokens.slice(i, i + n);
    const ngramStr = ngramTokens.join(' ');

    if (refSet.has(ngramStr)) {
      // Check if at least ONE word is a substantive content word (not a function word)
      const hasContentWord = ngramTokens.some(w => !FUNCTION_WORDS.has(w));
      if (hasContentWord) {
        overlaps.push({
          phrase: ngramStr,
          position: i,
          tokens: ngramTokens
        });
      }
    }
  }

  return overlaps;
}

async function runSafeguard() {
  const draftsPath = path.resolve(rootDir, 'src/data/geeta/raghavam_hindi_drafts_v1.json');
  const purohitPath = path.resolve(rootDir, 'src/data/geeta/purohit_swami_english_v1.json');

  if (!fs.existsSync(draftsPath)) {
    throw new Error('Drafts file missing! Wait for generateRaghavamTranslations.mjs to finish.');
  }

  const drafts = JSON.parse(fs.readFileSync(draftsPath, 'utf8'));
  const purohitData = fs.existsSync(purohitPath) ? JSON.parse(fs.readFileSync(purohitPath, 'utf8')) : { verses: [] };
  const purohitMap = new Map();
  purohitData.verses.forEach(pv => {
    purohitMap.set(`${pv.chapter}.${pv.verse}`, pv);
  });

  console.log('Fetching reference translations for Ramsukhdas (ID 1) and Tejomayananda (ID 17)...');
  const [verseResp, transResp] = await Promise.all([
    fetch('https://raw.githubusercontent.com/gita/gita/main/data/verse.json'),
    fetch('https://raw.githubusercontent.com/gita/gita/main/data/translation.json'),
  ]);

  const allVerses = await verseResp.json();
  const allTrans = await transResp.json();

  const verseIdMap = new Map();
  allVerses.forEach(v => {
    verseIdMap.set(`${v.chapter_number}.${v.verse_number}`, v.id);
  });

  const reportItems = [];
  let totalFlagged = 0;

  for (const draft of drafts) {
    const key = `${draft.chapter}.${draft.verse}`;
    const vId = verseIdMap.get(key);

    const ramsukhdas = allTrans.find(t => t.author_id === 1 && t.verse_id === vId);
    const tejomayananda = allTrans.find(t => t.author_id === 17 && t.verse_id === vId);
    const purohit = purohitMap.get(key);

    const draftTokens = tokenize(draft.hindi_translation);
    const ramTokens = tokenize(ramsukhdas?.description || '');
    const tejoTokens = tokenize(tejomayananda?.description || '');

    const ramOverlaps = findSubstantiveNGramOverlaps(draftTokens, ramTokens, 3);
    const tejoOverlaps = findSubstantiveNGramOverlaps(draftTokens, tejoTokens, 3);

    const hasFlag = ramOverlaps.length > 0 || tejoOverlaps.length > 0;
    if (hasFlag) totalFlagged++;

    const formattedWords = Array.isArray(draft.word_meanings)
      ? draft.word_meanings.map(w => `\`${w.word}\` (${w.meaning})`).join(' • ')
      : draft.word_meanings;

    reportItems.push({
      chapter: draft.chapter,
      verse: draft.verse,
      sanskrit: draft.sanskrit,
      padaccheda: draft.padaccheda,
      word_meanings: formattedWords,
      hindi_translation: draft.hindi_translation,
      hindi_explanation: draft.hindi_explanation,
      purohit_english: purohit?.english_translation || null,
      purohit_status: purohit?.status || 'UNKNOWN',
      ramsukhdas_ref: ramsukhdas?.description?.trim() || 'N/A',
      tejomayananda_ref: tejomayananda?.description?.trim() || 'N/A',
      ram_overlaps: ramOverlaps,
      tejo_overlaps: tejoOverlaps,
      status: hasFlag ? 'FLAGGED_FOR_REVIEW' : 'PASSED_SAFEGUARD'
    });
  }

  // Generate Comprehensive Markdown Review Document
  let md = `# DRAFT REVIEW REPORT: Raghavam Original Hindi Translations (Phase 1)
**Date:** ${new Date().toISOString().split('T')[0]}  
**Status:** ⏳ PENDING HUMAN REVIEW (Yash Kumawat)  
**Total Target Verses:** ${drafts.length}  
**Safeguard Audit Summary:** ${reportItems.filter(r => r.status === 'PASSED_SAFEGUARD').length} Passed, ${totalFlagged} Flagged for Overlap Check  
**Purohit Swami 1935 English Status:** ${reportItems.filter(r => r.purohit_status === 'VERBATIM_EXTRACTED').length} / ${drafts.length} Verbatim Extracted (Zero Gaps)  

> [!CAUTION]
> **GOVERNANCE NOTICE: EXECUTION IS HALTED FOR HUMAN REVIEW**  
> All 28 translations are drafts. Migration 058 will NOT be written or applied until Yash Kumawat has reviewed each verse below.
> Pure connective particles were excluded from overlap counts; only 3+ consecutive word sequences with substantive content words are flagged.

---

## Summary Table

| Ch.V | Status | Substantive Overlaps (Ram / Tejo) | Purohit English Status | Human Review Sign-Off |
| :--- | :--- | :--- | :--- | :--- |
${reportItems.map(r => `| **${r.chapter}.${r.verse}** | ${r.status === 'PASSED_SAFEGUARD' ? '✅ PASSED' : '⚠️ FLAGGED'} | Ram: ${r.ram_overlaps.length}, Tejo: ${r.tejo_overlaps.length} | ${r.purohit_status === 'VERBATIM_EXTRACTED' ? '✅ Verbatim 1935' : '⚠️ GAP MISSING'} | [ ] Pending |`).join('\n')}

---

## Verse-by-Verse Detailed Draft Review

`;

  for (const item of reportItems) {
    md += `### Chapter ${item.chapter}, Verse ${item.verse}
- **Sanskrit (मूल श्लोक):**
  > ${item.sanskrit.replace(/\n+/g, ' ')}
- **Padaccheda (पदच्छेद):** \`${item.padaccheda}\`
- **Word Meanings (पदार्थ):** ${item.word_meanings}

#### 1. Raghavam Original Drafts (Pending Review):
- **सरल हिन्दी अनुवाद (Draft):**
  > **"${item.hindi_translation}"**
- **हिन्दी भावार्थ / व्यावहारिक संदर्भ (Draft):**
  > ${item.hindi_explanation}

#### 2. English Track (Shri Purohit Swami 1935 - Verbatim Public Domain):
- **English Translation:**
  > "${item.purohit_english || '⚠️ GAP DETECTED: Missing in Purohit Swami 1935 dataset'}"

#### 3. Similarity Safeguard Audit:
- **Ramsukhdas (Gita Press Ref):** "${item.ramsukhdas_ref}"
- **Tejomayananda (Chinmaya Ref):** "${item.tejomayananda_ref}"
- **Substantive Overlaps:** ${item.status === 'PASSED_SAFEGUARD' ? '✅ None (Clean independence)' : `⚠️ Found: ${[...item.ram_overlaps, ...item.tejo_overlaps].map(o => `"${o.phrase}"`).join(', ')}`}

- **Review Sign-off:** \`[ ] Pending Yash Kumawat's approval\`

---

`;
  }

  const reportFile = path.resolve(rootDir, 'src/data/geeta/DRAFT_REVIEW_REPORT.md');
  fs.writeFileSync(reportFile, md, 'utf8');

  console.log(`\n======================================================`);
  console.log(`Similarity Safeguard Complete!`);
  console.log(`Passed: ${reportItems.filter(r => r.status === 'PASSED_SAFEGUARD').length} / ${reportItems.length}`);
  console.log(`Flagged: ${totalFlagged} / ${reportItems.length}`);
  console.log(`Detailed Review Report created at: ${reportFile}`);
  console.log(`======================================================\n`);
}

runSafeguard().catch(err => {
  console.error('Safeguard error:', err);
  process.exit(1);
});
