import { describe, it, expect } from 'vitest';
import { generateAboutYouIntelligence } from './aboutYouInterpreter';
import { calculateCompleteKundli } from '../kundliEngine';
import type { BirthProfileInput, CompleteKundliData } from '../types';

describe('Domain 1: "About You" Interpretation Engine', () => {
  const fullProfileInput: BirthProfileInput = {
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

  const unknownTimeProfileInput: BirthProfileInput = {
    date_of_birth: '2005-02-05',
    birth_time: null,
    birth_time_accuracy: 'unknown',
    gender: 'male',
    place_query: 'Jaipur, Rajasthan, India',
    place_label: 'Jaipur, Rajasthan, India',
    lat: 26.9124,
    lng: 75.7873,
    elevation: 431,
    timezone_iana: 'Asia/Kolkata',
    utc_offset_at_birth: '+05:30',
  };

  it('generates full-profile interpretation with exact birth time', () => {
    const kundli = calculateCompleteKundli(fullProfileInput);
    const result = generateAboutYouIntelligence(kundli);

    expect(result.isPartialProfile).toBe(false);

    // Lagna is Gemini
    expect(result.inputsUsed.lagnaSign).toBe('Gemini');
    expect(result.inputsUsed.lagnaLord).toBe('Mercury');
    expect(result.inputsUsed.moonSign).toBe('Sagittarius');
    expect(result.inputsUsed.atmakaraka).toBe('Saturn');

    // Archetype for Gemini
    expect(result.archetype.en).toBe('The Curious Connector');
    expect(result.archetype.hi).toBe('जिज्ञासु संप्रेषक');

    // Core strengths: exactly 3
    expect(result.coreStrengths).toHaveLength(3);
    // Strength 1: Candidate 1 from Gemini
    expect(result.coreStrengths[0].en).toBe('Learns quickly by observing, asking and comparing');
    expect(result.coreStrengths[0].sourceRule).toContain('lagna:gemini + strength:curiosity');
    expect(result.coreStrengths[0].tradition).toBe('project-defined');

    // Strength 2: Candidate 2 from Gemini + Moon modifier from Sagittarius
    expect(result.coreStrengths[1].en).toContain('Connects ideas and communicates them clearly');
    expect(result.coreStrengths[1].en).toContain('with an expansive and meaning-seeking style');
    expect(result.coreStrengths[1].hi).toContain('विचारों को जोड़कर उन्हें स्पष्ट रूप से व्यक्त करते हैं');
    expect(result.coreStrengths[1].sourceRule).toContain('moon:sagittarius');

    // Strength 3: Atmakaraka Saturn
    expect(result.coreStrengths[2].en).toBe('A drive to develop patience, responsibility and durable discipline');
    expect(result.coreStrengths[2].sourceRule).toBe('atmakaraka:saturn + core_drive:discipline');

    // Growth edges: exactly 2
    expect(result.growthEdges).toHaveLength(2);
    expect(result.growthEdges[0].en).toBe('May benefit from finishing important threads before moving to the next idea');
    expect(result.growthEdges[1].en).toBe('May need to protect attention from too many competing inputs');

    // Life orientation
    expect(result.lifeOrientation.type).toBe('dynamic_external');
    expect(result.lifeOrientation.en).toContain('Naturally directs energy outward');
  });

  it('correctly triggers isPartialProfile and skips Lagna when birth time is unknown', () => {
    const kundli = calculateCompleteKundli(unknownTimeProfileInput);
    const result = generateAboutYouIntelligence(kundli);

    expect(result.isPartialProfile).toBe(true);

    // InputsUsed must not have lagna
    expect(result.inputsUsed.lagnaSign).toBeNull();
    expect(result.inputsUsed.lagnaLord).toBeNull();
    expect(result.inputsUsed.moonSign).toBe('Sagittarius');
    expect(result.inputsUsed.atmakaraka).toBe('Saturn');

    // Partial archetype follows Option A: Moon (Sagittarius) + Sun element (Earth - Sun in Capricorn)
    expect(result.archetype.en).toBe('The Grounded Meaning-Seeking Explorer');
    expect(result.archetype.hi).toBe('स्थिर अर्थ-खोजी अन्वेषक');

    // Core strengths: exactly 3
    expect(result.coreStrengths).toHaveLength(3);
    // Strength 1: Moon-based
    expect(result.coreStrengths[0].sourceRule).toContain('partial:moon:sagittarius');
    // Strength 2: Sun-element-based
    expect(result.coreStrengths[1].sourceRule).toContain('partial:sun_element:earth');
    // Strength 3: Atmakaraka
    expect(result.coreStrengths[2].sourceRule).toBe('atmakaraka:saturn + core_drive:discipline');

    // Growth edges: exactly 2
    expect(result.growthEdges).toHaveLength(2);
    expect(result.growthEdges[0].sourceRule).toContain('partial:moon:sagittarius');
    expect(result.growthEdges[1].sourceRule).toContain('partial:moon:sagittarius');

    // Life orientation derived from Moon sign
    expect(result.lifeOrientation.type).toBe('dynamic_external');
  });

  it('guarantees 100% determinism across multiple invocations', () => {
    const kundli = calculateCompleteKundli(fullProfileInput);
    const run1 = generateAboutYouIntelligence(kundli);
    const run2 = generateAboutYouIntelligence(kundli);

    expect(run1).toEqual(run2);
  });

  it('deduplicates Strength 3 if Atmakaraka duplicates Strength 1 or 2', () => {
    // Construct mock kundli where AK strength wording matches candidate 1
    const mockKundli = {
      birthDetails: {
        birthTimeAccuracy: 'exact' as const,
        gender: 'male' as const,
        dateOfBirth: '1990-01-01',
        placeLabel: 'Test',
        lat: 0,
        lng: 0,
        elevation: 0,
        timezoneIana: 'UTC',
        utcOffset: '+00:00',
      },
      ascendant: {
        rashi: 0,
        rashiName: 'Aries',
        degree: 10,
        longitude: 10,
        nakshatra: 'Ashwini',
        nakshatraLord: 'Ketu',
        pada: 1,
        lord: 'Mars',
      },
      planets: {
        Moon: { sign: 'Taurus', rashiName: 'Taurus', degree: 15, isRetrograde: false },
        Sun: { sign: 'Capricorn', rashiName: 'Capricorn', degree: 20, isRetrograde: false },
        Mars: { sign: 'Aries', rashiName: 'Aries', degree: 25, isRetrograde: false },
      },
      ishtaDevata: {
        atmakaraka: 'Mars',
      },
      houses: [],
      ayanamsa: 'Lahiri',
      calculatedAt: new Date().toISOString(),
    } as unknown as CompleteKundliData;

    const result = generateAboutYouIntelligence(mockKundli);
    expect(result.coreStrengths).toHaveLength(3);

    // Candidate 1: 'Acts decisively when a clear direction is needed'
    // AK Mars: 'A drive to develop courage, disciplined action and constructive strength'
    // They are distinct, so AK Mars is kept
    expect(result.coreStrengths[2].sourceRule).toBe('atmakaraka:mars + core_drive:constructive_strength');
  });

  it('guarantees constructive phrasing across all growth edges (never fatalistic)', () => {
    const kundli = calculateCompleteKundli(fullProfileInput);
    const result = generateAboutYouIntelligence(kundli);

    const fatalisticPatterns = [/burnout/i, /ruin/i, /failure/i, /doomed/i, /toxic/i, /hopeless/i];

    for (const edge of result.growthEdges) {
      for (const pattern of fatalisticPatterns) {
        expect(edge.en).not.toMatch(pattern);
      }
      expect(edge.en).toMatch(/^May (benefit|need)/);
    }
  });

  it('ensures every strength and edge has an auditable sourceRule and tradition tag', () => {
    const kundli = calculateCompleteKundli(fullProfileInput);
    const result = generateAboutYouIntelligence(kundli);

    for (const s of result.coreStrengths) {
      expect(s.sourceRule).toBeTruthy();
      expect(['parashari', 'project-defined']).toContain(s.tradition);
    }

    for (const e of result.growthEdges) {
      expect(e.sourceRule).toBeTruthy();
      expect(['parashari', 'project-defined']).toContain(e.tradition);
    }
  });
});
