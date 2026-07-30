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
      {/* Soft ambient backdrop glow — deep navy/blue palette */}
      <motion.div
        className="pointer-events-none absolute -z-10 rounded-full blur-xl opacity-55"
        animate={{
          width: isListening ? 64 : 144,
          height: 64,
          background: isListening
            ? "radial-gradient(circle, rgba(22,54,90,0.85), rgba(144,179,214,0.4) 70%, transparent 100%)"
            : "radial-gradient(circle, rgba(22,54,90,0.8), rgba(78,120,164,0.35) 70%, transparent 100%)",
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
            ? "border-[#90B3D6]/40 bg-gradient-to-r from-[#16365A] via-[#29527A] to-[#4E78A4] shadow-[0_0_24px_rgba(22,54,90,0.7)]"
            : "border-[#4E78A4]/30 bg-gradient-to-r from-[#16365A] via-[#29527A] to-[#90B3D6] shadow-[0_8px_24px_rgba(22,54,90,0.6),inset_0_1px_1px_rgba(255,255,255,0.12)]"
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
          {/* Mic icon with breathing scale & gold glowing aura */}
          <motion.div
            className="relative flex items-center justify-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.div
              className="absolute -z-10 h-5 w-5 rounded-full bg-[#90B3D6]/50 blur-md"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <Mic className="h-5 w-5 text-white drop-shadow-[0_0_8px_rgba(144,179,214,0.9)]" />
          </motion.div>

          {/* Text label with opacity pulse */}
          <motion.span
            className="text-sm font-medium tracking-wide text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
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
          {/* Expanding concentric ripple ring — light blue */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#90B3D6]/60 pointer-events-none"
            animate={{ scale: [1, 1.6, 2.0], opacity: [1, 0.25, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          />

          {/* 3 Staggered Equalizer Waveform Bars — soft blue to white */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1 rounded-full bg-gradient-to-t from-[#4E78A4] to-white shadow-[0_0_6px_rgba(144,179,214,0.9)]"
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
