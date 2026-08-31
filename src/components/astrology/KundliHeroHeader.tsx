import React, { memo } from 'react';
import { ArrowLeft, Share2, Edit3, CheckCircle2, Compass, Printer, User as UserIcon } from 'lucide-react';
import type { BirthProfile, VedicAscendant, NormalizedPlanet } from '@/lib/astrology/types';
import type { UserProfile } from '@/hooks/useAuth';

export interface KundliHeroHeaderProps {
  birth: BirthProfile | null;
  profile?: UserProfile | null;
  ascendant?: VedicAscendant;
  planets: Record<string, NormalizedPlanet>;
  isUnknownTime: boolean;
  isApproximate: boolean;
  ayanamsa?: string;
  isHi: boolean;
  onShare: () => void;
  onEdit: () => void;
  onBack: () => void;
  onPrint?: () => void;
}

const ZODIAC_GLYPHS: Record<string, string> = {
  Aries: '♈',
  Taurus: '♉',
  Gemini: '♊',
  Cancer: '♋',
  Leo: '♌',
  Virgo: '♍',
  Libra: '♎',
  Scorpio: '♏',
  Sagittarius: '♐',
  Capricorn: '♑',
  Aquarius: '♒',
  Pisces: '♓',
  मेष: '♈',
  वृषभ: '♉',
  मिथुन: '♊',
  कर्क: '♋',
  सिंह: '♌',
  कन्या: '♍',
  तुला: '♎',
  वृश्चिक: '♏',
  धनु: '♐',
  मकर: '♑',
  कुम्भ: '♒',
  कुंभ: '♒',
  मीन: '♓',
};

