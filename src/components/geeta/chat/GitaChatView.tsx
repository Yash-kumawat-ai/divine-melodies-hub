import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  RotateCcw,
  Sparkles,
  BookOpen,
  ChevronRight,
  Loader2,
  Flame,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { TextToSpeech } from '@/lib/voiceUtils';
import { GitaQuotaBanner } from './GitaQuotaBanner';
import { GitaChatMessageBubble } from './GitaChatMessageBubble';
import { GitaChatInputBar } from './GitaChatInputBar';
import { CategoryIcon } from '../CategoryIcon';
import krishnaLandscape from '@/pages/images/krishna_landscape.webp';
import {
  generateKrishnaResponse,
  getDailyGitaQuota,
  incrementDailyGitaQuota,
  type GitaChatMessage,
  type DailyQuotaStatus,
} from '@/lib/geetaGyan/gitaChatEngine';
import { streamAskGitaChat } from '@/lib/geetaGyan/askGitaChat';
import type { ProblemCategory } from '@/lib/geetaGyan/askGitaApi';
import { cn } from '@/lib/utils';

const CHAT_STORAGE_KEY = 'raghavam_gita_chat_history';
const USERNAME_STORAGE_KEY = 'raghavam_gita_chat_username';

const POPULAR_TOPICS = [
  {
    id: 'overthinking',
    labelHi: 'अशांत मन',
    labelEn: 'Overthinking',
    queryHi: 'मेरा मन बहुत अशांत है, लगातार नकारात्मक विचार आते हैं।',
    queryEn: 'My mind is racing with overthinking and negative thoughts.',
  },
  {
    id: 'career',
    labelHi: 'करियर',
    labelEn: 'Career',
    queryHi: 'मुझे करियर और भविष्य को लेकर बहुत दुविधा है, क्या सही मार्ग है?',
    queryEn: 'I feel confused and lost about my career and future direction.',
  },
  {
    id: 'relationships',
    labelHi: 'संबंध',
    labelEn: 'Relationships',
    queryHi: 'रिश्तों में बहुत तनाव और अपेक्षाएं हैं, मन दुखी रहता है।',
    queryEn: 'I am struggling with expectations and heartbreak in relationships.',
  },
  {
    id: 'fear',
    labelHi: 'भय',
    labelEn: 'Fear',
    queryHi: 'मुझे असफलता और अज्ञात का बहुत भय सताता है।',
    queryEn: 'I have immense fear of failure and the unknown.',
  },
  {
    id: 'anger',
    labelHi: 'क्रोध',
    labelEn: 'Anger',
    queryHi: 'मुझे बहुत जल्दी क्रोध आ जाता है, इसे कैसे शांत करूँ?',
    queryEn: 'I get overwhelmed by anger and lose my peace. How do I calm it?',
  },
  {
    id: 'purpose',
    labelHi: 'उद्देश्य',
    labelEn: 'Purpose',
    queryHi: 'मेरे जीवन का वास्तविक उद्देश्य और धर्म क्या है?',
    queryEn: 'What is my true purpose and dharma in this life?',
  },
  {
    id: 'anxiety',
    labelHi: 'तनाव',
    labelEn: 'Anxiety',
    queryHi: 'लगातार चिंता और घबराहट रहती है, शांति नहीं मिलती।',
    queryEn: 'I feel constant anxiety and restlessness in my heart.',
  },
];


