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

  let tithiNumber = extractTithiNumber(raw.tithi);
  const paksha = determinePaksha(raw.tithi, tithiNumber);
  
  // Adjust tithi_number to 1-30 scale for the shubhKaryaEngine
  // Shukla: 1-15, Krishna: 16-30
  if (paksha === 'Krishna') {
    if (tithiNumber < 15) {
      tithiNumber += 15;
    } else if (raw.tithi.toLowerCase().includes('amavasya') || tithiNumber === 15) {
      tithiNumber = 30;
    }
  }

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
    rahu_kaal: raw.rahu_kaal ? formatTime(raw.rahu_kaal) : `${calculateRahuKaal(sunrise, sunset, when.weekday)} *`,
    brahma_muhurat: raw.brahma_muhurat ? formatTime(raw.brahma_muhurat) : calculateBrahmaMuhurat(sunrise),
    abhijit_muhurat: raw.abhijit_muhurat ? formatTime(raw.abhijit_muhurat) : undefined,
    vijay_muhurat: raw.vijay_muhurat ? formatTime(raw.vijay_muhurat) : undefined,
    guli_kaal: raw.guli_kaal ? formatTime(raw.guli_kaal) : undefined,
    vara: varaForWeekday(when.weekday),
    updated_at: new Date().toISOString(),
  };
}
