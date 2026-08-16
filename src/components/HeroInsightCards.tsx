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
    <div className={cn('w-full grid grid-cols-3 gap-4 lg:gap-5 items-stretch', className)}>
      {/* Card 1: Today's Ram Vani (Doha Card) */}
      <RamVaniCard className="mt-0 h-full" />

      {/* Card 2: Dhyan Jap (Promotional Section Card - No Mandalas) */}
      <FeatureConceptCard
        titleEn="Dhyan Jap Sadhana"
        titleHi="ध्यान जप साधना"
        sectionTagEn="Meditation Room"
        sectionTagHi="साधना अनुभाग"
        linesEn={[
          'Sit still & count every Ram naam.',
          'Digital mala, breath & deep focus.',
        ]}
        linesHi={[
          'स्थिर बैठें, प्रभु राम नाम जपें।',
          'डिजिटल माला, श्वास एवं ध्यान केंद्र।',
        ]}
        badgeEn="108 Bead Mala"
        badgeHi="108 मनका माला"
        ctaEn="Begin Jap Practice"
        ctaHi="जप साधना शुरू करें"
        href="/meditation?practice=mantra_jap_home"
        imageSrc={naamJapImage}
        imageAlt="Dhyan Jap Sadhana"
        accent="#801C24"
      />

      {/* Card 3: Bhakti Samuday (Promotional Section Card - No Mandalas) */}
      <FeatureConceptCard
        titleEn="Bhakti Samuday"
        titleHi="भक्ति समुदाय संग"
        sectionTagEn="Devotee Network"
        sectionTagHi="भक्त संगम"
        linesEn={[
          'Satsang with devotees across India.',
          'Share bhajans, divine experiences & seva.',
        ]}
        linesHi={[
          'देश भर के राम भक्तों के साथ सत्संग।',
          'भजन, आध्यात्मिक अनुभव एवं सेवा बाँटें।',
        ]}
        badgeEn="50k+ Devotees"
        badgeHi="50,000+ साधक"
        ctaEn="Join Devotee Community"
        ctaHi="समुदाय में शामिल हों"
        href="/community"
        imageSrc={samudayImage}
        imageAlt="Bhakti Samuday"
        accent="#0F766E"
      />
    </div>
  );
}

export default HeroInsightCards;
