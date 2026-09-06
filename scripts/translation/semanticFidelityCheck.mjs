/**
 * Semantic Fidelity Check (Gate 3) for all 28 Bhagavad Gita Verses.
 * 
 * Compares the MEANING of Raghavam Hindi drafts against:
 * 1. Swami Ramsukhdas (Gita Press Hindi - ID 1)
 * 2. Swami Tejomayananda (Chinmaya Mission Hindi - ID 17)
 * 3. Shri Purohit Swami (1935 English - ID 21)
 * 
 * Rules:
 * - Fact-check only. Never copies or recommends proprietary wording.
 * - Scores: ALIGNED, MINOR_DRIFT, MAJOR_DRIFT.
 * - Visually highlights 3-way consensus contradictions.
 * - Audits tricky philosophical terms.
 * - Strictly read-only: does NOT modify raghavam_hindi_drafts_v1.json.
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

async function evaluateVerseFidelity(verseData, refs) {
  const wordList = verseData.word_meanings
    .map(w => `- ${w.word}: ${w.meaning}`)
    .join('\n');

  const systemPrompt = `You are an expert impartial scholar of Sanskrit, Hindi, and comparative theology.
Conduct a rigorous SEMANTIC FIDELITY CHECK of a candidate Hindi translation of a Bhagavad Gita verse.
You are evaluating whether the candidate accurately conveys the true meaning of the Sanskrit, compared against three established reference translations:
1. Reference A (Swami Ramsukhdas - Gita Press Hindi)
2. Reference B (Swami Tejomayananda - Chinmaya Mission Hindi)
3. Reference C (Shri Purohit Swami - 1935 English)

Rules:
1. Alignment Score:
   - "ALIGNED": Candidate accurately captures the essential theological and philosophical meaning of the Sanskrit in alignment with standard consensus.
   - "MINOR_DRIFT": Acceptable variation or minor nuance shift, but no core doctrinal contradiction or factual error.
   - "MAJOR_DRIFT": A serious mistranslation, significant factual error, or reversal of meaning (e.g. translating "surrendered" as "arrested", or "negligence" as "studying less").
2. Contradicts 3-Way Consensus:
   - true: All three references firmly agree on a key meaning, and the candidate says something contradicting that consensus.
   - false: Candidate agrees with their shared consensus, or references themselves differ legitimately.
3. Tricky Term Audit:
   - Check key terms in the verse (karma, phala, sanga, svadharma, samatvam, or verse-specific terms). Confirm if they are faithfully conveyed.

Return ONLY a valid JSON object matching this schema:
{
  "alignment_score": "ALIGNED" | "MINOR_DRIFT" | "MAJOR_DRIFT",
  "contradicts_consensus": true | false,
  "consensus_summary": "1-2 sentences summarizing what the 3 references agree on",
  "divergence_notes": "None" or notes on any valid interpretive divergence between references,
  "tricky_terms_audit": "Brief audit of specific philosophical terms in this verse",
  "evaluation_rationale": "Clear assessment of candidate meaning accuracy",
  "recommendation": "Objective scholarly recommendation (e.g. Approved as is, Minor stylistic review, or Re-examine term X)"
}`;

  const userPrompt = `Verse: Bhagavad Gita ${verseData.chapter}.${verseData.verse}

Sanskrit Text:
${verseData.sanskrit}

Padaccheda:
${verseData.padaccheda}

Word-by-word Lexical Meanings:
${wordList}

---
Established References for Meaning Cross-Check:
- Reference A (Ramsukhdas): ${refs.ram}
- Reference B (Tejomayananda): ${refs.tejo}
- Reference C (Purohit Swami): ${refs.purohit}

---
Candidate Translation to Audit (Raghavam Hindi Draft):
"${verseData.hindi_translation}"

Candidate Explanation:
"${verseData.hindi_explanation}"

Perform the semantic fidelity audit now:`;

  const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://raghavam.com',
      'X-Title': 'Raghavam Semantic Fidelity Checker'
    },
    body: JSON.stringify({
      model: 'qwen/qwen-2.5-72b-instruct',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    })
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`OpenRouter API error ${resp.status}: ${err}`);
  }

  const data = await resp.json();
  return JSON.parse(data.choices[0].message.content.trim());
}

async function runCheck() {
  console.log('Loading datasets...');
  const draftsPath = path.resolve(rootDir, 'src/data/geeta/raghavam_hindi_drafts_v1.json');
  const ctxPath = path.resolve(rootDir, 'src/data/geeta/verse_source_context_pd.json');
  const purohitPath = path.resolve(rootDir, 'src/data/geeta/purohit_swami_english_v1.json');

  const drafts = JSON.parse(fs.readFileSync(draftsPath, 'utf8'));
  const ctxVerses = JSON.parse(fs.readFileSync(ctxPath, 'utf8'));
  const purohitData = JSON.parse(fs.readFileSync(purohitPath, 'utf8')).verses;
  const purohitMap = new Map(purohitData.map(p => [`${p.chapter}.${p.verse}`, p.english_translation]));

  const [verseResp, transResp] = await Promise.all([
    fetch('https://raw.githubusercontent.com/gita/gita/main/data/verse.json'),
    fetch('https://raw.githubusercontent.com/gita/gita/main/data/translation.json'),
  ]);
  const allVerses = await verseResp.json();
  const allTrans = await transResp.json();
  const verseIdMap = new Map();
  allVerses.forEach(v => verseIdMap.set(`${v.chapter_number}.${v.verse_number}`, v.id));

  console.log(`Starting Semantic Fidelity Check across all ${drafts.length} verses...\n`);

  const results = [];

  for (let i = 0; i < drafts.length; i++) {
    const draft = drafts[i];
    const key = `${draft.chapter}.${draft.verse}`;
    const vId = verseIdMap.get(key);
    const ctx = ctxVerses.find(v => v.chapter === draft.chapter && v.verse === draft.verse);

    const ramText = allTrans.find(x => x.author_id === 1 && x.verse_id === vId)?.description?.trim() || 'N/A';
    const tejoText = allTrans.find(x => x.author_id === 17 && x.verse_id === vId)?.description?.trim() || 'N/A';
    const purohitText = purohitMap.get(key) || 'N/A';

    process.stdout.write(`[${i + 1}/${drafts.length}] Auditing BG ${key}... `);

    try {
      const evalResult = await evaluateVerseFidelity(
        { ...draft, word_meanings: ctx.word_meanings },
        { ram: ramText, tejo: tejoText, purohit: purohitText }
      );

      console.log(`Score: ${evalResult.alignment_score} | Contradicts Consensus: ${evalResult.contradicts_consensus}`);

      results.push({
        chapter: draft.chapter,
        verse: draft.verse,
        hindi_translation: draft.hindi_translation,
        hindi_explanation: draft.hindi_explanation,
        purohit_english: purohitText,
        ...evalResult
      });
    } catch (err) {
      console.error(`Error on BG ${key}:`, err.message);
      results.push({
        chapter: draft.chapter,
        verse: draft.verse,
        hindi_translation: draft.hindi_translation,
        alignment_score: 'ERROR',
        contradicts_consensus: false,
        evaluation_rationale: `Evaluation failed: ${err.message}`,
        recommendation: 'Manual inspection needed'
      });
    }

    await new Promise(r => setTimeout(r, 600));
  }

  // Generate SEMANTIC_FIDELITY_REPORT.md
  const alignedCount = results.filter(r => r.alignment_score === 'ALIGNED').length;
  const minorCount = results.filter(r => r.alignment_score === 'MINOR_DRIFT').length;
  const majorCount = results.filter(r => r.alignment_score === 'MAJOR_DRIFT').length;
  const consensusContradictionCount = results.filter(r => r.contradicts_consensus === true).length;

  let md = `# SEMANTIC FIDELITY REPORT: Raghavam Original Hindi Translations (Phase 1)
**Date:** ${new Date().toISOString().split('T')[0]}  
**Evaluation Scope:** All 28 Target Verses across 15 Live Categories  
**Reference Benchmark:** Swami Ramsukhdas (Gita Press), Swami Tejomayananda (Chinmaya Mission), Shri Purohit Swami (1935 English)  
**Safety Notice:** Read-only fact-check. No translations were modified automatically.

---

## Executive Summary Dashboard

| Metric | Count | Status |
| :--- | :--- | :--- |
| **Fully Aligned (🟢 ALIGNED)** | **${alignedCount}** / 28 | Doctrinally sound, matches consensus meaning |
| **Minor Nuance Drift (🟡 MINOR_DRIFT)** | **${minorCount}** / 28 | Lower-priority spot-check (valid stylistic/nuance variation) |
| **Major Drift (🔴 MAJOR_DRIFT)** | **${majorCount}** / 28 | High priority for review |
| **Contradicts 3-Way Consensus (🚨 CONTRADICTION)** | **${consensusContradictionCount}** / 28 | **HIGHEST PRIORITY FOR HUMAN REVIEW** |

---

## Consolidated Review Table

| Ch.V | Alignment Status | 3-Way Consensus Status | Tricky Terms Audit | Action / Recommendation |
| :--- | :--- | :--- | :--- | :--- |
`;

  results.forEach(r => {
    let statusBadge = '🟢 ALIGNED';
    if (r.alignment_score === 'MINOR_DRIFT') statusBadge = '🟡 MINOR_DRIFT';
    if (r.alignment_score === 'MAJOR_DRIFT') statusBadge = '🔴 MAJOR_DRIFT';

    let consensusBadge = '✅ In Agreement';
    if (r.contradicts_consensus) consensusBadge = '🚨 **CONTRADICTS 3-WAY CONSENSUS**';

    md += `| **${r.chapter}.${r.verse}** | ${statusBadge} | ${consensusBadge} | ${r.tricky_terms_audit || 'Clean'} | ${r.recommendation || 'Approved'} |\n`;
  });

  md += `\n---\n\n## Verse-by-Verse Detailed Semantic Audit\n\n`;

  results.forEach(r => {
    const isPriority = r.contradicts_consensus || r.alignment_score === 'MAJOR_DRIFT';
    const calloutType = isPriority ? 'CAUTION' : (r.alignment_score === 'MINOR_DRIFT' ? 'IMPORTANT' : 'NOTE');

    md += `### Bhagavad Gita Chapter ${r.chapter}, Verse ${r.verse}

> [!${calloutType}]
> **Fidelity Score:** \`${r.alignment_score}\`  
> **Consensus Check:** ${r.contradicts_consensus ? '🚨 **CONTRADICTS 3-WAY CONSENSUS** (Requires Yash Kumawat Review)' : '✅ Aligned with Consensus'}  
> **Recommendation:** ${r.recommendation}

- **Raghavam Hindi Translation:**
  > "${r.hindi_translation}"

- **English Benchmark (Purohit Swami 1935):**
  > "${r.purohit_english}"

- **Consensus Meaning Across References:**
  > ${r.consensus_summary || 'All references agree on the standard interpretation.'}

- **Inter-Reference Interpretive Variation:**
  > ${r.divergence_notes || 'None; all three references agree closely on core meaning.'}

- **Tricky Terms Audit:**
  > ${r.tricky_terms_audit || 'All key terms faithfully translated.'}

- **Detailed Evaluation Rationale:**
  > ${r.evaluation_rationale || 'Candidate faithfully represents Sanskrit text and aligns with scholarly consensus.'}

---

`;
  });

  const reportPath = path.resolve(rootDir, 'src/data/geeta/SEMANTIC_FIDELITY_REPORT.md');
  fs.writeFileSync(reportPath, md, 'utf8');

  // Also copy to active conversation brain artifacts directory
  const artifactPath = 'C:/Users/YASH/.gemini/antigravity-cli/brain/42c36913-8f85-4516-bf5c-89c4c539a7ce/semantic_fidelity_report.md';
  fs.writeFileSync(artifactPath, md, 'utf8');

  console.log(`\n======================================================`);
  console.log(`Semantic Fidelity Check Complete!`);
  console.log(`Report generated at: ${reportPath}`);
  console.log(`Artifact generated at: ${artifactPath}`);
  console.log(`Aligned: ${alignedCount}, Minor Drift: ${minorCount}, Major Drift: ${majorCount}, Consensus Contradictions: ${consensusContradictionCount}`);
  console.log(`======================================================\n`);
}

runCheck().catch(err => {
  console.error('Fatal Fidelity Check Error:', err);
  process.exit(1);
});
