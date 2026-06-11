import React, { useState } from 'react';
import { useLiveAarti, getNextAarti } from '../hooks/useLiveAarti';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import TempleCard from '../components/LiveAarti/TempleCard';
import WatchModal from '../components/LiveAarti/WatchModal';
import TodaysTemples from '../components/LiveAarti/TodaysTemples';
import type { Temple } from '../types/liveAarti';

export default function LiveAartiPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const { liveNow, startingSoon, upcoming, todaysTemples, allTemples } = useLiveAarti();
  const [selectedTemple, setSelectedTemple] = useState<Temple | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const text = {
    title: isHi ? 'लाइव आरती दर्शन' : 'Live Aarti Darshan',
    subtitle: isHi ? 'भारत के प्रसिद्ध मंदिरों से सीधे दर्शन' : 'Live streams from major Indian temples',
    back: isHi ? 'पीछे जाएं' : 'Go Back',
    liveNow: isHi ? '🔴 अभी लाइव' : '🔴 Live Now',
    startingSoon: isHi ? '⏳ जल्द ही शुरू' : '⏳ Starting Soon',
    upcoming: isHi ? '📅 आज की अन्य आरतियां' : '📅 Today\'s Scheduled Aartis',
    allTemples: isHi ? '🛕 सभी मंदिर' : '🛕 All Temples',
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

  return (
    <div className="min-h-screen bg-[#0a0705] text-amber-50 p-4 md:p-8 pb-24">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>{text.back}</span>
          </button>
        </div>

        {/* Title Section */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">
            {text.title}
          </h1>
          <p className="text-sm md:text-base text-zinc-400">
            {text.subtitle}
          </p>
        </div>

        {/* SECTION 1: 🔴 Live Now */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-display text-white tracking-wide">
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
            <div className="p-6 md:p-8 rounded-3xl border border-orange-500/10 bg-white/[0.01] text-left max-w-xl mx-auto space-y-5 shadow-2xl relative overflow-hidden">
              {/* Spiritual glow background decoration */}
              <div className="absolute -right-10 -bottom-10 h-36 w-36 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="text-center space-y-1.5 border-b border-white/5 pb-4">
                <h3 className="text-lg font-bold font-display text-amber-200 flex items-center justify-center gap-2">
                  <span>🕉</span>
                  <span>{isHi ? 'कोई लाइव आरती सक्रिय नहीं है' : 'No Aarti Live Right Now'}</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  {isHi ? 'इस समय सभी मंदिर ऑफ़लाइन हैं। नीचे दिए गए आगामी सत्रों की जांच करें।' : 'All temples are currently offline. Check upcoming schedules below.'}
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  {isHi ? 'अगले आगामी सत्र:' : 'Next upcoming sessions:'}
                </p>
                <ul className="space-y-2">
                  {getUpcomingSessions().slice(0, 4).map((session, index) => {
                    const templeName = isHi ? session.temple.nameHindi : session.temple.name;
                    const aartiName = isHi ? session.aarti.nameHindi : session.aarti.name;
                    return (
                      <li 
                        key={`upcoming-session-${session.temple.id}-${index}`} 
                        className="flex items-center justify-between text-xs text-zinc-300 bg-white/[0.01] hover:bg-white/[0.03] p-2.5 rounded-xl border border-white/5 transition-all cursor-pointer group"
                        onClick={() => handleTempleClick(session.temple)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-orange-500 text-sm group-hover:scale-125 transition-transform">•</span>
                          <span className="font-semibold text-white group-hover:text-amber-100 transition-colors">
                            {templeName} — {aartiName}
                          </span>
                        </div>
                        <span className="text-amber-400/90 font-medium">
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
            <h2 className="text-xl font-bold font-display text-white tracking-wide">
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

        {/* SECTION 4: All Temples */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-display text-white tracking-wide">
            {text.allTemples}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allTemples.map((temple) => (
              <TempleCard
                key={`all-${temple.id}`}
                temple={temple}
                onClick={() => handleTempleClick(temple)}
              />
            ))}
          </div>
        </div>

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
