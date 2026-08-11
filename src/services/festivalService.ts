import type { FestivalData, FestivalIndex, FestivalMonthData } from '@/types/festival';

const monthCache = new Map<string, Promise<FestivalMonthData>>();
let indexCache: Promise<FestivalIndex> | null = null;

function todayInIndia(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function normalizeMonth(year: number, month: number | string): string {
  const monthText = String(month).padStart(2, '0');
  return `${year}-${monthText}`;
}

async function fetchJson<T>(path: string): Promise<T> {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`${path} returned HTTP ${response.status}`);
    }
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json') && !contentType.includes('text/json')) {
      throw new Error('Non-JSON content type');
    }
    const text = await response.text();
    if (!text || text.trim().startsWith('<')) {
      throw new Error('Received HTML response');
    }
    return JSON.parse(text) as T;
  } catch (err) {
    throw new Error(`Failed to load ${path}`);
  }
}

export function getCurrentFestivalMonth(): string {
  return todayInIndia().slice(0, 7);
}

export async function loadFestivalIndex(year = 2026): Promise<FestivalIndex> {
  if (!indexCache) {
    indexCache = fetchJson<FestivalIndex>(`/data/festivals/${year}/index.json`);
  }
  return indexCache;
}

export async function loadFestivalMonth(year = 2026, month: number | string): Promise<FestivalMonthData> {
  const normalizedMonth = typeof month === 'string' && month.includes('-') ? month : normalizeMonth(year, month);
  const key = `${year}:${normalizedMonth}`;
  if (!monthCache.has(key)) {
    monthCache.set(key, fetchJson<FestivalMonthData>(`/data/festivals/${year}/${normalizedMonth}.json`));
  }
  return monthCache.get(key)!;
}

export function getFestivalsForDate(monthData: FestivalMonthData | null, date: string): FestivalData[] {
  if (!monthData) return [];
  return monthData.festivals.filter((festival) => festival.date === date);
}

export function getFestivalsForRegion(festivals: FestivalData[], region?: string): FestivalData[] {
  if (!region) return festivals;
  return festivals.filter((festival) => festival.regions.includes('all') || festival.regions.includes(region));
}
