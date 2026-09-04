/**
 * Raghavam — Domain 1: "About You" Interpretation Engine Types
 *
 * Strict contract for deterministic astrology interpretation.
 * No runtime LLM generation, no free-form text.
 */

export interface AboutYouIntelligence {
  isPartialProfile: boolean; // true if no exact birth time / no Lagna
  archetype: {
    en: string;
    hi: string;
  };
  coreStrengths: Array<{
    en: string;
    hi: string;
    sourceRule: string; // e.g. "lagna:aries + atmakaraka:mars" — for auditability
    tradition: 'parashari' | 'project-defined';
  }>; // exactly 3
  growthEdges: Array<{
    en: string;
    hi: string;
    sourceRule: string;
    tradition: 'parashari' | 'project-defined';
  }>; // exactly 2, framed constructively — never fatalistic language
  lifeOrientation: {
    type: 'introverted_reflective' | 'ambiverted' | 'dynamic_external';
    en: string; // one sentence explanation
    hi: string;
  };
  inputsUsed: {
    lagnaSign: string | null; // null if partial profile
    lagnaLord: string | null;
    moonSign: string;
    moonNakshatra: string;
    sunSign: string;
    atmakaraka: string;
  };
}
