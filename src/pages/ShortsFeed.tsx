import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Loader2, Film, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import ShortsPlayer from '@/components/shorts/ShortsPlayer';
import { cn } from '@/lib/utils';

interface ShortItem {
  id: string;
  video_id: string;
  channel_id: string;
  title: string;
  thumbnail_url: string;
  duration_seconds: number;
  whitelisted_channels: {
    channel_name: string;
    category: string;
  };
}

export default function ShortsFeed() {
  const { user } = useAuth();
  const [shorts, setShorts] = useState<ShortItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<'all' | 'bhajan' | 'pravachan' | 'darshan' | 'katha'>('all');

  // Interaction mapping states
  const [likedVideoIds, setLikedVideoIds] = useState<Set<string>>(new Set());
  const [savedVideoIds, setSavedVideoIds] = useState<Set<string>>(new Set());
  const [likesCountMap, setLikesCountMap] = useState<Record<string, number>>({});

  const containerRef = useRef<HTMLDivElement>(null);

  // Load Shorts and Curation details
  const loadShorts = useCallback(async () => {
    setLoading(true);
    try {
      // Query shorts from active channels
      let query = supabase
        .from('shorts_queue')
        .select('id, video_id, title, thumbnail_url, duration_seconds, whitelisted_channels!inner(channel_name, status, category)')
        .eq('whitelisted_channels.status', 'active')
        .order('published_at', { ascending: false });

      if (activeCategory !== 'all') {
        query = query.eq('whitelisted_channels.category', activeCategory);
      }

      const { data, error } = await query;
      if (error) throw error;

      const formattedShorts = (data || []).map((s: any) => ({
        id: s.id, // Database UUID (used for internal relationships)
        video_id: s.video_id, // YouTube Video ID (used for player embed)
        title: s.title,
        thumbnail_url: s.thumbnail_url,
        duration_seconds: s.duration_seconds,
        whitelisted_channels: {
          channel_name: s.whitelisted_channels?.channel_name || 'Creator',
          category: s.whitelisted_channels?.category || 'bhajan',
        }
      }));

      setShorts(formattedShorts);
      setActiveIndex(0);
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }

      // Fetch interactions (Likes Count) using video_uid
      const { data: counts, error: countsError } = await supabase
        .from('shorts_interactions')
        .select('video_uid, interaction_type');

      if (countsError) throw countsError;

      const countsMap: Record<string, number> = {};
      counts?.forEach(item => {
        if (item.interaction_type === 'like' && item.video_uid) {
          countsMap[item.video_uid] = (countsMap[item.video_uid] || 0) + 1;
        }
      });
      setLikesCountMap(countsMap);

      // Fetch current user's liked and saved states using video_uid
      if (user) {
        const { data: userInteracts, error: userInteractsError } = await supabase
          .from('shorts_interactions')
          .select('video_uid, interaction_type')
          .eq('user_id', user.id);

        if (userInteractsError) throw userInteractsError;

        const likedSet = new Set<string>();
        const savedSet = new Set<string>();

        userInteracts?.forEach(item => {
          if (item.interaction_type === 'like' && item.video_uid) likedSet.add(item.video_uid);
          if (item.interaction_type === 'save' && item.video_uid) savedSet.add(item.video_uid);
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
  }, [activeCategory, user]);

  useEffect(() => {
    loadShorts();
  }, [loadShorts]);

  // Scroll handler to snap active index
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const index = Math.round(container.scrollTop / container.clientHeight);
    if (index !== activeIndex && index >= 0 && index < shorts.length) {
      setActiveIndex(index);
    }
  };

  // Toggle Like Interaction using video_uid
  const handleLikeToggle = async (videoUid: string) => {
    if (!user) {
      toast.info('Please log in to like shorts');
      return;
    }

    const alreadyLiked = likedVideoIds.has(videoUid);

    // Optimistic state updates
    setLikedVideoIds(prev => {
      const next = new Set(prev);
      if (alreadyLiked) next.delete(videoUid);
      else next.add(videoUid);
      return next;
    });

    setLikesCountMap(prev => ({
      ...prev,
      [videoUid]: (prev[videoUid] || 0) + (alreadyLiked ? -1 : 1)
    }));

    try {
      if (alreadyLiked) {
        const { error } = await supabase
          .from('shorts_interactions')
          .delete()
          .match({ user_id: user.id, video_uid: videoUid, interaction_type: 'like' });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('shorts_interactions')
          .insert({ user_id: user.id, video_uid: videoUid, interaction_type: 'like' });
        if (error) throw error;
      }
    } catch (err) {
      console.error(err);
      // Revert states on error
      setLikedVideoIds(prev => {
        const next = new Set(prev);
        if (alreadyLiked) next.add(videoUid);
        else next.delete(videoUid);
        return next;
      });
      setLikesCountMap(prev => ({
        ...prev,
        [videoUid]: (prev[videoUid] || 0) + (alreadyLiked ? 1 : -1)
      }));
      toast.error('Failed to update like status');
    }
  };

  // Toggle Save Interaction using video_uid
  const handleSaveToggle = async (videoUid: string) => {
    if (!user) {
      toast.info('Please log in to save shorts');
      return;
    }

    const alreadySaved = savedVideoIds.has(videoUid);

    // Optimistic state update
    setSavedVideoIds(prev => {
      const next = new Set(prev);
      if (alreadySaved) next.delete(videoUid);
      else next.add(videoUid);
      return next;
    });

    try {
      if (alreadySaved) {
        const { error } = await supabase
          .from('shorts_interactions')
          .delete()
          .match({ user_id: user.id, video_uid: videoUid, interaction_type: 'save' });
        if (error) throw error;
        toast.success('Removed from saved videos');
      } else {
        const { error } = await supabase
          .from('shorts_interactions')
          .insert({ user_id: user.id, video_uid: videoUid, interaction_type: 'save' });
        if (error) throw error;
        toast.success('Saved to your library');
      }
    } catch (err) {
      console.error(err);
      // Revert state on error
      setSavedVideoIds(prev => {
        const next = new Set(prev);
        if (alreadySaved) next.add(videoUid);
        else next.delete(videoUid);
        return next;
      });
      toast.error('Failed to update saved status');
    }
  };

  // Share link
  const handleShare = (videoId: string) => {
    const shareUrl = `${window.location.origin}/shorts?v=${videoId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Short link copied to clipboard!');
  };

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'bhajan', label: 'Bhajans' },
    { id: 'pravachan', label: 'Pravachans' },
    { id: 'darshan', label: 'Darshan' },
    { id: 'katha', label: 'Katha' },
  ] as const;

  return (
    <div className="relative min-h-[calc(100vh-112px)] bg-[#070302] flex flex-col items-center justify-start text-white">
      {/* 1. Category Tabs header */}
      <div className="w-full z-20 bg-[#0c0705]/85 backdrop-blur-md border-b border-orange-900/10 py-3 shrink-0 flex items-center justify-center">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide px-4 max-w-full">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap",
                activeCategory === cat.id
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                  : "bg-white/5 border border-white/10 text-stone-400 hover:text-stone-200"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Loading state */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
          <p className="text-sm text-stone-400">Loading Bhakti Shorts...</p>
        </div>
      ) : shorts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center py-20">
          <Film className="w-12 h-12 text-stone-600 mb-4" />
          <h2 className="text-lg font-bold text-stone-300">No Shorts Available</h2>
          <p className="text-xs text-stone-500 mt-1 max-w-xs">
            There are currently no approved shorts in this category. Check back later!
          </p>
          <Button
            variant="outline"
            onClick={loadShorts}
            className="mt-6 rounded-xl border-orange-900/30 text-orange-400 hover:bg-orange-950/20"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reload Feed
          </Button>
        </div>
      ) : (
        /* 3. Snapping Feed Viewport (Desktop centered shell, Mobile full screen) */
        <div className="w-full flex-1 flex items-center justify-center p-0 md:py-4">
          <div className="relative w-full max-w-[400px] h-[calc(100vh-160px)] md:h-[700px] md:rounded-[2rem] md:overflow-hidden md:border md:border-orange-900/30 md:shadow-[0_20px_60px_rgba(0,0,0,0.85)] bg-black">
            
            {/* Swiper wrapper */}
            <div
              ref={containerRef}
              onScroll={handleScroll}
              className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
              style={{ scrollBehavior: 'smooth' }}
            >
              {shorts.map((item, idx) => (
                <div key={item.id} className="w-full h-full snap-start shrink-0">
                  <ShortsPlayer
                    videoId={item.video_id}
                    title={item.title}
                    channelName={item.whitelisted_channels?.channel_name || 'Creator'}
                    isActive={idx === activeIndex}
                    liked={likedVideoIds.has(item.video_id)}
                    saved={savedVideoIds.has(item.video_id)}
                    likesCount={likesCountMap[item.video_id] || 0}
                    onLike={() => handleLikeToggle(item.video_id)}
                    onSave={() => handleSaveToggle(item.video_id)}
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
        </div>
      )}
    </div>
  );
}
