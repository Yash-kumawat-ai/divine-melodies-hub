/**
 * Gather sanitized Public Domain source context for the 28 target Gita verses.
 * STRICT RULE: Only Sanskrit, Padaccheda, Word-by-Word lexical definitions, and narrative context.
 * NEVER include full-sentence Hindi or English translations.
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

const CHAPTER_CONTEXTS = {
  2: 'कुरुक्षेत्र के युद्धक्षेत्र में अर्जुन विषाद और संशय में डूबकर शस्त्र रख देते हैं। श्रीकृष्ण आत्मा की अमरता, कर्तव्य (कर्मयोग) और स्थितप्रज्ञ (स्थिर बुद्धि) का उपदेश देकर अर्जुन को कायरता त्यागने का निर्देश देते हैं।',
  3: 'अर्जुन कर्म और ज्ञान के द्वन्द्व पर प्रश्न करते हैं। श्रीकृष्ण समझाते हैं कि कोई भी प्राणी बिना कर्म किए नहीं रह सकता। निस्वार्थ कर्तव्य-कर्म, यज्ञ भावना और प्रकृति के गुणों का प्रभाव स्पष्ट करते हैं।',
  6: 'ध्यानयोग और मन के नियंत्रण का अध्याय। श्रीकृष्ण आत्म-उद्धार, समत्व दृष्टि, चंचल मन को अभ्यास और वैराग्य से वश में करने की विधि अर्जुन को समझाते हैं।',
  9: 'राजविद्या राजगुह्ययोग। श्रीकृष्ण अपनी सर्वव्यापकता, प्रकृति के संचालन और निष्काम अनन्य भक्ति की महिमा प्रकट करते हैं।',
  11: 'विश्वरूप दर्शन योग। श्रीकृष्ण अर्जुन को अपना विराट काल-रूप दिखाते हैं और अर्जुन को निमित्त मात्र बनकर कर्तव्य निभाने की प्रेरणा देते हैं।',
  12: 'भक्तियोग। श्रीकृष्ण अपने प्रिय भक्तों के दिव्य लक्षणों—द्वेष-रहित, करुणामयी, समदर्शी और अहंकार-मुक्त आचरण का वर्णन करते हैं।',
  16: 'दैवासुर संपद विभाग योग। श्रीकृष्ण दैवी गुणों और आसुरी दुर्गुणों (काम, क्रोध, लोभ—नरक के तीन द्वार) का स्पष्ट भेद बताते हैं।',
  18: 'मोक्ष संन्यास योग। गीता का उपसंहार। त्याग और संन्यास का रहस्य, तीनों गुणों के अनुसार बुद्धि-धृति-सुख का भेद, स्वधर्म पालन और अंत में सर्वधर्मान्परित्यज्य की शरणागति का परम उपदेश।'
};

function cleanWordMeanings(raw) {
  if (!raw || typeof raw !== 'string') return [];
  return raw
    .split(';')
    .map(p => p.trim())
    .filter(Boolean)
    .map(part => {
      const match = part.match(/^(.+?)(?:—|--|-)\s*(.+)$/);
      if (match) {
        return { word: match[1].trim(), meaning: match[2].trim() };
      }
      return { word: part, meaning: '' };
    });
}

async function gatherContext() {
  console.log('Fetching canonical Sanskrit and word-meanings...');
  const resp = await fetch('https://raw.githubusercontent.com/gita/gita/main/data/verse.json');
  if (!resp.ok) throw new Error('Failed to fetch verse.json');
  const verses = await resp.json();

  const verseMap = new Map();
  verses.forEach(v => {
    verseMap.set(`${v.chapter_number}.${v.verse_number}`, v);
  });

  const gathered = [];

  for (const { chapter, verse } of TARGET_VERSES) {
    const key = `${chapter}.${verse}`;
    const raw = verseMap.get(key);
    if (!raw) {
      throw new Error(`Target verse ${key} not found in catalog!`);
    }

    const parsedWords = cleanWordMeanings(raw.word_meanings);
    const padaccheda = parsedWords.map(w => w.word).join(' | ');

    gathered.push({
      chapter,
      verse,
      verse_order: raw.verse_order,
      sanskrit: raw.text.trim(),
      transliteration: raw.transliteration.trim(),
      padaccheda,
      word_meanings: parsedWords,
      narrative_context: CHAPTER_CONTEXTS[chapter] || ''
    });
  }

  const outDir = path.resolve(rootDir, 'src/data/geeta');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const outFile = path.resolve(outDir, 'verse_source_context_pd.json');
  fs.writeFileSync(outFile, JSON.stringify(gathered, null, 2), 'utf8');

  console.log(`Successfully gathered sanitized source context for ${gathered.length} verses at:`);
  console.log(outFile);
}

gatherContext().catch(err => {
  console.error('Error gathering context:', err);
  process.exit(1);
});
