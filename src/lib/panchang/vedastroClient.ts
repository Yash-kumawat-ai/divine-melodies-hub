import { cleanText } from './calculations';

const VEDASTRO_BASE = 'https://api.vedastro.org/api';
const API_DELAY_MS = 2500;

type ZoneInput = {
  name: string;
  city: string;
  lat: number;
  lng: number;
};

function getApiKey(): string {
  return (
    (typeof process !== 'undefined' && process.env?.VEDASTRO_API_KEY) ||
    (typeof import.meta !== 'undefined' && (import.meta as { env?: { VITE_VEDASTRO_API_KEY?: string } }).env?.VITE_VEDASTRO_API_KEY) ||
    'FreeAPIUser'
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function postCalculate(method: string, zone: ZoneInput, stdTime: string): Promise<unknown> {
  const response = await fetch(`${VEDASTRO_BASE}/Calculate/${method}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': getApiKey(),
    },
    body: JSON.stringify({
      Location: {
        Latitude: zone.lat,
        Longitude: zone.lng,
        Name: `${zone.city}, India`,
      },
      Time: { StdTime: stdTime },
    }),
  });

  if (!response.ok) {
    throw new Error(`VedAstro ${method} failed (${response.status})`);
  }

  const json: unknown = await response.json();
  if (json && typeof json === 'object' && (json as { Status?: string }).Status === 'Fail') {
    throw new Error(cleanText((json as { Payload?: unknown }).Payload) || `VedAstro ${method} failed`);
  }

  return json;
}

async function calculateWithFallback(methods: string[], zone: ZoneInput, stdTime: string): Promise<string> {
  let lastError: Error | null = null;

  for (let index = 0; index < methods.length; index += 1) {
    const method = methods[index];
    try {
      const result = await postCalculate(method, zone, stdTime);
      const text = cleanText(result);
      if (text) return text;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
    if (index < methods.length - 1) {
      await sleep(API_DELAY_MS);
    }
  }

  throw lastError ?? new Error(`VedAstro methods failed: ${methods.join(', ')}`);
}

export async function fetchPanchangFromVedAstro(
  zone: ZoneInput,
  when: { date: string; weekday: number; stdTime: string },
): Promise<{
  tithi: string;
  tithi_number: number;
  nakshatra: string;
  yoga: string;
  karana: string;
  sunrise: string;
  sunset: string;
  vara: string;
  rahu_kaal?: string;
  brahma_muhurat?: string;
  abhijit_muhurat?: string;
  vijay_muhurat?: string;
  guli_kaal?: string;
}> {
  const tithi = await calculateWithFallback(['LunarDay'], zone, when.stdTime);
  const nakshatra = await calculateWithFallback(['MoonConstellation'], zone, when.stdTime);
  const yoga = await calculateWithFallback(['Yoga', 'NithyaYoga'], zone, when.stdTime);
  const karana = await calculateWithFallback(['Karana'], zone, when.stdTime);
  const sunriseRaw = await calculateWithFallback(['SunRise', 'SunriseTime'], zone, when.stdTime);
  const sunsetRaw = await calculateWithFallback(['SunSet', 'SunsetTime'], zone, when.stdTime);
  
  // Optional computed timings from VedAstro
  let rahuKaal, brahmaMuhurat, abhijitMuhurat, vijayMuhurat, guliKaal;
  try { rahuKaal = await calculateWithFallback(['RahuKaal'], zone, when.stdTime); } catch { /* ignore */ }
  try { brahmaMuhurat = await calculateWithFallback(['BrahmaMuhurat'], zone, when.stdTime); } catch { /* ignore */ }
  try { abhijitMuhurat = await calculateWithFallback(['AbhijitMuhurat'], zone, when.stdTime); } catch { /* ignore */ }
  try { vijayMuhurat = await calculateWithFallback(['VijayMuhurat'], zone, when.stdTime); } catch { /* ignore */ }
  try { guliKaal = await calculateWithFallback(['GulikKaal', 'GuliKaal'], zone, when.stdTime); } catch { /* ignore */ }

  return {
    tithi,
    tithi_number: 0,
    nakshatra,
    yoga,
    karana,
    sunrise: sunriseRaw,
    sunset: sunsetRaw,
    vara: '',
    rahu_kaal: rahuKaal,
    brahma_muhurat: brahmaMuhurat,
    abhijit_muhurat: abhijitMuhurat,
    vijay_muhurat: vijayMuhurat,
    guli_kaal: guliKaal,
  };
}
