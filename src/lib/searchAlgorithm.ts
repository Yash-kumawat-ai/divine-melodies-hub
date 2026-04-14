/**
 * Advanced Search Utility
 * Provides intelligent search with fuzzy matching, lyric searching, and deduplication
 */

// Levenshtein distance algorithm for fuzzy matching (finds similar words)
function levenshteinDistance(str1: string, str2: string): number {
  const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null)
  );

  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }

  return track[str2.length][str1.length];
}

// Calculate similarity score between two strings (0-100)
function calculateSimilarity(str1: string, str2: string): number {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 100;
  
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  const similarity = ((maxLen - distance) / maxLen) * 100;
  return Math.max(0, similarity);
}

// Extract words from text (works with both English and Hindi)
function extractWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2); // Only words longer than 2 chars
}

// Common synonyms mapping for Hindi/devotional terms
const synonymMap: { [key: string]: string[] } = {
  'hare': ['hari', 'haraye', 'harey', 'hareesh'],
  'krishna': ['kanha', 'kanhaiya', 'kishan', 'govind', 'gopal', 'hari'],
  'rama': ['ram', 'ramachandra', 'raghupath', 'raghunath'],
  'shiva': ['shiv', 'mahadev', 'bholenath', 'neelkant'],
  'durga': ['devi', 'mata', 'maa', 'goddess', 'shakti'],
  'hanuman': ['hanumanji', 'bajrangbali', 'vanar'],
  'sakti': ['shakti', 'energy', 'power', 'devi'],
  'pyar': ['prem', 'love', 'bhakti', 'devotion'],
  'bhakti': ['devotion', 'prem', 'pyar', 'shraddha'],
  'geet': ['song', 'bhajan', 'gana', 'sangeet'],
  'sahara': ['shelter', 'support', 'asha', 'hope', 'aashray'],
};

// Check if two words are synonyms
function areSynonyms(word1: string, word2: string): boolean {
  const word1Lower = word1.toLowerCase();
  const word2Lower = word2.toLowerCase();

  if (word1Lower === word2Lower) return true;

  // Check if they're in the synonym map
  for (const [key, synonyms] of Object.entries(synonymMap)) {
    if (word1Lower === key && synonyms.includes(word2Lower)) return true;
    if (word2Lower === key && synonyms.includes(word1Lower)) return true;
  }

  // If similarity is high enough, consider them synonyms
  return calculateSimilarity(word1, word2) > 80;
}

// Score a bhajan based on search query relevance
function scoreBhajan(bhajan: any, query: string): number {
  let score = 0;
  const queryWords = extractWords(query);
  const queryLower = query.toLowerCase();

  // Exact title match - highest priority
  if (bhajan.title.toLowerCase() === queryLower) score += 100;
  // Title contains exact query
  else if (bhajan.title.toLowerCase().includes(queryLower)) score += 80;

  // Title Hindi match
  if (bhajan.titleHindi.includes(query)) score += 75;

  // Singer name match
  if (bhajan.singerName.toLowerCase().includes(queryLower)) score += 60;

  // Match individual words in title (fuzzy)
  const titleWords = extractWords(bhajan.title);
  for (const qWord of queryWords) {
    for (const tWord of titleWords) {
      const similarity = calculateSimilarity(qWord, tWord);
      if (similarity > 75) {
        score += similarity * 0.6; // Weight word similarity
      }
      // Check for synonyms
      if (areSynonyms(qWord, tWord)) {
        score += 55;
      }
    }
  }

  // Search in lyrics - crucial for finding relevant songs
  const lyricsWords = extractWords(bhajan.lyricsHindi + ' ' + bhajan.lyricsTransliteration);
  let lyricsMatchCount = 0;
  for (const qWord of queryWords) {
    for (const lWord of lyricsWords) {
      const similarity = calculateSimilarity(qWord, lWord);
      if (similarity > 80) {
        lyricsMatchCount++;
        score += similarity * 0.4; // Weight lyrics matches less than title
      }
      if (areSynonyms(qWord, lWord)) {
        lyricsMatchCount++;
        score += 40;
      }
    }
  }

  // Bonus for multiple word matches in lyrics
  if (lyricsMatchCount > 1) {
    score += lyricsMatchCount * 10;
  }

  // Tags match
  if (bhajan.tags.some(tag => 
    queryWords.some(qWord => areSynonyms(qWord, tag))
  )) {
    score += 30;
  }

  return score;
}

