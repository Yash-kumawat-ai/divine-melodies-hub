import { generateUploadSlug } from '@/lib/slugUtils';
import { deities, type Bhajan } from '@/data/bhajans';

export interface UserUploadRow {
  id: string;
  user_id?: string;
  title?: string | null;
  title_hindi?: string | null;
  slug?: string | null;
  singer_name?: string | null;
  composer_name?: string | null;
  deity_id?: number | null;
  lyrics_hindi?: string | null;
  lyrics_transliteration?: string | null;
  image_url?: string | null;
  youtube_url?: string | null;
  content_type?: string | null;
  search_aliases?: string[] | string | null;
  play_count?: number | null;
  average_rating?: number | null;
  occasion?: string[] | null;
  mood_tags?: string[] | null;
  created_at?: string | null;
  status?: string | null;
}

export function mapUserUploadToBhajan(
  row: UserUploadRow,
  customDeitiesList?: Array<{ id: number; name: string; nameHindi?: string }>
): Bhajan & {
  source: 'user';
  sourceKey: string;
  search_aliases?: string[];
  contentType?: string;
  deityName?: string;
  deityNameHindi?: string;
} {
  const staticDeity = row.deity_id != null ? deities.find((d) => d.id === row.deity_id) : undefined;
  const customDeity = row.deity_id != null && customDeitiesList ? customDeitiesList.find((d) => d.id === row.deity_id) : undefined;
  
  const deityName = staticDeity?.name || customDeity?.name || '';
  const deityNameHindi = staticDeity?.nameHindi || customDeity?.nameHindi || '';

  const parsedAliases = Array.isArray(row.search_aliases)
    ? row.search_aliases
    : typeof row.search_aliases === 'string' && row.search_aliases.trim()
    ? row.search_aliases.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const slug = generateUploadSlug({
    existingSlug: row.slug,
    title: row.title,
    id: row.id,
  });

  return {
    id: row.id,
    slug,
    title: row.title || 'Devotional Song',
    titleHindi: row.title_hindi || row.title || 'भजन',
    deityId: row.deity_id || 0,
    lyricsHindi: row.lyrics_hindi || '',
    lyricsTransliteration: row.lyrics_transliteration || '',
    imageUrl: row.image_url || undefined,
    singerName: row.singer_name || 'Traditional',
    composerName: row.composer_name || undefined,
    playCount: row.play_count || 0,
    rating: row.average_rating || 5,
    tags: [...(row.occasion || []), ...(row.mood_tags || [])],
    featured: false,
    youtubeUrl: row.youtube_url || undefined,
    source: 'user',
    sourceKey: String(row.id),
    search_aliases: parsedAliases,
    contentType: row.content_type || 'bhajan',
    deityName,
    deityNameHindi,
  };
}
