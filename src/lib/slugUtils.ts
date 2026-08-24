import { bhajans, deities } from '@/data/bhajans';

export const STATIC_RESERVED_SLUGS = new Set([
  'live-aarti',
  'all-bhajans',
  'aarti-chalisa',
  'katha',
  'recent-bhajans',
  'meditation',
  'panchang',
  'temple',
  'shorts',
  'wallpaper',
  'community',
  'about',
  'privacy',
  'terms',
  'login',
  'signup',
  'search',
  'admin',
]);

export function isStaticCatalogSlug(slug: string): boolean {
  if (!slug) return false;
  const clean = slug.toLowerCase().trim();
  if (STATIC_RESERVED_SLUGS.has(clean)) return true;
  if (bhajans.some((b) => b.slug.toLowerCase() === clean)) return true;
  if (deities.some((d) => d.slug.toLowerCase() === clean || generateDeitySlug(d.name) === clean)) return true;
  return false;
}

export function generateDeitySlug(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, '-');
}

// Controlled noise phrases that represent promotional / format boilerplate rather than song titles
const CONTROLLED_NOISE_RE = /\b(?:official\s+video|official\s+audio|full\s+video|full\s+audio|with\s+lyrics|lyrics\s+video|lyric\s+video|hd\s+video|hd\s+audio|video\s+song|youtube|4k|8k)\b/gi;

/**
 * Pure English / ASCII slug generator:
 * - Strips YouTube channel formatting and strong delimiters (e.g. " || Channel", " | Label", " I Artist")
 * - Does NOT split on normal hyphens (preserves "Shri Ram - Siya Ram")
 * - Strips controlled video noise phrases while preserving meaningful words (bhajan, aarti, chalisa, geet, song, stotra, kirtan)
 * - Isolates the primary first clause
 * - Deduplicates consecutive identical word tokens in the slug
 * - Enforces clean lowercase hyphen-separated slug bounded to maxLength on word boundaries
 */
export function generateBhajanSlug(title: string, maxLength: number = 50): string {
  if (!title) return '';

  // 1. Strip hashtags
  let clean = title.replace(/#\S+/g, ' ').trim();

  // 2. Split on strong delimiters (||, |, //, •, ।, standalone ' I ')
  const strongParts = clean.split(/\s*(?:\|\||\||\/\/|\s+I\s+|•|।|–|—)\s*/);
  let primary = (strongParts[0] || '').trim() || clean;

  // 3. Extract primary first sentence/clause if separated by full stop or semicolon followed by whitespace
  const clauseParts = primary.split(/\s*(?:\.\s+|;\s+)/);
  primary = (clauseParts[0] || '').trim() || primary;

  // 4. Strip controlled video noise phrases
  primary = primary.replace(CONTROLLED_NOISE_RE, ' ');

  // 5. Clean non-ASCII, emojis, special characters (preserving alphanumeric, whitespace, hyphen)
  const asciiClean = primary
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!asciiClean) return '';

  // 6. Tokenize and deduplicate consecutive identical words in the slug
  const rawTokens = asciiClean.split(/\s+/).filter(Boolean);
  const dedupedTokens: string[] = [];
  for (let i = 0; i < rawTokens.length; i++) {
    const token = rawTokens[i];
    if (i === 0 || token !== rawTokens[i - 1]) {
      dedupedTokens.push(token);
    }
  }

  // 7. Accumulate tokens within maxLength respecting whole-word boundaries
  let slug = '';
  for (const token of dedupedTokens) {
    const candidate = slug ? `${slug}-${token}` : token;
    if (candidate.length <= maxLength) {
      slug = candidate;
    } else {
      if (!slug) {
        slug = token.slice(0, maxLength);
      }
      break;
    }
  }

  return slug.replace(/-+/g, '-').replace(/^-+|-+$/g, '');
}

export interface UploadSlugOptions {
  existingSlug?: string | null;
  title?: string | null;
  id?: string | number | null;
}

/**
 * Robust slug generator for user uploads with Permanent URL Immutability:
 * 1. Existing valid slug -> KEEP IT (never regenerate published URLs)
 * 2. English/public title -> generate clean ASCII slug
 * 3. Stable ID fallback -> bhajan-${cleanId} (for emergency legacy migration only)
 * Never returns empty string.
 */
export function generateUploadSlug({ existingSlug, title, id }: UploadSlugOptions): string {
  if (existingSlug && existingSlug.trim()) {
    return existingSlug.trim();
  }

  const fromEnglish = generateBhajanSlug(title || '');
  if (fromEnglish && fromEnglish.length >= 2) {
    return fromEnglish;
  }

  if (id) {
    const cleanId = String(id).replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
    if (cleanId) return `bhajan-${cleanId}`;
  }

  return `bhajan-${Date.now().toString(36)}`;
}

/**
 * Deterministic sequential collision resolver:
 * Tests baseSlug, baseSlug-2, baseSlug-3, ...
 * Checks BOTH static catalog and database until an available slug is found.
 */
export async function resolveUniqueSlug(
  baseSlug: string,
  isOccupiedInDb: (slugCandidate: string) => Promise<boolean>
): Promise<string> {
  const cleanBase = generateBhajanSlug(baseSlug) || 'bhajan';
  let candidate = cleanBase;
  let counter = 1;

  while (true) {
    const occupiedInStatic = isStaticCatalogSlug(candidate);
    if (!occupiedInStatic) {
      const occupiedInDb = await isOccupiedInDb(candidate);
      if (!occupiedInDb) {
        return candidate;
      }
    }
    counter += 1;
    candidate = `${cleanBase}-${counter}`;
  }
}

/** Shorten YouTube-style titles for UI (e.g. "Name || CHANNEL" → "Name"). */
export function formatBhajanDisplayTitle(title?: string | null, maxLength = 120): string {
  if (!title) return '';
  const primary = title.split(/\s*\|\|\s*|\s*\|\s*/)[0]?.trim() || title.trim();
  const normalized = primary.replace(/\s+/g, ' ');
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trim()}…`;
}
