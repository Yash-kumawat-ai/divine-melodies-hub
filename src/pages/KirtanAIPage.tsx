import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, BookOpen, Search, Upload, Volume2, Play, Youtube, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDeities } from '../hooks/useDeities';
import { useToast } from '../hooks/use-toast';
import { processElderlyRequest } from '../lib/elderlyAI';
import { searchUserBhajans } from '../lib/supabaseQueries';
import { generateBhajanSlug } from '../lib/slugUtils';
import Header from '../components/Header';
import { VoiceManager, TextToSpeech, checkVoiceSupport } from '../lib/voiceUtils';
import type { Bhajan } from '../data/bhajans';

interface AIResponse {
  text: string;
  intent: 'greeting' | 'search' | 'random' | 'recommendation' | 'other';
  bhajans?: Bhajan[];
}

interface ChatSession {
  id: string;
  title: string;
  timestamp: number;
}

function isBhajanQuery(message: string): boolean {
  const keywords = [
    'bhajan', 'भजन', 'song', 'गाना', 'का भजन', 'ki bhajan', 'gana', 
    'कृष्ण', 'krishna', 'शिव', 'shiva', 'हनुमान', 'hanuman', 'राम', 'rama',
    'दुर्गा', 'durga', 'गणेश', 'ganesh', 'लक्ष्मी', 'lakshmi', 'साईं', 'sai',
    'राग', 'raga', 'संगीत', 'music', 'दिखाएं', 'show', 'खोजें', 'search', 'find',
    'सुनें', 'listen', 'गाएं', 'sing', 'प्रसिद्ध', 'popular', 'लोकप्रिय'
  ];
  const lowerMessage = message.toLowerCase();
  return keywords.some(kw => lowerMessage.includes(kw.toLowerCase()));
}

async function searchBhajansByName(query: string): Promise<Bhajan[]> {
  try {
    const results = await searchUserBhajans(query, 5);
    return results.map((b: any) => ({
      id: parseInt(b.id),
      slug: generateBhajanSlug(b.title),
      title: b.title,
      titleHindi: b.title_hindi,
      deityId: b.deity_id,
      singerName: b.singer_name,
      composerName: b.composer_name || '',
      youtubeUrl: b.youtube_url || '',
      lyricsHindi: b.lyrics_hindi,
      lyricsTransliteration: '',
      playCount: b.play_count || 0,
      rating: b.average_rating || 0,
      tags: b.mood_tags || [],
      featured: false,
    }));
  } catch (error) {
    console.error('Error searching bhajans:', error);
    return [];
  }
}

const QUICK_ACTIONS = [
  { icon: '🎵', title: 'लोकप्रिय भजन', query: 'मुझे सबसे लोकप्रिय भजन दिखाएं' },
  { icon: '🙏', title: 'कृष्ण भजन', query: 'कृष्ण के भजन खोजें' },
  { icon: '☮️', title: 'शांति के गीत', query: 'शांति के भजन' },
  { icon: '💫', title: 'नई चीजें', query: 'मुझे कुछ नया भजन दिखाएं' }
];

const SIDEBAR_NAVIGATION = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: BookOpen, label: 'All Bhajans', path: '/all-bhajans' },
  { icon: Search, label: 'Search', path: '/search' },
  { icon: Upload, label: 'Upload', path: '/upload-bhajan' }
];

