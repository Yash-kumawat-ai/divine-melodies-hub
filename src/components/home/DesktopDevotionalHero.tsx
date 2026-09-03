import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';

import raghavamLogoSvg from '@/pages/images/svg/raghavam logo4 more better.svg';
import lotusSvg from '@/pages/images/svg/lotus1.svg';
import prayerSvg from '@/pages/images/svg/prayer.svg';
import bookSvg from '@/pages/images/svg/book.svg';
import communitySvg from '@/pages/images/svg/community.svg';
import diyaSvg from '@/pages/images/svg/diya.svg';
import mandalaSvg from '@/pages/images/mandala.svg';

export function DesktopDevotionalHero() {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const pillars = [
    {
      id: 'bhakti',
      title: isHi ? 'भक्ति' : 'Bhakti',
      icon: lotusSvg,
      alt: 'Bhakti Lotus',
      iconClass: 'w-7 h-7 sm:w-8 sm:h-8',
    },
    {
      id: 'smaran',
      title: isHi ? 'स्मरण' : 'Smaran',
      icon: prayerSvg,
      alt: 'Smaran Prayer',
      iconClass: 'w-6 h-6 sm:w-7 sm:h-7',
    },
    {
      id: 'gyan',
      title: isHi ? 'ज्ञान' : 'Gyan',
      icon: bookSvg,
      alt: 'Gyan Scripture',
      iconClass: 'w-7 h-7 sm:w-8 sm:h-8',
    },
    {
      id: 'sang',
      title: isHi ? 'संग' : 'Sang',
      icon: communitySvg,
      alt: 'Satsang Sang',
      iconClass: 'w-7 h-7 sm:w-8 sm:h-8',
    },
    {
      id: 'samarpan',
      title: isHi ? 'समर्पण' : 'Samarpan',
      icon: diyaSvg,
      alt: 'Samarpan Diya',
      iconClass: 'w-7 h-7 sm:w-8 sm:h-8',
    },
  ];

  return (
    <section className="relative w-full overflow-hidden rounded-[28px] md:rounded-[36px] bg-[#FAF5EC] dark:bg-[#120B05] border border-[#E8D8C4] dark:border-amber-900/30 p-6 sm:p-8 md:p-12 lg:p-16 text-center shadow-lg select-text">
      {/* Ambient Corner Mandalas */}
      <img
        src={mandalaSvg}
        alt=""
        aria-hidden="true"
        className="absolute -top-16 -left-16 w-56 h-56 md:w-72 md:h-72 opacity-15 dark:opacity-10 pointer-events-none select-none object-contain -rotate-45"
      />
      <img
        src={mandalaSvg}
        alt=""
        aria-hidden="true"
        className="absolute -top-16 -right-16 w-56 h-56 md:w-72 md:h-72 opacity-15 dark:opacity-10 pointer-events-none select-none object-contain rotate-45"
      />
      <img
        src={mandalaSvg}
        alt=""
        aria-hidden="true"
        className="absolute -bottom-16 -left-16 w-56 h-56 md:w-72 md:h-72 opacity-15 dark:opacity-10 pointer-events-none select-none object-contain -rotate-135"
      />
      <img
        src={mandalaSvg}
        alt=""
        aria-hidden="true"
        className="absolute -bottom-16 -right-16 w-56 h-56 md:w-72 md:h-72 opacity-15 dark:opacity-10 pointer-events-none select-none object-contain rotate-135"
      />

      {/* Golden Vertical Light Beam */}
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-48 bg-gradient-to-b from-amber-400/20 via-amber-300/10 to-amber-400/20 blur-3xl pointer-events-none select-none" />

      {/* Flowing Ambient Gold Wave Lines Behind Mandala */}
      <svg
        className="absolute top-1/2 left-0 w-full -translate-y-1/2 h-64 md:h-80 opacity-35 dark:opacity-20 pointer-events-none select-none"
        viewBox="0 0 1440 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          d="M0,160 C320,60 480,260 720,160 C960,60 1120,260 1440,160"
          stroke="url(#goldFlowGrad1)"
          strokeWidth="1.5"
        />
        <path
          d="M0,190 C300,90 520,280 720,190 C920,100 1140,290 1440,190"
          stroke="url(#goldFlowGrad2)"
          strokeWidth="1.2"
        />
        <path
          d="M0,130 C340,30 460,230 720,130 C980,30 1100,230 1440,130"
          stroke="url(#goldFlowGrad1)"
          strokeWidth="1"
        />
        <defs>
          <linearGradient id="goldFlowGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D4A437" stopOpacity="0" />
            <stop offset="25%" stopColor="#D4A437" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#F5D061" stopOpacity="1" />
            <stop offset="75%" stopColor="#D4A437" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#D4A437" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="goldFlowGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D4A437" stopOpacity="0" />
            <stop offset="35%" stopColor="#E2B348" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#FDF1A9" stopOpacity="0.9" />
            <stop offset="65%" stopColor="#E2B348" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#D4A437" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col items-center justify-center max-w-4xl mx-auto">
        {/* Central Sacred Mandala */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-amber-400/25 dark:bg-amber-500/15 blur-2xl transform scale-110 pointer-events-none" />
          <img
            src={raghavamLogoSvg}
            alt="Raghavam Sacred Mandala"
            width={340}
            height={340}
            loading="eager"
            decoding="async"
            className="w-48 h-48 sm:w-60 sm:h-60 md:w-72 md:h-72 lg:w-84 lg:h-84 object-contain drop-shadow-[0_12px_40px_rgba(212,164,55,0.38)] select-none hover:scale-103 transition-transform duration-700 ease-out"
          />
        </div>

        {/* Primary Devotional Tagline */}
        <div className="mt-5 sm:mt-6 md:mt-8">
          <h1 className="font-hindi font-bold text-2xl sm:text-3xl md:text-4xl lg:text-[44px] text-[#581418] dark:text-amber-100 tracking-wide leading-[1.25] text-center drop-shadow-xs">
            {isHi ? (
              <>
                भगवत् स्मरण,
                <br />
                जीवन पावनम्
              </>
            ) : (
              <>
                Bhagwat Smaran,
                <br />
                Jeevan Pavanam
              </>
            )}
          </h1>

          {/* Golden Diamond Node Divider */}
          <div className="flex items-center justify-center gap-3 w-40 sm:w-56 mx-auto my-3 sm:my-4 md:my-5">
            <span className="h-[1.5px] flex-1 bg-gradient-to-r from-transparent to-[#D4A437]" />
            <span className="text-[#D4A437] text-xs sm:text-sm font-bold">◆</span>
            <span className="h-[1.5px] flex-1 bg-gradient-to-l from-transparent to-[#D4A437]" />
          </div>
        </div>

        {/* Five Core Pillars Strip */}
        <div className="w-full max-w-2xl mx-auto mt-1 sm:mt-2">
          <div className="grid grid-cols-5 items-center justify-center gap-1 sm:gap-3 py-3 px-2 sm:px-6 rounded-2xl bg-[#FFFDF8]/70 dark:bg-[#180E09]/60 border border-[#E8D8C4]/60 dark:border-amber-900/30 backdrop-blur-xs shadow-xs">
            {pillars.map((pillar, idx) => (
              <React.Fragment key={pillar.id}>
                <div className="flex flex-col items-center justify-center gap-1.5 p-1 sm:p-2 group cursor-default">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#FAF5EC] dark:bg-stone-900/80 border border-[#E8D8C4] dark:border-amber-500/20 flex items-center justify-center shadow-xs group-hover:scale-110 group-hover:border-[#D4A437] transition-all duration-300">
                    <img
                      src={pillar.icon}
                      alt={pillar.alt}
                      width={32}
                      height={32}
                      className={`${pillar.iconClass} object-contain dark:filter dark:brightness-110`}
                    />
                  </div>
                  <span className="font-semibold text-[11.5px] sm:text-sm text-[#581418] dark:text-amber-200">
                    {pillar.title}
                  </span>
                </div>
                {idx < pillars.length - 1 && (
                  <div className="hidden sm:block h-8 w-[1px] bg-[#E8D8C4] dark:bg-amber-900/40 self-center" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Golden Three Dots Flourish */}
        <div className="flex items-center justify-center gap-2 text-[#D4A437] text-xs font-bold my-3 sm:my-4 select-none">
          <span>•</span>
          <span>•</span>
          <span>•</span>
        </div>

        {/* Subtitle / Mission Statement */}
        <p className="max-w-2xl mx-auto text-xs sm:text-sm md:text-base text-[#786252] dark:text-stone-300 font-medium leading-relaxed px-4">
          {isHi ? (
            <>
              भजन, मंत्र, आरती, कथाएँ और सत्संग
              <br className="hidden sm:inline" />
              {' '}से अपने जीवन में प्रेम, शांति और आनंद पाना चाहते हैं।
            </>
          ) : (
            <>
              Embrace divine love, peace, and eternal bliss
              <br className="hidden sm:inline" />
              {' '}through Bhajans, Mantras, Aartis, Kathas, and Satsang.
            </>
          )}
        </p>

        {/* Golden Three Dots Flourish Bottom */}
        <div className="flex items-center justify-center gap-2 text-[#D4A437] text-xs font-bold mt-3 select-none">
          <span>•</span>
          <span>•</span>
          <span>•</span>
        </div>
      </div>
    </section>
  );
}

export default DesktopDevotionalHero;
