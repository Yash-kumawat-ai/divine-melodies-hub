import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  Send,
  Mic,
  Loader2,
  ArrowLeft,
  RotateCcw,
  Briefcase,
  Heart,
  Clock,
  Coins,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { getOrComputeAstrologyProfile } from '@/lib/astrology/astrologyClient';
import type { CompleteKundliData } from '@/lib/astrology/types';
import { SEO } from '@/components/SEO';
import { VoiceManager, TextToSpeech, checkVoiceSupport } from '@/lib/voiceUtils';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import omWhiteSvg from '@/pages/images/svg/om white.svg';
import { GuruJiKundliSidebar } from '@/components/guruJi/GuruJiKundliSidebar';
import { GuruJiMessageCard, type GuruJiMessageItem } from '@/components/guruJi/GuruJiMessageCard';
import { GuruJiHoroscopeDrawer } from '@/components/guruJi/GuruJiHoroscopeDrawer';
import { generateGuruJiResponse } from '@/lib/astrology/guruJiEngine';
import {
  loadGuruJiChatSessions,
  saveGuruJiChatSessions,
  createGuruJiChatSession,
  deriveGuruJiChatTitle,
  deleteGuruJiChatSession,
  type GuruJiChatSession,
} from '@/lib/astrology/guruJiChatHistory';

interface StarterCard {
  id: string;
  icon: React.ReactNode;
  titleHi: string;
  titleEn: string;
  descHi: string;
  descEn: string;
  promptHi: string;
  promptEn: string;
  colorClass: string;
}

const STARTER_CARDS: StarterCard[] = [
  {
    id: 'career',
    icon: <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />,
    titleHi: 'करियर व आजीविका',
    titleEn: 'Career & Profession',
    descHi: 'दशम कर्म भाव, पद-प्रतिष्ठा एवं व्यवसाय योग',
    descEn: '10th House, authority & business potential',
    promptHi: 'मेरी कुंडली के अनुसार मेरा करियर और आजीविका कैसी रहेगी?',
    promptEn: 'How does my career and professional path look according to my Kundli?',
    colorClass: 'text-blue-600 bg-blue-500/10 border-blue-500/25',
  },
  {
    id: 'ishta',
    icon: <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />,
    titleHi: 'इष्ट देव व सिद्ध मंत्र',
    titleEn: 'Ishta Devata & Mantras',
    descHi: 'जैमिनी कारकांश अनुसार अभीष्ट साधना एवं मंत्र',
    descEn: 'Jaimini Karakamsha devotional path & sacred chanting',
    promptHi: 'मेरी कुंडली के अनुसार मेरे इष्ट देव कौन हैं और मुझे कौन सा मंत्र जपना चाहिए?',
    promptEn: 'Who is my Ishta Devata and which sacred mantra should I chant?',
    colorClass: 'text-amber-600 bg-amber-500/10 border-amber-500/25',
  },
  {
    id: 'dasha',
    icon: <Clock className="h-4 w-4 sm:h-5 sm:w-5" />,
    titleHi: 'वर्तमान दशा प्रभाव',
    titleEn: 'Current Mahadasha',
    descHi: 'सक्रिय विंशोत्तरी महादशा, अंतर्दशा एवं समय चक्र',
    descEn: 'Active Vimshottari Mahadasha & Antardasha influences',
    promptHi: 'मेरी वर्तमान महादशा और अंतर्दशा का मुझ पर क्या प्रभाव है?',
    promptEn: 'What are the effects of my current Mahadasha and Antardasha?',
    colorClass: 'text-purple-600 bg-purple-500/10 border-purple-500/25',
  },
  {
    id: 'marriage',
    icon: <Heart className="h-4 w-4 sm:h-5 sm:w-5" />,
    titleHi: 'विवाह एवं दांपत्य',
    titleEn: 'Marriage & Relationships',
    descHi: 'सप्तम भाव, मंगल दोष एवं संबंधों में सामंजस्य',
    descEn: '7th House, Mangal Dosha & relationship harmony',
    promptHi: 'मेरी कुंडली में वैवाहिक जीवन और संबंधों को लेकर क्या संकेत हैं?',
    promptEn: 'What does my birth chart indicate regarding relationships and marriage?',
    colorClass: 'text-rose-600 bg-rose-500/10 border-rose-500/25',
  },
  {
    id: 'wealth',
    icon: <Coins className="h-4 w-4 sm:h-5 sm:w-5" />,
    titleHi: 'धन एवं आर्थिक समृद्धि',
    titleEn: 'Wealth & Prosperity',
    descHi: 'द्वितीय व एकादश भाव, धन संचय एवं वैदिक उपाय',
    descEn: '2nd & 11th houses, wealth stability & remedies',
    promptHi: 'मेरी कुंडली के अनुसार धन और आर्थिक समृद्धि की क्या स्थिति है?',
    promptEn: 'What does my horoscope indicate regarding financial prosperity and wealth?',
    colorClass: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/25',
  },
  {
    id: 'health',
    icon: <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />,
    titleHi: 'स्वास्थ्य एवं मानसिक शांति',
    titleEn: 'Health & Serenity',
    descHi: 'तनु भाव, चन्द्रमा की स्थिति एवं महामृत्युंजय साधना',
    descEn: '1st House, Moon vitality & Mahamrityunjaya sadhana',
    promptHi: 'मानसिक शांति और आरोग्य के लिए क्या वैदिक उपाय करने चाहिए?',
    promptEn: 'What Vedic remedies are recommended for peace of mind and well-being?',
    colorClass: 'text-teal-600 bg-teal-500/10 border-teal-500/25',
  },
];

