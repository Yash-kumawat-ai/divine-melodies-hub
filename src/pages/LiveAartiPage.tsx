import React, { useState, useEffect } from 'react';
import { useLiveAarti, getNextAarti } from '@/hooks/useLiveAarti';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import TempleCard from '../components/LiveAarti/TempleCard';
import WatchModal, { resolveTempleBanner } from '../components/LiveAarti/WatchModal';
import TodaysTemples from '../components/LiveAarti/TodaysTemples';
import type { Temple } from '../types/liveAarti';
import MandalaFrame from '../components/LiveAarti/MandalaFrame';

// Import assets for loading screen
import mandalaSvg from '@/pages/images/mandala.svg';
import devotionalBackground from '@/pages/images/devotional_background.webp';
import devotionalHeaderBg from '@/pages/images/devotional_background_high_quality(1).webp';
import whatsappIcon from '@/pages/images/whatsapp-svgrepo-com.svg';

function getMandalaCategory(templeId: string): 'jyotirlinga' | 'hanuman' | 'krishna' | 'lotus' {
  const id = templeId.toLowerCase();
  if (id.includes('somnath') || id.includes('kashi') || id.includes('mahakal') || id === 'dd-astro') {
    return 'jyotirlinga';
  }
  if (id.includes('balaji') || id.includes('hanuman') || id.includes('salasar') || id.includes('salangpur')) {
    return 'hanuman';
  }
  if (id.includes('mayapur') || id.includes('krishna') || id.includes('shyam') || id.includes('radha')) {
    return 'krishna';
  }
  return 'lotus';
}

function getLocalizedLocation(location: string, isHi: boolean): string {
  if (!isHi) return location.split(',')[1]?.trim() || location;
  const state = location.split(',')[1]?.trim() || location;
  switch (state.toLowerCase()) {
    case 'gujarat': return 'गुजरात';
    case 'uttar pradesh': return 'उत्तर प्रदेश';
    case 'rajasthan': return 'राजस्थान';
    case 'west bengal': return 'पश्चिम बंगाल';
    case 'national': return 'राष्ट्रीय';
    default: return state;
  }
}

