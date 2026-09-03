import type { NormalizedPlanet, VedicAscendant } from '@/lib/astrology/types';

export type VargaId = 'd1' | 'd9' | 'd10';

export const VEDIC_GRAHAS = [
  'Sun',
  'Moon',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
  'Saturn',
  'Rahu',
  'Ketu',
] as const;

export type VedicGrahaName = typeof VEDIC_GRAHAS[number];

export interface PlanetVisualPalette {
  nameHi: string;
  shortHi: string;
  shortEn: string;
  bg: string;
  fill: string;
  border: string;
}

export const GRAHA_PALETTES: Record<VedicGrahaName, PlanetVisualPalette> = {
  Sun:     { nameHi: 'सूर्य',  shortHi: 'सू', shortEn: 'Su', bg: '#FEF3C7', fill: '#92400E', border: '#F59E0B' },
  Moon:    { nameHi: 'चन्द्र', shortHi: 'चं', shortEn: 'Mo', bg: '#DBEAFE', fill: '#1D4ED8', border: '#3B82F6' },
  Mars:    { nameHi: 'मंगल',  shortHi: 'मं', shortEn: 'Ma', bg: '#FEE2E2', fill: '#B91C1C', border: '#EF4444' },
  Mercury: { nameHi: 'बुध',    shortHi: 'बु', shortEn: 'Me', bg: '#D1FAE5', fill: '#065F46', border: '#10B981' },
  Jupiter: { nameHi: 'गुरु',   shortHi: 'गु', shortEn: 'Ju', bg: '#FEF9C3', fill: '#854D0E', border: '#EAB308' },
  Venus:   { nameHi: 'शुक्र',  shortHi: 'शु', shortEn: 'Ve', bg: '#FCE7F3', fill: '#9D174D', border: '#EC4899' },
  Saturn:  { nameHi: 'शनि',   shortHi: 'श',  shortEn: 'Sa', bg: '#EDE9FE', fill: '#3730A3', border: '#6366F1' },
  Rahu:    { nameHi: 'राहु',   shortHi: 'रा', shortEn: 'Ra', bg: '#F3E8FF', fill: '#6B21A8', border: '#A855F7' },
  Ketu:    { nameHi: 'केतु',   shortHi: 'के', shortEn: 'Ke', bg: '#F5F5F4', fill: '#44403C', border: '#78716C' },
};

export const RASHI_NAMES_HI: string[] = [
  'मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या',
  'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुम्भ', 'मीन'
];

