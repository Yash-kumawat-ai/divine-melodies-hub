import React from "react";
import type { WallpaperPageProps } from "./types";
import { useWallpaperFilter } from "./hooks/useWallpaperFilter";
import { useWallpaperPreview } from "./hooks/useWallpaperPreview";
import { useWallpaperDownload } from "./hooks/useWallpaperDownload";
import { WallpaperHeader } from "./components/WallpaperHeader";
import { WallpaperToggle } from "./components/WallpaperToggle";
import { WallpaperSearchBar } from "./components/WallpaperSearchBar";
import { StaticWallpaperSection } from "./components/StaticWallpaperSection";
import { LiveWallpaperSection } from "./components/LiveWallpaperSection";
import { WallpaperPreviewModal } from "./components/WallpaperPreviewModal";
import { FeatureTabNav } from "@/pages/Blessings/components/FeatureTabNav";

export const WallpaperPage: React.FC<WallpaperPageProps> = ({
  isDark,
  isHi,
  likedWallpaperIds,
  onToggleLikeWallpaper,
  onNavigateToPricing,
  onNavigateBack,
  activeTab = "wallpapers",
  onSelectTab,
  hideHeader = false,
  isSearchOpen: isSearchOpenProp,
  onToggleSearch: onToggleSearchProp,
  onPreviewStateChange,
}) => {
  const {
    wallpaperType,
    setWallpaperType,
    selectedDeityFilter,
    setSelectedDeityFilter,
    isSearchOpen: isSearchOpenInternal,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    filteredWallpapers,
    filteredLiveWallpapers,
  } = useWallpaperFilter();

  const isSearchOpen = isSearchOpenProp !== undefined ? isSearchOpenProp : isSearchOpenInternal;
  const handleToggleSearch = onToggleSearchProp || (() => setIsSearchOpen((prev) => !prev));

  const {
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
  } = useWallpaperPreview();

  React.useEffect(() => {
    if (onPreviewStateChange) {
      onPreviewStateChange(!!(showPreviewModal || showLivePreviewModal));
    }
  }, [showPreviewModal, showLivePreviewModal, onPreviewStateChange]);

  const { downloadWallpaper } = useWallpaperDownload(isHi);

  return (
    <div className="w-full flex flex-col items-center animate-fade-in select-none">
      {/* 1. Wallpaper Page Header (if standalone) */}
      {!hideHeader && (
        <WallpaperHeader
          isDark={isDark}
          isHi={isHi}
          isSearchOpen={isSearchOpen}
          onToggleSearch={handleToggleSearch}
          onNavigateBack={onNavigateBack}
          onNavigateToPricing={onNavigateToPricing}
        />
      )}

      {/* 2. Feature Navigation (if standalone) */}
      {!hideHeader && onSelectTab && (
        <FeatureTabNav
          isDark={isDark}
          isHi={isHi}
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          className="mt-4"
        />
      )}

      <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 flex flex-col items-center">
        {/* 3. Static / Live Switcher */}
        <WallpaperToggle
          isDark={isDark}
          isHi={isHi}
          wallpaperType={wallpaperType}
          onSelectType={setWallpaperType}
        />

        {/* Search Bar Input */}
        {isSearchOpen && (
          <WallpaperSearchBar
            isDark={isDark}
            isHi={isHi}
            searchQuery={searchQuery}
            onChangeQuery={setSearchQuery}
          />
        )}

        {/* Section A: Static Wallpapers */}
        {wallpaperType === "static" && (
          <StaticWallpaperSection
            isDark={isDark}
            isHi={isHi}
            selectedDeityFilter={selectedDeityFilter}
            filteredWallpapers={filteredWallpapers}
            likedWallpaperIds={likedWallpaperIds}
            onSelectDeity={setSelectedDeityFilter}
            onToggleLikeWallpaper={onToggleLikeWallpaper}
            onWallpaperAction={handleWallpaperAction}
            onDownloadWallpaper={downloadWallpaper}
            onNavigateToPricing={onNavigateToPricing}
          />
        )}

        {/* Section B: Live Wallpapers */}
        {wallpaperType === "live" && (
          <LiveWallpaperSection
            isDark={isDark}
            isHi={isHi}
            selectedDeityFilter={selectedDeityFilter}
            filteredLiveWallpapers={filteredLiveWallpapers}
            likedWallpaperIds={likedWallpaperIds}
            onSelectDeity={setSelectedDeityFilter}
            onToggleLikeWallpaper={onToggleLikeWallpaper}
            onLiveWallpaperAction={handleLiveWallpaperAction}
          />
        )}
      </div>

      {/* Fullscreen Side-by-Side Preview Modal */}
      <WallpaperPreviewModal
        isDark={isDark}
        isHi={isHi}
        showPreviewModal={showPreviewModal}
        setShowPreviewModal={setShowPreviewModal}
        showLivePreviewModal={showLivePreviewModal}
        setShowLivePreviewModal={setShowLivePreviewModal}
        isCardVisible={isCardVisible}
        setIsCardVisible={setIsCardVisible}
        previewMode={previewMode}
        setPreviewMode={setPreviewMode}
        likedWallpaperIds={likedWallpaperIds}
        onToggleLikeWallpaper={onToggleLikeWallpaper}
        onCloseModal={closePreviewModal}
      />
    </div>
  );
};

export default WallpaperPage;
