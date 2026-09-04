import { describe, it, expect } from 'vitest';
import {
  calculateCompleteKundli,
  calculateAtmakaraka,
  parseBirthDateTime,
  parseOffsetToMinutes,
  RASHI_NAMES,
} from '../kundliEngine';
import type { BirthProfileInput } from '../types';

/**
 * INDEPENDENT CLASSICAL SIGN -> LORD MAPPING
 * Defined completely independently of any implementation in the codebase.
 */
const INDEPENDENT_SIGN_LORDS: Record<string, { index: number; lord: string; lordHi: string }> = {
  Aries:       { index: 0,  lord: 'Mars',    lordHi: 'मंगल' },
  Taurus:      { index: 1,  lord: 'Venus',   lordHi: 'शुक्र' },
  Gemini:      { index: 2,  lord: 'Mercury', lordHi: 'बुध' },
  Cancer:      { index: 3,  lord: 'Moon',    lordHi: 'चन्द्र' },
  Leo:         { index: 4,  lord: 'Sun',     lordHi: 'सूर्य' },
  Virgo:       { index: 5,  lord: 'Mercury', lordHi: 'बुध' },
  Libra:       { index: 6,  lord: 'Venus',   lordHi: 'शुक्र' },
  Scorpio:     { index: 7,  lord: 'Mars',    lordHi: 'मंगल' },
  Sagittarius: { index: 8,  lord: 'Jupiter', lordHi: 'गुरु' },
  Capricorn:   { index: 9,  lord: 'Saturn',  lordHi: 'शनि' },
  Aquarius:    { index: 10, lord: 'Saturn',  lordHi: 'शनि' },
  Pisces:      { index: 11, lord: 'Jupiter', lordHi: 'गुरु' },
};

const INDEPENDENT_INDEX_TO_SIGN: Record<number, string> = {
  0: 'Aries',
  1: 'Taurus',
  2: 'Gemini',
  3: 'Cancer',
  4: 'Leo',
  5: 'Virgo',
  6: 'Libra',
  7: 'Scorpio',
  8: 'Sagittarius',
  9: 'Capricorn',
  10: 'Aquarius',
  11: 'Pisces',
};

describe('Phase 0 — Section 3: Independent Sign → Lord Mapping Verification', () => {
  it('matches classical Parashari sign-lord rulership for all 12 signs in RASHI_NAMES', () => {
    for (const [signName, expected] of Object.entries(INDEPENDENT_SIGN_LORDS)) {
      const engineSign = RASHI_NAMES[expected.index];
      expect(engineSign).toBeDefined();
      expect(engineSign.en).toBe(signName);
      expect(engineSign.lord).toBe(expected.lord);
      expect(engineSign.lordHi).toBe(expected.lordHi);
    }
  });

  it('demonstrates that every Lagna sign maps to its distinct classical lord without hardcoding', () => {
    const lords = RASHI_NAMES.map((r) => r.lord);
    // There must be 7 distinct physical lords across the 12 signs
    const uniqueLords = Array.from(new Set(lords));
    expect(uniqueLords.sort()).toEqual(['Jupiter', 'Mars', 'Mercury', 'Moon', 'Saturn', 'Sun', 'Venus'].sort());

    // Verify dual ownerships
    expect(RASHI_NAMES[0].lord).toBe('Mars');      // Aries
    expect(RASHI_NAMES[7].lord).toBe('Mars');      // Scorpio
    expect(RASHI_NAMES[1].lord).toBe('Venus');     // Taurus
    expect(RASHI_NAMES[6].lord).toBe('Venus');     // Libra
    expect(RASHI_NAMES[2].lord).toBe('Mercury');   // Gemini
    expect(RASHI_NAMES[5].lord).toBe('Mercury');   // Virgo
    expect(RASHI_NAMES[8].lord).toBe('Jupiter');   // Sagittarius
    expect(RASHI_NAMES[11].lord).toBe('Jupiter');  // Pisces
    expect(RASHI_NAMES[9].lord).toBe('Saturn');    // Capricorn
    expect(RASHI_NAMES[10].lord).toBe('Saturn');   // Aquarius
    expect(RASHI_NAMES[3].lord).toBe('Moon');      // Cancer
    expect(RASHI_NAMES[4].lord).toBe('Sun');       // Leo
  });
});

