import { useState } from "react";
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
    <div
      className="pointer-events-auto absolute inset-0 z-30 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-labelledby="complete-title"
    >
      <div className="w-full max-w-md rounded-3xl border-2 border-[#E8D8C4] bg-[#FFFDF8] dark:bg-[#1E1710] p-6 text-center shadow-2xl">
        <p className="font-serif text-4xl text-[#7A2D28] dark:text-[#E8B15C]" aria-hidden>
          {OM}
        </p>
        <h2 id="complete-title" className="mt-2 font-serif text-xl font-bold text-[#4A1516] dark:text-[#FFFDF8]">
          {copy.title}
        </h2>
        <p className="mt-1 text-sm text-[#7A6B60] dark:text-[#D4C5B9] font-medium">{copy.shanti}</p>
        <p className="mt-4 text-xs font-bold text-[#5C3026] dark:text-[#E8B15C] bg-[#FAF2E8] dark:bg-[#2A1F14] py-2 px-4 rounded-xl border border-[#E8D8C4] dark:border-zinc-800 inline-block">
          {stats.totalMindfulMinutes} {copy.minutesSuffix} - {stats.streakDays} {copy.streakSuffix}
        </p>

        <p className="mt-4 text-[10px] uppercase tracking-widest font-bold text-[#7A6B60] dark:text-[#D4C5B9]">
          {copy.moodQuestion}
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {copy.moods.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMood(m)}
              className={`rounded-full border px-3.5 py-1 text-xs font-bold transition-colors ${
                mood === m
                  ? "border-[#7A2D28] bg-[#7A2D28] text-white dark:bg-[#E8B15C] dark:text-zinc-950"
                  : "border-[#E8D8C4] bg-white dark:bg-[#2A1F14] text-[#5A1F1A] dark:text-[#FFFDF8]"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <label className="mt-4 block text-left text-[10px] uppercase tracking-widest font-bold text-[#7A6B60] dark:text-[#D4C5B9]">
          {copy.reflection}
        </label>
        <textarea
          value={journal}
          onChange={(e) => setJournal(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-xl border border-[#D8C9B9] dark:border-zinc-700 bg-[#FCF8F2] dark:bg-[#2A1F14] px-3 py-2 text-sm text-[#32251E] dark:text-[#FFFDF8] placeholder:text-[#7A6B60]/60 focus:border-[#7A2D28] focus:outline-none"
          placeholder={copy.reflectionPlaceholder}
        />

        <button
          type="button"
          onClick={() => onDone({ moodAfter: mood, journalText: journal || undefined })}
          className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#7A2D28] to-[#5A1F1A] dark:from-[#D4A44A] dark:to-[#E8B15C] py-3 text-sm font-bold text-white dark:text-zinc-950 shadow-md hover:opacity-95"
        >
          {copy.close}
        </button>
      </div>
    </div>
  );
}
