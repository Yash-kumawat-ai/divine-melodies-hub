import { useState, useCallback, useRef } from "react";
import { Mic, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { VoiceManager, checkVoiceSupport } from "@/lib/voiceUtils";

interface VoiceSearchButtonProps {
  onResult: (transcript: string) => void;
}

export default function VoiceSearchButton({ onResult }: VoiceSearchButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState("");
  const voiceRef = useRef<VoiceManager | null>(null);

  if (!voiceRef.current) {
    voiceRef.current = new VoiceManager("hi");
  }

  const isSupported = checkVoiceSupport().recognition;

  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError("Voice search not supported in your browser");
      return;
    }

    try {
      setError("");
      voiceRef.current?.resetTranscript();
      voiceRef.current?.startListening(
        (transcript, isFinal) => {
          if (isFinal && transcript.trim()) {
            onResult(transcript.trim());
          }
        },
        (voiceError) => {
          setIsListening(false);
          setError(voiceError);
        },
        () => {
          setIsListening(true);
        },
        () => {
          setIsListening(false);
        }
      );
    } catch (error: any) {
      setIsListening(false);
      console.error('Microphone access error:', error);

      const errorName = error?.name || "";
      if (errorName === "NotAllowedError") {
        setError("Microphone access denied");
      } else if (errorName === "NotFoundError" || errorName === "DevicesNotFoundError") {
        setError("No microphone found. Connect/select a microphone and retry.");
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
