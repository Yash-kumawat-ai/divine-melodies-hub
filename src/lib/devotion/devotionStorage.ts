const DEVOTION_PROGRESS_KEY = "hari_kirtan_devotion_progress_v1";

export type DevotionProgress = {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  totalJapaCount: number;
  totalOfferings: number;
  completedToday: boolean;
};

export type JapaSessionLog = {
  mantra: string;
  sankalp: string;
  targetCount: number;
  completedAt: string;
};

const DEFAULT_PROGRESS: DevotionProgress = {
  currentStreak: 0,
  longestStreak: 0,
  lastCompletedDate: null,
  totalJapaCount: 0,
  totalOfferings: 0,
  completedToday: false,
};

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function previousDayKey(date = new Date()) {
  const prev = new Date(date);
  prev.setDate(prev.getDate() - 1);
  return todayKey(prev);
}

export function loadDevotionProgress(date = new Date()): DevotionProgress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;

  try {
    const parsed = JSON.parse(window.localStorage.getItem(DEVOTION_PROGRESS_KEY) || "null") as
      | DevotionProgress
      | null;
    const progress = parsed ? { ...DEFAULT_PROGRESS, ...parsed } : DEFAULT_PROGRESS;
    return {
      ...progress,
      completedToday: progress.lastCompletedDate === todayKey(date),
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveDevotionProgress(progress: DevotionProgress) {
  window.localStorage.setItem(DEVOTION_PROGRESS_KEY, JSON.stringify(progress));
}

export type MantraJapaStat = {
  totalChants: number;
  lastChantedAt: string | null;
};

export type MantraJapaStatsMap = {
  [mantraId: string]: MantraJapaStat;
};

export function loadMantraJapaStats(): MantraJapaStatsMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem("hari_kirtan_mantra_stats_v1") || "{}");
  } catch {
    return {};
  }
}

export function saveMantraJapaStats(stats: MantraJapaStatsMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("hari_kirtan_mantra_stats_v1", JSON.stringify(stats));
}

export function completeJapaSession(
  log: JapaSessionLog,
  date = new Date(),
  mantraId?: string,
): DevotionProgress {
  const current = loadDevotionProgress(date);
  const today = todayKey(date);
  const yesterday = previousDayKey(date);
  const alreadyCompletedToday = current.lastCompletedDate === today;
  const nextStreak = alreadyCompletedToday
    ? current.currentStreak
    : current.lastCompletedDate === yesterday
      ? current.currentStreak + 1
      : 1;

  if (mantraId) {
    const stats = loadMantraJapaStats();
    const existing = stats[mantraId] || { totalChants: 0, lastChantedAt: null };
    stats[mantraId] = {
      totalChants: existing.totalChants + log.targetCount,
      lastChantedAt: log.completedAt,
    };
    saveMantraJapaStats(stats);
  }

  // Save to meditation logs (hari_kirtan_meditation_logs_v1) as well to make it dynamic
  if (typeof window !== "undefined") {
    try {
      const logsRaw = window.localStorage.getItem("hari_kirtan_meditation_logs_v1");
      const logs = logsRaw ? JSON.parse(logsRaw) : [];
      
      // Determine practiceId
      let practiceId = "mantra_shiva";
      if (mantraId === "om") practiceId = "mantra_om";
      else if (mantraId === "om_namah_shivaya" || mantraId === "mahamrityunjaya") practiceId = "mantra_shiva";
      else if (mantraId === "hare_krishna") practiceId = "mantra_krishna";
      else if (mantraId === "radhe_radhe") practiceId = "mantra_radhe";
      else if (mantraId === "jai_shree_ram") practiceId = "mantra_ram";
      else if (mantraId === "om_namo_narayanaya") practiceId = "mantra_narayana";
      else if (mantraId) practiceId = `mantra_${mantraId}`;

      const japaLog = {
        id: `japa_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        practiceId,
        practiceType: "mantra",
        startedAt: new Date(new Date(log.completedAt).getTime() - 5 * 60 * 1000).toISOString(),
        completedAt: log.completedAt,
        durationSeconds: Math.max(60, Math.round(log.targetCount * 1.5)), // 1.5 seconds per chant estimated
        completed: true,
        sankalp: log.sankalp,
        japaCount: log.targetCount,
        japaTarget: log.targetCount,
        mantraId: mantraId || "om_namah_shivaya",
      };
      logs.unshift(japaLog);
      window.localStorage.setItem("hari_kirtan_meditation_logs_v1", JSON.stringify(logs.slice(0, 200)));
    } catch (e) {
      console.error("Error saving japa log to meditation logs:", e);
    }
  }

  const next: DevotionProgress = {
    ...current,
    currentStreak: nextStreak,
    longestStreak: Math.max(current.longestStreak, nextStreak),
    lastCompletedDate: today,
    totalJapaCount: current.totalJapaCount + log.targetCount,
    completedToday: true,
  };

  saveDevotionProgress(next);
  return next;
}

export function recordOffering(date = new Date()): DevotionProgress {
  const current = loadDevotionProgress(date);
  const next = {
    ...current,
    totalOfferings: current.totalOfferings + 1,
  };
  saveDevotionProgress(next);
  return next;
}
