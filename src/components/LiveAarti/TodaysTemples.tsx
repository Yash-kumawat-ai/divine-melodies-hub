import React from 'react';
import { Landmark, MapPin, Sparkles } from 'lucide-react';
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
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Sparkles className="w-4 h-4 text-orange-400" />
        <h2 className="text-lg font-bold font-display text-[#543D2B] dark:text-white tracking-wide">
          {isHi ? "आज के शुभ मंदिर" : "Today's Auspicious Temples"}
        </h2>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-hide snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
        {temples.map((temple) => {
          const title = isHi ? temple.nameHindi : temple.name;
          const deityText = isHi ? temple.deityHindi : temple.deity;

          return (
            <motion.div
              key={temple.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onTempleClick(temple)}
              className="flex-shrink-0 w-72 snap-start overflow-hidden rounded-2xl border border-[#EAD7C3] dark:border-white/5 bg-white/60 dark:bg-white/[0.02] hover:bg-white/90 dark:hover:bg-white/[0.04] p-4 transition-all duration-300 relative cursor-pointer flex flex-col justify-between group shadow-sm dark:shadow-md"
            >
              {/* Highlight colored bar */}
              <div 
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: temple.accentColor || '#f97316' }}
              />

              <div className="space-y-2">
                {/* Temple image thumbnail */}
                <div className="relative h-28 w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-950/40 border border-[#EAD7C3]/50 dark:border-white/5 mb-1.5">
                  <img
                    src={resolveTempleBanner(temple.id)}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85 group-hover:opacity-100"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <span className="text-[9px] uppercase font-bold tracking-wider text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full inline-block">
                  {temple.category}
                </span>
                
                <div className="space-y-1">
                  <h3 className="font-bold text-[#543D2B] dark:text-white text-base truncate leading-tight group-hover:text-[#E06D14] dark:group-hover:text-amber-100 transition-colors">
                    {title}
                  </h3>
                  <p className="text-xs text-[#E06D14] dark:text-amber-100/70 truncate flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5 text-orange-500/60" />
                    <span>{deityText}</span>
                  </p>
                  <p className="text-[10px] text-[#543D2B]/60 dark:text-zinc-400 truncate flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#543D2B]/40 dark:text-zinc-500" />
                    <span>{temple.location}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
