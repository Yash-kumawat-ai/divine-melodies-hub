import { cn } from '@/lib/utils';
import { RamVaniCard } from '@/components/RamVaniCard';
import { FeatureConceptCard } from '@/components/FeatureConceptCard';

import naamJapImage from '@/pages/images/naam_jap_high_quality.webp';
import samudayImage from '@/pages/images/bhakti_samuday_high_quality.webp';

interface HeroInsightCardsProps {
  className?: string;
}

/** Desktop-only full-width row: Ram Vani · Dhyan Jap · Samuday */
export function HeroInsightCards({ className }: HeroInsightCardsProps) {
  return (
    <div className={cn('w-full grid grid-cols-3 gap-3 items-stretch', className)}>
      <RamVaniCard className="mt-0 h-full" />

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
  );
}

export default HeroInsightCards;
