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
import { Loader2, RefreshCw, Music, User2, Mail, MessageSquare, CheckSquare, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import QueueStatsBar from '@/components/admin/QueueStatsBar';
import SubmissionDetailModal, { type QueueItem } from '@/components/admin/SubmissionDetailModal';
import { communityApi, type CommunityPost, type PostComment } from '@/lib/community/communityApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

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

  // Community Requests Moderation State
  const [activeAdminTab, setActiveAdminTab] = useState<'submissions' | 'community_requests'>('submissions');
  const [requests, setRequests] = useState<CommunityPost[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CommunityPost | null>(null);
  const [requestComments, setRequestComments] = useState<PostComment[]>([]);
  const [selectedLyricsId, setSelectedLyricsId] = useState<string | null>(null);
  const [selectedLyricsContent, setSelectedLyricsContent] = useState("");
  const [resolvingRequest, setResolvingRequest] = useState(false);

  const loadRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const allPosts = await communityApi.fetchPosts(user?.id, { type: 'bhajan_request' });
      const pending = allPosts.filter(p => p.request_status === 'lyrics_submitted' || p.request_status === 'in_review');
      setRequests(pending);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load community requests queue');
    } finally {
      setLoadingRequests(false);
    }
  }, [user?.id]);

  const handleOpenRequestDetails = async (post: CommunityPost) => {
    setSelectedRequest(post);
    const comments = await communityApi.fetchComments(post.id);
    const lyricsSubmissions = comments.filter(c => c.is_lyrics_submission);
    setRequestComments(lyricsSubmissions);
    if (lyricsSubmissions.length > 0) {
      setSelectedLyricsId(lyricsSubmissions[0].id);
      setSelectedLyricsContent(lyricsSubmissions[0].content);
    } else {
      setSelectedLyricsId(null);
      setSelectedLyricsContent("");
    }
  };

  const handleMoveToLibrary = async () => {
    if (!selectedRequest || !user) return;
    if (!selectedLyricsContent.trim()) {
      toast.error("Please select or enter the lyrics to upload.");
      return;
    }
    setResolvingRequest(true);
    try {
      await communityApi.adminResolveRequestToLibrary(
        selectedRequest.id,
        selectedLyricsContent,
        selectedRequest.title || "Community Requested Bhajan",
        user.id
      );
      toast.success("Lyrics moved to Library moderation queue. Approve it in the standard queue to publish!");
      setSelectedRequest(null);
      loadRequests();
    } catch (e: any) {
      toast.error("Failed to move to library: " + (e.message || ""));
    } finally {
      setResolvingRequest(false);
    }
  };

  const handleRejectRequestSubmission = async () => {
    if (!selectedRequest) return;
    setResolvingRequest(true);
    try {
      await communityApi.adminRejectRequestSubmission(selectedRequest.id);
      toast.success("Submissions rejected. Request reset to Open.");
      setSelectedRequest(null);
      loadRequests();
    } catch {
      toast.error("Failed to reject submissions.");
    } finally {
      setResolvingRequest(false);
    }
  };

  useEffect(() => {
    if (activeAdminTab === 'community_requests') {
      loadRequests();
    }
  }, [activeAdminTab, loadRequests]);

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
    let cancelled = false;
    const channel = supabase
      .channel('admin-queue-realtime')
      .on(
        'postgres_changes' as any,
        { event: '*', schema: 'public', table: 'user_uploads' },
        () => {
          if (!cancelled) {
            loadQueue();
            setRefreshKey((k) => k + 1);
          }
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      try {
        channel.unsubscribe();
        supabase.removeChannel(channel);
      } catch {
        // Ignore WebSocket cleanup errors (React StrictMode)
      }
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

        // Auto-resolve community request link if status is approved
        if (status === 'approved') {
          try {
            await supabase
              .from('community_posts')
              .update({ request_status: 'added_to_library' })
              .eq('resolved_bhajan_id', isNaN(Number(id)) ? id : Number(id));
          } catch (e) {
            console.warn("Could not auto-advance community request:", e);
          }
        }

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
            Moderation Portal
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review bhajan library uploads and community satsang bhajan requests.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-orange-900/30 gap-2">
          <button
            onClick={() => setActiveAdminTab('submissions')}
            className={`pb-3.5 px-4 font-bold text-sm transition-all border-b-2 ${
              activeAdminTab === 'submissions'
                ? 'text-orange-400 border-orange-500'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            Library Submissions ({items.length})
          </button>
          <button
            onClick={() => setActiveAdminTab('community_requests')}
            className={`pb-3.5 px-4 font-bold text-sm transition-all border-b-2 ${
              activeAdminTab === 'community_requests'
                ? 'text-orange-400 border-orange-500'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            Bhajan Requests ({requests.length})
          </button>
        </div>

        {activeAdminTab === 'submissions' ? (
          <>
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
          </>
        ) : (
          // Bhajan Requests Board Tab
          <>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                Bhajan requests with submitted lyrics waiting for review.
              </span>
              <Button
                variant="outline"
                onClick={loadRequests}
                className="border-orange-900/30 hover:bg-orange-500/10 h-8 text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                Refresh Board
              </Button>
            </div>

            {loadingRequests ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-20 border border-orange-900/20 rounded-xl bg-[#2a1a08]">
                <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground font-medium">No requests waiting review</p>
                <p className="text-xs text-muted-foreground mt-1">Bhajan requests will appear here when devotees submit lyrics.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => (
                  <button
                    key={req.id}
                    type="button"
                    onClick={() => handleOpenRequestDetails(req)}
                    className="w-full text-left border border-orange-900/30 rounded-xl bg-[#2a1a08] p-4 hover:border-orange-500/50 hover:bg-[#2a1a08]/80 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground group-hover:text-orange-400 transition-colors truncate">
                          {req.title}
                        </h3>
                        <p className="text-sm text-stone-400 line-clamp-1 mt-1">{req.content}</p>
                        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="font-semibold text-orange-400">
                            Requested by {req.author?.display_name || 'User'}
                          </span>
                          <span>•</span>
                          <span>{new Date(req.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="shrink-0 text-[10px] border-amber-500/30 text-amber-500 capitalize">
                        {req.request_status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── MODAL: BHAJAN REQUEST REVIEW ─────────────────────────── */}
      <Dialog open={selectedRequest !== null} onOpenChange={(o) => { if (!o) setSelectedRequest(null); }}>
        <DialogContent className="max-w-xl bg-[#1e130c] border-orange-900/40 text-stone-50 rounded-3xl p-6 max-h-[85vh] overflow-y-auto">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display font-extrabold text-lg text-orange-400 text-center">
                  Review Submissions: {selectedRequest.title}
                </DialogTitle>
                <DialogDescription className="text-center text-xs text-stone-400 mt-1">
                  Read and approve the lyrics submitted by the community.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-4">
                <div className="p-3 bg-[#2a1a08] rounded-xl border border-orange-900/30">
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">Request Context</span>
                  <p className="text-xs mt-1 text-stone-300 italic">"{selectedRequest.content}"</p>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-stone-300 block">Submitted Lyrics Comments</span>
                  {requestComments.length === 0 ? (
                    <p className="text-xs text-stone-500 text-center py-4 bg-[#2a1a08]/40 rounded-xl">
                      No comments flagged as lyrics submissions.
                    </p>
                  ) : (
                    <div className="space-y-2.5 max-h-40 overflow-y-auto">
                      {requestComments.map(c => {
                        const isSelected = selectedLyricsId === c.id;
                        return (
                          <div 
                            key={c.id} 
                            onClick={() => {
                              setSelectedLyricsId(c.id);
                              setSelectedLyricsContent(c.content);
                            }}
                            className={`p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                              isSelected 
                                ? 'bg-orange-500/10 border-orange-500' 
                                : 'bg-[#2a1a08]/50 border-orange-900/15 hover:border-orange-500/35'
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold text-orange-400 text-[10px] mb-1">
                              <span>Submitted by {c.author?.display_name || "User"}</span>
                              {isSelected && <span>Selected Choice</span>}
                            </div>
                            <p className="text-stone-300 font-medium whitespace-pre-wrap line-clamp-3">{c.content}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-300">Edit / Review Lyrics Content</label>
                  <textarea
                    rows={6}
                    value={selectedLyricsContent}
                    onChange={(e) => setSelectedLyricsContent(e.target.value)}
                    placeholder="Select a submission above to load or type lyrics manually..."
                    className="w-full text-xs font-medium rounded-xl border border-orange-900/30 bg-[#2a1a08] p-3 text-stone-100 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedRequest(null)}
                  className="flex-1 rounded-xl border-orange-900/20"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleRejectRequestSubmission}
                  disabled={resolvingRequest}
                  className="flex-1 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl"
                >
                  Reject Submission
                </Button>
                <Button
                  type="button"
                  onClick={handleMoveToLibrary}
                  disabled={resolvingRequest || !selectedLyricsContent.trim()}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl"
                >
                  {resolvingRequest ? "Moving..." : "Move to Library"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

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