// Remove duplicate/similar bhajans from results
function deduplicateResults(bhajans: any[]): any[] {
  const seen: Set<number> = new Set();
  const result: any[] = [];

  // Group bhajans by similarity
  for (let i = 0; i < bhajans.length; i++) {
    if (seen.has(bhajans[i].id)) continue;

    result.push(bhajans[i]);
    seen.add(bhajans[i].id);

    // Mark similar bhajans as duplicates
    for (let j = i + 1; j < bhajans.length; j++) {
      if (seen.has(bhajans[j].id)) continue;

      // If two bhajans have very similar titles or lyrics, consider them duplicates
      const titleSimilarity = calculateSimilarity(bhajans[i].title, bhajans[j].title);
      const lyricsSimilarity = calculateSimilarity(
        bhajans[i].lyricsHindi.substring(0, 100),
        bhajans[j].lyricsHindi.substring(0, 100)
      );

      if (titleSimilarity > 85 || lyricsSimilarity > 90) {
        seen.add(bhajans[j].id);
      }
    }
  }

  return result;
}

// Main search function
export function smartSearchBhajans(query: string, source: any[] = []): any[] {
  if (!query.trim()) return [];

  // Score all bhajans
  const scoredBhajans = source
    .map(bhajan => ({
      ...bhajan,
      _searchScore: scoreBhajan(bhajan, query)
    }))
    .filter(b => b._searchScore > 0) // Only keep results with positive score
    .sort((a, b) => b._searchScore - a._searchScore); // Sort by relevance

  // Remove duplicates and cleanup
  const deduplicated = deduplicateResults(scoredBhajans);
  
  // Remove the score property before returning
  return deduplicated.map(({ _searchScore, ...rest }) => rest);
}

/**
 * Get related/recommended bhajans based on the current bhajan
 * Prioritizes by: deity > singer > mood/tags > language > popularity
 */
export function getRelatedBhajans(
  currentBhajan: any,
  allBhajans: any[],
  limit: number = 6
): any[] {
  // Exclude the current bhajan
  const candidates = allBhajans.filter(b => b.id !== currentBhajan.id);

  // Score related bhajans
  const scored = candidates.map(bhajan => {
    let score = 0;

    // Same deity (highest priority) - 100 points
    if (bhajan.deityId === currentBhajan.deityId) {
      score += 100;
    }

    // Same singer (priority 2) - 80 points
    if (
      bhajan.singerName &&
      currentBhajan.singerName &&
      bhajan.singerName.toLowerCase() === currentBhajan.singerName.toLowerCase()
    ) {
      score += 80;
    }

    // Similar mood/tags (priority 3) - up to 60 points
    if (bhajan.tags && currentBhajan.tags) {
      const commonTags = bhajan.tags.filter(tag =>
        currentBhajan.tags.some(cTag => calculateSimilarity(tag, cTag) > 70)
      );
      score += Math.min(commonTags.length * 20, 60);
    }

    // Same language (if available) - 30 points
    if (bhajan.language && currentBhajan.language && bhajan.language === currentBhajan.language) {
      score += 30;
    }

    // By popularity (rating * play count) - fallback recommendation - up to 20 points
    if (bhajan.rating && currentBhajan.rating) {
      const popularityScore = (bhajan.rating / 5) * 10; // Normalize to 10 points
      score += Math.min(popularityScore, 20);
    }

    // Small random factor to vary results (up to 5 points)
    score += Math.random() * 5;

    return { ...bhajan, _relationScore: score };
  });

  // Sort by relation score and return top results
  return scored
    .sort((a, b) => b._relationScore - a._relationScore)
    .slice(0, limit)
    .map(({ _relationScore, ...rest }) => rest);
}
