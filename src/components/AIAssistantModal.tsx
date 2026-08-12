import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2, Loader2, X, Send, Music, Lightbulb, Heart, Zap } from 'lucide-react';
import { Bhajan } from '@/data/bhajans';
import {
  processElderlyRequest,
  AIResponse,
} from '@/lib/elderlyAI';
import { VoiceManager, TextToSpeech, checkVoiceSupport } from '@/lib/voiceUtils';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { mobileFullscreenDialog } from "@/lib/dialogStyles";
import { cn } from "@/lib/utils";

interface AIAssistantModalProps {
  allBhajans: Bhajan[];
  allDeities: Array<{ id: number; name: string; nameHindi: string }>;
  isOpen: boolean;
  onClose: () => void;
  onBhajanSelect?: (bhajan: Bhajan) => void;
}

const QUICK_ACTIONS = [
  { 
    icon: Music, 
    title: 'Recommend morning bhajan', 
    subtitle: 'Find the perfect melody for dawn',
    query: 'सुबह के लिए भजन'
  },
  { 
    icon: Lightbulb, 
    title: 'Meaning of Gayatri Mantra', 
    subtitle: 'Understand universal wisdom',
    query: 'गायत्री मंत्र का अर्थ'
  },
  { 
    icon: Heart, 
    title: 'Summary of the Gita', 
    subtitle: 'Core teachings simplified',
    query: 'गीता का सारांश'
  },
  { 
    icon: Zap, 
    title: 'Meditation techniques', 
    subtitle: 'Guidance for focus',
    query: 'ध्यान की तकनीक'
  },
];

