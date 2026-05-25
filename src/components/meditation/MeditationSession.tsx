import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import OmMandalaCanvas from "@/components/meditation/OmMandalaCanvas";
import MeditationControls from "@/components/meditation/MeditationControls";
import { MeditationTopBar } from "@/components/meditation/MeditationControls";
import BreathCoach from "@/components/meditation/BreathCoach";
import SessionCompleteOverlay from "@/components/meditation/SessionCompleteOverlay";
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
        background: "radial-gradient(circle at center, #2d1200 0%, #090011 45%, #000000 100%)",
        filter: practice.visualMode === "dim" ? "brightness(0.55)" : undefined,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(251,191,36,0.08),transparent_50%)]"
        aria-hidden
      />

      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {session.liveMessage}
      </div>

      <MeditationTopBar showUi={showUi} onBack={onExit} onToggleUi={onToggleUi} />

      {showSankalp && session.phase === "idle" && !session.showComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-auto absolute left-4 right-4 top-[max(4rem,env(safe-area-inset-top))] z-20 mx-auto max-w-md"
        >
          <div className="rounded-2xl border border-amber-400/20 bg-black/50 p-4 backdrop-blur-md">
            <p className="text-xs uppercase tracking-widest text-amber-200/50">Sankalp · intention</p>
            <input
              type="text"
              value={session.sankalp}
              onChange={(e) => session.setSankalp(e.target.value)}
              placeholder="Optional intention for this session..."
              className="mt-2 w-full border-0 bg-transparent text-sm text-amber-50 placeholder:text-white/30 focus:outline-none"
              aria-label="Session intention"
            />
            <button
              type="button"
              onClick={() => setShowSankalp(false)}
              className="mt-2 text-xs text-amber-300/80"
            >
              Skip
            </button>
          </div>
        </motion.div>
      )}

      <div
        className={cn(
          "relative flex flex-1 items-center justify-center px-2",
          showUi ? "pt-14 pb-[min(38vh,280px)]" : "py-8",
        )}
        onClick={() => setShowUi(true)}
        role="presentation"
      >
        {isBreath ? (
          <BreathCoach
            patternId={practice.breathPattern!}
            active={session.active}
            reducedMotion={prefs.reducedMotion}
          />
        ) : showMandala ? (
          <OmMandalaCanvas
            active={session.active && !prefs.reducedMotion}
            breath={session.breath}
            audioEnergy={session.audioEnergy}
            speed={mandalaSpeed}
            minimal={practice.visualMode === "minimal"}
          />
        ) : null}
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
