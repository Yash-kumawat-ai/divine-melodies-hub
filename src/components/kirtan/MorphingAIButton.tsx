import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Mic } from "lucide-react";

export type MorphingButtonState = "idle" | "listening";

interface MorphingAIButtonProps {
  label?: string;
  onStateChange?: (state: MorphingButtonState) => void;
  onClick?: () => void;
  autoLoop?: boolean;
  className?: string;
}

// Bouncy spring transition matching cubic-bezier(0.34, 1.4, 0.4, 1)
const bouncyTransition = {
  type: "spring",
  stiffness: 280,
  damping: 20,
  mass: 0.7,
} as const;

export function MorphingAIButton({
  label = "Ask Narad",
  onStateChange,
  onClick,
  autoLoop = true,
  className = "",
}: MorphingAIButtonProps) {
  const [state, setState] = useState<MorphingButtonState>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateState = (newState: MorphingButtonState) => {
    setState(newState);
    onStateChange?.(newState);
  };

  // Automatic Infinite Loop: idle (2500ms) <-> listening (2000ms)
  useEffect(() => {
    if (!autoLoop) return;

    let isMounted = true;

    const scheduleNext = () => {
      if (state === "idle") {
        timerRef.current = setTimeout(() => {
          if (isMounted) updateState("listening");
        }, 8000);
      } else {
        timerRef.current = setTimeout(() => {
          if (isMounted) updateState("idle");
        }, 2000);
      }
    };

    scheduleNext();

    return () => {
      isMounted = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state, autoLoop]);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const isListening = state === "listening";

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Soft ambient backdrop glow (No hard borders or ghost outlines) */}
      <motion.div
        className="pointer-events-none absolute -z-10 rounded-full blur-xl opacity-50"
        animate={{
          width: isListening ? 64 : 144,
          height: 64,
          background: isListening
            ? "radial-gradient(circle, rgba(168,85,247,0.6), rgba(219,39,119,0.3) 70%, transparent 100%)"
            : "radial-gradient(circle, rgba(59,130,246,0.6), rgba(147,51,234,0.3) 70%, transparent 100%)",
        }}
        transition={bouncyTransition}
      />

      {/* SINGLE SHAPE-SHIFTING CONTAINER */}
      <motion.button
        type="button"
        onClick={handleClick}
        animate={{
          width: isListening ? 56 : 132,
          height: 56,
          borderRadius: 9999,
        }}
        transition={bouncyTransition}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative flex items-center justify-between overflow-hidden border backdrop-blur-md cursor-pointer outline-none select-none ${
          isListening
            ? "border-white/20 bg-gradient-to-r from-blue-600/50 via-purple-600/50 to-pink-600/50 shadow-[0_0_20px_rgba(168,85,247,0.5)]"
            : "border-white/10 bg-gradient-to-r from-blue-600/40 via-purple-600/40 to-blue-600/40 shadow-[0_8px_24px_rgba(30,58,138,0.5),inset_0_1px_1px_rgba(255,255,255,0.08)]"
        }`}
      >
        {/* Shimmer sweep effect (idle state) */}
        {!isListening && (
          <motion.div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
            animate={{ x: ["-120%", "120%"] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }}
          />
        )}

        {/* ── IDLE CONTENT (Mic Icon + Label Text) ── */}
        <motion.div
          animate={{
            opacity: isListening ? 0 : 1,
            scale: isListening ? 0.7 : 1,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`absolute inset-0 flex items-center justify-between px-5 whitespace-nowrap ${
            isListening ? "pointer-events-none" : "pointer-events-auto"
          }`}
        >
          {/* Mic icon with breathing scale & glowing aura */}
          <motion.div
            className="relative flex items-center justify-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.div
              className="absolute -z-10 h-5 w-5 rounded-full bg-blue-400/35 blur-md"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <Mic className="h-5 w-5 text-white/85 drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]" />
          </motion.div>

          {/* Text label with opacity pulse */}
          <motion.span
            className="text-sm font-medium tracking-wide text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            {label}
          </motion.span>
        </motion.div>

        {/* ── LISTENING CONTENT (Pulsing Ripple + 3 Waveform Bars) ── */}
        <motion.div
          animate={{
            opacity: isListening ? 1 : 0,
            scale: isListening ? 1 : 0.7,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`absolute inset-0 flex items-center justify-center gap-1 ${
            isListening ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          {/* Expanding concentric ripple ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-white/30 pointer-events-none"
            animate={{ scale: [1, 1.6, 2.0], opacity: [1, 0.25, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          />

          {/* 3 Staggered Equalizer Waveform Bars */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1 rounded-full bg-gradient-to-t from-blue-300 to-white shadow-[0_0_6px_rgba(255,255,255,0.8)]"
              animate={{ height: ["8px", "20px", "8px"] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      </motion.button>
    </div>
  );
}

export default MorphingAIButton;
