import { useState } from 'react';
import { Copy, Check, ZoomIn, ZoomOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { formatBhajanDisplayTitle } from '@/lib/slugUtils';

interface LyricsDisplayProps {
  titleHindi: string;
  lyricsHindi: string;
  lyricsTransliteration: string;
  singerName: string;
  imageUrl?: string;
}

export default function LyricsDisplay({
  titleHindi,
  lyricsHindi,
  lyricsTransliteration,
  singerName,
  imageUrl,
}: LyricsDisplayProps) {
  const [fontSize, setFontSize] = useState(16);
  const [showTransliteration, setShowTransliteration] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const trimmedLyrics = (lyricsHindi || '').trim();
  const looksLikeUrl = /^https?:\/\//i.test(trimmedLyrics);
  const looksLikeImageUrl =
    looksLikeUrl &&
    (/\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(trimmedLyrics) || trimmedLyrics.includes('cloudinary.com'));
  const resolvedImageUrl = (imageUrl || '').trim() || (looksLikeImageUrl ? trimmedLyrics : '');
  const hideLyricsText = !trimmedLyrics || (resolvedImageUrl && looksLikeImageUrl && trimmedLyrics === resolvedImageUrl);

  const handleCopyLyrics = async () => {
    try {
      const textToCopy = showTransliteration
        ? `${lyricsHindi}\n\n${lyricsTransliteration}`
        : lyricsHindi;
      
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      setCopied(true);
      toast({
        title: t('copied'),
        description: language === 'hi' ? 'गीत क्लिपबोर्ड पर कॉपी हो गए' : 'Lyrics copied to clipboard',
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: language === 'hi' ? 'गीत कॉपी नहीं हो सके' : 'Failed to copy lyrics',
        variant: 'destructive',
      });
    }
  };

  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 24));
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 12));

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border">
        <div className="min-w-0 flex-1">
          <h3 className="hindi-text text-lg font-semibold text-foreground break-words [overflow-wrap:anywhere]">{formatBhajanDisplayTitle(titleHindi || '')}</h3>
          <p className="text-sm text-muted-foreground mt-1 break-words">{language === 'hi' ? 'गायक:' : 'by'} {singerName}</p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl border border-border/70 bg-card shadow-sm">
            <button
              onClick={decreaseFontSize}
              className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title={language === 'hi' ? 'फ़ॉन्ट आकार घटाएँ' : 'Decrease font size'}
              aria-label={language === 'hi' ? 'फ़ॉन्ट आकार घटाएँ' : 'Decrease font size'}
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-muted/60 text-foreground min-w-[36px] text-center select-none">
              {fontSize}px
            </span>
            <button
              onClick={increaseFontSize}
              className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title={language === 'hi' ? 'फ़ॉन्ट आकार बढ़ाएँ' : 'Increase font size'}
              aria-label={language === 'hi' ? 'फ़ॉन्ट आकार बढ़ाएँ' : 'Increase font size'}
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleCopyLyrics}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/70 bg-card text-foreground hover:bg-muted transition-colors shadow-sm cursor-pointer font-medium text-xs sm:text-sm"
            title={language === 'hi' ? 'गीत कॉपी करें' : 'Copy lyrics'}
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4 text-muted-foreground" />
            )}
            <span>{copied ? t('copied') : (language === 'hi' ? 'कॉपी करें' : 'Copy')}</span>
          </button>
        </div>
      </div>

      {/* View toggle */}
      {lyricsTransliteration && (
        <div className="flex gap-2">
          <button
            onClick={() => setShowTransliteration(false)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !showTransliteration
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            {language === 'hi' ? 'केवल हिंदी' : 'Hindi Only'}
          </button>
          <button
            onClick={() => setShowTransliteration(true)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              showTransliteration
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            {language === 'hi' ? 'हिंदी + लिप्यंतरण' : 'Hindi + Transliteration'}
          </button>
        </div>
      )}

      {/* Lyrics display */}
      <div className="space-y-4">
        {resolvedImageUrl && (
          <div className="rounded-xl border border-border bg-card p-4">
            <img
              src={resolvedImageUrl}
              alt="Lyrics"
              className="w-full rounded-lg"
              loading="lazy"
            />
          </div>
        )}

        {/* Hindi lyrics */}
        {!hideLyricsText && (
          <div
            className="whitespace-pre-wrap leading-relaxed p-6 rounded-xl bg-muted/50 font-hindi break-words"
            style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
          >
            {lyricsHindi}
          </div>
        )}

        {hideLyricsText && !resolvedImageUrl && (
          <div className="p-6 rounded-xl bg-muted/50 text-muted-foreground">
            {language === 'hi' ? 'गीत पाठ अभी उपलब्ध नहीं है।' : 'Lyrics text is not available yet.'}
          </div>
        )}

        {/* Transliteration */}
        {showTransliteration && lyricsTransliteration && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {language === 'hi' ? 'लिप्यंतरण (अंग्रेज़ी)' : 'Transliteration (English)'}
            </p>
            <div
              className="whitespace-pre-wrap leading-relaxed p-6 rounded-xl bg-card border border-border/50 break-words"
              style={{ fontSize: `${fontSize * 0.9}px`, lineHeight: '1.8' }}
            >
              {lyricsTransliteration}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
