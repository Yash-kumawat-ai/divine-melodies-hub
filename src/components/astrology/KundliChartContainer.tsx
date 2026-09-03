import React, { useState, useMemo, memo } from 'react';
import { Compass } from 'lucide-react';
import type { NormalizedPlanet, VedicAscendant } from '@/lib/astrology/types';
import { buildChartViewModel, type VargaId } from '@/lib/astrology/chartPresentationAdapter';
import { NorthIndianKundliChart } from './NorthIndianKundliChart';
import { SouthIndianKundliChart } from './SouthIndianKundliChart';

interface KundliChartContainerProps {
  planets: Record<string, NormalizedPlanet>;
  ascendant?: VedicAscendant;
  isUnknownTime: boolean;
  vargas?: Record<string, any>;
  isHi: boolean;
}

const KundliChartContainerInner: React.FC<KundliChartContainerProps> = ({
  planets,
  ascendant,
  isUnknownTime,
  vargas,
  isHi,
}) => {
  const [chartStyle, setChartStyle] = useState<'north' | 'south'>('north');
  const [activeVarga, setActiveVarga] = useState<VargaId>('d1');

  // Derive canonical unified view-model for both North and South Indian charts
  const chartViewModel = useMemo(() => {
    if (isUnknownTime) return null;
    return buildChartViewModel(planets, ascendant, vargas, activeVarga, isHi);
  }, [planets, ascendant, vargas, activeVarga, isHi, isUnknownTime]);

  if (isUnknownTime) {
    return (
      <div id="chart" className="scroll-mt-32 rounded-2xl bg-surface-raised border border-brand-gold-border/40 p-6 text-center text-xs text-muted-foreground space-y-2 h-full flex flex-col justify-center">
        <Compass className="h-8 w-8 text-brand-gold mx-auto" />
        <p className="font-semibold text-foreground text-sm">
          {isHi ? 'सटीक जन्म समय उपलब्ध नहीं है' : 'Exact birth time is not recorded'}
        </p>
        <p>
          {isHi
            ? 'लग्न भाव चक्र की गणना के लिए सटीक समय आवश्यक है। आपकी कुण्डली चन्द्र राशि एवं नक्षत्र आधारित पद्धतियों के अनुसार सक्रिय है।'
            : 'Ascendant house chart requires precise birth time. Your horoscope is operating in Moon Sign & Nakshatra mode.'}
        </p>
      </div>
    );
  }

  const chartTitle = isHi
    ? (chartViewModel?.titleHi || 'जन्म कुंडली (D1)')
    : (chartViewModel?.titleEn || 'Birth Chart (D1)');

  return (
    <div id="chart" className="scroll-mt-32 rounded-2xl bg-surface-raised border border-brand-gold-border/40 p-3 sm:p-4 shadow-sm space-y-3 h-full">
      {/* ── Permanently Stable Header & Toolbar Controls ───────────────────── */}
      <div className="flex items-center justify-between gap-2 border-b border-brand-gold-border/25 pb-2.5">
        <h2 className="font-display font-bold text-sm sm:text-base text-foreground shrink-0">
          {chartTitle}
        </h2>

        {/* Grouped Visual Controls - Permanently Stable in both styles */}
        <div className="flex items-center gap-1.5 shrink-0 flex-nowrap print:hidden">
          {/* Varga Selector: D1, D9, D10 (Always visible and operational) */}
          <div className="inline-flex items-center rounded-lg bg-background/90 border border-brand-gold-border/35 p-0.5 shadow-2xs">
            {(['d1', 'd9', 'd10'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setActiveVarga(v)}
                className={`px-2 py-0.5 rounded-md text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                  activeVarga === v
                    ? 'bg-[#651317] dark:bg-amber-500 text-white dark:text-stone-950 shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {v.toUpperCase()}
              </button>
            ))}
          </div>

          {/* North / South Style Toggle */}
          <div className="inline-flex items-center rounded-lg bg-background/90 border border-brand-gold-border/35 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setChartStyle('north')}
              title={isHi ? 'उत्तर भारतीय पद्धति' : 'North Indian Style'}
              className={`px-2 py-0.5 rounded-md text-[11px] sm:text-xs transition-all cursor-pointer ${
                chartStyle === 'north'
                  ? 'bg-[#651317] dark:bg-amber-500 text-white dark:text-stone-950 font-bold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium'
              }`}
            >
              {isHi ? 'उत्तर' : 'North'}
            </button>
            <button
              type="button"
              onClick={() => setChartStyle('south')}
              title={isHi ? 'दक्षिण भारतीय पद्धति' : 'South Indian Style'}
              className={`px-2 py-0.5 rounded-md text-[11px] sm:text-xs transition-all cursor-pointer ${
                chartStyle === 'south'
                  ? 'bg-[#651317] dark:bg-amber-500 text-white dark:text-stone-950 font-bold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium'
              }`}
            >
              {isHi ? 'दक्षिण' : 'South'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Visual Centerpiece Box ────────────────────────────────────────── */}
      <div className="flex flex-col items-center">
        <div className="w-full max-w-[400px] flex justify-center">
          {chartViewModel && (
            chartStyle === 'north' ? (
              <NorthIndianKundliChart
                planets={planets}
                lagna={ascendant}
                isUnknownTime={isUnknownTime}
                vargas={vargas}
                activeVarga={activeVarga}
                chartViewModel={chartViewModel}
              />
            ) : (
              <SouthIndianKundliChart
                planets={planets}
                lagna={ascendant}
                isUnknownTime={isUnknownTime}
                vargas={vargas}
                activeVarga={activeVarga}
                chartViewModel={chartViewModel}
              />
            )
          )}
        </div>

        {/* Planet Legend matching reference */}
        <div className="mt-2.5 pt-2 border-t border-brand-gold-border/20 w-full flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground font-mono">
          <span><strong className="text-amber-800 dark:text-amber-400">Su</strong> सूर्य</span>
          <span><strong className="text-blue-800 dark:text-blue-400">Mo</strong> चन्द्र</span>
          <span><strong className="text-rose-800 dark:text-rose-400">Ma</strong> मंगल</span>
          <span><strong className="text-emerald-800 dark:text-emerald-400">Me</strong> बुध</span>
          <span><strong className="text-yellow-800 dark:text-yellow-400">Ju</strong> गुरु</span>
          <span><strong className="text-pink-800 dark:text-pink-400">Ve</strong> शुक्र</span>
          <span><strong className="text-indigo-800 dark:text-indigo-400">Sa</strong> शनि</span>
          <span><strong className="text-purple-800 dark:text-purple-400">Ra</strong> राहु</span>
          <span><strong className="text-stone-800 dark:text-stone-400">Ke</strong> केतु</span>
        </div>
      </div>
    </div>
  );
};

export const KundliChartContainer = memo(KundliChartContainerInner);
