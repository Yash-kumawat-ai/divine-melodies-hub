import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { BreathPatternId } from "@/lib/meditation/meditationTypes";
import { BREATH_PATTERNS } from "@/lib/meditation/meditationTypes";
import { cn } from "@/lib/utils";

type BreathCoachProps = {
  patternId: BreathPatternId;
  active: boolean;
  reducedMotion?: boolean;
};

type Phase = "inhale" | "hold" | "exhale" | "holdAfter";

export default function BreathCoach({ patternId, active, reducedMotion }: BreathCoachProps) {
  const pattern = BREATH_PATTERNS[patternId];
  const [phase, setPhase] = useState<Phase>("inhale");
  const [secondsLeft, setSecondsLeft] = useState(pattern.inhale);

  useEffect(() => {
    if (!active) {
      setPhase("inhale");
      setSecondsLeft(pattern.inhale);
      return;
    }

    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 1) return s - 1;
        setPhase((p) => {
          if (p === "inhale") {
            if (pattern.hold) {
              setSecondsLeft(pattern.hold);
              return "hold";
            }
            setSecondsLeft(pattern.exhale);
            return "exhale";
          }
          if (p === "hold") {
            setSecondsLeft(pattern.exhale);
            return "exhale";
          }
          if (p === "exhale") {
            if (pattern.holdAfter) {
              setSecondsLeft(pattern.holdAfter);
              return "holdAfter";
            }
            setSecondsLeft(pattern.inhale);
            return "inhale";
          }
          setSecondsLeft(pattern.inhale);
          return "inhale";
        });
        return s;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [active, pattern]);

  const scale =
    phase === "inhale" ? 1.15 : phase === "exhale" ? 0.85 : 1;

  const label =
    phase === "inhale"
      ? "Inhale"
      : phase === "hold" || phase === "holdAfter"
        ? "Hold"
        : "Exhale";

  return (
    <div className="flex flex-col items-center justify-center gap-4" role="img" aria-label={`Breath coach: ${label}`}>
      <motion.div
        animate={reducedMotion ? {} : { scale }}
        transition={{ duration: reducedMotion ? 0 : secondsLeft, ease: "easeInOut" }}
        className={cn(
          "flex h-48 w-48 items-center justify-center rounded-full border-2 border-amber-400/40",
          "bg-[radial-gradient(circle,rgba(255,200,100,0.25),transparent_70%)]",
        )}
      >
        <div className="text-center">
          <p className="text-sm uppercase tracking-widest text-amber-200/80">{label}</p>
          <p className="font-mono text-4xl text-amber-50">{secondsLeft}</p>
        </div>
      </motion.div>
      <p className="text-xs text-amber-200/60">{pattern.label}</p>
    </div>
  );
}
