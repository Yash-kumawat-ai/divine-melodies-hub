export interface PanchangData {
  date: string;
  zone: string;
  city: string;
  tithi: string;
  tithi_number: number;
  nakshatra: string;
  yoga: string;
  karana: string;
  paksha: string;
  sunrise: string;
  sunset: string;
  rahu_kaal: string;
  brahma_muhurat: string;
  abhijit_muhurat?: string;
  vijay_muhurat?: string;
  guli_kaal?: string;
  vara: string;
  updated_at: string;
}

export function todayInIndia(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function isPanchangData(value: unknown): value is PanchangData {
  if (!value || typeof value !== 'object') return false;
  const data = value as Record<string, unknown>;
  return (
    typeof data.date === 'string' &&
    typeof data.zone === 'string' &&
    typeof data.city === 'string' &&
    typeof data.tithi === 'string' &&
    typeof data.nakshatra === 'string' &&
    typeof data.yoga === 'string' &&
    typeof data.karana === 'string' &&
    typeof data.paksha === 'string' &&
    typeof data.sunrise === 'string' &&
    typeof data.sunset === 'string' &&
    typeof data.rahu_kaal === 'string' &&
    typeof data.brahma_muhurat === 'string' &&
    typeof data.vara === 'string'
  );
}
