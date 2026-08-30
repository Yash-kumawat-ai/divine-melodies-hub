import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import SearchBar from "@/components/SearchBar";
import { HeroInsightCards } from "@/components/HeroInsightCards";
import { LiveAartiIcon } from "@/components/LiveAartiIcon";
import { prefetchSearchPage } from "@/lib/prefetchSearch";

const HERO_MOBILE = "/hero-lcp-mobile.webp";
const HERO_DESKTOP = "/hero-lcp-desktop.webp";

import { PromotionalCarousel } from "@/components/PromotionalCarousel";
import {
  SearchCard,
  ActionButtons,
  RamMarquee,
  RamVaniCard as MobileRamVaniCard,
} from "@/components/mobile/MobileHero";

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
  const { profile, user } = useAuth();
  const isHi = language === "hi";
  const firstName = (profile?.name || user?.user_metadata?.full_name || user?.user_metadata?.name || "")
    .toString()
    .trim()
    .split(/\s+/)[0];
  const mobileGreeting = firstName
    ? isHi
      ? `नमस्ते, ${firstName}`
      : `Namaste, ${firstName}`
    : isHi
      ? "नमस्ते"
      : "Namaste";

  useEffect(() => {
    prefetchSearchPage();
  }, []);

  return (
    <LazyMotion features={domAnimation}>
    <section className="hero-section w-full px-4 sm:px-6 md:px-8 lg:px-10 pt-3.5 pb-1 md:py-8 bg-[#FFFDF8] dark:bg-background md:bg-background">
      <div className="md:hidden flex flex-col w-full text-left">
        <p className="px-0.5 pt-0.5 pb-2 font-serif text-[22px] font-bold leading-tight text-[#3A2418] dark:text-[#FFFDF8]">
          {mobileGreeting}
        </p>
        <PromotionalCarousel />

        <div className="w-full mt-3.5 p-3.5 rounded-[24px] bg-[#FFFDF8] dark:bg-[#1A1208] border border-[#E8D8C4] dark:border-zinc-800/80 shadow-[0_6px_14px_rgba(74,14,18,0.04)] flex flex-col gap-3">
          <SearchCard />
          <ActionButtons />
        </div>

        <RamMarquee />
        <MobileRamVaniCard />
      </div>

      <div className="hidden md:flex flex-col w-full gap-6 md:gap-7 lg:gap-8">
        <div className="relative w-full overflow-hidden rounded-[28px] md:min-h-[440px] lg:min-h-[480px] flex flex-col justify-center p-8 lg:p-12 shadow-[0_16px_40px_rgba(0,0,0,0.10)] dark:shadow-[0_20px_48px_rgba(0,0,0,0.45)] border border-[#E8D8C4]/70 dark:border-zinc-800/60 bg-[#FFFDF8] dark:bg-[#120B05]">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 lg:w-[46%] h-full z-0 overflow-hidden pointer-events-none">
            <picture className="block w-full h-full">
              <source media="(min-width: 768px)" srcSet={HERO_DESKTOP} width={1400} height={900} />
              <m.img
                initial={{ scale: 1.03 }}
                animate={{ scale: 1 }}
                transition={{ duration: 8, ease: "easeOut" }}
                src={HERO_DESKTOP}
                alt="Raghavam — Devotional Music Platform"
                width={1400}
                height={900}
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover object-center rounded-r-[28px]"
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-r from-[#FFFDF8] via-[#FFFDF8]/50 to-transparent dark:from-[#120B05] dark:via-[#120B05]/50 dark:to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FFFDF8]/35 via-transparent to-[#FFFDF8]/20 dark:from-[#120B05]/40 dark:to-transparent" />
          </div>

          <div className="relative z-10 flex flex-col items-start w-full max-w-xl text-left">
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="flex items-center gap-2.5 mb-3 select-none justify-start w-full"
            >
              <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#651317]/50" />
              <span className="text-[#651317] dark:text-[#D4A437] text-[11px] font-medium tracking-wide">✦ ✦ ✦</span>
              <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#651317]/50" />
            </m.div>

            <m.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.45 }}
              className="font-display text-3xl md:text-4xl lg:text-[42px] font-bold text-[#3A2418] dark:text-[#FFFDF8] leading-[1.2] mb-2 select-text tracking-normal"
            >
              {isHi ? (
                <>
                  श्रीराम के चरणों में
                  <br />
                  आपका स्वागत है
                </>
              ) : (
                <>
                  Welcome to the Feet
                  <br />
                  of Shri Rama
                </>
              )}
            </m.h1>

            <m.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.45 }}
              className="mb-4 text-[#786252] dark:text-stone-400 text-sm md:text-base font-normal tracking-normal max-w-md"
            >
              {isHi ? "सत्संग · भजन · साधना · सेवा" : "Satsang · Bhajan · Sadhana · Seva"}
            </m.p>

            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              onMouseEnter={() => prefetchSearchPage()}
              onTouchStart={() => prefetchSearchPage()}
              className="w-full max-w-md mb-4 relative shrink-0 text-left cursor-pointer"
            >
              <SearchBar 
                readOnly 
                onClick={() => navigate("/search")} 
                onMicClick={() => navigate("/search?voice=1")}
              />
            </m.div>

            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 gap-2.5 w-full max-w-sm"
            >
              <button
                type="button"
                onClick={() => navigate("/all-bhajans")}
                className="btn-royal-primary w-full min-w-0 h-11 rounded-full !px-3 text-[12px] md:text-sm gap-1.5 cursor-pointer active:scale-95 transition-all"
              >
                <Play className="!w-3.5 !h-3.5 fill-current stroke-none" />
                <span className="truncate">{isHi ? "भजन खोजें" : "Explore Bhajans"}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/live-aarti")}
                className="btn-royal-secondary w-full min-w-0 h-11 rounded-full !px-3 text-[12px] md:text-sm gap-1.5 !bg-[#FFFDF8] hover:!bg-[#FFFDF8] dark:!bg-[#1A120B] dark:hover:!bg-[#1A120B] cursor-pointer active:scale-95 transition-all"
              >
                <LiveAartiIcon className="!h-5 !w-5" />
                <span className="truncate">{isHi ? "लाइव आरती" : "Live Aarti"}</span>
              </button>
            </m.div>
          </div>
        </div>

        <HeroInsightCards />
      </div>
    </section>
    </LazyMotion>
  );
}
