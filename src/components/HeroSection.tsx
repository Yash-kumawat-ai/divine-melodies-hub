import { useNavigate } from 'react-router-dom'; 
import { Play, Search } from 'lucide-react'; 
import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { useState } from 'react';

import raghavamHero from '@/pages/images/raghavam-hero-high-quality.webp';
import lordRamMobile from '@/pages/images/lord_ram_high_quality.webp';
import DailyDohaCard from '@/components/DailyDohaCard';

interface HeroSectionProps {
  stats?: {
    bhajans: number;
    artists: number;
    devotees: number;
  };
}

export function HeroSection({ stats }: HeroSectionProps) { 
  const navigate = useNavigate(); 
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const bhajansCount = stats ? stats.bhajans : 10000;
  const japCount = 24000000;
  const devoteesCount = stats ? stats.devotees : 50000; 

  const formatJapCount = (n: number) => {
    if (n >= 10000000) return `${(n / 10000000).toFixed(1)}Cr+`;
    if (n >= 100000) return `${(n / 100000).toFixed(1)}L+`;
    return n.toLocaleString() + '+';
  };

  return ( 
    <section className="hero-section relative w-full overflow-hidden flex flex-col h-[70vh] min-h-[440px] md:h-[820px] lg:h-[900px] md:pb-24"> 

      {/* FULL BLEED BACKGROUND IMAGE */} 
      <div className="absolute inset-0 z-0 bg-black"> 
        <picture className="block w-full h-full">
          <source media="(min-width: 768px)" srcSet={raghavamHero} />
          <motion.img 
            initial={{ scale: 1.02 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "easeOut" }}
            src={lordRamMobile} 
            alt="Raghavam — Devotional Music Platform" 
            className="w-full h-full object-cover object-top md:object-[center_0%]" 
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent via-40% to-transparent" />
        {/* Horizontal dark gradient overlay on desktop for left-aligned content readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 via-40% to-transparent hidden md:block" />
        <div className="absolute bottom-0 left-0 right-0 h-[50%] bg-gradient-to-t from-background via-background/85 via-45% to-transparent pointer-events-none" />
      </div>       {/* Mobile-only spacer to push content to the bottom of the poster on mobile */}
      <div className="flex-1 md:hidden" />

      {/* HERO CONTENT — positioned upper/middle area on desktop, bottom on mobile */}
      <div className="relative z-10 flex flex-col items-center md:items-start px-4 md:px-12 lg:px-20 pt-4 md:pt-20 lg:pt-24 pb-8 md:pb-16 w-full md:max-w-4xl text-center md:text-left">

        {/* Premium Welcome Heading */}
        <motion.h1 
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-200 to-amber-400 leading-tight mb-4 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] selection:bg-amber-500/30"
        >
          {isHi ? "श्रीराम के चरणों में आपका स्वागत है।" : "Welcome to the Feet of Shri Rama"}
        </motion.h1>

        {/* Decorative tag line */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="flex items-center justify-center md:justify-start gap-2.5 mb-3.5 md:mb-5 w-full md:w-auto"
        >
          <div className="h-px w-8 md:w-12 bg-gradient-to-r from-transparent to-amber-500/70" />
          <span
            className="text-amber-300 text-xs sm:text-sm md:text-base tracking-[0.35em] font-black uppercase select-none flex items-center gap-2"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.95)' }}
          >
            <span>{isHi ? 'सत्संग' : 'SATSANG'}</span>
            <span className="text-amber-500 text-[10px]">✦</span>
            <span>{isHi ? 'भजन' : 'BHAJAN'}</span>
            <span className="text-amber-500 text-[10px]">✦</span>
            <span>{isHi ? 'साधना' : 'SADHANA'}</span>
          </span>
          <div className="h-px w-8 md:w-12 bg-gradient-to-l from-transparent to-amber-500/70 hidden md:block" />
        </motion.div>

        {/* WHITE Search Bar */}
        <motion.div
          onClick={() => navigate('/search')}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.62 }}
          className="w-full max-w-sm sm:max-w-lg md:max-w-xl mb-5 md:mb-6 relative shrink-0 cursor-pointer md:mx-0 mx-auto"
        >
          <div className="relative flex items-center bg-white rounded-2xl shadow-[0_8px_48px_rgba(0,0,0,0.55)] hover:shadow-[0_12px_56px_rgba(0,0,0,0.65)] transition-all duration-300 group">
            <Search className="absolute left-4.5 text-amber-500 w-4.5 h-4.5 md:w-5.5 md:h-5.5 shrink-0 group-hover:text-amber-600 transition-colors" />
            <input
              type="text"
              readOnly
              placeholder={isHi ? "भजन, कीर्तन या कलाकार खोजें..." : "Search bhajans, kirtans or artists..."}
              className="w-full bg-transparent pl-12 pr-32 py-4 md:py-4.5 rounded-2xl text-sm md:text-base text-stone-700 placeholder:text-stone-400 focus:outline-none font-sans font-semibold tracking-wide cursor-pointer select-none"
            />
            <div className="absolute right-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl px-4 py-2 text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-1 shrink-0 shadow-md">
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isHi ? 'खोजें' : 'Search'}</span>
            </div>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.72 }}
          className="flex gap-3 flex-wrap justify-center md:justify-start w-full md:w-auto"
        > 
          <button 
            onClick={() => navigate('/all-bhajans')} 
            className="group flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white font-bold px-6 py-3 md:px-8 md:py-3.5 rounded-full shadow-[0_8px_24px_-6px_rgba(249,115,22,0.7)] transition-all duration-300 text-sm md:text-base cursor-pointer"
          > 
            <Play className="w-4.5 h-4.5 fill-white stroke-none group-hover:scale-110 transition-transform" /> 
            {isHi ? 'भजन खोजें' : 'Explore Bhajans'}
          </button>

          <button 
            onClick={() => navigate('/meditation?practice=mantra_jap_home')} 
            className="group flex items-center gap-2 bg-white/12 hover:bg-white/20 backdrop-blur-sm border border-white/30 hover:border-white/55 active:scale-95 text-white font-bold px-6 py-3 md:px-8 md:py-3.5 rounded-full transition-all duration-300 text-sm md:text-base cursor-pointer"
          > 
            🧿 {isHi ? 'जाप शुरू करें' : 'Start Chanting'}
          </button>
        </motion.div>

        {/* Daily Ram Vani Doha Card (desktop layout only) */}
        <DailyDohaCard />
      </div>

    </section> 
  ); 
} 
