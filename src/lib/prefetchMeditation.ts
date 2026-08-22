import meditationDesktopBg from "@/pages/images/meditation_desktop_wallpaper.webp";
import mantraJapBanner from "@/pages/images/mantra_jap_banner.webp";

/** Prefetch Dhyan chunks so the first tap is not a long blank wait. */
export function prefetchMeditationPage() {
  void import("@/pages/MeditationPage");
  void import("@/components/meditation/MeditationPracticeHome");
  void import("@/components/meditation/MantraJapHome");
  void import("@/components/meditation/PremiumJapaCounter");
  prefetchMeditationLcpImages();
}

export function prefetchMeditationLcpImages() {
  const hub = new Image();
  hub.src = meditationDesktopBg;
  const jap = new Image();
  jap.src = mantraJapBanner;
}

export function prefetchMantraImage(src: string | undefined) {
  if (!src) return;
  const img = new Image();
  img.src = src;
}
