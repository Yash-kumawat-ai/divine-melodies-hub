import React, { memo } from 'react';
import { Info, Sparkles } from 'lucide-react';
import type { NormalizedPlanet, VedicAscendant } from '@/lib/astrology/types';

interface SouthIndianKundliChartProps {
  planets: Record<string, NormalizedPlanet>;
  lagna?: VedicAscendant | string;
  isUnknownTime?: boolean;
  className?: string;
}

// ── Only the 9 classical Vedic Grahas ────────────────────────────────────────
const VEDIC_PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

// South Indian chart: fixed zodiac positions (Pisces = top-left, clockwise)
const SOUTH_GRID_CELLS = [
  { rashi: 11, hi: 'मीन',    col: 0, row: 0 },
  { rashi:  0, hi: 'मेष',    col: 1, row: 0 },
  { rashi:  1, hi: 'वृषभ',   col: 2, row: 0 },
  { rashi:  2, hi: 'मिथुन',  col: 3, row: 0 },

  { rashi: 10, hi: 'कुम्भ',  col: 0, row: 1 },
  { rashi:  3, hi: 'कर्क',   col: 3, row: 1 },

  { rashi:  9, hi: 'मकर',   col: 0, row: 2 },
  { rashi:  4, hi: 'सिंह',   col: 3, row: 2 },

  { rashi:  8, hi: 'धनु',    col: 0, row: 3 },
  { rashi:  7, hi: 'वृश्चिक', col: 1, row: 3 },
  { rashi:  6, hi: 'तुला',   col: 2, row: 3 },
  { rashi:  5, hi: 'कन्या',  col: 3, row: 3 },
];

const PLANET_ABBR: Record<string, { hi: string; fill: string; bg: string }> = {
  Sun:     { hi: 'सू',  fill: '#92400E', bg: '#FEF3C7' },
  Moon:    { hi: 'चं',  fill: '#1D4ED8', bg: '#DBEAFE' },
  Mars:    { hi: 'मं',  fill: '#B91C1C', bg: '#FEE2E2' },
  Mercury: { hi: 'बु',  fill: '#065F46', bg: '#D1FAE5' },
  Jupiter: { hi: 'गु',  fill: '#854D0E', bg: '#FEF9C3' },
  Venus:   { hi: 'शु',  fill: '#9D174D', bg: '#FCE7F3' },
  Saturn:  { hi: 'श',   fill: '#3730A3', bg: '#EDE9FE' },
  Rahu:    { hi: 'रा',  fill: '#6B21A8', bg: '#F3E8FF' },
  Ketu:    { hi: 'के',  fill: '#44403C', bg: '#F5F5F4' },
};