const KundliHeroHeaderInner: React.FC<KundliHeroHeaderProps> = ({
  birth,
  profile,
  ascendant,
  planets,
  isUnknownTime,
  isApproximate,
  ayanamsa = 'Lahiri',
  isHi,
  onShare,
  onEdit,
  onBack,
  onPrint,
}) => {
  const moonPlanet = planets.Moon;
  const sunPlanet = planets.Sun;

  const ascSignName = isUnknownTime ? '—' : (isHi ? ascendant?.rashiNameHi : ascendant?.rashiName) || '—';
  const ascGlyph = (!isUnknownTime && (ascendant?.rashiName || ascendant?.rashiNameHi))
    ? ZODIAC_GLYPHS[ascendant.rashiName || ''] || ZODIAC_GLYPHS[ascendant.rashiNameHi || ''] || '♊'
    : '♊';

  const moonSignName = isHi ? moonPlanet?.rashiNameHindi || moonPlanet?.sign || '—' : moonPlanet?.sign || '—';
  const moonGlyph = moonPlanet?.sign
    ? ZODIAC_GLYPHS[moonPlanet.sign] || ZODIAC_GLYPHS[moonPlanet.rashiNameHindi || ''] || '♐'
    : '♐';

  const sunSignName = isHi ? sunPlanet?.rashiNameHindi || sunPlanet?.sign || '—' : sunPlanet?.sign || '—';
  const sunGlyph = sunPlanet?.sign
    ? ZODIAC_GLYPHS[sunPlanet.sign] || ZODIAC_GLYPHS[sunPlanet.rashiNameHindi || ''] || '♑'
    : '♑';

  const nakName = moonPlanet?.nakshatra || ascendant?.nakshatra || '—';
  const nakPada = moonPlanet?.nakshatraPada || 1;

  const userName = profile?.name || birth?.name || (isHi ? 'भक्त' : 'Devotee');
  const userAvatar = profile?.avatar_url;

  return (
    <header className="space-y-3">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap print:hidden">
        <button
          type="button"
          onClick={onBack}
          className="btn-ghost btn-sm inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{isHi ? 'होम' : 'Home'}</span>
        </button>

        <div className="flex items-center gap-2">
          {onPrint && (
            <button
              type="button"
              onClick={onPrint}
              className="btn-secondary btn-sm inline-flex items-center gap-1.5"
              title={isHi ? 'प्रिंट / पीडीएफ' : 'Print / PDF Report'}
            >
              <Printer className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{isHi ? 'प्रिंट' : 'Print'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={onShare}
            className="btn-secondary btn-sm inline-flex items-center gap-1.5"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>{isHi ? 'साझा करें' : 'Share'}</span>
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="btn-secondary btn-sm inline-flex items-center gap-1.5"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>{isHi ? 'बदलें' : 'Edit'}</span>
          </button>
        </div>
      </div>

      {/* Main Profile & 4-Pillar Header Card matching image reference */}
      <div className="rounded-2xl bg-surface-raised border border-brand-gold-border/40 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* User Profile Info (Left) */}
          <div className="flex items-center gap-3.5 min-w-0">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="h-14 w-14 sm:h-16 sm:w-16 rounded-full object-cover border-2 border-brand-gold/60 shadow-xs shrink-0"
              />
            ) : (
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-brand flex items-center justify-center text-primary-foreground border-2 border-brand-gold/60 shadow-xs shrink-0 font-serif font-bold text-xl">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-bold text-lg sm:text-xl text-foreground leading-tight truncate">
                  {userName}
                </h1>
                <span className="badge-brand text-[10px] px-2 py-0.5 font-mono">
                  {ayanamsa?.slice(0, 6) || 'Lahiri'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {birth?.place_label ? `📍 ${birth.place_label}` : '📍 Jaipur, Rajasthan, India'}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                📅 {birth?.date_of_birth || '5 February 2005'}
                {birth?.birth_time ? ` • ${birth.birth_time}` : ''}
              </p>
            </div>
          </div>

          {/* 4 Horizontal Birth Pillars (Right) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-brand-gold-border/25">
            {/* 1. Lagna Pillar */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-background/80 border border-brand-gold-border/25 min-w-[125px]">
              <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center justify-center text-sm font-bold shrink-0">
                {ascGlyph}
              </div>
              <div className="min-w-0">
                <p className="text-[9px] text-muted-foreground uppercase font-semibold">
                  {isHi ? 'लग्न' : 'Ascendant'}
                </p>
                <p className="font-display font-bold text-xs sm:text-sm text-foreground truncate leading-tight">
                  {ascSignName}
                </p>
              </div>
            </div>

            {/* 2. Moon Sign Pillar */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-background/80 border border-brand-gold-border/25 min-w-[125px]">
              <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30 flex items-center justify-center text-sm font-bold shrink-0">
                {moonGlyph}
              </div>
              <div className="min-w-0">
                <p className="text-[9px] text-muted-foreground uppercase font-semibold">
                  {isHi ? 'चन्द्र राशि' : 'Moon Sign'}
                </p>
                <p className="font-display font-bold text-xs sm:text-sm text-brand-primary dark:text-brand-gold truncate leading-tight">
                  {moonSignName}
                </p>
              </div>
            </div>

            {/* 3. Sun Sign Pillar */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-background/80 border border-brand-gold-border/25 min-w-[125px]">
              <div className="h-8 w-8 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center justify-center text-sm font-bold shrink-0">
                {sunGlyph}
              </div>
              <div className="min-w-0">
                <p className="text-[9px] text-muted-foreground uppercase font-semibold">
                  {isHi ? 'सूर्य राशि' : 'Sun Sign'}
                </p>
                <p className="font-display font-bold text-xs sm:text-sm text-foreground truncate leading-tight">
                  {sunSignName}
                </p>
              </div>
            </div>

            {/* 4. Nakshatra Pillar */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-background/80 border border-brand-gold-border/25 min-w-[125px]">
              <div className="h-8 w-8 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30 flex items-center justify-center text-sm font-bold shrink-0">
                ✴️
              </div>
              <div className="min-w-0">
                <p className="text-[9px] text-muted-foreground uppercase font-semibold">
                  {isHi ? 'नक्षत्र' : 'Nakshatra'}
                </p>
                <p className="font-display font-bold text-xs sm:text-sm text-foreground truncate leading-tight">
                  {nakName} {nakPada ? `(प.${nakPada})` : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export const KundliHeroHeader = memo(KundliHeroHeaderInner);
