import { useCallback, useEffect, useMemo, useState } from 'react';
import { bhajans, type Bhajan } from '@/data/bhajans';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { generateBhajanSlug } from '@/lib/slugUtils';

const STORAGE_PREFIX = 'hk_liked_catalog';
const CACHE_PREFIX = 'hk_liked_cache';
const IS_UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}:${userId}`;
}

function cacheKey(userId: string) {
  return `${CACHE_PREFIX}:${userId}`;
}

function readLocalIds(userId: string): string[] {
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((id) => String(id));
  } catch {
    return [];
  }
}

function writeLocalIds(userId: string, ids: string[]) {
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(ids));
  } catch {
    // Ignore storage errors
  }
}

function readCachedBhajans(userId: string): Bhajan[] {
  try {
    const raw = window.localStorage.getItem(cacheKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as Bhajan[];
  } catch {
    return [];
  }
}

function writeCachedBhajans(userId: string, items: Bhajan[]) {
  try {
    window.localStorage.setItem(cacheKey(userId), JSON.stringify(items));
  } catch {
    // Ignore storage errors
  }
}

export function useLikedBhajans() {
  const { user } = useAuth();
  const userId = user?.id || 'guest';

  const [likedIds, setLikedIds] = useState<string[]>(() => readLocalIds(userId));
  const [cachedUserBhajans, setCachedUserBhajans] = useState<Bhajan[]>(() => readCachedBhajans(userId));
  const [loading, setLoading] = useState(false);

  // Sync liked IDs from LocalStorage & Supabase database
  useEffect(() => {
    let isMounted = true;
    const localIds = readLocalIds(userId);
    setLikedIds(localIds);
    setCachedUserBhajans(readCachedBhajans(userId));

    if (!user) {
      setLoading(false);
      return;
    }

    const syncWithSupabase = async () => {
      try {
        setLoading(true);
        // Query user_likes table from Supabase ordered by newest first
        const { data: dbLikes, error } = await supabase
          .from('user_likes')
          .select('bhajan_id, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && dbLikes) {
          const dbIds = dbLikes.map((row: any) => String(row.bhajan_id));
          const merged = Array.from(new Set([...dbIds, ...localIds]));
          if (isMounted) {
            setLikedIds(merged);
            writeLocalIds(user.id, merged);
          }
        }
      } catch (err) {
        console.warn('Could not fetch user_likes table:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    syncWithSupabase();

    return () => {
      isMounted = false;
    };
  }, [user?.id, userId]);

  // Fast targeted fetch for user-uploaded bhajans matching liked UUIDs
  useEffect(() => {
    const uuidIds = likedIds.filter((id) => IS_UUID_REGEX.test(id));
    if (uuidIds.length === 0) {
      setCachedUserBhajans([]);
      writeCachedBhajans(userId, []);
      return;
    }

    let isMounted = true;
    const fetchTargetedUploads = async () => {
      try {
        const { data, error } = await supabase
          .from('user_uploads')
          .select('*')
          .in('id', uuidIds);

        if (!error && data && isMounted) {
          const mappedItems: Bhajan[] = (data as any[]).map((item) => ({
            id: item.id,
            slug: generateBhajanSlug(item.title),
            title: item.title,
            titleHindi: item.title_hindi || item.title,
            deityId: item.deity_id || 1,
            singerName: item.singer_name || 'पारंपरिक',
            composerName: item.composer_name || '',
            youtubeUrl: item.youtube_url || '',
            imageUrl: item.image_url || '',
            lyricsHindi: item.lyrics_hindi || '',
            lyricsTransliteration: '',
            playCount: item.play_count || 0,
            rating: item.average_rating || 5,
            tags: item.mood_tags || [],
            featured: false,
          }));

          setCachedUserBhajans(mappedItems);
          writeCachedBhajans(userId, mappedItems);
        }
      } catch (err) {
        console.warn('Could not fetch user_uploads for liked items:', err);
      }
    };

    fetchTargetedUploads();

    return () => {
      isMounted = false;
    };
  }, [likedIds, userId]);

  const isLiked = useCallback(
    (bhajanId: number | string) => likedIds.includes(String(bhajanId)),
    [likedIds],
  );

  const toggleLike = useCallback(
    async (bhajanId: number | string) => {
      const strId = String(bhajanId);
      const currentlyLiked = likedIds.includes(strId);
      // Prepend newly liked bhajan to the top of the list
      const next = currentlyLiked
        ? likedIds.filter((id) => id !== strId)
        : [strId, ...likedIds.filter((id) => id !== strId)];

      // Update local state & LocalStorage immediately
      setLikedIds(next);
      writeLocalIds(userId, next);

      if (currentlyLiked) {
        const updatedCache = cachedUserBhajans.filter((b) => String(b.id) !== strId);
        setCachedUserBhajans(updatedCache);
        writeCachedBhajans(userId, updatedCache);
      }

      // Persist to Supabase database user_likes table if logged in & valid UUID
      if (user && IS_UUID_REGEX.test(strId)) {
        try {
          if (currentlyLiked) {
            await supabase
              .from('user_likes')
              .delete()
              .eq('user_id', user.id)
              .eq('bhajan_id', strId);
          } else {
            await supabase
              .from('user_likes')
              .insert({ user_id: user.id, bhajan_id: strId });
          }
        } catch (err) {
          console.warn('Error syncing like with Supabase:', err);
        }
      }

      return !currentlyLiked;
    },
    [likedIds, cachedUserBhajans, user, userId],
  );

  // Map strictly in order (newest liked at top/position 0)
  const likedBhajans: Bhajan[] = useMemo(() => {
    const allAvailable = [...bhajans, ...cachedUserBhajans];
    const map = new Map<string, Bhajan>();
    allAvailable.forEach((b) => {
      map.set(String(b.id), b);
    });

    return likedIds
      .map((id) => map.get(id))
      .filter((b): b is Bhajan => Boolean(b));
  }, [likedIds, cachedUserBhajans]);

  return {
    user,
    likedIds,
    likedBhajans,
    isLiked,
    toggleLike,
    loading,
  };
}
