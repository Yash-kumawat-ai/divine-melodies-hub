import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { ProfileData } from '@/types/profile';

/**
 * Hook to derive profile display data for the drawer.
 */
export function useProfile(): ProfileData | null {
  const { user, profile } = useAuth();

  return useMemo<ProfileData | null>(() => {
    if (!user) return null;

    const name = profile?.name || user.email?.split('@')[0] || 'Devotee';

    return {
      id: user.id,
      name,
      email: user.email || '',
      avatarUrl: profile?.avatar_url,
      role: profile?.role,
      streak: 0,
      level: 'Devotee',
    };
  }, [user, profile]);
}
