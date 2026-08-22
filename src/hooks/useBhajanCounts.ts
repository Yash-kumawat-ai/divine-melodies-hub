import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { bhajans as staticBhajans, deities } from '@/data/bhajans';
import { supabase } from '@/lib/supabaseClient';

type CountMap = Record<number, number>;

export const BHAJAN_COUNTS_QUERY_KEY = ['bhajan-counts'] as const;

const staticCountsByDeity = staticBhajans.reduce<CountMap>((counts, bhajan) => {
  counts[bhajan.deityId] = (counts[bhajan.deityId] ?? 0) + 1;
  return counts;
}, {});

function mergeCounts(uploadCountsByDeity: CountMap) {
  return Object.entries(uploadCountsByDeity).reduce<CountMap>(
    (counts, [deityId, count]) => {
      const id = Number(deityId);
      counts[id] = (counts[id] ?? 0) + count;
      return counts;
    },
    { ...staticCountsByDeity },
  );
}

const approvedFilter = 'status.eq.approved,status.is.null';

export async function fetchBhajanCounts(): Promise<{
  uploadCountsByDeity: CountMap;
  approvedUploadCount: number;
}> {
  const client = supabase as any;
  const deityIds = deities.map((d) => d.id);

  const [totalRes, ...perDeity] = await Promise.all([
    client
      .from('user_uploads')
      .select('id', { count: 'exact', head: true })
      .or(approvedFilter),
    ...deityIds.map((id) =>
      client
        .from('user_uploads')
        .select('id', { count: 'exact', head: true })
        .eq('deity_id', id)
        .or(approvedFilter),
    ),
  ]);

  if (totalRes.error) {
    console.error('Error fetching bhajan counts:', totalRes.error);
    return { uploadCountsByDeity: {}, approvedUploadCount: 0 };
  }

  const uploadCountsByDeity: CountMap = {};
  deityIds.forEach((id, index) => {
    const res = perDeity[index];
    if (!res?.error && typeof res.count === 'number') {
      uploadCountsByDeity[id] = res.count;
    }
  });

  return {
    uploadCountsByDeity,
    approvedUploadCount: totalRes.count ?? 0,
  };
}

export function useBhajanCounts() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: BHAJAN_COUNTS_QUERY_KEY,
    queryFn: fetchBhajanCounts,
    staleTime: 5 * 60 * 1000,
  });

  const countsByDeity = useMemo(
    () => mergeCounts(query.data?.uploadCountsByDeity ?? {}),
    [query.data?.uploadCountsByDeity],
  );
  const approvedUploadCount = query.data?.approvedUploadCount ?? 0;
  const totalCount = staticBhajans.length + approvedUploadCount;

  const refreshCounts = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: BHAJAN_COUNTS_QUERY_KEY });
  }, [queryClient]);

  return {
    countsByDeity,
    totalCount,
    getDeityCount: (deityId: number) => countsByDeity[deityId] ?? 0,
    refreshCounts,
  };
}