export default function KirtanAIPage() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<AIResponse[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [voiceSupport, setVoiceSupport] = useState({ recognition: true, synthesis: true });
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);

  const voiceManagerRef = useRef<VoiceManager | null>(null);
  const ttsRef = useRef<TextToSpeech | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { deities: allDeities } = useDeities();
  
  const displayName = profile?.name || user?.email?.split('@')[0] || 'User';

  useEffect(() => {
    const support = checkVoiceSupport();
    setVoiceSupport(support);

    if (support.recognition) {
      voiceManagerRef.current = new VoiceManager();
    }

    if (support.synthesis) {
      ttsRef.current = new TextToSpeech();
    }

    return () => {
      voiceManagerRef.current?.stopListening();
      ttsRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartListening = () => {
    if (!voiceManagerRef.current) {
      toast({
        title: '❌ Voice Not Supported',
        description: 'Your browser does not support voice input.',
        variant: 'destructive',
      });
      return;
    }

    setIsListening(true);
    voiceManagerRef.current.resetTranscript();

    // Correct usage: onTranscript (with isFinal), onError, onEnd
    voiceManagerRef.current.startListening(
      // onTranscript: Update text input with partial/final results
      (transcript: string, isFinal: boolean) => {
        setTextInput(transcript);
      },
      // onError: Handle voice errors
      (error: string) => {
        setIsListening(false);
        toast({
          title: '❌ Voice Error',
          description: error,
          variant: 'destructive',
        });
      },
      // onEnd: When speech ends, submit message if not empty
      () => {
        setIsListening(false);
        const transcript = voiceManagerRef.current?.getTranscript() || '';
        if (transcript.trim()) {
          handleSubmitMessage(transcript.trim());
        }
      }
    );
  };

  const handleStopListening = () => {
    voiceManagerRef.current?.stopListening();
    setIsListening(false);
  };

  const handleSubmitMessage = async (message: string) => {
    if (!message.trim()) return;

    setMessages(prev => [...prev, { text: message, intent: 'search' as any }]);
    setTextInput('');
    setShowQuickActions(false);
    setIsLoading(true);

    try {
      const formattedMessages = messages.map(msg => ({
        role: msg.intent === 'search' ? ('user' as const) : ('assistant' as const),
        content: msg.text,
      }));

      let matchedBhajans: Bhajan[] = [];
      if (isBhajanQuery(message)) {
        try {
          matchedBhajans = await searchBhajansByName(message);
          console.log('Found bhajans:', matchedBhajans.length);
        } catch (searchError) {
          console.error('Bhajan search error:', searchError);
        }
      }

      console.log('Calling AI with message:', message);
      const aiResponse = await processElderlyRequest(
        message,
        [],
        displayName,
        allDeities && allDeities.length > 0 ? allDeities : undefined,
        formattedMessages
      );

      console.log('AI Response:', aiResponse);

      if (matchedBhajans.length > 0) {
        aiResponse.bhajans = matchedBhajans;
      }

      setMessages(prev => [...prev, aiResponse]);

      if (ttsRef.current && aiResponse.text) {
        setIsSpeaking(true);
        ttsRef.current.speak(aiResponse.text, 'hi');
        setTimeout(() => setIsSpeaking(false), aiResponse.text.length * 50);
      }
    } catch (error) {
      console.error('Error processing request:', error);
      toast({
        title: '❌ Error',
        description: error instanceof Error ? error.message : 'Could not process your request. Please try again.',
        variant: 'destructive',
      });
      setMessages(prev => prev.slice(0, -1)); // Remove the user message if error occurs
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (query: string) => {
    handleSubmitMessage(query);
  };

  const handleSpeakResponse = (text: string) => {
    if (!ttsRef.current) return;
    setIsSpeaking(true);
    ttsRef.current.speak(text, 'hi');
    setTimeout(() => setIsSpeaking(false), text.length * 50);
  };

  const handleNewChat = () => {
    if (messages.length > 0) {
      const title = messages[0]?.text?.slice(0, 30) + '...' || 'New Chat';
      setChatHistory(prev => [...prev, {
        id: Date.now().toString(),
        title,
        timestamp: Date.now()
      }]);
    }
    setMessages([]);
    setShowQuickActions(true);
    setTextInput('');
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 0 }}
        transition={{ duration: 0.3 }}
        className="bg-card border-r border-border overflow-hidden flex flex-col flex-shrink-0"
      >
        <div className="p-4 space-y-3">
          <motion.button
            onClick={handleNewChat}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            + New chat
          </motion.button>

          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-3 py-2 bg-accent border border-border rounded-lg text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-2">
          <div className="text-xs font-semibold text-muted-foreground px-4 py-2">Recent</div>
          {chatHistory.length === 0 ? (
            <div className="text-xs text-muted-foreground px-4 py-2">No chat history</div>
          ) : (
            chatHistory.map(chat => (
              <button key={chat.id} className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent rounded-lg transition-colors truncate">
                {chat.title}
              </button>
            ))
          )}
        </div>

        <div className="space-y-2 p-4 border-t border-border">
          {SIDEBAR_NAVIGATION.map((nav, idx) => (
            <Link
              key={idx}
              to={nav.path}
              className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              <nav.icon className="w-4 h-4" />
              {nav.label}
            </Link>
          ))}
        </div>

        <div className="border-t border-border p-4">
          <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-sm">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center px-4 py-2 border-b border-border gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <h1 className="text-sm font-semibold">🎵 Kirtan AI</h1>
        </div>

        <div ref={contentScrollRef} className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
          {showQuickActions && messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full"
            >
              <div className="text-center mb-12 max-w-2xl">
                <div className="text-6xl mb-4">🙏</div>
                <h1 className="text-4xl font-bold text-foreground mb-2">Namaste, {displayName}.</h1>
                <p className="text-lg text-muted-foreground">
                  Kirtan AI is your companion in exploring the timeless wisdom of the Vedas and Puranas.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
                {QUICK_ACTIONS.map((action, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => handleQuickAction(action.query)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-200 rounded-lg hover:border-violet-400 transition-colors text-left group"
                  >
                    <div className="text-3xl mb-2">{action.icon}</div>
                    <p className="font-semibold text-foreground text-sm group-hover:text-violet-600 transition-colors">{action.title}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.intent === 'search' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-2xl p-4 rounded-lg break-words ${
                        msg.intent === 'search'
                          ? 'bg-primary text-primary-foreground rounded-br-none'
                          : 'bg-card border border-border rounded-bl-none'
                      }`}
                    >
                      <p className="text-base leading-relaxed">{msg.text}</p>

                      {msg.bhajans && msg.bhajans.length > 0 && (
                        <div className="mt-4 space-y-3">
                          <p className="text-sm font-semibold text-foreground">यहाँ भजन हैं:</p>
                          {msg.bhajans.map(bhajan => (
                            <motion.div
                              key={bhajan.id}
                              whileHover={{ scale: 1.02 }}
                              className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-300 rounded-lg"
                            >
                              <div className="space-y-2">
                                <div>
                                  <p className="font-semibold text-foreground">{bhajan.title}</p>
                                  <p className="text-sm text-muted-foreground">{bhajan.titleHindi}</p>
                                </div>
                                <p className="text-xs text-primary font-medium">♪ {bhajan.singerName}</p>

                                <div className="flex gap-2 pt-2">
                                  <Link
                                    to={`/bhajan/${bhajan.slug}`}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                                  >
                                    <Play className="w-4 h-4" />
                                    Play
                                  </Link>

                                  <a
                                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(bhajan.title + ' ' + bhajan.singerName)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                  >
                                    <Youtube className="w-4 h-4" />
                                    YouTube
                                  </a>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {msg.intent !== 'search' && voiceSupport.synthesis && (
                        <button
                          onClick={() => handleSpeakResponse(msg.text)}
                          className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm bg-primary/10 text-primary hover:bg-primary/20 rounded-full transition-colors font-medium"
                        >
                          <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
                          {isSpeaking ? 'सुन रहे हैं...' : 'सुनें'}
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start py-4">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-muted rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="border-t border-border p-6 bg-background space-y-4 flex-shrink-0">
          <motion.button
            onClick={isListening ? handleStopListening : handleStartListening}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3 px-6 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            } disabled:bg-muted disabled:cursor-not-allowed`}
          >
            🎤 {isListening ? 'सुन रहे हैं...' : 'बोलिए'}
          </motion.button>

          <div className="flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmitMessage(textInput)}
              placeholder="अपना प्रश्न पूछें... या Enter दबाएं"
              className="flex-1 px-4 py-3 border border-border rounded-lg focus:border-primary focus:outline-none bg-background text-foreground"
            />
            <motion.button
              onClick={() => handleSubmitMessage(textInput)}
              disabled={!textInput.trim() || isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed text-primary-foreground rounded-lg font-semibold transition-colors"
            >
              →
            </motion.button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
