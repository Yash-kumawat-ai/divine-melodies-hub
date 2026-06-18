/**
 * Search utility — YouTube-style: show results only when the query
 * actually appears in title, singer, or (if already matched) lyrics.
 */

import {
  expandSearchQueryVariants,
  latinQueryMatchesHindiTitle,
  normalizeHinglishLatin,
} from '@/lib/hinglishTransliterate';

function levenshteinDistance(str1: string, str2: string): number {
  const track = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i += 1) track[0][i] = i;
  for (let j = 0; j <= str2.length; j += 1) track[j][0] = j;

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(track[j][i - 1] + 1, track[j - 1][i] + 1, track[j - 1][i - 1] + indicator);
    }
  }

  return track[str2.length][str1.length];
}

function calculateSimilarity(str1: string, str2: string): number {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 100;
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return Math.max(0, ((maxLen - distance) / maxLen) * 100);
}

function containsDevanagari(text: string): boolean {
  return /[\u0900-\u097F]/.test(text);
}

function isLatinQuery(text: string): boolean {
  return /^[a-z0-9\s'-]+$/i.test(text.trim());
}

/** Remove spaces/punctuation for "चुप चाप" ↔ "चुपचाप" style matching */
export function normalizeSearchText(text: string): string {
  return text.normalize('NFC').toLowerCase().replace(/[\s\p{P}\p{S}]/gu, '');
}

export function extractWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F]/g, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 2);
}

/** Tokens for DB ilike — no tiny fragments like "he" from "bethe" */
export function getFlexibleSearchTokens(query: string): string[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const tokens = new Set<string>();
  const hasDevanagari = containsDevanagari(trimmed);
  const minTokenLength = hasDevanagari ? 2 : 3;
  const add = (value: string) => {
    if (value.length >= minTokenLength) tokens.add(value);
  };

  // Add both NFC and NFD variants for Devanagari to support all mobile keyboard encodings
  const nfcQuery = trimmed.normalize('NFC');
  const nfdQuery = trimmed.normalize('NFD');

  add(nfcQuery);
  add(nfdQuery);

  extractWords(nfcQuery).forEach(add);
  extractWords(nfdQuery).forEach(add);

  const compactNFC = normalizeSearchText(nfcQuery);
  const compactNFD = normalizeSearchText(nfdQuery);
  if (compactNFC.length >= minTokenLength) tokens.add(compactNFC);
  if (compactNFD.length >= minTokenLength) tokens.add(compactNFD);

  const allowSplit = containsDevanagari(trimmed) || compactNFC.length >= 8;
  if (allowSplit && !/\s/.test(trimmed) && compactNFC.length >= 6) {
    const midNFC = Math.ceil(compactNFC.length / 2);
    add(compactNFC.slice(0, midNFC));
    add(compactNFC.slice(midNFC));

    const midNFD = Math.ceil(compactNFD.length / 2);
    add(compactNFD.slice(0, midNFD));
    add(compactNFD.slice(midNFD));
  }

  return [...tokens];
}

function getBhajanSearchFields(bhajan: any): {
  title: string;
  titleHindi: string;
  singer: string;
  titleBlob: string;
  titleCompact: string;
  singerCompact: string;
  transliteration: string;
} {
  const title = String(bhajan.title || '');
  const titleHindi = String(bhajan.titleHindi || '');
  const singer = String(bhajan.singerName || '');
  const titleBlob = `${title} ${titleHindi} ${bhajan.lyricsTransliteration || ''}`.trim();
  return {
    title,
    titleHindi,
    singer,
    titleBlob,
    titleCompact: normalizeSearchText(`${title} ${titleHindi}`),
    singerCompact: normalizeSearchText(singer),
    transliteration: String(bhajan.lyricsTransliteration || ''),
  };
}

function substringMatch(haystack: string, needle: string): boolean {
  if (!needle || needle.length < 2) return false;
  return haystack.normalize('NFC').toLowerCase().includes(needle.normalize('NFC').toLowerCase());
}

