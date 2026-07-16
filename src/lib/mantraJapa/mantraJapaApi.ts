/**
 * Mantra Japa — Supabase API layer
 *
 * Provides all CRUD operations for mantra japa feature.
 * Falls back to localStorage when user is not authenticated.
 */
import { supabase } from "@/lib/supabaseClient";

// ─── Types ────────────────────────────────────────────────────────────
export interface Mantra {
  id: string;
  name_hindi: string;
  name_english: string;
  deity: string | null;
  description_hindi: string | null;
  description_english: string | null;
  meaning_hindi: string | null;
  meaning_english: string | null;
  full_text_hindi: string;
  transliteration: string | null;
  image_url: string | null;
  audio_url: string | null;
  recommended_counts: number[] | null;
  sort_order: number;
  is_active: boolean;
}

export interface JapSession {
  id: string;
  user_id: string;
  mantra_id: string;
  sankalp: string | null;
  target_count: number;
  actual_count: number;
  duration_seconds: number;
  completed: boolean;
  started_at: string;
  completed_at: string | null;
}

export interface JapTotal {
  id: string;
  user_id: string;
  mantra_id: string;
  total_chants: number;
  total_sessions: number;
  total_malas: number;
  last_session_at: string | null;
  current_streak: number;
  longest_streak: number;
  last_streak_date: string | null;
}

export interface UserSankalp {
  id: string;
  user_id: string;
  text: string;
  is_custom: boolean;
  is_active: boolean;
  used_count: number;
  created_at: string;
}

export interface CompleteSessionResult {
  session_id: string;
  total_chants: number;
  total_sessions: number;
  total_malas: number;
  current_streak: number;
  longest_streak: number;
}

export interface AggregatedStats {
  totalChants: number;
  totalSessions: number;
  totalMalas: number;
  currentStreak: number;  // Max streak across all mantras
  longestStreak: number;
  todayChants: number;
}

// ─── API Functions ────────────────────────────────────────────────────

/** Fetch all active mantras (public, no auth needed) */
export async function fetchMantras(): Promise<Mantra[]> {
  const { data, error } = await supabase
    .from("mantras")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Mantra[];
}

/** Fetch user's jap totals for all mantras */
export async function fetchUserTotals(userId: string): Promise<JapTotal[]> {
  const { data, error } = await supabase
    .from("user_jap_totals")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;
  return (data ?? []) as JapTotal[];
}

