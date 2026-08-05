import React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { WALLPAPER_SECTIONS, LIVE_WALLPAPERS_LIST } from "@/pages/Blessings/constants";
import type { DevotionalLiveWallpaper } from "@/pages/Blessings/types";
import { DeityFilterStrip } from "./DeityFilterStrip";
import { DevotionalCard } from "./DevotionalCard";
import radhaKrishnaImg from "@/pages/images/radha_krishna_hd mayapur tv.webp";
import { WALLPAPER_STRINGS } from "../constants/strings";

export interface LiveWallpaperSectionProps {
  isDark: boolean;
  isHi: boolean;
  selectedDeityFilter: string | null;
  filteredLiveWallpapers: DevotionalLiveWallpaper[];
  likedWallpaperIds: string[];
  onSelectDeity: (deityId: string | null) => void;
  onToggleLikeWallpaper: (wpId: string) => void;
  onLiveWallpaperAction: (wp: DevotionalLiveWallpaper) => void;
}

export const LiveWallpaperSection: React.FC<LiveWallpaperSectionProps> = React.memo(({
  isDark,
  isHi,
  selectedDeityFilter,
  filteredLiveWallpapers,
  likedWallpaperIds,
  onSelectDeity,
  onToggleLikeWallpaper,
  onLiveWallpaperAction,
}) => {
  const heroWp = LIVE_WALLPAPERS_LIST[0];

  return (
    <div className="w-full flex flex-col items-center space-y-6 animate-fade-in">
      {/* Live Deity chips */}
      <div className="w-full flex flex-col">
        <DeityFilterStrip
          isDark={isDark}
          isHi={isHi}
          selectedDeityFilter={selectedDeityFilter}
          onSelectDeity={onSelectDeity}
        />
      </div>

      {/* Hero Recommendation card */}
      {!selectedDeityFilter && (
        <div className="w-full space-y-2 text-left mb-2">
          <div className="flex items-center justify-between w-full mb-3 px-0.5">
            <h3 className={cn("font-serif text-sm font-black flex items-center gap-2", isDark ? "text-amber-100" : "text-[#2B1F18]")}>
              <span>🌌</span>
              {isHi ? WALLPAPER_STRINGS.todayLivingDarshanHi : WALLPAPER_STRINGS.todayLivingDarshanEn}
            </h3>
            <span className="text-[9px] font-sans text-white bg-[#651317] px-2 py-0.5 rounded-full font-black animate-pulse">
              {isHi ? WALLPAPER_STRINGS.liveBadgeHi : WALLPAPER_STRINGS.liveBadgeEn}
            </span>
          </div>
          <div
            className="w-full rounded-[20px] overflow-hidden relative cursor-pointer group select-none"
            style={{
              border: isDark ? "1px solid rgba(251,191,36,0.15)" : "1px solid #EFE5DA",
              boxShadow: isDark ? "0 8px 40px rgba(0,0,0,0.7)" : "0 8px 30px rgba(239,229,218,0.25)",
            }}
            onClick={() => heroWp && onLiveWallpaperAction(heroWp)}
          >
            <div className="w-full aspect-[16/9] relative overflow-hidden flex items-center justify-center bg-black/60">
              <img
                src={radhaKrishnaImg}
                alt=""
                className="absolute inset-0 w-full h-full object-cover filter blur-md opacity-35 scale-110 pointer-events-none"
              />
              <div className="h-full aspect-[9/16] relative z-10 overflow-hidden shadow-2xl">
                <img
                  src={radhaKrishnaImg}
                  alt="Vrindavan Leela"
                  className="w-full h-full object-cover scale-[1.02] group-hover:scale-[1.07] transition-transform duration-700 pointer-events-none"
                />
              </div>
              <div
                className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.1)_0%,transparent_75%)] animate-pulse z-10"
                style={{ animationDuration: "4s" }}
              />
              <div className="absolute inset-0 pointer-events-none z-12 overflow-hidden">
                <div className="absolute top-2 left-[20%] text-sm opacity-40 animate-bounce">🌸</div>
                <div className="absolute top-3 left-[55%] text-sm opacity-30 animate-bounce" style={{ animationDelay: "1.2s" }}>
                  🌼
                </div>
                <div className="absolute top-1 left-[80%] text-sm opacity-45 animate-bounce" style={{ animationDelay: "0.6s" }}>
                  🌸
                </div>
              </div>
              <div
                className="absolute inset-0 z-15"
                style={{ background: "linear-gradient(to top,rgba(5,2,1,0.96) 0%,rgba(5,2,1,0.45) 40%,transparent 100%)" }}
              />
              <div className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between z-20">
                <div className="flex flex-col gap-1.5 text-left">
                  <span className="inline-block px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded text-[7px] font-sans font-black text-amber-300 tracking-wider w-fit leading-none mb-0.5 uppercase shadow-sm">
                    Vrindavan Live
                  </span>
                  <h4 className="font-serif text-base md:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-100 leading-tight">
                    {isHi ? "राधा-कृष्ण दिव्य रास" : "Radha-Krishna Divine Raas"}
                  </h4>
                  <p style={{ fontSize: 9 }} className="text-amber-200/75 italic">
                    {isHi ? "पुष्प वर्षा एवं दिव्य आभा के साथ..." : "With divine petals & aura glow..."}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (heroWp) onLiveWallpaperAction(heroWp);
                  }}
                  className={`shrink-0 px-4 py-2 rounded-full font-sans text-[10px] font-black uppercase flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                    isHi ? "" : "tracking-wide"
                  }`}
                  style={{
                    background: "rgba(255,255,255,0.92)",
                    color: "#0d0502",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5 fill-current animate-spin" style={{ animationDuration: "3s" }} />
                  <span>{isHi ? WALLPAPER_STRINGS.previewHi : WALLPAPER_STRINGS.previewEn}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live gallery sections */}
      <div className="w-full flex flex-col space-y-8">
        {filteredLiveWallpapers.length === 0 ? (
          <div className="w-full py-16 border border-dashed border-amber-900/20 rounded-2xl flex flex-col items-center justify-center text-stone-500 font-sans text-xs gap-2">
            <span>📭</span>
            <span>{isHi ? WALLPAPER_STRINGS.noLiveWallpapersFoundHi : WALLPAPER_STRINGS.noLiveWallpapersFoundEn}</span>
          </div>
        ) : (
          WALLPAPER_SECTIONS.map((sec) => {
            const sectionItems = filteredLiveWallpapers.filter((wp) => wp.category === sec.key);
            if (sectionItems.length === 0) return null;

            return (
              <div key={sec.key} className="w-full space-y-3.5 text-left mb-4">
                <div className="flex items-center justify-between w-full mb-1 px-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#651317] text-xs">🎬</span>
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

                {/* 2-Column Equal Grid with Thin Gap */}
                <div className="grid grid-cols-2 gap-2 w-full">
                  {sectionItems.map((wp, idx) => (
                    <DevotionalCard
                      key={wp.id}
                      wp={wp}
                      index={idx}
                      isLive={true}
                      isDark={isDark}
                      likedWallpaperIds={likedWallpaperIds}
                      onToggleLikeWallpaper={onToggleLikeWallpaper}
                      onWallpaperAction={() => {}}
                      onLiveWallpaperAction={onLiveWallpaperAction}
                      onDownloadWallpaper={() => {}}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* How-to tip */}
      <div
        className="w-full rounded-[20px] p-4 flex flex-col items-center gap-2"
        style={{
          background: isDark ? "rgba(27,13,7,0.4)" : "#FFFFFF",
          border: isDark ? "1px solid rgba(120,60,10,0.2)" : "1px solid #EFE5DA",
        }}
      >
        <span className={cn("text-xs", isDark ? "text-amber-400" : "text-[#651317]")}>
          💡 {isHi ? WALLPAPER_STRINGS.howToApplyTitleHi : WALLPAPER_STRINGS.howToApplyTitleEn}
        </span>
        <p className={cn("text-[9px] font-sans text-center tracking-wide leading-relaxed max-w-md", isDark ? "text-amber-200/85" : "text-[#8A7A6B]")}>
          {isHi ? WALLPAPER_STRINGS.howToApplyDescHi : WALLPAPER_STRINGS.howToApplyDescEn}
        </p>
      </div>
    </div>
  );
});

LiveWallpaperSection.displayName = "LiveWallpaperSection";
