import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Loader2, Film, ArrowLeft } from 'lucide-react';
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
  const navigate = useNavigate();
  
  const [shorts, setShorts] = useState<ShortItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Interaction mapping states
  const [likedVideoIds, setLikedVideoIds] = useState<Set<string>>(new Set());
  const [savedVideoIds, setSavedVideoIds] = useState<Set<string>>(new Set());
  const [likesCountMap, setLikesCountMap] = useState<Record<string, number>>({});
  const [commentsCountMap, setCommentsCountMap] = useState<Record<string, number>>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);

  // Callback ref: fires as soon as the scroll div mounts (works after loading state resolves)
  const scrollRefCallback = useCallback((node: HTMLDivElement | null) => {
    (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    if (!node) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerHeight(entry.contentRect.height);
    });
    ro.observe(node);
    // Initial measurement
    setContainerHeight(node.clientHeight);
  }, []);

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
        channel_id: s.channel_id,
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

      // Fetch interactions (Likes & Comments Count) using short_id
      const { data: counts, error: countsError } = await supabase
        .from('shorts_interactions')
        .select('short_id, interaction_type');

      if (countsError) throw countsError;

      const likesMap: Record<string, number> = {};
      const commentsMap: Record<string, number> = {};

      counts?.forEach(item => {
        if (item.short_id) {
          if (item.interaction_type === 'like') {
            likesMap[item.short_id] = (likesMap[item.short_id] || 0) + 1;
          } else if (item.interaction_type === 'comment') {
            commentsMap[item.short_id] = (commentsMap[item.short_id] || 0) + 1;
          }
        }
      });

      setLikesCountMap(likesMap);
      setCommentsCountMap(commentsMap);

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

  const handleBackClick = () => {
    if (videoId) {
      navigate('/shorts');
    } else if (selectedCategory !== 'all') {
      handleCategoryChange('all');
    } else {
      navigate(-1);
    }
  };

  const activeShort = shorts[activeIndex];

  return (
    <div className="relative w-full flex-1 flex flex-col bg-background dark:bg-[#070302] min-h-0">
      {/* Dynamic SEO */}
      {activeShort && (
        <SEO
          title={activeShort.title}
          description={`${activeShort.whitelisted_channels?.channel_name} • ${activeShort.whitelisted_channels?.category || 'Devotional'}`}
          image={activeShort.thumbnail_url}
          url={`${window.location.origin}/shorts/${activeShort.video_id}`}
        />
      )}

      {/* TOP HEADER & CATEGORY TABS OVERLAY (Always visible at top left) */}
      <div className="absolute top-0 left-0 right-0 z-50 flex flex-col pt-3.5 pointer-events-none">
        {/* Line 1: Back Arrow with stylish circular icon button */}
        <div className="flex items-center gap-2.5 px-4 py-0.5 pointer-events-auto w-full">
          <button
            onClick={handleBackClick}
            className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-black/60 active:scale-95 transition-all cursor-pointer shrink-0"
            aria-label="Go Back to All Shorts"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          </button>
          <h1 className="text-base font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] truncate leading-tight">
            {shorts[activeIndex]?.whitelisted_channels?.channel_name ? `${shorts[activeIndex].whitelisted_channels.channel_name} की बातें` : 'Bhajan Marg की बातें'}
          </h1>
        </div>

        {/* Line 2: Static Subtitle Text fixed vertically under the Title */}
        {shorts.length > 0 && (
          <div className="w-full pl-[58px] pr-4 -mt-0.5 pointer-events-auto">
            <p className="text-xs font-normal text-white/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate">
              {(shorts[activeIndex]?.title || 'प्रेमानंद जी महाराज के अमृत वचन और दिव्य प्रवचन').replace(/#[A-Za-z0-9_\u0900-\u097F]+/g, '').trim()}
            </p>
          </div>
        )}

        {/* Category Tabs Pill Row */}
        {!videoId && (
          <div className="flex px-3 pt-2.5 pointer-events-none">
            <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide py-1 pointer-events-auto">
              {[
                { id: 'all', label: 'सभी', icon: null },
                { id: 'bhajan', label: 'भजन', icon: '🎵' },
                { id: 'pravachan', label: 'प्रवचन', icon: '🧘‍♂️' },
                { id: 'darshan', label: 'दर्शन', icon: '🏛️' },
                { id: 'katha', label: 'कथा', icon: '📖' },
                { id: 'kathayein', label: 'कथाएं', icon: '📖' },
              ].map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <div key={cat.id} className="relative flex flex-col items-center shrink-0">
                    <button
                      onClick={() => handleCategoryChange(cat.id)}
                      className={cn(
                        "h-[30px] px-3.5 rounded-full text-[11px] font-bold tracking-wide transition-all inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer shadow-sm leading-none",
                        isActive
                          ? "bg-[#6b1d1d] text-white"
                          : "bg-white text-[#3A1A1A] font-bold hover:bg-stone-100"
                      )}
                    >
                      {cat.icon && (
                        <span className="text-[12px] leading-none shrink-0 inline-flex items-center justify-center">
                          {cat.icon}
                        </span>
                      )}
                      <span className="text-[11px] font-bold leading-none shrink-0 inline-flex items-center justify-center">
                        {cat.label}
                      </span>
                    </button>
                    {isActive && (
                      <div className="w-4 h-[2.5px] bg-[#6b1d1d] rounded-full mt-0.5 shadow-sm" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && shorts.length === 0 ? (
        <div className="w-full flex-1 flex flex-col items-center justify-center gap-3 bg-background dark:bg-[#070302]">
          <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
          <p className="text-sm text-stone-500 dark:text-stone-400">Loading Bhakti Shorts...</p>
        </div>
      ) : shorts.length === 0 ? (
        <div className="w-full flex-1 flex flex-col items-center justify-center p-6 text-center bg-background dark:bg-[#070302]">
          <Film className="w-12 h-12 text-stone-400 dark:text-stone-600 mb-4" />
          <h2 className="text-lg font-bold text-stone-700 dark:text-stone-300">No Shorts Available</h2>
          <p className="text-xs text-stone-500 mt-1 max-w-xs">
            {videoId
              ? "This short is not found or has been hidden."
              : `No shorts in the "${selectedCategory}" category.`}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              if (videoId) navigate('/shorts');
              else handleCategoryChange('all');
            }}
            className="mt-6 rounded-xl border-orange-200 dark:border-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20"
          >
            {videoId ? "Browse All Shorts" : "View All Categories"}
          </Button>
        </div>
      ) : (
        /* Video scroll feed — fills the full container */
        <div
          ref={scrollRefCallback}
          onScroll={handleScroll}
          className="flex-1 min-h-0 w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide bg-black"
          style={{ scrollBehavior: 'smooth' }}
        >
          {shorts.map((item, idx) => (
            <div
              key={item.id}
              className="w-full shrink-0 snap-start snap-always relative overflow-hidden"
              style={{ height: containerHeight > 0 ? containerHeight : '100svh' }}
            >
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
                commentsCount={commentsCountMap[item.id] || 0}
                onLike={() => handleLikeToggle(item.id)}
                onSave={() => handleSaveToggle(item.id)}
                onShare={() => handleShare(item.video_id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
