import React from "react";
import { cn } from "@/lib/utils";
import { DIARY_TEXTS } from "../constants/diaryConstants";

export interface DiaryHeaderProps {
  isDark: boolean;
  isHi: boolean;
}

export const DiaryHeader: React.FC<DiaryHeaderProps> = React.memo(({ isDark, isHi }) => {
  return (
    <div className="text-center">
      <h2 className={cn("font-serif text-base font-bold", isDark ? "text-amber-400" : "text-[#B27A1C]")}>
        {isHi ? DIARY_TEXTS.titleHi : DIARY_TEXTS.titleEn}
      </h2>
      <p className={cn("text-xs font-sans mt-1 font-medium", isDark ? "text-amber-200/85" : "text-[#8C6D53]")}>
        {isHi ? DIARY_TEXTS.subtitleHi : DIARY_TEXTS.subtitleEn}
      </p>
    </div>
  );
});

DiaryHeader.displayName = "DiaryHeader";
