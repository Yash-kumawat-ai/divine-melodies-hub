import { useState, useEffect } from 'react';
import { Play, Clock, Radio } from 'lucide-react';
import type { Temple } from '@/types/liveAarti';
import { useLanguage } from '@/hooks/useLanguage';
import { getTempleEmbedUrl } from '@/lib/liveAartiEmbed';
import { resolveTempleBanner } from './templeBanners';
import LiveBadge from './LiveBadge';

interface LiveAartiHeroProps {
  temple: Temple;
  liveTemples: Temple[];
  onSelectTemple: (temple: Temple) => void;
  onOpenDetails: (temple: Temple) => void;
}

export default function LiveAartiHero({
  temple,
  liveTemples,
  onSelectTemple,
  onOpenDetails,
}: LiveAartiHeroProps) {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const title = isHi ? temple.nameHindi : temple.name;
  const deityText = isHi ? temple.deityHindi : temple.deity;
  const embedUrl = getTempleEmbedUrl(temple);
  const [isPlaying, setIsPlaying] = useState(false);

  // Reset isPlaying when selected temple changes
  useEffect(() => {
    setIsPlaying(false);
  }, [temple.id]);

  const thumbnailSrc = temple.videoId 
    ? `https://i.ytimg.com/vi/${temple.videoId}/hqdefault.jpg`
    : resolveTempleBanner(temple.id);

  return (
    <section className="space-y-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
          </span>
          <h2 className="text-lg sm:text-xl font-bold font-display text-[#3A2418] dark:text-amber-100 tracking-wide">
            {isHi ? 'लाइव दर्शन प्रसारण' : 'Live Darshan Broadcast'}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => onOpenDetails(temple)}
          className="btn-royal-secondary h-8 px-3 rounded-full text-xs font-bold gap-1.5 shrink-0 bg-[#FFFDF8] dark:bg-stone-900 border-[#E8D8C4] dark:border-stone-700 text-[#651317] dark:text-amber-300 active:scale-95 cursor-pointer shadow-2xs"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{isHi ? 'समय सारिणी' : 'Schedule'}</span>
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-[#E8D8C4] dark:border-stone-800 bg-black shadow-md">
        <div className="relative aspect-video w-full">
          {isPlaying && embedUrl ? (
            <iframe
              src={embedUrl}
              title={`${temple.name} Live Stream`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          ) : (
            <div
              onClick={() => {
                if (embedUrl) {
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
                fetchpriority="high"
                decoding="async"
                className="h-full w-full object-cover opacity-85 group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/20" />
              
              {/* Centered Play Button Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#651317] hover:bg-[#80181D] text-white shadow-xl transition-all group-hover:scale-110 border-2 border-amber-400/60 cursor-pointer">
                  <Play className="ml-1 h-7 w-7 fill-white stroke-none" />
                </span>
                <span className="text-xs sm:text-sm font-bold bg-black/60 px-4 py-1.5 rounded-full backdrop-blur-xs border border-white/15 shadow-sm">
                  {isHi ? 'लाइव दर्शन शुरू करने के लिए क्लिक करें' : 'Click to Watch Live Darshan'}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 bg-[#FFFDF8] dark:bg-[#140d08] border-t border-[#E8D8C4] dark:border-stone-800 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate font-display text-base sm:text-lg font-bold text-[#3A2418] dark:text-amber-100">
              {title}
            </p>
            <p className="text-xs text-[#786252] dark:text-stone-400 font-medium truncate">
              {deityText} • {temple.location}
            </p>
          </div>
          <div className="shrink-0">
            {temple.status === 'LIVE' ? (
              <LiveBadge />
            ) : (
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#651317] dark:text-amber-300 bg-[#651317]/10 dark:bg-amber-400/15 border border-[#651317]/20 dark:border-amber-400/30 px-2.5 py-1 rounded-full">
                {temple.category}
              </span>
            )}
          </div>
        </div>
      </div>

      {liveTemples.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {liveTemples.map((t) => {
            const name = isHi ? t.nameHindi : t.name;
            const active = t.id === temple.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelectTemple(t)}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95 ${
                  active
                    ? 'border-[#651317] bg-[#651317] text-white dark:border-amber-400 dark:bg-amber-500 dark:text-stone-950 shadow-xs'
                    : 'border-[#E8D8C4] dark:border-stone-700 bg-[#FFFDF8] dark:bg-stone-900 text-[#543D2B] dark:text-stone-300 hover:bg-[#FAF2E8] dark:hover:bg-stone-800'
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
