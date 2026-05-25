import type {
  MeditationPreferences,
  MeditationPreset,
  MeditationSessionLog,
} from "@/lib/meditation/meditationTypes";
import { DEFAULT_PREFERENCES, DEFAULT_PRESETS } from "@/lib/meditation/meditationTypes";

const PREFS_KEY = "hari_kirtan_meditation_prefs_v1";
const LOGS_KEY = "hari_kirtan_meditation_logs_v1";
const PRESETS_KEY = "hari_kirtan_meditation_presets_v1";

export type MeditationStats = {
  totalMindfulMinutes: number;
  streakDays: number;
  sessionCount: number;
  lastSessionAt: string | null;
};

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadPreferences(): MeditationPreferences {
  if (typeof localStorage === "undefined") return { ...DEFAULT_PREFERENCES };
  return { ...DEFAULT_PREFERENCES, ...safeParse(localStorage.getItem(PREFS_KEY), {}) };
}

export function savePreferences(prefs: MeditationPreferences): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function loadSessionLogs(): MeditationSessionLog[] {
  if (typeof localStorage === "undefined") return [];
  return safeParse<MeditationSessionLog[]>(localStorage.getItem(LOGS_KEY), []);
}

export function appendSessionLog(log: MeditationSessionLog): void {
  const logs = loadSessionLogs();
  logs.unshift(log);
  const trimmed = logs.slice(0, 200);
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(LOGS_KEY, JSON.stringify(trimmed));
  }
}

export function loadPresets(): MeditationPreset[] {
  if (typeof localStorage === "undefined") return [...DEFAULT_PRESETS];
  const custom = safeParse<MeditationPreset[]>(localStorage.getItem(PRESETS_KEY), []);
  return [...DEFAULT_PRESETS, ...custom];
}

export function saveCustomPresets(presets: MeditationPreset[]): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
}

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

export function computeStats(logs: MeditationSessionLog[]): MeditationStats {
  const completed = logs.filter((l) => l.completed);
  const totalMindfulMinutes = Math.round(
    completed.reduce((sum, l) => sum + l.durationSeconds, 0) / 60,
  );

  const days = new Set(completed.map((l) => dayKey(l.completedAt)));
  const sortedDays = [...days].sort().reverse();
  let streakDays = 0;
  const today = dayKey(new Date().toISOString());
  let cursor = today;
  for (const d of sortedDays) {
    if (d === cursor) {
      streakDays += 1;
      const prev = new Date(cursor);
      prev.setDate(prev.getDate() - 1);
      cursor = dayKey(prev.toISOString());
    } else if (streakDays === 0 && d === sortedDays[0]) {
      streakDays = 1;
      break;
    } else {
      break;
    }
  }

  return {
    totalMindfulMinutes,
    streakDays,
    sessionCount: completed.length,
    lastSessionAt: completed[0]?.completedAt ?? null,
  };
}

export function createSessionLog(
  partial: Omit<MeditationSessionLog, "id">,
): MeditationSessionLog {
  return {
    id: `med_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    ...partial,
  };
}
