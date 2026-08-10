import { cn } from '@/lib/utils';
import { RamVaniCard } from '@/components/RamVaniCard';
import { FeatureConceptCard } from '@/components/FeatureConceptCard';

import naamJapImage from '@/pages/images/naam_jap_high_quality.webp';
import samudayImage from '@/pages/images/bhakti_samuday_high_quality.webp';

interface HeroInsightCardsProps {
  className?: string;
}

/**
 * Full-width insight row: Ram Vani · Dhyan Jap · Samuday
 * Mobile: horizontal snap scroll · Desktop: equal 3-column grid
 */
export function HeroInsightCards({ className }: HeroInsightCardsProps) {
  return (
    <div
      className={cn(
        'w-full mt-2.5 flex md:grid md:grid-cols-3 gap-2.5 md:gap-3 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-1 -mx-0.5 px-0.5',
        className,
      )}
    >
      <div className="min-w-[min(88vw,340px)] md:min-w-0 snap-start shrink-0 md:shrink md:h-full">
        <RamVaniCard className="mt-0 h-full" />
      </div>

      <div className="min-w-[min(88vw,340px)] md:min-w-0 snap-start shrink-0 md:shrink md:h-full">
        <FeatureConceptCard
          titleEn="Dhyan Jap"
          titleHi="ध्यान जप"
          linesEn={[
            'Sit still. Count every Ram naam.',
            'Mala, breath, and quiet focus — together.',
          ]}
          linesHi={[
            'स्थिर बैठो। प्रत्येक राम नाम गिनो।',
            'माला, श्वास और ध्यान — एक साथ।',
          ]}
          badgeEn="Naam Jap · Meditation"
          badgeHi="नाम जप · ध्यान"
          ctaEn="Begin Jap"
          ctaHi="जप शुरू करें"
          href="/meditation?practice=mantra_jap_home"
          imageSrc={naamJapImage}
          imageAlt="Dhyan Jap"
          accent="#5B2C6F"
        />
      </div>

      <div className="min-w-[min(88vw,340px)] md:min-w-0 snap-start shrink-0 md:shrink md:h-full">
        <FeatureConceptCard
          titleEn="Bhakti Samuday"
          titleHi="भक्ति समुदाय"
          linesEn={[
            'Satsang with devotees across India.',
            'Share bhajans, sevā, and living faith.',
          ]}
          linesHi={[
            'भारत भर के भक्तों के साथ सत्संग।',
            'भजन, सेवा और आस्था बाँटें।',
          ]}
          badgeEn="Community · Seva"
          badgeHi="समुदाय · सेवा"
          ctaEn="Join Samuday"
          ctaHi="समुदाय में जुड़ें"
          href="/community"
          imageSrc={samudayImage}
          imageAlt="Bhakti Samuday"
          accent="#0F766E"
        />
      </div>
    </div>
  );
}

export default HeroInsightCards;