function compactMatch(haystack: string, needle: string): boolean {
  if (!needle || needle.length < 3) return false;
  return normalizeSearchText(haystack).includes(normalizeSearchText(needle));
}

function foldLatinVowels(text: string): string {
  return text.toLowerCase().replace(/[aeiouy]/g, '');
}

function laxLatinWordMatch(queryWord: string, titleWord: string): boolean {
  if (!isLatinQuery(queryWord) || !isLatinQuery(titleWord)) return false;
  if (queryWord.length < 4 || titleWord.length < 4) return false;
  const qFold = foldLatinVowels(queryWord);
  const tFold = foldLatinVowels(titleWord);
  if (qFold.length >= 3 && tFold.length >= 3) {
    if (tFold.includes(qFold) || qFold.includes(tFold)) return true;
    if (calculateSimilarity(qFold, tFold) >= 78) return true;
  }
  return fuzzyTitleWordMatch(queryWord, titleWord);
}

function fuzzyTitleWordMatch(queryWord: string, titleWord: string): boolean {
  if (queryWord.length < 4 || titleWord.length < 4) return false;
  const similarity = calculateSimilarity(queryWord, titleWord);
  if (similarity < 82) return false;
  const prefixLen = Math.min(3, queryWord.length, titleWord.length);
  return (
    queryWord.slice(0, prefixLen) === titleWord.slice(0, prefixLen) ||
    titleWord.includes(queryWord) ||
    queryWord.includes(titleWord)
  );
}

function queryMatchesWithVariants(
  matcher: (bhajan: any, query: string) => boolean,
  bhajan: any,
  query: string,
): boolean {
  const variants = expandSearchQueryVariants(query);
  return variants.some((variant) => matcher(bhajan, variant));
}

/**
 * Hard relevance gate — must pass before a bhajan appears in results.
 */
export function bhajanMatchesQuery(bhajan: any, query: string): boolean {
  const trimmed = query.trim();
  if (!trimmed || !bhajan) return false;

  const fields = getBhajanSearchFields(bhajan);
  const queryLower = trimmed.toLowerCase();
  const queryCompact = normalizeSearchText(trimmed);

  if (
    substringMatch(fields.title, trimmed) ||
    substringMatch(fields.titleHindi, trimmed) ||
    substringMatch(fields.singer, trimmed) ||
    substringMatch(fields.transliteration, trimmed) ||
    latinQueryMatchesHindiTitle(trimmed, fields.titleHindi)
  ) {
    return true;
  }

  if (queryCompact.length >= 3) {
    if (fields.titleCompact.includes(queryCompact) || fields.singerCompact.includes(queryCompact)) {
      return true;
    }
  }

  const queryWords = extractWords(trimmed).filter((w) => w.length >= 3);
  const titleWords = extractWords(fields.titleBlob).filter((w) => w.length >= 3);

  if (queryWords.length > 0) {
    const allWordsMatch = queryWords.every((qWord) =>
      titleWords.some(
        (tWord) =>
          tWord.includes(qWord) ||
          qWord.includes(tWord) ||
          compactMatch(tWord, qWord) ||
          (isLatinQuery(qWord) && (laxLatinWordMatch(qWord, tWord) || fuzzyTitleWordMatch(qWord, tWord))),
      ),
    );
    if (allWordsMatch) return true;
  }

  if (isLatinQuery(trimmed) && trimmed.length >= 4) {
    if (titleWords.some((tWord) => laxLatinWordMatch(trimmed, tWord) || fuzzyTitleWordMatch(trimmed, tWord))) {
      return true;
    }
  }

  return false;
}

const synonymMap: Record<string, string[]> = {
  hare: ['hari', 'haraye', 'harey', 'hareesh'],
  krishna: ['kanha', 'kanhaiya', 'kishan', 'govind', 'gopal', 'hari'],
  rama: ['ram', 'ramachandra', 'raghupath', 'raghunath'],
  shiva: ['shiv', 'mahadev', 'bholenath', 'neelkant'],
  hanuman: ['hanumanji', 'bajrangbali', 'vanar'],
};

