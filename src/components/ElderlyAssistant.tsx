import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2, Loader2, X, Send, Music, Lightbulb, Heart, Zap, Moon, Sun } from 'lucide-react';
import { Bhajan, getDeityById } from '@/data/bhajans';
import BhajanCard from './BhajanCard';
import {
  processElderlyRequest,
  getWelcomeMessage,
  AIResponse,
} from '@/lib/elderlyAI';
import { VoiceManager, TextToSpeech, checkVoiceSupport } from '@/lib/voiceUtils';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ElderlyAssistantProps {
  allBhajans: Bhajan[];
  allDeities: Array<{ id: number; name: string; nameHindi: string }>;
  isOpen: boolean;
  onClose: () => void;
  onBhajanSelect?: (bhajan: Bhajan) => void;
}

const QUICK_ACTIONS = [
  { icon: Music, title: 'Recommend a morning bhajan', desc: 'Find the perfect melody for dawn', query: 'सुबह के लिए कोई भजन' },
  { icon: Lightbulb, title: 'Meaning of Gayatri Mantra?', desc: 'Deconstruct the universal prayer', query: 'गायत्री मंत्र का अर्थ' },
  { icon: Heart, title: 'Summary of the Gita', desc: 'Core teachings in simple words', query: 'गीता का सारांश' },
  { icon: Zap, title: 'Meditation techniques', desc: 'Guidance for focused Dhyane', query: 'ध्यान की तकनीक' },
];

export default function ElderlyAssistant({
  allBhajans,
  allDeities,
  isOpen,
  onClose,
  onBhajanSelect,
}: ElderlyAssistantProps) {
  const [messages, setMessages] = useState<AIResponse[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [voiceSupport, setVoiceSupport] = useState({ recognition: true, synthesis: true });

  const voiceManagerRef = useRef<VoiceManager | null>(null);
  const ttsRef = useRef<TextToSpeech | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize voice managers
  useEffect(() => {
    const support = checkVoiceSupport();
    setVoiceSupport(support);

    if (support.recognition) {
      voiceManagerRef.current = new VoiceManager();
    }

    if (support.synthesis) {
      ttsRef.current = new TextToSpeech();
    }

    if (isOpen && messages.length === 0) {
      // Show welcome on first open
      const welcome = getWelcomeMessage();
      setMessages([{ text: welcome, intent: 'greeting' }]);

      // Speak welcome
      if (support.synthesis) {
        setTimeout(() => {
          ttsRef.current?.speak(welcome, 'hi');
        }, 300);
      }
    }

    return () => {
      voiceManagerRef.current?.stopListening();
      ttsRef.current?.stop();
    };
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartListening = () => {
    if (!voiceManagerRef.current) {
      toast({
        title: 'Voice not supported',
        description: 'Your browser does not support voice input',
        variant: 'destructive',
      });
      return;
    }

    setIsListening(true);
    voiceManagerRef.current.resetTranscript();

    voiceManagerRef.current.startListening(
      (transcript, isFinal) => {
        setTextInput(transcript);
      },
      (error) => {
        toast({
          title: 'Listening error',
          description: error,
          variant: 'destructive',
        });
        setIsListening(false);
      },
      () => {
        setIsListening(false);
        // Auto-submit when listening ends
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

    // Add user message
    setMessages(prev => [...prev, { text: message, intent: 'search' as any }]);
    setTextInput('');
    setIsLoading(true);

    try {
      // Process with AI
      const aiResponse = await processElderlyRequest(
        message,
        allBhajans,
        allDeities && allDeities.length > 0 ? allDeities : undefined,
        messages
          .filter(m => m.intent !== 'search' && m.intent !== 'recommend')
          .map(m => ({ role: 'assistant' as const, content: m.text }))
      );

      setMessages(prev => [...prev, aiResponse]);

      // Speak response
      if (ttsRef.current && aiResponse.text) {
        setIsSpeaking(true);
        ttsRef.current.speak(aiResponse.text, 'hi');
        setTimeout(() => setIsSpeaking(false), aiResponse.text.length * 50);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      const errorResponse: AIResponse = {
        text: 'क्षमा करें, कोई समस्या हुई। कृपया फिर से कोशिश करें।',
        intent: 'help',
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
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

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed bottom-4 right-4 w-full max-w-md h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-accent p-6 text-white flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">🙏 भजन सहायक</h2>
          <p className="text-sm opacity-90">वॉइस से पूछें</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Close assistant"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.intent === 'greeting' || msg.intent === 'help' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-xs p-4 rounded-xl break-words ${
                  msg.intent === 'greeting' || msg.intent === 'help'
                    ? 'bg-white border-l-4 border-orange-500'
                    : 'bg-orange-500 text-white'
                }`}
              >
                <p className="text-lg leading-relaxed">{msg.text}</p>

                {/* Bhajan recommendations */}
                {msg.bhajans && msg.bhajans.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {msg.bhajans.map(bhajan => (
                      <button
                        key={bhajan.id}
                        onClick={() => onBhajanSelect?.(bhajan)}
                        className="w-full p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-left"
                      >
                        <p className="font-semibold text-foreground">{bhajan.title}</p>
                        <p className="text-sm text-muted-foreground">{bhajan.titleHindi}</p>
                        <p className="text-xs text-muted-foreground mt-1">by {bhajan.singerName}</p>
                      </button>
                    ))}
                  </div>
                )}

                {/* Speak button for assistant messages */}
                {(msg.intent === 'greeting' || msg.intent === 'help' || msg.intent === 'explain') &&
                  voiceSupport.synthesis && (
                    <button
                      onClick={() => handleSpeakResponse(msg.text)}
                      className="mt-2 inline-flex items-center gap-2 px-3 py-1 text-sm bg-orange-100 text-orange-600 hover:bg-orange-200 rounded-full transition-colors"
                    >
                      <Volume2
                        className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`}
                      />
                      {isSpeaking ? 'बोल रहे हैं...' : 'सुनें'}
                    </button>
                  )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center"
          >
            <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white space-y-3">
        {/* Voice Button - LARGE for elderly */}
        <button
          onClick={isListening ? handleStopListening : handleStartListening}
          disabled={isLoading}
          className={`w-full py-6 px-4 rounded-xl font-bold text-lg text-white transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 ${
            isListening
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-orange-500 hover:bg-orange-600'
          } disabled:opacity-50`}
        >
          {isListening ? (
            <>
              <MicOff className="w-8 h-8 animate-pulse" />
              <span>रुकिए</span>
            </>
          ) : (
            <>
              <Mic className="w-8 h-8" />
              <span>🎤 बोलिए</span>
            </>
          )}
        </button>

        {/* Text input fallback */}
        <div className="flex gap-2">
          <input
            type="text"
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            onKeyPress={e =>
              e.key === 'Enter' && handleSubmitMessage(textInput)
            }
            placeholder="या यहां लिखें..."
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
          />
          <button
            onClick={() => handleSubmitMessage(textInput)}
            disabled={isLoading || !textInput.trim()}
            className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
