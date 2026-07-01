import { Link, useLocation } from 'react-router-dom';
import { Shield, Users, FileText, Video } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useModerationPendingCount } from '@/hooks/useModerationNotificationQueries';
import { cn } from '@/lib/utils';
import PanchangHealthAlert from './PanchangHealthAlert';

const adminTabs = [
  { path: '/admin/moderation', label: 'Moderation', icon: Shield },
  { path: '/admin/channel-whitelist', label: 'Channels', icon: Video },
  { path: '/admin/accounts', label: 'Accounts', icon: Users },
  { path: '/admin/audit', label: 'Audit Log', icon: FileText },
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { profile } = useAuth();
  const { data: pendingCount = 0 } = useModerationPendingCount(true);

  const roleBadge =
    profile?.role === 'super_admin'
      ? 'Owner'
      : profile?.role === 'admin'
        ? 'Admin'
        : 'Moderator';

  return (
    <>
      <div className="sticky top-16 md:top-20 z-40 border-b border-orange-900/30 bg-[#1a1006]/95 backdrop-blur-md">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between h-12">
            <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide -mb-px">
              {adminTabs.map((tab) => {
                const isActive = pathname === tab.path;
                const Icon = tab.icon;
                const showBadge = tab.path === '/admin/moderation' && pendingCount > 0;

                if (tab.path === '/admin/accounts' && profile?.role !== 'super_admin') {
                  return null;
                }

                return (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    className={cn(
                      'flex items-center gap-2 px-3 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                      isActive
                        ? 'border-orange-500 text-orange-400'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-orange-500/40',
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {tab.label}
                    {showBadge && (
                      <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-600 px-1.5 text-[10px] font-bold text-white">
                        {pendingCount > 99 ? '99+' : pendingCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-orange-900/40 bg-orange-950/50 text-xs font-medium text-orange-400">
              {roleBadge}
            </span>
          </div>
        </div>
      </div>

      <main className="py-6 md:py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <PanchangHealthAlert />
          {children}
        </div>
      </main>
    </>
  );
}
