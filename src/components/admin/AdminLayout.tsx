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
    <div className="min-h-screen bg-[#FCF8F2] dark:bg-[#120A04] text-[#32251E] dark:text-[#FFFDF8] transition-colors">
      {/* Pinned Sticky Header */}
      <div className="sticky top-0 z-30 border-b border-[#EFE4D7] dark:border-orange-900/30 bg-white/95 dark:bg-[#1A1006]/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between h-14">
            <nav className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide -mb-px">
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
                      'flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold whitespace-nowrap rounded-xl transition-all',
                      isActive
                        ? 'bg-[#7A2D28] text-white dark:bg-[#E8B15C] dark:text-zinc-950 shadow-sm'
                        : 'text-[#7A6B60] dark:text-stone-400 hover:text-[#32251E] dark:hover:text-stone-100 hover:bg-[#FAF2E8] dark:hover:bg-amber-950/40'
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                    {showBadge && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 dark:bg-red-500 px-1.5 text-[10px] font-extrabold text-white shadow-xs">
                        {pendingCount > 99 ? '99+' : pendingCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#EFE4D7] dark:border-orange-900/40 bg-[#FAF2E8] dark:bg-amber-950/50 text-xs font-bold text-[#7A2D28] dark:text-orange-400">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>{roleBadge}</span>
            </span>
          </div>
        </div>
      </div>

      <main className="py-6 md:py-8 px-4">
        <div className="container mx-auto max-w-6xl space-y-6">
          <PanchangHealthAlert />
          {children}
        </div>
      </main>
    </div>
  );
}
