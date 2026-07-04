import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Loader2, Film } from 'lucide-react';
import { toast } from 'sonner';
import ShortsPlayer from '@/components/shorts/ShortsPlayer';
import { cn } from '@/lib/utils';
import { SEO } from '@/components/SEO';

interface ShortItem {
  id: string;
  video_id: string;
  channel_id: string;
  title: string;
  description?: string;
  thumbnail_url: string;
  whitelisted_channels: {
    channel_name: string;
    handle?: string;
    category?: string;
  };
}

export default function ShortsFeed() {
  const { user } = useAuth();
  const { videoId } = useParams<{ videoId?: string }>();
  
  const [shorts, setShorts] = useState<ShortItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Interaction mapping states
  const [likedVideoIds, setLikedVideoIds] = useState<Set<string>>(new Set());
  const [savedVideoIds, setSavedVideoIds] = useState<Set<string>>(new Set());
  const [likesCountMap, setLikesCountMap] = useState<Record<string, number>>({});

  const containerRef = useRef<HTMLDivElement>(null);

  // Load Shorts and Curation details
  const loadShorts = useCallback(async (catFilter = selectedCategory) => {
    setLoading(true);
    try {
      // Query shorts from active channels
      let query = supabase
        .from('shorts')
        .select('id, video_id, title, description, thumbnail_url, whitelisted_channels!inner(channel_name, status, handle, category)')
        .eq('whitelisted_channels.status', 'active')
        .eq('hidden', false);

      if (videoId) {
        query = query.eq('video_id', videoId);
      } else if (catFilter !== 'all') {
        query = query.eq('whitelisted_channels.category', catFilter);
      }

      query = query.order('published_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      const formattedShorts = (data || []).map((s: any) => ({
        id: s.id, // Database UUID (used for internal relationships)
        video_id: s.video_id, // YouTube Video ID (used for player embed)
        title: s.title,
        description: s.description,
        thumbnail_url: s.thumbnail_url,
        whitelisted_channels: {
          channel_name: s.whitelisted_channels?.channel_name || 'Creator',
          handle: s.whitelisted_channels?.handle,
          category: s.whitelisted_channels?.category,
        }
      }));

      setShorts(formattedShorts);
      setActiveIndex(0);
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }

      // Fetch interactions (Likes Count) using short_id
      const { data: counts, error: countsError } = await supabase
        .from('shorts_interactions')
        .select('short_id, interaction_type');

      if (countsError) throw countsError;

      const countsMap: Record<string, number> = {};
      counts?.forEach(item => {
        if (item.interaction_type === 'like' && item.short_id) {
          countsMap[item.short_id] = (countsMap[item.short_id] || 0) + 1;
        }
      });
      setLikesCountMap(countsMap);

      // Fetch current user's liked and saved states using short_id
      if (user) {
        const { data: userInteracts, error: userInteractsError } = await supabase
          .from('shorts_interactions')
          .select('short_id, interaction_type')
          .eq('user_id', user.id);

        if (userInteractsError) throw userInteractsError;

        const likedSet = new Set<string>();
        const savedSet = new Set<string>();

        userInteracts?.forEach(item => {
          if (item.interaction_type === 'like' && item.short_id) likedSet.add(item.short_id);
          if (item.interaction_type === 'save' && item.short_id) savedSet.add(item.short_id);
        });

        setLikedVideoIds(likedSet);
        setSavedVideoIds(savedSet);
      } else {
        setLikedVideoIds(new Set());
        setSavedVideoIds(new Set());
      }

    } catch (err) {
      console.error(err);
      toast.error('Failed to load shorts feed');
    } finally {
      setLoading(false);
    }
  }, [user, selectedCategory, videoId]);

  useEffect(() => {
    loadShorts();
  }, [loadShorts]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    loadShorts(cat);
  };

  // Scroll handler to snap active index
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const index = Math.round(container.scrollTop / container.clientHeight);
    if (index !== activeIndex && index >= 0 && index < shorts.length) {
      setActiveIndex(index);
    }
  };

  // Toggle Like Interaction using database UUID (shortId)
  const handleLikeToggle = async (shortId: string) => {
    if (!user) {
      toast.info('Please log in to like shorts');
      return;
    }

    const alreadyLiked = likedVideoIds.has(shortId);

    // Optimistic state updates
    setLikedVideoIds(prev => {
      const next = new Set(prev);
      if (alreadyLiked) next.delete(shortId);
      else next.add(shortId);
      return next;
    });

    setLikesCountMap(prev => ({
      ...prev,
      [shortId]: (prev[shortId] || 0) + (alreadyLiked ? -1 : 1)
    }));

    try {
      if (alreadyLiked) {
        const { error } = await supabase
          .from('shorts_interactions')
          .delete()
          .match({ user_id: user.id, short_id: shortId, interaction_type: 'like' });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('shorts_interactions')
          .insert({ user_id: user.id, short_id: shortId, interaction_type: 'like' });
        if (error) throw error;
      }
    } catch (err) {
      console.error(err);
      // Revert states on error
      setLikedVideoIds(prev => {
        const next = new Set(prev);
        if (alreadyLiked) next.add(shortId);
        else next.delete(shortId);
        return next;
      });
      setLikesCountMap(prev => ({
        ...prev,
        [shortId]: (prev[shortId] || 0) + (alreadyLiked ? 1 : -1)
      }));
      toast.error('Failed to update like status');
    }
  };

  // Toggle Save Interaction using database UUID (shortId)
  const handleSaveToggle = async (shortId: string) => {
    if (!user) {
      toast.info('Please log in to save shorts');
      return;
    }

    const alreadySaved = savedVideoIds.has(shortId);

    // Optimistic state update
    setSavedVideoIds(prev => {
      const next = new Set(prev);
      if (alreadySaved) next.delete(shortId);
      else next.add(shortId);
      return next;
    });

    try {
      if (alreadySaved) {
        const { error } = await supabase
          .from('shorts_interactions')
          .delete()
          .match({ user_id: user.id, short_id: shortId, interaction_type: 'save' });
        if (error) throw error;
        toast.success('Removed from saved videos');
      } else {
        const { error } = await supabase
          .from('shorts_interactions')
          .insert({ user_id: user.id, short_id: shortId, interaction_type: 'save' });
        if (error) throw error;
        toast.success('Saved to your library');
      }
    } catch (err) {
      console.error(err);
      // Revert state on error
      setSavedVideoIds(prev => {
        const next = new Set(prev);
        if (alreadySaved) next.add(shortId);
        else next.delete(shortId);
        return next;
      });
      toast.error('Failed to update saved status');
    }
  };

  // Share link (uses deep-link format)
  const handleShare = (vId: string) => {
    const shareUrl = `${window.location.origin}/shorts/${vId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Short link copied to clipboard!');
  };

  const activeShort = shorts[activeIndex];

  return (
    <div className="relative min-h-[calc(100vh-112px)] bg-[#070302] flex flex-col items-center justify-start text-white w-full">
      {/* Dynamic SEO Meta Injection for Shared Deep Links */}
      {activeShort && (
        <SEO
          title={activeShort.title}
          description={`${activeShort.whitelisted_channels?.channel_name} • ${activeShort.whitelisted_channels?.category || 'Devotional'}`}
          image={activeShort.thumbnail_url}
          url={`${window.location.origin}/shorts/${activeShort.video_id}`}
        />
      )}

      {/* 1. Loading state */}
      {loading && shorts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
          <p className="text-sm text-stone-400">Loading Bhakti Shorts...</p>
        </div>
      ) : (
        /* Feed Viewport */
        <div className="w-full flex-1 flex flex-col items-center justify-center p-0 md:py-4">
          
          {/* Category Filter Tabs - Hide when displaying a single shared deep-link */}
          {!videoId && (
            <div className="w-full max-w-[400px] flex gap-2 overflow-x-auto px-4 py-2.5 scrollbar-hide z-30 bg-[#070302]/95 backdrop-blur-md border-b border-orange-950/20">
              {['all', 'bhajan', 'pravachan', 'darshan', 'katha'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={cn(
                    "px-3.5 py-1 text-[11px] font-black uppercase tracking-wider rounded-full border transition-all whitespace-nowrap",
                    selectedCategory === cat
                      ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20"
                      : "bg-[#2a1a08]/30 text-stone-400 border-orange-900/10 hover:border-orange-500/25 hover:text-stone-300"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {shorts.length === 0 ? (
            <div className="flex-1 w-full max-w-[400px] flex flex-col items-center justify-center p-6 text-center py-20 min-h-[400px]">
              <Film className="w-12 h-12 text-stone-600 mb-4" />
              <h2 className="text-lg font-bold text-stone-300">No Shorts Available</h2>
              <p className="text-xs text-stone-500 mt-1 max-w-xs">
                {videoId ? "This short is not found or has been hidden." : `There are currently no shorts available in the "${selectedCategory}" category.`}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  if (videoId) {
                    window.location.href = '/shorts';
                  } else {
                    handleCategoryChange('all');
                  }
                }}
                className="mt-6 rounded-xl border-orange-900/30 text-orange-400 hover:bg-orange-950/20"
              >
                {videoId ? "Browse All Shorts" : "View All Categories"}
              </Button>
            </div>
          ) : (
            <div className="relative w-full max-w-[400px] h-[calc(100vh-210px)] md:h-[650px] md:rounded-[2rem] md:overflow-hidden md:border md:border-orange-900/30 md:shadow-[0_20px_60px_rgba(0,0,0,0.85)] bg-black">
              
              {/* Swiper wrapper */}
              <div
                ref={containerRef}
                onScroll={handleScroll}
                className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
                style={{ scrollBehavior: 'smooth' }}
              >
                {shorts.map((item, idx) => (
                  <div key={item.id} className="w-full h-full snap-start snap-always shrink-0">
                    <ShortsPlayer
                      videoId={item.video_id}
                      title={item.title}
                      description={item.description}
                      channelName={item.whitelisted_channels?.channel_name || 'Creator'}
                      channelHandle={item.whitelisted_channels?.handle || '@creator'}
                      isActive={idx === activeIndex}
                      liked={likedVideoIds.has(item.id)}
                      saved={savedVideoIds.has(item.id)}
                      likesCount={likesCountMap[item.id] || 0}
                      onLike={() => handleLikeToggle(item.id)}
                      onSave={() => handleSaveToggle(item.id)}
                      onShare={() => handleShare(item.video_id)}
                    />
                  </div>
                ))}
              </div>

              {/* Desktop Mockup Overlay Elements */}
              <div className="absolute top-4 left-4 z-20 pointer-events-none hidden md:block">
                <span className="text-[10px] uppercase font-bold tracking-widest bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-orange-400 border border-white/5">
                  Bhakti Shorts
                </span>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}
