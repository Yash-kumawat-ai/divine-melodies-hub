import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { getUserNotifications } from '@/lib/supabaseQueries';
import { Loader2 } from 'lucide-react';

interface NotificationRow {
  id: number;
  event_type: 'approved' | 'rejected' | 'changes_requested';
  subject: string;
  body: string;
  delivery_status: 'queued' | 'sent' | 'failed';
  sent_at?: string;
  created_at: string;
}

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
          <p className="text-muted-foreground mb-8">Moderation updates for your bhajan submissions.</p>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-16 border rounded-xl bg-card">
              <p className="text-muted-foreground">No notifications yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((row) => (
                <article key={row.id} className="border rounded-lg bg-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-semibold text-foreground">{row.subject}</h2>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary uppercase">
                      {row.event_type}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{row.body}</p>
                  <p className="text-xs text-muted-foreground mt-3">
                    {new Date(row.created_at).toLocaleString()} • Email: {row.delivery_status}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
