export type FestivalType = 'solar' | 'lunar' | 'gregorian';
export type FestivalImportance = 'major' | 'medium' | 'low';

export interface FestivalFasting {
  observed: boolean;
  type: string | null;
  rules_en: string;
  rules_hi: string;
}

export interface FestivalData {
  id: string;
  date: string;
  name_en: string;
  name_hi: string;
  name_sa: string;
  type: FestivalType;
  importance: FestivalImportance;
  regions: string[];
  regional_names: Record<string, string>;
  deity: string;
  description_en: string;
  description_hi: string;
  fasting: FestivalFasting;
  rituals: string[];
  color: string;
  tags: string[];
}

export interface FestivalSummary {
  id: string;
  date: string;
  name_en: string;
  name_hi: string;
  importance: FestivalImportance;
  deity: string;
  color: string;
  fasting_observed: boolean;
  tags: string[];
}

export interface FestivalMonthData {
  year: number;
  month: string;
  source: string;
  updated: string;
  festivals: FestivalData[];
}

export interface FestivalIndex {
  version: string;
  year: number;
  source: string;
  updated: string;
  total_festivals: number;
  months: Array<{
    month: string;
    count: number;
    major_count: number;
  }>;
  festivals: FestivalSummary[];
}
