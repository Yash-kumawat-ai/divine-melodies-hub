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

    if (diffSec < 10) return isHi ? 'अभी सत्यापित' : 'Verified just now';
    if (diffSec < 60) return isHi ? `${diffSec} से. पहले` : `${diffSec}s ago`;
    const mins = Math.floor(diffSec / 60);
    if (mins < 60) return isHi ? `${mins} मि. पहले` : `${mins}m ago`;
    
    return isHi 
      ? `${verified.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      : `${verified.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const handlePrimaryAction = () => {
    if (resolvedStatus === 'LIVE') {
      if (showInAppPlayer || forceShowPlayer) {
        window.open(temple.fallbackLiveUrl, '_blank', 'noopener,noreferrer');
      } else if (embedUrl && temple.videoId) {
        setShowInAppPlayer(true);
      } else {
        window.open(temple.fallbackLiveUrl, '_blank', 'noopener,noreferrer');
      }
    } else if (resolvedStatus === 'OFFLINE' || resolvedStatus === 'STREAM_UNAVAILABLE') {
      window.open(temple.fallbackChannelUrl, '_blank', 'noopener,noreferrer');
    } else if (resolvedStatus === 'UPCOMING') {
      scheduleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightSchedule(true);
      setTimeout(() => {
        setHighlightSchedule(false);
      }, 2500);
    }
  };

  const getButtonText = () => {
    switch (resolvedStatus) {
      case 'LIVE':
        return showInAppPlayer || forceShowPlayer
          ? (isHi ? 'यूट्यूब पर लाइव खोलें' : 'Open Live on YouTube')
          : (isHi ? 'लाइव दर्शन देखें' : 'Watch Live Darshan');
      case 'UPCOMING':
        return isHi ? 'आरती समय सारिणी देखें' : 'View Aarti Schedule';
      case 'OFFLINE':
      case 'STREAM_UNAVAILABLE':
      default:
        return isHi ? 'मंदिर का यूट्यूब चैनल' : 'Open Temple Channel';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent
        showClose={false}
        overlayClassName="z-[300] bg-black/65"
        className="w-[94vw] sm:w-full max-w-lg max-h-[88vh] p-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-[#E8D8C4] dark:border-stone-800 bg-[#FFFDF8] dark:bg-[#0e0a08] text-[#3A2418] dark:text-amber-100 shadow-2xl flex flex-col focus:outline-none"
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{deityText} • {temple.location}</DialogDescription>

        {/* Top Accent Stripe */}
        <div
          className="h-1.5 w-full shrink-0"
          style={{ backgroundColor: accentColor }}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-[#E8D8C4] dark:border-stone-800 bg-[#FFFDF8]/98 dark:bg-[#0e0a08]/98 shrink-0 sticky top-0 z-20">
          <div className="min-w-0 flex-1 pr-2">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#651317] dark:text-amber-300 bg-[#651317]/10 dark:bg-amber-400/15 border border-[#651317]/20 dark:border-amber-400/30 px-2.5 py-0.5 rounded-full inline-block">
                {temple.category}
              </span>
              {temple.lastVerifiedAt && (
                <span className="text-[11px] text-[#786252] dark:text-stone-400 font-medium inline-flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${resolvedStatus === 'LIVE' ? 'bg-red-500 animate-pulse' : 'bg-stone-400'}`} />
                  <span>{formatVerifiedTime(temple.lastVerifiedAt)}</span>
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-display text-[#3A2418] dark:text-amber-100 leading-tight truncate">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-[#786252] dark:text-stone-400 truncate mt-0.5">
              {deityText} • {temple.location}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label={isHi ? 'बंद करें' : 'Close'}
            className="flex items-center justify-center h-8.5 w-8.5 sm:h-9 sm:w-9 rounded-full bg-[#FAF4EA] dark:bg-stone-800/80 border border-[#E8D8C4] dark:border-stone-700/80 text-[#786252] dark:text-stone-300 hover:bg-[#F2E8DA] dark:hover:bg-stone-700 hover:text-[#3A2418] dark:hover:text-white active:scale-90 transition-all shrink-0 cursor-pointer shadow-2xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto scrollbar-hide">
          {/* Video Player Container */}
          <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black border border-[#E8D8C4] dark:border-stone-800 relative shadow-sm shrink-0">
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
                  loading="eager"
                  fetchpriority="high"
                  decoding="async"
                  className="w-full h-full object-cover opacity-85 group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/20" />
                
                {/* Centered Royal Play Button Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 text-white">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#651317] hover:bg-[#80181D] text-white shadow-xl transition-all group-hover:scale-110 border-2 border-amber-400/60 cursor-pointer">
                    <Play className="ml-1 h-6 w-6 fill-white stroke-none" />
                  </span>
                  <span className="text-xs sm:text-sm font-bold bg-black/60 px-4 py-1.5 rounded-full backdrop-blur-xs border border-white/15 shadow-xs">
                    {resolvedStatus === 'LIVE'
                      ? (isHi ? 'लाइव दर्शन शुरू करें' : 'Start Live Darshan')
                      : (isHi ? 'यूट्यूब पर दर्शन करें' : 'Watch on YouTube')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Generous Status Row Box */}
          <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-[#E8D8C4] dark:border-stone-800 min-h-[50px]">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {resolvedStatus === 'LIVE' ? (
                <>
                  <span className="relative flex h-3 w-3 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                  </span>
                  <span className="font-bold text-sm sm:text-base text-[#651317] dark:text-red-400 leading-snug">
                    {isHi ? 'लाइव दर्शन उपलब्ध' : 'Live Darshan Available'}
                  </span>
                </>
              ) : resolvedStatus === 'UPCOMING' && displayMinutes !== undefined ? (
                <>
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="font-semibold text-sm sm:text-base text-[#3A2418] dark:text-amber-100 leading-snug">
                    {nextAartiData?.aarti ? (isHi ? nextAartiData.aarti.nameHindi : nextAartiData.aarti.name) : (isHi ? 'अगली आरती' : 'Next Aarti')}
                    {' '}<span className="text-[#651317] dark:text-amber-400 font-bold">({formatMinutes(displayMinutes)})</span>
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-stone-400 shrink-0 opacity-70" />
                  <span className="font-medium text-sm text-[#786252] dark:text-stone-400 leading-snug">
                    {isHi ? 'वर्तमान में ऑफ़लाइन' : 'Currently Offline'}
                  </span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => window.open(temple.fallbackLiveUrl, '_blank', 'noopener,noreferrer')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-700 dark:text-red-300 font-bold text-xs border border-red-600/20 active:scale-95 transition-all shrink-0 cursor-pointer shadow-2xs"
            >
              <img src={youtubeSvg} alt="" className="w-4 h-4 object-contain" />
              <span>{isHi ? 'यूट्यूब' : 'YouTube'}</span>
            </button>
          </div>

          {/* Devotional Note (Subtle) */}
          {temple.requiresTitleFilter && (
            <p className="text-xs text-[#786252] dark:text-stone-400 italic text-center px-1">
              {isHi ? 'ℹ️ केवल प्रामाणिक मंदिर लाइव स्ट्रीम दिखाए जाते हैं।' : 'ℹ️ Authentic devotional temple streams only.'}
            </p>
          )}

          {/* Daily Aarti Schedule List - Spacious Box */}
          {temple.aartiSchedule.length > 0 && (
            <div 
              ref={scheduleRef} 
              className="bg-[#FFFDF8] dark:bg-stone-900/60 border border-[#E8D8C4] dark:border-stone-800 rounded-2xl p-4 sm:p-5 scroll-mt-4 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#786252] dark:text-stone-400 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#651317] dark:text-amber-400" />
                  <span>{isHi ? 'दैनिक आरती समय सारिणी (IST)' : 'Daily Aarti Schedule (IST)'}</span>
                </h4>
                <span className="text-xs font-bold text-[#651317] dark:text-amber-400 bg-[#651317]/10 dark:bg-amber-400/15 px-2.5 py-1 rounded-full">
                  {temple.aartiSchedule.length} {isHi ? 'सत्र' : 'Sessions'}
                </span>
              </div>

              <div className="divide-y divide-[#E8D8C4]/60 dark:divide-stone-800">
                {temple.aartiSchedule.map((item, idx) => {
                  const isNext = nextAartiData && nextAartiData.aarti.time === item.time;
                  return (
                    <div 
                      key={idx} 
                      className={`flex items-center justify-between py-3 px-3 rounded-xl transition-all ${
                        isNext 
                          ? highlightSchedule
                            ? 'bg-[#651317]/10 dark:bg-amber-500/20 ring-1 ring-[#651317]/30'
                            : 'bg-black/5 dark:bg-white/[0.04]'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                        <span className={`text-sm sm:text-base font-semibold leading-normal ${isNext ? 'text-[#3A2418] dark:text-amber-100 font-bold' : 'text-[#543D2B] dark:text-stone-300'}`}>
                          {isHi ? item.nameHindi : item.name}
                        </span>
                        {isNext && (
                          <span className="inline-flex items-center justify-center text-[10px] sm:text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-[#651317] text-white dark:bg-amber-400 dark:text-stone-950 leading-none shrink-0 tracking-wider uppercase shadow-2xs">
                            {isHi ? 'अगला' : 'NEXT'}
                          </span>
                        )}
                      </div>
                      <div className="text-sm sm:text-base font-bold text-[#651317] dark:text-amber-300 shrink-0 pl-2 text-right">
                        <span>{item.time}</span> <span className="text-xs font-normal text-[#786252] dark:text-stone-400">({item.durationMinutes}m)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Sticky Footer - Compact single-button layout */}
        <div className="p-3 sm:p-4 border-t border-[#E8D8C4] dark:border-stone-800 bg-[#FFFDF8]/98 dark:bg-[#0e0a08]/98 shrink-0 sticky bottom-0 z-20">
          <button
            type="button"
            onClick={handlePrimaryAction}
            className="btn-royal-primary h-11 w-full rounded-2xl text-xs sm:text-sm font-bold gap-2 shadow-xs cursor-pointer active:scale-95 flex items-center justify-center"
          >
            {resolvedStatus === 'UPCOMING' && <Clock className="w-4 h-4" />}
            {resolvedStatus === 'LIVE' && <Play className="w-4 h-4 fill-current" />}
            {(resolvedStatus === 'OFFLINE' || resolvedStatus === 'STREAM_UNAVAILABLE') && (
              <img src={youtubeSvg} alt="" className="w-4 h-4 object-contain shrink-0" />
            )}
            <span>{getButtonText()}</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
