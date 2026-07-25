import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Mic, X, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import { VoiceManager, checkVoiceSupport } from "@/lib/voiceUtils";

interface SearchBarProps {
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  isListening?: boolean;
  onMicClick?: () => void;
  autoFocus?: boolean;
  readOnly?: boolean;
  onClick?: () => void;
  onClear?: () => void;
  onVoiceResult?: (transcript: string) => void;
}

export default function SearchBar({
  value = "",
  onChange,
  placeholder,
  isListening,
  onMicClick,
  autoFocus = false,
  readOnly = false,
  onClick,
  onClear,
  onVoiceResult,
}: SearchBarProps) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const defaultPlaceholder = isHi
    ? "भजन, कीर्तन या कलाकार खोजें..."
    : "Search bhajans, kirtans or artists...";

  // Local voice recognition state in case manual speech props aren't provided
  const [localIsListening, setLocalIsListening] = useState(false);
  const voiceRef = useRef<VoiceManager | null>(null);

  const startLocalListening = useCallback(async () => {
    const isSupported = checkVoiceSupport().recognition;
    if (!isSupported) {
      console.warn("Voice search not supported in this browser.");
      return;
    }

    if (!voiceRef.current) {
      voiceRef.current = new VoiceManager("hi");
    }

    try {
      voiceRef.current.resetTranscript();
      voiceRef.current.startListening(
        (transcript, isFinal) => {
          if (isFinal && transcript.trim()) {
            if (onVoiceResult) {
              onVoiceResult(transcript.trim());
            } else if (onChange) {
              onChange(transcript.trim());
            }
          }
        },
        () => {
          setLocalIsListening(false);
        },
        () => {
          setLocalIsListening(true);
        },
        () => {
          setLocalIsListening(false);
        }
      );
    } catch (err) {
      setLocalIsListening(false);
      console.error("Microphone access failed", err);
    }
  }, [onChange, onVoiceResult]);

  const activeListening = isListening !== undefined ? isListening : localIsListening;
  const handleMicClick = onMicClick || startLocalListening;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly && onClick) {
      onClick();
    }
  };

  if (readOnly) {
    return (
      <div
        onClick={onClick || (() => navigate("/search"))}
        className="w-full h-14 flex items-center bg-white dark:bg-[#1E1710] border border-[#EFE4D7] dark:border-zinc-800/80 rounded-[28px] shadow-[0_12px_40px_rgba(80,45,20,0.06)] hover:shadow-[0_18px_48px_rgba(80,45,20,0.10)] px-5 cursor-pointer transition-all active:scale-[0.99] select-none text-left"
      >
        <Search className="w-5.5 h-5.5 text-[#6A2C2A] dark:text-[#E8B15C] shrink-0 mr-3" />
        <span className="flex-1 text-sm md:text-base text-[#7A6B60] dark:text-muted-foreground/60 truncate">
          {placeholder || defaultPlaceholder}
        </span>
        <Mic className="h-5.5 w-5.5 text-[#6A2C2A] dark:text-[#E8B15C] shrink-0 ml-2" />
      </div>
    );
  }
 
  return (
    <form
      onSubmit={handleFormSubmit}
      className="w-full"
    >
      <div className="relative flex items-center bg-white dark:bg-[#1E1710] border border-[#EFE4D7] dark:border-zinc-800/80 rounded-[28px] shadow-[0_12px_40px_rgba(80,45,20,0.06)] px-3 pl-6 pr-2 h-14 md:h-16 focus-within:border-[#6A2C2A] dark:focus-within:border-[#E8B15C] focus-within:ring-2 focus-within:ring-[#6A2C2A]/10 transition-all duration-300">
        <Search className="w-5.5 h-5.5 text-[#6A2C2A] dark:text-[#E8B15C] shrink-0 mr-3 select-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          placeholder={placeholder || defaultPlaceholder}
          className="w-full bg-transparent border-0 outline-none focus:outline-none focus:ring-0 text-[#32251E] dark:text-foreground text-base md:text-lg font-medium placeholder:text-[#7A6B60]/50 py-2.5"
          autoFocus={autoFocus}
        />
        
        {/* Clear button if value exists */}
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="mr-2 text-stone-400 hover:text-stone-600 dark:hover:text-white transition-colors focus:outline-none cursor-pointer p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        )}
 
        {/* Mic Button */}
        <button
          type="button"
          onClick={handleMicClick}
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-full transition-all shrink-0 cursor-pointer text-[#6A2C2A] dark:text-[#E8B15C] hover:bg-stone-100 dark:hover:bg-white/10",
            activeListening && "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400"
          )}
          title="Voice Search"
        >
          {activeListening ? (
            <Loader2 className="w-5 h-5 animate-spin text-red-600" />
          ) : (
            <Mic className="w-5.5 h-5.5" />
          )}
        </button>
      </div>
    </form>
  );
}
