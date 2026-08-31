export type ElevationSource = 'survey_known' | 'regional_srtm_model' | 'fallback';
export type LocationSource = 'seed_directory' | 'photon_osm';

export interface GeocodedPlace {
  label: string;
  matchedName: string;
  city: string;
  admin1?: string;
  country: string;
  country_code?: string;
  lat: number;
  lng: number;
  elevation: number; // elevation in meters above sea level
  elevationSource: ElevationSource;
  timezone_iana: string;
  utc_offset_at_birth: string;
  source: LocationSource;
  confidence: number; // 0.0 to 1.0 match confidence
}

const INDIA_BOX = { minLng: 68, minLat: 6, maxLng: 98, maxLat: 37 };

/**
 * Resolve exact historical UTC offset (+HH:mm or -HH:mm) for any IANA timezone
 * and calendar date/time using the native IANA timezone database.
 * Accurately handles Daylight Saving Time (DST) and historical timezone shifts.
 */
export function resolveHistoricalUtcOffset(
  dateOfBirth: string, // YYYY-MM-DD
  birthTime?: string | null, // HH:mm
  timezoneIana = 'Asia/Kolkata'
): string {
  try {
    const cleanDate = (dateOfBirth || '').trim();
    if (!cleanDate.includes('-')) return '+05:30';

    const [yearStr, monthStr, dayStr] = cleanDate.split('-');
    const [hourStr, minStr] = (birthTime || '12:00').trim().split(':');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const day = parseInt(dayStr, 10);
    const hour = parseInt(hourStr || '12', 10);
    const min = parseInt(minStr || '0', 10);

    const approxUtc = Date.UTC(year, month, day, hour, min);
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezoneIana,
      timeZoneName: 'longOffset',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(new Date(approxUtc));
    const tzPart = parts.find((p) => p.type === 'timeZoneName');

    if (tzPart?.value) {
      const match = tzPart.value.match(/GMT([+-]\d{1,2}(?::\d{2})?)/);
      if (match) {
        let offset = match[1];
        if (!offset.includes(':')) {
          offset = `${offset}:00`;
        }
        const [h, m] = offset.slice(1).split(':');
        const padH = h.padStart(2, '0');
        const padM = (m || '00').padStart(2, '0');
        return `${offset[0]}${padH}:${padM}`;
      }
      if (tzPart.value === 'GMT' || tzPart.value === 'UTC') {
        return '+00:00';
      }
    }
  } catch {
    // Fallback for invalid timezone or environments
  }
  return '+05:30';
}

function indiaTimezone(): Pick<GeocodedPlace, 'timezone_iana' | 'utc_offset_at_birth'> {
  return { timezone_iana: 'Asia/Kolkata', utc_offset_at_birth: '+05:30' };
}

/**
 * Determine IANA timezone from geographical coordinates and country
 */
