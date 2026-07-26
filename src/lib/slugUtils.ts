/**
 * Consistent slug generation utility
 * Used across the entire app to ensure all slug generations are identical
 */

export function generateDeitySlug(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, '-');
}

export function generateBhajanSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/** Shorten YouTube-style titles for UI (e.g. "Name || CHANNEL" → "Name"). */
export function formatBhajanDisplayTitle(title?: string | null, maxLength = 120): string {
  if (!title) return '';
  const primary = title.split(/\s*\|\|\s*/)[0]?.trim() || title.trim();
  const normalized = primary.replace(/\s+/g, ' ');
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trim()}…`;
}
