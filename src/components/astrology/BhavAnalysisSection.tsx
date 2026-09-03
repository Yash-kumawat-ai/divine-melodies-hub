import React from 'react';
import { Compass } from 'lucide-react';
import type { VedicHouseData } from '@/lib/astrology/types';

interface BhavAnalysisSectionProps {
  houses: VedicHouseData[];
  isUnknownTime: boolean;
  isHi: boolean;
}

const VEDIC_PLANET_NAMES_HI: Record<string, string> = {
  Sun: 'सूर्य',
  Moon: 'चन्द्र',
  Mars: 'मंगल',
  Mercury: 'बुध',
  Jupiter: 'गुरु',
  Venus: 'शुक्र',
  Saturn: 'शनि',
  Rahu: 'राहु',
  Ketu: 'केतु',
};

const BHAVA_META: Record<number, { hiName: string; enName: string; signifHi: string; signifEn: string }> = {
  1:  { hiName: 'तनु भाव',    enName: '1st House',  signifHi: 'शरीर, व्यक्तित्व व स्वास्थ्य', signifEn: 'Self & Vitality' },
  2:  { hiName: 'धन भाव',     enName: '2nd House',  signifHi: 'कुटुंब, संपत्ति व वाणी',        signifEn: 'Wealth & Speech' },
  3:  { hiName: 'सहज भाव',    enName: '3rd House',  signifHi: 'पराक्रम, भाई-बहन व संचार',      signifEn: 'Courage & Siblings' },
  4:  { hiName: 'सुख भाव',    enName: '4th House',  signifHi: 'माता, भूमि, भवन व सुख',         signifEn: 'Mother & Comforts' },
  5:  { hiName: 'पुत्र भाव',   enName: '5th House',  signifHi: 'संतान, बुद्धि व पूर्वपुण्य',     signifEn: 'Intellect & Children' },
  6:  { hiName: 'रिपु भाव',    enName: '6th House',  signifHi: 'रोग, ऋण, शत्रु व सेवा',         signifEn: 'Enemies & Health' },
  7:  { hiName: 'जाया भाव',    enName: '7th House',  signifHi: 'दांपत्य, विवाह व साझेदारी',     signifEn: 'Spouse & Partners' },
  8:  { hiName: 'रंध्र भाव',   enName: '8th House',  signifHi: 'आयु, गूढ़ ज्ञान व परिवर्तन',    signifEn: 'Longevity & Secrets' },
  9:  { hiName: 'धर्म भाव',    enName: '9th House',  signifHi: 'भाग्य, धर्म, गुरु व तीर्थ',     signifEn: 'Fortune & Dharma' },
  10: { hiName: 'कर्म भाव',    enName: '10th House', signifHi: 'आजीविका, पद-प्रतिष्ठा व यश',    signifEn: 'Career & Status' },
  11: { hiName: 'लाभ भाव',    enName: '11th House', signifHi: 'आय, उपलब्धि, लाभ व मित्र',       signifEn: 'Gains & Aspirations' },
  12: { hiName: 'व्यय भाव',    enName: '12th House', signifHi: 'मोक्ष, विदेश यात्रा व व्यय',     signifEn: 'Moksha & Foreign' },
};

const BhavAnalysisSectionInner: React.FC<BhavAnalysisSectionProps> = ({ houses, isUnknownTime, isHi }) => {
  if (isUnknownTime || !houses || houses.length === 0) return null;

  return (
    <section id="houses" className="scroll-mt-32 space-y-3">
      <div className="border-b border-brand-gold-border/30 pb-2.5">
        <h2 className="text-base sm:text-lg font-display font-bold text-foreground flex items-center gap-2">
          <Compass className="h-4 w-4 text-brand-gold shrink-0" />
          <span>{isHi ? 'द्वादश भाव विश्लेषण (12 Houses)' : '12 Bhavas (House Analysis)'}</span>
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isHi ? 'प्रत्येक भाव की राशि, भावेश (अधिपति) और स्थित ग्रह' : 'Rashi, lord, occupants, and significance per house'}
        </p>
      </div>

      {/* 12 House Grid (Level 2/3 Clean Responsive Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {houses.map((h) => {
          const binfo = BHAVA_META[h.number];
          const houseNumPadded = String(h.number).padStart(2, '0');

          return (
            <div
              key={h.number}
              className="rounded-xl bg-surface-raised/40 border border-brand-gold-border/30 p-3 flex flex-col justify-between hover:border-brand-gold/50 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-5 w-5 rounded-md bg-brand-primary/10 text-brand-primary dark:text-brand-gold font-bold text-[11px] flex items-center justify-center font-mono shrink-0 border border-brand-gold-border/30">
                      {houseNumPadded}
                    </span>
                    <h3 className="font-display font-bold text-xs sm:text-sm text-foreground truncate">
                      {isHi ? (binfo?.hiName || `${h.number} भाव`) : `House ${h.number}`}
                    </h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary dark:text-brand-gold font-semibold shrink-0">
                    {h.rashiNameHi || h.rashiName || '—'}
                  </span>
                </div>

                <p className="text-[10px] text-muted-foreground leading-snug mb-2 truncate">
                  {isHi ? binfo?.signifHi : (binfo?.signifEn || h.significance)}
                </p>
              </div>

              <div className="grid grid-cols-[45px_1fr] gap-x-2 gap-y-1 text-[11px] pt-1.5 border-t border-brand-gold-border/20">
                <span className="text-muted-foreground">{isHi ? 'भावेश:' : 'Lord:'}</span>
                <span className="font-semibold text-foreground truncate">
                  {h.lordHi || h.lord || '—'}
                </span>

                <span className="text-muted-foreground">{isHi ? 'ग्रह:' : 'Planets:'}</span>
                <div className="min-w-0">
                  {h.planets && h.planets.length > 0 ? (
                    <span className="font-semibold text-brand-primary dark:text-brand-gold text-[10px]">
                      {h.planets
                        .map((p: string) => (isHi ? VEDIC_PLANET_NAMES_HI[p] || p : p))
                        .join(', ')}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/60 text-[10px]">{isHi ? 'रिक्त' : 'Empty'}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export const BhavAnalysisSection = React.memo(BhavAnalysisSectionInner);
