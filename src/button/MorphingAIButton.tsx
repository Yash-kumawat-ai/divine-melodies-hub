import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Mic, Sparkles } from "lucide-react";
import devotionalTanpura from "@/pages/images/devotional_tanpura.webp";

export type MorphingButtonState = "idle" | "listening" | "result";

interface MorphingAIButtonProps {
  label?: string;
  resultImage?: string;
  currentState?: MorphingButtonState;
  onStateChange?: (state: MorphingButtonState) => void;
  onClick?: () => void;
  autoLoop?: boolean;
  className?: string;
}

const springTransition = {
  type: "spring",
  stiffness: 240,
  damping: 25,
  mass: 0.8,
} as const;

export function MorphingAIButton({
  label = "Ask AI",
  resultImage = devotionalTanpura,
  currentState,
  onStateChange,
  onClick,
  autoLoop = true,
  className = "",
}: MorphingAIButtonProps) {
  const [internalState, setInternalState] = useState<MorphingButtonState>("idle");
  const state = currentState ?? internalState;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTransitioningRef = useRef(false);

  const updateState = (newState: MorphingButtonState) => {
    setInternalState(newState);
    onStateChange?.(newState);
  };

  // Auto-loop timer chain: idle (2500ms) -> listening (2000ms) -> result (3000ms) -> idle...
  useEffect(() => {
    if (!autoLoop || currentState !== undefined) return;

    let isMounted = true;

    const scheduleNext = () => {
      if (state === "idle") {
        timerRef.current = setTimeout(() => {
          if (isMounted) updateState("listening");
        }, 2500);
      } else if (state === "listening") {
        timerRef.current = setTimeout(() => {
          if (isMounted) updateState("result");
        }, 2000);
      } else if (state === "result") {
        timerRef.current = setTimeout(() => {
          if (isMounted) updateState("idle");
        }, 3000);
      }
    };

    scheduleNext();

    return () => {
      isMounted = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state, autoLoop, currentState]);

  const handleClick = () => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 400);

    if (onClick) {
      onClick();
    } else {
      if (state === "idle") updateState("listening");
      else if (state === "listening") updateState("result");
      else if (state === "result") updateState("idle");
    }
  };

  // Width & height dimensions per state for shape-shifting
  const dimensions = {
    idle: { width: 140, height: 56 },
    listening: { width: 56, height: 56 },
    result: { width: 140, height: 140 },
  }[state];

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Ambient background glow that transitions smoothly */}
      <motion.div
        className="pointer-events-none absolute -z-10 rounded-full blur-2xl opacity-60"
        animate={{
          width: state === "result" ? 170 : 130,
          height: state === "result" ? 170 : 130,
          background:
            state === "idle"
              ? "radial-gradient(circle, rgba(59,130,246,0.5) 0%, rgba(147,51,234,0.3) 100%)"
              : state === "listening"
              ? "radial-gradient(circle, rgba(236,72,153,0.6) 0%, rgba(147,51,234,0.4) 100%)"
              : "radial-gradient(circle, rgba(147,51,234,0.6) 0%, rgba(59,130,246,0.4) 100%)",
        }}
        transition={springTransition}
      />

      {/* SINGLE SHAPE-SHIFTING CONTAINER */}
      <motion.button
        type="button"
        onClick={handleClick}
        animate={{
          width: dimensions.width,
          height: dimensions.height,
          borderRadius: 9999,
        }}
        transition={springTransition}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex items-center justify-center overflow-hidden border border-white/20 bg-gradient-to-r from-blue-600/50 via-purple-600/50 to-blue-600/50 shadow-xl backdrop-blur-md cursor-pointer outline-none select-none"
      >
        {/* Continuous rotating gradient border for Result state */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 p-[2px] pointer-events-none"
          animate={{
            opacity: state === "result" ? 1 : 0,
            rotate: 360,
          }}
          transition={{
            opacity: { duration: 0.35 },
            rotate: { duration: 8, repeat: Infinity, ease: "linear" },
          }}
        />

        {/* Continuous Shimmer Sweep */}
        <motion.div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ["100%", "-100%"] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }}
        />

        {/* ── LAYER 1: IDLE CONTENT (Mic + Label) ── */}
        <motion.div
          animate={{
            opacity: state === "idle" ? 1 : 0,
            scale: state === "idle" ? 1 : 0.7,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`absolute inset-0 flex items-center justify-between px-5 whitespace-nowrap ${
            state === "idle" ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <div className="relative flex items-center justify-center">
            <div className="absolute -z-10 h-6 w-6 rounded-full bg-blue-400/40 blur-md" />
            <Mic className="h-5 w-5 text-white/90 drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]" />
          </div>
          <span className="text-sm font-semibold tracking-wide text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
            {label}
          </span>
        </motion.div>

        {/* ── LAYER 2: LISTENING CONTENT (Waveform Bars) ── */}
        <motion.div
          animate={{
            opacity: state === "listening" ? 1 : 0,
            scale: state === "listening" ? 1 : 0.7,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`absolute inset-0 flex items-center justify-center gap-1.5 ${
            state === "listening" ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          {/* Pulsing Ripple */}
          <motion.div
            className="absolute inset-0 rounded-full border border-white/40 pointer-events-none"
            animate={{ scale: [1, 1.4, 1.8], opacity: [0.8, 0.4, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
          />

          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 rounded-full bg-gradient-to-t from-blue-300 to-white shadow-[0_0_6px_rgba(255,255,255,0.8)]"
              animate={{ height: ["8px", "22px", "12px", "8px"] }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>

        {/* ── LAYER 3: RESULT CONTENT (Image / Sparkles) ── */}
        <motion.div
          animate={{
            opacity: state === "result" ? 1 : 0,
            scale: state === "result" ? 1 : 0.7,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`absolute inset-1 flex flex-col items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-1 ${
            state === "result" ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          {resultImage ? (
            <img src={resultImage} alt="Result" className="h-full w-full object-cover rounded-full" />
          ) : (
            <div className="flex flex-col items-center justify-center gap-1 text-center">
              <Sparkles className="h-7 w-7 text-amber-300 animate-pulse drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
              <span className="text-xs font-semibold text-white/80">Result Ready</span>
            </div>
          )}
        </motion.div>
      </motion.button>
    </div>
  );
}

export default MorphingAIButton;
