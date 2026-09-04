/**
 * Raghavam — Domain 1: "About You" Interpretation Engine
 *
 * FULLY DETERMINISTIC INTERPRETATION ENGINE.
 *
 * Requirements:
 * - Zero runtime LLM / AI generated text.
 * - Zero implementer discretion or free-prose improvisation.
 * - Every single string is a deterministic lookup traceable to a sourceRule.
 * - Fixed strength count: exactly 3.
 * - Fixed growth edge count: exactly 2.
 * - Distinguishes between full profile (exact birth time) and partial profile (unknown time).
 */

import type { CompleteKundliData } from '../types';
import { calculateAtmakaraka } from '../kundliEngine';
import type { AboutYouIntelligence } from './types';
import {
  LAGNA_RULES,
  MOON_MODIFIERS,
  ATMAKARAKA_RULES,
  PARTIAL_PROFILE_RULES,
  PARTIAL_STRENGTH_RULES,
  PARTIAL_SUN_STRENGTHS,
  SIGN_ELEMENT,
  LIFE_ORIENTATION_BY_LAGNA,
  LIFE_ORIENTATION_BY_MOON,
  ORIENTATION_DESCRIPTIONS,
  type ZodiacSign,
  type Planet,
  type Element,
} from './aboutYouRules';

/**
 * Safely parse a sign string into a known ZodiacSign key.
 */
function normalizeZodiacSign(sign?: string | null): ZodiacSign {
  if (!sign) return 'aries';
  const clean = sign.trim().toLowerCase();
  const validSigns: ZodiacSign[] = [
    'aries', 'taurus', 'gemini', 'cancer',
    'leo', 'virgo', 'libra', 'scorpio',
    'sagittarius', 'capricorn', 'aquarius', 'pisces',
  ];
  return validSigns.includes(clean as ZodiacSign) ? (clean as ZodiacSign) : 'aries';
}

/**
 * Safely parse a planet string into a known Planet key.
 */
function normalizePlanet(planet?: string | null): Planet {
  if (!planet) return 'sun';
  const clean = planet.trim().toLowerCase();
  const validPlanets: Planet[] = [
    'sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn',
  ];
  return validPlanets.includes(clean as Planet) ? (clean as Planet) : 'sun';
}

/**
 * Deterministically generates Domain 1 ("About You") personality intelligence.
 */
