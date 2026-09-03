import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Share2, Edit3, Calendar, MapPin, Compass, ArrowRight } from 'lucide-react';
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
  vara?: string;
  onShare: () => void;
  onEdit: () => void;
  onBack?: () => void;
  onPrint?: () => void;
}

const ZODIAC_GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
  मेष: '♈', वृषभ: '♉', मिथुन: '♊', कर्क: '♋',
  सिंह: '♌', कन्या: '♍', तुला: '♎', वृश्चिक: '♏',
  धनु: '♐', मकर: '♑', कुम्भ: '♒', कुंभ: '♒', मीन: '♓',
};

const RASHI_ENGLISH_MAP: Record<string, string> = {
  मेष: 'Aries', वृषभ: 'Taurus', मिथुन: 'Gemini', कर्क: 'Cancer',
  सिंह: 'Leo', कन्या: 'Virgo', तुला: 'Libra', वृश्चिक: 'Scorpio',
  धनु: 'Sagittarius', मकर: 'Capricorn', कुम्भ: 'Aquarius', मीन: 'Pisces',
};

const NAKSHATRA_NAMES_HI: Record<string, string> = {
  Ashwini: 'अश्विनी', Bharani: 'भरणी', Krittika: 'कृत्तिका', Rohini: 'रोहिणी',
  Mrigashira: 'मृगशिरा', Ardra: 'आर्द्रा', Punarvasu: 'पुनर्वसु', Pushya: 'पुष्य',
  Ashlesha: 'अश्लेषा', Magha: 'मघा', 'Purva Phalguni': 'पूर्वाफाल्गुनी',
  'Uttara Phalguni': 'उत्तराफाल्गुनी', Hasta: 'हस्त', Chitra: 'चित्रा',
  Swati: 'स्वाति', Vishakha: 'विशाखा', Anuradha: 'अनुराधा', Jyeshtha: 'ज्येष्ठा',
  Mula: 'मूल', 'Purva Ashadha': 'पूर्वाषाढ़ा', 'Uttara Ashadha': 'उत्तराषाढ़ा',
  Shravana: 'श्रवण', Dhanishta: 'धनिष्ठा', Shatabhisha: 'शतभिषा',
  'Purva Bhadrapada': 'पूर्वाभाद्रपद', 'Uttara Bhadrapada': 'उत्तराभाद्रपद', Revati: 'रेवती',
};

function formatBirthDate(dateStr?: string): string {
  if (!dateStr) return '05 Feb 2005';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(d.getDate()).padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

function resolveVaara(dateStr?: string, explicitVara?: string, isHi = true): string {
  if (explicitVara && explicitVara !== '—') return explicitVara;
  if (!dateStr) return isHi ? 'शनिवार' : 'Saturday';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return isHi ? 'शनिवार' : 'Saturday';
    const VARA_HI = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
    const VARA_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return isHi ? VARA_HI[d.getDay()] : VARA_EN[d.getDay()];
  } catch {
    return isHi ? 'शनिवार' : 'Saturday';
  }
}

