import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Music, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import BhajanCard from '@/components/BhajanCard';
import { queryUserUploads } from '@/lib/supabaseQueries';
import { generateBhajanSlug } from '@/lib/slugUtils';
import { smartSearchBhajans } from '@/lib/searchAlgorithm';
import { useLanguage } from '@/hooks/useLanguage';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';
import devotionalBg from '@/pages/images/devotional_background (1).webp';

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
  const { t, language } = useLanguage();
  const isHi = language === 'hi';
  const [bhajans, setBhajans] = useState<UserBhajan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    fetchBhajans();
  }, []);

  const fetchBhajans = async () => {
    try {
      setLoading(true);
      const { data, error } = await queryUserUploads({ orderBy: 'created_at' });

      if (error) throw error;
      // Filter for content_type === 'bhajan' or legacy items
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

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

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

  const totalPages = Math.ceil(filteredBhajans.length / pageSize);
  const paginatedBhajans = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBhajans.slice(start, start + pageSize);
  }, [filteredBhajans, currentPage, pageSize]);

  return (
    <div className="min-h-screen bg-[#FFFDF8] dark:bg-background pb-16">
      {/* ── LANDSCAPE HERO BANNER ── */}
      <section className="py-6 px-4 max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border border-[#E8D8C4] dark:border-zinc-800 shadow-md bg-[#FAF2E8] dark:bg-[#1E1710] p-6 sm:p-8 min-h-[160px] sm:min-h-[190px] flex flex-col justify-center text-center">
          <img
            src={devotionalBg}
            alt="Devotional Background"
            className="absolute inset-0 w-full h-full object-cover object-bottom"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-white/15 to-[#FFFDF8]/85 dark:from-black/50 dark:via-black/70 dark:to-black/90" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold mb-2">
              <Music className="w-3.5 h-3.5" />
              <span>{isHi ? "भक्तिमय संगीत • पावन भजन संग्रह" : "Sacred Bhajan Collection"}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-[#4A1516] dark:text-[#FFFDF8] tracking-wide mb-2 drop-shadow-sm">
              {isHi ? "सभी भजन संग्रह" : "All Bhajans Collection"}
            </h1>

            {/* Lotus Flourish Line */}
            <div className="flex items-center justify-center gap-2 my-1 opacity-80">
              <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-[#7A2D28] dark:to-[#E8B15C]" />
              <span className="text-[#7A2D28] dark:text-[#E8B15C] text-xs">🪷</span>
              <div className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-[#7A2D28] dark:to-[#E8B15C]" />
            </div>

            <p className="text-[#5C3026] dark:text-[#D4C5B9] text-xs sm:text-sm font-bold leading-relaxed">
              {isHi
                ? "फ़िल्टर और खोज के साथ हमारा पूरा भक्तिमय संगीत संग्रह खोजें"
                : "Explore our complete sacred collection with smart search and filters"}
            </p>
          </div>
        </div>
      </section>

      {/* ── SEARCH BAR SECTION (Sleek max-w-2xl width) ── */}
      <section className="py-2 px-4 max-w-2xl mx-auto space-y-3">
        <SearchBar
          value={search}
          onChange={(val) => setSearch(val)}
          placeholder={t('searchBhajansOrSingers')}
          onClear={() => setSearch("")}
          onVoiceResult={(transcript) => setSearch(transcript)}
          onSelectSuggestion={(selected) => setSearch(selected)}
        />

        {/* Results Count */}
        <div className="text-xs font-bold text-center text-[#7A6B60] dark:text-[#D4C5B9]">
          {t('showing')} {paginatedBhajans.length} {t('of')} {filteredBhajans.length} {t('bhajansCount')}
        </div>
      </section>

      {/* ── RESULTS GRID ── */}
      <section className="py-6 md:py-8 pb-20 px-3 sm:px-4">
        <div className="container mx-auto max-w-6xl">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#7A2D28] dark:text-[#E8B15C]" />
            </div>
          ) : filteredBhajans.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white dark:bg-[#1E1710] rounded-2xl border-2 border-dashed border-[#E8D8C4] dark:border-zinc-800 p-8 max-w-md mx-auto"
            >
              <Search className="w-12 h-12 text-[#7A2D28] dark:text-[#E8B15C] mx-auto mb-3 opacity-60" />
              <h3 className="text-lg font-bold text-[#32251E] dark:text-[#FFFDF8] mb-1">{t('noBhajansFound')}</h3>
              <p className="text-xs text-[#7A6B60] dark:text-[#D4C5B9]">
                {t('searchHint')}
              </p>
            </motion.div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
              >
                {paginatedBhajans.map((bhajan) => (
                  <div key={bhajan.id} className="min-w-0">
                    <BhajanCard
                      bhajan={{
                        id: bhajan.id,
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

              {/* Google-Style Page Numbers Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default AllBhajans;
