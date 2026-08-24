import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BhajanCard from '@/components/BhajanCard';
import { Loader2 } from 'lucide-react';
import { getRecentApprovedBhajans } from '@/lib/supabaseQueries';
import { mapUserUploadToBhajan } from '@/lib/mapUserUpload';

interface RecentBhajan {
  id: string;
  title: string;
  title_hindi: string;
  slug?: string;
  deity_id: number;
  singer_name: string;
  composer_name?: string;
  lyrics_hindi: string;
  youtube_url?: string;
  play_count?: number;
  average_rating?: number;
  created_at: string;
  search_aliases?: string[] | string;
  content_type?: string;
}

export default function RecentBhajans() {
  const navigate = useNavigate();
  const [items, setItems] = useState<RecentBhajan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const { data } = await getRecentApprovedBhajans(24);
        setItems((data || []) as RecentBhajan[]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <main className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="font-display text-4xl font-bold text-foreground mb-3">Recently Added Bhajans</h1>
          <p className="text-muted-foreground mb-8">Latest approved bhajans published by the community.</p>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 bg-card border rounded-xl">
              <p className="text-muted-foreground">No recently approved bhajans yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {items.map((bhajan) => {
                const mappedBhajan = mapUserUploadToBhajan(bhajan);
                return (
                  <BhajanCard
                    key={bhajan.id}
                    bhajan={mappedBhajan}
                    onCardClick={(b) => navigate(`/bhajan/${b.slug}`)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
