import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserBhajan {
  id: string;
  user_id: string;
  title: string;
  title_hindi: string;
  deity_id: number;
  singer_name: string;
  composer_name?: string;
  image_url?: string;
  youtube_url?: string;
  lyrics_hindi: string;
  created_at: string;
  status: string;
}

async function fetchApprovedUserBhajans(): Promise<UserBhajan[]> {
  try {
    const { data, error } = await supabase
      .from('user_uploads')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user bhajans from Supabase:', error);
      return [];
    }

    return (data as UserBhajan[]) || [];
  } catch (err) {
    console.error('Unexpected error fetching user bhajans:', err);
    return [];
  }
}

export function useUserUploads() {
  const query = useQuery({
    queryKey: ['approved_user_uploads'],
    queryFn: fetchApprovedUserBhajans,
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
    refetchOnWindowFocus: false,
  });

  return {
    userBhajans: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
