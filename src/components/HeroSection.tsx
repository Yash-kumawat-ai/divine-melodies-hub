import { useNavigate } from 'react-router-dom'; 
import { Play, Music2, Users, Heart, ChevronDown } from 'lucide-react'; 
import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';

// Import images from src/pages/images
import krishnaMain from '@/pages/images/krishna main.webp';
import krishnaMobile from '@/pages/images/krishna_mobile_wallpaper.webp';
import panchangIcon from '@/pages/images/panchang_spiritual_icon.webp';
import meditationIcon from '@/pages/images/meditation_spiritual_icon.webp';
import templeIcon from '@/pages/images/temple_icon.webp';
import krishnaAIIcon from '@/pages/images/devrishi_narad_icon.webp';
import lyricsIcon from '@/pages/images/bhajan_lyrics_icon.webp';
import aartiIcon from '@/pages/images/live_aarti_icon.webp';

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
  const japCount = 24000000; // 2.4 Cr Jap Count
  const devoteesCount = stats ? stats.devotees : 50000; 

  const quickLinks = [ 
    { label: isHi ? 'पंचांग' : 'Panchang', icon: panchangIcon, path: '/panchang' }, 
    { label: isHi ? 'ध्यान' : 'Meditation', icon: meditationIcon, path: '/meditation' }, 
    { label: isHi ? 'मंदिर' : 'Temples', icon: templeIcon, path: '/temple' }, 
    { label: isHi ? 'कृष्णा एआई' : 'Krishna AI', icon: krishnaAIIcon, path: '/kirtan-ai' }, 
    { label: isHi ? 'गीत' : 'Lyrics', icon: lyricsIcon, path: '/all-bhajans' }, 
    { label: isHi ? 'आरती' : 'Aarti', icon: aartiIcon, path: '/aarti' }, 
  ]; 

  const formatJapCount = (n: number) => {
    if (n >= 10000000) return `${(n / 10000000).toFixed(1)}Cr+`;
    if (n >= 100000) return `${(n / 100000).toFixed(1)}L+`;
    return n.toLocaleString() + '+';
  };

  return ( 
    <section className="hero-section relative w-full overflow-hidden flex flex-col" style={{ height: '90vh', minHeight: '600px' }}> 

      {/* FULL BLEED BACKGROUND IMAGE */} 
      <div className="absolute inset-0 z-0"> 
        <picture className="block w-full h-full">
          <source media="(min-width: 768px)" srcSet={krishnaMain} />
          <motion.img 
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "easeOut" }}
            src={krishnaMobile} 
            alt="Krishna" 
            className="w-full h-full object-cover object-[center_top] md:object-center" 
          />
        </picture>

        {/* Dark gradient behind text for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/95" />
      </div> 

      {/* HERO CONTENT — left-aligned on desktop, centered on mobile */}
      <div className="relative z-10 flex flex-col items-center md:items-start justify-start flex-1 px-4 md:px-12 lg:px-20 pt-8 md:pt-12 pb-2 text-center md:text-left max-w-5xl md:max-w-none"> 



        {/* 3. SATSANG • BHAJAN • SADHANA */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.8 }}
          className="text-amber-200/90 text-[10px] sm:text-xs tracking-[0.25em] sm:tracking-[0.35em] font-extrabold uppercase select-none text-center md:text-left mb-6 flex flex-wrap items-center justify-center md:justify-start gap-1.5 sm:gap-2.5 w-full"
          style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
        >
          <span>{isHi ? 'सत्संग' : 'SATSANG'}</span>
          <span className="text-amber-500 font-extrabold select-none">•</span>
          <span>{isHi ? 'भजन' : 'BHAJAN'}</span>
          <span className="text-amber-500 font-extrabold select-none">•</span>
          <span>{isHi ? 'साधना' : 'SADHANA'}</span>
        </motion.p>

        {/* Trust stats pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-6"
        >
          {[
            { label: isHi ? 'भजन' : 'Bhajans', value: `${bhajansCount >= 1000 ? Math.floor(bhajansCount/1000) + 'K+' : bhajansCount + '+'}` },
            { label: isHi ? 'जाप' : 'Jap Count', value: formatJapCount(japCount) },
            { label: isHi ? 'भक्त' : 'Devotees', value: `${devoteesCount >= 1000 ? Math.floor(devoteesCount/1000) + 'K+' : devoteesCount + '+'}` },
          ].map((stat) => (
            <span
              key={stat.label}
              className="inline-flex items-center gap-1.5 bg-black/45 backdrop-blur-md border border-white/10 rounded-full px-3.5 py-1.5 text-[10px] sm:text-xs font-semibold text-white/95 shadow-sm"
            >
              <span className="text-amber-400 font-bold">{stat.value}</span>
              <span className="text-white/60">{stat.label}</span>
            </span>
          ))}
        </motion.div>

        {/* CTA Buttons — primary + secondary hierarchy */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex gap-3 flex-wrap justify-center md:justify-start"
        > 

          <button 
            onClick={() => navigate('/all-bhajans')} 
            className="group flex items-center gap-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white font-bold px-7 py-3 rounded-full shadow-[0_8px_24px_-6px_rgba(249,115,22,0.55)] transition-all duration-300 text-sm md:text-base cursor-pointer"
          > 
            <Play className="w-4 h-4 fill-white stroke-none group-hover:scale-110 transition-transform" /> 
            {isHi ? 'भजन खोजें' : 'Explore Bhajans'}
          </button>

          {/* SECONDARY — transparent ghost style */}
          <button 
            onClick={() => navigate('/japa-counter')} 
            className="group flex items-center gap-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 hover:border-white/50 active:scale-95 text-white font-semibold px-7 py-3 rounded-full transition-all duration-300 text-sm md:text-base cursor-pointer"
          > 
            🧿 {isHi ? 'जाप शुरू करें' : 'Start Chanting'}
          </button>
        </motion.div>
      </div> 

      {/* SCROLL INDICATOR */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="relative z-10 flex justify-center pb-4 shrink-0"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-1 text-white/50 cursor-pointer select-none"
          onClick={() => window.scrollBy({ top: window.innerHeight * 0.6, behavior: 'smooth' })}
        >
          <ChevronDown className="w-6 h-6" strokeWidth={1.5} />
        </motion.div>
      </motion.div>

      {/* BOTTOM ICON DOCK */} 
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="relative z-10 px-3 pb-5 pt-1 md:px-6 md:pb-6 max-w-4xl mx-auto w-full"
      > 
        <div className="rounded-[2rem] bg-black/30 backdrop-blur-2xl border border-white/10 px-3 py-4 md:px-6 md:py-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
          <div className="flex items-start justify-between gap-1 sm:gap-2 md:gap-4"> 
            {quickLinks.map((item) => ( 
              <button 
                key={item.label} 
                onClick={() => navigate(item.path)} 
                className="group flex min-w-0 flex-1 flex-col items-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 rounded-xl" 
              > 
                <div className="relative shrink-0">
                  <div className="absolute -inset-[3px] rounded-full bg-gradient-to-b from-amber-300/50 via-amber-500/25 to-orange-600/40 opacity-0 blur-[2px] transition-all duration-300 group-hover:opacity-100" />
                  <div className="relative flex h-[3.25rem] w-[3.25rem] items-center justify-center overflow-hidden rounded-full border border-white/25 bg-gradient-to-b from-white/15 to-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all duration-300 group-hover:border-amber-300/50 group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_12px_28px_rgba(251,191,36,0.15)] group-active:scale-95 sm:h-[3.75rem] sm:w-[3.75rem] md:h-[4.25rem] md:w-[4.25rem]">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-amber-100/5" />
                    <img 
                      src={item.icon} 
                      alt={item.label} 
                      className="relative z-10 h-[88%] w-[88%] rounded-full object-cover object-center transition-transform duration-500 group-hover:scale-105" 
                    />
                  </div>
                </div>
                <span className="max-w-[4.5rem] text-center text-[7px] font-semibold uppercase leading-tight tracking-[0.08em] text-white/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] transition-colors group-hover:text-amber-200 sm:max-w-none sm:text-[9px] md:text-[10px] md:tracking-[0.12em]"> 
                  {item.label} 
                </span> 
              </button> 
            ))} 
          </div>
        </div>
      </motion.div>

    </section> 
  ); 
} 
