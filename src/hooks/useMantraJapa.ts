/**
 * useMantraJapa — React hook for the Mantra Japa dashboard.
 *
 * Strategy:
 * - If user is authenticated → fetch from Supabase (primary)
 * - If user is NOT authenticated → fall back to localStorage (guest mode)
 * - Uses TanStack React Query for caching/refetching
 */
import { useCallback, useMemo, useState, useEffect } from "react";
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
import deityShiva from "@/pages/images/shiva.webp";
import deityKrishna from "@/pages/images/krishna.webp";
import deityRama from "@/pages/images/rama.webp";
import deityGanesh from "@/pages/images/ganesh.webp";
import deityDurga from "@/pages/images/durga.webp";
import deityLakshmi from "@/pages/images/lakshmi.webp";
import deityHanuman from "@/pages/images/hanuman.webp";
import deityRadhaKrishna from "@/pages/images/deity-radha-krishna.webp";

const DEITY_IMAGE_MAP: Record<string, string> = {
  shiva: deityShiva,
  krishna: deityKrishna,
  rama: deityRama,
  vishnu: deityRama, // fallback
  ganesh: deityGanesh,
  hanuman: deityHanuman,
  lakshmi: deityLakshmi,
  durga: deityDurga,
};

const MANTRA_ENGLISH_IMAGE_MAP: Record<string, string> = {
  "Om Chanting": omImage,
  "Om Namah Shivaya": deityShiva,
  "Mahamrityunjaya Mantra": deityShiva,
  "Hare Krishna Mahamantra": deityKrishna,
  "Radhe Radhe": deityRadhaKrishna,
  "Jai Shree Ram": deityRama,
  "Om Namo Narayanaya": deityRama,
  "Gayatri Mantra": deityDurga,
  "Shri Ganesha Mantra": deityGanesh,
};

