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
  timezone_iana: string;
  utc_offset_at_birth: string;
}

export interface BirthProfile extends BirthProfileInput {
  user_id: string;
  input_fingerprint: string;
  created_at: string;
  updated_at: string;
}

export interface NormalizedPlanet {
  sign: string;
  degree: number;
  isRetrograde: boolean;
  house?: number | null;
  aspects?: string[];
  nakshatra?: string;
  nakshatraPada?: number;
}

export interface NormalizedDasha {
  current_mahadasha?: string;
  current_antardasha?: string;
  start_date?: string;
  end_date?: string;
  raw_dasha?: Record<string, any>;
}

export interface CoreChart {
  lagna?: string | { sign: string; degree?: string; house?: number };
  houses?: Record<string, any>;
  planets: Record<string, NormalizedPlanet>;
  moon_sign?: string;
  sun_sign?: string;
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
  predictions?: Record<string, string[]>;
  input_fingerprint?: string;
  calculated_at?: string;
  last_error_code?: string;
  created_at?: string;
  updated_at?: string;
}
