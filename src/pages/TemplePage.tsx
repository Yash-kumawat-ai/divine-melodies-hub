import { useCallback, useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Flame, Flower2, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { deities } from "@/data/bhajans";
import JapaCounter from "@/components/devotion/JapaCounter";
import OfferingMiniPanel from "@/components/devotion/OfferingMiniPanel";
import { loadDevotionProgress } from "@/lib/devotion/devotionStorage";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import templeDoor from "@/pages/images/temple_door_high_quality.webp";

type OfferingType = "flower" | "bell" | "diya";

const TEMPLE_DEITIES = deities.filter((d) => d.imageUrl);

// Helper to synthesize a realistic brass temple bell sound
const playBellSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    // Combining harmonic frequencies for a rich bell timbre
    const freqs = [440, 554.37, 659.25, 880, 1200, 1600];
    freqs.forEach((f, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, now);
      
      // Decays exponentially (higher frequencies fade quicker)
      const duration = 2.8 / (index + 1);
      gain.gain.setValueAtTime(index === 0 ? 0.45 : 0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + duration);
    });
  } catch (e) {
    console.error("Audio Context is not supported or was blocked by browser policies", e);
  }
};

export default function TemplePage() {
  const { t, language } = useLanguage();
  const [searchParams] = useSearchParams();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Track active deity in TEMPLE_DEITIES
  const initialSlug = searchParams.get("deity") ?? TEMPLE_DEITIES[0]?.slug ?? "krishna";
  const initialIdx = TEMPLE_DEITIES.findIndex((d) => d.slug === initialSlug);
  const [activeIndex, setActiveIndex] = useState(initialIdx !== -1 ? initialIdx : 0);
  
  const [gateOpen, setGateOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showJapa, setShowJapa] = useState(false);
  const [offering, setOffering] = useState<OfferingType | null>(null);
  const [progress, setProgress] = useState(loadDevotionProgress);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Offering triggers
  const [flowerRain, setFlowerRain] = useState(false);
  const [bellRinging, setBellRinging] = useState(false);
  const [diyaGlowing, setDiyaGlowing] = useState(false);

  // Swipe detection coordinates
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [touchEndY, setTouchEndY] = useState<number | null>(null);

  const deity = TEMPLE_DEITIES[activeIndex] ?? TEMPLE_DEITIES[0];

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    
    // Auto-open gate on page load
    const timer = setTimeout(() => {
      setGateOpen(true);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  // Update active deity if URL search param changes
  useEffect(() => {
    const fromUrl = searchParams.get("deity");
    if (fromUrl) {
      const idx = TEMPLE_DEITIES.findIndex((d) => d.slug === fromUrl);
      if (idx !== -1 && idx !== activeIndex) {
        selectDeity(idx);
      }
    }
  }, [searchParams]);

  // Centering active deity in bottom reels carousel
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const activeBtn = container.children[activeIndex] as HTMLElement;
    if (activeBtn) {
      const containerWidth = container.offsetWidth;
      const btnWidth = activeBtn.offsetWidth;
      const btnLeft = activeBtn.offsetLeft;
      container.scrollTo({
        left: btnLeft - containerWidth / 2 + btnWidth / 2,
        behavior: "smooth",
      });
    }
  }, [activeIndex]);

  const selectDeity = (index: number) => {
    if (index === activeIndex || isAnimating) return;
    setIsAnimating(true);
    setGateOpen(false); // Close the gate

    // Wait for the gate to fully close
    setTimeout(() => {
      setActiveIndex(index);
      // Wait a tiny moment with closed gates to load background image smoothly
      setTimeout(() => {
        setGateOpen(true);
        setIsAnimating(false);
      }, 150);
    }, 800);
  };

  const handlePrevDeity = () => {
    if (isAnimating) return;
    const nextIdx = activeIndex === 0 ? TEMPLE_DEITIES.length - 1 : activeIndex - 1;
    selectDeity(nextIdx);
  };

  const handleNextDeity = () => {
    if (isAnimating) return;
    const nextIdx = activeIndex === TEMPLE_DEITIES.length - 1 ? 0 : activeIndex + 1;
    selectDeity(nextIdx);
  };

  // Swipe detection handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchEndY(null);
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
    setTouchEndY(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchStartY || !touchEndX || !touchEndY) return;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    const minSwipeDistance = 50;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal swipe
      if (diffX > minSwipeDistance) {
        handleNextDeity(); // Swiped left -> next
      } else if (diffX < -minSwipeDistance) {
        handlePrevDeity(); // Swiped right -> prev
      }
    } else {
      // Vertical swipe (like Reels scrolling!)
      if (diffY > minSwipeDistance) {
        handleNextDeity(); // Swiped up -> next
      } else if (diffY < -minSwipeDistance) {
        handlePrevDeity(); // Swiped down -> prev
      }
    }
  };

  const refreshProgress = useCallback(() => setProgress(loadDevotionProgress()), []);

  const triggerFlowerOffering = () => {
    setFlowerRain(true);
    setTimeout(() => setFlowerRain(false), 4000);
  };

  const triggerBellOffering = () => {
    setBellRinging(true);
    playBellSound();
    setTimeout(() => setBellRinging(false), 2000);
  };

  const triggerDiyaOffering = () => {
    setDiyaGlowing(true);
    setTimeout(() => setDiyaGlowing(false), 3500);
  };

  const handleOfferingSelect = (type: OfferingType) => {
    if (type === "flower") {
      triggerFlowerOffering();
    } else if (type === "bell") {
      triggerBellOffering();
    } else if (type === "diya") {
      triggerDiyaOffering();
    }
    setOffering(type);
  };

  if (!deity) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p>{t("templeNoDeity")}</p>
        <Link to="/all-deities" className="mt-4 inline-block text-primary underline">
          {t("allDeities")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-[radial-gradient(ellipse_at_top,#2f1204_0%,#0f0314_50%,#05050a_100%)] text-amber-50 relative overflow-x-hidden">
      
      {/* Immersive background lights */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-orange-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto max-w-lg px-4 pb-8 pt-6 md:pb-12 md:pt-10 relative z-10">
        <header className="text-center">
          <h1 className="font-display text-2xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 md:text-3xl filter drop-shadow-sm">
            {t("templeTitle") || "Sacred Shrine"}
          </h1>
          <p className="mt-1 text-sm text-amber-100/70">{t("templeSubtitle") || "Enter the temple of peaceful devotion"}</p>
          {progress.currentStreak > 0 && (
            <motion.p 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-200 shadow-inner"
            >
              🌸 {t("templePresence") || "Sadhana Streak"}: {progress.currentStreak} {t("templeDays") || "Days"}
            </motion.p>
          )}
        </header>

        {/* Temple Frame & Gate Wrapper */}
        <div 
          className="relative mx-auto mt-8 w-fit p-4 bg-gradient-to-b from-[#251308]/40 to-[#0c0502]/60 rounded-[2.5rem] border border-amber-500/15 shadow-2xl backdrop-blur-sm select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Temple Arch Header */}
          <div className="relative w-48 h-12 mx-auto -mb-2.5 z-20">
            <svg viewBox="0 0 200 60" className="w-full h-full text-amber-500/90 fill-current filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]">
              <path d="M 100,5 C 75,25 25,32 5,55 L 195,55 C 175,32 125,25 100,5 Z" />
              <circle cx="100" cy="5" r="4.5" className="text-yellow-300" />
              <line x1="100" y1="5" x2="100" y2="-12" stroke="currentColor" strokeWidth="2.5" />
              <path d="M 100,-12 L 122,-5 L 100,2 Z" className="text-orange-500 fill-current" />
            </svg>
          </div>

          {/* Shrine Portal - Matches the exact 2:3 aspect ratio of the door image */}
          <div 
            className="relative w-72 h-[27rem] md:w-80 md:h-[30rem] mx-auto" 
            style={{ perspective: "1200px" }}
          >
            {/* Shrine Pillars & Arch Border Overlay */}
            <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-amber-950 via-amber-700 to-amber-900 border-r border-amber-400/20 z-30 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-amber-950 via-amber-700 to-amber-900 border-l border-amber-400/20 z-30 pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-amber-950 via-amber-700 to-amber-900 border-b border-amber-400/20 z-30 pointer-events-none" />

            {/* Shrine Inner Space (z-10, overflow-hidden to crop falling flowers & blurred aura, but not the doors!) */}
            <div className="absolute inset-0 bg-[#0c0806] overflow-hidden rounded-2xl ring-4 ring-amber-500/25 shadow-[0_0_32px_rgba(245,158,11,0.2)] z-10 flex items-center justify-center">
              
              {/* Blurred background version of the deity image to provide immersive warmth without cropping */}
              {deity.imageUrl ? (
                <img
                  src={deity.imageUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover blur-2xl opacity-25 scale-110 z-0 pointer-events-none"
                />
              ) : null}

              {/* Divine Glowing Aura */}
              <motion.div
                animate={{ 
                  scale: [1, 1.15, 1], 
                  opacity: [0.35, 0.6, 0.35] 
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 4, 
                  ease: "easeInOut" 
                }}
                className="absolute w-52 h-52 bg-amber-500/20 rounded-full blur-[45px] z-0"
              />

              {/* CRISP ORIGINAL DEITY IMAGE (object-contain so nothing is cropped or cut off) */}
              {deity.imageUrl ? (
                <motion.img
                  key={deity.slug}
                  initial={{ scale: 1.05, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  src={deity.imageUrl}
                  alt={deity.name}
                  className="h-full w-full object-contain z-10 pointer-events-none p-5"
                  width={320}
                  height={480}
                />
              ) : null}

              {/* Ambient Shrine Shadows for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/25 pointer-events-none z-15" />

              {/* Bell Offering / Hanging Bell */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center origin-top">
                <div className="w-0.5 h-10 bg-amber-600/50" />
                <motion.div
                  animate={bellRinging ? { 
                    rotate: [0, -18, 14, -10, 6, -3, 0] 
                  } : {}}
                  transition={{ duration: 1.6, ease: "easeInOut" }}
                  onClick={triggerBellOffering}
                  className="cursor-pointer -mt-1 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
                  style={{ originX: 0.5, originY: 0 }}
                >
                  <svg viewBox="0 0 30 30" className="w-7 h-7 text-amber-500 fill-current hover:text-amber-400 transition-colors">
                    <path d="M 15,3 C 11,3 8,6 8,11 L 5,20 L 25,20 L 22,11 C 22,6 19,3 15,3 Z" />
                    <rect x="4" y="20" width="22" height="2" rx="1" className="text-amber-400" />
                    <motion.circle 
                      cx="15" cy="23" r="2.5" 
                      animate={bellRinging ? { x: [-2, 2, -1.5, 1.5, 0] } : {}}
                      transition={{ duration: 1.6 }}
                      className="text-yellow-300" 
                    />
                  </svg>
                </motion.div>
              </div>

              {/* Flower Offering Falling Petals Rain */}
              {flowerRain && (
                <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                  {[...Array(24)].map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ y: -20, x: Math.random() * 280, opacity: 1, rotate: 0 }}
                      animate={{ 
                        y: 450, 
                        x: Math.random() * 280 + (Math.random() - 0.5) * 40,
                        opacity: 0,
                        rotate: Math.random() * 360 
                      }}
                      transition={{ duration: 2.2 + Math.random() * 1.3, ease: "linear" }}
                      className="absolute text-lg"
                    >
                      {["🌸", "🌺", "🌼", "🪷"][Math.floor(Math.random() * 4)]}
                    </motion.span>
                  ))}
                </div>
              )}

              {/* Diya Flame Overlay */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
                <motion.div
                  animate={{ 
                    scale: diyaGlowing ? [1, 1.4, 1.15, 1.4, 1.15] : [1, 1.12, 1],
                    opacity: diyaGlowing ? [0.8, 1, 0.9, 1, 0.9] : [0.75, 0.95, 0.75],
                    rotate: [-1, 2, -1]
                  }}
                  transition={{ 
                    repeat: diyaGlowing ? 0 : Infinity, 
                    duration: diyaGlowing ? 0.7 : 1.3, 
                    ease: "easeInOut" 
                  }}
                  className={cn(
                    "w-3 h-5 bg-gradient-to-t from-orange-600 via-amber-400 to-yellow-100 rounded-full blur-[1px] shadow-[0_0_12px_rgba(245,158,11,0.85)]",
                    diyaGlowing && "w-4 h-7 blur-[0.5px] shadow-[0_0_22px_rgba(245,158,11,1)]"
                  )}
                  style={{ originY: 1 }}
                />
                <div className="w-7 h-3 bg-amber-800 rounded-b-full border-t border-amber-600 shadow-md relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3.5 h-0.5 bg-amber-500 rounded-full" />
                </div>
              </div>
            </div>

            {/* Left 3D swinging Door (Rendered outside overflow-hidden child, so it swings outwards cleanly!) */}
            <motion.div
              initial={{ rotateY: 0 }}
              animate={{ rotateY: gateOpen ? -95 : 0 }}
              transition={{ duration: 0.85, ease: [0.25, 1, 0.5, 1] }}
              className="absolute left-0 top-0 w-1/2 h-full origin-left overflow-hidden shadow-[4px_0_12px_rgba(0,0,0,0.6)] z-20 rounded-l-2xl border-l border-y border-amber-500/30"
              style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
            >
              <img
                src={templeDoor}
                alt="Left Gate"
                className="absolute top-0 left-0 h-full w-[200%] max-w-none object-cover object-left"
              />
              {/* Golden Handle */}
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-11 bg-gradient-to-r from-yellow-300 via-amber-500 to-yellow-600 rounded-full border border-yellow-200/50 shadow-md flex items-center justify-center z-30">
                <div className="w-1.5 h-1.5 bg-yellow-100 rounded-full" />
              </div>
            </motion.div>

            {/* Right 3D swinging Door (Rendered outside overflow-hidden child, so it swings outwards cleanly!) */}
            <motion.div
              initial={{ rotateY: 0 }}
              animate={{ rotateY: gateOpen ? 95 : 0 }}
              transition={{ duration: 0.85, ease: [0.25, 1, 0.5, 1] }}
              className="absolute right-0 top-0 w-1/2 h-full origin-right overflow-hidden shadow-[-4px_0_12px_rgba(0,0,0,0.6)] z-20 rounded-r-2xl border-r border-y border-amber-500/30"
              style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
            >
              <img
                src={templeDoor}
                alt="Right Gate"
                className="absolute top-0 right-0 h-full w-[200%] max-w-none object-cover object-right"
              />
              {/* Golden Handle */}
              <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-3.5 h-11 bg-gradient-to-l from-yellow-300 via-amber-500 to-yellow-600 rounded-full border border-yellow-200/50 shadow-md flex items-center justify-center z-30">
                <div className="w-1.5 h-1.5 bg-yellow-100 rounded-full" />
              </div>
            </motion.div>

            {/* Navigation Arrows overlay on the Shrine */}
            <button
              type="button"
              onClick={handlePrevDeity}
              disabled={isAnimating}
              aria-label="Previous deity"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/50 border border-amber-500/30 flex items-center justify-center text-amber-300 hover:bg-black/75 hover:border-amber-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-md animate-pulse"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextDeity}
              disabled={isAnimating}
              aria-label="Next deity"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/50 border border-amber-500/30 flex items-center justify-center text-amber-300 hover:bg-black/75 hover:border-amber-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-md animate-pulse"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Deity Details text */}
          <div className="mt-4 text-center px-2">
            <h2 className="font-display text-xl text-amber-100 font-semibold tracking-wide">
              {language === "hi" ? deity.nameHindi : deity.name}
            </h2>
            <p className="mt-1 text-xs text-amber-200/50 leading-relaxed max-w-xs mx-auto italic">
              {deity.description}
            </p>
          </div>
        </div>

        {/* Deity Reels horizontal snapped container */}
        <div className="mt-8">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-amber-500/80 mb-3.5 flex items-center justify-center gap-1.5">
            ✦ {language === "hi" ? "देवता मंडप" : "Deity Shrine Reels"} ✦
          </p>
          
          <div 
            ref={scrollContainerRef}
            className="flex gap-3.5 overflow-x-auto px-4 py-3 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-[#180a04]/40 border border-amber-500/10 rounded-2.5xl"
          >
            {TEMPLE_DEITIES.map((d, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={d.slug}
                  type="button"
                  onClick={() => selectDeity(index)}
                  disabled={isAnimating}
                  className={cn(
                    "flex shrink-0 snap-center flex-col items-center gap-1.5 rounded-xl border p-2 transition-all duration-300 w-20 relative overflow-hidden",
                    isActive
                      ? "border-amber-400 bg-amber-500/15 shadow-[0_0_15px_rgba(245,158,11,0.2)] scale-105"
                      : "border-amber-500/10 bg-black/40 opacity-65 hover:opacity-95",
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 to-transparent pointer-events-none" />
                  )}
                  {d.imageUrl ? (
                    <div className="relative">
                      <img 
                        src={d.imageUrl} 
                        alt="" 
                        className={cn(
                          "h-11 w-11 rounded-full object-cover border-2 transition-transform duration-300",
                          isActive ? "border-amber-400 scale-105" : "border-amber-500/20"
                        )} 
                        loading="lazy" 
                      />
                      {isActive && (
                        <span className="absolute -top-1 -right-1 text-[10px] animate-pulse">✨</span>
                      )}
                    </div>
                  ) : (
                    <span className="flex h-11 w-11 items-center justify-center text-xl bg-slate-900 rounded-full">{d.emoji}</span>
                  )}
                  <span className="truncate text-[9px] max-w-full font-semibold text-amber-200">
                    {language === "hi" ? d.nameHindi : d.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Offerings Grid */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handleOfferingSelect("flower")}
            className="flex flex-col items-center gap-2 rounded-2xl border border-amber-500/15 bg-black/35 py-4 transition active:scale-95 hover:bg-amber-500/10 hover:border-amber-500/30"
          >
            <Flower2 className="h-6 w-6 text-amber-400" />
            <span className="text-xs font-semibold text-amber-100">{t("templeFlower") || "Pushpa"}</span>
          </button>
          <button
            type="button"
            onClick={() => handleOfferingSelect("bell")}
            className="flex flex-col items-center gap-2 rounded-2xl border border-amber-500/15 bg-black/35 py-4 transition active:scale-95 hover:bg-amber-500/10 hover:border-amber-500/30"
          >
            <Bell className="h-6 w-6 text-amber-400" />
            <span className="text-xs font-semibold text-amber-100">{t("templeBell") || "Ghanta"}</span>
          </button>
          <button
            type="button"
            onClick={() => handleOfferingSelect("diya")}
            className="flex flex-col items-center gap-2 rounded-2xl border border-amber-500/15 bg-black/35 py-4 transition active:scale-95 hover:bg-amber-500/10 hover:border-amber-500/30"
          >
            <Flame className="h-6 w-6 text-amber-400" />
            <span className="text-xs font-semibold text-amber-100">{t("templeDiya") || "Aarti"}</span>
          </button>
        </div>

        {/* Sadhana Japa & Meditation links */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setShowJapa(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-950/20 active:scale-98 transition-all"
          >
            <Sparkles className="h-4 w-4" />
            {t("templeJapa") || "Start Japa Mala"}
          </button>
          <Link
            to="/meditation"
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-amber-500/35 bg-black/20 hover:bg-amber-500/5 py-3.5 text-sm font-bold text-amber-200 transition-all text-center"
          >
            {t("meditation") || "Dhyana"}
          </Link>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-amber-200/40">
          {t("templeNaradHint") || "Seek spiritual guidance from Narad Muni using Kirtan AI chatbot at the home page."}
        </p>
        <Link
          to={`/deity/${deity.slug}`}
          className="mt-3 block text-center text-sm font-semibold text-amber-400 hover:text-amber-300 underline-offset-4 hover:underline transition-colors"
        >
          {t("templeBhajans") || "Listen to Devotional Songs"} →
        </Link>
      </div>

      <AnimatePresence>
        {showJapa && (
          <JapaCounter
            deitySlug={deity.slug}
            reducedMotion={reducedMotion}
            onClose={() => setShowJapa(false)}
            onComplete={refreshProgress}
          />
        )}
        {offering && (
          <OfferingMiniPanel
            initialType={offering}
            deitySlug={deity.slug}
            reducedMotion={reducedMotion}
            onClose={() => setOffering(null)}
            onDone={() => {
              setOffering(null);
              refreshProgress();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
