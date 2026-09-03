/**
 * GURU JI AI TYPES & BOUNDARY CONTRACT (FROZEN)
 * 
 * Strict TypeScript shape defining everything permitted into the LLM context.
 * The context builder is the enforcement boundary: anything not in this contract
 * cannot be serialized into the prompt.
 */

export interface GuruJiFacts {
  birthTimeKnown?: boolean;
  lagna?: string;
  lagnaHi?: string;
  lagnaLord?: string;
  lagnaLordHi?: string;
  moonSign?: string;
  moonSignHi?: string;
  moonNakshatra?: string;
  moonNakshatraPada?: number;
  sunSign?: string;
  sunSignHi?: string;
  atmakaraka?: string;
  atmakarakaHi?: string;
  karakamsha?: string;
  karakamshaHi?: string;
  activeMahadasha?: string;
  activeMahadashaHi?: string;
  activeAntardasha?: string;
  activeAntardashaHi?: string;
  dashaEndYear?: number;
  tenthHouseLord?: string;
  tenthHouseLordHi?: string;
  tenthHousePlanets?: string[];
  seventhHouseLord?: string;
  seventhHouseLordHi?: string;
  mangalDoshaPresent?: boolean;
  mangalDoshaSeverity?: 'mild' | 'high' | 'none';
  sadeSatiActive?: boolean;
  sadeSatiPhase?: 'rising' | 'peak' | 'setting' | 'none';
  kaalSarpPresent?: boolean;
  kaalSarpType?: 'full' | 'partial' | 'none';
}

export interface GuruJiAppliedRules {
  ishtaDevata?: string;
  ishtaDevataHi?: string;
  ishtaMantra?: string;
  ishtaRationale?: string;
  lagnaLordMeaning?: string;
  careerInfluence?: string;
  marriageInfluence?: string;
  dashaInfluence?: string;
  sadeSatiMeaning?: string;
  mangalDoshaMeaning?: string;
  timeAccuracyNote?: string;
  thirdPartyNotice?: string;
}

export interface GuruJiContextPayload {
  facts: GuruJiFacts;
  appliedRules: GuruJiAppliedRules;
}

export type GuruJiMainIntent =
  | 'devotional'
  | 'astrological'
  | 'panchang'
  | 'general'
  | 'app_meta'
  | 'out_of_scope'
  | 'unintelligible';

export type GuruJiSubCategory =
  | 'career'
  | 'marriage'
  | 'ishta'
  | 'dasha'
  | 'sade_sati'
  | 'wealth'
  | 'health'
  | 'dosha'
  | 'general_astro'
  | 'general_devotional'
  | 'app_meta'
  | 'out_of_scope'
  | 'unintelligible';

export interface GuruJiClassification {
  mainIntent: GuruJiMainIntent;
  subCategory: GuruJiSubCategory;
  isThirdPartyRequest: boolean;
  thirdPartyRelation?: string;
  sensitiveDomain?: 'health' | 'death' | 'legal' | 'financial';
}

export interface GuruJiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GuruJiRequestPayload {
  messages: GuruJiMessage[];
  language?: 'hi' | 'en';
}

export interface GuruJiStreamMeta {
  intent: GuruJiMainIntent;
  subCategory: GuruJiSubCategory;
  responseMode: 'llm' | 'offline' | 'error' | 'service_unavailable';
  factsUsed?: string[];
}
