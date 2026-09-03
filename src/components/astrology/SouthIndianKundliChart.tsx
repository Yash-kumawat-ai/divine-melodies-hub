import React, { memo } from 'react';
import { Info, Sparkles } from 'lucide-react';
import type { NormalizedPlanet, VedicAscendant } from '@/lib/astrology/types';
import { buildChartViewModel, type ChartViewModel, type VargaId } from '@/lib/astrology/chartPresentationAdapter';

export interface SouthIndianKundliChartProps {
  planets?: Record<string, NormalizedPlanet>;
  lagna?: VedicAscendant | string;
  isUnknownTime?: boolean;
  vargas?: Record<string, any>;
  activeVarga?: VargaId;
  chartViewModel?: ChartViewModel;
  className?: string;
}

// ── Classical South Indian Fixed Zodiac Coordinate Grid (400×400) ──────────────
// Fixed signs clockwise: Pisces (top-left) to Aquarius (left)
interface SouthCellMeta {
  rashiIndex: number; // 0 = Aries, 11 = Pisces
  x: number;
  y: number;
  col: number;
  row: number;
  nameHi: string;
  nameEn: string;
}

const SOUTH_CELL_LAYOUT: SouthCellMeta[] = [
  // Top Row (row 0, left to right)
  { rashiIndex: 11, x: 0,   y: 0,   col: 0, row: 0, nameHi: 'मीन',    nameEn: 'Pisces' },
  { rashiIndex: 0,  x: 100, y: 0,   col: 1, row: 0, nameHi: 'मेष',    nameEn: 'Aries' },
  { rashiIndex: 1,  x: 200, y: 0,   col: 2, row: 0, nameHi: 'वृषभ',   nameEn: 'Taurus' },
  { rashiIndex: 2,  x: 300, y: 0,   col: 3, row: 0, nameHi: 'मिथुन',  nameEn: 'Gemini' },

  // Right Column (col 3, top to bottom)
  { rashiIndex: 3,  x: 300, y: 100, col: 3, row: 1, nameHi: 'कर्क',   nameEn: 'Cancer' },
  { rashiIndex: 4,  x: 300, y: 200, col: 3, row: 2, nameHi: 'सिंह',   nameEn: 'Leo' },
  { rashiIndex: 5,  x: 300, y: 300, col: 3, row: 3, nameHi: 'कन्या',  nameEn: 'Virgo' },

  // Bottom Row (row 3, right to left)
  { rashiIndex: 6,  x: 200, y: 300, col: 2, row: 3, nameHi: 'तुला',   nameEn: 'Libra' },
  { rashiIndex: 7,  x: 100, y: 300, col: 1, row: 3, nameHi: 'वृश्चिक', nameEn: 'Scorpio' },
  { rashiIndex: 8,  x: 0,   y: 300, col: 0, row: 3, nameHi: 'धनु',    nameEn: 'Sagittarius' },

  // Left Column (col 0, bottom to top)
  { rashiIndex: 9,  x: 0,   y: 200, col: 0, row: 2, nameHi: 'मकर',   nameEn: 'Capricorn' },
  { rashiIndex: 10, x: 0,   y: 100, col: 0, row: 1, nameHi: 'कुम्भ',  nameEn: 'Aquarius' },
];