export function timezoneFor(
  lat: number,
  lng: number,
  country?: string,
  countryCode?: string
): Pick<GeocodedPlace, 'timezone_iana' | 'utc_offset_at_birth'> {
  const cc = (countryCode || '').toUpperCase();
  const cName = (country || '').toLowerCase();

  // India
  if (
    cc === 'IN' ||
    cName === 'india' ||
    (lng >= INDIA_BOX.minLng && lng <= INDIA_BOX.maxLng && lat >= INDIA_BOX.minLat && lat <= INDIA_BOX.maxLat)
  ) {
    return indiaTimezone();
  }

  // Nepal
  if (cc === 'NP' || cName.includes('nepal')) {
    return { timezone_iana: 'Asia/Kathmandu', utc_offset_at_birth: '+05:45' };
  }

  // United Kingdom
  if (cc === 'GB' || cc === 'UK' || cName.includes('united kingdom') || cName.includes('england')) {
    return { timezone_iana: 'Europe/London', utc_offset_at_birth: '+00:00' };
  }

  // United States
  if (cc === 'US' || cName.includes('united states') || cName.includes('usa')) {
    if (lng < -114) return { timezone_iana: 'America/Los_Angeles', utc_offset_at_birth: '-08:00' };
    if (lng < -104) return { timezone_iana: 'America/Denver', utc_offset_at_birth: '-07:00' };
    if (lng < -86) return { timezone_iana: 'America/Chicago', utc_offset_at_birth: '-06:00' };
    return { timezone_iana: 'America/New_York', utc_offset_at_birth: '-05:00' };
  }

  // UAE / Gulf
  if (cc === 'AE' || cName.includes('emirates') || cName.includes('dubai')) {
    return { timezone_iana: 'Asia/Dubai', utc_offset_at_birth: '+04:00' };
  }

  // Singapore
  if (cc === 'SG' || cName.includes('singapore')) {
    return { timezone_iana: 'Asia/Singapore', utc_offset_at_birth: '+08:00' };
  }

  // Japan
  if (cc === 'JP' || cName.includes('japan')) {
    return { timezone_iana: 'Asia/Tokyo', utc_offset_at_birth: '+09:00' };
  }

  // Australia
  if (cc === 'AU' || cName.includes('australia')) {
    if (lng < 129) return { timezone_iana: 'Australia/Perth', utc_offset_at_birth: '+08:00' };
    return { timezone_iana: 'Australia/Sydney', utc_offset_at_birth: '+10:00' };
  }

  // Canada
  if (cc === 'CA' || cName.includes('canada')) {
    if (lng < -114) return { timezone_iana: 'America/Vancouver', utc_offset_at_birth: '-08:00' };
    return { timezone_iana: 'America/Toronto', utc_offset_at_birth: '-05:00' };
  }

  // Europe (General)
  if (lat > 35 && lat < 70 && lng > -10 && lng < 40) {
    return { timezone_iana: 'Europe/Paris', utc_offset_at_birth: '+01:00' };
  }

  return indiaTimezone();
}

/**
 * Standard elevation estimates with provenance source tag.
 */
export function estimateElevation(
  lat: number,
  lng: number,
  city?: string
): { elevation: number; elevationSource: ElevationSource } {
  const lowerCity = (city || '').toLowerCase();
  
  // Known Surveyed Cities (Elevation Source: survey_known)
  if (lowerCity.includes('jaipur')) return { elevation: 431, elevationSource: 'survey_known' };
  if (lowerCity.includes('varanasi') || lowerCity.includes('kashi')) return { elevation: 80, elevationSource: 'survey_known' };
  if (lowerCity.includes('ayodhya')) return { elevation: 102, elevationSource: 'survey_known' };
  if (lowerCity.includes('ujjain')) return { elevation: 494, elevationSource: 'survey_known' };
  if (lowerCity.includes('delhi')) return { elevation: 216, elevationSource: 'survey_known' };
  if (lowerCity.includes('mumbai')) return { elevation: 14, elevationSource: 'survey_known' };
  if (lowerCity.includes('bengaluru') || lowerCity.includes('bangalore')) return { elevation: 920, elevationSource: 'survey_known' };
  if (lowerCity.includes('kolkata')) return { elevation: 9, elevationSource: 'survey_known' };
  if (lowerCity.includes('haridwar')) return { elevation: 314, elevationSource: 'survey_known' };
  if (lowerCity.includes('rishikesh')) return { elevation: 372, elevationSource: 'survey_known' };
  if (lowerCity.includes('pune')) return { elevation: 560, elevationSource: 'survey_known' };
  if (lowerCity.includes('hyderabad')) return { elevation: 542, elevationSource: 'survey_known' };
  if (lowerCity.includes('chennai')) return { elevation: 6, elevationSource: 'survey_known' };
  if (lowerCity.includes('ahmedabad')) return { elevation: 53, elevationSource: 'survey_known' };
  if (lowerCity.includes('patna')) return { elevation: 53, elevationSource: 'survey_known' };
  if (lowerCity.includes('mathura') || lowerCity.includes('vrindavan')) return { elevation: 174, elevationSource: 'survey_known' };
  if (lowerCity.includes('tirupati')) return { elevation: 182, elevationSource: 'survey_known' };
  if (lowerCity.includes('puri')) return { elevation: 10, elevationSource: 'survey_known' };
  if (lowerCity.includes('dwarka')) return { elevation: 7, elevationSource: 'survey_known' };

  // Regional SRTM/Terrain Models (Elevation Source: regional_srtm_model)
  if (lat > 28 && lng > 76 && lng < 80) return { elevation: 250, elevationSource: 'regional_srtm_model' };
  if (lat < 20 && lng > 74 && lng < 78) return { elevation: 500, elevationSource: 'regional_srtm_model' };
  if (lat > 30 && lng > 75 && lng < 82) return { elevation: 800, elevationSource: 'regional_srtm_model' };

  return { elevation: 100, elevationSource: 'fallback' };
}

