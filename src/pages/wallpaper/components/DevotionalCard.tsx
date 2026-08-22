import React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { WallpaperLikeButton } from "@/pages/Blessings/components/WallpaperLikeButton";
import type { DevotionalWallpaper, DevotionalLiveWallpaper } from "@/pages/Blessings/types";
import { WALLPAPER_STRINGS } from "../constants/strings";

export interface DevotionalCardProps {
  wp: DevotionalWallpaper | DevotionalLiveWallpaper;
  index: number;
  isLive: boolean;
  isDark: boolean;
  likedWallpaperIds: string[];
  onToggleLikeWallpaper: (wpId: string) => void;
  onWallpaperAction: (wp: DevotionalWallpaper) => void;
  onLiveWallpaperAction: (wp: DevotionalLiveWallpaper) => void;
  onDownloadWallpaper: (wp: DevotionalWallpaper) => void;
}

export const DevotionalCard: React.FC<DevotionalCardProps> = React.memo(({
  wp,
  isLive,
  isDark,
  likedWallpaperIds,
  onToggleLikeWallpaper,
  onWallpaperAction,
  onLiveWallpaperAction,
  onDownloadWallpaper,
}) => {
  const isLiked = likedWallpaperIds.includes(wp.id);
  const liveWp = isLive ? (wp as DevotionalLiveWallpaper) : null;
  const staticWp = !isLive ? (wp as DevotionalWallpaper) : null;

  return (
    <div
      key={wp.id}
      onClick={() =>
        isLive
          ? onLiveWallpaperAction(wp as DevotionalLiveWallpaper)
          : onWallpaperAction(wp as DevotionalWallpaper)
      }
      className={cn(
        "rounded-2xl overflow-hidden relative cursor-pointer group transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm w-full border select-none",
        isDark
          ? "bg-[#150703]/80 border-[#2a120b]/35 shadow-black/50"
          : "bg-[#FFFFFF] border-[#EFE5DA]/60 shadow-[#EFE5DA]/15"
      )}
    >
      {/* Image wrapper */}
      <div className="w-full overflow-hidden relative aspect-[3/4]">
        {isLive && liveWp?.effect === "aura" && (
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.18)_0%,transparent_75%)] pointer-events-none z-10 animate-pulse"
            style={{ animationDuration: "2.5s" }}
          />
        )}
        {isLive && liveWp?.effect === "shimmer" && (
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_20%,rgba(255,255,255,0.08)_50%,transparent_80%)] pointer-events-none z-10 animate-shimmer" />
        )}
        {isLive && liveWp?.effect === "flame" && (
          <div
            className="absolute inset-0 bg-gradient-to-t from-orange-500/10 via-transparent to-transparent pointer-events-none z-10 animate-pulse"
            style={{ animationDuration: "1.5s" }}
          />
        )}

        <img
          src={isLive ? liveWp?.thumbnailUrl : staticWp?.imageUrl}
          alt={wp.name}
          className="w-full h-full object-cover group-hover:scale-[1.05] transition-all duration-500 pointer-events-none brightness-[0.9] group-hover:brightness-100"
        />
        {/* Subtle overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Floating Like control (bottom left) */}
        <div className="absolute bottom-2.5 left-2.5 z-30">
          <WallpaperLikeButton
            wpId={wp.id}
            isLiked={isLiked}
            onToggle={() => onToggleLikeWallpaper(wp.id)}
            likesCount={isLiked ? 1 : 0}
          />
        </div>

        {/* Floating Download/Preview control (bottom right) */}
        {isLive ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLiveWallpaperAction(wp as DevotionalLiveWallpaper);
            }}
            className="absolute bottom-2.5 right-2.5 flex items-center justify-center transition-all duration-200 active:scale-90 focus:outline-none z-30 shadow-md cursor-pointer"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.6)",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-current" />
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (staticWp) onDownloadWallpaper(staticWp);
            }}
            className="absolute bottom-2.5 right-2.5 flex items-center justify-center transition-all duration-200 active:scale-90 focus:outline-none z-30 shadow-md cursor-pointer"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.6)",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: 13, height: 13 }}
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        )}

        {/* Effect tag (Live only) */}
        {isLive && liveWp && (
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
              {liveWp.effect}
            </span>
          </div>
        )}

        {/* Premium Badge (top right) */}
        <div
          className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full z-10 text-[8px] font-black uppercase font-sans tracking-wider"
          style={{
            background: wp.tier !== "free" ? "#651317" : "rgba(0,0,0,0.55)",
            color: wp.tier !== "free" ? "#FFFFFF" : "#fbbf24",
            border: wp.tier !== "free" ? "1px solid #651317" : "1px solid rgba(251,191,36,0.25)",
          }}
        >
          {wp.tier !== "free" ? WALLPAPER_STRINGS.proBadge : WALLPAPER_STRINGS.freeBadge}
        </div>
      </div>
    </div>
  );
});

DevotionalCard.displayName = "DevotionalCard";
