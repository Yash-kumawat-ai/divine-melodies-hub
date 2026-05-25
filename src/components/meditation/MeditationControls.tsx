import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, Pause, Play, Volume2, Settings2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { MeditationPractice, MantraId } from "@/lib/meditation/meditationTypes";
import type { useMeditationSession } from "@/hooks/useMeditationSession";
import type { AmbienceId } from "@/lib/meditation/meditationTypes";
import { OM } from "@/lib/meditation/unicode";

type SessionApi = ReturnType<typeof useMeditationSession>;

type MeditationControlsProps = {
  practice: MeditationPractice;
  session: SessionApi;
  mantraOptions: MeditationPractice[];
  showUi: boolean;
  onMantraPracticeChange?: (practice: MeditationPractice) => void;
};

const AMBIENCE_LABELS: Record<AmbienceId, string> = {
  tanpura: "Tanpura",
  bell: "Interval bell",
  rain: "Rain",
  river: "River",
  flute: "Flute",
  silence: "Silence only",
};

export default function MeditationControls({
  practice,
  session,
  mantraOptions,
  showUi,
  onMantraPracticeChange,
}: MeditationControlsProps) {
  const [expanded, setExpanded] = useState(false);
  const { prefs, updatePrefs, phase, active, formattedTime, japaCount, incrementJapa } = session;
  const isPaused = phase === "paused";
  const canStart = phase === "idle" || phase === "paused" || phase === "complete";

  const selectedMantra = mantraOptions.find((m) => m.mantraId === practice.mantraId);

  return (
    <AnimatePresence>
      {showUi && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <div
            className="mx-auto max-w-md overflow-hidden rounded-2xl border border-amber-200/15 shadow-lg backdrop-blur-xl"
            style={{
              background:
                "linear-gradient(145deg, rgba(45,18,0,0.82) 0%, rgba(20,0,31,0.72) 100%)",
            }}
          >
            <div className="flex items-center justify-between gap-2 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-xs text-amber-200/70">{practice.title}</p>
                <p className="font-mono text-2xl tabular-nums text-amber-50">{formattedTime}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                {canStart ? (
                  <button
                    type="button"
                    onClick={session.begin}
                    className="flex h-11 items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 px-4 text-sm font-semibold text-amber-50"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    {isPaused ? "Resume" : "Begin"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={session.pause}
                    className="flex h-11 items-center gap-1.5 rounded-full border border-amber-400/35 px-4 text-sm text-amber-100"
                  >
                    <Pause className="h-4 w-4" />
                    Pause
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setExpanded((e) => !e)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-amber-100"
                  aria-expanded={expanded}
                  aria-label={expanded ? "Collapse settings" : "Expand settings"}
                >
                  {expanded ? <ChevronUp className="h-5 w-5" /> : <Settings2 className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {practice.type === "mantra" && active && (
              <div className="border-t border-amber-400/10 px-4 py-2 text-center">
                <p className="text-lg text-amber-100/90">{selectedMantra?.chant}</p>
                <button
                  type="button"
                  onClick={incrementJapa}
                  className="mt-2 text-xs text-amber-300/80"
                >
                  Japa · {japaCount} / {prefs.japaTarget}
                </button>
              </div>
            )}

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-amber-400/10"
                >
                  <div className="max-h-[40dvh] space-y-3 overflow-y-auto px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {practice.durationOptions.map((d) => (
                        <button
                          key={String(d)}
                          type="button"
                          disabled={active && !isPaused}
                          onClick={() => session.setDuration(d)}
                          className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/55 hover:border-amber-400/30"
                        >
                          {d === "open" ? "Open" : `${d}m`}
                        </button>
                      ))}
                      <button
                        type="button"
                        disabled={active && !isPaused}
                        onClick={() => session.setDuration(prefs.customDurationMinutes)}
                        className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/55"
                      >
                        Custom {prefs.customDurationMinutes}m
                      </button>
                    </div>

                    {practice.type === "mantra" && (
                      <Select
                        value={practice.mantraId}
                        onValueChange={(v) => {
                          const p = mantraOptions.find((m) => m.mantraId === v);
                          if (p) {
                            updatePrefs({ lastPracticeId: p.id });
                            onMantraPracticeChange?.(p);
                          }
                        }}
                        disabled={active}
                      >
                        <SelectTrigger className="h-9 border-amber-200/20 bg-black/30 text-amber-50 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-amber-200/20 bg-[#1a0f0a] text-amber-50">
                          {mantraOptions.map((m) => (
                            <SelectItem key={m.id} value={m.mantraId!}>
                              {m.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-amber-200/50" aria-hidden />
                      <Slider
                        value={[Math.round(prefs.volume * 100)]}
                        max={100}
                        onValueChange={([v]) => updatePrefs({ volume: (v ?? 55) / 100 })}
                        aria-label="Volume"
                      />
                    </div>

                    <p className="text-[10px] uppercase tracking-widest text-amber-200/40">Ambience</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.keys(AMBIENCE_LABELS) as AmbienceId[]).map((id) => (
                        <label key={id} className="flex items-center justify-between text-xs text-amber-100/80">
                          {AMBIENCE_LABELS[id]}
                          <Switch
                            checked={prefs.ambience[id]}
                            onCheckedChange={(on) =>
                              updatePrefs({
                                ambience: { ...prefs.ambience, [id]: on },
                              })
                            }
                          />
                        </label>
                      ))}
                    </div>

                    {active && (
                      <button
                        type="button"
                        onClick={() => {
                          session.completeSession();
                        }}
                        className="w-full rounded-full border border-amber-400/25 py-2 text-xs text-amber-200/80"
                      >
                        End session early
                      </button>
                    )}

                    <div className="flex flex-wrap gap-3 text-xs text-amber-100/70">
                      <label className="flex items-center gap-2">
                        <Switch
                          checked={prefs.reducedMotion}
                          onCheckedChange={(on) => updatePrefs({ reducedMotion: on })}
                        />
                        Reduced motion
                      </label>
                      <label className="flex items-center gap-2">
                        <Switch
                          checked={prefs.highContrast}
                          onCheckedChange={(on) => updatePrefs({ highContrast: on })}
                        />
                        High contrast
                      </label>
                      <label className="flex items-center gap-2">
                        <Switch
                          checked={prefs.endingBellEnabled}
                          onCheckedChange={(on) => updatePrefs({ endingBellEnabled: on })}
                        />
                        End bell
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function MeditationTopBar({
  showUi,
  onToggleUi,
  onBack,
}: {
  showUi: boolean;
  onToggleUi: () => void;
  onBack: () => void;
}) {
  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: showUi ? 1 : 0.35 }}
      className="pointer-events-auto absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-4 pt-[max(0.5rem,env(safe-area-inset-top))]"
    >
      <button
        type="button"
        onClick={onBack}
        className="rounded-full border border-amber-200/20 bg-black/40 px-3 py-2 text-xs text-amber-100 backdrop-blur-md"
      >
        ← Practice
      </button>
      <span className="font-display text-lg text-amber-200/50" aria-hidden>
        {OM}
      </span>
      <button
        type="button"
        onClick={onToggleUi}
        className="rounded-full border border-amber-200/20 bg-black/40 px-3 py-2 text-xs text-amber-100/90 backdrop-blur-md"
      >
        {showUi ? "Hide" : "Show"}
      </button>
    </motion.header>
  );
}
