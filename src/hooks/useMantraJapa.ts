/**
 * useMantraJapa — React hook for the Mantra Japa dashboard.
 *
 * Strategy:
 * - If user is authenticated → fetch from Supabase (primary)
 * - If user is NOT authenticated → fall back to localStorage (guest mode)
 * - Uses TanStack React Query for caching/refetching
 */
import { useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchMantras,
  fetchUserTotals,
  fetchTodaySessions,
  fetchUserSankalpas,
  addSankalp,
  setActiveSankalp,
  deleteSankalp,
  completeJapSession,
  computeAggregatedStats,
  type Mantra,
  type JapTotal,
  type JapSession,
  type UserSankalp,
  type AggregatedStats,
  type CompleteSessionResult,
} from "@/lib/mantraJapa/mantraJapaApi";
import {
  loadDevotionProgress,
  loadMantraJapaStats,
  completeJapaSession as localCompleteSession,
  type DevotionProgress,
  type MantraJapaStatsMap,
} from "@/lib/devotion/devotionStorage";

// ─── Image Mapping (local images for each deity) ──────────────────
import omImage from "@/pages/images/om.webp";
import deityShiva from "@/assets/deities/shiva.webp";
import deityKrishna from "@/assets/deities/krishna.webp";
import deityRama from "@/assets/deities/rama.webp";
import shivWallpaper from "@/pages/images/shiv_wallpaper.webp";

const DEITY_IMAGE_MAP: Record<string, string> = {
  shiva: shivWallpaper,
  krishna: deityKrishna,
  rama: deityRama,
  vishnu: deityRama, // fallback
};

const MANTRA_ENGLISH_IMAGE_MAP: Record<string, string> = {
  "Om Chanting": omImage,
  "Om Namah Shivaya": shivWallpaper,
  "Mahamrityunjaya Mantra": shivWallpaper,
  "Hare Krishna Mahamantra": deityKrishna,
  "Jai Shree Ram": deityRama,
};

/** Resolve the image for a mantra — prefers DB image_url, then local mapping */
export function resolveMantraImage(mantra: Mantra): string | undefined {
  if (mantra.image_url) return mantra.image_url;
  return MANTRA_ENGLISH_IMAGE_MAP[mantra.name_english] ?? DEITY_IMAGE_MAP[mantra.deity ?? ""] ?? undefined;
}

// ─── Query Keys ───────────────────────────────────────────────────
const KEYS = {
  mantras: ["mantras"] as const,
  userTotals: (uid: string) => ["jap-totals", uid] as const,
  todaySessions: (uid: string) => ["jap-today", uid] as const,
  sankalpas: (uid: string) => ["sankalpas", uid] as const,
};

// ─── Guest mode localStorage helpers ──────────────────────────────
function guestGetStats(): AggregatedStats {
  const progress = loadDevotionProgress();
  const mantraStats = loadMantraJapaStats();
  const logsRaw = localStorage.getItem("hari_kirtan_meditation_logs_v1");
  let todayChants = 0;
  if (logsRaw) {
    try {
      const logs = JSON.parse(logsRaw) as any[];
      const today = new Date().toISOString().slice(0, 10);
      todayChants = logs
        .filter((l: any) => l.completed && l.completedAt?.slice(0, 10) === today && l.japaCount)
        .reduce((sum: number, l: any) => sum + (l.japaCount || 0), 0);
    } catch { /* ignore */ }
  }

  return {
    totalChants: progress.totalJapaCount,
    totalSessions: Object.values(mantraStats).reduce((s, m) => s + (m?.totalChants ? 1 : 0), 0),
    totalMalas: Math.floor(progress.totalJapaCount / 108),
    currentStreak: progress.currentStreak,
    longestStreak: progress.longestStreak,
    todayChants,
  };
}

function guestGetMantraStats(): MantraJapaStatsMap {
  return loadMantraJapaStats();
}

