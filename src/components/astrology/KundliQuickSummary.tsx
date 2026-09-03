import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Clock, ChevronRight, ArrowRight } from 'lucide-react';
import type { CompleteKundliData } from '@/lib/astrology/types';
import type { KundliTabId } from './KundliTabBar';

interface KundliQuickSummaryProps {
  kundli: CompleteKundliData;
  isHi: boolean;
  onSelectTab?: (tabId: KundliTabId) => void;
}

const ZODIAC_GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
  मेष: '♈', वृषभ: '♉', मिथुन: '♊', कर्क: '♋',
  सिंह: '♌', कन्या: '♍', तुला: '♎', वृश्चिक: '♏',
  धनु: '♐', मकर: '♑', कुम्भ: '♒', कुंभ: '♒', मीन: '♓',
};

const RASHI_ENGLISH_MAP: Record<string, string> = {
  मेष: 'Aries', वृषभ: 'Taurus', मिथुन: 'Gemini', कर्क: 'Cancer',
  सिंह: 'Leo', कन्या: 'Virgo', तुला: 'Libra', वृश्चिक: 'Scorpio',
  धनु: 'Sagittarius', मकर: 'Capricorn', कुम्भ: 'Aquarius', मीन: 'Pisces',
};

const KundliQuickSummaryInner: React.FC<KundliQuickSummaryProps> = ({
  kundli,
  isHi,
  onSelectTab,
}) => {
  const isUnknown = kundli.birthDetails?.birthTimeAccuracy === 'unknown';

  // 1. Ascendant
  const ascSignHi = isUnknown ? '—' : (kundli.ascendant?.rashiNameHi || 'वृश्चिक');
  const ascSignEn = isUnknown ? '—' : (kundli.ascendant?.rashiName || RASHI_ENGLISH_MAP[ascSignHi] || 'Scorpio');
  const ascName = isHi ? ascSignHi : ascSignEn;
  const ascGlyph = (!isUnknown && (kundli.ascendant?.rashiName || kundli.ascendant?.rashiNameHi))
    ? ZODIAC_GLYPHS[kundli.ascendant.rashiName || ''] || ZODIAC_GLYPHS[kundli.ascendant.rashiNameHi || ''] || '♏'
    : '♏';

  // 2. Moon Sign
  const moonPlanet = kundli.planets?.Moon;
  const moonSignHi = moonPlanet?.rashiNameHindi || 'वृश्चिक';
  const moonSignEn = moonPlanet?.sign || RASHI_ENGLISH_MAP[moonSignHi] || 'Scorpio';
  const moonSign = isHi ? moonSignHi : moonSignEn;
  const moonGlyph = ZODIAC_GLYPHS[moonSignEn] || ZODIAC_GLYPHS[moonSignHi] || '♏';

  // 3. Sun Sign
  const sunPlanet = kundli.planets?.Sun;
  const sunSignHi = sunPlanet?.rashiNameHindi || 'मकर';
  const sunSignEn = sunPlanet?.sign || RASHI_ENGLISH_MAP[sunSignHi] || 'Capricorn';
  const sunSign = isHi ? sunSignHi : sunSignEn;
  const sunGlyph = ZODIAC_GLYPHS[sunSignEn] || ZODIAC_GLYPHS[sunSignHi] || '♑';

  // 4. Nakshatra
  const nakNameHi = kundli.panchanga?.nakshatraHi || moonPlanet?.nakshatra || 'ज्येष्ठा';
  const nakNameEn = kundli.panchanga?.nakshatra || moonPlanet?.nakshatra || 'Jyeshtha';
  const nakName = isHi ? nakNameHi : nakNameEn;
  const nakPada = moonPlanet?.nakshatraPada || kundli.ascendant?.pada || 3;

  // 5. Active Dasha
  const currentMDPlanet = isHi
    ? kundli.dasha?.currentMahadasha?.planetHi || kundli.dasha?.current_mahadasha || 'शुक्र'
    : kundli.dasha?.currentMahadasha?.planet || kundli.dasha?.current_mahadasha || 'Venus';

  const startYear = kundli.dasha?.currentMahadasha?.startTime
    ? new Date(kundli.dasha.currentMahadasha.startTime).getFullYear()
    : 2017;
  const endYear = kundli.dasha?.currentMahadasha?.endTime
    ? new Date(kundli.dasha.currentMahadasha.endTime).getFullYear()
    : 2037;

  return (
    <div id="summary" className="space-y-3.5 w-full">
      {/* ── AT A GLANCE CARD (Matching reference image) ───────────────────── */}
      <div className="rounded-2xl bg-surface-raised border border-brand-gold-border/40 p-4 sm:p-5 shadow-xs space-y-3.5">
        {/* Card Header: Title & View Full Chart link */}
        <div className="flex items-center justify-between gap-2 border-b border-brand-gold-border/20 pb-2.5">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-display font-bold tracking-wider uppercase text-foreground">
            <Sparkles className="h-4 w-4 text-brand-gold shrink-0" />
            <span>{isHi ? 'एक नज़र में' : 'AT A GLANCE'}</span>
          </div>

          <button
            type="button"
            onClick={() => onSelectTab?.('charts')}
            className="text-xs font-semibold text-muted-foreground hover:text-brand-primary dark:hover:text-amber-400 transition-colors inline-flex items-center gap-1 cursor-pointer group"
          >
            <span>{isHi ? 'सम्पूर्ण चक्र देखें' : 'View Full Chart'}</span>
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* The 5 Rows with Dotted Leaders */}
        <div className="space-y-3 text-xs sm:text-sm">
          {/* Row 1: Ascendant */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="h-7 w-7 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center text-xs font-bold shrink-0">
                {ascGlyph}
              </div>
              <span className="font-medium text-foreground">{isHi ? 'लग्न' : 'Ascendant'}</span>
            </div>
            <div className="flex-1 mx-2.5 sm:mx-3 border-b border-dotted border-border/80 self-center min-w-[16px]" />
            <span className="font-display font-semibold text-teal-600 dark:text-teal-400 shrink-0">
              {ascName}
            </span>
          </div>

          {/* Row 2: Moon Sign */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold shrink-0">
                {moonGlyph}
              </div>
              <span className="font-medium text-foreground">{isHi ? 'चन्द्र राशि' : 'Moon Sign'}</span>
            </div>
            <div className="flex-1 mx-2.5 sm:mx-3 border-b border-dotted border-border/80 self-center min-w-[16px]" />
            <span className="font-display font-semibold text-blue-600 dark:text-blue-400 shrink-0">
              {moonSign}
            </span>
          </div>

          {/* Row 3: Sun Sign */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="h-7 w-7 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center text-xs font-bold shrink-0">
                {sunGlyph}
              </div>
              <span className="font-medium text-foreground">{isHi ? 'सूर्य राशि' : 'Sun Sign'}</span>
            </div>
            <div className="flex-1 mx-2.5 sm:mx-3 border-b border-dotted border-border/80 self-center min-w-[16px]" />
            <span className="font-display font-semibold text-amber-600 dark:text-amber-400 shrink-0">
              {sunSign}
            </span>
          </div>

          {/* Row 4: Nakshatra */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="h-7 w-7 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs font-bold shrink-0">
                ✴️
              </div>
              <span className="font-medium text-foreground">{isHi ? 'नक्षत्र' : 'Nakshatra'}</span>
            </div>
            <div className="flex-1 mx-2.5 sm:mx-3 border-b border-dotted border-border/80 self-center min-w-[16px]" />
            <span className="font-display font-semibold text-foreground shrink-0">
              {nakName} • {isHi ? `चरण ${nakPada}` : `Pada ${nakPada}`}
            </span>
          </div>

          {/* Row 5: Current Dasha */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="h-7 w-7 rounded-full bg-rose-100 dark:bg-rose-950/60 text-[#651317] dark:text-rose-300 flex items-center justify-center text-xs font-bold shrink-0">
                <Clock className="h-3.5 w-3.5" />
              </div>
              <span className="font-medium text-foreground">{isHi ? 'वर्तमान दशा' : 'Current Dasha'}</span>
            </div>
            <div className="flex-1 mx-2.5 sm:mx-3 border-b border-dotted border-border/80 self-center min-w-[16px]" />
            <div className="text-right shrink-0">
              <p className="font-display font-semibold text-xs sm:text-sm text-[#651317] dark:text-amber-300 leading-tight">
                {currentMDPlanet} {isHi ? 'महादशा' : 'Mahadasha'}
              </p>
              <p className="text-[11px] text-muted-foreground tabular-nums leading-tight mt-0.5">
                {startYear} – {endYear}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── ASK GURU JI COMPANION CARD (Matching reference image) ─────────── */}
      <Link
        to="/ask-guru-ji"
        className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-surface-raised to-brand-primary/10 border border-brand-gold-border/40 hover:border-brand-gold/60 shadow-xs group transition-all"
      >
        <div className="flex items-center gap-3 min-w-0">
          <img
            src="/images/deity-krishna.png"
            alt="Lord Krishna"
            className="h-14 sm:h-16 w-auto object-contain shrink-0"
          />
          <div className="min-w-0">
            <h3 className="font-display font-bold text-sm sm:text-base text-[#651317] dark:text-amber-400 flex items-center gap-1.5 leading-snug">
              <span>{isHi ? 'गुरु जी से पूछें' : 'Ask Guru Ji'}</span>
              <Sparkles className="h-3.5 w-3.5 text-brand-gold shrink-0" />
            </h3>
            <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug mt-0.5 line-clamp-2">
              {isHi
                ? 'अपनी कुंडली को लेकर कोई प्रश्न है? गुरु जी से व्यक्तिगत मार्गदर्शन पाएं।'
                : 'Have a question about your Kundli? Get personalized guidance from Guru Ji.'}
            </p>
          </div>
        </div>
        <div className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-[#651317] dark:bg-amber-500 dark:text-stone-950 group-hover:bg-[#520f12] transition-colors shadow-2xs">
          <span>{isHi ? 'पूछें' : 'Ask Guru Ji'}</span>
          <ArrowRight className="h-3 w-3" />
        </div>
      </Link>
    </div>
  );
};

export const KundliQuickSummary = memo(KundliQuickSummaryInner);