describe('Phase 0 — Section 4 & 5: Verification Dataset (5 Profiles, Different Lagna Signs)', () => {
  // Profile 1: Gemini Lagna
  const profileJaipur: BirthProfileInput = {
    date_of_birth: '2005-02-05',
    birth_time: '15:00',
    birth_time_accuracy: 'exact',
    gender: 'male',
    place_query: 'Jaipur, Rajasthan, India',
    place_label: 'Jaipur, Rajasthan, India',
    lat: 26.9124,
    lng: 75.7873,
    elevation: 431,
    timezone_iana: 'Asia/Kolkata',
    utc_offset_at_birth: '+05:30',
  };

  // Profile 2: Aries Lagna
  const profileDelhi: BirthProfileInput = {
    date_of_birth: '2024-04-14',
    birth_time: '06:15',
    birth_time_accuracy: 'exact',
    gender: 'female',
    place_query: 'New Delhi, India',
    place_label: 'New Delhi, India',
    lat: 28.6139,
    lng: 77.2090,
    elevation: 216,
    timezone_iana: 'Asia/Kolkata',
    utc_offset_at_birth: '+05:30',
  };

  // Profile 3: Libra Lagna (BST summer daylight saving time)
  const profileLondon: BirthProfileInput = {
    date_of_birth: '1990-08-15',
    birth_time: '12:00',
    birth_time_accuracy: 'exact',
    gender: 'male',
    place_query: 'London, UK',
    place_label: 'London, UK',
    lat: 51.5074,
    lng: -0.1278,
    elevation: 25,
    timezone_iana: 'Europe/London',
    utc_offset_at_birth: '+01:00',
  };

  // Profile 4: Capricorn Lagna
  const profileTokyo: BirthProfileInput = {
    date_of_birth: '2000-11-20',
    birth_time: '12:00',
    birth_time_accuracy: 'exact',
    gender: 'female',
    place_query: 'Tokyo, Japan',
    place_label: 'Tokyo, Japan',
    lat: 35.6762,
    lng: 139.6503,
    elevation: 40,
    timezone_iana: 'Asia/Tokyo',
    utc_offset_at_birth: '+09:00',
  };

  // Profile 5: Sagittarius Lagna
  const profileNewYork: BirthProfileInput = {
    date_of_birth: '2012-01-01',
    birth_time: '07:30',
    birth_time_accuracy: 'exact',
    gender: 'male',
    place_query: 'New York, USA',
    place_label: 'New York, USA',
    lat: 40.7128,
    lng: -74.0060,
    elevation: 10,
    timezone_iana: 'America/New_York',
    utc_offset_at_birth: '-05:00',
  };

  it('Profile 1 (Jaipur): calculates Gemini Lagna, Mercury lord, Jupiter 7th lord, Jupiter 10th lord', () => {
    const k = calculateCompleteKundli(profileJaipur);
    expect(k.ascendant).toBeDefined();
    expect(k.ascendant?.rashi).toBe(2);
    expect(k.ascendant?.rashiName).toBe('Gemini');
    expect(k.ascendant?.lord).toBe('Mercury');

    // Independent 7th house calculation: (2 + 6) % 12 = 8 (Sagittarius -> Jupiter)
    const h7 = k.houses.find((h) => h.number === 7);
    expect(h7).toBeDefined();
    expect(h7?.rashi).toBe(8);
    expect(h7?.rashiName).toBe('Sagittarius');
    expect(h7?.lord).toBe('Jupiter');

    // Independent 10th house calculation: (2 + 9) % 12 = 11 (Pisces -> Jupiter)
    const h10 = k.houses.find((h) => h.number === 10);
    expect(h10).toBeDefined();
    expect(h10?.rashi).toBe(11);
    expect(h10?.rashiName).toBe('Pisces');
    expect(h10?.lord).toBe('Jupiter');

    // Moon and Atmakaraka
    expect(k.planets.Moon.sign).toBe('Sagittarius');
    expect(k.planets.Moon.nakshatra).toBe('Mula');
    const ak = calculateAtmakaraka(k.planets);
    expect(ak.planet).toBe('Saturn');
  });

  it('Profile 2 (Delhi): calculates Aries Lagna, Mars lord, Venus 7th lord, Saturn 10th lord', () => {
    const k = calculateCompleteKundli(profileDelhi);
    expect(k.ascendant).toBeDefined();
    expect(k.ascendant?.rashi).toBe(0);
    expect(k.ascendant?.rashiName).toBe('Aries');
    expect(k.ascendant?.lord).toBe('Mars');

    // Independent 7th house calculation: (0 + 6) % 12 = 6 (Libra -> Venus)
    const h7 = k.houses.find((h) => h.number === 7);
    expect(h7?.rashi).toBe(6);
    expect(h7?.rashiName).toBe('Libra');
    expect(h7?.lord).toBe('Venus');

    // Independent 10th house calculation: (0 + 9) % 12 = 9 (Capricorn -> Saturn)
    const h10 = k.houses.find((h) => h.number === 10);
    expect(h10?.rashi).toBe(9);
    expect(h10?.rashiName).toBe('Capricorn');
    expect(h10?.lord).toBe('Saturn');

    expect(k.planets.Moon.sign).toBe('Gemini');
    expect(k.planets.Moon.nakshatra).toBe('Ardra');
    const ak = calculateAtmakaraka(k.planets);
    expect(ak.planet).toBe('Mercury');
  });

  it('Profile 3 (London): calculates Libra Lagna, Venus lord, Mars 7th lord, Moon 10th lord', () => {
    const k = calculateCompleteKundli(profileLondon);
    expect(k.ascendant).toBeDefined();
    expect(k.ascendant?.rashi).toBe(6);
    expect(k.ascendant?.rashiName).toBe('Libra');
    expect(k.ascendant?.lord).toBe('Venus');

    // Independent 7th house calculation: (6 + 6) % 12 = 0 (Aries -> Mars)
    const h7 = k.houses.find((h) => h.number === 7);
    expect(h7?.rashi).toBe(0);
    expect(h7?.rashiName).toBe('Aries');
    expect(h7?.lord).toBe('Mars');

    // Independent 10th house calculation: (6 + 9) % 12 = 3 (Cancer -> Moon)
    const h10 = k.houses.find((h) => h.number === 10);
    expect(h10?.rashi).toBe(3);
    expect(h10?.rashiName).toBe('Cancer');
    expect(h10?.lord).toBe('Moon');

    expect(k.planets.Moon.sign).toBe('Taurus');
    expect(k.planets.Moon.nakshatra).toBe('Rohini');
    const ak = calculateAtmakaraka(k.planets);
    expect(ak.planet).toBe('Sun');
  });

  it('Profile 4 (Tokyo): calculates Capricorn Lagna, Saturn lord, Moon 7th lord, Venus 10th lord', () => {
    const k = calculateCompleteKundli(profileTokyo);
    expect(k.ascendant).toBeDefined();
    expect(k.ascendant?.rashi).toBe(9);
    expect(k.ascendant?.rashiName).toBe('Capricorn');
    expect(k.ascendant?.lord).toBe('Saturn');

    // Independent 7th house calculation: (9 + 6) % 12 = 3 (Cancer -> Moon)
    const h7 = k.houses.find((h) => h.number === 7);
    expect(h7?.rashi).toBe(3);
    expect(h7?.rashiName).toBe('Cancer');
    expect(h7?.lord).toBe('Moon');

    // Independent 10th house calculation: (9 + 9) % 12 = 6 (Libra -> Venus)
    const h10 = k.houses.find((h) => h.number === 10);
    expect(h10?.rashi).toBe(6);
    expect(h10?.rashiName).toBe('Libra');
    expect(h10?.lord).toBe('Venus');

    expect(k.planets.Moon.sign).toBe('Leo');
    const ak = calculateAtmakaraka(k.planets);
    expect(ak.planet).toBe('Moon');
  });

  it('Profile 5 (New York): calculates Sagittarius Lagna, Jupiter lord, Mercury 7th lord, Mercury 10th lord', () => {
    const k = calculateCompleteKundli(profileNewYork);
    expect(k.ascendant).toBeDefined();
    expect(k.ascendant?.rashi).toBe(8);
    expect(k.ascendant?.rashiName).toBe('Sagittarius');
    expect(k.ascendant?.lord).toBe('Jupiter');

    // Independent 7th house calculation: (8 + 6) % 12 = 2 (Gemini -> Mercury)
    const h7 = k.houses.find((h) => h.number === 7);
    expect(h7?.rashi).toBe(2);
    expect(h7?.rashiName).toBe('Gemini');
    expect(h7?.lord).toBe('Mercury');

    // Independent 10th house calculation: (8 + 9) % 12 = 5 (Virgo -> Mercury)
    const h10 = k.houses.find((h) => h.number === 10);
    expect(h10?.rashi).toBe(5);
    expect(h10?.rashiName).toBe('Virgo');
    expect(h10?.lord).toBe('Mercury');

    expect(k.planets.Moon.sign).toBe('Pisces');
    const ak = calculateAtmakaraka(k.planets);
    expect(ak.planet).toBe('Mercury');
    expect(ak.degreeInSign).toBeCloseTo(26.51, 1);
  });

  it('REGRESSION TEST: Lagna Lord is NEVER unconditionally Jupiter/Brihaspati across profiles', () => {
    const kJaipur = calculateCompleteKundli(profileJaipur);
    const kDelhi = calculateCompleteKundli(profileDelhi);
    const kLondon = calculateCompleteKundli(profileLondon);
    const kTokyo = calculateCompleteKundli(profileTokyo);
    const kNewYork = calculateCompleteKundli(profileNewYork);

    expect(kJaipur.ascendant?.lord).toBe('Mercury');
    expect(kDelhi.ascendant?.lord).toBe('Mars');
    expect(kLondon.ascendant?.lord).toBe('Venus');
    expect(kTokyo.ascendant?.lord).toBe('Saturn');
    expect(kNewYork.ascendant?.lord).toBe('Jupiter');

    // Prove that Lagna Lord strictly varies with the Ascendant sign
    const distinctLords = new Set([
      kJaipur.ascendant?.lord,
      kDelhi.ascendant?.lord,
      kLondon.ascendant?.lord,
      kTokyo.ascendant?.lord,
      kNewYork.ascendant?.lord,
    ]);
    expect(distinctLords.size).toBe(5);
  });
});

