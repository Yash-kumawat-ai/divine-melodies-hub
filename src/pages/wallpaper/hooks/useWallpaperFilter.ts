import { useState, useMemo } from "react";
import type { WallpaperType } from "../types";
import { WALLPAPERS_LIST, LIVE_WALLPAPERS_LIST } from "@/pages/Blessings/constants";
import { filterStaticWallpapers, filterLiveWallpapers } from "../utils/filters";

export function useWallpaperFilter(initialDeityParam?: string | null) {
  const [wallpaperType, setWallpaperType] = useState<WallpaperType>("static");
  const [selectedDeityFilter, setSelectedDeityFilter] = useState<string | null>(() => {
    if (initialDeityParam) {
      const norm = initialDeityParam.toLowerCase();
      if (norm === "shiva" || norm === "shiv") return "Shiva";
      if (norm === "krishna") return "Krishna";
      if (norm === "hanuman") return "Hanuman";
      if (norm === "rama" || norm === "ram") return "Rama";
      if (norm === "ganesh" || norm === "ganesha") return "Ganesha";
      return initialDeityParam;
    }
    return null;
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredWallpapers = useMemo(() => {
    return filterStaticWallpapers(WALLPAPERS_LIST, selectedDeityFilter, searchQuery);
  }, [selectedDeityFilter, searchQuery]);

  const filteredLiveWallpapers = useMemo(() => {
    return filterLiveWallpapers(LIVE_WALLPAPERS_LIST, selectedDeityFilter, searchQuery);
  }, [selectedDeityFilter, searchQuery]);

  return {
    wallpaperType,
    setWallpaperType,
    selectedDeityFilter,
    setSelectedDeityFilter,
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    filteredWallpapers,
    filteredLiveWallpapers,
  };
}
