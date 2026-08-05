import { toast } from "sonner";

export interface ShareWallpaperOptions {
  url: string;
  title: string;
  text: string;
  isHi: boolean;
}

export async function shareWallpaper({
  url,
  title,
  text,
  isHi,
}: ShareWallpaperOptions): Promise<void> {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return;
    } catch (_) {
      /* ignore user cancel */
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    toast.success(isHi ? "लिंक कॉपी हो गया!" : "Link copied to clipboard!", {
      duration: 2000,
    });
  } catch (_) {
    toast.error(isHi ? "शेयर करने में विफलता" : "Failed to share link");
  }
}
