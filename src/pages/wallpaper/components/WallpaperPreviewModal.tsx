import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Share2, Download, Heart, Lock, Smartphone, Flag, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";
import { PhoneFrame, CustomDownloadIcon } from "@/pages/Blessings";
import { WALLPAPERS_LIST, LIVE_WALLPAPERS_LIST } from "@/pages/Blessings/constants";
import type { PreviewMode } from "../types";
import { shareWallpaper } from "../utils/share";
import { handleWallpaperDownload, handleLiveWallpaperDownload } from "../utils/download";
import { cn } from "@/lib/utils";

export interface WallpaperPreviewModalProps {
  isDark: boolean;
  isHi: boolean;
  showPreviewModal: string | null;
  setShowPreviewModal?: (id: string | null) => void;
  showLivePreviewModal: string | null;
  setShowLivePreviewModal?: (id: string | null) => void;
  isCardVisible?: boolean;
  setIsCardVisible?: (visible: boolean) => void;
  previewMode: PreviewMode;
  setPreviewMode: (mode: PreviewMode) => void;
  likedWallpaperIds: string[];
  onToggleLikeWallpaper: (wpId: string) => void;
  onCloseModal: () => void;
}

const getDeityEmoji = (deity: string) => {
  switch (deity) {
    case "Shiva": return "🔱";
    case "Rama": return "🏹";
    case "Krishna": return "🪈";
    case "Hanuman": return "🔥";
    case "Ganesha": return "🪷";
    case "Lakshmi": return "🪷";
    default: return "🕉️";
  }
};

const getDeityHindi = (deity: string) => {
  switch (deity) {
    case "Shiva": return "शिव";
    case "Rama": return "राम";
    case "Krishna": return "कृष्ण";
    case "Hanuman": return "हनुमान";
    case "Ganesha": return "गणेश";
    case "Lakshmi": return "लक्ष्मी";
    default: return deity;
  }
};