export function generateAboutYouIntelligence(
  kundli: CompleteKundliData
): AboutYouIntelligence {
  // 1. Existing source-of-truth flag for birth time accuracy
  const isUnknownTime =
    kundli.birthDetails?.birthTimeAccuracy === 'unknown' || !kundli.ascendant;
  const isPartialProfile = isUnknownTime;

  // 2. Extract Astronomical Anchors
  const lagnaSign = isPartialProfile ? null : (kundli.ascendant?.rashiName || null);
  const lagnaLord = isPartialProfile ? null : (kundli.ascendant?.lord || null);

  const rawMoonSign = kundli.planets?.Moon?.sign || kundli.core_chart?.moon_sign || 'Aries';
  const moonSign = rawMoonSign;
  const moonNakshatra =
    kundli.planets?.Moon?.nakshatra ||
    kundli.panchanga?.nakshatra ||
    kundli.core_chart?.nakshatra ||
    '';

  const rawSunSign = kundli.planets?.Sun?.sign || kundli.core_chart?.sun_sign || 'Aries';
  const sunSign = rawSunSign;

  // Determine Atmakaraka using validated 7-planet pool
  let atmakaraka = kundli.ishtaDevata?.atmakaraka;
  if (!atmakaraka && kundli.planets) {
    atmakaraka = calculateAtmakaraka(kundli.planets).planet;
  }
  if (!atmakaraka) {
    atmakaraka = 'Sun';
  }

  const normMoon = normalizeZodiacSign(moonSign);
  const normSun = normalizeZodiacSign(sunSign);
  const normAk = normalizePlanet(atmakaraka);

  // --------------------------------------------------------------------------
  // BRANCH A: PARTIAL PROFILE (Birth time unknown / No Lagna)
  // --------------------------------------------------------------------------
  if (isPartialProfile) {
    const sunElement: Element = SIGN_ELEMENT[normSun] || 'fire';
    const partialRule = PARTIAL_PROFILE_RULES[normMoon] || PARTIAL_PROFILE_RULES['aries'];

    // Option A: Sun element selects the archetype variant within the Moon family
    const archetypeVariant = partialRule.sunElementVariants[sunElement] || partialRule.base;

    // Strength 1 = Moon emotional foundation
    const strength1 = PARTIAL_STRENGTH_RULES[normMoon].moonStrength;

    // Strength 2 = Sun element creative expression
    const strength2 = PARTIAL_SUN_STRENGTHS[sunElement];

    // Strength 3 = Atmakaraka core drive
    const akDrive = ATMAKARAKA_RULES[normAk].coreDrive;
    let strength3 = akDrive;

    // Deduplication check: if Strength 3 duplicates Strength 1 or 2 textually
    if (strength3.en === strength1.en || strength3.en === strength2.en) {
      strength3 = {
        en: `Driven by ${atmakaraka} to express purposeful and dedicated action`,
        hi: `${atmakaraka} की प्रेरणा से उद्देश्यपूर्ण और समर्पित कर्म करने की क्षमता`,
        sourceRule: `atmakaraka:${normAk} + fallback:dedup`,
        tradition: 'project-defined',
      };
    }

    // Growth Edges (exactly 2, constructive)
    const growthEdges = [
      PARTIAL_STRENGTH_RULES[normMoon].growthEdges[0],
      PARTIAL_STRENGTH_RULES[normMoon].growthEdges[1],
    ];

    // Life Orientation by Moon
    const orientationType = LIFE_ORIENTATION_BY_MOON[normMoon] || 'ambiverted';
    const orientationDesc = ORIENTATION_DESCRIPTIONS[orientationType];

    return {
      isPartialProfile: true,
      archetype: {
        en: archetypeVariant.en,
        hi: archetypeVariant.hi,
      },
      coreStrengths: [strength1, strength2, strength3],
      growthEdges,
      lifeOrientation: {
        type: orientationType,
        en: orientationDesc.en,
        hi: orientationDesc.hi,
      },
      inputsUsed: {
        lagnaSign: null,
        lagnaLord: null,
        moonSign,
        moonNakshatra,
        sunSign,
        atmakaraka,
      },
    };
  }

  // --------------------------------------------------------------------------
  // BRANCH B: FULL PROFILE (Exact birth time available)
  // --------------------------------------------------------------------------
  const normLagna = normalizeZodiacSign(lagnaSign);
  const lagnaRule = LAGNA_RULES[normLagna] || LAGNA_RULES['aries'];
  const moonMod = MOON_MODIFIERS[normMoon] || MOON_MODIFIERS['aries'];

  // Base Archetype
  const archetype = {
    en: lagnaRule.archetype.en,
    hi: lagnaRule.archetype.hi,
  };

  // Strength 1: Strongest Lagna-derived candidate (Candidate 1)
  const strength1 = lagnaRule.strengthCandidates[0];

  // Strength 2: Second Lagna-derived candidate with deterministic Moon modifier
  const cand2 = lagnaRule.strengthCandidates[1];
  const strength2 = {
    en: `${cand2.en} (${moonMod.strengthModifier.en})`,
    hi: `${cand2.hi} (${moonMod.strengthModifier.hi})`,
    sourceRule: `${cand2.sourceRule} + moon:${normMoon}`,
    tradition: 'project-defined' as const,
  };

  // Strength 3: Atmakaraka core-drive phrase
  const akStrength = ATMAKARAKA_RULES[normAk].coreDrive;
  let strength3 = akStrength;

  // Deduplication check: if Strength 3 is textually equivalent to Strength 1 or 2,
  // replace with candidate 3 from LagnaRule
  if (
    strength3.en === strength1.en ||
    strength3.en === cand2.en ||
    strength3.en === strength2.en
  ) {
    strength3 = lagnaRule.strengthCandidates[2];
  }

  // Growth Edges (exactly 2, fixed order)
  const growthEdges = [
    lagnaRule.growthEdges[0],
    lagnaRule.growthEdges[1],
  ];

  // Life Orientation by Lagna
  const orientationType = LIFE_ORIENTATION_BY_LAGNA[normLagna] || 'ambiverted';
  const orientationDesc = ORIENTATION_DESCRIPTIONS[orientationType];

  return {
    isPartialProfile: false,
    archetype,
    coreStrengths: [strength1, strength2, strength3],
    growthEdges,
    lifeOrientation: {
      type: orientationType,
      en: orientationDesc.en,
      hi: orientationDesc.hi,
    },
    inputsUsed: {
      lagnaSign,
      lagnaLord,
      moonSign,
      moonNakshatra,
      sunSign,
      atmakaraka,
    },
  };
}
