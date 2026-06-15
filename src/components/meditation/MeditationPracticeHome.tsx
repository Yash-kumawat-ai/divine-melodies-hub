import { Clock3, Flame, Flower2, Play, Sparkles, Timer, Wind, ArrowRight, Mic, Check } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { getMeditationPracticeTitle } from "@/lib/meditation/meditationLocale";
import { getPracticeById } from "@/lib/meditation/meditationTypes";
import { computeStats, loadPreferences, loadSessionLogs } from "@/lib/meditation/meditationStorage";
import { cn } from "@/lib/utils";
import meditationDesktopBg from "@/pages/images/meditation_desktop_wallpaper.webp";
import redLotus from "@/pages/images/red_lotus_lossless.webp";
import shivWallpaper from "@/pages/images/shiv_wallpaper.webp";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";

const MEDITATION_QUOTES = [
  { hi: "“शांति बाहर नहीं, अंदर मिलती है।”", en: "“Peace is not found outside, it is found within.”" },
  { hi: "“मौन में उतरें। चेतना को स्पर्श करें।”", en: "“Step into silence. Touch the consciousness.”" },
  { hi: "“ध्यान नहीं, स्वयं से मिलन।”", en: "“Not just meditation, a meeting with self.”" },
  { hi: "“जहाँ श्वास शांत होती है, वहाँ आत्मा बोलती है।”", en: "“Where breath calms, the soul speaks.”" },
  { hi: "“भीतर की शांति, बाहर का प्रकाश।”", en: "“Inner peace, outer light.”" },
  { hi: "“मन से परे। चेतना के करीब।”", en: "“Beyond the mind. Closer to consciousness.”" },
  { hi: "“निरंतर अभ्यास ही सच्ची शांति का मार्ग है।”", en: "“Consistent practice is the path to true peace.”" }
];

type MeditationPracticeHomeProps = {
  onSelectPractice: (practice: { id: string }) => void;
  onQuickStart: () => void;
};

