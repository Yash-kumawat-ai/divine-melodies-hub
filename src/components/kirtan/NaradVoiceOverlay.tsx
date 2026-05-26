import { forwardRef, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Languages,
  Mic,
  MicOff,
  MessageSquare,
  RotateCcw,
  Send,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import OmMandalaOrb, { type NaradOrbVoiceState } from "@/components/kirtan/OmMandalaOrb";
import NaradVoiceWave from "@/components/kirtan/NaradVoiceWave";
import { NARAD_HI } from "@/lib/narad/naradVoiceStrings";
import { cn } from "@/lib/utils";

export type NaradVoicePhase = "idle" | "listening" | "thinking" | "speaking" | "result" | "error";

type NaradVoiceOverlayProps = {
  isMobile: boolean;
  phase: NaradVoicePhase;
  isListening: boolean;
  transcript: string;
  lastReply: string;
  errorMessage: string;
  voiceLang: "hi" | "en";
  voiceSupported: boolean;
  ttsMuted: boolean;
  reducedMotion: boolean;
  onSubmitText: (text: string) => void;
  onClose: () => void;
  onOpenChat: () => void;
  onStartListen: () => void;
  onStopListen: () => void;
  onToggleMute: () => void;
  onRepeat: () => void;
  onRetry: () => void;
  onToggleLang: () => void;
  onMeditation?: () => void;
};

const ORB_SIZE_MOBILE = 120;
const ORB_SIZE_DESKTOP = 100;

const NaradVoiceOverlay = forwardRef<HTMLDivElement, NaradVoiceOverlayProps>(function NaradVoiceOverlay(
  {
    isMobile,
    phase,
    isListening,
    transcript,
    lastReply,
    errorMessage,
    voiceLang,
    voiceSupported,
    ttsMuted,
    reducedMotion,
    onSubmitText,
    onClose,
    onOpenChat,
    onStartListen,
    onStopListen,
    onToggleMute,
    onRepeat,
    onRetry,
    onToggleLang,
  },
  ref,
) {
  const showText = true;
  const [textInput, setTextInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (isMobile) return;
    inputRef.current?.focus();
  }, [isMobile]);

  const orbState: NaradOrbVoiceState =
    phase === "listening"
      ? "listening"
      : phase === "thinking"
        ? "thinking"
        : phase === "speaking"
          ? "speaking"
          : "idle";

  const statusText =
    phase === "listening"
      ? NARAD_HI.listening
      : phase === "thinking"
        ? NARAD_HI.thinking
        : phase === "speaking"
          ? NARAD_HI.speaking
          : phase === "error"
            ? errorMessage
            : phase === "result"
              ? NARAD_HI.heardYou
              : NARAD_HI.speakPrompt;

  const orbSize = isMobile ? ORB_SIZE_MOBILE : ORB_SIZE_DESKTOP;

  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-label="Narad voice assistant"
      initial={isMobile ? { opacity: 0, y: "100%" } : { opacity: 0, scale: 0.96, y: 16 }}
      animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1, y: 0 }}
      exit={isMobile ? { opacity: 0, y: "100%" } : { opacity: 0, scale: 0.96, y: 16 }}
      transition={{ type: "spring", stiffness: 420, damping: 34 }}
      className={cn(
        "pointer-events-auto flex flex-col overflow-hidden border border-amber-200/20 shadow-[0_20px_60px_-12px_rgba(45,18,0,0.65)] backdrop-blur-xl",
        "bg-[linear-gradient(160deg,rgba(45,18,0,0.92)_0%,rgba(20,0,31,0.88)_45%,rgba(10,10,20,0.95)_100%)]",
        isMobile
          ? "fixed inset-x-0 bottom-0 z-[140] max-h-[min(92dvh,640px)] rounded-t-3xl"
          : "fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-[max(0.75rem,env(safe-area-inset-right))] z-[140] w-[min(340px,calc(100vw-1.5rem))] rounded-3xl md:bottom-[max(1rem,env(safe-area-inset-bottom))]",
      )}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-sm font-medium text-amber-100/90">{NARAD_HI.askNarad}</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-amber-100/80 hover:bg-white/10"
          aria-label="Close Narad voice"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col items-center px-4 pb-2 pt-1">
        <div className="relative">
          {(isListening || phase === "speaking") && !reducedMotion && (
            <>
              <span className="pointer-events-none absolute -inset-3 rounded-full bg-amber-400/25 blur-md" />
              <span className="pointer-events-none absolute -inset-6 rounded-full bg-violet-500/15 blur-lg" />
            </>
          )}
          <OmMandalaOrb
            voiceState={orbState}
            active={phase !== "idle" || isListening}
            listening={isListening}
            reducedMotion={reducedMotion}
            size={orbSize}
            className="relative shadow-[0_0_32px_rgba(255,160,60,0.4)]"
          />
        </div>

        <NaradVoiceWave
          active={isListening}
          reducedMotion={reducedMotion}
          className="mt-4"
        />

        <p className="mt-3 text-center text-sm font-medium text-amber-50/95">{statusText}</p>

        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {transcript || statusText}
        </div>

        {transcript.trim() ? (
          <p className="mt-2 max-w-[95%] text-center text-sm leading-relaxed text-amber-100/85">
            &ldquo;{transcript.trim()}&rdquo;
          </p>
        ) : isListening ? (
          <p className="mt-1 text-xs text-white/40">{NARAD_HI.transcriptHint}</p>
        ) : null}
      </div>

      {phase === "result" && lastReply.trim() && (
        <div className="mx-4 mb-3 max-h-32 overflow-y-auto rounded-2xl border border-amber-400/15 bg-black/35 px-3 py-2.5">
          <p className="text-sm leading-relaxed text-amber-50/90">{lastReply}</p>
        </div>
      )}

      {!voiceSupported && phase === "error" && (
        <p className="mx-4 mb-2 text-center text-xs text-amber-200/70">{NARAD_HI.voiceUnsupported}</p>
      )}

      {showText && (
        <div className="mx-4 mb-3 flex gap-2">
          <textarea
            ref={inputRef}
            rows={3}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && textInput.trim()) {
                e.preventDefault();
                onSubmitText(textInput);
                setTextInput("");
              }
            }}
            placeholder={NARAD_HI.micFallback}
            className="min-h-[96px] min-w-0 flex-1 resize-none rounded-xl border border-amber-400/25 bg-black/40 px-3 py-2.5 text-sm text-amber-50 placeholder:text-white/35 focus:border-amber-400/50 focus:outline-none"
            aria-label="Type your question for Narad"
          />
          <button
            type="button"
            disabled={!textInput.trim() || phase === "thinking"}
            onClick={() => {
              onSubmitText(textInput);
              setTextInput("");
            }}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-amber-50 disabled:opacity-40"
            aria-label={NARAD_HI.sendText}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2 border-t border-amber-400/10 px-3 py-3">
        {voiceSupported && (isListening ? (
          <button
            type="button"
            onClick={onStopListen}
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-950/50 px-3 py-1.5 text-xs text-amber-100"
          >
            <MicOff className="h-3.5 w-3.5" />
            {NARAD_HI.stopListening}
          </button>
        ) : (
          <button
            type="button"
            onClick={onStartListen}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2 text-xs font-semibold text-amber-50"
          >
            <Mic className="h-3.5 w-3.5" />
            {phase === "result" || phase === "error" ? NARAD_HI.speakAgain : NARAD_HI.speakPrompt}
          </button>
        ))}

        {phase === "result" && (
          <>
            <button
              type="button"
              onClick={onRepeat}
              disabled={ttsMuted}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs text-amber-100/80 disabled:opacity-40"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {NARAD_HI.repeatAnswer}
            </button>
            <button
              type="button"
              onClick={onOpenChat}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs text-amber-100/80"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {NARAD_HI.openChat}
            </button>
          </>
        )}

        {phase === "error" && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1 rounded-full border border-rose-400/30 px-3 py-1.5 text-xs text-rose-100"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {NARAD_HI.retry}
          </button>
        )}

        <button
          type="button"
          onClick={onToggleMute}
          className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1.5 text-xs text-amber-100/70"
          aria-label={ttsMuted ? NARAD_HI.unmuteVoice : NARAD_HI.muteVoice}
        >
          {ttsMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        </button>

        <button
          type="button"
          onClick={onToggleLang}
          className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1.5 text-xs text-amber-100/70"
        >
          <Languages className="h-3.5 w-3.5" />
          {voiceLang === "hi" ? NARAD_HI.english : NARAD_HI.hindi}
        </button>
      </div>

      <div className="flex items-center justify-between border-t border-amber-400/10 px-4 py-2 text-[10px] text-amber-200/45">
        <Link to="/kirtan-ai" onClick={onClose} className="hover:text-amber-200/70">
          Full sacred studio
        </Link>
        <Link to="/meditation" onClick={onClose} className="hover:text-amber-200/70">
          Start meditation
        </Link>
      </div>
    </motion.div>
  );
});

export default NaradVoiceOverlay;
