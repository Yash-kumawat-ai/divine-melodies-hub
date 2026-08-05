import React from "react";
import { ArrowLeft, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import meditationSvg from "@/pages/images/meditation svg.svg";

export interface BlessingsHeaderProps {
  isDark: boolean;
  isHi: boolean;
  activeTab: "maker" | "wallpapers" | "saved";
  isSearchOpen?: boolean;
  onToggleSearch?: () => void;
  onNavigateBack: () => void;
}

export const BlessingsHeader: React.FC<BlessingsHeaderProps> = React.memo(({
  isDark,
  isHi,
  activeTab,
  isSearchOpen = false,
  onToggleSearch,
  onNavigateBack,
}) => {
  // Compute title, subtitle, and icon reactively based on activeTab
  const getHeaderDetails = () => {
    switch (activeTab) {
      case "wallpapers":
        return {
          icon: (
            <div className={cn("w-9 h-9 rounded-full border p-1.5 flex items-center justify-center shadow-sm shrink-0", isDark ? "bg-card border-amber-500/30" : "bg-white border-[#651317]/20")}>
              <img src={meditationSvg} alt="Meditation" className="w-5 h-5 object-contain" />
            </div>
          ),
          title: isHi ? "आध्यात्मिक वॉलपेपर" : "Adhyatmic Wallpaper",
          subtitle: isHi ? "पावन मोबाइल वॉलपेपर व सजीव दर्शन" : "Sacred phone backgrounds & live motion darshans",
        };
      case "saved":
        return {
          icon: <span className="text-xl sm:text-2xl shrink-0">📖</span>,
          title: isHi ? "मेरी सहेजी गई डायरी" : "My Saved Gallery Diary",
          subtitle: isHi ? "आपके सहेजे गए पोस्टर एवं पसंदीदा वॉलपेपर" : "Your saved blessings & favorite wallpapers",
        };
      case "maker":
      default:
        return {
          icon: <span className="text-xl sm:text-2xl shrink-0">🪔</span>,
          title: isHi ? "भक्तिमय पोस्टर" : "Devotional Posters",
          subtitle: isHi ? "हर अवसर के लिए सुंदर धार्मिक पोस्टर" : "Beautiful spiritual posters for every occasion",
        };
    }
  };

  const { icon, title, subtitle } = getHeaderDetails();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 backdrop-blur-md px-4 py-3 flex items-center justify-between w-full select-none border-b transition-colors duration-200",
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
        <div className="flex items-center gap-2.5 min-w-0">
          {icon}
          <div className="text-left min-w-0">
            <h1 className={cn("font-serif text-base sm:text-lg font-black leading-none truncate", isDark ? "text-amber-100" : "text-[#2B1F18]")}>
              {title}
            </h1>
            <span className={cn("font-sans text-[10px] sm:text-xs block mt-1 font-semibold leading-none truncate", isDark ? "text-amber-200/80" : "text-[#8A7A6B]")}>
              {subtitle}
            </span>
          </div>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2 shrink-0">
        {activeTab === "wallpapers" && onToggleSearch && (
          <button
            onClick={onToggleSearch}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full active:scale-95 transition-all border cursor-pointer",
              isSearchOpen
                ? isDark
                  ? "bg-amber-500 text-stone-950 border-amber-400"
                  : "bg-[#651317] text-white border-[#651317]"
                : isDark
                  ? "bg-black/30 border-amber-900/20 text-amber-400 hover:bg-amber-950/30"
                  : "bg-[#FFFFFF] border-[#EFE5DA] text-[#651317] hover:bg-[#FAF8F4]"
            )}
          >
            <Search className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
});

BlessingsHeader.displayName = "BlessingsHeader";
