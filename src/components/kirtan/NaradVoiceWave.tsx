import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type NaradVoiceWaveProps = {
  active: boolean;
  reducedMotion?: boolean;
  className?: string;
};

/** Siri-style voice level bars (decorative). */
export default function NaradVoiceWave({ active, reducedMotion, className }: NaradVoiceWaveProps) {
  const bars = [0, 1, 2, 3, 4];

  return (
    <div className={cn("flex h-8 items-end justify-center gap-1", className)} aria-hidden>
      {bars.map((i) => (
        <motion.span
          key={i}
          className="w-1 rounded-full bg-gradient-to-t from-amber-500 to-rose-300"
          animate={
            active && !reducedMotion
              ? { height: [8, 22 + i * 4, 10, 18, 8] }
              : { height: 6 }
          }
          transition={
            active && !reducedMotion
              ? { duration: 0.9, repeat: Infinity, delay: i * 0.08, ease: "easeInOut" }
              : { duration: 0.2 }
          }
          style={{ display: "block", minHeight: 4 }}
        />
      ))}
    </div>
  );
}
