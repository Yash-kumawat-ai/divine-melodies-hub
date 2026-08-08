import React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { WALLPAPER_SECTIONS } from "@/pages/Blessings/constants";
import type { DevotionalWallpaper } from "@/pages/Blessings/types";
import { DeityFilterStrip } from "./DeityFilterStrip";
import { DevotionalCard } from "./DevotionalCard";
import { WALLPAPER_STRINGS } from "../constants/strings";

export interface StaticWallpaperSectionProps {
  isDark: boolean;
  isHi: boolean;
  selectedDeityFilter: string | null;
  filteredWallpapers: DevotionalWallpaper[];
  likedWallpaperIds: string[];
  onSelectDeity: (deityId: string | null) => void;
  onToggleLikeWallpaper: (wpId: string) => void;
  onWallpaperAction: (wp: DevotionalWallpaper) => void;
  onDownloadWallpaper: (wp: DevotionalWallpaper) => void;
  onNavigateToPricing: () => void;
}

export const StaticWallpaperSection: React.FC<StaticWallpaperSectionProps> = React.memo(({
  isDark,
  isHi,
  selectedDeityFilter,
  filteredWallpapers,
  likedWallpaperIds,
  onSelectDeity,
  onToggleLikeWallpaper,
  onWallpaperAction,
  onDownloadWallpaper,
  onNavigateToPricing,
}) => {
  return (
    <div className="w-full flex flex-col items-center space-y-6 animate-fade-in">
      {/* Deity chips */}
      <DeityFilterStrip
        isDark={isDark}
        isHi={isHi}
        selectedDeityFilter={selectedDeityFilter}
        onSelectDeity={onSelectDeity}
      />

      {/* Wallpaper Sections */}
      <div className="w-full flex flex-col space-y-8">
        {filteredWallpapers.length === 0 ? (
          <div className="w-full py-16 border border-dashed border-amber-900/20 rounded-2xl flex flex-col items-center justify-center text-stone-500 font-sans text-xs gap-2">
            <span>📭</span>
            <span>{isHi ? WALLPAPER_STRINGS.noWallpapersFoundHi : WALLPAPER_STRINGS.noWallpapersFoundEn}</span>
          </div>
        ) : (
          WALLPAPER_SECTIONS.map((sec) => {
            const sectionItems = filteredWallpapers.filter((wp) => wp.category === sec.key);
            if (sectionItems.length === 0) return null;

            return (
              <div key={sec.key} className="w-full space-y-3.5 text-left mb-4">
                <div className="flex items-center justify-between w-full mb-1 px-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#651317] text-xs">✨</span>
                    <h3 className={cn("font-serif text-sm font-black uppercase", isDark ? "text-amber-400" : "text-[#2B1F18]")}>
                      {isHi ? sec.nameHindi : sec.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => onSelectDeity(null)}
                    className={cn(
                      "font-sans text-[11px] font-bold flex items-center gap-0.5 active:scale-95 transition-all cursor-pointer",
                      isDark ? "text-amber-500 hover:text-amber-400" : "text-[#8A7A6B] hover:text-[#2B1F18]"
                    )}
                  >
                    {isHi ? WALLPAPER_STRINGS.seeAllHi : WALLPAPER_STRINGS.seeAllEn}{" "}
                    <span className="ml-1 text-sm font-black">→</span>
                  </button>
                </div>

                {/* 2-Column Equal Grid on Mobile, 4-5 Columns on Desktop */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4 w-full">
                  {sectionItems.map((wp, idx) => (
                    <DevotionalCard
                      key={wp.id}
                      wp={wp}
                      index={idx}
                      isLive={false}
                      isDark={isDark}
                      likedWallpaperIds={likedWallpaperIds}
                      onToggleLikeWallpaper={onToggleLikeWallpaper}
                      onWallpaperAction={onWallpaperAction}
                      onLiveWallpaperAction={() => {}}
                      onDownloadWallpaper={onDownloadWallpaper}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Premium upsell banner */}
      <div
        className="w-full rounded-[20px] p-5 flex items-center justify-between shadow-md"
        style={{
          background: isDark
            ? "linear-gradient(135deg,rgba(251,191,36,0.08),rgba(217,119,6,0.12))"
            : "#FFFFFF",
          border: isDark ? "1px solid rgba(251,191,36,0.2)" : "1px solid #EFE5DA",
        }}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black shadow-md shrink-0">
            <Sparkles className="w-5 h-5 text-black fill-current animate-pulse" />
          </div>
          <div className="text-left">
            <h4 className={cn("font-serif text-sm font-bold", isDark ? "text-amber-200" : "text-[#2B1F18]")}>
              {isHi ? WALLPAPER_STRINGS.premiumTitleHi : WALLPAPER_STRINGS.premiumTitleEn}
            </h4>
            <p className={cn("text-[10px] font-sans mt-0.5 font-semibold", isDark ? "text-amber-200/85" : "text-[#8A7A6B]")}>
              {WALLPAPER_STRINGS.premiumSubtitle}
            </p>
            <p className={cn("text-[9px] font-sans mt-1", isDark ? "text-amber-200/70" : "text-[#8A7A6B]/70")}>
              {isHi ? WALLPAPER_STRINGS.premiumDetailsHi : WALLPAPER_STRINGS.premiumDetailsEn}
            </p>
          </div>
        </div>
        <button
          onClick={onNavigateToPricing}
          className={`px-4 py-2.5 font-sans text-[10px] font-black uppercase rounded-xl transition-all active:scale-95 flex items-center gap-1 shadow-md shrink-0 cursor-pointer ${
            isHi ? "" : "tracking-widest"
          }`}
          style={{ background: "linear-gradient(135deg,#651317,#651317)", color: "#FFFFFF" }}
        >
          <span>{isHi ? WALLPAPER_STRINGS.exploreHi : WALLPAPER_STRINGS.exploreEn}</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
});

StaticWallpaperSection.displayName = "StaticWallpaperSection";
