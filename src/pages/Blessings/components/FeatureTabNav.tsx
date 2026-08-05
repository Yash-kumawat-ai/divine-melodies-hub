import React from "react";
import { cn } from "@/lib/utils";
import posterSvg from "@/pages/images/svg/poster.svg";
import mobileEditedSvg from "@/pages/images/svg/mobile edited.svg";

export interface FeatureTabNavProps {
  isDark: boolean;
  isHi: boolean;
  activeTab: "maker" | "wallpapers" | "saved";
  onSelectTab: (tab: "maker" | "wallpapers" | "saved") => void;
  className?: string;
}

export const FeatureTabNav: React.FC<FeatureTabNavProps> = React.memo(({
  isDark,
  isHi,
  activeTab,
  onSelectTab,
  className,
}) => {
  return (
    <div className={cn("w-full max-w-md mx-auto px-4 select-none", className)}>
      <nav className={cn("p-1.5 rounded-full border flex items-center shadow-md transition-colors", isDark ? "bg-[#120704]/80 border-amber-950/40" : "bg-[#FFFDF8] border-[#EAD7C3]")}>
        <button
          onClick={() => onSelectTab("maker")}
          className={cn(
            "flex-1 py-2.5 rounded-full font-sans text-[11px] font-black uppercase transition-all duration-300 flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer active:scale-95 shadow-sm",
            isHi ? '' : 'tracking-wider',
            activeTab === "maker"
              ? isDark
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-amber-500/20"
                : "bg-gradient-to-r from-[#651317] to-[#8B1E24] text-white shadow-red-900/20"
              : isDark
                ? "text-amber-200/80 hover:text-amber-200"
                : "text-[#543D2B] hover:text-[#651317]"
          )}
        >
          <img src={posterSvg} alt="Poster" className="w-4 h-4 object-contain" />
          <span>{isHi ? "पोस्टर" : "Posters"}</span>
        </button>
        <button
          onClick={() => onSelectTab("wallpapers")}
          className={cn(
            "flex-1 py-2.5 rounded-full font-sans text-[11px] font-black uppercase transition-all duration-300 flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer active:scale-95 shadow-sm",
            isHi ? '' : 'tracking-wider',
            activeTab === "wallpapers"
              ? isDark
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-amber-500/20"
                : "bg-gradient-to-r from-[#651317] to-[#8B1E24] text-white shadow-red-900/20"
              : isDark
                ? "text-amber-200/80 hover:text-amber-200"
                : "text-[#543D2B] hover:text-[#651317]"
          )}
        >
          <img src={mobileEditedSvg} alt="Wallpaper" className="w-4 h-4 object-contain" />
          <span>{isHi ? "वॉलपेपर" : "Wallpapers"}</span>
        </button>
        <button
          onClick={() => onSelectTab("saved")}
          className={cn(
            "flex-1 py-2.5 rounded-full font-sans text-[11px] font-black uppercase transition-all duration-300 flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer active:scale-95 shadow-sm",
            isHi ? '' : 'tracking-wider',
            activeTab === "saved"
              ? isDark
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-amber-500/20"
                : "bg-gradient-to-r from-[#651317] to-[#8B1E24] text-white shadow-red-900/20"
              : isDark
                ? "text-amber-200/80 hover:text-amber-200"
                : "text-[#543D2B] hover:text-[#651317]"
          )}
        >
          <span>📖</span>
          <span>{isHi ? "डायरी" : "Diary"}</span>
        </button>
      </nav>
    </div>
  );
});

FeatureTabNav.displayName = "FeatureTabNav";
