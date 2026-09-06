import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  ArrowUp,
  X,
  Languages,
  Mic,
  MicOff,
  Search,
  Compass,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';
import {
  matchProblemIntent,
  type ProblemCategory,
  type MatchResult,
} from '@/lib/geetaGyan/askGitaApi';

interface ConversationalInputProps {
  categories: ProblemCategory[];
  activeLanguage: 'hi' | 'en';
  onToggleLanguage: () => void;
  onSelectCategory: (categoryId: string, query?: string) => void;
  initialQuery?: string;
}

// Sample representative emotional prompts for 1-tap exploration
const CURATED_PROMPTS = [
  {
    categoryId: 'exam_failure',
    query_en: 'I am scared that I will fail my exams',
    query_hi: 'मुझे परीक्षा में फेल होने का डर लग रहा है',
    label_en: '🎓 Exam & Failure Fear',
    label_hi: '🎓 परीक्षा और असफलता का भय',
  },
  {
    categoryId: 'overthinking',
    query_en: 'I keep overthinking everything and cannot sleep',
    query_hi: 'मेरा मन बहुत अशांत है, लगातार सोचता रहता हूँ',
    label_en: '🧠 Overthinking & Anxiety',
    label_hi: '🧠 मन की अशांति और चिंता',
  },
  {
    categoryId: 'grief',
    query_en: 'I lost someone close to me and feel heartbroken',
    query_hi: 'मैंने अपने प्रियजन को खो दिया है, बहुत शोक में हूँ',
    label_en: '💔 Grief & Loss',
    label_hi: '💔 शोक और अपनों का वियोग',
  },
  {
    categoryId: 'career_confusion',
    query_en: 'I am confused about my career direction',
    query_hi: 'मुझे करियर और भविष्य को लेकर बहुत दुविधा है',
    label_en: '💼 Career & Life Path',
    label_hi: '💼 करियर और सही दिशा',
  },
  {
    categoryId: 'anger',
    query_en: 'I am angry with someone and want revenge',
    query_hi: 'मुझे बहुत गुस्सा आ रहा है और बदला लेने की इच्छा है',
    label_en: '🔥 Anger & Frustration',
    label_hi: '🔥 तीव्र क्रोध और अशांति',
  },
  {
    categoryId: 'loneliness',
    query_en: 'I feel completely alone and empty',
    query_hi: 'मैं बहुत अकेला महसूस कर रहा हूँ',
    label_en: '🕊️ Loneliness & Emptiness',
    label_hi: '🕊️ अकेलापन और सूनापन',
  },
];