export default function AskGuruJiPage() {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isHi = language === 'hi';

  const [kundli, setKundli] = useState<CompleteKundliData | null>(null);
  const [loadingKundli, setLoadingKundli] = useState(true);

  // Multi-Session Chat State
  const [sessions, setSessions] = useState<GuruJiChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [messages, setMessages] = useState<GuruJiMessageItem[]>([]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const voiceManagerRef = useRef<VoiceManager | null>(null);
  const ttsRef = useRef<TextToSpeech | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Load Kundli from Canonical Single Source of Truth
  useEffect(() => {
    async function loadKundliData() {
      if (!user) {
        setLoadingKundli(false);
        return;
      }
      try {
        const res = await getOrComputeAstrologyProfile(user.id);
        setKundli(res.kundli);
      } catch (err) {
        console.error('Error loading kundli for Guru Ji:', err);
      } finally {
        setLoadingKundli(false);
      }
    }
    void loadKundliData();
  }, [user]);

  // 2. Initialize Sessions & Voice Manager
  useEffect(() => {
    const support = checkVoiceSupport();
    if (support.recognition) voiceManagerRef.current = new VoiceManager();
    if (support.synthesis) ttsRef.current = new TextToSpeech();

    const loadedSessions = loadGuruJiChatSessions();
    if (loadedSessions.length > 0) {
      setSessions(loadedSessions);
      setActiveSessionId(loadedSessions[0].id);
      setMessages(loadedSessions[0].messages);
    } else {
      const initial = createGuruJiChatSession();
      setSessions([initial]);
      setActiveSessionId(initial.id);
      setMessages([]);
      saveGuruJiChatSessions([initial]);
    }

    return () => {
      voiceManagerRef.current?.stopListening();
      ttsRef.current?.stop();
    };
  }, []);

  // 3. Auto-Scroll to Latest Message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // 4. Session Switcher
  const handleSelectSession = useCallback((sessionId: string) => {
    const found = sessions.find((s) => s.id === sessionId);
    if (found) {
      setActiveSessionId(found.id);
      setMessages(found.messages);
    }
  }, [sessions]);

  // 5. Create New Consultation Session
  const handleStartNewChat = useCallback(() => {
    const newSession = createGuruJiChatSession();
    const updated = [newSession, ...sessions.filter((s) => s.messages.length > 0)];
    setSessions(updated);
    setActiveSessionId(newSession.id);
    setMessages([]);
    saveGuruJiChatSessions(updated);
    toast.success(isHi ? 'नया संवाद सत्र प्रारंभ हुआ।' : 'New consultation session started.');
  }, [sessions, isHi]);

  // 6. Delete Session Handler
  const handleDeleteSession = useCallback((sessionId: string) => {
    const updated = deleteGuruJiChatSession(sessionId, sessions);
    setSessions(updated);
    if (activeSessionId === sessionId) {
      if (updated.length > 0) {
        setActiveSessionId(updated[0].id);
        setMessages(updated[0].messages);
      } else {
        const fresh = createGuruJiChatSession();
        setSessions([fresh]);
        setActiveSessionId(fresh.id);
        setMessages([]);
        saveGuruJiChatSessions([fresh]);
      }
    }
    toast.success(isHi ? 'सत्र हटा दिया गया।' : 'Session deleted.');
  }, [activeSessionId, sessions, isHi]);

  // 7. Clear All History Handler
  const handleClearAllHistory = useCallback(() => {
    const fresh = createGuruJiChatSession();
    setSessions([fresh]);
    setActiveSessionId(fresh.id);
    setMessages([]);
    saveGuruJiChatSessions([fresh]);
    toast.success(isHi ? 'सम्पूर्ण संवाद इतिहास साफ कर दिया गया।' : 'All consultation history cleared.');
  }, [isHi]);

  // 8. Send Message Handler
  const handleSendMessage = useCallback(
    async (textToSend?: string) => {
      const query = (textToSend || inputText).trim();
      if (!query || isTyping) return;

      const userMsg: GuruJiMessageItem = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: query,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const updatedWithUser = [...messages, userMsg];
      setMessages(updatedWithUser);
      setInputText('');
      setIsTyping(true);

      // Synthesize Vedic Astrological Answer
      setTimeout(() => {
        const res = generateGuruJiResponse(query, kundli, isHi);

        const assistantMsg: GuruJiMessageItem = {
          id: `guru-${Date.now()}`,
          role: 'assistant',
          content: res.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mantraCard: res.mantraCard,
          bhajanRec: res.bhajanRec,
          domain: res.domain,
          followUps: res.followUps,
        };

        const finalMessages = [...updatedWithUser, assistantMsg];
        setMessages(finalMessages);
        setIsTyping(false);

        // Update sessions state & persist
        setSessions((prevSessions) => {
          const now = Date.now();
          const targetSessionId = activeSessionId || prevSessions[0]?.id;
          const updated = prevSessions.map((s) => {
            if (s.id === targetSessionId) {
              return {
                ...s,
                messages: finalMessages,
                title: deriveGuruJiChatTitle(finalMessages),
                updatedAt: now,
              };
            }
            return s;
          });
          saveGuruJiChatSessions(updated);
          return updated;
        });
      }, 550);
    },
    [inputText, isTyping, kundli, isHi, messages, activeSessionId]
  );

  // 9. Voice Input Handler
  const toggleVoiceInput = () => {
    if (!voiceManagerRef.current) {
      toast.error(isHi ? 'आपकी ब्राउज़र में वॉयस इनपुट समर्थित नहीं है।' : 'Voice input not supported in your browser.');
      return;
    }

    if (isListening) {
      voiceManagerRef.current.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      voiceManagerRef.current.startListening(
        (transcript: string) => {
          setInputText(transcript);
          setIsListening(false);
          void handleSendMessage(transcript);
        },
        (error: string) => {
          console.error('Speech error:', error);
          setIsListening(false);
          toast.error(isHi ? 'आवाज़ पहचानने में समस्या हुई।' : 'Speech recognition failed.');
        },
        isHi ? 'hi-IN' : 'en-IN'
      );
    }
  };

  // 10. TTS Playback Handler
  const handleSpeakToggle = (text: string, msgId: string) => {
    if (!ttsRef.current) return;

    if (activeSpeakingId === msgId) {
      ttsRef.current.stop();
      setActiveSpeakingId(null);
    } else {
      ttsRef.current.stop();
      setActiveSpeakingId(msgId);
      ttsRef.current.speak(
        text,
        isHi ? 'hi-IN' : 'en-IN',
        () => setActiveSpeakingId(null),
        () => setActiveSpeakingId(null)
      );
    }
  };

  const userName = profile?.name || user?.user_metadata?.name || (isHi ? 'भक्त' : 'Devotee');
  const ascName = isHi ? kundli?.ascendant?.rashiNameHi : kundli?.ascendant?.rashiName;
  const moonSign = isHi ? kundli?.planets.Moon?.rashiNameHindi : kundli?.planets.Moon?.sign;
  const currentMD = isHi ? kundli?.dasha?.currentMahadasha?.planetHi : kundli?.dasha?.currentMahadasha?.planet;

  return (
    <div className="fixed inset-0 h-dvh w-full bg-background text-foreground flex overflow-hidden z-40">
      <SEO
        title="Ask Guru Ji | Vedic Astrology & Spiritual AI Guide | Raghavam"
        description="Consult Guru Ji AI for personalized Vedic horoscope insights, career guidance, Ishta Devata sadhana, Vimshottari Dasha analysis, and sacred mantra chanting."
      />

      {/* 1. DESKTOP 2-COLUMN LEFT SANCTUARY SIDEBAR */}
      <GuruJiKundliSidebar
        kundli={kundli}
        isHi={isHi}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onNewConsultation={handleStartNewChat}
        onClearHistory={handleClearAllHistory}
      />

      {/* 2. MAIN INTERACTIVE CHAT CHAMBER */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-background">
        {/* Dedicated Narad-AI Aligned Header with Safe Height & Padding */}
        <header className="h-16 border-b border-border bg-card/90 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between gap-3 shrink-0 z-10 overflow-visible">
          {/* Left: Standard Back Button with Soft Creamy Hover & Guru Ji Title */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl p-2 hover:bg-[#651317]/10 dark:hover:bg-white/10 text-muted-foreground hover:text-brand-primary dark:hover:text-amber-300 flex items-center justify-center transition-all shrink-0 cursor-pointer"
              title={isHi ? 'पीछे जाएं' : 'Go Back'}
              aria-label={isHi ? 'पीछे जाएं' : 'Go Back'}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 min-h-[36px] min-w-[36px] max-h-[36px] max-w-[36px] rounded-xl bg-gradient-brand flex items-center justify-center text-primary-foreground border border-brand-gold/50 shadow-2xs p-1.5 shrink-0 overflow-hidden">
                <img src={omWhiteSvg} alt="Om" className="h-full w-full max-h-full max-w-full object-contain aspect-square pointer-events-none select-none" />
              </div>

              <div className="min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-display font-bold text-sm sm:text-base text-foreground truncate leading-normal">
                    {isHi ? 'गुरु जी (वैदिक AI)' : 'Guru Ji (Vedic AI)'}
                  </h1>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                </div>

                {kundli ? (
                  <p className="text-[11px] text-muted-foreground truncate leading-normal">
                    {kundli.birthDetails.placeLabel?.split(',')[0]}
                    {ascName && ` • ${ascName}`}
                    {moonSign && ` • ${moonSign}`}
                    {currentMD && ` • ${currentMD}`}
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground truncate leading-normal">
                    {isHi ? 'वैदिक ज्योतिष एवं आध्यात्मिक मार्गदर्शन' : 'Vedic Astrology & Spiritual Guide'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Actions: Horoscope Drawer on Mobile only + New Chat */}
          <div className="flex items-center gap-1.5">
            {/* Mobile Horoscope Drawer Trigger */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="lg:hidden flex items-center gap-1.5 rounded-xl border border-border bg-card hover:bg-[#651317]/10 dark:hover:bg-white/10 hover:text-brand-primary dark:hover:text-amber-300 px-3 py-1.5 text-xs font-medium text-foreground transition-all cursor-pointer"
              title={isHi ? 'जन्म कुण्डली देखें' : 'View Horoscope'}
            >
              <Compass className="h-4 w-4 text-brand-primary dark:text-amber-400" />
              <span>{isHi ? 'कुण्डली' : 'Kundli'}</span>
            </button>

            {/* New Chat Reset Button */}
            <button
              type="button"
              onClick={handleStartNewChat}
              className="rounded-xl p-2 hover:bg-[#651317]/10 dark:hover:bg-white/10 text-muted-foreground hover:text-brand-primary dark:hover:text-amber-300 flex items-center justify-center transition-all shrink-0 cursor-pointer"
              title={isHi ? 'नया संवाद' : 'New Chat'}
              aria-label={isHi ? 'नया संवाद' : 'New Chat'}
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Chat Feed Stream (Hidden Scrollbar) */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-5 max-w-4xl w-full mx-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Welcome Screen when no messages */}
          {messages.length === 0 && (
            <div className="pt-4 pb-6 sm:pt-8 sm:pb-8 space-y-6 animate-in fade-in-50 duration-300">
              {/* Hero Greeting with Proper Padding & Typography */}
              <div className="text-center space-y-3 max-w-xl mx-auto px-2">
                <div className="h-14 w-14 sm:h-16 sm:w-16 min-h-[56px] min-w-[56px] max-h-[64px] max-w-[64px] rounded-2xl bg-gradient-to-br from-brand-primary via-[#7B2011] to-brand-gold flex items-center justify-center text-primary-foreground shadow-md mx-auto border border-brand-gold/50 p-2.5 shrink-0 overflow-hidden">
                  <img src={omWhiteSvg} alt="Om" className="h-full w-full max-h-full max-w-full object-contain aspect-square pointer-events-none select-none" />
                </div>
                <h2 className="text-xl sm:text-3xl font-display font-bold text-foreground leading-snug">
                  {isHi ? `🙏 नमो नारायण, ${userName}!` : `🙏 Namo Narayana, ${userName}!`}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {isHi
                    ? 'आपकी जन्म कुण्डली के आधार पर वैदिक ज्योतिष मार्गदर्शन, ग्रह दशा विश्लेषण एवं सिद्ध मंत्र साधना।'
                    : 'Vedic astrological insights, dasha timing analysis, and personalized spiritual guidance based on your birth chart.'}
                </p>
              </div>

              {/* 6 Starter Capability Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {STARTER_CARDS.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => handleSendMessage(isHi ? card.promptHi : card.promptEn)}
                    className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border hover:border-brand-primary hover:bg-[#651317]/5 dark:hover:bg-white/5 text-left transition-all duration-200 shadow-2xs hover:shadow-xs group flex items-start gap-3 active:scale-98 cursor-pointer"
                  >
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border ${card.colorClass}`}>
                      {card.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="font-display font-bold text-xs sm:text-sm text-foreground group-hover:text-brand-primary dark:group-hover:text-amber-400 transition-colors">
                        {isHi ? card.titleHi : card.titleEn}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
                        {isHi ? card.descHi : card.descEn}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message Stream */}
          {messages.map((msg, index) => {
            const isLatestAssistant = msg.role === 'assistant' && index === messages.length - 1;
            return (
              <GuruJiMessageCard
                key={msg.id}
                message={msg}
                isHi={isHi}
                isSpeaking={activeSpeakingId === msg.id}
                isLatestAssistant={isLatestAssistant}
                onSpeakToggle={handleSpeakToggle}
                onSelectFollowUp={handleSendMessage}
              />
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-card border border-border max-w-xs animate-in fade-in-50">
              <div className="h-6 w-6 min-h-[24px] min-w-[24px] max-h-[24px] max-w-[24px] rounded-lg bg-gradient-brand flex items-center justify-center text-primary-foreground border border-brand-gold/50 p-1 shrink-0 overflow-hidden">
                <img src={omWhiteSvg} alt="Om" className="h-full w-full max-h-full max-w-full object-contain aspect-square pointer-events-none select-none" />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-primary dark:text-amber-400" />
                <span>{isHi ? 'कुण्डली विश्लेषण हो रहा है...' : 'Analyzing your Kundli...'}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-2" />
        </main>

        {/* High-Contrast Narad-AI Aligned Input Dock */}
        <footer className="shrink-0 border-t border-border bg-background/95 backdrop-blur-sm p-3 sm:p-4">
          <div className="mx-auto flex max-w-4xl gap-2 items-center">
            {/* Mic Voice Button */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:border-brand-primary hover:text-brand-primary dark:hover:text-amber-400 hover:bg-[#651317]/10 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer",
                isListening && "border-brand-primary bg-brand-primary/10 text-brand-primary dark:text-amber-400 animate-pulse"
              )}
              title={isListening ? (isHi ? 'सुनना रोकें' : 'Stop listening') : (isHi ? 'बोलकर पूछें' : 'Voice input')}
              aria-label={isListening ? 'Stop listening' : 'Voice input'}
            >
              <Mic className="h-5 w-5" />
            </button>

            {/* Input Field */}
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void handleSendMessage();
                }
              }}
              placeholder={
                isHi
                  ? 'गुरु जी से पूछें (करियर, दशा, इष्ट देव, विवाह, उपाय)...'
                  : 'Ask Guru Ji (career, dasha, ishta devata, marriage, remedies)...'
              }
              className="min-w-0 flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/20 transition-all"
              disabled={isTyping}
            />

            {/* High-Contrast Send Button */}
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isTyping}
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all",
                inputText.trim() && !isTyping
                  ? "bg-brand-primary text-primary-foreground shadow-md hover:bg-[#7B2011] active:scale-95 cursor-pointer"
                  : "bg-brand-primary/20 text-muted-foreground/50 cursor-not-allowed"
              )}
              title={isHi ? 'भेजें' : 'Send'}
              aria-label="Send"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </footer>
      </div>

      {/* 3. SLIDE-OUT HOROSCOPE SNAPSHOT DRAWER (Mobile) */}
      <GuruJiHoroscopeDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        kundli={kundli}
        isHi={isHi}
      />
    </div>
  );
}
