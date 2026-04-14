import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import {
  getPendingSubmissions,
  getPendingSubmissionsCount,
  reviewSubmission,
  type AdminQueueFilters,
} from '@/lib/supabaseQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface QueueItem {
  id: number;
  user_id: string;
  title: string;
  title_hindi: string;
  singer_name: string;
  language?: string;
  deity_id?: number;
  status: 'pending' | 'resubmitted';
  created_at: string;
  youtube_url?: string;
  admin_notes?: string;
  rejection_reason?: string;
  request_changes_notes?: string;
}

const extractYouTubeVideoId = (url: string) => {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&\n?#]+)/);
  return match?.[1] || null;
};

export default function AdminModeration() {
  const { user, profile, mfaAal } = useAuth();
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [filters, setFilters] = useState<AdminQueueFilters>({
    submittedBy: '',
    language: 'All',
    status: 'All',
  });

  const loadQueue = async () => {
    setLoading(true);
    try {
      const [{ data }, { count }] = await Promise.all([
        getPendingSubmissions(filters),
        getPendingSubmissionsCount(),
      ]);
      setItems((data || []) as QueueItem[]);
      setPendingCount(count || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.submittedBy, filters.language, filters.status]);

  const handleDecision = async (
    id: number,
    status: 'approved' | 'rejected' | 'changes_requested',
    reason?: string,
  ) => {
    if (!user) return;
    if (profile?.mfa_enabled && mfaAal !== 'aal2') {
      alert('MFA is enabled for your account. Complete a high-assurance session before moderation actions.');
      return;
    }
    setProcessingId(id);
    try {
      await reviewSubmission(
        {
          id,
          status,
          reason,
          actionUserAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        },
        user.id,
      );
      await loadQueue();
    } finally {
      setProcessingId(null);
    }
  };

  const queueStatsText = useMemo(() => {
    if (loading) return 'Loading pending queue...';
    return `${pendingCount} submissions awaiting moderation`;
  }, [loading, pendingCount]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-10 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Admin Moderation Queue
          </h1>
          <p className="text-muted-foreground mb-8">{queueStatsText}</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
            <Input
              placeholder="Filter by submitter"
              value={filters.submittedBy || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, submittedBy: e.target.value }))}
            />
            <Select
              value={filters.language || 'All'}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, language: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Languages</SelectItem>
                <SelectItem value="Hindi">Hindi</SelectItem>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Sanskrit">Sanskrit</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.status || 'All'}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Queue Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resubmitted">Resubmitted</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => loadQueue()}>Refresh Queue</Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 border rounded-lg bg-card">
              <p className="text-muted-foreground">No pending submissions right now.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {items.map((item) => {
                const videoId = item.youtube_url ? extractYouTubeVideoId(item.youtube_url) : null;
                return (
                  <article key={item.id} className="border rounded-xl p-4 md:p-5 bg-card space-y-3">
                    <div className="flex flex-wrap items-center gap-2 justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-foreground">{item.title}</h2>
                        <p className="text-muted-foreground">{item.title_hindi}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Submitted by {item.singer_name} • {new Date(item.created_at).toLocaleString()}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary uppercase">
                        {item.status}
                      </span>
                    </div>

                    {videoId && (
                      <div className="aspect-video rounded-lg overflow-hidden border">
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                          title={`Preview ${item.title}`}
                          className="w-full h-full"
                          allow="autoplay; encrypted-media; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Button
                        disabled={processingId === item.id}
                        onClick={() => handleDecision(item.id, 'approved')}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        disabled={processingId === item.id}
                        onClick={() => handleDecision(item.id, 'rejected', 'Rejected by admin review.')}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="secondary"
                        disabled={processingId === item.id}
                        onClick={() =>
                          handleDecision(item.id, 'changes_requested', 'Please improve metadata/lyrics and resubmit.')
                        }
                      >
                        Request Changes
                      </Button>
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
