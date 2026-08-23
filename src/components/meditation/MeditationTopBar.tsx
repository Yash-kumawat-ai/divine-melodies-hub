import type { ReactNode } from "react";
import { ArrowLeft, Share2, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

type MeditationTopBarProps = {
  title: string;
  onBack: () => void;
  onShare?: () => void;
  onTrophy?: () => void;
  trailing?: ReactNode;
  className?: string;
};

export default function MeditationTopBar({
  title,
  onBack,
  onShare,
  onTrophy,
  trailing,
  className,
}: MeditationTopBarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 shrink-0 z-40 border-b bg-[#FFFDF8]/95 dark:bg-[#0c0a08]/95 backdrop-blur-md border-[#E8D8C4] dark:border-stone-800 shadow-2xs",
        className
      )}
    >
      <div className="mx-auto max-w-5xl px-4 lg:px-6 py-2.5 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-full border border-[#E8D8C4] dark:border-stone-700 bg-[#FFFDF8] dark:bg-stone-900 text-[#651317] dark:text-amber-300 active:scale-95 transition-all shrink-0 cursor-pointer shadow-xs"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="flex-1 min-w-0 text-center text-base sm:text-lg font-semibold font-display tracking-tight text-[#651317] dark:text-amber-100 truncate px-2">
          {title}
        </h1>
        <div className="flex items-center gap-1.5 shrink-0">
          {trailing}
          {onTrophy && (
            <button
              type="button"
              onClick={onTrophy}
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-full border border-[#E8D8C4] dark:border-stone-700 bg-[#FFFDF8] dark:bg-stone-900 flex items-center justify-center text-[#651317] dark:text-amber-300 active:scale-95 transition-all cursor-pointer shadow-xs"
              aria-label="Leaderboard"
            >
              <Trophy className="w-4 h-4" />
            </button>
          )}
          {onShare && (
            <button
              type="button"
              onClick={onShare}
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-full border border-[#E8D8C4] dark:border-stone-700 bg-[#FFFDF8] dark:bg-stone-900 flex items-center justify-center text-[#651317] dark:text-amber-300 active:scale-95 transition-all cursor-pointer shadow-xs"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
