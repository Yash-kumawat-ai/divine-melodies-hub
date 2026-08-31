import { describe, it, expect } from 'vitest';
import {
  calculateCompleteKundli,
  parseBirthDateTime,
  parseOffsetToMinutes,
  calculateAtmakaraka,
  determineIshtaDevata,
  validateCompleteKundli,
} from '../kundliEngine';
import type { BirthProfileInput } from '../types';

describe('Vedic Kundli Engine (@ishubhamx/panchangam-js)', () => {
  it('correctly parses localized birth datetime with offset into exact UTC instant', () => {
    const d = parseBirthDateTime('2005-02-05', '15:00', '+05:30');
    expect(d.toISOString()).toBe('2005-02-05T09:30:00.000Z');

    const dWestern = parseBirthDateTime('2005-02-05', '04:30', '-05:00');
    expect(dWestern.toISOString()).toBe('2005-02-05T09:30:00.000Z');
  });

  it('correctly converts UTC offset strings into total minutes east of UTC', () => {
    expect(parseOffsetToMinutes('+05:30')).toBe(330);
    expect(parseOffsetToMinutes('+0530')).toBe(330);
    expect(parseOffsetToMinutes('-05:00')).toBe(-300);
    expect(parseOffsetToMinutes('+00:00')).toBe(0);
    expect(parseOffsetToMinutes(null)).toBe(330);
  });

  it('accurately resolves historical IANA timezone offsets and DST transitions without external packages', async () => {
    const { resolveHistoricalUtcOffset } = await import('../geocodePlace');
    
    // India (IST is fixed +05:30)
    expect(resolveHistoricalUtcOffset('2005-02-05', '15:00', 'Asia/Kolkata')).toBe('+05:30');

    // New York (EDT summer -04:00 vs EST winter -05:00)
    expect(resolveHistoricalUtcOffset('2005-07-04', '15:00', 'America/New_York')).toBe('-04:00');
    expect(resolveHistoricalUtcOffset('2005-01-15', '15:00', 'America/New_York')).toBe('-05:00');

    // London (BST summer +01:00 vs GMT winter +00:00)
    expect(resolveHistoricalUtcOffset('2005-06-21', '15:00', 'Europe/London')).toBe('+01:00');
    expect(resolveHistoricalUtcOffset('2005-12-25', '15:00', 'Europe/London')).toBe('+00:00');

    // Tokyo (JST +09:00)
    expect(resolveHistoricalUtcOffset('2005-02-05', '15:00', 'Asia/Tokyo')).toBe('+09:00');
  });

  it('calculates complete verified Kundli JSON for Jaipur audit profile (5 Feb 2005, 15:00 IST)', () => {
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

    // 1. Execute calculation
    const kundli = calculateCompleteKundli(input);

    // Warm calculation completes rapidly (< 1000ms in parallel test runner)
    const t0 = performance.now();
    calculateCompleteKundli(input);
    const warmElapsed = performance.now() - t0;
    expect(warmElapsed).toBeLessThan(1000);

    // 2. Calculation Context & Provenance
    expect(kundli.calculationContext).toBeDefined();
    expect(kundli.calculationContext?.engine).toBe('@ishubhamx/panchangam-js');
    expect(kundli.calculationContext?.engineVersion).toBe('3.0.0');
    expect(kundli.calculationContext?.calculationVersion).toBe(1);
    expect(kundli.calculationContext?.utcInstant).toBe('2005-02-05T09:30:00.000Z');
    expect(kundli.calculationContext?.historicalUtcOffset).toBe('+05:30');
    expect(kundli.calculationContext?.inputHash).toBeDefined();
    expect(kundli.calculationContext?.houseSystem).toBe('whole_sign');

    // 3. Ascendant (Lagna)
    expect(kundli.ascendant).toBeDefined();
    expect(kundli.ascendant?.rashiName).toBe('Gemini');
    expect(kundli.ascendant?.rashiNameHi).toBe('मिथुन');
    expect(kundli.ascendant?.rashi).toBe(2);
    expect(kundli.ascendant?.longitude).toBeCloseTo(72.08, 1);
    expect(kundli.ascendant?.nakshatra).toBe('Ardra');

    // 4. Navagraha Planets
    expect(kundli.planets).toBeDefined();
    const REQUIRED_GRAHAS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    for (const g of REQUIRED_GRAHAS) {
      const pl = kundli.planets[g];
      expect(pl).toBeDefined();
      expect(typeof pl.longitude).toBe('number');
      expect(isNaN(pl.longitude!)).toBe(false);
      expect(pl.longitude!).toBeGreaterThanOrEqual(0);
      expect(pl.longitude!).toBeLessThan(360);
      expect(pl.degree).toBeGreaterThanOrEqual(0);
      expect(pl.degree).toBeLessThan(30);
    }

    // Moon is in Sagittarius (Dhanu) in Mula Nakshatra
    expect(kundli.planets.Moon.sign).toBe('Sagittarius');
    expect(kundli.planets.Moon.nakshatra).toBe('Mula');
    expect(kundli.planets.Moon.nakshatraLord).toBe('Ketu');

    // Saturn is Retrograde in Gemini
    expect(kundli.planets.Saturn.sign).toBe('Gemini');
    expect(kundli.planets.Saturn.isRetrograde).toBe(true);

    // Jupiter is Retrograde in Virgo
    expect(kundli.planets.Jupiter.sign).toBe('Virgo');
    expect(kundli.planets.Jupiter.isRetrograde).toBe(true);

    // 5. 12 Bhavas (Houses)
    expect(kundli.houses.length).toBe(12);
    expect(kundli.houses[0].number).toBe(1);
    expect(kundli.houses[0].rashi).toBe(2); // House 1 starts at Gemini (2)
    expect(kundli.houses[0].rashiName).toBe('Gemini');

    // 6. Janma Panchanga — Fully populated without NaN / undefined
    expect(kundli.panchanga).toBeDefined();
    expect(kundli.panchanga?.tithi).toBe('Ekadashi');
    expect(kundli.panchanga?.paksha).toBe('Krishna');
    expect(kundli.panchanga?.vara).toBe('Saturday');
    expect(kundli.panchanga?.varaHi).toBe('शनिवार');
    expect(kundli.panchanga?.nakshatra).toBe('Mula');
    expect(kundli.panchanga?.yoga).toBe('Harshana');
    expect(kundli.panchanga?.karana).toBe('Balava');
    expect(kundli.panchanga?.masa).toBe('Magha');
    expect(kundli.panchanga?.ritu).toBe('Shishir');
    expect(kundli.panchanga?.ayana).toBe('Uttarayana');

    // 7. Dynamic Atmakaraka & Jaimini Karakamsha Ishta Devata
    const ak = calculateAtmakaraka(kundli.planets);
    expect(ak.planet).toBe('Saturn');
    expect(ak.degreeInSign).toBeCloseTo(28.19, 1);

    expect(kundli.ishtaDevata).toBeDefined();
    expect(kundli.ishtaDevata?.atmakaraka).toBe('Saturn');
    expect(kundli.ishtaDevata?.karakamshaRashiName).toBe('Gemini');
    expect(kundli.ishtaDevata?.twelfthHouseRashiName).toBe('Taurus');
    expect(kundli.ishtaDevata?.twelfthHouseLord).toBe('Venus');
    expect(kundli.ishtaDevata?.twelfthHouseOccupants).toContain('Mars');
    expect(kundli.ishtaDevata?.twelfthHouseOccupants).toContain('Mercury');
    expect(kundli.ishtaDevata?.deity).toBeDefined();
    expect(kundli.ishtaDevata?.mantra).toBeDefined();
    expect(kundli.ishtaDevata?.rationale).toContain('Jaimini Karakamsha');
    expect(kundli.ishtaDevata?.methodologyDisclaimer).toContain('Jaimini Karakamsha');
    expect(kundli.ishtaDevata?.methodologyDisclaimerHi).toContain('जैमिनी');

    // 8. Shodashavargas
    expect(kundli.vargas).toBeDefined();
    expect(kundli.vargas?.d1).toBeDefined();
    expect(kundli.vargas?.d9).toBeDefined();
    expect(kundli.vargas?.d10).toBeDefined();

    // 9. Vimshottari Dasha
    expect(kundli.dasha).toBeDefined();
    expect(kundli.dasha?.currentMahadasha?.planet).toBeDefined();
    expect(kundli.dasha?.fullCycle?.length).toBeGreaterThan(0);

    // 10. Validation Layer
    const validation = validateCompleteKundli(kundli);
    expect(validation.valid).toBe(true);
    expect(validation.errors.length).toBe(0);
  });

  it('boundary-time test: handles transit interval switching cleanly', () => {
    // 5 Feb 2005 06:00 IST (00:30 UTC) is before Ekadashi day transition
    const earlyInput: BirthProfileInput = {
      date_of_birth: '2005-02-05',
      birth_time: '06:00',
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

    const earlyKundli = calculateCompleteKundli(earlyInput);
    expect(earlyKundli.panchanga?.vara).toBe('Saturday');
    expect(earlyKundli.panchanga?.nakshatra).toBeDefined();
    expect(earlyKundli.panchanga?.tithi).toBeDefined();
  });

  it('determinism test: multiple runs produce identical calculations', () => {
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

    const run1 = calculateCompleteKundli(input);
    const run2 = calculateCompleteKundli(input);

    expect(run1.ascendant?.longitude).toBe(run2.ascendant?.longitude);
    expect(run1.planets.Moon.longitude).toBe(run2.planets.Moon.longitude);
    expect(run1.ishtaDevata?.atmakaraka).toBe(run2.ishtaDevata?.atmakaraka);
    expect(run1.panchanga?.tithi).toBe(run2.panchanga?.tithi);
  });

  it('handles unknown birth time mode gracefully with Moon Sign fallback', () => {
    const input: BirthProfileInput = {
      date_of_birth: '1995-10-15',
      birth_time: null,
      birth_time_accuracy: 'unknown',
      gender: 'female',
      place_query: 'Varanasi, Uttar Pradesh, India',
      place_label: 'Varanasi, Uttar Pradesh, India',
      lat: 25.3176,
      lng: 82.9739,
      elevation: 80,
      timezone_iana: 'Asia/Kolkata',
      utc_offset_at_birth: '+05:30',
    };

    const kundli = calculateCompleteKundli(input);

    expect(kundli.ascendant).toBeUndefined();
    expect(kundli.houses.length).toBe(0);
    expect(kundli.planets.Moon).toBeDefined();
    expect(kundli.ishtaDevata).toBeDefined();
    expect(kundli.panchanga).toBeDefined();
  });
});
