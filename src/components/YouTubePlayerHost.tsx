import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Music2, 
  Heart, 
  Share2, 
  Copy, 
  Check, 
  BookOpen, 
  Sparkles, 
  ChevronRight, 
  Play 
} from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import { useLanguage } from "@/hooks/useLanguage";
import { useLikedBhajans } from "@/hooks/useLikedBhajans";
import { useAuth } from "@/hooks/useAuth";
import { mobileFullscreenDialog } from "@/lib/dialogStyles";
import { buildYouTubeEmbedUrl } from "@/lib/youtubeSearch";
import { cn } from "@/lib/utils";
import { bhajans as staticBhajans, getDeityById, type Bhajan } from "@/data/bhajans";
import { getContentUrl } from "@/lib/contentUrls";
import { getDeityUrl, resolveDeityBySlug } from "@/lib/deityUrls";
import { resolveBhajanYouTubePlayback } from "@/lib/youtubeEmbedPopup";
import { getPublicSiteUrl } from "@/lib/env";
import { toast } from "sonner";
import devotionalHeroBg from "@/pages/images/devotional_background_high_quality(1).webp";
import diyaSvg from "@/pages/images/svg/diya.svg";

function getThumbnailUrl(videoId?: string) {
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : "";
}

export default function YouTubePlayerHost() {
  const navigate = useNavigate();
  const { isOpen, video, closePlayer, openPlayer } = useYouTubePlayer();
  const { language, t } = useLanguage();
  const isHi = language === "hi";
  const { user } = useAuth();
  const { isLiked, toggleLike } = useLikedBhajans();

  const [activeTab, setActiveTab] = useState<"lyrics" | "upnext" | "deity">("lyrics");
  const [copiedLink, setCopiedLink] = useState(false);
  const [switchingTrack, setSwitchingTrack] = useState<string | null>(null);

  const thumbnailUrl = getThumbnailUrl(video?.id);

  // Match full bhajan object if available
  const currentBhajan = useMemo<Bhajan | null>(() => {
    if (!video) return null;
    if (video.bhajanSlug) {
      const found = staticBhajans.find((b) => b.slug.toLowerCase() === video.bhajanSlug?.toLowerCase());
      if (found) return found;
    }
    if (video.bhajanId) {
      const found = staticBhajans.find((b) => String(b.id) === String(video.bhajanId));
      if (found) return found;
    }
    // Try matching by title or id
    return staticBhajans.find((b) => b.videoEmbedId === video.id || b.title === video.title) || null;
  }, [video]);

  const deityId = video?.deityId || currentBhajan?.deityId;
  const deity = deityId ? getDeityById(deityId) : undefined;
  const deityProfile = deity ? resolveDeityBySlug(deity.slug) : undefined;

  const isCurrentLiked = video?.bhajanId
    ? isLiked(video.bhajanId)
    : currentBhajan
      ? isLiked(currentBhajan.id)
      : false;

  // Up Next / Recommended Bhajans (same deity first, or popular)
  const recommendedBhajans = useMemo(() => {
    if (!video) return [];
    const pool = deityId
      ? staticBhajans.filter((b) => b.deityId === deityId && b.slug !== video.bhajanSlug && b.id !== video.bhajanId)
      : staticBhajans.filter((b) => b.slug !== video.bhajanSlug && b.id !== video.bhajanId);

    return pool.slice(0, 6);
  }, [video, deityId]);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    const idToLike = video?.bhajanId || currentBhajan?.id;
    if (!idToLike) return;
    if (!user) {
      toast.error(isHi ? "पसंद करने के लिए कृपया लॉगिन करें" : "Please sign in to like");
      return;
    }
    toggleLike(idToLike);
  };

  const handleShare = async () => {
    const siteUrl = getPublicSiteUrl();
    const bhajanSlug = video?.bhajanSlug || currentBhajan?.slug;
    const url = bhajanSlug ? `${siteUrl}/bhajan/${bhajanSlug}` : window.location.href;
    const title = video?.titleHindi || video?.title || "Devotional Bhajan";

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    await navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success(isHi ? "लिंक कॉपी हो गया!" : "Link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePlayRecommended = async (item: Bhajan) => {
    setSwitchingTrack(String(item.id));
    try {
      const playback = await resolveBhajanYouTubePlayback({
        videoEmbedId: item.videoEmbedId,
        youtubeUrl: item.youtubeUrl,
        title: item.title,
        singerName: item.singerName,
      });
      if (playback) {
        openPlayer({
          ...playback,
          bhajanId: item.id,
          bhajanSlug: item.slug,
          deityId: item.deityId,
          lyricsHindi: item.lyricsHindi,
          lyricsTransliteration: item.lyricsTransliteration,
          titleHindi: item.titleHindi,
          imageUrl: item.imageUrl,
          category: item.contentType || item.subType || "bhajan",
          singerName: item.singerName,
        });
      } else {
        toast.error(isHi ? "वीडियो लोड नहीं हो सका" : "Could not load video");
      }
    } finally {
      setSwitchingTrack(null);
    }
  };

  const lyricsText = video?.lyricsHindi || currentBhajan?.lyricsHindi;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closePlayer()}>
      <DialogContent
        showClose={false}
        overlayClassName="z-[160]"
        className={cn(
          mobileFullscreenDialog,
          "!z-[161]",
          "!flex !flex-col !min-h-0 !gap-0 !overflow-hidden border-border bg-[#FAF6F0] dark:bg-[#120E0A] p-0 text-foreground sm:max-w-4xl",
        )}
      >
        {/* Devotional background overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-25 dark:opacity-15 bg-cover bg-right-top"
          style={{ backgroundImage: `url(${devotionalHeroBg})` }}
        />

        {/* Top Header Bar */}
        <div className="relative z-10 flex shrink-0 items-center justify-between gap-3 border-b border-[#E8D8C4]/60 dark:border-zinc-800 bg-white/85 dark:bg-zinc-900/85 px-3.5 py-3 pt-[max(0.6rem,env(safe-area-inset-top))] backdrop-blur-md sm:px-5 sm:py-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <DialogClose
              type="button"
              aria-label={t("back")}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E8D8C4] dark:border-zinc-700 bg-white/90 dark:bg-zinc-800/90 text-foreground shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 text-[#651317] dark:text-amber-300" />
            </DialogClose>

            <div className="min-w-0 text-left">
              <div className="flex items-center gap-1.5">
                <img src={diyaSvg} alt="" className="w-3 h-3 object-contain" />
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#7A2D28] dark:text-[#E8B15C]">
                  {isHi ? "पावन भजन श्रवण" : "NOW PLAYING"}
                </p>
              </div>
              <DialogTitle className="mt-0.5 font-serif text-sm font-bold leading-snug text-[#32251E] dark:text-[#FFFDF8] truncate max-w-[220px] sm:max-w-md">
                {video?.titleHindi || video?.title || "Bhajan Playback"}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {video?.title || "Bhajan video player modal"}
              </DialogDescription>
            </div>
          </div>

          {/* Quick Share Action */}
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E8D8C4] dark:border-zinc-700 bg-white/90 dark:bg-zinc-800/90 text-xs font-bold text-[#651317] dark:text-amber-300 hover:bg-[#FAF0E4] dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
            title={isHi ? "शेयर करें" : "Share"}
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedLink ? (isHi ? "कॉपी हुआ" : "Copied") : (isHi ? "शेयर" : "Share")}</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain p-3.5 sm:p-5">
          <div className="mx-auto flex max-w-3xl flex-col gap-3.5">
            {/* YouTube Video Player Iframe */}
            <div className="aspect-video w-full overflow-hidden rounded-2xl border border-amber-900/15 dark:border-amber-400/20 bg-black shadow-lg ring-1 ring-amber-500/10">
              {video ? (
                <iframe
                  src={buildYouTubeEmbedUrl(video.id)}
                  title={`YouTube player for ${video.title}`}
                  className="h-full w-full border-0"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : null}
            </div>

            {/* Now Playing Info Bar & Action Strip */}
            <div className="rounded-2xl border border-[#E8D8C4] dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 p-3.5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 select-none">
              <div className="min-w-0 flex-1 flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-amber-500/10 shadow-xs border border-amber-500/20">
                  {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Music2 className="h-5 w-5 text-[#7A2D28] dark:text-[#E8B15C]" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-block rounded-full bg-[#7A2D28]/10 dark:bg-[#E8B15C]/15 border border-[#7A2D28]/20 dark:border-[#E8B15C]/30 px-2 py-0.2 text-[9.5px] font-bold uppercase tracking-wider text-[#7A2D28] dark:text-[#E8B15C]">
                      {video?.category || "BHAJAN"}
                    </span>
                    {deity && (
                      <span className="text-[10px] font-bold text-muted-foreground">
                        • {isHi ? deity.nameHindi : deity.name}
                      </span>
                    )}
                  </div>
                  <h2 className="line-clamp-1 text-sm sm:text-base font-bold font-serif leading-snug text-[#32251E] dark:text-[#FFFDF8]">
                    {video?.titleHindi || video?.title || "Bhajan Playback"}
                  </h2>
                  <p className="truncate text-xs font-medium text-muted-foreground">
                    {video?.singerName || video?.channel || "Traditional"}
                  </p>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {(video?.bhajanId || currentBhajan) && (
                  <button
                    onClick={handleLike}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95",
                      isCurrentLiked
                        ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400"
                        : "bg-white dark:bg-zinc-800 border-[#E8D8C4] dark:border-zinc-700 text-[#786252] dark:text-stone-300 hover:border-rose-400 hover:text-rose-600"
                    )}
                    title={isHi ? "पसंद करें" : "Like"}
                  >
                    <Heart className={cn("w-3.5 h-3.5", isCurrentLiked && "fill-current text-rose-600")} />
                    <span>{isCurrentLiked ? (isHi ? "पसंद किया" : "Liked") : (isHi ? "पसंद" : "Like")}</span>
                  </button>
                )}

                {(video?.bhajanSlug || currentBhajan?.slug) && (
                  <button
                    onClick={() => {
                      const slug = video?.bhajanSlug || currentBhajan?.slug;
                      closePlayer();
                      navigate(currentBhajan ? getContentUrl(currentBhajan) : `/bhajan/${slug}`);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#651317] hover:bg-[#520f12] text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{isHi ? "सम्पूर्ण पाठ" : "Lyrics & Details"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Devotional Interactive Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-[#E8D8C4]/80 dark:border-zinc-800 pb-2">
              <button
                onClick={() => setActiveTab("lyrics")}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer",
                  activeTab === "lyrics"
                    ? "bg-[#651317] text-white shadow-xs"
                    : "bg-white/80 dark:bg-zinc-900/80 border border-[#E8D8C4] dark:border-zinc-800 text-[#786252] dark:text-stone-300 hover:bg-[#FAF0E4]"
                )}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{isHi ? "भजन बोल / पाठ" : "Lyrics & Chants"}</span>
              </button>

              <button
                onClick={() => setActiveTab("upnext")}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer",
                  activeTab === "upnext"
                    ? "bg-[#651317] text-white shadow-xs"
                    : "bg-white/80 dark:bg-zinc-900/80 border border-[#E8D8C4] dark:border-zinc-800 text-[#786252] dark:text-stone-300 hover:bg-[#FAF0E4]"
                )}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isHi ? "अगले पावन भजन" : "Up Next"}</span>
                {recommendedBhajans.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-zinc-800 text-[#651317] dark:text-amber-300 font-bold">
                    {recommendedBhajans.length}
                  </span>
                )}
              </button>

              {deityProfile && (
                <button
                  onClick={() => setActiveTab("deity")}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ml-auto",
                    activeTab === "deity"
                      ? "bg-[#651317] text-white shadow-xs"
                      : "bg-white/80 dark:bg-zinc-900/80 border border-[#E8D8C4] dark:border-zinc-800 text-[#786252] dark:text-stone-300 hover:bg-[#FAF0E4]"
                  )}
                >
                  <span>{isHi ? "देव महिमा" : "About Deity"}</span>
                </button>
              )}
            </div>

            {/* TAB CONTENT: 1. LYRICS & SACRED CHANTS */}
            {activeTab === "lyrics" && (
              <div className="rounded-2xl border border-[#E8D8C4] dark:border-zinc-800 bg-white/95 dark:bg-[#150f0b] p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#E8D8C4]/60 dark:border-zinc-800/60 pb-2">
                  <div className="flex items-center gap-2">
                    <img src={diyaSvg} alt="" className="w-4 h-4 object-contain" />
                    <h3 className="font-serif text-sm sm:text-base font-bold text-[#32251E] dark:text-amber-100">
                      {isHi ? "पावन लिरिक्स व पाठ" : "Devotional Lyrics"}
                    </h3>
                  </div>

                  {lyricsText && (
                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(lyricsText);
                        toast.success(isHi ? "भजन बोल कॉपी हो गए!" : "Lyrics copied!");
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#651317] dark:text-amber-300 hover:underline cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{isHi ? "कॉपी करें" : "Copy Lyrics"}</span>
                    </button>
                  )}
                </div>

                {lyricsText ? (
                  <div className="font-serif text-sm sm:text-base text-[#32251E] dark:text-amber-100/90 whitespace-pre-line leading-relaxed sm:leading-loose text-center max-w-xl mx-auto py-2">
                    {lyricsText}
                  </div>
                ) : (
                  /* Divine Mangalacharan Placeholder when full text is not provided */
                  <div className="text-center py-6 space-y-3 max-w-md mx-auto">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/40 text-[#651317] dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-serif text-base sm:text-lg font-bold text-[#651317] dark:text-amber-300">
                        ॥ श्री हरिः शरणम् ॥
                      </p>
                      <p className="text-xs sm:text-sm text-[#786252] dark:text-stone-300 font-serif leading-relaxed italic">
                        "मंगल भवन अमंगल हारी। द्रवहु सुदसरथ अजिर बिहारी॥"
                      </p>
                    </div>
                    <p className="text-[11px] text-[#786252] dark:text-stone-400">
                      {isHi 
                        ? "भक्तिभाव से श्रवण करें और प्रभु का ध्यान लगाएं।" 
                        : "Listen with pure devotion and meditate on the divine melody."}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 2. UP NEXT & RECOMMENDED PLAYLIST */}
            {activeTab === "upnext" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs font-bold text-[#786252] dark:text-stone-400 uppercase tracking-wider">
                    {isHi ? "पावन भजन शृंखला (अगला भजन चुनें)" : "Devotional Playlist (Select to play)"}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {recommendedBhajans.map((rec) => {
                    const isBusy = switchingTrack === String(rec.id);
                    return (
                      <div
                        key={rec.id}
                        onClick={() => !isBusy && handlePlayRecommended(rec)}
                        className="group flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-[#E8D8C4] dark:border-zinc-800 hover:border-amber-400 dark:hover:border-amber-500/50 hover:bg-amber-50/50 dark:hover:bg-zinc-800/60 transition-all cursor-pointer shadow-2xs select-none"
                      >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-amber-500/10 border border-[#E8D8C4]">
                          {rec.imageUrl ? (
                            <img src={rec.imageUrl} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Music2 className="h-5 w-5 text-[#651317] dark:text-amber-300" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-5 h-5 text-white fill-current" />
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-bold font-serif text-[#32251E] dark:text-[#FFFDF8] truncate group-hover:text-[#651317] dark:group-hover:text-amber-300 transition-colors">
                            {rec.titleHindi || rec.title}
                          </h4>
                          <p className="text-[11px] text-[#786252] dark:text-stone-400 truncate mt-0.5">
                            {rec.singerName || "Traditional"}
                          </p>
                        </div>

                        <button
                          type="button"
                          className="h-8 w-8 rounded-full bg-[#651317]/10 dark:bg-amber-400/10 text-[#651317] dark:text-amber-300 flex items-center justify-center shrink-0 group-hover:bg-[#651317] group-hover:text-white transition-colors"
                        >
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB CONTENT: 3. ABOUT DEITY */}
            {activeTab === "deity" && deityProfile && (
              <div className="rounded-2xl border border-[#E8D8C4] dark:border-zinc-800 bg-white/95 dark:bg-[#150f0b] p-4 sm:p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 shadow-xs shrink-0">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-stone-900 flex items-center justify-center">
                      {deityProfile.imageUrl ? (
                        <img src={deityProfile.imageUrl} alt={deityProfile.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">{deityProfile.emoji}</span>
                      )}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-base sm:text-lg font-bold text-[#32251E] dark:text-[#FFFDF8]">
                      {isHi ? deityProfile.nameHindi : deityProfile.name}
                    </h3>
                    <p className="text-xs text-[#651317] dark:text-amber-300 font-semibold truncate">
                      {deityProfile.titleHindi || deityProfile.description}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      closePlayer();
                      navigate(getDeityUrl(deityProfile));
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#651317] hover:bg-[#520f12] text-white text-xs font-bold cursor-pointer shrink-0"
                  >
                    <span>{isHi ? "दर्शन करें" : "Visit Portal"}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-[#543D2B] dark:text-stone-300 leading-relaxed font-serif">
                  {isHi ? deityProfile.aboutHindi : deityProfile.aboutEnglish}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
