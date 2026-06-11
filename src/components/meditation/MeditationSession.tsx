import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import OmMandalaCanvas from "@/components/meditation/OmMandalaCanvas";
import MeditationControls from "@/components/meditation/MeditationControls";
import { MeditationTopBar } from "@/components/meditation/MeditationControls";
import BreathCoach from "@/components/meditation/BreathCoach";
import SessionCompleteOverlay from "@/components/meditation/SessionCompleteOverlay";
import { useLanguage } from "@/hooks/useLanguage";
import { getMeditationCopy } from "@/lib/meditation/meditationLocale";
import type { MeditationPractice } from "@/lib/meditation/meditationTypes";
import { MANTRA_PRACTICES } from "@/lib/meditation/meditationTypes";
import { useMeditationSession } from "@/hooks/useMeditationSession";
import { cn } from "@/lib/utils";

type MeditationSessionProps = {
  practice: MeditationPractice;
  onExit: () => void;
  onPracticeChange: (practice: MeditationPractice) => void;
};

export default function MeditationSession({ practice, onExit, onPracticeChange }: MeditationSessionProps) {
  const { language } = useLanguage();
  const copy = getMeditationCopy(language);
  const [showUi, setShowUi] = useState(true);
  const [showSankalp, setShowSankalp] = useState(true);
  const session = useMeditationSession(practice);
  const { prefs } = session;

  const onToggleUi = useCallback(() => setShowUi((v) => !v), []);

  const isBreath = practice.type === "breath" && practice.breathPattern;
  const showMandala = practice.visualMode !== "breath_ring";
  const mandalaSpeed = prefs.reducedMotion ? 0.35 : session.active ? 1 : 0.35;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] flex flex-col overflow-hidden",
        prefs.highContrast && "contrast-more",
      )}
      style={{
        background:
          "radial-gradient(circle at 50% 35%, rgba(245,158,11,0.22) 0%, rgba(15,23,42,0.06) 34%, transparent 58%), radial-gradient(circle at 15% 15%, rgba(244,63,94,0.12), transparent 30%), radial-gradient(circle at 86% 18%, rgba(20,184,166,0.11), transparent 28%), linear-gradient(180deg, #13070b 0%, #07030a 58%, #020106 100%)",
        filter: practice.visualMode === "dim" ? "brightness(0.55)" : undefined,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(251,191,36,0.10),transparent_52%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/55 to-transparent"
        aria-hidden
      />

      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {session.liveMessage}
      </div>

      <MeditationTopBar showUi={showUi} onBack={onExit} onToggleUi={onToggleUi} />

      {showSankalp && session.phase === "idle" && !session.showComplete && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-auto absolute left-4 right-4 top-[max(4.25rem,env(safe-area-inset-top))] z-20 mx-auto max-w-md"
        >
          <div className="overflow-hidden rounded-3xl border border-amber-200/18 bg-black/45 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-widest text-amber-200/55">{copy.session.sankalp}</p>
            <input
              type="text"
              value={session.sankalp}
              onChange={(e) => session.setSankalp(e.target.value)}
              placeholder={copy.session.sankalpPlaceholder}
              className="mt-2 w-full border-0 bg-transparent text-sm text-amber-50 placeholder:text-white/32 focus:outline-none"
              aria-label="Session intention"
            />
            <button
              type="button"
              onClick={() => setShowSankalp(false)}
              className="mt-3 rounded-full border border-amber-200/15 px-3 py-1.5 text-xs text-amber-200/85"
            >
              {copy.session.skip}
            </button>
          </div>
        </motion.div>
      )}

      <div
        className={cn(
          "relative flex flex-1 items-center justify-center px-2",
          showUi ? "pt-16 pb-[min(42vh,330px)]" : "py-8",
        )}
        onClick={() => setShowUi(true)}
        role="presentation"
      >
        {/* Visualizer animation removed and kept blank as requested */}
      </div>

      <MeditationControls
        practice={practice}
        session={session}
        mantraOptions={MANTRA_PRACTICES}
        showUi={showUi}
        onMantraPracticeChange={onPracticeChange}
      />

      {session.showComplete && (
        <SessionCompleteOverlay
          stats={session.stats}
          onDone={(payload) => {
            session.finishSession(payload);
            onExit();
          }}
        />
      )}
    </div>
  );
}
