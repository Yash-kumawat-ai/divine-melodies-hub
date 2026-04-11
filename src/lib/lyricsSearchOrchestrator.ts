/**
 * Lyrics Search Orchestrator
 * 
 * Deterministic fallback pipeline for lyrics retrieval:
 * 1. Local app search (bhajans.ts + user uploads)
 * 2. History cache (persisted successful lookups)
 * 3. Free API providers (LRCLib, Lyrics.ovh)
 * 4. Backend web fallback (optional, server-controlled)
 */

import { fetchGlobalLyricsWithSource } from '@/lib/globalLyrics';
import {
  getLyricsCacheByQuery,
  saveLyricsCache,
  searchLyricsCache,
  LyricsCacheEntry,
} from '@/lib/supabaseQueries';
import { smartSearchBhajans } from '@/lib/searchAlgorithm';
import bhajans from '@/data/bhajans';

export interface OrchestrationResult {
  lyrics: string;
  source: 'local' | 'cache' | 'lrclib' | 'lyrics.ovh' | 'backend_fallback' | null;
  title?: string;
  artist?: string;
  confidence?: number; // 0-1 score
  cached?: boolean; // Whether this was retrieved from cache
  searchQuery?: string; // What was searched for
}

/**
 * Search local bhajans by title or lyrics keyword
 * Returns matched bhajan lyrics if found
 */
async function searchLocalBhajans(query: string): Promise<OrchestrationResult | null> {
  try {
    const results = smartSearchBhajans(query);
    
    if (results.length > 0) {
      const match = results[0];
      return {
        lyrics: match.lyrics || '',
        source: 'local',
        title: match.title,
        artist: match.singer,
        confidence: Math.min(match.score / 100, 1), // Normalize score to 0-1
        searchQuery: query,
      };
    }
  } catch (error) {
    console.error('Local bhajan search error:', error);
  }

  return null;
}

/**
 * Search persisted cache for previous lookups
 * Fast path for repeated searches
 */
async function searchCache(query: string): Promise<OrchestrationResult | null> {
  try {
    // Try exact query match first
    const cacheEntry = await getLyricsCacheByQuery(query);
    
    if (cacheEntry && !isExpired(cacheEntry)) {
      return {
        lyrics: cacheEntry.lyrics,
        source: cacheEntry.source as any,
        title: cacheEntry.title,
        artist: cacheEntry.artist,
        confidence: cacheEntry.confidence,
        cached: true,
        searchQuery: query,
      };
    }

    // Try fuzzy title search
    const fuzzyMatches = await searchLyricsCache(query);
    if (fuzzyMatches.length > 0) {
      const match = fuzzyMatches[0];
      if (!isExpired(match)) {
        // Update access tracking
        await getLyricsCacheByQuery(query).catch(() => {});
        
        return {
          lyrics: match.lyrics,
          source: match.source as any,
          title: match.title,
          artist: match.artist,
          confidence: match.confidence,
          cached: true,
          searchQuery: query,
        };
      }
    }
  } catch (error) {
    console.error('Cache search error:', error);
  }

  return null;
}

/**
 * Search free API providers (LRCLib, Lyrics.ovh)
 */
async function searchFreeAPIs(query: string): Promise<OrchestrationResult | null> {
  try {
    const result = await fetchGlobalLyricsWithSource(query);
    
    if (result.lyrics) {
      // Attempt to cache the result
      await saveLyricsCache({
        query,
        title: query, // Use query as title since we don't have parsed info
        lyrics: result.lyrics,
        source: result.source as any,
        confidence: 0.8, // APIs are generally reliable but not perfect
      }).catch(() => {
        // Silent fail on cache save
      });

      return {
        lyrics: result.lyrics,
        source: result.source as any,
        confidence: 0.8,
        searchQuery: query,
      };
    }
  } catch (error) {
    console.error('Free API search error:', error);
  }

  return null;
}

/**
 * Check if a cache entry is expired based on TTL
 */
function isExpired(entry: LyricsCacheEntry): boolean {
  const createdAt = new Date(entry.created_at);
  const ttlMs = (entry.ttl_seconds || 2592000) * 1000; // Default 30 days
  const now = new Date();
  
  return now.getTime() - createdAt.getTime() > ttlMs;
}

/**
 * Main orchestration function
 * Executes fallback pipeline in order until lyrics found
 */
export async function orchestrateLyricsSearch(
  query: string,
  options?: {
    skipLocal?: boolean;
    skipCache?: boolean;
    skipAPIs?: boolean;
  }
): Promise<OrchestrationResult> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return {
      lyrics: '',
      source: null,
      searchQuery: query,
    };
  }

  // Phase 1: Local app search
  if (!options?.skipLocal) {
    const localResult = await searchLocalBhajans(trimmedQuery);
    if (localResult) {
      return localResult;
    }
  }

  // Phase 2: History cache search
  if (!options?.skipCache) {
    const cacheResult = await searchCache(trimmedQuery);
    if (cacheResult) {
      return cacheResult;
    }
  }

  // Phase 3: Free API search (LRCLib, Lyrics.ovh)
  if (!options?.skipAPIs) {
    const apiResult = await searchFreeAPIs(trimmedQuery);
    if (apiResult) {
      return apiResult;
    }
  }

  // Phase 4: No results found
  return {
    lyrics: '',
    source: null,
    searchQuery: query,
  };
}

/**
 * Check if lyrics are available without fetching
 * Used for UI state management
 */
export async function checkLyricsAvailability(query: string): Promise<boolean> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return false;
  }

  // Check local
  const localResults = smartSearchBhajans(trimmedQuery);
  if (localResults.length > 0) {
    return true;
  }

  // Check cache
  try {
    const cacheResult = await getLyricsCacheByQuery(trimmedQuery);
    if (cacheResult && !isExpired(cacheResult)) {
      return true;
    }
  } catch {
    // Continue
  }

  return false;
}

/**
 * Get search suggestions from local data and cache
 * Used for autocomplete
 */
export async function getLyricsSuggestions(
  prefix: string,
  limit = 5
): Promise<string[]> {
  const suggestions = new Set<string>();

  try {
    // Add local bhajan suggestions
    const localResults = smartSearchBhajans(prefix);
    localResults.slice(0, limit).forEach(b => {
      suggestions.add(b.title || '');
    });

    // Add cache suggestions
    if (suggestions.size < limit) {
      const recent = await searchLyricsCache(prefix);
      recent.slice(0, limit - suggestions.size).forEach(entry => {
        suggestions.add(entry.title);
      });
    }
  } catch (error) {
    console.error('Suggestions error:', error);
  }

  return Array.from(suggestions).slice(0, limit);
}
