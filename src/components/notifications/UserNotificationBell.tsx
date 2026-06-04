import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  useMarkModerationNotificationsRead,
  useRecentModerationNotifications,
  useUnreadModerationNotifications,
} from '@/hooks/useModerationNotificationQueries';
import { cn } from '@/lib/utils';

interface UserNotificationBellProps {
  userId: string;
}

export function UserNotificationBell({ userId }: UserNotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [markError, setMarkError] = useState<string | null>(null);

  const unreadQuery = useUnreadModerationNotifications(userId, true);
  const recentQuery = useRecentModerationNotifications(userId, true);
  const markRead = useMarkModerationNotificationsRead();

  const unread = unreadQuery.data ?? 0;
  const items = recentQuery.data ?? [];

  const handleOpenChange = async (next: boolean) => {
    setMarkError(null);
    setOpen(next);
    if (next && unread > 0) {
      try {
        await markRead(userId);
      } catch (e) {
        setMarkError(e instanceof Error ? e.message : 'Could not mark notifications read');
      }
    }
  };

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-foreground"
          aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
        >
          <Bell className="h-5 w-5" />
          {unreadQuery.isLoading ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center">
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            </span>
          ) : unread > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-destructive-foreground">
              {unread > 9 ? '9+' : unread}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0" onCloseAutoFocus={(e) => e.preventDefault()}>
        <div className="border-b border-border px-3 py-2">
          <p className="text-sm font-semibold text-foreground">Updates</p>
          <p className="text-xs text-muted-foreground">Bhajan moderation messages</p>
        </div>
        {markError && (
          <p className="border-b border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {markError}
          </p>
        )}
        <div className="max-h-72 overflow-y-auto">
          {recentQuery.isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : recentQuery.isError ? (
            <p className="px-3 py-6 text-center text-sm text-destructive">
              {(recentQuery.error as Error)?.message || 'Failed to load notifications'}
            </p>
          ) : items.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">No notifications yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((row: { id: string | number; subject: string; body: string; event_type: string; created_at: string; read: boolean }) => (
                <li key={row.id} className="px-3 py-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-snug text-foreground">{row.subject}</p>
                    <span
                      className={cn(
                        'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase',
                        row.read ? 'bg-muted text-muted-foreground' : 'bg-primary/15 text-primary',
                      )}
                    >
                      {row.event_type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{row.body}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {new Date(row.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t border-border p-2">
          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="block rounded-md px-2 py-2 text-center text-sm font-medium text-primary hover:bg-accent"
          >
            View all
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
