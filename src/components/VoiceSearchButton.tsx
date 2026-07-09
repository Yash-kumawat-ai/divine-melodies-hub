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
    <div className="relative flex items-center justify-center">
      <button
        type="button"
        onClick={startListening}
        disabled={isListening}
        className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-all shrink-0 shadow-sm ${
          isListening
            ? "bg-red-600 text-white shadow-md animate-pulse"
            : "bg-[#FF6A00] hover:bg-[#E05B00] text-white hover:scale-105 active:scale-95"
        }`}
        aria-label={isListening ? "Listening..." : "Voice search"}
      >
        {isListening ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mic className="h-5 w-5" />}
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
