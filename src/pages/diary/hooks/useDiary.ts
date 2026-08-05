import { useState, useMemo } from "react";
import type { DiarySubTab } from "../types";
import { POSTER_TEMPLATES, WALLPAPERS_LIST, LIVE_WALLPAPERS_LIST } from "@/pages/Blessings/constants";
import type { DevotionalWallpaper, DevotionalLiveWallpaper, PosterTemplate } from "@/pages/Blessings/types";

export interface UseDiaryOptions {
  likedPosterIds: string[];
  likedWallpaperIds: string[];
}

export function useDiary({ likedPosterIds, likedWallpaperIds }: UseDiaryOptions) {
  const [savedSubTab, setSavedSubTab] = useState<DiarySubTab>("posters");

  const likedPosters = useMemo<PosterTemplate[]>(() => {
    return POSTER_TEMPLATES.filter((tpl) => likedPosterIds.includes(tpl.id));
  }, [likedPosterIds]);

  const likedWallpapers = useMemo<{
    staticLiked: DevotionalWallpaper[];
    liveLiked: DevotionalLiveWallpaper[];
  }>(() => {
    const staticLiked = WALLPAPERS_LIST.filter((wp) => likedWallpaperIds.includes(wp.id));
    const liveLiked = LIVE_WALLPAPERS_LIST.filter((wp) => likedWallpaperIds.includes(wp.id));
    return { staticLiked, liveLiked };
  }, [likedWallpaperIds]);

  const isLikedEmpty = useMemo(() => {
    return (
      likedPosters.length === 0 &&
      likedWallpapers.staticLiked.length === 0 &&
      likedWallpapers.liveLiked.length === 0
    );
  }, [likedPosters, likedWallpapers]);

  const totalLikedCount = useMemo(() => {
    return likedPosterIds.length + likedWallpaperIds.length;
  }, [likedPosterIds, likedWallpaperIds]);

  return {
    savedSubTab,
    setSavedSubTab,
    likedPosters,
    likedWallpapers,
    isLikedEmpty,
    totalLikedCount,
  };
}
