import { useState } from "react";
import { Heart, Loader2, Play, Star } from "lucide-react";
import { Bhajan, getDeityById, bhajans as allBhajansData } from "@/data/bhajans";
import BhajanDetailModal from "@/components/BhajanDetailModal";
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
  const deity = getDeityById(bhajan.deityId);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [modalBhajan, setModalBhajan] = useState<Bhajan>(bhajan);
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
      setModalBhajan(bhajan);
      setIsDetailOpen(true);
    }
  };

  const handleSelectRelated = (selected: Bhajan) => {
    setModalBhajan(selected);
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
        openPlayer(playback);
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
    <>
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
        className="group block min-w-0 rounded-xl bg-card overflow-hidden shadow-temple hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      >
        <div className={`h-1.5 ${deity?.colorClass ?? "bg-primary"}`} />
        <div className="p-3.5 sm:p-5 relative">
          <button
            type="button"
            onClick={handleLikeClick}
            className="absolute right-2.5 sm:right-4 top-2.5 sm:top-4 z-10 rounded-full border border-border/60 bg-background/90 p-1.5 sm:p-2 shadow-sm backdrop-blur-sm transition-colors hover:bg-background"
            aria-label={liked ? t("unlikeBhajan") : t("likeBhajan")}
          >
            <Heart
              className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${liked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
            />
          </button>
          <div className="flex items-center gap-1.5 mb-2 sm:mb-3 pr-7 sm:pr-9 min-w-0">
            <span className="text-base sm:text-lg shrink-0">{deity?.emoji}</span>
            <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
              {language === 'hi' ? (deity?.nameHindi || deity?.name) : deity?.name}
            </span>
          </div>
          <h3
            className="font-display text-base sm:text-lg md:text-xl font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2"
            title={primaryTitle}
          >
            {primaryTitle}
          </h3>
          {secondaryTitle ? (
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 line-clamp-1" title={secondaryTitle}>
              {secondaryTitle}
            </p>
          ) : null}
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2 line-clamp-1" title={bhajan.singerName}>
            {language === 'hi' ? `${bhajan.singerName} द्वारा` : `by ${bhajan.singerName}`}
          </p>
          <div className="mt-3 sm:mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm text-muted-foreground shrink-0">
              <span className="flex items-center gap-1">
                <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                {(bhajan.playCount / 1000).toFixed(0)}K
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-secondary text-secondary shrink-0" />
                {bhajan.rating.toFixed(1)}
              </span>
            </div>
            <button
              type="button"
              onClick={handlePlayClick}
              disabled={playBusy}
              className="inline-flex w-full sm:w-auto shrink-0 items-center justify-center gap-1 sm:gap-1.5 rounded-full bg-primary/10 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground disabled:opacity-60"
            >
              {playBusy ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />}
              {t("play")}
            </button>
          </div>
        </div>
      </div>

      {!onCardClick && (
        <BhajanDetailModal
          bhajan={modalBhajan}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          allBhajans={allBhajansData}
          onSelectBhajan={handleSelectRelated}
        />
      )}
    </>
  );
}
