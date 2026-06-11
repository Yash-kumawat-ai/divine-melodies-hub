import liveAartiData from '../data/liveAartis.json';

const { allowedKeywords, blockedKeywords } = liveAartiData.contentFilter;

/**
 * Returns true if a live stream title is safe to show in Live Darshan.
 * Logic:
 *   - Must contain at least one allowed keyword
 *   - Must NOT contain any blocked keyword
 *   - Title check is case-insensitive
 */
export function isTitleDevotional(title: string): boolean {
  const lower = title.toLowerCase();

  // Fail immediately if any blocked keyword found
  const hasBlocked = blockedKeywords.some(kw => lower.includes(kw.toLowerCase()));
  if (hasBlocked) return false;

  // Must have at least one allowed keyword
  const hasAllowed = allowedKeywords.some(kw => lower.includes(kw.toLowerCase()));
  return hasAllowed;
}

/**
 * Returns true if a temple's live stream should be shown.
 *
 * For temples with requiresTitleFilter=false:
 *   Always trusted — show the stream.
 *   (Dedicated darshan channels like Somnath, Salangpur, Mayapur)
 *
 * For temples with requiresTitleFilter=true:
 *   MUST pass title filter before showing.
 *   (Mixed-content channels: DD Astro, DD National, Shyam Bhakti Rang)
 *
 * @param requiresTitleFilter - from temple data
 * @param liveTitle - the current live stream title (if available)
 */
export function shouldShowStream(
  requiresTitleFilter: boolean,
  liveTitle?: string | null
): boolean {
  if (!requiresTitleFilter) return true; // trusted channel

  // If filter required but no title available, do NOT show (safe default)
  if (!liveTitle) return false;

  return isTitleDevotional(liveTitle);
}
