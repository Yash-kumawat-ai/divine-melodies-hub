import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, Sparkles, Video, Play, Loader2, Feather, Scroll, User } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { queryUserUploads } from '@/lib/supabaseQueries';
import SearchBar from '@/components/SearchBar';
import devotionalBg from '@/pages/images/devotional_background (1).webp';
import YouTubePlayerHost from '@/components/YouTubePlayerHost';

interface KathaItem {
  id: string;
  title: string;
  titleHindi: string;
  narratorName: string;
  composerName?: string; // Scripture source
  synopsis: string;
  youtubeUrl?: string;
  deityId?: number;
  imageUrl?: string;
  createdAt?: string;
}

// Curated static kathas to provide a rich experience out of the box
const STATIC_KATHAS: KathaItem[] = [
  {
    id: 'static-katha-1',
    title: 'Shri Ram Janma Katha',
    titleHindi: 'श्री राम जन्म कथा एवं पावन प्रसंग',
    narratorName: 'पारंपरिक कथा परंपरा',
    composerName: 'वाल्मीकि रामायण / रामचरितमानस',
    synopsis: 'भगवान श्री हरि विष्णु के सप्तम अवतार मर्यादा पुरुषोत्तम श्री रामचंद्र जी के अयोध्या धाम में पावन प्राकट्य और राजा दशरथ के गृह में आनन्दोत्सव की अमर कथा।',
    youtubeUrl: 'https://www.youtube.com/watch?v=d_k8F0L_Wd0',
  },
  {
    id: 'static-katha-2',
    title: 'Krishna Bal Leela & Makhan Chori',
    titleHindi: 'श्री कृष्ण बाल लीला एवं माखन चोरी प्रसंग',
    narratorName: 'गोकुल धाम कथा',
    composerName: 'श्रीमद्भागवत महापुराण (दशम स्कंध)',
    synopsis: 'गोकुल में नटखट कान्हा की अलौकिक बाल लीलाएं, मैया यशोदा के संग वात्सल्य प्रसंग और गोपियों के मटकियों से पावन माखन चोरी की मधुर लीला।',
    youtubeUrl: 'https://www.youtube.com/watch?v=kYJ5oJp_f58',
  },
  {
    id: 'static-katha-3',
    title: 'Shiv Parvati Vivah Katha',
    titleHindi: 'शिव-पार्वती पावन विवाह कथा',
    narratorName: 'कैलाश धाम कथावाचक',
    composerName: 'शिवपुराण (रुद्र संहिता)',
    synopsis: 'देवादधिदेव महादेव और माता भगवती पार्वती के अलौकिक विवाह की दिव्य कथा। नंदी, गणों और समस्त ऋषियों की पावन उपस्थिति में सम्पन्न मंगल प्रसंग।',
    youtubeUrl: 'https://www.youtube.com/watch?v=M572T7Pz8cQ',
  },
  {
    id: 'static-katha-4',
    title: 'Hanuman Lanka Dahan & Sundarkand',
    titleHindi: 'सुंदरकांड - हनुमान जी का लंका गमन एवं अशोक वाटिका',
    narratorName: 'रामचरितमानस कथा',
    composerName: 'गोस्वामी तुलसीदास',
    synopsis: 'श्री हनुमान जी महाराज द्वारा अगाध समुद्र लांघकर लंका प्रवेश, माता सीता के दर्शन, रावण संवाद और लंका दहन का पराक्रमी एवं भक्तिमय प्रसंग।',
    youtubeUrl: 'https://www.youtube.com/watch?v=3g5r7Q4tZ0E',
  },
];