describe('Phase 0 — Section 6: Atmakaraka (AK) Derivation Verification', () => {
  it('correctly derives Atmakaraka using the classical 7-Karaka Parashari convention', () => {
    const testPlanets = {
      Sun:     { longitude: 22.5 },
      Moon:    { longitude: 44.2 },  // 14.2° Taurus
      Mars:    { longitude: 118.9 }, // 28.9° Cancer
      Mercury: { longitude: 161.0 }, // 11.0° Virgo
      Jupiter: { longitude: 245.4 }, // 5.4° Sagittarius
      Venus:   { longitude: 319.8 }, // 19.8° Aquarius
      Saturn:  { longitude: 25.1 },  // 25.1° Aries
      Rahu:    { longitude: 29.5 },  // 29.5° Aries (Rahu should be excluded in 7-Karaka pool)
      Ketu:    { longitude: 209.5 },
    };

    const ak = calculateAtmakaraka(testPlanets);
    expect(ak.planet).toBe('Mars');
    expect(ak.degreeInSign).toBeCloseTo(28.9, 2);
  });

  it('excludes Rahu and Ketu from the Atmakaraka pool according to frozen vedicConfig', () => {
    const planetsWithHighRahu = {
      Sun:     { longitude: 28.5 },
      Moon:    { longitude: 10.0 },
      Mars:    { longitude: 15.0 },
      Mercury: { longitude: 20.0 },
      Jupiter: { longitude: 12.0 },
      Venus:   { longitude: 18.0 },
      Saturn:  { longitude: 22.0 },
      Rahu:    { longitude: 29.8 }, // highest, but Rahu is excluded
      Ketu:    { longitude: 209.8 },
    };

    const ak = calculateAtmakaraka(planetsWithHighRahu);
    expect(ak.planet).toBe('Sun');
    expect(ak.degreeInSign).toBeCloseTo(28.5, 2);
  });
});

