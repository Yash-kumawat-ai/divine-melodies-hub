import React, { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, Info, AlertTriangle, Clock, Play } from 'lucide-react';
import youtubeSvg from '@/pages/images/youtube-svgrepo-com.svg';
import { motion, AnimatePresence } from 'framer-motion';
import type { Temple } from '../../types/liveAarti';
import { useLanguage } from '@/hooks/useLanguage';
import { getNextAarti } from '@/hooks/useLiveAarti';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { resolveTempleBanner } from './templeBanners';

export { resolveTempleBanner };

interface WatchModalProps {
  temple: Temple | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function WatchModal({ temple, isOpen, onClose }: WatchModalProps) {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const [showInAppPlayer, setShowInAppPlayer] = useState(false);
  const [forceShowPlayer, setForceShowPlayer] = useState(false);
  const [highlightSchedule, setHighlightSchedule] = useState(false);
  const [tick, setTick] = useState(0);
  
  const scheduleRef = useRef<HTMLDivElement>(null);

  // Open directly into the live player for LIVE streams (feels like YouTube).
  useEffect(() => {
    if (isOpen) {
      const isLive = temple?.status === 'LIVE';
      setShowInAppPlayer(Boolean(isLive));
      setForceShowPlayer(false);
      setHighlightSchedule(false);
      const timer = setInterval(() => {
        setTick(t => t + 1);
      }, 60000);
      return () => clearInterval(timer);
    }
  }, [isOpen, temple?.id, temple?.status]);

  if (!temple) return null;

  const title = isHi ? temple.nameHindi : temple.name;
  const deityText = isHi ? temple.deityHindi : temple.deity;
  const resolvedStatus = temple.status || 'OFFLINE';
  const accentColor = temple.accentColor || '#f97316';

  // Layer 1 iframe embed URL
  const embedUrl = temple.videoId
    ? `https://www.youtube-nocookie.com/embed/${temple.videoId}?autoplay=1&rel=0`
    : (temple.youtubeChannelId
        ? `https://www.youtube-nocookie.com/embed/live_stream?channel=${temple.youtubeChannelId}&autoplay=1&rel=0`
        : null);

  const nextAartiData = getNextAarti(temple);
  const displayMinutes = nextAartiData?.minutesUntilStart;

  const formatMinutes = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs}h`;
  };

  const formatVerifiedTime = (lastVerifiedAt?: string) => {
    if (!lastVerifiedAt) return '';
    const now = new Date();
    const verified = new Date(lastVerifiedAt);
    const diffSec = Math.floor((now.getTime() - verified.getTime()) / 1000);

    if (diffSec < 10) {
      return isHi ? 'अभी-अभी जाँचा गया' : 'Checked just now';
    }
    if (diffSec < 60) {
      return isHi ? `${diffSec} सेकंड पहले` : `Checked ${diffSec}s ago`;
    }
    const mins = Math.floor(diffSec / 60);
    if (mins < 60) {
      return isHi ? `${mins} मिनट पहले` : `Checked ${mins}m ago`;
    }
    
    return isHi 
      ? `${verified.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} पर`
      : `at ${verified.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getStatusBanner = (status: string, mins?: number) => {
    const timeStr = mins !== undefined ? formatMinutes(mins) : '';
    switch (status) {
      case 'LIVE':
        return (
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-red-500/5 border border-red-500/15 text-red-700 dark:text-red-200">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]"></span>
              </span>
              <div>
                <p className="font-bold text-xs md:text-sm text-[#543D2B] dark:text-white">{isHi ? '🔴 लाइव दर्शन उपलब्ध' : '🔴 Live Now'}</p>
                <p className="text-[11px] text-[#543D2B]/75 dark:text-zinc-400">
                  {isHi ? 'यूट्यूब पर सत्यापित लाइव प्रसारण' : 'Verified live on YouTube'}
                </p>
              </div>
            </div>

            {/* Small dark maroon YouTube button inside banner */}
            <button
              type="button"
              onClick={() => window.open(temple.fallbackLiveUrl, '_blank', 'noopener,noreferrer')}
              className="flex items-center justify-center h-9 w-11 rounded-xl bg-[#651317] hover:bg-[#7D191E] active:scale-95 text-white shadow-md transition-all shrink-0 border border-[#8B1E24]/50"
              title={isHi ? 'यूट्यूब पर खोलें' : 'Open on YouTube'}
              aria-label={isHi ? 'यूट्यूब पर खोलें' : 'Open on YouTube'}
            >
              <img src={youtubeSvg} alt="YouTube" className="w-5 h-5 object-contain" />
            </button>
          </div>
        );
      case 'UPCOMING':
        return (
          <div 
            className="flex flex-col gap-2 p-4 rounded-2xl border transition-all duration-300 bg-[#FCF6E8]/40 dark:bg-white/[0.01]"
            style={{ 
              backgroundColor: `${accentColor}08`, 
              borderColor: `${accentColor}25` 
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: accentColor }}></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: accentColor }}></span>
                </span>
                <p className="font-bold text-sm text-[#543D2B] dark:text-white">{isHi ? '🟠 जल्द ही शुरू' : '🟠 Starting Soon'}</p>
              </div>
              {nextAartiData && (
                <span 
                  className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                  style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                >
                  {isHi ? nextAartiData.aarti.nameHindi : nextAartiData.aarti.name}
                </span>
              )}
            </div>
            
            <div className="flex justify-between items-baseline mt-1.5 border-t border-[#EAD7C3]/50 dark:border-white/5 pt-2">
              <p className="text-xs text-[#543D2B]/60 dark:text-zinc-400">{isHi ? 'प्रारंभ होने का समय:' : 'Starts In:'}</p>
              <div className="flex items-center gap-1.5 font-display text-lg font-bold text-[#E06D14] dark:text-white tracking-wide">
                <Clock className="w-4.5 h-4.5 animate-pulse" style={{ color: accentColor }} />
                <span>{timeStr}</span>
              </div>
            </div>
          </div>
        );
      case 'STREAM_UNAVAILABLE':
        return (
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-yellow-500/5 border border-yellow-500/15 text-yellow-800 dark:text-yellow-250">
            <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-500 shrink-0" />
            <div>
              <p className="font-bold text-xs md:text-sm text-[#543D2B] dark:text-white">{isHi ? '⚠️ लाइव स्ट्रीम अवरुद्ध' : '⚠️ Live Stream Blocked'}</p>
              <p className="text-[11px] text-[#543D2B]/75 dark:text-zinc-400 leading-normal">
                {isHi
                  ? 'वर्तमान लाइव स्ट्रीम भक्ति से संबंधित नहीं है।'
                  : 'Current stream is not devotional content.'}
              </p>
            </div>
          </div>
        );
      case 'OFFLINE':
      default:
        return (
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-black/5 dark:bg-[#1e1e1e]/10 border border-[#EAD7C3] dark:border-white/5 text-[#543D2B]/85 dark:text-zinc-300">
            <span className="relative flex h-2.5 w-2.5">
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-zinc-450 dark:bg-zinc-500 animate-pulse"></span>
            </span>
            <div>
              <p className="font-bold text-xs md:text-sm text-[#543D2B] dark:text-white">{isHi ? '⚪ अभी ऑफ़लाइन' : '⚪ Currently Offline'}</p>
              <p className="text-[11px] text-[#543D2B]/60 dark:text-zinc-400">
                {isHi ? 'अगली आरती बाद में उपलब्ध होगी' : 'Next Aarti available later today'}
              </p>
            </div>
          </div>
        );
    }
  };