const SouthIndianKundliChartInner: React.FC<SouthIndianKundliChartProps> = ({
  planets = {},
  lagna,
  isUnknownTime = false,
  className = '',
}) => {
  if (isUnknownTime) {
    return (
      <div className="temple-panel-soft flex flex-col items-center justify-center p-8 text-center">
        <div className="h-12 w-12 rounded-full bg-brand-primary/10 flex items-center justify-center mb-3">
          <Info className="h-6 w-6 text-brand-primary" />
        </div>
        <h4 className="font-display font-bold text-base text-brand-primary">
          दक्षिण भारतीय चक्र उपलब्ध नहीं
        </h4>
        <p className="text-xs text-muted-foreground max-w-sm mt-1 leading-relaxed">
          सटीक जन्म समय ज्ञात न होने के कारण भाव-विशिष्ट चक्र नहीं बनाया गया है।
        </p>
      </div>
    );
  }

  let lagnaRashi = -1;
  if (typeof lagna === 'object' && lagna && 'rashi' in lagna) {
    lagnaRashi = (lagna as VedicAscendant).rashi;
  }

  // Map planets to rashis (only 9 Vedic)
  const rashiPlanets: Record<number, Array<{ hi: string; fill: string; bg: string; retro: boolean }>> = {};
  for (let i = 0; i < 12; i++) rashiPlanets[i] = [];

  for (const [pName, pData] of Object.entries(planets)) {
    if (!VEDIC_PLANETS.includes(pName)) continue;
    const rIdx = pData.signNumber ?? -1;
    if (rIdx >= 0 && rIdx <= 11) {
      const abbr = PLANET_ABBR[pName] ?? { hi: pName.slice(0, 2), fill: '#374151', bg: '#F9FAFB' };
      rashiPlanets[rIdx].push({ hi: abbr.hi, fill: abbr.fill, bg: abbr.bg, retro: Boolean(pData.isRetrograde) });
    }
  }

  return (
    <div className={`relative w-full mx-auto select-none ${className}`}>
      <div className="temple-panel p-3 sm:p-4 relative overflow-hidden">
        {/* Corner ornaments */}
        {['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'].map((pos) => (
          <div key={pos} className={`absolute ${pos} text-[#C89B3C] text-[10px] opacity-40 select-none pointer-events-none`}>❖</div>
        ))}

        <div className="grid grid-cols-4 gap-[3px] sm:gap-1 aspect-square p-1 sm:p-2
          bg-gradient-to-br from-[#FFFDF9] via-[#FFFBF2] to-[#FFF6E5]
          rounded-2xl border-2 border-[#5C1D0C]">

          {/* ── Top row ──────────────────────────────────────────────────── */}
          {renderCell(11, rashiPlanets[11], lagnaRashi === 11)}
          {renderCell(0,  rashiPlanets[0],  lagnaRashi === 0)}
          {renderCell(1,  rashiPlanets[1],  lagnaRashi === 1)}
          {renderCell(2,  rashiPlanets[2],  lagnaRashi === 2)}

          {/* ── Row 2 ────────────────────────────────────────────────────── */}
          {renderCell(10, rashiPlanets[10], lagnaRashi === 10)}
          {/* Centre label */}
          <div className="col-span-2 row-span-2 bg-[#FFFDF9]/90 rounded-xl border border-[#C89B3C]/40
            flex flex-col items-center justify-center gap-1 text-center p-2 shadow-inner">
            <span className="font-display font-bold text-[11px] sm:text-sm text-brand-primary leading-tight">
              दक्षिण भारतीय चक्र
            </span>
            <span className="text-[9px] sm:text-[10px] text-[#C89B3C] font-semibold">South Indian</span>
            <span className="text-[8px] sm:text-[9px] text-muted-foreground bg-brand-primary/5 px-1.5 py-0.5 rounded-full border border-[#C89B3C]/25 mt-0.5">
              लाहिरी अयनांश
            </span>
          </div>
          {renderCell(3, rashiPlanets[3], lagnaRashi === 3)}

          {/* ── Row 3 ────────────────────────────────────────────────────── */}
          {renderCell(9, rashiPlanets[9], lagnaRashi === 9)}
          {renderCell(4, rashiPlanets[4], lagnaRashi === 4)}

          {/* ── Row 4 ────────────────────────────────────────────────────── */}
          {renderCell(8, rashiPlanets[8],  lagnaRashi === 8)}
          {renderCell(7, rashiPlanets[7],  lagnaRashi === 7)}
          {renderCell(6, rashiPlanets[6],  lagnaRashi === 6)}
          {renderCell(5, rashiPlanets[5],  lagnaRashi === 5)}
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between text-[11px] border-t border-brand-gold-border/40 pt-2 px-1">
          <span className="flex items-center gap-1.5 font-medium text-brand-primary dark:text-brand-gold">
            <Sparkles className="h-3 w-3 text-[#C89B3C]" />
            स्थिर राशि चक्र (Fixed Zodiac)
          </span>
          <span className="text-brand-primary dark:text-brand-gold font-semibold bg-brand-primary/8 px-2 py-0.5 rounded-full border border-brand-gold-border/40 text-[10px]">
            Lahiri Ayanamsa
          </span>
        </div>
      </div>
    </div>
  );
};

function renderCell(
  rashiIdx: number,
  planetsInSign: Array<{ hi: string; fill: string; bg: string; retro: boolean }>,
  isLagna = false
) {
  const cell = SOUTH_GRID_CELLS.find((c) => c.rashi === rashiIdx);
  if (!cell) return <div key={rashiIdx} className="bg-white/80 rounded-lg border border-brand-gold-border/20" />;

  return (
    <div
      key={rashiIdx}
      className={[
        'relative rounded-xl p-1 sm:p-1.5 border flex flex-col gap-0.5 overflow-hidden transition-all min-h-0',
        isLagna
          ? 'border-[#5C1D0C] ring-1 ring-[#5C1D0C] bg-amber-50/80'
          : 'border-[#C89B3C]/35 bg-surface-raised/90',
      ].join(' ')}
    >
      {/* Sign name + Lagna badge */}
      <div className="flex items-center justify-between gap-0.5">
        <span className="font-display font-semibold text-[9px] sm:text-[10px] text-foreground/80 truncate leading-tight">
          {cell.hi}
        </span>
        {isLagna && (
          <span className="shrink-0 bg-[#5C1D0C] text-white text-[7px] sm:text-[8px] font-bold px-1 py-0.5 rounded leading-none">
            लग्न
          </span>
        )}
      </div>

      {/* Planet chips */}
      <div className="flex flex-wrap gap-[2px]">
        {planetsInSign.slice(0, 4).map((p, idx) => (
          <span
            key={idx}
            style={{ backgroundColor: p.bg, color: p.fill, border: `1px solid ${p.fill}40` }}
            className="text-[8px] sm:text-[9px] font-bold px-1 py-0.5 rounded-sm leading-none"
          >
            {p.hi}{p.retro ? '°' : ''}
          </span>
        ))}
        {planetsInSign.length > 4 && (
          <span className="text-[8px] text-muted-foreground font-bold leading-none px-0.5">
            +{planetsInSign.length - 4}
          </span>
        )}
      </div>
    </div>
  );
}

export const SouthIndianKundliChart = memo(SouthIndianKundliChartInner);
