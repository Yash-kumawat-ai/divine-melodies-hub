import type { DevotionalWallpaper, DevotionalLiveWallpaper } from "@/pages/Blessings/types";

export type WallpaperType = "static" | "live";
export type PreviewMode = "lock" | "home";

export interface DeityFilterItem {
  id: string | null;
  name: string;
  nameEn: string;
  isIcon: boolean;
  symbol: string;
  image: string;
}

export interface WallpaperPageProps {
  isDark: boolean;
  isHi: boolean;
  likedWallpaperIds: string[];
  userTier?: string;
  onToggleLikeWallpaper: (wpId: string) => void;
  onNavigateToPricing: () => void;
  onNavigateBack: () => void;
  activeTab?: "maker" | "wallpapers" | "saved";
  onSelectTab?: (tab: "maker" | "wallpapers" | "saved") => void;
  hideHeader?: boolean;
  isSearchOpen?: boolean;
  onToggleSearch?: () => void;
}