  const handlePrimaryAction = () => {
    if (resolvedStatus === 'LIVE') {
      if (embedUrl) {
        setShowInAppPlayer(true);
      } else {
        window.open(temple.fallbackLiveUrl, '_blank', 'noopener,noreferrer');
      }
    } else if (resolvedStatus === 'OFFLINE') {
      window.open(temple.fallbackChannelUrl, '_blank', 'noopener,noreferrer');
    } else if (resolvedStatus === 'UPCOMING') {
      scheduleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightSchedule(true);
      setTimeout(() => {
        setHighlightSchedule(false);
      }, 2500);
    } else if (resolvedStatus === 'STREAM_UNAVAILABLE') {
      window.open(temple.fallbackChannelUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const getButtonText = () => {
    switch (resolvedStatus) {
      case 'LIVE':
        return isHi ? '🔴 लाइव दर्शन देखें' : '🔴 Live Darshan Watch Now';
      case 'UPCOMING':
        return isHi ? '⏳ अनुसूची देखें' : '⏳ View Schedule';
      case 'OFFLINE':
        return isHi ? '📺 मंदिर का चैनल खोलें' : '📺 Open Temple Channel';
      case 'STREAM_UNAVAILABLE':
        return isHi ? '⚠️ यूट्यूब खोलें' : '⚠️ Open YouTube';
      default:
        return isHi ? '📺 Open Temple Channel' : 'Open Temple Channel';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        showClose={false}
        overlayClassName="z-[300] bg-black/90 backdrop-blur-md"
        className="fixed inset-0 z-[301] w-full h-full max-w-none max-h-none translate-x-0 translate-y-0 left-0 top-0 p-0 overflow-hidden border-0 rounded-none sm:inset-auto sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:max-w-lg sm:w-[92vw] sm:max-h-[88vh] sm:rounded-3xl sm:border sm:border-[#EAD7C3] dark:sm:border-white/10 bg-[#FCF6E8] dark:bg-[#0c0705] text-[#543D2B] dark:text-amber-50 shadow-2xl flex flex-col transition-colors duration-300"
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{deityText} • {temple.location}</DialogDescription>

        {/* Accent colored top bar */}
        <div
          className="h-1.5 w-full shrink-0"
          style={{ backgroundColor: accentColor }}
        />

        {/* Modal Header (Sticky) */}
        <div className="flex items-start justify-between p-4 border-b border-[#EAD7C3]/50 dark:border-white/5 bg-[#FCF6E8]/95 dark:bg-[#0e0a08]/95 backdrop-blur-md shrink-0 sticky top-0 z-20 text-[#543D2B] dark:text-amber-50">
          <div>
            <span className="text-[9px] uppercase font-bold tracking-wider text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full mb-1.5 inline-block">
              {temple.category}
            </span>
            <h2 className="text-lg md:text-xl font-bold font-display text-[#543D2B] dark:text-white leading-tight">
              {title}
            </h2>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[11px] text-[#543D2B]/75 dark:text-zinc-400">
              <p>{deityText} • {temple.location}</p>
              {temple.lastVerifiedAt && (
                <>
                  <span className="text-[#EAD7C3] dark:text-zinc-700 hidden sm:inline">•</span>
                  <span className="text-[10px] text-[#543D2B]/60 dark:text-zinc-500 font-semibold bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                    <span className={`w-1 h-1 rounded-full ${resolvedStatus === 'LIVE' ? 'bg-red-500 animate-pulse' : resolvedStatus === 'UPCOMING' ? 'bg-amber-400' : 'bg-zinc-500'}`} />
                    <span>
                      {resolvedStatus === 'LIVE' 
                        ? (isHi ? 'सत्यापित लाइव' : 'Verified Live') 
                        : (isHi ? 'सत्यापित ऑफ़लाइन' : 'Verified Offline')}
                      {` — ${formatVerifiedTime(temple.lastVerifiedAt)}`}
                    </span>
                  </span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[#543D2B]/60 dark:text-zinc-400 hover:text-[#543D2B] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-95 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content (Scrollable) */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          
          {/* Compact Mixed Content Channel Warning */}
          {temple.requiresTitleFilter && (
            <div className="flex items-center gap-2.5 p-2 px-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-amber-300 text-[10px] leading-tight">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <p>
                <span className="font-bold">{isHi ? 'मिश्रित चैनल:' : 'Mixed Channel:'} </span>
                {isHi ? 'केवल भक्ति संबंधी लाइव स्ट्रीम दिखाए जाते हैं।' : 'Only devotional livestreams are shown.'}
              </p>
            </div>
          )}

          {/* Conditionally Render Video Player (when status = LIVE or forced) */}
          {(resolvedStatus === 'LIVE' || forceShowPlayer) ? (
            <div className="space-y-4">
              {/* Main Player Container */}
              <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/5 flex flex-col items-center justify-center text-center relative shadow-lg">
                {(showInAppPlayer || forceShowPlayer) && embedUrl ? (
                  <iframe
                    src={embedUrl}
                    title={`${temple.name} Live Stream`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full border-0"
                  />
                ) : (
                  // Player Thumbnail/Hero Preview
                  <div 
                    className="absolute inset-0 w-full h-full cursor-pointer group/player" 
                    onClick={() => setShowInAppPlayer(true)}
                  >
                    <img
                      src={resolveTempleBanner(temple.id)}
                      alt={title}
                      className="w-full h-full object-cover opacity-60 group-hover/player:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1], 
                          boxShadow: ["0 0 0px rgba(249,115,22,0.4)", "0 0 20px rgba(249,115,22,0.8)", "0 0 0px rgba(249,115,22,0.4)"] 
                        }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white flex shadow-lg transition-all"
                      >
                        <Play className="w-5 h-5 fill-white stroke-none ml-0.5" />
                      </motion.div>
                      <div>
                        <h4 className="font-bold text-sm text-white">
                          {isHi ? 'लाइव दर्शन शुरू करें' : 'Start Live Darshan'}
                        </h4>
                        <p className="text-[10px] text-zinc-300">
                          {isHi ? 'प्लेयर लोड करने के लिए क्लिक करें' : 'Click to load the live player'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Prominent Live status banner with integrated maroon YouTube icon button */}
              {getStatusBanner(resolvedStatus)}
            </div>
          ) : (
            // Hide player container and show a premium temple banner card instead
            <div className="space-y-4">
              {/* Temple Banner Image as hero section */}
              <div className="relative h-40 w-full rounded-2xl overflow-hidden bg-zinc-900 shadow-inner">
                <img
                  src={resolveTempleBanner(temple.id)}
                  alt={title}
                  className="w-full h-full object-cover opacity-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#FCF6E8] dark:from-[#0c0705] via-[#FCF6E8]/20 dark:via-[#0c0705]/20 to-transparent" />
              </div>

              {/* Prominent Status Banner */}
              {getStatusBanner(resolvedStatus, displayMinutes)}
            </div>
          )}

          {/* Aarti Schedule Details */}
          {temple.aartiSchedule.length > 0 && (
            <div 
              ref={scheduleRef} 
              className="bg-white/40 dark:bg-white/[0.01] border border-[#EAD7C3] dark:border-white/5 rounded-2xl p-4 scroll-mt-6"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#543D2B]/60 dark:text-zinc-400 mb-3.5 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500/75" />
                <span>{isHi ? 'दैनिक आरती समय सारिणी (IST)' : 'Daily Aarti Schedule (IST)'}</span>
              </h4>
              <div className="divide-y divide-[#EAD7C3]/50 dark:divide-white/5">
                {temple.aartiSchedule.map((item, idx) => {
                  const isNext = nextAartiData && nextAartiData.aarti.time === item.time;
                  return (
                    <div 
                      key={idx} 
                      className={`flex flex-col gap-1 py-2.5 transition-all duration-500 rounded-lg px-2 first:pt-0 last:pb-0 ${
                        isNext 
                          ? highlightSchedule
                            ? 'bg-orange-500/20 ring-1 scale-[1.01]'
                            : 'bg-black/5 dark:bg-white/[0.02]'
                          : ''
                      }`}
                      style={isNext && highlightSchedule ? { ringColor: accentColor } : {}}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${isNext ? 'text-[#543D2B] dark:text-white font-bold' : 'text-[#543D2B]/85 dark:text-zinc-300'}`}>
                            {isHi ? item.nameHindi : item.name}
                          </span>
                          {isNext && (
                            <span 
                              className="text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wider uppercase"
                              style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                            >
                              {isHi ? 'अगला' : 'NEXT'}
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-semibold text-[#B27A1C] dark:text-amber-250">
                          {item.time} <span className="text-[10px] font-medium text-[#543D2B]/50 dark:text-zinc-500">({item.durationMinutes}m)</span>
                        </div>
                      </div>
                      {isNext && displayMinutes !== undefined && resolvedStatus !== 'LIVE' && (
                        <p className="text-[11px] font-bold mt-0.5 flex items-center gap-1" style={{ color: accentColor }}>
                           <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: accentColor }} />
                          <span>{isHi ? `शुरू होने में: ${formatMinutes(displayMinutes)}` : `Starts in: ${formatMinutes(displayMinutes)}`}</span>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer (Sticky) */}
        {!(resolvedStatus === 'LIVE' || forceShowPlayer) && (
          <div className="p-4 border-t border-[#EAD7C3] dark:border-white/5 bg-[#FCF6E8]/95 dark:bg-[#0e0a08]/95 backdrop-blur-sm shrink-0 sticky bottom-0 z-20 flex flex-col gap-2">
            {/* Primary action button */}
            <button
              onClick={handlePrimaryAction}
              className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 active:scale-95 text-white font-bold py-3.5 px-6 rounded-2xl shadow-[0_10px_25px_-10px_rgba(249,115,22,0.4)] transition-all duration-300 text-sm"
            >
              {resolvedStatus === 'UPCOMING' && <Clock className="w-4 h-4" />}
              {resolvedStatus === 'OFFLINE' && <img src={youtubeSvg} alt="YouTube" className="w-5 h-5 object-contain" />}
              {resolvedStatus === 'STREAM_UNAVAILABLE' && <img src={youtubeSvg} alt="YouTube" className="w-5 h-5 object-contain animate-pulse" />}
              <span>{getButtonText()}</span>
            </button>

            {/* In-App Live Stream Player Trigger */}
            {embedUrl && (
              <button
                type="button"
                onClick={() => setForceShowPlayer(true)}
                className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold transition-all duration-300 text-sm shadow-md"
              >
                <Play className="w-4 h-4 fill-white stroke-none" />
                <span>{isHi ? '📺 वेबसाइट पर लाइव चलाएं' : '📺 Play Live Stream in Website'}</span>
              </button>
            )}

            {/* Direct Live stream option on YouTube if shown offline/upcoming */}
            <button
              type="button"
              onClick={() => window.open(temple.fallbackLiveUrl, '_blank', 'noopener,noreferrer')}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-600 dark:text-red-400 font-bold transition-all duration-300 text-sm"
            >
              <img src={youtubeSvg} alt="YouTube" className="w-5 h-5 object-contain shrink-0" />
              <span>{isHi ? '🔴 यूट्यूब पर सीधा लाइव चेक करें' : '🔴 Check Direct Live on YouTube'}</span>
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
