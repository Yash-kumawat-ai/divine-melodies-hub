import { useLanguage } from '@/hooks/useLanguage';

interface DevotionalDividerProps {
  language?: string;
  className?: string;
  /** Chant word shown in the marquee (default: राम) */
  word?: string;
}

export function DevotionalDivider({ language: _language, className = "", word = "राम" }: DevotionalDividerProps) {
  void _language;

  return (
    <div className={`w-full relative overflow-hidden py-1 select-none my-2 shrink-0 ${className}`}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes devMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .dev-marquee-track {
          animation: devMarquee 45s linear infinite;
        }
      `}} />
      
      {/* Top Dotted Line */}
      <div className="w-full border-t border-dotted border-[#D8A35A]/50" />

      {/* Marquee Content */}
      <div className="my-1.5 w-full overflow-hidden flex relative z-10">
        <div className="flex whitespace-nowrap dev-marquee-track gap-4 shrink-0 pr-4">
          {Array.from({ length: 60 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 shrink-0">
              <span className="text-[#651317] dark:text-[#E8B15C] font-semibold tracking-wide text-sm md:text-[17px] font-serif">
                {word}
              </span>
              <span className="text-[#D8A35A]/60 dark:text-[#D8A35A]/60 text-[10px] font-serif">✦</span>
            </div>
          ))}
          {/* Duplicate track for seamless infinite looping */}
          {Array.from({ length: 60 }).map((_, i) => (
            <div key={`dup-${i}`} className="flex items-center gap-4 shrink-0" aria-hidden="true">
              <span className="text-[#651317] dark:text-[#E8B15C] font-semibold tracking-wide text-sm md:text-[17px] font-serif">
                {word}
              </span>
              <span className="text-[#D8A35A]/60 dark:text-[#D8A35A]/60 text-[10px] font-serif">✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Dotted Line */}
      <div className="w-full border-t border-dotted border-[#D8A35A]/50" />
    </div>
  );
}

export default DevotionalDivider;
