import { Link } from "react-router-dom";
import { Play, Star } from "lucide-react";
import { Bhajan, getDeityById } from "@/data/bhajans";

interface BhajanCardProps {
  bhajan: Bhajan;
}

export default function BhajanCard({ bhajan }: BhajanCardProps) {
  const deity = getDeityById(bhajan.deityId);

  return (
    <Link
      to={`/bhajan/${bhajan.slug}`}
      className="group block rounded-xl bg-card overflow-hidden shadow-temple hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className={`h-1.5 ${deity?.colorClass ?? 'bg-primary'}`} />
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{deity?.emoji}</span>
          <span className="text-sm font-medium text-muted-foreground">{deity?.name}</span>
        </div>
        <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
          {bhajan.title}
        </h3>
        <p className="hindi-text text-base text-muted-foreground mt-1">{bhajan.titleHindi}</p>
        <p className="text-sm text-muted-foreground mt-2">by {bhajan.singerName}</p>
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Play className="w-4 h-4" /> Play
          </span>
        </div>
      </div>
    </Link>
  );
}