const CURATED_PROMPTS = [
  {
    id: 'exam_failure',
    labelHi: '🎓 परीक्षा और असफलता का भय',
    labelEn: '🎓 Exam & Failure Fear',
    queryHi: 'मुझे परीक्षा में फेल होने का डर लग रहा है, मन बहुत घबरा रहा है।',
    queryEn: 'I am scared that I will fail my exams and feel anxious.',
  },
  {
    id: 'overthinking',
    labelHi: '🧠 मन की अशांति और चिंता',
    labelEn: '🧠 Overthinking & Anxiety',
    queryHi: 'मेरा मन बहुत अशांत है, लगातार नकारात्मक विचार आते रहते हैं।',
    queryEn: 'My mind is racing with overthinking and I cannot find peace.',
  },
  {
    id: 'grief',
    labelHi: '💔 शोक और अपनों का वियोग',
    labelEn: '💔 Grief & Loss',
    queryHi: 'मैंने अपने प्रियजन को खो दिया है, बहुत शोक और कष्ट में हूँ।',
    queryEn: 'I lost someone close to me and feel heartbroken with grief.',
  },
  {
    id: 'career_confusion',
    labelHi: '💼 करियर और सही दिशा',
    labelEn: '💼 Career & Life Path',
    queryHi: 'मुझे करियर और भविष्य को लेकर बहुत दुविधा है, क्या सही मार्ग है?',
    queryEn: 'I feel lost about my career and life direction. What should I do?',
  },
  {
    id: 'anger',
    labelHi: '🔥 तीव्र क्रोध और अशांति',
    labelEn: '🔥 Anger & Frustration',
    queryHi: 'मुझे बहुत जल्दी गुस्सा आ जाता है और विवेक खो देता हूँ। क्रोध कैसे शांत करूँ?',
    queryEn: 'I get triggered by sudden anger and lose my self-control. How do I calm it?',
  },
  {
    id: 'loneliness',
    labelHi: '🕊️ अकेलापन और सूनापन',
    labelEn: '🕊️ Loneliness & Emptiness',
    queryHi: 'जीवन में बहुत अकेलापन महसूस होता है। कोई अपना नहीं लगता।',
    queryEn: 'I feel completely alone and emotionally empty.',
  },
  {
    id: 'laziness',
    labelHi: '⌛ आलस्य और टालमटोल',
    labelEn: '⌛ Procrastination & Inertia',
    queryHi: 'काम करने का मन नहीं करता, बस टालता रहता हूँ। आलस्य कैसे मिटाऊं?',
    queryEn: 'I keep procrastinating on important duties. How do I overcome inertia?',
  },
  {
    id: 'burnout',
    labelHi: '🔋 मानसिक व शारीरिक थकान',
    labelEn: '🔋 Burnout & Fatigue',
    queryHi: 'जिम्मेदारियों से मन और शरीर बहुत थक गया है, ऊर्जा समाप्त हो चुकी है।',
    queryEn: 'I feel completely burned out and exhausted from life pressures.',
  },
];

interface GitaChatViewProps {
  activeLanguage: 'hi' | 'en';
  onToggleLanguage: () => void;
  categories: ProblemCategory[];
  initialQuery?: string;
  onConversationChange?: (hasMessages: boolean) => void;
  resetTrigger?: number;
}

