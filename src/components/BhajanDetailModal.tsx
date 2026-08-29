import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import MobileBottomNav from '@/components/MobileBottomNav';
import {
  Mail,
  Link as LinkIcon,
  Music2,
  Play,
  ArrowLeft,
  Loader2,
  Heart,
} from 'lucide-react';
import LyricsDisplay from './LyricsDisplay';
import BhajanCard from './BhajanCard';
import devotionalHeroBg from '@/pages/images/devotional_background_high_quality(1).webp';
import whatsappIcon from '@/pages/images/whatsapp-svgrepo-com.svg';
import telegramSvg from '@/pages/images/svg/telegram-svgrepo-com.svg';

import { useLikedBhajans } from '@/hooks/useLikedBhajans';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import {
  shareOnWhatsApp,
  shareOnTelegram,
  shareViaEmail,
  copyShareLink,
} from '@/lib/shareUtils';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { openYouTubeSearchFallback } from '@/lib/youtubeEmbedPopup';
import { formatBhajanDisplayTitle } from '@/lib/slugUtils';
import { getDeityById, bhajans as staticBhajans, type Bhajan } from '@/data/bhajans';
import { getCanonicalUrl } from '@/lib/contentUrls';
import { cn } from '@/lib/utils';
import { useBhajanModalOpen } from '@/hooks/useBhajanModalOpen';

interface BhajanDetailModalProps {
  bhajan: Bhajan | null;
  isOpen: boolean;
  onClose: () => void;
  allBhajans?: Bhajan[];
  onSelectBhajan?: (bhajan: Bhajan) => void;
  elevatedLayer?: boolean;
}

const mobileFullscreenDialog =
  'w-full max-w-full h-full max-h-full rounded-none sm:h-auto sm:max-h-[90vh] sm:rounded-3xl';

