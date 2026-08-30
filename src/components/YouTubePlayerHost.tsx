import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Music2, 
  Heart, 
  BookOpen, 
  Sparkles, 
  ChevronRight, 
  Play,
  Loader2
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
import { resolveBhajanYouTubePlayback } from "@/lib/youtubeEmbedPopup";
import { toast } from "sonner";
import devotionalHeroBg from "@/pages/images/devotional_background_high_quality(1).webp";

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
        overlayClassName="z-[250]"
        className={cn(
          mobileFullscreenDialog,
          "!z-[251]",
          "!flex !flex-col !min-h-0 !gap-0 !overflow-hidden border-border bg-[#FAF6F0] dark:bg-[#120E0A] p-0 text-foreground sm:max-w-4xl",
        )}
      >
        {/* Devotional background overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-25 dark:opacity-15 bg-cover bg-right-top"
          style={{ backgroundImage: `url(${devotionalHeroBg})` }}
        />

        {/* Stable Top Header Bar - Pure Back Button & Bhajan Title (No Share Button) */}
        <div className="relative z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[#E8D8C4]/60 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 px-3.5 sm:px-5 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <DialogClose
              type="button"
              aria-label={t("back")}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E8D8C4] dark:border-zinc-700 bg-white/90 dark:bg-zinc-800/90 text-foreground shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 text-[#651317] dark:text-amber-300" />
            </DialogClose>

            <div className="min-w-0 text-left flex-1">
              <DialogTitle className="font-serif text-sm sm:text-base font-bold leading-snug text-[#32251E] dark:text-[#FFFDF8] truncate max-w-[280px] sm:max-w-xl">
                {video?.titleHindi || video?.title || "Bhajan Playback"}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {video?.title || "Bhajan video player modal"}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Body Content - Smooth Native Scroll */}
        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain p-3.5 sm:p-5 pb-24 sm:pb-12">
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
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

            {/* Now Playing Info Bar & Primary Actions Strip */}
            <div className="rounded-2xl border border-[#E8D8C4] dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 select-none">
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
              <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                {(video?.bhajanId || currentBhajan) && (
                  <button
                    onClick={handleLike}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95 focus-visible:outline-none select-none",
                      isCurrentLiked
                        ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 shadow-xs"
                        : "bg-white dark:bg-zinc-800 border-[#E8D8C4] dark:border-zinc-700 text-[#786252] dark:text-stone-300 hover:bg-[#FAF0E4] dark:hover:bg-zinc-700/50"
                    )}
                    title={isHi ? "पसंद करें" : "Like"}
                  >
                    <Heart className={cn("w-3.5 h-3.5", isCurrentLiked && "fill-current text-rose-600 dark:text-rose-400")} />
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
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4.5 py-2 rounded-full bg-gradient-to-r from-[#7A2D28] to-[#520f12] hover:from-[#651317] hover:to-[#400c0e] text-white text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95 cursor-pointer select-none"
                  >
                    <BookOpen className="w-4 h-4 text-amber-200" />
                    <span>{isHi ? "सम्पूर्ण लिरिक्स व पाठ खोलें" : "Open Full Lyrics & Page"}</span>
                    <ChevronRight className="w-4 h-4 text-amber-200/80" />
                  </button>
                )}
              </div>
            </div>

            {/* Up Next / Related Bhajans List */}
            {recommendedBhajans.length > 0 && (
              <div className="mt-2 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#7A2D28] dark:text-amber-300" />
                    <h3 className="font-serif text-sm sm:text-base font-bold text-[#32251E] dark:text-amber-100">
                      {isHi ? "अगले पावन भजन श्रृंखला" : "Up Next Devotional Songs"}
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-[#786252] dark:text-stone-400">
                    {recommendedBhajans.length} {isHi ? "भजन" : "songs"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {recommendedBhajans.map((item) => {
                    const isTrackPlaying = video?.id === item.videoEmbedId || String(currentBhajan?.id) === String(item.id);
                    const isSwitching = switchingTrack === String(item.id);

                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "group rounded-2xl border p-3 transition-all duration-200 shadow-2xs flex flex-col justify-between gap-2.5",
                          isTrackPlaying
                            ? "border-amber-500/60 bg-amber-50/80 dark:bg-amber-950/30 ring-1 ring-amber-500/30"
                            : "border-[#E8D8C4] dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 hover:border-amber-400/50 hover:bg-amber-50/40 dark:hover:bg-zinc-800/60"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-amber-500/10 border border-amber-500/20">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Music2 className="h-4 w-4 text-[#7A2D28] dark:text-[#E8B15C]" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <span className="inline-block rounded-full bg-amber-100 dark:bg-zinc-800 px-2 py-0.2 text-[9px] font-bold text-[#7A2D28] dark:text-amber-300 mb-0.5">
                              {isHi ? "पावन भजन" : "Bhajan"}
                            </span>
                            <h4 className="line-clamp-1 font-serif text-xs sm:text-sm font-bold text-[#32251E] dark:text-amber-100">
                              {item.titleHindi || item.title}
                            </h4>
                            <p className="truncate text-[11px] text-[#786252] dark:text-stone-400">
                              {item.singerName || "Traditional"}
                            </p>
                          </div>
                        </div>

                        {/* Dual Action Buttons */}
                        <div className="flex items-center gap-2 pt-1 border-t border-[#E8D8C4]/50 dark:border-zinc-800/60">
                          <button
                            onClick={() => {
                              closePlayer();
                              navigate(getContentUrl(item));
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#E8D8C4] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[11px] font-bold text-[#786252] dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-zinc-700 transition-all cursor-pointer select-none active:scale-95"
                          >
                            <BookOpen className="w-3 h-3 text-[#651317] dark:text-amber-300" />
                            <span>{isHi ? "पाठ व विवरण" : "Lyrics"}</span>
                          </button>

                          <button
                            onClick={() => handlePlayRecommended(item)}
                            disabled={isSwitching}
                            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-[#651317] hover:bg-[#520f12] text-white text-[11px] font-bold transition-all shadow-2xs active:scale-95 cursor-pointer select-none disabled:opacity-50"
                          >
                            {isSwitching ? (
                              <Loader2 className="w-3 h-3 animate-spin text-amber-300" />
                            ) : (
                              <Play className="w-3 h-3 fill-current text-amber-300" />
                            )}
                            <span>{isTrackPlaying ? (isHi ? "चल रहा है" : "Playing") : (isHi ? "चलाएं" : "Play")}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
