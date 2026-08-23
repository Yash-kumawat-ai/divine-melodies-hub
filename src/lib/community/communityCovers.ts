import RamCover from "@/pages/images/lord_ram_high_quality.webp";
import ShivaCover from "@/pages/images/shiv_temple_hd.webp";
import KrishnaCover from "@/pages/images/krishna_mobile_wallpaper.webp";
import HanumanCover from "@/pages/images/hanuman_community_banner_high_quality.webp";
import DefaultCover from "@/pages/images/hindu_temple_sunset_widescreen_high_quality.webp";

export function resolveCommunityCover(deity?: string | null): string {
  const d = (deity || "").toLowerCase();
  if (d === "rama") return RamCover;
  if (d === "shiva") return ShivaCover;
  if (d === "krishna") return KrishnaCover;
  if (d === "hanuman") return HanumanCover;
  return DefaultCover;
}
