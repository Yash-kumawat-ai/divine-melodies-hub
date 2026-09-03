/**
 * RAGHAVAM VEDIC ASTROLOGY CONFIGURATION (FROZEN)
 * 
 * Defines canonical Vedic Jyotish parameters, methods, and sensitive domain boundaries.
 */

export const RAGHAVAM_VEDIC_CONFIG = {
  version: "raghavam-2026-v1",
  ayanamsha: "Lahiri",
  houseSystem: "whole_sign",
  atmakarakaPool: ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"] as const,
  kaalSarpMethod: "Parashari Nodal Axis: All 7 physical Grahas hemmed in one hemisphere between Rahu and Ketu. Full = 7 hemmed; Anshik (Partial) = 6 hemmed and 1 outside.",
  pitraDoshaMethod: "Parashari Affliction: Sun (Karaka of Soul/Father) conjunct Rahu/Ketu within 12° orb, or 9th house lord / 9th house occupied and afflicted by Rahu, Ketu, or Saturn.",
  sadeSatiMethod: "Live Dynamic Ephemeris: Computed live from natal Moon rashi vs live transit Saturn rashi at query time (12th from Moon = Rising/Phase 1, conjunct Moon = Peak/Phase 2, 2nd from Moon = Setting/Phase 3). Never hardcoded.",
  sensitiveDomains: ["health", "death", "legal", "financial"] as const,
} as const;

export type SensitiveDomain = typeof RAGHAVAM_VEDIC_CONFIG.sensitiveDomains[number];
