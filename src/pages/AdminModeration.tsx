import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  getPendingSubmissions,
  reviewSubmission,
  type AdminQueueFilters,
} from '@/lib/supabaseQueries';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Music, User2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import QueueStatsBar from '@/components/admin/QueueStatsBar';
import SubmissionDetailModal, { type QueueItem } from '@/components/admin/SubmissionDetailModal';

interface UserInfo {
  name: string;
  email: string;
}

export default function AdminModeration() {
  const { user, profile, mfaAal } = useAuth();
  const [items, setItems] = useState<QueueItem[]>([]);
  const [userMap, setUserMap] = useState<Record<string, UserInfo>>({});
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState<AdminQueueFilters>({
    submittedBy: '',
    language: 'All',
    status: 'All',
  });

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await getPendingSubmissions(filters);
      if (error) {
        toast.error('Failed to load queue', { description: error.message });
      }
      const queueItems = (data || []) as QueueItem[];
      setItems(queueItems);

      const userIds = [...new Set(queueItems.map((q) => q.user_id).filter(Boolean))];
      if (userIds.length > 0) {
        const { data: profiles } = await (supabase as any)
          .from('user_profiles')
          .select('id,name,email')
          .in('id', userIds);
        const map: Record<string, UserInfo> = {};
        (profiles || []).forEach((p: any) => {
          map[p.id] = { name: p.name || 'Unknown', email: p.email || '' };
        });
        setUserMap(map);
      }
    } catch {
      toast.error('Failed to load queue');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  useEffect(() => {
    const channel = supabase
      .channel('admin-queue-realtime')
      .on(
        'postgres_changes' as any,
        { event: '*', schema: 'public', table: 'user_uploads' },
        () => {
          loadQueue();
          setRefreshKey((k) => k + 1);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadQueue]);

  const handleDecision = async (
    id: string,
    status: 'approved' | 'rejected' | 'changes_requested',
    reason?: string,
  ) => {
    if (!user) return;
    if (profile?.mfa_enabled && mfaAal !== 'aal2') {
      toast.error('MFA required', {
        description: 'Complete a high-assurance session before moderation actions.',
      });
      return;
    }

    setProcessingId(id);
    try {
      const { error } = await reviewSubmission(
        {
          id,
          status,
          reason,
          actionUserAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        },
        user.id,
      );

      if (error) {
        toast.error('Action failed', { description: error.message });
      } else {
        const messages = {
          approved: 'Bhajan approved and published! It is now visible to everyone.',
          rejected: 'Bhajan rejected.',
          changes_requested: 'Changes requested from submitter.',
        };
        toast.success(messages[status]);
        setSelectedItem(null);
        await loadQueue();
        setRefreshKey((k) => k + 1);
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Moderation Queue
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review and approve bhajan submissions — click any item to open details
          </p>
        </div>

        <QueueStatsBar refreshKey={refreshKey} />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <Input
            placeholder="Filter by submitter..."
            value={filters.submittedBy || ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, submittedBy: e.target.value }))}
            className="border-orange-900/30 bg-[#2a1a08]"
          />
          <Select
            value={filters.language || 'All'}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, language: value }))}
          >
            <SelectTrigger className="border-orange-900/30 bg-[#2a1a08]">
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
            <SelectTrigger className="border-orange-900/30 bg-[#2a1a08]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="resubmitted">Resubmitted</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => { loadQueue(); setRefreshKey((k) => k + 1); }}
            className="border-orange-900/30 hover:bg-orange-500/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 border border-orange-900/20 rounded-xl bg-[#2a1a08]">
            <Music className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground font-medium">No pending submissions</p>
            <p className="text-xs text-muted-foreground mt-1">New uploads will appear here automatically</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const submitter = userMap[item.user_id];
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className="w-full text-left border border-orange-900/30 rounded-xl bg-[#2a1a08] p-4 hover:border-orange-500/50 hover:bg-[#2a1a08]/80 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground group-hover:text-orange-400 transition-colors truncate">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">{item.title_hindi}</p>

                      <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User2 className="w-3 h-3 shrink-0" />
                          <span className="text-orange-400 font-medium">{submitter?.name || item.singer_name}</span>
                        </span>
                        {submitter?.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 shrink-0" />
                            {submitter.email}
                          </span>
                        )}
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                        {item.language && <span>{item.language}</span>}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="shrink-0 text-[10px] uppercase border-orange-900/30"
                    >
                      {item.status}
                    </Badge>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <SubmissionDetailModal
        item={selectedItem}
        open={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        onAction={handleDecision}
        processing={processingId !== null}
      />
    </AdminLayout>
  );
}
