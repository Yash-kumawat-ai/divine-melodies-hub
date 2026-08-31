import React, { useState, memo } from 'react';
import { Compass } from 'lucide-react';
import type { NormalizedPlanet, VedicAscendant } from '@/lib/astrology/types';
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
  const [activeVarga, setActiveVarga] = useState<'d1' | 'd9' | 'd10'>('d1');

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

  const vargaLabels: Record<string, { hi: string; en: string }> = {
    d1: { hi: 'जन्म कुंडली (D1)', en: 'Birth Chart (D1)' },
    d9: { hi: 'नवांश कुंडली (D9)', en: 'Navamsha Chart (D9)' },
    d10: { hi: 'दशमांश कुंडली (D10)', en: 'Dasamsa Chart (D10)' },
  };

  return (
    <div id="chart" className="scroll-mt-32 rounded-2xl bg-surface-raised border border-brand-gold-border/40 p-4 sm:p-5 shadow-sm space-y-3.5 h-full">
      {/* Top Header & Controls matching reference image */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-brand-gold-border/25 pb-2.5">
        <h2 className="font-display font-bold text-base text-foreground truncate">
          {isHi ? vargaLabels[activeVarga].hi : vargaLabels[activeVarga].en}
        </h2>

        {/* Grouped Visual Controls */}
        <div className="flex items-center gap-2 flex-wrap print:hidden">
          {/* Varga Selector */}
          {chartStyle === 'north' && vargas && (
            <div className="inline-flex items-center rounded-xl bg-background/80 border border-brand-gold-border/35 p-0.5 shadow-2xs">
              {(['d1', 'd9', 'd10'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setActiveVarga(v)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeVarga === v
                      ? 'bg-[#5C1D0C] text-white shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {v.toUpperCase()}
                </button>
              ))}
            </div>
          )}

          {/* North / South Style Toggle */}
          <div className="inline-flex items-center rounded-xl bg-background/80 border border-brand-gold-border/35 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setChartStyle('north')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                chartStyle === 'north'
                  ? 'bg-[#5C1D0C] text-white font-bold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isHi ? 'उत्तर भारतीय' : 'North Indian'}
            </button>
            <button
              type="button"
              onClick={() => setChartStyle('south')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                chartStyle === 'south'
                  ? 'bg-[#5C1D0C] text-white font-bold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isHi ? 'दक्षिण भारतीय' : 'South Indian'}
            </button>
          </div>
        </div>
      </div>

      {/* Visual Centerpiece Box */}
      <div className="flex flex-col items-center">
        <div className="w-full max-w-[390px] flex justify-center">
          {chartStyle === 'north' ? (
            <NorthIndianKundliChart
              planets={planets}
              lagna={ascendant}
              isUnknownTime={isUnknownTime}
              vargas={vargas}
              activeVarga={activeVarga}
            />
          ) : (
            <SouthIndianKundliChart
              planets={planets}
              lagna={ascendant}
              isUnknownTime={isUnknownTime}
            />
          )}
        </div>

        {/* Planet Legend matching reference image */}
        <div className="mt-3 pt-2.5 border-t border-brand-gold-border/20 w-full flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground font-mono">
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
