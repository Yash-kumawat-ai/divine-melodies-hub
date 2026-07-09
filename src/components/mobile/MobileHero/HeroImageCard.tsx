import { motion } from 'framer-motion';
import lordRamMobile from '@/pages/images/lord_ram_high_quality.webp';
import { useLanguage } from '@/hooks/useLanguage';

export function HeroImageCard() {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  return (
    <div 
      className="relative w-full h-[260px] rounded-[24px] overflow-hidden bg-[#161008] border border-[#F3E2C8]/10 select-none"
      style={{
        boxShadow: '0 12px 35px rgba(0,0,0,0.10)'
      }}
    >
      {/* Deity Image covering the entire container as background */}
      <img
        src={lordRamMobile}
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
      <div className="absolute top-[22px] left-[20px] z-20 max-w-[45%] flex flex-col justify-start text-left">
        <h2 
          className="font-serif font-bold text-amber-100 leading-[1.25] truncate select-text"
          style={{ fontSize: '24px', fontWeight: 700 }}
        >
          {isHi ? "श्रीराम के चरणों में" : "At the Feet"}
        </h2>
        <p 
          className="font-medium text-amber-200/85 mt-1 select-text truncate"
          style={{ fontSize: '14px', fontWeight: 500, opacity: 0.85 }}
        >
          {isHi ? "आपका स्वागत है" : "of Shri Rama"}
        </p>
      </div>
    </div>
  );
}
