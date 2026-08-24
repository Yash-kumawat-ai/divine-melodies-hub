import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bhajans as staticBhajans, getDeityById, type Bhajan } from '@/data/bhajans';
import NotFound from '@/pages/NotFound';
import { SEO } from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import { generateBhajanSlug, generateDeitySlug } from '@/lib/slugUtils';
import { getPublicSiteUrl } from '@/lib/env';
import { useLanguage } from '@/hooks/useLanguage';
import { useLikedBhajans } from '@/hooks/useLikedBhajans';
import { useAuth } from '@/hooks/useAuth';
import { resolveBhajanYouTubeVideoId } from '@/lib/youtubeEmbedPopup';
import { shareOnWhatsApp, shareOnTelegram, copyShareLink } from '@/lib/shareUtils';
import BhajanCard from '@/components/BhajanCard';
import AddToGroupDialog from '@/components/community/AddToGroupDialog';
import {
  Loader2,
  Music2,
  User,
  Sparkles,
  ArrowLeft,
  Play,
  Heart,
  Share2,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  ChevronRight,
  ShieldAlert,
  Video,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

export default function BhajanPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const { user } = useAuth();
  const { isLiked, toggleLike } = useLikedBhajans();

  const [dbBhajan, setDbBhajan] = useState<Bhajan | null>(null);
  const [loading, setLoading] = useState(false);
  const [dbChecked, setDbChecked] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  // Player & Interactive state
  const [isPlaying, setIsPlaying] = useState(false);
  const [resolvedVideoId, setResolvedVideoId] = useState<string | null>(null);
  const [fontSizeLevel, setFontSizeLevel] = useState<'sm' | 'md' | 'lg'>('md');
  const [lyricsTab, setLyricsTab] = useState<'hindi' | 'translit'>('hindi');
  const [copiedLyrics, setCopiedLyrics] = useState(false);
  const [isAddToGroupOpen, setIsAddToGroupOpen] = useState(false);
  const videoSectionRef = useRef<HTMLDivElement>(null);

  // Clean playback reset when navigating to another bhajan
  useEffect(() => {
    setIsPlaying(false);
    setResolvedVideoId(null);
  }, [slug]);

  // 1. Synchronous catalog lookup for static items (no extra network latency)
  const staticFound = useMemo(() => {
    if (!slug) return null;
    const clean = slug.toLowerCase().trim();
    return staticBhajans.find((b) => b.slug.toLowerCase() === clean) || null;
  }, [slug]);

  // 2. Strict exact database lookup (no prefix/fuzzy matching)
  useEffect(() => {
    if (!slug || staticFound) {
      setDbChecked(true);
      return;
    }

    let isMounted = true;
    async function fetchUpload() {
      setLoading(true);
      try {
        const cleanSlug = slug.toLowerCase().trim();

        // 2a. Public approved query (Rule 2)
        const { data, error } = await supabase
          .from('user_uploads')
          .select('*')
          .eq('status', 'approved')
          .eq('slug', cleanSlug)
          .maybeSingle();

        if (!error && data && isMounted) {
          const mapped: Bhajan = {
            id: data.id,
            slug: data.slug || cleanSlug,
            title: data.title || 'Devotional Song',
            titleHindi: data.title_hindi || data.title || 'भजन',
            deityId: data.deity_id || 1,
            lyricsHindi: data.lyrics_hindi || '',
            lyricsTransliteration: data.lyrics_transliteration || '',
            imageUrl: data.image_url,
            singerName: data.singer_name || 'Traditional',
            composerName: data.composer_name,
            playCount: data.play_count || 0,
            rating: data.average_rating || 5,
            tags: data.occasion || data.mood_tags || [],
            featured: false,
            youtubeUrl: data.youtube_url,
          };
          setDbBhajan(mapped);
          setIsPreview(false);
        } else if (!data) {
          // 2b. Author preview check for own pending submission (Rule 3)
          if (user?.id) {
            const { data: ownData } = await supabase
              .from('user_uploads')
              .select('*')
              .eq('slug', cleanSlug)
              .eq('user_id', user.id)
              .maybeSingle();

            if (ownData && isMounted) {
              const mapped: Bhajan = {
                id: ownData.id,
                slug: ownData.slug || cleanSlug,
                title: ownData.title || 'Devotional Song',
                titleHindi: ownData.title_hindi || ownData.title || 'भजन',
                deityId: ownData.deity_id || 1,
                lyricsHindi: ownData.lyrics_hindi || '',
                lyricsTransliteration: ownData.lyrics_transliteration || '',
                imageUrl: ownData.image_url,
                singerName: ownData.singer_name || 'Traditional',
                composerName: ownData.composer_name,
                playCount: ownData.play_count || 0,
                rating: ownData.average_rating || 5,
                tags: ownData.occasion || ownData.mood_tags || [],
                featured: false,
                youtubeUrl: ownData.youtube_url,
              };
              setDbBhajan(mapped);
              setIsPreview(true);
              return;
            }
          }

          // 2c. Check exact 1:1 redirect map (Rule 1 & Rule 8)
          const { data: redirectRow } = await supabase
            .from('bhajan_slug_redirects')
            .select('to_slug')
            .eq('from_slug', cleanSlug)
            .maybeSingle();

          if (redirectRow?.to_slug && isMounted) {
            // Client-side SPA history replacement (not an HTTP 301 header)
            navigate(`/bhajan/${redirectRow.to_slug}`, { replace: true });
            return;
          }
        }
      } catch (err) {
        console.error('Error resolving bhajan by slug:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
          setDbChecked(true);
        }
      }
    }

    void fetchUpload();

    return () => {
      isMounted = false;
    };
  }, [slug, staticFound, user?.id, navigate]);

  const resolvedBhajan = staticFound || dbBhajan;

  // Resolve YouTube Video ID asynchronously for playback
  useEffect(() => {
    if (!resolvedBhajan) return;
    let isMounted = true;
    async function resolveMedia() {
      const vid = await resolveBhajanYouTubeVideoId({
        youtubeUrl: resolvedBhajan.youtubeUrl,
        title: resolvedBhajan.title,
        singerName: resolvedBhajan.singerName || 'Traditional',
      });
      if (isMounted) {
        setResolvedVideoId(vid);
      }
    }
    void resolveMedia();
    return () => {
      isMounted = false;
    };
  }, [resolvedBhajan]);

  // Non-blocking related bhajans calculation from static list (Rule 6)
  const relatedBhajans = useMemo(() => {
    if (!resolvedBhajan) return [];
    return staticBhajans
      .filter((b) => b.id !== resolvedBhajan.id && b.deityId === resolvedBhajan.deityId)
      .slice(0, 4);
  }, [resolvedBhajan]);

  if (loading && !resolvedBhajan) {
    return (
      <main className="min-h-[calc(100dvh-4.5rem)] bg-[#FAF6EE] dark:bg-[#0c0a08] text-[#32251E] dark:text-[#FAF6EE] pb-24">
        <div className="container mx-auto max-w-4xl px-3 sm:px-4 pt-4 sm:pt-6 space-y-6 animate-pulse">
          {/* Breadcrumb skeleton */}
          <div className="h-4 w-48 bg-muted/60 dark:bg-stone-800/60 rounded-full" />

          {/* Header Card skeleton */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#FFFDF8] dark:bg-[#140d08] border border-[#E8D8C4] dark:border-stone-800 space-y-4">
            <div className="h-6 w-28 bg-amber-100 dark:bg-amber-950/40 rounded-full" />
            <div className="h-8 sm:h-10 w-3/4 bg-muted/70 dark:bg-stone-800 rounded-xl" />
            <div className="h-4 w-1/3 bg-muted/50 dark:bg-stone-800 rounded-md" />
            <div className="flex gap-2 pt-2 border-t border-[#E8D8C4]/60 dark:border-stone-800">
              <div className="h-9 w-24 bg-muted/60 dark:bg-stone-800 rounded-full" />
              <div className="h-9 w-24 bg-muted/60 dark:bg-stone-800 rounded-full" />
              <div className="h-9 w-28 bg-muted/60 dark:bg-stone-800 rounded-full" />
            </div>
          </div>

          {/* Lyrics Article Card skeleton */}
          <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-[#FFFDF8] dark:bg-[#140d08] border border-[#E8D8C4] dark:border-stone-800 space-y-4 min-h-[360px]">
            <div className="h-6 w-44 bg-muted/60 dark:bg-stone-800 rounded-md" />
            <div className="space-y-2.5 pt-2">
              <div className="h-4 w-full bg-muted/40 dark:bg-stone-800/60 rounded-sm" />
              <div className="h-4 w-5/6 bg-muted/40 dark:bg-stone-800/60 rounded-sm" />
              <div className="h-4 w-4/5 bg-muted/40 dark:bg-stone-800/60 rounded-sm" />
              <div className="h-4 w-3/4 bg-muted/40 dark:bg-stone-800/60 rounded-sm" />
              <div className="h-4 w-5/6 bg-muted/40 dark:bg-stone-800/60 rounded-sm" />
            </div>
          </div>

          {/* Video Placeholder skeleton */}
          <div className="aspect-video w-full rounded-2xl sm:rounded-3xl bg-muted/40 dark:bg-stone-900/60 border border-[#E8D8C4] dark:border-stone-800" />
        </div>
      </main>
    );
  }

  if (dbChecked && !resolvedBhajan) {
    return <NotFound />;
  }

  if (!resolvedBhajan) {
    return null;
  }

  const deity = getDeityById(resolvedBhajan.deityId);
  const deityName = deity ? (isHi ? deity.nameHindi : deity.name) : (isHi ? 'भगवान' : 'Divine');
  const deitySlug = deity ? generateDeitySlug(deity.name) : '';
  const liked = isLiked(resolvedBhajan.id);

  const cleanLyricsPreview = (resolvedBhajan.lyricsHindi || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);

  const seoTitle = `${resolvedBhajan.titleHindi} (${resolvedBhajan.title}) - Lyrics & Video | Raghavam`;
  const seoDescription = cleanLyricsPreview
    ? `${resolvedBhajan.titleHindi} (${resolvedBhajan.title}) - ${cleanLyricsPreview}… Sung by ${resolvedBhajan.singerName || 'Traditional'}. Read sacred lyrics and listen on Raghavam.`
    : `Listen to ${resolvedBhajan.title} (${resolvedBhajan.titleHindi}), a sacred devotional ${deityName} bhajan sung by ${resolvedBhajan.singerName || 'Traditional'} on Raghavam.`;

  const baseUrl = getPublicSiteUrl();
  const canonicalUrl = `${baseUrl}/bhajan/${resolvedBhajan.slug}`;

  // Content-conditional Schema.org structured data (Rule 9)
  const hasValidMedia = Boolean(resolvedBhajan.youtubeUrl || resolvedVideoId);
  const jsonLd: Record<string, any> = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: isHi ? 'होम' : 'Home',
            item: baseUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: isHi ? 'सभी भजन' : 'All Bhajans',
            item: `${baseUrl}/all-bhajans`,
          },
          ...(deity
            ? [
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: deityName,
                  item: `${baseUrl}/deity/${deitySlug}`,
                },
              ]
            : []),
          {
            '@type': 'ListItem',
            position: deity ? 4 : 3,
            name: resolvedBhajan.title,
            item: canonicalUrl,
          },
        ],
      },
      ...(hasValidMedia
        ? [
            {
              '@type': 'MusicRecording',
              name: resolvedBhajan.title,
              alternateName: resolvedBhajan.titleHindi,
              byArtist: {
                '@type': 'MusicGroup',
                name: resolvedBhajan.singerName || 'Traditional',
              },
              inLanguage: ['hi', 'sa', 'en'],
              description: seoDescription,
              url: canonicalUrl,
              image: resolvedBhajan.imageUrl || `${baseUrl}/og-image.jpg`,
              ...(resolvedBhajan.composerName && {
                composer: {
                  '@type': 'Person',
                  name: resolvedBhajan.composerName,
                },
              }),
            },
          ]
        : []),
    ],
  };

  const handleCopyLyrics = async () => {
    const textToCopy =
      lyricsTab === 'translit' && resolvedBhajan.lyricsTransliteration
        ? resolvedBhajan.lyricsTransliteration
        : resolvedBhajan.lyricsHindi;

    if (!textToCopy) {
      toast.error(isHi ? 'लिरिक्स उपलब्ध नहीं हैं' : 'Lyrics not available');
      return;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedLyrics(true);
      toast.success(isHi ? 'लिरिक्स कॉपी हो गए!' : 'Lyrics copied to clipboard!');
      setTimeout(() => setCopiedLyrics(false), 2500);
    } catch {
      toast.error(isHi ? 'कॉपी करने में विफल' : 'Failed to copy');
    }
  };

  const handleShare = (platform: 'whatsapp' | 'telegram' | 'native') => {
    const shareUrl = window.location.href;
    const shareText = `${resolvedBhajan.titleHindi || resolvedBhajan.title} - राघवम् पर सुनें`;
    if (platform === 'whatsapp') {
      shareOnWhatsApp(shareText, shareUrl);
    } else if (platform === 'telegram') {
      shareOnTelegram(shareText, shareUrl);
    } else {
      if (navigator.share) {
        navigator.share({ title: resolvedBhajan.title, text: shareText, url: shareUrl }).catch(() => {});
      } else {
        copyShareLink(shareUrl);
        toast.success(isHi ? 'लिंक कॉपी हो गया!' : 'Link copied to clipboard!');
      }
    }
  };

  const scrollToVideo = () => {
    videoSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const lyricsFontSizeClass =
    fontSizeLevel === 'sm'
      ? 'text-sm sm:text-base leading-relaxed'
      : fontSizeLevel === 'lg'
      ? 'text-xl sm:text-2xl leading-loose font-semibold'
      : 'text-base sm:text-lg leading-loose';

  // Format a clean, concise title string for the breadcrumb
  const breadcrumbTitle = (resolvedBhajan.titleHindi || resolvedBhajan.title).split(/[.,;–—|-]/)[0]?.trim() || resolvedBhajan.title;

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        url={canonicalUrl}
        image={resolvedBhajan.imageUrl || `${baseUrl}/og-image.jpg`}
        type="article"
        lang="hi"
        jsonLd={jsonLd}
        noIndex={isPreview}
      />

      <main className="min-h-screen bg-[#FAF6EE] dark:bg-[#0c0a08] text-[#32251E] dark:text-[#FAF6EE] pb-24">
        {/* Preview Banner for Authors/Admins (Rule 3) */}
        {isPreview && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 text-center">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              {isHi
                ? 'यह आपका अप्रकाशित पूर्वावलोकन है। यह पेज सर्च इंजन में इंडेक्स नहीं होगा।'
                : 'This is an unapproved preview visible only to you. It is not indexed.'}
            </span>
          </div>
        )}

        <div className="container mx-auto max-w-4xl px-3 sm:px-4 pt-4 sm:pt-6 space-y-6">
          {/* Clean Breadcrumbs Header */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 flex-wrap text-xs font-semibold text-[#786252] dark:text-stone-400">
            <Link
              to="/all-bhajans"
              className="inline-flex items-center gap-1 hover:text-[#651317] dark:hover:text-amber-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isHi ? 'सभी भजन' : 'All Bhajans'}</span>
            </Link>
            {deity && (
              <>
                <ChevronRight className="w-3 h-3 opacity-60" />
                <Link
                  to={`/deity/${deitySlug}`}
                  className="hover:text-[#651317] dark:hover:text-amber-300 transition-colors"
                >
                  {deityName}
                </Link>
              </>
            )}
            <ChevronRight className="w-3 h-3 opacity-60" />
            <span className="text-[#3A2418] dark:text-amber-200 truncate max-w-[200px] sm:max-w-xs font-medium">
              {breadcrumbTitle}
            </span>
          </nav>

          {/* Sacred Details, Titles & Royal Action Toolbar */}
          <header className="space-y-4 bg-[#FFFDF8] dark:bg-[#140d08] p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#E8D8C4] dark:border-stone-800 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {deity && (
                <Link
                  to={`/deity/${deitySlug}`}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-[#651317] dark:text-amber-300 text-xs font-bold hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors shadow-2xs"
                >
                  <span className="text-base">{deity.emoji}</span>
                  <span>{deityName} भजन</span>
                </Link>
              )}

              {resolvedBhajan.tags && resolvedBhajan.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {resolvedBhajan.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-bold text-[#786252] dark:text-stone-400 bg-stone-100 dark:bg-stone-800/60 px-2.5 py-0.5 rounded-full border border-stone-200 dark:border-stone-700"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bhajan Headings */}
            <div className="space-y-1">
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#4A1516] dark:text-[#FFFDF8] leading-tight">
                {resolvedBhajan.titleHindi || resolvedBhajan.title}
              </h1>
              {resolvedBhajan.titleHindi && resolvedBhajan.title && resolvedBhajan.titleHindi !== resolvedBhajan.title && (
                <p className="text-sm sm:text-base text-[#786252] dark:text-stone-300 font-medium">
                  {resolvedBhajan.title}
                </p>
              )}
            </div>

            {/* Singer / Composer Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-[#786252] dark:text-stone-400 pt-2 border-t border-[#E8D8C4]/60 dark:border-stone-800 font-medium">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#651317] dark:text-amber-400" />
                <span>{isHi ? 'गायक:' : 'Singer:'} <strong>{resolvedBhajan.singerName || 'Traditional'}</strong></span>
              </span>
              {resolvedBhajan.composerName && (
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#651317] dark:text-amber-400" />
                  <span>{isHi ? 'रचनाकार:' : 'Composer:'} <strong>{resolvedBhajan.composerName}</strong></span>
                </span>
              )}
            </div>

            {/* Royal Spiritual Action Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-[#E8D8C4]/60 dark:border-stone-800">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Like Button (Consistent Like / Liked terminology with soft rose active styling) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!user) {
                      toast.error(isHi ? 'पसंद करने के लिए कृपया लॉगिन करें' : 'Sign in to like bhajans');
                      return;
                    }
                    toggleLike(resolvedBhajan.id);
                    toast.success(
                      liked
                        ? (isHi ? 'पसंदीदा भजनों से हटाया गया' : 'Removed from liked bhajans')
                        : (isHi ? 'पसंदीदा भजनों में जोड़ा गया ❤️' : 'Added to liked bhajans ❤️')
                    );
                  }}
                  className={`flex items-center gap-1.5 h-9 px-3.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs border ${
                    liked
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 shadow-xs'
                      : 'bg-[#FFFDF8] dark:bg-stone-900 border-[#E8D8C4] dark:border-stone-700 text-[#543D2B] dark:text-stone-300 hover:bg-[#FAF2E8]'
                  }`}
                  aria-label={liked ? (isHi ? 'पसंद किया' : 'Liked') : (isHi ? 'पसंद करें' : 'Like')}
                >
                  <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500 text-rose-500' : 'text-[#651317] dark:text-amber-400'}`} />
                  <span>{liked ? (isHi ? 'पसंद किया' : 'Liked') : (isHi ? 'पसंद करें' : 'Like')}</span>
                </button>

                {/* Share Button (Matching Royal Spiritual styling) */}
                <button
                  type="button"
                  onClick={() => handleShare('native')}
                  className="flex items-center gap-1.5 h-9 px-3.5 rounded-full text-xs font-bold bg-[#FFFDF8] dark:bg-stone-900 border border-[#E8D8C4] dark:border-stone-700 text-[#543D2B] dark:text-stone-300 hover:bg-[#FAF2E8] transition-all active:scale-95 cursor-pointer shadow-2xs"
                  title="Share Bhajan"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#651317] dark:text-amber-400" />
                  <span>{isHi ? 'शेयर करें' : 'Share'}</span>
                </button>

                {/* WhatsApp Direct Share Button */}
                <button
                  type="button"
                  onClick={() => handleShare('whatsapp')}
                  className="hidden sm:flex items-center gap-1.5 h-9 px-3.5 rounded-full text-xs font-bold bg-[#FFFDF8] dark:bg-stone-900 border border-[#E8D8C4] dark:border-stone-700 text-[#543D2B] dark:text-stone-300 hover:bg-[#FAF2E8] transition-all active:scale-95 cursor-pointer shadow-2xs"
                  title="WhatsApp"
                >
                  <span>WhatsApp</span>
                </button>

                {/* Add to Group Button */}
                <button
                  type="button"
                  onClick={() => setIsAddToGroupOpen(true)}
                  className="flex items-center gap-1.5 h-9 px-3.5 rounded-full text-xs font-bold bg-[#FFFDF8] dark:bg-stone-900 border border-[#E8D8C4] dark:border-stone-700 text-[#543D2B] dark:text-stone-300 hover:bg-[#FAF2E8] transition-all active:scale-95 cursor-pointer shadow-2xs"
                  title="Add to Group"
                >
                  <Users className="w-3.5 h-3.5 text-[#651317] dark:text-amber-400" />
                  <span>{isHi ? 'समूह में जोड़ें' : 'Add to Group'}</span>
                </button>

                {/* Video Shortcut (Matching Harmonized Style) */}
                {(resolvedBhajan.youtubeUrl || resolvedVideoId) && (
                  <button
                    type="button"
                    onClick={() => {
                      scrollToVideo();
                      setIsPlaying(true);
                    }}
                    className="flex items-center gap-1.5 h-9 px-3.5 rounded-full text-xs font-bold bg-[#FFFDF8] dark:bg-stone-900 border border-[#E8D8C4] dark:border-stone-700 text-[#543D2B] dark:text-stone-300 hover:bg-[#FAF2E8] transition-all active:scale-95 cursor-pointer shadow-2xs"
                  >
                    <Video className="w-3.5 h-3.5 text-[#651317] dark:text-amber-400" />
                    <span>{isHi ? 'वीडियो देखें' : 'Watch Video'}</span>
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* PRIMARY SECTION: Sacred Lyrics Article (Top Focus) */}
          <article className="space-y-3 bg-[#FFFDF8] dark:bg-[#140d08] p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-[#E8D8C4] dark:border-stone-800 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E8D8C4]/60 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Music2 className="w-4 h-4 text-[#651317] dark:text-amber-400" />
                <h2 className="text-base sm:text-lg font-bold font-serif text-[#4A1516] dark:text-amber-300">
                  {isHi ? 'भजन लिरिक्स (Sacred Lyrics)' : 'Sacred Lyrics'}
                </h2>
              </div>

              {/* Toolbar: Transliteration, Font Size Scaler & Copy Lyrics Button */}
              <div className="flex items-center gap-2 flex-wrap">
                {resolvedBhajan.lyricsTransliteration && (
                  <div className="inline-flex rounded-full p-0.5 bg-stone-100 dark:bg-stone-800 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setLyricsTab('hindi')}
                      className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                        lyricsTab === 'hindi'
                          ? 'bg-[#651317] text-white shadow-2xs'
                          : 'text-stone-600 dark:text-stone-300'
                      }`}
                    >
                      हिन्दी
                    </button>
                    <button
                      type="button"
                      onClick={() => setLyricsTab('translit')}
                      className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                        lyricsTab === 'translit'
                          ? 'bg-[#651317] text-white shadow-2xs'
                          : 'text-stone-600 dark:text-stone-300'
                      }`}
                    >
                      English
                    </button>
                  </div>
                )}

                {/* Font Size Adjuster */}
                <div className="inline-flex items-center gap-1 bg-stone-100 dark:bg-stone-800/80 rounded-full px-2.5 py-1 text-xs font-bold text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                  <button
                    type="button"
                    onClick={() => setFontSizeLevel((prev) => (prev === 'lg' ? 'md' : 'sm'))}
                    className="p-0.5 hover:text-[#651317] dark:hover:text-amber-400 transition-colors cursor-pointer"
                    title="Smaller Text"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono px-0.5">Aa</span>
                  <button
                    type="button"
                    onClick={() => setFontSizeLevel((prev) => (prev === 'sm' ? 'md' : 'lg'))}
                    className="p-0.5 hover:text-[#651317] dark:hover:text-amber-400 transition-colors cursor-pointer"
                    title="Larger Text"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Copy Lyrics Button inside Lyrics Card Header (image-1787555874921.png) */}
                <button
                  type="button"
                  onClick={handleCopyLyrics}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-bold bg-[#651317] hover:bg-[#80181D] text-white transition-all active:scale-95 cursor-pointer shadow-2xs"
                >
                  {copiedLyrics ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLyrics ? (isHi ? 'कॉपी हुआ' : 'Copied') : (isHi ? 'लिरिक्स कॉपी' : 'Copy')}</span>
                </button>
              </div>
            </div>

            {/* Lyrics Text Box */}
            <div className="pt-3">
              <pre
                className={`font-serif whitespace-pre-wrap text-[#32251E] dark:text-stone-200 font-medium selection:bg-amber-200 dark:selection:bg-amber-900/60 ${lyricsFontSizeClass}`}
              >
                {lyricsTab === 'translit' && resolvedBhajan.lyricsTransliteration
                  ? resolvedBhajan.lyricsTransliteration
                  : resolvedBhajan.lyricsHindi || (isHi ? 'लिरिक्स जल्द ही उपलब्ध होंगे।' : 'Lyrics will be available soon.')}
              </pre>
            </div>
          </article>

          {/* SECONDARY SECTION: Official Video & Darshan (Below Lyrics) */}
          {(resolvedBhajan.youtubeUrl || resolvedVideoId) && (
            <div
              ref={videoSectionRef}
              className="overflow-hidden rounded-2xl sm:rounded-3xl border border-[#E8D8C4] dark:border-stone-800 bg-black shadow-md relative aspect-video w-full"
            >
              {isPlaying && resolvedVideoId ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${resolvedVideoId}?autoplay=1&rel=0`}
                  title={resolvedBhajan.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              ) : (
                <div
                  onClick={() => {
                    if (resolvedVideoId) {
                      setIsPlaying(true);
                    } else if (resolvedBhajan.youtubeUrl) {
                      window.open(resolvedBhajan.youtubeUrl, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  className="absolute inset-0 cursor-pointer group"
                >
                  <img
                    src={
                      resolvedBhajan.imageUrl ||
                      (resolvedVideoId ? `https://i.ytimg.com/vi/${resolvedVideoId}/hqdefault.jpg` : '/og-image.jpg')
                    }
                    alt={resolvedBhajan.title}
                    width={800}
                    height={450}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover opacity-85 group-hover:scale-102 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />

                  {/* Centered Play Button Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white p-4 text-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#651317] hover:bg-[#80181D] text-white shadow-xl transition-all group-hover:scale-110 border-2 border-amber-400/60 cursor-pointer">
                      <Play className="ml-1 h-7 w-7 fill-white stroke-none" />
                    </span>
                    <span className="text-xs sm:text-sm font-bold bg-black/75 px-4 py-1.5 rounded-full backdrop-blur-xs border border-white/20 shadow-sm inline-flex items-center gap-2">
                      {isHi ? 'भजन वीडियो देखें' : 'Watch Bhajan Video'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Related / Recommended Bhajans Section (Non-Blocking) */}
          {relatedBhajans.length > 0 && (
            <section className="space-y-4 pt-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#651317] dark:text-amber-400" />
                  <h2 className="text-lg sm:text-xl font-bold font-display text-[#3A2418] dark:text-amber-100">
                    {deity ? (isHi ? `अन्य ${deityName} भजन` : `More ${deityName} Bhajans`) : (isHi ? 'संबंधित भजन' : 'Related Bhajans')}
                  </h2>
                </div>

                <Link
                  to={deity ? `/deity/${deitySlug}` : '/all-bhajans'}
                  className="text-xs font-bold text-[#651317] dark:text-amber-400 hover:underline"
                >
                  {isHi ? 'सभी देखें →' : 'View All →'}
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {relatedBhajans.map((item) => (
                  <BhajanCard
                    key={item.id}
                    bhajan={item}
                    onCardClick={(b) => {
                      navigate(`/bhajan/${b.slug}`);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Add To Group Modal */}
      <AddToGroupDialog
        isOpen={isAddToGroupOpen}
        onClose={() => setIsAddToGroupOpen(false)}
        bhajan={resolvedBhajan}
      />
    </>
  );
}
