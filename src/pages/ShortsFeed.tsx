import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Loader2, Film, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import ShortsPlayer from '@/components/shorts/ShortsPlayer';
import { cn } from '@/lib/utils';
import { SEO } from '@/components/SEO';
import omWhiteSvg from '@/pages/images/svg/om white.svg';

interface ShortItem {
  id: string;
  original_id?: string;
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
  const { language } = useLanguage();
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
  const isWheelScrolling = useRef(false);

  // Callback ref: fires as soon as the scroll div mounts
  const scrollRefCallback = useCallback((node: HTMLDivElement | null) => {
    (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    if (!node) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerHeight(entry.contentRect.height);
    });
    ro.observe(node);
    setContainerHeight(node.clientHeight);
  }, []);

  // Load Shorts and Curation details
  const loadShorts = useCallback(async (catFilter = selectedCategory) => {
    setLoading(true);
    try {
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
        id: s.id,
        video_id: s.video_id,
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

      // Fetch current user's liked and saved states
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

  // Resume last watched short position on feed load (Instant positioning, no fast-scrolling animation)
  useEffect(() => {
    if (shorts.length === 0 || videoId) return;

    let targetTarget = 0;
    const lastWatchedVid = localStorage.getItem('raghavam_shorts_last_watched_id');

    if (lastWatchedVid) {
      const foundIdx = shorts.findIndex(s => s.video_id === lastWatchedVid);
      if (foundIdx !== -1) {
        targetTarget = Math.min(foundIdx + 1, shorts.length);
      }
    }

    setActiveIndex(targetTarget);

    const applyInstantScroll = () => {
      if (containerRef.current) {
        const h = containerRef.current.clientHeight || window.innerHeight;
        containerRef.current.scrollTo({
          top: targetTarget * h,
          behavior: 'instant' as ScrollBehavior,
        });
      }
    };

    // Apply immediately and on next frame to ensure zero flash/scroll animation
    applyInstantScroll();
    requestAnimationFrame(applyInstantScroll);
  }, [shorts, videoId]);

  // Save last watched position to localStorage when activeIndex changes
  useEffect(() => {
    if (shorts.length > 0 && activeIndex < shorts.length) {
      const currentShort = shorts[activeIndex];
      if (currentShort?.video_id) {
        localStorage.setItem('raghavam_shorts_last_watched_id', currentShort.video_id);
      }
    }
  }, [activeIndex, shorts]);

  // Unique Shorts array (no artificial infinite repetition of identical shorts)
  const displayShorts = shorts;

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    loadShorts(cat);
  };

  const scrollToIndex = useCallback((targetIdx: number) => {
    const idx = Math.max(0, Math.min(targetIdx, displayShorts.length));
    setActiveIndex(idx);
    if (containerRef.current) {
      const h = containerRef.current.clientHeight || window.innerHeight;
      containerRef.current.scrollTo({
        top: idx * h,
        behavior: 'smooth',
      });
    }
  }, [displayShorts.length]);

  // Strict 1-short scroll lock for wheel/trackpad gestures
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (isWheelScrolling.current) return;
    if (Math.abs(e.deltaY) < 15) return;

    isWheelScrolling.current = true;
    setTimeout(() => {
      isWheelScrolling.current = false;
    }, 380);

    if (e.deltaY > 0) {
      if (activeIndex < displayShorts.length) {
        scrollToIndex(activeIndex + 1);
      }
    } else if (e.deltaY < 0) {
      if (activeIndex > 0) {
        scrollToIndex(activeIndex - 1);
      }
    }
  };

  // Scroll handler to snap active index
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const h = container.clientHeight || 1;
    const index = Math.round(container.scrollTop / h);
    if (index !== activeIndex && index >= 0 && index <= displayShorts.length) {
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

  const activeShort = displayShorts[activeIndex];

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
            {displayShorts[activeIndex]?.whitelisted_channels?.channel_name ? `${displayShorts[activeIndex].whitelisted_channels.channel_name} की बातें` : 'Bhajan Marg की बातें'}
          </h1>
        </div>

        {/* Line 2: Static Subtitle Text fixed vertically under the Title */}
        {displayShorts.length > 0 && (
          <div className="w-full pl-[58px] pr-4 -mt-0.5 pointer-events-auto">
            <p className="text-xs font-normal text-white/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate">
              {(displayShorts[activeIndex]?.title || 'प्रेमानंद जी महाराज के अमृत वचन और दिव्य प्रवचन').replace(/#[A-Za-z0-9_\u0900-\u097F]+/g, '').trim()}
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
      {loading && displayShorts.length === 0 ? (
        <div className="w-full flex-1 flex flex-col items-center justify-center gap-3 bg-background dark:bg-[#070302]">
          <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
          <p className="text-sm text-stone-500 dark:text-stone-400">Loading Bhakti Shorts...</p>
        </div>
      ) : displayShorts.length === 0 ? (
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
          onWheel={handleWheel}
          className="flex-1 min-h-0 w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide bg-black"
        >
          {displayShorts.map((item, idx) => {
            const realId = item.original_id || item.id;
            const isPreload = idx === activeIndex + 1 || idx === activeIndex + 2;
            return (
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
                  isPreload={isPreload}
                  liked={likedVideoIds.has(realId)}
                  saved={savedVideoIds.has(realId)}
                  likesCount={likesCountMap[realId] || 0}
                  commentsCount={commentsCountMap[realId] || 0}
                  onLike={() => handleLikeToggle(realId)}
                  onSave={() => handleSaveToggle(realId)}
                  onShare={() => handleShare(item.video_id)}
                />
              </div>
            );
          })}

          {/* Redesigned Sacred Om "You're All Caught Up" Card Slide */}
          {displayShorts.length > 0 && !videoId && (
            <div
              key="caught-up-slide"
              className="w-full shrink-0 snap-start snap-always relative overflow-hidden flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#160A06] via-[#0D0604] to-[#1A0C07] text-white"
              style={{ height: containerHeight > 0 ? containerHeight : '100svh' }}
            >
              {/* Divine Glowing Halo with Om SVG */}
              <div className="relative mb-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[#7A2D28]/40 blur-2xl animate-pulse" />
                <div className="w-24 h-24 rounded-full bg-gradient-to-b from-[#7A2D28] to-[#4A1815] border-2 border-[#D4A44A]/60 flex items-center justify-center p-4 shadow-[0_0_40px_rgba(212,164,74,0.4)] relative z-10">
                  <img src={omWhiteSvg} alt="Divine Om" className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(255,255,255,0.6)]" />
                </div>
              </div>

              <h2 className="text-2xl font-bold font-serif text-[#FFFDF8] mb-2 tracking-wide drop-shadow-md">
                {language === 'hi' ? 'आज के सभी दिव्य शॉर्ट्स समाप्त!' : "You're All Caught Up!"}
              </h2>
              <p className="text-xs text-[#E5D7C5]/90 max-w-xs mb-8 leading-relaxed font-sans">
                {language === 'hi'
                  ? 'आपने आज के सभी भक्ति एवं सत्संग शॉर्ट्स देख लिए हैं। प्रतिदिन नए दिव्य वीडियो जोड़े जाते हैं।'
                  : 'You have watched all available Bhakti Shorts for today. New divine shorts are added daily.'}
              </p>

              <div className="flex flex-col sm:flex-row gap-3.5 w-full max-w-xs z-10">
                <Button
                  onClick={() => scrollToIndex(0)}
                  className="w-full rounded-2xl bg-gradient-to-r from-[#7A2D28] via-[#8C342F] to-[#5A1F1A] hover:brightness-110 text-white font-bold text-xs h-12 shadow-[0_4px_15px_rgba(122,45,40,0.5)] border border-[#D4A44A]/40"
                >
                  🔄 {language === 'hi' ? 'फिर से देखें' : 'Re-watch from Start'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="w-full rounded-2xl border border-[#D4A44A]/50 bg-[#25130C]/60 text-[#F5E6D3] hover:bg-[#7A2D28]/30 font-bold text-xs h-12 backdrop-blur-md"
                >
                  🏠 {language === 'hi' ? 'मुख्य पृष्ठ' : 'Go to Home'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
