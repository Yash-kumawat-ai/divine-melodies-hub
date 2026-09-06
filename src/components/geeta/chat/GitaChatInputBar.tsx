import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Sparkles, User, Edit2, Check, X, Loader2, ShieldCheck, Search } from 'lucide-react';
import { VoiceManager, checkVoiceSupport } from '@/lib/voiceUtils';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface GitaChatInputBarProps {
  onSendMessage: (query: string) => void;
  isLoading: boolean;
  isHindi: boolean;
  userName: string;
  onUpdateUserName: (newName: string) => void;
  isQuotaExhausted: boolean;
  variant?: 'hero' | 'dock';
  autoFocus?: boolean;
}

export function GitaChatInputBar({
  onSendMessage,
  isLoading,
  isHindi,
  userName,
  onUpdateUserName,
  isQuotaExhausted,
  variant = 'dock',
  autoFocus = false,
}: GitaChatInputBarProps) {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const inputRef = useRef<HTMLInputElement>(null);
  const voiceManagerRef = useRef<VoiceManager | null>(null);

  useEffect(() => {
    setTempName(userName);
  }, [userName]);

  // Focus on mount if autoFocus is true
  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  // Initialize Speech-to-Text Voice Manager
  useEffect(() => {
    const { speechRecognition } = checkVoiceSupport();
    if (speechRecognition) {
      voiceManagerRef.current = new VoiceManager({
        language: isHindi ? 'hi-IN' : 'en-US',
        onSpeechStart: () => setIsRecording(true),
        onSpeechEnd: () => setIsRecording(false),
        onError: () => {
          setIsRecording(false);
          toast.error(isHindi ? 'आवाज़ पहचानने में त्रुटि हुई।' : 'Speech recognition error.');
        },
      });
    }

    return () => {
      voiceManagerRef.current?.stopListening();
    };
  }, [isHindi]);

  const toggleRecording = async () => {
    if (!voiceManagerRef.current) {
      toast.error(
        isHindi
          ? 'आपके ब्राउज़र में आवाज़ पहचान समर्थित नहीं है।'
          : 'Voice input not supported on this browser.'
      );
      return;
    }

    if (isRecording) {
      voiceManagerRef.current.stopListening();
      setIsRecording(false);
    } else {
      try {
        await voiceManagerRef.current.startListening((transcript, isFinal) => {
          setInputText(transcript);
          if (isFinal) {
            setIsRecording(false);
          }
        });
        setIsRecording(true);
        toast.info(isHindi ? 'बोलना प्रारंभ करें...' : 'Listening, please speak...');
      } catch (err) {
        setIsRecording(false);
        console.error('Failed to start voice input:', err);
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isLoading || isQuotaExhausted) return;
    onSendMessage(trimmed);
    setInputText('');
  };

  const handleSaveName = () => {
    const trimmed = tempName.trim();
    if (trimmed) {
      onUpdateUserName(trimmed);
      toast.success(isHindi ? `नाम अपडेट किया गया: ${trimmed}` : `Name updated: ${trimmed}`);
    }
    setIsEditingName(false);
  };

  const isHero = variant === 'hero';

  return (
    <div className={cn('w-full', isHero ? 'space-y-3.5 max-w-2xl mx-auto' : 'space-y-2 max-w-4xl mx-auto')}>
      {/* 1. Main Big Search Bar Input Card */}
      <form onSubmit={handleFormSubmit} className="w-full min-w-0">
        <div
          className={cn(
            'relative flex items-center bg-card dark:bg-[#1E1710] transition-all duration-300 w-full min-w-0',
            isHero
              ? 'rounded-[28px] sm:rounded-[32px] border-2 border-[#EFE4D7] dark:border-zinc-800 shadow-[0_14px_45px_rgba(80,45,20,0.08)] px-3.5 sm:px-5 h-14 sm:h-16 gap-2.5 sm:gap-3.5 hover:border-brand-primary/60 dark:hover:border-[#E8B15C]/60 focus-within:border-brand-primary dark:focus-within:border-[#E8B15C] focus-within:ring-4 focus-within:ring-[#6A2C2A]/10 dark:focus-within:ring-[#E8B15C]/15'
              : 'rounded-[28px] border border-[#EFE4D7] dark:border-zinc-800/80 shadow-[0_12px_40px_rgba(80,45,20,0.06)] px-3 sm:px-4 h-12 sm:h-14 gap-2 sm:gap-3 focus-within:border-[#6A2C2A] dark:focus-within:border-[#E8B15C] focus-within:ring-2 focus-within:ring-[#6A2C2A]/10',
            isQuotaExhausted && 'border-rose-500/30 opacity-75 cursor-not-allowed'
          )}
        >
          {/* Left Sparkles / Search Icon Badge */}
          <div
            className={cn(
              'rounded-full bg-[#651317]/8 dark:bg-amber-400/10 flex items-center justify-center shrink-0 select-none transition-transform',
              isHero ? 'w-8 h-8 sm:w-10 sm:h-10' : 'w-7 h-7 sm:w-8 sm:h-8'
            )}
          >
            {isHero ? (
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#6A2C2A] dark:text-[#E8B15C] shrink-0 pointer-events-none" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6A2C2A] dark:text-[#E8B15C] shrink-0 pointer-events-none" />
            )}
          </div>

          {/* Text Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isQuotaExhausted || isLoading}
            placeholder={
              isQuotaExhausted
                ? isHindi
                  ? 'दैनिक संदेश सीमा पूर्ण हो चुकी है (मध्यरात्रि रीसेट)'
                  : 'Daily limit reached (resets at midnight)'
                : isRecording
                ? isHindi
                  ? 'आपकी वाणी सुनी जा रही है...'
                  : 'Listening to your voice...'
                : isHero
                ? isHindi
                  ? 'अपने मन की बात यहाँ लिखें... (उदा. अशांत मन, परीक्षा का डर, क्रोध)'
                  : 'What is troubling your mind today? (e.g. overthinking, anger, fear)'
                : isHindi
                ? 'श्रीकृष्ण से कुछ भी पूछें... (जैसे: अशांत मन, क्रोध, कर्म योग)'
                : 'Ask Shri Krishna anything... (e.g. overthinking, anger, karma)'
            }
            className={cn(
              'flex-1 min-w-0 w-full bg-transparent border-0 outline-none focus:outline-none focus:ring-0 text-[#32251E] dark:text-foreground font-medium placeholder:text-[#7A6B60]/70 py-2 select-text',
              isHero ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'
            )}
            aria-label={isHindi ? 'प्रश्न पूछें' : 'Ask question'}
          />

          {/* Clear Button (X) */}
          {inputText && (
            <button
              type="button"
              onClick={() => setInputText('')}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-white transition-colors focus:outline-none cursor-pointer p-1 rounded-full hover:bg-stone-100 dark:hover:bg-white/10 shrink-0"
              title={isHindi ? 'हटाएं' : 'Clear text'}
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}

          {/* Voice Mic Button */}
          <button
            type="button"
            onClick={toggleRecording}
            disabled={isQuotaExhausted || isLoading}
            className={cn(
              'rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer text-[#6A2C2A] dark:text-[#E8B15C] hover:bg-[#651317]/15 dark:hover:bg-amber-400/20 active:scale-95',
              isHero ? 'w-9 h-9 sm:w-10 sm:h-10' : 'w-8 h-8 sm:w-9 sm:h-9',
              isRecording
                ? 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 animate-pulse ring-2 ring-red-500/30'
                : 'bg-[#651317]/8 dark:bg-amber-400/10'
            )}
            title={
              isRecording
                ? isHindi
                  ? 'सुनना रोकें'
                  : 'Stop listening'
                : isHindi
                ? 'बोलकर पूछें (Voice input)'
                : 'Voice input'
            }
            aria-label="Voice input"
          >
            {isRecording ? (
              <Loader2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 animate-spin text-red-600" />
            ) : (
              <Mic className={cn(isHero ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-3.5 h-3.5 sm:w-4 sm:h-4')} />
            )}
          </button>

          {/* High-Contrast Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading || isQuotaExhausted}
            className={cn(
              'rounded-full flex items-center justify-center transition-all shrink-0 duration-200',
              isHero
                ? 'w-9 h-9 sm:w-11 sm:h-11'
                : 'w-8 h-8 sm:w-9 sm:h-9',
              inputText.trim() && !isLoading && !isQuotaExhausted
                ? 'bg-brand-primary text-primary-foreground shadow-sm hover:bg-[#7B2011] active:scale-95 cursor-pointer'
                : isHero
                ? 'bg-brand-primary/40 text-primary-foreground/70 cursor-not-allowed'
                : 'bg-muted text-muted-foreground/50 cursor-not-allowed opacity-60 hidden sm:flex'
            )}
            title={isHindi ? 'संदेश भेजें' : 'Send message'}
            aria-label="Send message"
          >
            <Send className={cn(isHero ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-3.5 h-3.5 sm:w-4 sm:h-4')} />
          </button>
        </div>
      </form>

      {/* 2. User Name Addressing Indicator */}
      <div
        className={cn(
          'flex items-center justify-between text-xs text-muted-foreground px-2',
          isHero ? 'max-w-2xl mx-auto pt-0.5' : 'max-w-4xl mx-auto'
        )}
      >
        <div className="flex items-center gap-2">
          {isEditingName ? (
            <div className="flex items-center gap-1.5 bg-white dark:bg-[#1E1710] border border-[#EFE4D7] dark:border-zinc-800 rounded-full px-2.5 py-0.5 shadow-2xs">
              <span className="text-[11px] text-[#6A2C2A] dark:text-[#E8B15C] font-semibold">
                {isHindi ? 'आपका नाम:' : 'Your name:'}
              </span>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                className="bg-transparent border-none text-xs text-foreground focus:outline-none w-24 sm:w-32 font-medium"
                placeholder={isHindi ? 'अपना नाम लिखें' : 'Enter name'}
                autoFocus
              />
              <button
                type="button"
                onClick={handleSaveName}
                className="text-emerald-600 hover:text-emerald-700 cursor-pointer p-0.5"
                title={isHindi ? 'सहेजें' : 'Save'}
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingName(true)}
              className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors group px-2.5 py-0.5 rounded-full bg-[#FAF7F2] dark:bg-zinc-900 border border-[#EFE4D7] dark:border-zinc-800 shadow-2xs cursor-pointer"
              title={isHindi ? 'नाम बदलें' : 'Change name'}
            >
              <User className="w-3 h-3 text-[#6A2C2A] dark:text-[#E8B15C]" />
              <span>
                {isHindi ? 'संबोधन:' : 'Addressing:'}{' '}
                <strong className="text-foreground group-hover:text-brand-primary dark:group-hover:text-[#E8B15C] transition-colors font-semibold">
                  {userName || (isHindi ? 'प्रिय मित्र' : 'Dear Friend')}
                </strong>
              </span>
              <Edit2 className="w-2.5 h-2.5 text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity ml-0.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="hidden sm:inline">
            {isHindi ? 'हिन्दी • Hinglish • English' : 'Hindi, Hinglish & English'}
          </span>
        </div>
      </div>
    </div>
  );
}


