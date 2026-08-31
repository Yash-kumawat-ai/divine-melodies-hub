import React, { useState, memo } from 'react';
import { Sparkles, Volume2, VolumeX, Copy, Check, Music, ArrowRight, Play, MessageSquarePlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { GuruJiMantraCard, GuruJiBhajanRec } from '@/lib/astrology/guruJiEngine';
import { toast } from 'sonner';
import omWhiteSvg from '@/pages/images/svg/om white.svg';

export interface GuruJiMessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  mantraCard?: GuruJiMantraCard;
  bhajanRec?: GuruJiBhajanRec;
  domain?: string;
  followUps?: string[];
}

interface GuruJiMessageCardProps {
  message: GuruJiMessageItem;
  isHi: boolean;
  isSpeaking: boolean;
  isLatestAssistant?: boolean;
  onSpeakToggle: (text: string, msgId: string) => void;
  onSelectFollowUp?: (query: string) => void;
}

const GuruJiMessageCardInner: React.FC<GuruJiMessageCardProps> = ({
  message,
  isHi,
  isSpeaking,
  isLatestAssistant,
  onSpeakToggle,
  onSelectFollowUp,
}) => {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast.success(isHi ? 'संदेश कॉपी हो गया।' : 'Message copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  if (message.role === 'user') {
    return (
      <div className="flex justify-end animate-in fade-in-50 slide-in-from-bottom-2">
        <div className="max-w-[85%] sm:max-w-xl rounded-2xl rounded-br-md bg-brand-primary text-primary-foreground px-4 py-3 shadow-xs space-y-1">
          <div className="flex items-center justify-between gap-2 text-[10px] opacity-80 font-medium">
            <span>{isHi ? 'आप' : 'You'}</span>
            <span>{message.timestamp}</span>
          </div>
          <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  // Guru Ji Assistant Message
  return (
    <div className="flex flex-col gap-2.5 items-start animate-in fade-in-50 slide-in-from-bottom-2">
      <div className="max-w-[92%] sm:max-w-2xl rounded-2xl rounded-bl-md bg-card border border-border p-4 sm:p-5 shadow-2xs space-y-3.5 text-foreground relative overflow-hidden w-full">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between gap-2 border-b border-border pb-2.5 text-[11px]">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 min-h-[28px] min-w-[28px] max-h-[28px] max-w-[28px] rounded-xl bg-gradient-brand flex items-center justify-center text-primary-foreground text-xs shadow-2xs border border-brand-gold/50 p-1 shrink-0 overflow-hidden">
              <img src={omWhiteSvg} alt="Om" className="h-full w-full max-h-full max-w-full object-contain aspect-square pointer-events-none select-none" />
            </div>
            <div>
              <p className="font-display font-bold text-brand-primary dark:text-amber-400 leading-tight">
                {isHi ? 'गुरु जी (वैदिक ज्योतिष मार्गदर्शन)' : 'Guru Ji (Vedic Guidance)'}
              </p>
              <span className="text-[10px] text-muted-foreground">{message.timestamp}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* TTS Audio Speak Button */}
            <button
              type="button"
              onClick={() => onSpeakToggle(message.content, message.id)}
              className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${
                isSpeaking
                  ? 'bg-brand-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-brand-primary hover:bg-[#651317]/10 dark:hover:bg-white/10'
              }`}
              title={isHi ? 'वाणी द्वारा सुनें' : 'Listen with Audio'}
            >
              {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-brand-primary hover:bg-[#651317]/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
              title={isHi ? 'कॉपी करें' : 'Copy'}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Message Content with Markdown-style readability */}
        <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans text-foreground/95 space-y-2">
          {message.content}
        </div>

        {/* Sacred Mantra Chant Card */}
        {message.mantraCard && (
          <div className="rounded-2xl bg-card border border-border p-4 shadow-2xs space-y-2.5 relative overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-brand-primary/10 text-brand-primary dark:text-amber-400 border border-brand-primary/20 inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {isHi ? 'कल्याणकारी सिद्ध मंत्र साधना' : 'Prescribed Mantra Sadhana'}
              </span>
              <span className="text-[11px] font-bold text-brand-primary dark:text-amber-400">
                108× {isHi ? 'जप' : 'Chants'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-background border border-border text-center space-y-1">
              <p className="font-display font-bold text-base sm:text-lg text-brand-primary dark:text-amber-400 select-all">
                {message.mantraCard.mantraHi || message.mantraCard.mantra}
              </p>
              {message.mantraCard.transliteration && (
                <p className="text-[11px] font-mono text-muted-foreground">
                  {message.mantraCard.transliteration}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <p className="text-[11px] text-muted-foreground">
                ⏰ {isHi ? message.mantraCard.timingHi : message.mantraCard.timing}
              </p>

              {message.mantraCard.japaSlug && (
                <Link
                  to={`/meditation/mantra-japa/${message.mantraCard.japaSlug}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-primary text-primary-foreground px-3.5 py-1.5 text-xs font-semibold hover:opacity-90 active:scale-95 transition-all shrink-0"
                >
                  <Play className="h-3 w-3 fill-current" />
                  <span>{isHi ? '108 जप शुरू करें' : 'Start 108 Japa'}</span>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Recommended Devotional Bhajan */}
        {message.bhajanRec && (
          <div className="rounded-xl bg-background border border-border p-3 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary dark:text-amber-400 shrink-0">
                <Music className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                  {isHi ? 'सुझाया गया भजन' : 'Recommended Bhajan'}
                </p>
                <p className="font-display font-bold text-xs sm:text-sm text-foreground truncate">
                  {message.bhajanRec.title}
                </p>
              </div>
            </div>

            <Link
              to={`/search?q=${encodeURIComponent(message.bhajanRec.searchQuery)}`}
              className="inline-flex items-center gap-1 rounded-xl border border-border bg-card hover:bg-[#651317]/10 dark:hover:bg-white/10 hover:text-brand-primary px-2.5 py-1.5 shrink-0 text-xs font-medium text-foreground transition-all"
            >
              <span>{isHi ? 'भजन सुनें' : 'Listen'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Dynamic Contextual Follow-Up Question Chips */}
      {isLatestAssistant && message.followUps && message.followUps.length > 0 && onSelectFollowUp && (
        <div className="flex items-center gap-1.5 flex-wrap pl-2 pt-1">
          <span className="text-[10px] font-semibold text-muted-foreground inline-flex items-center gap-1 mr-1">
            <MessageSquarePlus className="h-3 w-3 text-brand-primary dark:text-amber-400" />
            {isHi ? 'संबंधित प्रश्न:' : 'Suggested:'}
          </span>
          {message.followUps.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectFollowUp(chip)}
              className="text-xs px-3 py-1.5 rounded-full bg-card hover:bg-[#651317]/10 dark:hover:bg-white/10 border border-border hover:border-brand-primary text-foreground hover:text-brand-primary dark:hover:text-amber-300 transition-all duration-150 shadow-2xs active:scale-95 text-left"
            >
              {chip}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const GuruJiMessageCard = memo(GuruJiMessageCardInner);