export default function KathaPage() {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [kathas, setKathas] = useState<KathaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'ram' | 'krishna' | 'shiv' | 'other'>('all');
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchKathas();
  }, []);

  const fetchKathas = async () => {
    try {
      setLoading(true);
      const { data, error } = await queryUserUploads({ orderBy: 'created_at' });
      if (error) throw error;

      const userUploadedKathas: KathaItem[] = ((data || []) as any[])
        .filter((item) => item.content_type === 'katha')
        .map((item) => ({
          id: item.id,
          title: item.title,
          titleHindi: item.title_hindi,
          narratorName: item.singer_name || 'कथावाचक',
          composerName: item.composer_name || 'शास्त्र/पुराण',
          synopsis: item.lyrics_hindi, // Synopsis stored in lyrics_hindi column
          youtubeUrl: item.youtube_url,
          imageUrl: item.image_url,
          deityId: item.deity_id,
          createdAt: item.created_at,
        }));

      // Combine user uploaded kathas with static catalog
      const merged = [...STATIC_KATHAS, ...userUploadedKathas];
      setKathas(merged);
    } catch (err) {
      console.error('Error fetching kathas:', err);
      setKathas(STATIC_KATHAS);
    } finally {
      setLoading(false);
    }
  };

  // Filter Kathas based on tab selection & search query
  const filteredKathas = useMemo(() => {
    return kathas.filter((item) => {
      const textAll = (item.title + ' ' + item.titleHindi + ' ' + item.synopsis + ' ' + item.narratorName).toLowerCase();
      
      // Category Tab Filter
      if (activeTab === 'ram' && !textAll.includes('राम') && !textAll.includes('ram')) return false;
      if (activeTab === 'krishna' && !textAll.includes('कृष्ण') && !textAll.includes('krishna') && !textAll.includes('बाल')) return false;
      if (activeTab === 'shiv' && !textAll.includes('शिव') && !textAll.includes('shiv') && !textAll.includes('महादेव')) return false;

      // Search Query Filter
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        return textAll.includes(q);
      }
      return true;
    });
  }, [kathas, activeTab, search]);

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
              <Scroll className="w-3.5 h-3.5" />
              <span>{isHi ? "अमृत कथा एवं पावन प्रसंग" : "Sacred Kathas & Discourses"}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-[#4A1516] dark:text-[#FFFDF8] tracking-wide mb-2 drop-shadow-sm">
              {isHi ? "दिव्य कथा एवं प्रसंग" : "Devotional Kathas & Leela"}
            </h1>

            {/* Lotus Flourish Line */}
            <div className="flex items-center justify-center gap-2 my-1 opacity-80">
              <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-[#7A2D28] dark:to-[#E8B15C]" />
              <span className="text-[#7A2D28] dark:text-[#E8B15C] text-xs">🪷</span>
              <div className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-[#7A2D28] dark:to-[#E8B15C]" />
            </div>

            <p className="text-[#5C3026] dark:text-[#D4C5B9] text-xs sm:text-sm font-bold leading-relaxed">
              {isHi
                ? "रामायण, श्रीमद्भागवत पुराण, शिवपुराण एवं पूज्य संतों के पावन मुखारविंद से अमृत कथाएं"
                : "Listen and read inspiring discourses from Ramayana, Bhagavata, and Shiv Purana"}
            </p>
          </div>
        </div>
      </section>

      {/* ── FILTER TABS & SEARCH SECTION ── */}
      <section className="bg-[#FFFDF8] dark:bg-background py-4 px-4 max-w-6xl mx-auto">
        <div className="space-y-3">
          <SearchBar
            value={search}
            onChange={(val) => setSearch(val)}
            placeholder={isHi ? "कथा, वक्ता या ग्रंथ खोजें (उदा: राम जन्म, शिव पार्वती विवाह)..." : "Search Katha, Narrator or Scripture..."}
            onClear={() => setSearch('')}
            onVoiceResult={(transcript) => setSearch(transcript)}
          />

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'all', label: isHi ? 'समस्त कथाएं' : 'All Kathas', icon: '📿' },
              { id: 'ram', label: isHi ? 'राम कथा' : 'Ram Katha', icon: '🏹' },
              { id: 'krishna', label: isHi ? 'कृष्ण लीला' : 'Krishna Leela', icon: '🪈' },
              { id: 'shiv', label: isHi ? 'शिव पुराण' : 'Shiv Purana', icon: '🔱' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#7A2D28] to-[#5A1F1A] dark:from-[#D4A44A] dark:to-[#E8B15C] text-white dark:text-zinc-950 border-transparent shadow-md scale-105'
                    : 'bg-white dark:bg-[#1E1710] border-[#E8D8C4] dark:border-zinc-800 text-[#5A1F1A] dark:text-[#E8B15C] hover:bg-[#FAF2E8]'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── KATHA CARDS DISPLAY GRID ── */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#7A2D28] dark:text-[#E8B15C]" />
            </div>
          ) : filteredKathas.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-[#1E1710] rounded-2xl border-2 border-dashed border-[#E8D8C4] dark:border-zinc-800 p-8 max-w-md mx-auto">
              <Scroll className="w-12 h-12 text-[#7A2D28] dark:text-[#E8B15C] mx-auto mb-3 opacity-60" />
              <h3 className="text-lg font-bold text-[#32251E] dark:text-[#FFFDF8] mb-1">
                {isHi ? "कोई कथा नहीं मिली" : "No Katha Found"}
              </h3>
              <p className="text-xs text-[#7A6B60] dark:text-[#D4C5B9]">
                {isHi ? "अलग खोज शब्द प्रयोग करें या श्रेणी फ़िल्टर बदलें" : "Try a different search term or category filter"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredKathas.map((katha) => (
                <div
                  key={katha.id}
                  className="bg-white dark:bg-[#1E1710] rounded-2xl border-2 border-[#E8D8C4] dark:border-zinc-800 p-5 sm:p-6 shadow-md hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-3 py-1 rounded-full bg-[#FAF2E8] dark:bg-amber-950/40 border border-[#EFE4D7] dark:border-amber-900/40 text-xs font-bold text-[#7A2D28] dark:text-[#E8B15C] flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span>{katha.narratorName}</span>
                      </span>

                      {katha.composerName && (
                        <span className="text-[11px] font-bold text-[#7A6B60] dark:text-[#D4C5B9] bg-stone-100 dark:bg-zinc-800/80 px-2.5 py-1 rounded-lg">
                          📖 {katha.composerName}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-serif text-xl sm:text-2xl font-extrabold text-[#32251E] dark:text-[#FFFDF8] mb-2 leading-snug">
                      {katha.titleHindi || katha.title}
                    </h3>

                    {/* Synopsis Box */}
                    <div className="bg-[#FCF8F2] dark:bg-[#2A1F14] rounded-xl p-3.5 border border-[#E8D8C4] dark:border-zinc-800/80 mb-4">
                      <p className="text-xs sm:text-sm text-[#4A3B32] dark:text-[#D4C5B9] font-medium leading-relaxed italic">
                        "{katha.synopsis}"
                      </p>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#EFE4D7] dark:border-zinc-800">
                    <span className="text-xs font-semibold text-[#7A6B60] dark:text-[#D4C5B9]">
                      ✨ {isHi ? 'अमृत कथा प्रसंग' : 'Devotional Discourse'}
                    </span>

                    {katha.youtubeUrl ? (
                      <button
                        type="button"
                        onClick={() => setActiveVideoUrl(katha.youtubeUrl || null)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7A2D28] to-[#5A1F1A] dark:from-[#D4A44A] dark:to-[#E8B15C] text-white dark:text-zinc-950 text-xs font-bold flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-all"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>{isHi ? "कथा देखें / सुनें" : "Watch / Listen"}</span>
                      </button>
                    ) : (
                      <div className="text-xs font-bold text-amber-700 dark:text-amber-300">
                        {isHi ? 'पाठ रूप में उपलब्ध' : 'Text Available'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Embedded YouTube Modal when Video is selected */}
      {activeVideoUrl && (
        <YouTubePlayerHost
          youtubeUrl={activeVideoUrl}
          title={isHi ? "कथा प्रवचन" : "Katha Video"}
          onClose={() => setActiveVideoUrl(null)}
        />
      )}
    </div>
  );
}