export default function BhajanDetailModal({
  bhajan,
  isOpen,
  onClose,
  allBhajans = [],
  onSelectBhajan,
  elevatedLayer = false,
}: BhajanDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [playOpening, setPlayOpening] = useState(false);
  const scrollBodyRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const { openPlayer } = useYouTubePlayer();
  const { setBhajanModalOpen } = useBhajanModalOpen();
  const { isLiked, toggleLike } = useLikedBhajans();

  useEffect(() => {
    setBhajanModalOpen(isOpen);
    return () => setBhajanModalOpen(false);
  }, [isOpen, setBhajanModalOpen]);

  useLayoutEffect(() => {
    if (!isOpen || !bhajan) return;
    scrollBodyRef.current?.scrollTo({ top: 0, left: 0 });
  }, [isOpen, bhajan?.id]);

  if (!bhajan) return null;

  const deity = getDeityById(bhajan.deityId);

  const handleShare = async (platform: 'whatsapp' | 'telegram' | 'email' | 'copy') => {
    const fullUrl = getCanonicalUrl(bhajan);
    switch (platform) {
      case 'whatsapp':
        shareOnWhatsApp(bhajan.title, fullUrl);
        break;
      case 'telegram':
        shareOnTelegram(bhajan.title, fullUrl);
        break;
      case 'email':
        shareViaEmail(bhajan.title, fullUrl);
        break;
      case 'copy':
        await copyShareLink(fullUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: t('copied'),
          description: t('linkCopiedToClipboard'),
        });
        break;
    }
  };

  const candidatePool = Array.from(
    new Map(
      [...(allBhajans || []), ...staticBhajans]
        .filter((b) => String(b.id) !== String(bhajan.id))
        .map((b) => [String(b.id), b])
    ).values()
  );

  const sameDeity = candidatePool.filter((b) => b.deityId === bhajan.deityId);

  const sameSinger = candidatePool.filter(
    (b) =>
      b.singerName &&
      bhajan.singerName &&
      b.singerName.toLowerCase() === bhajan.singerName.toLowerCase() &&
      b.deityId !== bhajan.deityId
  );

  const bhajanKeywords = (bhajan.title + ' ' + (bhajan.titleHindi || ''))
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3);

  const keywordMatches = candidatePool.filter((b) => {
    if (
      b.deityId === bhajan.deityId ||
      (b.singerName && b.singerName.toLowerCase() === bhajan.singerName?.toLowerCase())
    ) {
      return false;
    }
    const targetText = (b.title + ' ' + (b.titleHindi || '')).toLowerCase();
    return bhajanKeywords.some((kw) => targetText.includes(kw));
  });

  const remaining = candidatePool.filter(
    (b) =>
      !sameDeity.some((item) => String(item.id) === String(b.id)) &&
      !sameSinger.some((item) => String(item.id) === String(b.id)) &&
      !keywordMatches.some((item) => String(item.id) === String(b.id))
  );

  const relatedBhajans = [
    ...sameDeity,
    ...sameSinger,
    ...keywordMatches,
    ...remaining,
  ].slice(0, 8);

  const handleToggleLike = (id: string) => {
    const currentlyLiked = isLiked(id);
    toggleLike(id);
    if (!currentlyLiked) {
      toast({
        title: language === 'hi' ? '❤️ पसंद के भजनों में जोड़ा गया!' : '❤️ Added to Liked Bhajans!',
        description: language === 'hi' ? 'यह भजन आपके पसंदीदा भजनों में सहेज लिया गया है।' : 'This bhajan has been added to your liked collection.',
      });
    }
  };

  const extractYouTubeId = (urlOrId?: string): string => {
    if (!urlOrId) return 'dQw4w9WgXcQ';
    if (urlOrId.length === 11 && !urlOrId.includes('/') && !urlOrId.includes('.')) {
      return urlOrId;
    }
    const match = urlOrId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : urlOrId;
  };

  const handleYouTubePlay = () => {
    const videoId = extractYouTubeId(bhajan.videoEmbedId || bhajan.youtubeUrl);
    openPlayer({
      id: videoId,
      title: bhajan.titleHindi || bhajan.title,
      channel: bhajan.singerName,
      bhajanId: bhajan.id,
      bhajanSlug: bhajan.slug,
      deityId: bhajan.deityId,
      lyricsHindi: bhajan.lyricsHindi,
      lyricsTransliteration: bhajan.lyricsTransliteration,
      titleHindi: bhajan.titleHindi,
      imageUrl: bhajan.imageUrl,
      category: bhajan.contentType || bhajan.subType || 'bhajan',
      singerName: bhajan.singerName,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showClose={false}
        overlayClassName={elevatedLayer ? 'z-[350]' : 'z-[300]'}
        className={cn(
          mobileFullscreenDialog,
          '!flex !flex-col !min-h-0 !overflow-hidden border-border bg-background p-0',
          'max-w-4xl sm:max-w-4xl sm:w-[min(100vw-2rem,56rem)]',
          elevatedLayer ? 'z-[351]' : 'z-[301]',
        )}
      >
        <DialogTitle className="sr-only">{bhajan.title}</DialogTitle>
        <DialogDescription className="sr-only">
          {bhajan.titleHindi} - by {bhajan.singerName}
        </DialogDescription>

        <div
          ref={scrollBodyRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          {/* Top Devotional Background Hero Section */}
          <div className="relative overflow-hidden bg-[#FAF6F0] dark:bg-[#1E1710] border-b border-[#E8D8C4]/60 dark:border-zinc-800 px-3 py-3 sm:p-5 select-none">
            {/* Background image overlay */}
            <div
              className="absolute inset-0 opacity-25 dark:opacity-15 bg-cover bg-right-top pointer-events-none"
              style={{ backgroundImage: `url(${devotionalHeroBg})` }}
            />

            {/* Top Controls (Back Button Left, Like Button Right) */}
            <div className="relative z-10 flex items-center justify-between mb-3">
              <DialogClose
                type="button"
                aria-label={t('back')}
                onClick={onClose}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/80 dark:bg-zinc-900/80 border border-border text-foreground shadow-sm backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
              </DialogClose>

              <button
                type="button"
                onClick={() => handleToggleLike(bhajan.id)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/80 dark:bg-zinc-900/80 border border-border text-foreground shadow-sm backdrop-blur-md transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 cursor-pointer"
                aria-label={isLiked(bhajan.id) ? t('unlikeBhajan') : t('likeBhajan')}
              >
                <Heart className={`h-4 w-4 ${isLiked(bhajan.id) ? 'fill-red-500 text-red-500' : 'text-foreground'}`} />
              </button>
            </div>

            {/* Banner Body Layout (Thumbnail + Title + Actions) */}
            <div className="relative z-10 flex items-center gap-3.5 sm:gap-5 px-0.5">
              <div className="w-24 h-24 sm:w-28 sm:h-28 aspect-square rounded-2xl overflow-hidden shadow-md border-2 border-white/90 dark:border-zinc-700/60 shrink-0 bg-amber-500/10 flex items-center justify-center">
                {bhajan.imageUrl ? (
                  <img src={bhajan.imageUrl} alt={bhajan.title} className="w-full h-full object-cover" />
                ) : deity?.imageUrl ? (
                  <img src={deity.imageUrl} alt={deity.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">{deity?.emoji || '🕉️'}</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="font-serif text-lg sm:text-2xl font-bold text-[#32251E] dark:text-[#FFFDF8] leading-snug break-words line-clamp-2">
                  {formatBhajanDisplayTitle(bhajan.title)}
                </h2>
                {bhajan.titleHindi && (
                  <p className="hindi-text text-sm sm:text-base font-semibold text-[#7A2D28] dark:text-[#E8B15C] mt-0.5 break-words line-clamp-1">
                    {formatBhajanDisplayTitle(bhajan.titleHindi)}
                  </p>
                )}
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 font-medium">
                  {language === 'hi' ? `${bhajan.singerName} द्वारा` : `by ${bhajan.singerName}`}
                </p>

                {/* Larger Action Buttons (Play Now + Save) — Matching Sizing */}
                <div className="mt-3.5 flex items-center gap-2.5 sm:gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={handleYouTubePlay}
                    className="inline-flex h-11 sm:h-12 items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#5C1D0C] to-[#8B2E15] dark:from-[#E8B15C] dark:to-[#D4A437] text-white dark:text-black px-6 sm:px-7 text-xs sm:text-sm font-bold shadow-lg hover:opacity-95 active:scale-95 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{language === 'hi' ? 'चलाएं' : 'Play Now'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleLike(bhajan.id)}
                    className={cn(
                      'inline-flex h-11 sm:h-12 items-center justify-center gap-2.5 rounded-full px-6 sm:px-7 text-xs sm:text-sm font-bold shadow-md active:scale-95 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 transition-all cursor-pointer border',
                      isLiked(bhajan.id)
                        ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white shadow-pink-500/25 border-pink-400/50'
                        : 'border-border bg-white/90 dark:bg-zinc-900/90 text-foreground hover:bg-accent',
                    )}
                  >
                    <Heart className={`w-4 h-4 ${isLiked(bhajan.id) ? 'fill-white text-white' : 'text-foreground'}`} />
                    <span>{isLiked(bhajan.id) ? (language === 'hi' ? 'सहेजा गया' : 'Saved') : (language === 'hi' ? 'सहेजें' : 'Save')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-5 pb-24 sm:pb-8 space-y-4">
            {/* Share Grid — compact, sleek card */}
            <div className="rounded-xl border border-border/60 bg-card p-2 sm:p-2.5 shadow-sm select-none">
              <div className="grid grid-cols-4 divide-x divide-border/60 text-center">
                <button type="button" onClick={() => handleShare('whatsapp')} className="flex flex-col items-center justify-center gap-1 py-0.5 hover:opacity-85 transition-all cursor-pointer group">
                  <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                    <img src={whatsappIcon} alt="WhatsApp" className="w-5 h-5 object-contain" />
                  </div>
                  <span className="text-[11px] font-semibold text-foreground">WhatsApp</span>
                </button>
                <button type="button" onClick={() => handleShare('telegram')} className="flex flex-col items-center justify-center gap-1 py-0.5 hover:opacity-85 transition-all cursor-pointer group">
                  <div className="w-9 h-9 rounded-full bg-[#0088cc] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                    <img src={telegramSvg} alt="Telegram" className="w-5 h-5 object-contain" />
                  </div>
                  <span className="text-[11px] font-semibold text-foreground">Telegram</span>
                </button>
                <button type="button" onClick={() => handleShare('email')} className="flex flex-col items-center justify-center gap-1 py-0.5 hover:opacity-85 transition-all cursor-pointer group">
                  <div className="w-9 h-9 rounded-full bg-[#EA4335] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[11px] font-semibold text-foreground">{language === 'hi' ? 'ईमेल' : 'Email'}</span>
                </button>
                <button type="button" onClick={() => handleShare('copy')} className="flex flex-col items-center justify-center gap-1 py-0.5 hover:opacity-85 transition-all cursor-pointer group">
                  <div className="w-9 h-9 rounded-full bg-accent border border-border flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                    <LinkIcon className="w-4 h-4 text-foreground" />
                  </div>
                  <span className="text-[11px] font-semibold text-foreground">
                    {copied ? (language === 'hi' ? 'कॉपी!' : 'Copied!') : (language === 'hi' ? 'लिंक कॉपी' : 'Copy')}
                  </span>
                </button>
              </div>
            </div>

            {/* Metadata Badges */}
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="rounded-xl border border-border/60 bg-card p-3">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{t('deity')}</p>
                <p className="text-sm font-bold text-foreground mt-0.5">{deity?.name || 'Devotion'}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card p-3">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{t('singer')}</p>
                <p className="text-sm font-bold text-foreground mt-0.5 truncate">{bhajan.singerName}</p>
              </div>
              {bhajan.composerName ? (
                <div className="rounded-xl border border-border/60 bg-card p-3 col-span-2 sm:col-span-1">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{t('composer')}</p>
                  <p className="text-sm font-bold text-foreground mt-0.5 truncate">{bhajan.composerName}</p>
                </div>
              ) : null}
            </motion.div>

            {/* Lyrics Section */}
            <LyricsDisplay
              titleHindi={bhajan.titleHindi}
              lyricsHindi={bhajan.lyricsHindi}
              lyricsTransliteration={bhajan.lyricsTransliteration}
              singerName={bhajan.singerName}
              imageUrl={bhajan.imageUrl}
            />

            {/* Related Bhajans */}
            {relatedBhajans.length > 0 && (
              <motion.div
                className="space-y-4 pt-4 border-t border-border/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2">
                  <Music2 className="w-5 h-5 text-[#5C1D0C] dark:text-[#E8B15C]" />
                  <h3 className="font-serif text-lg font-bold text-foreground">
                    {language === 'hi' ? 'संबंधित भजन' : 'Related Bhajans'}
                  </h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  {relatedBhajans.map((related) => (
                    <div
                      key={related.id}
                      onClick={() => onSelectBhajan?.(related)}
                      className="cursor-pointer"
                    >
                      <BhajanCard bhajan={related} />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