function guestGetSankalpas(): string[] {
  try {
    const saved = localStorage.getItem("hari_kirtan_custom_sankalps_v1");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function guestGetActiveSankalp(): string {
  return localStorage.getItem("hari_kirtan_active_sankalp_v1") || "";
}

// ─── Main Hook ────────────────────────────────────────────────────
export function useMantraJapa() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const isGuest = !userId;
  const queryClient = useQueryClient();

  // ── 1. Mantras (always from Supabase, public) ──────────────────
  const mantrasQuery = useQuery({
    queryKey: KEYS.mantras,
    queryFn: fetchMantras,
    staleTime: 10 * 60_000, // 10 minutes
    retry: 2,
  });

  // ── 2. User Totals (Supabase when authed) ──────────────────────
  const totalsQuery = useQuery({
    queryKey: KEYS.userTotals(userId ?? "guest"),
    queryFn: () => (userId ? fetchUserTotals(userId) : Promise.resolve([])),
    enabled: !!userId,
    staleTime: 30_000,
  });

  // ── 3. Today's Sessions ────────────────────────────────────────
  const todayQuery = useQuery({
    queryKey: KEYS.todaySessions(userId ?? "guest"),
    queryFn: () => (userId ? fetchTodaySessions(userId) : Promise.resolve([])),
    enabled: !!userId,
    staleTime: 15_000,
  });

  // ── 4. Sankalpas ───────────────────────────────────────────────
  const sankalpasQuery = useQuery({
    queryKey: KEYS.sankalpas(userId ?? "guest"),
    queryFn: () => (userId ? fetchUserSankalpas(userId) : Promise.resolve([])),
    enabled: !!userId,
    staleTime: 60_000,
  });

  // ── Aggregated Stats ───────────────────────────────────────────
  const stats: AggregatedStats = useMemo(() => {
    if (isGuest) return guestGetStats();
    return computeAggregatedStats(totalsQuery.data ?? [], todayQuery.data ?? []);
  }, [isGuest, totalsQuery.data, todayQuery.data]);

  // ── Per-mantra totals map ──────────────────────────────────────
  const mantraTotalsMap = useMemo(() => {
    const map: Record<string, JapTotal> = {};
    (totalsQuery.data ?? []).forEach((t) => {
      map[t.mantra_id] = t;
    });
    return map;
  }, [totalsQuery.data]);

  // ── Complete Session Mutation ───────────────────────────────────
  const completeSessionMutation = useMutation({
    mutationFn: async (params: {
      mantraId: string;
      mantraLabel: string;
      sankalp: string;
      targetCount: number;
      actualCount: number;
      durationSeconds: number;
    }) => {
      if (isGuest) {
        // Guest mode: use localStorage
        localCompleteSession(
          {
            mantra: params.mantraLabel,
            sankalp: params.sankalp,
            targetCount: params.actualCount,
            completedAt: new Date().toISOString(),
          },
          new Date(),
          params.mantraId
        );
        return null;
      }
      return completeJapSession({
        userId: userId!,
        mantraId: params.mantraId,
        sankalp: params.sankalp,
        targetCount: params.targetCount,
        actualCount: params.actualCount,
        durationSeconds: params.durationSeconds,
      });
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: KEYS.userTotals(userId) });
        queryClient.invalidateQueries({ queryKey: KEYS.todaySessions(userId) });
      }
    },
  });

  // ── Sankalp Mutations ──────────────────────────────────────────
  const addSankalpMutation = useMutation({
    mutationFn: (text: string) => {
      if (isGuest) {
        const existing = guestGetSankalpas();
        if (!existing.includes(text)) {
          const updated = [text, ...existing].slice(0, 10);
          localStorage.setItem("hari_kirtan_custom_sankalps_v1", JSON.stringify(updated));
        }
        localStorage.setItem("hari_kirtan_active_sankalp_v1", text);
        return Promise.resolve(null);
      }
      return addSankalp(userId!, text, true);
    },
    onSuccess: () => {
      if (userId) queryClient.invalidateQueries({ queryKey: KEYS.sankalpas(userId) });
    },
  });

  const activateSankalpMutation = useMutation({
    mutationFn: (sankalpId: string) => {
      if (isGuest) {
        // In guest mode, sankalpId is actually the text
        localStorage.setItem("hari_kirtan_active_sankalp_v1", sankalpId);
        return Promise.resolve();
      }
      return setActiveSankalp(userId!, sankalpId);
    },
    onSuccess: () => {
      if (userId) queryClient.invalidateQueries({ queryKey: KEYS.sankalpas(userId) });
    },
  });

  const deleteSankalpMutation = useMutation({
    mutationFn: (sankalpId: string) => {
      if (isGuest) {
        const existing = guestGetSankalpas();
        const updated = existing.filter((s) => s !== sankalpId);
        localStorage.setItem("hari_kirtan_custom_sankalps_v1", JSON.stringify(updated));
        return Promise.resolve();
      }
      return deleteSankalp(userId!, sankalpId);
    },
    onSuccess: () => {
      if (userId) queryClient.invalidateQueries({ queryKey: KEYS.sankalpas(userId) });
    },
  });

  // ── Refresh all data ───────────────────────────────────────────
  const refresh = useCallback(() => {
    if (userId) {
      queryClient.invalidateQueries({ queryKey: KEYS.userTotals(userId) });
      queryClient.invalidateQueries({ queryKey: KEYS.todaySessions(userId) });
      queryClient.invalidateQueries({ queryKey: KEYS.sankalpas(userId) });
    }
  }, [userId, queryClient]);

  return {
    // Data
    mantras: mantrasQuery.data ?? [],
    mantrasLoading: mantrasQuery.isLoading,
    mantrasError: mantrasQuery.error,
    stats,
    mantraTotalsMap,
    sankalpas: sankalpasQuery.data ?? [],
    isGuest,
    userId,

    // Mutations
    completeSession: completeSessionMutation.mutateAsync,
    isCompletingSession: completeSessionMutation.isPending,
    addSankalp: addSankalpMutation.mutateAsync,
    activateSankalp: activateSankalpMutation.mutateAsync,
    deleteSankalpFn: deleteSankalpMutation.mutateAsync,

    // Utils
    refresh,
    resolveMantraImage,
  };
}
