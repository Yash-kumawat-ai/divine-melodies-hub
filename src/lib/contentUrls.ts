import { getPublicSiteUrl } from '@/lib/env';

export type DevotionalCanonicalType =
  | 'bhajan'
  | 'aarti'
  | 'chalisa'
  | 'katha'
  | 'stotra'
  | 'ashtakam'
  | 'kavach'
  | 'doha'
  | 'mantra'
  | 'shloka'
  | 'rachana';

export interface ContentItemLike {
  slug?: string | null;
  id?: string | number | null;
  contentType?: string | null;
  content_type?: string | null;
  subType?: string | null;
  sub_type?: string | null;
  title?: string | null;
  titleHindi?: string | null;
  title_hindi?: string | null;
  custom_type?: string | null;
  tags?: string[] | null;
}

/**
 * Subtype determines the exact canonical URL namespace.
 * UPLOAD CATEGORY:
 * 1. Bhajan -> /bhajan/:slug
 * 2. Aarti -> /aarti/:slug
 * 3. Chalisa -> /chalisa/:slug
 * 4. Katha -> /katha/:slug
 * 5. Other -> Subtype determines:
 *    - Stotra -> /stotra/:slug
 *    - Ashtakam -> /ashtakam/:slug
 *    - Kavach -> /kavach/:slug
 *    - Doha -> /doha/:slug
 *    - Mantra -> /mantra/:slug
 *    - Shloka -> /shloka/:slug
 *    - Not listed / custom -> /rachana/:slug
 */
export function resolveCanonicalType(item?: ContentItemLike | null): DevotionalCanonicalType {
  if (!item) return 'bhajan';

  const rawType = (item.contentType || item.content_type || '').toLowerCase().trim();
  const rawSubType = (item.subType || item.sub_type || '').toLowerCase().trim();

  // 1. Direct Primary Content Types
  if (rawType === 'aarti') return 'aarti';
  if (rawType === 'katha') return 'katha';
  if (rawType === 'chalisa') return 'chalisa';

  // 2. Other / Divine Compositions (Subtype Driven)
  if (rawType === 'other' || rawType.includes('custom') || rawType === 'stotra') {
    if (rawSubType === 'stotra' || rawSubType === 'stotram') return 'stotra';
    if (rawSubType === 'ashtakam' || rawSubType === 'ashtak') return 'ashtakam';
    if (rawSubType === 'kavach' || rawSubType === 'raksha') return 'kavach';
    if (rawSubType === 'doha' || rawSubType === 'chaupai' || rawSubType === 'sortha') return 'doha';
    if (rawSubType === 'mantra' || rawSubType === 'beej_mantra') return 'mantra';
    if (rawSubType === 'shloka' || rawSubType === 'suktam') return 'shloka';
    if (rawSubType === 'chalisa') return 'chalisa';
    if (rawSubType === 'aarti') return 'aarti';
    
    // Controlled custom / unlisted fallback
    return 'rachana';
  }

  // 3. Fallback when type is generic or missing, but subType is provided
  if (rawSubType === 'kavach' || rawSubType === 'raksha') return 'kavach';
  if (rawSubType === 'ashtakam' || rawSubType === 'ashtak') return 'ashtakam';
  if (rawSubType === 'stotra' || rawSubType === 'stotram') return 'stotra';
  if (rawSubType === 'doha' || rawSubType === 'chaupai') return 'doha';
  if (rawSubType === 'mantra') return 'mantra';
  if (rawSubType === 'shloka') return 'shloka';
  if (rawSubType === 'aarti') return 'aarti';
  if (rawSubType === 'chalisa') return 'chalisa';

  // 4. Default
  return 'bhajan';
}

/**
 * Returns the route namespace prefix (e.g. "/aarti", "/chalisa", "/kavach").
 */
export function getCanonicalRoutePrefix(type: DevotionalCanonicalType): string {
  switch (type) {
    case 'aarti': return '/aarti';
    case 'chalisa': return '/chalisa';
    case 'katha': return '/katha';
    case 'stotra': return '/stotra';
    case 'ashtakam': return '/ashtakam';
    case 'kavach': return '/kavach';
    case 'doha': return '/doha';
    case 'mantra': return '/mantra';
    case 'shloka': return '/shloka';
    case 'rachana': return '/rachana';
    case 'bhajan':
    default: return '/bhajan';
  }
}

/**
 * Returns the relative in-app URL for any devotional content item.
 * Example: getContentUrl({ slug: 'sai-baba-aarti', contentType: 'aarti' }) -> "/aarti/sai-baba-aarti"
 */
export function getContentUrl(item: ContentItemLike): string {
  const type = resolveCanonicalType(item);
  const prefix = getCanonicalRoutePrefix(type);
  const slug = (item.slug || '').trim() || String(item.id || '');
  return `${prefix}/${slug}`;
}

/**
 * Returns the absolute canonical URL for SEO / OpenGraph / Sitemap.
 */
export function getCanonicalUrl(item: ContentItemLike, baseUrl?: string): string {
  const base = baseUrl || getPublicSiteUrl();
  return `${base}${getContentUrl(item)}`;
}

/**
 * Returns the collection / discovery route for a canonical content type.
 */
export function getCategoryCollectionUrl(type: DevotionalCanonicalType): string {
  switch (type) {
    case 'aarti': return '/aarti';
    case 'chalisa': return '/chalisa';
    case 'katha': return '/katha';
    case 'stotra': return '/stotra';
    case 'ashtakam': return '/ashtakam';
    case 'kavach': return '/kavach';
    case 'doha': return '/doha';
    case 'mantra': return '/mantra';
    case 'shloka': return '/shloka';
    case 'rachana': return '/rachana';
    case 'bhajan':
    default: return '/all-bhajans';
  }
}

/**
 * Localized human-readable label for a canonical content type.
 */
export function getCanonicalTypeLabel(type: DevotionalCanonicalType, isHi: boolean): string {
  switch (type) {
    case 'aarti': return isHi ? 'आरती' : 'Aarti';
    case 'chalisa': return isHi ? 'चालीसा' : 'Chalisa';
    case 'katha': return isHi ? 'कथा' : 'Katha';
    case 'stotra': return isHi ? 'स्तोत्र' : 'Stotra';
    case 'ashtakam': return isHi ? 'अष्टकम्' : 'Ashtakam';
    case 'kavach': return isHi ? 'कवच' : 'Kavach';
    case 'doha': return isHi ? 'दोहा' : 'Doha';
    case 'mantra': return isHi ? 'मंत्र' : 'Mantra';
    case 'shloka': return isHi ? 'श्लोक' : 'Shloka';
    case 'rachana': return isHi ? 'दिव्य रचना' : 'Divine Composition';
    case 'bhajan':
    default: return isHi ? 'भजन' : 'Bhajan';
  }
}
