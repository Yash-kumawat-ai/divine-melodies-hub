import React from 'react';
import { Landmark, MapPin, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Temple } from '../../types/liveAarti';
import { useLanguage } from '@/hooks/useLanguage';

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
        <h2 className="text-lg font-bold font-display text-white tracking-wide">
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
              className="flex-shrink-0 w-72 snap-start overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] p-4 transition-all duration-300 relative cursor-pointer flex flex-col justify-between"
            >
              {/* Highlight colored bar */}
              <div 
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: temple.accentColor || '#f97316' }}
              />

              <div className="space-y-2">
                <span className="text-[9px] uppercase font-bold tracking-wider text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full inline-block">
                  {temple.category}
                </span>
                
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-base truncate leading-tight">
                    {title}
                  </h3>
                  <p className="text-xs text-amber-100/70 truncate flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5 text-orange-500/60" />
                    <span>{deityText}</span>
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500" />
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
