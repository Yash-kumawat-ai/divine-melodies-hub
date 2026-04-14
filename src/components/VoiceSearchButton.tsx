import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceSearchButtonProps {
  onResult: (transcript: string) => void;
}

export default function VoiceSearchButton({ onResult }: VoiceSearchButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef<any>(null);

  const isSupported = typeof window !== "undefined" && 
    ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);

  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError("Voice search not supported in your browser");
      return;
    }

    try {
      // Request microphone permission first
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately as we just needed permission
      stream.getTracks().forEach(track => track.stop());
      
      setError("");
      
      // Initialize recognition if not already done
      if (!recognitionRef.current) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        
        // Set language to Hindi (India) by default
        recognitionRef.current.lang = "hi-IN";
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onstart = () => {
          setIsListening(true);
          setError("");
        };

        recognitionRef.current.onresult = (event: any) => {
          if (event.results && event.results[0]) {
            const transcript = event.results[0][0].transcript;
            console.log('Voice transcript received:', transcript);
            onResult(transcript);
            setIsListening(false);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          setIsListening(false);
          console.error('Voice recognition error:', event.error);
          
          if (event.error === "no-speech") {
            setError("No speech detected. Try again.");
          } else if (event.error === "not-allowed" || event.error === "permission-denied") {
            setError("Microphone access denied.");
          } else if (event.error === "network") {
            setError("Network error. Try again.");
          } else if (event.error === "service-not-allowed") {
            setError("Voice service not available.");
          } else {
            setError(`Voice error: ${event.error}`);
          }
        };

        recognitionRef.current.onend = () => {
          console.log('Voice recognition ended');
          setIsListening(false);
        };
      }
      
      recognitionRef.current.start();
      console.log('Voice recognition started');
    } catch (error: any) {
      setIsListening(false);
      console.error('Microphone access error:', error);
      
      if (error.name === "NotAllowedError") {
        setError("Microphone access denied");
      } else if (error.name === "NotFoundError") {
        setError("No microphone found");
      } else {
        setError("Microphone access failed");
      }
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