describe('Phase 0 — Section 9: Shadbala Verification', () => {
  it('confirms that Shadbala is not present in rawKundli or kundliEngine', () => {
    const input: BirthProfileInput = {
      date_of_birth: '2005-02-05',
      birth_time: '15:00',
      birth_time_accuracy: 'exact',
      gender: 'male',
      place_query: 'Jaipur, Rajasthan, India',
      place_label: 'Jaipur, Rajasthan, India',
      lat: 26.9124,
      lng: 75.7873,
      elevation: 431,
      timezone_iana: 'Asia/Kolkata',
      utc_offset_at_birth: '+05:30',
    };

    const k = calculateCompleteKundli(input);

    expect((k as any).shadbala).toBeUndefined();
    expect((k.planets.Sun as any).shadbala).toBeUndefined();
  });
});

describe('Phase 0 — Section 10: D1, D9 (Navamsha) and D10 (Dasamsa) Mathematical Verification', () => {
  it('verifies D9 Navamsha sign calculation adheres to BPHS formula floor(lon * 108 / 360) % 12', () => {
    const input: BirthProfileInput = {
      date_of_birth: '2005-02-05',
      birth_time: '15:00',
      birth_time_accuracy: 'exact',
      gender: 'male',
      place_query: 'Jaipur, Rajasthan, India',
      place_label: 'Jaipur, Rajasthan, India',
      lat: 26.9124,
      lng: 75.7873,
      elevation: 431,
      timezone_iana: 'Asia/Kolkata',
      utc_offset_at_birth: '+05:30',
    };

    const k = calculateCompleteKundli(input);
    const d9 = k.vargas?.d9;
    expect(d9).toBeDefined();
    expect(d9.ascendant).toBeDefined();

    const expectedD9LagnaRashi = Math.floor((k.ascendant!.longitude * 108) / 360) % 12;
    expect(d9.ascendant.rashi).toBe(expectedD9LagnaRashi);
    expect(d9.ascendant.rashiName).toBe(INDEPENDENT_INDEX_TO_SIGN[expectedD9LagnaRashi]);

    const REQUIRED_GRAHAS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    for (const g of REQUIRED_GRAHAS) {
      const d1Planet = k.planets[g];
      const d9Planet = d9.planets[g];
      expect(d9Planet).toBeDefined();

      const expectedD9Rashi = Math.floor(((d1Planet.longitude ?? 0) * 108) / 360) % 12;
      expect(d9Planet.rashi).toBe(expectedD9Rashi);
      expect(d9Planet.rashiName).toBe(INDEPENDENT_INDEX_TO_SIGN[expectedD9Rashi]);
    }
  });

  it('verifies D10 Dasamsa sign calculation adheres to BPHS odd/even sign formula', () => {
    const input: BirthProfileInput = {
      date_of_birth: '2005-02-05',
      birth_time: '15:00',
      birth_time_accuracy: 'exact',
      gender: 'male',
      place_query: 'Jaipur, Rajasthan, India',
      place_label: 'Jaipur, Rajasthan, India',
      lat: 26.9124,
      lng: 75.7873,
      elevation: 431,
      timezone_iana: 'Asia/Kolkata',
      utc_offset_at_birth: '+05:30',
    };

    const k = calculateCompleteKundli(input);
    const d10 = k.vargas?.d10;
    expect(d10).toBeDefined();
    expect(d10.ascendant).toBeDefined();

    const calcD10 = (lon: number) => {
      const rashi = Math.floor(lon / 30);
      const deg = lon % 30;
      const part = Math.floor(deg / 3);
      const isOdd = rashi % 2 === 0;
      return isOdd ? (rashi + part) % 12 : ((rashi + 8) % 12 + part) % 12;
    };

    const expectedD10LagnaRashi = calcD10(k.ascendant!.longitude);
    expect(d10.ascendant.rashi).toBe(expectedD10LagnaRashi);

    const REQUIRED_GRAHAS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    for (const g of REQUIRED_GRAHAS) {
      const d1Planet = k.planets[g];
      const d10Planet = d10.planets[g];
      expect(d10Planet).toBeDefined();

      const expectedD10Rashi = calcD10(d1Planet.longitude ?? 0);
      expect(d10Planet.rashi).toBe(expectedD10Rashi);
    }
  });
});

