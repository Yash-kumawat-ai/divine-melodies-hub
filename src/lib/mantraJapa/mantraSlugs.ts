/**
 * Mantra Slugs Utility Module (Raghavam)
 * 
 * Provides:
 * 1. Canonical public mantra registry
 * 2. Dynamic URL helpers (data-driven, no hardcoded strings)
 * 3. Isolated legacy fallback resolver for old bookmarks/UUIDs
 */
import type { Mantra } from "./mantraJapaApi";

export interface CanonicalMantraDefinition {
  id: string;
  slug: string;
  name_english: string;
  name_hindi: string;
  deity: string;
}

/**
 * Curated list of all official built-in public mantras.
 * Single source of truth for canonical slugs and sitemap generation.
 */
export const CANONICAL_MANTRAS_LIST: CanonicalMantraDefinition[] = [
  {
    id: "om",
    slug: "om-chanting",
    name_english: "Om Chanting",
    name_hindi: "ॐ",
    deity: "shiva",
  },
  {
    id: "om_namah_shivaya",
    slug: "om-namah-shivaya",
    name_english: "Om Namah Shivaya",
    name_hindi: "ॐ नमः शिवाय",
    deity: "shiva",
  },
  {
    id: "mahamrityunjaya",
    slug: "maha-mrityunjaya-mantra",
    name_english: "Mahamrityunjaya Mantra",
    name_hindi: "महामृत्युंजय मंत्र",
    deity: "shiva",
  },
  {
    id: "hare_krishna",
    slug: "hare-krishna-mahamantra",
    name_english: "Hare Krishna Mahamantra",
    name_hindi: "हरे कृष्ण महामंत्र",
    deity: "krishna",
  },
  {
    id: "radhe_radhe",
    slug: "radhe-radhe",
    name_english: "Radhe Radhe",
    name_hindi: "राधे राधे",
    deity: "krishna",
  },
  {
    id: "jai_shree_ram",
    slug: "jai-shree-ram",
    name_english: "Jai Shree Ram",
    name_hindi: "जय श्री राम",
    deity: "rama",
  },
  {
    id: "om_namo_narayanaya",
    slug: "om-namo-narayanaya",
    name_english: "Om Namo Narayanaya",
    name_hindi: "ॐ नमो नारायणाय",
    deity: "rama",
  },
  {
    id: "gayatri",
    slug: "gayatri-mantra",
    name_english: "Gayatri Mantra",
    name_hindi: "गायत्री मंत्र",
    deity: "durga",
  },
  {
    id: "ganesha",
    slug: "shri-ganesha-mantra",
    name_english: "Shri Ganesha Mantra",
    name_hindi: "श्री गणेश मंत्र",
    deity: "ganesh",
  },
];

/**
 * Mapping of legacy identifiers (built-in IDs, common variations, aliases)
 * to their canonical slugs. Used ONLY in the legacy fallback path.
 */
const LEGACY_ID_TO_CANONICAL_SLUG: Record<string, string> = {
  // Built-in IDs
  om: "om-chanting",
  om_namah_shivaya: "om-namah-shivaya",
  mahamrityunjaya: "maha-mrityunjaya-mantra",
  hare_krishna: "hare-krishna-mahamantra",
  radhe_radhe: "radhe-radhe",
  jai_shree_ram: "jai-shree-ram",
  om_namo_narayanaya: "om-namo-narayanaya",
  gayatri: "gayatri-mantra",
  ganesha: "shri-ganesha-mantra",

  // Aliases and slug variants
  "om-chant": "om-chanting",
  "shiva-mantra": "om-namah-shivaya",
  "om-namah-shivay": "om-namah-shivaya",
  "mahamrityunjay": "maha-mrityunjaya-mantra",
  "mahamrityunjaya-mantra": "maha-mrityunjaya-mantra",
  "maha-mrityunjay": "maha-mrityunjaya-mantra",
  "hare-krishna": "hare-krishna-mahamantra",
  "hare-krishna-mantra": "hare-krishna-mahamantra",
  "radhe-radhe-govinda": "radhe-radhe",
  "ram-mantra": "jai-shree-ram",
  "jai-sita-ram": "jai-shree-ram",
  "narayana-mantra": "om-namo-narayanaya",
  "narayana": "om-namo-narayanaya",
  "gayatri_mantra": "gayatri-mantra",
  "gayatri-mahamantra": "gayatri-mantra",
  "ganesh-mantra": "shri-ganesha-mantra",
  "om-gam-ganapataye-namaha": "shri-ganesha-mantra",
};

