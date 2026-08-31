import React, { memo } from 'react';
import { Info, Sparkles } from 'lucide-react';
import type { NormalizedPlanet, VedicAscendant } from '@/lib/astrology/types';

export interface NorthIndianKundliChartProps {
  planets: Record<string, NormalizedPlanet>;
  lagna?: VedicAscendant | string;
  isUnknownTime?: boolean;
  vargas?: Record<string, any>;
  activeVarga?: 'd1' | 'd9' | 'd10';
  className?: string;
}

// ── Only the 9 classical Vedic Grahas ────────────────────────────────────────
const VEDIC_PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

const PLANET_PALETTE: Record<string, { hi: string; short: string; bg: string; fill: string; border: string }> = {
  Sun:     { hi: 'सूर्य', short: 'सू', bg: '#FEF3C7', fill: '#92400E', border: '#F59E0B' },
  Moon:    { hi: 'चन्द्र', short: 'चं', bg: '#DBEAFE', fill: '#1D4ED8', border: '#3B82F6' },
  Mars:    { hi: 'मंगल', short: 'मं', bg: '#FEE2E2', fill: '#B91C1C', border: '#EF4444' },
  Mercury: { hi: 'बुध',   short: 'बु', bg: '#D1FAE5', fill: '#065F46', border: '#10B981' },
  Jupiter: { hi: 'गुरु',  short: 'गु', bg: '#FEF9C3', fill: '#854D0E', border: '#EAB308' },
  Venus:   { hi: 'शुक्र', short: 'शु', bg: '#FCE7F3', fill: '#9D174D', border: '#EC4899' },
  Saturn:  { hi: 'शनि',  short: 'श',  bg: '#EDE9FE', fill: '#3730A3', border: '#6366F1' },
  Rahu:    { hi: 'राहु',  short: 'रा', bg: '#F3E8FF', fill: '#6B21A8', border: '#A855F7' },
  Ketu:    { hi: 'केतु',  short: 'के', bg: '#F5F5F4', fill: '#44403C', border: '#78716C' },
};

// ── Mathematically exact geometric centroids for 400×400 canvas ───────────────
// Rashi numbers are placed along outer perimeter edges.
// Planet clusters are centered at the true geometric centroids of each house.
const HOUSE_RASHI_POS: Record<number, [number, number]> = {
  1:  [200,  44],   // Top diamond apex
  2:  [135,  24],   // Top-left outer triangle (upper edge)
  3:  [ 24, 135],   // Top-left outer triangle (left edge)
  4:  [ 44, 200],   // Left diamond apex
  5:  [ 24, 265],   // Bottom-left outer triangle (left edge)
  6:  [135, 376],   // Bottom-left outer triangle (bottom edge)
  7:  [200, 356],   // Bottom diamond apex
  8:  [265, 376],   // Bottom-right outer triangle (bottom edge)
  9:  [376, 265],   // Bottom-right outer triangle (right edge)
  10: [356, 200],   // Right diamond apex
  11: [376, 135],   // Top-right outer triangle (right edge)
  12: [265,  24],   // Top-right outer triangle (upper edge)
};

const HOUSE_PLANET_CENTERS: Record<number, [number, number]> = {
  1:  [200, 115],   // Top diamond core
  2:  [100,  48],   // Top-left upper triangle centroid
  3:  [ 48, 100],   // Top-left left triangle centroid
  4:  [115, 200],   // Left diamond core
  5:  [ 48, 300],   // Bottom-left left triangle centroid
  6:  [100, 352],   // Bottom-left bottom triangle centroid
  7:  [200, 285],   // Bottom diamond core
  8:  [300, 352],   // Bottom-right bottom triangle centroid
  9:  [352, 300],   // Bottom-right right triangle centroid
  10: [285, 200],   // Right diamond core
  11: [352, 100],   // Top-right right triangle centroid
  12: [300,  48],   // Top-right top triangle centroid
};

