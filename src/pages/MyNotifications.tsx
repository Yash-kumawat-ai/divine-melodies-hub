import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { getUserNotifications } from '@/lib/supabaseQueries';
import { Loader2, Bell, CheckCircle2, XCircle, AlertTriangle, FileUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationRow {
  id: number;
  event_type: 'approved' | 'rejected' | 'changes_requested' | 'new_upload';
  subject: string;
  body: string;
  read: boolean;
  created_at: string;
}

const EVENT_ICON: Record<string, typeof Bell> = {
  approved: CheckCircle2,
  rejected: XCircle,
  changes_requested: AlertTriangle,
  new_upload: FileUp,
};

const EVENT_COLOR: Record<string, string> = {
  approved: 'text-green-500',
  rejected: 'text-red-500',
  changes_requested: 'text-amber-500',
  new_upload: 'text-blue-500',
};

export default function MyNotifications() {
  const { user } = useAuth();
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!user) {
        setRows([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data } = await getUserNotifications(user.id);
        setRows((data || []) as NotificationRow[]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-10 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">My Notifications</h1>
          <p className="text-muted-foreground mb-8">Updates about your bhajan submissions and moderation activity.</p>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-16 border rounded-xl bg-card">
              <Bell className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No notifications yet.</p>
              <p className="text-sm text-muted-foreground mt-1">You'll see updates here when bhajans are submitted or reviewed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((row) => {
                const Icon = EVENT_ICON[row.event_type] || Bell;
                const color = EVENT_COLOR[row.event_type] || 'text-muted-foreground';
                return (
                  <article
                    key={row.id}
                    className={cn(
                      'border rounded-lg bg-card p-4 transition-colors',
                      !row.read && 'border-primary/30 bg-primary/5',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={cn('w-5 h-5 mt-0.5 shrink-0', color)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h2 className="font-semibold text-foreground">{row.subject}</h2>
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary uppercase">
                            {row.event_type.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{row.body}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(row.created_at).toLocaleString()}
                          {!row.read && <span className="ml-2 text-primary font-medium">• New</span>}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
