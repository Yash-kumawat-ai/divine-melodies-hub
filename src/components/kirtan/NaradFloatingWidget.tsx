import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/hooks/useLanguage";
import { useBhajanModalOpen } from "@/hooks/useBhajanModalOpen";
import { useDrawer } from "@/hooks/useDrawer";
import KirtanAIChatCore, {
  type KirtanAIChatCoreHandle,
  type NaradVoicePhase,
} from "@/components/kirtan/KirtanAIChatCore";
import NaradVoiceOverlay from "@/components/kirtan/NaradVoiceOverlay";
import { NARAD_HI } from "@/lib/narad/naradVoiceStrings";
import { resolveNaradActionPath, type NaradActionResult } from "@/lib/narad/naradIntents";
import { ROUTES } from "@/config/routes";
import MorphingAIButton from "@/components/kirtan/MorphingAIButton";

type UiState = "closed" | "voice";

export default function NaradFloatingWidget() {
  const [uiState, setUiState] = useState<UiState>("closed");
  const [voicePhase, setVoicePhase] = useState<NaradVoicePhase>("idle");
  const [isListening, setIsListening] = useState(false);
  const [transcriptPreview, setTranscriptPreview] = useState("");
  const [lastReply, setLastReply] = useState("");
  const [voiceError, setVoiceError] = useState("");
  const { language } = useLanguage();
  const [voiceLang, setVoiceLang] = useState<"hi" | "en">(() => (language === "hi" ? "hi" : "en"));
  const [ttsMuted, setTtsMuted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [shouldMountCore, setShouldMountCore] = useState(false);
  const [coreReady, setCoreReady] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const coreRef = useRef<KirtanAIChatCoreHandle>(null);
  const pendingListenRef = useRef(false);
  const pendingTextRef = useRef("");
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { isBhajanModalOpen } = useBhajanModalOpen();
  const { isOpen: isDrawerOpen } = useDrawer();
  const [isMoreDrawerOpen, setIsMoreDrawerOpen] = useState(false);
  const open = uiState !== "closed";

  useEffect(() => {
    const handleMoreChange = (e: Event) => {
      const customEvt = e as CustomEvent;
      setIsMoreDrawerOpen(!!customEvt.detail?.open);
    };
    window.addEventListener('more-drawer-change', handleMoreChange);
    return () => window.removeEventListener('more-drawer-change', handleMoreChange);
  }, []);

  useEffect(() => {
    if (!open) {
      setShouldMountCore(false);
      setCoreReady(false);
      pendingTextRef.current = "";
      return;
    }
    setShouldMountCore(true);
  }, [open]);

  useEffect(() => {
    if (open) return;
    setVoiceLang(language === "hi" ? "hi" : "en");
  }, [language, open]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAll();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const closeAll = useCallback(() => {
    coreRef.current?.stopListening();
    setUiState("closed");
    setVoicePhase("idle");
    setTranscriptPreview("");
    setVoiceError("");
    pendingListenRef.current = false;
  }, []);

  const startVoiceCapture = useCallback(() => {
    if (!coreRef.current) {
      pendingListenRef.current = true;
      setShouldMountCore(true);
      return;
    }

    if (!coreRef.current?.isVoiceSupported()) {
      setVoiceSupported(false);
      setVoiceError(NARAD_HI.voiceUnsupported);
      setVoicePhase("error");
      return;
    }
    setVoiceError("");
    coreRef.current.startListening();
  }, []);

  const openVoice = useCallback(() => {
    setUiState("voice");
    setVoiceError("");
    if (coreReady && coreRef.current) {
      startVoiceCapture();
    } else {
      pendingListenRef.current = true;
    }
  }, [coreReady, startVoiceCapture]);

  useEffect(() => {
    if (!pendingListenRef.current || uiState !== "voice" || !coreReady) return;
    pendingListenRef.current = false;
    startVoiceCapture();
  }, [uiState, coreReady, startVoiceCapture]);

  const handleFabClick = useCallback(() => {
    if (open) {
      closeAll();
      return;
    }
    openVoice();
  }, [closeAll, open, openVoice]);

  const handleCoreReady = useCallback(() => {
    setCoreReady(true);
    setVoiceSupported(coreRef.current?.isVoiceSupported() ?? false);
  }, []);

  const goNaradChat = useCallback((query?: string) => {
    closeAll();
    const q = query?.trim();
    navigate(q ? `${ROUTES.NARAD_AI}?q=${encodeURIComponent(q)}` : ROUTES.NARAD_AI);
  }, [closeAll, navigate]);

  const handleSubmitText = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    goNaradChat(trimmed);
  }, [goNaradChat]);

  const openChatPanel = useCallback(() => {
    goNaradChat();
  }, [goNaradChat]);

  const handleNaradAction = useCallback((action: NaradActionResult) => {
    const path = resolveNaradActionPath(action);
    closeAll();
    if (path) {
      navigate(path);
      return;
    }
    if (action.kind === "bhajan_search" && action.searchQuery?.trim()) {
      navigate(`${ROUTES.NARAD_AI}?q=${encodeURIComponent(action.searchQuery.trim())}`);
      return;
    }
    navigate(ROUTES.NARAD_AI);
  }, [closeAll, navigate]);

  if (
    isDrawerOpen ||
    isMoreDrawerOpen ||
    isBhajanModalOpen ||
    pathname === "/kirtan-ai" ||
    pathname === "/narad-ai" ||
    pathname.startsWith("/auth") ||
    pathname === "/meditation" ||
    pathname.startsWith("/shorts") ||
    pathname === "/temple" ||
    pathname.startsWith("/temple/")
  ) {
    return null;
  }

  const coreProps = {
    variant: "compact" as const,
    compactDisplay: "hidden" as const,
    voiceLang,
    ttsMuted,
    onCoreReady: handleCoreReady,
    onListeningChange: setIsListening,
    onTranscriptPreview: setTranscriptPreview,
    onVoicePhaseChange: setVoicePhase,
    onBotReplyText: setLastReply,
    onNaradAction: handleNaradAction,
    onVoiceQuery: goNaradChat,
  };

  if (pathname.startsWith("/ask-guru-ji") || pathname === "/kirtan-ai" || pathname === "/narad-ai") {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {open && !isMobile && (
          <motion.button
            key="narad-backdrop"
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-auto fixed inset-0 z-[135] bg-black/40 backdrop-blur-sm"
            aria-label="Close Ask Narad"
            onClick={closeAll}
          />
        )}

        {uiState === "voice" && (
          <NaradVoiceOverlay
            key="narad-voice"
            isMobile={isMobile}
            phase={voicePhase}
            isListening={isListening}
            transcript={transcriptPreview}
            lastReply={lastReply}
            errorMessage={voiceError}
            voiceLang={voiceLang}
            voiceSupported={voiceSupported}
            ttsMuted={ttsMuted}
            reducedMotion={reducedMotion}
            onClose={closeAll}
            onOpenChat={openChatPanel}
            onStartListen={startVoiceCapture}
            onStopListen={() => coreRef.current?.stopListening()}
            onToggleMute={() => setTtsMuted((m) => !m)}
            onRepeat={() => coreRef.current?.repeatLastSpeech()}
            onRetry={startVoiceCapture}
            onToggleLang={() => setVoiceLang((l) => (l === "hi" ? "en" : "hi"))}
            onSubmitText={handleSubmitText}
          />
        )}

        {open && shouldMountCore && (
          <div className="pointer-events-none fixed left-0 top-0 z-0 h-px w-px opacity-0" aria-hidden>
            <KirtanAIChatCore ref={coreRef} {...coreProps} />
          </div>
        )}
      </AnimatePresence>

      <div
        className={cn(
          "pointer-events-none fixed z-[35] flex flex-col items-end",
          pathname === "/join-community" || pathname.startsWith("/community/")
            ? "bottom-[calc(6.75rem+env(safe-area-inset-bottom))] right-4 md:bottom-[max(2rem,env(safe-area-inset-bottom))] md:right-6"
            : "bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-4 md:bottom-[max(1.5rem,env(safe-area-inset-bottom))] md:right-6"
        )}
      >
        {!(open && isMobile) && (
          <div className="pointer-events-auto">
            <MorphingAIButton
              label="Ask Narad"
              onClick={handleFabClick}
            />
          </div>
        )}
      </div>
    </>
  );
}
