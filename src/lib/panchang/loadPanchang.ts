import { isPanchangData, todayInIndia, type PanchangData } from './types';

export type PanchangLoadResult = {
  data: PanchangData;
  stale: boolean;
  source: 'static' | 'live' | 'static-fallback';
};

const CACHE_PREFIX = 'panchang_cache_';

function readSessionCache(zoneName: string, targetDate: string): PanchangLoadResult | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(`${CACHE_PREFIX}${zoneName}_${targetDate}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PanchangLoadResult;
    if (parsed.data?.date === targetDate) return parsed;
  } catch {
    // ignore malformed cache
  }
  return null;
}

function writeSessionCache(zoneName: string, targetDate: string, result: PanchangLoadResult): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(`${CACHE_PREFIX}${zoneName}_${targetDate}`, JSON.stringify(result));
  } catch {
    // ignore storage errors
  }
}

async function fetchStatic(zoneName: string, targetDate: string, signal?: AbortSignal): Promise<PanchangData | null> {
  // Try date-specific JSON file first
  let response = await fetch(`/data/panchang-${zoneName}-${targetDate}.json?v=${targetDate}`, {
    signal,
  });
  
  if (!response.ok && targetDate === todayInIndia()) {
    // Fall back to default panchang-{zone}.json for today
    response = await fetch(`/data/panchang-${zoneName}.json?v=${targetDate}`, {
      signal,
    });
  }

  if (!response.ok) return null;
  const json: unknown = await response.json();
  return isPanchangData(json) ? json : null;
}

async function fetchLive(zoneName: string, targetDate: string, signal?: AbortSignal): Promise<PanchangData> {
  const response = await fetch(`/api/panchang/${zoneName}?date=${targetDate}`, {
    cache: 'no-store',
    signal,
  });
  if (!response.ok) {
    throw new Error(`Live Panchang unavailable (${response.status}).`);
  }
  const json: unknown = await response.json();
  if (!isPanchangData(json)) {
    throw new Error('Invalid live Panchang response.');
  }
  return json;
}

/**
 * Prefer target date's static JSON (fast). If missing or stale, compute via /api/panchang.
 * Falls back to stale static only when live fetch fails.
 */
export async function loadPanchang(
  zoneName: string,
  targetDate?: string,
  signal?: AbortSignal
): Promise<PanchangLoadResult> {
  const dateToLoad = targetDate || todayInIndia();

  const sessionCached = readSessionCache(zoneName, dateToLoad);
  if (sessionCached) return sessionCached;

  const cached = await fetchStatic(zoneName, dateToLoad, signal);

  if (cached?.date === dateToLoad) {
    const result: PanchangLoadResult = { data: cached, stale: false, source: 'static' };
    writeSessionCache(zoneName, dateToLoad, result);
    return result;
  }

  try {
    const live = await fetchLive(zoneName, dateToLoad, signal);
    const result: PanchangLoadResult = { data: live, stale: false, source: 'live' };
    writeSessionCache(zoneName, dateToLoad, result);
    return result;
  } catch (error) {
    if (cached) {
      const result: PanchangLoadResult = { data: cached, stale: true, source: 'static-fallback' };
      writeSessionCache(zoneName, dateToLoad, result);
      return result;
    }
    throw error instanceof Error ? error : new Error('Unable to load Panchang.');
  }
}