function areSynonyms(word1: string, word2: string): boolean {
  const a = word1.toLowerCase();
  const b = word2.toLowerCase();
  if (a === b) return true;
  for (const [key, synonyms] of Object.entries(synonymMap)) {
    if (a === key && synonyms.includes(b)) return true;
    if (b === key && synonyms.includes(a)) return true;
  }
  return false;
}

function scoreBhajan(bhajan: any, query: string): number {
  if (!bhajanMatchesQuery(bhajan, query)) return 0;

  let score = 30;
  const fields = getBhajanSearchFields(bhajan);
  const queryLower = query.toLowerCase().trim();
  const queryCompact = normalizeSearchText(query);
  const queryWords = extractWords(query).filter((w) => w.length >= 3);

  if (fields.title.toLowerCase() === queryLower) score += 200;
  else if (substringMatch(fields.title, query)) score += 100;

  if (substringMatch(fields.titleHindi, query)) score += 90;
  if (substringMatch(fields.singer, query)) score += 75;

  if (queryCompact.length >= 3 && fields.titleCompact.includes(queryCompact)) score += 160;
  if (queryCompact.length >= 3 && fields.singerCompact.includes(queryCompact)) score += 65;

  for (const qWord of queryWords) {
    if (substringMatch(fields.titleBlob, qWord)) score += 40;
    if (areSynonyms(qWord, fields.title) || areSynonyms(qWord, fields.singer)) score += 35;
  }

  const lyrics = `${bhajan.lyricsHindi || ''} ${fields.transliteration}`;
  if (substringMatch(lyrics, query) || (queryCompact.length >= 4 && compactMatch(lyrics, query))) {
    score += 25;
  }

  return score;
}

function deduplicateResults(bhajans: any[]): any[] {
  const seen = new Set<number>();
  const result: any[] = [];

  for (let i = 0; i < bhajans.length; i++) {
    if (seen.has(bhajans[i].id)) continue;
    result.push(bhajans[i]);
    seen.add(bhajans[i].id);

    for (let j = i + 1; j < bhajans.length; j++) {
      if (seen.has(bhajans[j].id)) continue;
      const titleSimilarity = calculateSimilarity(bhajans[i].title, bhajans[j].title);
      const lyricsSimilarity = calculateSimilarity(
        String(bhajans[i].lyricsHindi || '').substring(0, 100),
        String(bhajans[j].lyricsHindi || '').substring(0, 100),
      );
      if (titleSimilarity > 85 || lyricsSimilarity > 90) seen.add(bhajans[j].id);
    }
  }

  return result;
}

export function smartSearchBhajans(query: string, source: any[] = []): any[] {
  if (!query.trim()) return [];

  const scoredBhajans = source
    .map((bhajan) => ({
      ...bhajan,
      _searchScore: scoreBhajan(bhajan, query),
    }))
    .filter((b) => b._searchScore > 0)
    .sort((a, b) => b._searchScore - a._searchScore);

  return deduplicateResults(scoredBhajans).map(({ _searchScore, ...rest }) => rest);
}

/** Narad AI: title-first search with strict match first, fuzzy only when needed. */
const NARAD_MIN_SCORE = 60;

function getNaradTitleFields(bhajan: any) {
  const title = String(bhajan.title || '').normalize('NFC');
  const titleHindi = String(bhajan.titleHindi || '').normalize('NFC');
  const transliteration = String(bhajan.lyricsTransliteration || '').normalize('NFC');
  const titleBlob = `${title} ${titleHindi} ${transliteration}`.trim();
  return {
    title,
    titleHindi,
    transliteration,
    titleBlob,
    titleCompact: normalizeSearchText(`${title} ${titleHindi} ${transliteration}`),
    titleWords: extractWords(titleBlob),
  };
}

