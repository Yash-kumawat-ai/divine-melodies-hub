import React, { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, X, Share2, Download, Heart, Lock, Smartphone, Flag, Sparkles, Check, Mail, PhoneCall, Copy, Link, Maximize2, Eye } from "lucide-react";
import { toast } from "sonner";
import { PhoneFrame, CustomDownloadIcon } from "@/pages/Blessings";
import { WALLPAPERS_LIST, LIVE_WALLPAPERS_LIST } from "@/pages/Blessings/constants";
import type { PreviewMode } from "../types";
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
  const [isCardVisibleInternal, setIsCardVisibleInternal] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportContactInput, setReportContactInput] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  // Swipe state — only for phone box
  const phoneBoxTouchStartX = useRef<number | null>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    const isModalOpen = !!(showPreviewModal || showLivePreviewModal);
    if (!isModalOpen) return;
    if (typeof document !== "undefined") {
      const orig = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = orig;
        document.documentElement.style.overflow = orig;
      };
    }
  }, [showPreviewModal, showLivePreviewModal]);

  const staticWp = showPreviewModal
    ? WALLPAPERS_LIST.find((w) => w.id === showPreviewModal)
    : null;
  const liveWp = showLivePreviewModal
    ? LIVE_WALLPAPERS_LIST.find((w) => w.id === showLivePreviewModal)
    : null;

  if (!staticWp && !liveWp) return null;

  const toggleCardVisibility = () => setIsCardVisibleInternal((prev) => !prev);

  // ─── Phone-box-only touch swipe handlers ─────────────────────────────────
  const handlePhoneTouchStart = (e: React.TouchEvent) => {
    phoneBoxTouchStartX.current = e.touches[0].clientX;
    e.stopPropagation();
  };

  const handlePhoneTouchEndStatic = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (phoneBoxTouchStartX.current === null || !setShowPreviewModal || !staticWp) return;
    const diff = phoneBoxTouchStartX.current - e.changedTouches[0].clientX;
    phoneBoxTouchStartX.current = null;
    if (Math.abs(diff) > 40) {
      const idx = WALLPAPERS_LIST.findIndex((w) => w.id === staticWp.id);
      if (idx === -1) return;
      if (diff > 0) setShowPreviewModal(WALLPAPERS_LIST[(idx + 1) % WALLPAPERS_LIST.length].id);
      else setShowPreviewModal(WALLPAPERS_LIST[(idx - 1 + WALLPAPERS_LIST.length) % WALLPAPERS_LIST.length].id);
    }
  };

  const handlePhoneTouchEndLive = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (phoneBoxTouchStartX.current === null || !setShowLivePreviewModal || !liveWp) return;
    const diff = phoneBoxTouchStartX.current - e.changedTouches[0].clientX;
    phoneBoxTouchStartX.current = null;
    if (Math.abs(diff) > 40) {
      const idx = LIVE_WALLPAPERS_LIST.findIndex((w) => w.id === liveWp.id);
      if (idx === -1) return;
      if (diff > 0) setShowLivePreviewModal(LIVE_WALLPAPERS_LIST[(idx + 1) % LIVE_WALLPAPERS_LIST.length].id);
      else setShowLivePreviewModal(LIVE_WALLPAPERS_LIST[(idx - 1 + LIVE_WALLPAPERS_LIST.length) % LIVE_WALLPAPERS_LIST.length].id);
    }
  };

  // ─── Share helpers ────────────────────────────────────────────────────────
  const currentName = staticWp?.name ?? liveWp?.name ?? "Wallpaper";
  const currentNameHindi = staticWp?.nameHindi ?? liveWp?.nameHindi ?? "";
  const currentImageUrl = staticWp?.imageUrl ?? liveWp?.thumbnailUrl ?? "";
  const absoluteUrl = currentImageUrl.startsWith("http")
    ? currentImageUrl
    : `${window.location.origin}${currentImageUrl.startsWith("/") ? "" : "/"}${currentImageUrl}`;
  const shareText = `${isHi ? currentNameHindi : currentName} — ${absoluteUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      toast.success(isHi ? "लिंक कॉपी हो गया!" : "Link copied!");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = absoluteUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      toast.success(isHi ? "लिंक कॉपी हो गया!" : "Link copied!");
    }
    setShowShareModal(false);
  };

  const handleWhatsAppShare = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank", "noopener,noreferrer");
    setShowShareModal(false);
  };

  const handleTelegramShare = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(absoluteUrl)}&text=${encodeURIComponent(isHi ? currentNameHindi : currentName)}`, "_blank", "noopener,noreferrer");
    setShowShareModal(false);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: currentName, text: currentNameHindi, url: absoluteUrl });
        setShowShareModal(false);
      } catch (err: unknown) {
        if ((err as { name?: string })?.name !== "AbortError") {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  // ─── Shared action button classes ─────────────────────────────────────────
  const chipCls = cn(
    "w-full h-[38px] md:h-[42px] px-2 md:px-3 border font-sans font-medium text-xs md:text-[13px] rounded-[14px] transition-all duration-200 active:scale-[0.96] flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.05)] min-w-0",
    isDark
      ? "bg-[#18110b] border-amber-500/20 hover:border-amber-500/40 text-amber-300 hover:bg-[#221810]"
      : "bg-[#FFFDF9] border-[#EAD7C3] hover:border-[#651317]/40 text-[#651317] hover:bg-[#FDF9F2]"
  );

  // ─── Common card layout renderer ──────────────────────────────────────────
  const renderBottomCard = (
    wp: { id: string; name: string; nameHindi: string; deity: string },
    imageUrl: string,
    isLive: boolean,
    onDownload: () => void,
    onPhoneTouchStart: (e: React.TouchEvent) => void,
    onPhoneTouchEnd: (e: React.TouchEvent) => void,
    extraBadge?: React.ReactNode
  ) => (
    <motion.div
      key="bottom-card"
      initial={{ opacity: 0, scale: 0.96, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 40 }}
      transition={{ type: "spring", damping: 25, stiffness: 185 }}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "fixed bottom-[calc(10px+env(safe-area-inset-bottom,0px))] left-3 right-3 sm:left-auto sm:right-auto w-[calc(100%-1.5rem)] sm:w-full sm:max-w-xl md:max-w-2xl mx-auto rounded-[1.8rem] md:rounded-[2rem] p-4 sm:p-5 md:p-6 z-[190] flex flex-row items-center justify-between gap-3 sm:gap-6 transition-colors duration-200 pointer-events-auto border shadow-xl",
        isDark
          ? "bg-stone-950/85 border-amber-500/20 text-stone-100 shadow-[0_10px_30px_rgba(0,0,0,0.85)]"
          : "bg-white/85 border-[#EAD7C3] text-[#2B1F18] shadow-[0_10px_30px_rgba(84,61,43,0.14)]"
      )}
    >
      {/* LEFT: Info & CTA */}
      <div className="flex-1 flex flex-col justify-center md:justify-between md:self-stretch py-0.5 md:py-2 gap-2.5 sm:gap-3.5 md:gap-4 select-none text-left min-w-0 pr-1 sm:pr-2">
        {/* Top Info */}
        <div className="space-y-1.5 sm:space-y-2 md:space-y-3">
          <h2 className={cn("text-base sm:text-lg md:text-2xl font-bold font-hindi flex items-center gap-1.5 md:gap-2 leading-snug md:leading-normal", isDark ? "text-amber-100" : "text-[#2B1F18]")}>
            <span className={cn("text-xs md:text-sm shrink-0", isDark ? "text-amber-500/60" : "text-[#651317]/60")}>❈</span>
            <span className="truncate min-w-0">{isHi ? wp.nameHindi : wp.name}</span>
            <span className={cn("text-xs md:text-sm shrink-0", isDark ? "text-amber-500/60" : "text-[#651317]/60")}>❈</span>
          </h2>
          <div className="space-y-1 md:space-y-1.5">
            <p className={cn("text-xs md:text-sm font-sans flex items-center gap-1.5 md:gap-2 leading-normal", isDark ? "text-amber-300/80" : "text-[#786252]")}>
              <span>{getDeityEmoji(wp.deity)}</span>
              <span className="font-extrabold uppercase tracking-wide">{isHi ? getDeityHindi(wp.deity) : wp.deity}</span>
              {extraBadge}
            </p>
            <p className={cn("text-[10px] sm:text-xs md:text-xs font-sans font-medium flex items-center gap-1.5 opacity-80 leading-normal", isDark ? "text-amber-200/80" : "text-[#786252]")}>
              <span>👆</span>
              <span className="truncate">{isHi ? "फोन पर स्वाइप करें | स्क्रीन टैप करें" : "Swipe phone box | Tap screen"}</span>
            </p>
          </div>
        </div>

        {/* Lock/Home toggle */}
        <div className={cn("flex border rounded-2xl p-1 select-none font-sans gap-1 w-full md:max-w-xs", isDark ? "bg-stone-950/60 border-amber-500/20" : "bg-[#F4EAD8]/60 border-[#EAD7C3]")}>
          {(["lock", "home"] as PreviewMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setPreviewMode(mode)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 md:py-2 px-2.5 md:px-4 rounded-xl transition-all duration-200 cursor-pointer border text-xs sm:text-xs md:text-sm font-semibold leading-normal min-w-0 h-8 md:h-10",
                previewMode === mode
                  ? isDark ? "bg-amber-500 border-amber-500 text-stone-950 shadow-sm" : "bg-[#651317] border-[#651317] text-white shadow-sm"
                  : isDark ? "bg-black/30 border-white/5 text-amber-200/70 hover:text-amber-200 hover:bg-black/50" : "bg-[#F9F5EC] border-[#EAD7C3]/60 text-[#786252] hover:text-[#2B1F18] hover:bg-[#F4EAD8]"
              )}
            >
              {mode === "lock" ? <Lock className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" /> : <Smartphone className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />}
              <span className="truncate shrink min-w-0">{isHi ? (mode === "lock" ? "लॉक स्क्रीन" : "होम स्क्रीन") : (mode === "lock" ? "Lock Screen" : "Home Screen")}</span>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-2 md:space-y-3 select-none">
          <button
            type="button"
            onClick={onDownload}
            className={cn(
              "w-full h-[44px] sm:h-[48px] md:h-[52px] px-4 font-sans font-bold text-xs sm:text-[13px] md:text-sm uppercase tracking-wider rounded-[16px] md:rounded-[18px] transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-2 focus:outline-none cursor-pointer border",
              isDark
                ? "bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-500 hover:to-orange-600 text-stone-950 shadow-[0_6px_20px_rgba(245,158,11,0.2)] border-amber-400/30"
                : "bg-gradient-to-r from-[#651317] via-[#7D191E] to-[#651317] hover:from-[#7D191E] hover:to-[#651317] text-white shadow-[0_6px_20px_rgba(101,19,23,0.22)] border-[#651317]/20"
            )}
          >
            {isLive
              ? <CustomDownloadIcon className={cn("w-[18px] h-[18px] md:w-5 md:h-5 flex-shrink-0", isDark ? "text-stone-950" : "text-white")} />
              : <Download className={cn("w-[18px] h-[18px] md:w-5 md:h-5 flex-shrink-0", isDark ? "text-stone-950" : "text-white")} />}
            <span>{isHi ? (isLive ? "सजीव वॉलपेपर डाउनलोड करें" : "वॉलपेपर डाउनलोड करें") : (isLive ? "Download Live Wallpaper" : "Download Wallpaper")}</span>
          </button>

          {/* Save / Share / Report chips */}
          <div className="grid grid-cols-3 gap-1.5 md:gap-2.5 select-none w-full">
            <button type="button" onClick={() => onToggleLikeWallpaper(wp.id)} className={chipCls}>
              <Heart
                className={cn(
                  "w-[16px] h-[16px] md:w-[18px] md:h-[18px] flex-shrink-0 transition-colors",
                  likedWallpaperIds.includes(wp.id)
                    ? isDark ? "fill-amber-500 text-amber-500" : "fill-[#651317] text-[#651317]"
                    : isDark ? "text-amber-400/80" : "text-[#651317]/80"
                )}
              />
              <span className="truncate">
                {likedWallpaperIds.includes(wp.id)
                  ? (isHi ? "सहेजा गया" : "Saved")
                  : (isHi ? "सहेजें" : "Save")}
              </span>
            </button>

            <button type="button" onClick={() => setShowShareModal(true)} className={chipCls}>
              <Share2 className="w-[16px] h-[16px] md:w-[18px] md:h-[18px] flex-shrink-0 opacity-85" />
              <span className="truncate">{isHi ? "साझा करें" : "Share"}</span>
            </button>

            <button type="button" onClick={() => setShowReportModal(true)} className={chipCls}>
              <Flag className="w-[16px] h-[16px] md:w-[18px] md:h-[18px] flex-shrink-0 opacity-85" />
              <span className="truncate">{isHi ? "रिपोर्ट" : "Report"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: Phone mockup — swipe ONLY here */}
      <div
        className="flex-shrink-0 flex items-center justify-center relative cursor-grab active:cursor-grabbing pl-1 sm:pl-2"
        onTouchStart={onPhoneTouchStart}
        onTouchEnd={onPhoneTouchEnd}
      >
        <div className="relative z-30 transition-transform active:scale-[0.98] flex items-center justify-center py-0.5">
          <PhoneFrame imageUrl={imageUrl} previewMode={previewMode} isDark={isDark} />
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      {/* ═══════════════════════════════════════════════════════
          STATIC WALLPAPER MODAL
      ═══════════════════════════════════════════════════════ */}
      {staticWp && (
        /* NOTE: No key on Fragment = React keeps the same element, just updates props.
           This prevents full unmount/remount (screen flash) when swiping to next wallpaper. */
        <>
          {/* Fullscreen Background — crossfade on src change */}
          <div className="fixed inset-0 z-[121] select-none pointer-events-none overflow-hidden">
            <img
              key={staticWp.id}
              src={staticWp.imageUrl}
              alt={staticWp.name}
              className={cn(
                "w-full h-full object-cover scale-105 transition-all duration-500",
                isCardVisibleInternal
                  ? isDark ? "brightness-[0.45]" : "brightness-[0.75]"
                  : "brightness-100 scale-100 filter-none"
              )}
            />
          </div>

          {/* Click-to-toggle overlay — NO touch swipe here, only click */}
          <div
            onClick={toggleCardVisibility}
            className="fixed inset-0 z-[122] select-none cursor-pointer"
          />

          {/* Top Bar */}
          <AnimatePresence>
            {isCardVisibleInternal && (
              <motion.div
                key="static-top-bar"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="fixed top-5 left-4 right-4 z-[140] select-none pointer-events-auto flex items-center justify-between gap-2"
              >
                <button
                  type="button"
                  onClick={onCloseModal}
                  aria-label="Back"
                  className={cn(
                    "w-10 h-10 rounded-full border flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-xl shrink-0 backdrop-blur-md",
                    isDark ? "bg-stone-950/80 border-amber-500/30 text-amber-200 hover:bg-stone-900 hover:border-amber-400" : "bg-white/95 border-[#EAD7C3] text-[#651317] hover:bg-white"
                  )}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div
                  onClick={toggleCardVisibility}
                  className={cn(
                    "px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border text-xs font-medium font-hindi flex items-center gap-2 shadow-xl backdrop-blur-xl transition-all cursor-pointer active:scale-95 select-none",
                    isDark
                      ? "bg-stone-950/85 border-amber-400/40 text-amber-100 hover:bg-stone-900 shadow-[0_4px_20px_rgba(245,158,11,0.2)]"
                      : "bg-white/90 border-[#651317]/30 text-[#651317] hover:bg-white shadow-[0_4px_20px_rgba(101,19,23,0.15)]"
                  )}
                >
                  <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0", isDark ? "bg-amber-500/20 text-amber-300" : "bg-[#651317]/10 text-[#651317]")}>
                    <Maximize2 className="w-3 h-3" />
                  </div>
                  <span className="truncate">{isHi ? "फूल स्क्रीन मोड • स्क्रीन टैप करें" : "Full Screen Mode • Tap screen"}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Card */}
          <AnimatePresence>
            {isCardVisibleInternal && renderBottomCard(
              staticWp,
              staticWp.imageUrl,
              false,
              () => handleWallpaperDownload(staticWp, isHi),
              handlePhoneTouchStart,
              handlePhoneTouchEndStatic
            )}
          </AnimatePresence>

          {/* Hint pill when card hidden */}
          {!isCardVisibleInternal && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              onClick={toggleCardVisibility}
              className="fixed bottom-[calc(20px+env(safe-area-inset-bottom,0px))] inset-x-0 flex justify-center items-center z-[190] pointer-events-auto cursor-pointer px-4"
            >
              <div className={cn(
                "px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border text-xs sm:text-sm font-medium font-hindi flex items-center gap-2.5 shadow-2xl backdrop-blur-2xl transition-all active:scale-95",
                isDark
                  ? "bg-stone-950/90 border-amber-400/40 text-amber-200 hover:bg-stone-900 shadow-[0_8px_30px_rgba(245,158,11,0.25)]"
                  : "bg-white/95 border-[#651317]/40 text-[#651317] hover:bg-white shadow-[0_8px_30px_rgba(101,19,23,0.2)]"
              )}>
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0", isDark ? "bg-amber-500/20 text-amber-300" : "bg-[#651317]/10 text-[#651317]")}>
                  <Eye className="w-3.5 h-3.5" />
                </div>
                <span>{isHi ? "विवरण और कंट्रोल देखें • टैप करें" : "Show Details & Controls • Tap"}</span>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════
          LIVE WALLPAPER MODAL
      ═══════════════════════════════════════════════════════ */}
      {liveWp && (
        <>
          <div className="fixed inset-0 z-[121] select-none pointer-events-none overflow-hidden">
            <img
              key={liveWp.id}
              src={liveWp.thumbnailUrl}
              alt={liveWp.name}
              className={cn(
                "w-full h-full object-cover scale-105 transition-all duration-500",
                isCardVisibleInternal
                  ? isDark ? "brightness-[0.45]" : "brightness-[0.75]"
                  : "brightness-100 scale-100 filter-none"
              )}
            />
          </div>

          <div
            onClick={toggleCardVisibility}
            className="fixed inset-0 z-[122] select-none cursor-pointer"
          />

          <AnimatePresence>
            {isCardVisibleInternal && (
              <motion.div
                key="live-top-bar"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="fixed top-5 left-4 right-4 z-[140] select-none pointer-events-auto flex items-center justify-between gap-2"
              >
                <button
                  type="button"
                  onClick={onCloseModal}
                  aria-label="Back"
                  className={cn(
                    "w-10 h-10 rounded-full border flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-xl shrink-0 backdrop-blur-md",
                    isDark ? "bg-stone-950/80 border-amber-500/30 text-amber-200 hover:bg-stone-900 hover:border-amber-400" : "bg-white/95 border-[#EAD7C3] text-[#651317] hover:bg-white"
                  )}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div
                  onClick={toggleCardVisibility}
                  className={cn(
                    "px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border text-xs font-medium font-hindi flex items-center gap-2 shadow-xl backdrop-blur-xl transition-all cursor-pointer active:scale-95 select-none",
                    isDark
                      ? "bg-stone-950/85 border-amber-400/40 text-amber-100 hover:bg-stone-900 shadow-[0_4px_20px_rgba(245,158,11,0.2)]"
                      : "bg-white/90 border-[#651317]/30 text-[#651317] hover:bg-white shadow-[0_4px_20px_rgba(101,19,23,0.15)]"
                  )}
                >
                  <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0", isDark ? "bg-amber-500/20 text-amber-300" : "bg-[#651317]/10 text-[#651317]")}>
                    <Maximize2 className="w-3 h-3" />
                  </div>
                  <span className="truncate">{isHi ? "फूल स्क्रीन मोड • स्क्रीन टैप करें" : "Full Screen Mode • Tap screen"}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isCardVisibleInternal && renderBottomCard(
              liveWp,
              liveWp.thumbnailUrl,
              true,
              () => handleLiveWallpaperDownload(liveWp, isHi),
              handlePhoneTouchStart,
              handlePhoneTouchEndLive,
              <span className={cn("px-1 py-0.5 rounded border text-[6px] md:text-[8px] font-sans font-bold uppercase tracking-widest leading-none scale-90", isDark ? "bg-[#fbbf24]/10 border-[#fbbf24]/30 text-[#fbbf24]" : "bg-[#651317]/10 border-[#651317]/30 text-[#651317]")}>{liveWp.effect}</span>
            )}
          </AnimatePresence>

          {!isCardVisibleInternal && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 0, scale: 1 }}
              onClick={toggleCardVisibility}
              className="fixed bottom-[calc(20px+env(safe-area-inset-bottom,0px))] inset-x-0 flex justify-center items-center z-[190] pointer-events-auto cursor-pointer px-4"
            >
              <div className={cn(
                "px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border text-xs sm:text-sm font-medium font-hindi flex items-center gap-2.5 shadow-2xl backdrop-blur-2xl transition-all active:scale-95",
                isDark
                  ? "bg-stone-950/90 border-amber-400/40 text-amber-200 hover:bg-stone-900 shadow-[0_8px_30px_rgba(245,158,11,0.25)]"
                  : "bg-white/95 border-[#651317]/40 text-[#651317] hover:bg-white shadow-[0_8px_30px_rgba(101,19,23,0.2)]"
              )}>
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0", isDark ? "bg-amber-500/20 text-amber-300" : "bg-[#651317]/10 text-[#651317]")}>
                  <Eye className="w-3.5 h-3.5" />
                </div>
                <span>{isHi ? "विवरण और कंट्रोल देखें • टैप करें" : "Show Details & Controls • Tap"}</span>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════
          SHARE MODAL
      ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showShareModal && (
          <div
            key="share-backdrop"
            className="fixed inset-0 z-[220] flex items-end justify-center pointer-events-auto"
            onClick={() => setShowShareModal(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 80 }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "relative w-full max-w-md mx-auto rounded-t-[2rem] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] border-t border-x shadow-2xl",
                isDark ? "bg-[#130c06] border-amber-500/20 text-amber-100" : "bg-white border-[#EAD7C3] text-[#2B1F18]"
              )}
            >
              {/* Handle bar */}
              <div className={cn("w-10 h-1 rounded-full mx-auto mb-5", isDark ? "bg-amber-500/30" : "bg-[#EAD7C3]")} />

              {/* Title */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold text-base">{isHi ? "साझा करें" : "Share Wallpaper"}</h3>
                  <p className={cn("text-xs mt-0.5 truncate max-w-[220px]", isDark ? "text-amber-300/70" : "text-[#786252]")}>
                    {isHi ? currentNameHindi : currentName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className={cn("w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors", isDark ? "hover:bg-white/10" : "hover:bg-black/5")}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Share options */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {/* WhatsApp */}
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl border cursor-pointer transition-all active:scale-95 group"
                  style={{ borderColor: isDark ? "rgba(37,211,102,0.25)" : "rgba(37,211,102,0.35)", background: isDark ? "rgba(37,211,102,0.08)" : "rgba(37,211,102,0.06)" }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(37,211,102,0.15)" }}>
                    <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.52 3.48A11.93 11.93 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.17 1.6 5.99L0 24l6.18-1.62A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 21.94a9.94 9.94 0 0 1-5.06-1.38l-.36-.22-3.75.99 1-3.64-.23-.37A9.93 9.93 0 0 1 2.06 12C2.06 6.5 6.5 2.06 12 2.06c2.64 0 5.12 1.03 6.99 2.9a9.85 9.85 0 0 1 2.9 6.99c0 5.5-4.44 9.99-9.89 9.99zm5.44-7.45c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.6-.91-2.19-.24-.58-.48-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.27.49 1.7.63.71.22 1.36.19 1.88.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.08-.12-.27-.2-.57-.35z" fill="#25D366"/>
                    </svg>
                  </div>
                  <span className="text-[11px] font-semibold" style={{ color: "#25D366" }}>WhatsApp</span>
                </button>

                {/* Telegram */}
                <button
                  type="button"
                  onClick={handleTelegramShare}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl border cursor-pointer transition-all active:scale-95"
                  style={{ borderColor: isDark ? "rgba(42,174,232,0.25)" : "rgba(42,174,232,0.35)", background: isDark ? "rgba(42,174,232,0.08)" : "rgba(42,174,232,0.06)" }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(42,174,232,0.15)" }}>
                    <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z" fill="#2AAEE8"/>
                    </svg>
                  </div>
                  <span className="text-[11px] font-semibold" style={{ color: "#2AAEE8" }}>Telegram</span>
                </button>

                {/* Copy Link */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-2xl border cursor-pointer transition-all active:scale-95",
                    isDark ? "border-amber-500/25 bg-amber-500/8" : "border-[#651317]/20 bg-[#651317]/5"
                  )}
                >
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", isDark ? "bg-amber-500/15" : "bg-[#651317]/10")}>
                    {linkCopied
                      ? <Check className={cn("w-6 h-6", isDark ? "text-amber-400" : "text-[#651317]")} />
                      : <Copy className={cn("w-6 h-6", isDark ? "text-amber-400" : "text-[#651317]")} />}
                  </div>
                  <span className={cn("text-[11px] font-semibold", isDark ? "text-amber-300" : "text-[#651317]")}>
                    {linkCopied ? (isHi ? "कॉपी!" : "Copied!") : (isHi ? "लिंक कॉपी" : "Copy Link")}
                  </span>
                </button>
              </div>

              {/* More options (native share) */}
              {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className={cn(
                    "w-full py-3 rounded-2xl border font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]",
                    isDark ? "border-amber-500/20 text-amber-200 hover:bg-amber-500/10" : "border-[#EAD7C3] text-[#651317] hover:bg-[#F4EAD8]"
                  )}
                >
                  <Share2 className="w-4 h-4" />
                  <span>{isHi ? "अन्य ऐप्स के साथ साझा करें" : "Share with more apps"}</span>
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════
          REPORT MODAL
      ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showReportModal && (
          <div
            key="report-backdrop"
            className="fixed inset-0 z-[220] flex items-end justify-center pointer-events-auto"
            onClick={() => setShowReportModal(false)}
          >
            <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 80 }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "relative w-full max-w-md mx-auto rounded-t-[2rem] border-t border-x shadow-2xl overflow-hidden",
                isDark ? "bg-[#130c06] border-amber-500/20" : "bg-[#FFFDF9] border-[#EAD7C3]"
              )}
            >
              {/* Gradient top accent */}
              <div className={cn("h-1 w-full", isDark ? "bg-gradient-to-r from-amber-500 via-orange-400 to-amber-600" : "bg-gradient-to-r from-[#651317] via-[#8B1E24] to-[#651317]")} />

              <div className="p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] space-y-4 overflow-y-auto max-h-[90vh]">
                {/* Handle & Header */}
                <div className={cn("w-10 h-1 rounded-full mx-auto", isDark ? "bg-amber-500/30" : "bg-[#EAD7C3]")} />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", isDark ? "bg-amber-500/15 text-amber-400" : "bg-[#651317]/10 text-[#651317]")}>
                      <Flag className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className={cn("font-bold text-sm font-hindi", isDark ? "text-amber-100" : "text-[#2B1F18]")}>
                        {isHi ? "समस्या रिपोर्ट करें" : "Report a Problem"}
                      </h3>
                      <p className={cn("text-[10px] mt-0.5", isDark ? "text-amber-300/60" : "text-[#786252]")}>
                        {isHi ? "हम जल्द समीक्षा करेंगे" : "We'll review this quickly"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className={cn("w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors", isDark ? "hover:bg-white/10 text-amber-200" : "hover:bg-black/5 text-[#651317]")}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Support Contacts */}
                <div className={cn("rounded-2xl overflow-hidden border", isDark ? "border-amber-500/15" : "border-[#EAD7C3]")}>
                  <div className={cn("px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest", isDark ? "bg-amber-500/10 text-amber-400" : "bg-[#FDF6EE] text-[#651317]")}>
                    {isHi ? "सीधे संपर्क करें" : "Contact Support Directly"}
                  </div>
                  <div className={cn("grid grid-cols-2 divide-x", isDark ? "divide-amber-500/10" : "divide-[#EAD7C3]")}>
                    <a
                      href="mailto:contact@raghavam.com?subject=Wallpaper%20Report"
                      target="_blank"
                      rel="noreferrer"
                      className={cn("flex flex-col items-center gap-1.5 py-3.5 px-3 transition-colors cursor-pointer", isDark ? "hover:bg-amber-500/5 text-amber-200" : "hover:bg-[#FDF6EE] text-[#651317]")}
                    >
                      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", isDark ? "bg-amber-500/15" : "bg-[#651317]/10")}>
                        <Mail className="w-4 h-4" />
                      </div>
                      <span className={cn("text-[10px] font-semibold", isDark ? "text-amber-300/80" : "text-[#651317]/80")}>Email</span>
                      <span className="text-[9px] font-medium opacity-70 text-center truncate w-full">contact@raghavam.com</span>
                    </a>
                    <a
                      href="https://wa.me/919876543210?text=Hello%20Raghavam%20Owner%2C%20I%20want%20to%20report%20an%20issue."
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-col items-center gap-1.5 py-3.5 px-3 transition-colors cursor-pointer hover:bg-green-500/5"
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-green-500/15">
                        <PhoneCall className="w-4 h-4 text-green-500" />
                      </div>
                      <span className="text-[10px] font-semibold text-green-500">WhatsApp</span>
                      <span className="text-[9px] font-medium text-green-500/70 text-center">+91 98765 43210</span>
                    </a>
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className={cn("text-xs font-semibold block", isDark ? "text-amber-200" : "text-[#2B1F18]")}>
                    {isHi ? "समस्या की श्रेणी" : "Problem Category"}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "quality", hi: "📸 धुंधली छवि", en: "📸 Blurry Image" },
                      { id: "category", hi: "🏷️ गलत श्रेणी", en: "🏷️ Wrong Category" },
                      { id: "inappropriate", hi: "⚠️ अनुचित सामग्री", en: "⚠️ Inappropriate" },
                      { id: "other", hi: "⚡ अन्य समस्या", en: "⚡ Other Issue" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setReportReason(opt.id)}
                        className={cn(
                          "py-2.5 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer flex items-center justify-between gap-1",
                          reportReason === opt.id
                            ? isDark
                              ? "bg-amber-500/20 border-amber-400 text-amber-200 font-bold"
                              : "bg-[#651317]/10 border-[#651317] text-[#651317] font-bold"
                            : isDark
                              ? "bg-white/5 border-white/10 text-amber-200/70 hover:bg-white/8"
                              : "bg-white border-[#EAD7C3] text-[#786252] hover:bg-[#FDF6EE]"
                        )}
                      >
                        <span>{isHi ? opt.hi : opt.en}</span>
                        {reportReason === opt.id && <Check className={cn("w-3 h-3 shrink-0", isDark ? "text-amber-400" : "text-[#651317]")} />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5">
                  <label className={cn("text-xs font-semibold block", isDark ? "text-amber-200" : "text-[#2B1F18]")}>
                    {isHi ? "विवरण (वैकल्पिक)" : "Details (optional)"}
                  </label>
                  <textarea
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder={isHi ? "समस्या का पूरा विवरण यहाँ लिखें..." : "Describe the issue in detail..."}
                    className={cn(
                      "w-full p-3 rounded-xl border text-xs font-sans focus:outline-none transition-all resize-none leading-relaxed",
                      isDark
                        ? "bg-white/5 border-amber-500/20 text-amber-100 placeholder:text-stone-500 focus:border-amber-400/60 focus:bg-white/8"
                        : "bg-white border-[#EAD7C3] text-[#2B1F18] placeholder:text-stone-400 focus:border-[#651317]/50 focus:shadow-[0_0_0_3px_rgba(101,19,23,0.05)]"
                    )}
                  />
                </div>

                {/* Contact */}
                <div className="space-y-1.5">
                  <label className={cn("text-xs font-semibold block", isDark ? "text-amber-200" : "text-[#2B1F18]")}>
                    {isHi ? "आपका ईमेल या फोन (वैकल्पिक)" : "Your email or phone (optional)"}
                  </label>
                  <input
                    type="text"
                    value={reportContactInput}
                    onChange={(e) => setReportContactInput(e.target.value)}
                    placeholder={isHi ? "name@email.com या 9876543210" : "name@email.com or +91..."}
                    className={cn(
                      "w-full p-3 rounded-xl border text-xs font-sans focus:outline-none transition-all",
                      isDark
                        ? "bg-white/5 border-amber-500/20 text-amber-100 placeholder:text-stone-500 focus:border-amber-400/60"
                        : "bg-white border-[#EAD7C3] text-[#2B1F18] placeholder:text-stone-400 focus:border-[#651317]/50"
                    )}
                  />
                </div>

                {/* Submit / Cancel */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReportModal(false);
                      setReportReason("");
                      setReportDetails("");
                      setReportContactInput("");
                    }}
                    className={cn(
                      "py-3 rounded-2xl border text-xs font-semibold cursor-pointer transition-colors",
                      isDark ? "border-white/10 text-amber-200/70 hover:bg-white/5" : "border-[#EAD7C3] text-[#786252] hover:bg-[#F4EAD8]"
                    )}
                  >
                    {isHi ? "रद्द करें" : "Cancel"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!reportReason && !reportDetails.trim()) {
                        toast.error(isHi ? "कृपया एक कारण चुनें या विवरण भरें" : "Please select a reason or fill in details");
                        return;
                      }
                      const report = {
                        id: `rep_${Date.now()}`,
                        wallpaperId: staticWp?.id ?? liveWp?.id ?? "general",
                        wallpaperName: staticWp?.name ?? liveWp?.name ?? "Wallpaper",
                        reason: reportReason || "other",
                        details: reportDetails.trim(),
                        contact: reportContactInput.trim(),
                        date: new Date().toLocaleString(),
                      };
                      try {
                        const existing = JSON.parse(localStorage.getItem("hk_wallpaper_reports") || "[]");
                        localStorage.setItem("hk_wallpaper_reports", JSON.stringify([...existing, report]));
                      } catch (_) {}
                      toast.success(
                        isHi ? "रिपोर्ट सफलतापूर्वक दर्ज की गई!" : "Report sent to owner successfully!",
                        { description: isHi ? "हमारी टीम जल्द समीक्षा करेगी। धन्यवाद!" : "Our team will review this shortly. Thank you!", duration: 4000 }
                      );
                      setShowReportModal(false);
                      setReportReason("");
                      setReportDetails("");
                      setReportContactInput("");
                    }}
                    className={cn(
                      "py-3 rounded-2xl text-xs font-bold cursor-pointer transition-all active:scale-[0.97] flex items-center justify-center gap-1.5",
                      isDark
                        ? "bg-gradient-to-r from-amber-500 to-orange-400 text-stone-950 shadow-[0_4px_15px_rgba(245,158,11,0.25)]"
                        : "bg-gradient-to-r from-[#651317] to-[#8B1E24] text-white shadow-[0_4px_15px_rgba(101,19,23,0.2)]"
                    )}
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>{isHi ? "भेजें" : "Submit Report"}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
});

WallpaperPreviewModal.displayName = "WallpaperPreviewModal";
