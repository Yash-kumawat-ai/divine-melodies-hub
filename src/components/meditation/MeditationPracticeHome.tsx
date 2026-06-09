import { BookOpen, Clock3, Flame, Flower2, Moon, Play, Sparkles, Timer, Wind, ArrowRight } from "lucide-react";
import { deities } from "@/data/bhajans";
import { useLanguage } from "@/hooks/useLanguage";
import { getMeditationCopy, getMeditationPracticeTitle } from "@/lib/meditation/meditationLocale";
import { OM } from "@/lib/meditation/unicode";
import {
  getPracticeById,
  QUICK_PRACTICE,
  type MeditationPractice,
  type PracticeType,
} from "@/lib/meditation/meditationTypes";
import { computeStats, loadPreferences, loadSessionLogs } from "@/lib/meditation/meditationStorage";
import { cn } from "@/lib/utils";
import meditationBg from "@/pages/images/meditation.webp";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const QUOTES = [
  { hi: "मौन में उतरें। चेतना को स्पर्श करें।", en: "Step into silence. Touch the consciousness." },
  { hi: "ध्यान नहीं, स्वयं से मिलन।", en: "Not just meditation, a meeting with self." },
  { hi: "जहाँ श्वास शांत होती है, वहाँ आत्मा बोलती है।", en: "Where breath calms, the soul speaks." },
  { hi: "भीतर की शांति, बाहर का प्रकाश।", en: "Inner peace, outer light." },
  { hi: "मन से परे। चेतना के करीब।", en: "Beyond the mind. Closer to consciousness." },
];

function TypewriterQuote({ quotes, language }: { quotes: typeof QUOTES, language: string }) {
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  const fullText = language === 'hi' ? quotes[index].hi : quotes[index].en;

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const handleTyping = () => {
      if (!isDeleting) {
        if (displayText.length < fullText.length) {
          setDisplayText(fullText.substring(0, displayText.length + 1));
          setTypingSpeed(100);
        } else {
          // Pause before "erasing" all at once
          timer = setTimeout(() => {
            setIsDeleting(true);
          }, 2500);
          return;
        }
      } else {
        // Instant erase and move to next
        setDisplayText("");
        setIsDeleting(false);
        setIndex((prev) => (prev + 1) % quotes.length);
        setTypingSpeed(500); // Small pause before next quote starts typing
      }

      timer = setTimeout(handleTyping, typingSpeed);
    };

    timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, index, fullText, typingSpeed, quotes.length]);

  return (
    <div className="flex flex-col items-start min-h-[80px] sm:min-h-[110px]">
      <h1 className="font-display text-xl font-bold leading-tight text-white drop-shadow-[0_2px_15px_rgba(0,0,0,0.9)] sm:text-2xl md:text-3xl lg:text-4xl text-left transition-all duration-300">
        {displayText}
        <span className="ml-1 inline-block w-[3px] h-[0.8em] bg-amber-400 animate-pulse align-middle" />
      </h1>
    </div>
  );
}

const ENTRY: { type: PracticeType; label: string; desc: string; icon: typeof Flower2; color: string }[] = [
  { type: "mantra", label: "mantra", desc: "mantra", icon: Flower2, color: "from-amber-500/30 to-orange-600/10" },
  { type: "breath", label: "breath", desc: "breath", icon: Wind, color: "from-sky-500/25 to-teal-500/10" },
  { type: "sleep", label: "sleep", desc: "sleep", icon: Moon, color: "from-indigo-500/25 to-violet-500/10" },
  { type: "focus", label: "focus", desc: "focus", icon: Sparkles, color: "from-rose-500/25 to-amber-500/10" },
];

const JOURNEY_IDS = ["mantra_shiva", "mantra_krishna", "mantra_radhe", "mantra_ram", "mantra_narayana"] as const;

type MeditationPracticeHomeProps = {
  onSelectPractice: (practice: MeditationPractice) => void;
  onQuickStart: () => void;
};

function deityForPractice(practice: MeditationPractice) {
  const slug =
    practice.mantraId === "jai_shree_ram"
      ? "rama"
      : practice.mantraId === "hare_krishna" || practice.mantraId === "radhe_radhe"
        ? "krishna"
        : practice.mantraId === "om_namo_narayanaya"
          ? "lakshmi"
          : "shiva";
  return deities.find((d) => d.slug === slug);
}