function bhajanStrictTitleMatchSingle(bhajan: any, query: string): boolean {
  const trimmed = query.trim();
  if (!trimmed || !bhajan) return false;

  const fields = getNaradTitleFields(bhajan);
  const queryCompact = normalizeSearchText(trimmed);

  if (
    substringMatch(fields.title, trimmed) ||
    substringMatch(fields.titleHindi, trimmed) ||
    substringMatch(fields.transliteration, trimmed) ||
    latinQueryMatchesHindiTitle(trimmed, fields.titleHindi)
  ) {
    return true;
  }

  if (queryCompact.length >= 2 && fields.titleCompact.includes(queryCompact)) {
    return true;
  }

  const queryWords = extractWords(trimmed);
  if (queryWords.length > 1) {
    const minWordLen = containsDevanagari(trimmed) ? 2 : 3;
    const significant = queryWords.filter((w) => w.length >= minWordLen);
    if (
      significant.length > 0 &&
      significant.every((qWord) =>
        fields.titleWords.some(
          (tWord) => tWord.includes(qWord) || qWord.includes(tWord) || compactMatch(tWord, qWord),
        ),
      )
    ) {
      return true;
    }
  }

  return false;
}

function bhajanStrictTitleMatch(bhajan: any, query: string): boolean {
  if (bhajanStrictTitleMatchSingle(bhajan, query)) return true;
  return queryMatchesWithVariants(bhajanStrictTitleMatchSingle, bhajan, query);
}

function bhajanFuzzyTitleMatch(bhajan: any, query: string): boolean {
  const trimmed = query.trim();
  if (!trimmed || !bhajan) return false;

  const fields = getNaradTitleFields(bhajan);

  if (isLatinQuery(trimmed) && latinQueryMatchesHindiTitle(trimmed, fields.titleHindi)) {
    return true;
  }

  const normalizedLatin = normalizeHinglishLatin(trimmed);
  const queryWords = extractWords(normalizedLatin).filter((w) => w.length >= 3);
  const titleWords = fields.titleWords.filter((w) => w.length >= 3);

  if (queryWords.length > 1) {
    const allWordsMatch = queryWords.every((qWord) =>
      titleWords.some(
        (tWord) =>
          tWord.includes(qWord) ||
          qWord.includes(tWord) ||
          compactMatch(tWord, qWord) ||
          substringMatch(fields.transliteration, qWord) ||
          substringMatch(fields.title, qWord),
      ),
    );
    if (allWordsMatch) return true;
    return false;
  }

  if (queryWords.length > 0) {
    const allWordsMatch = queryWords.every((qWord) =>
      titleWords.some(
        (tWord) =>
          tWord.includes(qWord) ||
          qWord.includes(tWord) ||
          compactMatch(tWord, qWord) ||
          (isLatinQuery(qWord) && (laxLatinWordMatch(qWord, tWord) || fuzzyTitleWordMatch(qWord, tWord))),
      ),
    );
    if (allWordsMatch) return true;
  }

  if (isLatinQuery(trimmed) && trimmed.length >= 4) {
    if (titleWords.some((tWord) => laxLatinWordMatch(trimmed, tWord) || fuzzyTitleWordMatch(trimmed, tWord))) {
      return true;
    }
  }

  return false;
}

function bhajanPartialTitleMatch(bhajan: any, query: string): boolean {
  const trimmed = query.trim();
  if (!trimmed || !bhajan) return false;

  const fields = getNaradTitleFields(bhajan);
  const queryWords = extractWords(trimmed).filter((w) => w.length >= 2);
  if (queryWords.length === 0) return false;

  return queryWords.some((qWord) =>
    fields.titleWords.some(
      (tWord) =>
        tWord.includes(qWord) ||
        qWord.includes(tWord) ||
        compactMatch(tWord, qWord) ||
        (isLatinQuery(qWord) && (laxLatinWordMatch(qWord, tWord) || fuzzyTitleWordMatch(qWord, tWord))),
    ),
  );
}