export function GitaChatView({
  activeLanguage,
  onToggleLanguage,
  categories,
  initialQuery,
  onConversationChange,
  resetTrigger,
}: GitaChatViewProps) {
  const { user, profile } = useAuth();
  const isHindi = activeLanguage === 'hi';

  // Determine user name
  const defaultName = profile?.name || user?.user_metadata?.full_name || '';
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem(USERNAME_STORAGE_KEY) || defaultName;
  });

  useEffect(() => {
    if (defaultName && !localStorage.getItem(USERNAME_STORAGE_KEY)) {
      setUserName(defaultName);
    }
  }, [defaultName]);

  const handleUpdateUserName = useCallback((newName: string) => {
    setUserName(newName);
    localStorage.setItem(USERNAME_STORAGE_KEY, newName);
  }, []);

  // Messages & Quota State
  const [messages, setMessages] = useState<GitaChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Notify parent of conversation status
  useEffect(() => {
    onConversationChange?.(messages.length > 0);
  }, [messages.length, onConversationChange]);

  const [quota, setQuota] = useState<DailyQuotaStatus>(() =>
    getDailyGitaQuota(Boolean(user))
  );
  const [isLoading, setIsLoading] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const landingScrollRef = useRef<HTMLDivElement>(null);
  const ttsRef = useRef<TextToSpeech | null>(null);

  const isInitialMountRef = useRef(true);
  const prevMessageCountRef = useRef(messages.length);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    if (landingScrollRef.current) {
      landingScrollRef.current.scrollTop = 0;
    }
  }, []);

  // Initialize TTS
  useEffect(() => {
    ttsRef.current = new TextToSpeech();
    return () => {
      ttsRef.current?.stop();
    };
  }, []);

  const [showAllSituations, setShowAllSituations] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const handleChatScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setShowScrollTop(target.scrollTop > 150);
    const isNearBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight < 120;
    setShowScrollBottom(!isNearBottom);
  };

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Save messages
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);


  // Handle parent reset trigger
  useEffect(() => {
    if (resetTrigger && resetTrigger > 0) {
      ttsRef.current?.stop();
      setSpeakingMsgId(null);
      setMessages([]);
      localStorage.removeItem(CHAT_STORAGE_KEY);
      window.scrollTo({ top: 0, behavior: 'instant' });
      if (landingScrollRef.current) landingScrollRef.current.scrollTop = 0;
    }
  }, [resetTrigger]);

  // Only auto-scroll to bottom when a NEW message is actively added
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      prevMessageCountRef.current = messages.length;
      return;
    }

    if (messages.length > prevMessageCountRef.current || isLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length, isLoading]);

  // Handle TTS Speaking
  const handleSpeak = useCallback(
    (text: string, msgId: string) => {
      if (!ttsRef.current) return;

      if (speakingMsgId === msgId) {
        ttsRef.current.stop();
        setSpeakingMsgId(null);
        return;
      }

      ttsRef.current.stop();
      setSpeakingMsgId(msgId);

      ttsRef.current.speak(text, {
        lang: isHindi ? 'hi-IN' : 'en-US',
        rate: 0.95,
        pitch: 1.0,
        onEnd: () => setSpeakingMsgId(null),
        onError: () => setSpeakingMsgId(null),
      });
    },
    [isHindi, speakingMsgId]
  );

  // Send Message Logic (Instant, Authentic, Zero Fake Delays)
  const handleSendMessage = useCallback(
    async (queryText: string) => {
      const query = queryText.trim();
      if (!query || isLoading) return;

      // 1. Check daily quota
      const currentQuota = getDailyGitaQuota(Boolean(user));
      if (currentQuota.isExhausted) {
        toast.error(
          isHindi
            ? 'आपकी आज की संदेश सीमा पूर्ण हो चुकी है। कृपया मध्यरात्रि रीसेट के पश्चात प्रयास करें।'
            : 'Daily message quota exhausted. Please check back after midnight reset.'
        );
        return;
      }

      // 2. Add user message and empty streaming assistant placeholder
      const now = new Date();
      const userMsg: GitaChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: query,
        timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const streamingMsgId = `krishna-${Date.now()}`;
      const cleanName = (userName || '').trim() || (isHindi ? 'प्रिय मित्र' : 'Dear Friend');
      const initialAssistantMsg: GitaChatMessage = {
        id: streamingMsgId,
        role: 'assistant',
        greeting: isHindi ? `प्रिय ${cleanName},` : `Dear ${cleanName},`,
        content: '',
        timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMsg, initialAssistantMsg]);
      setIsLoading(true);

      // 3. Decrement quota
      incrementDailyGitaQuota(Boolean(user));
      setQuota(getDailyGitaQuota(Boolean(user)));

      try {
        await streamAskGitaChat({
          userQuery: query,
          userName: userName || undefined,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          preferredLanguage: activeLanguage,
          onDelta: (delta) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === streamingMsgId ? { ...m, content: m.content + delta } : m))
            );
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          },
          onShloka: (shloka) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === streamingMsgId ? { ...m, shloka } : m))
            );
          },
          onDone: (finalMsg) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === streamingMsgId ? { ...finalMsg, id: streamingMsgId } : m))
            );
            setIsLoading(false);
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          },
          onError: (err) => {
            console.warn('[GitaChatView] Streaming issue (fallback handled):', err);
          },
        });
      } catch (err) {
        console.error('Error generating response:', err);
        toast.error(
          isHindi
            ? 'मार्गदर्शन प्राप्त करने में कुछ कठिनाई हुई। पुनः प्रयास करें।'
            : 'Failed to generate guidance. Please try again.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [activeLanguage, isHindi, isLoading, messages, user, userName]
  );

  // Trigger initial query if passed via route/search param
  useEffect(() => {
    if (initialQuery && initialQuery.trim() && messages.length === 0) {
      handleSendMessage(initialQuery.trim());
    }
  }, [initialQuery, handleSendMessage, messages.length]);

  // Reset to 15 Topics Overview
  const handleBackToTopics = useCallback(() => {
    ttsRef.current?.stop();
    setSpeakingMsgId(null);
    setMessages([]);
    localStorage.removeItem(CHAT_STORAGE_KEY);
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (landingScrollRef.current) landingScrollRef.current.scrollTop = 0;
  }, []);

  // Clear Chat / Start fresh
  const handleNewChat = useCallback(() => {
    handleBackToTopics();
    toast.success(isHindi ? 'नया संवाद सत्र प्रारंभ हुआ।' : 'New conversation started.');
  }, [handleBackToTopics, isHindi]);

  return (
    <div className="w-full h-full flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* 1. Daily Message Quota Ribbon */}
      <div className="shrink-0 max-w-3xl md:max-w-5xl lg:max-w-6xl mx-auto w-full px-2 sm:px-4">
        <GitaQuotaBanner quota={quota} isHindi={isHindi} />
      </div>

      {/* ========================================================================= */}
      {/* A. LANDING VIEW (When messages.length === 0): Hero artwork + Quote + Topics */}
      {/* ========================================================================= */}
      {messages.length === 0 ? (
        <div
          ref={landingScrollRef}
          className="relative flex-1 min-h-0 overflow-y-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-7 space-y-6 sm:space-y-8 max-w-2xl md:max-w-5xl lg:max-w-6xl mx-auto w-full animate-in fade-in duration-300 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* Panoramic Ambient Fade Artwork of Lord Krishna (Expansive on desktop) */}
          <div className="absolute -top-4 -left-6 -right-6 md:-left-12 md:-right-12 h-64 sm:h-72 md:h-80 lg:h-96 pointer-events-none overflow-hidden select-none -z-0 opacity-35 dark:opacity-25 transition-all">
            <img
              src={krishnaLandscape}
              alt="Shri Krishna"
              className="w-full h-full object-cover object-[center_top] md:object-[center_20%] [mask-image:radial-gradient(ellipse_at_top,black_45%,transparent_85%)] md:[mask-image:radial-gradient(ellipse_at_center_top,black_50%,transparent_90%)]"
            />
          </div>

          {/* 1. Reverent Identity Hero Header */}
          <header className="relative z-10 text-center space-y-2 pt-2 sm:pt-4 md:pt-6">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#7B2011]/8 dark:bg-amber-400/10 text-[#7B2011] dark:text-[#E8B15C] text-xs sm:text-sm font-semibold tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
              <span>॥ श्रीमद्भगवद्गीता ॥</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#2B1B10] dark:text-[#F8EFE6] font-serif">
              {isHindi ? 'गीता ज्ञान' : 'Gita Gyan'}
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-[#7A695C] dark:text-[#A8988A] font-medium tracking-wide max-w-xl mx-auto">
              {isHindi
                ? 'स्पष्टता प्राप्त करें। उद्देश्य के साथ जिएं।'
                : 'Find clarity. Live with purpose.'}
            </p>
          </header>

          {/* 2. Hero Search Bar (Big, Centered, Majestic on desktop) */}
          <section className="relative z-10 w-full max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto" aria-label="Ask Shri Krishna">
            <GitaChatInputBar
              variant="hero"
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              isHindi={isHindi}
              userName={userName}
              onUpdateUserName={handleUpdateUserName}
              isQuotaExhausted={quota.isExhausted}
              autoFocus={true}
            />
          </section>

          {/* 3. Sacred Quote Card (Expansive and Serene on desktop) */}
          <div className="relative z-10 p-4 sm:p-5 rounded-2xl bg-[#FAF6F0]/90 dark:bg-[#1E1710]/90 border border-[#EBE1D5] dark:border-zinc-800 text-center shadow-2xs max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto w-full">
            <p className="font-serif italic text-xs sm:text-sm md:text-base text-[#4A3222] dark:text-[#E8C59A] leading-relaxed">
              {isHindi
                ? '“जब भी मन में संशय या द्वंद्व हो, गीता की शरण लें।”'
                : '“Whenever you are in doubt, turn to the Gita.”'}
            </p>
            <p className="text-[11px] sm:text-xs font-semibold text-[#7B2011] dark:text-[#E8B15C] mt-1.5 tracking-wider">
              — {isHindi ? 'श्रीकृष्ण' : 'Shri Krishna'}
            </p>
          </div>

          {/* 4. 🔥 Popular Right Now */}
          <section className="relative z-10 space-y-3 max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto w-full" aria-labelledby="popular-heading">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#7B2011] dark:text-[#E8B15C]">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500/20" />
              <span id="popular-heading">
                {isHindi ? 'अभी सबसे लोकप्रिय' : 'Popular Right Now'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-2.5">
              {POPULAR_TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() =>
                    handleSendMessage(isHindi ? topic.queryHi : topic.queryEn)
                  }
                  className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium border border-[#E8DED1] dark:border-zinc-800 bg-white dark:bg-[#1E1710] hover:border-[#7B2011]/60 dark:hover:border-[#E8B15C]/60 hover:bg-[#FAF7F2] dark:hover:bg-zinc-800 text-[#3A281E] dark:text-[#EAE0D6] hover:text-[#7B2011] dark:hover:text-[#E8B15C] transition-all shadow-2xs cursor-pointer active:scale-95"
                >
                  {isHindi ? topic.labelHi : topic.labelEn}
                </button>
              ))}
            </div>
          </section>

          {/* 5. 📖 Start with a situation (Responsive 3-4 column grid on desktop, 4-card toggle on mobile) */}
          <section
            className="relative z-10 space-y-3.5 w-full"
            aria-label={isHindi ? 'किसी परिस्थिति से प्रारंभ करें' : 'Start with a situation'}
          >
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#4A3222] dark:text-[#DCD1C5]">
              <BookOpen className="w-4 h-4 text-[#7B2011] dark:text-[#E8B15C]" />
              <span>
                {isHindi ? 'जीवन की परिस्थितियाँ' : 'Explore by Life Situation'}
              </span>
            </div>

            {/* Situations Grid: On desktop (md:) displays all categories across 3-4 columns; on mobile defaults to 4 cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5 md:gap-4">
              {categories.map((cat, idx) => {
                const titlePrimary = isHindi ? cat.title_hindi : cat.title_english;
                const titleSecondary = isHindi ? cat.title_english : cat.title_hindi;
                const isHiddenOnMobile = !showAllSituations && idx >= 4;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSendMessage(titlePrimary)}
                    className={cn(
                      'group p-3.5 sm:p-4 rounded-2xl border border-[#EFE4D7] dark:border-zinc-800 bg-card hover:border-[#7B2011]/60 dark:hover:border-[#E8B15C]/60 hover:shadow-md hover:-translate-y-0.5 hover:bg-[#7B2011]/[0.02] dark:hover:bg-amber-400/[0.03] active:scale-[0.99] transition-all text-left flex items-center gap-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer shadow-2xs',
                      isHiddenOnMobile && 'hidden md:flex'
                    )}
                  >
                    <CategoryIcon
                      name={cat.icon_name}
                      size={22}
                      containerClassName="w-10 h-10 sm:w-11 sm:h-11 rounded-xl shrink-0 group-hover:scale-105 transition-transform"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold tracking-tight text-foreground group-hover:text-[#7B2011] dark:group-hover:text-[#E8B15C] transition-colors line-clamp-1">
                        {titlePrimary}
                      </p>
                      <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-1 font-medium">
                        {titleSecondary}
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-[#7B2011] dark:group-hover:text-[#E8B15C] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                );
              })}
            </div>

            {/* Mobile-Only View All / Fewer Situations Toggle (Hidden on desktop md:) */}
            {categories.length > 4 && (
              <div className="block md:hidden">
                <button
                  type="button"
                  onClick={() => setShowAllSituations((prev) => !prev)}
                  className="w-full py-2.5 px-4 rounded-xl border border-[#E8DED1] dark:border-zinc-800 bg-white/70 dark:bg-[#1E1710]/70 hover:bg-[#FAF7F2] dark:hover:bg-zinc-800/70 text-xs font-semibold text-[#7B2011] dark:text-[#E8B15C] flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                >
                  {showAllSituations ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'कम परिस्थितियाँ दिखाएं' : 'Show fewer situations'}</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span>
                        {isHindi
                          ? `⊞ सभी ${categories.length} परिस्थितियाँ देखें`
                          : `⊞ View all ${categories.length} situations`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </section>

          {/* 6. Calm Reassurance Banner (Expansive on desktop) */}
          <div className="relative z-10 rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-[#FAF4ED] to-[#F5EEE4] dark:from-[#1C1610] dark:to-[#17120C] border border-[#EBE0D2] dark:border-zinc-800 text-center space-y-1 max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto w-full">
            <p className="text-xs sm:text-sm md:text-base font-serif font-medium text-[#4A3222] dark:text-[#E8C59A]">
              {isHindi
                ? 'शांत और स्पष्ट मन की दिशा में एक कदम बढ़ाएं।'
                : 'Take one step towards a calmer, clearer you.'}
            </p>
            <p className="text-[11px] sm:text-xs text-[#8C7A6B] dark:text-[#A8988A]">
              {isHindi
                ? 'श्रीमद्भगवद्गीता के 700 श्लोकों का शाश्वत मार्गदर्शन'
                : 'Timeless guidance distilled from 700 verses of the Bhagavad Gita'}
            </p>
          </div>

          {/* 7. Dignified Scripture Authenticity Footnote */}
          <footer className="pt-2 pb-8 border-t border-[#EFE4D7]/70 dark:border-zinc-800/70 text-center max-w-3xl mx-auto w-full">
            <p className="text-[11px] sm:text-xs text-muted-foreground max-w-xl mx-auto leading-relaxed">
              {isHindi
                ? 'यह सेवा श्रीमद्भगवद्गीता के प्रमाणित श्लोकों और राघवम् मौलिक अनुवाद पर आधारित है। यहाँ कोई भी श्लोक AI द्वारा उत्पन्न नहीं किया गया है।'
                : 'Scriptures and translations are directly retrieved from authentic editions (Raghavam Original & Public Domain sources). No verses are AI-generated.'}
            </p>
          </footer>
        </div>
      ) : (
        /* ========================================================================= */
        /* B. CONVERSATION VIEW (When messages.length > 0): Clean Stream & Sticky Dock */
        /* ========================================================================= */
        <div className="relative flex-1 min-h-0 flex flex-col max-w-4xl lg:max-w-5xl mx-auto w-full overflow-hidden">
          {/* Sub-Header Toolbar in Active Conversation */}
          <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-2 border-b border-[#EFE4D7] dark:border-zinc-800 bg-white/70 dark:bg-[#1E1710]/70 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-[#FAF1E4] dark:from-[#2E2319] dark:to-[#1A140F] border border-amber-300/50 dark:border-amber-600/30 flex items-center justify-center text-sm shadow-2xs">
                <span>🪶</span>
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-semibold text-foreground font-serif leading-tight">
                  {isHindi ? 'श्रीकृष्ण संवाद' : 'Shri Krishna Samvad'}
                </h2>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground">
                  {isHindi ? 'सनातन विवेक • व्यक्तिगत मार्गदर्शन' : 'Eternal Wisdom • Personal Guidance'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {/* Return to 15 Topics Overview Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToTopics}
                className="h-8 text-xs gap-1.5 rounded-full border-[#EFE4D7] dark:border-zinc-800 hover:border-[#7B2011]/40 hover:bg-[#7B2011]/10 dark:hover:bg-amber-400/10 text-muted-foreground hover:text-foreground cursor-pointer shadow-2xs"
                title={isHindi ? 'सभी परिस्थितियाँ देखें' : 'View all situations'}
              >
                <BookOpen className="w-3.5 h-3.5 text-[#7B2011] dark:text-[#E8B15C]" />
                <span className="font-medium">{isHindi ? 'सभी विषय' : 'All Topics'}</span>
              </Button>

              {/* New Chat Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewChat}
                className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-[#7B2011]/10 dark:hover:bg-amber-400/10 cursor-pointer"
                title={isHindi ? 'नया संवाद' : 'New Chat'}
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#7B2011] dark:text-[#E8B15C]" />
              </Button>
            </div>
          </div>

          {/* Messages Stream Area */}
          <div
            ref={scrollContainerRef}
            onScroll={handleChatScroll}
            className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-5 py-4 space-y-3 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {messages
              .filter((msg) => msg.role === 'user' || msg.content.length > 0)
              .map((msg) => (
                <GitaChatMessageBubble
                  key={msg.id}
                  message={msg}
                  isHindi={isHindi}
                  onSelectFollowUp={handleSendMessage}
                  onSpeak={(text) => handleSpeak(text, msg.id)}
                  isSpeaking={speakingMsgId === msg.id}
                />
              ))}

            {/* Contemplation Loader (Active while awaiting first streaming delta) */}
            {isLoading && (!messages.length || !messages[messages.length - 1].content) && (
              <div className="flex justify-start gap-3 my-4 animate-in fade-in duration-200">
                <div className="w-9 h-9 rounded-full bg-[#7B2011]/8 dark:bg-amber-400/10 border border-[#EFE4D7] dark:border-zinc-800 flex items-center justify-center shrink-0">
                  <span className="text-sm">🪶</span>
                </div>
                <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-card border border-[#EFE4D7] dark:border-zinc-800 shadow-xs flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 text-[#7B2011] dark:text-[#E8B15C] animate-spin" />
                  <span className="italic font-serif">
                    {isHindi ? 'श्रीकृष्ण विचार कर रहे हैं...' : 'Shri Krishna is contemplating...'}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="h-2" />
          </div>

          {/* Floating Scroll Buttons */}
          {showScrollTop && (
            <button
              type="button"
              onClick={scrollToTop}
              className="absolute right-4 bottom-20 z-20 w-8 h-8 rounded-full bg-white dark:bg-[#251E17] border border-[#EAE0D4] dark:border-zinc-700 shadow-md flex items-center justify-center text-[#7B2011] dark:text-[#E8B15C] hover:scale-105 transition-all cursor-pointer"
              title={isHindi ? 'ऊपर जाएं' : 'Scroll to top'}
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          )}

          {showScrollBottom && (
            <button
              type="button"
              onClick={scrollToBottom}
              className="absolute right-4 bottom-20 z-20 w-8 h-8 rounded-full bg-white dark:bg-[#251E17] border border-[#EAE0D4] dark:border-zinc-700 shadow-md flex items-center justify-center text-[#7B2011] dark:text-[#E8B15C] hover:scale-105 transition-all cursor-pointer"
              title={isHindi ? 'नीचे जाएं' : 'Scroll to bottom'}
              aria-label="Scroll to bottom"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          )}

          {/* Sticky Bottom Dock (Pinned to bottom, zero footer beneath) */}
          <footer className="shrink-0 sticky bottom-0 z-30 bg-background/95 backdrop-blur-md pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 px-2 sm:px-4 border-t border-[#EFE4D7]/80 dark:border-zinc-800/80 w-full">
            <GitaChatInputBar
              variant="dock"
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              isHindi={isHindi}
              userName={userName}
              onUpdateUserName={handleUpdateUserName}
              isQuotaExhausted={quota.isExhausted}
            />
          </footer>
        </div>
      )}
    </div>
  );
}

