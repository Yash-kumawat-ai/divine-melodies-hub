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

  const handleToggleRsvp = (postId: string, currentRsvp: 'interested' | 'going' | null, clickedRsvp: 'interested' | 'going') => {
    if (!user) {
      toast.error(isHi ? "RSVP करने के लिए कृपया लॉग इन करें" : "Please log in to RSVP");
      return;
    }
    const newRsvp = currentRsvp === clickedRsvp ? null : clickedRsvp;

    // Instant optimistic update
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const currentCounts = {
        interested: p.rsvps_count?.interested || 0,
        going: p.rsvps_count?.going || 0,
      };
      if (currentRsvp === 'interested') currentCounts.interested = Math.max(0, currentCounts.interested - 1);
      if (currentRsvp === 'going') currentCounts.going = Math.max(0, currentCounts.going - 1);
      if (newRsvp === 'interested') currentCounts.interested += 1;
      if (newRsvp === 'going') currentCounts.going += 1;

      return {
        ...p,
        rsvp_status: newRsvp,
        rsvps_count: currentCounts,
      };
    }));

    if (newRsvp) {
      toast.success(isHi ? (newRsvp === 'interested' ? "रुचि दर्ज की गई" : "शामिल होना दर्ज किया गया") : `RSVP: ${newRsvp === 'interested' ? 'Interested' : 'Going'}`);
    } else {
      toast.success(isHi ? "RSVP हटा दिया गया" : "RSVP removed");
    }

    (async () => {
      try {
        if (currentRsvp === clickedRsvp) {
          await communityApi.deleteEventRsvp(postId, user.id);
        } else {
          await communityApi.createEventRsvp(postId, user.id, clickedRsvp);
        }
      } catch (err) {
        console.error("RSVP error:", err);
      }
    })();
  };

  const handleVoteOption = (postId: string, optionIndex: number) => {
    if (!user) {
      toast.error(isHi ? "मतदान करने के लिए कृपया लॉग इन करें" : "Please log in to vote");
      return;
    }

    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const percentages = (p.question_options || []).map((_, idx) =>
        idx === optionIndex ? 100 : 0
      );
      return {
        ...p,
        user_voted_option: optionIndex,
        vote_percentages: percentages,
      };
    }));

    toast.success(isHi ? "आपका मत दर्ज किया गया" : "Vote recorded");

    communityApi.castPollVote(postId, optionIndex, user.id).catch(err => {
      console.error("Vote error:", err);
    });
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
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#EFE4D7] dark:border-zinc-800 bg-white dark:bg-[#1E1710] text-[#32251E] dark:text-[#FFFDF8] hover:bg-[#FAF2E8] dark:hover:bg-[#2A1F14] shadow-sm transition-all active:scale-95"
          aria-label={t('back')}
        >
          <ArrowLeft className="h-5 w-5 text-[#6A2C2A] dark:text-[#E8B15C]" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF2E8] dark:bg-amber-950/40 border border-[#EFE4D7] dark:border-amber-950/50 shadow-sm">
            <Bookmark className="h-5 w-5 fill-[#D4A44A] text-[#D4A44A]" />
          </div>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#32251E] dark:text-[#FFFDF8]">
            {isHi ? "सहेजे गए विकल्प" : "Saved Options"}
          </h1>
        </div>
      </div>

      {!user ? (
        <div className="rounded-2xl border border-dashed border-[#EFE4D7] dark:border-zinc-800/80 p-8 text-center bg-white/80 dark:bg-[#1E1710]/80 shadow-sm backdrop-blur-sm">
          <p className="text-[#7A6B60] dark:text-[#D4C5B9] font-medium text-sm sm:text-base mb-4">{t('signInToLike')}</p>
          <Button asChild className="rounded-xl bg-gradient-to-b from-[#7A2D28] to-[#5A1F1A] hover:from-[#8A3E39] hover:to-[#6A2F2A] text-white shadow-md px-6 py-2.5">
            <Link to="/auth/login">{t('login')}</Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Sub Tabs */}
          <div className="flex gap-2 border-b border-[#EFE4D7] dark:border-zinc-800 pb-3.5 mb-6 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all border whitespace-nowrap flex items-center gap-1.5 shadow-sm ${
                activeTab === 'posts'
                  ? 'bg-gradient-to-r from-[#7A2D28] to-[#5A1F1A] dark:from-[#D4A44A] dark:to-[#E8B15C] text-white dark:text-zinc-950 border-transparent shadow-md'
                  : 'bg-white dark:bg-[#1E1710] text-[#7A6B60] dark:text-[#D4C5B9] border-[#EFE4D7] dark:border-zinc-800 hover:text-[#32251E] dark:hover:text-[#FFFDF8] hover:bg-[#FAF2E8] dark:hover:bg-[#2A1F14]'
              }`}
            >
              🌸 {isHi ? "सहेजे गए पोस्ट" : "Saved Posts"} ({savedPosts.length})
            </button>
            <button
              onClick={() => setActiveTab('bhajans')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all border whitespace-nowrap flex items-center gap-1.5 shadow-sm ${
                activeTab === 'bhajans'
                  ? 'bg-gradient-to-r from-[#7A2D28] to-[#5A1F1A] dark:from-[#D4A44A] dark:to-[#E8B15C] text-white dark:text-zinc-950 border-transparent shadow-md'
                  : 'bg-white dark:bg-[#1E1710] text-[#7A6B60] dark:text-[#D4C5B9] border-[#EFE4D7] dark:border-zinc-800 hover:text-[#32251E] dark:hover:text-[#FFFDF8] hover:bg-[#FAF2E8] dark:hover:bg-[#2A1F14]'
              }`}
            >
              🎵 {isHi ? "पसंदीदा भजन" : "Liked Bhajans"} ({likedBhajans.length})
            </button>
            <button
              onClick={() => setActiveTab('shorts')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all border whitespace-nowrap flex items-center gap-1.5 shadow-sm ${
                activeTab === 'shorts'
                  ? 'bg-gradient-to-r from-[#7A2D28] to-[#5A1F1A] dark:from-[#D4A44A] dark:to-[#E8B15C] text-white dark:text-zinc-950 border-transparent shadow-md'
                  : 'bg-white dark:bg-[#1E1710] text-[#7A6B60] dark:text-[#D4C5B9] border-[#EFE4D7] dark:border-zinc-800 hover:text-[#32251E] dark:hover:text-[#FFFDF8] hover:bg-[#FAF2E8] dark:hover:bg-[#2A1F14]'
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
                  <Loader2 className="w-8 h-8 animate-spin text-[#6A2C2A] dark:text-[#E8B15C] mb-3" />
                  <span className="text-xs text-[#7A6B60] dark:text-[#D4C5B9] font-medium">
                    {isHi ? "सहेजे गए पोस्ट लोड हो रहे हैं..." : "Loading saved posts..."}
                  </span>
                </div>
              ) : savedPosts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#EFE4D7] dark:border-zinc-800/80 p-10 sm:p-14 text-center bg-white/80 dark:bg-[#1E1710]/80 shadow-sm backdrop-blur-sm">
                  <span className="text-4xl block mb-3 opacity-90">🔖</span>
                  <p className="text-[#32251E] dark:text-[#FFFDF8] font-semibold text-base mb-1">
                    {isHi ? "अभी तक कोई पोस्ट नहीं सहेजी गई है।" : "No posts saved yet."}
                  </p>
                  <p className="text-[#7A6B60] dark:text-[#D4C5B9] text-xs sm:text-sm font-medium mb-4">
                    {isHi ? "कम्युनिटी से अपनी पसंदीदा पोस्ट सहेजें" : "Save your favorite posts from the community"}
                  </p>
                  <Button asChild variant="outline" className="rounded-xl border-[#EFE4D7] dark:border-zinc-800 bg-[#FCF8F2] dark:bg-[#2A1F14] text-[#6A2C2A] dark:text-[#E8B15C] hover:bg-[#FAF2E8] dark:hover:bg-[#34271A] font-semibold px-5 py-2 shadow-sm transition-all">
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
                        try {
                          await communityApi.softRemovePost(id);
                          loadPosts();
                        } catch (err) {
                          console.error("Delete post error:", err);
                        }
                      }}
                      onPostUpdated={loadPosts}
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
                <div className="rounded-2xl border border-dashed border-[#EFE4D7] dark:border-zinc-800/80 p-10 sm:p-14 text-center bg-white/80 dark:bg-[#1E1710]/80 shadow-sm backdrop-blur-sm">
                  <span className="text-4xl block mb-3 opacity-90">🎵</span>
                  <p className="text-[#32251E] dark:text-[#FFFDF8] font-semibold text-base mb-1">
                    {isHi ? "अभी तक कोई भजन पसंद नहीं किया गया है।" : "No liked bhajans yet."}
                  </p>
                  <p className="text-[#7A6B60] dark:text-[#D4C5B9] text-xs sm:text-sm font-medium mb-4">
                    {isHi ? "अपने मनपसंद भजनों को दिल वाले आइकन से लाइक करें" : "Like your favorite bhajans using the heart icon"}
                  </p>
                  <Button asChild variant="outline" className="rounded-xl border-[#EFE4D7] dark:border-zinc-800 bg-[#FCF8F2] dark:bg-[#2A1F14] text-[#6A2C2A] dark:text-[#E8B15C] hover:bg-[#FAF2E8] dark:hover:bg-[#34271A] font-semibold px-5 py-2 shadow-sm transition-all">
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
                  <Loader2 className="w-8 h-8 animate-spin text-[#6A2C2A] dark:text-[#E8B15C] mb-3" />
                  <span className="text-xs text-[#7A6B60] dark:text-[#D4C5B9] font-medium">
                    {isHi ? "सहेजे गए शॉर्ट्स लोड हो रहे हैं..." : "Loading saved shorts..."}
                  </span>
                </div>
              ) : savedShorts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#EFE4D7] dark:border-zinc-800/80 p-10 sm:p-14 text-center bg-white/80 dark:bg-[#1E1710]/80 shadow-sm backdrop-blur-sm">
                  <span className="text-4xl block mb-3 opacity-90">🎥</span>
                  <p className="text-[#32251E] dark:text-[#FFFDF8] font-semibold text-base mb-1">
                    {isHi ? "अभी तक कोई शॉर्ट्स नहीं सहेजे गए हैं।" : "No shorts saved yet."}
                  </p>
                  <p className="text-[#7A6B60] dark:text-[#D4C5B9] text-xs sm:text-sm font-medium mb-4">
                    {isHi ? "शॉर्ट्स वीडियो देखते समय उन्हें सहेजें" : "Save short videos while watching"}
                  </p>
                  <Button asChild variant="outline" className="rounded-xl border-[#EFE4D7] dark:border-zinc-800 bg-[#FCF8F2] dark:bg-[#2A1F14] text-[#6A2C2A] dark:text-[#E8B15C] hover:bg-[#FAF2E8] dark:hover:bg-[#34271A] font-semibold px-5 py-2 shadow-sm transition-all">
                    <Link to="/shorts">{isHi ? "शॉर्ट्स देखें" : "Browse Shorts"}</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                  {savedShorts.map((short) => (
                    <Link
                      key={short.id}
                      to={`/shorts/${short.video_id}`}
                      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#EFE4D7] dark:border-zinc-800 bg-white dark:bg-[#1E1710] shadow-sm hover:shadow-md transition-all hover:scale-[1.02]"
                    >
                      <div className="aspect-[9/16] relative w-full overflow-hidden bg-stone-950">
                        <img
                          src={short.thumbnail_url}
                          alt={short.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                        <span className="absolute bottom-2 left-2 text-[10px] font-black uppercase bg-[#7A2D28] text-white px-2 py-0.5 rounded-md shadow-md">
                          {short.channel_name}
                        </span>
                      </div>
                      <div className="p-2.5 flex-1 flex flex-col justify-between">
                        <h3 className="text-xs font-bold text-[#32251E] dark:text-[#FFFDF8] line-clamp-2 leading-snug">
                          {short.title}
                        </h3>
                        <p className="text-[10px] text-[#7A6B60] dark:text-[#D4C5B9] mt-1 font-medium truncate">
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
