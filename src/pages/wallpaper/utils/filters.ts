import type { DevotionalWallpaper, DevotionalLiveWallpaper } from "@/pages/Blessings/types";

export function filterStaticWallpapers(
  wallpapers: DevotionalWallpaper[],
  deityFilter: string | null,
  searchQuery: string
): DevotionalWallpaper[] {
  return wallpapers.filter((wp) => {
    const matchesDeity = !deityFilter || wp.deity === deityFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      wp.name.toLowerCase().includes(q) ||
      wp.nameHindi.toLowerCase().includes(q) ||
      wp.deity.toLowerCase().includes(q);
    return matchesDeity && matchesSearch;
  });
}

export function filterLiveWallpapers(
  liveWallpapers: DevotionalLiveWallpaper[],
  deityFilter: string | null,
  searchQuery: string
): DevotionalLiveWallpaper[] {
  return liveWallpapers.filter((wp) => {
    const matchesDeity = !deityFilter || wp.deity === deityFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      wp.name.toLowerCase().includes(q) ||
      wp.nameHindi.toLowerCase().includes(q) ||
      wp.deity.toLowerCase().includes(q);
    return matchesDeity && matchesSearch;
  });
}
