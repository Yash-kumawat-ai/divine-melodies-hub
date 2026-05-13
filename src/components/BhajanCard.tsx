import { useState } from "react";
import { Play, Star } from "lucide-react";
import { Bhajan, getDeityById, bhajans as allBhajansData } from "@/data/bhajans";
import BhajanDetailModal from "@/components/BhajanDetailModal";
import { useLanguage } from "@/hooks/useLanguage";

interface BhajanCardProps {
  bhajan: Bhajan;
  onCardClick?: (bhajan: Bhajan) => void;
}

export default function BhajanCard({ bhajan, onCardClick }: BhajanCardProps) {
  const deity = getDeityById(bhajan.deityId);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [modalBhajan, setModalBhajan] = useState<Bhajan>(bhajan);
  const { t, language } = useLanguage();

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

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(e as any); } }}
        className="group block rounded-xl bg-card overflow-hidden shadow-temple hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      >
        <div className={`h-1.5 ${deity?.colorClass ?? 'bg-primary'}`} />
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{deity?.emoji}</span>
            <span className="text-sm font-medium text-muted-foreground">{deity?.name}</span>
          </div>
          <h3
            className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2 md:line-clamp-1 md:group-hover:line-clamp-none"
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
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            >
              <Play className="w-4 h-4" /> {t('play')}
            </span>
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
