import { useQuery } from '@tanstack/react-query';
import { bhajans as staticBhajans } from '@/data/bhajans';
import { supabase } from '@/lib/supabaseClient';

export const HOME_PUBLIC_STATS_KEY = ['home-public-stats'] as const;
export const HOME_COMMUNITY_BHAJANS_KEY = ['home-community-bhajans'] as const;
export const HOME_JAP_STATS_KEY = ['home-jap-stats'] as const;

const approvedFilter = 'status.eq.approved,status.is.null';

const HOME_BHAJAN_COLUMNS =
  'id, user_id, title, title_hindi, deity_id, singer_name, composer_name, image_url, youtube_url, lyrics_hindi, created_at, status, content_type';

export interface HomePublicStats {
  devotees: number;
  artists: number;
}

export interface HomeJapStats {
  members: number;
  totalJaps: number;
  todayParticipants: number;
}

export async function fetchHomePublicStats(): Promise<HomePublicStats> {
  const client = supabase as any;
  const [{ count: profileCount }, { data: uploadSingers, error }] = await Promise.all([
    client.from('user_profiles').select('id', { count: 'exact', head: true }),
    client.from('user_uploads').select('singer_name').or(approvedFilter),
  ]);

  if (error) {
    console.error('Error fetching singer names:', error);
  }

  const uniqueSingers = new Set(staticBhajans.map((b) => b.singerName.trim()).filter(Boolean));
  (uploadSingers ?? []).forEach((row: { singer_name?: string }) => {
    if (row.singer_name) uniqueSingers.add(row.singer_name.trim());
  });

  return {
    devotees: profileCount ?? 0,
    artists: uniqueSingers.size,
  };
}

export async function fetchHomeCommunityBhajans() {
  const client = supabase as any;
  const { data, error } = await client
    .from('user_uploads')
    .select(HOME_BHAJAN_COLUMNS)
    .or(approvedFilter)
    .or('content_type.eq.bhajan,content_type.is.null')
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) throw error;
  return data ?? [];
}

export async function fetchHomeJapStats(): Promise<HomeJapStats> {
  const client = supabase as any;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [{ count: memberCount }, { data: japTotals }, todayRes] = await Promise.all([
    client.from('user_profiles').select('id', { count: 'exact', head: true }),
    client.from('user_jap_totals').select('total_chants'),
    client
      .from('user_jap_totals')
      .select('user_id', { count: 'exact', head: true })
      .gte('last_session_at', todayStart.toISOString()),
  ]);

  const totalJaps = (japTotals ?? []).reduce(
    (sum: number, row: { total_chants?: number }) => sum + (Number(row.total_chants) || 0),
    0,
  );

  return {
    members: memberCount ?? 0,
    totalJaps,
    todayParticipants: todayRes.count ?? 0,
  };
}

export function useHomePublicStats() {
  return useQuery({
    queryKey: HOME_PUBLIC_STATS_KEY,
    queryFn: fetchHomePublicStats,
    staleTime: 5 * 60 * 1000,
  });
}

export function useHomeCommunityBhajans() {
  return useQuery({
    queryKey: HOME_COMMUNITY_BHAJANS_KEY,
    queryFn: fetchHomeCommunityBhajans,
    staleTime: 60 * 1000,
  });
}

export function useHomeJapStats() {
  return useQuery({
    queryKey: HOME_JAP_STATS_KEY,
    queryFn: fetchHomeJapStats,
    staleTime: 5 * 60 * 1000,
  });
}
