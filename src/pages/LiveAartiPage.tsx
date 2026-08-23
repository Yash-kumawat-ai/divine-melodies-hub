import React, { useState, useEffect, useMemo } from 'react';
import { useLiveAarti, getNextAarti } from '@/hooks/useLiveAarti';
import { ArrowLeft, Share2, Clock, Flame, Landmark } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { SEO } from '@/components/SEO';
import TempleCard from '../components/LiveAarti/TempleCard';
import WatchModal from '../components/LiveAarti/WatchModal';
import TodaysTemples from '../components/LiveAarti/TodaysTemples';
import LiveAartiHero from '../components/LiveAarti/LiveAartiHero';
import type { Temple } from '../types/liveAarti';
import { LIVE_AARTI_CANONICAL, LIVE_AARTI_OG_IMAGE } from '@/lib/liveAartiEmbed';
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
  const { liveNow, startingSoon, upcoming, todaysTemples, allTemples, isVerifying } = useLiveAarti();
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

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  const text = {
    title: isHi ? 'लाइव आरती दर्शन' : 'Live Aarti Darshan',
    subtitle: isHi ? 'भारत के प्रसिद्ध मंदिरों एवं धामों से सीधे लाइव दर्शन' : 'Live streams from major sacred Indian temples',
    liveNow: isHi ? 'अभी लाइव आरती' : 'Live Now',
    startingSoon: isHi ? 'जल्द ही शुरू होने वाली आरती' : 'Starting Soon',
    allTemples: isHi ? 'सभी पवित्र मंदिर एवं दर्शन' : 'All Sacred Temples & Live Channels',
    noLive: isHi ? 'इस समय कोई लाइव आरती सक्रिय नहीं है।' : 'No aarti is currently live right now.',
  };

  const openTemple = (temple: Temple) => {
    setSelectedTemple(temple);
    setModalOpen(true);
    const url = new URL(window.location.href);
    url.searchParams.set('temple', temple.id);
    window.history.replaceState(null, '', url.toString());
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTemple(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('temple');
    window.history.replaceState(null, '', url.toString());
  };

  useEffect(() => {
    const id = searchParams.get('temple');
    if (!id || allTemples.length === 0) return;
    const found = allTemples.find((t) => t.id === id);
    if (found && !selectedTemple) {
      setSelectedTemple(found);
      setModalOpen(true);
    }
  }, [searchParams, allTemples, selectedTemple]);

  const getUpcomingSessions = () => {
    const sessions: { temple: Temple; aarti: { name: string; nameHindi: string }; minutesUntilStart: number }[] = [];
    for (const temple of allTemples) {
      const next = getNextAarti(temple);
      if (next) {
        sessions.push({ temple, aarti: next.aarti, minutesUntilStart: next.minutesUntilStart });
      }
    }
    return sessions.sort((a, b) => a.minutesUntilStart - b.minutesUntilStart);
  };

  const formatStartsIn = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    let timeStr = '';
    if (hrs > 0) timeStr += `${hrs}h`;
    if (mins > 0) timeStr += (hrs > 0 ? ' ' : '') + `${mins}m`;
    return isHi ? `शुरू होने में: ${timeStr}` : `Starts in ${timeStr}`;
  };

  const filteredLiveNow = useMemo(
    () => liveNow.filter((item) => matchesCategory(item.temple, category)),
    [liveNow, category],
  );
  const filteredSoon = useMemo(
    () => startingSoon.filter((item) => matchesCategory(item.temple, category)),
    [startingSoon, category],
  );
  const filteredUpcoming = useMemo(
    () => upcoming.filter((item) => matchesCategory(item.temple, category)),
    [upcoming, category],
  );
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
    liveTemples[0] ||
    filteredLiveNow[0]?.temple ||
    null;

  const nextSession = liveNow.length === 0 ? getUpcomingSessions()[0] : null;

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
    <div className="min-h-screen bg-[#FAF6EE] text-[#3A2418] dark:bg-[#0c0a08] dark:text-amber-50 pb-28 md:pb-16 transition-colors duration-300">
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
        <div className="mx-auto max-w-6xl px-4 lg:px-6 py-2.5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-full border border-[#E8D8C4] dark:border-stone-700 bg-[#FFFDF8] dark:bg-stone-900 text-[#651317] dark:text-amber-300 active:scale-95 transition-all shrink-0 cursor-pointer shadow-xs"
            aria-label={isHi ? 'पीछे जाएं' : 'Back'}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <h1 className="flex-1 min-w-0 text-center text-base sm:text-lg font-semibold font-display tracking-tight text-[#651317] dark:text-amber-100 truncate px-2">
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

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-[#3A2418] dark:text-amber-100 tracking-tight leading-tight">
              {text.title}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#786252] dark:text-stone-300 font-medium">
              {text.subtitle}
            </p>

            {isVerifying && (
              <div className="mt-3.5 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[#651317] dark:text-amber-300 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>{isHi ? 'लाइव स्ट्रीम स्थिति जाँची जा रही है…' : 'Verifying live stream feeds…'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Category Filters Bar - scrollbar-hide */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {filters.map((f) => {
            const active = category === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setCategory(f.id);
                  setLivePage(1);
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

        {/* Next upcoming aarti sticky capsule banner if no stream currently live */}
        {nextSession && (
          <div
            onClick={() => openTemple(nextSession.temple)}
            className="w-full rounded-2xl border border-[#E8D8C4] dark:border-stone-800 bg-[#FFFDF8] dark:bg-[#140d08] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:border-[#651317]/40 dark:hover:border-amber-400/40 cursor-pointer transition-all"
          >
            <div className="flex items-start sm:items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-full bg-[#651317]/10 dark:bg-amber-400/15 flex items-center justify-center text-[#651317] dark:text-amber-300 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#651317] dark:text-amber-400">
                  {isHi ? 'अगली आरती' : 'Next Aarti Session'}
                </p>
                <p className="text-sm sm:text-base font-bold text-[#3A2418] dark:text-amber-100 truncate">
                  {isHi ? nextSession.temple.nameHindi : nextSession.temple.name}
                  {' — '}
                  {isHi ? nextSession.aarti.nameHindi : nextSession.aarti.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <span className="text-xs sm:text-sm font-bold text-[#651317] dark:text-amber-300">
                {formatStartsIn(nextSession.minutesUntilStart)}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openTemple(nextSession.temple);
                }}
                className="btn-royal-primary h-9 px-4 rounded-full text-xs font-bold gap-1.5 shadow-xs cursor-pointer active:scale-95"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{isHi ? 'समय देखें' : 'View'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Featured Live Stream Hero (if active) */}
        {heroTemple && heroTemple.status === 'LIVE' && (
          <LiveAartiHero
            temple={heroTemple}
            liveTemples={liveTemples.length > 0 ? liveTemples : [heroTemple]}
            onSelectTemple={(t) => setHeroTempleId(t.id)}
            onOpenDetails={openTemple}
          />
        )}

        {/* Section: Live Now */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]"></span>
              </span>
              <h2 className="text-lg sm:text-xl font-bold font-display text-[#3A2418] dark:text-amber-100 tracking-wide">
                {text.liveNow}
              </h2>
            </div>
            {filteredLiveNow.length > 0 && (
              <span className="text-xs font-bold text-[#651317] dark:text-amber-400 bg-[#FFFDF8] dark:bg-stone-900 border border-[#E8D8C4] dark:border-stone-700 px-2.5 py-0.5 rounded-full">
                {filteredLiveNow.length} {isHi ? 'लाइव' : 'Live'}
              </span>
            )}
          </div>

          {filteredLiveNow.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {filteredLiveNow.slice(0, livePage * LIVE_PAGE_SIZE).map((item, idx) => (
                  <div key={`live-${item.temple.id}-${idx}`} id={`temple-card-${item.temple.id}`}>
                    <TempleCard
                      temple={item.temple}
                      status="live"
                      aartiName={item.aarti.name}
                      aartiNameHindi={item.aarti.nameHindi}
                      minutesUntilEnd={item.minutesUntilEnd}
                      onClick={() => openTemple(item.temple)}
                      priority={idx === 0}
                    />
                  </div>
                ))}
              </div>
              {livePage * LIVE_PAGE_SIZE < filteredLiveNow.length && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setLivePage((p) => p + 1)}
                    className="btn-royal-secondary h-11 px-6 rounded-full text-sm font-bold shadow-2xs"
                  >
                    {isHi ? 'और लाइव आरती दिखाएँ' : 'Show more live aartis'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="p-6 sm:p-8 rounded-2xl md:rounded-3xl border border-[#E8D8C4] dark:border-stone-800 bg-[#FFFDF8] dark:bg-[#140d08] text-center max-w-xl mx-auto space-y-4 shadow-xs">
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold font-display text-[#651317] dark:text-amber-300">
                  {isHi ? 'इस समय कोई लाइव आरती सक्रिय नहीं है' : 'No Aarti Live Right Now'}
                </h3>
                <p className="text-xs text-[#786252] dark:text-stone-400 font-medium">{text.noLive}</p>
              </div>

              <div className="pt-2 border-t border-[#E8D8C4]/60 dark:border-stone-800 space-y-2">
                <p className="text-[11px] uppercase font-bold text-[#786252] dark:text-stone-400 tracking-wider text-left">
                  {isHi ? 'आगामी आरती समय:' : 'Upcoming Aarti Timings:'}
                </p>
                <div className="space-y-2">
                  {getUpcomingSessions()
                    .filter((s) => matchesCategory(s.temple, category))
                    .slice(0, 3)
                    .map((session, index) => {
                      const templeName = isHi ? session.temple.nameHindi : session.temple.name;
                      const aartiName = isHi ? session.aarti.nameHindi : session.aarti.name;
                      return (
                        <button
                          key={`upcoming-session-${session.temple.id}-${index}`}
                          type="button"
                          className="flex w-full items-center justify-between text-xs text-[#3A2418] dark:text-stone-200 bg-[#FAF6EE] dark:bg-stone-900 hover:bg-[#FAF0E4] p-3 rounded-xl border border-[#E8D8C4] dark:border-stone-700 text-left transition-colors cursor-pointer"
                          onClick={() => openTemple(session.temple)}
                        >
                          <span className="font-bold truncate pr-2">
                            {templeName} — {aartiName}
                          </span>
                          <span className="text-[#651317] dark:text-amber-300 font-bold shrink-0">
                            {formatStartsIn(session.minutesUntilStart)}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Section: Starting Soon & Upcoming */}
        {(filteredSoon.length > 0 || filteredUpcoming.length > 0) && (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <h2 className="text-lg sm:text-xl font-bold font-display text-[#3A2418] dark:text-amber-100 tracking-wide">
                  {text.startingSoon}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {filteredSoon.map((item, idx) => (
                <TempleCard
                  key={`soon-${item.temple.id}-${idx}`}
                  temple={item.temple}
                  status="starting-soon"
                  aartiName={item.aarti.name}
                  aartiNameHindi={item.aarti.nameHindi}
                  minutesUntilStart={item.minutesUntilStart}
                  onClick={() => openTemple(item.temple)}
                />
              ))}
              {filteredSoon.length === 0 &&
                filteredUpcoming.map((item, idx) => (
                  <TempleCard
                    key={`up-${item.temple.id}-${idx}`}
                    temple={item.temple}
                    status="upcoming"
                    aartiName={item.aarti.name}
                    aartiNameHindi={item.aarti.nameHindi}
                    minutesUntilStart={item.minutesUntilStart}
                    onClick={() => openTemple(item.temple)}
                  />
                ))}
            </div>
          </section>
        )}

        {/* Section: All Sacred Temples & Live Darshan Channels */}
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
              />
            ))}
          </div>

          {allTemplesPage * ALL_TEMPLES_PAGE_SIZE < filteredAllTemples.length && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setAllTemplesPage((p) => p + 1)}
                className="btn-royal-secondary h-11 px-6 rounded-full text-sm font-bold shadow-2xs"
              >
                {isHi ? 'और मंदिर दिखाएँ' : 'Show more temples'}
              </button>
            </div>
          )}
        </section>

        {/* Section: Today's Auspicious Temples */}
        {filteredTodays.length > 0 && (
          <TodaysTemples temples={filteredTodays} onTempleClick={openTemple} />
        )}

        {/* Watch Live / Schedule Modal */}
        <WatchModal temple={selectedTemple} isOpen={modalOpen} onClose={closeModal} />
      </main>
    </div>
  );
}
