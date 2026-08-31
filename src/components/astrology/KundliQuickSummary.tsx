import React, { memo } from 'react';
import { Sparkles, Clock, Compass, Heart } from 'lucide-react';
import type { CompleteKundliData } from '@/lib/astrology/types';

interface KundliQuickSummaryProps {
  kundli: CompleteKundliData;
  isHi: boolean;
}

const ZODIAC_GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
  मेष: '♈', वृषभ: '♉', मिथुन: '♊', कर्क: '♋',
  सिंह: '♌', कन्या: '♍', तुला: '♎', वृश्चिक: '♏',
  धनु: '♐', मकर: '♑', कुम्भ: '♒', कुंभ: '♒', मीन: '♓',
};

const KundliQuickSummaryInner: React.FC<KundliQuickSummaryProps> = ({ kundli, isHi }) => {
  const isUnknown = kundli.birthDetails?.birthTimeAccuracy === 'unknown';
  const ascName = isUnknown ? '—' : (isHi ? kundli.ascendant?.rashiNameHi : kundli.ascendant?.rashiName) || '—';
  const ascLord = isUnknown ? '' : (isHi ? kundli.ascendant?.lordHi : kundli.ascendant?.lord) || 'बुध';
  const ascGlyph = (!isUnknown && (kundli.ascendant?.rashiName || kundli.ascendant?.rashiNameHi))
    ? ZODIAC_GLYPHS[kundli.ascendant.rashiName || ''] || ZODIAC_GLYPHS[kundli.ascendant.rashiNameHi || ''] || '♊'
    : '♊';

  const currentMD = isHi
    ? kundli.dasha?.currentMahadasha?.planetHi || kundli.dasha?.current_mahadasha || 'गुरु'
    : kundli.dasha?.currentMahadasha?.planet || kundli.dasha?.current_mahadasha || 'Jupiter';

  const startYear = kundli.dasha?.currentMahadasha?.startTime
    ? new Date(kundli.dasha.currentMahadasha.startTime).getFullYear()
    : 2019;
  const endYear = kundli.dasha?.currentMahadasha?.endTime
    ? new Date(kundli.dasha.currentMahadasha.endTime).getFullYear()
    : 2039;

  const ishtaName = isHi
    ? kundli.ishtaDevata?.deityHi || kundli.ishtaDevata?.deity || 'प्रभु श्री राम'
    : kundli.ishtaDevata?.deity || 'Lord Rama';

  return (
    <div id="summary" className="scroll-mt-32 rounded-2xl bg-surface-raised border border-brand-gold-border/40 p-4 sm:p-5 shadow-sm space-y-3.5 h-full">
      <h2 className="font-display font-bold text-base text-foreground flex items-center gap-2 border-b border-brand-gold-border/25 pb-2.5">
        <Sparkles className="h-4 w-4 text-brand-gold shrink-0" />
        <span>{isHi ? 'आपकी कुंडली की मुख्य बातें' : 'Key Kundli Highlights'}</span>
      </h2>

      <div className="space-y-2.5">
        {/* Card 1: Lagna */}
        <div className="p-3 rounded-2xl bg-background/80 border border-brand-gold-border/25 flex items-center gap-3 transition-colors hover:border-brand-gold-border/50">
          <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center justify-center text-lg font-bold shrink-0">
            {ascGlyph}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">
              {isHi ? 'लग्न' : 'Ascendant'}
            </p>
            <p className="font-display font-bold text-sm text-emerald-700 dark:text-emerald-300 truncate">
              {ascName} {isHi ? 'लग्न' : 'Ascendant'}
            </p>
            {ascLord && (
              <p className="text-[10px] text-muted-foreground truncate">
                {isHi ? `${ascLord} ग्रह द्वारा शासित` : `Ruled by ${ascLord}`}
              </p>
            )}
          </div>
        </div>

        {/* Card 2: Active Dasha */}
        <div className="p-3 rounded-2xl bg-background/80 border border-brand-gold-border/25 flex items-center gap-3 transition-colors hover:border-brand-gold-border/50">
          <div className="h-10 w-10 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30 flex items-center justify-center text-sm font-bold shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">
              {isHi ? 'वर्तमान दशा' : 'Active Dasha'}
            </p>
            <p className="font-display font-bold text-sm text-purple-700 dark:text-purple-300 truncate">
              {currentMD} {isHi ? 'महादशा' : 'Mahadasha'}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {startYear} – {endYear}
            </p>
          </div>
        </div>

        {/* Card 3: Ishta Devata */}
        <div className="p-3 rounded-2xl bg-background/80 border border-brand-gold-border/25 flex items-center gap-3 transition-colors hover:border-brand-gold-border/50">
          <div className="h-10 w-10 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center justify-center text-sm font-bold shrink-0">
            <Heart className="h-5 w-5 text-amber-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">
              {isHi ? 'आध्यात्मिक संकेत' : 'Spiritual Focus'}
            </p>
            <p className="font-display font-bold text-sm text-amber-700 dark:text-amber-300 truncate">
              {isHi ? 'इष्ट देवता' : 'Ishta Devata'}
            </p>
            <p className="text-[10px] font-bold text-brand-primary dark:text-brand-gold truncate">
              {ishtaName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const KundliQuickSummary = memo(KundliQuickSummaryInner);
