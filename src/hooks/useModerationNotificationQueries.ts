import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getPendingUploadsCount,
  getRecentModerationNotifications,
  getUnreadModerationNotificationsCount,
  markMyModerationNotificationsRead,
} from '@/lib/supabaseQueries';

const POLL_MS = 60_000;

export const queryKeys = {
  pendingUploadCount: ['moderation', 'pending-upload-count'] as const,
  unreadNotifications: (userId: string) => ['user', 'moderation-notifications', 'unread', userId] as const,
  recentNotifications: (userId: string) => ['user', 'moderation-notifications', 'recent', userId] as const,
};

export function useModerationPendingCount(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.pendingUploadCount,
    queryFn: async () => {
      const { count, error } = await getPendingUploadsCount();
      if (error) throw error;
      return count;
    },
    enabled,
    refetchInterval: POLL_MS,
    staleTime: 30_000,
  });
}

export function useUnreadModerationNotifications(userId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: userId ? queryKeys.unreadNotifications(userId) : ['user', 'moderation-notifications', 'unread', 'none'],
    queryFn: async () => {
      if (!userId) return 0;
      const { count, error } = await getUnreadModerationNotificationsCount(userId);
      if (error) throw error;
      return count;
    },
    enabled: enabled && Boolean(userId),
    refetchInterval: POLL_MS,
    staleTime: 30_000,
  });
}

export function useRecentModerationNotifications(userId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: userId ? queryKeys.recentNotifications(userId) : ['user', 'moderation-notifications', 'recent', 'none'],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await getRecentModerationNotifications(userId, 15);
      if (error) throw error;
      return data ?? [];
    },
    enabled: enabled && Boolean(userId),
    refetchInterval: POLL_MS,
    staleTime: 30_000,
  });
}

export function useMarkModerationNotificationsRead() {
  const queryClient = useQueryClient();

  return useCallback(
    async (userId: string) => {
      const { error } = await markMyModerationNotificationsRead();
      if (error) throw error;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.unreadNotifications(userId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.recentNotifications(userId) }),
      ]);
    },
    [queryClient],
  );
}
