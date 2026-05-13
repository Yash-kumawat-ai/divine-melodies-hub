import { Loader2 } from 'lucide-react';
import { useModerationPendingCount } from '@/hooks/useModerationNotificationQueries';
import { cn } from '@/lib/utils';

interface ModerationQueueBadgeProps {
  enabled: boolean;
  className?: string;
}

/**
 * Live count of uploads with `status = 'pending'` (polls every 60s via shared React Query).
 */
export function ModerationQueueBadge({ enabled, className }: ModerationQueueBadgeProps) {
  const { data: count = 0, isLoading, isError, error, refetch, isFetching } = useModerationPendingCount(enabled);

  if (!enabled) return null;

  return (
    <button
      type="button"
      onClick={() => refetch()}
      title={isError ? String(error) : 'Pending moderation queue (tap to refresh)'}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors',
        className,
      )}
    >
      <span className="text-muted-foreground">Queue</span>
      {isLoading && !isFetching ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" aria-hidden />
      ) : (
        <span
          className={cn(
            'tabular-nums font-semibold',
            count > 0 ? 'text-destructive' : 'text-muted-foreground',
          )}
        >
          {isError ? '—' : count}
        </span>
      )}
    </button>
  );
}