const KundliHeroHeaderInner: React.FC<KundliHeroHeaderProps> = ({
  birth,
  profile,
  ascendant,
  planets,
  isUnknownTime,
  ayanamsa = 'Lahiri Ayānāmsa',
  isHi,
  vara,
  onShare,
  onEdit,
}) => {
  const moonPlanet = planets.Moon;
  const sunPlanet = planets.Sun;

  // 1. Ascendant
  const ascSignHi = isUnknownTime ? '—' : (ascendant?.rashiNameHi || 'मिथुन');
  const ascSignEn = isUnknownTime ? '—' : (ascendant?.rashiName || RASHI_ENGLISH_MAP[ascSignHi] || 'Gemini');
  const ascGlyph = (!isUnknownTime && (ascendant?.rashiName || ascSignHi))
    ? ZODIAC_GLYPHS[ascendant?.rashiName || ''] || ZODIAC_GLYPHS[ascSignHi] || '♊'
    : '♊';

  // 2. Moon Sign
  const moonSignHi = moonPlanet?.rashiNameHindi || 'धनु';
  const moonSignEn = moonPlanet?.sign || RASHI_ENGLISH_MAP[moonSignHi] || 'Sagittarius';
  const moonGlyph = ZODIAC_GLYPHS[moonSignEn] || ZODIAC_GLYPHS[moonSignHi] || '♐';

  // 3. Sun Sign
  const sunSignHi = sunPlanet?.rashiNameHindi || 'मकर';
  const sunSignEn = sunPlanet?.sign || RASHI_ENGLISH_MAP[sunSignHi] || 'Capricorn';
  const sunGlyph = ZODIAC_GLYPHS[sunSignEn] || ZODIAC_GLYPHS[sunSignHi] || '♑';

  // 4. Nakshatra
  const rawNak = moonPlanet?.nakshatra || ascendant?.nakshatra || 'Mula';
  const nakHi = NAKSHATRA_NAMES_HI[rawNak] || rawNak;
  const nakEn = rawNak;
  const nakPada = moonPlanet?.nakshatraPada || 1;

  const userName = profile?.name || birth?.name || (isHi ? 'भक्त' : 'Devotee');
  const userAvatar = profile?.avatar_url;
  const displayDob = formatBirthDate(birth?.date_of_birth);
  const displayTime = birth?.birth_time || '15:00:00';
  const displayLocation = birth?.place_label || 'Jaipur, Rajasthan, India';
  const displayVaara = resolveVaara(birth?.date_of_birth, vara, isHi);
  const cleanAyanamsa = ayanamsa.includes('Lahiri') ? 'Lahiri Ayānāmsa' : ayanamsa;

  return (
    <div className="w-full space-y-3 print:hidden">
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ── DESKTOP UNIFIED HERO BANNER (Contained, Zero Overflow) ─────────── */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block rounded-2xl bg-[#FFFDF9] dark:bg-stone-900/95 border border-brand-gold-border/40 p-4 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-3 xl:gap-4 w-full">
          {/* ── Left: Profile Avatar & Details ─────────────────────────────── */}
          <div className="flex items-center gap-3.5 shrink-0 min-w-0 max-w-[320px] xl:max-w-[350px]">
            {/* Avatar with Edit Pencil Badge */}
            <div className="relative shrink-0">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-brand-gold/70 shadow-xs"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#80181d] via-[#651317] to-[#430a0d] flex items-center justify-center text-[#FAF6EE] ring-2 ring-brand-gold/70 shadow-xs font-serif font-bold text-2xl">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <button
                type="button"
                onClick={onEdit}
                aria-label={isHi ? 'विवरण बदलें' : 'Edit birth details'}
                title={isHi ? 'विवरण बदलें' : 'Edit birth details'}
                className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[#FFFDF9] dark:bg-stone-800 text-[#651317] dark:text-amber-400 border border-brand-gold-border/60 shadow-xs flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Edit3 className="h-3 w-3" />
              </button>
            </div>

            {/* Profile Info Details */}
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-bold text-lg xl:text-xl text-foreground capitalize leading-tight truncate">
                  {userName}
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-900 dark:text-amber-300 font-medium leading-none">
                  {cleanAyanamsa}
                </span>
                <button
                  type="button"
                  onClick={onShare}
                  title={isHi ? 'साझा करें' : 'Share Kundli'}
                  className="inline-flex items-center justify-center h-6 w-6 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <Share2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                <MapPin className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                <span className="truncate font-medium text-foreground/80">{displayLocation}</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap pt-0.5">
                <span className="inline-flex items-center gap-1 tabular-nums font-medium text-foreground/85">
                  <Calendar className="h-3.5 w-3.5 text-brand-gold shrink-0" />
                  {displayDob}
                </span>
                <span className="text-muted-foreground/40">•</span>
                <span className="tabular-nums font-medium text-foreground/85">
                  {displayTime}
                </span>
                <span className="text-muted-foreground/40">•</span>
                <span className="inline-flex items-center gap-1 font-medium text-foreground/85">
                  <Compass className="h-3.5 w-3.5 text-brand-gold shrink-0" />
                  {displayVaara}
                </span>
              </div>
            </div>
          </div>

          {/* ── Middle: 4 Vertical Pillar Cards (Responsive Grid, Never Overflows) ─── */}
          <div className="grid grid-cols-4 gap-2 flex-1 min-w-0 max-w-xl">
            {/* 1. Lagna */}
            <div className="flex flex-col items-center justify-center px-2 lg:px-3 py-2 rounded-xl bg-white/85 dark:bg-stone-800/80 border border-brand-gold-border/30 w-full text-center shadow-2xs">
              <div className="h-7 w-7 lg:h-8 lg:w-8 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center text-sm font-bold mb-1 shrink-0">
                {ascGlyph}
              </div>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider leading-none">
                {isHi ? 'लग्न' : 'Ascendant'}
              </span>
              <span className="font-display font-bold text-xs sm:text-sm text-foreground leading-tight mt-1 truncate">
                {isHi ? ascSignHi : ascSignEn}
              </span>
              {isHi && (
                <span className="text-[9px] text-muted-foreground leading-none mt-0.5 truncate">
                  {ascSignEn}
                </span>
              )}
            </div>

            {/* 2. Moon Sign */}
            <div className="flex flex-col items-center justify-center px-2 lg:px-3 py-2 rounded-xl bg-white/85 dark:bg-stone-800/80 border border-brand-gold-border/30 w-full text-center shadow-2xs">
              <div className="h-7 w-7 lg:h-8 lg:w-8 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center text-sm font-bold mb-1 shrink-0">
                {moonGlyph}
              </div>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider leading-none">
                {isHi ? 'चन्द्र राशि' : 'Moon Sign'}
              </span>
              <span className="font-display font-bold text-xs sm:text-sm text-foreground leading-tight mt-1 truncate">
                {isHi ? moonSignHi : moonSignEn}
              </span>
              {isHi && (
                <span className="text-[9px] text-muted-foreground leading-none mt-0.5 truncate">
                  {moonSignEn}
                </span>
              )}
            </div>

            {/* 3. Sun Sign */}
            <div className="flex flex-col items-center justify-center px-2 lg:px-3 py-2 rounded-xl bg-white/85 dark:bg-stone-800/80 border border-brand-gold-border/30 w-full text-center shadow-2xs">
              <div className="h-7 w-7 lg:h-8 lg:w-8 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center text-sm font-bold mb-1 shrink-0">
                {sunGlyph}
              </div>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider leading-none">
                {isHi ? 'सूर्य राशि' : 'Sun Sign'}
              </span>
              <span className="font-display font-bold text-xs sm:text-sm text-foreground leading-tight mt-1 truncate">
                {isHi ? sunSignHi : sunSignEn}
              </span>
              {isHi && (
                <span className="text-[9px] text-muted-foreground leading-none mt-0.5 truncate">
                  {sunSignEn}
                </span>
              )}
            </div>

            {/* 4. Nakshatra */}
            <div className="flex flex-col items-center justify-center px-2 lg:px-3 py-2 rounded-xl bg-white/85 dark:bg-stone-800/80 border border-brand-gold-border/30 w-full text-center shadow-2xs">
              <div className="h-7 w-7 lg:h-8 lg:w-8 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 flex items-center justify-center text-sm font-bold mb-1 shrink-0">
                ✴️
              </div>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider leading-none">
                {isHi ? 'नक्षत्र' : 'Nakshatra'}
              </span>
              <span className="font-display font-bold text-xs sm:text-sm text-foreground leading-tight mt-1 truncate">
                {isHi ? `${nakHi} (प.${nakPada})` : `${nakEn} (P.${nakPada})`}
              </span>
              {isHi && (
                <span className="text-[9px] text-muted-foreground leading-none mt-0.5 truncate">
                  {nakEn}
                </span>
              )}
            </div>
          </div>

          {/* ── Right: Guru Ji Consultation Card (Requested Gradient + Enlarged Krishna Ji) ── */}
          <Link
            to="/ask-guru-ji"
            className="flex items-center gap-3.5 px-4 py-2.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-surface-raised to-brand-primary/10 border border-brand-gold-border/40 hover:border-brand-gold/60 shadow-xs group shrink-0 max-w-[285px] lg:max-w-[315px] xl:max-w-[335px] cursor-pointer select-none transition-all"
          >
            <img
              src="/images/deity-krishna.png"
              alt="Lord Krishna"
              className="h-20 w-auto xl:h-[84px] object-contain shrink-0"
              style={{ maxHeight: '84px', width: 'auto' }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-amber-900/80 dark:text-amber-400 font-semibold uppercase tracking-wider leading-none">
                {isHi ? 'इस कुंडली के बारे में' : 'About this Kundli'}
              </p>
              <h3 className="font-display font-bold text-sm xl:text-base text-[#651317] dark:text-amber-300 leading-snug mt-1">
                {isHi ? 'गुरु जी से पूछें' : 'Consult Guru Ji'}
              </h3>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 line-clamp-1">
                {isHi ? 'अपने प्रश्न पूछें और मार्गदर्शन पाएं।' : 'Ask personal astrological questions.'}
              </p>
              <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold text-white bg-[#651317] dark:bg-amber-500 dark:text-stone-950 group-hover:bg-[#520f12] transition-colors shadow-2xs">
                <span>{isHi ? 'गुरु जी से पूछें' : 'Ask Guru Ji'}</span>
                <ArrowRight className="h-2.5 w-2.5" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ── MOBILE VIEW: USER PROFILE + 4 PILLARS ─────────────────────────── */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <div className="block md:hidden">
        {/* User Information Profile Card */}
        <div className="rounded-2xl bg-[#FFFDF9] dark:bg-stone-900 border border-brand-gold-border/40 p-3.5 sm:p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            {/* Avatar with Edit Badge */}
            <div className="relative shrink-0">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="h-14 w-14 rounded-full object-cover ring-2 ring-brand-gold/70"
                />
              ) : (
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#80181d] via-[#651317] to-[#430a0d] flex items-center justify-center text-white ring-2 ring-brand-gold/70 font-serif font-bold text-xl shadow-xs">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <button
                type="button"
                onClick={onEdit}
                aria-label={isHi ? 'विवरण बदलें' : 'Edit profile'}
                className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-white dark:bg-stone-800 text-[#651317] dark:text-amber-400 border border-brand-gold-border/60 shadow-xs flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform"
              >
                <Edit3 className="h-2.5 w-2.5" />
              </button>
            </div>

            {/* Name and Basic Meta */}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="font-display font-bold text-base text-foreground capitalize leading-tight truncate">
                  {userName}
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-900 dark:text-amber-300 font-medium leading-none">
                  {cleanAyanamsa}
                </span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 leading-none font-medium truncate">
                <MapPin className="h-3 w-3 text-brand-gold shrink-0" />
                <span>{displayLocation}</span>
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground leading-none pt-0.5 font-sans">
                <Calendar className="h-3 w-3 text-brand-gold shrink-0" />
                <span className="tabular-nums font-medium text-foreground/85">
                  {displayDob} • {displayTime} • {displayVaara}
                </span>
              </div>
            </div>
          </div>

          {/* 4 Pillars 2x2 Grid on Mobile (Clean, Refined Color Tints) */}
          <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-brand-gold-border/20">
            {/* 1. Lagna */}
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-teal-500/5 dark:bg-teal-950/20 border border-teal-500/20 shadow-2xs">
              <div className="h-7 w-7 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center text-xs font-bold shrink-0">
                {ascGlyph}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider leading-none">
                  {isHi ? 'लग्न' : 'Ascendant'}
                </p>
                <p className="font-display font-semibold text-xs sm:text-sm text-teal-700 dark:text-teal-300 leading-tight mt-0.5 truncate">
                  {isHi ? ascSignHi : ascSignEn}
                </p>
              </div>
            </div>

            {/* 2. Moon Sign */}
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-blue-500/5 dark:bg-blue-950/20 border border-blue-500/20 shadow-2xs">
              <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold shrink-0">
                {moonGlyph}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider leading-none">
                  {isHi ? 'चन्द्र राशि' : 'Moon Sign'}
                </p>
                <p className="font-display font-semibold text-xs sm:text-sm text-blue-700 dark:text-blue-300 leading-tight mt-0.5 truncate">
                  {isHi ? moonSignHi : moonSignEn}
                </p>
              </div>
            </div>

            {/* 3. Sun Sign */}
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 shadow-2xs">
              <div className="h-7 w-7 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center text-xs font-bold shrink-0">
                {sunGlyph}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider leading-none">
                  {isHi ? 'सूर्य राशि' : 'Sun Sign'}
                </p>
                <p className="font-display font-semibold text-xs sm:text-sm text-amber-700 dark:text-amber-300 leading-tight mt-0.5 truncate">
                  {isHi ? sunSignHi : sunSignEn}
                </p>
              </div>
            </div>

            {/* 4. Nakshatra */}
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-purple-500/5 dark:bg-purple-950/20 border border-purple-500/20 shadow-2xs">
              <div className="h-7 w-7 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs font-bold shrink-0">
                ✴️
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider leading-none">
                  {isHi ? 'नक्षत्र' : 'Nakshatra'}
                </p>
                <p className="font-display font-semibold text-xs sm:text-sm text-foreground leading-tight mt-0.5 truncate">
                  {isHi ? `${nakHi} (प.${nakPada})` : `${nakEn} (P.${nakPada})`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const KundliHeroHeader = memo(KundliHeroHeaderInner);
