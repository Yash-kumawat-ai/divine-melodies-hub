import React from 'react';
import mandalaSvg from '@/pages/images/mandala.svg';

interface MandalaFrameProps {
  category: 'jyotirlinga' | 'hanuman' | 'krishna' | 'lotus';
  isLive: boolean;
  isDark?: boolean;
  className?: string;
  children: React.ReactNode;
}

export default function MandalaFrame({ category, isLive, isDark = false, className = '', children }: MandalaFrameProps) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      
      {/* Faint Divine Glow (8-10% opacity) */}
      <div 
        className="absolute inset-[-4px] rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(216, 166, 74, 0.08) 0%, transparent 72%)',
        }}
      />
      
      {/* Static Detailed Mandala SVG behind/below the circle (95% high opacity, saffron filtered, increased size) */}
      <img 
        src={mandalaSvg} 
        alt="" 
        className="absolute w-[116%] h-[116%] max-w-none object-contain pointer-events-none select-none z-0"
        style={{
          opacity: 0.95,
          filter: 'invert(47%) sepia(93%) saturate(1750%) hue-rotate(12deg) brightness(97%) contrast(95%)',
        }}
      />
      
      {/* Inner Image Wrapper - 82% of total diameter, tight and centered with a subtle gold border */}
      <div className="relative z-10 rounded-full overflow-hidden h-[82%] w-[82%] flex items-center justify-center border-2 border-amber-500/25 dark:border-amber-500/15 bg-zinc-100 dark:bg-zinc-800 shadow-inner">
        {children}
      </div>

      {/* Vibrant Pulsing Coral-Red Live Dot (8px) outside the mandala (does not overlap the temple image) */}
      {isLive && (
        <span 
          className="absolute flex h-2.5 w-2.5 items-center justify-center rounded-full bg-gradient-to-br from-[#FF5A5F] to-[#FF3B30] border border-white dark:border-[#0a0705] shadow-[0_0_6px_rgba(255,59,48,0.5)] z-30 animate-pulse"
          style={{
            left: '84.5%',
            top: '84.5%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <span className="h-0.5 w-0.5 rounded-full bg-white opacity-95 animate-ping" />
        </span>
      )}
    </div>
  );
}