export function ConversationalInput({
  categories,
  activeLanguage,
  onToggleLanguage,
  onSelectCategory,
  initialQuery = '',
}: ConversationalInputProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isListening, setIsListening] = useState(false);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);
  const [noMatchWarning, setNoMatchWarning] = useState(false);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isHindi = activeLanguage === 'hi';

  // Setup Web Speech API for voice recognition if available
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setHasSpeechSupport(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = isHindi ? 'hi-IN' : 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript || '';
        if (transcript) {
          setQuery(transcript);
          setNoMatchWarning(false);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [isHindi]);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = isHindi ? 'hi-IN' : 'en-US';
        recognitionRef.current.start();
        setIsListening(true);
        setNoMatchWarning(false);
      } catch (err) {
        console.warn('Speech recognition start failed:', err);
        setIsListening(false);
      }
    }
  };

  // Live semantic intent matching with categories
  const matchInfo = useMemo(() => {
    if (!query.trim() || categories.length === 0) {
      return { bestMatch: null, suggestions: [] as MatchResult[] };
    }
    return matchProblemIntent(query, categories);
  }, [query, categories]);

  const handleClear = () => {
    setQuery('');
    setNoMatchWarning(false);
    inputRef.current?.focus();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    if (matchInfo.bestMatch) {
      onSelectCategory(matchInfo.bestMatch.id, trimmed);
    } else if (matchInfo.suggestions.length > 0) {
      onSelectCategory(matchInfo.suggestions[0].category.id, trimmed);
    } else {
      // If no deterministic match found, alert user gently to select from categories
      setNoMatchWarning(true);
    }
  };

  const handleSelectSuggestedCategory = (category: ProblemCategory) => {
    onSelectCategory(category.id, query.trim() || undefined);
  };

  const handleSelectPrompt = (promptItem: (typeof CURATED_PROMPTS)[0]) => {
    const promptText = isHindi ? promptItem.query_hi : promptItem.query_en;
    setQuery(promptText);
    onSelectCategory(promptItem.categoryId, promptText);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Reverent Identity Header */}
      <header className="text-center space-y-3 pt-2 sm:pt-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-saffron/10 text-saffron-dark dark:text-amber-300 text-xs font-semibold tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>॥ श्रीमद्भगवद्गीता ॥</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground font-serif">
          {isHindi ? 'गीता समाधान' : 'Ask Gita'}
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground font-medium max-w-md mx-auto">
          {isHindi
            ? 'आज आपके मन को क्या व्याकुल कर रहा है?'
            : 'What is troubling your mind today?'}
        </p>

        {/* Language Switcher */}
        <div className="pt-1 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleLanguage}
            className="h-8 gap-1.5 text-xs rounded-full border-border/80 hover:border-gold/60 bg-card/60"
            aria-label="Toggle language"
          >
            <Languages className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{isHindi ? 'View in English' : 'हिन्दी में देखें'}</span>
          </Button>
        </div>
      </header>

      {/* 2. Conversational Input Card */}
      <div className="relative">
        <form
          onSubmit={handleSubmit}
          className="relative rounded-2xl sm:rounded-3xl border-2 border-border/80 bg-card shadow-lg hover:border-amber-500/50 focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/15 transition-all duration-300 p-2 sm:p-3"
        >
          <div className="flex items-center gap-2 pl-3 pr-1 py-1">
            <Search className="w-5 h-5 text-amber-600/70 dark:text-amber-400/70 shrink-0" />

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setNoMatchWarning(false);
              }}
              placeholder={
                isHindi
                  ? 'अपने मन की बात यहाँ लिखें... (उदा. परीक्षा का डर, अशांत मन)'
                  : 'Tell me what is troubling you... (e.g. fear of failing exams, overthinking)'
              }
              className="w-full bg-transparent border-0 text-foreground placeholder:text-muted-foreground/70 text-sm sm:text-base font-normal focus:outline-none focus:ring-0 py-2.5 px-1"
              aria-label={isHindi ? 'अपनी समस्या लिखें' : 'Type your problem'}
              autoFocus
            />

            {/* Clear button */}
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shrink-0"
                aria-label={isHindi ? 'साफ़ करें' : 'Clear input'}
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Voice input button if supported */}
            {hasSpeechSupport && (
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-2 rounded-full transition-all shrink-0 ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'text-muted-foreground hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                }`}
                title={
                  isListening
                    ? isHindi
                      ? 'सुनना बंद करें'
                      : 'Stop listening'
                    : isHindi
                    ? 'बोलकर लिखें'
                    : 'Speak your query'
                }
                aria-label={isListening ? 'Stop listening' : 'Voice input'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}

            {/* Submit Action Button */}
            <Button
              type="submit"
              size="icon"
              disabled={!query.trim()}
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-600 to-saffron hover:from-amber-700 hover:to-saffron-dark text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-transform active:scale-95 shrink-0"
              aria-label={isHindi ? 'गीता से मार्गदर्शन खोजें' : 'Seek Gita guidance'}
            >
              <ArrowUp className="w-5 h-5 font-bold" />
            </Button>
          </div>
        </form>

        {/* 3. Live Instant Match Chip (Surfaces while typing) */}
        {matchInfo.bestMatch && (
          <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <button
              type="button"
              onClick={() => handleSelectSuggestedCategory(matchInfo.bestMatch!)}
              className="w-full text-left group p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-saffron/10 to-amber-500/5 hover:from-amber-500/15 hover:to-amber-500/10 border border-amber-500/30 hover:border-amber-500/50 transition-all flex items-center justify-between gap-3 shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <CategoryIcon
                  name={matchInfo.bestMatch.icon_name}
                  size={20}
                  containerClassName="w-9 h-9 rounded-xl shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold tracking-wider uppercase text-amber-700 dark:text-amber-300">
                      {isHindi ? '💡 गीता दृष्टिकोण' : '💡 Gita Perspective'}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-foreground truncate group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                    {isHindi ? matchInfo.bestMatch.title_hindi : matchInfo.bestMatch.title_english}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 shrink-0 group-hover:translate-x-0.5 transition-transform">
                <span>{isHindi ? 'श्लोक देखें' : 'View Verses'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}

        {/* 4. No Match Warning Alert */}
        {noMatchWarning && !matchInfo.bestMatch && (
          <div className="mt-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-900 dark:text-amber-200 space-y-1 animate-in fade-in duration-200">
            <p className="font-semibold">
              {isHindi
                ? 'इस वाक्य के लिए सीधा मिलान नहीं मिला।'
                : 'No direct scriptural category match for this phrasing.'}
            </p>
            <p className="text-muted-foreground">
              {isHindi
                ? 'कृपया नीचे दी गई 15 परिस्थितियों में से अपनी स्थिति के निकटतम विषय को चुनें:'
                : 'Please select from the 15 curated life situations below that feels closest to your heart:'}
            </p>
          </div>
        )}
      </div>

      {/* 5. Natural Language Reassurance */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/90">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>
          {isHindi
            ? 'हिंदी, English या Hinglish में लिखें • सभी श्लोक प्रामाणिक हैं'
            : 'Type naturally in English, Hindi, or Hinglish • 100% Authentic Scripture'}
        </span>
      </div>

      {/* 6. Quick Prompts / Often Explored Dilemmas */}
      <section className="space-y-3" aria-labelledby="quick-prompts-heading">
        <div className="flex items-center justify-between">
          <h2
            id="quick-prompts-heading"
            className="text-xs font-semibold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-amber-500" />
            <span>{isHindi ? 'जिज्ञासु अक्सर पूछते हैं' : 'Often Explored by Seekers'}</span>
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {CURATED_PROMPTS.map((prompt) => (
            <Button
              key={prompt.categoryId}
              variant="outline"
              size="sm"
              onClick={() => handleSelectPrompt(prompt)}
              className="h-8 rounded-full text-xs border-border/80 hover:border-gold/60 hover:bg-amber-500/5 transition-all text-foreground/90"
            >
              {isHindi ? prompt.label_hi : prompt.label_en}
            </Button>
          ))}
        </div>
      </section>

      {/* 7. Divider: Or choose a situation */}
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-border/60" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-3 text-muted-foreground font-medium tracking-wider">
            {isHindi ? 'या कोई परिस्थिति चुनें' : 'or choose a situation'}
          </span>
        </div>
      </div>

      {/* 8. 15 Curated Life Situations (Compact, Touch-Optimized Cards) */}
      <section className="space-y-3" aria-label={isHindi ? 'जीवन की परिस्थितियाँ' : 'Life situations'}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {categories.map((cat) => {
            const titlePrimary = isHindi ? cat.title_hindi : cat.title_english;
            const titleSecondary = isHindi ? cat.title_english : cat.title_hindi;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className="group p-3 sm:p-3.5 rounded-2xl border border-border/70 bg-card hover:border-gold/60 hover:shadow-sm hover:bg-amber-500/[0.03] active:scale-[0.99] transition-all text-left flex items-center gap-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <CategoryIcon
                  name={cat.icon_name}
                  size={22}
                  containerClassName="w-10 h-10 rounded-xl shrink-0 group-hover:scale-105 transition-transform"
                />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold tracking-tight text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors line-clamp-1">
                    {titlePrimary}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1 font-medium">
                    {titleSecondary}
                  </p>
                </div>

                <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            );
          })}
        </div>
      </section>

      {/* 9. Dignified Footer Footnote */}
      <footer className="pt-6 pb-2 border-t border-border/40 text-center">
        <p className="text-[11px] sm:text-xs text-muted-foreground max-w-xl mx-auto leading-relaxed">
          {isHindi
            ? 'यह सेवा श्रीमद्भगवद्गीता के प्रमाणित श्लोकों और राघवम् मौलिक अनुवाद पर आधारित है। यहाँ कोई भी श्लोक AI द्वारा उत्पन्न नहीं किया गया है।'
            : 'Scriptures and translations are directly retrieved from authentic editions (Raghavam Original & Public Domain sources). No verses are AI-generated.'}
        </p>
      </footer>
    </div>
  );
}