/** Fetch user's recent jap sessions (last N) */
export async function fetchUserSessions(userId: string, limit = 50): Promise<JapSession[]> {
  const { data, error } = await supabase
    .from("user_jap_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as JapSession[];
}

/** Fetch today's sessions for the user */
export async function fetchTodaySessions(userId: string): Promise<JapSession[]> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("user_jap_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("completed", true)
    .gte("completed_at", todayStart.toISOString())
    .order("completed_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as JapSession[];
}

/** Complete a jap session via RPC (handles session + totals + streak atomically) */
export async function completeJapSession(params: {
  userId: string;
  mantraId: string;
  sankalp?: string;
  targetCount: number;
  actualCount: number;
  durationSeconds: number;
  groupId?: string | null;
}): Promise<CompleteSessionResult> {
  const { data, error } = await supabase.rpc("complete_jap_session", {
    p_user_id: params.userId,
    p_mantra_id: params.mantraId,
    p_sankalp: params.sankalp || null,
    p_target_count: params.targetCount,
    p_actual_count: params.actualCount,
    p_duration_seconds: params.durationSeconds,
  });

  if (error) throw error;
  
  const result = data as CompleteSessionResult;

  // If a groupId is specified, associate the session with the group (fires trigger safely via single update)
  if (params.groupId && result.session_id) {
    try {
      const { error: updateErr } = await supabase
        .from("user_jap_sessions")
        .update({
          group_id: params.groupId
        })
        .eq("id", result.session_id);

      if (updateErr) throw updateErr;
    } catch (err) {
      console.error("Failed to scope jap session to group:", err);
    }
  }

  return result;
}

/** Fetch user's sankalpas */
export async function fetchUserSankalpas(userId: string): Promise<UserSankalp[]> {
  const { data, error } = await supabase
    .from("user_sankalpas")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as UserSankalp[];
}

/** Add a new sankalp */
export async function addSankalp(userId: string, text: string, isCustom = true): Promise<UserSankalp> {
  const { data, error } = await supabase
    .from("user_sankalpas")
    .upsert(
      { user_id: userId, text, is_custom: isCustom, is_active: true, used_count: 0 },
      { onConflict: "user_id,text" }
    )
    .select()
    .single();

  if (error) throw error;
  return data as UserSankalp;
}

/** Set a sankalp as active (deactivate others) */
export async function setActiveSankalp(userId: string, sankalpId: string): Promise<void> {
  // Deactivate all
  await supabase
    .from("user_sankalpas")
    .update({ is_active: false })
    .eq("user_id", userId);

  // Activate selected
  const { error } = await supabase
    .from("user_sankalpas")
    .update({ is_active: true })
    .eq("id", sankalpId)
    .eq("user_id", userId);

  if (error) throw error;
}

/** Delete a custom sankalp */
export async function deleteSankalp(userId: string, sankalpId: string): Promise<void> {
  const { error } = await supabase
    .from("user_sankalpas")
    .delete()
    .eq("id", sankalpId)
    .eq("user_id", userId);

  if (error) throw error;
}

/** Increment sankalp used_count */
export async function incrementSankalpUsage(userId: string, sankalpId: string): Promise<void> {
  // Try raw SQL increment via RPC first
  const { error } = await supabase.rpc("increment_sankalp_usage" as any, {
    p_sankalp_id: sankalpId,
    p_user_id: userId,
  });

  // Fallback if the RPC fails or function is not found
  if (error) {
    const { data } = await supabase
      .from("user_sankalpas")
      .select("used_count")
      .eq("id", sankalpId)
      .single();

    if (data) {
      await supabase
        .from("user_sankalpas")
        .update({ used_count: (data.used_count || 0) + 1 })
        .eq("id", sankalpId);
    }
  }
}

/** Compute aggregated stats across all mantras for a user */
export function computeAggregatedStats(totals: JapTotal[], todaySessions: JapSession[]): AggregatedStats {
  const totalChants = totals.reduce((sum, t) => sum + (t.total_chants || 0), 0);
  const totalSessions = totals.reduce((sum, t) => sum + (t.total_sessions || 0), 0);
  const totalMalas = totals.reduce((sum, t) => sum + (t.total_malas || 0), 0);
  const currentStreak = totals.reduce((max, t) => Math.max(max, t.current_streak || 0), 0);
  const longestStreak = totals.reduce((max, t) => Math.max(max, t.longest_streak || 0), 0);
  const todayChants = todaySessions.reduce((sum, s) => sum + (s.actual_count || 0), 0);

  return { totalChants, totalSessions, totalMalas, currentStreak, longestStreak, todayChants };
}

export interface LeaderboardRanking {
  rank: number;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_chants: number;
}

/** Fetch rankings using standard client-side queries to avoid any database RPC issues/404s */
export async function fetchLeaderboardRankings(
  viewerId?: string
): Promise<LeaderboardRanking[]> {
  try {
    // 1. Fetch user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("user_profiles")
      .select("id, name, avatar_url");

    if (profilesError) {
      console.error("Error fetching user_profiles:", profilesError);
      return [];
    }

    // 2. Fetch all Japa totals
    const { data: totals, error: totalsError } = await supabase
      .from("user_jap_totals")
      .select("user_id, total_chants");

    if (totalsError) {
      console.error("Error fetching user_jap_totals:", totalsError);
      return [];
    }

    // 3. Aggregate totals by user_id
    const totalsByUser: Record<string, number> = {};
    if (totals) {
      for (const t of totals) {
        if (t.user_id) {
          totalsByUser[t.user_id] = (totalsByUser[t.user_id] || 0) + (t.total_chants || 0);
        }
      }
    }

    // 4. Combine profile info and total chants (default to 0 for no chants)
    const devotees = (profiles ?? []).map((p) => ({
      user_id: p.id,
      display_name: p.name || "Unknown Devotee",
      avatar_url: p.avatar_url || null,
      total_chants: totalsByUser[p.id] || 0,
    }));

    // 5. Sort devotees (descending by total_chants, then alphabetical by name)
    devotees.sort((a, b) => {
      if (b.total_chants !== a.total_chants) {
        return b.total_chants - a.total_chants;
      }
      return a.display_name.localeCompare(b.display_name);
    });

    // 6. Calculate Dense Ranks
    let currentRank = 1;
    let prevChants = -1;
    const rankedDevotees: LeaderboardRanking[] = devotees.map((dev, idx) => {
      if (idx === 0) {
        prevChants = dev.total_chants;
      } else if (dev.total_chants < prevChants) {
        currentRank++;
        prevChants = dev.total_chants;
      }
      return {
        rank: currentRank,
        user_id: dev.user_id,
        display_name: dev.display_name,
        avatar_url: dev.avatar_url,
        total_chants: dev.total_chants,
      };
    });

    // 7. Filter: Top 10 devotees OR the current viewer's record
    return rankedDevotees.filter(
      (r) => r.rank <= 10 || r.user_id === viewerId
    );
  } catch (err) {
    console.error("Critical error in fetchLeaderboardRankings:", err);
    return [];
  }
}