export default function LiveAartiPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const { liveNow, startingSoon, upcoming, todaysTemples, allTemples, isLoading } = useLiveAarti();
  const [selectedTemple, setSelectedTemple] = useState<Temple | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [livePage, setLivePage] = useState(1);
  const LIVE_PAGE_SIZE = 6;

  const handleWhatsAppShare = () => {
    const url = window.location.href;
    const shareText = isHi 
      ? `राघवम पर लाइव आरती दर्शन करें: ${url}` 
      : `Watch Live Aarti Darshan on Raghavam: ${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

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
      <div className="relative min-h-screen bg-[#FDF9F3] text-[#543D2B] dark:bg-[#0a0705] dark:text-amber-50 flex flex-col items-center justify-center p-6 overflow-hidden">
        
        {/* Devotional background watermark (opacity 3% in light, 5% in dark) */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
          <img 
            src={devotionalBackground} 
            alt="" 
            className="w-full h-full object-cover object-center" 
          />
        </div>

        {/* Large rotating mandala watermark in the center background */}
        <img 
          src={mandalaSvg} 
          alt="" 
          className="absolute w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] pointer-events-none select-none z-0 opacity-10 dark:opacity-15 animate-spin" 
          style={{ 
            animationDuration: '50s', 
            filter: 'invert(35%) sepia(25%) saturate(300%) hue-rotate(355%) brightness(90%) contrast(85%)' 
          }}
        />

        {/* Outer radial glow effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.06)_0%,transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.03)_0%,transparent_70%)] pointer-events-none z-0" />

        {/* Main Content Card (Glassmorphic) */}
        <div className="relative z-10 max-w-sm w-full text-center space-y-8 p-8 rounded-[32px] border border-[#EAD7C3]/50 dark:border-white/5 bg-white/40 dark:bg-white/[0.01] backdrop-blur-md shadow-2xl dark:shadow-black/60">
          
          {/* Custom Dual-Ring Spinner */}
          <div className="relative flex items-center justify-center mx-auto h-24 w-24">
            {/* Outer Ring: Rotating Clockwise */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-500/25 border-t-amber-600 dark:border-amber-500/10 dark:border-t-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
            
            {/* Inner Ring: Rotating Counter-Clockwise */}
            <div className="absolute inset-2 rounded-full border border-dashed border-orange-500/35 border-b-orange-600 dark:border-orange-500/10 dark:border-b-amber-500 animate-spin" style={{ animationDuration: '1.8s', animationDirection: 'reverse' }} />
            
            {/* Core Circular Avatar with Om */}
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-amber-100 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/20 border border-amber-300/40 dark:border-amber-500/25 flex items-center justify-center shadow-[inset_0_2px_8px_rgba(251,146,60,0.12)]">
              <span className="text-3xl text-amber-700 dark:text-amber-300 animate-pulse font-serif font-black select-none">
                ॐ
              </span>
            </div>
          </div>

          {/* Loading texts */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black font-display text-[#4A2F20] dark:text-white tracking-wide leading-tight">
                {isHi ? 'लाइव आरती की पुष्टि की जा रही है...' : 'Verifying Live Darshan...'}
              </h2>
              {/* Elegant small separator line */}
              <div className="flex items-center justify-center gap-1.5 py-1">
                <div className="h-[1px] w-6 bg-gradient-to-r from-transparent to-[#B27A1C]/50" />
                <span className="text-[10px] text-[#B27A1C]">✦</span>
                <div className="h-[1px] w-6 bg-gradient-to-l from-transparent to-[#B27A1C]/50" />
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#543D2B]/85 dark:text-zinc-400 font-medium leading-relaxed max-w-xs mx-auto">
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
        

         {/* Centered Devotional Header */}
        <div className="relative overflow-hidden rounded-[24px] border border-[#EAD7C3]/60 dark:border-white/5 bg-white/30 dark:bg-white/[0.01] backdrop-blur-sm p-5 md:p-8 text-center shadow-sm">
          
          {/* High-quality Devotional background image */}
          <img
            src={devotionalHeaderBg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center opacity-75 dark:opacity-50 pointer-events-none select-none z-0"
          />

          {/* Background Mandala watermarks (left and right edges, darkened) */}
          <img 
            src={mandalaSvg} 
            alt="" 
            className="absolute left-0 top-1/2 -translate-y-1/2 w-48 h-48 opacity-[0.09] dark:opacity-[0.16] pointer-events-none select-none -translate-x-12 z-0"
          />
          <img 
            src={mandalaSvg} 
            alt="" 
            className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-48 opacity-[0.09] dark:opacity-[0.16] pointer-events-none select-none translate-x-12 z-0"
          />

          {/* Top Controls Row */}
          <div className="flex items-center justify-between w-full mb-3 relative z-10">
            {/* Left: Circular Back Button */}
            <button
              onClick={() => navigate('/')}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/70 dark:bg-black/30 border border-[#EAD7C3]/80 dark:border-white/10 text-[#543D2B] dark:text-amber-50 shadow-sm hover:bg-white dark:hover:bg-white/10 active:scale-90 transition-all"
              aria-label={isHi ? 'पीछे जाएं' : 'Back'}
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Right: Circular WhatsApp Share Button */}
            <button
              onClick={handleWhatsAppShare}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] shadow-sm active:scale-90 transition-all"
              aria-label={isHi ? 'व्हाट्सएप पर साझा करें' : 'Share on WhatsApp'}
            >
              <img src={whatsappIcon} alt="WhatsApp" className="w-6 h-6 object-contain" />
            </button>
          </div>

          {/* Center Temple Icon & Titles */}
          <div className="flex flex-col items-center relative z-10">
            {/* Shikhara Temple Icon */}
            <svg className="w-12 h-12 text-[#B27A1C] dark:text-amber-400 mb-2 drop-shadow-sm" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M32 4 L28 12 L36 12 Z" fill="currentColor" opacity="0.15" />
              <path d="M28 12 L24 24 L40 24 L36 12 Z" fill="currentColor" opacity="0.2" />
              <path d="M24 24 L18 44 L46 44 L40 24 Z" fill="currentColor" opacity="0.25" />
              <path d="M18 44 L12 56 L52 56 L46 44 Z" fill="currentColor" opacity="0.3" />
              <line x1="32" y1="4" x2="32" y2="56" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="32" cy="3" r="1.5" fill="currentColor" />
              <line x1="28" y1="12" x2="36" y2="12" stroke="currentColor" />
              <line x1="24" y1="24" x2="40" y2="24" stroke="currentColor" />
              <line x1="18" y1="44" x2="46" y2="44" stroke="currentColor" />
              <line x1="12" y1="56" x2="52" y2="56" stroke="currentColor" />
              <path d="M32 3 L37 6 L32 8" fill="currentColor" />
            </svg>

            <h1 className="text-2xl md:text-4xl font-display font-black text-[#4A2F20] dark:text-white tracking-wide">
              {text.title}
            </h1>

            {/* Subtitle with horizontal lines */}
            <div className="flex items-center justify-center gap-3 mt-1.5">
              <div className="h-[1px] w-6 bg-gradient-to-r from-transparent to-[#B27A1C]/50" />
              <p className="text-xs sm:text-sm text-[#543D2B]/75 dark:text-zinc-400 font-medium">
                {text.subtitle}
              </p>
              <div className="h-[1px] w-6 bg-gradient-to-l from-transparent to-[#B27A1C]/50" />
            </div>

            {/* Scroll Divider Ornament */}
            <svg className="w-24 h-4 text-[#B27A1C]/50 dark:text-amber-500/40 mt-2" viewBox="0 0 100 20" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M10 10 C35 10, 40 15, 45 10 C47 9, 48 6, 46 5 C44 4, 40 6, 42 8 C44 10, 48 11, 50 10 C52 11, 56 10, 58 8 C60 6, 56 4, 54 5 C52 6, 53 9, 55 10 C60 15, 65 10, 90 10" strokeLinecap="round" />
              <circle cx="10" cy="10" r="1.2" fill="currentColor" />
              <circle cx="90" cy="10" r="1.2" fill="currentColor" />
              <circle cx="50" cy="10" r="1.8" fill="currentColor" />
            </svg>
          </div>

        </div>

        {/* SECTION 0: 🛕 लाइव मंदिर (Live Temples Strip) */}
        {liveTemplesCount > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold font-display text-[#543D2B] dark:text-white tracking-wide">
              {text.allTemples}
            </h2>

            {/* Mobile: Horizontal scroll circle bubbles */}
            <div 
              className="flex md:hidden gap-5 overflow-x-auto pb-4 pt-2 -mx-4 px-4 scroll-smooth snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {allTemples.filter(t => t.status === 'LIVE').map((temple) => {
                const templeName = isHi ? temple.nameHindi : temple.name;
                const stateText = getLocalizedLocation(temple.location, isHi);
                return (
                  <div
                    key={`mobile-story-${temple.id}`}
                    onClick={() => handleTempleClick(temple)}
                    className="flex flex-col items-center shrink-0 snap-start cursor-pointer group select-none relative pb-2 w-[130px]"
                  >
                    {/* Circle with Mandala Frame */}
                    <div className="relative z-20 -mb-[14px]">
                      <MandalaFrame
                        category={getMandalaCategory(temple.id)}
                        isLive={temple.status === 'LIVE'}
                        isDark={isDark}
                        className="w-[96px] h-[96px] transition-transform duration-300 group-hover:scale-105"
                      >
                        <img 
                          src={resolveTempleBanner(temple.id)} 
                          alt={templeName} 
                          className="h-full w-full object-cover" 
                          loading="lazy" 
                        />
                      </MandalaFrame>
                    </div>

                    {/* Overlapping Info Card */}
                    <div className="relative z-10 w-full pt-7 pb-4 px-3 rounded-[20px] border border-[#EAD7C3]/60 dark:border-white/5 bg-[#FFFDF8]/90 dark:bg-black/35 shadow-sm text-center flex flex-col items-center gap-1 min-h-[96px] justify-between">
                      <div className="flex flex-col items-center w-full">
                        <span className="text-[12px] font-bold text-[#543D2B] dark:text-amber-50 leading-tight truncate w-full px-1">
                          {templeName}
                        </span>
                        <span className="text-[10px] font-medium text-[#8C6D53] dark:text-zinc-400 mt-0.5 truncate w-full px-1">
                          {stateText}
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-1.5 text-[11px] font-black tracking-widest text-[#FF3B30] mt-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF3B30] opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF3B30]" />
                        </span>
                        <span>LIVE</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop: Elegant horizontal card row */}
            <div className="hidden md:flex flex-wrap gap-6 pt-2">
              {allTemples.filter(t => t.status === 'LIVE').map((temple) => {
                const templeName = isHi ? temple.nameHindi : temple.name;
                const stateText = getLocalizedLocation(temple.location, isHi);
                return (
                  <div
                    key={`desktop-card-${temple.id}`}
                    onClick={() => handleTempleClick(temple)}
                    className="flex flex-col items-center shrink-0 cursor-pointer group select-none relative pb-2 w-[140px]"
                  >
                    {/* Circle with Mandala Frame */}
                    <div className="relative z-20 -mb-[14px]">
                      <MandalaFrame
                        category={getMandalaCategory(temple.id)}
                        isLive={temple.status === 'LIVE'}
                        isDark={isDark}
                        className="w-[104px] h-[104px] transition-transform duration-300 group-hover:scale-105"
                      >
                        <img 
                          src={resolveTempleBanner(temple.id)} 
                          alt={templeName} 
                          className="h-full w-full object-cover" 
                          loading="lazy" 
                        />
                      </MandalaFrame>
                    </div>

                    {/* Overlapping Info Card */}
                    <div className="relative z-10 w-full pt-7 pb-4 px-3 rounded-[20px] border border-[#EAD7C3]/60 dark:border-[#d4a853]/15 bg-[#FFFDF8]/90 dark:bg-black/35 shadow-sm hover:shadow-md transition-all duration-300 text-center flex flex-col items-center gap-1 min-h-[100px] justify-between">
                      <div className="flex flex-col items-center w-full">
                        <span className="text-[12.5px] font-bold text-[#543D2B] dark:text-amber-50 leading-tight truncate w-full px-1">
                          {templeName}
                        </span>
                        <span className="text-[10px] font-medium text-[#8C6D53] dark:text-zinc-400 mt-0.5 truncate w-full px-1">
                          {stateText}
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-1.5 text-[11px] font-black tracking-widest text-[#FF3B30] mt-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF3B30] opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF3B30]" />
                        </span>
                        <span>LIVE</span>
                      </div>
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
            <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveNow.slice(0, livePage * LIVE_PAGE_SIZE).map((item, idx) => (
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
              {livePage * LIVE_PAGE_SIZE < liveNow.length && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setLivePage((p) => p + 1)}
                    className="btn-royal-secondary h-11 px-6 rounded-full text-sm font-semibold"
                  >
                    {isHi ? 'और दिखाएँ' : 'Show more'}
                  </button>
                </div>
              )}
            </>
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
