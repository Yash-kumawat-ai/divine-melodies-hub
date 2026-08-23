import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useLiveAarti, getNextAarti } from '@/hooks/useLiveAarti';
import { ArrowLeft, Share2, Clock, Flame, Landmark } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { SEO } from '@/components/SEO';
import { Helmet } from 'react-helmet-async';
import TempleCard from '../components/LiveAarti/TempleCard';
import WatchModal from '../components/LiveAarti/WatchModal';
import TodaysTemples from '../components/LiveAarti/TodaysTemples';
import LiveAartiHero from '../components/LiveAarti/LiveAartiHero';
import type { Temple } from '../types/liveAarti';
import { LIVE_AARTI_CANONICAL, LIVE_AARTI_OG_IMAGE } from '@/lib/liveAartiEmbed';
import { clearRadixBodyLocks } from '@/lib/clearRadixBodyLocks';
import { toast } from 'sonner';

type CategoryFilter = 'all' | 'jyotirlinga' | 'hanuman' | 'krishna' | 'iskcon';

function matchesCategory(temple: Temple, filter: CategoryFilter): boolean {
  if (filter === 'all') return true;
  const cat = temple.category.toLowerCase();
  const id = temple.id.toLowerCase();
  if (filter === 'jyotirlinga') return cat.includes('jyotirlinga') || id.includes('somnath') || id.includes('kashi') || id.includes('mahakal');
  if (filter === 'hanuman') return cat.includes('hanuman') || id.includes('balaji') || id.includes('hanuman') || id.includes('salasar') || id.includes('salangpur');
  if (filter === 'krishna') return cat.includes('krishna') || id.includes('mayapur') || id.includes('radha') || id.includes('shyam');
  if (filter === 'iskcon') return cat.includes('iskcon') || id.includes('mayapur');
  return true;
}

