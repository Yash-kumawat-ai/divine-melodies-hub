import React, { memo } from 'react';
import { Info, Sparkles } from 'lucide-react';
import type { NormalizedPlanet, VedicAscendant } from '@/lib/astrology/types';
import { buildChartViewModel, type ChartViewModel, type VargaId } from '@/lib/astrology/chartPresentationAdapter';

export interface NorthIndianKundliChartProps {
  planets?: Record<string, NormalizedPlanet>;
  lagna?: VedicAscendant | string;
  isUnknownTime?: boolean;
  vargas?: Record<string, any>;
  activeVarga?: VargaId;
  chartViewModel?: ChartViewModel;
  className?: string;
}

// ── Mathematically exact geometric centroids for 400×400 canvas ───────────────
const HOUSE_RASHI_POS: Record<number, [number, number]> = {
  1:  [200,  46],   // Top diamond apex
  2:  [135,  26],   // Top-left outer triangle (upper edge)
  3:  [ 26, 135],   // Top-left outer triangle (left edge)
  4:  [ 46, 200],   // Left diamond apex
  5:  [ 26, 265],   // Bottom-left outer triangle (left edge)
  6:  [135, 374],   // Bottom-left outer triangle (bottom edge)
  7:  [200, 354],   // Bottom diamond apex
  8:  [265, 374],   // Bottom-right outer triangle (bottom edge)
  9:  [374, 265],   // Bottom-right outer triangle (right edge)
  10: [354, 200],   // Right diamond apex
  11: [374, 135],   // Top-right outer triangle (right edge)
  12: [265,  26],   // Top-right outer triangle (upper edge)
};

const HOUSE_PLANET_CENTERS: Record<number, [number, number]> = {
  1:  [200, 118],   // Top diamond core
  2:  [100,  52],   // Top-left upper triangle centroid
  3:  [ 52, 100],   // Top-left left triangle centroid
  4:  [118, 200],   // Left diamond core
  5:  [ 52, 300],   // Bottom-left left triangle centroid
  6:  [100, 348],   // Bottom-left bottom triangle centroid
  7:  [200, 282],   // Bottom diamond core
  8:  [300, 348],   // Bottom-right bottom triangle centroid
  9:  [348, 300],   // Bottom-right right triangle centroid
  10: [282, 200],   // Right diamond core
  11: [348, 100],   // Top-right right triangle centroid
  12: [300,  52],   // Top-right top triangle centroid
};

