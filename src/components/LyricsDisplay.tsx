import { useState } from 'react';
import { Copy, Check, ZoomIn, ZoomOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
        title: 'Copied!',
        description: 'Lyrics copied to clipboard',
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy lyrics',
        variant: 'destructive',
      });
    }
  };

  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 24));
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 12));

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex-1">
          <h3 className="hindi-text text-lg font-semibold text-foreground">{titleHindi}</h3>
          <p className="text-sm text-muted-foreground mt-1">by {singerName}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={decreaseFontSize}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border hover:bg-muted transition-colors"
            title="Decrease font size"
            aria-label="Decrease font size"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-muted-foreground px-2 py-1 rounded bg-muted">
            {fontSize}px
          </span>
          <button
            onClick={increaseFontSize}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border hover:bg-muted transition-colors"
            title="Increase font size"
            aria-label="Increase font size"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleCopyLyrics}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            title="Copy lyrics"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span className="text-sm">{copied ? 'Copied' : 'Copy'}</span>
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
            Hindi Only
          </button>
          <button
            onClick={() => setShowTransliteration(true)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              showTransliteration
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            Hindi + Transliteration
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
            Lyrics text is not available yet.
          </div>
        )}

        {/* Transliteration */}
        {showTransliteration && lyricsTransliteration && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Transliteration (English)
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
