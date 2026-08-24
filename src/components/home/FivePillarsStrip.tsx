import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';

export function FivePillarsStrip({ className = '' }: { className?: string }) {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const pillars = [
    {
      id: 'bhakti',
      title: isHi ? 'भक्ति' : 'Bhakti',
      icon: (
        <svg
          viewBox="0 0 40 40"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6 sm:w-7 sm:h-7 text-[#B87B22] dark:text-[#E5B558]"
          aria-hidden="true"
        >
          <path d="M20 6 C17 13 17 22 20 28 C23 22 23 13 20 6 Z" />
          <path d="M20 11 C14 14 12 21 17 27 C18 24 19 20 20 17" />
          <path d="M20 11 C26 14 28 21 23 27 C22 24 21 20 20 17" />
          <path d="M12 22 C7 24 7 30 14 30 C17 30 19 28 20 27" />
          <path d="M28 22 C33 24 33 30 26 30 C23 30 21 28 20 27" />
          <path d="M14 30 C17 33 23 33 26 30" />
        </svg>
      ),
    },
    {
      id: 'smaran',
      title: isHi ? 'स्मरण' : 'Smaran',
      icon: (
        <svg
          viewBox="0 0 40 40"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6 sm:w-7 sm:h-7 text-[#B87B22] dark:text-[#E5B558]"
          aria-hidden="true"
        >
          <path d="M20 7 L20 29" />
          <path d="M20 7 C18 10 14 17 14 23 C14 26 17 29 20 29" />
          <path d="M20 7 C22 10 26 17 26 23 C26 26 23 29 20 29" />
          <path d="M12 21 C10 23 10 27 13 30 C16 33 19 33 20 33 C21 33 24 33 27 30 C30 27 30 23 28 21" />
          <path d="M15 32 L13 36" />
          <path d="M25 32 L27 36" />
        </svg>
      ),
    },
    {
      id: 'gyan',
      title: isHi ? 'ज्ञान' : 'Gyan',
      icon: (
        <svg
          viewBox="0 0 40 40"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6 sm:w-7 sm:h-7 text-[#B87B22] dark:text-[#E5B558]"
          aria-hidden="true"
        >
          <path d="M20 12 C16 9 10 9 7 11 L7 29 C10 27 16 27 20 30 C24 27 30 27 33 29 L33 11 C30 9 24 9 20 12 Z" />
          <path d="M20 12 L20 30" />
          <path d="M11 16 C14 15 17 15 19 16" />
          <path d="M11 20 C14 19 17 19 19 20" />
          <path d="M11 24 C14 23 17 23 19 24" />
          <path d="M21 16 C23 15 26 15 29 16" />
          <path d="M21 20 C23 19 26 19 29 20" />
          <path d="M21 24 C23 23 26 23 29 24" />
        </svg>
      ),
    },
    {
      id: 'sang',
      title: isHi ? 'संग' : 'Sang',
      icon: (
        <svg
          viewBox="0 0 40 40"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6 sm:w-7 sm:h-7 text-[#B87B22] dark:text-[#E5B558]"
          aria-hidden="true"
        >
          <circle cx="20" cy="13" r="3.5" />
          <path d="M13 29 C13 24 16 21 20 21 C24 21 27 24 27 29" />
          <circle cx="12" cy="16" r="2.5" />
          <path d="M7 29 C7 25.5 9 23.5 12 23.5 C13 23.5 13.8 23.8 14.5 24.2" />
          <circle cx="28" cy="16" r="2.5" />
          <path d="M33 29 C33 25.5 31 23.5 28 23.5 C27 23.5 26.2 23.8 25.5 24.2" />
        </svg>
      ),
    },
    {
      id: 'samarpan',
      title: isHi ? 'समर्पण' : 'Samarpan',
      icon: (
        <svg
          viewBox="0 0 40 40"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6 sm:w-7 sm:h-7 text-[#B87B22] dark:text-[#E5B558]"
          aria-hidden="true"
        >
          <path
            d="M20 6 C18 10 16 14 18 17 C19 19 21 19 22 17 C24 14 22 10 20 6 Z"
            fill="#B87B22"
            fillOpacity="0.25"
          />
          <path d="M10 19 C10 26 15 28 20 28 C25 28 30 26 30 19 L10 19 Z" />
          <path d="M16 28 L15 32 L25 32 L24 28" />
        </svg>
      ),
    },
  ];

  return (
    <div
      className={`w-full max-w-4xl mx-auto py-3 px-2 sm:px-6 rounded-2xl bg-[#FFFDF8]/90 dark:bg-[#180E09]/80 border border-[#E8D8C4] dark:border-amber-900/30 shadow-[0_4px_16px_rgba(74,14,18,0.03)] backdrop-blur-xs select-text ${className}`}
    >
      <div className="grid grid-cols-5 items-center justify-center gap-1 sm:gap-2">
        {pillars.map((pillar, idx) => (
          <React.Fragment key={pillar.id}>
            <div className="flex flex-col items-center justify-center gap-1.5 p-1 sm:p-2 group cursor-default">
              <div className="flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                {pillar.icon}
              </div>
              <span className="font-serif font-bold text-xs sm:text-sm md:text-base text-[#651317] dark:text-amber-100 leading-none">
                {pillar.title}
              </span>
            </div>
            {idx < pillars.length - 1 && (
              <div className="h-7 sm:h-9 w-[1px] bg-[#E8D8C4] dark:bg-amber-900/40 self-center mx-auto" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Golden Three Dots Below */}
      <div className="flex items-center justify-center gap-2 text-[#D4A437] text-[10px] sm:text-xs font-bold mt-2.5 mb-0.5 select-none opacity-85">
        <span>•</span>
        <span>•</span>
        <span>•</span>
      </div>
    </div>
  );
}

export default FivePillarsStrip;
