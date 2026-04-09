import React from 'react';
import { TrendingUp } from 'lucide-react';
import BhajanCard from '@/components/BhajanCard';

interface BhajanData {
  id: number;
  slug: string;
  title: string;
  titleHindi?: string;
  singerName: string;
  deityId: number;
  play_count?: number;
  average_rating?: number;
}

interface TrendingSectionProps {
  title?: string;
  bhajans: BhajanData[];
  isLoading?: boolean;
  period?: 'hourly' | 'daily' | 'weekly' | 'all-time';
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({
  title = 'Trending Now',
  bhajans,
  isLoading = false,
  period = 'daily',
}) => {
  if (isLoading) {
    return (
      <section className="py-12 px-4 bg-gradient-warm">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp className="w-6 h-6 text-saffron-600" />
            <h2 className="font-display text-3xl font-bold text-foreground">
              {title}
            </h2>
            <span className="text-sm text-muted-foreground capitalize">
              ({period})
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-64 bg-secondary rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (bhajans.length === 0) {
    return (
      <section className="py-12 px-4 bg-gradient-warm">
        <div className="container mx-auto max-w-6xl text-center">
          <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No trending bhajans found</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 bg-gradient-warm">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-saffron-600" />
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground">
                {title}
              </h2>
              <p className="text-sm text-muted-foreground capitalize">
                {period}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bhajans.map((bhajan, index) => (
            <div key={bhajan.id} className="relative">
              {/* Rank Badge */}
              <div className="absolute top-2 left-2 z-10 bg-saffron-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                {index + 1}
              </div>
              <BhajanCard bhajan={bhajan} />
              
              {/* Play Count */}
              {bhajan.play_count !== undefined && (
                <div className="text-xs text-muted-foreground mt-2 text-center">
                  {bhajan.play_count.toLocaleString()} plays
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;
