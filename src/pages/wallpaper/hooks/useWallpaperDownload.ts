import { useCallback } from "react";
import type { DevotionalWallpaper } from "@/pages/Blessings/types";
import { handleWallpaperDownload } from "../utils/download";

export function useWallpaperDownload(isHi: boolean) {
  const downloadWallpaper = useCallback(
    (wp: DevotionalWallpaper) => {
      handleWallpaperDownload(wp, isHi);
    },
    [isHi]
  );

  return { downloadWallpaper };
}