/**
 * Generates a URL-safe kebab-case slug from any text.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Dynamic Canonical Path Helper
 * Given a mantra slug, returns the client route path: /meditation/mantra-japa/{slug}
 */
export function getMantraCanonicalPath(slug: string): string {
  const cleanSlug = slugify(slug || "om-namah-shivaya");
  return `/meditation/mantra-japa/${cleanSlug}`;
}

/**
 * Dynamic Canonical URL Helper
 * Given a mantra slug, returns the full absolute URL for SEO & Sharing
 */
export function getMantraCanonicalUrl(slug: string): string {
  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://raghavam.com";
  return `${origin}${getMantraCanonicalPath(slug)}`;
}

/**
 * Dynamic Personal Mantra Path Helper
 * Private namespace route: /meditation/mantra-japa/personal/{id}
 */
export function getPersonalMantraPath(personalId: string): string {
  return `/meditation/mantra-japa/personal/${encodeURIComponent(personalId.trim())}`;
}

/**
 * Resolves the official canonical slug for any mantra object or DB row.
 * Ensures consistent canonical URLs even when DB rows lack a slug column.
 */
export function getCanonicalMantraSlug(row: { id?: string; name_english?: string; slug?: string }): string {
  if (row.slug && row.slug.trim()) return row.slug.trim();
  const english = (row.name_english || "").trim().toLowerCase();
  const id = (row.id || "").trim().toLowerCase();
  
  const matched = CANONICAL_MANTRAS_LIST.find(
    (c) =>
      c.name_english.toLowerCase() === english ||
      c.id.toLowerCase() === id ||
      c.slug === slugify(english)
  );
  if (matched) return matched.slug;
  
  if (LEGACY_ID_TO_CANONICAL_SLUG[id]) return LEGACY_ID_TO_CANONICAL_SLUG[id];
  if (LEGACY_ID_TO_CANONICAL_SLUG[english]) return LEGACY_ID_TO_CANONICAL_SLUG[english];
  if (LEGACY_ID_TO_CANONICAL_SLUG[slugify(english)]) return LEGACY_ID_TO_CANONICAL_SLUG[slugify(english)];

  return slugify(row.name_english || row.id || "mantra");
}

/**
 * Legacy Fallback Resolver
 * 
 * Invoked ONLY when a direct match (mantras.find(m => m.slug === slug)) fails.
 * Attempts to find a mantra by:
 * 1. Legacy built-in ID or alias mapping
 * 2. Database internal ID (UUID or local ID)
 * 3. English name slugification
 */
export function resolveLegacyMantra(
  mantras: Mantra[],
  legacyParam: string
): Mantra | null {
  if (!legacyParam) return null;

  const normalized = legacyParam.trim().toLowerCase();

  // 1. Check if the parameter matches a known legacy ID or alias
  const targetCanonicalSlug = LEGACY_ID_TO_CANONICAL_SLUG[normalized];
  if (targetCanonicalSlug) {
    const found = mantras.find(
      (m) =>
        m.slug === targetCanonicalSlug ||
        getCanonicalMantraSlug(m) === targetCanonicalSlug
    );
    if (found) return found;
  }

  // 2. Check if the parameter matches a mantra's internal ID (UUID or local ID)
  const idMatch = mantras.find((m) => m.id === legacyParam || m.id.toLowerCase() === normalized);
  if (idMatch) return idMatch;

  // 3. Check if parameter matches canonical slug or slugified name_english
  const nameMatch = mantras.find(
    (m) =>
      getCanonicalMantraSlug(m) === normalized ||
      slugify(m.name_english) === normalized ||
      m.name_english.toLowerCase() === normalized
  );
  if (nameMatch) return nameMatch;

  return null;
}
