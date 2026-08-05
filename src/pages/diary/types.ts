import type { DevotionalWallpaper, DevotionalLiveWallpaper, PosterTemplate } from "@/pages/Blessings/types";

export type DiarySubTab = "posters" | "liked";

export interface DiaryPageProps {
  isDark: boolean;
  isHi: boolean;
  savedBlessings: string[];
  likedPosterIds: string[];
  likedWallpaperIds: string[];
  onToggleLikePoster: (posterId: string) => void;
  onToggleLikeWallpaper: (wallpaperId: string) => void;
  onSelectPoster: (poster: PosterTemplate) => void;
  onWallpaperAction: (wallpaper: DevotionalWallpaper) => void;
  onLiveWallpaperAction: (wallpaper: DevotionalLiveWallpaper) => void;
  onDownloadWallpaper: (wallpaper: DevotionalWallpaper) => void;
  onNavigateToMaker: () => void;
}