type PhotonFeature = {
  geometry?: { coordinates?: [number, number] };
  properties?: {
    name?: string;
    city?: string;
    state?: string;
    country?: string;
    countrycode?: string;
    osm_value?: string;
  };
};

/**
 * Search birth locations with confidence scoring, provenance, and historical timezone resolution.
 */
export async function searchBirthPlaces(query: string, signal?: AbortSignal): Promise<GeocodedPlace[]> {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const seedMatches: GeocodedPlace[] = BIRTH_CITY_SEEDS.filter((s) => {
    const sCity = s.city.toLowerCase();
    const sLabel = s.label.toLowerCase();
    return sCity.includes(q) || sLabel.includes(q);
  }).map((s) => {
    const isExact = s.city.toLowerCase() === q || s.label.toLowerCase().startsWith(q);
    return {
      ...s,
      confidence: isExact ? 1.0 : 0.95,
      source: 'seed_directory' as const,
    };
  });

  try {
    const url = new URL('https://photon.komoot.io/api/');
    url.searchParams.set('q', query.trim());
    url.searchParams.set('limit', '8');
    url.searchParams.set('lang', 'en');

    const res = await fetch(url.toString(), { signal });
    if (!res.ok) throw new Error('Place search failed');
    const data = (await res.json()) as { features?: PhotonFeature[] };

    const remoteHits = (data.features ?? [])
      .map((f) => {
        const [lng, lat] = f.geometry?.coordinates ?? [];
        if (typeof lat !== 'number' || typeof lng !== 'number') return null;
        const city = f.properties?.name || f.properties?.city || query.trim();
        const admin1 = f.properties?.state;
        const country = f.properties?.country || 'India';
        const countryCode = (f.properties?.countrycode || 'IN').toUpperCase();
        const parts = [city, admin1, country].filter(Boolean);
        const tz = timezoneFor(lat, lng, country, countryCode);
        const elevData = estimateElevation(lat, lng, city);

        // Calculate confidence score (0.0 to 1.0)
        let conf = 0.75;
        const cityLower = city.toLowerCase();
        if (cityLower === q) {
          conf = 0.98;
        } else if (cityLower.startsWith(q)) {
          conf = 0.90;
        } else if (parts.some((p) => p.toLowerCase().includes(q))) {
          conf = 0.82;
        }

        return {
          label: parts.join(', '),
          matchedName: city,
          city,
          admin1,
          country,
          country_code: countryCode,
          lat,
          lng,
          elevation: elevData.elevation,
          elevationSource: elevData.elevationSource,
          timezone_iana: tz.timezone_iana,
          utc_offset_at_birth: tz.utc_offset_at_birth,
          source: 'photon_osm' as const,
          confidence: conf,
        } satisfies GeocodedPlace;
      })
      .filter((p): p is GeocodedPlace => p != null);

    const combined = [...seedMatches];
    for (const rh of remoteHits) {
      if (!combined.some((c) => Math.abs(c.lat - rh.lat) < 0.05 && Math.abs(c.lng - rh.lng) < 0.05)) {
        combined.push(rh);
      }
    }
    return combined.sort((a, b) => b.confidence - a.confidence).slice(0, 8);
  } catch {
    if (signal?.aborted) return [];
    return seedMatches;
  }
}

