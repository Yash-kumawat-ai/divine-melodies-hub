import React from 'react';
import { Flame, ShieldCheck } from 'lucide-react';
import type { MangalDoshaResult } from '@/lib/astrology/types';

interface YogaDoshaSectionProps {
  mangalDosha?: MangalDoshaResult;
  isHi: boolean;
}

const YogaDoshaSectionInner: React.FC<YogaDoshaSectionProps> = ({ mangalDosha, isHi }) => {
  if (!mangalDosha) return null;

  return (
    <section id="dosha" className="scroll-mt-32 space-y-3">
      <div className="border-b border-brand-gold-border/30 pb-2.5">
        <h2 className="text-base sm:text-lg font-display font-bold text-foreground flex items-center gap-2">
          {mangalDosha.hasDosha ? (
            <Flame className="h-4 w-4 text-red-500 shrink-0" />
          ) : (
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          )}
          <span>{isHi ? 'दोष एवं योग विश्लेषण' : 'Yogas & Doshas Analysis'}</span>
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isHi ? 'मंगल दोष एवं प्रमुख ज्योतिषीय संयोगों की समीक्षा' : 'Evaluation of Mangal Dosha and planetary combinations'}
        </p>
      </div>

      {/* Mangal Dosha Card (Level 2 Information Group) */}
      <div className="rounded-xl bg-surface-raised/40 border border-brand-gold-border/30 p-4 space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-display font-bold text-sm sm:text-base text-foreground">
              {isHi ? 'मंगल दोष (कुज दोष) स्थिति' : 'Mangal Dosha (Kuja Dosha) Assessment'}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {isHi ? 'लग्न, चतुर्थ, सप्तम, अष्टम अथवा द्वादश भाव में मंगल की स्थिति' : 'Martian placement across 1st, 4th, 7th, 8th, or 12th houses'}
            </p>
          </div>

          <span
            className={`text-xs px-3 py-1 rounded-full border font-bold self-start sm:self-auto ${
              mangalDosha.hasDosha
                ? mangalDosha.isHigh
                  ? 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/40'
                  : 'bg-amber-500/15 text-amber-900 dark:text-amber-300 border-amber-500/40'
                : 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/40'
            }`}
          >
            {mangalDosha.hasDosha
              ? isHi
                ? mangalDosha.isHigh
                  ? 'उच्च मंगल दोष'
                  : 'सामान्य मंगल दोष'
                : mangalDosha.isHigh
                ? 'High Mangal Dosha'
                : 'Mild Mangal Dosha'
              : isHi
              ? 'दोष मुक्त (No Dosha)'
              : 'No Mangal Dosha'}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
          {isHi ? mangalDosha.descriptionHi || mangalDosha.description : mangalDosha.description}
        </p>

        {/* Actionable Remedies / What to do */}
        {mangalDosha.remedies && mangalDosha.remedies.length > 0 && (
          <div className="p-3 rounded-lg bg-background/80 border border-brand-gold-border/20 space-y-1.5">
            <p className="text-[11px] font-bold text-brand-primary dark:text-brand-gold">
              {isHi ? 'सरल वैदिक शांति उपाय (क्या करें):' : 'Recommended Vedic Remedies:'}
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              {(isHi ? mangalDosha.remediesHi || mangalDosha.remedies : mangalDosha.remedies).map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};

export const YogaDoshaSection = React.memo(YogaDoshaSectionInner);
