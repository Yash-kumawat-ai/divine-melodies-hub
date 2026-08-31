import { supabase } from '@/integrations/supabase/client';
import type { BirthProfileInput, BirthProfile, AstrologyProfile, CompleteKundliData } from './types';
import { calculateCompleteKundli } from './kundliEngine';

function computeFingerprint(input: BirthProfileInput): string {
  const parts = [
    input.date_of_birth.trim(),
    input.birth_time?.trim() || 'unknown',
    input.birth_time_accuracy,
    input.lat.toFixed(4),
    input.lng.toFixed(4),
    (input.timezone_iana || 'Asia/Kolkata').toLowerCase(),
    (input.utc_offset_at_birth || '+05:30').trim(),
  ];
  // Simple deterministic client hash string
  return parts.join('|');
}

function getCacheKey(userId: string) {
  return `raghavam_kundli_cache_${userId}`;
}

export function getCachedKundli(userId: string): { kundli: CompleteKundliData; astro: AstrologyProfile } | null {
  try {
    const raw = sessionStorage.getItem(getCacheKey(userId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCachedKundli(userId: string, data: { kundli: CompleteKundliData; astro: AstrologyProfile }) {
  try {
    sessionStorage.setItem(getCacheKey(userId), JSON.stringify(data));
    sessionStorage.setItem(`raghavam_birth_ready_${userId}`, '1');
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Save user birth profile, synchronously calculate complete Kundli,
 * persist to Supabase, and cache in client.
 */
export async function saveCompleteKundliProfile(
  userId: string,
  input: BirthProfileInput
): Promise<{ birth: BirthProfile; astro: AstrologyProfile; kundli: CompleteKundliData }> {
  // 1. Instant calculation with panchangam-js engine
  const kundli = calculateCompleteKundli(input);
  const fingerprint = computeFingerprint(input);
  const isUnknown = input.birth_time_accuracy === 'unknown';
  const completeness = isUnknown ? 'limited' : 'full';

  // 2. Prepare Birth Profile DB Row
  const birthRow: Partial<BirthProfile> = {
    user_id: userId,
    date_of_birth: input.date_of_birth,
    birth_time: input.birth_time || null,
    birth_time_accuracy: input.birth_time_accuracy,
    gender: input.gender,
    place_query: input.place_query,
    place_label: input.place_label,
    country_code: input.country_code || 'IN',
    admin1: input.admin1,
    lat: input.lat,
    lng: input.lng,
    timezone_iana: input.timezone_iana || 'Asia/Kolkata',
    utc_offset_at_birth: input.utc_offset_at_birth || '+05:30',
    input_fingerprint: fingerprint,
    updated_at: new Date().toISOString(),
  };

  // 3. Prepare Astrology Profile DB Row
  const astroRow: Partial<AstrologyProfile> = {
    user_id: userId,
    status: 'ready',
    profile_completeness: completeness,
    planets_ready: true,
    houses_ready: !isUnknown,
    core_ready: true,
    dasha_ready: !isUnknown,
    predictions_ready: true,
    ayanamsa: kundli.ayanamsa,
    core_chart: {
      lagna: kundli.ascendant,
      planets: kundli.planets,
      houses: kundli.houses,
      moon_sign: kundli.planets.Moon?.sign,
      moon_sign_hi: kundli.planets.Moon?.rashiNameHindi,
      sun_sign: kundli.planets.Sun?.sign,
      sun_sign_hi: kundli.planets.Sun?.rashiNameHindi,
      nakshatra: kundli.panchanga?.nakshatra,
      nakshatra_pada: kundli.ascendant?.pada,
    },
    dasha: kundli.dasha,
    vargas: kundli.vargas,
    mangal_dosha: kundli.mangalDosha,
    ishta_devata: kundli.ishtaDevata,
    panchanga_birth: kundli.panchanga,
    predictions: kundli.predictions,
    input_fingerprint: fingerprint,
    calculated_at: kundli.calculatedAt,
    updated_at: new Date().toISOString(),
  };

  // 4. Save to Supabase (Birth Profile & Astrology Profile)
  try {
    const [birthRes, astroRes] = await Promise.all([
      supabase
        .from('astrology_birth_profiles')
        .upsert(birthRow, { onConflict: 'user_id' })
        .select()
        .single(),
      supabase
        .from('astrology_profiles')
        .upsert(astroRow, { onConflict: 'user_id' })
        .select()
        .single(),
    ]);

    if (birthRes.error) {
      console.warn('Birth profile upsert warning:', birthRes.error);
    }
    if (astroRes.error) {
      console.warn('Astrology profile upsert warning:', astroRes.error);
    }
  } catch (dbErr) {
    console.error('Database persist error:', dbErr);
  }

  // 5. Cache in client session
  const finalAstro = astroRow as AstrologyProfile;
  const finalBirth = birthRow as BirthProfile;
  setCachedKundli(userId, { kundli, astro: finalAstro });

  return {
    birth: finalBirth,
    astro: finalAstro,
    kundli,
  };
}

/**
 * Backward compatible wrapper for saving birth profile
 */
export async function saveBirthProfile(input: BirthProfileInput, options?: { forceReenqueue?: boolean }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');
  return saveCompleteKundliProfile(user.id, input);
}

/**
 * Get or instantly calculate and sync user's Kundli
 */
export async function getOrComputeAstrologyProfile(userId: string): Promise<{
  birth: BirthProfile | null;
  astro: AstrologyProfile | null;
  kundli: CompleteKundliData | null;
}> {
  // 1. Fast cache hit
  const cached = getCachedKundli(userId);
  if (cached) {
    const birth = await getBirthProfile(userId);
    return {
      birth,
      astro: cached.astro,
      kundli: cached.kundli,
    };
  }

  // 2. Fetch from DB
  const [birthData, astroData] = await Promise.all([
    getBirthProfile(userId),
    getAstrologyProfile(userId),
  ]);

  if (!birthData) {
    return { birth: null, astro: null, kundli: null };
  }

  // 3. If birthData exists, ensure we have ready Kundli
  let computedKundli: CompleteKundliData;
  try {
    computedKundli = calculateCompleteKundli(birthData);
  } catch (err) {
    console.error('Error computing kundli from birth profile:', err);
    return { birth: birthData, astro: astroData, kundli: null };
  }

  // If astroData in DB was missing or pending, sync it
  if (!astroData || astroData.status !== 'ready' || !astroData.core_chart) {
    void saveCompleteKundliProfile(userId, birthData);
  } else {
    setCachedKundli(userId, { kundli: computedKundli, astro: astroData });
  }

  return {
    birth: birthData,
    astro: astroData || (computedKundli as unknown as AstrologyProfile),
    kundli: computedKundli,
  };
}

/**
 * Read astrology row from Supabase
 */
export async function getAstrologyProfile(userId: string): Promise<AstrologyProfile | null> {
  const { data, error } = await supabase
    .from('astrology_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error loading astrology profile:', error);
    return null;
  }

  return data as AstrologyProfile | null;
}

/**
 * Read birth row from Supabase
 */
export async function getBirthProfile(userId: string): Promise<BirthProfile | null> {
  const { data, error } = await supabase
    .from('astrology_birth_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error loading birth profile:', error);
    return null;
  }

  return data as BirthProfile | null;
}
