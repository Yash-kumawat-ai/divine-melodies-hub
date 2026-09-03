import React, { memo } from 'react';
import { CalendarDays } from 'lucide-react';
import type { JanmaPanchangam } from '@/lib/astrology/types';

interface JanmaPanchangCompactProps {
  panchanga?: JanmaPanchangam;
  isHi: boolean;
}

const JanmaPanchangCompactInner: React.FC<JanmaPanchangCompactProps> = ({ panchanga, isHi }) => {
  if (!panchanga) return null;

  const varaDisplay = isHi
    ? (panchanga.varaHi || panchanga.vara || '—')
    : (panchanga.vara || panchanga.varaHi || '—');

  const yogaDisplay = isHi
    ? (panchanga.yogaHi || panchanga.yoga || '—')
    : (panchanga.yoga || panchanga.yogaHi || '—');

  const karanaDisplay = isHi
    ? (panchanga.karanaHi || panchanga.karana || '—')
    : (panchanga.karana || panchanga.karanaHi || '—');

  const rituAyanaDisplay = isHi
    ? (panchanga.rituHi && panchanga.ayanaHi
        ? `${panchanga.rituHi} / ${panchanga.ayanaHi}`
        : (panchanga.rituHi || panchanga.ayanaHi || panchanga.ritu || panchanga.ayana || '—'))
    : (panchanga.ritu && panchanga.ayana
        ? `${panchanga.ritu} / ${panchanga.ayana}`
        : (panchanga.ritu || panchanga.ayana || panchanga.rituHi || '—'));

  const rows = [
    {
      icon: '🕉️',
      labelHi: 'तिथि',
      labelEn: 'Tithi',
      value: panchanga.tithi || '—',
    },
    {
      icon: '⏱️',
      labelHi: 'वार',
      labelEn: 'Vara',
      value: varaDisplay,
    },
    {
      icon: '⏱️',
      labelHi: 'नक्षत्र',
      labelEn: 'Nakshatra',
      value: `${panchanga.nakshatra || '—'} ${panchanga.nakshatraPada ? `(पाद ${panchanga.nakshatraPada})` : ''}`,
    },
    {
      icon: '⚖️',
      labelHi: 'योग',
      labelEn: 'Yoga',
      value: yogaDisplay,
    },
    {
      icon: '🔯',
      labelHi: 'करण',
      labelEn: 'Karana',
      value: karanaDisplay,
    },
    {
      icon: '🌿',
      labelHi: 'ऋतु / अयन',
      labelEn: 'Ritu / Ayana',
      value: rituAyanaDisplay,
    },
  ];

  return (
    <div id="panchang" className="scroll-mt-32 rounded-2xl bg-surface-raised border border-brand-gold-border/40 p-4 sm:p-5 shadow-sm space-y-3.5 h-full">
      <h2 className="font-display font-bold text-base sm:text-lg text-foreground flex items-center gap-2 border-b border-brand-gold-border/25 pb-2.5">
        <CalendarDays className="h-4 w-4 text-brand-gold shrink-0" />
        <span>{isHi ? 'जन्म पंचांग' : 'Janma Panchanga'}</span>
      </h2>

      <div className="divide-y divide-brand-gold-border/20">
        {rows.map((row, idx) => (
          <div key={idx} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground font-medium">
              <span className="text-sm leading-none" aria-hidden="true">{row.icon}</span>
              <span>{isHi ? row.labelHi : row.labelEn}</span>
            </div>
            <span className="text-right truncate max-w-[150px] font-semibold text-foreground">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const JanmaPanchangCompact = memo(JanmaPanchangCompactInner);
