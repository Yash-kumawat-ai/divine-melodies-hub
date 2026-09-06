import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Copy,
  Check,
  Share2,
  Volume2,
  VolumeX,
  BookOpen,
  ChevronRight,
  User,
  ExternalLink,
  Play,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { GitaChatMessage } from '@/lib/geetaGyan/gitaChatEngine';
import { splitCounselingContent } from '@/lib/geetaGyan/askGitaChat';

interface GitaChatMessageBubbleProps {
  message: GitaChatMessage;
  isHindi: boolean;
  onSelectFollowUp?: (prompt: string) => void;
  onSpeak?: (text: string) => void;
  isSpeaking?: boolean;
}

export function GitaChatMessageBubble({
  message,
  isHindi,
  onSelectFollowUp,
  onSpeak,
  isSpeaking = false,
}: GitaChatMessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    let textToCopy = '';
    if (message.greeting) {
      textToCopy += `${message.greeting}\n\n`;
    }
    textToCopy += message.content;
    if (message.shloka) {
      textToCopy += `\n\n॥ श्रीमद्भगवद्गीता • अध्याय ${message.shloka.chapter}, श्लोक ${message.shloka.verse} ॥\n${message.shloka.sanskrit}\n\nअर्थ:\n${message.shloka.translation}`;
      if (message.shloka.coreTeaching) {
        textToCopy += `\n\nकृष्ण की सीख:\n${message.shloka.coreTeaching}`;
      }
    }
    if (message.structuredSteps && message.structuredSteps.length > 0) {
      textToCopy += `\n\nआज यह अभ्यास करें:\n${message.structuredSteps
        .map((s, i) => `${i + 1}. ${s.title}: ${s.action}`)
        .join('\n')}`;
    } else if (message.practicalSteps && message.practicalSteps.length > 0) {
      textToCopy += `\n\nआज यह अभ्यास करें:\n${message.practicalSteps
        .map((s, i) => `${i + 1}. ${s}`)
        .join('\n')}`;
    }
    textToCopy += '\n\n— गीता ज्ञान • Raghavam (https://raghavam.online/ask-gita)';

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success(isHindi ? 'संदेश कॉपी किया गया' : 'Message copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(isHindi ? 'कॉपी करने में त्रुटि' : 'Failed to copy');
    }
  };

  const handleWhatsAppShare = () => {
    let textToShare = message.greeting ? `${message.greeting}\n\n` : '';
    textToShare += message.content;
    if (message.shloka) {
      textToShare += `\n\n॥ श्रीमद्भगवद्गीता ${message.shloka.chapter}.${message.shloka.verse} ॥\n${message.shloka.sanskrit}\n\n${message.shloka.translation}`;
    }
    textToShare += '\n\nश्रीकृष्ण से संवाद करें: https://raghavam.online/ask-gita';

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(textToShare)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    let shareText = message.content;
    if (message.shloka) {
      shareText += `\n\n॥ श्रीमद्भगवद्गीता ${message.shloka.chapter}.${message.shloka.verse} ॥\n${message.shloka.sanskrit}\n\n${message.shloka.translation}`;
    }
    shareText += '\n\nमार्गदर्शन प्राप्त करें: https://raghavam.online/ask-gita';

    if (navigator.share) {
      try {
        await navigator.share({
          title: isHindi ? 'गीता ज्ञान • श्रीकृष्ण का मार्गदर्शन' : "Gita Gyan • Krishna's Guidance",
          text: shareText,
          url: 'https://raghavam.online/ask-gita',
        });
      } catch {
        // User cancelled or aborted
      }
    } else {
      handleCopy();
    }
  };

  // 1. User Message Layout (Clean warm bubble matching screenshot)
  if (isUser) {
    return (
      <div className="flex justify-end gap-2.5 my-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="max-w-[85%] sm:max-w-[75%] space-y-1">
          <div className="rounded-2xl rounded-tr-xs px-4 py-3 bg-[#4A3222] dark:bg-[#2C211A] text-white dark:text-[#F7EFE6] shadow-sm select-text">
            <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-normal">
              {message.content}
            </p>
          </div>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground text-right px-1">
            {message.timestamp}
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#4A3222]/10 dark:bg-amber-400/10 border border-[#EFE4D7] dark:border-zinc-800 flex items-center justify-center shrink-0 text-[#4A3222] dark:text-[#E8B15C] text-xs font-semibold mt-1">
          <User className="w-4 h-4" />
        </div>
      </div>
    );
  }

  // 2. Krishna Guidance Message Layout (Refined to match reference screenshot)
  const { shloka, structuredSteps, practicalSteps, followUps, greeting } = message;

  // Split message.content cleanly into:
  // 1. explanationText (Scripture explanation & personalized counsel)
  // 2. inlineSteps (3 Daily Practice steps)
  // 3. closingText (Closing blessing)
  const { explanationText, practicalSteps: inlineSteps, closingText } = React.useMemo(
    () => splitCounselingContent(message.content),
    [message.content]
  );

  // Active steps: single source of truth for daily practice steps
  const activeSteps = (structuredSteps && structuredSteps.length > 0)
    ? structuredSteps
    : (inlineSteps && inlineSteps.length > 0)
    ? inlineSteps
    : [];

  // When steps are extracted from content, display only clean explanation in body
  const textToDisplay = (inlineSteps && inlineSteps.length > 0)
    ? explanationText
    : message.content;

  return (
    <div className="flex justify-start gap-2.5 sm:gap-3 my-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Divine Krishna Avatar with halo */}
      <div className="relative shrink-0 mt-0.5">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-amber-100 to-[#FAF1E4] dark:from-[#2E2319] dark:to-[#1A140F] border border-amber-300/50 dark:border-amber-600/30 flex items-center justify-center shadow-xs ring-2 ring-amber-400/20">
          <span className="text-base select-none" role="img" aria-label="Shri Krishna">
            🪶
          </span>
        </div>
      </div>

      <div className="flex-1 max-w-[94%] sm:max-w-[88%] space-y-3.5 min-w-0">
        {/* Main Guidance Card */}
        <Card className="rounded-2xl border border-[#E9DFD3] dark:border-zinc-800/80 bg-white dark:bg-[#1A1410] shadow-xs overflow-hidden transition-colors">
          <CardContent className="p-4 sm:p-5 space-y-4">
            {/* Header: Avatar title + timestamp */}
            <div className="flex items-center justify-between gap-2 border-b border-[#EFE4D7]/70 dark:border-zinc-800/70 pb-3">
              <div>
                <h4 className="font-serif font-bold text-sm sm:text-base text-[#3A2216] dark:text-[#F3E5D4]">
                  {isHindi ? 'श्रीकृष्ण का मार्गदर्शन' : "Krishna's Guidance"}
                </h4>
                <p className="text-[11px] text-[#8C7A6B] dark:text-[#A8988A] tracking-tight">
                  {isHindi ? 'शाश्वत ज्ञान • आपके लिए' : 'Eternal Wisdom • For You'}
                </p>
              </div>

              <div className="text-[11px] text-muted-foreground whitespace-nowrap">
                {message.timestamp}
              </div>
            </div>

            {/* Greeting */}
            {greeting && (
              <p className="text-sm sm:text-base font-serif font-semibold text-[#7B2011] dark:text-[#E8B15C]">
                {greeting}
              </p>
            )}

            {/* 1. SCRIPTURE SECTION (Bhagavad Gita Verse directly from canonical DB) */}
            {shloka && (
              <div className="rounded-xl border border-[#E8DED1] dark:border-zinc-800/90 bg-[#FAF7F2] dark:bg-[#16100B] p-3.5 sm:p-4 space-y-3">
                {/* Scripture Title Bar */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#4A3222] dark:text-[#E8C59A]">
                    <BookOpen className="w-3.5 h-3.5 text-[#7B2011] dark:text-[#E8B15C] shrink-0" />
                    <span>
                      {isHindi
                        ? `श्रीमद्भगवद्गीता • अध्याय ${shloka.chapter}, श्लोक ${shloka.verse}`
                        : `Bhagavad Gita • Chapter ${shloka.chapter}, Verse ${shloka.verse}`}
                    </span>
                  </div>

                  <Link
                    to={shloka.topicId ? `/ask-gita/${shloka.topicId}` : '/ask-gita'}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[#7B2011] dark:text-[#E8B15C] hover:underline cursor-pointer"
                  >
                    <span>{isHindi ? 'विस्तार से देखें' : 'View full'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {/* Sanskrit Shloka Verse in Devanagari */}
                <div
                  className="font-devotional font-medium text-base sm:text-lg text-[#251810] dark:text-[#FBF6EE] tracking-wide leading-relaxed pl-1 select-text"
                  lang="sa"
                >
                  {shloka.sanskrit.split('\n').map((line, idx) => (
                    <p key={idx} className="my-0.5">
                      {line}
                    </p>
                  ))}
                </div>

                {/* Transliteration + Pronounce Audio Play Button */}
                {shloka.transliteration && (
                  <div className="flex items-center justify-between gap-2 pt-0.5 pl-1 border-t border-[#EFE4D7]/60 dark:border-zinc-800/60">
                    <p className="text-xs text-[#7A695C] dark:text-[#B39E8C] italic font-serif leading-relaxed select-text">
                      {shloka.transliteration}
                    </p>
                    {onSpeak && (
                      <button
                        type="button"
                        onClick={() => onSpeak(shloka.sanskrit)}
                        className="w-6 h-6 rounded-full bg-[#7B2011]/10 dark:bg-amber-400/10 hover:bg-[#7B2011]/20 flex items-center justify-center shrink-0 text-[#7B2011] dark:text-[#E8B15C] transition-colors cursor-pointer"
                        title={isHindi ? 'संस्कृत उच्चारण सुनें' : 'Listen to Sanskrit'}
                      >
                        <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                      </button>
                    )}
                  </div>
                )}

                {/* Verse Meaning */}
                <div className="space-y-1 pt-1">
                  <h5 className="text-xs font-bold text-[#7B2011] dark:text-[#E8B15C] tracking-wide">
                    {isHindi ? 'अर्थ:' : 'Meaning:'}
                  </h5>
                  <p className="text-xs sm:text-sm text-[#3A2C22] dark:text-[#DCD1C5] leading-relaxed select-text">
                    {shloka.parsedRange?.bodyText || shloka.translation}
                  </p>
                </div>

                {/* Krishna's Teaching Section */}
                {(shloka.coreTeaching || message.coreTeaching) && (
                  <div className="space-y-1 pt-1.5 border-t border-[#EFE4D7]/60 dark:border-zinc-800/60">
                    <h5 className="text-xs font-bold text-[#7B2011] dark:text-[#E8B15C] tracking-wide">
                      {isHindi ? 'कृष्ण की सीख:' : "Krishna's Teaching:"}
                    </h5>
                    <p className="text-xs sm:text-sm text-[#3A2C22] dark:text-[#DCD1C5] leading-relaxed select-text">
                      {shloka.coreTeaching || message.coreTeaching}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 2. EXPLANATION SECTION (Conversational Divine Guidance) */}
            {textToDisplay && (
              <div className="space-y-2.5 select-text">
                {textToDisplay.split('\n\n').map((para, i) => (
                  <p
                    key={i}
                    className="text-xs sm:text-sm leading-relaxed text-[#2B1E16] dark:text-[#EAE0D6] font-normal"
                  >
                    {para}
                  </p>
                ))}
              </div>
            )}

            {/* 3. PRACTICAL GUIDANCE SECTION (Single Section with 1, 2, 3 Badges) */}
            {activeSteps && activeSteps.length > 0 && (
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#3A2216] dark:text-[#F3E5D4]">
                  <span>🌱</span>
                  <span>{isHindi ? 'आज यह अभ्यास करें' : 'Try this today'}</span>
                </div>

                <div className="space-y-2">
                  {activeSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-[#2B1E16] dark:text-[#EAE0D6] leading-relaxed"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#7B2011]/10 dark:bg-amber-400/10 text-[#7B2011] dark:text-[#E8B15C] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <strong className="font-semibold text-foreground mr-1">
                          {step.title}
                        </strong>
                        <span>— {step.action}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Closing Blessing (if present) */}
            {closingText && (
              <p className="text-xs sm:text-sm italic font-serif text-[#7B2011] dark:text-[#E8B15C] pt-1 select-text">
                {closingText}
              </p>
            )}

            {/* Bottom Actions Bar (Recite, Copy, Share, WhatsApp) */}
            <div className="flex items-center justify-between gap-1 pt-2 border-t border-[#EFE4D7]/70 dark:border-zinc-800/70 text-xs">
              <div className="flex items-center flex-wrap gap-1">
                {onSpeak && (
                  <button
                    type="button"
                    onClick={() => onSpeak(message.content)}
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors cursor-pointer',
                      isSpeaking
                        ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40'
                        : 'text-[#6B5A4E] dark:text-[#B59F8B] hover:text-[#7B2011] dark:hover:text-[#E8B15C] hover:bg-[#FAF7F2] dark:hover:bg-zinc-800'
                    )}
                    title={isSpeaking ? 'ध्वनि रोकें' : 'पाठ सुनें'}
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                        <span>{isHindi ? 'रोकें' : 'Stop'}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-[#7B2011] dark:text-[#E8B15C]" />
                        <span>{isHindi ? 'सुनें' : 'Recite'}</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-[#6B5A4E] dark:text-[#B59F8B] hover:text-[#7B2011] dark:hover:text-[#E8B15C] hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="कॉपी करें"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isHindi ? 'कॉपी हुआ' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'कॉपी' : 'Copy'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-[#6B5A4E] dark:text-[#B59F8B] hover:text-[#7B2011] dark:hover:text-[#E8B15C] hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="साझा करें"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'शेयर' : 'Share'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer"
                  title="WhatsApp पर साझा करें"
                >
                  <span className="text-xs">💬</span>
                  <span>WhatsApp</span>
                </button>
              </div>

              <span className="text-[10px] text-muted-foreground/60 hidden sm:inline">
                राघवम्
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 🧭 Continue exploring (Stacked Cards with Chevrons matching Screenshot) */}
        {followUps && followUps.length > 0 && onSelectFollowUp && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8C7A6B] dark:text-[#A8988A]">
              <span>🧭</span>
              <span>{isHindi ? 'आगे विचार करें' : 'Continue exploring'}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5">
              {followUps.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectFollowUp(prompt)}
                  className="w-full text-left p-3 sm:p-3.5 rounded-xl border border-[#EAE0D4] dark:border-zinc-800/80 bg-white dark:bg-[#1E1710] hover:border-[#7B2011]/50 dark:hover:border-[#E8B15C]/60 hover:bg-[#FAF7F2] dark:hover:bg-[#251D16] transition-all flex items-center justify-between gap-3 group cursor-pointer shadow-2xs"
                >
                  <span className="text-xs sm:text-sm text-[#2B1E16] dark:text-[#EAE0D6] group-hover:text-[#7B2011] dark:group-hover:text-[#E8B15C] transition-colors leading-snug">
                    {prompt}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#8C7A6B] dark:text-[#B59F8B] group-hover:text-[#7B2011] dark:group-hover:text-[#E8B15C] group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

