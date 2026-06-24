import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Bookmark, Heart, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useLikedBhajans } from '@/hooks/useLikedBhajans';
import { useSavedPosts } from '@/hooks/useSavedPosts';
import BhajanCard from '@/components/BhajanCard';
import { PostCard } from '@/pages/JoinCommunityPage';
import { communityApi, type CommunityPost, type PostComment } from '@/lib/community/communityApi';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';

export default function SavedPostsPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const isHi = language === 'hi';
  const navigate = useNavigate();

  // Saved Posts hook
  const { savedIds, isSaved, toggleSave } = useSavedPosts();

  // Liked Bhajans hook
  const { likedBhajans } = useLikedBhajans();

  // Active sub-tab: 'posts' | 'bhajans'
  const [activeTab, setActiveTab] = useState<'posts' | 'bhajans'>('posts');

  // Community posts data
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Comments map and comment form state
  const [commentsMap, setCommentsMap] = useState<Record<string, PostComment[]>>({});
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [commentIsLyricsSubmit, setCommentIsLyricsSubmit] = useState(false);
  const [loadingCommentsPostIds, setLoadingCommentsPostIds] = useState<Record<string, boolean>>({});

  const loadPosts = async () => {
    if (!user) return;
    setLoadingPosts(true);
    try {
      const data = await communityApi.fetchPosts(user.id);
      setPosts(data);
    } catch (err) {
      console.error("Error loading posts in SavedPage:", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadPosts();
    }
  }, [user?.id]);

  // Filter posts to show only saved ones
  const savedPosts = useMemo(() => {
    return posts.filter(p => savedIds.includes(p.id));
  }, [posts, savedIds]);

  // Handlers for PostCard
  const handleToggleComments = async (postId: string) => {
    if (expandedCommentsPostId === postId) {
      setExpandedCommentsPostId(null);
    } else {
      setExpandedCommentsPostId(postId);
      const hasCached = !!commentsMap[postId];
      if (!hasCached) {
        setLoadingCommentsPostIds(prev => ({ ...prev, [postId]: true }));
      }
      try {
        const comments = await communityApi.fetchComments(postId);
        setCommentsMap(prev => ({ ...prev, [postId]: comments }));
      } catch (err) {
        console.error("Error fetching comments:", err);
      } finally {
        setLoadingCommentsPostIds(prev => ({ ...prev, [postId]: false }));
      }
    }
  };

  const handleToggleReaction = async (postId: string) => {
    if (!user) {
      toast.error(isHi ? "प्रतिक्रिया देने के लिए कृपया लॉग इन करें" : "Please log in to react");
      return;
    }
    // Optimistic Update
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          has_reacted: !p.has_reacted,
          reaction_count: p.reaction_count + (p.has_reacted ? -1 : 1)
        };
      }
      return p;
    }));

    try {
      await communityApi.togglePostReaction(postId, user.id);
    } catch {
      loadPosts();
    }
  };

  const handleToggleRsvp = async (postId: string, currentRsvp: 'interested' | 'going' | null, clickedRsvp: 'interested' | 'going') => {
    if (!user) {
      toast.error(isHi ? "RSVP करने के लिए कृपया लॉग इन करें" : "Please log in to RSVP");
      return;
    }
    try {
      if (currentRsvp === clickedRsvp) {
        await communityApi.deleteEventRsvp(postId, user.id);
        toast.success(isHi ? "RSVP हटा दिया गया" : "RSVP removed");
      } else {
        await communityApi.createEventRsvp(postId, user.id, clickedRsvp);
        toast.success(isHi ? "RSVP अपडेट किया गया" : "RSVP updated");
      }
      loadPosts();
    } catch {
      toast.error("Failed to update RSVP");
    }
  };

  const handleVoteOption = async (postId: string, optionIndex: number) => {
    if (!user) {
      toast.error(isHi ? "मतदान करने के लिए कृपया लॉग इन करें" : "Please log in to vote");
      return;
    }
    try {
      await communityApi.castPollVote(postId, optionIndex, user.id);
      toast.success(isHi ? "आपका मत दर्ज किया गया" : "Vote recorded");
      loadPosts();
    } catch {
      toast.error("Failed to register vote");
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      await communityApi.removeComment(commentId);
      setCommentsMap(prev => ({
        ...prev,
        [postId]: (prev[postId] || []).filter(c => c.id !== commentId)
      }));
      toast.success(isHi ? "टिप्पणी हटा दी गई!" : "Comment deleted!");
      loadPosts();
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!user) {
      toast.error(isHi ? "टिप्पणी करने के लिए कृपया लॉग इन करें" : "Please log in to add a comment");
      return;
    }
    if (!newCommentText.trim()) return;

    try {
      const added = await communityApi.createComment(postId, newCommentText.trim(), user.id, commentIsLyricsSubmit);
      const addedWithProfile = {
        ...added,
        author: {
          name: user.email?.split('@')[0] || "भक्त",
          role: "Devotee"
        }
      };
      setCommentsMap(prev => ({
        ...prev,
        [postId]: [addedWithProfile, ...(prev[postId] || [])]
      }));
      setNewCommentText("");
      toast.success(isHi ? "टिप्पणी जोड़ी गई!" : "Comment posted!");
      loadPosts();
    } catch (err: any) {
      const errMsg = err?.message || JSON.stringify(err);
      toast.error(isHi ? `टिप्पणी जोड़ने में असमर्थ: ${errMsg}` : `Failed to post comment: ${errMsg}`);
    }
  };

  const handleToggleSavePost = (postId: string) => {
    const saved = toggleSave(postId);
    if (saved) {
      toast.success(isHi ? "पोस्ट सहेजी गई!" : "Post saved!");
    } else {
      toast.success(isHi ? "सहेजे गए पोस्ट से हटाया गया" : "Removed from saved posts");
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-4 pb-24 md:pb-8">
      <SEO 
        title={isHi ? "सहेजे गए पोस्ट और भजन" : "Saved Posts & Bhajans"} 
        description="View your saved devotional posts and liked bhajans."
      />

      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#2c2018] bg-[#120e0c] text-stone-300 hover:text-white"
          aria-label={t('back')}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <Bookmark className="h-5 w-5 fill-amber-500 text-amber-500" />
          <h1 className="font-display text-xl font-bold text-foreground">
            {isHi ? "सहेजे गए विकल्प" : "Saved Options"}
          </h1>
        </div>
      </div>

      {!user ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-[#120e0c]/50">
          <p className="text-muted-foreground">{t('signInToLike')}</p>
          <Button asChild className="mt-4 rounded-xl">
            <Link to="/auth/login">{t('login')}</Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Sub Tabs */}
          <div className="flex gap-2 border-b border-[#2c2018] pb-3 mb-6">
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                activeTab === 'posts'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-md'
                  : 'bg-[#120e0c] text-stone-400 border-[#2c2018] hover:text-stone-200'
              }`}
            >
              🌸 {isHi ? "सहेजे गए पोस्ट" : "Saved Posts"} ({savedPosts.length})
            </button>
            <button
              onClick={() => setActiveTab('bhajans')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                activeTab === 'bhajans'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-md'
                  : 'bg-[#120e0c] text-stone-400 border-[#2c2018] hover:text-stone-200'
              }`}
            >
              🎵 {isHi ? "पसंदीदा भजन" : "Liked Bhajans"} ({likedBhajans.length})
            </button>
          </div>

          {/* Posts Tab Content */}
          {activeTab === 'posts' && (
            <>
              {loadingPosts ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-3" />
                  <span className="text-xs text-stone-400 font-medium">
                    {isHi ? "सहेजे गए पोस्ट लोड हो रहे हैं..." : "Loading saved posts..."}
                  </span>
                </div>
              ) : savedPosts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#2c2018] p-12 text-center bg-[#120e0c]/30">
                  <span className="text-4xl block mb-3">🔖</span>
                  <p className="text-stone-400 font-medium text-sm">
                    {isHi ? "अभी तक कोई पोस्ट नहीं सहेजी गई है।" : "No posts saved yet."}
                  </p>
                  <Button asChild variant="outline" className="mt-4 rounded-xl border-[#2c2018] bg-[#120e0c] text-stone-300 hover:text-white">
                    <Link to="/join-community">{isHi ? "कम्युनिटी देखें" : "Browse Community"}</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedPosts.map(post => (
                    <PostCard
                      key={post.id}
                      post={post}
                      user={user}
                      isHi={isHi}
                      comments={commentsMap[post.id] || []}
                      isCommentsExpanded={expandedCommentsPostId === post.id}
                      onToggleComments={handleToggleComments}
                      onToggleReaction={handleToggleReaction}
                      onToggleRsvp={handleToggleRsvp}
                      onVoteOption={handleVoteOption}
                      onDeleteComment={handleDeleteComment}
                      onAddComment={handleAddComment}
                      newCommentText={newCommentText}
                      setNewCommentText={setNewCommentText}
                      commentIsLyricsSubmit={commentIsLyricsSubmit}
                      setCommentIsLyricsSubmit={setCommentIsLyricsSubmit}
                      isLoadingComments={loadingCommentsPostIds[post.id]}
                      isPostSaved={true}
                      onToggleSavePost={handleToggleSavePost}
                      onDeletePost={async (id) => {
                        if (confirm(isHi ? "क्या आप इस पोस्ट को हटाना चाहते हैं?" : "Delete this post?")) {
                          await communityApi.softRemovePost(id);
                          loadPosts();
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Bhajans Tab Content */}
          {activeTab === 'bhajans' && (
            <>
              {likedBhajans.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#2c2018] p-12 text-center bg-[#120e0c]/30">
                  <span className="text-4xl block mb-3">🎵</span>
                  <p className="text-stone-400 font-medium text-sm">
                    {isHi ? "अभी तक कोई भजन पसंद नहीं किया गया है।" : "No liked bhajans yet."}
                  </p>
                  <Button asChild variant="outline" className="mt-4 rounded-xl border-[#2c2018] bg-[#120e0c] text-stone-300 hover:text-white">
                    <Link to="/all-bhajans">{isHi ? "भजन खोजें" : "Browse Bhajans"}</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {likedBhajans.map((bhajan) => (
                    <BhajanCard key={bhajan.id} bhajan={bhajan} />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
