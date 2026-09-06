import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sparkles, Star, Copy, Check, Share2, BookOpen, Info } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { CategoryVerse, CategoryGuidance } from '@/lib/geetaGyan/askGitaApi';
import { getPreferredTranslation } from '@/lib/geetaGyan/askGitaApi';

export interface ParsedTranslationText {
  isRange: boolean;
  chapter?: number;
  startVerse?: number;
  endVerse?: number;
  rangeLabel?: string;
  cleanPrefix?: string;
  bodyText: string;
}

export function parseTranslationRange(rawText: string): ParsedTranslationText {
  if (!rawText) return { isRange: false, bodyText: '' };

  // Match range e.g. "।।2.62 -- 2.63।।", "|| 2.62 - 2.63 ||", "।।1.4 -- 1.6।। "
  const rangeRegex = /^(?:।।|\|\|)\s*(\d+)\.(\d+)\s*(?:--|-|–)\s*(?:\d+\.)?(\d+)\s*(?:।।|\|\|)\s*([\s\S]*)$/;
  const rangeMatch = rawText.trim().match(rangeRegex);

  if (rangeMatch) {
    const chapter = parseInt(rangeMatch[1], 10);
    const startVerse = parseInt(rangeMatch[2], 10);
    const endVerse = parseInt(rangeMatch[3], 10);
    const bodyText = rangeMatch[4].trim();

    return {
      isRange: true,
      chapter,
      startVerse,
      endVerse,
      rangeLabel: `${chapter}.${startVerse}–${chapter}.${endVerse}`,
      cleanPrefix: `॥ ${chapter}.${startVerse}–${chapter}.${endVerse} ॥`,
      bodyText,
    };
  }

  // Match single verse e.g. "।।2.62।।", "||1.1||"
  const singleRegex = /^(?:।।|\|\|)\s*(\d+)\.(\d+)\s*(?:।।|\|\|)\s*([\s\S]*)$/;
  const singleMatch = rawText.trim().match(singleRegex);

  if (singleMatch) {
    const chapter = parseInt(singleMatch[1], 10);
    const verseNum = parseInt(singleMatch[2], 10);
    const bodyText = singleMatch[3].trim();

    return {
      isRange: false,
      chapter,
      startVerse: verseNum,
      endVerse: verseNum,
      rangeLabel: `${chapter}.${verseNum}`,
      cleanPrefix: `॥ ${chapter}.${verseNum} ॥`,
      bodyText,
    };
  }

  // Plain text without danda markers
  return {
    isRange: false,
    bodyText: rawText.trim(),
  };
}

interface CategoryVerseCardProps {
  categoryVerse: CategoryVerse;
  guidance?: CategoryGuidance;
  activeLanguage: 'hi' | 'en';
  isPrimary?: boolean;
}

