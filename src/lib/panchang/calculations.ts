const RAHU_ORDER: Record<number, number> = { 0: 2, 1: 7, 2: 5, 3: 6, 4: 4, 5: 3, 6: 8 };

const VARA_BY_WEEKDAY = [
  'Somvaar',
  'Mangalvaar',
  'Budhvaar',
  'Guruvaar',
  'Shukravaar',
  'Shanivaar',
  'Ravivaar',
];

const TITHI_NAME_NUMBERS: Record<string, number> = {
  pratipada: 1,
  prathama: 1,
  dwitiya: 2,
  dvitiiya: 2,
  tritiya: 3,
  tritiiya: 3,
  chaturthi: 4,
  panchami: 5,
  shashthi: 6,
  sashti: 6,
  saptami: 7,
  ashtami: 8,
  astami: 8,
  navami: 9,
  dashami: 10,
  dasimi: 10,
  ekadashi: 11,
  dwadashi: 12,
  dvadasi: 12,
  trayodashi: 13,
  chaturdashi: 14,
  purnima: 15,
  poornima: 15,
  amavasya: 15,
};

export function cleanText(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') {
    return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    for (const key of ['Payload', 'Name', 'name', 'Value', 'value', 'Result']) {
      if (key in record) return cleanText(record[key]);
    }
    return Object.values(record)
      .map((item) => cleanText(item))
      .join(' ')
      .trim();
  }
  return String(value).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseTime(value: string): { hour: number; minute: number } {
  const match = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) throw new Error(`Unable to parse time: ${value}`);
  
  let hour = Number.parseInt(match[1], 10);
  const minute = Number.parseInt(match[2], 10);
  const ampm = match[3]?.toUpperCase();

  if (ampm === 'PM' && hour < 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;
  
  return { hour, minute };
}

function minutesToTime(totalMinutes: number): string {
  const normalized = ((Math.round(totalMinutes) % (24 * 60)) + (24 * 60)) % (24 * 60);
  const hour24 = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const suffix = hour24 < 12 ? 'AM' : 'PM';
  const hour12 = hour24 % 12 || 12;
  return `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${suffix}`;
}

export function formatTime(value: string): string {
  // Handle ranges with various separators (-, to, to)
  const rangeSeparator = value.includes('-') ? '-' : value.toLowerCase().includes(' to ') ? ' to ' : null;
  
  if (rangeSeparator) {
    return value
      .split(rangeSeparator)
      .map((p) => {
        try {
          return formatTime(p.trim());
        } catch {
          return p.trim();
        }
      })
      .join(' - ');
  }

  try {
    const { hour, minute } = parseTime(value);
    return minutesToTime(hour * 60 + minute);
  } catch {
    // If parsing fails, return the original cleaned text
    return value.trim();
  }
}

export function calculateRahuKaal(sunriseStr: string, sunsetStr: string, weekday: number): string {
  const sunrise = parseTime(sunriseStr);
  const sunset = parseTime(sunsetStr);
  const sunriseMinutes = sunrise.hour * 60 + sunrise.minute;
  const sunsetMinutes = sunset.hour * 60 + sunset.minute;
  if (sunsetMinutes <= sunriseMinutes) throw new Error('Sunset must be after sunrise');

  const partLength = (sunsetMinutes - sunriseMinutes) / 8;
  const partNumber = RAHU_ORDER[weekday];
  const start = sunriseMinutes + (partNumber - 1) * partLength;
  const end = start + partLength;
  return `${minutesToTime(start)} - ${minutesToTime(end)}`;
}

export function calculateBrahmaMuhurat(sunriseStr: string): string {
  const sunrise = parseTime(sunriseStr);
  const sunriseMinutes = sunrise.hour * 60 + sunrise.minute;
  return `${minutesToTime(sunriseMinutes - 96)} - ${minutesToTime(sunriseMinutes - 48)}`;
}

export function extractTithiNumber(tithi: string): number {
  const text = tithi.toLowerCase();
  const slashMatch = text.match(/(\d{1,2})\s*\/\s*30/);
  if (slashMatch) return Number.parseInt(slashMatch[1], 10);
  const digitMatch = text.match(/\b(\d{1,2})\b/);
  if (digitMatch) return Number.parseInt(digitMatch[1], 10);
  for (const [name, number] of Object.entries(TITHI_NAME_NUMBERS)) {
    if (text.includes(name)) return number;
  }
  return 0;
}

export function determinePaksha(tithi: string, tithiNumber: number): string {
  const text = tithi.toLowerCase();
  if (text.includes('krishna') || text.includes('dark')) return 'Krishna';
  if (text.includes('shukla') || text.includes('sukla') || text.includes('bright')) return 'Shukla';
  if (tithiNumber >= 1 && tithiNumber <= 15) return 'Shukla';
  return 'Krishna';
}

export function varaForWeekday(weekday: number): string {
  return VARA_BY_WEEKDAY[weekday] ?? VARA_BY_WEEKDAY[0];
}

export function nowInIndia(): { date: string; weekday: number; stdTime: string } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';

  const day = get('day');
  const month = get('month');
  const year = get('year');
  const hour = get('hour');
  const minute = get('minute');
  const weekdayMap: Record<string, number> = {
    Sun: 6,
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
  };

  return {
    date: `${year}-${month}-${day}`,
    weekday: weekdayMap[get('weekday')] ?? 0,
    stdTime: `05:00 ${day}/${month}/${year} +05:30`,
  };
}