export const WallpaperPreviewModal: React.FC<WallpaperPreviewModalProps> = React.memo(({
  isDark,
  isHi,
  showPreviewModal,
  setShowPreviewModal,
  showLivePreviewModal,
  setShowLivePreviewModal,
  previewMode,
  setPreviewMode,
  likedWallpaperIds,
  onToggleLikeWallpaper,
  onCloseModal,
}) => {
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isCardVisibleInternal, setIsCardVisibleInternal] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");

  // Lock body scroll when modal is open
  useEffect(() => {
    const hasDoc = typeof document !== "undefined";
    if (hasDoc) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }
    return () => {
      if (hasDoc) {
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
      }
    };
  }, []);

  const staticWp = showPreviewModal
    ? WALLPAPERS_LIST.find((w) => w.id === showPreviewModal)
    : null;
  const liveWp = showLivePreviewModal
    ? LIVE_WALLPAPERS_LIST.find((w) => w.id === showLivePreviewModal)
    : null;

  if (!staticWp && !liveWp) return null;

  // Toggle card visibility when clicking on the background screen
  const toggleCardVisibility = () => {
    setIsCardVisibleInternal((prev) => !prev);
  };

  // Touch Swipe Handler for Static Wallpapers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEndStatic = (e: React.TouchEvent) => {
    if (touchStartX === null || !setShowPreviewModal || !staticWp) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;
    setTouchStartX(null);

    if (Math.abs(diffX) > 40) {
      const currentIndex = WALLPAPERS_LIST.findIndex((w) => w.id === staticWp.id);
      if (currentIndex === -1) return;
      if (diffX > 0) {
        // Swiped left -> Next
        const nextIndex = (currentIndex + 1) % WALLPAPERS_LIST.length;
        setShowPreviewModal(WALLPAPERS_LIST[nextIndex].id);
      } else {
        // Swiped right -> Previous
        const prevIndex = (currentIndex - 1 + WALLPAPERS_LIST.length) % WALLPAPERS_LIST.length;
        setShowPreviewModal(WALLPAPERS_LIST[prevIndex].id);
      }
    }
  };

  // Touch Swipe Handler for Live Wallpapers
  const handleTouchEndLive = (e: React.TouchEvent) => {
    if (touchStartX === null || !setShowLivePreviewModal || !liveWp) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;
    setTouchStartX(null);

    if (Math.abs(diffX) > 40) {
      const currentIndex = LIVE_WALLPAPERS_LIST.findIndex((w) => w.id === liveWp.id);
      if (currentIndex === -1) return;
      if (diffX > 0) {
        // Swiped left -> Next
        const nextIndex = (currentIndex + 1) % LIVE_WALLPAPERS_LIST.length;
        setShowLivePreviewModal(LIVE_WALLPAPERS_LIST[nextIndex].id);
      } else {
        // Swiped right -> Previous
        const prevIndex = (currentIndex - 1 + LIVE_WALLPAPERS_LIST.length) % LIVE_WALLPAPERS_LIST.length;
        setShowLivePreviewModal(LIVE_WALLPAPERS_LIST[prevIndex].id);
      }
    }
  };

  return (
    <AnimatePresence>
      {/* 1. Static Wallpaper Fullscreen Immersive Side-by-Side Modal */}
      {staticWp && (
        <>
          {/* Fullscreen Wallpaper Background (Crisp & Clear - NO BLUR) */}
          <div className="fixed inset-0 z-[121] select-none pointer-events-none overflow-hidden">
            <img
              src={staticWp.imageUrl}
              alt={staticWp.name}
              className={cn(
                "w-full h-full object-cover scale-105 transition-all duration-300",
                isCardVisibleInternal
                  ? isDark ? "brightness-[0.45]" : "brightness-[0.75]"
                  : "brightness-100 scale-100 filter-none"
              )}
            />
          </div>

          {/* Click-to-toggle Screen Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCardVisibility}
            className={cn(
              "fixed inset-0 z-[122] select-none cursor-pointer transition-opacity duration-300",
              isCardVisibleInternal ? "bg-black/25 pointer-events-auto" : "bg-transparent pointer-events-auto"
            )}
          />

          {/* Top Bar Controls (Close X Button Only) */}
          <AnimatePresence>
            {isCardVisibleInternal && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="fixed top-5 left-5 z-[140] select-none pointer-events-auto"
              >
                <button
                  type="button"
                  onClick={onCloseModal}
                  className={cn(
                    "w-10 h-10 rounded-full border flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-lg",
                    isDark
                      ? "bg-black/60 border-white/10 text-white hover:bg-black/80"
                      : "bg-white/90 border-[#EAD7C3] text-[#651317] hover:bg-white"
                  )}
                >
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Bottom Card Box (Low Opacity White with fixed 10px bottom gap) */}
          <AnimatePresence>
            {isCardVisibleInternal && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 40 }}
                transition={{ type: "spring", damping: 25, stiffness: 185 }}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "fixed bottom-[calc(10px+env(safe-area-inset-bottom,0px))] left-3 right-3 sm:left-auto sm:right-auto w-[calc(100%-1.5rem)] sm:w-full sm:max-w-xl md:max-w-2xl mx-auto rounded-[1.8rem] md:rounded-[2rem] p-4 sm:p-5 md:p-6 z-[130] flex flex-row items-center justify-between gap-3 sm:gap-6 transition-colors duration-200 pointer-events-auto border shadow-xl",
                  isDark
                    ? "bg-stone-950/85 border-amber-500/20 text-stone-100 shadow-[0_10px_30px_rgba(0,0,0,0.85)]"
                    : "bg-white/85 border-[#EAD7C3] text-[#2B1F18] shadow-[0_10px_30px_rgba(84,61,43,0.14)]"
                )}
              >
                {/* 1. LEFT SIDE: Info & CTA Card details */}
                <div className="flex-1 flex flex-col justify-between self-stretch py-0.5 gap-2 md:gap-3 select-none text-left min-w-0 pr-1 sm:pr-2">
                  <div className="space-y-2 md:space-y-3">
                    {/* Header title */}
                    <div className="space-y-0.5">
                      <h2 className={cn("text-sm md:text-xl font-bold font-hindi flex items-center gap-1 leading-tight", isDark ? "text-amber-100" : "text-[#2B1F18]")}>
                        <span className={cn("text-[10px] md:text-xs", isDark ? "text-amber-500/60" : "text-[#651317]/60")}>❈</span>
                        <span className="truncate">{isHi ? staticWp.nameHindi : staticWp.name}</span>
                        <span className={cn("text-[10px] md:text-xs", isDark ? "text-amber-500/60" : "text-[#651317]/60")}>❈</span>
                      </h2>
                      <p className={cn("text-[9px] md:text-xs font-sans flex items-center gap-1", isDark ? "text-amber-300/80" : "text-[#786252]")}>
                        <span>{getDeityEmoji(staticWp.deity)}</span>
                        <span className="font-extrabold uppercase tracking-wide">
                          {isHi ? getDeityHindi(staticWp.deity) : staticWp.deity}
                        </span>
                      </p>
                      {/* Integrated Swipe / Tap Instruction */}
                      <p className={cn("text-[9px] md:text-[10px] font-sans font-medium flex items-center gap-1 opacity-75 pt-0.5", isDark ? "text-amber-200/80" : "text-[#786252]")}>
                        <span>👆</span>
                        <span>{isHi ? "स्वाइप करें | पूर्ण स्क्रीन देखने के लिए टैप करें" : "Swipe | Tap screen to view full wallpaper"}</span>
                      </p>
                    </div>

                    {/* Toggle Pills Selection (Lock Screen vs Home Screen) */}
                    <div className={cn("flex border rounded-2xl p-1 max-w-[240px] select-none font-sans text-xs md:text-[13px] gap-1", isDark ? "bg-stone-950/60 border-amber-500/20" : "bg-[#F4EAD8]/60 border-[#EAD7C3]")}>
                      <button
                        type="button"
                        onClick={() => setPreviewMode("lock")}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl transition-all duration-200 cursor-pointer border text-xs md:text-[13px] font-semibold leading-none",
                          previewMode === "lock"
                            ? isDark
                              ? "bg-amber-500 border-amber-500 text-stone-950 shadow-sm"
                              : "bg-[#651317] border-[#651317] text-white shadow-sm"
                            : isDark
                              ? "bg-black/30 border-white/5 text-amber-200/70 hover:text-amber-200 hover:bg-black/50"
                              : "bg-[#F9F5EC] border-[#EAD7C3]/60 text-[#786252] hover:text-[#2B1F18] hover:bg-[#F4EAD8]"
                        )}
                      >
                        <Lock className="w-4 h-4 flex-shrink-0" />
                        <span>{isHi ? "लॉक स्क्रीन" : "Lock Screen"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewMode("home")}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl transition-all duration-200 cursor-pointer border text-xs md:text-[13px] font-semibold leading-none",
                          previewMode === "home"
                            ? isDark
                              ? "bg-amber-500 border-amber-500 text-stone-950 shadow-sm"
                              : "bg-[#651317] border-[#651317] text-white shadow-sm"
                            : isDark
                              ? "bg-black/30 border-white/5 text-amber-200/70 hover:text-amber-200 hover:bg-black/50"
                              : "bg-[#F9F5EC] border-[#EAD7C3]/60 text-[#786252] hover:text-[#2B1F18] hover:bg-[#F4EAD8]"
                        )}
                      >
                        <Smartphone className="w-4 h-4 flex-shrink-0" />
                        <span>{isHi ? "होम स्क्रीन" : "Home Screen"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Actions CTA buttons container at bottom */}
                  <div className="space-y-2 mt-2 md:mt-3 select-none">
                    {/* Download CTA Button */}
                    <button
                      type="button"
                      onClick={() => handleWallpaperDownload(staticWp, isHi)}
                      className={cn(
                        "w-full h-[46px] md:h-[50px] px-4 font-sans font-bold text-xs md:text-[13px] uppercase tracking-wider rounded-[18px] transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-2 focus:outline-none cursor-pointer border",
                        isDark
                          ? "bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-500 hover:to-orange-600 text-stone-950 shadow-[0_6px_20px_rgba(245,158,11,0.2)] border-amber-400/30"
                          : "bg-gradient-to-r from-[#651317] via-[#7D191E] to-[#651317] hover:from-[#7D191E] hover:to-[#651317] text-white shadow-[0_6px_20px_rgba(101,19,23,0.22)] border-[#651317]/20"
                      )}
                    >
                      <Download className={cn("w-[18px] h-[18px] flex-shrink-0", isDark ? "text-stone-950" : "text-white")} />
                      <span>{isHi ? "वॉलपेपर डाउनलोड करें" : "Download Wallpaper"}</span>
                    </button>

                    {/* Bottom Action Chips: Save, Share, Report */}
                    <div className="flex items-center gap-1.5 md:gap-2 select-none w-full">
                      {/* Chip 1: Save */}
                      <button
                        type="button"
                        onClick={() => onToggleLikeWallpaper(staticWp.id)}
                        className={cn(
                          "flex-1 h-[38px] md:h-[42px] px-2 md:px-3 border font-sans font-medium text-xs md:text-[13px] rounded-[14px] transition-all duration-200 active:scale-[0.96] flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.05)]",
                          isDark
                            ? "bg-[#18110b] border-amber-500/20 hover:border-amber-500/40 text-amber-300 hover:bg-[#221810]"
                            : "bg-[#FFFDF9] border-[#EAD7C3] hover:border-[#651317]/40 text-[#651317] hover:bg-[#FDF9F2]"
                        )}
                      >
                        <Heart
                          className={cn(
                            "w-[16px] h-[16px] md:w-[18px] md:h-[18px] flex-shrink-0 transition-colors",
                            likedWallpaperIds.includes(staticWp.id)
                              ? isDark
                                ? "fill-amber-500 text-amber-500"
                                : "fill-[#651317] text-[#651317]"
                              : isDark
                                ? "text-amber-400/80"
                                : "text-[#651317]/80"
                          )}
                        />
                        <span className="truncate">
                          {likedWallpaperIds.includes(staticWp.id)
                            ? (isHi ? "सहेजा गया" : "Saved")
                            : (isHi ? "सहेजें" : "Save")}
                        </span>
                      </button>

                      {/* Chip 2: Share */}
                      <button
                        type="button"
                        onClick={() =>
                          shareWallpaper({
                            url: staticWp.imageUrl,
                            title: staticWp.name,
                            text: staticWp.nameHindi,
                            isHi,
                          })
                        }
                        className={cn(
                          "flex-1 h-[38px] md:h-[42px] px-2 md:px-3 border font-sans font-medium text-xs md:text-[13px] rounded-[14px] transition-all duration-200 active:scale-[0.96] flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.05)]",
                          isDark
                            ? "bg-[#18110b] border-amber-500/20 hover:border-amber-500/40 text-amber-300 hover:bg-[#221810]"
                            : "bg-[#FFFDF9] border-[#EAD7C3] hover:border-[#651317]/40 text-[#651317] hover:bg-[#FDF9F2]"
                        )}
                      >
                        <Share2 className="w-[16px] h-[16px] md:w-[18px] md:h-[18px] flex-shrink-0 opacity-85" />
                        <span className="truncate">{isHi ? "साझा करें" : "Share"}</span>
                      </button>

                      {/* Chip 3: Report */}
                      <button
                        type="button"
                        onClick={() => setShowReportModal(true)}
                        className={cn(
                          "flex-1 h-[38px] md:h-[42px] px-2 md:px-3 border font-sans font-medium text-xs md:text-[13px] rounded-[14px] transition-all duration-200 active:scale-[0.96] flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.05)]",
                          isDark
                            ? "bg-[#18110b] border-amber-500/20 hover:border-amber-500/40 text-amber-300 hover:bg-[#221810]"
                            : "bg-[#FFFDF9] border-[#EAD7C3] hover:border-[#651317]/40 text-[#651317] hover:bg-[#FDF9F2]"
                        )}
                      >
                        <Flag className="w-[16px] h-[16px] md:w-[18px] md:h-[18px] flex-shrink-0 opacity-85" />
                        <span className="truncate">{isHi ? "रिपोर्ट" : "Report"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. RIGHT SIDE: Realistic Phone Mockup panel */}
                <div
                  className="flex-shrink-0 flex items-center justify-center relative cursor-grab active:cursor-grabbing pl-1 sm:pl-2"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEndStatic}
                >
                  <div className="relative z-30 transition-transform active:scale-[0.98] flex items-center justify-center py-0.5">
                    <PhoneFrame imageUrl={staticWp.imageUrl} previewMode={previewMode} isDark={isDark} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Hint Pill when card is hidden */}
          {!isCardVisibleInternal && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              onClick={toggleCardVisibility}
              className="fixed bottom-6 inset-x-0 flex justify-center items-center z-[135] pointer-events-auto cursor-pointer"
            >
              <div className={cn(
                "px-4 py-2 rounded-full border text-xs font-semibold font-sans flex items-center gap-2 shadow-2xl backdrop-blur-md transition-all active:scale-95",
                isDark
                  ? "bg-stone-950/85 border-amber-500/30 text-amber-200 hover:bg-stone-900"
                  : "bg-white/95 border-[#651317]/30 text-[#651317] hover:bg-white"
              )}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isHi ? "विवरण देखने के लिए टैप करें" : "Tap screen to show details"}</span>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* 2. Live Wallpaper Fullscreen Immersive Side-by-Side Modal */}
      {liveWp && (
        <>
          {/* Live Wallpaper Background (Crisp & Clear - NO BLUR) */}
          <div className="fixed inset-0 z-[121] select-none pointer-events-none overflow-hidden">
            <img
              src={liveWp.thumbnailUrl}
              alt={liveWp.name}
              className={cn(
                "w-full h-full object-cover scale-105 transition-all duration-300",
                isCardVisibleInternal
                  ? isDark ? "brightness-[0.45]" : "brightness-[0.75]"
                  : "brightness-100 scale-100 filter-none"
              )}
            />
          </div>

          {/* Click-to-toggle Screen Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCardVisibility}
            className={cn(
              "fixed inset-0 z-[122] select-none cursor-pointer transition-opacity duration-300",
              isCardVisibleInternal ? "bg-black/25 pointer-events-auto" : "bg-transparent pointer-events-auto"
            )}
          />

          {/* Top Bar Controls (Close X Button Only) */}
          <AnimatePresence>
            {isCardVisibleInternal && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="fixed top-5 left-5 z-[140] select-none pointer-events-auto"
              >
                <button
                  type="button"
                  onClick={onCloseModal}
                  className={cn(
                    "w-10 h-10 rounded-full border flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-lg",
                    isDark
                      ? "bg-black/60 border-white/10 text-white hover:bg-black/80"
                      : "bg-white/90 border-[#EAD7C3] text-[#651317] hover:bg-white"
                  )}
                >
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Bottom Card Box (Low Opacity White with fixed 10px bottom gap) */}
          <AnimatePresence>
            {isCardVisibleInternal && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 40 }}
                transition={{ type: "spring", damping: 25, stiffness: 185 }}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "fixed bottom-[calc(10px+env(safe-area-inset-bottom,0px))] left-3 right-3 sm:left-auto sm:right-auto w-[calc(100%-1.5rem)] sm:w-full sm:max-w-xl md:max-w-2xl mx-auto rounded-[1.8rem] md:rounded-[2rem] p-4 sm:p-5 md:p-6 z-[130] flex flex-row items-center justify-between gap-3 sm:gap-6 transition-colors duration-200 pointer-events-auto border shadow-xl",
                  isDark
                    ? "bg-stone-950/85 border-amber-500/20 text-stone-100 shadow-[0_10px_30px_rgba(0,0,0,0.85)]"
                    : "bg-white/85 border-[#EAD7C3] text-[#2B1F18] shadow-[0_10px_35px_rgba(84,61,43,0.14)]"
                )}
              >
                {/* 1. LEFT SIDE: Info & CTA Card details */}
                <div className="flex-1 flex flex-col justify-between self-stretch py-0.5 gap-2 md:gap-3 select-none text-left min-w-0 pr-1 sm:pr-2">
                  <div className="space-y-2 md:space-y-3">
                    {/* Header title */}
                    <div className="space-y-0.5">
                      <h2 className={cn("text-sm md:text-xl font-bold font-hindi flex items-center gap-1 leading-tight", isDark ? "text-amber-100" : "text-[#2B1F18]")}>
                        <span className={cn("text-[10px] md:text-xs", isDark ? "text-amber-500/60" : "text-[#651317]/60")}>❈</span>
                        <span className="truncate">{isHi ? liveWp.nameHindi : liveWp.name}</span>
                        <span className={cn("text-[10px] md:text-xs", isDark ? "text-amber-500/60" : "text-[#651317]/60")}>❈</span>
                      </h2>
                      <p className={cn("text-[9px] md:text-xs font-sans flex items-center gap-1", isDark ? "text-amber-300/80" : "text-[#786252]")}>
                        <span>{getDeityEmoji(liveWp.deity)}</span>
                        <span className="font-extrabold uppercase tracking-wide">
                          {isHi ? getDeityHindi(liveWp.deity) : liveWp.deity}
                        </span>
                        <span className={cn("px-1 py-0.2 md:py-0.5 rounded border text-[6px] md:text-[8px] font-sans font-bold uppercase tracking-widest leading-none scale-90", isDark ? "bg-[#fbbf24]/10 border-[#fbbf24]/30 text-[#fbbf24]" : "bg-[#651317]/10 border-[#651317]/30 text-[#651317]")}>
                          {liveWp.effect}
                        </span>
                      </p>
                      {/* Integrated Swipe / Tap Instruction */}
                      <p className={cn("text-[9px] md:text-[10px] font-sans font-medium flex items-center gap-1 opacity-75 pt-0.5", isDark ? "text-amber-200/80" : "text-[#786252]")}>
                        <span>👆</span>
                        <span>{isHi ? "स्वाइप करें | पूर्ण स्क्रीन देखने के लिए टैप करें" : "Swipe | Tap screen to view full wallpaper"}</span>
                      </p>
                    </div>

                    {/* Toggle Pills Selection (Lock Screen vs Home Screen) */}
                    <div className={cn("flex border rounded-2xl p-1 max-w-[240px] select-none font-sans text-xs md:text-[13px] gap-1", isDark ? "bg-stone-950/60 border-amber-500/20" : "bg-[#F4EAD8]/60 border-[#EAD7C3]")}>
                      <button
                        type="button"
                        onClick={() => setPreviewMode("lock")}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl transition-all duration-200 cursor-pointer border text-xs md:text-[13px] font-semibold leading-none",
                          previewMode === "lock"
                            ? isDark
                              ? "bg-amber-500 border-amber-500 text-stone-950 shadow-sm"
                              : "bg-[#651317] border-[#651317] text-white shadow-sm"
                            : isDark
                              ? "bg-black/30 border-white/5 text-amber-200/70 hover:text-amber-200 hover:bg-black/50"
                              : "bg-[#F9F5EC] border-[#EAD7C3]/60 text-[#786252] hover:text-[#2B1F18] hover:bg-[#F4EAD8]"
                        )}
                      >
                        <Lock className="w-4 h-4 flex-shrink-0" />
                        <span>{isHi ? "लॉक स्क्रीन" : "Lock Screen"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewMode("home")}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl transition-all duration-200 cursor-pointer border text-xs md:text-[13px] font-semibold leading-none",
                          previewMode === "home"
                            ? isDark
                              ? "bg-amber-500 border-amber-500 text-stone-950 shadow-sm"
                              : "bg-[#651317] border-[#651317] text-white shadow-sm"
                            : isDark
                              ? "bg-black/30 border-white/5 text-amber-200/70 hover:text-amber-200 hover:bg-black/50"
                              : "bg-[#F9F5EC] border-[#EAD7C3]/60 text-[#786252] hover:text-[#2B1F18] hover:bg-[#F4EAD8]"
                        )}
                      >
                        <Smartphone className="w-4 h-4 flex-shrink-0" />
                        <span>{isHi ? "होम स्क्रीन" : "Home Screen"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Actions CTA buttons container at bottom */}
                  <div className="space-y-2 mt-2 md:mt-3 select-none">
                    {/* Download CTA Button */}
                    <button
                      type="button"
                      onClick={() => handleLiveWallpaperDownload(liveWp, isHi)}
                      className={cn(
                        "w-full h-[46px] md:h-[50px] px-4 font-sans font-bold text-xs md:text-[13px] uppercase tracking-wider rounded-[18px] transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-2 focus:outline-none cursor-pointer border",
                        isDark
                          ? "bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-500 hover:to-orange-600 text-stone-950 shadow-[0_6px_20px_rgba(245,158,11,0.2)] border-amber-400/30"
                          : "bg-gradient-to-r from-[#651317] via-[#7D191E] to-[#651317] hover:from-[#7D191E] hover:to-[#651317] text-white shadow-[0_6px_20px_rgba(101,19,23,0.22)] border-[#651317]/20"
                      )}
                    >
                      <CustomDownloadIcon className={cn("w-[18px] h-[18px] flex-shrink-0", isDark ? "text-stone-950" : "text-white")} />
                      <span>{isHi ? "सजीव वॉलपेपर डाउनलोड करें" : "Download Live Wallpaper"}</span>
                    </button>

                    {/* Bottom Action Chips: Save, Share, Report */}
                    <div className="flex items-center gap-1.5 md:gap-2 select-none w-full">
                      {/* Chip 1: Save */}
                      <button
                        type="button"
                        onClick={() => onToggleLikeWallpaper(liveWp.id)}
                        className={cn(
                          "flex-1 h-[38px] md:h-[42px] px-2 md:px-3 border font-sans font-medium text-xs md:text-[13px] rounded-[14px] transition-all duration-200 active:scale-[0.96] flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.05)]",
                          isDark
                            ? "bg-[#18110b] border-amber-500/20 hover:border-amber-500/40 text-amber-300 hover:bg-[#221810]"
                            : "bg-[#FFFDF9] border-[#EAD7C3] hover:border-[#651317]/40 text-[#651317] hover:bg-[#FDF9F2]"
                        )}
                      >
                        <Heart
                          className={cn(
                            "w-[16px] h-[16px] md:w-[18px] md:h-[18px] flex-shrink-0 transition-colors",
                            likedWallpaperIds.includes(liveWp.id)
                              ? isDark
                                ? "fill-amber-500 text-amber-500"
                                : "fill-[#651317] text-[#651317]"
                              : isDark
                                ? "text-amber-400/80"
                                : "text-[#651317]/80"
                          )}
                        />
                        <span className="truncate">
                          {likedWallpaperIds.includes(liveWp.id)
                            ? (isHi ? "सहेजा गया" : "Saved")
                            : (isHi ? "सहेजें" : "Save")}
                        </span>
                      </button>

                      {/* Chip 2: Share */}
                      <button
                        type="button"
                        onClick={() =>
                          shareWallpaper({
                            url: liveWp.thumbnailUrl,
                            title: liveWp.name,
                            text: liveWp.nameHindi,
                            isHi,
                          })
                        }
                        className={cn(
                          "flex-1 h-[38px] md:h-[42px] px-2 md:px-3 border font-sans font-medium text-xs md:text-[13px] rounded-[14px] transition-all duration-200 active:scale-[0.96] flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.05)]",
                          isDark
                            ? "bg-[#18110b] border-amber-500/20 hover:border-amber-500/40 text-amber-300 hover:bg-[#221810]"
                            : "bg-[#FFFDF9] border-[#EAD7C3] hover:border-[#651317]/40 text-[#651317] hover:bg-[#FDF9F2]"
                        )}
                      >
                        <Share2 className="w-[16px] h-[16px] md:w-[18px] md:h-[18px] flex-shrink-0 opacity-85" />
                        <span className="truncate">{isHi ? "साझा करें" : "Share"}</span>
                      </button>

                      {/* Chip 3: Report */}
                      <button
                        type="button"
                        onClick={() => setShowReportModal(true)}
                        className={cn(
                          "flex-1 h-[38px] md:h-[42px] px-2 md:px-3 border font-sans font-medium text-xs md:text-[13px] rounded-[14px] transition-all duration-200 active:scale-[0.96] flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.05)]",
                          isDark
                            ? "bg-[#18110b] border-amber-500/20 hover:border-amber-500/40 text-amber-300 hover:bg-[#221810]"
                            : "bg-[#FFFDF9] border-[#EAD7C3] hover:border-[#651317]/40 text-[#651317] hover:bg-[#FDF9F2]"
                        )}
                      >
                        <Flag className="w-[16px] h-[16px] md:w-[18px] md:h-[18px] flex-shrink-0 opacity-85" />
                        <span className="truncate">{isHi ? "रिपोर्ट" : "Report"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. RIGHT SIDE: Realistic Phone Mockup panel */}
                <div
                  className="flex-shrink-0 flex items-center justify-center relative cursor-grab active:cursor-grabbing pl-1 sm:pl-2"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEndLive}
                >
                  <div className="relative z-30 transition-transform active:scale-[0.98] flex items-center justify-center py-0.5">
                    <PhoneFrame imageUrl={liveWp.thumbnailUrl} previewMode={previewMode} effect={liveWp.effect} isDark={isDark} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Hint Pill when card is hidden */}
          {!isCardVisibleInternal && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              onClick={toggleCardVisibility}
              className="fixed bottom-6 inset-x-0 flex justify-center items-center z-[135] pointer-events-auto cursor-pointer"
            >
              <div className={cn(
                "px-4 py-2 rounded-full border text-xs font-semibold font-sans flex items-center gap-2 shadow-2xl backdrop-blur-md transition-all active:scale-95",
                isDark
                  ? "bg-stone-950/85 border-amber-500/30 text-amber-200 hover:bg-stone-900"
                  : "bg-white/95 border-[#651317]/30 text-[#651317] hover:bg-white"
              )}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isHi ? "विवरण देखने के लिए टैप करें" : "Tap screen to show details"}</span>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Interactive Report Reasons Dialog Modal */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "w-full max-w-sm rounded-2xl p-5 border shadow-2xl space-y-4 text-left",
                isDark ? "bg-[#18110b] border-amber-500/30 text-amber-100" : "bg-[#FFFDF9] border-[#EAD7C3] text-[#2B1F18]"
              )}
            >
              <div className="flex justify-between items-center border-b pb-3 border-amber-500/20">
                <h3 className="font-bold text-base font-hindi flex items-center gap-2">
                  <Flag className="w-4 h-4 text-[#651317] dark:text-amber-400" />
                  <span>{isHi ? "रिपोर्ट दर्ज करें" : "Report Wallpaper"}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs opacity-85 font-sans">
                {isHi ? "कृपया इस वॉलपेपर की रिपोर्ट करने का कारण चुनें:" : "Please select a reason for reporting this wallpaper:"}
              </p>

              <div className="space-y-2 font-sans">
                {[
                  { id: "quality", hi: "📸 कम गुणवत्ता / धुंधली छवि", en: "📸 Low quality or blurry image" },
                  { id: "category", hi: "🏷️ गलत देवी/देवता श्रेणी", en: "🏷️ Incorrect deity/category" },
                  { id: "inappropriate", hi: "⚠️ अनुपयुक्त सामग्री", en: "⚠️ Inappropriate content" },
                  { id: "other", hi: "⚡ अन्य समस्या", en: "⚡ Other technical issue" }
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setReportReason(option.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer",
                      reportReason === option.id
                        ? isDark ? "bg-amber-500/20 border-amber-400 text-amber-200 font-bold" : "bg-[#651317]/10 border-[#651317] text-[#651317] font-bold"
                        : isDark ? "bg-black/40 border-white/10 opacity-80 hover:opacity-100" : "bg-white border-[#EAD7C3] opacity-80 hover:opacity-100"
                    )}
                  >
                    <span>{isHi ? option.hi : option.en}</span>
                    {reportReason === option.id && <Check className="w-4 h-4 text-[#651317] dark:text-amber-400" />}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-2 font-sans">
                <button
                  type="button"
                  onClick={() => {
                    setShowReportModal(false);
                    setReportReason("");
                  }}
                  className="flex-1 py-2.5 rounded-xl border text-xs font-semibold border-stone-300 dark:border-stone-700 cursor-pointer"
                >
                  {isHi ? "रद्द करें" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!reportReason) {
                      toast.error(isHi ? "कृपया एक कारण चुनें" : "Please select a reason");
                      return;
                    }
                    toast.success(isHi ? "रिपोर्ट जमा की गई, धन्यवाद!" : "Report submitted successfully, thank you!");
                    setShowReportModal(false);
                    setReportReason("");
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#651317] dark:bg-amber-500 text-white dark:text-stone-950 font-bold text-xs shadow-md cursor-pointer"
                >
                  {isHi ? "जमा करें" : "Submit"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
});

WallpaperPreviewModal.displayName = "WallpaperPreviewModal";
