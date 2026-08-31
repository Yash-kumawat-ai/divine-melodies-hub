import React, { useState, memo } from 'react';
import { Compass, ChevronDown, Sparkles, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { CompleteKundliData } from '@/lib/astrology/types';

interface GuruJiMobileRibbonProps {
  kundli: CompleteKundliData | null;
  isHi: boolean;
}

const GuruJiMobileRibbonInner: React.FC<GuruJiMobileRibbonProps> = ({ kundli, isHi }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  if (!kundli) return null;

  const ascName = kundli.ascendant?.rashiNameHi || kundli.ascendant?.rashiName || '—';
  const moonSign = kundli.planets.Moon?.rashiNameHindi || kundli.planets.Moon?.sign || '—';
  const ishtaName = isHi ? kundli.ishtaDevata?.deityHi || kundli.ishtaDevata?.deity : kundli.ishtaDevata?.deity;
  const currentMD = isHi ? kundli.dasha?.currentMahadasha?.planetHi || kundli.dasha?.current_mahadasha : kundli.dasha?.currentMahadasha?.planet || kundli.dasha?.current_mahadasha;

  return (
    <>
      {/* Compact Tap-to-Expand Ribbon */}
      <div className="lg:hidden bg-surface-raised/95 border-b border-brand-gold-border/30 px-3 py-1.5 flex items-center justify-between text-xs backdrop-blur-md shadow-2xs">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 min-w-0 text-left hover:opacity-80 transition-opacity"
        >
          <Compass className="h-3.5 w-3.5 text-brand-gold shrink-0" />
          <span className="font-semibold text-foreground truncate text-[11px]">
            {ascName} लग्न • {moonSign} • {currentMD} दशा • इष्ट: {ishtaName}
          </span>
          <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/kundli')}
          className="text-[10px] font-bold text-brand-primary dark:text-brand-gold shrink-0 hover:underline pl-2"
        >
          {isHi ? 'विस्तृत कुंडली →' : 'Full Kundli →'}
        </button>
      </div>

      {/* Slide-down / Popup Modal on Mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs lg:hidden animate-in fade-in">
          <div className="bg-surface-raised rounded-3xl border border-brand-gold-border/50 p-5 max-w-sm w-full space-y-4 shadow-xl relative animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-brand-gold-border/25 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-brand-gold" />
                <h3 className="font-display font-bold text-base text-foreground">
                  {isHi ? 'आपकी जन्म कुण्डली' : 'Your Birth Kundli'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full bg-surface flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-background/80 border border-brand-gold-border/20">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase">📍 जन्म स्थान व समय</p>
                <p className="font-bold text-foreground mt-0.5">{kundli.birthDetails.placeLabel}</p>
                <p className="text-muted-foreground text-[11px]">{kundli.birthDetails.dateOfBirth} · {kundli.birthDetails.birthTime || ''}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-background/80 border border-brand-gold-border/20">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">लग्न राशि</p>
                  <p className="font-bold text-brand-primary dark:text-brand-gold">{ascName}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-background/80 border border-brand-gold-border/20">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">चन्द्र राशि</p>
                  <p className="font-bold text-brand-primary dark:text-brand-gold">{moonSign}</p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-gradient-to-br from-brand-primary/5 to-brand-gold/10 border border-brand-gold-border/30">
                <div className="flex items-center gap-1 font-bold text-brand-primary dark:text-brand-gold text-[11px]">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>इष्ट देव साधना</span>
                </div>
                <p className="font-bold text-foreground mt-0.5">{ishtaName}</p>
                <p className="text-[10px] font-mono text-muted-foreground truncate">{kundli.ishtaDevata?.mantra}</p>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/kundli');
                }}
                className="btn-primary btn-sm flex-1 inline-flex items-center justify-center gap-1.5"
              >
                <span>{isHi ? 'सम्पूर्ण कुण्डली देखें' : 'View Full Report'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const GuruJiMobileRibbon = memo(GuruJiMobileRibbonInner);
