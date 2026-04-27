import { useState } from "react";
import { Link } from "react-router-dom";
import { Play, Star } from "lucide-react";
import { Bhajan, getDeityById } from "@/data/bhajans";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useLanguage } from "@/hooks/useLanguage";
import { useIsMobile } from "@/hooks/use-mobile";

interface BhajanCardProps {
  bhajan: Bhajan;
  onCardClick?: (bhajan: Bhajan) => void;
}

export default function BhajanCard({ bhajan, onCardClick }: BhajanCardProps) {
  const deity = getDeityById(bhajan.deityId);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isTitleExpanded, setIsTitleExpanded] = useState(false);
  const { t, language } = useLanguage();
  const isMobile = useIsMobile();

  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&\n?#]+)/
    );
    if (!match?.[1]) return null;
    return `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1`;
  };

  const embedUrl = bhajan.youtubeUrl ? getYouTubeEmbedUrl(bhajan.youtubeUrl) : null;
  const canPlayHere = Boolean(embedUrl);

  const handleCardClick = (e: React.MouseEvent) => {
    if (onCardClick) {
      e.preventDefault();
      onCardClick(bhajan);
    }
  };

  const handleTitleToggle = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (!isMobile) return;
    e.preventDefault();
    e.stopPropagation();
    setIsTitleExpanded((prev) => !prev);
  };

  return (
    <Link
      to={`/bhajan/${bhajan.slug}`}
      onClick={handleCardClick}
      className="group block rounded-xl bg-card overflow-hidden shadow-temple hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className={`h-1.5 ${deity?.colorClass ?? 'bg-primary'}`} />
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{deity?.emoji}</span>
          <span className="text-sm font-medium text-muted-foreground">{deity?.name}</span>
        </div>
        <h3
          role={isMobile ? "button" : undefined}
          tabIndex={isMobile ? 0 : -1}
          aria-expanded={isMobile ? isTitleExpanded : undefined}
          onClick={handleTitleToggle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleTitleToggle(e);
            }
          }}
          className={`font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors leading-snug ${
            isTitleExpanded
              ? "line-clamp-none"
              : "line-clamp-2 md:line-clamp-1 md:group-hover:line-clamp-none"
          } ${isMobile ? "cursor-pointer" : ""}`}
          title={bhajan.title}
        >
          {bhajan.title}
        </h3>
        <p className="hindi-text text-base text-muted-foreground mt-1 line-clamp-1" title={bhajan.titleHindi}>{bhajan.titleHindi}</p>
        <p className="text-sm text-muted-foreground mt-2 line-clamp-1" title={bhajan.singerName}>{language === 'hi' ? 'गायक:' : 'by'} {bhajan.singerName}</p>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Play className="w-3.5 h-3.5" />
              {(bhajan.playCount / 1000).toFixed(0)}K
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-secondary text-secondary" />
              {bhajan.rating.toFixed(1)}
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              if (!canPlayHere) return;
              e.preventDefault();
              e.stopPropagation();
              setIsPlayerOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            aria-label={canPlayHere ? `${t('play')} ${bhajan.title}` : `${language === 'hi' ? 'खोलें' : 'Open'} ${bhajan.title}`}
          >
            <Play className="w-4 h-4" /> {t('play')}
          </button>
        </div>
      </div>

      {canPlayHere && (
        <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">{bhajan.title}</DialogTitle>
              <DialogDescription>
                {bhajan.titleHindi} {language === 'hi' ? '• गायक:' : 'by'} {bhajan.singerName}
              </DialogDescription>
            </DialogHeader>
            <div className="aspect-video w-full overflow-hidden rounded-lg border border-border">
              <iframe
                src={embedUrl || undefined}
                title={`YouTube player for ${bhajan.title}`}
                className="h-full w-full"
                sandbox="allow-scripts allow-same-origin allow-presentation"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Link>
  );
}
