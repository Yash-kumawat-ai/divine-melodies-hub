import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Loader2, Play } from "lucide-react";
import { Bhajan, getDeityById } from "@/data/bhajans";
import { getContentUrl } from "@/lib/contentUrls";
import { useLanguage } from "@/hooks/useLanguage";
import { useLikedBhajans } from "@/hooks/useLikedBhajans";
import { useAuth } from "@/hooks/useAuth";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import { resolveBhajanYouTubePlayback, openYouTubeSearchFallback } from "@/lib/youtubeEmbedPopup";
import { toast } from "sonner";

interface BhajanCardProps {
  bhajan: Bhajan;
  onCardClick?: (bhajan: Bhajan) => void;
}

export default function BhajanCard({ bhajan, onCardClick }: BhajanCardProps) {
  const navigate = useNavigate();
  const deity = getDeityById(bhajan.deityId);
  const [playBusy, setPlayBusy] = useState(false);
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { isLiked, toggleLike } = useLikedBhajans();
  const { openPlayer } = useYouTubePlayer();
  const liked = isLiked(bhajan.id);
  const hindiTitle = (bhajan.titleHindi || "").trim();
  const englishTitle = (bhajan.title || "").trim();
  const primaryTitle = hindiTitle || englishTitle;
  const secondaryTitle = hindiTitle && englishTitle && hindiTitle !== englishTitle ? englishTitle : "";

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onCardClick) {
      onCardClick(bhajan);
    } else {
      navigate(getContentUrl(bhajan));
    }
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error(t("signInToLike"));
      return;
    }
    toggleLike(bhajan.id);
  };

  const handlePlayClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (playBusy) return;
    setPlayBusy(true);
    try {
      const playback = await resolveBhajanYouTubePlayback({
        videoEmbedId: bhajan.videoEmbedId,
        youtubeUrl: bhajan.youtubeUrl,
        title: bhajan.title,
        singerName: bhajan.singerName,
      });

      if (playback) {
        openPlayer({
          ...playback,
          bhajanId: bhajan.id,
          bhajanSlug: bhajan.slug,
          deityId: bhajan.deityId,
          lyricsHindi: bhajan.lyricsHindi,
          lyricsTransliteration: bhajan.lyricsTransliteration,
          titleHindi: bhajan.titleHindi,
          imageUrl: bhajan.imageUrl,
          category: bhajan.contentType || bhajan.subType || "bhajan",
          singerName: bhajan.singerName,
        });
        return;
      }

      openYouTubeSearchFallback({
        videoEmbedId: bhajan.videoEmbedId,
        youtubeUrl: bhajan.youtubeUrl,
        title: bhajan.title,
        singerName: bhajan.singerName,
      });
      toast.message(t("play") + " — YouTube", {
        description: "Could not load the in-app player. Opened YouTube instead.",
      });
    } finally {
      setPlayBusy(false);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick(e as any);
        }
      }}
      className="group block min-w-0 h-full rounded-2xl bg-card border border-border/60 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
    >
      <div className={`h-1.5 ${deity?.colorClass ?? "bg-primary"}`} />
      <div className="p-3.5 sm:p-4.5 relative flex-1 flex flex-col justify-between">
        <button
          type="button"
          onClick={handleLikeClick}
          className="absolute right-2.5 sm:right-4 top-2.5 sm:top-4 z-10 rounded-full border border-border/60 bg-background/90 p-1.5 sm:p-2 shadow-sm backdrop-blur-sm transition-colors hover:bg-background cursor-pointer"
          aria-label={liked ? t("unlikeBhajan") : t("likeBhajan")}
        >
          <Heart
            className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${liked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
          />
        </button>

        <div>
          <div className="flex items-center gap-1.5 mb-2 sm:mb-2.5 pr-7 sm:pr-9 min-w-0">
            <span className="text-base sm:text-lg shrink-0">{deity?.emoji}</span>
            <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
              {language === 'hi' ? (deity?.nameHindi || deity?.name) : deity?.name}
            </span>
          </div>

          <h3
            className="font-display text-base sm:text-lg font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2"
            title={primaryTitle}
          >
            {primaryTitle}
          </h3>

          {secondaryTitle ? (
            <p className="text-xs text-muted-foreground/80 mt-0.5 line-clamp-1" title={secondaryTitle}>
              {secondaryTitle}
            </p>
          ) : null}

          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1 font-medium" title={bhajan.singerName}>
            {language === 'hi' ? `${bhajan.singerName} द्वारा` : `by ${bhajan.singerName}`}
          </p>
        </div>

        <div className="mt-3.5 sm:mt-4 pt-2 border-t border-border/30">
          <button
            type="button"
            onClick={handlePlayClick}
            disabled={playBusy}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#5C1D0C] dark:bg-[#E8B15C] text-white dark:text-black py-2 px-3 text-xs sm:text-sm font-bold shadow-sm hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
          >
            {playBusy ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current shrink-0" />
            )}
            {t("play")}
          </button>
        </div>
      </div>
    </div>
  );
}
