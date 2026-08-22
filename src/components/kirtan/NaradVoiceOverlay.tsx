import { forwardRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Square,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { NARAD_HI } from "@/lib/narad/naradVoiceStrings";
import { cn } from "@/lib/utils";
import devotionalTanpura from "@/pages/images/devotional_tanpura.webp";

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

// Veena SVG Component matching image-1784976248254.png specification
function VeenaIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Resonator 1 (Bottom Gourd) */}
      <circle cx="20" cy="44" r="10" fill="url(#veena-gold-grad)" stroke="#FFD700" strokeWidth="1.5" />
      {/* Resonator 2 (Top Gourd) */}
      <circle cx="44" cy="20" r="7" fill="url(#veena-gold-grad)" stroke="#FFD700" strokeWidth="1.5" />
      {/* Main Neck/Fingerboard */}
      <line x1="12" y1="52" x2="52" y2="12" stroke="#FFD700" strokeWidth="3.5" strokeLinecap="round" />
      {/* Instrument Strings */}
      <line x1="14" y1="50" x2="50" y2="14" stroke="#FFF5E5" strokeWidth="1" opacity="0.9" />
      <line x1="16" y1="48" x2="48" y2="16" stroke="#FFF5E5" strokeWidth="1" opacity="0.9" />
      {/* Frets */}
      <line x1="26" y1="36" x2="28" y2="38" stroke="#FFE4B5" strokeWidth="2" />
      <line x1="31" y1="31" x2="33" y2="33" stroke="#FFE4B5" strokeWidth="2" />
      <line x1="36" y1="26" x2="38" y2="28" stroke="#FFE4B5" strokeWidth="2" />
      {/* Dragon Head Tip */}
      <path d="M52 12 Q56 8 54 4 Q50 6 48 10" stroke="#FFD700" strokeWidth="2" fill="none" />
      <defs>
        <radialGradient id="veena-gold-grad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(20 44) scale(10)">
          <stop stopColor="#F5A623" />
          <stop offset="1" stopColor="#8B4513" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// Sound wave bars flanking the orb
function WaveformSideBars({ isListening }: { isListening: boolean }) {
  return (
    <div className="flex items-center gap-1 px-1 sm:px-2">
      {[12, 22, 30, 16, 26, 34, 18, 10].map((h, i) => (
        <span
          key={i}
          className={`w-1 bg-gradient-to-t from-[#E8B15C] to-[#7A2D28] rounded-full transition-all duration-300 ${
            isListening ? "animate-pulse" : "opacity-60"
          }`}
          style={{
            height: `${isListening ? Math.max(8, (h + i * 3) % 36) : h}px`,
            animationDelay: `${i * 100}ms`,
          }}
        />
      ))}
    </div>
  );
}