describe('Phase 0 — Section 11: Mangal Dosha Calculation', () => {
  it('correctly evaluates Mangal Dosha from Lagna, Moon, and Venus with cancellation', () => {
    const input: BirthProfileInput = {
      date_of_birth: '2005-02-05',
      birth_time: '15:00',
      birth_time_accuracy: 'exact',
      gender: 'male',
      place_query: 'Jaipur, Rajasthan, India',
      place_label: 'Jaipur, Rajasthan, India',
      lat: 26.9124,
      lng: 75.7873,
      elevation: 431,
      timezone_iana: 'Asia/Kolkata',
      utc_offset_at_birth: '+05:30',
    };

    const k = calculateCompleteKundli(input);
    expect(k.mangalDosha).toBeDefined();
    expect(typeof k.mangalDosha?.hasDosha).toBe('boolean');
    expect(typeof k.mangalDosha?.isHigh).toBe('boolean');
    expect(Array.isArray(k.mangalDosha?.factors)).toBe(true);
    expect(Array.isArray(k.mangalDosha?.remedies)).toBe(true);

    expect(k.mangalDosha?.hasDosha).toBe(true);
    expect(k.mangalDosha?.isHigh).toBe(true);
  });
});

describe('Phase 0 — Section 12: Vimshottari Dasha Integrity', () => {
  it('correctly resolves birth balance, full cycle, and current live active dasha', () => {
    const input: BirthProfileInput = {
      date_of_birth: '2005-02-05',
      birth_time: '15:00',
      birth_time_accuracy: 'exact',
      gender: 'male',
      place_query: 'Jaipur, Rajasthan, India',
      place_label: 'Jaipur, Rajasthan, India',
      lat: 26.9124,
      lng: 75.7873,
      elevation: 431,
      timezone_iana: 'Asia/Kolkata',
      utc_offset_at_birth: '+05:30',
    };

    const k = calculateCompleteKundli(input);
    const dasha = k.dasha;
    expect(dasha).toBeDefined();

    expect(dasha?.birthNakshatra).toBe('Mula');
    expect(dasha?.dashaBalance).toContain('Ketu');

    expect(dasha?.fullCycle).toBeDefined();
    expect(dasha?.fullCycle?.length).toBe(9);

    const firstPeriod = dasha?.fullCycle?.[0];
    expect(firstPeriod?.planet).toBe('Ketu');

    const secondPeriod = dasha?.fullCycle?.[1];
    expect(secondPeriod?.planet).toBe('Venus');

    expect(dasha?.current_mahadasha).toBe('Venus');
    expect(dasha?.currentMahadasha?.planet).toBe('Venus');
    expect(dasha?.currentAntardasha?.planet).toBeDefined();
  });
});

