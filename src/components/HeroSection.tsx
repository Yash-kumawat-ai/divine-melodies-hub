import { useNavigate } from 'react-router-dom'; 
import { Play, Search, Mic } from 'lucide-react'; 
import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import SearchBar from '@/components/SearchBar';

import raghavamHero from '@/pages/images/raghavam-hero-high-quality.webp';
import lordRamMobile from '@/pages/images/lord_ram_high_quality.webp';
import DailyDohaCard from '@/components/DailyDohaCard';

// Import mobile-specific components
import { HeroImageCard, SearchCard, ActionButtons, RamMarquee, RamVaniCard } from '@/components/mobile/MobileHero';

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

  return ( 
    <section className="hero-section w-full px-4 sm:px-6 md:px-8 lg:px-10 pt-3.5 pb-1 md:py-8 bg-[#FFFDF8] dark:bg-background md:bg-background"> 
      
      {/* ── MOBILE HERO REDESIGN (max-width: 768px) ── */}
      <div className="md:hidden flex flex-col w-full text-left">
        <HeroImageCard />
        
        {/* Unified Search & Action Buttons Panel */}
        <div className="w-full mt-3.5 p-3.5 rounded-[24px] bg-[#FFFDF8] dark:bg-[#1A1108] border border-[#E8D8C4] dark:border-zinc-800/80 shadow-[0_6px_14px_rgba(74,14,18,0.04)] flex flex-col gap-3">
          <SearchCard />
          <ActionButtons />
        </div>

        <RamMarquee />
        <RamVaniCard />
      </div>

      {/* ── UNTOUCHED DESKTOP/TABLET LAYOUT (min-width: 768px) ── */}
      <div className="hidden md:flex relative w-full overflow-hidden rounded-[32px] md:h-[620px] lg:h-[700px] flex-col justify-center p-16 lg:p-20 shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.5)] border border-orange-200/30 dark:border-zinc-800/60">
        
        {/* BACKGROUND IMAGE CONTAINED INSIDE BOX */} 
        <div className="absolute inset-0 z-0 bg-stone-950"> 
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
        </div>

        {/* HERO CONTENT */}
        <div className="relative z-10 flex flex-col items-start w-full md:max-w-2xl text-left">

          {/* Gold Lotus Divider */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex items-center gap-3 mb-4 select-none justify-start w-full"
          >
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-500/60" />
            <span className="text-amber-600">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3a3 3 0 0 0-3 3c0 2 3 5 3 5s3-3 3-3a3 3 0 0 0-3-3Zm-1.5 8.5c-2.5-1-4-3-4-3s1 3.5-4 4.5Zm3 0c2.5-1 4-3 4-3s-1 3.5-4 4.5ZM12 14c-1.5 2-4.5 3.5-7 4.5 3.5 1 7 .5 7 .5s3.5.5 7-.5c-2.5-1-5.5-2.5-7-4.5Z" />
              </svg>
            </span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-500/60" />
          </motion.div>

          {/* Premium Welcome Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-serif text-3xl md:text-5xl lg:text-[54px] font-black text-[#5C1D0C] dark:text-[#FFFDF8] leading-[1.2] mb-5 select-text tracking-wide"
          >
            {isHi ? (
              <>
                श्रीराम के चरणों में
                <br />
                आपका स्वागत है।
              </>
            ) : (
              <>
                Welcome to the Feet
                <br />
                of Shri Rama
              </>
            )}
          </motion.h1>

          {/* Decorative tag line */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="flex items-center justify-start gap-3.5 mb-8 text-[#786252] dark:text-stone-300 select-none text-[13px] md:text-[15px] font-bold uppercase tracking-[0.2em]"
          >
            <span>{isHi ? 'सत्संग' : 'Satsang'}</span>
            <span className="text-amber-600 text-[10px]">✦</span>
            <span>{isHi ? 'भजन' : 'Bhajan'}</span>
            <span className="text-amber-600 text-[10px]">✦</span>
            <span>{isHi ? 'साधना' : 'Sadhana'}</span>
            <span className="text-amber-600 text-[10px]">✦</span>
            <span>{isHi ? 'सेवा' : 'Seva'}</span>
          </motion.div>

          {/* WHITE Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.62 }}
            className="w-full max-w-sm sm:max-w-lg md:max-w-xl mb-6 relative shrink-0 text-left cursor-pointer"
          >
            <SearchBar readOnly onClick={() => navigate('/search')} />
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.72 }}
            className="flex gap-3 flex-wrap justify-start w-auto"
          > 
            <button 
              onClick={() => navigate('/all-bhajans')} 
              className="group flex items-center gap-2 bg-[#651317] hover:bg-[#5C1115] active:scale-95 text-[#FFF9F2] font-bold px-8 py-3.5 rounded-full shadow-[0_6px_14px_rgba(74,14,18,0.14)] transition-all duration-300 text-sm md:text-base cursor-pointer"
            > 
              <Play className="w-4.5 h-4.5 fill-white stroke-none group-hover:scale-110 transition-transform text-[#FFF9F2]" /> 
              {isHi ? 'भजन खोजें' : 'Explore Bhajans'}
            </button>

            <button 
              onClick={() => navigate('/meditation?practice=mantra_jap_home')} 
              className="group flex items-center gap-2 bg-[#FFFDF8] hover:bg-[#FFF9F2] border border-[#E8D8C4] active:scale-95 text-[#651317] font-bold px-8 py-3.5 rounded-full shadow-[0_6px_14px_rgba(74,14,18,0.04)] transition-all duration-300 text-sm md:text-base cursor-pointer"
            > 
              🧿 {isHi ? 'जाप शुरू करें' : 'Start Chanting'}
            </button>
          </motion.div>

          {/* Daily Ram Vani Doha Card */}
          <DailyDohaCard />
        </div>
      </div>
    </section> 
  ); 
}
