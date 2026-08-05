import React from "react";
import { cn } from "@/lib/utils";
import type { DiarySubTab } from "../types";
import { DIARY_TEXTS } from "../constants/diaryConstants";

export interface DiarySubTabsProps {
  isDark: boolean;
  isHi: boolean;
  savedSubTab: DiarySubTab;
  setSavedSubTab: (tab: DiarySubTab) => void;
  savedCount: number;
  likedCount: number;
}

export const DiarySubTabs: React.FC<DiarySubTabsProps> = React.memo(({
  isDark,
  isHi,
  savedSubTab,
  setSavedSubTab,
  savedCount,
  likedCount,
}) => {
  return (
    <div
      className={cn(
        "flex rounded-full p-1 max-w-xs w-full select-none font-sans text-xs mb-2 border shadow-sm",
        isDark ? "bg-[#120704]/80 border-amber-950/40" : "bg-[#FFFDF8] border-[#EAD7C3]"
      )}
    >
      <button
        onClick={() => setSavedSubTab("posters")}
        className={cn(
          "flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-full transition-all duration-200 cursor-pointer focus:outline-none font-black uppercase text-[10px]",
          savedSubTab === "posters"
            ? isDark
              ? "bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md"
              : "bg-gradient-to-r from-[#651317] to-[#8B1E24] text-white shadow-md"
            : isDark
            ? "bg-transparent text-amber-200/80 hover:text-amber-200"
            : "bg-transparent text-[#543D2B] hover:text-[#651317]"
        )}
      >
        <span>{isHi ? DIARY_TEXTS.tabSavedHi : DIARY_TEXTS.tabSavedEn}</span>
        <span className="text-[10px] opacity-75">({savedCount})</span>
      </button>
      <button
        onClick={() => setSavedSubTab("liked")}
        className={cn(
          "flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-full transition-all duration-200 cursor-pointer focus:outline-none font-black uppercase text-[10px]",
          savedSubTab === "liked"
            ? isDark
              ? "bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md"
              : "bg-gradient-to-r from-[#651317] to-[#8B1E24] text-white shadow-md"
            : isDark
            ? "bg-transparent text-amber-200/80 hover:text-amber-200"
            : "bg-transparent text-[#543D2B] hover:text-[#651317]"
        )}
      >
        <span>{isHi ? DIARY_TEXTS.tabLikedHi : DIARY_TEXTS.tabLikedEn}</span>
        <span className="text-[10px] opacity-75">({likedCount})</span>
      </button>
    </div>
  );
});

DiarySubTabs.displayName = "DiarySubTabs";