// Pink Lotus Flower artwork for bottom corners
function LotusFlowerDecoration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M50 50 C20 45 10 30 5 20 C25 25 40 38 50 50 Z" fill="#F8A4B8" opacity="0.75" />
      <path d="M50 50 C80 45 90 30 95 20 C75 25 60 38 50 50 Z" fill="#F8A4B8" opacity="0.75" />
      <path d="M50 50 C30 35 25 15 20 5 C38 15 45 32 50 50 Z" fill="#E86A8D" opacity="0.85" />
      <path d="M50 50 C70 35 75 15 80 5 C62 15 55 32 50 50 Z" fill="#E86A8D" opacity="0.85" />
      <path d="M50 50 C40 25 45 5 50 0 C55 5 60 25 50 50 Z" fill="#FFC0CB" />
    </svg>
  );
}

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
  const isHi = voiceLang === "hi";
  const [textInput, setTextInput] = useState("");

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    onSubmitText(textInput.trim());
    setTextInput("");
  };

  const statusText =
    phase === "listening"
      ? "मैं सुन रहा हूँ..."
      : phase === "thinking"
        ? "विचार कर रहा हूँ..."
        : phase === "speaking"
          ? "उत्तर दे रहा हूँ..."
          : phase === "error"
            ? errorMessage || "त्रुटि आई है"
            : phase === "result"
              ? "मैंने सुना..."
              : "बोलें या प्रश्न पूछें";

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Ask Narad Floating AI"
      className="pointer-events-auto fixed inset-0 z-[140] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md"
    >
      {/* Card Window Container matching image-1784976248254.png & image-1784976287108.png */}
      <div
        className={cn(
          "relative w-full max-w-md overflow-hidden rounded-[2.5rem] border-2 border-[#E8D8C4] dark:border-zinc-800 shadow-[0_25px_60px_-15px_rgba(90,31,26,0.25)]",
          "bg-gradient-to-b from-[#FFFDF8] via-[#FFF8EB] to-[#FDF0D8] p-5 sm:p-7 text-center flex flex-col justify-between select-none"
        )}
      >
        {/* Subtle Background Mandala Halo */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full border border-amber-500/15 pointer-events-none opacity-40 animate-spin-slow" />

        {/* ── TOP HEADER ── */}
        <div className="relative z-10 flex items-start justify-between w-full mb-3">
          <div className="w-8 h-8 opacity-0" aria-hidden />

          <div className="text-center">
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#4A1516] tracking-wide">
              Ask Narad
            </h2>

            {/* Flourish Line */}
            <div className="flex items-center justify-center gap-1.5 my-0.5 opacity-85">
              <div className="h-px w-6 bg-gradient-to-r from-transparent to-[#7A2D28]" />
              <span className="text-xs text-[#7A2D28] font-bold">आपका आध्यात्मिक साथी</span>
              <div className="h-px w-6 bg-gradient-to-l from-transparent to-[#7A2D28]" />
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FFF5E5] border border-[#E8D8C4] flex items-center justify-center text-[#5A1F1A] hover:scale-105 transition-all shadow-sm"
            aria-label="Close Ask Narad"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── CENTER NARAD ORB & WAVEFORMS ── */}
        <div className="relative z-10 my-4 flex flex-col items-center">
          <div className="flex items-center justify-center gap-2">
            {/* Left Waveform Bars */}
            <WaveformSideBars isListening={isListening} />

            {/* Glowing Golden Narad Orb with Devotional Tanpura */}
            <div className="relative flex items-center justify-center">
              <div className="absolute -inset-3.5 rounded-full bg-gradient-to-r from-amber-400/35 via-amber-300/45 to-amber-500/35 blur-md animate-pulse" />
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-b from-[#4A1B0C] via-[#2D0F06] to-[#180603] border-4 border-[#E8B15C] shadow-[0_0_40px_rgba(232,177,92,0.5)] flex items-center justify-center overflow-hidden">
                {/* Starry Sparkles inside Orb */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,166,35,0.25),transparent)]" />
                <img
                  src={devotionalTanpura}
                  alt="Devotional Tanpura"
                  className="w-full h-full object-cover rounded-full scale-105 relative z-10 drop-shadow-[0_0_15px_rgba(255,215,0,0.85)] hover:scale-110 transition-transform"
                />
              </div>
            </div>

            {/* Right Waveform Bars */}
            <WaveformSideBars isListening={isListening} />
          </div>

          {/* Listening Status Text */}
          <div className="mt-4 space-y-0.5">
            <p className="font-serif font-extrabold text-base sm:text-lg text-[#4A1516] flex items-center justify-center gap-1.5">
              <Mic className={`w-4 h-4 text-[#7A2D28] ${isListening ? "animate-bounce" : ""}`} />
              <span>{statusText}</span>
            </p>
            <p className="text-xs font-semibold text-[#7A6B60]">
              {isHi ? "ईश्वर का नाम लें और प्रश्न पूछें" : "Take the divine name and ask a question"}
            </p>
          </div>
        </div>

        {/* ── PRIMARY ACTION BUTTON ("बोलें (Tap to speak)") ── */}
        <div className="relative z-10 my-2">
          <button
            type="button"
            onClick={isListening ? onStopListen : onStartListen}
            className="w-full rounded-full bg-[#FFF8EB] border-2 border-[#E8D8C4] py-3 px-6 font-serif font-extrabold text-sm sm:text-base text-[#4A1516] flex items-center justify-center gap-3 shadow-md hover:border-[#7A2D28] hover:bg-[#FFF5E5] active:scale-98 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#7A2D28] to-[#5A1F1A] text-white flex items-center justify-center shadow">
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </div>
            <span>{isListening ? (isHi ? "सुनना रोकें (Tap to stop)" : "Stop (Tap to stop)") : (isHi ? "बोलें (Tap to speak)" : "Speak (Tap to speak)")}</span>
          </button>

          {/* Live Transcript Display while speaking/listening */}
          {transcript.trim() && (
            <div className="mt-2 text-xs font-semibold text-[#4A1516] bg-[#FFF5E5] p-2.5 rounded-xl border border-[#E8D8C4]">
              &ldquo;{transcript.trim()}&rdquo;
            </div>
          )}
        </div>

        {/* ── ELEGANT DIVIDER ("या") ── */}
        <div className="relative z-10 flex items-center justify-center gap-3 my-2.5 opacity-80">
          <div className="h-px w-20 bg-gradient-to-r from-transparent via-[#D8C9B9] to-[#D8C9B9]" />
          <span className="text-xs font-bold text-[#7A6B60] tracking-wider uppercase">या</span>
          <div className="h-px w-20 bg-gradient-to-l from-transparent via-[#D8C9B9] to-[#D8C9B9]" />
        </div>

        {/* ── ELEGANT TEXT INPUT BAR ("कुछ भी पूछें...") ── */}
        <form onSubmit={handleTextSubmit} className="relative z-10 w-full my-2">
          <div className="relative flex items-center rounded-full bg-[#FFF5E5] border-2 border-[#E8D8C4] shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)] focus-within:border-[#7A2D28] focus-within:shadow-[0_0_12px_rgba(122,45,40,0.15)] transition-all">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={isHi ? "कुछ भी पूछें..." : "Ask anything..."}
              className="w-full rounded-full bg-transparent py-3.5 pl-5 pr-14 text-sm font-semibold text-[#32251E] placeholder:text-[#7A6B60]/75 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!textInput.trim()}
              className="absolute right-1.5 w-10 h-10 rounded-full bg-gradient-to-r from-[#7A2D28] to-[#5A1F1A] text-amber-100 flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100"
              aria-label="Send query"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* ── BOTTOM CONTROL TOOLBAR (Language, Voice, Stop) ── */}
        <div className="relative z-10 flex items-center justify-center gap-2 pt-2 border-t border-[#E8D8C4]/60">
          <button
            type="button"
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF5E5] border border-[#E8D8C4] text-xs font-bold text-[#5A1F1A] hover:bg-[#FAF2E8] transition-all"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isHi ? "भाषा English" : "Language हिंदी"}</span>
          </button>

          <button
            type="button"
            onClick={onRepeat}
            disabled={!lastReply}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF5E5] border border-[#E8D8C4] text-xs font-bold text-[#5A1F1A] hover:bg-[#FAF2E8] transition-all disabled:opacity-40"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isHi ? "दोहराएँ" : "Repeat"}</span>
          </button>

          <button
            type="button"
            onClick={onStopListen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF5E5] border border-[#E8D8C4] text-xs font-bold text-[#5A1F1A] hover:bg-[#FAF2E8] transition-all"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>{isHi ? "रोकें" : "Stop"}</span>
          </button>
        </div>

        {/* Bottom Link: Sacred Studio */}
        <Link
          to="/narad-ai"
          onClick={onClose}
          className="relative z-10 mt-3 inline-flex items-center justify-center gap-1 font-serif text-xs font-bold text-[#7A2D28] hover:underline"
        >
          <span>{isHi ? "नारद AI खोलें" : "Open Narad AI"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        {/* ── CORNER PINK LOTUS FLOWER GRAPHICS ── */}
        <LotusFlowerDecoration className="absolute -bottom-2 -left-2 w-20 h-14 pointer-events-none opacity-80" />
        <LotusFlowerDecoration className="absolute -bottom-2 -right-2 w-20 h-14 pointer-events-none opacity-80 scale-x-[-1]" />
      </div>
    </div>
  );
});

export default NaradVoiceOverlay;
