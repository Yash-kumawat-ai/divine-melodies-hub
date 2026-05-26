import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Flower2, Mic, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/hooks/useLanguage";
import KirtanAIChatCore, {
  type KirtanAIChatCoreHandle,
  type NaradVoicePhase,
} from "@/components/kirtan/KirtanAIChatCore";
import OmMandalaOrb from "@/components/kirtan/OmMandalaOrb";
import NaradVoiceOverlay from "@/components/kirtan/NaradVoiceOverlay";
import {
  NARAD_HI,
  NARAD_VOICE_ERRORS,
  PRIVACY_STORAGE_KEY,
} from "@/lib/narad/naradVoiceStrings";
import { OM } from "@/lib/meditation/unicode";
import JapaCounter from "@/components/devotion/JapaCounter";
import OfferingMiniPanel from "@/components/devotion/OfferingMiniPanel";
import DevotionActionCard from "@/components/devotion/DevotionActionCard";
import { loadDevotionProgress } from "@/lib/devotion/devotionStorage";
import type { NaradActionResult } from "@/lib/narad/naradIntents";

type UiState = "closed" | "voice" | "chat" | "japa" | "action" | "offering";

const FAB_SIZE = 72;
const HEADER_ORB_SIZE = 120;

/**
 * Tap FAB → voice listen → full Ask Narad chat panel with results.
 */
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
  const [needsPrivacy, setNeedsPrivacy] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [shouldMountCore, setShouldMountCore] = useState(false);
  const [coreReady, setCoreReady] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [activeAction, setActiveAction] = useState<NaradActionResult | null>(null);
  const [devotionProgress, setDevotionProgress] = useState(loadDevotionProgress);
  const coreRef = useRef<KirtanAIChatCoreHandle>(null);
  const pendingListenRef = useRef(false);
  const pendingTextRef = useRef("");
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const open = uiState !== "closed";

  useEffect(() => {
    if (!open) {
      setShouldMountCore(false);
      setCoreReady(false);
      pendingTextRef.current = "";
      return;
    }

    if (uiState === "chat") {
      setShouldMountCore(true);
      return;
    }

    const timer = window.setTimeout(() => setShouldMountCore(true), 140);
    return () => window.clearTimeout(timer);
  }, [open, uiState]);

  useEffect(() => {
    if (open) return;
    setVoiceLang(language === "hi" ? "hi" : "en");
  }, [language, open]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (!localStorage.getItem(PRIVACY_STORAGE_KEY)) setNeedsPrivacy(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAll();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open || !isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, isMobile]);

  /** After voice query, open chat for results unless japa/offering panel is active. */
  useEffect(() => {
    if (uiState !== "voice") return;
    if (voicePhase !== "thinking" && voicePhase !== "speaking" && voicePhase !== "result") return;
    if (activeAction?.kind === "japa_start" || activeAction?.kind === "offering") return;
    setUiState("chat");
  }, [activeAction?.kind, uiState, voicePhase]);

  const closeAll = useCallback(() => {
    coreRef.current?.stopListening();
    setUiState("closed");
    setVoicePhase("idle");
    setTranscriptPreview("");
    setVoiceError("");
    setActiveAction(null);
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
    if (needsPrivacy) {
      setShowPrivacy(true);
      return;
    }
    openVoice();
  }, [closeAll, needsPrivacy, open, openVoice]);

  const acceptPrivacy = useCallback(() => {
    localStorage.setItem(PRIVACY_STORAGE_KEY, "1");
    setNeedsPrivacy(false);
    setShowPrivacy(false);
    openVoice();
  }, [openVoice]);

  const handleVoiceError = useCallback((codeOrMsg: string) => {
    const msg =
      codeOrMsg === "no-speech"
        ? NARAD_HI.noSpeech
        : NARAD_VOICE_ERRORS[codeOrMsg] ?? codeOrMsg;
    setVoiceError(msg);
    setVoicePhase("error");
  }, []);

  const handleCoreReady = useCallback(() => {
    setCoreReady(true);
    setVoiceSupported(coreRef.current?.isVoiceSupported() ?? false);
    const pendingText = pendingTextRef.current.trim();
    if (pendingText) {
      pendingTextRef.current = "";
      coreRef.current?.submitQuery(pendingText);
    }
  }, []);

  const handleSubmitText = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setUiState("chat");
    setShouldMountCore(true);
    if (coreReady && coreRef.current) {
      coreRef.current.submitQuery(trimmed);
      return;
    }
    pendingTextRef.current = trimmed;
  }, [coreReady]);

  const openChatPanel = useCallback(() => {
    coreRef.current?.stopListening();
    setUiState("chat");
    setVoicePhase("idle");
  }, []);

  const handleNaradAction = useCallback((action: NaradActionResult) => {
    setActiveAction(action);
    setLastReply(action.spokenText);

    if (action.kind === "route" && action.route) {
      coreRef.current?.stopListening();
      setUiState("chat");
      navigate(action.route);
      return;
    }

    if (action.kind === "japa_start") {
      coreRef.current?.stopListening();
      setUiState("japa");
      return;
    }

    if (action.kind === "offering") {
      coreRef.current?.stopListening();
      setUiState("offering");
      return;
    }

    if (action.kind === "bhajan_search") {
      setUiState("chat");
      return;
    }

    setUiState(action.kind === "daily_devotion" || action.kind === "answer" ? "action" : "chat");
  }, [navigate]);

  const handleActionPrimary = useCallback(() => {
    if (!activeAction) return;

    if (activeAction.kind === "offering") {
      setUiState("offering");
      return;
    }

    if (activeAction.kind === "daily_devotion") {
      setUiState("japa");
      return;
    }

    if (activeAction.kind === "japa_start") {
      setUiState("japa");
      return;
    }

    if (activeAction.kind === "route" && activeAction.route) {
      closeAll();
      navigate(activeAction.route);
      return;
    }

    if (activeAction.kind === "bhajan_search" && activeAction.searchQuery) {
      setUiState("chat");
      coreRef.current?.submitQuery(activeAction.searchQuery);
    }
  }, [activeAction, closeAll, navigate]);

  if (pathname === "/kirtan-ai") {
    return null;
  }

  const fabOrbState =
    isListening || voicePhase === "listening"
      ? "listening"
      : voicePhase === "thinking"
        ? "thinking"
        : voicePhase === "speaking"
          ? "speaking"
          : "idle";

  const coreProps = {
    variant: "compact" as const,
    compactDisplay: (uiState === "chat" ? "full" : "hidden") as "full" | "hidden",
    voiceLang,
    ttsMuted,
    onCoreReady: handleCoreReady,
    onListeningChange: setIsListening,
    onTranscriptPreview: setTranscriptPreview,
    onVoicePhaseChange: setVoicePhase,
    onBotReplyText: setLastReply,
    onVoiceError: handleVoiceError,
    onNaradAction: handleNaradAction,
  };

  return (
    <>
      <AnimatePresence>
        {showPrivacy && (
          <motion.div
            key="narad-privacy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-auto fixed inset-0 z-[140] flex items-center justify-center bg-black/50 p-4"
            role="dialog"
            aria-labelledby="narad-title"
          >
            <div className="max-w-sm rounded-2xl border border-amber-400/25 bg-[#1a0f0a] p-5 shadow-xl">
              <div className="flex items-start justify-between gap-3">
                <h2 id="narad-title" className="font-display text-lg text-amber-50">
                  {NARAD_HI.privacyTitle}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowPrivacy(false)}
                  className="rounded-full p-1 text-amber-100/60 hover:bg-white/10"
                  aria-label="Close microphone notice"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-amber-100/75">{NARAD_HI.privacyBody}</p>
              <button
                type="button"
                onClick={acceptPrivacy}
                className="mt-4 w-full rounded-full bg-gradient-to-r from-amber-600 to-orange-600 py-2.5 text-sm font-semibold text-amber-50"
              >
                {NARAD_HI.privacyOk}
              </button>
            </div>
          </motion.div>
        )}

        {open && !isMobile && (
          <motion.button
            key="narad-backdrop"
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-auto fixed inset-0 z-[135] bg-[#1a0f0a]/35 backdrop-blur-[2px]"
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

        {uiState === "action" && activeAction && (
          <motion.div
            key="narad-action"
            initial={isMobile ? { opacity: 0, y: "100%" } : { opacity: 0, scale: 0.96, y: 16 }}
            animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={isMobile ? { opacity: 0, y: "100%" } : { opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className={cn(
              "pointer-events-auto fixed z-[140] overflow-hidden border border-amber-200/20 bg-[linear-gradient(160deg,rgba(45,18,0,0.94),rgba(20,0,31,0.92))] p-4 shadow-[0_20px_60px_-12px_rgba(45,18,0,0.65)] backdrop-blur-xl",
              isMobile
                ? "inset-x-0 bottom-0 rounded-t-3xl"
                : "bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-[max(0.75rem,env(safe-area-inset-right))] w-[min(360px,calc(100vw-1.5rem))] rounded-3xl",
            )}
            role="dialog"
            aria-label="Narad devotional action"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-100">
                <Flower2 className="h-4 w-4" />
                <span className="text-sm font-medium">Narad action</span>
              </div>
              <button type="button" onClick={closeAll} className="rounded-full p-2 text-amber-100/70 hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </div>
            <DevotionActionCard
              action={activeAction}
              compact
              streak={devotionProgress.currentStreak}
              reducedMotion={reducedMotion}
              onPrimary={handleActionPrimary}
              onSecondary={openChatPanel}
            />
          </motion.div>
        )}

        {uiState === "japa" && (
          <JapaCounter
            mantraLabel={activeAction?.mantra ?? "Om Namah Shivaya"}
            deitySlug={activeAction?.deitySlug}
            reducedMotion={reducedMotion}
            onClose={closeAll}
            onComplete={() => setDevotionProgress(loadDevotionProgress())}
          />
        )}

        {uiState === "offering" && activeAction && (
          <OfferingMiniPanel
            initialType={activeAction.offeringType ?? "flower"}
            deitySlug={activeAction.deitySlug}
            reducedMotion={reducedMotion}
            onClose={closeAll}
            onDone={() => setDevotionProgress(loadDevotionProgress())}
          />
        )}

        {open && shouldMountCore && (
          <motion.div
            key="narad-host"
            role="dialog"
            aria-labelledby={uiState === "chat" ? "narad-chat-title" : undefined}
            aria-hidden={uiState !== "chat"}
            initial={uiState === "chat" ? (isMobile ? { opacity: 0, y: "100%" } : { opacity: 0, scale: 0.94, y: 12 }) : false}
            animate={
              uiState === "chat"
                ? isMobile
                  ? { opacity: 1, y: 0 }
                  : { opacity: 1, scale: 1, y: 0 }
                : { opacity: 0 }
            }
            exit={isMobile ? { opacity: 0, y: "100%" } : { opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className={cn(
              "flex flex-col overflow-hidden",
              uiState === "chat"
                ? cn(
                    "pointer-events-auto z-[140]",
                    "border border-[#eab308]/25 bg-[linear-gradient(145deg,hsl(43_92%_95%/0.98),hsl(25_76%_97%/0.92)_40%,hsl(350_52%_98%/0.96))] backdrop-blur-xl",
                    isMobile
                      ? "fixed inset-0 z-[140] h-[100dvh] w-full max-h-none rounded-none shadow-none"
                      : "fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-[max(0.75rem,env(safe-area-inset-right))] mb-0 max-h-[min(80dvh,640px)] w-[min(360px,calc(100vw-1.25rem))] rounded-2xl shadow-[0_20px_50px_-12px_rgba(114,63,34,0.45)] md:bottom-[calc(1rem+env(safe-area-inset-bottom))] md:right-[max(1rem,env(safe-area-inset-right))]",
                  )
                : "pointer-events-none fixed left-0 top-0 z-0 h-px w-px opacity-0",
            )}
          >
            {uiState === "chat" && (
              <>
                <div
                  className={cn(
                    "relative shrink-0 border-b border-[#eab308]/20 bg-[linear-gradient(90deg,#7f1d1d/8,transparent,#b45309/10)] px-4 py-3",
                    isMobile && "pt-[max(0.75rem,env(safe-area-inset-top))]",
                  )}
                >
                  <div className="relative flex items-start justify-between gap-2">
                    <div>
                      <h2 id="narad-chat-title" className="font-display text-xl font-semibold tracking-tight text-[#571c1c]">
                        Ask Narad
                      </h2>
                      <p className="text-xs text-[#6b4423]/85">Your devotional music companion · Hari Kirtan</p>
                    </div>
                    <button
                      type="button"
                      onClick={closeAll}
                      className="rounded-full bg-white/50 p-2 text-[#571c1c] transition hover:bg-white/90"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <Link
                    to="/kirtan-ai"
                    className="relative mt-2 inline-block text-[11px] font-medium text-[#b45309] underline-offset-4 hover:underline"
                    onClick={closeAll}
                  >
                    Open full sacred studio →
                  </Link>
                </div>

                {(isListening || transcriptPreview.trim()) && (
                  <div className="relative shrink-0 border-b border-[#eab308]/20 bg-[radial-gradient(ellipse_at_center,#2d1200_0%,#14001f_50%,#0d0d18_100%)] py-4">
                    <div className="relative mx-auto flex w-fit flex-col items-center">
                      {isListening && !reducedMotion && (
                        <>
                          <span className="pointer-events-none absolute -inset-4 animate-ping rounded-full bg-amber-400/35" aria-hidden />
                          <span className="pointer-events-none absolute -inset-8 animate-ping rounded-full bg-violet-400/20 [animation-delay:400ms]" aria-hidden />
                        </>
                      )}
                      <OmMandalaOrb
                        active
                        listening={isListening}
                        size={HEADER_ORB_SIZE}
                        className="relative shadow-[0_0_40px_rgba(255,160,60,0.45)]"
                      />
                    </div>
                    <p className="relative mt-3 text-center text-sm font-medium text-[#ffe29a]">
                      {isListening ? NARAD_HI.listening : NARAD_HI.heardYou}
                    </p>
                    {transcriptPreview.trim() ? (
                      <p className="relative mx-auto mt-2 max-w-[92%] text-center text-sm leading-relaxed text-[#fff8e7]/90">
                        &ldquo;{transcriptPreview.trim()}&rdquo;
                      </p>
                    ) : null}
                  </div>
                )}
              </>
            )}

            <div
              className={cn(
                "flex min-h-0 flex-col overflow-hidden",
                uiState === "chat" && "flex-1 bg-[#fffdf9]/85",
              )}
            >
              <KirtanAIChatCore
                ref={coreRef}
                {...coreProps}
                className={uiState === "chat" ? "min-h-0 flex-1" : undefined}
                inputPlaceholder={uiState === "chat" ? NARAD_HI.micFallback : undefined}
              />
            </div>

            {uiState === "chat" && (
              <div
                className={cn(
                  "flex shrink-0 items-center justify-center gap-2 border-t border-[#eab308]/15 py-2.5 text-[10px] text-[#92400e]/70",
                  isMobile && "pb-[max(0.5rem,env(safe-area-inset-bottom))]",
                )}
              >
                <button
                  type="button"
                  onClick={() => coreRef.current?.startListening()}
                  className={cn(
                    "pointer-events-auto flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition",
                    isListening
                      ? "border-amber-400/60 bg-amber-500/20 text-[#7c2d12]"
                      : "border-[#eab308]/40 bg-white/60 text-[#6b4423] hover:border-[#f59e0b]",
                  )}
                >
                  <Mic className={cn("h-3.5 w-3.5", isListening && "animate-pulse text-amber-600")} />
                  {isListening ? "Listening…" : "Tap to speak"}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={cn(
          "pointer-events-none fixed z-[140] flex flex-col items-end",
          "bottom-[calc(4.25rem+env(safe-area-inset-bottom))] right-[max(0.75rem,env(safe-area-inset-right))] md:bottom-[max(1rem,env(safe-area-inset-bottom))]",
        )}
      >
        {!(open && isMobile) && (
          <motion.button
            type="button"
            aria-expanded={open}
            aria-haspopup="dialog"
            aria-label={open ? "Close Ask Narad" : "Open Ask Narad and speak"}
            onClick={handleFabClick}
            whileTap={{ scale: 0.94 }}
            className={cn(
              "pointer-events-auto relative flex shrink-0 items-center justify-center overflow-hidden rounded-full",
              "border-2 border-amber-200/45 shadow-[0_12px_32px_rgba(45,18,0,0.45),0_0_24px_rgba(255,140,60,0.3)]",
              "outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
            )}
            style={{ width: FAB_SIZE, height: FAB_SIZE }}
          >
            <span
              className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-amber-400/35 via-rose-400/20 to-violet-500/25"
              aria-hidden
            />
            {(open || isListening) && !reducedMotion && (
              <span className="pointer-events-none absolute -inset-1.5 animate-ping rounded-full bg-amber-400/25" />
            )}
            <OmMandalaOrb
              voiceState={fabOrbState}
              active={open || isListening}
              listening={isListening}
              reducedMotion={reducedMotion}
              drawCenterOm={false}
              size={FAB_SIZE}
              className="relative opacity-90"
            />
            <span
              className="pointer-events-none absolute inset-0 flex items-center justify-center font-display text-[22px] font-bold text-amber-50 drop-shadow-[0_0_10px_rgba(255,200,100,0.85)]"
              aria-hidden
            >
              {OM}
            </span>
          </motion.button>
        )}
      </div>
    </>
  );
}
