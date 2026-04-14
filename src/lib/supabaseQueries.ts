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

export interface AdminQueueFilters {
  submittedBy?: string;
  language?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

export interface ReviewSubmissionInput {
  id: number;
  status: 'approved' | 'rejected' | 'changes_requested' | 'archived';
  reason?: string;
  adminNotes?: string;
  actionIp?: string;
  actionUserAgent?: string;
}

export const getPendingSubmissions = async (filters?: AdminQueueFilters) => {
  const client = supabase as any;
  let query = client
    .from('user_uploads')
    .select('id,user_id,title,title_hindi,singer_name,language,deity_id,status,created_at,youtube_url,admin_notes,rejection_reason,request_changes_notes')
    .in('status', ['pending', 'resubmitted'])
    .order('created_at', { ascending: false });

  if (filters?.language && filters.language !== 'All') {
    query = query.eq('language', filters.language);
  }

  if (filters?.status && filters.status !== 'All') {
    query = query.eq('status', filters.status);
  }

  if (filters?.submittedBy) {
    query = query.ilike('singer_name', `%${filters.submittedBy.trim()}%`);
  }

  if (filters?.fromDate) {
    query = query.gte('created_at', filters.fromDate);
  }

  if (filters?.toDate) {
    query = query.lte('created_at', filters.toDate);
  }

  return query;
};

export const getPendingSubmissionsCount = async () => {
  const client = supabase as any;
  const { count, error } = await client
    .from('user_uploads')
    .select('id', { count: 'exact', head: true })
    .in('status', ['pending', 'resubmitted']);

  return { count: count || 0, error };
};

export const reviewSubmission = async (input: ReviewSubmissionInput, adminUserId: string) => {
  const client = supabase as any;
  const now = new Date().toISOString();

  const reviewPatch: Record<string, any> = {
    status: input.status,
    reviewed_at: now,
    reviewed_by: adminUserId,
    admin_notes: input.adminNotes || null,
  };

  if (input.status === 'approved') {
    reviewPatch.approved_at = now;
    reviewPatch.rejection_reason = null;
    reviewPatch.request_changes_notes = null;
    reviewPatch.archived_at = null;
    reviewPatch.archived_by = null;
  }

  if (input.status === 'rejected') {
    reviewPatch.rejection_reason = input.reason || null;
  }

  if (input.status === 'changes_requested') {
    reviewPatch.request_changes_notes = input.reason || null;
  }

  if (input.status === 'archived') {
    reviewPatch.archived_at = now;
    reviewPatch.archived_by = adminUserId;
  }

  const { data, error } = await client
    .from('user_uploads')
    .update(reviewPatch)
    .eq('id', input.id)
    .select('*')
    .single();

  if (!error) {
    await client.from('admin_audit_logs').insert([
      {
        admin_user_id: adminUserId,
        action: input.status,
        entity_type: 'user_upload',
        entity_id: input.id,
        new_status: input.status,
        reason: input.reason || input.adminNotes || null,
        action_ip: input.actionIp || null,
        action_user_agent: input.actionUserAgent || null,
      },
    ]);
  }

  return { data, error };
};

export const restoreArchivedSubmission = async (id: number, adminUserId: string) => {
  const client = supabase as any;
  const { data, error } = await client
    .from('user_uploads')
    .update({
      status: 'pending',
      archived_at: null,
      archived_by: null,
      reviewed_by: adminUserId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  return { data, error };
};

export const getRecentApprovedBhajans = async (limit = 12) => {
  const client = supabase as any;
  return client
    .from('user_uploads')
    .select('*')
    .eq('status', 'approved')
    .order('approved_at', { ascending: false })
    .limit(limit);
};

export const getAdminAuditLogs = async (limit = 100) => {
  const client = supabase as any;
  return client
    .from('admin_audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
};

export const getUserNotifications = async (userId: string) => {
  const client = supabase as any;
  return client
    .from('moderation_notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
};

export const listAdminProfiles = async () => {
  const client = supabase as any;
  return client
    .from('user_profiles')
    .select('id,email,name,role,mfa_enabled,created_at')
    .order('created_at', { ascending: false });
};

export const updateUserRole = async (
  targetUserId: string,
  role: 'user' | 'moderator' | 'admin' | 'super_admin'
) => {
  const client = supabase as any;
  return client
    .from('user_profiles')
    .update({ role })
    .eq('id', targetUserId)
    .select('*')
    .single();
};

export const updateOwnMfaPreference = async (userId: string, mfaEnabled: boolean) => {
  const client = supabase as any;
  return client
    .from('user_profiles')
    .update({ mfa_enabled: mfaEnabled })
    .eq('id', userId)
    .select('*')
    .single();
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