function scoreNaradBhajan(bhajan: any, query: string, mode: "strict" | "fuzzy" | "partial"): number {
  let matches = false;
  if (mode === "strict") matches = bhajanStrictTitleMatch(bhajan, query);
  else if (mode === "fuzzy") matches = bhajanFuzzyTitleMatch(bhajan, query);
  else if (mode === "partial") matches = bhajanPartialTitleMatch(bhajan, query);

  if (!matches) return 0;

  let score = 40;
  const fields = getNaradTitleFields(bhajan);
  const queryLower = query.toLowerCase().trim();
  const queryCompact = normalizeSearchText(query);
  const queryWords = extractWords(query).filter((w) => w.length >= 2);

  if (fields.titleHindi.toLowerCase() === queryLower || fields.title.toLowerCase() === queryLower) {
    score += 200;
  } else if (substringMatch(fields.titleHindi, query)) {
    score += 120;
  } else if (substringMatch(fields.title, query)) {
    score += 100;
  }

  if (queryCompact.length >= 2 && fields.titleCompact.includes(queryCompact)) {
    score += 80;
  }

  if (latinQueryMatchesHindiTitle(query, fields.titleHindi)) {
    score += 150;
  }

  for (const variant of expandSearchQueryVariants(query)) {
    if (variant !== query && substringMatch(fields.titleHindi, variant)) score += 90;
    if (variant !== query && fields.titleCompact.includes(normalizeSearchText(variant))) score += 70;
  }

  for (const qWord of queryWords) {
    if (fields.titleWords.some((tWord) => tWord.includes(qWord) || qWord.includes(tWord))) {
      score += 25;
    }
    if (areSynonyms(qWord, fields.title)) score += 20;
  }

  return score;
}

function allowNaradFuzzyFallback(query: string): boolean {
  const trimmed = query.trim();
  if (!trimmed) return false;
  if (containsDevanagari(trimmed)) return trimmed.length >= 3;
  return trimmed.length >= 4;
}

/**
 * Narad AI search: strict title match first; fuzzy title match only if needed and allowed.
 * Results below NARAD_MIN_SCORE are dropped.
 */
export function naradSearchBhajans(query: string, source: any[] = []): any[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const strictMatches = source.filter((bhajan) => bhajanStrictTitleMatch(bhajan, trimmed));
  let candidates = strictMatches;
  let mode: "strict" | "fuzzy" | "partial" = "strict";

  if (candidates.length === 0 && allowNaradFuzzyFallback(trimmed)) {
    candidates = source.filter((bhajan) => bhajanFuzzyTitleMatch(bhajan, trimmed));
    mode = "fuzzy";
  }

  if (candidates.length === 0) {
    candidates = source.filter((bhajan) => bhajanPartialTitleMatch(bhajan, trimmed));
    mode = "partial";
  }

  const scoredBhajans = candidates
    .map((bhajan) => ({
      ...bhajan,
      _searchScore: scoreNaradBhajan(bhajan, trimmed, mode),
    }))
    .filter((b) => b._searchScore >= NARAD_MIN_SCORE)
    .sort((a, b) => b._searchScore - a._searchScore);

  return deduplicateResults(scoredBhajans).map(({ _searchScore, ...rest }) => rest);
}

export function getRelatedBhajans(currentBhajan: any, allBhajans: any[], limit: number = 6): any[] {
  const candidates = allBhajans.filter((b) => b.id !== currentBhajan.id);

  const scored = candidates.map((bhajan) => {
    let score = 0;
    if (bhajan.deityId === currentBhajan.deityId) score += 100;
    if (
      bhajan.singerName &&
      currentBhajan.singerName &&
      bhajan.singerName.toLowerCase() === currentBhajan.singerName.toLowerCase()
    ) {
      score += 80;
    }
    if (bhajan.tags && currentBhajan.tags) {
      const commonTags = bhajan.tags.filter((tag: string) =>
        currentBhajan.tags.some((cTag: string) => calculateSimilarity(tag, cTag) > 70),
      );
      score += Math.min(commonTags.length * 20, 60);
    }
    if (bhajan.language && currentBhajan.language && bhajan.language === currentBhajan.language) {
      score += 30;
    }
    if (bhajan.rating && currentBhajan.rating) {
      score += Math.min((bhajan.rating / 5) * 10, 20);
    }
    score += Math.random() * 5;
    return { ...bhajan, _relationScore: score };
  });

  return scored
    .sort((a, b) => b._relationScore - a._relationScore)
    .slice(0, limit)
    .map(({ _relationScore, ...rest }) => rest);
}
