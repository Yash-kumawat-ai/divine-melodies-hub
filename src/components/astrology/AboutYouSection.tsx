import React, { useMemo } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Compass,
  ArrowRight,
  TrendingUp,
  Clock,
  Heart,
  Zap,
} from 'lucide-react';
import type { CompleteKundliData } from '@/lib/astrology/types';
import { generateAboutYouIntelligence } from '@/lib/astrology/interpretation/aboutYouInterpreter';

interface AboutYouSectionProps {
  kundli: CompleteKundliData;
  isHi: boolean;
  onAddExactTime?: () => void;
}

export const AboutYouSection: React.FC<AboutYouSectionProps> = ({
  kundli,
  isHi,
  onAddExactTime,
}) => {
  const intel = useMemo(() => generateAboutYouIntelligence(kundli), [kundli]);

  const orientationBadgeText = {
    introverted_reflective: isHi ? 'अंतर्मुखी व विचारशील' : 'Reflective & Inward',
    ambiverted: isHi ? 'संतुलित व परिस्थिति-अनुकूल' : 'Balanced & Adaptable',
    dynamic_external: isHi ? 'सक्रिय व बाह्य-उन्मुख' : 'Dynamic & Outward',
  }[intel.lifeOrientation.type];

  return (
    <div className="space-y-6">
      {/* 1. Partial Profile Notice (Visible if birth time is unknown) */}
      {intel.isPartialProfile && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/20 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-sm text-foreground">
                {isHi
                  ? 'आंशिक विश्लेषण (चन्द्र एवं सूर्य आधारित)'
                  : 'Partial Insights (Moon & Sun Based)'}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {isHi
                  ? 'जन्म समय अज्ञात होने के कारण यह व्यक्तित्व विश्लेषण आपकी चन्द्र राशि, सूर्य राशि एवं आत्मकारक पर आधारित है। पूर्ण लग्न-आधारित विश्लेषण के लिए सटीक जन्म समय जोड़ें।'
                  : 'Because birth time is unknown, this personality profile is calculated from your Moon sign, Sun sign, and Atmakaraka without inferring Lagna. Add exact birth time for complete Ascendant-level insights.'}
              </p>
            </div>
          </div>

          {onAddExactTime && (
            <button
              type="button"
              onClick={onAddExactTime}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-brand-primary text-primary-foreground hover:bg-brand-primary/90 active:scale-95 transition-all shrink-0 cursor-pointer shadow-sm"
            >
              <span>{isHi ? 'सटीक जन्म समय जोड़ें' : 'Add Exact Birth Time'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* 2. Primary Archetype Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-brand-gold-border/40 bg-gradient-to-br from-[#FFFDF9] via-[#FAF6EE] to-[#F5EEDD] dark:from-stone-900 dark:via-stone-900/90 dark:to-stone-800/80 p-6 sm:p-8 shadow-sm">
        <div className="absolute top-0 right-0 p-6 opacity-10 dark:opacity-5 pointer-events-none">
          <Compass className="h-40 w-40 text-brand-primary" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-brand-gold/15 text-brand-primary dark:text-brand-gold border border-brand-gold/30">
            <Sparkles className="h-3.5 w-3.5" />
            <span>
              {intel.isPartialProfile
                ? isHi
                  ? 'मूल स्वभाव (आंशिक विश्लेषण)'
                  : 'Core Nature (Partial Profile)'
                : isHi
                  ? 'लग्न व चन्द्र व्यक्तित्व'
                  : 'Lagna & Moon Archetype'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
            {isHi ? intel.archetype.hi : intel.archetype.en}
          </h2>

          <p className="text-sm font-medium text-muted-foreground">
            {isHi ? intel.archetype.en : intel.archetype.hi}
          </p>

          <p className="text-xs text-muted-foreground pt-1">
            {isHi
              ? 'वैदिक ज्योतिष के अनुसार यह प्रारूप आपकी जन्म ऊर्जा, निर्णय शैली और स्वाभाविक प्रवृत्तियों को दर्शाता है।'
              : 'In Vedic psychology, this archetype captures your foundational temperament, cognitive approach, and intrinsic drives.'}
          </p>
        </div>
      </div>

      {/* 3. Core Strengths (Exactly 3 cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-display font-bold text-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-brand-primary dark:text-brand-gold" />
            <span>{isHi ? 'मुख्य सामर्थ्य व क्षमताएँ' : 'Core Strengths'}</span>
          </h3>
          <span className="text-[11px] font-medium text-muted-foreground">
            {isHi ? '3 प्रमुख गुण' : '3 Key Pillars'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {intel.coreStrengths.map((strength, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border/70 bg-card p-4 sm:p-5 flex flex-col justify-between space-y-3 hover:border-brand-gold/40 transition-colors shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-brand-primary/10 text-brand-primary dark:text-brand-gold text-xs font-bold font-mono">
                    0{idx + 1}
                  </span>
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-sm font-semibold text-foreground leading-snug">
                  {isHi ? strength.hi : strength.en}
                </p>
              </div>

              <p className="text-[11px] text-muted-foreground/80 italic">
                {isHi ? strength.en : strength.hi}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Growth Edges (Exactly 2 cards, softer treatment) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-display font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span>{isHi ? 'सजगता व विकास के अवसर' : 'Growth Edges'}</span>
          </h3>
          <span className="text-[11px] font-medium text-muted-foreground">
            {isHi ? 'सकारात्मक मार्गदर्शन' : 'Constructive Awareness'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {intel.growthEdges.map((edge, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-950/10 p-4 sm:p-5 space-y-2"
            >
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-[11px] font-medium text-amber-700 dark:text-amber-300">
                  {isHi ? `विकास बिंदु 0${idx + 1}` : `Growth Opportunity 0${idx + 1}`}
                </span>
              </div>
              <p className="text-sm font-medium text-foreground leading-relaxed">
                {isHi ? edge.hi : edge.en}
              </p>
              <p className="text-[11px] text-muted-foreground/80 italic pt-1">
                {isHi ? edge.en : edge.hi}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Life Orientation (Short paragraph) */}
      <div className="rounded-xl border border-border/70 bg-card p-5 space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-brand-primary dark:text-brand-gold" />
            <h3 className="text-sm font-display font-bold text-foreground">
              {isHi ? 'जीवन ऊर्जा व स्वाभाविक दृष्टिकोण' : 'Life Orientation & Natural Focus'}
            </h3>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-muted text-muted-foreground">
            {orientationBadgeText}
          </span>
        </div>

        <p className="text-sm text-foreground/90 leading-relaxed">
          {isHi ? intel.lifeOrientation.hi : intel.lifeOrientation.en}
        </p>

        <p className="text-xs text-muted-foreground italic">
          {isHi ? intel.lifeOrientation.en : intel.lifeOrientation.hi}
        </p>
      </div>
    </div>
  );
};
