import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { deities } from "@/data/bhajans";
import { completeJapaSession, loadDevotionProgress } from "@/lib/devotion/devotionStorage";
import { cn } from "@/lib/utils";

const JAPA_MILESTONES = [27, 54, 81, 108] as const;

type JapaCounterProps = {
  mantraLabel?: string;
  deitySlug?: string;
  reducedMotion?: boolean;
  onClose: () => void;
  onComplete?: () => void;
};

export default function JapaCounter({
  mantraLabel = "Om Namah Shivaya",
  deitySlug,
  reducedMotion,
  onClose,
  onComplete,
}: JapaCounterProps) {
  const deity = deities.find((d) => d.slug === deitySlug) ?? deities.find((d) => d.slug === "shiva") ?? deities[0];
  const [sankalp, setSankalp] = useState("");
  const [started, setStarted] = useState(false);
  const [count, setCount] = useState(0);
  const [progress, setProgress] = useState(loadDevotionProgress());

  const startJapa = useCallback(() => {
    setStarted(true);
    setCount(0);
  }, []);

  const tap = useCallback(() => {
    if (count >= 108) return;
    const next = count + 1;
    setCount(next);
    if (next >= 108) {
      const p = completeJapaSession({
        mantra: mantraLabel.slice(0, 120),
        sankalp: sankalp.trim() || "\u0936\u093e\u0902\u0924\u093f \u0914\u0930 \u092d\u0915\u094d\u0924\u093f",
        targetCount: 108,
        completedAt: new Date().toISOString(),
      });
      setProgress(p);
      onComplete?.();
    }
  }, [count, mantraLabel, onComplete, sankalp]);

  const pct = Math.round((count / 108) * 100);
  const milestone = JAPA_MILESTONES.find((m) => m === count);

  return (
    <motion.div
      role="dialog"
      aria-label="Japa counter"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: reducedMotion ? 0 : 0.25 }}
      className="pointer-events-auto fixed inset-0 z-[95] flex items-end justify-center bg-black/55 p-4 sm:items-center"
    >
      <div className="w-full max-w-sm rounded-3xl border border-amber-400/30 bg-gradient-to-b from-[#fffdf6] to-[#fff8ee] p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-xl text-[#571c1c]">108 Japa</h3>
            <p className="text-xs text-[#6b4423]/80">{mantraLabel}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-black/5" aria-label="Close">
            <X className="h-4 w-4 text-[#571c1c]" />
          </button>
        </div>

        {deity.imageUrl ? (
          <img
            src={deity.imageUrl}
            alt=""
            className="mx-auto mt-4 h-20 w-20 rounded-2xl object-cover ring-2 ring-amber-300/50"
            loading="lazy"
            decoding="async"
          />
        ) : null}

        {!started ? (
          <div className="mt-4 space-y-3">
            <label className="block text-xs font-medium text-[#6b4423]">Sankalp (optional)</label>
            <input
              value={sankalp}
              onChange={(e) => setSankalp(e.target.value)}
              placeholder="Shanti, swasthya..."
              className="w-full rounded-xl border border-amber-200/80 bg-white px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={startJapa}
              className="w-full rounded-full bg-gradient-to-r from-amber-600 to-orange-600 py-3 text-sm font-semibold text-white"
            >
              Start 108
            </button>
          </div>
        ) : (
          <>
            <div className="mt-5 text-center">
              <p className="text-5xl font-bold tabular-nums text-[#7c2d12]">
                {count}
                <span className="text-2xl text-[#92400e]/60">/108</span>
              </p>
              {milestone ? (
                <p className="mt-1 text-sm font-medium text-amber-700">{milestone} — keep going</p>
              ) : null}
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-amber-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-[width] duration-200"
                style={{ width: `${pct}%` }}
              />
            </div>
            <button
              type="button"
              onClick={tap}
              disabled={count >= 108}
              className={cn(
                "mt-5 w-full rounded-full py-4 text-base font-semibold transition active:scale-[0.98]",
                count >= 108 ? "bg-green-600 text-white" : "bg-[#571c1c] text-amber-50",
              )}
            >
              {count >= 108 ? "Hari Om — Complete" : "Tap for each chant"}
            </button>
            {progress.currentStreak > 0 ? (
              <p className="mt-3 text-center text-xs text-[#92400e]/70">
                Streak: {progress.currentStreak} day{progress.currentStreak > 1 ? "s" : ""}
              </p>
            ) : null}
          </>
        )}
      </div>
    </motion.div>
  );
}
