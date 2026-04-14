import { supabase } from '@/integrations/supabase/client';

export const queryUserUploads = async (options?: { orderBy?: string; limit?: number; includeUnapproved?: boolean }) => {
  const client = supabase as any;
  let query = client
    .from('user_uploads')
    .select('*') as any;

  // Only filter by approved status if not explicitly including unapproved
  if (!options?.includeUnapproved) {
    query = query.or(`status.eq.approved,status.is.null`); // Include null status (legacy data)
  }

  if (options?.orderBy) {
    query = query.order(options.orderBy, { ascending: false });
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  return query;
};

export const getTrendingBhajans = (period: string) => {
  const client = supabase as any;
  const now = new Date();
  let hours = 24;

  switch (period) {
    case 'hourly':
      hours = 1;
      break;
    case 'daily':
      hours = 24;
      break;
    case 'weekly':
      hours = 168;
      break;
    case 'all-time':
      return queryUserUploads({ orderBy: 'play_count', limit: 50 });
  }

  const cutoff = new Date(now.getTime() - hours * 60 * 60 * 1000);
  return client
    .from('user_uploads')
    .select('*')
    .or(`status.eq.approved,status.is.null`)
    .gte('created_at', cutoff.toISOString())
    .order('play_count', { ascending: false });
};

export const searchUserBhajans = async (searchQuery: string, limit: number = 10) => {
  const client = supabase as any;
  const searchTerm = searchQuery.toLowerCase().trim();

  const { data, error } = await client
    .from('user_uploads')
    .select('*')
    .or(`status.eq.approved,status.is.null`)
    .or(
      `title.ilike.%${searchTerm}%,title_hindi.ilike.%${searchTerm}%,singer_name.ilike.%${searchTerm}%,lyrics_hindi.ilike.%${searchTerm}%`
    )
    .limit(limit);

  if (error) {
    console.error('Error searching bhajans:', error);
    return [];
  }

  return data || [];
};

export default queryUserUploads;

// ============= Lyrics Cache Helpers =============

/**
 * Interface for lyrics cache entries
 */
export interface LyricsCacheEntry {
  id: string;
  query: string;
  normalized_query: string;
  title: string;
  artist?: string;
  lyrics: string;
  source: "lrclib" | "lyrics.ovh" | "local" | "user_upload" | "backend_fallback";
  confidence: number;
  created_at: string;
  last_accessed: string;
  access_count: number;
  metadata?: Record<string, any>;
}

/**
 * Search lyrics cache by normalized query
 * @param query The search query to look up
 * @returns Cache entry if found and not expired
 */
export const getLyricsCacheByQuery = async (
  query: string
): Promise<LyricsCacheEntry | null> => {
  const normalized = query.toLowerCase().trim();
  
  const { data, error } = await supabase
    .from("lyrics_cache")
    .select("*")
    .eq("normalized_query", normalized)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Cache query error:", error);
    return null;
  }

  if (data) {
    // Update access tracking
    await supabase.rpc("update_lyrics_cache_access", { cache_id: data.id }).catch(() => {
      // Silent fail - access tracking is not critical
    });
  }

  return (data as LyricsCacheEntry) || null;
};

/**
 * Save lyrics to cache
 * @param entry The lyrics cache entry to save
 * @returns The saved entry with ID
 */
export const saveLyricsCache = async (
  entry: Omit<LyricsCacheEntry, "id" | "created_at" | "last_accessed" | "access_count">
): Promise<LyricsCacheEntry | null> => {
  const normalized = entry.query.toLowerCase().trim();

  const { data, error } = await supabase
    .from("lyrics_cache")
    .insert({
      ...entry,
      normalized_query: normalized,
    })
    .select()
    .single();

  if (error) {
    console.error("Cache save error:", error);
    return null;
  }

  return (data as LyricsCacheEntry) || null;
};

/**
 * Get recently accessed cache entries
 * @param limit Maximum number of entries to return
 * @returns Array of recent cache entries
 */
export const getRecentLyricsCache = async (limit = 10): Promise<LyricsCacheEntry[]> => {
  const { data, error } = await supabase
    .from("lyrics_cache")
    .select("*")
    .order("last_accessed", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Recent cache query error:", error);
    return [];
  }

  return (data as LyricsCacheEntry[]) || [];
};

/**
 * Search cache by title and artist (fuzzy match)
 * @param title Song title to search for
 * @param artist Optional artist name
 * @returns Array of matching cache entries sorted by confidence
 */
export const searchLyricsCache = async (
  title: string,
  artist?: string
): Promise<LyricsCacheEntry[]> => {
  const normalizedTitle = title.toLowerCase().trim();

  let query = supabase
    .from("lyrics_cache")
    .select("*")
    .ilike("title", `%${title}%`);

  if (artist) {
    query = query.ilike("artist", `%${artist}%`);
  }

  const { data, error } = await query
    .order("confidence", { ascending: false })
    .order("last_accessed", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Cache search error:", error);
    return [];
  }

  return (data as LyricsCacheEntry[]) || [];
};

/**
 * Delete expired cache entries
 * @returns Number of entries deleted
 */
export const cleanupExpiredLyricsCache = async (): Promise<number> => {
  const { data, error } = await supabase.rpc("cleanup_expired_lyrics_cache");

  if (error) {
    console.error("Cache cleanup error:", error);
    return 0;
  }

  return Array.isArray(data) ? data.length : 0;
};
