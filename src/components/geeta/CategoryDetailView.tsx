import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Compass,
  AlertCircle,
  RefreshCw,
  Languages,
  ChevronRight,
  Sparkles,
  MessageSquareQuote,
  Search,
  ArrowUp,
} from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';
import { CategoryVerseCard } from './CategoryVerseCard';
import { CategoryDetailSkeleton } from './AskGitaSkeleton';
import { fetchCategoryDetail, type CategoryDetail } from '@/lib/geetaGyan/askGitaApi';

interface CategoryDetailViewProps {
  categoryId: string;
  userQuery?: string;
  onBack: () => void;
  onAskFollowUp?: (newQuery: string) => void;
  activeLanguage: 'hi' | 'en';
  onToggleLanguage: () => void;
}

export function CategoryDetailView({
  categoryId,
  userQuery,
  onBack,
  onAskFollowUp,
  activeLanguage,
  onToggleLanguage,
}: CategoryDetailViewProps) {
  const [detail, setDetail] = useState<CategoryDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [followUpText, setFollowUpText] = useState<string>('');

  const isHindi = activeLanguage === 'hi';

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCategoryDetail(categoryId);
      setDetail(data);
    } catch (err: any) {
      console.error('Error fetching category detail:', err);
      setError(err?.message || 'Failed to load reflection');
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    loadData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [loadData]);

  const handleFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = followUpText.trim();
    if (!trimmed) return;
    if (onAskFollowUp) {
      onAskFollowUp(trimmed);
    } else {
      onBack();
    }
  };

  if (loading) {
    return <CategoryDetailSkeleton />;
  }

  if (error || !detail) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
        <div className="inline-flex p-4 rounded-full bg-destructive/10 text-destructive mb-2">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-semibold">
          {isHindi ? 'विवरण लोड करने में समस्या हुई' : 'Unable to load reflection'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isHindi
            ? 'कृपया अपना इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।'
            : 'Please check your internet connection and try again.'}
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            {isHindi ? 'वापस जाएँ' : 'Go Back'}
          </Button>
          <Button onClick={loadData} className="gap-2 bg-saffron hover:bg-saffron-dark text-white">
            <RefreshCw className="w-4 h-4" />
            {isHindi ? 'पुनः प्रयास करें' : 'Try Again'}
          </Button>
        </div>
      </div>
    );
  }

  const primaryVerse = detail.verses.find((v) => v.sort_order === 1) || detail.verses[0];
  const supportingVerses = detail.verses.filter((v) => v.sort_order > 1);

  const mainTitle = isHindi ? detail.title_hindi : detail.title_english;
  const secondaryTitle = isHindi ? detail.title_english : detail.title_hindi;

  return (
    <article className="max-w-3xl mx-auto space-y-6 sm:space-y-8 py-2 sm:py-6 animate-in fade-in duration-300">
      {/* 1. Navigation & Language Controls Bar */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 pl-1 sm:pl-2"
          aria-label={isHindi ? 'नया प्रश्न पूछें' : 'Ask another question'}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs sm:text-sm font-medium">
            {isHindi ? 'नया प्रश्न पूछें' : 'Ask another question'}
          </span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onToggleLanguage}
          className="h-8 gap-1.5 text-xs rounded-full border-border/80 hover:border-gold/60"
        >
          <Languages className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>{isHindi ? 'View in English' : 'हिन्दी में देखें'}</span>
        </Button>
      </div>

      {/* 2. User Query Reflection Bubble (When navigating from search) */}
      {userQuery && (
        <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-saffron/10 to-amber-500/5 border border-amber-500/25 shadow-sm space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
            <MessageSquareQuote className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>{isHindi ? 'आपने पूछा था' : 'You asked'}</span>
          </div>
          <p className="text-base sm:text-lg font-medium text-foreground italic pl-5 select-text leading-relaxed">
            &ldquo;{userQuery}&rdquo;
          </p>
        </div>
      )}

      {/* 3. Situation Header & Framing */}
      <header className="space-y-4 pb-4 border-b border-border/50">
        <div className="flex items-start gap-3.5 sm:gap-4">
          <CategoryIcon
            name={detail.icon_name}
            size={28}
            containerClassName="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl shadow-sm shrink-0 mt-0.5"
          />

          <div className="space-y-1 flex-1 min-w-0">
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{isHindi ? 'गीता दृष्टिकोण' : 'Gita Perspective'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
              {mainTitle}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              {secondaryTitle}
            </p>
          </div>
        </div>

        {/* Reverent situational framing banner */}
        <div className="rounded-xl px-4 py-3 bg-muted/40 border border-border/50 text-xs sm:text-sm text-muted-foreground flex items-center gap-2.5">
          <span className="text-amber-500 font-bold" aria-hidden="true">॥</span>
          <p className="font-medium leading-relaxed">
            {isHindi
              ? 'इस परिस्थिति से जुड़ा गीता का दृष्टिकोण — यह श्लोक चित्त को स्थिर और स्पष्टता प्रदान करने के लिए एक शाश्वत मार्ग दिखाते हैं।'
              : 'A Gita perspective for this situation — Timeless wisdom to bring clarity and stillness in the face of life’s dilemmas.'}
          </p>
        </div>
      </header>

      {/* 4. Primary Dominant Shloka Card */}
      {primaryVerse && (
        <section aria-labelledby="primary-verse-heading">
          <h2 id="primary-verse-heading" className="sr-only">
            {isHindi ? 'मुख्य श्लोक' : 'Primary Verse'}
          </h2>
          <CategoryVerseCard
            categoryVerse={primaryVerse}
            guidance={detail.guidance}
            activeLanguage={activeLanguage}
            isPrimary={true}
          />
        </section>
      )}

      {/* 5. Supporting Shlokas (More Verses to Reflect On) */}
      {supportingVerses.length > 0 && (
        <section aria-labelledby="supporting-verses-heading" className="space-y-4 pt-2">
          <div className="flex items-center gap-2 pb-1">
            <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h3
              id="supporting-verses-heading"
              className="text-base sm:text-lg font-semibold tracking-tight text-foreground"
            >
              {isHindi ? 'चिंतन के लिए अन्य श्लोक' : 'More verses to reflect on'}
            </h3>
          </div>

          <div className="space-y-5">
            {supportingVerses.map((cv) => (
              <CategoryVerseCard
                key={cv.verse.id}
                categoryVerse={cv}
                activeLanguage={activeLanguage}
                isPrimary={false}
              />
            ))}
          </div>
        </section>
      )}

      {/* 6. Follow-up Conversational Prompt Box */}
      <section
        className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm space-y-4"
        aria-labelledby="follow-up-heading"
      >
        <div className="space-y-1">
          <h4
            id="follow-up-heading"
            className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>
              {isHindi
                ? 'क्या मन में कोई अन्य विचार या दुविधा है?'
                : 'Still feeling unsettled or have another thought?'}
            </span>
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isHindi
              ? 'जो भी विचार आ रहा है, यहाँ लिखें या किसी अन्य परिस्थिति का दृष्टिकोण देखें:'
              : 'Type whatever feeling or dilemma comes to mind, or explore other reflections:'}
          </p>
        </div>

        <form onSubmit={handleFollowUpSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={followUpText}
              onChange={(e) => setFollowUpText(e.target.value)}
              placeholder={
                isHindi
                  ? 'कुछ और पूछें... (उदा. अशांत मन, निर्णय कैसे लें)'
                  : 'Ask about another thought... (e.g. overthinking, fear)'
              }
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-border/70 bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              aria-label={isHindi ? 'अन्य प्रश्न लिखें' : 'Type another query'}
            />
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={!followUpText.trim()}
            className="h-10 px-4 rounded-xl bg-saffron hover:bg-saffron-dark text-white gap-1.5 shadow-sm disabled:opacity-40"
          >
            <span>{isHindi ? 'पूछें' : 'Ask'}</span>
            <ArrowUp className="w-4 h-4" />
          </Button>
        </form>

        <div className="flex justify-center pt-2">
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="h-9 px-5 rounded-full border-border/80 hover:border-gold/60 gap-1.5 text-xs font-medium"
          >
            <span>{isHindi ? 'सभी 15 परिस्थितियाँ देखें' : 'View all 15 situations'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </section>

      {/* 7. Discreet Bottom Disclaimer Note */}
      <footer className="pt-4 border-t border-border/40 text-center">
        <p className="text-[11px] sm:text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {isHindi ? (
            <>
              <strong className="font-semibold text-foreground/80">चिंतन हेतु आवश्यक निवेदन:</strong>{' '}
              यह अनुभव जीवन की परिस्थितियों से जुड़े गीता के दृष्टिकोण को आत्म-चिंतन के लिए प्रस्तुत करता है। यह चिकित्सकीय, मानसिक स्वास्थ्य, कानूनी या वित्तीय सलाह का विकल्प नहीं है।
            </>
          ) : (
            <>
              <strong className="font-semibold text-foreground/80">A note on this reflection:</strong>{' '}
              These reflections connect selected Gita verses with common life situations for contemplation and spiritual grounding. They are not a substitute for professional medical, psychological, legal, or financial advice.
            </>
          )}
        </p>
      </footer>
    </article>
  );
}
