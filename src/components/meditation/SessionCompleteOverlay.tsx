import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { getMeditationCopy } from "@/lib/meditation/meditationLocale";
import { OM } from "@/lib/meditation/unicode";
import type { MeditationStats } from "@/lib/meditation/meditationStorage";

type SessionCompleteOverlayProps = {
  stats: MeditationStats;
  onDone: (payload: { moodAfter?: string; journalText?: string }) => void;
};

export default function SessionCompleteOverlay({ stats, onDone }: SessionCompleteOverlayProps) {
  const { language } = useLanguage();
  const copy = getMeditationCopy(language).complete;
  const [mood, setMood] = useState<string | undefined>();
  const [journal, setJournal] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pointer-events-auto absolute inset-0 z-30 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-labelledby="complete-title"
    >
      <div className="w-full max-w-md rounded-3xl border border-amber-400/25 bg-[#1a0f0a]/95 p-6 text-center shadow-2xl">
        <p className="font-display text-4xl text-amber-100" aria-hidden>
          {OM}
        </p>
        <h2 id="complete-title" className="mt-2 font-display text-xl text-amber-50">
          {copy.title}
        </h2>
        <p className="mt-1 text-sm text-amber-200/70">{copy.shanti}</p>
        <p className="mt-4 text-xs text-amber-200/50">
          {stats.totalMindfulMinutes} {copy.minutesSuffix} - {stats.streakDays} {copy.streakSuffix}
        </p>

        <p className="mt-4 text-[10px] uppercase tracking-widest text-amber-200/40">
          {copy.moodQuestion}
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {copy.moods.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMood(m)}
              className={`rounded-full border px-3 py-1 text-xs ${
                mood === m
                  ? "border-amber-400 bg-amber-500/25 text-amber-50"
                  : "border-white/10 text-white/60"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <label className="mt-4 block text-left text-[10px] uppercase tracking-widest text-amber-200/40">
          {copy.reflection}
        </label>
        <textarea
          value={journal}
          onChange={(e) => setJournal(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-xl border border-amber-200/15 bg-black/40 px-3 py-2 text-sm text-amber-50 placeholder:text-white/30"
          placeholder={copy.reflectionPlaceholder}
        />

        <button
          type="button"
          onClick={() => onDone({ moodAfter: mood, journalText: journal || undefined })}
          className="mt-5 w-full rounded-full bg-gradient-to-r from-amber-600 to-orange-600 py-3 text-sm font-semibold text-amber-50"
        >
          {copy.close}
        </button>
      </div>
    </motion.div>
  );
}