export default function MeditationPracticeHome({ onSelectPractice, onQuickStart }: MeditationPracticeHomeProps) {
  const { language } = useLanguage();
  const isHi = language === "hi";

  const stats = computeStats(loadSessionLogs());
  const prefs = loadPreferences();

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
    
    // Get the start of the current week (Monday)
    const now = new Date();
    const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday...
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

  const completionFraction = useMemo(() => {
    const completedDaysCount = weekProgress.filter((d) => d.completed).length;
    return completedDaysCount / 7;
  }, [weekProgress]);

  const orangeLinePosition = useMemo(() => {
    let firstCompletedIdx = -1;
    let lastCompletedIdx = -1;
    
    weekProgress.forEach((day, idx) => {
      if (day.completed) {
        if (firstCompletedIdx === -1) firstCompletedIdx = idx;
        lastCompletedIdx = idx;
      }
    });

    if (firstCompletedIdx === -1) {
      return { left: 0, width: 0 };
    }

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
    if (streak === 0) return isHi ? "हर ध्यान आपको आंतरिक शांति के करीब लाता है।" : "Every meditation brings you closer to inner peace.";
    if (streak >= 1 && streak <= 6) return isHi ? "हर दिन अभ्यास जारी रखें।" : "Keep showing up each day.";
    if (streak >= 7 && streak <= 29) return isHi ? "अद्भुत निरंतरता। जारी रखें।" : "Beautiful consistency. Keep going.";
    return isHi ? "आपका अभ्यास जीवन का एक तरीका बन रहा है।" : "Your practice is becoming a way of life.";
  }, [stats.streakDays, isHi]);

  const formatMeditationTime = (totalMins: number) => {
    if (totalMins === 0) return isHi ? "० मि" : "0 min";
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    if (hrs === 0) {
      return isHi ? `${mins} मि` : `${mins} min`;
    }
    if (mins === 0) {
      return isHi ? `${hrs} घं` : `${hrs} h`;
    }
    return isHi ? `${hrs} घं ${mins} मि` : `${hrs} h ${mins} m`;
  };

  const formatSessionsCount = (count: number) => {
    if (isHi) return `${count} सत्र`;
    return `${count} ${count === 1 ? "Session" : "Sessions"}`;
  };

  // Fallback to mantra_shiva if there is no previous session
  const lastPractice = prefs.lastPracticeId ? getPracticeById(prefs.lastPracticeId) : getPracticeById("mantra_shiva")!;

  const copy = {
    hero: {
      tag: isHi ? "|| ध्यान ||" : "|| Meditation ||",
      title: isHi ? "मन से परे।\nचेतना के करीब।" : "Beyond Mind.\nCloser to Consciousness.",
      subtitle: isHi ? "ध्यान से जुड़ें, स्वयं से मिलें।" : "Connect with meditation, meet yourself.",
      cta: isHi ? "ध्यान शुरू करें" : "Start Meditation",
    },
    recent: {
      title: isHi ? "जारी ध्यान" : "Continuing Meditation",
      type: (mins: number, type: string) => {
        if (isHi) {
          return `${mins} मिनट • ${type === "mantra" ? "मंत्र ध्यान" : type === "breath" ? "श्वास ध्यान" : "ध्यान"}`;
        }
        return `${mins} mins • ${type === "mantra" ? "Mantra Meditation" : type === "breath" ? "Breath Meditation" : "Meditation"}`;
      },
      btn: isHi ? "जारी रखें" : "Continue",
    },
    quote: {
      title: isHi ? "आज का विचार" : "Thought of the Day",
      text: isHi ? "“शांति बाहर नहीं, अंदर मिलती है।”" : "“Peace is not found outside, it is found within.”",
    },
    practices: {
      title: isHi ? "ध्यान के अभ्यास" : "Meditation Practices",
      viewAll: isHi ? "सभी देखें" : "View All",
      mantra: {
        title: isHi ? "मंत्र ध्यान" : "Mantra Meditation",
        desc: isHi ? "मंत्र जप के साथ मन को एकाग्र करें।" : "Focus your mind with mantra chanting.",
        dur: isHi ? "10 - 20 मिनट" : "10 - 20 mins",
      },
      guided: {
        title: isHi ? "निर्देशित ध्यान" : "Guided Meditation",
        desc: isHi ? "आवाज के मार्गदर्शन में गहरा ध्यान करें।" : "Meditate deeply with voice guidance.",
        dur: isHi ? "10 - 20 मिनट" : "10 - 20 mins",
      },
      breath: {
        title: isHi ? "श्वास ध्यान" : "Breath Meditation",
        desc: isHi ? "श्वास पर ध्यान करके मन को शांत करें।" : "Calm your mind by focusing on your breath.",
        dur: isHi ? "5 - 15 मिनट" : "5 - 15 mins",
      }
    }
  };

  const particles = useMemo(() => Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    size: Math.random() * 3 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 10,
  })), []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#080504] via-[#0c0608] to-[#050306] pb-28 text-amber-50 md:pb-12">
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        .animate-lotus-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes subtlePulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .animate-node-pulse {
          animation: subtlePulse 4s ease-in-out infinite;
        }
      `}</style>
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(251,146,60,0.12),transparent),radial-gradient(circle_at_90%_20%,rgba(244,63,94,0.05),transparent_40%)]" />

      {/* HERO BANNER SECTION - Full width edge-to-edge */}
      <section className="relative min-h-[420px] md:min-h-[480px] overflow-hidden border-b border-white/10 shadow-2xl shadow-black/60 group flex flex-col justify-center px-6 md:px-12 lg:px-24 py-10 md:py-14 w-full">
          {/* Background Image - same for both mobile and desktop */}
          <div className="absolute inset-0 z-0">
            <img
              src={meditationDesktopBg}
              alt="Meditation"
              className="w-full h-full object-cover object-center transition-transform ease-out group-hover:scale-105"
              style={{ transitionDuration: "15000ms" }}
            />
          </div>
          
          {/* Overlays for readable text */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent z-[1]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 z-[1]" />

          {/* Floating Particles */}
          <div className="absolute inset-0 pointer-events-none z-[2] overflow-hidden">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: "100%" }}
                animate={{ 
                  opacity: [0, 0.4, 0],
                  y: ["100%", "0%"],
                  x: [`${p.x}%`, `${p.x + (Math.random() * 10 - 5)}%`]
                }}
                transition={{ 
                  duration: p.duration, 
                  repeat: Infinity, 
                  delay: p.delay,
                  ease: "linear"
                }}
                className="absolute w-1 h-1 bg-amber-400/30 rounded-full blur-[1px]"
                style={{ left: `${p.x}%`, bottom: 0 }}
              />
            ))}
          </div>

          {/* Banner Content */}
          <div className="relative z-10 max-w-xl text-left">
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-amber-400 font-bold tracking-[0.2em] text-xs md:text-sm uppercase mb-3"
            >
              {copy.hero.tag}
            </motion.p>
            
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-5xl font-display font-bold text-white leading-tight drop-shadow-lg whitespace-pre-line"
            >
              {copy.hero.title}
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-amber-100/70 text-sm md:text-base mt-3 mb-8 font-light"
            >
              {copy.hero.subtitle}
            </motion.p>

            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              onClick={onQuickStart}
              className="group flex items-center gap-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 active:scale-95 text-white font-bold px-7 py-3.5 rounded-full shadow-[0_10px_30px_-10px_rgba(249,115,22,0.5)] transition-all duration-300"
            >
              <Play className="w-5 h-5 fill-white stroke-none group-hover:scale-110 transition-transform" />
              <span>{copy.hero.cta}</span>
            </motion.button>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-4 mt-8 space-y-8">

        {/* SECTION 1: TWO COLUMN ROW ( जारी ध्यान + आज का विचार ) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card Left: जारी ध्यान (Continuing Meditation) */}
          <div className="bg-[#130d0a]/80 backdrop-blur-xl border border-orange-500/10 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group/recent">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div>
              <h2 className="text-amber-400/55 font-bold uppercase tracking-widest text-[13px] mb-4">
                {copy.recent.title}
              </h2>
              
              <div className="flex items-center gap-4">
                {/* ॐ Icon in glowing circle */}
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 font-display text-2xl font-bold">
                  <span>ॐ</span>
                  <div className="absolute inset-0 rounded-2xl bg-orange-500/5 blur-md" />
                </div>
                
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-white truncate">
                    {lastPractice ? getMeditationPracticeTitle(lastPractice, language) : (isHi ? "ॐ नमः शिवाय" : "Om Namah Shivaya")}
                  </h3>
                  <p className="text-[13px] text-white/40 mt-1 font-medium">
                    {lastPractice 
                      ? copy.recent.type(lastPractice.defaultDurationMinutes, lastPractice.type) 
                      : (isHi ? "10 मिनट • मंत्र ध्यान" : "10 mins • Mantra Meditation")}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              {/* Progress bar and mobile play button */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full w-[65%] bg-gradient-to-r from-orange-500 to-amber-400" />
                  </div>
                </div>
                
                {/* Mobile play button */}
                <button 
                  onClick={onQuickStart}
                  className="flex md:hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 hover:bg-orange-600 transition-colors"
                >
                  <Play className="h-4 w-4 fill-white text-white translate-x-[1px]" />
                </button>
              </div>

              {/* Desktop continue button */}
              <div className="hidden md:block mt-4">
                <button 
                  onClick={onQuickStart}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-500/10 border border-orange-500/30 px-4 py-2 text-[13px] md:text-xs font-bold text-orange-400 hover:bg-orange-500/20 hover:border-orange-500/50 transition-colors"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>{copy.recent.btn}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card Right: आज का विचार (Thought of the Day) */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 min-h-[190px] p-6 flex flex-col justify-between items-center text-center">
            {/* Background Image of yogi at sunset */}
            <div className="absolute inset-0 z-0">
              <img
                src={meditationDesktopBg}
                alt=""
                className="w-full h-full object-cover opacity-20 object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/95" />
            </div>

            <h2 className="relative z-10 text-amber-200/50 font-bold uppercase tracking-widest text-[13px]">
              {copy.quote.title}
            </h2>

            <p className="relative z-10 text-base md:text-lg text-white font-medium max-w-md my-4 italic leading-relaxed">
              {isHi ? randomQuote.hi : randomQuote.en}
            </p>

            {/* Separator gold lotus */}
            <div className="relative z-10 flex items-center justify-center gap-3 w-full opacity-40">
              <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-amber-400" />
              <span className="text-amber-400 text-xs">🪷</span>
              <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-amber-400" />
            </div>
          </div>
        </section>

        {/* STREAK JOURNEY SECTION (साधना यात्रा) */}
        <section className="bg-[#130d0a]/85 backdrop-blur-xl border border-orange-500/10 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-48 h-48 bg-orange-500/[0.03] rounded-full blur-3xl pointer-events-none" />
          
          {/* Left: Glowing Mandala with Golden Red Lotus */}
          <div className="relative w-40 h-40 md:w-44 md:h-44 shrink-0 flex items-center justify-center">
            {/* Concentric rotating design rings */}
            <div className="absolute inset-0 rounded-full border border-orange-500/15 animate-[spin_80s_linear_infinite]" />
            <div className="absolute inset-2 rounded-full border border-dashed border-orange-500/20 animate-[spin_50s_linear_infinite_reverse]" />
            <div className="absolute inset-4 rounded-full border border-orange-500/10" />
            <div className="absolute inset-8 rounded-full border border-dashed border-orange-500/25" />
            
            {/* SVG Progress Circle Around Red Lotus */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 z-20 pointer-events-none" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="orangeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
                <filter id="orangeShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#f97316" floodOpacity="0.6" />
                </filter>
              </defs>
              {/* Background Track Circle */}
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="2.5"
              />
              {/* Foreground Active Progress Arc */}
              {completionFraction > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="url(#orangeGlow)"
                  strokeWidth="3.2"
                  strokeDasharray={276.46}
                  strokeDashoffset={276.46 * (1 - completionFraction)}
                  strokeLinecap="round"
                  filter="url(#orangeShadow)"
                  className="transition-all duration-1000 ease-out"
                />
              )}
            </svg>

            {/* Glowing spot */}
            <div className="absolute w-24 h-24 bg-orange-500/10 rounded-full blur-xl" />
            
            {/* Red Lotus Image */}
            <img 
              src={redLotus} 
              alt="Golden Lotus" 
              className="relative z-10 w-32 h-32 md:w-36 md:h-36 object-cover rounded-full shadow-[0_0_20px_rgba(249,115,22,0.45)] animate-lotus-float"
            />
            
            {/* Divider decoration underneath */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-30">
              <div className="h-[1px] w-6 bg-gradient-to-r from-transparent to-orange-500" />
              <span className="text-orange-400 text-[6px]">◆</span>
              <span className="text-orange-400 text-[8px]">◆</span>
              <span className="text-orange-400 text-[6px]">◆</span>
              <div className="h-[1px] w-6 bg-gradient-to-l from-transparent to-orange-500" />
            </div>
          </div>

          {/* Right: Streak status & weekday logs */}
          <div className="flex-1 w-full text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-orange-500">
              <Flame className="w-5 h-5 fill-current" />
              <span className="text-xs font-bold uppercase tracking-wider">{isHi ? "साधना यात्रा" : "Sadhana Yatra"}</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight mt-2">
              {headingText}
            </h2>
            
            <p className="text-xs md:text-sm text-white/50 mt-1 font-medium">
              {subtitleText}
            </p>

            {/* Connecting weekdays progress bar */}
            <div className="relative flex items-center justify-between w-full max-w-md md:max-w-none mx-auto md:mx-0 mt-6 pb-8 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {/* Connecting line container */}
              <div className="absolute left-[14px] right-[14px] top-[36px] h-[2px] bg-white/10 -z-10">
                {hasMeditated && orangeLinePosition.width > 0 && (
                  <div 
                    className="absolute h-full bg-gradient-to-r from-orange-500 to-amber-500 shadow-[0_0_8px_rgba(249,115,22,0.6)] transition-all duration-500"
                    style={{ 
                      left: `${orangeLinePosition.left}%`, 
                      width: `${orangeLinePosition.width}%` 
                    }}
                  />
                )}
              </div>
              
              {weekProgress.map((day, idx) => (
                <div key={idx} className="relative flex flex-col items-center gap-2 shrink-0 pb-7">
                  <span className="text-[13px] md:text-[10px] font-bold text-white/40">{day.label}</span>
                  
                  {hasMeditated && day.completed ? (
                    <div 
                      className="relative flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-white font-bold text-xs shadow-[0_0_12px_rgba(249,115,22,0.6)] border border-orange-400 animate-node-pulse"
                      style={{ animationDelay: `${idx * 0.25}s` }}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3px]" />
                    </div>
                  ) : (
                    <div 
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full bg-black/40 border border-white/10 text-transparent text-xs animate-node-pulse",
                        hasMeditated && day.isToday && "border-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.3)] bg-black/60"
                      )}
                      style={{ animationDelay: `${idx * 0.25}s` }}
                    />
                  )}

                  {hasMeditated && day.isToday && (
                    <div className="absolute bottom-0 flex flex-col items-center gap-0.5">
                      <span className="text-orange-500 text-[7px] leading-none animate-bounce">▲</span>
                      <span className="text-[13px] md:text-[9px] font-bold text-orange-500 tracking-wider uppercase">
                        {isHi ? "आज" : "Today"}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Stats Summary Panel */}
            <div className="bg-black/30 border border-white/5 rounded-2xl p-4 mt-2 w-full max-w-md md:max-w-none flex items-center justify-around divide-x divide-white/5 text-left">
              {/* Meditation Time */}
              <div className="flex items-center gap-3 pr-4 flex-1">
                <Clock3 className="w-5 h-5 text-orange-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[13px] md:text-[9px] font-bold text-white/30 uppercase tracking-wide">
                    {isHi ? "ध्यान का समय" : "Meditation Time"}
                  </p>
                  <p className="text-sm font-bold text-white truncate mt-0.5">
                    {formatMeditationTime(stats.totalMindfulMinutes)}
                  </p>
                </div>
              </div>
              
              {/* Sessions */}
              <div className="flex items-center gap-3 pl-4 flex-1">
                <Flower2 className="w-5 h-5 text-orange-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[13px] md:text-[9px] font-bold text-white/30 uppercase tracking-wide">
                    {isHi ? "सत्र" : "Sessions"}
                  </p>
                  <p className="text-sm font-bold text-white truncate mt-0.5">
                    {formatSessionsCount(stats.sessionCount)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: MEDITATION PRACTICES ( ध्यान के अभ्यास ) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold uppercase tracking-widest text-[13px] text-amber-200/50">
              {copy.practices.title}
            </h2>
            <button className="flex items-center gap-1.5 text-[13px] md:text-xs text-amber-400 hover:underline">
              <span>{copy.practices.viewAll}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: मंत्र ध्यान */}
            <div 
              onClick={() => onSelectPractice({ id: "mantra_jap_home" })}
              className="group relative h-full min-h-[160px] overflow-hidden rounded-3xl border border-white/5 bg-[#130d0a]/50 p-5 hover:border-orange-500/20 hover:bg-[#18100c]/70 transition-all cursor-pointer flex flex-col justify-between shadow-xl"
            >
              {/* Background Mahadev Image */}
              <div className="absolute inset-0 z-0">
                <img 
                  src={shivWallpaper} 
                  alt="" 
                  className="h-full w-full object-cover opacity-20 object-center transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0705] via-[#0d0705]/40 to-black/80" />
              </div>

              <div className="relative z-10 space-y-4">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 font-display text-2xl font-bold shadow-[0_0_20px_rgba(249,115,22,0.15)] group-hover:scale-105 transition-transform">
                  <span>ॐ</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors">
                    {copy.practices.mantra.title}
                  </h3>
                  <p className="text-[13px] md:text-xs text-white/50 mt-1 leading-relaxed">
                    {copy.practices.mantra.desc}
                  </p>
                </div>
              </div>
              <div className="relative z-10 mt-6 flex items-center justify-between border-t border-white/5 pt-3">
                <span className="text-[13px] md:text-[11px] text-white/40 font-medium">
                  {copy.practices.mantra.dur}
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:bg-orange-500/20 group-hover:border-orange-500/30 group-hover:translate-x-0.5 text-orange-400 transition-all">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Card 2: निर्देशित ध्यान */}
            <div 
              onClick={() => onSelectPractice(getPracticeById("focus_clarity")!)}
              className="bg-[#130d0a]/50 backdrop-blur-xl border border-white/5 rounded-3xl p-5 hover:border-purple-500/20 hover:bg-[#150d18]/70 transition-all cursor-pointer group flex flex-col justify-between h-full relative"
            >
              <div className="space-y-4">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.15)] group-hover:scale-105 transition-transform">
                  <Mic className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">
                    {copy.practices.guided.title}
                  </h3>
                  <p className="text-[13px] md:text-xs text-white/50 mt-1 leading-relaxed">
                    {copy.practices.guided.desc}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-3">
                <span className="text-[13px] md:text-[11px] text-white/40 font-medium">
                  {copy.practices.guided.dur}
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:bg-purple-500/20 group-hover:border-purple-500/30 group-hover:translate-x-0.5 text-purple-400 transition-all">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Card 3: श्वास ध्यान */}
            <div 
              onClick={() => onSelectPractice(getPracticeById("breath_box")!)}
              className="bg-[#130d0a]/50 backdrop-blur-xl border border-white/5 rounded-3xl p-5 hover:border-green-500/20 hover:bg-[#0d1811]/70 transition-all cursor-pointer group flex flex-col justify-between h-full relative"
            >
              <div className="space-y-4">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 border border-green-500/30 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.15)] group-hover:scale-105 transition-transform">
                  <Wind className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-green-400 transition-colors">
                    {copy.practices.breath.title}
                  </h3>
                  <p className="text-[13px] md:text-xs text-white/50 mt-1 leading-relaxed">
                    {copy.practices.breath.desc}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-3">
                <span className="text-[13px] md:text-[11px] text-white/40 font-medium">
                  {copy.practices.breath.dur}
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:bg-green-500/20 group-hover:border-green-500/30 group-hover:translate-x-0.5 text-green-400 transition-all">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

          </div>
        </section>



      </div>
    </div>
  );
}
