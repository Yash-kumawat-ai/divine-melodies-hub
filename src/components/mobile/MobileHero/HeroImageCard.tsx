import { motion } from 'framer-motion';
import raghavamHero from '@/pages/images/raghavam-hero-high-quality.webp';
import { useLanguage } from '@/hooks/useLanguage';

export function HeroImageCard() {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  return (
    <div 
      className="relative w-full h-[195px] rounded-[24px] overflow-hidden bg-[#161008] border border-[#F3E2C8]/10 select-none"
      style={{
        boxShadow: '0 12px 35px rgba(0,0,0,0.10)'
      }}
    >
      {/* Deity Image covering the entire container as background */}
      <img
        src={raghavamHero}
        alt="Lord Ram Darbar"
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover object-[73%_center] z-0 pointer-events-none select-none brightness-[1.08] contrast-[1.03] saturate-[1.06]"
      />

      {/* Premium Cinematic double gradient overlay */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: `
            linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0) 100%),
            linear-gradient(90deg, rgba(22,16,8,0.82) 0%, rgba(22,16,8,0.60) 22%, rgba(22,16,8,0.28) 45%, rgba(22,16,8,0.08) 65%, transparent 82%)
          `
        }}
      />

      {/* Welcome Text in top left faded area */}
      <div 
        className="absolute left-[16px] top-1/2 -translate-y-1/2 z-20 max-w-[48%] flex flex-col justify-center text-left bg-gradient-to-br from-black/55 to-black/35 border border-[#F3E2C8]/15 rounded-[18px] p-3.5"
        style={{
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)'
        }}
      >
        <h2 
          className="font-serif font-black text-amber-50 leading-[1.25] select-text"
          style={{ fontSize: '18px' }}
        >
          {isHi ? "श्रीराम के चरणों में" : "At the Feet"}
        </h2>
        <div className="w-10 h-[1.5px] bg-gradient-to-r from-amber-400 to-transparent my-1.5" />
        <p 
          className="font-sans font-bold text-amber-300 tracking-wide select-text uppercase"
          style={{ fontSize: '11px' }}
        >
          {isHi ? "आपका स्वागत है" : "of Shri Rama"}
        </p>
      </div>
    </div>
  );
}