const SouthIndianKundliChartInner: React.FC<SouthIndianKundliChartProps> = ({
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
          दक्षिण भारतीय चक्र उपलब्ध नहीं (Chart Omitted)
        </h4>
        <p className="text-xs text-muted-foreground max-w-sm mt-1 leading-relaxed">
          सटीक जन्म समय ज्ञात न होने के कारण भाव-विशिष्ट दक्षिण भारतीय चक्र नहीं बनाया गया है।
        </p>
      </div>
    );
  }

  // Use pre-computed canonical view model or derive through the shared adapter
  const vm: ChartViewModel = chartViewModel || buildChartViewModel(planets, lagna, vargas, activeVarga, true);

  // ── Render Grahas inside a 100×100 South Indian Cell ─────────────────────
  const renderCellGrahas = (cell: SouthCellMeta, isLagna: boolean) => {
    const list = vm.byRashi[cell.rashiIndex] || [];
    const count = list.length;
    if (count === 0) return null;

    // 1 Planet: prominent centered pill
    if (count === 1) {
      const p = list[0];
      const bw = 48;
      const bh = 18;
      const cx = cell.x + 50;
      const cy = cell.y + 54;

      return (
        <g key={`si-cluster-${cell.rashiIndex}`}>
          <rect
            x={cx - bw / 2}
            y={cy - bh / 2}
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

    // 2 Planets: clean vertical stack
    if (count === 2) {
      const bw = 46;
      const bh = 17;
      const cx = cell.x + 50;
      const startY = cell.y + 38;
      const gap = 3;

      return (
        <g key={`si-cluster-${cell.rashiIndex}`}>
          {list.map((p, idx) => {
            const cy = startY + idx * (bh + gap);
            return (
              <g key={p.planet}>
                <rect
                  x={cx - bw / 2}
                  y={cy - bh / 2}
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
          })}
        </g>
      );
    }

    // 3 Planets: snug vertical stack
    if (count === 3) {
      const bw = 44;
      const bh = 16;
      const cx = cell.x + 50;
      const startY = cell.y + 32;
      const gap = 2.5;

      return (
        <g key={`si-cluster-${cell.rashiIndex}`}>
          {list.map((p, idx) => {
            const cy = startY + idx * (bh + gap);
            return (
              <g key={p.planet}>
                <rect
                  x={cx - bw / 2}
                  y={cy - bh / 2}
                  width={bw}
                  height={bh}
                  rx={3}
                  fill={p.palette.bg}
                  stroke={p.palette.border}
                  strokeWidth="0.8"
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
          })}
        </g>
      );
    }

    // 4 or more planets: 2×2 grid inside cell
    const bw = 40;
    const bh = 15.5;
    const cols = 2;
    const gapX = 3;
    const gapY = 2.5;
    const startX = cell.x + 50 - (cols * bw + gapX) / 2 + bw / 2;
    const startY = cell.y + 40;

    return (
      <g key={`si-cluster-${cell.rashiIndex}`}>
        {list.map((p, idx) => {
          const col = idx % cols;
          const row = Math.floor(idx / cols);
          const cx = startX + col * (bw + gapX);
          const cy = startY + row * (bh + gapY);
          return (
            <g key={p.planet}>
              <rect
                x={cx - bw / 2}
                y={cy - bh / 2}
                width={bw}
                height={bh}
                rx={2.5}
                fill={p.palette.bg}
                stroke={p.palette.border}
                strokeWidth="0.8"
              />
              <text
                x={cx}
                y={cy + 0.5}
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
          style={{ shapeRendering: 'geometricPrecision' }}
          aria-label="South Indian Vedic Kundli chart"
          role="img"
        >
          <defs>
            <linearGradient id="southOuterBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFDF9" />
              <stop offset="100%" stopColor="#FFF6E5" />
            </linearGradient>
            <linearGradient id="southCenterBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFDF8" />
              <stop offset="100%" stopColor="#FFF3DC" />
            </linearGradient>
          </defs>

          {/* Outer Canvas Boundary */}
          <rect
            x="3"
            y="3"
            width="394"
            height="394"
            fill="url(#southOuterBg)"
            stroke="#5C1D0C"
            strokeWidth="2.2"
            rx="12"
          />

          {/* Gold Inner Filigree Accent */}
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

          {/* ── Mathematical Grid Lines (Exact, crisp, continuous) ────────── */}
          {/* Vertical division lines */}
          <line x1="100" y1="4"   x2="100" y2="396" stroke="#5C1D0C" strokeWidth="1.6" />
          <line x1="200" y1="4"   x2="200" y2="100" stroke="#5C1D0C" strokeWidth="1.6" />
          <line x1="200" y1="300" x2="200" y2="396" stroke="#5C1D0C" strokeWidth="1.6" />
          <line x1="300" y1="4"   x2="300" y2="396" stroke="#5C1D0C" strokeWidth="1.6" />

          {/* Horizontal division lines */}
          <line x1="4"   y1="100" x2="396" y2="100" stroke="#5C1D0C" strokeWidth="1.6" />
          <line x1="4"   y1="200" x2="100" y2="200" stroke="#5C1D0C" strokeWidth="1.6" />
          <line x1="300" y1="200" x2="396" y2="200" stroke="#5C1D0C" strokeWidth="1.6" />
          <line x1="4"   y1="300" x2="396" y2="300" stroke="#5C1D0C" strokeWidth="1.6" />

          {/* ── 12 Zodiac Cells (Fixed Signs, Clockwise) ─────────────────── */}
          {SOUTH_CELL_LAYOUT.map((cell) => {
            const isLagna = cell.rashiIndex === vm.lagnaRashiIndex;

            return (
              <g key={`si-cell-${cell.rashiIndex}`}>
                {/* Highlight cell if Lagna */}
                {isLagna && (
                  <>
                    <rect
                      x={cell.x + 1}
                      y={cell.y + 1}
                      width="98"
                      height="98"
                      fill="#FEF3C7"
                      fillOpacity="0.25"
                    />
                    {/* Classical Traditional Lagna Diagonal Slash */}
                    <line
                      x1={cell.x + 4}
                      y1={cell.y + 4}
                      x2={cell.x + 96}
                      y2={cell.y + 96}
                      stroke="#5C1D0C"
                      strokeWidth="1.2"
                      strokeDasharray="4 2"
                      opacity="0.45"
                    />
                  </>
                )}

                {/* Sign Name (Discreet, high contrast, top-left) */}
                <text
                  x={cell.x + 8}
                  y={cell.y + 16}
                  textAnchor="start"
                  dominantBaseline="central"
                  fontSize="11"
                  fontWeight="700"
                  fill="#78350F"
                  fontFamily="sans-serif, system-ui"
                >
                  {cell.nameHi}
                </text>

                {/* Lagna Badge in Top-Right of Cell if Lagna */}
                {isLagna && (
                  <g>
                    <rect
                      x={cell.x + 60}
                      y={cell.y + 6}
                      width="33"
                      height="17"
                      rx="3.5"
                      fill="#5C1D0C"
                    />
                    <text
                      x={cell.x + 76.5}
                      y={cell.y + 14.5}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="9"
                      fontWeight="800"
                      fill="#FFFFFF"
                      fontFamily="sans-serif, system-ui"
                    >
                      लग्न
                    </text>
                  </g>
                )}

                {/* Graha Badges inside this cell */}
                {renderCellGrahas(cell, isLagna)}
              </g>
            );
          })}

          {/* ── Minimal, Dignified Central Brahma Sthana (200×200) ───────── */}
          <g>
            {/* Center container box */}
            <rect
              x="100"
              y="100"
              width="200"
              height="200"
              fill="url(#southCenterBg)"
            />

            {/* Subtle inner gold accent border */}
            <rect
              x="105"
              y="105"
              width="190"
              height="190"
              fill="none"
              stroke="#C89B3C"
              strokeWidth="0.8"
              strokeDasharray="4 2"
              rx="6"
              opacity="0.5"
            />

            {/* Sacred Om Watermark */}
            <text
              x="200"
              y="170"
              textAnchor="middle"
              dominantBaseline="central"
              fill="#5C1D0C"
              fontSize="52"
              opacity="0.07"
              fontFamily="serif"
              fontWeight="bold"
            >
              ॐ
            </text>

            {/* Concise Dignified Chart Title */}
            <text
              x="200"
              y="185"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="16"
              fontWeight="800"
              fill="#5C1D0C"
              fontFamily="sans-serif, system-ui"
            >
              {vm.titleHi}
            </text>

            {/* Ascendant Summary */}
            <text
              x="200"
              y="210"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="11.5"
              fontWeight="700"
              fill="#854D0E"
              fontFamily="sans-serif, system-ui"
            >
              लग्न: {vm.lagnaNameHi} ({vm.lagnaNameEn})
            </text>

            {/* Ayanamsa Pill Badge */}
            <rect
              x="155"
              y="226"
              width="90"
              height="18"
              rx="9"
              fill="#5C1D0C"
              fillOpacity="0.08"
              stroke="#C89B3C"
              strokeWidth="0.6"
            />
            <text
              x="200"
              y="235"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="9.5"
              fontWeight="700"
              fill="#78350F"
              fontFamily="sans-serif, system-ui"
            >
              लाहिरी अयनांश
            </text>
          </g>
        </svg>

        {/* Minimal dignified footer */}
        <div className="mt-2.5 flex items-center justify-between text-[11px] border-t border-brand-gold-border/35 pt-2 px-1">
          <span className="flex items-center gap-1.5 font-bold text-brand-primary dark:text-brand-gold">
            <Sparkles className="h-3 w-3 text-[#C89B3C]" />
            दक्षिण भारतीय स्थिर राशि चक्र
          </span>
          <span className="text-brand-primary dark:text-brand-gold font-bold bg-brand-primary/8 px-2.5 py-0.5 rounded-full border border-brand-gold-border/40 text-[10px]">
            {activeVarga.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};

export const SouthIndianKundliChart = memo(SouthIndianKundliChartInner);