export default function AIAssistantModal({
  allBhajans,
  allDeities,
  isOpen,
  onClose,
  onBhajanSelect,
}: AIAssistantModalProps) {
  const [messages, setMessages] = useState<AIResponse[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [voiceSupport, setVoiceSupport] = useState({ recognition: true, synthesis: true });
  const [showQuickActions, setShowQuickActions] = useState(true);

  const voiceManagerRef = useRef<VoiceManager | null>(null);
  const ttsRef = useRef<TextToSpeech | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize
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

  // Scroll to top when modal opens
  useEffect(() => {
    if (isOpen && contentScrollRef.current) {
      contentScrollRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  // Auto-scroll to messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartListening = () => {
    if (!voiceManagerRef.current) return;

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
        console.error('Voice error in AIAssistantModal:', error);
      },
      // onStart
      () => {
        setIsListening(true);
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
      const aiResponse = await processElderlyRequest(
        message,
        allBhajans,
        'भाई/बहन',
        allDeities && allDeities.length > 0 ? allDeities : undefined,
        messages
          .filter(m => m.intent === 'greeting')
          .map(m => ({ role: 'assistant' as const, content: m.text }))
      );

      setMessages(prev => [...prev, aiResponse]);

      if (ttsRef.current && aiResponse.text) {
        setIsSpeaking(true);
        ttsRef.current.speak(aiResponse.text, 'hi');
        setTimeout(() => setIsSpeaking(false), aiResponse.text.length * 50);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        text: 'क्षमा करें, कोई समस्या हुई। कृपया फिर से कोशिश करें।',
        intent: 'help',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (query: string) => {
    handleSubmitMessage(query);
  };

  const handleSpeakResponse = (text: string) => {
    if (ttsRef.current) {
      if (isSpeaking) {
        ttsRef.current.stop();
        setIsSpeaking(false);
      } else {
        setIsSpeaking(true);
        ttsRef.current.speak(text, 'hi');
        setTimeout(() => setIsSpeaking(false), text.length * 50);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          mobileFullscreenDialog,
          "max-w-2xl max-h-[90vh] sm:max-h-[90vh] p-0 overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-800",
        )}
      >
        <DialogTitle className="sr-only">Kirtan AI Assistant</DialogTitle>
        <DialogDescription className="sr-only">Your spiritual guide & bhajan companion</DialogDescription>
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white sticky top-0 z-10 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">🎵 Kirtan AI</h2>
            <p className="text-sm opacity-90 mt-1">Your spiritual guide & bhajan companion</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div ref={contentScrollRef} className="h-[calc(90vh-200px)] overflow-y-auto px-6 py-6">
          {/* Quick Actions - Show initially */}
          {showQuickActions && messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 mb-8"
            >
              <div className="mb-8 space-y-6">
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-white mb-3">🙏 Welcome to Kirtan AI</h3>
                  <p className="text-slate-300 text-lg leading-relaxed">Your AI-powered companion for spiritual exploration, bhajan discovery, and sacred knowledge.</p>
                </div>

                {/* Features Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-700/50 border-l-4 border-orange-500 rounded-lg">
                    <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                      <span className="text-2xl">🎵</span> Bhajan Discovery
                    </h4>
                    <p className="text-sm text-slate-300">Find perfect bhajans for any mood or occasion with personalized recommendations</p>
                  </div>
                  <div className="p-4 bg-slate-700/50 border-l-4 border-yellow-500 rounded-lg">
                    <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                      <span className="text-2xl">📚</span> Sacred Knowledge
                    </h4>
                    <p className="text-sm text-slate-300">Learn meanings of mantras, sutras, and spiritual teachings in simple Hindi</p>
                  </div>
                  <div className="p-4 bg-slate-700/50 border-l-4 border-red-500 rounded-lg">
                    <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                      <span className="text-2xl">🎤</span> Voice Enabled
                    </h4>
                    <p className="text-sm text-slate-300">Ask in Hindi using voice or type your questions - we listen & understand</p>
                  </div>
                  <div className="p-4 bg-slate-700/50 border-l-4 border-violet-500 rounded-lg">
                    <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                      <span className="text-2xl">🧘</span> Meditation Guide
                    </h4>
                    <p className="text-sm text-slate-300">Get guidance on spiritual practices and meditation techniques</p>
                  </div>
                </div>

                <div className="border-t-2 border-slate-600 pt-6">
                  <p className="text-center text-slate-300 font-semibold mb-4">💡 Try one of these popular questions:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {QUICK_ACTIONS.map((action, idx) => {
                      const Icon = action.icon;
                      return (
                        <motion.button
                          key={idx}
                          onClick={() => handleQuickAction(action.query)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="p-4 bg-slate-700 border-2 border-slate-600 rounded-xl hover:border-orange-400 hover:shadow-lg transition-all group text-left"
                        >
                          <div className="flex items-start gap-3">
                            <Icon className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                            <div className="flex-1">
                              <p className="font-semibold text-white group-hover:text-orange-300 text-sm">{action.title}</p>
                              <p className="text-xs text-slate-400 group-hover:text-slate-300 mt-1">{action.subtitle}</p>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Messages */}
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.intent === 'greeting' || msg.intent === 'help' || msg.intent === 'explain' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-xl p-4 rounded-2xl break-words ${
                      msg.intent === 'greeting' || msg.intent === 'help' || msg.intent === 'explain'
                        ? 'bg-slate-700 text-white border-l-4 border-orange-500 shadow-md'
                        : 'bg-orange-500 text-white'
                    }`}
                  >
                    <p className="text-base leading-relaxed">{msg.text}</p>

                    {/* Bhajan recommendations */}
                    {msg.bhajans && msg.bhajans.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {msg.bhajans.slice(0, 3).map(bhajan => (
                          <motion.button
                            key={bhajan.id}
                            onClick={() => {
                              onBhajanSelect?.(bhajan);
                              onClose();
                            }}
                            whileHover={{ scale: 1.02 }}
                            className="w-full p-3 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg hover:shadow-lg transition-all text-left"
                          >
                            <p className="font-semibold text-gray-800">{bhajan.title}</p>
                            <p className="text-sm text-gray-600">{bhajan.titleHindi}</p>
                            <p className="text-xs text-orange-600 mt-1">♪ {bhajan.singerName}</p>
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {/* Speak button */}
                    {(msg.intent === 'greeting' || msg.intent === 'explain' || msg.intent === 'help') &&
                      voiceSupport.synthesis && (
                        <button
                          onClick={() => handleSpeakResponse(msg.text)}
                          className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 rounded-full transition-colors font-medium"
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-600 p-6 bg-slate-800 space-y-4 sticky bottom-0">
          {/* Voice Button - LARGE */}
          <motion.button
            onClick={isListening ? handleStopListening : handleStartListening}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-5 px-6 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            } disabled:opacity-50 shadow-lg`}
          >
            {isListening ? (
              <>
                <span className="inline-block w-3 h-3 bg-white rounded-full animate-pulse"></span>
                <span>रुकिए</span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                <span>🎤 बोलिए</span>
              </>
            )}
          </motion.button>

          {/* Text Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmitMessage(textInput)}
              placeholder="या यहां लिखें..."
              className="flex-1 px-4 py-3 border-2 border-slate-600 bg-slate-700 text-white rounded-lg focus:border-orange-500 focus:outline-none text-base placeholder:text-slate-500"
            />
            <motion.button
              onClick={() => handleSubmitMessage(textInput)}
              disabled={!textInput.trim() || isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