export function CategoryVerseCard({
  categoryVerse,
  guidance,
  activeLanguage,
  isPrimary = false,
}: CategoryVerseCardProps) {
  const [copied, setCopied] = useState(false);
  const { verse, sort_order } = categoryVerse;

  const translationInfo = getPreferredTranslation(verse.translations, activeLanguage);
  const parsedTranslation = parseTranslationRange(translationInfo.text);

  const isHindi = activeLanguage === 'hi';
  const citationText = isHindi
    ? `श्रीमद्भगवद्गीता • अध्याय ${verse.chapter_number}, श्लोक ${verse.verse_number}`
    : `Bhagavad Gita • Chapter ${verse.chapter_number}, Verse ${verse.verse_number}`;

  const guidanceText = isHindi ? guidance?.guidance_hindi : guidance?.guidance_english;

  const formattedTranslationText = parsedTranslation.cleanPrefix
    ? `${parsedTranslation.cleanPrefix} ${parsedTranslation.bodyText}`
    : parsedTranslation.bodyText;

  const translationAttribution = parsedTranslation.isRange
    ? (isHindi
        ? `कृष्ण का संदेश (${translationInfo.translatorName} • श्लोक ${parsedTranslation.startVerse}–${parsedTranslation.endVerse} संयुक्त अनुवाद)`
        : `Krishna's Teaching (${translationInfo.translatorName} • Combined Translation vv. ${parsedTranslation.startVerse}–${parsedTranslation.endVerse})`)
    : (isHindi
        ? `कृष्ण का संदेश (${translationInfo.translatorName})`
        : `Krishna's Teaching (${translationInfo.translatorName})`);

  const handleCopy = async () => {
    const textToCopy = `॥ ${citationText} ॥\n\n${verse.sanskrit}\n\n${
      verse.transliteration ? verse.transliteration + '\n\n' : ''
    }${translationAttribution}:\n"${formattedTranslationText}"\n\n${
      isPrimary && guidanceText
        ? (isHindi ? 'आज के जीवन में इसका अर्थ:\n' : 'Meaning in Today\'s Life:\n') + guidanceText + '\n\n'
        : ''
    }स्रोत: Raghavam (https://raghavam.online/ask-gita)`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success(isHindi ? 'श्लोक कॉपी किया गया' : 'Verse copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(isHindi ? 'कॉपी करने में त्रुटि' : 'Failed to copy');
    }
  };

  const handleWhatsAppShare = () => {
    const textToShare = `॥ ${citationText} ॥\n\n${verse.sanskrit}\n\n${
      verse.transliteration ? verse.transliteration + '\n\n' : ''
    }${translationAttribution}:\n"${formattedTranslationText}"\n\n${
      isPrimary && guidanceText
        ? (isHindi ? 'आज के जीवन में इसका अर्थ:\n' : 'Meaning in Today\'s Life:\n') + guidanceText + '\n\n'
        : ''
    }पढ़ें: https://raghavam.online/ask-gita`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(textToShare)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card
      className={cn(
        'transition-all duration-300 overflow-hidden relative',
        isPrimary
          ? 'border-2 border-saffron/30 dark:border-amber-500/30 bg-card shadow-lg hover:shadow-gold/20'
          : 'border border-border/70 bg-card/90 shadow-sm hover:border-gold/40'
      )}
    >
      {/* Top sacred accent bar for primary card */}
      {isPrimary && (
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-saffron to-amber-600" />
      )}

      <CardContent className="p-5 sm:p-7 space-y-6">
        {/* 1. Header: Citation Badge + Primary indicator + Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {isPrimary ? (
              <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 font-medium px-3 py-1 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-600 dark:text-amber-400" />
                {isHindi ? 'मुख्य श्लोक' : 'Primary Shloka'}
              </Badge>
            ) : (
              <Badge variant="outline" className="border-border/80 text-muted-foreground text-xs px-2.5 py-0.5">
                {isHindi ? `सहायक श्लोक #${sort_order}` : `Supporting Shloka #${sort_order}`}
              </Badge>
            )}

            <span className="text-xs sm:text-sm font-medium tracking-wide text-foreground/80">
              {citationText}
            </span>

            {parsedTranslation.isRange && (
              <Badge
                variant="outline"
                className="text-[11px] font-medium border-amber-500/40 text-amber-800 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5"
              >
                {isHindi
                  ? `अनुवाद: श्लोक ${parsedTranslation.startVerse}–${parsedTranslation.endVerse} (संयुक्त)`
                  : `Translation: vv. ${parsedTranslation.startVerse}–${parsedTranslation.endVerse} (Combined)`}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1 ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60"
              title={isHindi ? 'श्लोक कॉपी करें' : 'Copy verse'}
              aria-label={isHindi ? 'श्लोक कॉपी करें' : 'Copy verse'}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
                  <span className="text-xs">{isHindi ? 'कॉपी हुआ' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  <span className="text-xs">{isHindi ? 'कॉपी' : 'Copy'}</span>
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleWhatsAppShare}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              title="WhatsApp पर साझा करें"
              aria-label="Share on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5 mr-1" />
              <span className="text-xs">WhatsApp</span>
            </Button>
          </div>
        </div>

        {/* 2. Scripture: Sanskrit Text (Devanagari) + Transliteration */}
        <div className="space-y-3 py-1">
          <div
            className={cn(
              'font-devotional font-medium tracking-wide leading-relaxed text-foreground select-text',
              isPrimary ? 'text-xl sm:text-2xl md:text-[26px]' : 'text-lg sm:text-xl'
            )}
            style={{ fontFamily: 'var(--font-devotional)' }}
            lang="sa"
          >
            {verse.sanskrit.split('\n').map((line, i) => (
              <p key={i} className="my-1">
                {line}
              </p>
            ))}
          </div>

          {verse.transliteration && (
            <p className="text-xs sm:text-sm text-muted-foreground font-serif italic tracking-wide select-text">
              {verse.transliteration}
            </p>
          )}
        </div>

        {/* 3. Divider */}
        <Separator className="my-2 bg-border/60" />

        {/* 4. कृष्ण का संदेश + Translator Attribution Line + Verbatim Translation */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h4 className="text-sm sm:text-base font-semibold text-saffron-dark dark:text-amber-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              {isHindi ? 'कृष्ण का संदेश' : "Krishna's Teaching in this Verse"}
            </h4>

            <div className="flex flex-wrap items-center gap-1.5">
              {parsedTranslation.isRange && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                  {isHindi
                    ? `संयुक्त अनुवाद: श्लोक ${parsedTranslation.startVerse}–${parsedTranslation.endVerse}`
                    : `Combined Translation: vv. ${parsedTranslation.startVerse}–${parsedTranslation.endVerse}`}
                </span>
              )}

              {/* Explicit translator attribution line */}
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/40">
                {isHindi
                  ? `हिंदी अनुवाद • ${translationInfo.translatorName}`
                  : `English translation • ${translationInfo.translatorName}`}
              </span>
            </div>
          </div>

          <blockquote className="text-sm sm:text-base text-foreground/90 leading-relaxed pl-3 border-l-2 border-saffron/40 dark:border-amber-500/40 italic font-sans select-text">
            &ldquo;
            {parsedTranslation.cleanPrefix && (
              <strong className="font-serif font-bold not-italic mr-1.5 text-foreground">
                {parsedTranslation.cleanPrefix}
              </strong>
            )}
            {parsedTranslation.bodyText}
            &rdquo;
          </blockquote>

          {parsedTranslation.isRange && (
            <p className="text-[11px] sm:text-xs text-muted-foreground italic flex items-start gap-1.5 pt-0.5 leading-relaxed">
              <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                {isHindi
                  ? `नोट: श्लोक ${parsedTranslation.startVerse} और ${parsedTranslation.endVerse} व्याकरणिक रूप से अलग हैं, परंतु वैचारिक निरंतरता के कारण स्वामी रामसुखदास जी ने इनका एक संयुक्त अनुवाद प्रस्तुत किया है।`
                  : `Note: While verses ${parsedTranslation.startVerse} and ${parsedTranslation.endVerse} are grammatically distinct, Swami Ramsukhdas presents a unified translation to reflect their continuous conceptual progression.`}
              </span>
            </p>
          )}
        </div>

        {/* 5. Clear Visual Divider & 6. आज के जीवन में इसका अर्थ (Only on Primary Shloka) */}
        {isPrimary && guidanceText && (
          <div className="pt-2 space-y-4">
            {/* Visual distinct ornamental divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-amber-500/25 dark:border-amber-400/20" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-3 text-xs tracking-widest uppercase text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  {isHindi ? 'आत्म-चिंतन' : 'CONTEMPLATION'}
                </span>
              </div>
            </div>

            {/* Curated application container */}
            <div className="rounded-xl p-5 sm:p-6 bg-saffron/5 dark:bg-amber-500/10 border border-saffron/20 dark:border-amber-500/20 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-saffron-dark dark:text-amber-300">
                  <span className="text-base" role="img" aria-label="Diya">🪔</span>
                  <h4 className="text-base sm:text-lg font-semibold tracking-tight">
                    {isHindi ? 'आज के जीवन में इसका अर्थ' : "Meaning in Today's Life"}
                  </h4>
                </div>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-background/80 text-muted-foreground border border-border/50">
                  {isHindi ? 'राघवम् समसामयिक विचार • व्यावहारिक दृष्टिकोण' : 'Raghavam Reflection • Practical Application'}
                </span>
              </div>

              <p className="text-sm sm:text-base text-foreground/90 leading-relaxed font-sans select-text">
                {guidanceText}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
