import React, { memo } from 'react';
import { Compass, X, Sparkles, Flame, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { CompleteKundliData } from '@/lib/astrology/types';
import omWhiteSvg from '@/pages/images/svg/om white.svg';

interface GuruJiHoroscopeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  kundli: CompleteKundliData | null;
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

const GuruJiHoroscopeDrawerInner: React.FC<GuruJiHoroscopeDrawerProps> = ({
  isOpen,
  onClose,
  kundli,
  isHi,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  if (!kundli) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
        <div className="bg-surface-raised rounded-3xl border border-brand-gold-border/50 p-6 max-w-sm w-full space-y-4 shadow-xl relative animate-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-brand-gold-border/25 pb-3">
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-brand-gold" />
              <h3 className="font-display font-bold text-base text-foreground">
                {isHi ? 'जन्म कुण्डली' : 'Birth Horoscope'}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-surface flex items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="text-center py-4 space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isHi
                ? 'आपकी जन्म कुण्डली का विवरण अभी दर्ज नहीं है।'
                : 'Your birth horoscope is not yet set up.'}
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/kundli/setup');
              }}
              className="btn-primary btn-sm w-full"
            >
              {isHi ? 'जन्म विवरण भरें' : 'Set Up Birth Profile'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isUnknownTime = kundli.birthDetails?.birthTimeAccuracy === 'unknown';
  const ascName = isUnknownTime ? '—' : (isHi ? kundli.ascendant?.rashiNameHi : kundli.ascendant?.rashiName) || '—';
  const ascGlyph = (!isUnknownTime && (kundli.ascendant?.rashiName || kundli.ascendant?.rashiNameHi))
    ? ZODIAC_GLYPHS[kundli.ascendant.rashiName || ''] || ZODIAC_GLYPHS[kundli.ascendant.rashiNameHi || ''] || '♊'
    : '♊';

  const moonSign = isHi ? kundli.planets.Moon?.rashiNameHindi || kundli.planets.Moon?.sign : kundli.planets.Moon?.sign;
  const moonGlyph = kundli.planets.Moon?.sign
    ? ZODIAC_GLYPHS[kundli.planets.Moon.sign] || ZODIAC_GLYPHS[kundli.planets.Moon.rashiNameHindi || ''] || '♐'
    : '♐';

  const sunSign = isHi ? kundli.planets.Sun?.rashiNameHindi || kundli.planets.Sun?.sign : kundli.planets.Sun?.sign;
  const nakshatra = kundli.planets.Moon?.nakshatra || kundli.panchanga?.nakshatra || '—';
  const nakPada = kundli.planets.Moon?.nakshatraPada || 1;

  const currentMD = isHi ? kundli.dasha?.currentMahadasha?.planetHi || kundli.dasha?.current_mahadasha : kundli.dasha?.currentMahadasha?.planet || kundli.dasha?.current_mahadasha;
  const currentAD = isHi ? kundli.dasha?.currentAntardasha?.planetHi || kundli.dasha?.current_antardasha : kundli.dasha?.currentAntardasha?.planet || kundli.dasha?.current_antardasha;

  const ishtaName = isHi ? kundli.ishtaDevata?.deityHi || kundli.ishtaDevata?.deity : kundli.ishtaDevata?.deity;
  const ishtaMantra = kundli.ishtaDevata?.mantra || 'ॐ रां रामाय नमः';

  const hasDosha = kundli.mangalDosha?.hasDosha;
  const dashaProgress = kundli.dasha?.currentMahadasha?.progressPercent || 45;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-surface-raised h-full max-w-md w-full border-l border-brand-gold-border/40 p-5 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-250">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-brand-gold-border/25 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 min-h-[36px] min-w-[36px] max-h-[36px] max-w-[36px] rounded-xl bg-gradient-brand flex items-center justify-center text-primary-foreground shadow-2xs border border-brand-gold/50 p-1.5 shrink-0 overflow-hidden">
                <img src={omWhiteSvg} alt="Om" className="h-full w-full max-h-full max-w-full object-contain aspect-square pointer-events-none select-none" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-foreground leading-tight">
                  {isHi ? 'जन्म कुण्डली संक्षेप' : 'Birth Horoscope Summary'}
                </h3>
                <p className="text-[10px] text-muted-foreground">{kundli.ayanamsa?.slice(0, 6) || 'Lahiri'}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-surface flex items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Location & Birth Details */}
          <div className="p-3 rounded-2xl bg-background/80 border border-brand-gold-border/25 space-y-1">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase">📍 जन्म स्थान व समय</p>
            <p className="font-bold text-foreground text-sm">{kundli.birthDetails.placeLabel}</p>
            <p className="text-muted-foreground text-xs">
              📅 {kundli.birthDetails.dateOfBirth}
              {kundli.birthDetails.birthTime ? ` • ${kundli.birthDetails.birthTime}` : ''}
            </p>
          </div>

          {/* 4 Pillars Grid */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
              {isHi ? 'प्रमुख जन्म स्तंभ' : 'Key Birth Pillars'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-background/80 border border-brand-gold-border/25 flex items-center gap-2.5">
                <span className="text-lg font-bold text-emerald-600">{ascGlyph}</span>
                <div className="min-w-0">
                  <p className="text-[9px] text-muted-foreground uppercase font-semibold">लग्न</p>
                  <p className="font-bold text-foreground text-xs truncate">{ascName}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-background/80 border border-brand-gold-border/25 flex items-center gap-2.5">
                <span className="text-lg font-bold text-blue-600">{moonGlyph}</span>
                <div className="min-w-0">
                  <p className="text-[9px] text-muted-foreground uppercase font-semibold">चन्द्र राशि</p>
                  <p className="font-bold text-brand-primary dark:text-brand-gold text-xs truncate">{moonSign}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-background/80 border border-brand-gold-border/25 flex items-center gap-2.5">
                <span className="text-lg font-bold text-amber-600">☀️</span>
                <div className="min-w-0">
                  <p className="text-[9px] text-muted-foreground uppercase font-semibold">सूर्य राशि</p>
                  <p className="font-bold text-foreground text-xs truncate">{sunSign}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-background/80 border border-brand-gold-border/25 flex items-center gap-2.5">
                <span className="text-lg font-bold text-purple-600">✴️</span>
                <div className="min-w-0">
                  <p className="text-[9px] text-muted-foreground uppercase font-semibold">नक्षत्र</p>
                  <p className="font-bold text-foreground text-xs truncate">{nakshatra} (प.{nakPada})</p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Dasha Card */}
          <div className="p-3.5 rounded-2xl bg-background/80 border border-brand-gold-border/25 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">सक्रिय महादशा</span>
              <span className="font-bold text-brand-primary dark:text-brand-gold text-xs">{currentMD} • {currentAD}</span>
            </div>
            <div className="w-full bg-surface rounded-full h-1.5 overflow-hidden border border-brand-gold-border/30">
              <div
                className="bg-gradient-brand h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, dashaProgress))}%` }}
              />
            </div>
          </div>

          {/* Ishta Devata & Mantra */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-brand-primary/5 via-surface-raised to-brand-gold/10 border border-brand-gold-border/35 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-brand-primary dark:text-brand-gold font-bold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isHi ? 'इष्ट देव साधना' : 'Ishta Devata'}</span>
            </div>
            <p className="text-sm font-display font-bold text-foreground">{ishtaName}</p>
            <p className="text-[11px] font-mono text-muted-foreground truncate select-all">{ishtaMantra}</p>
          </div>

          {/* Dosha Status */}
          <div className="p-3 rounded-2xl bg-background/80 border border-brand-gold-border/25 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {hasDosha ? <Flame className="h-4 w-4 text-amber-600 shrink-0" /> : <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />}
              <span className="text-xs font-semibold text-foreground">मंगल दोष</span>
            </div>
            <span
              className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                hasDosha
                  ? 'bg-amber-500/10 text-amber-800 border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-800 border-emerald-500/30'
              }`}
            >
              {hasDosha ? 'सामान्य प्रभाव' : 'दोष मुक्त'}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-brand-gold-border/25">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('/kundli');
            }}
            className="btn-primary btn-md w-full inline-flex items-center justify-center gap-2 shadow-sm"
          >
            <span>{isHi ? 'सम्पूर्ण कुण्डली रिपोर्ट देखें' : 'View Full Kundli Report'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const GuruJiHoroscopeDrawer = memo(GuruJiHoroscopeDrawerInner);
