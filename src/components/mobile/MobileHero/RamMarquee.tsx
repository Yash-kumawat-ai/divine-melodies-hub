import { useLanguage } from '@/hooks/useLanguage';

export function RamMarquee() {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  return (
    <div className="w-full mt-[18px] h-[36px] overflow-hidden flex items-center bg-[#FFFDF8] dark:bg-[#1E1710]/40 border border-[#E8D8C4] rounded-xl relative select-none">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ramMarqueeMobile {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ram-marquee-track-mobile {
          display: flex;
          width: max-content;
          animation: ramMarqueeMobile 15s linear infinite;
        }
      `}} />
      <div className="ram-marquee-track-mobile gap-4 pr-4">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 shrink-0">
            <span className="text-[#651317] font-bold tracking-wide text-xs">
              {isHi ? 'राम' : 'RAM'}
            </span>
            <span className="text-[#E8D8C4] text-[8px]">✦</span>
          </div>
        ))}
        {/* Loop duplicates */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={`dup-${i}`} className="flex items-center gap-4 shrink-0" aria-hidden="true">
            <span className="text-[#651317] font-bold tracking-wide text-xs">
              {isHi ? 'राम' : 'RAM'}
            </span>
            <span className="text-[#E8D8C4] text-[8px]">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}