export default function LiveAartiPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const { liveNow, startingSoon, upcoming, todaysTemples, allTemples } = useLiveAarti();
  const [selectedTemple, setSelectedTemple] = useState<Temple | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [livePage, setLivePage] = useState(1);
  const [allTemplesPage, setAllTemplesPage] = useState(1);
  const [heroTempleId, setHeroTempleId] = useState<string | null>(null);
  const [category, setCategory] = useState<CategoryFilter>('all');
  const LIVE_PAGE_SIZE = 6;
  const ALL_TEMPLES_PAGE_SIZE = 9;

  const handleShare = async () => {
    const url = selectedTemple
      ? `${window.location.origin}/live-aarti?temple=${encodeURIComponent(selectedTemple.id)}`
      : window.location.href.split('?')[0];
    const shareText = isHi
      ? `राघवम् पर लाइव आरती एवं मंदिर दर्शन करें: ${url}`
      : `Watch Live Aarti & Temple Darshan on Raghavam: ${url}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: isHi ? 'लाइव आरती दर्शन - राघवम्' : 'Live Aarti Darshan - Raghavam',
          text: shareText,
          url,
        });
        return;
      }
    } catch {
      /* ignore cancel */
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success(isHi ? 'लिंक कॉपी हो गया!' : 'Link copied to clipboard!');
    } catch {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelectedTemple(null);
    clearRadixBodyLocks();
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('temple');
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const handleBack = useCallback(() => {
    clearRadixBodyLocks();
    if (modalOpen) {
      closeModal();
      return;
    }
    navigate('/');
  }, [modalOpen, closeModal, navigate]);

  const text = {
    title: isHi ? 'लाइव आरती दर्शन' : 'Live Aarti Darshan',
    subtitle: isHi ? 'भारत के प्रसिद्ध मंदिरों एवं धामों से सीधे लाइव दर्शन' : 'Live streams from major sacred Indian temples',
    liveNow: isHi ? 'अभी लाइव आरती' : 'Live Now',
    startingSoon: isHi ? 'जल्द ही शुरू होने वाली आरती' : 'Starting Soon',
    allTemples: isHi ? 'सभी पवित्र मंदिर एवं दर्शन' : 'All Sacred Temples & Live Channels',
    noLive: isHi ? 'इस समय कोई लाइव आरती सक्रिय नहीं है।' : 'No aarti is currently live right now.',
  };

  const initialTempleHandled = useRef(false);

  const openTemple = useCallback((temple: Temple) => {
    setSelectedTemple(temple);
    setModalOpen(true);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('temple', temple.id);
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  // Ensure scroll is at the top on mount/refresh and prefetch Home page chunk
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // Prefetch Home chunk during idle time for 0ms instantaneous back navigation
    const prefetchHome = () => {
      import('./Home');
    };
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(prefetchHome);
    } else {
      setTimeout(prefetchHome, 100);
    }
  }, []);

  // Handle browser back gesture / popstate to cleanly release modal & body locks
  useEffect(() => {
    const handlePopState = () => {
      if (modalOpen) {
        setModalOpen(false);
        setSelectedTemple(null);
        clearRadixBodyLocks();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      clearRadixBodyLocks();
    };
  }, [modalOpen]);

  // Handle deep-link / initial URL search param only once on mount
  useEffect(() => {
    if (initialTempleHandled.current || allTemples.length === 0) return;
    const id = searchParams.get('temple');
    if (id) {
      const found = allTemples.find((t) => t.id === id);
      if (found) {
        setSelectedTemple(found);
        setModalOpen(true);
      }
      initialTempleHandled.current = true;
    }
  }, [searchParams, allTemples]);

  const filteredTodays = useMemo(
    () => todaysTemples.filter((t) => matchesCategory(t, category)),
    [todaysTemples, category],
  );

  const filteredAllTemples = useMemo(
    () => allTemples.filter((t) => matchesCategory(t, category)),
    [allTemples, category],
  );

  const liveTemples = useMemo(
    () => allTemples.filter((t) => t.status === 'LIVE' && matchesCategory(t, category)),
    [allTemples, category],
  );

  const heroTemple =
    liveTemples.find((t) => t.id === heroTempleId) ||
    allTemples.find((t) => t.id === 'salasar-balaji' && matchesCategory(t, category)) ||
    liveTemples.find((t) => t.id === 'salasar-balaji') ||
    liveTemples[0] ||
    allTemples.find((t) => t.videoId && matchesCategory(t, category)) ||
    todaysTemples[0] ||
    allTemples.find((t) => t.id === 'salasar-balaji') ||
    allTemples[0] ||
    null;

  const seoTitle = isHi ? 'लाइव आरती दर्शन - सोमनाथ, काशी, उज्जैन, सालासर' : 'Live Aarti Darshan from Major Indian Temples';
  const seoDescription = isHi
    ? 'सोमनाथ, काशी विश्वनाथ, महाकालेश्वर, सालासर बालाजी, मायापुर और अन्य प्रमुख मंदिरों से लाइव आरती और दर्शन देखें।'
    : 'Watch live aarti and temple darshan from Somnath, Kashi Vishwanath, Mahakaleshwar, Salasar Balaji, Mayapur, and other major Indian temples.';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: seoTitle,
    description: seoDescription,
    url: LIVE_AARTI_CANONICAL,
    hasPart: allTemples.slice(0, 10).map((temple) => ({
      '@type': 'BroadcastEvent',
      name: `${temple.name} Live Aarti & Darshan`,
      isLiveBroadcast: temple.status === 'LIVE',
      eventStatus: 'https://schema.org/EventScheduled',
      location: {
        '@type': 'Place',
        name: temple.name,
        address: temple.location,
      },
    })),
  };

  const filters: { id: CategoryFilter; label: string }[] = [
    { id: 'all', label: isHi ? 'सभी' : 'All' },
    { id: 'jyotirlinga', label: isHi ? 'ज्योतिर्लिंग' : 'Jyotirlinga' },
    { id: 'hanuman', label: isHi ? 'हनुमान जी' : 'Hanuman' },
    { id: 'krishna', label: isHi ? 'श्री कृष्ण' : 'Krishna' },
    { id: 'iskcon', label: 'ISKCON' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#3A2418] dark:bg-[#0c0a08] dark:text-amber-50 pb-28 md:pb-16 transition-colors duration-300 [scrollbar-gutter:stable]">
      <Helmet>
        <link rel="preconnect" href="https://i.ytimg.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
        <link rel="preconnect" href="https://www.youtube-nocookie.com" crossOrigin="" />
      </Helmet>
      <SEO
        title={seoTitle}
        description={seoDescription}
        url={LIVE_AARTI_CANONICAL}
        image={LIVE_AARTI_OG_IMAGE}
        lang={isHi ? 'hi' : 'en'}
        jsonLd={jsonLd}
      />

      {/* Sticky Top Header Bar */}
      <header className="sticky top-0 shrink-0 z-40 border-b bg-[#FFFDF8]/95 dark:bg-[#0c0a08]/95 backdrop-blur-md border-[#E8D8C4] dark:border-stone-800 shadow-2xs">
        <div className="mx-auto max-w-6xl px-4 lg:px-6 py-3 sm:py-3.5 min-h-[56px] sm:min-h-[60px] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-full border border-[#E8D8C4] dark:border-stone-700 bg-[#FFFDF8] dark:bg-stone-900 text-[#651317] dark:text-amber-300 active:scale-95 transition-all shrink-0 cursor-pointer shadow-xs"
            aria-label={isHi ? 'पीछे जाएं' : 'Back'}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <h1 className="flex-1 min-w-0 text-center text-base sm:text-lg md:text-xl font-bold font-heading tracking-normal leading-normal text-[#651317] dark:text-amber-100 truncate px-2 py-0.5">
            {text.title}
          </h1>

          <button
            type="button"
            onClick={() => void handleShare()}
            className="h-10 w-10 sm:h-11 sm:w-11 rounded-full border border-[#E8D8C4] dark:border-stone-700 bg-[#FFFDF8] dark:bg-stone-900 flex items-center justify-center text-[#651317] dark:text-amber-300 active:scale-95 transition-all cursor-pointer shadow-xs"
            aria-label={isHi ? 'साझा करें' : 'Share'}
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Page Container */}
      <main className="max-w-6xl mx-auto px-4 lg:px-6 mt-4 md:mt-6 space-y-6 md:space-y-8">
        {/* Intro Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl md:rounded-[24px] border border-[#E8D8C4] dark:border-stone-800 bg-[#FFFDF8] dark:bg-[#140d08] p-5 sm:p-6 md:p-8 text-center shadow-xs">
          <div className="flex flex-col items-center relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#651317]/10 dark:bg-amber-400/15 border border-[#651317]/20 dark:border-amber-400/30 text-[#651317] dark:text-amber-300 text-xs font-bold mb-3 shadow-2xs">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{isHi ? 'पावन आरती दर्शन' : 'Sacred Aarti Broadcast'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-[#3A2418] dark:text-amber-100 tracking-normal leading-normal py-0.5">
              {text.title}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#786252] dark:text-stone-300 font-medium leading-relaxed">
              {text.subtitle}
            </p>
          </div>
        </div>

        {/* Category Filters Bar */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {filters.map((f) => {
            const active = category === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setCategory(f.id);
                  setAllTemplesPage(1);
                }}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95 ${
                  active
                    ? 'border-[#651317] bg-[#651317] text-white dark:border-amber-400 dark:bg-amber-500 dark:text-stone-950 shadow-xs'
                    : 'border-[#E8D8C4] dark:border-stone-700 bg-[#FFFDF8] dark:bg-stone-900 text-[#543D2B] dark:text-stone-300 hover:bg-[#FAF2E8] dark:hover:bg-stone-800'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Featured Live Stream Hero Slot (Stable Geometry) */}
        {heroTemple && (
          <LiveAartiHero
            temple={heroTemple}
            liveTemples={liveTemples.length > 0 ? liveTemples : [heroTemple]}
            onSelectTemple={(t) => setHeroTempleId(t.id)}
            onOpenDetails={openTemple}
            isModalOpen={modalOpen}
          />
        )}

        {/* Section: Today's Auspicious Temples Carousel */}
        {filteredTodays.length > 0 && (
          <TodaysTemples temples={filteredTodays} onTempleClick={openTemple} />
        )}

        {/* Section: All Sacred Temples & Live Darshan Channels (Unified Grid with Pagination) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-[#651317] dark:text-amber-400" />
              <h2 className="text-lg sm:text-xl font-bold font-display text-[#3A2418] dark:text-amber-100 tracking-wide">
                {text.allTemples}
              </h2>
            </div>
            <span className="text-xs font-bold text-[#786252] dark:text-stone-400">
              {filteredAllTemples.length} {isHi ? 'मंदिर' : 'Temples'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {filteredAllTemples.slice(0, allTemplesPage * ALL_TEMPLES_PAGE_SIZE).map((temple, idx) => (
              <TempleCard
                key={`all-temple-${temple.id}-${idx}`}
                temple={temple}
                onClick={() => openTemple(temple)}
                priority={idx < 3}
              />
            ))}
          </div>

          {allTemplesPage * ALL_TEMPLES_PAGE_SIZE < filteredAllTemples.length && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setAllTemplesPage((p) => p + 1)}
                className="btn-royal-secondary h-11 px-6 rounded-full text-sm font-bold shadow-2xs cursor-pointer active:scale-95"
              >
                {isHi ? 'और मंदिर दिखाएँ' : 'Show more temples'}
              </button>
            </div>
          )}
        </section>

        {/* Watch Live / Schedule Modal */}
        <WatchModal temple={selectedTemple} isOpen={modalOpen} onClose={closeModal} />
      </main>
    </div>
  );
}