export default function MeditationPracticeHome({ onSelectPractice, onQuickStart }: MeditationPracticeHomeProps) {
  const { language } = useLanguage();
  const copy = getMeditationCopy(language);
  const stats = computeStats(loadSessionLogs());
  const prefs = loadPreferences();
  const lastPractice = prefs.lastPracticeId ? getPracticeById(prefs.lastPracticeId) : null;

  const particles = useMemo(() => Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    size: Math.random() * 3 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 10,
  })), []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#080504] via-[#0c0608] to-[#050306] px-4 pb-28 pt-4 text-amber-50 md:pb-12 md:pt-8">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(251,146,60,0.12),transparent),radial-gradient(circle_at_90%_20%,rgba(244,63,94,0.05),transparent_40%)]" />

      <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
        {/* Hero */}
        <section className="relative min-h-[700px] sm:min-h-[800px] lg:min-h-[900px] overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl shadow-black/60 group flex flex-col">
          {/* Background with Parallax effect */}
          <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
            className="absolute inset-0 z-0 overflow-hidden"
          >
            <img
              src={meditationBg}
              alt=""
              className="h-[125%] w-full object-cover object-[75%_top] md:object-[center_top] -translate-y-[20%] transition-transform duration-700 group-hover:scale-105"
            />
          </motion.div>
          
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/20 to-transparent z-[1]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 z-[1]" />

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
                className="absolute w-1 h-1 bg-amber-400/40 rounded-full blur-[1px]"
                style={{ left: `${p.x}%`, bottom: 0 }}
              />
            ))}
          </div>

          <div className="relative z-10 flex-1 flex flex-col p-7 md:p-12 lg:p-16">
            {/* Top Section */}
            <div className="flex flex-col items-start max-w-4xl">
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex w-full items-center justify-center gap-4 text-amber-500/60"
              >
                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-current" />
                <div className="flex items-center gap-3 text-amber-400/90">
                  <span className="text-lg font-bold">||</span>
                  <span className="font-display text-xl font-bold tracking-[0.15em]">{language === 'hi' ? 'जय श्री राम' : 'Jai Shri Ram'}</span>
                  <span className="text-lg font-bold">||</span>
                </div>
                <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-current" />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200/90 backdrop-blur-xl"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                {copy.home.badge}
              </motion.div>
              
              <div className="mt-4 sm:mt-6">
                <TypewriterQuote quotes={QUOTES} language={language} />
              </div>
            </div>

            {/* Bottom Section - Pushed to the absolute bottom */}
            <div className="mt-auto flex flex-col gap-6">
              <div className="flex flex-col items-start gap-4">
                {/* Continue Card (Glassmorphism) */}
                <AnimatePresence mode="wait">
                  {lastPractice && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={onQuickStart}
                      className="group/card relative flex w-full max-w-md items-center gap-5 overflow-hidden rounded-3xl border border-white/20 bg-white/[0.03] p-5 backdrop-blur-2xl transition-all hover:bg-white/[0.06] hover:border-white/30"
                    >
                      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-600/20 border border-amber-500/30">
                        <Play className="h-7 w-7 fill-amber-500 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                        {/* Breathing Glow behind icon */}
                        <motion.div 
                          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 4, repeat: Infinity }}
                          className="absolute inset-0 rounded-2xl bg-amber-500/20 blur-xl"
                        />
                      </div>
                      
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-200/60 mb-1">
                          {language === 'hi' ? 'पिछला ध्यान' : 'Previous Session'}
                        </p>
                        <h3 className="text-lg font-bold text-white truncate">
                          {getMeditationPracticeTitle(lastPractice, language)}
                        </h3>
                        <div className="mt-2 flex items-center gap-3">
                           <div className="h-1 flex-1 rounded-full bg-white/10 overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: "65%" }}
                                className="h-full bg-gradient-to-r from-orange-500 to-amber-400"
                              />
                           </div>
                           <span className="text-[10px] font-bold text-white/40 tabular-nums uppercase tracking-tighter">
                              {language === 'hi' ? 'जारी रखें' : 'Continue'}
                           </span>
                           <ArrowRight className="h-3.5 w-3.5 text-amber-400 group-hover/card:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </motion.button>
                  )}
                </AnimatePresence>

                {!lastPractice && (
                  <button
                    type="button"
                    onClick={() => onSelectPractice(getPracticeById("mantra_shiva")!)}
                    className="flex min-h-[3.75rem] items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 px-8 py-3 text-lg font-bold text-[#1a0f08] shadow-[0_10px_40px_-10px_rgba(249,115,22,0.5)] transition hover:scale-[1.03] active:scale-[0.97]"
                  >
                    <Play className="h-6 w-6 fill-current" />
                    <span>{copy.home.beginJapa}</span>
                  </button>
                )}
              </div>

              {/* Stats Grid - Moved inside Hero to be below buttons */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {[
                  { label: copy.home.minutes, value: stats.totalMindfulMinutes, icon: Clock3, color: "text-blue-400" },
                  { label: copy.home.streak, value: stats.streakDays, icon: Flame, color: "text-orange-500" },
                  { label: copy.home.sessions, value: stats.sessionCount, icon: Timer, color: "text-emerald-400" },
                ].map((item, idx) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className="relative overflow-hidden flex flex-col sm:flex-row items-center justify-between p-3 sm:p-5 rounded-2xl sm:rounded-[2rem] border border-white/10 bg-black/20 backdrop-blur-2xl transition-all hover:bg-black/30 group/stat"
                  >
                    <div className="flex flex-col items-center sm:items-start">
                      <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] text-amber-200/40 mb-1 group-hover/stat:text-amber-200/60 transition-colors truncate w-full text-center sm:text-left">
                        {item.label}
                      </p>
                      <p className="text-xl sm:text-3xl font-display font-bold text-white tracking-tight">
                        {item.value}
                      </p>
                    </div>
                    <div className={cn("hidden sm:flex p-3 rounded-xl bg-white/[0.03] border border-white/5 transition-transform group-hover/stat:scale-110", item.color)}>
                      <item.icon className="h-5 w-5" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Practice types */}
        <section>
          <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-widest text-amber-200/55">
            {copy.home.chooseNaam}
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {ENTRY.map((e) => {
              const Icon = e.icon;
              const entryCopy = copy.entry[e.type];
              const practice =
                e.type === "mantra"
                  ? getPracticeById("mantra_shiva")!
                  : e.type === "breath"
                    ? getPracticeById("breath_box")!
                    : e.type === "sleep"
                      ? getPracticeById("sleep_rest")!
                      : getPracticeById("focus_clarity")!;

              return (
                <button
                  key={e.type}
                  type="button"
                  onClick={() => onSelectPractice(practice)}
                  className={cn(
                    "group flex min-h-[7.5rem] flex-col rounded-2xl border border-amber-200/15 bg-gradient-to-br p-4 text-left shadow-md shadow-black/25 transition active:scale-[0.98] hover:border-amber-300/35",
                    e.color,
                  )}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-amber-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-auto pt-3 text-sm font-semibold leading-snug text-amber-50">{entryCopy.label}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-4 text-amber-100/60">{entryCopy.desc}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Deity journeys — horizontal scroll on mobile */}
        <section>
          <div className="mb-3 flex items-center justify-between gap-3 px-1">
            <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-200/55">
              <Flame className="h-3.5 w-3.5 text-orange-400" />
              {copy.home.deityJourneys}
            </h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-5 md:overflow-visible [&::-webkit-scrollbar]:hidden">
            {JOURNEY_IDS.map((id) => {
              const practice = getPracticeById(id);
              if (!practice) return null;
              const deity = deityForPractice(practice);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectPractice(practice)}
                  className="group flex w-[9.5rem] shrink-0 flex-col overflow-hidden rounded-2xl border border-amber-200/15 bg-black/35 text-left shadow-md transition active:scale-[0.98] hover:border-amber-300/30 md:w-auto"
                >
                  {deity?.imageUrl ? (
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/40">
                      <img
                        src={deity.imageUrl}
                        alt=""
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    </div>
                  ) : null}
                  <div className="p-3">
                    <p className="truncate text-sm font-semibold text-amber-50">
                      {getMeditationPracticeTitle(practice, language)}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-amber-100/55">
                      {practice.type === "mantra" ? copy.home.mantraDesc : copy.home.guidedDesc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Practice note */}
        <section className="rounded-2xl border border-amber-200/12 bg-amber-500/5 p-4 md:p-5">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-200/55">
            <BookOpen className="h-3.5 w-3.5" />
            {copy.home.practiceNote}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-amber-100/70">{copy.home.practiceNoteBody}</p>
        </section>
      </div>
    </div>
  );
}
