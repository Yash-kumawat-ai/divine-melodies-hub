import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Mic,
  MicOff,
  Sparkles,
  Info,
  ArrowLeft,
  Settings,
  Smartphone,
  Lock,
  ChevronDown,
  Check,
  Music,
  Flower2,
  Flame,
  Trophy,
  Zap,
  Sliders,
  Edit3,
  Clock,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";
import { fetchLeaderboardRankings, type Mantra } from "@/lib/mantraJapa/mantraJapaApi";
import { useMantraJapa } from "@/hooks/useMantraJapa";
import { transcriptMatchesActiveMantra } from "@/lib/meditation/japaVoice";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams, useNavigate } from "react-router-dom";

// Deity images for leaderboard avatars
import shivWallpaper from "@/pages/images/shiv_wallpaper.webp";
import mayapurTvImg from "@/pages/images/radha_krishna_hd mayapur tv.webp";
import salangpurHanumanImg from "@/pages/images/Hanumanji_HD_WebP.webp";
import hanumanDevotionalImg from "@/pages/images/Hanuman_Devotional_High_Quality.webp";
import ramJiSvg from "@/pages/images/svg/ram ji.svg";
import playCircleSvg from "@/pages/images/svg/play-circle-svgrepo-com.svg";

// ─── SHANKH & BELL SYNTH SOUND GENERATOR ──────────────────────────
const playBellSound = (volumeEnabled: boolean) => {
  if (!volumeEnabled) return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    // Fundamental Frequency (High clear tone)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.frequency.setValueAtTime(880, now); // A5 note
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    // Overtones for metallic ringing character
    const overtones = [1200, 1600, 2200];
    const volumes = [0.06, 0.04, 0.02];
    const decays = [1.2, 0.8, 0.4];
    
    overtones.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(volumes[idx], now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decays[idx]);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + decays[idx]);
    });
    
    osc1.start(now);
    osc1.stop(now + 2.0);
  } catch (err) {
    console.error("Synthesized bell error:", err);
  }
};

const playConchSound = (volumeEnabled: boolean) => {
  if (!volumeEnabled) return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    // Simulate a deep resonant shankh (conch) blowing sound using oscillator detune & vibrato
    const osc = ctx.createOscillator();
    const vibrato = ctx.createOscillator();
    const vibratoGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(145, now); // Low resonant pitch
    osc.frequency.linearRampToValueAtTime(165, now + 1.5);
    osc.frequency.linearRampToValueAtTime(135, now + 3.5);
    
    vibrato.frequency.setValueAtTime(5, now); // 5Hz vibrato
    vibratoGain.gain.setValueAtTime(8, now); // pitch variation amount
    
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(450, now);
    filter.Q.setValueAtTime(3, now);
    
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.8); // swell in
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.0); // fade out
    
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    vibrato.start(now);
    osc.start(now);
    
    vibrato.stop(now + 4.0);
    osc.stop(now + 4.0);
  } catch (err) {
    console.error("Synthesized conch error:", err);
  }
};

// ─── MALA THEMES (3 distinct looks, CSS-only) ───────────────────
export type MalaTypeId = "rudraksha" | "tulsi" | "sandalwood";

const MALA_STORAGE_KEY = "japa_mala_type";

const MALA_TYPE_IDS: MalaTypeId[] = ["rudraksha", "tulsi", "sandalwood"];

type MalaTheme = {
  labelHi: string;
  labelEn: string;
  thread: string;
  beadDone: string;
  beadTodo: string;
  beadShadow: string;
  sumeru: string;
  sumeruBorder: string;
  sumeruGlow: string;
  tasselCap: string;
  tasselFringe: string;
  activeRing: string;
  activeGlow: string;
  previewBeads: [string, string, string];
};

export const MALA_THEMES: Record<MalaTypeId, MalaTheme> = {
  rudraksha: {
    labelHi: "रुद्राक्ष",
    labelEn: "Rudraksha",
    thread: "rgba(62, 32, 16, 0.55)",
    beadDone:
      "radial-gradient(circle at 32% 28%, #8B5A2B 0%, #5C3310 45%, #3A1F0A 78%, #2A1508 100%)",
    beadTodo:
      "radial-gradient(circle at 32% 28%, #6B4423 0%, #4A2C12 50%, #2E1A0C 100%)",
    beadShadow: "0 1px 3px rgba(42,21,8,0.55), inset 0 -2px 4px rgba(0,0,0,0.35)",
    sumeru: "radial-gradient(circle at 35% 30%, #C4A35A 0%, #8B6914 40%, #5C4010 100%)",
    sumeruBorder: "#D4AF37",
    sumeruGlow: "0 0 12px rgba(139,105,20,0.55)",
    tasselCap: "#B8860B",
    tasselFringe: "linear-gradient(to bottom, #651317, #8B1E15, transparent)",
    activeRing: "#651317",
    activeGlow: "0 0 12px rgba(101,19,23,0.55)",
    previewBeads: ["#5C3310", "#3A1F0A", "#8B5A2B"],
  },
  tulsi: {
    labelHi: "तुलसी",
    labelEn: "Tulsi",
    thread: "rgba(74, 92, 48, 0.5)",
    beadDone:
      "radial-gradient(circle at 32% 28%, #A67C52 0%, #6B7F3B 42%, #4A5C30 75%, #3A4A24 100%)",
    beadTodo:
      "radial-gradient(circle at 32% 28%, #8B9A6B 0%, #5A6B40 55%, #3F4D2E 100%)",
    beadShadow: "0 1px 3px rgba(58,74,36,0.4), inset 0 -2px 3px rgba(0,0,0,0.2)",
    sumeru: "radial-gradient(circle at 35% 30%, #C4B896 0%, #8B9A5A 45%, #5A6B38 100%)",
    sumeruBorder: "#A8B86A",
    sumeruGlow: "0 0 10px rgba(107,127,59,0.45)",
    tasselCap: "#6B7F3B",
    tasselFringe: "linear-gradient(to bottom, #4A5C30, #6B7F3B, transparent)",
    activeRing: "#4A5C30",
    activeGlow: "0 0 12px rgba(74,92,48,0.5)",
    previewBeads: ["#6B7F3B", "#4A5C30", "#A67C52"],
  },
  sandalwood: {
    labelHi: "चंदन",
    labelEn: "Sandalwood",
    thread: "rgba(196, 163, 90, 0.55)",
    beadDone:
      "radial-gradient(circle at 32% 28%, #F5E6D3 0%, #E8D0A8 40%, #D4B896 72%, #C4A070 100%)",
    beadTodo:
      "radial-gradient(circle at 32% 28%, #EDE0CC 0%, #D9C4A0 55%, #C4AD88 100%)",
    beadShadow: "0 1px 3px rgba(139,105,60,0.35), inset 0 -1px 3px rgba(255,255,255,0.35)",
    sumeru: "radial-gradient(circle at 35% 30%, #F5C15C 0%, #D9A441 45%, #B8860B 100%)",
    sumeruBorder: "#F5C15C",
    sumeruGlow: "0 0 12px rgba(217,164,65,0.55)",
    tasselCap: "#D9A441",
    tasselFringe: "linear-gradient(to bottom, #651317, #A62419, transparent)",
    activeRing: "#651317",
    activeGlow: "0 0 12px rgba(101,19,23,0.45)",
    previewBeads: ["#E8D0A8", "#D4B896", "#F5E6D3"],
  },
};

function loadStoredMalaType(): MalaTypeId {
  try {
    const v = localStorage.getItem(MALA_STORAGE_KEY);
    if (v === "rudraksha" || v === "tulsi" || v === "sandalwood") return v;
  } catch {
    /* ignore */
  }
  return "rudraksha";
}

function persistMalaType(type: MalaTypeId) {
  try {
    localStorage.setItem(MALA_STORAGE_KEY, type);
  } catch {
    /* ignore */
  }
}

// ─── REUSABLE CIRCULAR MALA RING COMPONENT ──────────────────────
interface CircularMalaRingProps {
  count: number;
  targetCount: number;
  isDark: boolean;
  isMobile: boolean;
  malaType: MalaTypeId;
  activeMantra: any;
  isHi: boolean;
  floatingTexts?: FloatingText[];
  radiusOverride?: number;
  centerContent?: React.ReactNode;
  onTap?: () => void;
  showCenterStats?: boolean;
}

