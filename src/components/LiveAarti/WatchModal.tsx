import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, AlertTriangle, Clock, Play } from 'lucide-react';
import youtubeSvg from '@/pages/images/youtube-svgrepo-com.svg';
import type { Temple } from '../../types/liveAarti';
import { useLanguage } from '@/hooks/useLanguage';
import { getNextAarti } from '@/hooks/useLiveAarti';
import { getTempleEmbedUrl } from '@/lib/liveAartiEmbed';
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
  const scheduleRef = useRef<HTMLDivElement>(null);

  // Reset player when modal closes or temple changes to avoid hanging iframe threads
  useEffect(() => {
    if (!isOpen) {
      setShowInAppPlayer(false);
      setForceShowPlayer(false);
      setHighlightSchedule(false);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setShowInAppPlayer(false);
    setForceShowPlayer(false);
    onClose();
  }, [onClose]);

  if (!temple) return null;

  const title = isHi ? temple.nameHindi : temple.name;
  const deityText = isHi ? temple.deityHindi : temple.deity;
  const resolvedStatus = temple.status || 'OFFLINE';
  const accentColor = temple.accentColor || '#651317';
  const embedUrl = getTempleEmbedUrl(temple);
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

    if (diffSec < 10) return isHi ? 'अभी-अभी जाँचा गया' : 'Checked just now';
    if (diffSec < 60) return isHi ? `${diffSec} सेकंड पहले` : `Checked ${diffSec}s ago`;
    const mins = Math.floor(diffSec / 60);
    if (mins < 60) return isHi ? `${mins} मिनट पहले` : `Checked ${mins}m ago`;
    
    return isHi 
      ? `${verified.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} पर`
      : `at ${verified.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getStatusBanner = (status: string, mins?: number) => {
    const timeStr = mins !== undefined ? formatMinutes(mins) : '';
    switch (status) {
      case 'LIVE':
        return (
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]"></span>
              </span>
              <div>
                <p className="font-bold text-xs sm:text-sm text-[#3A2418] dark:text-amber-100">{isHi ? '🔴 लाइव दर्शन उपलब्ध' : '🔴 Live Darshan Available'}</p>
                <p className="text-[11px] text-[#786252] dark:text-stone-400 font-medium">
                  {isHi ? 'यूट्यूब पर सक्रिय लाइव प्रसारण' : 'Active live broadcast on YouTube'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.open(temple.fallbackLiveUrl, '_blank', 'noopener,noreferrer')}
              className="flex items-center justify-center h-8.5 w-11 rounded-xl bg-[#651317] hover:bg-[#80181D] active:scale-95 text-white shadow-xs transition-all shrink-0 border border-amber-400/30 cursor-pointer"
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
            className="flex flex-col gap-2 p-3.5 rounded-2xl border transition-all duration-300 bg-[#FFFDF8] dark:bg-stone-900/60 shadow-2xs"
            style={{ 
              borderColor: `${accentColor}30` 
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: accentColor }}></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: accentColor }}></span>
                </span>
                <p className="font-bold text-xs sm:text-sm text-[#3A2418] dark:text-amber-100">{isHi ? '🟠 जल्द ही शुरू' : '🟠 Starting Soon'}</p>
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
            
            <div className="flex justify-between items-baseline mt-1 border-t border-[#E8D8C4]/60 dark:border-stone-800 pt-2">
              <p className="text-xs text-[#786252] dark:text-stone-400">{isHi ? 'प्रारंभ होने का समय:' : 'Starts In:'}</p>
              <div className="flex items-center gap-1.5 font-display text-base font-bold text-[#651317] dark:text-amber-300 tracking-wide">
                <Clock className="w-4 h-4" />
                <span>{timeStr}</span>
              </div>
            </div>
          </div>
        );
      case 'STREAM_UNAVAILABLE':
        return (
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <p className="font-bold text-xs sm:text-sm text-[#3A2418] dark:text-amber-100">{isHi ? '⚠️ लाइव स्ट्रीम अवरुद्ध' : '⚠️ Live Stream Unavailable'}</p>
              <p className="text-[11px] text-[#786252] dark:text-stone-400 leading-normal">
                {isHi
                  ? 'वर्तमान में नियमित आरती समय के बाहर स्ट्रीम उपलब्ध नहीं है।'
                  : 'Stream currently not available outside scheduled aarti.'}
              </p>
            </div>
          </div>
        );
      case 'OFFLINE':
      default:
        return (
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FFFDF8] dark:bg-stone-900/60 border border-[#E8D8C4] dark:border-stone-800 text-[#3A2418] dark:text-stone-300 shadow-2xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-stone-400 dark:bg-stone-500 animate-pulse"></span>
            </span>
            <div>
              <p className="font-bold text-xs sm:text-sm text-[#3A2418] dark:text-amber-100">{isHi ? '⚪ अभी ऑफ़लाइन' : '⚪ Currently Offline'}</p>
              <p className="text-[11px] text-[#786252] dark:text-stone-400">
                {isHi ? 'आरती समय सारिणी नीचे देखें' : 'View daily aarti schedule below'}
              </p>
            </div>
          </div>
        );
    }
  };

  const handlePrimaryAction = () => {
    if (resolvedStatus === 'LIVE') {
      if (embedUrl && temple.videoId) {
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
        return isHi ? 'लाइव दर्शन देखें' : 'Watch live darshan';
      case 'UPCOMING':
        return isHi ? 'आरती समय देखें' : 'View aarti schedule';
      case 'OFFLINE':
        return isHi ? 'मंदिर का यूट्यूब चैनल' : 'Open Temple Channel';
      case 'STREAM_UNAVAILABLE':
        return isHi ? 'यूट्यूब खोलें' : 'Open YouTube';
      default:
        return isHi ? 'मंदिर का चैनल खोलें' : 'Open temple channel';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent
        showClose={false}
        overlayClassName="z-[300] bg-black/65"
        className="w-[94vw] max-w-lg max-h-[88vh] p-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-[#E8D8C4] dark:border-stone-800 bg-[#FFFDF8] dark:bg-[#0e0a08] text-[#3A2418] dark:text-amber-100 shadow-2xl flex flex-col focus:outline-none"
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{deityText} • {temple.location}</DialogDescription>

        {/* Accent colored top bar */}
        <div
          className="h-1.5 w-full shrink-0"
          style={{ backgroundColor: accentColor }}
        />

        {/* Modal Header (Sticky) */}
        <div className="flex items-start justify-between p-4 border-b border-[#E8D8C4] dark:border-stone-800 bg-[#FFFDF8]/95 dark:bg-[#0e0a08]/95 backdrop-blur-md shrink-0 sticky top-0 z-20">
          <div className="min-w-0 pr-2">
            <span className="text-[9px] uppercase font-bold tracking-wider text-[#651317] dark:text-amber-300 bg-[#651317]/10 dark:bg-amber-400/15 border border-[#651317]/20 dark:border-amber-400/30 px-2 py-0.5 rounded-full mb-1 inline-block">
              {temple.category}
            </span>
            <h2 className="text-base sm:text-lg font-bold font-display text-[#3A2418] dark:text-amber-100 leading-tight truncate">
              {title}
            </h2>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5 text-xs text-[#786252] dark:text-stone-400">
              <p className="truncate">{deityText} • {temple.location}</p>
              {temple.lastVerifiedAt && (
                <span className="text-[10px] text-[#786252] dark:text-stone-400 font-semibold bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full inline-flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${resolvedStatus === 'LIVE' ? 'bg-red-500 animate-pulse' : 'bg-stone-400'}`} />
                  <span>{formatVerifiedTime(temple.lastVerifiedAt)}</span>
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label={isHi ? 'बंद करें' : 'Close'}
            className="rounded-full p-2 text-[#786252] dark:text-stone-400 hover:text-[#3A2418] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-90 shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content (Scrollable) */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto scrollbar-hide">
          {/* Channel Filter Note if applicable */}
          {temple.requiresTitleFilter && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
              <p>
                <span className="font-bold">{isHi ? 'सूचना:' : 'Notice:'} </span>
                {isHi ? 'केवल भक्ति संबंधी लाइव स्ट्रीम दिखाए जाते हैं।' : 'Devotional livestream feeds only.'}
              </p>
            </div>
          )}

          {/* Hero Player Container */}
          <div className="space-y-3.5">
            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black border border-[#E8D8C4] dark:border-stone-800 flex flex-col items-center justify-center text-center relative shadow-sm">
              {(showInAppPlayer || forceShowPlayer) && embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={`${temple.name} Live Stream`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                />
              ) : (
                <div 
                  className="absolute inset-0 w-full h-full cursor-pointer group" 
                  onClick={() => {
                    if (embedUrl) {
                      setShowInAppPlayer(true);
                    } else {
                      window.open(temple.fallbackLiveUrl, '_blank', 'noopener,noreferrer');
                    }
                  }}
                >
                  <img
                    src={temple.videoId ? `https://i.ytimg.com/vi/${temple.videoId}/hqdefault.jpg` : resolveTempleBanner(temple.id)}
                    alt={title}
                    width={800}
                    height={450}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover opacity-75 group-hover:scale-102 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <span
                      className="h-13 w-13 items-center justify-center rounded-full bg-[#651317] hover:bg-[#80181D] border border-amber-400/40 text-white flex shadow-lg group-hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Play className="w-5 h-5 fill-white stroke-none ml-0.5" />
                    </span>
                    <span className="text-xs font-bold text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs border border-white/10">
                      {resolvedStatus === 'LIVE'
                        ? (isHi ? 'लाइव दर्शन शुरू करें' : 'Start Live Darshan')
                        : (isHi ? 'यूट्यूब पर दर्शन करें' : 'Watch on YouTube')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Status Banner */}
            {getStatusBanner(resolvedStatus, displayMinutes)}
          </div>

          {/* Daily Aarti Schedule List */}
          {temple.aartiSchedule.length > 0 && (
            <div 
              ref={scheduleRef} 
              className="bg-[#FFFDF8] dark:bg-stone-900/60 border border-[#E8D8C4] dark:border-stone-800 rounded-2xl p-4 scroll-mt-6 shadow-2xs"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#786252] dark:text-stone-400 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#651317] dark:text-amber-400" />
                <span>{isHi ? 'दैनिक आरती समय सारिणी (IST)' : 'Daily Aarti Schedule (IST)'}</span>
              </h4>
              <div className="divide-y divide-[#E8D8C4]/60 dark:divide-stone-800">
                {temple.aartiSchedule.map((item, idx) => {
                  const isNext = nextAartiData && nextAartiData.aarti.time === item.time;
                  return (
                    <div 
                      key={idx} 
                      className={`flex flex-col gap-1 py-2.5 transition-all duration-300 rounded-lg px-2 first:pt-0 last:pb-0 ${
                        isNext 
                          ? highlightSchedule
                            ? 'bg-[#651317]/10 dark:bg-amber-500/20 ring-1'
                            : 'bg-black/5 dark:bg-white/[0.03]'
                          : ''
                      }`}
                      style={isNext && highlightSchedule ? { ringColor: accentColor } : {}}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${isNext ? 'text-[#3A2418] dark:text-amber-100 font-bold' : 'text-[#543D2B] dark:text-stone-300'}`}>
                            {isHi ? item.nameHindi : item.name}
                          </span>
                          {isNext && (
                            <span 
                              className="text-[9px] font-extrabold px-2 py-0.5 rounded-full tracking-wider uppercase bg-[#651317]/10 text-[#651317] dark:bg-amber-400/20 dark:text-amber-300 border border-[#651317]/20 dark:border-amber-400/30"
                            >
                              {isHi ? 'अगला' : 'NEXT'}
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-bold text-[#651317] dark:text-amber-300">
                          {item.time} <span className="text-[10px] font-medium text-[#786252] dark:text-stone-500">({item.durationMinutes}m)</span>
                        </div>
                      </div>
                      {isNext && displayMinutes !== undefined && resolvedStatus !== 'LIVE' && (
                        <p className="text-[11px] font-bold mt-0.5 flex items-center gap-1.5 text-[#651317] dark:text-amber-400">
                          <span className="w-1.5 h-1.5 rounded-full animate-ping bg-[#651317] dark:bg-amber-400" />
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
        <div className="p-4 border-t border-[#E8D8C4] dark:border-stone-800 bg-[#FFFDF8]/98 dark:bg-[#0e0a08]/98 backdrop-blur-sm shrink-0 sticky bottom-0 z-20 flex flex-col gap-2">
          <button
            type="button"
            onClick={handlePrimaryAction}
            className="btn-royal-primary h-11 w-full rounded-2xl text-sm font-bold gap-2 shadow-xs cursor-pointer active:scale-95"
          >
            {resolvedStatus === 'UPCOMING' && <Clock className="w-4 h-4" />}
            {(resolvedStatus === 'OFFLINE' || resolvedStatus === 'STREAM_UNAVAILABLE') && (
              <img src={youtubeSvg} alt="" className="w-5 h-5 object-contain" />
            )}
            <span>{getButtonText()}</span>
          </button>

          {(resolvedStatus === 'LIVE' || resolvedStatus === 'UPCOMING') && (
            <button
              type="button"
              onClick={() => window.open(temple.fallbackLiveUrl, '_blank', 'noopener,noreferrer')}
              className="btn-royal-secondary h-10 w-full rounded-2xl text-xs sm:text-sm font-semibold gap-2 bg-[#FFFDF8] dark:bg-stone-900 border-[#E8D8C4] dark:border-stone-700 text-[#651317] dark:text-amber-300 hover:bg-[#FAF2E8] dark:hover:bg-stone-800 cursor-pointer active:scale-95 shadow-2xs"
            >
              <img src={youtubeSvg} alt="" className="w-4 h-4 object-contain shrink-0" />
              <span>{isHi ? 'यूट्यूब पर लाइव देखें' : 'Open Live on YouTube'}</span>
            </button>
          )}

          {resolvedStatus === 'OFFLINE' && embedUrl && !showInAppPlayer && (
            <button
              type="button"
              onClick={() => setForceShowPlayer(true)}
              className="btn-royal-secondary h-10 w-full rounded-2xl text-xs sm:text-sm font-semibold gap-2 bg-[#FFFDF8] dark:bg-stone-900 border-[#E8D8C4] dark:border-stone-700 text-[#651317] dark:text-amber-300 hover:bg-[#FAF2E8] dark:hover:bg-stone-800 cursor-pointer active:scale-95 shadow-2xs"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isHi ? 'साइट पर प्लेयर लोड करें' : 'Load Player in Site'}</span>
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
