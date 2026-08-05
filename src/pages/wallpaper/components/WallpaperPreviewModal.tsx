import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Share2, Download, Heart, Lock, Smartphone } from "lucide-react";
import { PhoneFrame, MoreIcon, CustomDownloadIcon } from "@/pages/Blessings";
import { WALLPAPERS_LIST, LIVE_WALLPAPERS_LIST } from "@/pages/Blessings/constants";
import type { PreviewMode } from "../types";
import { shareWallpaper } from "../utils/share";
import { handleWallpaperDownload, handleLiveWallpaperDownload } from "../utils/download";

export interface WallpaperPreviewModalProps {
  isDark: boolean;
  isHi: boolean;
  showPreviewModal: string | null;
  showLivePreviewModal: string | null;
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
  showLivePreviewModal,
  previewMode,
  setPreviewMode,
  likedWallpaperIds,
  onToggleLikeWallpaper,
  onCloseModal,
}) => {
  const staticWp = showPreviewModal
    ? WALLPAPERS_LIST.find((w) => w.id === showPreviewModal)
    : null;
  const liveWp = showLivePreviewModal
    ? LIVE_WALLPAPERS_LIST.find((w) => w.id === showLivePreviewModal)
    : null;

  if (!staticWp && !liveWp) return null;

  return (
    <AnimatePresence>
      {/* 1. Static Wallpaper Fullscreen Immersive Side-by-Side Modal */}
      {staticWp && (
        <>
          {/* Fullscreen Wallpaper Background (dimmed) */}
          <div className="fixed inset-0 z-[121] select-none pointer-events-none overflow-hidden">
            <img
              src={staticWp.imageUrl}
              alt=""
              className="w-full h-full object-cover scale-105 filter brightness-[0.35] transition-all duration-300"
            />
          </div>

          {/* Click-to-close Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseModal}
            className="fixed inset-0 bg-black/30 backdrop-blur-xs z-[122] select-none cursor-pointer"
          />

          {/* Top Bar Controls */}
          <div className="fixed top-5 inset-x-5 flex justify-between items-center z-[140] select-none">
            <button
              onClick={onCloseModal}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  shareWallpaper({
                    url: staticWp.imageUrl,
                    title: staticWp.name,
                    text: staticWp.nameHindi,
                    isHi,
                  })
                }
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors cursor-pointer"
              >
                <Share2 className="w-4.5 h-4.5" />
              </button>
              <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors cursor-pointer">
                <MoreIcon className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Side-by-side Floating Glass Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 185 }}
            className="fixed bottom-[10%] left-[4%] right-[4%] max-w-sm md:max-w-2xl mx-auto bg-[#130b07]/80 backdrop-blur-xl border border-amber-500/20 rounded-[2rem] p-4 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-[130] flex flex-row items-center justify-between overflow-visible"
          >
            {/* 1. LEFT SIDE: Info & CTA Card details */}
            <div className="w-[55%] flex flex-col justify-between self-stretch py-1 gap-2.5 md:gap-4 select-none text-left">
              <div className="space-y-3.5 md:space-y-5">
                {/* Header title */}
                <div className="space-y-1">
                  <h2 className="text-sm md:text-xl font-bold font-hindi text-amber-100 flex items-center gap-1 leading-tight">
                    <span className="text-amber-500/60 text-[10px] md:text-xs">❈</span>
                    <span className="truncate">{isHi ? staticWp.nameHindi : staticWp.name}</span>
                    <span className="text-amber-500/60 text-[10px] md:text-xs">❈</span>
                  </h2>
                  <p className="text-[9px] md:text-xs text-amber-300/80 font-sans flex items-center gap-1">
                    <span>{getDeityEmoji(staticWp.deity)}</span>
                    <span className="font-extrabold uppercase tracking-wide">
                      {isHi ? getDeityHindi(staticWp.deity) : staticWp.deity}
                    </span>
                  </p>
                </div>

                {/* Separator */}
                <div className="flex items-center gap-1.5 opacity-40 select-none">
                  <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-amber-500" />
                  <div className="w-1 h-1 rotate-45 bg-amber-400" />
                  <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-amber-500" />
                </div>

                {/* Toggle Pills Selection (Home screen vs Lock screen) */}
                <div className="flex bg-black/50 border border-amber-950/60 rounded-full p-0.5 max-w-[240px] select-none font-sans text-[10px] md:text-xs">
                  <button
                    onClick={() => setPreviewMode("lock")}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 md:px-3.5 rounded-full transition-all cursor-pointer border ${
                      previewMode === "lock"
                        ? "bg-amber-500/10 border-amber-500/40 text-amber-300 font-bold shadow-md"
                        : "bg-transparent border-transparent text-amber-200/50 hover:text-amber-200"
                    }`}
                  >
                    <Lock className="w-3 h-3" />
                    <span>{isHi ? "लॉक स्क्रीन" : "Lock Screen"}</span>
                  </button>
                  <button
                    onClick={() => setPreviewMode("home")}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 md:px-3.5 rounded-full transition-all cursor-pointer border ${
                      previewMode === "home"
                        ? "bg-amber-500/10 border-amber-500/40 text-amber-300 font-bold shadow-md"
                        : "bg-transparent border-transparent text-amber-200/50 hover:text-amber-200"
                    }`}
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>{isHi ? "होम स्क्रीन" : "Home Screen"}</span>
                  </button>
                </div>
              </div>

              {/* Actions CTA buttons container at bottom */}
              <div className="space-y-2 mt-4 md:mt-0 select-none">
                <button
                  onClick={() => handleWallpaperDownload(staticWp, isHi)}
                  className="w-full py-2.5 md:py-3.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-500 hover:to-orange-600 text-stone-950 font-sans font-black text-[9px] md:text-xs uppercase tracking-widest rounded-xl md:rounded-2xl transition-all active:scale-[0.96] flex items-center justify-center gap-1.5 focus:outline-none shadow-[0_4px_12px_rgba(245,158,11,0.25)] border border-amber-400/20 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-stone-950" />
                  <span>{isHi ? "वॉलपेपर डाउनलोड करें" : "Download Wallpaper"}</span>
                </button>

                <button
                  onClick={() => onToggleLikeWallpaper(staticWp.id)}
                  className="w-full py-2 md:py-3 border border-amber-500/30 hover:border-amber-500/50 bg-black/30 hover:bg-black/50 text-amber-400 font-sans font-black text-[9px] md:text-xs uppercase tracking-widest rounded-xl md:rounded-2xl transition-all active:scale-[0.96] flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer"
                >
                  <Heart className={`w-4 h-4 ${likedWallpaperIds.includes(staticWp.id) ? "fill-amber-500 text-amber-500" : "text-amber-400"}`} />
                  <span>
                    {likedWallpaperIds.includes(staticWp.id)
                      ? (isHi ? "संग्रह में सहेजा गया" : "Saved to Collection")
                      : (isHi ? "संग्रह में सहेजें" : "Save to Collection")}
                  </span>
                </button>
              </div>
            </div>

            {/* 2. RIGHT SIDE: Realistic Phone Mockup panel */}
            <div className="w-[42%] flex items-center justify-center relative overflow-visible self-stretch">
              <div className="absolute -top-14 md:-top-24 z-30 transition-transform active:scale-[0.98]">
                <PhoneFrame imageUrl={staticWp.imageUrl} previewMode={previewMode} />
              </div>
            </div>
          </motion.div>

          {/* Swipe Help instruction at absolute bottom */}
          <div className="fixed bottom-4 inset-x-0 flex items-center justify-center gap-1 text-[9px] uppercase tracking-widest font-sans text-amber-200/55 pointer-events-none select-none z-[131]">
            <span className="text-amber-500/60">❈</span>
            <span>👆 {isHi ? "स्वाइप करें और वॉलपेपर देखें" : "Swipe to change"}</span>
            <span className="text-amber-500/60">❈</span>
          </div>
        </>
      )}

      {/* 2. Live Wallpaper Fullscreen Immersive Side-by-Side Modal */}
      {liveWp && (
        <>
          {/* Live Wallpaper Background (dimmed) */}
          <div className="fixed inset-0 z-[121] select-none pointer-events-none overflow-hidden">
            <img
              src={liveWp.thumbnailUrl}
              alt=""
              className="w-full h-full object-cover scale-105 filter brightness-[0.35] transition-all duration-300"
            />
          </div>

          {/* Click-to-close Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseModal}
            className="fixed inset-0 bg-black/30 backdrop-blur-xs z-[122] select-none cursor-pointer"
          />

          {/* Top Bar Controls */}
          <div className="fixed top-5 inset-x-5 flex justify-between items-center z-[140] select-none">
            <button
              onClick={onCloseModal}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  shareWallpaper({
                    url: liveWp.thumbnailUrl,
                    title: liveWp.name,
                    text: liveWp.nameHindi,
                    isHi,
                  })
                }
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors cursor-pointer"
              >
                <Share2 className="w-4.5 h-4.5" />
              </button>
              <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors cursor-pointer">
                <MoreIcon className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Side-by-side Floating Glass Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 185 }}
            className="fixed bottom-[10%] left-[4%] right-[4%] max-w-sm md:max-w-2xl mx-auto bg-[#130b07]/80 backdrop-blur-xl border border-amber-500/20 rounded-[2rem] p-4 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-[130] flex flex-row items-center justify-between overflow-visible"
          >
            {/* 1. LEFT SIDE: Info & CTA Card details */}
            <div className="w-[55%] flex flex-col justify-between self-stretch py-1 gap-2.5 md:gap-4 select-none text-left">
              <div className="space-y-3.5 md:space-y-5">
                {/* Header title */}
                <div className="space-y-1">
                  <h2 className="text-sm md:text-xl font-bold font-hindi text-amber-100 flex items-center gap-1 leading-tight">
                    <span className="text-amber-500/60 text-[10px] md:text-xs">❈</span>
                    <span className="truncate">{isHi ? liveWp.nameHindi : liveWp.name}</span>
                    <span className="text-amber-500/60 text-[10px] md:text-xs">❈</span>
                  </h2>
                  <p className="text-[9px] md:text-xs text-amber-300/80 font-sans flex items-center gap-1">
                    <span>{getDeityEmoji(liveWp.deity)}</span>
                    <span className="font-extrabold uppercase tracking-wide">
                      {isHi ? getDeityHindi(liveWp.deity) : liveWp.deity}
                    </span>
                    <span className="px-1 py-0.2 md:py-0.5 rounded bg-[#fbbf24]/10 border border-[#fbbf24]/30 text-[#fbbf24] text-[6px] md:text-[8px] font-sans font-bold uppercase tracking-widest leading-none scale-90">
                      {liveWp.effect}
                    </span>
                  </p>
                </div>

                {/* Separator */}
                <div className="flex items-center gap-1.5 opacity-40 select-none">
                  <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-amber-500" />
                  <div className="w-1 h-1 rotate-45 bg-amber-400" />
                  <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-amber-500" />
                </div>

                {/* Toggle Pills Selection (Home screen vs Lock screen) */}
                <div className="flex bg-black/50 border border-amber-950/60 rounded-full p-0.5 max-w-[240px] select-none font-sans text-[10px] md:text-xs">
                  <button
                    onClick={() => setPreviewMode("lock")}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 md:px-3.5 rounded-full transition-all cursor-pointer border ${
                      previewMode === "lock"
                        ? "bg-amber-500/10 border-amber-500/40 text-amber-300 font-bold shadow-md"
                        : "bg-transparent border-transparent text-amber-200/50 hover:text-amber-200"
                    }`}
                  >
                    <Lock className="w-3 h-3" />
                    <span>{isHi ? "लॉक स्क्रीन" : "Lock Screen"}</span>
                  </button>
                  <button
                    onClick={() => setPreviewMode("home")}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 md:px-3.5 rounded-full transition-all cursor-pointer border ${
                      previewMode === "home"
                        ? "bg-amber-500/10 border-amber-500/40 text-amber-300 font-bold shadow-md"
                        : "bg-transparent border-transparent text-amber-200/50 hover:text-amber-200"
                    }`}
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>{isHi ? "होम स्क्रीन" : "Home Screen"}</span>
                  </button>
                </div>
              </div>

              {/* Actions CTA buttons container at bottom */}
              <div className="space-y-2 mt-4 md:mt-0 select-none">
                <button
                  onClick={() => handleLiveWallpaperDownload(liveWp, isHi)}
                  className="w-full py-2.5 md:py-3.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-500 hover:to-orange-600 text-stone-950 font-sans font-black text-[9px] md:text-xs uppercase tracking-widest rounded-xl md:rounded-2xl transition-all active:scale-[0.96] flex items-center justify-center gap-1.5 focus:outline-none shadow-[0_4px_12px_rgba(245,158,11,0.25)] border border-amber-400/20 cursor-pointer"
                >
                  <CustomDownloadIcon className="w-4 h-4 text-stone-950" />
                  <span>{isHi ? "सजीव वॉलपेपर डाउनलोड करें" : "Download Live"}</span>
                </button>

                <button
                  onClick={() => onToggleLikeWallpaper(liveWp.id)}
                  className="w-full py-2 md:py-3 border border-amber-500/30 hover:border-amber-500/50 bg-black/30 hover:bg-black/50 text-amber-400 font-sans font-black text-[9px] md:text-xs uppercase tracking-widest rounded-xl md:rounded-2xl transition-all active:scale-[0.96] flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer"
                >
                  <Heart className={`w-4 h-4 ${likedWallpaperIds.includes(liveWp.id) ? "fill-amber-500 text-amber-500" : "text-amber-400"}`} />
                  <span>
                    {likedWallpaperIds.includes(liveWp.id)
                      ? (isHi ? "संग्रह में सहेजा गया" : "Saved to Collection")
                      : (isHi ? "संग्रह में सहेजें" : "Save to Collection")}
                  </span>
                </button>
              </div>
            </div>

            {/* 2. RIGHT SIDE: Phone Mockup panel */}
            <div className="w-[42%] flex items-center justify-center relative overflow-visible self-stretch">
              <div className="absolute -top-14 md:-top-24 z-30 transition-transform active:scale-[0.98]">
                <PhoneFrame imageUrl={liveWp.thumbnailUrl} previewMode={previewMode} effect={liveWp.effect} />
              </div>
            </div>
          </motion.div>

          {/* Swipe Help instruction at absolute bottom */}
          <div className="fixed bottom-4 inset-x-0 flex items-center justify-center gap-1 text-[9px] uppercase tracking-widest font-sans text-amber-200/55 pointer-events-none select-none z-[131]">
            <span className="text-amber-500/60">❈</span>
            <span>👆 {isHi ? "स्वाइप करें और वॉलपेपर देखें" : "Swipe to change"}</span>
            <span className="text-amber-500/60">❈</span>
          </div>
        </>
      )}
    </AnimatePresence>
  );
});

WallpaperPreviewModal.displayName = "WallpaperPreviewModal";
