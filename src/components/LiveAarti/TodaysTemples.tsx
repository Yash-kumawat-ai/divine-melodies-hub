import React from 'react';
import { Landmark, MapPin, Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Temple } from '../../types/liveAarti';
import { useLanguage } from '@/hooks/useLanguage';
import { resolveTempleBanner } from './templeBanners';

interface TodaysTemplesProps {
  temples: Temple[];
  onTempleClick: (temple: Temple) => void;
}

export default function TodaysTemples({ temples, onTempleClick }: TodaysTemplesProps) {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  if (temples.length === 0) return null;

  return (
    <div className="space-y-3.5">
      <div className="flex items-center gap-2 px-1">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <h2 className="text-lg sm:text-xl font-bold font-display text-[#3A2418] dark:text-amber-100 tracking-wide">
          {isHi ? "आज के विशेष शुभ मंदिर" : "Today's Auspicious Temples"}
        </h2>
      </div>

      <div className="flex gap-3.5 sm:gap-4 overflow-x-auto pb-3 pt-1 scrollbar-hide snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
        {temples.map((temple) => {
          const title = isHi ? temple.nameHindi : temple.name;
          const deityText = isHi ? temple.deityHindi : temple.deity;

          return (
            <motion.div
              key={temple.id}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              onClick={() => onTempleClick(temple)}
              className="flex-shrink-0 w-64 sm:w-72 snap-start overflow-hidden rounded-2xl border border-[#E8D8C4] dark:border-stone-800 bg-[#FFFDF8] dark:bg-[#140d08] hover:border-[#651317]/40 dark:hover:border-amber-400/40 p-3.5 sm:p-4 transition-all duration-300 relative cursor-pointer flex flex-col justify-between group shadow-2xs hover:shadow-md text-left"
            >
              {/* Highlight colored bar */}
              <div 
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: temple.accentColor || '#651317' }}
              />

              <div className="space-y-2.5">
                {/* Temple image thumbnail */}
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-950/60 border border-[#E8D8C4]/60 dark:border-stone-800/80 mb-1">
                  <img
                    src={resolveTempleBanner(temple.id)}
                    alt={title}
                    width={400}
                    height={250}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="absolute top-2 left-2 z-10">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-[#651317] dark:text-amber-300 bg-[#FFFDF8]/95 dark:bg-stone-900/90 backdrop-blur-xs px-2 py-0.5 rounded-full border border-[#E8D8C4] dark:border-stone-700 shadow-2xs">
                      {temple.category}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-bold text-[#3A2418] dark:text-amber-100 text-sm sm:text-base truncate leading-tight group-hover:text-[#651317] dark:group-hover:text-amber-300 transition-colors">
                    {title}
                  </h3>
                  <p className="text-xs text-[#651317] dark:text-amber-400 font-semibold truncate flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5 shrink-0 opacity-80" />
                    <span className="truncate">{deityText}</span>
                  </p>
                  <p className="text-[11px] text-[#786252] dark:text-stone-400 truncate flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    <span className="truncate">{temple.location}</span>
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#E8D8C4]/60 dark:border-stone-800/80 flex items-center justify-between text-xs font-bold text-[#651317] dark:text-amber-300">
                <span>{isHi ? 'दर्शन एवं आरती' : 'Darshan & Aarti'}</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
