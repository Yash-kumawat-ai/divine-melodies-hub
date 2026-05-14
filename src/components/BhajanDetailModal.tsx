import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Send,
  Mail,
  Link as LinkIcon,
  Music2,
  Star,
  Play,
  X,
  Loader2,
} from 'lucide-react';
import LyricsDisplay from './LyricsDisplay';
import BhajanCard from './BhajanCard';
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
import { getRelatedBhajans } from '@/lib/searchAlgorithm';
import { resolveBhajanYouTubePlayback } from '@/lib/youtubeEmbedPopup';
import { Bhajan, getDeityById } from '@/data/bhajans';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';

interface BhajanDetailModalProps {
  bhajan: Bhajan | null;
  isOpen: boolean;
  onClose: () => void;
  allBhajans?: Bhajan[];
  onSelectBhajan?: (bhajan: Bhajan) => void;
}

export default function BhajanDetailModal({
  bhajan,
  isOpen,
  onClose,
  allBhajans = [],
  onSelectBhajan,
}: BhajanDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [playOpening, setPlayOpening] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { openPlayer } = useYouTubePlayer();

  if (!bhajan) return null;

  const deity = getDeityById(bhajan.deityId);
  const relatedBhajans = getRelatedBhajans(bhajan, allBhajans, 5);

  const handleShare = async (platform: 'whatsapp' | 'telegram' | 'email' | 'copy') => {
    try {
      switch (platform) {
        case 'whatsapp':
          shareOnWhatsApp(bhajan);
          break;
        case 'telegram':
          shareOnTelegram(bhajan);
          break;
        case 'email':
          shareViaEmail(bhajan);
          break;
        case 'copy': {
          const success = await copyShareLink(bhajan);
          if (success) {
            setCopied(true);
            toast({
              title: t('linkCopied'),
              description: 'Bhajan link copied to clipboard',
              duration: 2000,
            });
            setTimeout(() => setCopied(false), 2000);
          }
          break;
        }
      }
    } catch (error) {
      console.error(`Failed to share on ${platform}:`, error);
      toast({
        title: 'Share failed',
        description: `Could not share on ${platform}`,
        variant: 'destructive',
      });
    }
  };

  const handleRelatedClick = (clickedBhajan: Bhajan) => {
    if (onSelectBhajan) {
      onSelectBhajan(clickedBhajan);
    }
  };

  const handleYouTubePlay = async () => {
    setPlayOpening(true);
    try {
      const playback = await resolveBhajanYouTubePlayback({
        videoEmbedId: bhajan.videoEmbedId,
        youtubeUrl: bhajan.youtubeUrl,
        title: bhajan.title,
        singerName: bhajan.singerName,
      });

      if (playback) {
        openPlayer(playback);
        return;
      }

      toast({
        title: 'Could not open player',
        description: 'Could not load the video. Check your connection and try again.',
        variant: 'destructive',
      });
    } finally {
      setPlayOpening(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogTitle className="sr-only">{bhajan.title}</DialogTitle>
        <DialogDescription className="sr-only">
          {bhajan.titleHindi} - by {bhajan.singerName}
        </DialogDescription>

        <div className={`${deity?.colorClass ?? 'bg-primary'} p-6 text-white`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{deity?.emoji}</span>
                <div>
                  <h2 className="font-display text-3xl font-bold">{bhajan.title}</h2>
                  <p className="hindi-text text-xl opacity-90">{bhajan.titleHindi}</p>
                </div>
              </div>
              <p className="text-white/80 text-lg">by {bhajan.singerName}</p>
              {bhajan.composerName && (
                <p className="text-white/70 text-sm mt-1">Composer: {bhajan.composerName}</p>
              )}
            </div>
            <DialogClose className="opacity-70 hover:opacity-100 transition-opacity">
              <X className="w-6 h-6" />
            </DialogClose>
          </div>

          <div className="flex items-center gap-6 mt-4 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              <span>{(bhajan.playCount / 1000).toFixed(0)}K {t('plays')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-white" />
              <span>{bhajan.rating.toFixed(1)} {t('rating')}</span>
            </div>
          </div>
          <div className="mt-5">
            <button
              type="button"
              onClick={handleYouTubePlay}
              disabled={playOpening}
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/25 transition-colors disabled:opacity-60"
            >
              {playOpening ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Play now
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          <motion.div
            className="flex flex-wrap gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <button
              onClick={() => handleShare('whatsapp')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors font-medium text-sm"
              title={t('shareOnWhatsapp')}
            >
              <MessageCircle className="w-4 h-4" />
              {t('whatsapp')}
            </button>
            <button
              onClick={() => handleShare('telegram')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors font-medium text-sm"
              title={t('shareOnTelegram')}
            >
              <Send className="w-4 h-4" />
              {t('telegram')}
            </button>
            <button
              onClick={() => handleShare('email')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 transition-colors font-medium text-sm"
              title={t('shareViaEmail')}
            >
              <Mail className="w-4 h-4" />
              {t('email')}
            </button>
            <button
              onClick={() => handleShare('copy')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium text-sm"
              title={t('copyShareLink')}
            >
              <LinkIcon className="w-4 h-4" />
              {copied ? t('copied') : t('copyShareLink')}
            </button>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase">{t('deity')}</p>
              <p className="text-sm font-medium text-foreground mt-1">{deity?.name}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase">{t('singer')}</p>
              <p className="text-sm font-medium text-foreground mt-1">{bhajan.singerName}</p>
            </div>
            {bhajan.composerName && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Composer</p>
                <p className="text-sm font-medium text-foreground mt-1">{bhajan.composerName}</p>
              </div>
            )}
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase">{t('tags')}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {bhajan.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary"
                  >
                    {tag}
                  </span>
                ))}
                {bhajan.tags.length > 2 && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
                    +{bhajan.tags.length - 2}
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <LyricsDisplay
              titleHindi={bhajan.titleHindi}
              lyricsHindi={bhajan.lyricsHindi}
              lyricsTransliteration={bhajan.lyricsTransliteration}
              singerName={bhajan.singerName}
              imageUrl={bhajan.imageUrl}
            />
          </motion.div>

          {relatedBhajans.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="border-t border-border pt-8">
                <div className="flex items-center gap-2 mb-6">
                  <Music2 className="w-5 h-5 text-primary" />
                  <h3 className="font-display text-2xl font-semibold text-foreground">
                    {t('relatedBhajans')}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {relatedBhajans.map((relatedBhajan, index) => (
                    <motion.div
                      key={relatedBhajan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <BhajanCard
                        bhajan={relatedBhajan}
                        onCardClick={handleRelatedClick}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
