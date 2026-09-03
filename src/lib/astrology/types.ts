export type BirthTimeAccuracy = 'exact' | 'approximate' | 'unknown';
export type Gender = 'male' | 'female' | 'other' | 'unspecified';
export type ProfileCompleteness = 'full' | 'limited';
export type CalculationStatus = 'pending' | 'generating' | 'partial' | 'ready' | 'failed';

export interface BirthProfileInput {
  date_of_birth: string; // YYYY-MM-DD
  birth_time?: string | null; // HH:mm
  birth_time_accuracy: BirthTimeAccuracy;
  gender: Gender;
  place_query: string;
  place_label: string;
  country_code?: string;
  admin1?: string;
  lat: number;
  lng: number;
  elevation?: number; // Elevation in meters
  timezone_iana: string;
  utc_offset_at_birth: string;
}

export interface BirthProfile extends BirthProfileInput {
  user_id: string;
  input_fingerprint: string;
  created_at: string;
  updated_at: string;
}

export type PlanetDignity = 'exalted' | 'moolatrikona' | 'own' | 'friend' | 'neutral' | 'enemy' | 'debilitated';

export interface NormalizedPlanet {
  name?: string;
  sign: string;
  signNumber?: number;
  rashiNameHindi?: string;
  degree: number;
  longitude?: number;
  isRetrograde: boolean;
  house?: number | null;
  aspects?: string[];
  nakshatra?: string;
  nakshatraLord?: string;
  nakshatraPada?: number;
  dignity?: PlanetDignity;
  speed?: number;
}

export interface VedicHouseData {
  number: number;
  rashi: number;
  rashiName: string;
  rashiNameHi?: string;
  startLongitude?: number;
  endLongitude?: number;
  lord?: string;
  lordHi?: string;
  planets: string[];
  significance?: string;
  significanceHi?: string;
}

export interface VedicAscendant {
  rashi: number;
  rashiName: string;
  rashiNameHi?: string;
  longitude: number;
  degree: number;
  nakshatra: string;
  nakshatraLord: string;
  pada: number;
  lord?: string;
  lordHi?: string;
}

export interface MangalDoshaResult {
  hasDosha: boolean;
  isHigh: boolean;
  description: string;
  descriptionHi?: string;
  factors: string[];
  remedies: string[];
  remediesHi: string[];
}

export interface IshtaDevataResult {
  deity: string;
  deityHi: string;
  planet: string;
  planetHi: string;
  atmakaraka?: string;
  atmakarakaDegree?: number;
  karakamshaRashi?: number;
  karakamshaRashiName?: string;
  twelfthHouseRashi?: number;
  twelfthHouseRashiName?: string;
  twelfthHouseOccupants?: string[];
  twelfthHouseLord?: string;
  rule?: string;
  methodologyDisclaimer?: string;
  methodologyDisclaimerHi?: string;
  rationale: string;
  rationaleHi: string;
  mantra: string;
  mantraMeaning: string;
  recommendedBhajanQuery?: string;
}

export interface JanmaPanchangam {
  tithi?: string;
  tithiNumber?: number;
  tithiHi?: string;
  paksha?: 'Shukla' | 'Krishna';
  nakshatra?: string;
  nakshatraLord?: string;
  nakshatraPada?: number;
  yoga?: string;
  yogaHi?: string;
  karana?: string;
  karanaHi?: string;
  vara?: string;
  varaHi?: string;
  masa?: string;
  masaHi?: string;
  ritu?: string;
  rituHi?: string;
  ayana?: string;
  ayanaHi?: string;
  samvat?: string;
  gana?: string;
  yoni?: string;
  nadi?: string;
  varna?: string;
  vashya?: string;
}

export interface DashaPeriod {
  planet: string;
  planetHi?: string;
  startTime?: string;
  endTime: string;
  progressPercent?: number;
}

