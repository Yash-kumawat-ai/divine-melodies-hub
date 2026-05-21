import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { deities as presetDeities } from '@/data/bhajans';

export interface Deity {
  id?: number;
  emoji: string;
  name: string;
  nameHindi?: string;
  description?: string;
  imageUrl?: string;
  isCustom?: boolean;
}

function mapPresetToDeity(d: (typeof presetDeities)[number]): Deity {
  return {
    id: d.id,
    emoji: d.emoji,
    name: d.name,
    nameHindi: d.nameHindi,
    description: d.description,
    imageUrl: d.imageUrl,
  };
}

export function useDeities() {
  const [deities, setDeities] = useState<Deity[]>(() => presetDeities.map(mapPresetToDeity));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomDeities = async () => {
      try {
        const { data, error: dbError } = await supabase
          .from('custom_deities')
          .select('*')
          .order('created_at', { ascending: false });

        if (dbError) throw dbError;

        const customDeities = (data ?? []).map((d: any) => ({
          id: d.id,
          emoji: d.emoji,
          name: d.name,
          description: d.description,
          imageUrl: d.image_url,
          isCustom: true,
        }));

        setDeities([...presetDeities.map(mapPresetToDeity), ...customDeities]);
      } catch (err: any) {
        console.error('Error fetching custom deities:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomDeities();
  }, []);

  return { deities, loading, error };
}
