import React from "react";
import { BookOpen, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { handleShareSavedPoster } from "../utils/diaryHelpers";
import { DIARY_TEXTS } from "../constants/diaryConstants";

export interface SavedPostersGridProps {
  isDark: boolean;
  isHi: boolean;
  savedBlessings: string[];
  onNavigateToMaker: () => void;
}

export const SavedPostersGrid: React.FC<SavedPostersGridProps> = React.memo(({
  isDark,
  isHi,
  savedBlessings,
  onNavigateToMaker,
}) => {
  if (savedBlessings.length === 0) {
    return (
      <div
        className={cn(
          "w-full border border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center gap-3",
          isDark ? "border-amber-900/30" : "border-[#EAD7C3]"
        )}
      >
        <BookOpen className="w-8 h-8 text-amber-500/30" />
        <p className={cn("text-xs font-sans", isDark ? "text-amber-200/85" : "text-[#8C6D53]")}>
          {isHi ? DIARY_TEXTS.emptySavedHi : DIARY_TEXTS.emptySavedEn}
        </p>
        <button
          onClick={onNavigateToMaker}
          className={cn(
            "px-4 py-2 border font-sans font-black text-[10px] uppercase rounded-lg transition-all active:scale-95 cursor-pointer",
            isHi ? "" : "tracking-widest",
            isDark
              ? "border-amber-500/20 hover:bg-amber-500/10 text-amber-300"
              : "border-[#B27A1C]/30 hover:bg-[#B27A1C]/10 text-[#B27A1C]"
          )}
        >
          {isHi ? DIARY_TEXTS.btnCreatePosterHi : DIARY_TEXTS.btnCreatePosterEn}
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 w-full select-none">
      {savedBlessings.map((url, idx) => (
        <div
          key={idx}
          className={cn(
            "border rounded-2xl p-1.5 relative group overflow-hidden",
            isDark ? "bg-[#1b0d07]/40 border-amber-950/20" : "bg-white/70 border-[#EAD7C3]/60"
          )}
          style={{ boxShadow: "0 6px 20px rgba(0,0,0,0.4)" }}
        >
          <img src={url} alt="saved card" className="w-full h-auto rounded-xl pointer-events-none" />

          {/* Hover controls overlay */}
          <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={() => handleShareSavedPoster(url, idx)}
              className="w-10 h-10 rounded-full bg-amber-500 text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform focus:outline-none cursor-pointer"
            >
              <Share2 className="w-5 h-5 text-black" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
});

SavedPostersGrid.displayName = "SavedPostersGrid";
