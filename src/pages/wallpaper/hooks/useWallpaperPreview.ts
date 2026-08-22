import { useState, useEffect } from "react";
import type { PreviewMode } from "../types";
import { WALLPAPERS_LIST, LIVE_WALLPAPERS_LIST } from "@/pages/Blessings/constants";
import type { DevotionalWallpaper, DevotionalLiveWallpaper } from "@/pages/Blessings/types";

export function useWallpaperPreview(
  searchParams?: URLSearchParams,
  setSearchParams?: (fn: (prev: URLSearchParams) => URLSearchParams) => void
) {
  const [showPreviewModal, setShowPreviewModal] = useState<string | null>(null);
  const [showLivePreviewModal, setShowLivePreviewModal] = useState<string | null>(null);
  const [isCardVisible, setIsCardVisible] = useState(true);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("lock");

  useEffect(() => {
    if (showPreviewModal || showLivePreviewModal) {
      setIsCardVisible(true);
    }
  }, [showPreviewModal, showLivePreviewModal]);

  // Sync with searchParams if present
  useEffect(() => {
    if (!searchParams) return;
    const wpId = searchParams.get("wpId");
    if (wpId) {
      if (wpId.startsWith("live-")) {
        const wp = LIVE_WALLPAPERS_LIST.find((w) => w.id === wpId);
        if (wp && showLivePreviewModal !== wpId) {
          setShowLivePreviewModal(wpId);
          setShowPreviewModal(null);
        }
      } else {
        const wp = WALLPAPERS_LIST.find((w) => w.id === wpId);
        if (wp && showPreviewModal !== wpId) {
          setShowPreviewModal(wpId);
          setShowLivePreviewModal(null);
        }
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (!setSearchParams) return;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      const openId = showPreviewModal || showLivePreviewModal;
      if (openId) {
        if (next.get("wpId") !== openId) {
          next.set("wpId", openId);
        }
      } else {
        if (next.has("wpId")) {
          next.delete("wpId");
        }
      }
      return next;
    });
  }, [showPreviewModal, showLivePreviewModal, setSearchParams]);

  const handleWallpaperAction = (wp: DevotionalWallpaper) => {
    setShowPreviewModal(wp.id);
    setShowLivePreviewModal(null);
  };

  const handleLiveWallpaperAction = (wp: DevotionalLiveWallpaper) => {
    setShowLivePreviewModal(wp.id);
    setShowPreviewModal(null);
  };

  const closePreviewModal = () => {
    setShowPreviewModal(null);
    setShowLivePreviewModal(null);
  };

  return {
    showPreviewModal,
    setShowPreviewModal,
    showLivePreviewModal,
    setShowLivePreviewModal,
    isCardVisible,
    setIsCardVisible,
    previewMode,
    setPreviewMode,
    handleWallpaperAction,
    handleLiveWallpaperAction,
    closePreviewModal,
  };
}
