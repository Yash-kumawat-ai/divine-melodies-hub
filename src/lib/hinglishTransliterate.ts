/**
 * Lightweight Hinglish / Roman Hindi → Devanagari hints for bhajan title search.
 * Not full ITRANS; tuned for how devotees type song names in chat.
 */

function extractWordsLocal(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F]/g, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 2);
}

function normalizeCompact(text: string): string {
  return text.toLowerCase().replace(/[\s\p{P}\p{S}]/gu, '');
}

/** Roman spellings users type → Devanagari fragments expected in titleHindi */
const HINGLISH_WORD_MAP: Record<string, string> = {
  ghar: 'घर',
  ghr: 'घर',
  gharme: 'घर',
  me: 'में',
  mein: 'में',
  mai: 'मैं',
  mere: 'मेरे',
  meri: 'मेरी',
  mera: 'मेरा',
  padharo: 'पधारो',
  padhaaro: 'पधारो',
  padhar: 'पधार',
  pardharo: 'पधारो',
  aao: 'आओ',
  aa: 'आ',
  jao: 'जाओ',
  gajanan: 'गजानंद',
  gajananji: 'गजानंद',
  ganesh: 'गणेश',
  ganpati: 'गणपति',
  ganesha: 'गणेश',
  krishna: 'कृष्ण',
  krsna: 'कृष्ण',
  kanha: 'कन्हा',
  radhe: 'राधे',
  radha: 'राधा',
  ram: 'राम',
  rama: 'राम',
  shyam: 'श्याम',
  shyaam: 'श्याम',
  shiv: 'शिव',
  shiva: 'शिव',
  hanuman: 'हनुमान',
  hanumaan: 'हनुमान',
  chalisa: 'चालीसा',
  aarti: 'आरती',
  arti: 'आरती',
  bhajan: 'भजन',
  naam: 'नाम',
  nam: 'नाम',
  hare: 'हरे',
  hari: 'हरि',
  om: 'ॐ',
  jai: 'जय',
  shree: 'श्री',
  shri: 'श्री',
  sri: 'श्री',
  bethe: 'बैठ',
  baithe: 'बैठ',
  baith: 'बैठ',
  chup: 'चुप',
  chap: 'चाप',
  chupchap: 'चुप',
  sawaree: 'सवारी',
  savari: 'सवारी',
  chadh: 'चढ',
  chadhao: 'चढ़ाओ',
};

const HINGLISH_STOPWORDS = new Set([
  'ji',
  'jee',
  'ka',
  'ke',
  'ki',
  'ko',
  'se',
  'par',
  'pe',
  'the',
  'a',
  'an',
  'and',
  'or',
  'song',
  'bhajan',
  'bajan',
]);

const ROMAN_NORMALIZE: Record<string, string> = {
  ghr: 'ghar',
  ghar: 'ghar',
  pardharo: 'padharo',
  padhaaro: 'padharo',
  shyaam: 'shyam',
  krsna: 'krishna',
  hanumaan: 'hanuman',
};

export function normalizeHinglishLatin(query: string): string {
  return query
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F'-]/g, ' ')
    .split(/\s+/)
    .map((word) => ROMAN_NORMALIZE[word] || word)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Devanagari fragments to look for inside titleHindi (compact + spaced). */
export function latinQueryToHindiFragments(query: string): string[] {
  const normalized = normalizeHinglishLatin(query);
  const words = extractWordsLocal(normalized).filter((w) => !HINGLISH_STOPWORDS.has(w));
  const fragments = new Set<string>();

  for (const word of words) {
    const mapped = HINGLISH_WORD_MAP[word];
    if (mapped) fragments.add(mapped);
    const compactWord = normalizeCompact(word);
    const compactMapped = HINGLISH_WORD_MAP[compactWord];
    if (compactMapped) fragments.add(compactMapped);
  }

  return [...fragments].filter((f) => f.length >= 1);
}

export function hinglishPhraseToDevanagari(query: string): string | null {
  const fragments = latinQueryToHindiFragments(query);
  if (fragments.length === 0) return null;
  return fragments.join('');
}

export function hinglishPhraseToDevanagariSpaced(query: string): string | null {
  const fragments = latinQueryToHindiFragments(query);
  if (fragments.length === 0) return null;
  return fragments.join(' ');
}

export function latinQueryMatchesHindiTitle(query: string, titleHindi: string): boolean {
  if (!titleHindi?.trim()) return false;
  const fragments = latinQueryToHindiFragments(query);
  if (fragments.length === 0) return false;

  const titleNorm = titleHindi.normalize('NFC');
  const titleCompact = normalizeCompact(titleHindi.normalize('NFC'));

  const matchedCount = fragments.filter(
    (frag) => titleNorm.includes(frag.normalize('NFC')) || titleCompact.includes(normalizeCompact(frag.normalize('NFC'))),
  ).length;

  if (fragments.length === 1) return matchedCount === 1;
  return matchedCount >= Math.min(fragments.length, 2);
}

export function expandSearchQueryVariants(query: string): string[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const variants = new Set<string>();
  variants.add(trimmed);

  const normalizedLatin = normalizeHinglishLatin(trimmed);
  if (normalizedLatin && normalizedLatin !== trimmed.toLowerCase()) {
    variants.add(normalizedLatin);
  }

  const hindiCompact = hinglishPhraseToDevanagari(trimmed);
  if (hindiCompact) variants.add(hindiCompact);

  const hindiSpaced = hinglishPhraseToDevanagariSpaced(trimmed);
  if (hindiSpaced) variants.add(hindiSpaced);

  return [...variants];
}
