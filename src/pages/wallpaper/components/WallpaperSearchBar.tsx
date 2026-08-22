import React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { WALLPAPER_STRINGS } from "../constants/strings";

export interface WallpaperSearchBarProps {
  isDark: boolean;
  isHi: boolean;
  searchQuery: string;
  onChangeQuery: (query: string) => void;
}

export const WallpaperSearchBar: React.FC<WallpaperSearchBarProps> = React.memo(({
  isDark,
  isHi,
  searchQuery,
  onChangeQuery,
}) => {
  return (
    <div className="w-full max-w-md mx-auto px-1 mb-6 animate-fade-in">
      <div className="relative">
        <input
          type="text"
          placeholder={isHi ? WALLPAPER_STRINGS.searchPlaceholderHi : WALLPAPER_STRINGS.searchPlaceholderEn}
          value={searchQuery}
          onChange={(e) => onChangeQuery(e.target.value)}
          className={cn(
            "w-full rounded-full py-3 pl-5 pr-11 text-xs focus:outline-none tracking-wide font-sans font-medium border shadow-sm",
            isDark
              ? "bg-[#1f0f08]/90 border-[#651317]/35 focus:border-[#651317] text-amber-100 placeholder:text-amber-200/20"
              : "bg-[#FFFFFF] border-[#651317]/20 focus:border-[#651317]/50 text-[#2B1F18] placeholder-[#8A7A6B]/40"
          )}
        />
        {searchQuery ? (
          <button
            onClick={() => onChangeQuery("")}
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2 focus:outline-none active:scale-95 cursor-pointer",
              isDark ? "text-amber-400 hover:text-amber-200" : "text-[#651317] hover:text-[#2B1F18]"
            )}
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <Search
            className={cn(
              "absolute right-4.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none",
              isDark ? "text-amber-500/30" : "text-[#651317]/35"
            )}
          />
        )}
      </div>
    </div>
  );
});

WallpaperSearchBar.displayName = "WallpaperSearchBar";
