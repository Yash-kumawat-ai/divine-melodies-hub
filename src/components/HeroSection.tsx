import { useNavigate } from 'react-router-dom'; 
import { Play, Music2, Users, Heart } from 'lucide-react'; 
import { motion } from 'framer-motion';

// Import images from src/pages/images
import krishnaMain from '@/pages/images/krishna main.webp';
import krishnaMobile from '@/pages/images/krishna_mobile_wallpaper.webp';
import panchangIcon from '@/pages/images/panchang_spiritual_icon.webp';
import meditationIcon from '@/pages/images/meditation_spiritual_icon.webp';
import templeIcon from '@/pages/images/temple_icon.webp';
import krishnaAIIcon from '@/pages/images/devrishi_narad_icon.webp';
import lyricsIcon from '@/pages/images/bhajan_lyrics_icon.webp';
import aartiIcon from '@/pages/images/live_aarti_icon.webp';

export function HeroSection() { 
  const navigate = useNavigate(); 

  const quickLinks = [ 
    { label: 'Panchang', icon: panchangIcon, path: '/panchang' }, 
    { label: 'Meditation', icon: meditationIcon, path: '/meditation' }, 
    { label: 'Temples', icon: templeIcon, path: '/temple' }, 
    { label: 'Krishna AI', icon: krishnaAIIcon, path: '/kirtan-ai' }, 
    { label: 'Lyrics', icon: lyricsIcon, path: '/all-bhajans' }, 
    { label: 'Aarti', icon: aartiIcon, path: '/aarti' }, 
  ]; 

  return ( 
    <section className="relative w-full h-[100svh] overflow-hidden flex flex-col"> 

      {/* FULL BLEED BACKGROUND IMAGE */} 
      <div className="absolute inset-0 z-0"> 
        <picture className="block w-full h-full">
          <source media="(min-width: 768px)" srcSet={krishnaMain} />
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "easeOut" }}
            src={krishnaMobile} 
            alt="Krishna" 
            className="w-full h-full object-cover object-[center_top] md:object-center" 
          />
        </picture>
        {/* Complex Gradients for maximum readability and depth */} 
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 hidden md:block" />
      </div> 

      {/* OVERLAY CONTENT — centered vertically in the upper 70% */} 
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 pt-16 pb-4 text-center"> 

        {/* Decorative subtitle */} 
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 mb-4"
        > 
          <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-400" /> 
          <p className="text-amber-300 text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase drop-shadow-md">Hare Krishna</p> 
          <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-400" /> 
        </motion.div> 

        {/* Main heading */} 
        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="text-white text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] max-w-4xl"
        > 
          Discover Divine Music 
        </motion.h1> 
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-amber-100/90 text-sm md:text-lg lg:text-xl mt-4 mb-10 tracking-[0.2em] font-light drop-shadow-md"
        > 
          — FOR EVERY MOMENT OF BHAKTI — 
        </motion.p> 

        {/* CTA Buttons */} 
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex gap-4 mb-12 flex-wrap justify-center"
        > 
          <button 
            onClick={() => navigate('/all-bhajans')} 
            className="group flex items-center gap-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 active:scale-95 text-white font-bold px-8 py-4 rounded-full shadow-[0_10px_30px_-10px_rgba(249,115,22,0.5)] transition-all duration-300"
          > 
            <Play className="w-5 h-5 fill-white stroke-none group-hover:scale-110 transition-transform" /> 
            <span className="text-base md:text-lg">Explore Bhajans</span>
          </button> 
        </motion.div> 

        {/* Stats Row */} 
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex items-center gap-4 md:gap-8 bg-black/50 backdrop-blur-xl rounded-3xl px-6 md:px-10 py-4 border border-white/10 shadow-2xl"
        > 
          <div className="flex flex-col md:flex-row items-center gap-1 md:gap-3"> 
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Music2 className="w-4 h-4 md:w-5 md:h-5 text-amber-400" /> 
            </div>
            <div className="text-center md:text-left">
              <p className="text-white font-bold text-sm md:text-lg leading-none">1,000+</p> 
              <p className="text-zinc-400 text-[9px] md:text-[11px] font-medium uppercase tracking-wider mt-1">Bhajans</p> 
            </div>
          </div> 
          <div className="w-px h-8 bg-white/10" /> 
          <div className="flex flex-col md:flex-row items-center gap-1 md:gap-3"> 
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-amber-400" /> 
            </div>
            <div className="text-center md:text-left">
              <p className="text-white font-bold text-sm md:text-lg leading-none">50+</p> 
              <p className="text-zinc-400 text-[9px] md:text-[11px] font-medium uppercase tracking-wider mt-1">Artists</p> 
            </div>
          </div> 
          <div className="w-px h-8 bg-white/10" /> 
          <div className="flex flex-col md:flex-row items-center gap-1 md:gap-3"> 
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Heart className="w-4 h-4 md:w-5 md:h-5 text-amber-400" /> 
            </div>
            <div className="text-center md:text-left">
              <p className="text-white font-bold text-sm md:text-lg leading-none">10K+</p> 
              <p className="text-zinc-400 text-[9px] md:text-[11px] font-medium uppercase tracking-wider mt-1">Devotees</p> 
            </div>
          </div> 
        </motion.div> 
      </div> 

      {/* BOTTOM ICON DOCK — pinned to bottom of section */} 
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="relative z-10 px-3 pb-6 pt-2 md:px-6 md:pb-8 max-w-4xl mx-auto w-full"
      > 
        <div className="rounded-[2rem] bg-black/25 backdrop-blur-2xl border border-white/10 px-3 py-4 md:px-6 md:py-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
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