describe('Phase 0 — Section 13: Boundary Conditions', () => {
  it('handles sign boundary transition cleanly without NaN or out-of-bound errors', () => {
    const boundaryInput: BirthProfileInput = {
      date_of_birth: '2024-04-14',
      birth_time: '05:45',
      birth_time_accuracy: 'exact',
      gender: 'male',
      place_query: 'New Delhi, India',
      place_label: 'New Delhi, India',
      lat: 28.6139,
      lng: 77.2090,
      elevation: 216,
      timezone_iana: 'Asia/Kolkata',
      utc_offset_at_birth: '+05:30',
    };

    const k = calculateCompleteKundli(boundaryInput);
    expect(k.ascendant).toBeDefined();
    expect(k.ascendant?.rashi).toBeGreaterThanOrEqual(0);
    expect(k.ascendant?.rashi).toBeLessThan(12);
    expect(k.ascendant?.degree).toBeGreaterThanOrEqual(0);
    expect(k.ascendant?.degree).toBeLessThan(30);
    expect(k.ascendant?.lord).toBeDefined();
    expect(k.houses.length).toBe(12);
  });

  it('handles midnight transition cleanly with localized timezone offset', () => {
    const midnightInput: BirthProfileInput = {
      date_of_birth: '2020-01-01',
      birth_time: '00:01',
      birth_time_accuracy: 'exact',
      gender: 'female',
      place_query: 'Kolkata, India',
      place_label: 'Kolkata, India',
      lat: 22.5726,
      lng: 88.3639,
      elevation: 9,
      timezone_iana: 'Asia/Kolkata',
      utc_offset_at_birth: '+05:30',
    };

    const k = calculateCompleteKundli(midnightInput);
    expect(k.ascendant).toBeDefined();
    expect(k.ascendant?.longitude).toBeGreaterThanOrEqual(0);
    expect(k.ascendant?.longitude).toBeLessThan(360);
    expect(k.calculationContext?.utcInstant).toBe('2019-12-31T18:31:00.000Z');
  });

  it('handles floating point coordinates and non-standard elevations', () => {
    const highAltitudeInput: BirthProfileInput = {
      date_of_birth: '1998-05-12',
      birth_time: '11:45',
      birth_time_accuracy: 'exact',
      gender: 'other',
      place_query: 'Leh, Ladakh, India',
      place_label: 'Leh, Ladakh, India',
      lat: 34.152588,
      lng: 77.577051,
      elevation: 3500,
      timezone_iana: 'Asia/Kolkata',
      utc_offset_at_birth: '+05:30',
    };

    const k = calculateCompleteKundli(highAltitudeInput);
    expect(k.ascendant).toBeDefined();
    expect(k.planets.Sun.longitude).toBeGreaterThanOrEqual(0);
    expect(k.planets.Sun.longitude).toBeLessThan(360);
  });
});
