import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceSearchButtonProps {
  onResult: (transcript: string) => void;
}

export default function VoiceSearchButton({ onResult }: VoiceSearchButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState("");

  const isSupported = typeof window !== "undefined" && 
    ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError("Voice search not supported in your browser");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = "hi-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError("");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === "no-speech") {
        setError("No speech detected. Try again.");
      } else if (event.error === "not-allowed") {
        setError("Microphone access denied.");
      } else {
        setError("Voice recognition failed.");
      }
    };

    recognition.onend = () => setIsListening(false);

    try {
      recognition.start();
    } catch {
      setError("Failed to start voice recognition");
      setIsListening(false);
    }
  }, [isSupported, onResult]);

  if (!isSupported) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={startListening}
        disabled={isListening}
        className={`p-3 rounded-xl transition-all touch-target ${
          isListening 
            ? "bg-destructive text-destructive-foreground animate-pulse" 
            : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
        }`}
        aria-label={isListening ? "Listening..." : "Voice search"}
      >
        {isListening ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
      </button>

      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-full right-0 mt-2 px-4 py-2 rounded-lg bg-card shadow-temple border border-border whitespace-nowrap text-sm"
          >
            <span className="hindi-text">सुन रहे हैं...</span> Listening...
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-full right-0 mt-2 px-4 py-2 rounded-lg bg-destructive/10 text-destructive text-sm whitespace-nowrap"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
