import React from 'react';
import { Play, MapPin, Landmark } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Temple } from '../../types/liveAarti';
import LiveBadge from './LiveBadge';
import CountdownTimer from './CountdownTimer';
import { useLanguage } from '@/hooks/useLanguage';
import { getNextAarti, formatVerifiedTime } from '../../hooks/useLiveAarti';

interface TempleCardProps {
  temple: Temple;
  status?: 'live' | 'starting-soon' | 'upcoming';
  aartiName?: string;
  aartiNameHindi?: string;
  minutesUntilStart?: number;
  minutesUntilEnd?: number;
  onClick: () => void;
}

export default function TempleCard({
  temple,
  status,
  aartiName,
  aartiNameHindi,
  minutesUntilStart,
  minutesUntilEnd,
  onClick
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
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="relative cursor-pointer overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] p-5 md:p-6 transition-all duration-300 group shadow-lg flex flex-col justify-between"
    >
      {/* Decorative colored glow on top edge */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 transition-opacity group-hover:opacity-100 opacity-60"
        style={{ backgroundColor: temple.accentColor || '#f97316' }}
      />

      <div className="flex flex-col gap-4 justify-between h-full">
        <div className="space-y-3">
          {/* Header row: Category and status badge */}
          <div className="flex items-start justify-between gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-full">
              {temple.category}
            </span>
            <div className="flex flex-col items-end gap-1.5">
              {/* Status Badge */}
              {resolvedStatus === 'LIVE' && <LiveBadge />}
              
              {resolvedStatus === 'UPCOMING' && displayMinutes !== undefined && (
                <CountdownTimer 
                  minutes={displayMinutes} 
                  label={displayMinutes <= 30 ? (isHi ? "शुरू होने वाला है:" : "Starts in") : (isHi ? "आगामी:" : "Upcoming in")} 
                />
              )}

              {resolvedStatus === 'OFFLINE' && (
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-500/10 border border-zinc-500/30 text-zinc-400 text-[10px] font-extrabold tracking-wider uppercase">
                  <span className="w-1 h-1 rounded-full bg-zinc-500 animate-pulse" />
                  <span>{isHi ? "ऑफ़लाइन" : "OFFLINE"}</span>
                </div>
              )}

              {resolvedStatus === 'STREAM_UNAVAILABLE' && (
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-[10px] font-extrabold tracking-wider uppercase">
                  <span>{isHi ? "अवरुद्ध" : "BLOCKED"}</span>
                </div>
              )}

              {/* Verified text */}
              {temple.lastVerifiedAt && (
                <span className="text-[9px] text-zinc-500 font-medium leading-none">
                  {formatVerifiedTime(temple.lastVerifiedAt, isHi)}
                </span>
              )}
            </div>
          </div>

          {/* Temple details */}
          <div className="space-y-1">
            <h3 className="text-lg md:text-xl font-bold font-display text-white group-hover:text-amber-100 transition-colors leading-tight">
              {title}
            </h3>
            <p className="text-sm text-amber-100/75 font-medium flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-orange-500/60" />
              <span>{deityText}</span>
            </p>
            <p className="text-xs text-zinc-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-zinc-500" />
              <span>{temple.location}</span>
            </p>
          </div>
        </div>

        {/* Bottom row: Aarti session or default info */}
        <div className="border-t border-white/5 pt-4 flex items-center justify-between gap-3 mt-2">
          {displayAartiName ? (
            <div className="space-y-0.5 min-w-0 flex-1">
              <p className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">
                {resolvedStatus === 'LIVE' ? (isHi ? 'चल रही आरती' : 'CURRENT AARTI') : (isHi ? 'अगली आरती' : 'NEXT AARTI')}
              </p>
              <p className="text-sm font-semibold text-amber-100 truncate">
                {displayAartiName}
              </p>
              {resolvedStatus !== 'LIVE' && displayMinutes !== undefined && (
                <p className="text-xs text-zinc-400 font-medium mt-0.5">
                  {isHi ? `शुरू होने में: ${formatMinutes(displayMinutes)}` : `Starts in: ${formatMinutes(displayMinutes)}`}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-0.5 min-w-0">
              <p className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">
                {isHi ? 'दैनिक आरतियां' : 'DAILY AARTIS'}
              </p>
              <p className="text-xs font-semibold text-zinc-400">
                {temple.aartiSchedule.length > 0 
                  ? `${temple.aartiSchedule.length} ${isHi ? 'सत्र प्रतिदिन' : 'sessions daily'}` 
                  : (isHi ? 'विशेष अवसरों पर' : 'Special occasions')}
              </p>
            </div>
          )}

          {/* Play/Join Button */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-amber-600 group-hover:from-orange-600 group-hover:to-amber-700 text-white shadow-md transition-all duration-300"
          >
            <Play className="w-4 h-4 fill-white stroke-none ml-0.5" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
