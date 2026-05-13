import { useEffect, useState } from 'react';
import { Clock, CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { getQueueStats, type QueueStats } from '@/lib/supabaseQueries';
import { cn } from '@/lib/utils';

const cards = [
  { key: 'pending' as const, label: 'Pending', icon: Clock, color: 'text-orange-400 bg-orange-500/10 border-orange-900/30' },
  { key: 'approved' as const, label: 'Approved', icon: CheckCircle2, color: 'text-green-400 bg-green-500/10 border-green-900/30' },
  { key: 'rejected' as const, label: 'Rejected', icon: XCircle, color: 'text-red-400 bg-red-500/10 border-red-900/30' },
  { key: 'changesRequested' as const, label: 'Changes Req.', icon: AlertTriangle, color: 'text-amber-400 bg-amber-500/10 border-amber-900/30' },
];

interface QueueStatsBarProps {
  refreshKey?: number;
}

export default function QueueStatsBar({ refreshKey }: QueueStatsBarProps) {
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const { data } = await getQueueStats();
      if (!cancelled) {
        setStats(data);
        setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [refreshKey]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = stats?.[card.key] ?? 0;
        return (
          <div
            key={card.key}
            className={cn(
              'rounded-xl border p-4 flex items-center gap-3',
              card.color,
            )}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <div>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <p className="text-2xl font-bold tabular-nums">{value}</p>
              )}
              <p className="text-xs opacity-70">{card.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