export const RASHI_NAMES_EN: string[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export interface GrahaPlacement {
  planet: VedicGrahaName;
  nameHi: string;
  shortHi: string;
  shortEn: string;
  rashiIndex: number;      // 0 = Aries, 11 = Pisces
  rashiNumber: number;     // 1 = Aries, 12 = Pisces
  rashiNameHi: string;
  rashiNameEn: string;
  houseNumber: number;     // 1 to 12 from Lagna
  isRetrograde: boolean;
  degree: number;          // 0 to 30 within sign
  palette: PlanetVisualPalette;
}

export interface ChartViewModel {
  varga: VargaId;
  titleHi: string;
  titleEn: string;
  lagnaRashiIndex: number;  // 0..11
  lagnaRashiNumber: number; // 1..12
  lagnaNameHi: string;
  lagnaNameEn: string;
  placements: GrahaPlacement[];
  // Pre-indexed for North Indian: grouped by House 1..12
  byHouse: Record<number, GrahaPlacement[]>;
  // Pre-indexed for South Indian: grouped by Zodiac Rashi 0..11
  byRashi: Record<number, GrahaPlacement[]>;
  // Map from House (1..12) to Rashi number (1..12)
  houseRashiMap: Record<number, number>;
}

const VARGA_TITLES: Record<VargaId, { hi: string; en: string }> = {
  d1: { hi: 'जन्म कुंडली (D1)', en: 'Birth Chart (D1)' },
  d9: { hi: 'नवांश कुंडली (D9)', en: 'Navamsha Chart (D9)' },
  d10: { hi: 'दशमांश कुंडली (D10)', en: 'Dasamsa Chart (D10)' },
};

/**
 * Pure Canonical Presentation Adapter
 * Converts engine data into a synchronized view model for both North & South Indian renderers.
 * Guarantees zero divergence in Rashi, House, Degree, and Retrograde status.
 */
export function buildChartViewModel(
  planets: Record<string, NormalizedPlanet> = {},
  lagna?: VedicAscendant | string,
  vargas?: Record<string, any>,
  activeVarga: VargaId = 'd1',
  isHi = true
): ChartViewModel {
  // 1. Resolve Lagna Rashi Index (0..11)
  let lagnaRashiIndex = 0;
  let lagnaNameHi = 'मेष';
  let lagnaNameEn = 'Aries';

  if (typeof lagna === 'object' && lagna && typeof lagna.rashi === 'number') {
    lagnaRashiIndex = ((lagna.rashi % 12) + 12) % 12;
    lagnaNameHi = lagna.rashiNameHi || RASHI_NAMES_HI[lagnaRashiIndex] || 'मेष';
    lagnaNameEn = lagna.rashiName || RASHI_NAMES_EN[lagnaRashiIndex] || 'Aries';
  } else if (typeof lagna === 'string') {
    const idx = RASHI_NAMES_EN.findIndex((n) => n.toLowerCase() === lagna.toLowerCase());
    if (idx >= 0) {
      lagnaRashiIndex = idx;
      lagnaNameHi = RASHI_NAMES_HI[idx];
      lagnaNameEn = RASHI_NAMES_EN[idx];
    }
  }

  // 2. Varga Override for D9 or D10
  if (activeVarga !== 'd1' && vargas?.[activeVarga]) {
    const vargaData = vargas[activeVarga];
    if (vargaData.ascendant?.rashi != null) {
      lagnaRashiIndex = ((vargaData.ascendant.rashi % 12) + 12) % 12;
      lagnaNameHi = RASHI_NAMES_HI[lagnaRashiIndex];
      lagnaNameEn = vargaData.ascendant.rashiName || RASHI_NAMES_EN[lagnaRashiIndex];
    }
  }

  // 3. Build Placements for 9 Classical Vedic Grahas
  const placements: GrahaPlacement[] = [];
  const byHouse: Record<number, GrahaPlacement[]> = {};
  const byRashi: Record<number, GrahaPlacement[]> = {};
  for (let h = 1; h <= 12; h++) byHouse[h] = [];
  for (let r = 0; r < 12; r++) byRashi[r] = [];

  const houseRashiMap: Record<number, number> = {};
  for (let h = 1; h <= 12; h++) {
    houseRashiMap[h] = ((lagnaRashiIndex + h - 1) % 12) + 1;
  }

  for (const grahaName of VEDIC_GRAHAS) {
    let rashiIndex = 0;
    let degree = 0;
    const isRetrograde = Boolean(planets[grahaName]?.isRetrograde);

    if (activeVarga === 'd1') {
      const pData = planets[grahaName];
      if (pData) {
        if (typeof pData.signNumber === 'number') {
          rashiIndex = ((pData.signNumber % 12) + 12) % 12;
        } else if (typeof pData.rashi === 'number') {
          rashiIndex = ((pData.rashi % 12) + 12) % 12;
        }
        degree = typeof pData.degree === 'number' ? pData.degree % 30 : 0;
      }
    } else if (vargas?.[activeVarga]?.planets?.[grahaName]) {
      const vargaPlanet = vargas[activeVarga].planets[grahaName];
      if (typeof vargaPlanet.rashi === 'number') {
        rashiIndex = ((vargaPlanet.rashi % 12) + 12) % 12;
      }
      degree = typeof vargaPlanet.longitude === 'number' ? vargaPlanet.longitude % 30 : 0;
    } else {
      // Fallback to D1 placement if varga planet missing
      const pData = planets[grahaName];
      if (pData) {
        rashiIndex = typeof pData.signNumber === 'number' ? pData.signNumber % 12 : 0;
        degree = typeof pData.degree === 'number' ? pData.degree % 30 : 0;
      }
    }

    // Canonical whole sign Bhava formula: House = ((Rashi - LagnaRashi + 12) % 12) + 1
    const houseNumber = ((rashiIndex - lagnaRashiIndex + 12) % 12) + 1;
    const rashiNumber = rashiIndex + 1;
    const palette = GRAHA_PALETTES[grahaName];

    const placement: GrahaPlacement = {
      planet: grahaName,
      nameHi: palette.nameHi,
      shortHi: palette.shortHi,
      shortEn: palette.shortEn,
      rashiIndex,
      rashiNumber,
      rashiNameHi: RASHI_NAMES_HI[rashiIndex],
      rashiNameEn: RASHI_NAMES_EN[rashiIndex],
      houseNumber,
      isRetrograde,
      degree,
      palette,
    };

    placements.push(placement);
    byHouse[houseNumber].push(placement);
    byRashi[rashiIndex].push(placement);
  }

  return {
    varga: activeVarga,
    titleHi: VARGA_TITLES[activeVarga]?.hi || VARGA_TITLES.d1.hi,
    titleEn: VARGA_TITLES[activeVarga]?.en || VARGA_TITLES.d1.en,
    lagnaRashiIndex,
    lagnaRashiNumber: lagnaRashiIndex + 1,
    lagnaNameHi,
    lagnaNameEn,
    placements,
    byHouse,
    byRashi,
    houseRashiMap,
  };
}
