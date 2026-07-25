import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import BhajanCard from '@/components/BhajanCard';
import { queryUserUploads } from '@/lib/supabaseQueries';
import { generateBhajanSlug } from '@/lib/slugUtils';
import { smartSearchBhajans } from '@/lib/searchAlgorithm';
import { useLanguage } from '@/hooks/useLanguage';
import SearchBar from '@/components/SearchBar';

interface UserBhajan {
  id: string;
  title: string;
  title_hindi: string;
  deity_id: number;
  singer_name: string;
  composer_name?: string;
  lyrics_hindi: string;
  language: string;
  occasion: string[];
  mood_tags: string[];
  average_rating: number;
  play_count: number;
  youtube_url?: string;
}

export const AllBhajans = () => {
  const { t } = useLanguage();
  const [bhajans, setBhajans] = useState<UserBhajan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchBhajans();
  }, []);

  const fetchBhajans = async () => {
    try {
      setLoading(true);
      const { data, error } = await queryUserUploads({ orderBy: 'created_at' });

      if (error) throw error;
      // Strictly filter for content_type === 'bhajan' or legacy items
      const bhajanOnly = ((data || []) as any[]).filter(
        (item) => !item.content_type || item.content_type === 'bhajan'
      );
      setBhajans(bhajanOnly as UserBhajan[]);
    } catch (err) {
      console.error('Error fetching bhajans:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply search
  const filteredBhajans = useMemo(() => {
    let results = [...bhajans];

    if (search.trim()) {
      const searchable = results.map((b) => ({
        id: b.id,
        title: b.title,
        titleHindi: b.title_hindi,
        singerName: b.singer_name,
        lyricsHindi: b.lyrics_hindi,
        lyricsTransliteration: '',
        tags: b.mood_tags || [],
      }));
      const matched = smartSearchBhajans(search, searchable);
      const matchedIds = new Set(matched.map((item) => String(item.id)));
      results = results.filter((b) => matchedIds.has(b.id));
    }

    return results;
  }, [bhajans, search]);

  return (
    <div>
      {/* Hero Section */}
      <section className="py-12 px-4 bg-gradient-warm">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
              <span className="text-gradient-saffron">{t('allBhajans')}</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('browseAllBhajansSubtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className=" top-16 z-40 bg-background/95 backdrop-blur border-b border-border py-4 px-4">
        <div className="container mx-auto max-w-6xl space-y-4">
          {/* Search Bar */}
          <SearchBar
            value={search}
            onChange={(val) => setSearch(val)}
            placeholder={t('searchBhajansOrSingers')}
            onClear={() => setSearch("")}
            onVoiceResult={(transcript) => setSearch(transcript)}
          />

          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            {t('showing')} {filteredBhajans.length} {t('of')} {bhajans.length} {t('bhajansCount')}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-saffron-600" />
            </div>
          ) : filteredBhajans.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">{t('noBhajansFound')}</h3>
              <p className="text-muted-foreground">
                {t('searchHint')}
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            >
              {filteredBhajans.map((bhajan) => (
                <div key={bhajan.id} className="min-w-0">
                <BhajanCard
                  bhajan={{
                    id: parseInt(bhajan.id),
                    slug: generateBhajanSlug(bhajan.title),
                    title: bhajan.title,
                    titleHindi: bhajan.title_hindi,
                    deityId: bhajan.deity_id,
                    singerName: bhajan.singer_name,
                    composerName: bhajan.composer_name || '',
                    youtubeUrl: bhajan.youtube_url || '',
                    lyricsHindi: bhajan.lyrics_hindi,
                    lyricsTransliteration: '',
                    playCount: bhajan.play_count || 0,
                    rating: bhajan.average_rating || 0,
                    tags: bhajan.mood_tags || [],
                    featured: false,
                  }}
                />
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

    </div>
  );
};

export default AllBhajans;
