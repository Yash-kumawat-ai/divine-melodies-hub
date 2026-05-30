import { isPanchangData, todayInIndia, type PanchangData } from './types';

export type PanchangLoadResult = {
  data: PanchangData;
  stale: boolean;
  source: 'static' | 'live' | 'static-fallback';
};

async function fetchStatic(zoneName: string, signal?: AbortSignal): Promise<PanchangData | null> {
  const response = await fetch(`/data/panchang-${zoneName}.json?v=${Date.now()}`, {
    cache: 'no-store',
    signal,
  });
  if (!response.ok) return null;
  const json: unknown = await response.json();
  return isPanchangData(json) ? json : null;
}

async function fetchLive(zoneName: string, signal?: AbortSignal): Promise<PanchangData> {
  const response = await fetch(`/api/panchang/${zoneName}`, {
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
 * Prefer today's static JSON (fast). If missing or stale, compute via /api/panchang.
 * Falls back to stale static only when live fetch fails.
 */
export async function loadPanchang(zoneName: string, signal?: AbortSignal): Promise<PanchangLoadResult> {
  const today = todayInIndia();
  const cached = await fetchStatic(zoneName, signal);

  if (cached?.date === today) {
    return { data: cached, stale: false, source: 'static' };
  }

  try {
    const live = await fetchLive(zoneName, signal);
    return { data: live, stale: false, source: 'live' };
  } catch (error) {
    if (cached) {
      return { data: cached, stale: true, source: 'static-fallback' };
    }
    throw error instanceof Error ? error : new Error('Unable to load Panchang.');
  }
}
