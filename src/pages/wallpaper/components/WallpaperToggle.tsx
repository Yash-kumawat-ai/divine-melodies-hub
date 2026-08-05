import React from "react";
import type { WallpaperType } from "../types";
import mobileEditedSvg from "@/pages/images/svg/mobile edited.svg";
import playButtonLiveSvg from "@/pages/images/svg/play button live.svg";
import { WALLPAPER_STRINGS } from "../constants/strings";

export interface WallpaperToggleProps {
  isDark: boolean;
  isHi: boolean;
  wallpaperType: WallpaperType;
  onSelectType: (type: WallpaperType) => void;
}

export const WallpaperToggle: React.FC<WallpaperToggleProps> = React.memo(({
  isDark,
  isHi,
  wallpaperType,
  onSelectType,
}) => {
  return (
    <div className="w-full max-w-xs mx-auto mb-7 px-4">
      <div
        className="p-1 rounded-full flex items-center shadow-lg border"
        style={{
          background: isDark ? "rgba(18,7,4,0.6)" : "#FFFFFF",
          border: isDark ? "1px solid rgba(120,60,10,0.25)" : "1px solid #EFE5DA",
        }}
      >
        <button
          onClick={() => onSelectType("static")}
          className={`flex-1 py-2.5 rounded-full font-sans text-xs font-black uppercase transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none active:scale-95 cursor-pointer ${
            isHi ? "" : "tracking-wider"
          } ${
            wallpaperType === "static"
              ? isDark
                ? "text-[#fbbf24] shadow-md"
                : "text-[#651317] shadow-md"
              : isDark
              ? "text-amber-200/75 hover:text-amber-200"
              : "text-[#8A7A6B] hover:text-[#2B1F18]"
          }`}
          style={
            wallpaperType === "static"
              ? isDark
                ? { background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.35)" }
                : { background: "rgba(101, 19, 23, 0.1)", border: "1px solid rgba(101, 19, 23, 0.25)" }
              : {}
          }
        >
          <img src={mobileEditedSvg} alt="Static" className="w-4 h-4 object-contain" />
          <span>{isHi ? WALLPAPER_STRINGS.toggleStaticHi : WALLPAPER_STRINGS.toggleStaticEn}</span>
        </button>
        <button
          onClick={() => onSelectType("live")}
          className={`flex-1 py-2.5 rounded-full font-sans text-xs font-black uppercase transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none active:scale-95 cursor-pointer ${
            isHi ? "" : "tracking-wider"
          } ${
            wallpaperType === "live"
              ? isDark
                ? "text-[#fbbf24] shadow-md"
                : "text-[#651317] shadow-md"
              : isDark
              ? "text-amber-200/75 hover:text-amber-200"
              : "text-[#8A7A6B] hover:text-[#2B1F18]"
          }`}
          style={
            wallpaperType === "live"
              ? isDark
                ? { background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.35)" }
                : { background: "rgba(101, 19, 23, 0.1)", border: "1px solid rgba(101, 19, 23, 0.25)" }
              : {}
          }
        >
          <img src={playButtonLiveSvg} alt="Live" className="w-4 h-4 object-contain" />
          <span>{isHi ? WALLPAPER_STRINGS.toggleLiveHi : WALLPAPER_STRINGS.toggleLiveEn}</span>
        </button>
      </div>
    </div>
  );
});

WallpaperToggle.displayName = "WallpaperToggle";
