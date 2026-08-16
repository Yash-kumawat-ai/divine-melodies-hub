import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Mic, 
  X, 
  Loader2, 
  Sparkles, 
  CalendarDays, 
  Flame, 
  Film, 
  Bot, 
  Image, 
  Camera, 
  Users, 
  BookOpen, 
  Landmark, 
  Trophy, 
  Upload, 
  Heart, 
  Music2, 
  BookText,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import { VoiceManager, checkVoiceSupport } from "@/lib/voiceUtils";
import { bhajans } from "@/data/bhajans";
import { 
  getUnifiedAutocompleteSuggestions, 
  AutocompleteSuggestion 
} from "@/lib/unifiedSearch";

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
  onSelectSuggestion?: (query: string) => void;
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
  onSelectSuggestion,
}: SearchBarProps) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const defaultPlaceholder = isHi
    ? "भजन, आरती, पंचांग या ध्यान खोजें..."
    : "Search bhajans, aartis, panchang, meditation...";

  // Local voice recognition state
  const [localIsListening, setLocalIsListening] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const voiceRef = useRef<VoiceManager | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute live multi-category suggestions (Features, Aartis, Deities, Bhajans)
  const activeSuggestions = getUnifiedAutocompleteSuggestions(value, bhajans, isHi, 8);

  // Reset selected keyboard index when search value changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [value]);

  const startLocalListening = useCallback(async () => {
    const isSupported = checkVoiceSupport().recognition;
    if (!isSupported) {
      console.warn("Voice search not supported in this browser.");
      return;
    }

    if (!voiceRef.current) {
      voiceRef.current = new VoiceManager(isHi ? "hi" : "en");
    } else {
      voiceRef.current.setLanguage(isHi ? "hi" : "en");
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
        () => setLocalIsListening(false),
        () => setLocalIsListening(true),
        () => setLocalIsListening(false)
      );
    } catch (err) {
      setLocalIsListening(false);
      console.error("Microphone access failed", err);
    }
  }, [onChange, onVoiceResult, isHi]);

  const activeListening = isListening !== undefined ? isListening : localIsListening;
  const handleMicClick = onMicClick || startLocalListening;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (readOnly && onClick) {
      onClick();
      return;
    }

    if (selectedIndex >= 0 && activeSuggestions[selectedIndex]) {
      handleSuggestionClick(activeSuggestions[selectedIndex]);
      return;
    }

    if (value.trim()) {
      if (onSelectSuggestion) {
        onSelectSuggestion(value.trim());
      } else {
        navigate(`/search?q=${encodeURIComponent(value.trim())}`);
      }
    }
  };

  const handleSuggestionClick = (suggestion: AutocompleteSuggestion) => {
    setShowSuggestions(false);

    // Call handlers
    const text = isHi ? suggestion.titleHindi : suggestion.title;
    if (onChange) onChange(text);
    if (onSelectSuggestion) onSelectSuggestion(text);

    // Navigation logic: features & deities open directly, bhajans navigate to search or bhajan page
    if (suggestion.path) {
      navigate(suggestion.path);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || activeSuggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < activeSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : activeSuggestions.length - 1));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const renderSuggestionIcon = (suggestion: AutocompleteSuggestion) => {
    if (suggestion.emoji) {
      return <span className="text-base sm:text-lg leading-none shrink-0 select-none">{suggestion.emoji}</span>;
    }
    switch (suggestion.iconName) {
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'CalendarDays': return <CalendarDays className="w-4 h-4 text-orange-500 shrink-0" />;
      case 'Flame': return <Flame className="w-4 h-4 text-red-500 shrink-0" />;
      case 'Film': return <Film className="w-4 h-4 text-purple-500 shrink-0" />;
      case 'Bot': return <Bot className="w-4 h-4 text-sky-500 shrink-0" />;
      case 'Image': return <Image className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'Camera': return <Camera className="w-4 h-4 text-pink-500 shrink-0" />;
      case 'Users': return <Users className="w-4 h-4 text-indigo-500 shrink-0" />;
      case 'BookOpen': return <BookOpen className="w-4 h-4 text-amber-700 shrink-0" />;
      case 'Landmark': return <Landmark className="w-4 h-4 text-yellow-600 shrink-0" />;
      case 'Trophy': return <Trophy className="w-4 h-4 text-yellow-500 shrink-0" />;
      case 'Upload': return <Upload className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'Heart': return <Heart className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'BookText': return <BookText className="w-4 h-4 text-amber-600 shrink-0" />;
      case 'Music2':
      default: return <Music2 className="w-4 h-4 text-stone-500 dark:text-stone-400 shrink-0" />;
    }
  };

  const getBadgeStyle = (type: AutocompleteSuggestion['type']) => {
    switch (type) {
      case 'feature':
        return 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300/60 dark:border-amber-800/60';
      case 'aarti_chalisa':
        return 'bg-red-100 text-red-900 dark:bg-red-950/80 dark:text-red-300 border-red-300/60 dark:border-red-800/60';
      case 'deity':
        return 'bg-sky-100 text-sky-900 dark:bg-sky-950/80 dark:text-sky-300 border-sky-300/60 dark:border-sky-800/60';
      case 'bhajan':
      default:
        return 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300 border-stone-200/60 dark:border-zinc-700/60';
    }
  };

  if (readOnly) {
    return (
      <div
        onClick={onClick || (() => navigate("/search"))}
        className="w-full h-12 sm:h-14 flex items-center bg-white dark:bg-[#1E1710] border border-[#EFE4D7] dark:border-zinc-800/80 rounded-[28px] shadow-[0_12px_40px_rgba(80,45,20,0.06)] hover:shadow-[0_18px_48px_rgba(80,45,20,0.10)] px-3.5 sm:px-5 gap-2.5 sm:gap-3.5 cursor-pointer transition-all active:scale-[0.99] select-none text-left min-w-0"
      >
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#651317]/8 dark:bg-amber-400/10 flex items-center justify-center shrink-0">
          <Search className="w-4 h-4 text-[#6A2C2A] dark:text-[#E8B15C] shrink-0 pointer-events-none" />
        </div>
        <span className="flex-1 min-w-0 text-xs sm:text-base font-medium text-[#7A6B60] dark:text-muted-foreground/70 whitespace-nowrap overflow-hidden text-ellipsis leading-normal pt-0.5">
          {placeholder || defaultPlaceholder}
        </span>
        <Mic className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#6A2C2A] dark:text-[#E8B15C] shrink-0 ml-auto pointer-events-none" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full min-w-0">
      <form onSubmit={handleFormSubmit} className="w-full min-w-0">
        <div className="relative flex items-center bg-white dark:bg-[#1E1710] border border-[#EFE4D7] dark:border-zinc-800/80 rounded-[28px] shadow-[0_12px_40px_rgba(80,45,20,0.06)] px-3.5 sm:px-5 h-12 sm:h-14 md:h-16 gap-2 sm:gap-3 focus-within:border-[#6A2C2A] dark:focus-within:border-[#E8B15C] focus-within:ring-2 focus-within:ring-[#6A2C2A]/10 transition-all duration-300 w-full min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#651317]/8 dark:bg-amber-400/10 flex items-center justify-center shrink-0">
            <Search className="w-4 h-4 text-[#6A2C2A] dark:text-[#E8B15C] shrink-0 select-none pointer-events-none" />
          </div>
          <input
            type="text"
            value={value}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              if (onChange) onChange(e.target.value);
              setShowSuggestions(true);
            }}
            placeholder={placeholder || defaultPlaceholder}
            className="flex-1 min-w-0 w-full bg-transparent border-0 outline-none focus:outline-none focus:ring-0 text-[#32251E] dark:text-foreground text-xs sm:text-base font-medium placeholder:text-[#7A6B60]/70 py-2"
            autoFocus={autoFocus}
          />

          {/* Clear button */}
          {value && (
            <button
              type="button"
              onClick={() => {
                if (onClear) onClear();
                if (onChange) onChange("");
                setShowSuggestions(false);
              }}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-white transition-colors focus:outline-none cursor-pointer p-1 rounded-full hover:bg-stone-100 dark:hover:bg-white/10 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Mic Button */}
          <button
            type="button"
            onClick={handleMicClick}
            className={cn(
              "inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full transition-all shrink-0 cursor-pointer text-[#6A2C2A] dark:text-[#E8B15C] hover:bg-stone-100 dark:hover:bg-white/10",
              activeListening && "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400"
            )}
            title="Voice Search"
          >
            {activeListening ? (
              <Loader2 className="w-4.5 h-4.5 animate-spin text-red-600" />
            ) : (
              <Mic className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            )}
          </button>
        </div>
      </form>

      {/* Multi-Category Unified Autocomplete Suggestions Dropdown - Bounds strictly to left-0 right-0 w-full */}
      {showSuggestions && activeSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-[#1E1710] border border-[#EFE4D7] dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200 divide-y divide-stone-100 dark:divide-zinc-800/60 max-h-[380px] overflow-y-auto w-full min-w-0">
          {activeSuggestions.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            const badgeLabel = isHi ? item.badgeHindi : item.badge;
            const displayTitle = isHi ? item.titleHindi : item.title;

            return (
              <button
                key={`${item.type}-${item.id}-${idx}`}
                type="button"
                onClick={() => handleSuggestionClick(item)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={cn(
                  "w-full text-left px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 transition-colors cursor-pointer group border-0 outline-none min-w-0 overflow-hidden",
                  isSelected
                    ? "bg-[#FAF2E8] dark:bg-amber-950/30"
                    : "hover:bg-[#FAF2E8]/60 dark:hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-stone-100 dark:bg-zinc-800/80 flex items-center justify-center shrink-0">
                    {renderSuggestionIcon(item)}
                  </div>

                  <div className="flex flex-col min-w-0 flex-1 overflow-hidden gap-0.5">
                    <div className="flex items-center justify-between gap-1.5 min-w-0 w-full">
                      <span className="text-xs sm:text-sm font-extrabold text-[#32251E] dark:text-foreground truncate min-w-0">
                        {displayTitle}
                      </span>
                      <span
                        className={cn(
                          "text-[9px] sm:text-[9.5px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full border leading-none uppercase tracking-wider shrink-0",
                          getBadgeStyle(item.type)
                        )}
                      >
                        {badgeLabel}
                      </span>
                    </div>

                    {item.subtitle && (
                      <span className="text-[10.5px] sm:text-xs text-[#7A6B60] dark:text-muted-foreground/70 truncate block min-w-0">
                        {item.subtitle}
                      </span>
                    )}
                  </div>
                </div>

                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-400 group-hover:text-[#6A2C2A] dark:group-hover:text-[#E8B15C] shrink-0 transition-colors" />
              </button>
            );
          })}

          {/* Footer query trigger */}
          {value.trim() && (
            <button
              type="button"
              onClick={() => {
                setShowSuggestions(false);
                if (onSelectSuggestion) {
                  onSelectSuggestion(value.trim());
                } else {
                  navigate(`/search?q=${encodeURIComponent(value.trim())}`);
                }
              }}
              className="w-full text-left px-3.5 sm:px-4 py-2 bg-stone-50 dark:bg-zinc-900/50 hover:bg-stone-100 dark:hover:bg-zinc-800/80 transition-colors flex items-center justify-between text-xs font-semibold text-[#6A2C2A] dark:text-[#E8B15C] cursor-pointer min-w-0"
            >
              <span className="truncate pr-2 min-w-0">{isHi ? `"${value}" के सभी परिणाम देखें` : `Search all results for "${value}"`}</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
