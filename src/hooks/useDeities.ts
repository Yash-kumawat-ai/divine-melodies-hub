import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { deities as presetDeities } from '@/data/bhajans';

export interface Deity {
  id?: number;
  emoji: string;
  name: string;
  nameHindi?: string;
  description?: string;
  imageUrl?: string;
  slug?: string;
  isCustom?: boolean;
}

/**
 * Normalizes deity name for canonical matching across Hindi, English & honorific variations
 * e.g., "Khatu Shyam", "खाटू श्याम जी", "Khatu Shyam Ji" => "khatushyam"
 */
export function normalizeDeityKey(name: string): string {
  if (!name) return '';
  
  let str = name.trim().toLowerCase();

  // Common Hindi aliases
  if (str.includes('खाटू') || str.includes('श्याम')) return 'khatushyam';
  if (str.includes('कृष्ण') || str.includes('कान्हा') || str.includes('गोपाल')) return 'krishna';
  if (str.includes('शिव') || str.includes('महादेव') || str.includes('भोले')) return 'shiva';
  if (str.includes('हनुमान') || str.includes('बजरंग') || str.includes('बालाजी')) return 'hanuman';
  if (str.includes('राम') || str.includes('रघुनाथ')) return 'rama';
  if (str.includes('दुर्गा') || str.includes('अम्बे') || str.includes('माता')) return 'durga';
  if (str.includes('गणेश') || str.includes('गजानन') || str.includes('विनायक')) return 'ganesh';
  if (str.includes('साईं') || str.includes('साई')) return 'saibaba';
  if (str.includes('लक्ष्मी')) return 'lakshmi';

  // English cleanup of honorifics & extra punctuation
  str = str
    .replace(/\b(shree|shri|lord|bhagwan|bhagwaan|ji|jai|baba)\b/gi, '')
    .replace(/[^a-z0-9]/gi, '')
    .trim();

  return str || name.trim().toLowerCase();
}

/**
 * Merges and deduplicates preset & custom deities so no duplicate god appears in lists
 */
export function deduplicateDeities(deitiesList: Deity[]): Deity[] {
  const map = new Map<string, Deity>();

  for (const item of deitiesList) {
    const key = (item.slug ? item.slug.toLowerCase().replace(/[^a-z0-9]/g, '') : '') ||
      normalizeDeityKey(item.name) ||
      (item.nameHindi ? normalizeDeityKey(item.nameHindi) : String(item.id || Math.random()));

    if (!map.has(key)) {
      map.set(key, { ...item });
    } else {
      const existing = map.get(key)!;
      // Merge better attributes if missing
      if (!existing.imageUrl && item.imageUrl) {
        existing.imageUrl = item.imageUrl;
      }
      if (!existing.description && item.description) {
        existing.description = item.description;
      }
      if (!existing.nameHindi && item.nameHindi) {
        existing.nameHindi = item.nameHindi;
      }
    }
  }

  return Array.from(map.values());
}

function mapPresetToDeity(d: (typeof presetDeities)[number]): Deity {
  return {
    id: d.id,
    emoji: d.emoji,
    name: d.name,
    nameHindi: d.nameHindi,
    description: d.description,
    imageUrl: d.imageUrl,
    slug: d.slug,
  };
}

async function fetchCustomDeities(): Promise<Deity[]> {
  try {
    const { data, error } = await supabase
      .from('custom_deities')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching custom deities:', error);
      return deduplicateDeities(presetDeities.map(mapPresetToDeity));
    }

    const customDeities: Deity[] = (data ?? []).map((d: any) => ({
      id: d.id,
      emoji: d.emoji || '🙏',
      name: d.name,
      description: d.description,
      imageUrl: d.image_url,
      isCustom: true,
    }));

    const combined = [...presetDeities.map(mapPresetToDeity), ...customDeities];
    return deduplicateDeities(combined);
  } catch (err) {
    console.error('Unexpected error in fetchCustomDeities:', err);
    return deduplicateDeities(presetDeities.map(mapPresetToDeity));
  }
}

export function useDeities() {
  const query = useQuery({
    queryKey: ['custom_deities_combined'],
    queryFn: fetchCustomDeities,
    initialData: () => deduplicateDeities(presetDeities.map(mapPresetToDeity)),
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    deities: query.data,
    loading: query.isLoading && !query.data,
    error: query.error ? String(query.error) : null,
    refetch: query.refetch,
  };
}
