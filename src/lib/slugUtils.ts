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
