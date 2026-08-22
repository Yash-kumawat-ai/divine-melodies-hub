import React from "react";
import { Heart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { PosterLikeButton } from "@/pages/Blessings/components/PosterLikeButton";
import type { DevotionalWallpaper, DevotionalLiveWallpaper, PosterTemplate } from "@/pages/Blessings/types";
import { formatDeityName } from "../utils/diaryHelpers";
import { DIARY_TEXTS } from "../constants/diaryConstants";

export interface LikedItemsGalleryProps {
  isDark: boolean;
  isHi: boolean;
  likedPosters: PosterTemplate[];
  likedWallpapers: {
    staticLiked: DevotionalWallpaper[];
    liveLiked: DevotionalLiveWallpaper[];
  };
  likedPosterIds: string[];
  likedWallpaperIds: string[];
  isLikedEmpty: boolean;
  onToggleLikePoster: (posterId: string) => void;
  onToggleLikeWallpaper: (wallpaperId: string) => void;
  onSelectPoster: (poster: PosterTemplate) => void;
  onWallpaperAction: (wallpaper: DevotionalWallpaper) => void;
  onLiveWallpaperAction: (wallpaper: DevotionalLiveWallpaper) => void;
  onDownloadWallpaper: (wallpaper: DevotionalWallpaper) => void;
  onNavigateToMaker: () => void;
}

export const LikedItemsGallery: React.FC<LikedItemsGalleryProps> = React.memo(({
  isDark,
  isHi,
  likedPosters,
  likedWallpapers,
  likedPosterIds,
  likedWallpaperIds,
  isLikedEmpty,
  onToggleLikePoster,
  onToggleLikeWallpaper,
  onSelectPoster,
  onWallpaperAction,
  onLiveWallpaperAction,
  onDownloadWallpaper,
  onNavigateToMaker,
}) => {
  if (isLikedEmpty) {
    return (
      <div className="w-full border border-dashed border-amber-900/30 rounded-3xl p-10 flex flex-col items-center justify-center text-center gap-3">
        <Heart className="w-8 h-8 text-amber-500/30 animate-pulse" />
        <p className="text-xs text-amber-200/85 font-sans leading-relaxed whitespace-pre-line">
          {isHi ? DIARY_TEXTS.emptyLikedHi : DIARY_TEXTS.emptyLikedEn}
        </p>
        <button
          onClick={onNavigateToMaker}
          className={cn(
            "px-4 py-2 border border-amber-500/20 hover:bg-amber-500/10 text-amber-300 font-sans font-black text-[10px] uppercase rounded-lg transition-all active:scale-95 cursor-pointer",
            isHi ? "" : "tracking-widest"
          )}
        >
          {isHi ? DIARY_TEXTS.btnExplorePostersHi : DIARY_TEXTS.btnExplorePostersEn}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 text-left">
      {/* 1. Liked Posters */}
      {likedPosters.length > 0 && (
        <div className="space-y-3">
          <h3
            className={cn(
              "font-serif text-xs font-black uppercase flex items-center gap-2 border-b pb-2 tracking-wider",
              isDark ? "text-amber-400 border-amber-500/20" : "text-[#B27A1C] border-[#EAD7C3]"
            )}
          >
            <span>✨</span>
            {isHi ? DIARY_TEXTS.likedPostersTitleHi : DIARY_TEXTS.likedPostersTitleEn}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 w-full">
            {likedPosters.map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => onSelectPoster(tpl)}
                className={cn(
                  "border p-2 cursor-pointer group active:scale-[0.97] transition-all duration-300 rounded-2xl",
                  isDark
                    ? "bg-[#1b0d07]/40 border-amber-500/10 hover:border-amber-500/35"
                    : "bg-white/70 border-[#EAD7C3]/60 hover:border-[#B27A1C]/45"
                )}
                style={{ boxShadow: "0 6px 20px rgba(0,0,0,0.5)" }}
              >
                <div className="w-full aspect-[9/16] relative rounded-xl overflow-hidden mb-2">
                  <img
                    src={tpl.imageUrl}
                    alt={isHi ? tpl.titleHindi : tpl.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span
                      style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em" }}
                      className="px-3 py-1.5 bg-[#fbbf24] text-stone-950 rounded-lg font-sans"
                    >
                      {isHi ? DIARY_TEXTS.customizeHi : DIARY_TEXTS.customizeEn}
                    </span>
                  </div>
                  {/* Like Button Overlay */}
                  <div className="absolute top-2.5 left-2.5 z-30">
                    <PosterLikeButton
                      posterId={tpl.id}
                      isLiked={likedPosterIds.includes(tpl.id)}
                      onToggle={() => onToggleLikePoster(tpl.id)}
                    />
                  </div>
                </div>
                <div className="text-left px-1">
                  <h4 className="font-serif text-[11px] font-bold text-amber-100 leading-tight truncate">
                    {isHi ? tpl.titleHindi : tpl.title}
                  </h4>
                  <span
                    style={{
                      fontSize: 8,
                      color: isDark ? "rgba(251,191,36,0.85)" : "#B27A1C",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: isHi ? "normal" : "0.04em",
                      display: "block",
                      marginTop: 2,
                    }}
                  >
                    {tpl.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Liked Static Wallpapers */}
      {likedWallpapers.staticLiked.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-serif text-xs font-black uppercase text-amber-400 flex items-center gap-2 border-b border-amber-500/20 pb-2 tracking-wider">
            <span>📱</span>
            {isHi ? DIARY_TEXTS.likedWallpapersTitleHi : DIARY_TEXTS.likedWallpapersTitleEn}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 w-full">
            {likedWallpapers.staticLiked.map((wp) => (
              <div
                key={wp.id}
                className="rounded-2xl flex flex-col gap-0 relative cursor-pointer overflow-hidden group transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] w-full"
                style={{
                  background: isDark ? "rgba(15,7,3,0.7)" : "rgba(255,255,255,0.75)",
                  border: isDark ? "1px solid rgba(120,60,10,0.25)" : "1px solid rgba(188,138,83,0.25)",
                  boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.5)" : "0 4px 20px rgba(188,138,83,0.1)",
                }}
                onClick={() => onWallpaperAction(wp)}
              >
                <div className="w-full aspect-[9/16] rounded-2xl overflow-hidden relative">
                  <img
                    src={wp.imageUrl}
                    alt={wp.name}
                    className="w-full h-full object-cover group-hover:scale-[1.07] transition-all duration-500 pointer-events-none brightness-[0.88] contrast-[1.03] group-hover:brightness-100 group-hover:contrast-100"
                  />
                  {/* Cinematic gradient */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(10,4,2,0.96) 0%, rgba(10,4,2,0.5) 35%, rgba(10,4,2,0.05) 70%, transparent 100%)",
                    }}
                  />

                  {/* Like Button Overlay */}
                  <div className="absolute top-2.5 left-2.5 z-30">
                    <PosterLikeButton
                      posterId={wp.id}
                      isLiked={likedWallpaperIds.includes(wp.id)}
                      onToggle={() => onToggleLikeWallpaper(wp.id)}
                    />
                  </div>

                  {/* Tier badge */}
                  <div
                    className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full z-10"
                    style={{
                      fontSize: 8,
                      fontWeight: 900,
                      fontFamily: "sans-serif",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      background:
                        wp.tier !== "free"
                          ? "linear-gradient(135deg,rgba(251,191,36,0.3),rgba(217,119,6,0.25))"
                          : "rgba(0,0,0,0.55)",
                      border:
                        wp.tier !== "free"
                          ? "1px solid rgba(251,191,36,0.5)"
                          : "1px solid rgba(251,191,36,0.25)",
                      color: "#fbbf24",
                      backdropFilter: "blur(2px)",
                    }}
                  >
                    {wp.tier !== "free" ? DIARY_TEXTS.proBadge : DIARY_TEXTS.freeBadge}
                  </div>

                  {/* Download button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownloadWallpaper(wp);
                    }}
                    className="absolute bottom-2.5 right-2.5 flex items-center justify-center transition-all duration-250 active:scale-90 focus:outline-none z-15 shadow-md"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.65)",
                      border: "1.5px solid rgba(251,191,36,0.45)",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.4)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "linear-gradient(135deg,#f59e0b,#d97706)";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "#fbbf24";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "0 0 8px rgba(251,191,36,0.5)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.65)";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(251,191,36,0.45)";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ width: 12, height: 12 }}
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </button>
                </div>

                {/* Bottom text */}
                <div className="px-2.5 py-2.5 text-left">
                  <span
                    className={cn(
                      "inline-block px-1.5 py-0.5 rounded text-[7.5px] font-sans font-black tracking-wide w-fit leading-none mb-0.5 shadow-sm backdrop-blur-[2px]",
                      isDark
                        ? "bg-amber-950/80 border border-amber-500/30 text-amber-300"
                        : "bg-[#B27A1C]/10 border border-[#B27A1C]/30 text-[#B27A1C]"
                    )}
                  >
                    {formatDeityName(wp.deity, isHi)}
                  </span>
                  <h4
                    style={{
                      fontFamily: "serif",
                      fontSize: 11,
                      fontWeight: 800,
                      color: isDark ? "rgba(255,251,235,0.95)" : "#543D2B",
                      lineHeight: 1.2,
                    }}
                    className="line-clamp-1 block mt-0.5"
                  >
                    {isHi ? wp.nameHindi : wp.name}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Liked Live Wallpapers */}
      {likedWallpapers.liveLiked.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-serif text-xs font-black uppercase text-amber-400 flex items-center gap-2 border-b border-amber-500/20 pb-2 tracking-wider">
            <span>🎬</span>
            {isHi ? DIARY_TEXTS.likedLiveWallpapersTitleHi : DIARY_TEXTS.likedLiveWallpapersTitleEn}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 w-full">
            {likedWallpapers.liveLiked.map((wp) => (
              <div
                key={wp.id}
                className="rounded-2xl flex flex-col gap-0 relative cursor-pointer overflow-hidden group transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] w-full"
                style={{
                  background: isDark ? "rgba(15,7,3,0.7)" : "rgba(255,255,255,0.75)",
                  border: isDark ? "1px solid rgba(120,60,10,0.25)" : "1px solid rgba(188,138,83,0.25)",
                  boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.5)" : "0 4px 20px rgba(188,138,83,0.1)",
                }}
                onClick={() => onLiveWallpaperAction(wp)}
              >
                <div className="w-full aspect-[9/16] rounded-2xl overflow-hidden relative">
                  {wp.effect === "aura" && (
                    <div
                      className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.18)_0%,transparent_75%)] pointer-events-none z-10 animate-pulse"
                      style={{ animationDuration: "2.5s" }}
                    />
                  )}
                  {wp.effect === "shimmer" && (
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_20%,rgba(255,255,255,0.08)_50%,transparent_80%)] pointer-events-none z-10 animate-shimmer" />
                  )}
                  {wp.effect === "flame" && (
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-orange-500/10 via-transparent to-transparent pointer-events-none z-10 animate-pulse"
                      style={{ animationDuration: "1.5s" }}
                    />
                  )}
                  <img
                    src={wp.thumbnailUrl}
                    alt={wp.name}
                    className="w-full h-full object-cover group-hover:scale-[1.07] transition-all duration-500 pointer-events-none brightness-[0.88] contrast-[1.03] group-hover:brightness-100 group-hover:contrast-100"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(10,4,2,0.96) 0%, rgba(10,4,2,0.5) 35%, rgba(10,4,2,0.05) 70%, transparent 100%)",
                    }}
                  />

                  {/* Like Button Overlay */}
                  <div className="absolute top-2.5 left-2.5 z-30">
                    <PosterLikeButton
                      posterId={wp.id}
                      isLiked={likedWallpaperIds.includes(wp.id)}
                      onToggle={() => onToggleLikeWallpaper(wp.id)}
                    />
                  </div>

                  {/* Effect tag */}
                  <div className="absolute top-[42px] left-2.5 z-10">
                    <span
                      style={{
                        fontSize: 7,
                        fontWeight: 900,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: "rgba(0,0,0,0.6)",
                        border: "1px solid rgba(251,191,36,0.25)",
                        color: "#fbbf24",
                      }}
                    >
                      {wp.effect}
                    </span>
                  </div>

                  {/* Tier badge */}
                  <div
                    className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full z-10"
                    style={{
                      fontSize: 8,
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      background:
                        wp.tier !== "free"
                          ? "linear-gradient(135deg,rgba(251,191,36,0.3),rgba(217,119,6,0.25))"
                          : "rgba(0,0,0,0.55)",
                      border:
                        wp.tier !== "free"
                          ? "1px solid rgba(251,191,36,0.5)"
                          : "1px solid rgba(251,191,36,0.25)",
                      color: "#fbbf24",
                      backdropFilter: "blur(2px)",
                    }}
                  >
                    {wp.tier !== "free" ? DIARY_TEXTS.proBadge : DIARY_TEXTS.freeBadge}
                  </div>

                  {/* Action button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLiveWallpaperAction(wp);
                    }}
                    className="absolute bottom-2.5 right-2.5 flex items-center justify-center transition-all duration-250 active:scale-90 focus:outline-none z-20 shadow-md"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.65)",
                      border: "1.5px solid rgba(251,191,36,0.45)",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.4)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "linear-gradient(135deg,#f59e0b,#d97706)";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "#fbbf24";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "0 0 8px rgba(251,191,36,0.5)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.65)";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(251,191,36,0.45)";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                    }}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-current" />
                  </button>
                </div>

                {/* Bottom text */}
                <div className="px-2.5 py-2.5 text-left">
                  <span
                    className={cn(
                      "inline-block px-1.5 py-0.5 rounded text-[7.5px] font-sans font-black tracking-wide w-fit leading-none mb-0.5 shadow-sm backdrop-blur-[2px]",
                      isDark
                        ? "bg-amber-950/80 border border-amber-500/30 text-amber-300"
                        : "bg-[#B27A1C]/10 border border-[#B27A1C]/30 text-[#B27A1C]"
                    )}
                  >
                    {formatDeityName(wp.deity, isHi)}
                  </span>
                  <h4
                    style={{
                      fontFamily: "serif",
                      fontSize: 11,
                      fontWeight: 800,
                      color: isDark ? "rgba(255,251,235,0.95)" : "#543D2B",
                      lineHeight: 1.2,
                    }}
                    className="line-clamp-1 block mt-0.5"
                  >
                    {isHi ? wp.nameHindi : wp.name}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

LikedItemsGallery.displayName = "LikedItemsGallery";
