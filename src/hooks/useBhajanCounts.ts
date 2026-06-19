import { useCallback, useEffect, useMemo, useState } from 'react';
import { bhajans as staticBhajans } from '@/data/bhajans';
import { supabase } from '@/lib/supabaseClient';

type CountMap = Record<number, number>;

let channelSequence = 0;

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

export function useBhajanCounts() {
  const [uploadCountsByDeity, setUploadCountsByDeity] = useState<CountMap>({});
  const [approvedUploadCount, setApprovedUploadCount] = useState(0);

  const refreshCounts = useCallback(async () => {
    const { data, error, count } = await (supabase as any)
      .from('user_uploads')
      .select('deity_id', { count: 'exact' })
      .or('status.eq.approved,status.is.null')
      .limit(10000);

    if (error) {
      console.error('Error fetching bhajan counts:', error);
      return;
    }

    const nextUploadCounts = (data ?? []).reduce<CountMap>((counts, row: { deity_id: number | null }) => {
      if (typeof row.deity_id === 'number') {
        counts[row.deity_id] = (counts[row.deity_id] ?? 0) + 1;
      }
      return counts;
    }, {});

    setUploadCountsByDeity(nextUploadCounts);
    setApprovedUploadCount(count ?? data?.length ?? 0);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void refreshCounts();

    channelSequence += 1;
    const channel = (supabase as any)
      .channel(`live-bhajan-counts-${channelSequence}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_uploads' },
        () => {
          if (!cancelled) {
            void refreshCounts();
          }
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      try {
        channel.unsubscribe();
        void (supabase as any).removeChannel(channel);
      } catch {
        // Ignore errors when WebSocket is closed before connection is established
        // (common during React StrictMode double-render in development)
      }
    };
  }, [refreshCounts]);

  const countsByDeity = useMemo(() => mergeCounts(uploadCountsByDeity), [uploadCountsByDeity]);
  const totalCount = staticBhajans.length + approvedUploadCount;

  return {
    countsByDeity,
    totalCount,
    getDeityCount: (deityId: number) => countsByDeity[deityId] ?? 0,
    refreshCounts,
  };
}
