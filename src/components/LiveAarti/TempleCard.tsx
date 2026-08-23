import React from 'react';
import { Play, MapPin, Landmark, Clock, Radio } from 'lucide-react';
import type { Temple } from '../../types/liveAarti';
import LiveBadge from './LiveBadge';
import CountdownTimer from './CountdownTimer';
import { useLanguage } from '@/hooks/useLanguage';
import { getNextAarti, formatVerifiedTime } from '@/hooks/useLiveAarti';
import { resolveTempleBanner } from './templeBanners';

interface TempleCardProps {
  temple: Temple;
  status?: 'live' | 'starting-soon' | 'upcoming';
  aartiName?: string;
  aartiNameHindi?: string;
  minutesUntilStart?: number;
  minutesUntilEnd?: number;
  onClick: () => void;
  priority?: boolean;
}

export default function TempleCard({
  temple,
  status,
  aartiName,
  aartiNameHindi,
  minutesUntilStart,
  minutesUntilEnd,
  onClick,
  priority = false,
}: TempleCardProps) {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const title = isHi ? temple.nameHindi : temple.name;
  const deityText = isHi ? temple.deityHindi : temple.deity;

  // Resolve current status (prioritize prop over temple.status, default to OFFLINE)
  const resolvedStatus = status 
    ? (status === 'live' ? 'LIVE' : 'UPCOMING') 
    : (temple.status || 'OFFLINE');

  // Fetch next upcoming aarti data
  const nextAartiData = getNextAarti(temple);

  // Resolve countdown minutes
  let displayMinutes = minutesUntilStart;
  if (displayMinutes === undefined && nextAartiData) {
    displayMinutes = nextAartiData.minutesUntilStart;
  }

  const aartiTitle = aartiName || (nextAartiData ? nextAartiData.aarti.name : undefined);
  const aartiTitleHindi = aartiNameHindi || (nextAartiData ? nextAartiData.aarti.nameHindi : undefined);
  const displayAartiName = isHi ? aartiTitleHindi : aartiTitle;

  const formatMinutes = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs}h`;
  };

  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer overflow-hidden rounded-2xl md:rounded-[22px] border border-[#E8D8C4] dark:border-stone-800 bg-[#FFFDF8] dark:bg-[#140d08] hover:border-[#651317]/40 dark:hover:border-amber-400/40 p-4 sm:p-5 transition-transform duration-200 hover:-translate-y-1 active:scale-[0.98] group shadow-xs hover:shadow-md flex flex-col justify-between text-left h-full will-change-transform"
    >
      {/* Decorative colored glow on top edge */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 transition-opacity group-hover:opacity-100 opacity-70"
        style={{ backgroundColor: temple.accentColor || '#f97316' }}
      />

      <div className="flex flex-col gap-3.5 justify-between h-full">
        <div className="space-y-3">
          {/* Temple image thumbnail */}
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-950/60 border border-[#E8D8C4]/60 dark:border-stone-800/80">
            <img
              src={resolveTempleBanner(temple.id)}
              alt={title}
              width={400}
              height={225}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
              loading={priority ? 'eager' : 'lazy'}
              fetchpriority={priority ? 'high' : 'low'}
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

            {/* Live / Category tag on thumbnail */}
            <div className="absolute top-2.5 left-2.5 z-10">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#651317] dark:text-amber-300 bg-[#FFFDF8]/95 dark:bg-stone-900/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-[#E8D8C4] dark:border-stone-700 shadow-2xs">
                {temple.category}
              </span>
            </div>

            {resolvedStatus === 'LIVE' && (
              <div className="absolute top-2.5 right-2.5 z-10">
                <LiveBadge />
              </div>
            )}
          </div>

          {/* Status and Verification row (if not live or has status) */}
          <div className="flex items-center justify-between gap-2 min-h-[22px]">
            <div className="flex items-center gap-1.5">
              {resolvedStatus === 'UPCOMING' && displayMinutes !== undefined && (
                <CountdownTimer 
                  minutes={displayMinutes} 
                  label={displayMinutes <= 30 ? (isHi ? "शुरू होने वाला है:" : "Starts in") : (isHi ? "आगामी:" : "Upcoming in")} 
                />
              )}

              {resolvedStatus === 'OFFLINE' && (
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-[#E8D8C4] dark:border-stone-700 text-[#786252] dark:text-stone-400 text-[10px] font-bold tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#786252] dark:bg-stone-400 opacity-60" />
                  <span>{isHi ? "ऑफ़लाइन" : "OFFLINE"}</span>
                </div>
              )}

              {resolvedStatus === 'STREAM_UNAVAILABLE' && (
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold tracking-wider uppercase">
                  <span>{isHi ? "अवरुद्ध" : "BLOCKED"}</span>
                </div>
              )}
            </div>

            {temple.lastVerifiedAt && (
              <span className="text-[10px] text-[#786252]/70 dark:text-stone-400 font-medium leading-none truncate ml-auto">
                {formatVerifiedTime(temple.lastVerifiedAt, isHi)}
              </span>
            )}
          </div>

          {/* Temple details */}
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold font-display text-[#3A2418] dark:text-amber-100 group-hover:text-[#651317] dark:group-hover:text-amber-300 transition-colors leading-tight line-clamp-1">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-[#651317] dark:text-amber-400 font-semibold flex items-center gap-1.5 truncate">
              <Landmark className="w-3.5 h-3.5 shrink-0 opacity-80" />
              <span className="truncate">{deityText}</span>
            </p>
            <p className="text-xs text-[#786252] dark:text-stone-400 flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 shrink-0 opacity-70" />
              <span className="truncate">{temple.location}</span>
            </p>
          </div>
        </div>

        {/* Bottom row: Aarti session and standardized royal button */}
        <div className="border-t border-[#E8D8C4]/70 dark:border-stone-800 pt-3 flex items-center justify-between gap-2.5 mt-1 min-h-[58px]">
          <div className="min-w-0 flex-1 flex flex-col justify-center min-h-[44px]">
            <p className="text-[10px] uppercase font-bold text-[#786252] dark:text-stone-400 tracking-wider">
              {resolvedStatus === 'LIVE' ? (isHi ? 'चल रही आरती' : 'CURRENT AARTI') : (isHi ? 'अगली आरती' : 'NEXT AARTI')}
            </p>
            <p className="text-xs sm:text-sm font-bold text-[#3A2418] dark:text-amber-100 truncate">
              {displayAartiName || (temple.aartiSchedule.length > 0 ? `${temple.aartiSchedule.length} ${isHi ? 'दैनिक सत्र' : 'Daily Sessions'}` : (isHi ? 'विशेष अवसर' : 'Special Events'))}
            </p>
            {resolvedStatus !== 'LIVE' && displayMinutes !== undefined ? (
              <p className="text-[11px] text-[#651317] dark:text-amber-400 font-semibold truncate leading-tight">
                {isHi ? `शुरू होने में: ${formatMinutes(displayMinutes)}` : `Starts in: ${formatMinutes(displayMinutes)}`}
              </p>
            ) : (
              <p className="text-[11px] text-transparent select-none leading-tight" aria-hidden="true">
                —
              </p>
            )}
          </div>

          {/* Standard Royal Design-System Button */}
          {resolvedStatus === 'LIVE' ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              className="btn-royal-primary h-9 sm:h-10 px-3 sm:px-4 rounded-full text-xs font-bold gap-1.5 shrink-0 shadow-sm active:scale-95 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isHi ? 'दर्शन करें' : 'Watch Live'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              className="btn-royal-secondary h-9 sm:h-10 px-3 sm:px-4 rounded-full text-xs font-bold gap-1.5 shrink-0 bg-[#FFFDF8] dark:bg-stone-900 border-[#E8D8C4] dark:border-stone-700 text-[#651317] dark:text-amber-300 hover:bg-[#FAF2E8] dark:hover:bg-stone-800 shadow-2xs active:scale-95 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{isHi ? 'समय सारिणी' : 'Schedule'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
