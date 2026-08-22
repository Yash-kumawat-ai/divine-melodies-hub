import { Bhajan, bhajans as appBhajans, deities as appDeities } from "@/data/bhajans";
import { generateBhajanSlug } from "@/lib/slugUtils";
import { naradSearchBhajans } from "@/lib/searchAlgorithm";
import { searchUserBhajans } from "@/lib/supabaseQueries";

export const NARAD_RESULT_LIMIT = 12;

export function convertUploadToBhajan(upload: any, index: number): Bhajan {
  const converted = {
    id: Number.parseInt(String(upload.id), 10) || 100000 + index,
    slug: generateBhajanSlug(upload.title || `uploaded-bhajan-${index}`),
    title: upload.title || "Untitled Bhajan",
    titleHindi: upload.title_hindi || upload.title || "",
    deityId: Number(upload.deity_id) || 0,
    singerName: upload.singer_name || "Unknown",
    composerName: upload.composer_name || "",
    youtubeUrl: upload.youtube_url || "",
    lyricsHindi: upload.lyrics_hindi || "",
    lyricsTransliteration: "",
    playCount: upload.play_count || 0,
    rating: upload.average_rating || 0,
    tags: upload.mood_tags || [],
    featured: false,
  } as Bhajan & { language?: string; aliases?: string[] };

  converted.language = upload.language || "";
  converted.aliases = upload.aliases || [];
  return converted;
}

export function dedupeBhajans(items: Bhajan[]): Bhajan[] {
  const seen = new Set<string>();
  return items.filter((bhajan) => {
    const key = `${bhajan.slug}-${bhajan.title.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function searchNaradCatalog(query: string, extra: Bhajan[] = []): Promise<Bhajan[]> {
  const term = query.trim();
  if (!term) return [];

  let apiBhajans: Bhajan[] = [];
  try {
    const rows = await searchUserBhajans(term, 20);
    apiBhajans = (rows || []).map(convertUploadToBhajan);
  } catch (error) {
    console.error("Narad catalog search failed:", error);
  }

  const pool = dedupeBhajans([...appBhajans, ...extra, ...apiBhajans]);
  return naradSearchBhajans(term, pool);
}

const DEITY_SLUGS: Record<string, string[]> = {
  Krishna: ["krishna"],
  Shiva: ["shiva"],
  Devi: ["durga", "lakshmi"],
  Ganesh: ["ganesh"],
  Hanuman: ["hanuman"],
  All: [],
};

export function filterCatalogByDeityName(deity: string): Bhajan[] {
  if (deity === "All") return appBhajans;
  const slugs = DEITY_SLUGS[deity] ?? [deity.toLowerCase()];
  const ids = new Set(appDeities.filter((d) => slugs.includes(d.slug)).map((d) => d.id));
  return appBhajans.filter((b) => ids.has(Number(b.deityId)));
}

export function filterCatalogByMoodTag(mood: string): Bhajan[] {
  const key = mood.toLowerCase().split(/\s+/)[0] || "";
  const tagged = appBhajans.filter((b) =>
    (b.tags || []).some((t) => String(t).toLowerCase().includes(key)),
  );
  if (tagged.length > 0) return tagged;
  return naradSearchBhajans(mood, appBhajans);
}

export function catalogAartis(): Bhajan[] {
  return naradSearchBhajans("aarti", appBhajans);
}

export function catalogOccasionSuggestions(date = new Date()): Bhajan[] {
  const day = date.getDay();
  const slug =
    day === 1 ? "shiva" : day === 2 || day === 6 ? "hanuman" : day === 3 ? "ganesh" : day === 5 ? "durga" : "krishna";
  const deity = appDeities.find((d) => d.slug === slug);
  if (!deity) return appBhajans.slice(0, NARAD_RESULT_LIMIT);
  return appBhajans.filter((b) => Number(b.deityId) === deity.id).slice(0, NARAD_RESULT_LIMIT);
}
