import { useCallback, useEffect, useState } from 'react';
import { bhajans, type Bhajan } from '@/data/bhajans';
import { useAuth } from '@/hooks/useAuth';

const STORAGE_PREFIX = 'hk_liked_catalog';

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}:${userId}`;
}

function readIds(userId: string): number[] {
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is number => typeof id === 'number');
  } catch {
    return [];
  }
}

function writeIds(userId: string, ids: number[]) {
  window.localStorage.setItem(storageKey(userId), JSON.stringify(ids));
}

export function useLikedBhajans() {
  const { user } = useAuth();
  const [likedIds, setLikedIds] = useState<number[]>([]);

  useEffect(() => {
    if (!user) {
      setLikedIds([]);
      return;
    }
    setLikedIds(readIds(user.id));
  }, [user?.id]);

  const isLiked = useCallback(
    (bhajanId: number) => likedIds.includes(bhajanId),
    [likedIds],
  );

  const toggleLike = useCallback(
    (bhajanId: number) => {
      if (!user) return false;
      const next = likedIds.includes(bhajanId)
        ? likedIds.filter((id) => id !== bhajanId)
        : [...likedIds, bhajanId];
      writeIds(user.id, next);
      setLikedIds(next);
      return next.includes(bhajanId);
    },
    [likedIds, user],
  );

  const likedBhajans: Bhajan[] = likedIds
    .map((id) => bhajans.find((b) => b.id === id))
    .filter((b): b is Bhajan => Boolean(b));

  return {
    user,
    likedIds,
    likedBhajans,
    isLiked,
    toggleLike,
  };
}
