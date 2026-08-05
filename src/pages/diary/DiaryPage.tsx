import React from "react";
import type { DiaryPageProps } from "./types";
import { useDiary } from "./hooks/useDiary";
import { DiaryHeader } from "./components/DiaryHeader";
import { DiarySubTabs } from "./components/DiarySubTabs";
import { SavedPostersGrid } from "./components/SavedPostersGrid";
import { LikedItemsGallery } from "./components/LikedItemsGallery";

export const DiaryPage: React.FC<DiaryPageProps> = ({
  isDark,
  isHi,
  savedBlessings,
  likedPosterIds,
  likedWallpaperIds,
  onToggleLikePoster,
  onToggleLikeWallpaper,
  onSelectPoster,
  onWallpaperAction,
  onLiveWallpaperAction,
  onDownloadWallpaper,
  onNavigateToMaker,
}) => {
  const {
    savedSubTab,
    setSavedSubTab,
    likedPosters,
    likedWallpapers,
    isLikedEmpty,
    totalLikedCount,
  } = useDiary({
    likedPosterIds,
    likedWallpaperIds,
  });

  return (
    <div className="w-full space-y-5 flex flex-col items-center animate-fade-in">
      {/* Title / Description */}
      <DiaryHeader isDark={isDark} isHi={isHi} />

      {/* Sub-tab selection within Saved tab */}
      <DiarySubTabs
        isDark={isDark}
        isHi={isHi}
        savedSubTab={savedSubTab}
        setSavedSubTab={setSavedSubTab}
        savedCount={savedBlessings.length}
        likedCount={totalLikedCount}
      />

      {/* A. SAVED POSTERS DIARY */}
      {savedSubTab === "posters" && (
        <SavedPostersGrid
          isDark={isDark}
          isHi={isHi}
          savedBlessings={savedBlessings}
          onNavigateToMaker={onNavigateToMaker}
        />
      )}

      {/* B. LIKED DESIGNS GALLERY SECTION */}
      {savedSubTab === "liked" && (
        <LikedItemsGallery
          isDark={isDark}
          isHi={isHi}
          likedPosters={likedPosters}
          likedWallpapers={likedWallpapers}
          likedPosterIds={likedPosterIds}
          likedWallpaperIds={likedWallpaperIds}
          isLikedEmpty={isLikedEmpty}
          onToggleLikePoster={onToggleLikePoster}
          onToggleLikeWallpaper={onToggleLikeWallpaper}
          onSelectPoster={onSelectPoster}
          onWallpaperAction={onWallpaperAction}
          onLiveWallpaperAction={onLiveWallpaperAction}
          onDownloadWallpaper={onDownloadWallpaper}
          onNavigateToMaker={onNavigateToMaker}
        />
      )}
    </div>
  );
};

export default DiaryPage;