export const CircularMalaRing = memo(function CircularMalaRing({
  count,
  targetCount,
  isDark,
  isMobile,
  malaType,
  activeMantra,
  isHi,
  floatingTexts = [],
  radiusOverride,
  centerContent,
  onTap,
  showCenterStats = true,
}: CircularMalaRingProps) {
  const theme = MALA_THEMES[malaType];
  const numBeads = 27;
  const beadIndices = useMemo(() => {
    const arr = [];
    for (let i = 0; i <= numBeads; i++) {
      arr.push(i);
    }
    return arr;
  }, [numBeads]);

  const R = radiusOverride ?? (isMobile ? 120 : 195);
  const regularBeadSize = radiusOverride ? (isMobile ? 15 : 24) : (isMobile ? 20 : 32);
  const sumeruBeadSize = radiusOverride ? (isMobile ? 22 : 34) : (isMobile ? 28 : 44);

  const activeBeadIndex = useMemo(() => {
    if (count === 0) return 1;
    return count % numBeads === 0 ? numBeads : count % numBeads;
  }, [count, numBeads]);

  const currentCompletedCount = useMemo(() => {
    if (count === 0) return 0;
    return count % numBeads === 0 ? numBeads : count % numBeads;
  }, [count, numBeads]);

  return (
    <div
      onClick={onTap}
      className="relative flex items-center justify-center select-none"
      style={{
        width: `${(R + 24) * 2}px`,
        height: `${(R + 24) * 2}px`,
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible z-40">
        <AnimatePresence>
          {floatingTexts.map((f) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, scale: 0.85, y: 15, x: f.x }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0.85, 1.15, 1.2, 1],
                y: -115,
                x: f.x,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className={`absolute font-display text-base sm:text-lg md:text-xl font-bold text-center pointer-events-none whitespace-pre-line max-w-[260px] md:max-w-[360px] z-50 ${
                isDark
                  ? "text-amber-200 drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]"
                  : "text-[#651317] drop-shadow-[0_2px_8px_rgba(255,253,248,0.9)]"
              }`}
            >
              {f.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Mala Thread */}
      <div
        className="absolute rounded-full border-[2.5px] pointer-events-none z-10"
        style={{
          width: `${R * 2}px`,
          height: `${R * 2}px`,
          left: `calc(50% - ${R}px)`,
          top: `calc(50% - ${R}px)`,
          borderColor: theme.thread,
        }}
      />

      {beadIndices.map((i) => {
        const isSumeru = i === 0;
        const isCompletedBead = !isSumeru && i <= currentCompletedCount;
        const isActiveBead = !isSumeru && i === activeBeadIndex;

        const angleDeg = -90 + (i * 360) / (numBeads + 1);
        const angleRad = (angleDeg * Math.PI) / 180;
        const beadSize = isSumeru ? sumeruBeadSize : regularBeadSize;

        const left = `calc(50% + ${R * Math.cos(angleRad)}px - ${beadSize / 2}px)`;
        const top = `calc(50% + ${R * Math.sin(angleRad)}px - ${beadSize / 2}px)`;

        return (
          <div
            key={i}
            className="absolute transition-all duration-300"
            style={{
              left,
              top,
              width: `${beadSize}px`,
              height: `${beadSize}px`,
              zIndex: isSumeru ? 30 : isActiveBead ? 25 : 20,
            }}
          >
            {isSumeru ? (
              <div
                className="w-full h-full rounded-full flex items-center justify-center relative border"
                style={{
                  background: theme.sumeru,
                  borderColor: theme.sumeruBorder,
                  boxShadow: theme.sumeruGlow,
                }}
              >
                <span className="text-[13px] md:text-[18px] font-bold text-[#1a1008] font-display select-none pointer-events-none leading-none">
                  ॐ
                </span>
                <div
                  className="absolute left-1/2 -translate-x-1/2 w-3 h-10 flex flex-col items-center pointer-events-none z-30"
                  style={{ top: `${Math.round(sumeruBeadSize * 0.88)}px` }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-sm border border-black/20 shadow-sm"
                    style={{ background: theme.tasselCap }}
                  />
                  <div
                    className="w-1 h-8 rounded-b-md shadow-sm origin-top"
                    style={{ background: theme.tasselFringe }}
                  />
                </div>
              </div>
            ) : malaType === "rudraksha" ? (
              /* Previous textured rudraksha beads */
              <div
                className={`w-full h-full rounded-full transition-all duration-300 ${
                  isActiveBead
                    ? isDark
                      ? "ring-2 ring-yellow-400 ring-offset-1 ring-offset-black scale-135 shadow-[0_0_14px_rgba(253,224,71,0.95)]"
                      : "ring-2 ring-yellow-500 ring-offset-1 ring-offset-white scale-135 shadow-[0_0_14px_rgba(234,179,8,0.3)]"
                    : isCompletedBead
                    ? "shadow-[0_0_8px_rgba(245,158,11,0.85)] border border-amber-400/35"
                    : "opacity-45"
                }`}
                style={{
                  backgroundImage: "url('/images/rudraksha.webp')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundColor:
                    isCompletedBead || isActiveBead
                      ? "#D97706"
                      : isDark
                      ? "#5c2a13"
                      : "#A14D16",
                  filter:
                    isCompletedBead || isActiveBead
                      ? "brightness(1.15) saturate(1.4) contrast(1.1)"
                      : isDark
                      ? "brightness(0.6) contrast(1.1) sepia(0.25)"
                      : "brightness(0.95) contrast(1.1) sepia(0.2)",
                }}
              />
            ) : (
              <div
                className={`w-full h-full rounded-full transition-all duration-300 ${
                  isActiveBead ? "scale-[1.28]" : ""
                }`}
                style={{
                  background: isCompletedBead || isActiveBead ? theme.beadDone : theme.beadTodo,
                  boxShadow: isActiveBead
                    ? theme.activeGlow
                    : theme.beadShadow,
                  opacity: isCompletedBead || isActiveBead ? 1 : 0.78,
                  outline: isActiveBead ? `2.5px solid ${theme.activeRing}` : undefined,
                  outlineOffset: isActiveBead ? 2 : undefined,
                  border:
                    malaType === "tulsi"
                      ? "1px solid rgba(58,74,36,0.35)"
                      : "1px solid rgba(196,160,112,0.45)",
                }}
              />
            )}
          </div>
        );
      })}

      {centerContent ? (
        <div className="absolute inset-0 flex items-center justify-center text-center pointer-events-none select-none z-20">
          {centerContent}
        </div>
      ) : showCenterStats ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none z-20">
          <span
            className={`font-display text-[54px] md:text-[66px] font-bold leading-none tracking-tight tabular-nums ${
              isDark ? "text-[#F5C15C]" : "text-[#651317]"
            }`}
          >
            {count}
          </span>
          <span
            className={`text-sm md:text-base font-semibold tracking-wider ${
              isDark ? "text-amber-200/50" : "text-[#786252]"
            }`}
          >
            /{targetCount}
          </span>
          <div
            className={`mt-2.5 px-3 py-0.5 border rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase ${
              isDark
                ? "bg-amber-500/10 border-amber-500/25 text-amber-300"
                : "bg-[#FAF0E4] border-[#E8D8C4] text-[#651317]"
            }`}
          >
            {isHi
              ? `माला ${Math.floor(count / numBeads) + 1}`
              : `ROUND ${Math.floor(count / numBeads) + 1}`}
          </div>
        </div>
      ) : null}
    </div>
  );
});

/** Compact 3-chip mala type picker */
function MalaTypePicker({
  malaType,
  onChange,
  isHi,
  isDark,
  stopPropagation,
}: {
  malaType: MalaTypeId;
  onChange: (t: MalaTypeId) => void;
  isHi: boolean;
  isDark: boolean;
  stopPropagation?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-center gap-2 sm:gap-2.5 w-full"
      onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
    >
      {MALA_TYPE_IDS.map((id) => {
        const t = MALA_THEMES[id];
        const selected = malaType === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-2xl border transition-all active:scale-95 min-w-[88px] sm:min-w-[100px] ${
              selected
                ? isDark
                  ? "border-amber-500/60 bg-amber-500/10"
                  : "border-[#651317] bg-[#651317]/08"
                : isDark
                ? "border-stone-700 bg-stone-900/60 hover:border-amber-500/30"
                : "border-[#E8D8C4] bg-[#FFFDF8] hover:bg-[#FAF0E4]/70"
            }`}
          >
            <div className="flex items-center -space-x-1.5">
              {id === "rudraksha"
                ? [0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-4 h-4 rounded-full border border-black/15 shadow-sm"
                      style={{
                        backgroundImage: "url('/images/rudraksha.webp')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundColor: "#A14D16",
                        zIndex: 3 - i,
                        filter: "brightness(1.05) saturate(1.2) contrast(1.05)",
                      }}
                    />
                  ))
                : t.previewBeads.map((c, i) => (
                    <span
                      key={i}
                      className="w-4 h-4 rounded-full border border-black/15 shadow-sm"
                      style={{
                        background: c,
                        zIndex: 3 - i,
                        boxShadow: t.beadShadow,
                      }}
                    />
                  ))}
            </div>
            <span
              className={`text-[11px] font-bold leading-none ${
                selected
                  ? isDark
                    ? "text-amber-300"
                    : "text-[#651317]"
                  : isDark
                  ? "text-stone-400"
                  : "text-[#786252]"
              }`}
            >
              {isHi ? t.labelHi : t.labelEn}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── PROPS TYPE ──────────────────────────────────────────────────
type PremiumJapaCounterProps = {
  mantra: Mantra;
  sankalpText: string;
  targetCount: number;
  practiceMode: "mala" | "tap" | "voice" | "guided";
  onClose: (finalMantraId?: string) => void;
  onComplete: (actualCount: number, durationSeconds: number, finalMantraId?: string) => void;
};

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
}

interface FallingFlower {
  id: number;
  image: string;
  x: number;
  size: number;
  duration: number;
  delay: number;
  rotationSpeed: number;
  driftX: number;
}

const SACRED_FLOWERS = [
  "/images/ram-yellow-flower.svg",
  "/images/radhe-pink-flower.svg",
  "/images/shyam-blue-flower.svg",
  "/images/shivayy-white-flower.svg",
];

const MaskedIcon = ({
  src,
  alt,
  className = "w-6 h-6",
  isDark,
  active = true,
}: {
  src: string;
  alt: string;
  className?: string;
  isDark: boolean;
  active?: boolean;
}) => {
  const color = active
    ? isDark
      ? "#fbbf24"
      : "#591A0D"
    : isDark
      ? "rgba(255, 255, 255, 0.3)"
      : "#94A3B8";

  return (
    <div
      aria-label={alt}
      className={`inline-block transition-colors duration-200 ${className}`}
      style={{
        backgroundColor: color,
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
};

export default function PremiumJapaCounter({
  mantra,
  sankalpText,
  targetCount,
  practiceMode: initialPracticeMode,
  onClose,
  onComplete,
}: PremiumJapaCounterProps) {
  const { language } = useLanguage();
  const isHi = language === "hi";
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Initialize count and secondsElapsed from URL search parameters if returning
  const initialCount = Number(searchParams.get("resumeCount") || "0");
  const initialSeconds = Number(searchParams.get("resumeSeconds") || "0");

  // Load mantras database and authentication context
  const { mantras, stats, todaySessions, mantraTotalsMap, userId } = useMantraJapa();
  const { profile } = useAuth() as any;

  // ─── LOCAL STATE ────────────────────────────────────────────────
  const [activeMantra, setActiveMantra] = useState<Mantra>(mantra);
  const [practiceMode, setPracticeMode] = useState<"mala" | "tap" | "voice" | "guided">(initialPracticeMode);
  const [count, setCount] = useState(initialCount);
  const [isCompleted, setIsCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [autoLockDisabled, setAutoLockDisabled] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [malaType, setMalaType] = useState<MalaTypeId>(() => loadStoredMalaType());

  useEffect(() => {
    persistMalaType(malaType);
  }, [malaType]);
  
  const [liveRankings, setLiveRankings] = useState<any[]>([]);
  const [liveRankingsLoading, setLiveRankingsLoading] = useState(false);

  useEffect(() => {
    if (!leaderboardOpen) return;
    
    let active = true;
    async function loadLiveRankings() {
      setLiveRankingsLoading(true);
      try {
        const rankingsData = await fetchLeaderboardRankings(userId || undefined);
        if (active) {
          setLiveRankings(rankingsData);
        }
      } catch (err) {
        console.error("Error fetching live rankings in overlay:", err);
      } finally {
        if (active) {
          setLiveRankingsLoading(false);
        }
      }
    }

    loadLiveRankings();

    return () => {
      active = false;
    };
  }, [leaderboardOpen, userId]);

  // Warn user before reloading or leaving page with unsaved counts
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (count > 0 && !isCompleted) {
        e.preventDefault();
        e.returnValue = isHi 
          ? "आपके पास बिना सहेजे गए मंत्र जाप हैं। क्या आप सच में छोड़ना चाहते हैं?" 
          : "You have unsaved Japa chants. Are you sure you want to leave?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [count, isCompleted, isHi]);

  // Clean up URL parameters after loading them into local state
  useEffect(() => {
    if (searchParams.has("resumeCount") || searchParams.has("resumeSeconds")) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("resumeCount");
      newParams.delete("resumeSeconds");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);
  
  // Timer tracking — voice mode stays paused until listening starts
  const [secondsElapsed, setSecondsElapsed] = useState(initialSeconds);
  const [timerActive, setTimerActive] = useState(() => initialPracticeMode !== "voice");

  // Auto Jap (ऑटो जप) states
  const [isAutoJapaActive, setIsAutoJapaActive] = useState(false);
  const [autoJapaIntervalSec, setAutoJapaIntervalSec] = useState<number>(1.5);
  const [autoJapaSpeedModalOpen, setAutoJapaSpeedModalOpen] = useState(false);
  const autoJapaTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Guided Mode specific states
  const [guidedPlaying, setGuidedPlaying] = useState(false);

  // Voice Mode specific states
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceEverStarted, setVoiceEverStarted] = useState(false);
  const [showVoiceInstructions, setShowVoiceInstructions] = useState(() => {
    if (initialPracticeMode !== "voice") return false;
    try {
      return localStorage.getItem("voice_instructions_seen") !== "1";
    } catch {
      return true;
    }
  });
  const [dbLevel, setDbLevel] = useState(0);
  const [micDenied, setMicDenied] = useState(false);
  const [lastRecognizedText, setLastRecognizedText] = useState("");
  const [recognitionSupported, setRecognitionSupported] = useState(true);

  // Floating text animation states
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const floatingIdCounter = useRef(0);

  // Falling Ram Yellow Flower particle animation states
  const [fallingFlowers, setFallingFlowers] = useState<FallingFlower[]>([]);
  const flowerIdCounter = useRef(0);

  // 1-second tap throttle state & refs
  const lastTapTimeRef = useRef<number>(0);
  const [showTooFastToast, setShowTooFastToast] = useState(false);
  const tooFastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // References for cleanup
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastVoiceCountTime = useRef<number>(0);
  const speechRecognitionRef = useRef<any>(null);
  const voiceActiveRef = useRef(false);
  const guidedTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wakeLockRef = useRef<any>(null);

  // Responsiveness State
  const [isMobile, setIsMobile] = useState(false);

  // Filter devotees list dynamically based on chosen scope, timeframe, and mantra filters
  // Filter devotees list dynamically based on chosen scope, timeframe, and mantra filters
  const filteredDevotees = useMemo(() => {
    const list = (liveRankings || []).map((r) => {
      const isCurrentUser = userId && r.user_id === userId;
      if (isCurrentUser) {
        return {
          ...r,
          total_chants: Number(r.total_chants || 0) + count
        };
      }
      return r;
    });

    // Re-sort the list if current user's count increased their rank
    list.sort((a, b) => Number(b.total_chants) - Number(a.total_chants));
    
    // Re-assign ranks based on sorted order
    let currentRank = 1;
    let lastChants = -1;
    return list.map((item, idx) => {
      const chants = Number(item.total_chants);
      if (idx > 0 && chants < lastChants) {
        currentRank = idx + 1;
      }
      lastChants = chants;
      return {
        id: item.user_id,
        name: item.display_name,
        avatar: item.avatar_url || "user",
        streak: item.max_streak || 0,
        chants: chants,
        rank: currentRank,
        isCurrentUser: userId && item.user_id === userId,
        username: item.username,
        isFriend: false
      };
    });
  }, [liveRankings, count, userId]);

  const currentUserRankRow = useMemo(() => {
    return filteredDevotees.find((d) => d.isCurrentUser);
  }, [filteredDevotees]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Update activeMantra if props change
  useEffect(() => {
    setActiveMantra(mantra);
  }, [mantra]);

  // Keep screen active using Wake Lock API
  const requestWakeLock = async () => {
    if ("wakeLock" in navigator && document.visibilityState === "visible") {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
      } catch (err) {
        console.warn("Wake lock failed:", err);
      }
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      } catch (err) {
        console.warn("Wake lock release failed:", err);
      }
    }
  };

  useEffect(() => {
    if (autoLockDisabled && timerActive && !isCompleted) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
    return () => {
      releaseWakeLock();
    };
  }, [autoLockDisabled, timerActive, isCompleted]);

  // Synchronize guided play with timer status in guided mode
  useEffect(() => {
    if (practiceMode === "guided") {
      setGuidedPlaying(timerActive);
    }
  }, [timerActive, practiceMode]);

  // ─── RUNNING TIME TIMER ─────────────────────────────────────────
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && !isCompleted) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, isCompleted]);

  // ─── CELEBRATE ON COMPLETE ──────────────────────────────────────
  const handleCompletion = useCallback(() => {
    setIsCompleted(true);
    setTimerActive(false);
    setGuidedPlaying(false);
    setVoiceActive(false);
    
    // Stop microphone
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    
    // Play conch sound
    playConchSound(soundEnabled);
  }, [soundEnabled]);

  // ─── AUTO JAP INCREMENT (bypasses tap throttle) ──────────────────
  const autoIncrementCount = useCallback(() => {
    if (isCompleted || count >= targetCount) {
      setIsAutoJapaActive(false);
      return;
    }
    
    lastTapTimeRef.current = Date.now();
    
    setCount((prev) => {
      if (prev >= targetCount) {
        setIsAutoJapaActive(false);
        return targetCount;
      }
      const next = Math.min(prev + 1, targetCount);
      
      // Play bell
      playBellSound(soundEnabled);
      
      // Vibrate
      if (vibrationEnabled && "vibrate" in navigator) {
        try {
          navigator.vibrate(40);
        } catch (_) {}
      }

      // Add floating mantra text
      const mantraText = isHi
        ? activeMantra.full_text_hindi || activeMantra.name_hindi
        : activeMantra.transliteration || activeMantra.name_english;
      
      const newFloat: FloatingText = {
        id: floatingIdCounter.current++,
        text: mantraText,
        x: (Math.random() - 0.5) * 50,
        y: (Math.random() - 0.5) * 50,
      };

      setFloatingTexts((f) => [...f.slice(-4), newFloat]);
      
      // Add falling flower particle
      const currentIdx = flowerIdCounter.current++;
      const selectedFlowerImage = SACRED_FLOWERS[currentIdx % SACRED_FLOWERS.length];
      const newFlower: FallingFlower = {
        id: currentIdx,
        x: 10 + Math.random() * 80,
        size: 24 + Math.random() * 20,
        duration: 3.5 + Math.random() * 2,
        delay: 0,
        driftX: (Math.random() - 0.5) * 120,
        rotationSpeed: (Math.random() - 0.5) * 360,
        image: selectedFlowerImage,
      };
      
      setFallingFlowers((fl) => [...fl.slice(-8), newFlower]);

      if (next >= targetCount) {
        handleCompletion();
      }
      return next;
    });
  }, [isCompleted, count, targetCount, soundEnabled, vibrationEnabled, isHi, activeMantra, handleCompletion]);

  // ─── AUTO JAP INTERVAL EFFECT ───────────────────────────────────
  useEffect(() => {
    if (isAutoJapaActive && !isCompleted && timerActive) {
      const intervalMs = Math.max(300, autoJapaIntervalSec * 1000);
      autoJapaTimerRef.current = setInterval(() => {
        autoIncrementCount();
      }, intervalMs);
    } else {
      if (autoJapaTimerRef.current) {
        clearInterval(autoJapaTimerRef.current);
        autoJapaTimerRef.current = null;
      }
    }
    return () => {
      if (autoJapaTimerRef.current) {
        clearInterval(autoJapaTimerRef.current);
        autoJapaTimerRef.current = null;
      }
    };
  }, [isAutoJapaActive, isCompleted, timerActive, autoJapaIntervalSec, autoIncrementCount]);

  // ─── INCREMENT ACTION ───────────────────────────────────────────
  const incrementCount = useCallback(() => {
    if (isCompleted || count >= targetCount) return;
    
    // 0.75-second (750ms) cooldown throttle check
    const now = Date.now();
    if (now - lastTapTimeRef.current < 750) {
      setShowTooFastToast(true);
      if (tooFastTimeoutRef.current) clearTimeout(tooFastTimeoutRef.current);
      tooFastTimeoutRef.current = setTimeout(() => {
        setShowTooFastToast(false);
      }, 1400);
      return;
    }
    lastTapTimeRef.current = now;
    
    setCount((prev) => {
      if (prev >= targetCount) return targetCount;
      const next = Math.min(prev + 1, targetCount);
      
      // Play bell
      playBellSound(soundEnabled);
      
      // Vibrate
      if (vibrationEnabled && "vibrate" in navigator) {
        try {
          navigator.vibrate(50);
        } catch (_) { /* vibration not supported */ }
      }

      // Add floating mantra text
      const mantraText = isHi
        ? activeMantra.full_text_hindi || activeMantra.name_hindi
        : activeMantra.transliteration || activeMantra.name_english;
      
      const newFloat: FloatingText = {
        id: floatingIdCounter.current++,
        text: mantraText,
        x: (Math.random() - 0.5) * 50,
        y: (Math.random() - 0.5) * 50,
      };
      setFloatingTexts((prevList) => [...prevList, newFloat]);
      setTimeout(() => {
        setFloatingTexts((prevList) => prevList.filter((f) => f.id !== newFloat.id));
      }, 1500);

      // Spawn 1 falling flower
      const currentIdx = flowerIdCounter.current++;
      const selectedFlowerImage = SACRED_FLOWERS[currentIdx % SACRED_FLOWERS.length];

      const newFlower: FallingFlower = {
        id: currentIdx,
        image: selectedFlowerImage,
        x: 5 + Math.random() * 90,
        size: 28 + Math.random() * 14,
        duration: 3.2 + Math.random() * 0.6,
        delay: 0,
        rotationSpeed: (Math.random() - 0.5) * 260,
        driftX: (Math.random() - 0.5) * 60,
      };

      setFallingFlowers((prevFlowers) => {
        const updated = [...prevFlowers, newFlower];
        return updated.length > 25 ? updated.slice(updated.length - 25) : updated;
      });

      setTimeout(() => {
        setFallingFlowers((prevFlowers) =>
          prevFlowers.filter((f) => f.id !== newFlower.id)
        );
      }, (newFlower.duration + newFlower.delay) * 1000 + 150);
      
      // STRICT COMPLETION TRIGGER: Trigger completion immediately when target is reached
      if (next >= targetCount) {
        handleCompletion();
      }
      return next;
    });
  }, [count, targetCount, isCompleted, soundEnabled, vibrationEnabled, activeMantra, isHi, handleCompletion]);

  // ─── SCREEN TAP CLICK ───────────────────────────────────────────
  const handleBackgroundTap = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent counting if user clicked on buttons, selects, drawer handles, nav bar, links, or if completed
    const target = e.target as HTMLElement;
    if (
      target.closest("button") || 
      target.closest("select") || 
      target.closest(".settings-panel") || 
      target.closest("nav") || 
      target.closest("a") || 
      isCompleted
    ) {
      return;
    }
    incrementCount();
  };

  // ─── MANTRA CHANGE HANDLER ──────────────────────────────────────
  const handleMantraChange = useCallback((mantraId: string) => {
    const found = (mantras || []).find((m) => m.id === mantraId);
    if (found) setActiveMantra(found);
  }, [mantras]);

  // ─── RESET HANDLER ──────────────────────────────────────────────
  const handleResetClick = useCallback(() => {
    if (practiceMode === "voice") {
      voiceActiveRef.current = false;
      setVoiceActive(false);
      setVoiceEverStarted(false);
    }
    setCount(0);
    setSecondsElapsed(0);
    setIsCompleted(false);
    setTimerActive(false);
    setFloatingTexts([]);
  }, [practiceMode]);

  // ─── VOICE COUNTING (SPEECH RECOGNITION) ──────────────────────
  useEffect(() => {
    voiceActiveRef.current = voiceActive;
  }, [voiceActive]);

  const beginVoiceListening = useCallback(() => {
    setShowVoiceInstructions(false);
    setVoiceEverStarted(true);
    setMicDenied(false);
    setTimerActive(true);
    setVoiceActive(true);
  }, []);

  const pauseVoiceListening = useCallback(() => {
    voiceActiveRef.current = false;
    setVoiceActive(false);
    setTimerActive(false);
  }, []);

  const startMicListening = async () => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    const matchesTranscript = (transcript: string) =>
      transcriptMatchesActiveMantra({
        nameEn: activeMantra.name_english,
        nameHi: activeMantra.name_hindi,
        deity: activeMantra.deity,
        mantraTextHi: activeMantra.full_text_hindi || activeMantra.name_hindi,
        mantraTextEn: activeMantra.transliteration || activeMantra.name_english,
        transcript,
      });

    if (!SpeechRecognitionAPI) {
      // ── FALLBACK: volume-based counting (browser doesn't support SR) ──
      setRecognitionSupported(false);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
        setMicDenied(false);
        setVoiceActive(true);

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        audioCtxRef.current = audioCtx;

        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const processAudio = () => {
          if (!analyserRef.current || !voiceActiveRef.current) return;
          analyser.getByteFrequencyData(dataArray);
          let total = 0;
          for (let i = 0; i < bufferLength; i++) total += dataArray[i];
          const average = total / bufferLength;
          setDbLevel(Math.min(100, Math.round((average / 140) * 100)));

          const now = Date.now();
          if (average > 35 && now - lastVoiceCountTime.current > 2000) {
            lastVoiceCountTime.current = now;
            incrementCount();
          }

          animationFrameRef.current = requestAnimationFrame(processAudio);
        };
        processAudio();
      } catch (err) {
        console.warn("Microphone access denied:", err);
        setMicDenied(true);
        setVoiceActive(false);
        setTimerActive(false);
      }
      return;
    }

    // ── PRIMARY: Web Speech Recognition ────────────────────────────
    setRecognitionSupported(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      setMicDenied(false);
      setVoiceActive(true);

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const drawWaveform = () => {
        if (!analyserRef.current || !voiceActiveRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        let total = 0;
        for (let i = 0; i < bufferLength; i++) total += dataArray[i];
        setDbLevel(Math.min(100, Math.round((total / bufferLength / 140) * 100)));
        animationFrameRef.current = requestAnimationFrame(drawWaveform);
      };
      drawWaveform();

      const recognition = new SpeechRecognitionAPI();
      recognition.lang = isHi ? "hi-IN" : "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;
      speechRecognitionRef.current = recognition;

      let lastMatchTime = 0;
      const COOLDOWN_MS = 1800;

      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          setLastRecognizedText(transcript);

          const isFinal = result.isFinal;
          const confidence = result[0].confidence;
          if (!isFinal && confidence < 0.5) continue;

          const now = Date.now();
          if (matchesTranscript(transcript) && now - lastMatchTime > COOLDOWN_MS) {
            lastMatchTime = now;
            incrementCount();
          }
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setMicDenied(true);
          setVoiceActive(false);
          setTimerActive(false);
        }
      };

      recognition.onend = () => {
        if (speechRecognitionRef.current && voiceActiveRef.current) {
          try {
            speechRecognitionRef.current.start();
          } catch (_) {
            /* already started */
          }
        }
      };

      recognition.start();
    } catch (err) {
      console.warn("Microphone access denied:", err);
      setMicDenied(true);
      setVoiceActive(false);
      setTimerActive(false);
    }
  };

  const stopMicListening = (opts?: { clearActive?: boolean }) => {
    const clearActive = opts?.clearActive !== false;
    if (clearActive) {
      voiceActiveRef.current = false;
      setVoiceActive(false);
    }
    setDbLevel(0);
    setLastRecognizedText("");
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (_) {
        /* already stopped */
      }
      speechRecognitionRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
  };

  useEffect(() => {
    if (practiceMode === "voice" && voiceActive) {
      startMicListening();
      return () => stopMicListening({ clearActive: false });
    }
    if (practiceMode === "voice" && !voiceActive) {
      stopMicListening({ clearActive: false });
    }
    return undefined;
  }, [practiceMode, voiceActive]);

  // ─── GUIDED MODE AUTO PLAY ──────────────────────────────────────
  useEffect(() => {
    if (practiceMode === "guided" && guidedPlaying) {
      const text = isHi
        ? activeMantra.full_text_hindi || activeMantra.name_hindi
        : activeMantra.transliteration || activeMantra.name_english;
      const synth = window.speechSynthesis;
      
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = isHi ? "hi-IN" : "en-US";
      utter.rate = 0.85; // Peaceful rate
      utter.pitch = 0.95; // Deep voice

      const triggerGuidedStep = () => {
        if (!guidedPlaying || isCompleted) return;
        
        if (soundEnabled && synth) {
          synth.cancel();
          synth.speak(utter);
        }
        
        incrementCount();
        guidedTimerRef.current = setTimeout(triggerGuidedStep, 3800);
      };

      guidedTimerRef.current = setTimeout(triggerGuidedStep, 500);
    } else {
      if (guidedTimerRef.current) clearTimeout(guidedTimerRef.current);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    }

    return () => {
      if (guidedTimerRef.current) clearTimeout(guidedTimerRef.current);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [practiceMode, guidedPlaying, isCompleted, soundEnabled, activeMantra, isHi, incrementCount]);

  // ─── MALA BEAD TRAVERSAL CALCULATIONS ────────────────────────────
  // We use 27 regular beads + 1 Sumeru bead = 28 total beads in the ring layout.
  const numBeads = 27;
  const beadIndices = useMemo(() => {
    const arr = [];
    for (let i = 0; i <= numBeads; i++) {
      arr.push(i);
    }
    return arr;
  }, [numBeads]);

  // Sizing details for elegant, spaced out, breathable 27-bead layout
  const R = isMobile ? 120 : 195;
  const regularBeadSize = isMobile ? 20 : 32;
  const sumeruBeadSize = isMobile ? 28 : 44;

  // Active bead index:
  // If count is exactly a multiple of 27 (and > 0), the 27th bead is active.
  // Otherwise, the active bead is the count % 27 + 1.
  const activeBeadIndex = useMemo(() => {
    if (count === 0) return 1;
    return count % numBeads === 0 ? numBeads : count % numBeads;
  }, [count, numBeads]);

  // Completed count in the current mala round:
  // If count is a multiple of 27 (and > 0), all 27 beads are completed.
  // Otherwise, completed count is count % 27.
  const currentCompletedCount = useMemo(() => {
    if (count === 0) return 0;
    return count % numBeads === 0 ? numBeads : count % numBeads;
  }, [count, numBeads]);

  // Dynamic Today Stats computation (default rounds for 108 is 4)
  const displayTodayChants = useMemo(() => (stats?.todayChants || 0) + count, [stats?.todayChants, count]);
  const displayTodayMalas = useMemo(() => Math.floor(((stats?.todayChants || 0) + count) / 108), [stats?.todayChants, count]);

  // ─── LOTUS FLOWER SVG COMPONENT ─────────────────────────────────
  const LotusFlowerSvg = ({ className = "w-6 h-6", color = "#ec4899" }: { className?: string; color?: string }) => (
    <svg className={className} viewBox="0 0 1006.6461 574.1317" fill={color}>
      <g>
        <g id="XMLID_1_">
          <g>
            <path d="M329.5415,301.24c0.38,0.23,0.6,0.73,1.21,1.52c-7.56-0.79-14.12-3.51-20.77-5.83c-21.73-7.59-42.91-16.29-62.15-29.27c-22.42-15.12-40.16-34.46-52.55-58.39c-15.73-30.4-23.02-62.64-18.8-97c0.15-1.16,0.27-2.31,0.36-3.47c0.43-5.77,2.32-7.41,8.01-6.47c9.21,1.52,18.29,3.52,27.04,6.94c18.85,7.38,36.73,16.55,52.48,29.4c5.18,4.24,10.01,9.03,15,15.53c-8.73-3.63-16.16-6.82-23.66-9.82c-15.52-6.21-31.65-10.15-48.12-12.87c-3.71-0.61-4.97,0.1-4.83,4.12c1.3,38.95,14.69,73.19,40.68,102.11c20.24,22.53,45.65,38.61,71.17,54.4C319.5715,295.21,324.5815,298.19,329.5415,301.24z"/>
            <path d="M247.2815,285.15c0.21,0.12,0.23,0.55,0.36,0.91c-1.36,1.3-3.13,0.88-4.68,0.9c-20.87,0.32-41.61-0.68-61.94-5.92c-27.02-6.95-48.38-31.11-46.48-62.21c0.73-11.96,1.22-23.91,3.28-35.74c0.28-1.59-0.16-3.59,1.93-4.17c2.25-0.63,3.18,1.23,4.27,2.7c16.92,22.92,34.76,45.08,53.56,66.49c13.19,15.02,28.75,26.67,46.65,35.35C245.2715,283.96,246.2915,284.54,247.2815,285.15z"/>
            <path d="M239.3115,468.6c1.12,0.04,2.23,0.32,4.08,0.6c-2.91,2.43-5.83,3.18-8.67,3.65c-37.13,6.26-74.16,8.54-110.72-3.46c-17.82-5.85-33.02-16.34-48.06-27.18c-10.95-7.88-19.91-17.58-27.78-28.44c-2.05-2.83-2.25-4.41,1.47-6.2c17.62-8.51,35.86-15.1,55.08-18.86c1.32-0.26,2.92-0.8,3.58,0.7c0.7,1.6-1.09,2.23-2.02,3c-7.48,6.11-15.02,12.15-22.54,18.21c-1.69,1.36-3.05,2.44-0.43,4.52c26.44,21.04,55.44,36.9,88.86,43.55C194.3615,463.11,216.5815,467.62,239.3115,468.6z"/>
            <path d="M458.3115,410.22c-3.14,0-4.84-1.47-6.48-2.66c-16.27-11.85-34.23-20.7-52.63-28.49c-18.02-7.62-37.13-11.68-56.54-14.1c-32.75-4.08-65.7-5.67-98.57-8.19c-18.94-1.45-36.7-7.6-54.22-14.74c-13.97-5.7-27-12.91-39.54-21.16c-1.37-0.9-3.01-3.1-4.65-1.79c-1.89,1.52-0.28,3.78,0.48,5.51c7.21,16.46,18.09,30.65,27.97,45.48c21.69,32.55,51.42,54.52,88.07,67.39c15.99,5.62,32.67,7.78,49.51,8.92c13.61,0.93,27.21,1.97,40.83,0.97c-34.47,9.47-68.88,12.16-104.25,4.61c-35.76-7.64-65.47-25.3-90.65-50.71c-32.98-33.28-49.45-74.02-50.83-120.86c-0.18-5.99-0.44-11.99,0.29-17.97c0.12-0.96,0.49-1.9,0.99-3.73c5.63,5.87,11.11,11.05,16.64,16.17c18.53,17.15,40.56,25.57,65.52,27.23c31.57,2.09,63.18,3.89,94.47,8.88c24.34,3.88,48.72,7.54,72.43,14.6c14.66,4.36,27.12,12.86,38.99,21.92c21,16.03,38.74,35.53,56.11,55.32C454.1915,405.02,455.9815,407.36,458.3115,410.22z"/>
            <path d="M473.6615,424.59c-3.08,4.04-6.38,5.79-9.29,7.96c-2.93,2.18-5.93,4.31-9.06,6.21c-20.79,12.6-41.69,25-63.4,36.02c-13,6.6-26.69,10.22-41.08,11.61c-2.49,0.24-4.98,0.47-7.46,0.79c-1.09,0.14-2.57-0.09-2.89,1.35c-0.26,1.13,0.94,1.66,1.7,2.25c10.57,8.34,22.24,14.38,35.18,18.4c28.92,8.96,52.69-1.67,74.43-19.23c15.13-12.23,26.89-27.67,38.02-43.54c0.65-0.92,1.36-1.8,2.7-3.56c2.85,16.82-0.73,31.24-9.46,44.32c-11.65,17.45-25.24,33.01-43.61,43.95c-13.02,7.75-27.38,11.17-41.94,13.88c-31.22,5.79-59.27-3.52-85.74-19.18c-9.49-5.61-16.99-13.46-22.35-23.1c-4.28-7.7-7.98-15.73-12.03-23.56c-1.81-3.5-0.82-4.85,3.03-4.85c9.49-0.01,18.99-0.02,28.49-0.27c27.41-0.72,53.7-7.22,79.64-15.55c27.64-8.87,54.5-19.66,80.78-31.94C470.3515,426.07,471.4015,425.61,473.6615,424.59z"/>
            <path d="M728.8215,472.99c1.8,2.47-1.02,5.39-2.5099,7.5c-13,18.35-25.66,37.26-45.04,49.59c-18.94,12.06-39.87,18.26-62.61,17.32c-9.49-0.39-19.02-0.17-28.39-1.89c-23.45-4.29-42-17.05-57.92-34.12c-10.16-10.89-17.42-23.52-21.2-38c-2.73-10.48-0.93-20.82,1.16-31.61c2.54,0.94,4.37,2.36,5.19,4.28c6.12,14.22,17.8199,23.86,27.9399,34.87c17.23,18.76,38.4,26.31,63.64,24.92c15.85-0.87,31.2-2.66,45.27-10.53c1.38-0.77,3.78-1.07,3.49-2.99c-0.27-1.8-2.59-1.83-4.18-2.12c-31.07-5.68-58.59-19.26-84.31-37.17c-11.52-8.02-22.53-16.57-32.75-26.16c-0.82-0.77-1.97-1.34-1.85-3.65c5.61,2.02,11.05,3.78,16.33,5.92c25.01,10.1,49.44,21.68,74.92,30.6c30.81,10.78,62.29,17.17,95.1899,12.6C723.7715,471.99,727.4215,471.08,728.8215,472.99z"/>
            <path d="M765.8915,470.94c-0.91-0.28-1.8-0.65-2.7-0.98c0.02-0.45,0.04-0.9,0.05-1.34c6.75-0.49,13.5-1.07,20.25-1.44c29.3-1.61,57.81-7.3,85.54-16.77c15-5.12,27.47-14.9,40.65-23.31c5.8-3.7,10.68-8.48,15.78-13.01c3.01-2.68,2.85-4.77-0.25-7.22c-7.69-6.11-15.27-12.37-22.88-18.57c-1.27-1.03-2.78-1.85-3.57-3.92c1.82-0.72,3.4-0.08,5.06,0.41c18.65,5.5,35.59,14.95,53.17,22.93c2.68,1.21,4.15,2.59,1.7,5.59c-10.65,13.03-21.2,26.07-34.23,36.95c-22.33,18.63-48.64,27.13-76.89,28.59C820.1315,480.27,792.5715,479.14,765.8915,470.94z"/>
            <path d="M911.3415,251.38c2.31,0.84,1.26,3.84,1.16,5.85c-1.84,38.58-11.09,74.9-32.11,107.84c-17.11,26.82-38.36,49.57-65.35,66.35c-25.28,15.73-52.84,24.65-83.01,25.8c-18.46,0.71-36.58-0.01-54.57-4.12c-0.81-0.18-1.63-0.37-2.41-0.64c-0.26-0.09-0.43-0.44-0.99-1.04c9.78-1.07,19.24-2.3,28.73-3.12c33.6-2.89,63.66-15.19,90.95-34.48c11.23-7.94,19.85-18.69,28.42-29.35c12.08-15.02,21.19-31.88,30.53-48.6c1.94-3.48,4.52-6.63,5.53-10.6c0.25-0.95,0.69-2.02-0.39-2.68c-0.91-0.57-1.48,0.4-2.12,0.84c-26.35,17.74-56.04,26.34-86.75,32.71c-30.32,6.29-60.98,8.24-91.78,9.44c-40.43,1.58-77.93,13.14-112.75,33.6c-4.1,2.41-8.26,4.72-12.38,7.08c-0.29-0.34-0.58-0.67-0.86-1c8.11-10.49,16.57-20.65,26.08-29.98c21.3-20.88,47.33-34.3,73.66-47.22c19.56-9.59,40.77-12.79,62.07-15.97c31.37-4.68,63.1-4.51,94.55-8.06c16.98-1.91,33.76-4.97,49.28-12.07c19.22-8.78,36.29-20.9,50.4-36.88C908.4715,253.68,909.3015,250.63,911.3415,251.38z"/>
            <path d="M881.6415,180.38c0.16,11.45,2.06,22.84-0.03,34.36c-1.45,7.99-0.48,16.25-1.56,24.38c-2.59,19.45-14.46,31.25-31.05,39.8c-17.88,9.22-36.98,9.9-56.4,9.42c-9.48-0.24-18.96-0.06-28.44-0.12c-1.57-0.01-3.27,0.6-4.96-0.67c4.44-5.73,11.41-7.16,17.22-10.28c19.89-10.67,38.77-22.54,54.43-39.15c17.17-18.22,32.12-38.13,46.23-58.73c0.79-1.14,1.08-3.3,2.94-2.84C881.6715,176.96,881.6215,178.98,881.6415,180.38z"/>
            <path d="M674.7515,304.57c9.84-6.31,20.78-10.09,30.43-16.31c21.37-13.77,43.46-26.65,61.97-44.33c18.27-17.45,31.36-38.49,38.32-62.8c-3.65-12.76-5.56-26.03-5.5-39.47c-0.02-3.94-1.33-4.86-5.19-5.07c-20.45-1.12-39.54,4.27-58.32,11.44c-1.46,0.55-2.83,1.77-4.98,0.96c7.92-8.73,17.94-13.9,28.1-18.73c18.63-8.85,37.3-17.62,56.7-24.72c1.71-0.63,3.42-1.3,5.17-1.81c7.97-2.37,8.03-2.36,9.32,6.25c6.94,46.28-4.22,87.07-36.77,121.42c-19.96,21.07-43.75,36.64-69.58,49.54c-19.12,9.55-39.02,16.97-59.29,23.53C675.7115,304.61,675.2115,304.54,674.7515,304.57z"/>
            <path d="M616.9015,326.04c-0.42,0.26-0.86,0.53-1.33,0.67c-0.2599,0.07-0.6-0.12-1.77-0.4c6.91-9.09,13.54-17.94,20.31-26.69c14.59-18.88,28.46-38.25,37.86-60.33c7.34-17.25,11.97-35.41,13.64-54.02c1.59-17.72-2.6-34.77-10.06-50.87c-8.21-17.72-17.99-34.55-29.73-50.19c-1.89-2.52-4.09-4.81-6.21-7.15c-6.57-7.26-6.66-7.4-15.49-2.74c-11.77,6.2-23.33,12.79-35.35,20.74c3.21-10.29,8.87-17.77,14.24-25.31c9.83-13.82,19.89-27.46,32.04-39.43c2.42-2.38,4.56-2.66,6.88-0.8c12.18,9.77,25.81,18.14,34.07,31.93c12.71,21.17,23.8199,43.08,29.5099,67.41c3.51,14.99,5.88,30.1,6.2401,45.45c0.48,20.47-4.21,40.06-12.34,58.7C682.0115,272.9,653.7815,303.35,616.9015,326.04z"/>
            <path d="M633.7515,205.47c4.5699,27.76,0.25,54.9-12.66,80.11c-14.77,28.85-32.55,55.78-54.04,80.16c-6.38,7.25-13.71,13.47-21.18,19.62c2.78-5.01,6.89-8.99,10.25-13.52c9-12.15,14.77-26.01,21.7599-39.22c14.33-27.1,18.76-56.32,18.08-86.53c-0.32-14.12-3.91-27.6-9.68-40.5c-9.77-21.81-23.6-40.91-39.37-58.67c-10.95-12.33-22.56-24.04-34.59-35.32c-2.79-2.63-4.79-2.7-7.55-0.19c-18.31,16.7-37.76,32.28-54.17,50.89c-24.8,28.12-39.87,60.71-39.33,98.85c0.41,28.73,8.1,55.65,22.24,81c10.5,18.81,23.29,35.6,37.86,51.24c0.33,0.36,0.6,0.77,0.9,1.16c-19.47-13.31-35.19-30.28-48.33-49.69c-8.3-12.26-17.77-23.82-24.4-37.09c-7.04-14.09-16.24-27.39-18.78-43.34c-3.16-19.91-5.48-39.98-1.87-60.07c2.34-13.08,7.75-25.26,14.66-36.43c12.08-19.53,25.13-38.53,41.97-54.4c16.58-15.63,34.57-29.62,52.58-43.56c5.65-4.37,11.5-8.5,16.99-13.07c2.27-1.89,3.88-1.75,6.17-0.38c13.03,7.8,25.41,16.49,36.99,26.31c17.53,14.86,35.71,29.14,49.52,47.73C614.5715,153.15,629.1115,177.3,633.7515,205.47z"/>
            <path d="M425.2615,95.03c-10.95-4.1-20.48-10.54-30.5-16.06c-14.3-7.88-10.05-9.1-21.71,3.01c-20.46,21.26-35.23,46.16-43.98,74.07c-12.15,38.73-5.17,75.02,18.04,108.18c8.4,12,17.26,23.65,25.18,36c4.56,7.11,10.36,13.42,15.48,20.18c1.12,1.49,2.73,2.88,2.71,5.58c-7.02-3.13-12.43-8.07-18.02-12.54c-21.1-16.9-39.1-36.39-51.76-60.69c-7.65-14.67-14.97-29.16-17.97-45.7c-4.17-23.03-3.1-45.56,2.91-68.13c10.11-37.93,27.93-71.71,53.41-101.5c3.02-3.53,6.25-6.9,10.03-9.7c1.31-0.97,2.16-1.75,3.74-0.26C393.7815,47.24,411.6815,69.4,425.2615,95.03z"/>
          </g>
        </g>
      </g>
    </svg>
  );

  // ─── TIME FORMATTER HELPER ───────────────────────────────────────
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // ─── ELEGANT THEME-AWARE COMPLETED OVERLAY ───────────────────────
  const renderCompletedOverlay = () => {
    if (!isCompleted) return null;
    const finalCount = Math.min(count, targetCount);

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-[150] flex flex-col items-center justify-center p-4 text-center select-none backdrop-blur-md transition-colors duration-300 ${
            isDark ? "bg-black/80" : "bg-black/45"
          }`}
        >
          {/* Soft background aura glow */}
          <div 
            className={`absolute top-1/4 w-[320px] h-[320px] rounded-full blur-[90px] pointer-events-none ${
              isDark ? "bg-amber-500/15" : "bg-[#D8A35A]/25"
            }`} 
          />

          <motion.div
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 18, stiffness: 260 }}
            className={`w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl relative border overflow-hidden transition-colors duration-300 ${
              isDark 
                ? "bg-gradient-to-b from-[#1c120a] via-[#150c06] to-[#0d0603] border-amber-500/30 text-[#fbf6f0] shadow-[0_16px_48px_rgba(0,0,0,0.6)]" 
                : "bg-gradient-to-b from-[#FFFDF8] via-[#FFFBF2] to-[#FAF5E8] border-[#E8D8C4] text-[#3A2418] shadow-[0_16px_48px_rgba(89,26,13,0.18)]"
            }`}
          >
            {/* Decorative top border accent */}
            <div 
              className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${
                isDark 
                  ? "from-transparent via-amber-500/70 to-transparent" 
                  : "from-transparent via-[#591A0D]/50 to-transparent"
              }`} 
            />

            {/* Top Ram Ji SVG Badge (Replaces Sparkles) */}
            <div 
              className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 p-2 shadow-lg transition-transform duration-300 hover:scale-105 ${
                isDark 
                  ? "bg-amber-500/15 border-2 border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.2)]" 
                  : "bg-[#FAF2E8] border-2 border-[#E8D8C4] shadow-[0_4px_20px_rgba(89,26,13,0.1)]"
              }`}
            >
              <img 
                src={ramJiSvg} 
                alt="Shree Ram" 
                className="w-14 h-14 object-contain filter drop-shadow-sm" 
              />
            </div>

            {/* Heading & Subheading */}
            <h1 className={`font-serif font-black text-2xl md:text-3xl uppercase tracking-widest mb-1 ${
              isDark ? "text-amber-400" : "text-[#591A0D]"
            }`}>
              {isHi ? "साधना पूर्ण" : "Sadhana Complete"}
            </h1>

            <p className={`text-sm font-serif font-bold mb-6 ${
              isDark ? "text-amber-200/90" : "text-[#786252]"
            }`}>
              Hari Om / हरी ॐ
            </p>

            {/* Stats Cards (Strictly Capped Count) */}
            <div className="grid grid-cols-2 gap-3 mb-6 text-left">
              <div className={`border rounded-2xl p-4 transition-colors ${
                isDark ? "bg-[#24170E]/80 border-amber-500/20" : "bg-[#FAF2E8] border-[#E8D8C4]"
              }`}>
                <span className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${
                  isDark ? "text-white/40" : "text-[#786252]"
                }`}>
                  {isHi ? "जपे गए मंत्र" : "Total Chants"}
                </span>
                <span className={`font-serif font-black text-xl md:text-2xl ${
                  isDark ? "text-amber-400" : "text-[#591A0D]"
                }`}>
                  {finalCount}
                </span>
              </div>

              <div className={`border rounded-2xl p-4 transition-colors ${
                isDark ? "bg-[#24170E]/80 border-amber-500/20" : "bg-[#FAF2E8] border-[#E8D8C4]"
              }`}>
                <span className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${
                  isDark ? "text-white/40" : "text-[#786252]"
                }`}>
                  {isHi ? "लगा समय" : "Duration"}
                </span>
                <span className={`font-serif font-black text-xl md:text-2xl ${
                  isDark ? "text-amber-400" : "text-[#591A0D]"
                }`}>
                  {formatTime(secondsElapsed)}
                </span>
              </div>

              <div className={`border rounded-2xl p-4 col-span-2 transition-colors ${
                isDark ? "bg-[#24170E]/80 border-amber-500/20" : "bg-[#FAF2E8] border-[#E8D8C4]"
              }`}>
                <span className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${
                  isDark ? "text-white/40" : "text-[#786252]"
                }`}>
                  {isHi ? "आपका संकल्प" : "Sankalp Fulfilled"}
                </span>
                <span className={`text-sm font-semibold truncate block ${
                  isDark ? "text-amber-100" : "text-[#591A0D]"
                }`}>
                  {sankalpText || (isHi ? "कोई नहीं" : "None")}
                </span>
              </div>
            </div>

            {/* Blessing Quote */}
            <p className={`text-xs leading-relaxed mb-6 font-medium italic ${
              isDark ? "text-white/60" : "text-[#786252]"
            }`}>
              {isHi
                ? "“परम चेतना आपके संकल्प को सिद्धि प्रदान करें और आपके जीवन में सुख-शांति का संचार हो।”"
                : "“May your intention find fulfillment and may the divine vibrations bring peace and clarity to your life.”"}
            </p>

            {/* Save Sadhana Button (Matching fixed website button color #591A0D) */}
            <button
              onClick={() => onComplete(finalCount, secondsElapsed, activeMantra.id)}
              className={`w-full py-3.5 px-6 rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-md active:scale-95 border ${
                isDark
                  ? "border-amber-500/40 bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 shadow-[0_4px_16px_rgba(245,158,11,0.2)]"
                  : "bg-[#591A0D] border-[#591A0D] hover:bg-[#4A0E12] text-[#FFFDF8] shadow-[0_4px_16px_rgba(89,26,13,0.2)]"
              }`}
            >
              {isHi ? "साधना सुरक्षित करें" : "Save Practice Session"}
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // ─── TOO FAST TAP WARNING TOAST HELPER ─────────────────────────────
  const renderTooFastToast = () => (
    <AnimatePresence>
      {showTooFastToast && (
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-[200] px-5 py-2.5 rounded-2xl border-2 shadow-[0_8px_30px_rgba(0,0,0,0.25)] text-xs md:text-sm font-bold tracking-wide pointer-events-none flex items-center gap-2 select-none ${
            isDark
              ? "bg-[#1e120a] border-amber-500/60 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
              : "bg-[#FFFDF8] border-[#591A0D]/50 text-[#591A0D] shadow-[0_8px_24px_rgba(89,26,13,0.25)]"
          }`}
        >
          <span className="text-base">⚠️</span>
          <span>
            {isHi ? "आप बहुत तेज़ टैप कर रहे हैं! कृपया थोड़ा धीरे जप करें" : "Too fast! Please chant a bit slower"}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderLeaderboardOverlay = () => {
    return (
      <AnimatePresence>
        {leaderboardOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 z-[120] bg-[#090503] flex flex-col justify-between text-[#fbf6f0] select-none overflow-y-auto cursor-default rounded-[2.5rem]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.06),transparent_80%)] pointer-events-none" />

            {/* Header bar */}
            <div className="w-full px-5 py-4 flex items-center justify-between border-b border-[#301a0e]/30 relative z-10">
              <button
                onClick={() => setLeaderboardOpen(false)}
                className="w-10 h-10 rounded-full border border-amber-500/20 bg-black/40 flex items-center justify-center text-amber-200/80 active:scale-95 transition-all"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="text-center flex flex-col items-center">
                <h2 className="font-serif text-[20px] font-bold text-amber-400 tracking-wide">
                  {isHi ? "लीडरबोर्ड" : "Leaderboard"}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="w-4 h-[1px] bg-amber-500/30" />
                  <span className="text-[9px] font-semibold text-amber-500/60 uppercase tracking-widest font-serif">
                    {isHi ? "जाप करें, प्रेरित करें" : "Chant more, inspire more"}
                  </span>
                  <span className="w-4 h-[1px] bg-amber-500/30" />
                </div>
              </div>

              <div className="w-10" />
            </div>

            {/* Scrollable body content */}
            <div className="flex-1 w-full px-4 py-4 space-y-4 overflow-y-auto relative z-10 scrollbar-none">
              {/* Your Rank Card */}
              <div className="bg-gradient-to-r from-[#21110a] to-[#150a06] border border-[#422212]/50 rounded-[1.75rem] p-4 flex items-center justify-between shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(245,158,11,0.04),transparent_60%)] pointer-events-none" />
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border border-amber-500/20 bg-black/40 flex items-center justify-center p-1 relative">
                    <div className="absolute inset-0 rounded-full border border-dashed border-amber-500/10 scale-110 animate-[spin_60s_linear_infinite]" />
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-600/30 to-orange-700/30 flex items-center justify-center text-amber-200 text-sm font-black font-serif">
                      {profile?.name ? profile.name.slice(0, 2).toUpperCase() : (isHi ? "YA" : "YA")}
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] text-amber-200/40 font-bold uppercase tracking-wider block">Your Rank</span>
                    <span className="text-xl font-serif font-black text-amber-400 tracking-wide block leading-tight">
                      #{currentUserRankRow ? currentUserRankRow.rank : "1"}
                    </span>
                    <span className="text-[8px] font-bold text-green-400 flex items-center gap-1 mt-0.5">
                      <span>✓</span>
                      <span>{isHi ? "सक्रिय स्थान" : "Rank Active"}</span>
                    </span>
                  </div>
                </div>

                <div className="h-8 w-[1px] bg-[#3e2516]/40" />

                <div className="text-center">
                  <span className="text-[8px] text-amber-200/40 font-bold uppercase tracking-wider flex items-center gap-1 justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {isHi ? "कुल जाप" : "Total Chants"}
                  </span>
                  <span className="text-sm font-serif font-black text-amber-300 mt-0.5 block tabular-nums">
                    {currentUserRankRow ? currentUserRankRow.chants.toLocaleString() : ((stats.totalChants || 0) + count).toLocaleString()}
                  </span>
                </div>

                <div className="h-8 w-[1px] bg-[#3e2516]/40" />

                <div className="text-center pr-1">
                  <span className="text-[8px] text-amber-200/40 font-bold uppercase tracking-wider flex items-center gap-1 justify-center">
                    <span>🔥</span>
                    {isHi ? "साधना स्ट्रीक" : "Streak"}
                  </span>
                  <span className="text-sm font-serif font-black text-amber-300 mt-0.5 block">
                    {stats.currentStreak || 1} {isHi ? "दिन" : "Day"}
                  </span>
                </div>
              </div>

              {/* Leaderboard content: Podium + Table List */}
              {filteredDevotees.length === 0 ? (
                <div className="w-full bg-[#100906]/65 border border-[#301a0e]/40 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[200px] text-center shadow-lg relative overflow-hidden">
                  <span className="text-4xl mb-3">🧘</span>
                  <h4 className="font-serif text-base font-bold text-amber-400 mb-1">
                    {isHi ? "लीडरबोर्ड खाली है" : "No Devotees Found"}
                  </h4>
                  <p className="text-[10px] text-amber-200/40 max-w-[240px] leading-relaxed">
                    {isHi 
                      ? "चयनित फिल्टर के लिए आज कोई प्रविष्टि नहीं है। पहले स्थान पर आने के लिए जाप प्रारंभ करें!" 
                      : "No devotees match these filters currently. Be the first to start chanting and lead the board!"}
                  </p>
                </div>
              ) : (
                <>
                  {/* Top 3 Podium */}
                  <div className="grid grid-cols-3 gap-2 items-end pt-4 pb-2 px-1 relative select-none">
                    
                    {/* Rank 2 (Left) */}
                    {filteredDevotees[1] ? (
                      <div className="flex flex-col items-center text-center group">
                        <div className="w-16 h-16 rounded-full border-2 border-slate-400 bg-[#151515] flex items-center justify-center p-0.5 relative shadow-[0_0_10px_rgba(148,163,184,0.15)]">
                          {/* Rank badge */}
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-gradient-to-r from-slate-400 to-slate-500 text-black text-[10px] font-black flex items-center justify-center shadow border border-slate-300">
                            2
                          </div>
                          <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-500/30 flex items-center justify-center">
                            {filteredDevotees[1].avatar && (filteredDevotees[1].avatar.includes("http") || filteredDevotees[1].avatar.includes("/")) ? (
                              <img src={filteredDevotees[1].avatar} alt={filteredDevotees[1].name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-slate-300 font-bold text-sm font-serif">{filteredDevotees[1].name.charAt(0).toLowerCase()}</span>
                            )}
                          </div>
                        </div>

                        <span className="text-[11px] font-bold text-amber-100/90 mt-2 truncate max-w-[90px]">
                          {filteredDevotees[1].name}
                        </span>
                        <span className="text-[8px] font-bold text-orange-400/80 flex items-center gap-0.5 mt-0.5 justify-center">
                          <span>🔥</span>
                          <span>{filteredDevotees[1].streak || 0} {isHi ? "दिन" : "Days"}</span>
                        </span>

                        {/* Podium Stand */}
                        <div className="w-full bg-gradient-to-b from-[#1b1a1a] to-[#0d0d0d] border border-slate-400/10 rounded-t-xl h-20 mt-3 flex flex-col justify-center items-center shadow-lg px-1">
                          <span className="text-base font-serif font-black text-slate-300 tabular-nums">
                            {filteredDevotees[1].chants.toLocaleString()}
                          </span>
                          <span className="text-[7px] text-slate-400/60 font-bold uppercase tracking-wider mt-0.5">Chants</span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-10" />
                    )}

                    {/* Rank 1 (Center) */}
                    {filteredDevotees[0] && (
                      <div className="flex flex-col items-center text-center group z-10">
                        <div className="w-20 h-20 rounded-full border-2 border-yellow-500 bg-[#1c140e] flex items-center justify-center p-0.5 relative shadow-[0_0_16px_rgba(234,179,8,0.35)]">
                          {/* Rank badge */}
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-black text-xs font-black flex items-center justify-center shadow border border-yellow-300">
                            1
                          </div>
                          <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-amber-700 to-orange-950 border border-yellow-500/30 flex items-center justify-center">
                            {filteredDevotees[0].avatar && (filteredDevotees[0].avatar.includes("http") || filteredDevotees[0].avatar.includes("/")) ? (
                              <img src={filteredDevotees[0].avatar} alt={filteredDevotees[0].name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-amber-200 font-bold text-lg font-serif">{filteredDevotees[0].name.charAt(0).toLowerCase()}</span>
                            )}
                          </div>
                        </div>

                        <span className="text-xs font-serif font-black text-amber-300 mt-2 truncate max-w-[105px] drop-shadow">
                          {filteredDevotees[0].name}
                        </span>
                        <span className="text-[9px] font-bold text-orange-400 flex items-center gap-0.5 mt-0.5 justify-center">
                          <span>🔥</span>
                          <span>{filteredDevotees[0].streak || 0} {isHi ? "दिन" : "Days"}</span>
                        </span>

                        {/* Podium Stand */}
                        <div className="w-full bg-gradient-to-b from-[#2a170b] to-[#120904] border border-yellow-500/20 rounded-t-2xl h-28 mt-3 flex flex-col justify-center items-center shadow-2xl relative overflow-hidden px-1">
                          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
                          <span className="text-lg font-serif font-black text-yellow-400 drop-shadow tabular-nums">
                            {filteredDevotees[0].chants.toLocaleString()}
                          </span>
                          <span className="text-[8px] text-yellow-500/60 font-bold uppercase tracking-wider mt-0.5">Chants</span>
                        </div>
                      </div>
                    )}

                    {/* Rank 3 (Right) */}
                    {filteredDevotees[2] ? (
                      <div className="flex flex-col items-center text-center group">
                        <div className="w-14 h-14 rounded-full border-2 border-amber-700 bg-[#130f0d] flex items-center justify-center p-0.5 relative shadow-[0_0_10px_rgba(180,83,9,0.15)]">
                          {/* Rank badge */}
                          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4.5 h-4.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-800 text-white text-[9px] font-black flex items-center justify-center shadow border border-amber-600">
                            3
                          </div>
                          <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-amber-800 to-orange-955 border border-amber-700/30 flex items-center justify-center">
                            {filteredDevotees[2].avatar && (filteredDevotees[2].avatar.includes("http") || filteredDevotees[2].avatar.includes("/")) ? (
                              <img src={filteredDevotees[2].avatar} alt={filteredDevotees[2].name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-amber-500 font-bold text-sm font-serif">{filteredDevotees[2].name.charAt(0).toLowerCase()}</span>
                            )}
                          </div>
                        </div>

                        <span className="text-[11px] font-bold text-amber-100/90 mt-2 truncate max-w-[85px]">
                          {filteredDevotees[2].name}
                        </span>
                        <span className="text-[8px] font-bold text-orange-400/80 flex items-center gap-0.5 mt-0.5 justify-center">
                          <span>🔥</span>
                          <span>{filteredDevotees[2].streak || 0} {isHi ? "दिन" : "Days"}</span>
                        </span>

                        {/* Podium Stand */}
                        <div className="w-full bg-gradient-to-b from-[#18110e] to-[#0c0807] border border-amber-700/10 rounded-t-xl h-16 mt-3 flex flex-col justify-center items-center shadow-lg px-1">
                          <span className="text-base font-serif font-black text-amber-600 tabular-nums">
                            {filteredDevotees[2].chants.toLocaleString()}
                          </span>
                          <span className="text-[7px] text-amber-700/60 font-bold uppercase tracking-wider mt-0.5">Chants</span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-10" />
                    )}

                  </div>

                  {/* Devotees Table List (Ranks 4+) */}
                  <div className="bg-[#100906]/65 border border-[#301a0e]/40 rounded-3xl overflow-hidden shadow-lg">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-[#170e0a]/80 text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-amber-200/50 border-b border-[#301a0e]/30 select-none">
                      <div className="col-span-2 text-center">{isHi ? "रैंक" : "Rank"}</div>
                      <div className="col-span-7 pl-2">{isHi ? "साधक" : "Devotee"}</div>
                      <div className="col-span-3 text-right pr-2">{isHi ? "कुल जाप" : "Chants"}</div>
                    </div>

                    {/* Table Rows */}
                    <div className="divide-y divide-[#301a0e]/20 max-h-[220px] overflow-y-auto scrollbar-none">
                      {filteredDevotees.slice(3).map((devotee, idx) => {
                        const rankNum = idx + 4;
                        const isCurrentUser = devotee.id === (profile?.id || userId || "current_user");
                        return (
                          <div 
                            key={devotee.id}
                            className={`grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-amber-500/[0.02] transition-colors ${
                              isCurrentUser ? "bg-amber-500/5" : ""
                            }`}
                          >
                            {/* Rank */}
                            <div className="col-span-2 text-center font-serif text-sm font-black text-amber-200/70">
                              {rankNum}
                            </div>

                            <div className="col-span-7 flex items-center gap-2.5 min-w-0">
                              {/* Small Avatar circle with initials/gradient */}
                              <div className="w-8 h-8 rounded-full border border-amber-600/20 overflow-hidden bg-[#221221] flex items-center justify-center shrink-0">
                                {devotee.avatar && (devotee.avatar.includes("http") || devotee.avatar.includes("/")) ? (
                                  <img src={devotee.avatar} alt={devotee.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-[10px] font-black text-amber-300 font-serif">
                                    {devotee.name.charAt(0).toLowerCase()}
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0 flex flex-col">
                                <span className={`text-[11px] font-bold truncate flex items-center gap-1 ${
                                  isCurrentUser ? "text-amber-300" : "text-amber-100"
                                }`}>
                                  {devotee.name}
                                </span>
                                <span className="text-[8px] text-orange-400 font-bold flex items-center gap-0.5 mt-0.5">
                                  <span>🔥</span>
                                  <span>{devotee.streak || 0}d</span>
                                </span>
                              </div>
                            </div>

                            {/* Total Chants */}
                            <div className="col-span-3 text-right pr-2 flex items-center gap-1.5 justify-end">
                              <span className="font-serif text-[11px] font-bold text-amber-300 tabular-nums">
                                {devotee.chants.toLocaleString()}
                              </span>
                              <svg className="w-3.5 h-3.5 text-amber-500/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                              </svg>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="w-full px-5 py-4 border-t border-[#301a0e]/30 bg-black/20 flex justify-center z-10 relative">
              <button
                onClick={() => setLeaderboardOpen(false)}
                className="w-full bg-gradient-to-r from-amber-400 to-orange-600 hover:from-amber-500 hover:to-orange-700 text-black font-black py-4 px-6 rounded-2xl shadow-xl transition-all text-sm uppercase tracking-widest active:scale-95"
              >
                {isHi ? "जाप साधना जारी रखें" : "Keep Chanting"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // ─── AUTO JAP SPEED MODAL OVERLAY ──────────────────────────────
  const renderAutoJapaSpeedModal = () => {
    if (!autoJapaSpeedModalOpen) return null;
    const presets = [0.5, 1.0, 1.5, 2.0, 3.0, 5.0];

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setAutoJapaSpeedModalOpen(false)}
          className="fixed inset-0 z-[300] bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 select-none"
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl border ${
              isDark
                ? "bg-[#140b07] border-amber-500/30 text-amber-100"
                : "bg-[#FFFDF8] border-[#E8D8C4] text-[#33140A]"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5 border-b pb-3 border-amber-500/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-500">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className={`font-serif text-lg font-bold ${isDark ? "text-amber-300" : "text-[#591A0D]"}`}>
                    {isHi ? "ऑटो जप गति सेटिंग" : "Auto Jap Speed Settings"}
                  </h3>
                  <p className="text-[11px] font-medium opacity-70">
                    {isHi ? "वह समय अंतराल चुनें जिसमें अगला जप स्वतः बढ़ेगा" : "Set interval time between automatic chants"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAutoJapaSpeedModalOpen(false)}
                className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                  isDark ? "border-amber-500/30 text-amber-400" : "border-[#E8D8C4] text-[#591A0D]"
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current interval display card */}
            <div className={`p-4 rounded-2xl text-center mb-5 border ${
              isDark ? "bg-amber-950/30 border-amber-500/30" : "bg-[#FAF5E8] border-[#E8D8C4]"
            }`}>
              <span className="text-[11px] font-bold uppercase tracking-wider block opacity-75">
                {isHi ? "वर्तमान गति (Current Rate)" : "Current Interval"}
              </span>
              <div className="flex items-center justify-center gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => setAutoJapaIntervalSec((prev) => Math.max(0.5, Number((prev - 0.5).toFixed(1))))}
                  className={`w-10 h-10 rounded-full font-black text-xl flex items-center justify-center active:scale-95 transition-all shadow-sm ${
                    isDark ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-[#591A0D]/15 text-[#591A0D] border border-[#591A0D]/30"
                  }`}
                >
                  -
                </button>
                <span className={`text-3xl font-serif font-black ${isDark ? "text-amber-300" : "text-[#591A0D]"}`}>
                  {autoJapaIntervalSec} <span className="text-sm font-sans font-semibold opacity-80">{isHi ? "सेकंड" : "sec"}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setAutoJapaIntervalSec((prev) => Math.min(10, Number((prev + 0.5).toFixed(1))))}
                  className={`w-10 h-10 rounded-full font-black text-xl flex items-center justify-center active:scale-95 transition-all shadow-sm ${
                    isDark ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-[#591A0D]/15 text-[#591A0D] border border-[#591A0D]/30"
                  }`}
                >
                  +
                </button>
              </div>
              <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-2">
                ≈ {Math.round(60 / autoJapaIntervalSec)} {isHi ? "जाप प्रति मिनट" : "chants / min"}
              </p>
            </div>

            {/* Quick Presets */}
            <div className="mb-6">
              <label className="text-xs font-extrabold uppercase tracking-wider block mb-2 opacity-80">
                {isHi ? "शीघ्र विकल्प (Quick Presets)" : "Quick Speed Presets"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {presets.map((p) => {
                  const isSelected = autoJapaIntervalSec === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setAutoJapaIntervalSec(p)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all border ${
                        isSelected
                          ? isDark
                            ? "bg-amber-500 text-black border-amber-400 shadow-md"
                            : "bg-[#591A0D] text-[#FFFDF8] border-[#591A0D] shadow-md"
                          : isDark
                          ? "bg-stone-900/60 border-stone-800 text-amber-200/80 hover:bg-stone-800"
                          : "bg-[#FFF9F2] border-[#E8D8C4] text-[#591A0D] hover:bg-orange-50"
                      }`}
                    >
                      {p} {isHi ? "से." : "sec"}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsAutoJapaActive((prev) => !prev);
                  setAutoJapaSpeedModalOpen(false);
                }}
                className={`flex-1 py-3.5 rounded-2xl font-black text-xs md:text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                  isAutoJapaActive
                    ? "bg-rose-600 hover:bg-rose-700 text-white"
                    : isDark
                    ? "bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                    : "bg-[#591A0D] hover:bg-[#451309] text-[#FFFDF8] shadow-[0_4px_12px_rgba(89,26,13,0.3)]"
                }`}
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>
                  {isAutoJapaActive
                    ? (isHi ? "ऑटो जप रोकें" : "Stop Auto Jap")
                    : (isHi ? "ऑटो जप चालू करें" : "Start Auto Jap")}
                </span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // ─── VOICE COUNTER — full screen mode ────────────────────────────
  if (practiceMode === "voice" && showVoiceInstructions) {
    const mantraDisplayName = isHi ? activeMantra.name_hindi : activeMantra.name_english;

    const tips = isHi
      ? [
          { icon: <Mic className="w-5 h-5 text-amber-400" />, bg: "bg-amber-500/15 border-amber-500/30", text: "मंत्र को स्पष्ट और सामान्य गति से बोलें" },
          { icon: <span className="text-lg font-bold text-purple-300 font-serif">ॐ</span>, bg: "bg-purple-500/15 border-purple-400/30", text: "हर पूर्ण मंत्र के बाद गिनती अपने आप बढ़ेगी" },
          { icon: <MicOff className="w-5 h-5 text-red-400" />, bg: "bg-red-500/15 border-red-400/30", text: "आसपास का शोर कम रखें" },
          { icon: <Smartphone className="w-5 h-5 text-blue-400" />, bg: "bg-blue-500/15 border-blue-400/30", text: "फोन को अपने पास रखें" },
          { icon: <span className="text-lg text-rose-400">♡</span>, bg: "bg-rose-500/15 border-rose-400/30", text: "गिनती से अधिक भाव और एकाग्रता महत्वपूर्ण है" },
        ]
      : [
          { icon: <Mic className="w-5 h-5 text-amber-400" />, bg: "bg-amber-500/15 border-amber-500/30", text: "Speak the mantra clearly at a normal pace" },
          { icon: <span className="text-lg font-bold text-purple-300 font-serif">ॐ</span>, bg: "bg-purple-500/15 border-purple-400/30", text: "Count increases automatically after each full mantra" },
          { icon: <MicOff className="w-5 h-5 text-red-400" />, bg: "bg-red-500/15 border-red-400/30", text: "Keep surrounding noise to a minimum" },
          { icon: <Smartphone className="w-5 h-5 text-blue-400" />, bg: "bg-blue-500/15 border-blue-400/30", text: "Keep the phone close to you" },
          { icon: <span className="text-lg text-rose-400">♡</span>, bg: "bg-rose-500/15 border-rose-400/30", text: "Devotion and focus matter more than the count" },
        ];

    return (
      /* ── Full-screen backdrop — z-[200] sits above MobileBottomNav (z-50) ── */
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-end md:justify-center"
        style={{ background: "rgba(0,0,0,0.82)" }}
      >
        {/* Desktop decorative bg elements */}
        <div className="hidden md:block absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(120,53,15,0.3)_0%,transparent_55%)] pointer-events-none" />
        <div className="hidden md:block absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(234,179,8,0.05),transparent_60%)] pointer-events-none" />
        <span className="hidden md:block absolute top-8 left-10 text-[90px] text-amber-500/[0.04] font-serif select-none pointer-events-none">ॐ</span>
        <span className="hidden md:block absolute bottom-12 right-10 text-[130px] text-amber-500/[0.03] font-serif select-none pointer-events-none">ॐ</span>

        {/* ── CARD — slides up from bottom on mobile, centered on desktop ── */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 200 }}
          className={`relative w-full flex flex-col overflow-hidden
            rounded-t-[2rem]
            max-h-[80dvh] mb-16 md:mb-0
            md:rounded-[2.5rem] md:max-w-2xl md:max-h-[85vh] md:border ${
              isDark 
                ? "bg-gradient-to-b from-[#1c0e05] to-[#09070a] text-[#fbf6f0] border-amber-500/20 shadow-[0_0_80px_rgba(0,0,0,0.9)]" 
                : "bg-[#FFFDF8] text-[#33140A] border-[#E8D8C4] shadow-[0_-10px_40px_rgba(89,26,13,0.18)]"
            }`}
        >
          {/* Drag handle (mobile only) */}
          <div className="md:hidden flex justify-center pt-3 pb-1">
            <div className={`w-10 h-1.5 rounded-full ${isDark ? "bg-amber-500/25" : "bg-[#591A0D]/20"}`} />
          </div>

          {/* Header */}
          <div className={`relative z-20 flex items-center justify-between px-5 pt-2 pb-3 border-b ${
            isDark ? "border-white/5 bg-black/20" : "border-[#E8D8C4] bg-[#FAF5E8]"
          }`}>
            <button
              onClick={() => {
                if (count >= targetCount) onComplete(count, secondsElapsed, activeMantra.id);
                else onClose(activeMantra.id);
              }}
              className={`w-10 h-10 rounded-full border flex items-center justify-center active:scale-95 transition-all ${
                isDark 
                  ? "border-amber-500/20 bg-black/40 hover:bg-black/60 text-amber-300" 
                  : "border-[#E8D8C4] bg-[#FFFDF8] hover:bg-[#FFF9F2] text-[#591A0D]"
              }`}
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="text-center flex flex-col items-center flex-1 mx-2">
              <h1 className={`font-serif text-[18px] font-bold tracking-wide select-none ${
                isDark ? "text-amber-300" : "text-[#591A0D]"
              }`}>
                {isHi ? "🪷 जप कैसे करें? 🪷" : "🪷 How to Chant? 🪷"}
              </h1>
            </div>
            <div className="w-10 h-10" />
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 scrollbar-none overscroll-contain pb-6">
            <div className="grid grid-cols-2 gap-3 items-start">
              <div className="flex flex-col gap-2">
                {tips.map((tip, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.07 * i }}
                    className={`flex items-center gap-2.5 rounded-2xl px-3 py-3 shadow-sm border ${
                      isDark 
                        ? "bg-[#1a0e06]/80 border-amber-500/20 text-amber-100" 
                        : "bg-[#FAF5E8] border-[#E8D8C4] text-[#591A0D]"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full ${tip.bg} border flex items-center justify-center flex-shrink-0`}>
                      {tip.icon}
                    </div>
                    <p className={`text-[11px] font-semibold leading-snug ${
                      isDark ? "text-amber-100/90" : "text-[#591A0D]"
                    }`}>{tip.text}</p>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col gap-2.5">
                <p className={`text-[9px] font-bold uppercase tracking-widest text-right pr-1 ${
                  isDark ? "text-amber-500/60" : "text-[#786252]"
                }`}>
                  {isHi ? "उदाहरण मंत्र" : "Example Mantra"}
                </p>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 }}
                  className={`rounded-2xl px-3 py-3 text-center border ${
                    isDark 
                      ? "bg-[#1a0e06]/80 border-amber-500/25 text-amber-300" 
                      : "bg-[#FFF9F2] border-[#E8D8C4] text-[#591A0D]"
                  }`}
                >
                  <p className="font-serif text-[14px] font-bold leading-relaxed whitespace-pre-line">
                    {isHi ? "ॐ नमो\nनारायणाय" : "Om Namo\nNarayanaya"}
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22 }}
                  className={`rounded-2xl px-3 py-3 text-center border ${
                    isDark 
                      ? "bg-[#1a0e06]/80 border-amber-500/25 text-amber-300" 
                      : "bg-[#FFF9F2] border-[#E8D8C4] text-[#591A0D]"
                  }`}
                >
                  <p className="font-serif text-[11px] font-bold leading-relaxed whitespace-pre-line">
                    {isHi
                      ? "हरे कृष्ण हरे कृष्ण\nकृष्ण हरे हरे\nहरे राम हरे राम\nराम राम हरे हरे"
                      : "Hare Krishna Hare Krishna\nKrishna Hare Hare\nHare Ram Hare Ram\nRam Ram Hare Hare"}
                  </p>
                </motion.div>
                 <div className="flex items-center gap-1.5">
                  <span className={`flex-1 h-[1px] ${isDark ? "bg-amber-500/15" : "bg-[#E8D8C4]"}`} />
                  <span className={`text-[9px] font-bold ${isDark ? "text-amber-500/40" : "text-[#786252]"}`}>{isHi ? "या" : "or"}</span>
                  <span className={`flex-1 h-[1px] ${isDark ? "bg-amber-500/15" : "bg-[#E8D8C4]"}`} />
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.32 }}
                  className={`rounded-2xl px-3 py-3 border ${
                    isDark 
                      ? "bg-[#110c06]/70 border-amber-500/15 text-amber-200/60" 
                      : "bg-[#FAF5E8] border-[#E8D8C4] text-[#591A0D]"
                  }`}
                >
                  <p className={`text-[9px] font-bold mb-1 ${isDark ? "text-amber-400/70" : "text-[#591A0D]"}`}>🔔 {isHi ? "ध्यान रखें:" : "Note:"}</p>
                  <p className="text-[10px] leading-snug">
                    {isHi
                      ? "स्वर काउंटर केवल सहायता के लिए है। भगवान तक पहुँचने का मार्ग आपकी श्रद्धा और भक्ति है।"
                      : "Voice counter is just an aid. The path to God is your faith and devotion."}
                  </p>
                </motion.div>
              </div>
            </div>

            {/* 3 selection cards: Sankalp, Method, Goal */}
            <div className="grid grid-cols-3 gap-2 w-full select-none">
              <div className={`flex flex-col items-center text-center p-2.5 rounded-2xl border ${
                isDark ? "bg-black/45 border-white/5" : "bg-[#FAF5E8] border-[#E8D8C4]"
              }`}>
                <span className={`text-[9px] font-bold uppercase tracking-wider ${isDark ? "text-amber-500/60" : "text-[#786252]"}`}>🌸 {isHi ? "संकल्प" : "Sankalp"}</span>
                <span className={`text-[10px] font-bold truncate w-full mt-1 ${isDark ? "text-amber-100" : "text-[#591A0D]"}`}>{sankalpText || (isHi ? "कोई नहीं" : "None")}</span>
              </div>
              <div className={`flex flex-col items-center text-center p-2.5 rounded-2xl border ${
                isDark ? "bg-black/45 border-white/5" : "bg-[#FAF5E8] border-[#E8D8C4]"
              }`}>
                <span className={`text-[9px] font-bold uppercase tracking-wider ${isDark ? "text-amber-500/60" : "text-[#786252]"}`}>📿 {isHi ? "विधि" : "Method"}</span>
                <span className={`text-[10px] font-bold truncate w-full mt-1 ${isDark ? "text-amber-100" : "text-[#591A0D]"}`}>{isHi ? "स्वर जप" : "Voice Japa"}</span>
              </div>
              <div className={`flex flex-col items-center text-center p-2.5 rounded-2xl border ${
                isDark ? "bg-black/45 border-white/5" : "bg-[#FAF5E8] border-[#E8D8C4]"
              }`}>
                <span className={`text-[9px] font-bold uppercase tracking-wider ${isDark ? "text-amber-500/60" : "text-[#786252]"}`}>🎯 {isHi ? "लक्ष्य" : "Goal"}</span>
                <span className={`text-[10px] font-bold truncate w-full mt-1 ${isDark ? "text-amber-100" : "text-[#591A0D]"}`}>{targetCount} {isHi ? "जाप" : "Chants"}</span>
              </div>
            </div>

          </div>

          {/* Bottom sticky: Start button + Don't show again */}
          <div className={`px-5 pb-5 pt-3 border-t flex flex-col gap-3 ${
            isDark ? "border-white/5 bg-black/30" : "border-[#E8D8C4] bg-[#FAF5E8]"
          }`}>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={beginVoiceListening}
              className={`w-full py-3.5 md:py-4 rounded-2xl font-bold text-[15px] tracking-wide transition-all font-display flex items-center justify-center gap-2 shadow-lg active:scale-98 ${
                isDark
                  ? "bg-gradient-to-r from-amber-600 to-yellow-500 text-black shadow-[0_0_20px_rgba(212,165,58,0.35)]"
                  : "bg-[#651317] hover:bg-[#4f0f12] text-[#FFFDF8] border border-amber-400/30 shadow-[0_4px_16px_rgba(101,19,23,0.35)]"
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              {isHi ? "समझ गया, जप प्रारम्भ करें" : "Got it, Start Chanting"}
            </motion.button>

            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.setItem("voice_instructions_seen", "1");
                } catch {
                  /* ignore */
                }
                beginVoiceListening();
              }}
              className={`flex items-center justify-center gap-2 text-[11px] transition-colors select-none mx-auto pb-1 ${
                isDark ? "text-amber-200/40 hover:text-amber-200/70" : "text-[#786252] hover:text-[#651317]"
              }`}
            >
              <span
                className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                  isDark
                    ? "border-amber-500/30 bg-black/30 text-amber-400"
                    : "border-[#E8D8C4] bg-[#FFFDF8] text-[#651317]"
                }`}
              >
                ✓
              </span>
              {isHi ? "दोबारा न दिखाएं" : "Don't show again"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (practiceMode === "voice") {
    const mantraDisplayName = isHi ? activeMantra.name_hindi : activeMantra.name_english;
    const barCount = 24;
    const normalizedLevel = Math.min(1, (dbLevel || 0) / 90);
    const progressPct = Math.min(100, Math.round((count / Math.max(1, targetCount)) * 100));

    const statusTitle = voiceActive
      ? isHi
        ? "सुन रहा है..."
        : "Listening..."
      : voiceEverStarted
        ? isHi
          ? "रुका हुआ है"
          : "Paused"
        : isHi
          ? "शुरू करें दबाएँ, फिर मंत्र बोलें"
          : "Press Start, then speak the mantra";

    const statusHint = micDenied
      ? isHi
        ? "माइक एक्सेस अस्वीकार — सेटिंग्स में अनुमति दें"
        : "Mic access denied — allow permission in settings"
      : voiceActive && lastRecognizedText
        ? `"${lastRecognizedText}"`
        : recognitionSupported
          ? isHi
            ? "फ़ोन पास रखें — बोलते ही गिनती बढ़ेगी"
            : "Keep the phone nearby — speaking increments the count"
          : isHi
            ? "आवाज़ से गिन रहे हैं (पहचान उपलब्ध नहीं)"
            : "Counting by voice volume";

    const primaryCtaLabel = voiceActive
      ? isHi
        ? "रोकें"
        : "Pause"
      : voiceEverStarted
        ? isHi
          ? "फिर से शुरू करें"
          : "Resume"
        : isHi
          ? "शुरू करें"
          : "Start";

    return (
      <div
        className={`fixed inset-0 z-[100] flex flex-col overflow-hidden ${
          isDark ? "bg-[#0c0a08] text-amber-50" : "bg-[#FAF6EE] text-[#3A2418]"
        }`}
      >
        {!isDark && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(180deg, #FFFDF8 0%, #FAF6EE 45%, #F5EDE0 100%)",
            }}
          />
        )}

        {/* Full-bleed Hanuman hero — same as mala mode */}
        <div
          className={`absolute top-0 left-0 right-0 pointer-events-none overflow-hidden z-0 select-none ${
            isDark ? "opacity-[0.55]" : "opacity-[0.7]"
          }`}
          style={{ height: isMobile ? "48vh" : "55vh" }}
        >
          <img
            src={hanumanDevotionalImg}
            className="w-full h-full object-cover object-top max-w-5xl mx-auto"
            style={{
              maskImage: "linear-gradient(to bottom, black 45%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 45%, transparent 100%)",
            }}
            alt=""
          />
        </div>

        {/* Floating header */}
        <div className="relative z-20 shrink-0 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-1">
          <div className="mx-auto max-w-lg flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                pauseVoiceListening();
                stopMicListening({ clearActive: false });
                if (count >= targetCount) onComplete(count, secondsElapsed, activeMantra.id);
                else onClose(activeMantra.id);
              }}
              className="w-10 h-10 rounded-full border border-[#E8D8C4]/90 dark:border-stone-600 bg-[#FFFDF8]/90 dark:bg-stone-900/90 backdrop-blur-sm flex items-center justify-center text-[#651317] dark:text-amber-300 active:scale-95 transition-all shadow-sm"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="min-w-0 text-center flex-1 px-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#786252] dark:text-amber-500/70">
                {isHi ? "ध्वनि जाप" : "Voice Japa"}
              </p>
              <h1 className="font-display text-sm sm:text-base font-bold text-[#651317] dark:text-amber-200 truncate">
                {mantraDisplayName}
              </h1>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const currentQuery = new URLSearchParams(window.location.search);
                  currentQuery.set("resumeCount", count.toString());
                  currentQuery.set("resumeSeconds", secondsElapsed.toString());
                  const returnPath = `/meditation?${currentQuery.toString()}`;
                  navigate(`/leaderboard?returnPath=${encodeURIComponent(returnPath)}`);
                }}
                className="w-10 h-10 rounded-full border border-[#E8D8C4]/90 dark:border-stone-600 bg-[#FFFDF8]/90 dark:bg-stone-900/90 backdrop-blur-sm flex items-center justify-center text-[#651317] dark:text-amber-300 active:scale-95 transition-all shadow-sm"
                aria-label="Leaderboard"
              >
                <Trophy className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setSettingsOpen((s) => !s)}
                className="w-10 h-10 rounded-full border border-[#E8D8C4]/90 dark:border-stone-600 bg-[#FFFDF8]/90 dark:bg-stone-900/90 backdrop-blur-sm flex items-center justify-center text-[#651317] dark:text-amber-300 active:scale-95 transition-all shadow-sm"
                aria-label="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Body — listening orb is the primary visual */}
        <div className="relative z-10 flex-1 min-h-0 overflow-y-auto px-4">
          <div className="mx-auto max-w-lg h-full min-h-[320px] flex flex-col items-center justify-center gap-3 sm:gap-4 py-3">
            {/* Listening orb + radial waveform bars */}
            <div className="relative flex items-center justify-center w-[200px] h-[200px] sm:w-[240px] sm:h-[240px]">
              {/* Pulse rings when listening */}
              {voiceActive && (
                <>
                  <motion.div
                    className="absolute inset-6 rounded-full border border-[#651317]/35 dark:border-amber-400/40"
                    animate={{ scale: [1, 1.18, 1], opacity: [0.55, 0, 0.55] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
                  />
                  <motion.div
                    className="absolute inset-2 rounded-full border border-[#651317]/20 dark:border-amber-400/25"
                    animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1.8, delay: 0.35, ease: "easeOut" }}
                  />
                </>
              )}

              {/* Circular waveform ticks around orb */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {Array.from({ length: barCount }).map((_, i) => {
                  const angle = (i / barCount) * 360;
                  const distFromCenter = Math.abs(i - barCount / 2) / (barCount / 2);
                  const base = 10;
                  const boost = voiceActive
                    ? normalizedLevel * (18 + (1 - distFromCenter) * 10)
                    : 0;
                  const h = base + boost + (voiceActive ? Math.sin(i * 1.7 + Date.now() / 200) * 4 : 0);
                  return (
                    <div
                      key={i}
                      className="absolute left-1/2 top-1/2 origin-bottom"
                      style={{
                        width: 3,
                        height: Math.max(8, h),
                        marginLeft: -1.5,
                        marginTop: -100,
                        transform: `rotate(${angle}deg) translateY(-72px)`,
                        borderRadius: 999,
                        background: voiceActive
                          ? "linear-gradient(to top, #651317, #F5C15C)"
                          : "rgba(101,19,23,0.22)",
                      }}
                    />
                  );
                })}
              </div>

              {/* Mic orb */}
              <motion.button
                type="button"
                onClick={() => {
                  if (voiceActive) pauseVoiceListening();
                  else beginVoiceListening();
                }}
                animate={
                  voiceActive
                    ? { scale: [1, 1.04, 1] }
                    : { scale: 1 }
                }
                transition={
                  voiceActive
                    ? { repeat: Infinity, duration: 1.6, ease: "easeInOut" }
                    : undefined
                }
                className={`relative z-10 w-[104px] h-[104px] sm:w-[120px] sm:h-[120px] rounded-full flex items-center justify-center border-2 transition-shadow active:scale-95 ${
                  voiceActive
                    ? "bg-[#651317] border-amber-400/50 shadow-[0_0_32px_rgba(101,19,23,0.45)] text-amber-300"
                    : voiceEverStarted
                    ? "bg-[#FFFDF8] border-[#E8D8C4] text-[#651317] dark:bg-stone-900 dark:border-stone-600 dark:text-amber-300 opacity-90"
                    : "bg-[#FFFDF8] border-[#651317]/40 text-[#651317] dark:bg-stone-900 dark:border-amber-500/40 dark:text-amber-300 shadow-md"
                }`}
                aria-label={primaryCtaLabel}
              >
                {voiceActive ? (
                  <Pause className="w-9 h-9 sm:w-10 sm:h-10 fill-current" />
                ) : (
                  <Mic className="w-9 h-9 sm:w-10 sm:h-10" />
                )}
              </motion.button>
            </div>

            {/* Progress */}
            <div className="w-44 sm:w-52 h-1.5 rounded-full bg-[#E8D8C4]/80 dark:bg-stone-700 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-[#651317] dark:bg-amber-400"
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.35 }}
              />
            </div>

            {/* One count */}
            <div className="text-center">
              <p className="font-display text-[52px] sm:text-[64px] font-bold leading-none tracking-tight tabular-nums text-[#651317] dark:text-amber-300">
                {count}
                <span className="text-xl sm:text-2xl font-semibold text-[#786252] dark:text-amber-200/50 ml-1.5">
                  /{targetCount}
                </span>
              </p>
              <span className="inline-block mt-2 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase border border-[#E8D8C4] bg-[#FFFDF8]/95 text-[#651317] dark:bg-stone-900 dark:border-stone-700 dark:text-amber-300">
                {isHi
                  ? `दौर ${Math.floor(count / 108) + 1}`
                  : `Round ${Math.floor(count / 108) + 1}`}
              </span>
            </div>

            {/* Status */}
            <div className="text-center max-w-sm px-2">
              <motion.h2
                key={statusTitle}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-base sm:text-lg font-semibold text-[#651317] dark:text-amber-100"
              >
                {statusTitle}
              </motion.h2>
              <p
                className={`text-xs mt-1 leading-snug ${
                  micDenied
                    ? "text-red-600 dark:text-red-400"
                    : "text-[#786252] dark:text-stone-400"
                }`}
              >
                {statusHint}
              </p>
            </div>

            {/* Mantra once */}
            <div className="text-center max-w-md px-3">
              <p className="font-display text-sm sm:text-base font-bold leading-relaxed text-[#651317] dark:text-amber-200 whitespace-pre-line">
                {isHi
                  ? activeMantra.full_text_hindi || activeMantra.name_hindi
                  : activeMantra.transliteration || activeMantra.name_english}
              </p>
              <p className="text-[11px] mt-1.5 text-[#786252] dark:text-stone-500 tracking-wide">
                {isHi
                  ? "फ़ोन पास रखें — बोलते ही गिनती बढ़ेगी"
                  : "Keep the phone nearby — speaking increments the count"}
              </p>
            </div>

            {/* Compact strip */}
            <div className="w-full max-w-md rounded-full border border-[#E8D8C4] bg-[#FFFDF8]/95 dark:bg-stone-900/80 dark:border-stone-700 px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-[#786252] dark:text-stone-400 shadow-sm">
              <span className="text-[#651317] dark:text-amber-300 font-bold tabular-nums">
                {formatTime(secondsElapsed)}
              </span>
              <span className="opacity-40">·</span>
              <span className="text-[#651317] dark:text-amber-300 font-bold tabular-nums">
                {count}/{targetCount}
              </span>
              <span className="opacity-40">·</span>
              <span>
                {isHi ? "आज" : "Today"}{" "}
                <span className="text-[#651317] dark:text-amber-300 font-bold tabular-nums">
                  {displayTodayChants}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Sticky Start / Pause / Resume — always in view */}
        <div className="relative z-20 shrink-0 border-t border-[#E8D8C4] dark:border-stone-800 bg-[#FFFDF8]/98 dark:bg-[#120a06]/98 backdrop-blur-sm px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto max-w-lg flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleResetClick}
              className="w-12 h-12 rounded-full border border-[#E8D8C4] dark:border-stone-700 bg-[#FFFDF8] dark:bg-stone-900 text-[#651317] dark:text-amber-300 flex items-center justify-center active:scale-95 transition-all shrink-0"
              aria-label={isHi ? "रीसेट" : "Reset"}
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (voiceActive) pauseVoiceListening();
                else beginVoiceListening();
              }}
              className="flex-1 h-12 rounded-full bg-[#651317] hover:bg-[#4f0f12] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-[0_6px_20px_rgba(101,19,23,0.4)] border border-amber-400/30"
            >
              {voiceActive ? (
                <Pause className="w-4 h-4 fill-current text-amber-300" />
              ) : (
                <Mic className="w-4 h-4 text-amber-300" />
              )}
              {primaryCtaLabel}
            </button>
          </div>
        </div>

        {/* Settings drawer */}
        <AnimatePresence>
          {settingsOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSettingsOpen(false)}
                className="fixed inset-0 z-[80] bg-black/65 backdrop-blur-xs"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 24, stiffness: 180 }}
                className="fixed bottom-0 inset-x-0 z-[90] max-w-lg mx-auto rounded-t-[28px] px-6 pb-8 pt-4 border-t border-[#E8D8C4] dark:border-stone-700 bg-[#FFFDF8] dark:bg-[#130d0a] text-[#3A2418] dark:text-amber-100 shadow-2xl"
              >
                <div
                  onClick={() => setSettingsOpen(false)}
                  className="w-12 h-1.5 rounded-full mx-auto mb-6 cursor-pointer bg-[#E8D8C4] dark:bg-amber-500/20"
                />
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-[#E8D8C4] dark:border-amber-500/10">
                    <div className="flex items-center gap-3">
                      <Flower2 className="w-5 h-5 text-[#651317] dark:text-amber-400" />
                      <span className="text-sm font-semibold text-[#651317] dark:text-amber-100">
                        {isHi ? "मंत्र" : "Mantra"}
                      </span>
                    </div>
                    <div className="relative">
                      <select
                        value={activeMantra.id}
                        onChange={(e) => handleMantraChange(e.target.value)}
                        className="rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none appearance-none pr-8 cursor-pointer border border-[#E8D8C4] dark:border-amber-500/20 bg-[#FAF0E4] dark:bg-black/40 text-[#651317] dark:text-amber-300"
                      >
                        {(mantras || []).map((m) => (
                          <option key={m.id} value={m.id}>
                            {isHi ? m.name_hindi : m.name_english}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#651317] dark:text-amber-500" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-[#E8D8C4] dark:border-amber-500/10">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-[#651317] dark:text-amber-400" />
                      <span className="text-sm font-semibold text-[#651317] dark:text-amber-100">
                        {isHi ? "ध्वनि" : "Sound"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                        soundEnabled ? "bg-[#651317] dark:bg-amber-500" : "bg-black/10 dark:bg-white/10"
                      }`}
                    >
                      <motion.div
                        layout
                        className="w-5 h-5 rounded-full bg-white shadow"
                        animate={{ x: soundEnabled ? 20 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-[#E8D8C4] dark:border-amber-500/10">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-[#651317] dark:text-amber-400" />
                      <span className="text-sm font-semibold text-[#651317] dark:text-amber-100">
                        {isHi ? "कंपन" : "Vibration"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVibrationEnabled(!vibrationEnabled)}
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                        vibrationEnabled
                          ? "bg-[#651317] dark:bg-amber-500"
                          : "bg-black/10 dark:bg-white/10"
                      }`}
                    >
                      <motion.div
                        layout
                        className="w-5 h-5 rounded-full bg-white shadow"
                        animate={{ x: vibrationEnabled ? 20 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-[#651317] dark:text-amber-400" />
                      <span className="text-sm font-semibold text-[#651317] dark:text-amber-100">
                        {isHi ? "स्क्रीन चालू रखें" : "Keep screen on"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutoLockDisabled(!autoLockDisabled)}
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                        autoLockDisabled
                          ? "bg-[#651317] dark:bg-amber-500"
                          : "bg-black/10 dark:bg-white/10"
                      }`}
                    >
                      <motion.div
                        layout
                        className="w-5 h-5 rounded-full bg-white shadow"
                        animate={{ x: autoLockDisabled ? 20 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {renderLeaderboardOverlay()}
        {renderCompletedOverlay()}
        {renderTooFastToast()}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleBackgroundTap}
      className={`fixed inset-0 z-[100] flex flex-col select-none overflow-hidden cursor-pointer transition-colors duration-300 ${
        isDark
          ? "bg-[#0c0a08] text-amber-50"
          : "bg-[#FAF6EE] text-[#3A2418]"
      }`}
    >
      {!isDark && (
        <div
          className="absolute inset-0 pointer-events-none -z-0"
          style={{
            background: "linear-gradient(180deg, #FFFDF8 0%, #FAF6EE 45%, #F5EDE0 100%)",
          }}
        />
      )}

      <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
        {fallingFlowers.map((flower) => (
          <div
            key={flower.id}
            className="falling-ram-flower absolute top-0"
            style={{
              left: `${flower.x}%`,
              width: `${flower.size}px`,
              height: `${flower.size}px`,
              animationDuration: `${flower.duration}s`,
              animationDelay: `${flower.delay}s`,
              "--drift-x": `${flower.driftX}px`,
              "--rot-deg": `${flower.rotationSpeed}deg`,
            } as React.CSSProperties}
          >
            <img
              src={flower.image}
              alt=""
              className="w-full h-full object-contain pointer-events-none"
              loading="eager"
            />
          </div>
        ))}
      </div>

      <div
        className={`absolute top-0 left-0 right-0 pointer-events-none overflow-hidden z-0 select-none ${
          isDark ? "opacity-[0.55]" : "opacity-[0.7]"
        }`}
        style={{ height: isMobile ? "48vh" : "55vh" }}
      >
        <img
          src={hanumanDevotionalImg}
          className="w-full h-full object-cover object-top max-w-5xl mx-auto"
          style={{
            maskImage: "linear-gradient(to bottom, black 45%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 45%, transparent 100%)",
          }}
          alt=""
        />
      </div>

      {/* Floating back + leaderboard (no sticky header bar) */}
      <div className="absolute top-3 left-0 right-0 z-20 pointer-events-none">
        <div className="mx-auto max-w-5xl px-4 lg:px-6 flex items-center justify-between">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (count >= targetCount) {
                onComplete(count, secondsElapsed, activeMantra.id);
              } else {
                onClose(activeMantra.id);
              }
            }}
            className="pointer-events-auto w-10 h-10 rounded-full border border-[#E8D8C4]/90 dark:border-stone-600 bg-[#FFFDF8]/90 dark:bg-stone-900/90 backdrop-blur-sm flex items-center justify-center text-[#651317] dark:text-amber-300 active:scale-95 transition-all shadow-sm"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const currentQuery = new URLSearchParams(window.location.search);
              currentQuery.set("resumeCount", count.toString());
              currentQuery.set("resumeSeconds", secondsElapsed.toString());
              const returnPath = `/meditation?${currentQuery.toString()}`;
              navigate(`/leaderboard?returnPath=${encodeURIComponent(returnPath)}`);
            }}
            className="pointer-events-auto w-10 h-10 rounded-full border border-[#E8D8C4]/90 dark:border-stone-600 bg-[#FFFDF8]/90 dark:bg-stone-900/90 backdrop-blur-sm flex items-center justify-center text-[#651317] dark:text-amber-300 active:scale-95 transition-all shadow-sm"
            aria-label="Leaderboard"
          >
            <Trophy className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative z-10 flex-1 min-h-0 overflow-y-auto overflow-x-hidden pt-14">
        <div className="mx-auto max-w-5xl px-4 lg:px-6 py-3 md:py-6 grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-8 items-center md:items-start">
          <div className="md:col-span-3 flex flex-col items-center justify-center">
            <div
              className="relative flex items-center justify-center select-none"
              style={{
                width: isMobile ? "280px" : "min(100%, 470px)",
                height: isMobile ? "280px" : "min(100%, 470px)",
                maxWidth: isMobile ? 280 : 470,
                maxHeight: isMobile ? 280 : 470,
              }}
            >
              <CircularMalaRing
                count={count}
                targetCount={targetCount}
                isDark={isDark}
                isMobile={isMobile}
                malaType={malaType}
                activeMantra={activeMantra}
                isHi={isHi}
                floatingTexts={floatingTexts}
                onTap={incrementCount}
              />
            </div>

            <p
              className={`mt-3 md:mt-4 px-4 text-center font-display text-base sm:text-lg md:text-xl font-bold leading-snug whitespace-pre-line max-w-md ${
                isDark ? "text-amber-100" : "text-[#651317]"
              }`}
            >
              {isHi
                ? activeMantra.full_text_hindi || activeMantra.name_hindi
                : activeMantra.transliteration || activeMantra.name_english}
            </p>

            <p
              className={`mt-2 text-xs md:text-sm font-medium ${
                isDark ? "text-amber-200/70" : "text-[#786252]"
              }`}
            >
              {count === 0
                ? isHi
                  ? "जाप शुरू करने के लिए कहीं भी टैप करें"
                  : "Tap anywhere to start chanting"
                : isHi
                ? "जाप के लिए कहीं भी टैप करें"
                : "Tap anywhere to count"}
            </p>
          </div>

          <div
            className="md:col-span-2 w-full max-w-md mx-auto md:mx-0 space-y-3 md:space-y-4 md:pt-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-2xl border px-4 py-3 text-xs sm:text-sm font-medium tabular-nums ${
                isDark
                  ? "bg-stone-900/80 border-stone-700 text-stone-300"
                  : "bg-[#FFFDF8] border-[#E8D8C4] text-[#786252]"
              }`}
            >
              <span>
                <span className={isDark ? "text-amber-300 font-bold" : "text-[#651317] font-bold"}>
                  {count}
                </span>
                /{targetCount}
              </span>
              <span className="text-[#E8D8C4] dark:text-stone-600">·</span>
              <span>
                {isHi ? "माला" : "Round"}{" "}
                <span className={isDark ? "text-amber-300 font-bold" : "text-[#651317] font-bold"}>
                  {Math.floor(count / 27) + 1}
                </span>
              </span>
              <span className="text-[#E8D8C4] dark:text-stone-600">·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatTime(secondsElapsed)}
              </span>
              <span className="text-[#E8D8C4] dark:text-stone-600">·</span>
              <span>
                {isHi ? "आज" : "Today"}{" "}
                <span className={isDark ? "text-amber-300 font-bold" : "text-[#651317] font-bold"}>
                  {displayTodayChants}
                </span>
              </span>
            </div>

            <div
              className={`rounded-2xl border p-3 sm:p-4 space-y-2.5 ${
                isDark ? "bg-stone-900/80 border-stone-700" : "bg-[#FFFDF8] border-[#E8D8C4]"
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-center text-[#651317] dark:text-amber-300">
                {isHi ? "माला चुनें" : "Choose Mala"}
              </p>
              <MalaTypePicker
                malaType={malaType}
                onChange={setMalaType}
                isHi={isHi}
                isDark={isDark}
              />
            </div>

            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleResetClick}
                disabled={count === 0}
                className={`inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-full border text-xs font-bold transition-all active:scale-95 disabled:opacity-40 ${
                  isDark
                    ? "border-amber-500/40 text-amber-200 bg-stone-900"
                    : "border-[#E8D8C4] text-[#651317] bg-[#FFFDF8]"
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {isHi ? "रीसेट" : "Reset"}
              </button>

              <button
                type="button"
                onClick={() => setTimerActive(!timerActive)}
                className={`inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-full text-xs font-bold transition-all active:scale-95 ${
                  !timerActive
                    ? "bg-[#651317] text-white"
                    : isDark
                    ? "border border-amber-500/40 text-amber-200 bg-stone-900"
                    : "border border-[#E8D8C4] text-[#651317] bg-[#FFFDF8]"
                }`}
              >
                {!timerActive ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
                {!timerActive ? (isHi ? "जारी" : "Resume") : isHi ? "रोकें" : "Pause"}
              </button>

              <button
                type="button"
                onClick={() => setIsAutoJapaActive((prev) => !prev)}
                className={`inline-flex items-center justify-center gap-1.5 h-10 px-3 rounded-full text-xs font-bold transition-all active:scale-95 ${
                  isAutoJapaActive
                    ? "bg-[#651317] text-white"
                    : isDark
                    ? "border border-amber-500/40 text-amber-200 bg-stone-900"
                    : "border border-[#E8D8C4] text-[#651317] bg-[#FFFDF8]"
                }`}
              >
                <img
                  src={playCircleSvg}
                  className="w-3.5 h-3.5 object-contain"
                  style={{ filter: isAutoJapaActive ? "brightness(0) invert(1)" : undefined }}
                  alt=""
                />
                {isAutoJapaActive
                  ? isHi
                    ? `ऑटो ${autoJapaIntervalSec}s`
                    : `Auto ${autoJapaIntervalSec}s`
                  : isHi
                  ? "ऑटो"
                  : "Auto"}
              </button>

              <button
                type="button"
                onClick={() => setAutoJapaSpeedModalOpen(true)}
                className={`h-10 w-10 rounded-full border flex items-center justify-center active:scale-95 ${
                  isDark
                    ? "border-amber-500/40 text-amber-200 bg-stone-900"
                    : "border-[#E8D8C4] text-[#651317] bg-[#FFFDF8]"
                }`}
                title={isHi ? "गति" : "Speed"}
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
            </div>

            <div
              className={`flex items-stretch divide-x rounded-2xl border overflow-hidden ${
                isDark
                  ? "bg-stone-900/80 border-stone-700 divide-stone-700"
                  : "bg-[#FFFDF8] border-[#E8D8C4] divide-[#E8D8C4]"
              }`}
            >
              <button
                type="button"
                className="flex-1 flex flex-col items-center gap-1 py-2.5 px-2 active:bg-[#FAF0E4]/50 dark:active:bg-stone-800"
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-[#651317] dark:text-amber-300" />
                ) : (
                  <VolumeX className="w-4 h-4 text-[#786252]" />
                )}
                <span className="text-[10px] font-bold text-[#786252] dark:text-stone-400">
                  {soundEnabled ? (isHi ? "ध्वनि चालू" : "Sound On") : isHi ? "ध्वनि बंद" : "Sound Off"}
                </span>
              </button>
              <button
                type="button"
                className="flex-1 flex flex-col items-center gap-1 py-2.5 px-2 active:bg-[#FAF0E4]/50 dark:active:bg-stone-800"
                onClick={() => setVibrationEnabled(!vibrationEnabled)}
              >
                <Smartphone
                  className={`w-4 h-4 ${
                    vibrationEnabled ? "text-[#651317] dark:text-amber-300" : "text-[#786252]"
                  }`}
                />
                <span className="text-[10px] font-bold text-[#786252] dark:text-stone-400">
                  {vibrationEnabled ? (isHi ? "कंपन चालू" : "Vibrate On") : isHi ? "कंपन बंद" : "Vibrate Off"}
                </span>
              </button>
              <button
                type="button"
                className="flex-1 flex flex-col items-center gap-1 py-2.5 px-2 active:bg-[#FAF0E4]/50 dark:active:bg-stone-800"
                onClick={() => setAutoLockDisabled(!autoLockDisabled)}
              >
                <Lock
                  className={`w-4 h-4 ${
                    autoLockDisabled ? "text-[#651317] dark:text-amber-300" : "text-[#786252]"
                  }`}
                />
                <span className="text-[10px] font-bold text-[#786252] dark:text-stone-400">
                  {autoLockDisabled ? (isHi ? "स्क्रीन चालू" : "Stay Awake") : isHi ? "लॉक" : "Auto-lock"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <MobileBottomNav />
      </div>

      <AnimatePresence>
        {settingsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSettingsOpen(false)}
              className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs select-none"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 22, stiffness: 160 }}
              className="fixed bottom-0 inset-x-0 z-[90] bg-[#FFFDF8] dark:bg-[#130d0a] border-t border-[#E8D8C4] dark:border-amber-500/20 rounded-t-[2.5rem] px-6 pb-8 pt-4 shadow-2xl max-w-lg mx-auto settings-panel select-none"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                onClick={() => setSettingsOpen(false)}
                className="w-12 h-1.5 bg-[#E8D8C4] dark:bg-amber-500/20 rounded-full mx-auto mb-6 cursor-pointer"
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-[#E8D8C4] dark:border-amber-500/5">
                  <div className="flex items-center gap-3">
                    <Flower2 className="w-5 h-5 text-[#651317] dark:text-amber-500/70" />
                    <span className="text-sm font-semibold text-[#651317] dark:text-amber-100/80">
                      {isHi ? "मंत्र" : "Mantra"}
                    </span>
                  </div>
                  <div className="relative">
                    <select
                      value={activeMantra.id}
                      onChange={(e) => handleMantraChange(e.target.value)}
                      className="bg-[#FAF0E4] dark:bg-black/40 border border-[#E8D8C4] dark:border-amber-500/20 text-[#651317] dark:text-amber-300 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none appearance-none pr-8 cursor-pointer"
                    >
                      {(mantras || []).map((m) => (
                        <option key={m.id} value={m.id}>
                          {isHi ? m.name_hindi : m.name_english}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#786252] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="py-2 border-b border-[#E8D8C4] dark:border-amber-500/5 space-y-3">
                  <span className="text-sm font-semibold text-[#651317] dark:text-amber-100/80">
                    {isHi ? "माला का प्रकार" : "Mala Type"}
                  </span>
                  <MalaTypePicker
                    malaType={malaType}
                    onChange={setMalaType}
                    isHi={isHi}
                    isDark={isDark}
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-b border-[#E8D8C4] dark:border-amber-500/5">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-[#651317] dark:text-amber-500/70" />
                    <span className="text-sm font-semibold text-[#651317] dark:text-amber-100/80">
                      {isHi ? "ध्वनि" : "Sound"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                      soundEnabled ? "bg-[#651317]" : "bg-[#E8D8C4] dark:bg-white/10"
                    }`}
                  >
                    <motion.div
                      layout
                      className="w-5 h-5 rounded-full bg-white shadow"
                      animate={{ x: soundEnabled ? 20 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-[#E8D8C4] dark:border-amber-500/5">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-[#651317] dark:text-amber-500/70" />
                    <span className="text-sm font-semibold text-[#651317] dark:text-amber-100/80">
                      {isHi ? "कंपन" : "Vibration"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVibrationEnabled(!vibrationEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                      vibrationEnabled ? "bg-[#651317]" : "bg-[#E8D8C4] dark:bg-white/10"
                    }`}
                  >
                    <motion.div
                      layout
                      className="w-5 h-5 rounded-full bg-white shadow"
                      animate={{ x: vibrationEnabled ? 20 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-[#651317] dark:text-amber-500/70" />
                    <span className="text-sm font-semibold text-[#651317] dark:text-amber-100/80">
                      {isHi ? "स्क्रीन चालू रखें" : "Keep screen awake"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoLockDisabled(!autoLockDisabled)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                      autoLockDisabled ? "bg-[#651317]" : "bg-[#E8D8C4] dark:bg-white/10"
                    }`}
                  >
                    <motion.div
                      layout
                      className="w-5 h-5 rounded-full bg-white shadow"
                      animate={{ x: autoLockDisabled ? 20 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {renderLeaderboardOverlay()}
      {renderCompletedOverlay()}
      {renderAutoJapaSpeedModal()}
      {renderTooFastToast()}
    </motion.div>
  );
}

