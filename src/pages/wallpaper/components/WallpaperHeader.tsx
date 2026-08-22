import React from "react";
import { ArrowLeft, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import meditationSvg from "@/pages/images/meditation svg.svg";
import { WALLPAPER_STRINGS } from "../constants/strings";

export interface WallpaperHeaderProps {
  isDark: boolean;
  isHi: boolean;
  isSearchOpen: boolean;
  onToggleSearch: () => void;
  onNavigateBack: () => void;
  onNavigateToPricing?: () => void;
}

export const WallpaperHeader: React.FC<WallpaperHeaderProps> = React.memo(({
  isDark,
  isHi,
  isSearchOpen,
  onToggleSearch,
  onNavigateBack,
}) => {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 backdrop-blur-md px-4 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-3 sm:py-4 flex items-center justify-between w-full select-none border-b",
        isDark ? "bg-[#0d0502]/95 border-amber-950/10" : "bg-[#FAF8F4]/95 border-[#EFE5DA]/60"
      )}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onNavigateBack}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full active:scale-95 transition-all border cursor-pointer shrink-0",
            isDark
              ? "bg-black/30 border-amber-900/20 text-amber-400 hover:bg-amber-950/30"
              : "bg-[#FFFFFF] border-[#EFE5DA] text-[#651317] hover:bg-[#FAF8F4]"
          )}
        >
          <ArrowLeft className={cn("w-5 h-5", isDark ? "text-amber-400" : "text-[#651317]")} />
        </button>
        <div className="flex items-center gap-3 min-w-0">
          <img src={meditationSvg} alt="Meditation" className="w-8 h-8 sm:w-10 sm:h-10 object-contain shrink-0" />
          <div className="text-left min-w-0 flex flex-col justify-center py-0.5">
            <h1 className={cn("font-serif text-base sm:text-xl font-black leading-snug truncate pt-0.5", isDark ? "text-amber-100" : "text-[#2B1F18]")}>
              {isHi ? WALLPAPER_STRINGS.headerTitleHi : WALLPAPER_STRINGS.headerTitleEn}
            </h1>
            <span className={cn("font-sans text-[10px] sm:text-xs block mt-0.5 font-semibold leading-normal truncate", isDark ? "text-amber-200" : "text-[#8A7A6B]")}>
              {isHi ? WALLPAPER_STRINGS.headerSubtitleHi : WALLPAPER_STRINGS.headerSubtitleEn}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center">
        <button
          onClick={onToggleSearch}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full active:scale-95 transition-all border cursor-pointer",
            isDark
              ? "bg-black/30 border-amber-900/20 text-amber-400 hover:bg-amber-950/30"
              : "bg-[#FFFFFF] border-[#EFE5DA] text-[#651317] hover:bg-[#FAF8F4]"
          )}
        >
          <Search className={cn("w-5 h-5", isDark ? "text-amber-400" : "text-[#651317]")} />
        </button>
      </div>
    </header>
  );
});

WallpaperHeader.displayName = "WallpaperHeader";
