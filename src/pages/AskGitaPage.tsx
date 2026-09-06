import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, Languages, BookOpen } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { useLanguage } from '@/hooks/useLanguage';
import { CategoryDetailView } from '@/components/geeta/CategoryDetailView';
import { GitaChatView } from '@/components/geeta/chat/GitaChatView';
import { CategoryGridSkeleton } from '@/components/geeta/AskGitaSkeleton';
import {
  fetchCategories,
  type ProblemCategory,
} from '@/lib/geetaGyan/askGitaApi';

export default function AskGitaPage() {
  const { categoryId: paramCategoryId } = useParams<{ categoryId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Track if chat is currently displaying active messages
  const [hasActiveChat, setHasActiveChat] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);

  // App-wide language hook
  const { language: appLanguage } = useLanguage();

  // Local language override toggle for scripture reading ('hi' | 'en')
  const [pageLang, setPageLang] = useState<'hi' | 'en'>(
    appLanguage === 'hi' ? 'hi' : 'en'
  );

  // Sync pageLang if appLanguage changes initially
  useEffect(() => {
    setPageLang(appLanguage === 'hi' ? 'hi' : 'en');
  }, [appLanguage]);

  // Support both /ask-gita/:categoryId and /ask-gita?category=...
  const activeCategoryId = paramCategoryId || searchParams.get('category') || null;
  const userQuery = searchParams.get('q') || undefined;

  const [categories, setCategories] = useState<ProblemCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isHindi = pageLang === 'hi';

  const toggleLanguage = () => {
    setPageLang((prev) => (prev === 'hi' ? 'en' : 'hi'));
  };

  const handleResetToTopics = useCallback(() => {
    setResetTrigger((prev) => prev + 1);
  }, []);

  const handleBack = useCallback(() => {
    if (activeCategoryId) {
      navigate('/ask-gita');
    } else if (hasActiveChat) {
      handleResetToTopics();
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  }, [activeCategoryId, hasActiveChat, handleResetToTopics, navigate]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCategories();
        if (isMounted) {
          setCategories(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to load categories');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleBackToSanctuary = useCallback(() => {
    navigate('/ask-gita');
  }, [navigate]);

  const handleAskFollowUp = useCallback(
    (newQuery: string) => {
      if (!newQuery.trim()) return;
      navigate(`/ask-gita?q=${encodeURIComponent(newQuery.trim())}`);
    },
    [navigate]
  );

  // Find active category metadata for dynamic SEO
  const activeCategoryMeta = useMemo(() => {
    if (!activeCategoryId) return null;
    return categories.find((c) => c.id === activeCategoryId) || null;
  }, [activeCategoryId, categories]);

  // Dynamic SEO Title & Description
  const seoTitle = activeCategoryMeta
    ? isHindi
      ? `${activeCategoryMeta.title_hindi} — गीता ज्ञान`
      : `${activeCategoryMeta.title_english} — Gita Gyan Guidance`
    : isHindi
    ? 'गीता ज्ञान — जीवन के सभी प्रश्नों और द्वंद्वों का सनातन समाधान'
    : 'Gita Gyan — Eternal Wisdom & Guidance from Bhagavad Gita';

  const seoDescription = activeCategoryMeta
    ? isHindi
      ? `जब आप '${activeCategoryMeta.title_hindi}' से गुजर रहे हों, तब श्रीमद्भगवद्गीता के मुख्य श्लोक और प्रासंगिक दृष्टिकोण से आत्म-चिंतन करें।`
      : `Explore timeless wisdom from the Bhagavad Gita for '${activeCategoryMeta.title_english}'. Authentic verses, verified translations, and contemplation for today.`
    : isHindi
    ? 'जीवन के 15 मुख्य विषयों और प्रश्नों के लिए श्रीकृष्ण संवाद एवं श्रीमद्भगवद्गीता के प्रमाणित श्लोक और व्यावहारिक समाधान।'
    : 'Explore timeless perspectives from the Bhagavad Gita for 15 real-life dilemmas: failure, grief, anger, anxiety, burnout, and purpose.';

  const canonicalUrl = activeCategoryId
    ? `https://raghavam.online/ask-gita/${activeCategoryId}`
    : 'https://raghavam.online/ask-gita';

  return (
    <div className="h-[100dvh] md:h-[calc(100dvh-4.5rem)] flex flex-col bg-background text-foreground overflow-hidden select-text">
      <SEO
        title={seoTitle}
        description={seoDescription}
        url={canonicalUrl}
        lang={isHindi ? 'hi' : 'en'}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: seoTitle,
          description: seoDescription,
          url: canonicalUrl,
          isPartOf: {
            '@type': 'WebSite',
            name: 'Raghavam',
            url: 'https://raghavam.online',
          },
        }}
      />

      {/* Top Dedicated App Header Bar */}
      <header className="shrink-0 border-b border-[#EFE4D7] dark:border-zinc-800 bg-white/95 dark:bg-[#1E1710]/95 backdrop-blur-md px-3 sm:px-6 py-2.5 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          {/* Back Navigation Button */}
          <button
            type="button"
            onClick={handleBack}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#651317]/8 dark:bg-amber-400/10 flex items-center justify-center text-[#6A2C2A] dark:text-[#E8B15C] hover:bg-[#651317]/15 dark:hover:bg-amber-400/20 active:scale-95 transition-all shrink-0 cursor-pointer shadow-2xs"
            title={isHindi ? 'वापस जाएं' : 'Go back'}
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>

          {/* Center Brand Identity / Title: "गीता ज्ञान" */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#651317]/8 dark:bg-amber-400/10 flex items-center justify-center text-sm shrink-0">
              <span role="img" aria-label="Peacock Feather">🪶</span>
            </div>
            <h1 className="font-serif font-bold text-base sm:text-lg text-foreground tracking-tight">
              {activeCategoryMeta
                ? isHindi
                  ? activeCategoryMeta.title_hindi
                  : activeCategoryMeta.title_english
                : (isHindi ? 'गीता ज्ञान' : 'Gita Gyan')}
            </h1>
          </div>

          {/* Right Action Tools: 'सभी विषय' (if in active chat) + Language Toggle */}
          <div className="flex items-center gap-2">
            {hasActiveChat && !activeCategoryId && (
              <button
                type="button"
                onClick={handleResetToTopics}
                className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-full border border-[#EFE4D7] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-900 text-[#6A2C2A] dark:text-[#E8B15C] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#651317]/10 dark:hover:bg-amber-400/10 transition-colors shrink-0 cursor-pointer shadow-2xs"
                title={isHindi ? 'सभी विषय देखें' : 'View all topics'}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">{isHindi ? 'सभी विषय' : 'Topics'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={toggleLanguage}
              className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-full border border-[#EFE4D7] dark:border-zinc-800 bg-[#FAF7F2] dark:bg-zinc-900 text-[#6A2C2A] dark:text-[#E8B15C] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#651317]/10 dark:hover:bg-amber-400/10 transition-colors shrink-0 cursor-pointer shadow-2xs"
              title={isHindi ? 'Switch to English' : 'हिन्दी में बदलें'}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{isHindi ? 'English' : 'हिन्दी'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden w-full">
        {activeCategoryId ? (
          <div className="flex-1 overflow-y-auto px-4 py-6 max-w-4xl mx-auto w-full">
            <CategoryDetailView
              categoryId={activeCategoryId}
              userQuery={userQuery}
              onBack={handleBackToSanctuary}
              onAskFollowUp={handleAskFollowUp}
              activeLanguage={pageLang}
              onToggleLanguage={toggleLanguage}
            />
          </div>
        ) : loading ? (
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-2xl md:max-w-5xl lg:max-w-6xl mx-auto w-full pt-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <CategoryGridSkeleton />
          </div>

        ) : error ? (
          <div className="flex-1 overflow-y-auto flex items-center justify-center p-6">
            <div className="text-center space-y-4 max-w-md mx-auto">
              <div className="inline-flex p-3 rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="gap-2"
              >
                {isHindi ? 'पुनः लोड करें' : 'Reload'}
              </Button>
            </div>
          </div>
        ) : (
          <GitaChatView
            activeLanguage={pageLang}
            onToggleLanguage={toggleLanguage}
            categories={categories}
            initialQuery={userQuery}
            onConversationChange={setHasActiveChat}
            resetTrigger={resetTrigger}
          />
        )}
      </main>
    </div>
  );
}
