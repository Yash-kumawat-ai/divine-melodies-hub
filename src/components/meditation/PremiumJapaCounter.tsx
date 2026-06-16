import React, { useState, useEffect, useRef, useCallback } from "react";
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
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import type { Mantra } from "@/lib/mantraJapa/mantraJapaApi";

// ─── SHANKH & BELL SYNTH SOUND GENERATOR ──────────────────────────
const playBellSound = (volumeEnabled: boolean) => {
  if (!volumeEnabled) return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Create multiple oscillators to simulate a rich metallic bell timbre
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
  onClose: () => void;
  onComplete: (actualCount: number, durationSeconds: number) => void;
};

// ─── RIPPLE INTERFACE ────────────────────────────────────────────
interface Ripple {
  id: number;
  x: number;
  y: number;
}

export default function PremiumJapaCounter({
  mantra,
  sankalpText,
  targetCount,
  practiceMode,
  onClose,
  onComplete,
}: PremiumJapaCounterProps) {
  const { language } = useLanguage();
  const isHi = language === "hi";

  // ─── LOCAL STATE ────────────────────────────────────────────────
  const [count, setCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
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

  // Ripple state (for Tap mode)
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const rippleIdCounter = useRef(0);

  // References for cleanup
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastVoiceCountTime = useRef<number>(0);
  const guidedTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Speech synthesis for guided mode pronunciation
  const speechUttRef = useRef<SpeechSynthesisUtterance | null>(null);

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
    
    // Play celebratory shell horn conch sound!
    playConchSound(soundEnabled);
  }, [soundEnabled]);

  // ─── INCREMENT ACTION ───────────────────────────────────────────
  const incrementCount = useCallback(() => {
    if (isCompleted) return;
    
    setCount((prev) => {
      const next = prev + 1;
      // Play soft bell sound
      playBellSound(soundEnabled);
      
      if (next >= targetCount) {
        // Delay slightly for visual feel before showing overlay
        setTimeout(() => {
          handleCompletion();
        }, 300);
      }
      return next;
    });
  }, [targetCount, isCompleted, soundEnabled, handleCompletion]);

  // ─── TAP COUNTER ACTION ─────────────────────────────────────────
  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isCompleted) return;
    
    // Create ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple: Ripple = {
      id: rippleIdCounter.current++,
      x,
      y,
    };
    
    setRipples((prev) => [...prev, newRipple]);
    incrementCount();
    
    // Cleanup ripple after animation completes
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 800);
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
        
        // Calculate average volume level
        let total = 0;
        for (let i = 0; i < bufferLength; i++) {
          total += dataArray[i];
        }
        const average = total / bufferLength;
        
        // Map average volume (0-255) to a normalized gauge value (0-100)
        setDbLevel(Math.min(100, Math.round((average / 140) * 100)));

        // Speech chant peak trigger detection
        // Trigger condition: volume above threshold and cooldown met
        const volumeThreshold = 35; // sensitivity threshold
        const now = Date.now();
        if (average > volumeThreshold && now - lastVoiceCountTime.current > 2000) {
          lastVoiceCountTime.current = now;
          incrementCount();
        }

        // Draw voice frequency wave on canvas
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
      // Setup Text to speech synthesizer
      const text = isHi ? mantra.name_hindi : mantra.name_english;
      const synth = window.speechSynthesis;
      
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = isHi ? "hi-IN" : "en-US";
      utter.rate = 0.85; // Peaceful rate
      utter.pitch = 0.95; // Deep voice
      speechUttRef.current = utter;

      const triggerGuidedStep = () => {
        if (!guidedPlaying || isCompleted) return;
        
        // Chant speech synthesis (if sound is active)
        if (soundEnabled && synth) {
          synth.cancel();
          synth.speak(utter);
        }
        
        incrementCount();
        
        // Schedule next chant after 3.8 seconds
        guidedTimerRef.current = setTimeout(triggerGuidedStep, 3800);
      };

      // Trigger first chant
      guidedTimerRef.current = setTimeout(triggerGuidedStep, 500);
    } else {
      if (guidedTimerRef.current) clearTimeout(guidedTimerRef.current);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    }

    return () => {
      if (guidedTimerRef.current) clearTimeout(guidedTimerRef.current);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [practiceMode, guidedPlaying, isCompleted, soundEnabled, mantra, isHi, incrementCount]);

  // ─── TRADITIONAL MALA BEADS ROTATION ────────────────────────────
  // We layout 27 beads on a circle. Completing 4 full cycles = 108 chants.
  const numBeads = 27;
  const beadAngles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < numBeads; i++) {
      arr.push((i * 360) / numBeads);
    }
    return arr;
  }, [numBeads]);

  // Calculate current rotation degrees of the bead string wheel
  // Bead moves clockwise, so rotation decreases by step per count
  const malaRotation = -(count * (360 / numBeads));

  // ─── FINISH AND SAVE SESSION ────────────────────────────────────
  const handleSaveAndExit = () => {
    onComplete(count, secondsElapsed);
  };

  // Helper formatting for timer mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#070406]/98 flex flex-col justify-between text-brand-cream/90 select-none overflow-y-auto"
    >
      {/* Background radial soft light */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.06),transparent_65%)] pointer-events-none" />

      {/* ─── HEADER BAR ───────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Active Mode indicator badge */}
          <div className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-[10px] tracking-wider uppercase flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            {practiceMode === "mala" && (isHi ? "पारंपरिक माला" : "Mala Mode")}
            {practiceMode === "tap" && (isHi ? "टैप काउंटर" : "Tap Mode")}
            {practiceMode === "voice" && (isHi ? "ध्वनि काउंटर" : "Voice Mode")}
            {practiceMode === "guided" && (isHi ? "मार्गदर्शित" : "Guided Mode")}
          </div>
        </div>

        {/* Counter Info */}
        <div className="text-center absolute left-1/2 -translate-x-1/2 top-4">
          <h2 className="font-display font-black text-amber-400 text-lg md:text-xl tracking-wide">
            {isHi ? mantra.name_hindi : mantra.name_english}
          </h2>
          <p className="text-[10px] text-white/40 font-bold tracking-wider uppercase mt-0.5">
            {isHi ? `संकल्प: ${sankalpText}` : `Sankalp: ${sankalpText}`}
          </p>
        </div>

        {/* Action controls (Sound & Exit) */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-10 h-10 rounded-xl border border-white/5 bg-black/40 hover:bg-black/70 flex items-center justify-center text-amber-500/80 active:scale-95 transition-all"
            title={soundEnabled ? "Mute sound" : "Unmute sound"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl border border-white/5 bg-red-950/20 hover:bg-red-900/40 flex items-center justify-center text-red-400 active:scale-95 transition-all"
            title="Cancel session"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── MAIN CONTENT COUNTING AREA ───────────────────────────── */}
      <div className="flex-1 w-full max-w-lg mx-auto flex flex-col justify-center items-center px-4 relative z-10 py-6">
        
        {/* 1. TRADITIONAL MALA BEADS INTERACTIVE VIEW */}
        {practiceMode === "mala" && (
          <div className="relative w-80 h-80 flex items-center justify-center mb-6">
            
            {/* Spinning Mandala Watermark */}
            <div className="absolute inset-4 opacity-5 text-amber-400 pointer-events-none">
              <svg className="w-full h-full animate-[spin_180s_linear_infinite]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                <path d="M50 5 L50 95 M5 50 L95 50 M18 18 L82 82 M18 82 L82 18" stroke="currentColor" strokeWidth="0.2" />
              </svg>
            </div>

            {/* Glowing active Sumeru pointer arrow at the top (12 o'clock) */}
            <div className="absolute top-1 z-30 flex flex-col items-center">
              <div className="w-0.5 h-3.5 bg-gradient-to-b from-amber-400 to-transparent shadow" />
              <div className="w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-black animate-ping" />
            </div>

            {/* Rotating Mala beads SVG string */}
            <motion.div
              animate={{ rotate: malaRotation }}
              transition={{ type: "spring", stiffness: 100, damping: 18 }}
              className="w-72 h-72 rounded-full relative pointer-events-auto"
            >
              {/* Gold String circle */}
              <div className="absolute inset-4 rounded-full border-[1.5px] border-dashed border-amber-600/30" />

              {/* Individual Beads mapping */}
              {beadAngles.map((angle, index) => {
                // The bead that aligns closest to the top point (angle offset by current count) is active
                const beadPosIndex = (index - count) % numBeads;
                const normalizedPos = beadPosIndex < 0 ? beadPosIndex + numBeads : beadPosIndex;
                const isActive = normalizedPos === 0;

                // Sumeru bead (head bead) decoration
                const isSumeru = index === 0;

                return (
                  <div
                    key={index}
                    style={{
                      transform: `rotate(${angle}deg) translate(0, -120px) rotate(-${angle}deg)`,
                      position: "absolute",
                      left: "calc(50% - 10px)",
                      top: "calc(50% - 10px)",
                    }}
                  >
                    <div
                      className={`rounded-full transition-all duration-300 relative ${
                        isSumeru
                          ? "w-6 h-6 bg-gradient-to-br from-amber-300 via-orange-500 to-amber-900 border-2 border-amber-400 shadow-[0_0_10px_rgba(251,146,60,0.5)] cursor-pointer"
                          : isActive
                          ? "w-5 h-5 bg-gradient-to-br from-amber-400 to-yellow-200 border border-amber-300 scale-125 shadow-[0_0_12px_rgba(245,158,11,0.7)]"
                          : "w-4.5 h-4.5 bg-gradient-to-br from-[#854d0e] via-[#451a03] to-[#1e0700] border border-amber-900/60 hover:border-amber-700/50"
                      }`}
                    >
                      {/* Tassel on Sumeru bead */}
                      {isSumeru && (
                        <div className="absolute top-5 left-1.5 w-2 h-7 bg-red-600/90 rounded-b shadow origin-top scale-y-90 rotate-[-12deg]" />
                      )}
                    </div>
                  </div>
                );
              })}
            </motion.div>

            {/* Center tapping bead trigger */}
            <button
              onClick={incrementCount}
              className="absolute w-36 h-36 rounded-full bg-gradient-to-b from-[#180a0f] to-[#070204] border border-amber-500/20 flex flex-col items-center justify-center shadow-[inset_0_4px_16px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.05)] hover:border-amber-500/40 active:scale-95 transition-all select-none group"
            >
              <span className="font-display text-4xl text-amber-500/90 group-hover:scale-110 transition-transform select-none">ॐ</span>
              <span className="text-[9px] text-amber-400/70 font-bold uppercase tracking-wider mt-2 select-none">
                {isHi ? "टैप करें" : "TAP BEAD"}
              </span>
            </button>
          </div>
        )}

        {/* 2. TAP COUNTER INTERACTIVE RIPPLE VIEW */}
        {practiceMode === "tap" && (
          <div className="relative w-80 h-80 flex items-center justify-center mb-6">
            
            {/* Center concentric glowing rings button */}
            <div
              onClick={handleTap}
              className="relative w-64 h-64 rounded-full bg-gradient-to-b from-[#1c0e13] to-[#0a0406] border border-amber-500/25 flex flex-col items-center justify-center shadow-2xl hover:border-amber-500/50 active:scale-98 transition-all cursor-pointer overflow-hidden group"
            >
              {/* Nested glowing circle rings */}
              <div className="absolute inset-6 rounded-full border border-amber-500/10" />
              <div className="absolute inset-12 rounded-full border border-amber-500/5 animate-[pulse_3s_infinite]" />
              <div className="absolute inset-18 rounded-full bg-amber-500/[0.02]" />

              {/* Render dynamic ripples */}
              {ripples.map((ripple) => (
                <span
                  key={ripple.id}
                  className="absolute rounded-full border-2 border-amber-500/60 bg-amber-500/5 animate-ripple pointer-events-none"
                  style={{
                    left: ripple.x,
                    top: ripple.y,
                    width: 30,
                    height: 30,
                    transform: "translate(-50%, -50%)",
                  }}
                />
              ))}

              <span className="font-display text-7xl text-amber-500/80 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)] select-none pointer-events-none group-hover:scale-105 transition-transform">
                ॐ
              </span>
              <span className="text-[10px] text-amber-400/60 font-black tracking-widest uppercase mt-4 select-none pointer-events-none">
                {isHi ? "जाप के लिए टैप करें" : "TAP TO CHANT"}
              </span>
            </div>
          </div>
        )}

        {/* 3. VOICE COUNTER SOUND ANALYZER VIEW */}
        {practiceMode === "voice" && (
          <div className="relative w-80 h-80 flex flex-col items-center justify-center mb-6">
            
            {/* Pulsing Visual Wave circle */}
            <div className="relative w-56 h-56 rounded-full bg-black/40 border border-white/5 flex flex-col items-center justify-center shadow-xl overflow-hidden mb-6">
              
              {/* Glow backdrop related to microphone level */}
              <div
                className="absolute inset-0 bg-amber-500/10 blur-xl rounded-full transition-all duration-100 ease-out"
                style={{ transform: `scale(${1 + dbLevel / 150})`, opacity: dbLevel / 100 }}
              />

              {/* Mic Icon */}
              <button
                onClick={() => setVoiceActive(!voiceActive)}
                className={`w-20 h-20 rounded-full flex items-center justify-center border transition-all duration-300 z-10 ${
                  voiceActive
                    ? "bg-amber-500/20 border-amber-500/60 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse"
                    : "bg-black/50 border-white/10 text-white/30 hover:text-white/60"
                }`}
              >
                {voiceActive ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
              </button>

              <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider mt-3.5 z-10">
                {voiceActive ? (isHi ? "ध्वनि सुन रहा है..." : "Listening...") : (isHi ? "माइक चालू करें" : "Mic Inactive")}
              </span>

              {/* Sound db bar indicator */}
              <div className="w-24 bg-white/5 border border-white/10 h-2 rounded-full overflow-hidden mt-3 z-10">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-75"
                  style={{ width: `${dbLevel}%` }}
                />
              </div>
            </div>

            {/* Audio canvas visualization wave */}
            <div className="w-72 h-10 border border-white/5 bg-black/35 rounded-xl overflow-hidden px-2 py-1 flex items-center relative">
              <canvas ref={micWaveCanvasRef} width={280} height={40} className="w-full h-full" />
              {!voiceActive && (
                <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white/20 uppercase tracking-widest font-medium">
                  {isHi ? "वेव स्पेक्ट्रम देखने के लिए माइक चालू करें" : "Start Mic to visualize wave"}
                </div>
              )}
            </div>

            {micDenied && (
              <p className="text-red-400 text-xs font-bold text-center mt-3 max-w-xs leading-relaxed flex items-center gap-1.5 justify-center">
                <Info className="w-4 h-4 shrink-0" />
                {isHi ? "माइक की अनुमति अस्वीकृत है! कृपया मैन्युअल काउंटर का उपयोग करें।" : "Mic access denied! Please tap fallback button below."}
              </p>
            )}

            {/* Fallback Manual button for voice mode */}
            <button
              onClick={incrementCount}
              className="mt-4 px-5 py-2.5 rounded-full border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400 font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow"
            >
              <span>{isHi ? "जाप छूट गया? टैप करें" : "Missed a chant? Tap counter"}</span>
            </button>
          </div>
        )}

        {/* 4. GUIDED AUTOPLAYING MODE */}
        {practiceMode === "guided" && (
          <div className="relative w-80 h-80 flex flex-col items-center justify-center mb-6">
            
            {/* Large central progress circle */}
            <div className="relative w-64 h-64 flex items-center justify-center">
              
              {/* SVG circular progress track */}
              <svg className="w-full h-full rotate-[-90deg]">
                <circle cx="128" cy="128" r="100" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                <motion.circle
                  cx="128"
                  cy="128"
                  r="100"
                  fill="none"
                  stroke="url(#guidedProgressGrad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 100}
                  animate={{ strokeDashoffset: (2 * Math.PI * 100) * (1 - count / targetCount) }}
                  transition={{ duration: 0.3 }}
                />
                <defs>
                  <linearGradient id="guidedProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#ea580c" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center Play/Pause button and controls */}
              <div className="absolute inset-8 rounded-full bg-gradient-to-b from-[#160a0e] to-[#070204] border border-amber-500/20 flex flex-col items-center justify-center shadow-[inset_0_4px_16px_rgba(0,0,0,0.8)]">
                <button
                  onClick={() => setGuidedPlaying(!guidedPlaying)}
                  className={`w-20 h-20 rounded-full flex items-center justify-center border transition-all duration-300 ${
                    guidedPlaying
                      ? "bg-amber-500/15 border-amber-500/50 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-pulse"
                      : "bg-black/40 border-white/5 text-amber-500 hover:text-amber-400 hover:bg-black/60"
                  }`}
                >
                  {guidedPlaying ? <Pause className="w-9 h-9 fill-current" /> : <Play className="w-9 h-9 fill-current ml-1" />}
                </button>

                <span className="text-[10px] text-white/40 font-black tracking-widest uppercase mt-3">
                  {guidedPlaying ? (isHi ? "स्वचालित चल रहा है" : "Auto chanting") : (isHi ? "शुरू करें" : "Tap to play")}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-brand-cream/55 text-center mt-4 max-w-xs leading-relaxed">
              {isHi
                ? "यह मोड शांतिपूर्ण गति से आपके लिए मंत्र का जाप करता है और गिनती करता है।"
                : "This mode plays the mantra at a calm pace and automatically increments the count."}
            </p>
          </div>
        )}

        {/* ─── DYNAMIC STATISTICS PANEL ───────────────────────────── */}
        <div className="w-full text-center space-y-2 mt-2">
          
          {/* Main Huge Count Display */}
          <div className="relative">
            <h1 className="font-display font-black text-6xl md:text-7xl tracking-tighter text-amber-400 tabular-nums drop-shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              {count}
              <span className="text-xl md:text-2xl text-white/35 font-normal tracking-wide ml-1">
                /{targetCount}
              </span>
            </h1>
            <p className="text-[10px] text-amber-500/70 font-bold uppercase tracking-widest mt-1.5">
              {isHi ? "कुल जाप संख्या" : "TOTAL CHANTS"}
            </p>
          </div>

          {/* Horizonal Progress Bar */}
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 max-w-md mx-auto">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400"
              animate={{ width: `${Math.min(100, Math.round((count / targetCount) * 100))}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>

          {/* Timer Clock and percentage indicator */}
          <div className="flex items-center justify-between text-xs text-white/40 font-semibold max-w-xs mx-auto pt-1 select-none">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>{formatTime(secondsElapsed)}</span>
            </div>
            <span>{Math.min(100, Math.round((count / targetCount) * 100))}%</span>
          </div>

        </div>

      </div>

      {/* ─── BOTTOM CONTROL BAR ───────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-5 border-t border-white/5 flex items-center justify-center gap-4 bg-black/10">
        
        {/* Reset Counter option */}
        <button
          onClick={() => {
            if (window.confirm(isHi ? "क्या आप सच में जाप को पुनः आरंभ करना चाहते हैं?" : "Are you sure you want to reset the count?")) {
              setCount(0);
              setSecondsElapsed(0);
            }
          }}
          disabled={count === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 bg-black/40 hover:bg-black/70 disabled:opacity-40 disabled:pointer-events-none text-brand-cream/70 hover:text-brand-cream active:scale-95 transition-all text-xs font-bold uppercase tracking-wider"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{isHi ? "पुनः सेट" : "Reset"}</span>
        </button>

        {/* Dynamic State Pause/Play toggle (For Guided/Timer) */}
        <button
          onClick={() => setTimerActive(!timerActive)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 bg-black/40 hover:bg-black/70 text-brand-cream/70 hover:text-brand-cream active:scale-95 transition-all text-xs font-bold uppercase tracking-wider"
        >
          {timerActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{timerActive ? (isHi ? "समय रोकें" : "Pause Timer") : (isHi ? "समय शुरू" : "Resume Timer")}</span>
        </button>
      </div>

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
                <div className="bg-black/35 border border-white/5 rounded-2xl p-4.5">
                  <span className="block text-[10px] text-white/40 font-bold uppercase tracking-wider mb-1">
                    {isHi ? "जपे गए मंत्र" : "Total Chants"}
                  </span>
                  <span className="font-display font-black text-xl text-amber-400">
                    {count}
                  </span>
                </div>
                <div className="bg-black/35 border border-white/5 rounded-2xl p-4.5">
                  <span className="block text-[10px] text-white/40 font-bold uppercase tracking-wider mb-1">
                    {isHi ? "लगा समय" : "Duration"}
                  </span>
                  <span className="font-display font-black text-xl text-amber-400">
                    {formatTime(secondsElapsed)}
                  </span>
                </div>
                
                <div className="bg-black/35 border border-white/5 rounded-2xl p-4.5 col-span-2">
                  <span className="block text-[10px] text-white/40 font-bold uppercase tracking-wider mb-1">
                    {isHi ? "आपका संकल्प" : "Sankalp Fulfilled"}
                  </span>
                  <span className="text-sm font-semibold text-brand-cream/80 truncate block">
                    {sankalpText}
                  </span>
                </div>
              </div>

              <p className="text-xs text-brand-cream/60 leading-relaxed mb-6 font-medium italic">
                {isHi
                  ? "“परम चेतना आपके संकल्प को सिद्धि प्रदान करें और आपके जीवन में सुख-शांति का संचार हो।”"
                  : "“May your intention find fulfillment and may the divine vibrations bring peace and clarity to your life.”"}
              </p>

              {/* Save and exit button */}
              <button
                onClick={handleSaveAndExit}
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
