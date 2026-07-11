import React, { useState } from 'react';
import { useLiveAarti, getNextAarti } from '@/hooks/useLiveAarti';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import TempleCard from '../components/LiveAarti/TempleCard';
import WatchModal, { resolveTempleBanner } from '../components/LiveAarti/WatchModal';
import TodaysTemples from '../components/LiveAarti/TodaysTemples';
import type { Temple } from '../types/liveAarti';

export default function LiveAartiPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const { liveNow, startingSoon, upcoming, todaysTemples, allTemples, isLoading } = useLiveAarti();
  const [selectedTemple, setSelectedTemple] = useState<Temple | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const text = {
    title: isHi ? 'लाइव आरती दर्शन' : 'Live Aarti Darshan',
    subtitle: isHi ? 'भारत के प्रसिद्ध मंदिरों से सीधे दर्शन' : 'Live streams from major Indian temples',
    back: isHi ? 'पीछे जाएं' : 'Go Back',
    liveNow: isHi ? '🔴 अभी लाइव' : '🔴 Live Now',
    startingSoon: isHi ? '⏳ जल्द ही शुरू' : '⏳ Starting Soon',
    upcoming: isHi ? '📅 आज की अन्य आरतियां' : '📅 Today\'s Scheduled Aartis',
    allTemples: isHi ? '🛕 लाइव मंदिर' : '🛕 Live Temples',
    noLive: isHi ? 'इस समय कोई लाइव आरती नहीं है।' : 'No aarti is live right now.',
    nextLive: isHi ? 'अगली आरती जल्द ही शुरू होगी।' : 'Check starting soon and scheduled aartis below.'
  };

  const handleTempleClick = (temple: Temple) => {
    setSelectedTemple(temple);
    setModalOpen(true);
  };

  const getUpcomingSessions = () => {
    const sessions: { temple: Temple; aarti: any; minutesUntilStart: number }[] = [];
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
    if (hrs > 0) {
      timeStr += `${hrs}h`;
    }
    if (mins > 0) {
      timeStr += (hrs > 0 ? ' ' : '') + `${mins}m`;
    }
    
    return isHi ? `शुरू होने में: ${timeStr}` : `Starts in ${timeStr}`;
  };

  const liveTemplesCount = allTemples.filter(t => t.status === 'LIVE').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FCF6E8] text-[#543D2B] dark:bg-[#0a0705] dark:text-amber-50 flex flex-col items-center justify-center p-4">
        <div className="space-y-6 text-center animate-pulse">
          <div className="relative flex items-center justify-center mx-auto h-20 w-20">
            <div className="absolute inset-0 rounded-full border-4 border-orange-500/10 border-t-[#E06D14] dark:border-white/5 dark:border-t-amber-400 animate-spin" />
            <span className="text-3xl animate-bounce">🕉</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold font-display text-[#543D2B] dark:text-white">
              {isHi ? 'लाइव आरती की पुष्टि की जा रही है...' : 'Verifying Live Darshan...'}
            </h2>
            <p className="text-xs text-[#543D2B]/60 dark:text-zinc-500 max-w-xs mx-auto">
              {isHi ? 'भारत के प्रमुख मंदिरों से सीधे प्रसारण की नवीनतम स्थिति जांची जा रही है।' : 'Checking active stream statuses from major temples.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCF6E8] text-[#543D2B] dark:bg-[#0a0705] dark:text-amber-50 p-4 md:p-8 pb-24 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/50 dark:bg-white/5 border border-[#EAD7C3] dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 text-[#543D2B] dark:text-amber-50 shadow-sm transition-all active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>{text.back}</span>
          </button>
        </div>

        {/* Title Section */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-display font-bold text-[#543D2B] dark:text-white tracking-tight">
            {text.title}
          </h1>
          <p className="text-sm md:text-base text-[#543D2B]/70 dark:text-zinc-400">
            {text.subtitle}
          </p>
        </div>

        {/* SECTION 0: 🛕 लाइव मंदिर (Live Temples Strip) */}
        {liveTemplesCount > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold font-display text-[#543D2B] dark:text-white tracking-wide">
              {text.allTemples}
            </h2>

            {/* Mobile: Horizontal scroll circle bubbles */}
            <div 
              className="flex md:hidden gap-8 overflow-x-auto pb-4 pt-1 px-1 -mx-4 px-4 scroll-smooth snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {allTemples.filter(t => t.status === 'LIVE').map((temple) => {
                const templeName = isHi ? temple.nameHindi : temple.name;
                const shortName = isHi 
                  ? (temple.nameHindi.length > 8 ? temple.nameHindi.slice(0, 7) + '...' : temple.nameHindi)
                  : (temple.name.length > 12 ? temple.name.slice(0, 10) + '...' : temple.name);
                return (
                  <div
                    key={`mobile-story-${temple.id}`}
                    onClick={() => handleTempleClick(temple)}
                    className="flex flex-col items-center gap-1.5 shrink-0 snap-start cursor-pointer group select-none"
                  >
                    <div className="relative">
                      <span className="absolute -inset-1 rounded-full bg-gradient-to-tr from-red-600 via-orange-500 to-amber-500 animate-pulse opacity-80 blur-[1px]" />
                      <div className="h-16 w-16 rounded-full p-[2.5px] bg-[#FCF6E8] dark:bg-[#0a0705] border-2 border-red-500 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md flex items-center justify-center">
                        <div className="h-full w-full rounded-full overflow-hidden">
                          <img src={resolveTempleBanner(temple.id)} alt={templeName} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" />
                        </div>
                      </div>
                      <span className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 border-2 border-[#FCF6E8] dark:border-[#0a0705]">
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-center text-[#543D2B]/80 dark:text-zinc-300 group-hover:text-[#E06D14] dark:group-hover:text-amber-100 transition-colors max-w-[70px] truncate">
                      {shortName}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Desktop: Elegant horizontal card row */}
            <div className="hidden md:flex flex-wrap gap-5">
              {allTemples.filter(t => t.status === 'LIVE').map((temple) => {
                const templeName = isHi ? temple.nameHindi : temple.name;
                const deityText = isHi ? temple.deityHindi : temple.deity;
                return (
                  <div
                    key={`desktop-card-${temple.id}`}
                    onClick={() => handleTempleClick(temple)}
                    className="relative flex items-center gap-4 cursor-pointer group rounded-2xl border border-[#EAD7C3] dark:border-white/10 bg-white/70 dark:bg-white/[0.03] hover:bg-white dark:hover:bg-white/[0.06] shadow-sm hover:shadow-md transition-all duration-300 px-4 py-3 min-w-[220px] max-w-[280px] overflow-hidden"
                  >
                    {/* Accent top bar */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 via-orange-500 to-amber-400 opacity-80" />

                    {/* Temple image circle */}
                    <div className="relative shrink-0">
                      <span className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-red-500 to-amber-400 animate-pulse opacity-70 blur-[2px]" />
                      <div className="relative h-14 w-14 rounded-full border-2 border-red-500 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                        <img
                          src={resolveTempleBanner(temple.id)}
                          alt={templeName}
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                      {/* Live dot */}
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 border-2 border-white dark:border-[#0a0705]">
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                      </span>
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-widest text-red-500 dark:text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-full">
                          <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                          LIVE
                        </span>
                      </div>
                      <p className="text-sm font-bold text-[#543D2B] dark:text-white group-hover:text-[#E06D14] dark:group-hover:text-amber-100 transition-colors truncate leading-tight">
                        {templeName}
                      </p>
                      <p className="text-[11px] text-[#543D2B]/55 dark:text-zinc-500 truncate">{deityText}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 1: 🔴 Live Now */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-display text-[#543D2B] dark:text-white tracking-wide">
            {text.liveNow}
          </h2>
          
          {liveNow.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveNow.map((item, idx) => (
                <TempleCard
                  key={`live-${item.temple.id}-${idx}`}
                  temple={item.temple}
                  status="live"
                  aartiName={item.aarti.name}
                  aartiNameHindi={item.aarti.nameHindi}
                  minutesUntilEnd={item.minutesUntilEnd}
                  onClick={() => handleTempleClick(item.temple)}
                />
              ))}
            </div>
          ) : (
            <div className="p-6 md:p-8 rounded-3xl border border-orange-500/10 bg-white/60 dark:bg-white/[0.01] text-left max-w-xl mx-auto space-y-5 shadow-xl dark:shadow-2xl relative overflow-hidden">
              {/* Spiritual glow background decoration */}
              <div className="absolute -right-10 -bottom-10 h-36 w-36 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="text-center space-y-1.5 border-b border-[#EAD7C3]/50 dark:border-white/5 pb-4">
                <h3 className="text-lg font-bold font-display text-[#E06D14] dark:text-amber-200 flex items-center justify-center gap-2">
                  <span>🕉</span>
                  <span>{isHi ? 'कोई लाइव आरती सक्रिय नहीं है' : 'No Aarti Live Right Now'}</span>
                </h3>
                <p className="text-xs text-[#543D2B]/75 dark:text-zinc-400">
                  {isHi ? 'इस समय सभी मंदिर ऑफ़लाइन हैं। नीचे दिए गए आगामी सत्रों की जांच करें।' : 'All temples are currently offline. Check upcoming schedules below.'}
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-[#543D2B]/60 dark:text-zinc-500">
                  {isHi ? 'अगले आगामी सत्र:' : 'Next upcoming sessions:'}
                </p>
                <ul className="space-y-2">
                  {getUpcomingSessions().slice(0, 4).map((session, index) => {
                    const templeName = isHi ? session.temple.nameHindi : session.temple.name;
                    const aartiName = isHi ? session.aarti.nameHindi : session.aarti.name;
                    return (
                      <li 
                        key={`upcoming-session-${session.temple.id}-${index}`} 
                        className="flex items-center justify-between text-xs text-[#543D2B]/90 dark:text-zinc-300 bg-white/40 dark:bg-white/[0.01] hover:bg-white/80 dark:hover:bg-white/[0.03] p-2.5 rounded-xl border border-[#EAD7C3]/50 dark:border-white/5 transition-all cursor-pointer group"
                        onClick={() => handleTempleClick(session.temple)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-orange-500 text-sm group-hover:scale-125 transition-transform">•</span>
                          <span className="font-semibold text-[#543D2B] dark:text-white group-hover:text-[#E06D14] dark:group-hover:text-amber-100 transition-colors">
                            {templeName} — {aartiName}
                          </span>
                        </div>
                        <span className="text-[#B27A1C] dark:text-amber-400/90 font-medium">
                          {formatStartsIn(session.minutesUntilStart)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: ⏳ Starting Soon / Coming Up */}
        {(startingSoon.length > 0 || upcoming.length > 0) && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold font-display text-[#543D2B] dark:text-white tracking-wide">
              {text.startingSoon}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {startingSoon.map((item, idx) => (
                <TempleCard
                  key={`soon-${item.temple.id}-${idx}`}
                  temple={item.temple}
                  status="starting-soon"
                  aartiName={item.aarti.name}
                  aartiNameHindi={item.aarti.nameHindi}
                  minutesUntilStart={item.minutesUntilStart}
                  onClick={() => handleTempleClick(item.temple)}
                />
              ))}
              {startingSoon.length === 0 && upcoming.map((item, idx) => (
                <TempleCard
                  key={`up-${item.temple.id}-${idx}`}
                  temple={item.temple}
                  status="upcoming"
                  aartiName={item.aarti.name}
                  aartiNameHindi={item.aarti.nameHindi}
                  minutesUntilStart={item.minutesUntilStart}
                  onClick={() => handleTempleClick(item.temple)}
                />
              ))}
            </div>
          </div>
        )}

        {/* SECTION 3: Today's Auspicious Temples (horizontal scroll strip) */}
        {todaysTemples.length > 0 && (
          <TodaysTemples
            temples={todaysTemples}
            onTempleClick={handleTempleClick}
          />
        )}

        {/* Watch Player Modal */}
        <WatchModal
          temple={selectedTemple}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedTemple(null);
          }}
        />

      </div>
    </div>
  );
}
