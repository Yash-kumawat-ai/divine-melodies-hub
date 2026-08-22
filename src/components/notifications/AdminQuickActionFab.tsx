import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Shield, Users, FileText } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useModerationPendingCount } from '@/hooks/useModerationNotificationQueries';
import { cn } from '@/lib/utils';
import { prefetchAdminPages } from '@/lib/prefetchAdminPages';

interface AdminQuickActionFabProps {
  isSuperAdmin: boolean;
}

export function AdminQuickActionFab({ isSuperAdmin }: AdminQuickActionFabProps) {
  const [open, setOpen] = useState(false);
  const { data: pending = 0 } = useModerationPendingCount(true);

  return (
    <div className="fixed bottom-5 right-4 z-[45] md:bottom-8 md:right-8" aria-label="Admin quick actions">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            size="icon"
            onPointerEnter={() => prefetchAdminPages()}
            className={cn(
              'relative h-14 w-14 rounded-full shadow-lg border border-border bg-primary text-primary-foreground hover:bg-primary/90',
            )}
            aria-expanded={open}
            aria-haspopup="dialog"
            title="Admin tools"
          >
            <LayoutDashboard className="h-6 w-6" />
            {pending > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground ring-2 ring-background">
                {pending > 99 ? '99+' : pending}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent side="top" align="end" className="w-56 p-2">
          <p className="px-2 pb-2 text-xs font-medium text-muted-foreground">Admin</p>
          <nav className="flex flex-col gap-1">
            <Link
              to="/admin/moderation"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"
            >
              <Shield className="h-4 w-4 shrink-0 text-primary" />
              Moderation
              {pending > 0 && (
                <span className="ml-auto tabular-nums text-xs text-destructive">{pending}</span>
              )}
            </Link>
            {isSuperAdmin && (
              <Link
                to="/admin/accounts"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"
              >
                <Users className="h-4 w-4 shrink-0 text-primary" />
                Accounts
              </Link>
            )}
            <Link
              to="/admin/audit"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"
            >
              <FileText className="h-4 w-4 shrink-0 text-primary" />
              Audit log
            </Link>
          </nav>
        </PopoverContent>
      </Popover>
    </div>
  );
}