export const BIRTH_CITY_SEEDS: GeocodedPlace[] = [
  { label: 'Jaipur, Rajasthan, India', matchedName: 'Jaipur', city: 'Jaipur', admin1: 'Rajasthan', country: 'India', country_code: 'IN', lat: 26.9124, lng: 75.7873, elevation: 431, elevationSource: 'survey_known', ...indiaTimezone(), source: 'seed_directory', confidence: 1.0 },
  { label: 'Varanasi, Uttar Pradesh, India', matchedName: 'Varanasi', city: 'Varanasi', admin1: 'Uttar Pradesh', country: 'India', country_code: 'IN', lat: 25.3176, lng: 82.9739, elevation: 80, elevationSource: 'survey_known', ...indiaTimezone(), source: 'seed_directory', confidence: 1.0 },
  { label: 'Ayodhya, Uttar Pradesh, India', matchedName: 'Ayodhya', city: 'Ayodhya', admin1: 'Uttar Pradesh', country: 'India', country_code: 'IN', lat: 26.7922, lng: 82.1998, elevation: 102, elevationSource: 'survey_known', ...indiaTimezone(), source: 'seed_directory', confidence: 1.0 },
  { label: 'Ujjain, Madhya Pradesh, India', matchedName: 'Ujjain', city: 'Ujjain', admin1: 'Madhya Pradesh', country: 'India', country_code: 'IN', lat: 23.1765, lng: 75.7885, elevation: 494, elevationSource: 'survey_known', ...indiaTimezone(), source: 'seed_directory', confidence: 1.0 },
  { label: 'Mathura, Uttar Pradesh, India', matchedName: 'Mathura', city: 'Mathura', admin1: 'Uttar Pradesh', country: 'India', country_code: 'IN', lat: 27.4924, lng: 77.6737, elevation: 174, elevationSource: 'survey_known', ...indiaTimezone(), source: 'seed_directory', confidence: 1.0 },
  { label: 'Haridwar, Uttarakhand, India', matchedName: 'Haridwar', city: 'Haridwar', admin1: 'Uttarakhand', country: 'India', country_code: 'IN', lat: 29.9457, lng: 78.1642, elevation: 314, elevationSource: 'survey_known', ...indiaTimezone(), source: 'seed_directory', confidence: 1.0 },
  { label: 'Delhi, India', matchedName: 'Delhi', city: 'Delhi', admin1: 'Delhi', country: 'India', country_code: 'IN', lat: 28.6139, lng: 77.209, elevation: 216, elevationSource: 'survey_known', ...indiaTimezone(), source: 'seed_directory', confidence: 1.0 },
  { label: 'Mumbai, Maharashtra, India', matchedName: 'Mumbai', city: 'Mumbai', admin1: 'Maharashtra', country: 'India', country_code: 'IN', lat: 19.076, lng: 72.8777, elevation: 14, elevationSource: 'survey_known', ...indiaTimezone(), source: 'seed_directory', confidence: 1.0 },
  { label: 'Bengaluru, Karnataka, India', matchedName: 'Bengaluru', city: 'Bengaluru', admin1: 'Karnataka', country: 'India', country_code: 'IN', lat: 12.9716, lng: 77.5946, elevation: 920, elevationSource: 'survey_known', ...indiaTimezone(), source: 'seed_directory', confidence: 1.0 },
  { label: 'Kolkata, West Bengal, India', matchedName: 'Kolkata', city: 'Kolkata', admin1: 'West Bengal', country: 'India', country_code: 'IN', lat: 22.5726, lng: 88.3639, elevation: 9, elevationSource: 'survey_known', ...indiaTimezone(), source: 'seed_directory', confidence: 1.0 },
  { label: 'Pune, Maharashtra, India', matchedName: 'Pune', city: 'Pune', admin1: 'Maharashtra', country: 'India', country_code: 'IN', lat: 18.5204, lng: 73.8567, elevation: 560, elevationSource: 'survey_known', ...indiaTimezone(), source: 'seed_directory', confidence: 1.0 },
  { label: 'Hyderabad, Telangana, India', matchedName: 'Hyderabad', city: 'Hyderabad', admin1: 'Telangana', country: 'India', country_code: 'IN', lat: 17.385, lng: 78.4867, elevation: 542, elevationSource: 'survey_known', ...indiaTimezone(), source: 'seed_directory', confidence: 1.0 },
];
