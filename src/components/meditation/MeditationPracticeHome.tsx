import { useMemo, useEffect } from "react";
import { Clock3, Flame, Play, ArrowRight, Check } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { computeStats, loadSessionLogs } from "@/lib/meditation/meditationStorage";
import { cn } from "@/lib/utils";
import meditationDesktopBg from "@/pages/images/meditation_desktop_wallpaper.webp";
import redLotus from "@/pages/images/red_lotus_lossless.webp";
import hanumanHd2 from "@/pages/images/hanuman_hd (2).webp";
import { motion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import { SEO } from "@/components/SEO";
import { prefetchMeditationLcpImages } from "@/lib/prefetchMeditation";

const MEDITATION_QUOTES = [
  { hi: "\u201cशांति बाहर नहीं, अंदर मिलती है।\u201d", en: "\u201cPeace is not found outside, it is found within.\u201d" },
  { hi: "\u201cमौन में उतरें। चेतना को स्पर्श करें।\u201d", en: "\u201cStep into silence. Touch the consciousness.\u201d" },
  { hi: "\u201cध्यान नहीं, स्वयं से मिलन।\u201d", en: "\u201cNot just meditation, a meeting with self.\u201d" },
  { hi: "\u201cभीतर की शांति, बाहर का प्रकाश।\u201d", en: "\u201cInner peace, outer light.\u201d" },
  { hi: "\u201cमन से परे। चेतना के करीब।\u201d", en: "\u201cBeyond the mind. Closer to consciousness.\u201d" },
  { hi: "\u201cनिरंतर अभ्यास ही सच्ची शांति का मार्ग है।\u201d", en: "\u201cConsistent practice is the path to true peace.\u201d" },
];

const LotusMark = ({ className = "w-5 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 28" fill="none" aria-hidden>
    <path
      d="M24 26c-3-4.5-8-8.5-12.5-11C16 12 20.5 9 24 4c3.5 5 8 8 12.5 11C32 17.5 27 21.5 24 26Z"
      fill="#D9A441"
      opacity="0.85"
    />
    <path
      d="M24 24c-2-3-5.5-5.5-9-7.5C18 14.5 21 12 24 8c3 4 6 6.5 9 8.5C29.5 18.5 26 21 24 24Z"
      fill="#F5C15C"
      opacity="0.9"
    />
  </svg>
);

type MeditationPracticeHomeProps = {
  onSelectPractice: (practice: { id: string }) => void;
  onQuickStart: () => void;
};

export default function MeditationPracticeHome({ onSelectPractice, onQuickStart }: MeditationPracticeHomeProps) {
  const { language } = useLanguage();
  const isHi = language === "hi";
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    prefetchMeditationLcpImages();
    void import("@/components/meditation/MantraJapHome");
    void import("@/components/meditation/PremiumJapaCounter");
  }, []);

  const stats = computeStats(loadSessionLogs());

  const randomQuote = useMemo(() => {
    const idx = Math.floor(Math.random() * MEDITATION_QUOTES.length);
    return MEDITATION_QUOTES[idx];
  }, []);

  const weekProgress = useMemo(() => {
    const logs = loadSessionLogs();
    const completed = logs.filter((l) => l.completed);

    const getLocalDateString = (dateOrStr: Date | string) => {
      const d = typeof dateOrStr === "string" ? new Date(dateOrStr) : dateOrStr;
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    const completedDays = new Set(completed.map((l) => getLocalDateString(l.completedAt)));

    const now = new Date();
    const currentDay = now.getDay();
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);

    const labelsHi = ["सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि", "रवि"];
    const labelsEn = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return Array.from({ length: 7 }).map((_, idx) => {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + idx);
      const key = getLocalDateString(dayDate);

      return {
        label: isHi ? labelsHi[idx] : labelsEn[idx],
        completed: completedDays.has(key),
        isToday: key === getLocalDateString(now),
      };
    });
  }, [isHi]);

  const streakLine = useMemo(() => {
    let firstCompletedIdx = -1;
    let lastCompletedIdx = -1;

    weekProgress.forEach((day, idx) => {
      if (day.completed) {
        if (firstCompletedIdx === -1) firstCompletedIdx = idx;
        lastCompletedIdx = idx;
      }
    });

    if (firstCompletedIdx === -1) return { left: 0, width: 0 };

    const left = (firstCompletedIdx / 6) * 100;
    const endIdx = Math.min(6, lastCompletedIdx + 1);
    const width = ((endIdx - firstCompletedIdx) / 6) * 100;
    return { left, width };
  }, [weekProgress]);

  const hasMeditated = stats.sessionCount > 0;

  const headingText = useMemo(() => {
    const streak = stats.streakDays;
    if (streak === 0) return isHi ? "अपनी यात्रा शुरू करें" : "Start Your Journey";
    if (streak === 1) return isHi ? "1 दिन का सिलसिला" : "1 Day Streak";
    return isHi ? `${streak} दिन का सिलसिला` : `${streak} Day Streak`;
  }, [stats.streakDays, isHi]);

  const subtitleText = useMemo(() => {
    const streak = stats.streakDays;
    if (streak === 0) return isHi ? "हर जाप आपको आंतरिक शांति के करीब लाता है।" : "Every japa brings you closer to inner peace.";
    if (streak >= 1 && streak <= 6) return isHi ? "हर दिन अभ्यास जारी रखें।" : "Keep showing up each day.";
    if (streak >= 7 && streak <= 29) return isHi ? "अद्भुत निरंतरता। जारी रखें।" : "Beautiful consistency. Keep going.";
    return isHi ? "आपका अभ्यास जीवन का एक तरीका बन रहा है।" : "Your practice is becoming a way of life.";
  }, [stats.streakDays, isHi]);

  const formatMeditationTime = (totalMins: number) => {
    if (totalMins === 0) return isHi ? "0 मिनट" : "0 min";
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    if (hrs === 0) return isHi ? `${mins} मिनट` : `${mins} min`;
    if (mins === 0) return isHi ? `${hrs} घंटे` : `${hrs} h`;
    return isHi ? `${hrs} घंटे ${mins} मिनट` : `${hrs} h ${mins} m`;
  };

  const formatSessionsCount = (count: number) => {
    if (isHi) return `${count} सत्र`;
    return `${count} ${count === 1 ? "Session" : "Sessions"}`;
  };

  const copy = {
    hero: {
      tag: isHi ? "|| ध्यान ||" : "|| Meditation ||",
      title: isHi ? "मन से परे।\nचेतना के करीब।" : "Beyond Mind.\nCloser to Consciousness.",
      subtitle: isHi ? "मंत्र जप से जुड़ें, स्वयं से मिलें।" : "Connect through mantra japa, meet yourself.",
      cta: isHi ? "जाप शुरू करें" : "Start Japa",
    },
    recent: {
      title: isHi ? "जारी जाप" : "Continue Japa",
      name: isHi ? "मंत्र जप" : "Mantra Jap",
      meta: isHi ? "माला · टैप · आवाज़" : "Mala · Tap · Voice",
      btn: isHi ? "जारी रखें" : "Continue",
    },
    quote: {
      title: isHi ? "आज का विचार" : "Thought of the Day",
    },
    practices: {
      title: isHi ? "मंत्र जप" : "Mantra Jap",
      mantra: {
        title: isHi ? "मंत्र जप साधना" : "Mantra Jap Sadhana",
        desc: isHi
          ? "मंत्र जप के साथ मन को एकाग्र करें और भक्ति में डूबें।"
          : "Focus your mind with mantra chanting and deepen devotion.",
        dur: isHi ? "माला · 108 जाप" : "Mala · 108 chants",
      },
    },
  };

  const goMantraJap = () => onSelectPractice({ id: "mantra_jap_home" });

  const meditationUrl =
    typeof window !== "undefined" ? `${window.location.origin}/meditation` : "/meditation";

  return (
    <div
      className={cn(
        "min-h-screen pb-28 md:pb-12 text-[#3A2418]",
        isDark ? "bg-[#0c0a08] text-amber-50" : "bg-[#FAF6EE]"
      )}
    >
      <SEO
        title={isHi ? "ध्यान एवं मंत्र जप" : "Meditation & Mantra Japa"}
        description={
          isHi
            ? "मंत्र जप, माला और ध्यान साधना से मन को शांत करें। अतिथि भी बिना लॉगिन अभ्यास कर सकते हैं।"
            : "Calm the mind with mantra japa, mala counting, and meditation. Guests can practice without signing in."
        }
        image={meditationDesktopBg}
        url={meditationUrl}
        lang={isHi ? "hi" : "en"}
      />
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-lotus-float { animation: float 6s ease-in-out infinite; }
      `}</style>

      {!isDark && (
        <div
          className="pointer-events-none fixed inset-0 -z-10"
          style={{
            background: "linear-gradient(180deg, #FFFDF8 0%, #FAF6EE 45%, #F5EDE0 100%)",
          }}
        />
      )}

      <div className="mx-auto max-w-5xl px-4 lg:px-6 mt-4 md:mt-5 space-y-5">
        {/* Hero — crisp image, bottom gradient */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="relative w-full h-[220px] sm:h-[240px] md:h-[300px] lg:h-[340px] overflow-hidden rounded-[24px] border border-[#E8D8C4] dark:border-stone-700 flex flex-col justify-end px-5 sm:px-8 md:px-10 py-6 md:py-8 shadow-[0_8px_24px_rgba(42,18,15,0.08)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
        >
          <div className="absolute inset-0 z-0">
            <img
              src={meditationDesktopBg}
              alt=""
              width={1672}
              height={941}
              fetchpriority="high"
              decoding="async"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
          </div>

          <div className="relative z-10 max-w-lg text-left">
            <p className="text-[#F5C15C] font-bold tracking-[0.18em] text-xs uppercase mb-2">
              {copy.hero.tag}
            </p>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white leading-tight whitespace-pre-line">
              {copy.hero.title}
            </h1>
            <p className="text-white/85 text-sm md:text-base mt-2 mb-6 font-medium max-w-md">
              {copy.hero.subtitle}
            </p>
            <button
              type="button"
              onClick={goMantraJap}
              className="inline-flex items-center gap-2.5 font-bold px-6 py-3 rounded-full bg-[#651317] hover:bg-[#4f0f12] text-white transition-all active:scale-95 shadow-[0_8px_24px_rgba(101,19,23,0.35)]"
            >
              <Play className="w-4 h-4 fill-current stroke-none" />
              <span>{copy.hero.cta}</span>
            </button>
          </div>
        </motion.section>

        {/* Continue + Thought */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#FFFDF8] dark:bg-stone-900 border border-[#E8D8C4] dark:border-stone-700 rounded-2xl p-5 flex flex-col justify-between min-h-[160px]">
            <div>
              <h2 className="font-display font-bold text-xs uppercase tracking-wider text-[#651317] dark:text-amber-300 mb-3 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#651317] dark:bg-amber-400" />
                {copy.recent.title}
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FAF0E4] dark:bg-amber-500/15 border border-[#E8D8C4] dark:border-amber-500/30 font-display text-xl font-bold text-[#651317] dark:text-amber-300">
                  ॐ
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-[#3A2418] dark:text-amber-50 truncate">
                    {copy.recent.name}
                  </h3>
                  <p className="text-[13px] text-[#786252] dark:text-stone-400 mt-0.5 font-medium">
                    {copy.recent.meta}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              {stats.streakDays > 0 ? (
                <p className="text-xs font-semibold text-[#786252] dark:text-stone-400">
                  {isHi ? `${stats.streakDays} दिन की स्ट्रीक` : `${stats.streakDays}-day streak`}
                </p>
              ) : (
                <p className="text-xs font-medium text-[#786252] dark:text-stone-400">
                  {isHi ? "आज का जाप शुरू करें" : "Begin today’s japa"}
                </p>
              )}
              <button
                type="button"
                onClick={onQuickStart}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold bg-[#651317] hover:bg-[#4f0f12] text-white transition-colors active:scale-95"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                {copy.recent.btn}
              </button>
            </div>
          </div>

          <div className="bg-[#FFFDF8] dark:bg-stone-900 border border-[#E8D8C4] dark:border-stone-700 rounded-2xl p-5 flex flex-col justify-between items-center text-center min-h-[160px]">
            <h2 className="font-display font-bold text-xs uppercase tracking-wider text-[#651317] dark:text-amber-300 flex items-center gap-2">
              <span>✦</span>
              {copy.quote.title}
              <span>✦</span>
            </h2>
            <p className="text-base md:text-[17px] text-[#3A2418] dark:text-amber-50 font-medium max-w-md my-3 italic leading-relaxed">
              {isHi ? randomQuote.hi : randomQuote.en}
            </p>
            <div className="flex items-center justify-center gap-2.5 w-full">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#D9A441]/60" />
              <LotusMark />
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#D9A441]/60" />
            </div>
          </div>
        </section>

        {/* Streak / Sadhana */}
        <section className="relative overflow-hidden bg-[#FFFDF8] dark:bg-stone-900 border border-[#E8D8C4] dark:border-stone-700 rounded-2xl p-5 md:p-7">
          <div className="relative z-10 flex flex-row items-center gap-4 sm:gap-6 md:gap-8 w-full">
            <div className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-[#651317]/20 dark:border-amber-500/20" />
              <div className="absolute inset-2 rounded-full border border-dashed border-[#651317]/25 dark:border-amber-500/25" />
              <img
                src={redLotus}
                alt=""
                width={1149}
                height={1369}
                loading="lazy"
                decoding="async"
                className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-cover rounded-full animate-lotus-float"
              />
            </div>

            <div className="relative z-10 flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#D9A441] fill-[#D9A441]" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#651317] dark:text-amber-300">
                    {isHi ? "आपकी साधना यात्रा" : "Your Sadhana Yatra"}
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#E8D8C4] dark:border-amber-500/40 bg-[#FAF0E4] dark:bg-amber-500/15 text-[#651317] dark:text-amber-300">
                  {stats.streakDays > 0
                    ? isHi
                      ? `${stats.streakDays}वां दिन`
                      : `Day ${stats.streakDays}`
                    : isHi
                      ? "दिन 1"
                      : "Day 1"}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-display font-bold tracking-tight mt-1.5 truncate text-[#651317] dark:text-amber-300">
                {headingText}
              </h2>
              <p className="text-xs md:text-sm text-[#786252] dark:text-stone-400 mt-0.5 font-medium line-clamp-1">
                {subtitleText}
              </p>

              <div className="w-full mt-4 select-none">
                <div className="flex justify-between w-full text-[10px] sm:text-xs font-bold text-[#786252] dark:text-stone-400 mb-2">
                  {weekProgress.map((day, idx) => (
                    <span key={idx} className="w-6 sm:w-7 text-center">
                      {day.label}
                    </span>
                  ))}
                </div>

                <div className="relative flex justify-between w-full items-center">
                  <div className="absolute left-[12px] right-[12px] h-[2px] bg-[#E8D8C4] dark:bg-stone-700 top-1/2 -translate-y-1/2 -z-10">
                    {hasMeditated && streakLine.width > 0 && (
                      <div
                        className="absolute h-full bg-[#651317] dark:bg-amber-400 transition-all duration-500"
                        style={{ left: `${streakLine.left}%`, width: `${streakLine.width}%` }}
                      />
                    )}
                  </div>

                  {weekProgress.map((day, idx) => (
                    <div key={idx} className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center shrink-0">
                      {hasMeditated && day.completed ? (
                        <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-[#651317] dark:bg-amber-500 text-white dark:text-black border border-[#651317] dark:border-amber-400">
                          <Check className="w-3.5 h-3.5 stroke-[3px]" />
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border bg-[#FAF0E4]/80 dark:bg-stone-800 border-[#E8D8C4] dark:border-stone-600",
                            hasMeditated && day.isToday && "border-[#651317] dark:border-amber-400"
                          )}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 w-full">
                <div className="bg-white dark:bg-stone-800/80 border border-[#E8D8C4] dark:border-stone-700 rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FAF0E4] dark:bg-amber-500/15 text-[#651317] dark:text-amber-400">
                    <Clock3 className="w-4 h-4" strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#786252] dark:text-stone-400">
                      {isHi ? "कुल समय" : "Total Time"}
                    </p>
                    <p className="text-xs sm:text-sm font-bold mt-0.5 truncate text-[#651317] dark:text-amber-300">
                      {formatMeditationTime(stats.totalMindfulMinutes)}
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-stone-800/80 border border-[#E8D8C4] dark:border-stone-700 rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FAF0E4] dark:bg-amber-500/15 text-[#651317] dark:text-amber-400">
                    <Flame className="w-4 h-4" strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#786252] dark:text-stone-400">
                      {isHi ? "कुल सत्र" : "Total Sessions"}
                    </p>
                    <p className="text-xs sm:text-sm font-bold mt-0.5 truncate text-[#651317] dark:text-amber-300">
                      {formatSessionsCount(stats.sessionCount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Single Mantra Jap practice card */}
        <section id="meditation-practices-section" className="space-y-3 pb-2">
          <h2 className="font-display font-bold text-xs uppercase tracking-wider text-[#651317] dark:text-amber-300 border-l-2 border-[#651317] dark:border-amber-400 pl-3">
            {copy.practices.title}
          </h2>

          <button
            type="button"
            onClick={goMantraJap}
            className="group relative w-full overflow-hidden rounded-2xl border border-[#E8D8C4] dark:border-stone-700 bg-[#FFFDF8] dark:bg-stone-900 text-left transition-all hover:border-[#651317]/40 dark:hover:border-amber-500/40 active:scale-[0.99]"
          >
            <div className="absolute inset-y-0 right-0 w-[42%] sm:w-[38%] pointer-events-none">
              <img
                src={hanumanHd2}
                alt=""
                width={1536}
                height={1024}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-center opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#FFFDF8] via-[#FFFDF8]/70 to-transparent dark:from-stone-900 dark:via-stone-900/70" />
            </div>

            <div className="relative z-10 p-5 sm:p-6 max-w-[62%] sm:max-w-[65%] flex flex-col justify-between min-h-[160px]">
              <div className="space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FAF0E4] dark:bg-amber-500/15 border border-[#E8D8C4] dark:border-amber-500/30 font-display text-xl font-bold text-[#651317] dark:text-amber-300">
                  ॐ
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#3A2418] dark:text-amber-50 group-hover:text-[#651317] dark:group-hover:text-amber-300 transition-colors">
                    {copy.practices.mantra.title}
                  </h3>
                  <p className="text-sm text-[#786252] dark:text-stone-400 mt-1 leading-relaxed">
                    {copy.practices.mantra.desc}
                  </p>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-[#E8D8C4]/80 dark:border-stone-700 pt-3">
                <span className="text-[13px] text-[#786252] dark:text-stone-400 font-medium">
                  {copy.practices.mantra.dur}
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#651317] text-white group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </button>
        </section>
      </div>
    </div>
  );
}
