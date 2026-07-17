import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Bookmark, Heart, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useLikedBhajans } from '@/hooks/useLikedBhajans';
import { useSavedPosts } from '@/hooks/useSavedPosts';
import BhajanCard from '@/components/BhajanCard';
import { PostCard } from '@/components/community/PostCard';
import { communityApi, type CommunityPost, type PostComment } from '@/lib/community/communityApi';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';
import { supabase } from '@/lib/supabaseClient';

export default function SavedPostsPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const isHi = language === 'hi';
  const navigate = useNavigate();

  // Saved Posts hook
  const { savedIds, isSaved, toggleSave } = useSavedPosts();

  // Liked Bhajans hook
  const { likedBhajans } = useLikedBhajans();

  // Active sub-tab: 'posts' | 'bhajans' | 'shorts'
  const [activeTab, setActiveTab] = useState<'posts' | 'bhajans' | 'shorts'>('posts');

  // Community posts data
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Saved Shorts data
  const [savedShorts, setSavedShorts] = useState<any[]>([]);
  const [loadingShorts, setLoadingShorts] = useState(false);

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

  const loadSavedShorts = async () => {
    if (!user) return;
    setLoadingShorts(true);
    try {
      const { data, error } = await supabase
        .from('shorts_interactions')
        .select(`
          short_id,
          shorts (
            id,
            video_id,
            title,
            thumbnail_url,
            whitelisted_channels (
              channel_name,
              handle
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('interaction_type', 'save');

      if (error) throw error;

      const formatted = (data || []).map((item: any) => {
        if (!item.shorts) return null;
        return {
          id: item.shorts.id,
          video_id: item.shorts.video_id,
          title: item.shorts.title,
          thumbnail_url: item.shorts.thumbnail_url,
          channel_name: item.shorts.whitelisted_channels?.channel_name || 'Creator',
          handle: item.shorts.whitelisted_channels?.handle || '@creator',
        };
      }).filter(Boolean);

      setSavedShorts(formatted);
    } catch (err) {
      console.error("Error loading saved shorts:", err);
    } finally {
      setLoadingShorts(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadPosts();
    }
  }, [user?.id]);

  useEffect(() => {
    if (user && activeTab === 'shorts') {
      loadSavedShorts();
    }
  }, [user?.id, activeTab]);

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
      toast.error(isHi ? "RSVP अपडेट करने में असमर्थ" : "Failed to update RSVP");
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
      toast.error(isHi ? "मतदान दर्ज करने में असमर्थ" : "Failed to register vote");
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
      toast.error(isHi ? "टिप्पणी हटाने में विफल" : "Failed to delete comment");
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
          <div className="flex gap-2 border-b border-[#2c2018] pb-3 mb-6 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border whitespace-nowrap ${
                activeTab === 'posts'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-md'
                  : 'bg-[#120e0c] text-stone-400 border-[#2c2018] hover:text-stone-200'
              }`}
            >
              🌸 {isHi ? "सहेजे गए पोस्ट" : "Saved Posts"} ({savedPosts.length})
            </button>
            <button
              onClick={() => setActiveTab('bhajans')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border whitespace-nowrap ${
                activeTab === 'bhajans'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-md'
                  : 'bg-[#120e0c] text-stone-400 border-[#2c2018] hover:text-stone-200'
              }`}
            >
              🎵 {isHi ? "पसंदीदा भजन" : "Liked Bhajans"} ({likedBhajans.length})
            </button>
            <button
              onClick={() => setActiveTab('shorts')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border whitespace-nowrap ${
                activeTab === 'shorts'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-md'
                  : 'bg-[#120e0c] text-stone-400 border-[#2c2018] hover:text-stone-200'
              }`}
            >
              🎥 {isHi ? "सहेजे गए शॉर्ट्स" : "Saved Shorts"} ({savedShorts.length})
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

          {/* Shorts Tab Content */}
          {activeTab === 'shorts' && (
            <>
              {loadingShorts ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-3" />
                  <span className="text-xs text-stone-400 font-medium">
                    {isHi ? "सहेजे गए शॉर्ट्स लोड हो रहे हैं..." : "Loading saved shorts..."}
                  </span>
                </div>
              ) : savedShorts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#2c2018] p-12 text-center bg-[#120e0c]/30">
                  <span className="text-4xl block mb-3">🎥</span>
                  <p className="text-stone-400 font-medium text-sm">
                    {isHi ? "अभी तक कोई शॉर्ट्स नहीं सहेजे गए हैं।" : "No shorts saved yet."}
                  </p>
                  <Button asChild variant="outline" className="mt-4 rounded-xl border-[#2c2018] bg-[#120e0c] text-stone-300 hover:text-white">
                    <Link to="/shorts">{isHi ? "शॉर्ट्स देखें" : "Browse Shorts"}</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                  {savedShorts.map((short) => (
                    <Link
                      key={short.id}
                      to={`/shorts/${short.video_id}`}
                      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#2c2018] bg-[#120e0c]/40 hover:border-orange-500/30 transition-all hover:scale-[1.02]"
                    >
                      <div className="aspect-[9/16] relative w-full overflow-hidden bg-stone-950">
                        <img
                          src={short.thumbnail_url}
                          alt={short.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                        <span className="absolute bottom-2 left-2 text-[10px] font-black uppercase bg-orange-500 text-white px-2 py-0.5 rounded-md shadow-md">
                          {short.channel_name}
                        </span>
                      </div>
                      <div className="p-2 flex-1 flex flex-col justify-between">
                        <h3 className="text-xs font-bold text-stone-200 line-clamp-2 leading-snug">
                          {short.title}
                        </h3>
                        <p className="text-[10px] text-stone-500 mt-1 font-medium truncate">
                          {short.handle}
                        </p>
                      </div>
                    </Link>
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