const NorthIndianKundliChartInner: React.FC<NorthIndianKundliChartProps> = ({
  planets = {},
  lagna,
  isUnknownTime = false,
  vargas = {},
  activeVarga = 'd1',
  chartViewModel,
  className = '',
}) => {
  if (isUnknownTime) {
    return (
      <div className="temple-panel-soft flex flex-col items-center justify-center p-8 text-center min-h-[360px]">
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

  // Use pre-computed canonical view model or derive through the shared adapter
  const vm: ChartViewModel = chartViewModel || buildChartViewModel(planets, lagna, vargas, activeVarga, true);

  // ── Multi-planet geometry-aware rendering ────────────────────────────────
  const renderHousePlanets = (house: number) => {
    const list = vm.byHouse[house];
    if (!list || list.length === 0) return null;
    const [cx, cy] = HOUSE_PLANET_CENTERS[house];
    const isDiamond = house === 1 || house === 4 || house === 7 || house === 10;
    const count = list.length;

    // 1 Planet: prominent legible pill
    if (count === 1) {
      const p = list[0];
      const bw = isDiamond ? 38 : 34;
      const bh = isDiamond ? 15.5 : 14.5;
      const bx = cx - bw / 2;
      const by = cy - bh / 2;

      return (
        <g key={`h${house}-p`}>
          <rect
            x={bx}
            y={by}
            width={bw}
            height={bh}
            rx={4}
            fill={p.palette.bg}
            stroke={p.palette.border}
            strokeWidth="1"
            className="filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.06)]"
          />
          <text
            x={cx}
            y={cy + 0.5}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="11"
            fontWeight="600"
            fill={p.palette.fill}
            fontFamily="sans-serif, system-ui"
          >
            {p.nameHi}{p.isRetrograde ? '°' : ''}
          </text>
        </g>
      );
    }

    // 2 Planets: stacked vertically with continuous font size
    if (count === 2) {
      const bw = isDiamond ? 36 : 33;
      const bh = isDiamond ? 14.5 : 13.5;
      const gap = 2;
      const totalH = 2 * bh + gap;
      const startY = cy - totalH / 2;

      return (
        <g key={`h${house}-p`}>
          {list.map((p, i) => {
            const by = startY + i * (bh + gap);
            const bx = cx - bw / 2;
            const itemCy = by + bh / 2;
            return (
              <g key={p.planet}>
                <rect
                  x={bx}
                  y={by}
                  width={bw}
                  height={bh}
                  rx={3.5}
                  fill={p.palette.bg}
                  stroke={p.palette.border}
                  strokeWidth="0.9"
                  className="filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
                />
                <text
                  x={cx}
                  y={itemCy + 0.5}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="10.5"
                  fontWeight="600"
                  fill={p.palette.fill}
                  fontFamily="sans-serif, system-ui"
                >
                  {p.nameHi}{p.isRetrograde ? '°' : ''}
                </text>
              </g>
            );
          })}
        </g>
      );
    }

    // 3 Planets: compact vertical stack with continuous font size
    if (count === 3) {
      const bw = isDiamond ? 34 : 31;
      const bh = isDiamond ? 13.5 : 12.5;
      const gap = 1.5;
      const totalH = 3 * bh + 2 * gap;
      const startY = cy - totalH / 2;

      return (
        <g key={`h${house}-p`}>
          {list.map((p, i) => {
            const by = startY + i * (bh + gap);
            const bx = cx - bw / 2;
            const itemCy = by + bh / 2;
            return (
              <g key={p.planet}>
                <rect
                  x={bx}
                  y={by}
                  width={bw}
                  height={bh}
                  rx={3}
                  fill={p.palette.bg}
                  stroke={p.palette.border}
                  strokeWidth="0.8"
                  className="filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
                />
                <text
                  x={cx}
                  y={itemCy + 0.5}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="10.5"
                  fontWeight="600"
                  fill={p.palette.fill}
                  fontFamily="sans-serif, system-ui"
                >
                  {p.nameHi}{p.isRetrograde ? '°' : ''}
                </text>
              </g>
            );
          })}
        </g>
      );
    }

    // 4 or more planets: 2x2 grid in center
    const cols = 2;
    const bw = 29;
    const bh = 13;
    const gapX = 2;
    const gapY = 1.5;
    const startX = cx - (cols * bw + gapX) / 2 + bw / 2;
    const startY = cy - (Math.ceil(count / cols) * bh + gapY) / 2 + bh / 2;

    return (
      <g key={`h${house}-p`}>
        {list.map((p, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const itemCx = startX + col * (bw + gapX);
          const itemCy = startY + row * (bh + gapY);
          return (
            <g key={p.planet}>
              <rect
                x={itemCx - bw / 2}
                y={itemCy - bh / 2}
                width={bw}
                height={bh}
                rx={2.5}
                fill={p.palette.bg}
                stroke={p.palette.border}
                strokeWidth="0.8"
              />
              <text
                x={itemCx}
                y={itemCy + 0.5}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="10"
                fontWeight="600"
                fill={p.palette.fill}
                fontFamily="sans-serif, system-ui"
              >
                {p.nameHi}{p.isRetrograde ? '°' : ''}
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
      <div className="temple-panel p-2 sm:p-3 relative overflow-hidden bg-gradient-to-br from-[#FFFDF9] via-[#FFFBF2] to-[#FFF6E5] rounded-2xl shadow-sm border border-brand-gold-border/50">
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
            <linearGradient id="northBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFDF9" />
              <stop offset="100%" stopColor="#FFF6E5" />
            </linearGradient>
            <linearGradient id="northDiamondBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFF9EE" />
              <stop offset="100%" stopColor="#FEF0D4" />
            </linearGradient>
          </defs>

          {/* Outer temple border */}
          <rect
            x="3"
            y="3"
            width="394"
            height="394"
            fill="url(#northBg)"
            stroke="#5C1D0C"
            strokeWidth="2.2"
            rx="12"
          />

          {/* Gold inner filigree accent */}
          <rect
            x="7"
            y="7"
            width="386"
            height="386"
            fill="none"
            stroke="#C89B3C"
            strokeWidth="0.8"
            strokeDasharray="5 3"
            rx="9"
            opacity="0.6"
          />

          {/* Sacred Om watermark */}
          <text
            x="200"
            y="212"
            textAnchor="middle"
            dominantBaseline="central"
            fill="#5C1D0C"
            fontSize="34"
            opacity="0.05"
            fontFamily="serif"
            fontWeight="bold"
          >
            ॐ
          </text>

          {/* Central main diamond */}
          <polygon
            points="200,4 396,200 200,396 4,200"
            fill="url(#northDiamondBg)"
            stroke="#5C1D0C"
            strokeWidth="1.8"
          />

          {/* Diagonals */}
          <line x1="4" y1="4" x2="396" y2="396" stroke="#5C1D0C" strokeWidth="1.8" />
          <line x1="396" y1="4" x2="4" y2="396" stroke="#5C1D0C" strokeWidth="1.8" />

          {/* Diamond perimeter lines */}
          <line x1="200" y1="4"   x2="4"   y2="200" stroke="#5C1D0C" strokeWidth="1.8" />
          <line x1="200" y1="4"   x2="396" y2="200" stroke="#5C1D0C" strokeWidth="1.8" />
          <line x1="4"   y1="200" x2="200" y2="396" stroke="#5C1D0C" strokeWidth="1.8" />
          <line x1="396" y1="200" x2="200" y2="396" stroke="#5C1D0C" strokeWidth="1.8" />

          {/* Inner gold decorative diamond */}
          <polygon
            points="200,14 386,200 200,386 14,200"
            fill="none"
            stroke="#C89B3C"
            strokeWidth="0.6"
            opacity="0.35"
          />

          {/* ── 12 House Rashi Numbers (Large, high-contrast, perfectly legible) ─── */}
          {[1,2,3,4,5,6,7,8,9,10,11,12].map((h) => {
            const [rx, ry] = HOUSE_RASHI_POS[h];
            const isLagna = h === 1;
            const rashiNum = vm.houseRashiMap[h];

            if (isLagna) {
              return (
                <g key={`h${h}-num`}>
                  {/* Lagna House 1 distinct pill */}
                  <rect
                    x={rx - 19}
                    y={ry - 10}
                    width="38"
                    height="20"
                    rx="4.5"
                    fill="#5C1D0C"
                    fillOpacity="0.12"
                    stroke="#5C1D0C"
                    strokeWidth="0.9"
                  />
                  <text
                    x={rx - 5}
                    y={ry + 0.5}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#5C1D0C"
                    fontSize="13.5"
                    fontWeight="800"
                    fontFamily="serif"
                  >
                    {rashiNum}
                  </text>
                  <text
                    x={rx + 10}
                    y={ry + 0.5}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#854D0E"
                    fontSize="8.5"
                    fontWeight="800"
                    fontFamily="sans-serif, system-ui"
                  >
                    लग्न
                  </text>
                </g>
              );
            }

            return (
              <g key={`h${h}-num`}>
                {/* Subtle soft backdrop circle for extreme readability */}
                <circle
                  cx={rx}
                  cy={ry}
                  r="9"
                  fill="#FFFDF9"
                  fillOpacity="0.85"
                  stroke="#C89B3C"
                  strokeWidth="0.5"
                  strokeOpacity="0.3"
                />
                <text
                  x={rx}
                  y={ry + 0.5}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#78350F"
                  fontSize="13"
                  fontWeight="800"
                  fontFamily="serif"
                >
                  {rashiNum}
                </text>
              </g>
            );
          })}

          {/* ── 12 House Planet Clusters ──────────────────────────────── */}
          {[1,2,3,4,5,6,7,8,9,10,11,12].map((h) => renderHousePlanets(h))}
        </svg>

        {/* Minimal dignified footer */}
        <div className="mt-2.5 flex items-center justify-between text-[11px] border-t border-brand-gold-border/35 pt-2 px-1">
          <span className="flex items-center gap-1.5 font-bold text-brand-primary dark:text-brand-gold">
            <Sparkles className="h-3 w-3 text-[#C89B3C]" />
            {vm.titleHi}
          </span>
          <span className="text-brand-primary dark:text-brand-gold font-bold bg-brand-primary/8 px-2.5 py-0.5 rounded-full border border-brand-gold-border/40 text-[10px]">
            लाहिरी अयनांश
          </span>
        </div>
      </div>
    </div>
  );
};

export const NorthIndianKundliChart = memo(NorthIndianKundliChartInner);