export interface NormalizedDasha {
  birthNakshatra?: string;
  nakshatraPada?: number;
  dashaBalance?: string;
  current_mahadasha?: string;
  current_antardasha?: string;
  currentMahadasha?: DashaPeriod;
  currentAntardasha?: DashaPeriod;
  start_date?: string;
  end_date?: string;
  fullCycle?: Array<{
    planet: string;
    planetHi?: string;
    startTime: string;
    endTime: string;
    antardashas?: Array<{
      planet: string;
      planetHi?: string;
      startTime: string;
      endTime: string;
    }>;
  }>;
  raw_dasha?: Record<string, any>;
}

export interface CoreChart {
  lagna?: VedicAscendant | string;
  houses?: Record<string, VedicHouseData> | VedicHouseData[];
  planets: Record<string, NormalizedPlanet>;
  moon_sign?: string;
  moon_sign_hi?: string;
  sun_sign?: string;
  sun_sign_hi?: string;
  nakshatra?: string;
  nakshatra_pada?: number;
}

export interface BirthCalculationContext {
  birthLocalDate: string;
  birthLocalTime?: string | null;
  timezoneIana: string;
  utcOffset: string;
  historicalUtcOffset?: string;
  utcInstant: string;
  latitude: number;
  longitude: number;
  elevation: number;
  elevationSource?: 'survey_known' | 'regional_srtm_model' | 'fallback';
  locationConfidence?: number;
  locationSource?: 'seed_directory' | 'photon_osm';
  matchedLocationName?: string;
  engine: string;
  engineVersion?: string;
  calculationVersion: number;
  ayanamsa?: string;
  houseSystem?: 'whole_sign';
  inputHash?: string;
  calculatedAt?: string;
}

export interface CompleteKundliData {
  birthDetails: {
    name?: string;
    dateOfBirth: string;
    birthTime?: string | null;
    birthTimeAccuracy: BirthTimeAccuracy;
    gender: Gender;
    placeLabel: string;
    lat: number;
    lng: number;
    elevation: number;
    elevationSource?: 'survey_known' | 'regional_srtm_model' | 'fallback';
    timezoneIana: string;
    utcOffset: string;
    locationConfidence?: number;
    locationSource?: 'seed_directory' | 'photon_osm';
    matchedLocationName?: string;
  };
  calculationContext?: BirthCalculationContext;
  ascendant?: VedicAscendant;
  planets: Record<string, NormalizedPlanet>;
  houses: VedicHouseData[];
  dasha?: NormalizedDasha;
  vargas?: Record<string, any>;
  mangalDosha?: MangalDoshaResult;
  ishtaDevata?: IshtaDevataResult;
  kaalSarpDosha?: { hasDosha: boolean; isPartial: boolean; type: 'full' | 'partial' | 'none'; description: string; descriptionHi: string };
  pitraDosha?: { hasDosha: boolean; severity: 'mild' | 'moderate' | 'strong' | 'none'; description: string; descriptionHi: string };
  sadeSati?: any;
  panchanga?: JanmaPanchangam;
  predictions?: Record<string, string[]>;
  ayanamsa: string;
  calculatedAt: string;
}

export interface AstrologyProfile {
  user_id: string;
  status: CalculationStatus;
  profile_completeness: ProfileCompleteness;
  planets_ready: boolean;
  houses_ready: boolean;
  core_ready: boolean;
  dasha_ready: boolean;
  predictions_ready: boolean;
  schema_version?: number;
  ayanamsa?: string;
  core_chart?: CoreChart;
  dasha?: NormalizedDasha;
  vargas?: Record<string, any>;
  mangal_dosha?: MangalDoshaResult;
  ishta_devata?: IshtaDevataResult;
  panchanga_birth?: JanmaPanchangam;
  predictions?: Record<string, string[]>;
  input_fingerprint?: string;
  calculated_at?: string;
  last_error_code?: string;
  created_at?: string;
  updated_at?: string;
}
