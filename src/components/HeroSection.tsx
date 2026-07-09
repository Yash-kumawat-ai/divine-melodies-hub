import { useNavigate } from 'react-router-dom'; 
import { Play, Search, Mic } from 'lucide-react'; 
import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';

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
    <section className="hero-section w-full px-4 sm:px-6 md:px-8 lg:px-10 py-4 md:py-8 bg-[#FFF9F3] dark:bg-background md:bg-background"> 
      
      {/* ── MOBILE HERO REDESIGN (max-width: 768px) ── */}
      <div className="md:hidden flex flex-col w-full text-left">
        <HeroImageCard />
        <SearchCard />
        <ActionButtons />
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
          
          {/* Desktop horizontal gradient overlay for left-aligned content readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 via-45% to-transparent" />
          
          {/* Subtle top shadow */}
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />
        </div>

        {/* HERO CONTENT */}
        <div className="relative z-10 flex flex-col items-start w-full md:max-w-2xl text-left">

          {/* Premium Welcome Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-serif text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-200 to-amber-400 leading-tight mb-4 drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)] selection:bg-amber-500/30"
          >
            {isHi ? "श्रीराम के चरणों में आपका स्वागत है।" : "Welcome to the Feet of Shri Rama"}
          </motion.h1>

          {/* Decorative tag line */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="flex items-center justify-start gap-2.5 mb-5 w-auto"
          >
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500/70" />
            <span
              className="text-amber-300 text-sm md:text-base tracking-[0.35em] font-black uppercase select-none flex items-center gap-2"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.95)' }}
            >
              <span>{isHi ? 'सत्संग' : 'SATSANG'}</span>
              <span className="text-amber-500 text-[10px]">✦</span>
              <span>{isHi ? 'भजन' : 'BHAJAN'}</span>
              <span className="text-amber-500 text-[10px]">✦</span>
              <span>{isHi ? 'साधना' : 'SADHANA'}</span>
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500/70" />
          </motion.div>

          {/* WHITE Search Bar */}
          <motion.div
            onClick={() => navigate('/search')}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.62 }}
            className="w-full max-w-sm sm:max-w-lg md:max-w-xl mb-6 relative shrink-0 cursor-pointer text-left"
          >
            <div className="relative flex items-center bg-white dark:bg-[#1E1710] border border-orange-200/50 dark:border-zinc-800/80 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 p-1.5 pl-6 pr-2">
              <Search className="w-5 h-5 text-[#FF6A00] shrink-0 mr-3 select-none" />
              <input
                type="text"
                readOnly
                placeholder={isHi ? "भजन, कीर्तन या कलाकार खोजें..." : "Search bhajans, kirtans or artists..."}
                className="w-full bg-transparent border-0 outline-none focus:outline-none focus:ring-0 text-stone-700 dark:text-foreground text-sm md:text-base placeholder:text-stone-400 dark:placeholder:text-muted-foreground/60 py-2 md:py-2.5 cursor-pointer select-none"
              />
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#FF6A00] text-white shadow-sm shrink-0">
                <Mic className="h-5 w-5" />
              </div>
            </div>
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
              className="group flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white font-bold px-8 py-3.5 rounded-full shadow-[0_8px_24px_-6px_rgba(249,115,22,0.7)] transition-all duration-300 text-sm md:text-base cursor-pointer"
            > 
              <Play className="w-4.5 h-4.5 fill-white stroke-none group-hover:scale-110 transition-transform" /> 
              {isHi ? 'भजन खोजें' : 'Explore Bhajans'}
            </button>

            <button 
              onClick={() => navigate('/meditation?practice=mantra_jap_home')} 
              className="group flex items-center gap-2 bg-white/12 hover:bg-white/20 backdrop-blur-sm border border-white/30 hover:border-white/55 active:scale-95 text-white font-bold px-8 py-3.5 rounded-full transition-all duration-300 text-sm md:text-base cursor-pointer"
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
