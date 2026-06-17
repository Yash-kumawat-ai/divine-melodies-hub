import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  Flame
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import type { Mantra } from "@/lib/mantraJapa/mantraJapaApi";
import { useMantraJapa } from "@/hooks/useMantraJapa";
import MobileBottomNav from "@/components/MobileBottomNav";

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

  // Load mantras database
  const { mantras, stats } = useMantraJapa();

  // ─── LOCAL STATE ────────────────────────────────────────────────
  const [activeMantra, setActiveMantra] = useState<Mantra>(mantra);
  const [practiceMode, setPracticeMode] = useState<"mala" | "tap" | "voice" | "guided">(initialPracticeMode);
  const [count, setCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [autoLockDisabled, setAutoLockDisabled] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [malaType, setMalaType] = useState<"rudraksha" | "tulsi" | "sandalwood">("rudraksha");
  
  // Timer tracking
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(true);

  // Guided Mode specific states
  const [guidedPlaying, setGuidedPlaying] = useState(false);

  // Voice Mode specific states
  const [voiceActive, setVoiceActive] = useState(false);
  const [dbLevel, setDbLevel] = useState(0);
  const [micDenied, setMicDenied] = useState(false);
  const micWaveCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Floating text animation states
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const floatingIdCounter = useRef(0);

  // References for cleanup
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastVoiceCountTime = useRef<number>(0);
  const guidedTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wakeLockRef = useRef<any>(null);

  // Responsiveness State
  const [isMobile, setIsMobile] = useState(false);

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
    if ("wakeLock" in navigator) {
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

  // ─── INCREMENT ACTION ───────────────────────────────────────────
  const incrementCount = useCallback(() => {
    if (isCompleted) return;
    
    setCount((prev) => {
      const next = prev + 1;
      
      // Play bell
      playBellSound(soundEnabled);
      
      // Vibrate
      if (vibrationEnabled && "vibrate" in navigator) {
        try {
          navigator.vibrate(50);
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
      setFloatingTexts((prevList) => [...prevList, newFloat]);
      setTimeout(() => {
        setFloatingTexts((prevList) => prevList.filter((f) => f.id !== newFloat.id));
      }, 1500);
      
      if (next >= targetCount) {
        setTimeout(() => {
          handleCompletion();
        }, 400);
      }
      return next;
    });
  }, [targetCount, isCompleted, soundEnabled, vibrationEnabled, activeMantra, isHi, handleCompletion]);

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

  // ─── VOICE COUNTING (AUDIO ANALYZER) ───────────────────────────
  const startMicListening = async () => {
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
        if (!analyserRef.current || !voiceActive) return;
        
        analyser.getByteFrequencyData(dataArray);
        let total = 0;
        for (let i = 0; i < bufferLength; i++) {
          total += dataArray[i];
        }
        const average = total / bufferLength;
        setDbLevel(Math.min(100, Math.round((average / 140) * 100)));

        const volumeThreshold = 35; // sensitivity threshold
        const now = Date.now();
        if (average > volumeThreshold && now - lastVoiceCountTime.current > 2000) {
          lastVoiceCountTime.current = now;
          incrementCount();
        }

        const canvas = micWaveCanvasRef.current;
        if (canvas) {
          const canvasCtx = canvas.getContext("2d");
          if (canvasCtx) {
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
            canvasCtx.lineWidth = 2.5;
            canvasCtx.strokeStyle = "rgba(245, 158, 11, 0.75)";
            canvasCtx.beginPath();

            const sliceWidth = canvas.width / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
              const v = dataArray[i] / 128.0;
              const y = (v * canvas.height) / 2;

              if (i === 0) {
                canvasCtx.moveTo(x, y);
              } else {
                canvasCtx.lineTo(x, y);
              }
              x += sliceWidth;
            }
            canvasCtx.lineTo(canvas.width, canvas.height / 2);
            canvasCtx.stroke();
          }
        }

        animationFrameRef.current = requestAnimationFrame(processAudio);
      };

      processAudio();
    } catch (err) {
      console.warn("Microphone access denied:", err);
      setMicDenied(true);
      setVoiceActive(false);
    }
  };

  const stopMicListening = () => {
    setVoiceActive(false);
    setDbLevel(0);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  useEffect(() => {
    if (practiceMode === "voice" && voiceActive) {
      startMicListening();
    } else {
      stopMicListening();
    }
    return () => stopMicListening();
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
  const R = isMobile ? 135 : 195;
  const regularBeadSize = isMobile ? 22 : 32;
  const sumeruBeadSize = isMobile ? 32 : 44;

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
  const displayTodayMalas = useMemo(() => ((stats?.totalMalas || 0) * 4) + Math.floor(count / numBeads), [stats?.totalMalas, count, numBeads]);

  // Helper formatting for timer mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Reset functionality
  const handleResetClick = () => {
    if (window.confirm(isHi ? "क्या आप सच में जाप को पुनः आरंभ करना चाहते हैं?" : "Are you sure you want to reset the count?")) {
      setCount(0);
      setSecondsElapsed(0);
      setFloatingTexts([]);
    }
  };

  // Dropdown changes active mantra
  const handleMantraChange = (mantraId: string) => {
    const newMantra = (mantras || []).find((m) => m.id === mantraId);
    if (newMantra) {
      setActiveMantra(newMantra);
      setCount(0);
      setSecondsElapsed(0);
      setFloatingTexts([]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleBackgroundTap}
      className="fixed inset-0 z-[100] bg-gradient-to-b from-[#0b0709] via-[#050203] to-[#0a0507] flex flex-col justify-between text-[#fbf6f0] select-none overflow-y-auto cursor-pointer"
    >
      {/* Background radial soft light */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.07),transparent_70%)] pointer-events-none" />

      {/* ─── HEADER BAR ───────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => onClose(activeMantra.id)}
          className="w-10 h-10 rounded-full border border-amber-500/20 hover:border-amber-500/50 bg-black/40 hover:bg-black/60 flex items-center justify-center text-amber-200/80 hover:text-amber-300 active:scale-95 transition-all"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center flex flex-col items-center">
          <h2 className="font-serif text-[20px] md:text-[23px] font-bold text-amber-400/90 tracking-wide select-none">
            || Digital Mala ||
          </h2>
          <span className="text-sm font-semibold text-amber-500/80 tracking-widest mt-0.5 select-none uppercase font-serif">
            {isHi ? activeMantra.name_hindi : activeMantra.name_english}
          </span>
        </div>

        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="w-10 h-10 rounded-full border border-amber-500/20 hover:border-amber-500/50 bg-black/40 hover:bg-black/60 flex items-center justify-center text-amber-200/80 hover:text-amber-300 active:scale-95 transition-all"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* ─── MAIN CONTENT ─────────────────────────────────────────── */}
      <div className="flex-1 w-full max-w-lg mx-auto flex flex-col justify-center items-center px-4 relative z-10 py-4">
        
        {/* 1. MALA RING CONTAINER */}
        <div 
          className="relative flex items-center justify-center select-none"
          style={{
            width: isMobile ? "330px" : "470px",
            height: isMobile ? "330px" : "470px",
          }}
        >
          {/* Rotating Faint Mandala Background in Ring */}
          <div className="absolute inset-6 opacity-[0.04] text-amber-400 pointer-events-none flex items-center justify-center">
            <svg className="w-full h-full animate-[spin_180s_linear_infinite]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.6">
              <circle cx="50" cy="50" r="45" strokeDasharray="1.5 1.5" />
              <circle cx="50" cy="50" r="37" />
              <circle cx="50" cy="50" r="30" strokeDasharray="2 2" />
              <path d="M50 5 L50 95 M5 50 L95 50 M18 18 L82 82 M18 82 L82 18" strokeWidth="0.25" />
              <path d="M50 8 C53 18, 47 18, 50 8 Z M50 92 C53 82, 47 82, 50 92 Z M8 50 C18 53, 18 47, 8 50 Z M92 50 C82 53, 82 47, 92 50 Z" />
            </svg>
          </div>

          {/* Floating animated mantras rising from the center */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible">
            <AnimatePresence>
              {floatingTexts.map((f) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, scale: 0.75, y: 15, x: f.x }}
                  animate={{ 
                    opacity: [0, 1, 1, 0], 
                    scale: [0.75, 1.15, 1.25, 1], 
                    y: -110, 
                    x: f.x 
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute font-serif text-sm md:text-base text-amber-400 font-bold text-center pointer-events-none whitespace-pre-line max-w-[240px] md:max-w-[320px]"
                  style={{ textShadow: "0 0 12px rgba(245, 158, 11, 0.75)" }}
                >
                  {f.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* 55 Beads layout loop */}
          {beadIndices.map((i) => {
            const isSumeru = i === 0;
            const isCompletedBead = !isSumeru && i <= currentCompletedCount;
            const isActiveBead = !isSumeru && i === activeBeadIndex;

            // Angle coordinates calculation (clockwise starting from Sumeru at -90deg)
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
                  // Sumeru Bead
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-900 border border-amber-300 flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.5)] relative">
                    <span className="text-[9px] md:text-[11px] font-bold text-black font-serif select-none pointer-events-none">ॐ</span>
                    {/* Hanging Silk Tassel */}
                    <div 
                      className="absolute left-1/2 -translate-x-1/2 w-3 h-10 flex flex-col items-center pointer-events-none z-30"
                      style={{ top: `${Math.round(sumeruBeadSize * 0.88)}px` }}
                    >
                      {/* Tassel bead/cap */}
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-sm border border-amber-600 shadow-sm" />
                      {/* Red silk fringe */}
                      <div className="w-1 h-8 bg-gradient-to-b from-red-600 via-orange-600 to-transparent rounded-b-md shadow-sm origin-top animate-pulse" />
                    </div>
                  </div>
                ) : (
                  // Regular Bead (Rudraksha / Tulsi / Sandalwood)
                  <div
                    className={`w-full h-full rounded-full transition-all duration-300 ${
                      isActiveBead
                        ? "ring-2 ring-yellow-400 ring-offset-1 ring-offset-black scale-135 shadow-[0_0_14px_rgba(253,224,71,0.95)]"
                        : isCompletedBead
                        ? "shadow-[0_0_8px_rgba(245,158,11,0.85)] border border-amber-400/35"
                        : "opacity-45"
                    }`}
                    style={{
                      backgroundImage: malaType === "rudraksha" ? "url('/images/rudraksha.webp')" : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundColor:
                        malaType === "rudraksha"
                          ? undefined
                          : malaType === "tulsi"
                          ? isCompletedBead ? "#f59e0b" : "#4a2e1d"
                          : isCompletedBead ? "#facc15" : "#c19a6b",
                      filter:
                        malaType === "rudraksha"
                          ? isCompletedBead || isActiveBead
                            ? "brightness(1.1) saturate(1.4) contrast(1.1)"
                            : "brightness(0.35) contrast(1.1) sepia(0.25)"
                          : undefined,
                    }}
                  />
                )}
              </div>
            );
          })}

          {/* Center stats info */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
            <span className="font-serif text-[54px] md:text-[66px] font-semibold text-[#f59e0b] leading-none tracking-tight transition-all tabular-nums drop-shadow-[0_0_12px_rgba(245,158,11,0.22)]">
              {count}
            </span>
            <span className="text-sm md:text-base font-semibold text-amber-200/40 tracking-wider">
              /{targetCount}
            </span>
            <div className="mt-2.5 px-3 py-0.5 bg-[#1b0d0a]/60 border border-amber-500/20 rounded-full text-amber-500 text-[10px] md:text-xs font-bold tracking-widest uppercase">
              Round {Math.floor(count / numBeads) + 1}
            </div>
            
            {/* Listening Indicator (in Voice mode) */}
            {practiceMode === "voice" && voiceActive && (
              <div className="absolute bottom-2 flex items-center gap-1 text-[9px] text-green-400 font-bold uppercase tracking-wider animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                Listening
              </div>
            )}
          </div>
        </div>

        {/* Sacred Mantra Text Display */}
        <div className="mt-4 px-6 text-center max-w-sm sm:max-w-md select-none relative z-10 animate-fade-in">
          <p className="font-serif text-lg sm:text-xl md:text-2xl text-amber-300 font-bold leading-normal tracking-wide drop-shadow-[0_2px_8px_rgba(245,158,11,0.25)] whitespace-pre-line">
            {isHi 
              ? activeMantra.full_text_hindi || activeMantra.name_hindi 
              : activeMantra.transliteration || activeMantra.name_english}
          </p>
        </div>

        {/* 2. CHANT INSTRUCTIONS */}
        <div className="flex items-center gap-3.5 mt-5 text-amber-400/80 font-serif text-sm tracking-widest select-none w-full justify-center">
          <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-amber-500/40" />
          <span>
            {practiceMode === "voice" 
              ? (isHi ? "जाप बोलने पर अपने आप गिना जाएगा" : "Speak to chant automatically") 
              : practiceMode === "guided" 
              ? (isHi ? "स्वचालित चल रहा है" : "Auto chanting playing") 
              : (isHi ? "जाप के लिए कहीं भी टैप करें" : "Tap anywhere to count")}
          </span>
          <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-amber-500/40" />
        </div>

        {/* Voice frequency canvas visualization in Voice mode */}
        {practiceMode === "voice" && (
          <div className="mt-4 w-72 h-8 border border-white/5 bg-black/45 rounded-xl overflow-hidden px-2 py-0.5 flex items-center relative z-10 select-none">
            <canvas ref={micWaveCanvasRef} width={280} height={32} className="w-full h-full" />
            {!voiceActive && (
              <div className="absolute inset-0 flex items-center justify-center text-[9px] text-white/25 uppercase tracking-widest font-semibold">
                {isHi ? "माइक निष्क्रिय है" : "Mic Inactive"}
              </div>
            )}
          </div>
        )}

        {/* 3. TODAY STATS GRID CARD */}
        <div className="w-full max-w-sm mt-8 relative z-10 select-none">
          <div className="bg-[#130d0a]/40 backdrop-blur-md border border-amber-500/15 rounded-2xl p-4 flex items-center justify-between w-full shadow-lg divide-x divide-amber-500/10">
            {/* Left Col: Today Chants */}
            <div className="flex items-center gap-3 flex-1 justify-center pr-2">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                <Flame className="w-5 h-5 fill-current" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-amber-200/40 font-bold uppercase tracking-wider">Today</span>
                <span className="text-xl font-bold text-amber-400 font-serif leading-none mt-0.5">{displayTodayChants}</span>
                <span className="text-[9px] text-amber-200/40 font-semibold uppercase tracking-wide">Chants</span>
              </div>
            </div>

            {/* Right Col: Rounds Completed */}
            <div className="flex items-center gap-3 flex-1 justify-center pl-2">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                <RotateCcw className="w-5 h-5 rotate-45" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-amber-200/40 font-bold uppercase tracking-wider">Rounds</span>
                <span className="text-xl font-bold text-amber-400 font-serif leading-none mt-0.5">{displayTodayMalas}</span>
                <span className="text-[9px] text-amber-200/40 font-semibold uppercase tracking-wide">Completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. TIME CLOCK */}
        <div className="mt-4 flex items-center gap-2 text-xs text-white/35 font-bold uppercase tracking-widest select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>{formatTime(secondsElapsed)}</span>
          <span className="text-white/20">|</span>
          <span>{Math.min(100, Math.round((count / targetCount) * 100))}%</span>
        </div>

      </div>

      {/* ─── BOTTOM CONTROL BAR ───────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 pt-5 pb-2 border-t border-white/5 flex items-center justify-center gap-5 bg-black/10 select-none">
        <button
          onClick={handleResetClick}
          disabled={count === 0}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-amber-500/30 bg-black/40 hover:bg-black/60 disabled:opacity-40 disabled:hover:bg-black/40 text-amber-100 font-bold text-sm tracking-wide transition-all active:scale-95 shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{isHi ? "पुनः सेट" : "Reset"}</span>
        </button>

        <button
          onClick={() => setTimerActive(!timerActive)}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-amber-500/30 bg-black/40 hover:bg-black/60 text-amber-100 font-bold text-sm tracking-wide transition-all active:scale-95 shadow-sm"
        >
          {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          <span>{timerActive ? (isHi ? "रोकें" : "Pause") : (isHi ? "शुरू करें" : "Resume")}</span>
        </button>
      </div>

      {/* ─── QUICK SETTINGS BAR (Premium Pill Design) ──────────────── */}
      <div
        className="relative z-10 w-full px-3 py-2 pb-[calc(5.75rem+env(safe-area-inset-bottom))] md:pb-3 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Outer pill container */}
        <div className="max-w-lg mx-auto rounded-[2rem] bg-[#1a0f08]/80 backdrop-blur-2xl border border-[#3a2010]/60 shadow-[0_4px_32px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,160,60,0.07)] overflow-hidden">
          <div className="flex items-stretch divide-x divide-[#3a2010]/50">

            {/* ── 1. MANTRA ──────────────────────────────────────── */}
            <div className="flex-1 flex flex-col items-center justify-center gap-1 px-2 py-3">
              <img src="/icons/music-player.svg" alt="mantra" className="w-6 h-6 opacity-80" style={{ filter: "invert(75%) sepia(80%) saturate(400%) hue-rotate(5deg) brightness(110%)" }} />
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-none">
                {isHi ? "मंत्र" : "Mantra"}
              </span>
              <span className="text-[10px] font-bold text-amber-400 leading-none text-center max-w-[58px] truncate">
                {isHi ? activeMantra.name_hindi : activeMantra.name_english}
              </span>
            </div>

            {/* ── 2. MALA TYPE ───────────────────────────────────── */}
            <button
              className="flex-1 flex flex-col items-center justify-center gap-1 px-2 py-3 active:bg-amber-500/5 transition-colors"
              onClick={() => {
                const types: Array<"rudraksha" | "tulsi" | "sandalwood"> = ["rudraksha", "tulsi", "sandalwood"];
                const nextIdx = (types.indexOf(malaType) + 1) % types.length;
                setMalaType(types[nextIdx]);
              }}
            >
              <img src="/icons/mala.svg" alt="mala" className="w-6 h-6 opacity-80" style={{ filter: "invert(75%) sepia(80%) saturate(400%) hue-rotate(5deg) brightness(110%)" }} />
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-none">
                {isHi ? "माला" : "Mala Type"}
              </span>
              <span className="text-[10px] font-bold text-amber-400 leading-none">
                {malaType === "rudraksha" ? (isHi ? "रुद्राक्ष" : "Rudraksha") : malaType === "tulsi" ? (isHi ? "तुलसी" : "Tulsi") : (isHi ? "चंदन" : "Sandal")}
              </span>
            </button>

            {/* ── 3. SOUND ───────────────────────────────────────── */}
            <button
              className="flex-1 flex flex-col items-center justify-center gap-1 px-2 py-3 active:bg-amber-500/5 transition-colors"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              <img src="/icons/sound.svg" alt="sound" className="w-6 h-6" style={{ filter: soundEnabled ? "invert(75%) sepia(80%) saturate(400%) hue-rotate(5deg) brightness(110%)" : "invert(40%) sepia(0%) brightness(60%)" }} />
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-none">
                {isHi ? "ध्वनि" : "Sound"}
              </span>
              <span className={`text-[10px] font-black leading-none tracking-wider ${soundEnabled ? "text-[#4ade80]" : "text-white/30"}`}>
                {soundEnabled ? "On" : "Off"}
              </span>
            </button>

            {/* ── 4. VIBRATION ───────────────────────────────────── */}
            <button
              className="flex-1 flex flex-col items-center justify-center gap-1 px-2 py-3 active:bg-amber-500/5 transition-colors"
              onClick={() => setVibrationEnabled(!vibrationEnabled)}
            >
              <img src="/icons/vibrator.svg" alt="vibration" className="w-6 h-6" style={{ filter: vibrationEnabled ? "invert(75%) sepia(80%) saturate(400%) hue-rotate(5deg) brightness(110%)" : "invert(40%) sepia(0%) brightness(60%)" }} />
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-none">
                {isHi ? "कंपन" : "Vibration"}
              </span>
              <span className={`text-[10px] font-black leading-none tracking-wider ${vibrationEnabled ? "text-[#4ade80]" : "text-white/30"}`}>
                {vibrationEnabled ? "On" : "Off"}
              </span>
            </button>

            {/* ── 5. AUTO-LOCK ───────────────────────────────────── */}
            <button
              className="flex-1 flex flex-col items-center justify-center gap-1 px-2 py-3 active:bg-amber-500/5 transition-colors"
              onClick={() => setAutoLockDisabled(!autoLockDisabled)}
            >
              <img src="/icons/lock.svg" alt="auto-lock" className="w-6 h-6" style={{ filter: autoLockDisabled ? "invert(75%) sepia(80%) saturate(400%) hue-rotate(5deg) brightness(110%)" : "invert(40%) sepia(0%) brightness(60%)" }} />
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-none">
                {isHi ? "स्क्रीन" : "Auto-Lock"}
              </span>
              <span className={`text-[10px] font-black leading-none tracking-wider ${autoLockDisabled ? "text-[#4ade80]" : "text-[#f87171]"}`}>
                {autoLockDisabled ? "On" : "Off"}
              </span>
            </button>

          </div>
        </div>
      </div>

      {/* ─── FIXED BOTTOM NAV BAR ─────────────────────────────────── */}
      <MobileBottomNav />

      {/* ─── SETTINGS DRAWER BOTTOM SHEET ────────────────────────── */}
      <AnimatePresence>
        {settingsOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSettingsOpen(false)}
              className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs select-none"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 22, stiffness: 160 }}
              className="fixed bottom-0 inset-x-0 z-[90] bg-gradient-to-b from-[#130d0a] to-[#0a0507] border-t border-amber-500/20 rounded-t-[2.5rem] px-6 pb-8 pt-4 shadow-2xl max-w-md mx-auto settings-panel select-none"
            >
              {/* Handle Bar */}
              <div 
                onClick={() => setSettingsOpen(false)}
                className="w-12 h-1.5 bg-amber-500/20 rounded-full mx-auto mb-6 cursor-pointer hover:bg-amber-500/40 transition-colors" 
              />
              
              <div className="space-y-4">
                {/* Mantra Dropdown */}
                <div className="flex items-center justify-between py-2 border-b border-amber-500/5">
                  <div className="flex items-center gap-3">
                    <Flower2 className="w-5 h-5 text-amber-500/70" />
                    <span className="text-sm font-semibold text-amber-100/80">{isHi ? "मंत्र" : "Mantra"}</span>
                  </div>
                  <div className="relative">
                    <select
                      value={activeMantra.id}
                      onChange={(e) => handleMantraChange(e.target.value)}
                      className="bg-black/40 border border-amber-500/20 text-amber-300 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-amber-500/50 appearance-none pr-8 cursor-pointer"
                    >
                      {(mantras || []).map((m) => (
                        <option key={m.id} value={m.id} className="bg-[#130d0a] text-amber-100">
                          {isHi ? m.name_hindi : m.name_english}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-amber-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Mala Type Dropdown */}
                <div className="flex items-center justify-between py-2 border-b border-amber-500/5">
                  <div className="flex items-center gap-3">
                    <span className="text-base text-amber-500/70">📿</span>
                    <span className="text-sm font-semibold text-amber-100/80">{isHi ? "माला का प्रकार" : "Mala Type"}</span>
                  </div>
                  <div className="relative">
                    <select
                      value={malaType}
                      onChange={(e) => setMalaType(e.target.value as any)}
                      className="bg-black/40 border border-amber-500/20 text-amber-300 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-amber-500/50 appearance-none pr-8 cursor-pointer"
                    >
                      <option value="rudraksha" className="bg-[#130d0a] text-amber-100">{isHi ? "रुद्राक्ष" : "Rudraksha"}</option>
                      <option value="tulsi" className="bg-[#130d0a] text-amber-100">{isHi ? "तुलसी" : "Tulsi"}</option>
                      <option value="sandalwood" className="bg-[#130d0a] text-amber-100">{isHi ? "चंदन" : "Sandalwood"}</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-amber-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Sound Toggle */}
                <div className="flex items-center justify-between py-2 border-b border-amber-500/5">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-amber-500/70" />
                    <span className="text-sm font-semibold text-amber-100/80">{isHi ? "ध्वनि (Sound)" : "Sound"}</span>
                  </div>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 focus:outline-none ${
                      soundEnabled ? "bg-amber-500" : "bg-white/10"
                    }`}
                  >
                    <motion.div 
                      layout 
                      className="w-5 h-5 rounded-full bg-black shadow" 
                      animate={{ x: soundEnabled ? 20 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>

                {/* Vibration Toggle */}
                <div className="flex items-center justify-between py-2 border-b border-amber-500/5">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-amber-500/70" />
                    <span className="text-sm font-semibold text-amber-100/80">{isHi ? "कंपन (Vibration)" : "Vibration"}</span>
                  </div>
                  <button
                    onClick={() => setVibrationEnabled(!vibrationEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 focus:outline-none ${
                      vibrationEnabled ? "bg-amber-500" : "bg-white/10"
                    }`}
                  >
                    <motion.div 
                      layout 
                      className="w-5 h-5 rounded-full bg-black shadow" 
                      animate={{ x: vibrationEnabled ? 20 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>

                {/* Screen Awake Toggle */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-amber-500/70" />
                    <span className="text-sm font-semibold text-amber-100/80">{isHi ? "जाप के दौरान स्क्रीन चालू रखें" : "Auto-lock screen"}</span>
                  </div>
                  <button
                    onClick={() => setAutoLockDisabled(!autoLockDisabled)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 focus:outline-none ${
                      autoLockDisabled ? "bg-amber-500" : "bg-white/10"
                    }`}
                  >
                    <motion.div 
                      layout 
                      className="w-5 h-5 rounded-full bg-black shadow" 
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

      {/* ─── CELEBRATION COMPLETED SCREEN OVERLAY ─────────────────── */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[110] bg-black/95 flex flex-col items-center justify-center p-4 text-center select-none"
          >
            {/* Sparkles / Aura glow backdrop */}
            <div className="absolute top-1/4 w-[320px] h-[320px] bg-amber-500/10 blur-[80px] rounded-full animate-pulse pointer-events-none" />

            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="w-full max-w-md bg-gradient-to-b from-[#180a0f] to-[#0a0406] border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl relative"
            >
              {/* Gold border strip */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

              {/* Complete Stamp Lotus Icon */}
              <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/35 flex items-center justify-center text-amber-400 mx-auto mb-6 shadow-[0_0_20px_rgba(245,158,11,0.15)] animate-[bounce_2s_infinite]">
                <Sparkles className="w-10 h-10" />
              </div>

              <h1 className="font-display font-black text-2xl md:text-3xl text-amber-400 uppercase tracking-widest mb-2">
                {isHi ? "साधना पूर्ण" : "Sadhana Complete"}
              </h1>
              
              <p className="text-base font-display font-bold text-amber-300 mb-6">
                Hari Om / हरी ॐ
              </p>

              {/* Stats Card */}
              <div className="grid grid-cols-2 gap-3 mb-8 text-left">
                <div className="bg-black/35 border border-white/5 rounded-2xl p-4">
                  <span className="block text-[10px] text-white/40 font-bold uppercase tracking-wider mb-1">
                    {isHi ? "जपे गए मंत्र" : "Total Chants"}
                  </span>
                  <span className="font-display font-black text-xl text-amber-400">
                    {count}
                  </span>
                </div>
                <div className="bg-black/35 border border-white/5 rounded-2xl p-4">
                  <span className="block text-[10px] text-white/40 font-bold uppercase tracking-wider mb-1">
                    {isHi ? "लगा समय" : "Duration"}
                  </span>
                  <span className="font-display font-black text-xl text-amber-400">
                    {formatTime(secondsElapsed)}
                  </span>
                </div>
                
                <div className="bg-black/35 border border-white/5 rounded-2xl p-4 col-span-2">
                  <span className="block text-[10px] text-white/40 font-bold uppercase tracking-wider mb-1">
                    {isHi ? "आपका संकल्प" : "Sankalp Fulfilled"}
                  </span>
                  <span className="text-sm font-semibold text-brand-cream/80 truncate block">
                    {sankalpText || (isHi ? "कोई नहीं" : "None")}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#fbf6f0]/60 leading-relaxed mb-6 font-medium italic">
                {isHi
                  ? "“परम चेतना आपके संकल्प को सिद्धि प्रदान करें और आपके जीवन में सुख-शांति का संचार हो।”"
                  : "“May your intention find fulfillment and may the divine vibrations bring peace and clarity to your life.”"}
              </p>

              {/* Save and exit button */}
              <button
                onClick={() => onComplete(count, secondsElapsed, activeMantra.id)}
                className="w-full bg-gradient-to-r from-amber-400 to-orange-600 hover:from-amber-500 hover:to-orange-700 text-black font-black py-4 px-6 rounded-2xl shadow-[0_8px_24px_rgba(249,115,22,0.3)] border border-amber-300/25 transition-all text-sm uppercase tracking-widest active:scale-98"
              >
                {isHi ? "साधना सुरक्षित करें" : "Save Practice Session"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
