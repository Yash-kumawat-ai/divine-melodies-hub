import {
  calculateBrahmaMuhurat,
  calculateRahuKaal,
  determinePaksha,
  extractTithiNumber,
  formatTime,
  nowInIndia,
  varaForWeekday,
} from './calculations';
import type { PanchangData } from './types';
import { fetchPanchangFromVedAstro } from './vedastroClient';

type ZoneInput = {
  name: string;
  city: string;
  lat: number;
  lng: number;
};

export async function buildPanchangForZone(zone: ZoneInput): Promise<PanchangData> {
  const when = nowInIndia();
  const raw = await fetchPanchangFromVedAstro(zone, when);

  const tithiNumber = extractTithiNumber(raw.tithi);
  const sunrise = formatTime(raw.sunrise);
  const sunset = formatTime(raw.sunset);

  return {
    date: when.date,
    zone: zone.name,
    city: zone.city,
    tithi: raw.tithi,
    tithi_number: tithiNumber,
    nakshatra: raw.nakshatra,
    yoga: raw.yoga,
    karana: raw.karana,
    paksha: determinePaksha(raw.tithi, tithiNumber),
    sunrise,
    sunset,
    rahu_kaal: calculateRahuKaal(sunrise, sunset, when.weekday),
    brahma_muhurat: calculateBrahmaMuhurat(sunrise),
    vara: varaForWeekday(when.weekday),
    updated_at: new Date().toISOString(),
  };
}
