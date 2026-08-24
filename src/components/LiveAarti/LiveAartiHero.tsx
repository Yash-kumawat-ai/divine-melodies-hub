import React, { useState, useEffect } from 'react';
import { Play, Clock, Square, AlertCircle, Sparkles, Flame, Eye } from 'lucide-react';
import type { Temple } from '@/types/liveAarti';
import { useLanguage } from '@/hooks/useLanguage';
import { getTempleEmbedUrl } from '@/lib/liveAartiEmbed';
import { resolveTempleBanner } from './templeBanners';
import LiveBadge from './LiveBadge';
import CountdownTimer from './CountdownTimer';

interface LiveAartiHeroProps {
  temple: Temple;
  liveTemples: Temple[];
  onSelectTemple: (temple: Temple) => void;
  onOpenDetails: (temple: Temple) => void;
  isModalOpen?: boolean;
  isLive?: boolean;
  nextAartiData?: { aarti: any; minutesUntilStart: number } | null;
}

export default function LiveAartiHero({
  temple,
  liveTemples,
  onSelectTemple,
  onOpenDetails,
  isModalOpen = false,
  isLive = false,
  nextAartiData = null,
}: LiveAartiHeroProps) {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const title = isHi ? temple.nameHindi : temple.name;
  const deityText = isHi ? temple.deityHindi : temple.deity;
  const embedUrl = getTempleEmbedUrl(temple);
  const [isPlaying, setIsPlaying] = useState(false);

  // Stop background playback when modal opens or selected temple changes
  useEffect(() => {
    if (isModalOpen) {
      setIsPlaying(false);
    }
  }, [isModalOpen]);

  useEffect(() => {
    setIsPlaying(false);
  }, [temple.id]);

  const handleStopStream = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsPlaying(false);
  };

  const thumbnailSrc = temple.videoId
    ? `https://i.ytimg.com/vi/${temple.videoId}/hqdefault.jpg`
    : resolveTempleBanner(temple.id);

  const nextAartiName = nextAartiData?.aarti
    ? (isHi ? (nextAartiData.aarti.nameHindi || nextAartiData.aarti.name) : nextAartiData.aarti.name)
    : null;

  return (
    <section className="space-y-3.5">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {isLive ? (
            <>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
              </span>
              <h2 className="text-lg sm:text-xl font-bold font-display text-[#3A2418] dark:text-amber-100 tracking-wide">
                {isHi ? 'लाइव दर्शन प्रसारण' : 'Live Darshan Broadcast'}
              </h2>
            </>
          ) : (
            <>
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500 ring-4 ring-amber-500/20" />
              <h2 className="text-lg sm:text-xl font-bold font-display text-[#3A2418] dark:text-amber-100 tracking-wide">
                {isHi ? 'आगामी लाइव आरती' : 'Next Scheduled Aarti'}
              </h2>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isPlaying && (
            <button
              type="button"
              onClick={handleStopStream}
              className="flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-all active:scale-95 cursor-pointer animate-pulse"
              aria-label={isHi ? 'स्ट्रीम रोकें' : 'Stop Stream'}
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>{isHi ? 'वीडियो रोकें' : 'Stop Video'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenDetails(temple)}
            className="btn-royal-secondary h-8 px-3 rounded-full text-xs font-bold gap-1.5 shrink-0 bg-[#FFFDF8] dark:bg-stone-900 border-[#E8D8C4] dark:border-stone-700 text-[#651317] dark:text-amber-300 active:scale-95 cursor-pointer shadow-2xs"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{isHi ? 'समय सारिणी' : 'Schedule'}</span>
          </button>
        </div>
      </div>

      {/* Main Video / Banner Frame */}
      <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-[#E8D8C4] dark:border-stone-800 bg-black shadow-md relative">
        <div className="relative aspect-video w-full">
          {isPlaying && embedUrl ? (
            <div className="relative h-full w-full">
              <iframe
                src={embedUrl}
                title={`${temple.name} Live Stream`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
              {/* Floating Top-Right Stop Button Overlay */}
              <div className="absolute top-3 right-3 z-30 pointer-events-auto">
                <button
                  type="button"
                  onClick={handleStopStream}
                  className="flex items-center gap-1.5 bg-black/85 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md border border-white/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
                  title={isHi ? 'वीडियो बंद करें' : 'Close / Stop Stream'}
                >
                  <Square className="w-3.5 h-3.5 fill-white stroke-none" />
                  <span>{isHi ? 'स्ट्रीम बंद करें' : 'Stop Stream'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => {
                if (temple.videoId) {
                  setIsPlaying(true);
                } else {
                  window.open(temple.fallbackLiveUrl, '_blank', 'noopener,noreferrer');
                }
              }}
              className="absolute inset-0 cursor-pointer group"
            >
              <img
                src={thumbnailSrc}
                alt={title}
                width={800}
                height={450}
                loading="eager"
                decoding="async"
                className="h-full w-full object-cover opacity-85 group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30" />

              {/* Center Content Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3.5 text-white p-4 text-center">
                {isLive ? (
                  <>
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#651317] hover:bg-[#80181D] text-white shadow-xl transition-all group-hover:scale-110 border-2 border-amber-400/60 cursor-pointer">
                      <Play className="ml-1 h-7 w-7 fill-white stroke-none" />
                    </span>
                    <span className="text-xs sm:text-sm font-bold bg-black/70 px-4 py-1.5 rounded-full backdrop-blur-xs border border-white/20 shadow-sm inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                      {temple.videoId
                        ? (isHi ? 'लाइव दर्शन शुरू करने के लिए क्लिक करें' : 'Click to Watch Live Darshan')
                        : (isHi ? 'यूट्यूब पर लाइव देखें' : 'Watch on YouTube Live')}
                    </span>
                  </>
                ) : (
                  <>
                    {/* Non-Live / Upcoming Aarti State */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold backdrop-blur-sm shadow-xs">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {isHi ? 'इस समय कोई आरती लाइव नहीं है' : 'No Aarti Live Right Now'}
                      </span>
                    </div>

                    {nextAartiData && (
                      <div className="flex flex-col items-center gap-1.5 my-1">
                        <span className="text-lg sm:text-2xl font-bold font-display text-amber-100">
                          {nextAartiName} ({nextAartiData.aarti?.time} IST)
                        </span>
                        <CountdownTimer
                          minutes={nextAartiData.minutesUntilStart}
                          label={isHi ? 'शुरू होगी:' : 'Starts in:'}
                          className="text-xs sm:text-sm py-1 px-3 bg-amber-400/20 border-amber-400/40 text-amber-200"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2.5 mt-1">
                      <span className="flex items-center gap-1.5 text-xs font-bold bg-[#651317] hover:bg-[#80181D] text-white px-4 py-2 rounded-full border border-amber-400/40 shadow-sm transition-all group-hover:scale-105">
                        <Play className="h-3.5 w-3.5 fill-white stroke-none" />
                        <span>{isHi ? 'पिछला रिकॉर्डेड दर्शन देखें' : 'Watch Recent Darshan'}</span>
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Metadata Bar */}
        <div className="flex items-center justify-between gap-3 bg-[#FFFDF8] dark:bg-[#140d08] border-t border-[#E8D8C4] dark:border-stone-800 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate font-display text-base sm:text-lg font-bold text-[#3A2418] dark:text-amber-100">
              {title}
            </p>
            <p className="text-xs text-[#786252] dark:text-stone-400 font-medium truncate">
              {deityText} • {temple.location}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isLive ? (
              <LiveBadge />
            ) : nextAartiData ? (
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 dark:bg-amber-400/15 border border-amber-500/25 dark:border-amber-400/30 px-2.5 py-1 rounded-full">
                {nextAartiName ? `${nextAartiName} (${nextAartiData.aarti?.time})` : temple.category}
              </span>
            ) : (
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#651317] dark:text-amber-300 bg-[#651317]/10 dark:bg-amber-400/15 border border-[#651317]/20 dark:border-amber-400/30 px-2.5 py-1 rounded-full">
                {temple.category}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Live Channels Switcher (Shown if multiple live channels exist) */}
      {liveTemples.length > 1 && (
        <div className="space-y-1.5">
          <p className="text-xs font-bold text-[#786252] dark:text-stone-400 px-0.5">
            {isHi ? 'अन्य सक्रिय लाइव प्रसारण:' : 'Other Active Live Streams:'}
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {liveTemples.map((t) => {
              const name = isHi ? t.nameHindi : t.name;
              const active = t.id === temple.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSelectTemple(t)}
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95 inline-flex items-center gap-1.5 ${
                    active
                      ? 'border-[#651317] bg-[#651317] text-white dark:border-amber-400 dark:bg-amber-500 dark:text-stone-950 shadow-xs'
                      : 'border-[#E8D8C4] dark:border-stone-700 bg-[#FFFDF8] dark:bg-stone-900 text-[#543D2B] dark:text-stone-300 hover:bg-[#FAF2E8] dark:hover:bg-stone-800'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span>{name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