const NorthIndianKundliChartInner: React.FC<NorthIndianKundliChartProps> = ({
  planets = {},
  lagna,
  isUnknownTime = false,
  vargas = {},
  activeVarga = 'd1',
  className = '',
}) => {
  if (isUnknownTime) {
    return (
      <div className="temple-panel-soft flex flex-col items-center justify-center p-8 text-center">
        <div className="h-12 w-12 rounded-full bg-brand-primary/10 flex items-center justify-center mb-3">
          <Info className="h-6 w-6 text-brand-primary" />
        </div>
        <h4 className="font-display font-bold text-base text-brand-primary">
          लग्न चक्र उपलब्ध नहीं (Lagna Chart Omitted)
        </h4>
        <p className="text-xs text-muted-foreground max-w-sm mt-1 leading-relaxed">
          सटीक जन्म समय ज्ञात न होने के कारण भाव-विशिष्ट लग्न चक्र नहीं बनाया गया है।
        </p>
      </div>
    );
  }

  // ── Active varga resolution ─────────────────────────────────────────────
  let activePlanets = planets;
  let lagnaRashiIndex = 0;

  if (typeof lagna === 'object' && lagna && 'rashi' in lagna) {
    lagnaRashiIndex = (lagna as VedicAscendant).rashi;
  }

  if (activeVarga !== 'd1' && vargas?.[activeVarga]) {
    const vargaData = vargas[activeVarga];
    if (vargaData.ascendant?.rashi != null) lagnaRashiIndex = vargaData.ascendant.rashi;
    if (vargaData.planets) {
      const mapped: Record<string, NormalizedPlanet> = {};
      for (const [pName, pVal] of Object.entries(vargaData.planets as Record<string, any>)) {
        if (!pVal || !VEDIC_PLANETS.includes(pName)) continue;
        const rIndex = pVal.rashi ?? 0;
        mapped[pName] = {
          name: pName,
          sign: pVal.rashiName || '',
          signNumber: rIndex,
          degree: pVal.longitude ? pVal.longitude % 30 : 0,
          isRetrograde: false,
          house: ((rIndex - lagnaRashiIndex + 12) % 12) + 1,
          nakshatra: pVal.nakshatra,
        };
      }
      activePlanets = mapped;
    }
  }

  // ── Group planets by house (only Vedic 9) ───────────────────────────────
  const housePlanets: Record<number, Array<{ hi: string; short: string; isRetro: boolean; bg: string; fill: string; border: string }>> = {};
  for (let i = 1; i <= 12; i++) housePlanets[i] = [];

  for (const [pName, pData] of Object.entries(activePlanets)) {
    if (!VEDIC_PLANETS.includes(pName)) continue;
    const h = pData?.house;
    if (h && h >= 1 && h <= 12) {
      const p = PLANET_PALETTE[pName] ?? { hi: pName.slice(0, 2), short: pName.slice(0, 2), bg: '#F5F5F4', fill: '#292524', border: '#D6D3D1' };
      housePlanets[h].push({
        hi: p.hi,
        short: p.short,
        isRetro: Boolean(pData.isRetrograde),
        bg: p.bg,
        fill: p.fill,
        border: p.border,
      });
    }
  }

  const getHouseRashiNum = (h: number) => ((lagnaRashiIndex + h - 1) % 12) + 1;

  // ── Multi-planet geometry-aware rendering ────────────────────────────────
  const renderHousePlanets = (house: number) => {
    const list = housePlanets[house];
    if (!list || list.length === 0) return null;
    const [cx, cy] = HOUSE_PLANET_CENTERS[house];
    const isDiamond = house === 1 || house === 4 || house === 7 || house === 10;
    const count = list.length;

    // 1 Planet
    if (count === 1) {
      const p = list[0];
      const bw = isDiamond ? 30 : 24;
      const bh = isDiamond ? 12.5 : 11;
      const bx = cx - bw / 2;
      const by = cy - bh / 2;
      return (
        <g key={`h${house}-p`}>
          <rect x={bx} y={by} width={bw} height={bh} rx={3}
            fill={p.bg} stroke={p.border} strokeWidth="0.8" opacity="0.96" />
          <text x={cx} y={by + bh - 3} textAnchor="middle"
            fontSize={isDiamond ? "8.5" : "7.5"} fontWeight="700" fill={p.fill} fontFamily="serif">
            {p.hi}{p.isRetro ? '°' : ''}
          </text>
        </g>
      );
    }

    // 2 Planets
    if (count === 2) {
      const bw = isDiamond ? 28 : 22;
      const bh = isDiamond ? 11 : 9.5;
      const gap = 1.5;
      const totalH = 2 * bh + gap;
      const startY = cy - totalH / 2;
      return (
        <g key={`h${house}-p`}>
          {list.map((p, i) => {
            const by = startY + i * (bh + gap);
            const bx = cx - bw / 2;
            return (
              <g key={i}>
                <rect x={bx} y={by} width={bw} height={bh} rx={2.5}
                  fill={p.bg} stroke={p.border} strokeWidth="0.7" opacity="0.96" />
                <text x={cx} y={by + bh - 2.5} textAnchor="middle"
                  fontSize={isDiamond ? "8" : "7"} fontWeight="700" fill={p.fill} fontFamily="serif">
                  {p.hi}{p.isRetro ? '°' : ''}
                </text>
              </g>
            );
          })}
        </g>
      );
    }

    // 3 Planets
    if (count === 3) {
      const bw = isDiamond ? 26 : 20;
      const bh = isDiamond ? 10.5 : 9;
      const gap = 1.2;
      const totalH = 3 * bh + 2 * gap;
      const startY = cy - totalH / 2;
      return (
        <g key={`h${house}-p`}>
          {list.map((p, i) => {
            const by = startY + i * (bh + gap);
            const bx = cx - bw / 2;
            return (
              <g key={i}>
                <rect x={bx} y={by} width={bw} height={bh} rx={2}
                  fill={p.bg} stroke={p.border} strokeWidth="0.6" opacity="0.96" />
                <text x={cx} y={by + bh - 2.2} textAnchor="middle"
                  fontSize={isDiamond ? "7.5" : "6.5"} fontWeight="700" fill={p.fill} fontFamily="serif">
                  {p.hi}{p.isRetro ? '°' : ''}
                </text>
              </g>
            );
          })}
        </g>
      );
    }

    // 4 or more planets: 2-column compact grid
    const bw = isDiamond ? 22 : 18;
    const bh = isDiamond ? 10 : 8.5;
    const gapX = 1.5;
    const gapY = 1.5;
    const cols = 2;
    const rows = Math.ceil(count / cols);
    const totalW = cols * bw + gapX;
    const totalH = rows * bh + (rows - 1) * gapY;
    const startX = cx - totalW / 2;
    const startY = cy - totalH / 2;

    return (
      <g key={`h${house}-p`}>
        {list.map((p, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const bx = startX + col * (bw + gapX);
          const by = startY + row * (bh + gapY);
          return (
            <g key={i}>
              <rect x={bx} y={by} width={bw} height={bh} rx={2}
                fill={p.bg} stroke={p.border} strokeWidth="0.5" opacity="0.96" />
              <text x={bx + bw / 2} y={by + bh - 2} textAnchor="middle"
                fontSize={isDiamond ? "7" : "6"} fontWeight="700" fill={p.fill} fontFamily="serif">
                {p.short}{p.isRetro ? '°' : ''}
              </text>
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <div className={`relative w-full mx-auto select-none ${className}`}>
      {/* ── Ornate Vedic Kundli Canvas ───────────────────────────────────── */}
      <div className="temple-panel p-3 sm:p-4 relative overflow-hidden bg-gradient-to-br from-[#FFFDF9] via-[#FFFBF2] to-[#FFF6E5] rounded-2xl shadow-sm border border-brand-gold-border/40">
        {/* Corner sacred ornaments */}
        {['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'].map((pos) => (
          <div key={pos} className={`absolute ${pos} text-[#C89B3C] text-[10px] opacity-40 select-none pointer-events-none`}>❖</div>
        ))}

        <svg
          viewBox="0 0 400 400"
          className="w-full h-auto"
          style={{ shapeRendering: 'geometricPrecision', overflow: 'visible' }}
          aria-label="North Indian Vedic Kundli chart"
          role="img"
        >
          <defs>
            <linearGradient id="kundliBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFDF9" />
              <stop offset="100%" stopColor="#FFF6E5" />
            </linearGradient>
            <linearGradient id="diamondBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFF8ED" />
              <stop offset="100%" stopColor="#FEF0D4" />
            </linearGradient>
          </defs>

          {/* Outer temple border */}
          <rect x="3" y="3" width="394" height="394" fill="url(#kundliBg)"
            stroke="#5C1D0C" strokeWidth="2.2" rx="12" />
          
          {/* Gold inner filigree accent */}
          <rect x="7" y="7" width="386" height="386" fill="none"
            stroke="#C89B3C" strokeWidth="0.8" strokeDasharray="5 3" rx="9" opacity="0.6" />

          {/* Sacred Om watermark */}
          <text x="200" y="212" textAnchor="middle" fill="#5C1D0C"
            fontSize="32" opacity="0.05" fontFamily="serif" fontWeight="bold">ॐ</text>

          {/* Central main diamond */}
          <polygon points="200,4 396,200 200,396 4,200"
            fill="url(#diamondBg)" stroke="#5C1D0C" strokeWidth="1.8" />

          {/* Diagonals */}
          <line x1="4" y1="4" x2="396" y2="396" stroke="#5C1D0C" strokeWidth="1.8" />
          <line x1="396" y1="4" x2="4" y2="396" stroke="#5C1D0C" strokeWidth="1.8" />

          {/* Diamond perimeter lines */}
          <line x1="200" y1="4"   x2="4"   y2="200" stroke="#5C1D0C" strokeWidth="1.8" />
          <line x1="200" y1="4"   x2="396" y2="200" stroke="#5C1D0C" strokeWidth="1.8" />
          <line x1="4"   y1="200" x2="200" y2="396" stroke="#5C1D0C" strokeWidth="1.8" />
          <line x1="396" y1="200" x2="200" y2="396" stroke="#5C1D0C" strokeWidth="1.8" />

          {/* Inner gold decorative diamond */}
          <polygon points="200,14 386,200 200,386 14,200"
            fill="none" stroke="#C89B3C" strokeWidth="0.6" opacity="0.3" />

          {/* ── 12 House Rashi Numbers ─────────────────────────────────── */}
          {[1,2,3,4,5,6,7,8,9,10,11,12].map((h) => {
            const [rx, ry] = HOUSE_RASHI_POS[h];
            const isLagna = h === 1;
            const rashiNum = getHouseRashiNum(h);

            return (
              <g key={`h${h}-num`}>
                {isLagna ? (
                  <g>
                    <rect x={rx - 15} y={ry - 9} width="30" height="17" rx="3.5"
                      fill="#5C1D0C" opacity="0.10" stroke="#5C1D0C" strokeWidth="0.6" />
                    <text x={rx - 3.5} y={ry + 3.5} textAnchor="middle"
                      fill="#5C1D0C" fontSize="11" fontWeight="800" fontFamily="serif">
                      {rashiNum}
                    </text>
                    <text x={rx + 7.5} y={ry + 3} textAnchor="middle"
                      fill="#854D0E" fontSize="7" fontWeight="700" fontFamily="serif">
                      लग्न
                    </text>
                  </g>
                ) : (
                  <text
                    x={rx} y={ry + 3.5}
                    textAnchor="middle"
                    fill="#7C4A1E"
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="serif"
                  >
                    {rashiNum}
                  </text>
                )}
              </g>
            );
          })}

          {/* ── 12 House Planet Clusters ──────────────────────────────── */}
          {[1,2,3,4,5,6,7,8,9,10,11,12].map((h) => renderHousePlanets(h))}
        </svg>

        {/* Footer meta */}
        <div className="mt-3 flex items-center justify-between text-[11px] border-t border-brand-gold-border/40 pt-2 px-1">
          <span className="flex items-center gap-1.5 font-medium text-brand-primary dark:text-brand-gold">
            <Sparkles className="h-3 w-3 text-[#C89B3C]" />
            {activeVarga.toUpperCase()} कुण्डली चक्र
          </span>
          <span className="text-brand-primary dark:text-brand-gold font-semibold bg-brand-primary/8 px-2 py-0.5 rounded-full border border-brand-gold-border/40 text-[10px]">
            लाहिरी अयनांश
          </span>
        </div>
      </div>
    </div>
  );
};

export const NorthIndianKundliChart = memo(NorthIndianKundliChartInner);
