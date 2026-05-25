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

export function completeJapaSession(log: JapaSessionLog, date = new Date()): DevotionProgress {
  const current = loadDevotionProgress(date);
  const today = todayKey(date);
  const yesterday = previousDayKey(date);
  const alreadyCompletedToday = current.lastCompletedDate === today;
  const nextStreak = alreadyCompletedToday
    ? current.currentStreak
    : current.lastCompletedDate === yesterday
      ? current.currentStreak + 1
      : 1;

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
