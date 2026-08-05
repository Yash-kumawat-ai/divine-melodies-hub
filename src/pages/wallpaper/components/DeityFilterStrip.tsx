import React from "react";
import { cn } from "@/lib/utils";
import { DEITY_FILTER_LIST } from "../constants/deities";
import basuriSvg from "@/pages/images/svg/basuri.svg";
import { WALLPAPER_STRINGS } from "../constants/strings";

export interface DeityFilterStripProps {
  isDark: boolean;
  isHi: boolean;
  selectedDeityFilter: string | null;
  onSelectDeity: (deityId: string | null) => void;
}

export const DeityFilterStrip: React.FC<DeityFilterStripProps> = React.memo(({
  isDark,
  isHi,
  selectedDeityFilter,
  onSelectDeity,
}) => {
  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center justify-between w-full mb-3 px-0.5">
        <h3 className={cn("font-serif text-sm font-black flex items-center gap-2", isDark ? "text-amber-100" : "text-[#2B1F18]")}>
          <span>🕉️</span>
          {isHi ? WALLPAPER_STRINGS.chooseDeityHi : WALLPAPER_STRINGS.chooseDeityEn}
        </h3>
        <button
          onClick={() => onSelectDeity(null)}
          className={cn(
            "font-sans text-[11px] font-bold flex items-center gap-0.5 active:scale-95 transition-all cursor-pointer",
            isDark ? "text-amber-500 hover:text-amber-400" : "text-[#8A7A6B] hover:text-[#2B1F18]"
          )}
        >
          {isHi ? WALLPAPER_STRINGS.viewAllHi : WALLPAPER_STRINGS.viewAllEn}{" "}
          <span className="ml-0.5 text-base leading-none" style={{ lineHeight: 1 }}>
            ›
          </span>
        </button>
      </div>
      <div className="flex items-start gap-1.5 overflow-x-auto pb-3 pt-1.5 scrollbar-none w-full justify-start sm:justify-center px-1">
        {DEITY_FILTER_LIST.map((deity) => {
          const isActive = selectedDeityFilter === deity.id;
          return (
            <button
              key={deity.id ?? "all"}
              onClick={() => onSelectDeity(deity.id)}
              style={{ touchAction: "manipulation" }}
              className={cn(
                "w-[92px] h-[124px] flex flex-col items-center justify-between p-2 pb-3.5 rounded-2xl transition-all duration-100 ease-out active:scale-95 active:opacity-80 relative shrink-0 outline-none focus:outline-none group cursor-pointer select-none border",
                isActive
                  ? "bg-[#FFFDF9] border-[#651317] shadow-[0_4px_16px_rgba(101,19,23,0.18)]"
                  : isDark
                  ? "bg-[#1f0f08]/90 border-[#651317]/35 hover:border-[#651317] shadow-sm"
                  : "bg-[#FFFDF9] border-[#651317]/25 hover:border-[#651317] shadow-sm shadow-[#651317]/5"
              )}
            >
              {/* Centering container for crop */}
              <div className="relative w-[76px] h-[76px] flex items-center justify-center shrink-0">
                {/* Centered rounded-xl SQUARE card crop with #651317 border */}
                <div
                  className={cn(
                    "relative z-10 w-[74px] h-[74px] rounded-xl overflow-hidden flex items-center justify-center bg-white shadow-inner transition-colors border",
                    isActive ? "border-[#651317]" : "border-[#651317]/30 group-hover:border-[#651317]"
                  )}
                >
                  {deity.isIcon ? (
                    <img src={basuriSvg} alt="Bansuri" className="w-7.5 h-7.5 object-contain p-0.5" />
                  ) : (
                    <img src={deity.image} alt={deity.nameEn} className="w-full h-full object-cover" />
                  )}
                </div>
              </div>

              {/* Deity name */}
              <span
                className={cn(
                  "relative z-10 font-bold font-serif text-center leading-tight tracking-wide mt-2 pb-0.5",
                  isHi ? "text-[16px] sm:text-[17px] font-black" : "text-[14px] sm:text-[15px]",
                  isActive ? (isDark ? "text-amber-300" : "text-[#651317]") : isDark ? "text-amber-200/80" : "text-[#2B1F18]"
                )}
              >
                {isHi ? deity.name : deity.nameEn}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

DeityFilterStrip.displayName = "DeityFilterStrip";