const DEFAULT_MANTRAS: Mantra[] = [
  {
    id: "om",
    name_hindi: "ॐ",
    name_english: "Om Chanting",
    deity: "shiva",
    description_hindi: "ॐ सृष्टि की मूल ध्वनि है।",
    description_english: "Om is the primordial sound of the universe.",
    meaning_hindi: "ॐ सृष्टि की मूल ध्वनि है, जो ब्रह्मांड की चेतना और परम सत्य का प्रतीक है।",
    meaning_english: "Om is the primordial sound of the universe, representing cosmic consciousness and absolute truth.",
    full_text_hindi: "ॐ",
    transliteration: "Om / Aum",
    image_url: null,
    audio_url: null,
    recommended_counts: [108, 1008],
    sort_order: 1,
    is_active: true
  },
  {
    id: "om_namah_shivaya",
    name_hindi: "ॐ नमः शिवाय",
    name_english: "Om Namah Shivaya",
    deity: "shiva",
    description_hindi: "भगवान शिव का अत्यंत प्रभावशाली मंत्र।",
    description_english: "The most powerful and sacred mantra dedicated to Lord Shiva.",
    meaning_hindi: "मैं भगवान शिव को नमन करता हूं, जो समस्त चेतना के स्रोत हैं।",
    meaning_english: "I bow to Lord Shiva, the source of all consciousness.",
    full_text_hindi: "ॐ नमः शिवाय",
    transliteration: "Om Namah Shivaya",
    image_url: null,
    audio_url: null,
    recommended_counts: [108, 1008],
    sort_order: 2,
    is_active: true
  },
  {
    id: "mahamrityunjaya",
    name_hindi: "महामृत्युंजय मंत्र",
    name_english: "Mahamrityunjaya Mantra",
    deity: "shiva",
    description_hindi: "मृत्यु पर विजय पाने वाला मंत्र।",
    description_english: "The great death-conquering mantra.",
    meaning_hindi: "हम त्रिनेत्रधारी भगवान शिव की आराधना करते हैं, जो सुगंधमय हैं और सबका पोषण करते हैं। जैसे ककड़ी अपनी बेल से अलग होकर मुक्त होती है, वैसे ही वे हमें मृत्यु के बंधन से मुक्त करें और अमरता प्रदान करें।",
    meaning_english: "We worship the three-eyed Lord Shiva, who is fragrant and nourishes all. Just as a cucumber is freed from its bond to the vine, may He liberate us from death and grant us immortality.",
    full_text_hindi: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्।\nउर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय मामृतात्॥",
    transliteration: "Om Tryambakam Yajamahe Sugandhim Pushti-Vardhanam\nUrvarukamiva Bandhanan Mrityor Mukshiya Maamritat",
    image_url: null,
    audio_url: null,
    recommended_counts: [108, 1008],
    sort_order: 3,
    is_active: true
  },
  {
    id: "hare_krishna",
    name_hindi: "हरे कृष्ण महामंत्र",
    name_english: "Hare Krishna Mahamantra",
    deity: "krishna",
    description_hindi: "कलि युग का महामंत्र।",
    description_english: "The mahamantra of the Kali Yuga.",
    meaning_hindi: "हे भगवान कृष्ण और राम, मैं आपकी शरण में हूँ।",
    meaning_english: "O Lord Krishna and Lord Rama, I take shelter in you.",
    full_text_hindi: "हरे कृष्ण हरे कृष्ण, कृष्ण कृष्ण हरे हरे।\nहरे राम हरे राम, राम राम हरे हरे॥",
    transliteration: "Hare Krishna Hare Krishna, Krishna Krishna Hare Hare\nHare Ram Hare Ram, Ram Ram Hare Hare",
    image_url: null,
    audio_url: null,
    recommended_counts: [108, 1008],
    sort_order: 4,
    is_active: true
  },
  {
    id: "radhe_radhe",
    name_hindi: "राधे राधे",
    name_english: "Radhe Radhe",
    deity: "krishna",
    description_hindi: "राधा रानी का पावन नाम।",
    description_english: "The sacred name of Radha Rani.",
    meaning_hindi: "राधा रानी के नाम का जाप प्रेम और भक्ति प्रदान करता है।",
    meaning_english: "Chanting Radha's name bestows pure love and devotion.",
    full_text_hindi: "राधे राधे",
    transliteration: "Radhe Radhe",
    image_url: null,
    audio_url: null,
    recommended_counts: [108, 1008],
    sort_order: 5,
    is_active: true
  },
  {
    id: "jai_shree_ram",
    name_hindi: "जय श्री राम",
    name_english: "Jai Shree Ram",
    deity: "rama",
    description_hindi: "प्रभु श्री राम का पावन नाम।",
    description_english: "The holy name of Lord Rama.",
    meaning_hindi: "मर्यादा पुरुषोत्तम भगवान श्री राम की विजय हो।",
    meaning_english: "Victory to Lord Rama, the embodiment of righteousness.",
    full_text_hindi: "जय श्री राम",
    transliteration: "Jai Shree Ram",
    image_url: null,
    audio_url: null,
    recommended_counts: [108, 1008],
    sort_order: 6,
    is_active: true
  },
  {
    id: "om_namo_narayanaya",
    name_hindi: "ॐ नमो नारायणाय",
    name_english: "Om Namo Narayanaya",
    deity: "rama",
    description_hindi: "भगवान नारायण का अष्टाक्षर मंत्र।",
    description_english: "The eight-syllable mantra of Lord Narayana.",
    meaning_hindi: "मैं भगवान नारायण (विष्णु) के चरणों में शीश झुकाता हूँ।",
    meaning_english: "I bow down to Lord Narayana (Vishnu).",
    full_text_hindi: "ॐ नमो नारायणाय",
    transliteration: "Om Namo Narayanaya",
    image_url: null,
    audio_url: null,
    recommended_counts: [108, 1008],
    sort_order: 7,
    is_active: true
  },
  {
    id: "gayatri",
    name_hindi: "गायत्री मंत्र",
    name_english: "Gayatri Mantra",
    deity: "durga",
    description_hindi: "ज्ञान और बुद्धि का प्राचीन वैदिक मंत्र।",
    description_english: "The ancient Vedic mantra for wisdom and illumination.",
    meaning_hindi: "हम उस प्राणस्वरूप, दुखनाशक, सुखस्वरूप, तेजस्वी परमात्मा का ध्यान करते हैं जो हमारी बुद्धि को प्रेरित करे।",
    meaning_english: "We meditate on the divine light of the sun of spiritual consciousness, may it stimulate our intellect.",
    full_text_hindi: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं।\nभर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥",
    transliteration: "Om Bhur Bhuvah Svah Tat Savitur Varenyam\nBhargo Devasya Dhimahi Dhiyo Yo Nah Prachodayat",
    image_url: null,
    audio_url: null,
    recommended_counts: [108, 1008],
    sort_order: 8,
    is_active: true
  },
  {
    id: "ganesha",
    name_hindi: "श्री गणेश मंत्र",
    name_english: "Shri Ganesha Mantra",
    deity: "ganesh",
    description_hindi: "विघ्नहर्ता भगवान गणेश का मंत्र।",
    description_english: "Mantra to Lord Ganesha, the remover of obstacles.",
    meaning_hindi: "हम विघ्नहर्ता भगवान गणेश को नमन करते हैं।",
    meaning_english: "We bow to Lord Ganesha, the remover of all obstacles.",
    full_text_hindi: "ॐ गं गणपतये नमः",
    transliteration: "Om Gam Ganapataye Namaha",
    image_url: null,
    audio_url: null,
    recommended_counts: [108, 1008],
    sort_order: 9,
    is_active: true
  }
];

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

  const [customMantras, setCustomMantras] = useState<Mantra[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hari_kirtan_custom_mantras_v1");
      if (saved) {
        setCustomMantras(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Error reading custom mantras:", e);
    }
  }, []);

  const addCustomMantra = useCallback((nameHindi: string, nameEnglish: string) => {
    const newMantra: Mantra = {
      id: `custom-${Date.now()}`,
      name_hindi: nameHindi,
      name_english: nameEnglish,
      deity: "om",
      description_hindi: "स्वयं जोड़ा गया मंत्र",
      description_english: "Custom added mantra",
      meaning_hindi: null,
      meaning_english: null,
      full_text_hindi: nameHindi,
      transliteration: nameEnglish,
      image_url: null,
      audio_url: null,
      recommended_counts: [108, 1008],
      sort_order: 100,
      is_active: true
    };
    const updated = [...customMantras, newMantra];
    setCustomMantras(updated);
    localStorage.setItem("hari_kirtan_custom_mantras_v1", JSON.stringify(updated));
    return newMantra;
  }, [customMantras]);

  const deleteCustomMantra = useCallback((id: string) => {
    if (!id.startsWith("custom-")) return;
    const updated = customMantras.filter((m) => m.id !== id);
    setCustomMantras(updated);
    localStorage.setItem("hari_kirtan_custom_mantras_v1", JSON.stringify(updated));
  }, [customMantras]);

  // ── 1. Mantras (always from Supabase, public) ──────────────────
  const mantrasQuery = useQuery({
    queryKey: KEYS.mantras,
    queryFn: fetchMantras,
    staleTime: 10 * 60_000, // 10 minutes
    retry: 2,
  });

  const mergedMantras = useMemo(() => {
    const db = mantrasQuery.data ?? [];
    const base = db.length > 0 ? db : DEFAULT_MANTRAS;
    
    // Ensure default mantras are always there in case db didn't include some of them, 
    // or if they are duplicate we can deduplicate by name_english/id
    const ids = new Set(base.map(m => m.id));
    const nameEnglishes = new Set(base.map(m => m.name_english.toLowerCase()));
    
    const filteredDefaults = DEFAULT_MANTRAS.filter(m => !ids.has(m.id) && !nameEnglishes.has(m.name_english.toLowerCase()));
    const allBase = [...base, ...filteredDefaults].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    return [...allBase, ...customMantras];
  }, [mantrasQuery.data, customMantras]);

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
      groupId?: string | null;
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
        groupId: params.groupId,
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
    mantras: mergedMantras,
    mantrasLoading: mantrasQuery.isLoading,
    mantrasError: mantrasQuery.error,
    stats,
    mantraTotalsMap,
    todaySessions: todayQuery.data ?? [],
    sankalpas: sankalpasQuery.data ?? [],
    isGuest,
    userId,

    // Mutations
    completeSession: completeSessionMutation.mutateAsync,
    isCompletingSession: completeSessionMutation.isPending,
    addSankalp: addSankalpMutation.mutateAsync,
    activateSankalp: activateSankalpMutation.mutateAsync,
    deleteSankalpFn: deleteSankalpMutation.mutateAsync,

    // Custom Mantra Ops
    addCustomMantra,
    deleteCustomMantra,

    // Utils
    refresh,
    resolveMantraImage,
  };
}
