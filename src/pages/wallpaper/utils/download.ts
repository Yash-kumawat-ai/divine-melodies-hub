import { toast } from "sonner";
import type { DevotionalWallpaper, DevotionalLiveWallpaper } from "@/pages/Blessings/types";

export async function handleWallpaperDownload(
  wp: DevotionalWallpaper,
  isHi: boolean
): Promise<void> {
  try {
    const response = await fetch(wp.imageUrl);
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${wp.name.replace(/\s+/g, "_")}_Wallpaper.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    toast.success(isHi ? "वॉलपेपर डाउनलोड हो गया!" : "Wallpaper downloaded!", {
      duration: 2000,
    });
  } catch (_) {
    const link = document.createElement("a");
    link.href = wp.imageUrl;
    link.download = `${wp.name.replace(/\s+/g, "_")}_Wallpaper.jpg`;
    link.target = "_blank";
    link.click();
    toast.success(isHi ? "वॉलपेपर डाउनलोड हो रहा है..." : "Downloading wallpaper...", {
      duration: 2000,
    });
  }
}

export async function handleLiveWallpaperDownload(
  wp: DevotionalLiveWallpaper,
  isHi: boolean
): Promise<void> {
  try {
    const response = await fetch(wp.thumbnailUrl);
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${wp.name.replace(/\s+/g, "_")}_LiveWallpaper.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    toast.success(isHi ? "सजीव वॉलपेपर डाउनलोड हो गया!" : "Live wallpaper downloaded!", {
      duration: 2000,
    });
  } catch (_) {
    const link = document.createElement("a");
    link.href = wp.thumbnailUrl;
    link.download = `${wp.name.replace(/\s+/g, "_")}_LiveWallpaper.jpg`;
    link.target = "_blank";
    link.click();
    toast.success(isHi ? "सजीव वॉलपेपर डाउनलोड हो रहा है..." : "Downloading live wallpaper...", {
      duration: 2000,
    });
  }
}
