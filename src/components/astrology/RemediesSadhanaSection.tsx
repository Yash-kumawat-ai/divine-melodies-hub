import React, { useState } from 'react';
import { Sparkles, Heart, Music } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { IshtaDevataResult } from '@/lib/astrology/types';

interface RemediesSadhanaSectionProps {
  ishtaDevata?: IshtaDevataResult;
  predictions?: Record<string, string[]>;
  isHi: boolean;
}

const INDICATION_TABS = [
  { key: 'career',      hiLabel: '💼 करियर', enLabel: '💼 Career' },
  { key: 'marriage',    hiLabel: '💍 विवाह',  enLabel: '💍 Marriage' },
  { key: 'finance',     hiLabel: '💰 धन',     enLabel: '💰 Wealth' },
  { key: 'health',      hiLabel: '🌿 स्वास्थ्य', enLabel: '🌿 Health' },
  { key: 'spirituality',hiLabel: '🕉️ साधना',  enLabel: '🕉️ Spirituality' },
];

const RemediesSadhanaSectionInner: React.FC<RemediesSadhanaSectionProps> = ({
  ishtaDevata,
  predictions = {},
  isHi,
}) => {
  const [selectedTab, setSelectedTab] = useState<string>('career');

  return (
    <section id="remedies" className="scroll-mt-32 space-y-4">
      <div className="border-b border-brand-gold-border/30 pb-2">
        <h2 className="text-base sm:text-lg font-display font-bold text-foreground flex items-center gap-2">
          <Heart className="h-4 w-4 text-brand-gold shrink-0" />
          <span>{isHi ? 'इष्ट देव, साधना एवं वैदिक उपाय' : 'Devotional Sadhana & Remedies'}</span>
        </h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {isHi ? 'आत्मकारक व कारकांश आधारित इष्ट देव, सिद्ध मंत्र एवं जीवन संकेत' : 'Jaimini Karakamsha deity alignment, consecrated mantras, and life guidance'}
        </p>
      </div>

      {/* Ishta Devata & Sacred Mantra Card (Level 2 Information Group) */}
      {ishtaDevata && (
        <div className="rounded-xl bg-surface-raised/40 border border-brand-gold-border/35 p-4 sm:p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="badge-brand text-xs px-2.5 py-0.5 font-semibold">
              {isHi ? 'प्रधान इष्ट देव एवं साधना' : 'Ishta Devata & Sadhana'}
            </span>
            <Sparkles className="h-4 w-4 text-brand-gold" />
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-display font-bold text-brand-primary dark:text-brand-gold">
              {isHi ? ishtaDevata.deityHi : ishtaDevata.deity}
            </h3>

            {/* Classical Jaimini Derivation Badge */}
            {ishtaDevata.atmakaraka && (
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="font-mono px-2 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary dark:text-brand-gold border border-brand-gold-border/30">
                  {isHi ? 'आत्मकारक' : 'Atmakaraka'}: {ishtaDevata.atmakaraka} {ishtaDevata.atmakarakaDegree != null ? `(${ishtaDevata.atmakarakaDegree.toFixed(1)}°)` : ''}
                </span>
                {ishtaDevata.karakamshaRashiName && (
                  <>
                    <span>→</span>
                    <span className="font-mono px-2 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary dark:text-brand-gold border border-brand-gold-border/30">
                      {isHi ? 'कारकांश (D9)' : 'Karakamsha'}: {ishtaDevata.karakamshaRashiName}
                    </span>
                  </>
                )}
                {ishtaDevata.twelfthHouseRashiName && (
                  <>
                    <span>→</span>
                    <span className="font-mono px-2 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary dark:text-brand-gold border border-brand-gold-border/30">
                      12th: {ishtaDevata.twelfthHouseRashiName}
                    </span>
                  </>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {isHi ? ishtaDevata.rationaleHi : ishtaDevata.rationale}
            </p>
          </div>

          {/* Sacred Mantra Box */}
          {ishtaDevata.mantra && (
            <div className="p-3.5 rounded-xl bg-background/90 border border-brand-gold-border/40 space-y-1">
              <p className="text-[10px] font-bold text-brand-primary dark:text-brand-gold uppercase tracking-wider">
                {isHi ? 'कल्याणकारी सिद्ध मंत्र:' : 'Sacred Consecrated Mantra:'}
              </p>
              <p className="text-base sm:text-lg font-hindi font-bold text-foreground leading-snug">
                {ishtaDevata.mantra}
              </p>
              {ishtaDevata.mantraMeaning && (
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  {ishtaDevata.mantraMeaning}
                </p>
              )}
            </div>
          )}

          {/* Methodology Disclaimer */}
          {(ishtaDevata.methodologyDisclaimer || ishtaDevata.methodologyDisclaimerHi) && (
            <div className="p-2.5 rounded-lg bg-surface-raised/60 border border-brand-gold-border/25 text-[10px] text-muted-foreground/90 leading-relaxed">
              <span className="font-semibold text-brand-primary dark:text-brand-gold">
                {isHi ? 'शास्त्रीय परम्परा:' : 'Methodology Note:'}
              </span>{' '}
              {isHi
                ? ishtaDevata.methodologyDisclaimerHi || ishtaDevata.methodologyDisclaimer
                : ishtaDevata.methodologyDisclaimer}
            </div>
          )}

          {/* Recommended Bhajan Link */}
          {ishtaDevata.recommendedBhajanQuery && (
            <div className="pt-2 border-t border-brand-gold-border/25 flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Music className="h-3.5 w-3.5 text-brand-gold" />
                {isHi ? 'साधना हेतु अनुशंसित भजन:' : 'Recommended Bhajan:'}
              </span>
              <Link
                to={`/search?q=${encodeURIComponent(ishtaDevata.recommendedBhajanQuery)}`}
                className="font-bold text-brand-primary dark:text-brand-gold hover:underline"
              >
                {ishtaDevata.recommendedBhajanQuery} →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Astrological Indications / Predictions (Level 2/3) */}
      {Object.keys(predictions).length > 0 && (
        <div className="rounded-xl bg-surface-raised/40 border border-brand-gold-border/30 p-4 space-y-3 shadow-sm">
          <div>
            <h3 className="font-display font-bold text-sm sm:text-base text-foreground">
              {isHi ? 'ज्योतिषीय जीवन संकेत एवं मार्गदर्शन' : 'Astrological Life Indications'}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {isHi ? 'लग्न, चंद्र एवं सक्रिय दशा के अनुसार विभिन्न क्षेत्रों का फलित' : 'Vedic guidance across key life areas based on planetary configurations'}
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {INDICATION_TABS.map((tab) => {
              if (!predictions[tab.key]?.length) return null;
              const isSelected = selectedTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedTab(tab.key)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-brand-primary text-primary-foreground shadow-sm'
                      : 'bg-background/80 text-muted-foreground hover:text-foreground border border-border/50'
                  }`}
                >
                  {isHi ? tab.hiLabel : tab.enLabel}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-3 rounded-lg bg-background/80 border border-brand-gold-border/20">
            <ul className="text-xs sm:text-sm text-foreground/90 space-y-2 list-disc list-inside leading-relaxed">
              {(predictions[selectedTab] || []).map((point, i) => (
                <li key={i} className="pl-0.5">{point}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
};

export const RemediesSadhanaSection = React.memo(RemediesSadhanaSectionInner);
