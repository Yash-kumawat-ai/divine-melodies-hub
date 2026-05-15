import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, Bot, User, Mic, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAssistantContext } from "@/hooks/useAssistantContext";
import { VoiceManager } from "@/lib/voiceUtils";

type Msg = { role: "user" | "assistant"; content: string };
type Language = "en" | "hi";

/**
 * Context passed from search or other components
 * Allows assistant to provide grounded, personalized recommendations
 */
export interface AssistantContext {
  searchQuery?: string; // What user searched for
  searchResults?: Array<{
    title: string;
    source: "local" | "cache" | "lrclib" | "lyrics.ovh" | "backend_fallback";
    confidence?: number;
  }>;
  recentBhajans?: Array<{
    title: string;
    deity?: string;
  }>;
  availableLyricsLocally?: boolean;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bhajan-assistant`;

async function streamChat({
  messages,
  language,
  context,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  language: Language;
  context?: AssistantContext;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (err: string, isOfflineMode?: boolean) => void;
}) {
  try {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages, language, context }),
    });

    // Handle different error statuses
    if (resp.status === 429) {
      onError("Too many requests. Please wait a moment.", false);
      return;
    }
    if (resp.status === 401) {
      onError("API authentication failed. Please check your configuration.", false);
      return;
    }
    if (resp.status === 402) {
      onError("API quota exceeded. Please check your account.", false);
      return;
    }
    if (resp.status === 503) {
      // Graceful fallback mode - still stream but from local response
      if (!resp.body) {
        onError("Unable to connect. Running in offline mode.", true);
        return;
      }
    } else if (!resp.ok) {
      const errorText = await resp.text();
      console.error("API error:", resp.status, errorText);
      onError(`Connection error (${resp.status}). Please try again.`, false);
      return;
    }

    if (!resp.body) {
      onError("No response received from server.", false);
      return;
    }

    // Parse SSE stream with robust error handling
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let isComplete = false;
    let hasReceivedData = false;

    try {
      while (!isComplete) {
        const { done, value } = await reader.read();
        
        if (done) {
          // Process any remaining data in buffer
          if (buffer.trim()) {
            console.warn("Incomplete SSE chunk at end:", buffer);
          }
          isComplete = true;
          onDone();
          return;
        }

        // Decode with stream flag to handle multi-byte characters
        buffer += decoder.decode(value, { stream: true });
        hasReceivedData = true;

        // Process complete lines
        let lineEndIdx: number;
        while ((lineEndIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, lineEndIdx);
          buffer = buffer.slice(lineEndIdx + 1);

          // Clean up line
          if (line.endsWith("\r")) line = line.slice(0, -1);
          
          // Skip empty lines
          if (!line.trim()) continue;

          // Handle SSE format
          if (!line.startsWith("data: ")) {
            console.warn("Invalid SSE format:", line);
            continue;
          }

          const jsonStr = line.slice(6).trim();

          // Handle stream end marker
          if (jsonStr === "[DONE]") {
            isComplete = true;
            onDone();
            return;
          }

          // Parse JSON payload
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              onDelta(content);
            }
          } catch (parseErr) {
            console.warn("Failed to parse SSE JSON:", jsonStr, parseErr);
            // Keep the line in buffer for retry (might be incomplete)
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (readErr) {
      if (hasReceivedData) {
        onDone(); // Partial response is better than error
      } else {
        throw readErr;
      }
    }
  } catch (fetchErr) {
    const msg = fetchErr instanceof Error ? fetchErr.message : "Unknown error";
    onError(`Connection failed: ${msg}`, false);
  }
}

export default function AIAssistant() {
  const { context } = useAssistantContext();
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "🙏 नमस्ते! I'm your bhajan assistant. Ask me to recommend bhajans based on your mood, time of day, or favorite deity!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [micError, setMicError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const voiceManagerRef = useRef<VoiceManager | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    voiceManagerRef.current?.stopListening();
    voiceManagerRef.current = new VoiceManager(language === "en" ? "en" : "hi");

    return () => {
      voiceManagerRef.current?.stopListening();
    };
  }, [language]);

  const toggleVoiceInput = async () => {
    if (!voiceManagerRef.current) {
      setMicError("Voice input is not supported in this browser.");
      return;
    }
    
    if (isListening) {
      voiceManagerRef.current.stopListening();
      setIsListening(false);
    } else {
      setMicError("");
      voiceManagerRef.current.resetTranscript();
      await voiceManagerRef.current.startListening(
        (transcript, isFinal) => {
          setInput(transcript);
          if (isFinal) setIsListening(false);
        },
        (error) => {
          setIsListening(false);
          setMicError(error);
        },
        () => {
          setIsListening(true);
        },
        () => {
          setIsListening(false);
        }
      );
    }
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.language = language === "en" ? "en-US" : "hi-IN";
    utterance.rate = 0.9;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    const userMsg: Msg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    let assistantSoFar = "";
    const allMessages = [...messages.filter(m => m !== messages[0]), userMsg];

    try {
      await streamChat({
        messages: allMessages,
        language,
        context,
        onDelta: (chunk) => {
          assistantSoFar += chunk;
          setMessages(prev => {
            const newMessages = [...prev];
            // If last message is not assistant, add new one
            if (newMessages[newMessages.length - 1]?.role !== "assistant") {
              newMessages.push({ role: "assistant", content: assistantSoFar });
            } else {
              // Update existing assistant message
              newMessages[newMessages.length - 1] = {
                role: "assistant",
                content: assistantSoFar,
              };
            }
            return newMessages;
          });
        },
        onDone: () => setIsLoading(false),
        onError: (err, isOfflineMode) => {
          const errorPrefix = isOfflineMode ? "🌐 Offline mode: " : "⚠️ ";
          setMessages(prev => [...prev, { role: "assistant", content: `${errorPrefix}${err}` }]);
          setIsLoading(false);
        },
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Something went wrong";
      setMessages(prev => [...prev, { role: "assistant", content: `⚠️ ${errorMsg}` }]);
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-saffron text-primary-foreground shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
        aria-label={isOpen ? "Close assistant" : "Open AI assistant"}
      >
        {isOpen ? <X className="w-7 h-7" /> : <MessageCircle className="w-7 h-7" />}
      </button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-4 z-50 w-[calc(100vw-2rem)] max-w-md bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
            style={{ maxHeight: "70vh" }}
          >
            {/* Header */}
            <div className="bg-gradient-saffron px-5 py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Bot className="w-6 h-6 text-primary-foreground" />
                <div>
                  <h3 className="font-display text-lg font-semibold text-primary-foreground">Bhajan Assistant</h3>
                  <p className="text-primary-foreground/80 text-xs">AI-powered recommendations</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="px-2 py-1 rounded-lg bg-primary-foreground text-primary text-sm font-medium focus:outline-none cursor-pointer"
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी</option>
                </select>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-primary-foreground/20 rounded-lg transition-colors text-primary-foreground"
                  aria-label="Close assistant"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[400px]">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-primary" />
                    </span>
                  )}
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-base leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.role === "assistant" && (
                      <button
                        onClick={() => speakText(msg.content)}
                        disabled={isSpeaking}
                        className="mt-2 p-1 hover:bg-primary/10 rounded transition-colors text-primary"
                        aria-label="Listen to message"
                        title="Listen"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-4 h-4 text-primary" />
                    </span>
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-2 items-center">
                  <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </span>
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border p-3 flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={language === "en" ? "Ask about bhajans..." : "भजन के बारे में पूछें..."}
                className="flex-1 px-4 py-3 rounded-xl bg-background border border-border text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary/50 touch-target"
                disabled={isLoading || isListening}
              />
              <button
                onClick={toggleVoiceInput}
                disabled={isLoading}
                className={`p-3 rounded-xl transition-colors touch-target ${
                  isListening
                    ? "bg-red-500 text-white"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                }`}
                title={isListening ? "Stop listening" : "Start voice input"}
                aria-label={isListening ? "Stop listening" : "Start voice input"}
              >
                <Mic className="w-5 h-5" />
              </button>
              <button
                onClick={send}
                disabled={isLoading || !input.trim()}
                className="p-3 rounded-xl bg-primary text-primary-foreground disabled:opacity-50 transition-colors touch-target"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            {micError && (
              <div className="px-3 pb-3 text-sm text-destructive">
                {micError}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
