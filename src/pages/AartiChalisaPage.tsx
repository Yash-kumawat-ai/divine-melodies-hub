import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, Sparkles, Music, Loader2, Play, ChevronRight, ChevronLeft, Flame } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { queryUserUploads } from '@/lib/supabaseQueries';
import { bhajans as staticBhajans, deities } from '@/data/bhajans';
import BhajanCard from '@/components/BhajanCard';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';
import { generateBhajanSlug } from '@/lib/slugUtils';
import devotionalBg from '@/pages/images/devotional_background (1).webp';

interface AartiItem {
  id: string | number;
  title: string;
  titleHindi: string;
  contentType: 'aarti' | 'chalisa' | 'path';
  subType?: string;
  deityId?: number;
  deityName?: string;
  singerName: string;
  composerName?: string;
  lyricsHindi: string;
  youtubeUrl?: string;
  imageUrl?: string;
  playCount?: number;
}

export default function AartiChalisaPage() {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [activeTab, setActiveTab] = useState<'all' | 'aarti' | 'chalisa' | 'stotra'>('all');
  const [search, setSearch] = useState('');
  const [userItems, setUserItems] = useState<AartiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    fetchAartisAndChalisas();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeTab]);

  const fetchAartisAndChalisas = async () => {
    try {
      setLoading(true);
      const { data, error } = await queryUserUploads({ orderBy: 'created_at' });
      if (error) throw error;

      const filtered = ((data || []) as any[])
        .filter((item) => item.content_type === 'aarti' || item.content_type === 'chalisa')
        .map((item) => ({
          id: item.id,
          title: item.title,
          titleHindi: item.title_hindi,
          contentType: item.content_type as 'aarti' | 'chalisa',
          subType: item.sub_type,
          deityId: item.deity_id,
          singerName: item.singer_name || (item.content_type === 'aarti' ? 'पारंपरिक आरती' : 'पारंपरिक पाठ'),
          composerName: item.composer_name,
          lyricsHindi: item.lyrics_hindi,
          youtubeUrl: item.youtube_url,
          imageUrl: item.image_url,
          playCount: item.play_count || 0,
        }));

      setUserItems(filtered);
    } catch (err) {
      console.error('Error fetching aartis & chalisas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Combine static Aartis & Chalisas from database + user uploads
  const combinedItems = useMemo(() => {
    const staticMapped: AartiItem[] = staticBhajans
      .filter((b) => {
        const titleLower = (b.title + ' ' + b.titleHindi).toLowerCase();
        return titleLower.includes('chalisa') || titleLower.includes('aarti') || titleLower.includes('चालीसा') || titleLower.includes('आरती') || titleLower.includes('stotra') || titleLower.includes('स्तोत्र');
      })
      .map((b) => {
        const titleLower = (b.title + ' ' + b.titleHindi).toLowerCase();
        const type = titleLower.includes('chalisa') || titleLower.includes('चालीसा') ? 'chalisa' : 'aarti';
        return {
          id: b.id,
          title: b.title,
          titleHindi: b.titleHindi,
          contentType: type,
          deityId: b.deityId,
          singerName: b.singerName || 'पारंपरिक',
          composerName: b.composerName,
          lyricsHindi: b.lyricsHindi,
          youtubeUrl: b.youtubeUrl,
          playCount: b.playCount || 0,
        };
      });

    // Merge static and user items (preventing duplicate IDs)
    const staticIds = new Set(staticMapped.map((x) => String(x.id)));
    const uniqueUserItems = userItems.filter((x) => !staticIds.has(String(x.id)));

    return [...staticMapped, ...uniqueUserItems];
  }, [userItems]);

  // Filter items by tab & search query
  const filteredItems = useMemo(() => {
    return combinedItems.filter((item) => {
      // Tab filter
      if (activeTab === 'aarti' && item.contentType !== 'aarti') return false;
      if (activeTab === 'chalisa' && item.contentType !== 'chalisa') return false;
      if (activeTab === 'stotra' && item.subType !== 'stotra' && item.subType !== 'ashtak' && item.subType !== 'kavach') return false;

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q) || item.titleHindi.toLowerCase().includes(q);
        const matchSinger = item.singerName.toLowerCase().includes(q);
        const matchLyrics = item.lyricsHindi.toLowerCase().includes(q);
        return matchTitle || matchSinger || matchLyrics;
      }
      return true;
    });
  }, [combinedItems, activeTab, search]);

  const totalPages = Math.ceil(filteredItems.length / pageSize);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

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
              <Flame className="w-3.5 h-3.5" />
              <span>{isHi ? "आरती • चालीसा • स्तोत्र ससंग्रह" : "Aarti & Chalisa Collection"}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-[#4A1516] dark:text-[#FFFDF8] tracking-wide mb-2 drop-shadow-sm">
              {isHi ? "पावन आरती एवं चालीसा" : "Divine Aarti & Chalisa"}
            </h1>

            {/* Lotus Flourish Line */}
            <div className="flex items-center justify-center gap-2 my-1 opacity-80">
              <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-[#7A2D28] dark:to-[#E8B15C]" />
              <span className="text-[#7A2D28] dark:text-[#E8B15C] text-xs">🪷</span>
              <div className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-[#7A2D28] dark:to-[#E8B15C]" />
            </div>

            <p className="text-[#5C3026] dark:text-[#D4C5B9] text-xs sm:text-sm font-bold leading-relaxed">
              {isHi
                ? "समस्त देवी-देवताओं की सिद्ध आरतियां, संकटमोचन चालीसा, स्तोत्र एवं पावन पाठ संग्रह"
                : "Explore sacred aartis, chalisa paths, stotras and devotional recitations"}
            </p>
          </div>
        </div>
      </section>

      {/* ── SEARCH BAR & CATEGORY TABS SECTION (Sleek max-w-2xl width) ── */}
      <section className="py-2 px-4 max-w-2xl mx-auto space-y-4">
        {/* Search Bar */}
        <SearchBar
          value={search}
          onChange={(val) => setSearch(val)}
          placeholder={isHi ? "आरती या चालीसा खोजें (उदा: हनुमान चालीसा, जय गणेश देवा)..." : "Search Aarti or Chalisa..."}
          onClear={() => setSearch('')}
          onVoiceResult={(transcript) => setSearch(transcript)}
          onSelectSuggestion={(selected) => setSearch(selected)}
        />

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2.5 px-3">
          {[
            { id: 'all', label: isHi ? 'सभी रचनाएं' : 'All Items', icon: '🪔' },
            { id: 'aarti', label: isHi ? 'आरती (Aarti)' : 'Aartis', icon: '🕯️' },
            { id: 'chalisa', label: isHi ? 'चालीसा (Chalisa)' : 'Chalisas', icon: '📜' },
            { id: 'stotra', label: isHi ? 'स्तोत्र व पाठ' : 'Stotra & Path', icon: '✨' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#7A2D28] to-[#5A1F1A] dark:from-[#D4A44A] dark:to-[#E8B15C] text-white dark:text-zinc-950 border-transparent shadow-md scale-[1.03]'
                  : 'bg-white dark:bg-[#1E1710] border-[#E8D8C4] dark:border-zinc-800 text-[#5A1F1A] dark:text-[#E8B15C] hover:bg-[#FAF2E8]'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── CARD GRID DISPLAY ── */}
      <section className="py-6 px-4">
        <div className="container mx-auto max-w-6xl">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#7A2D28] dark:text-[#E8B15C]" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-[#1E1710] rounded-2xl border-2 border-dashed border-[#E8D8C4] dark:border-zinc-800 p-8 max-w-md mx-auto">
              <BookOpen className="w-12 h-12 text-[#7A2D28] dark:text-[#E8B15C] mx-auto mb-3 opacity-60" />
              <h3 className="text-lg font-bold text-[#32251E] dark:text-[#FFFDF8] mb-1">
                {isHi ? "कोई रचना नहीं मिली" : "No Aarti or Chalisa Found"}
              </h3>
              <p className="text-xs text-[#7A6B60] dark:text-[#D4C5B9]">
                {isHi ? "अलग खोज शब्द प्रयोग करें या फ़िल्टर बदलें" : "Try searching for a different name or clearing filters"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {paginatedItems.map((item) => (
                  <div key={item.id} className="min-w-0">
                    <BhajanCard
                      bhajan={{
                        id: item.id,
                        slug: generateBhajanSlug(item.title),
                        title: item.title,
                        titleHindi: item.titleHindi,
                        deityId: item.deityId || 1,
                        singerName: item.singerName,
                        composerName: item.composerName || 'पारंपरिक',
                        youtubeUrl: item.youtubeUrl || '',
                        lyricsHindi: item.lyricsHindi,
                        lyricsTransliteration: '',
                        playCount: item.playCount || 0,
                        rating: 5,
                        tags: [item.contentType, item.subType || ''].filter(Boolean),
                        featured: false,
                      }}
                    />
                  </div>
                ))}
              </div>

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
}
