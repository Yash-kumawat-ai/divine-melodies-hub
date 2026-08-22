import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, Mic, MicOff, Pause, Play, Volume2, Settings2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deities } from "@/data/bhajans";
import { useLanguage } from "@/hooks/useLanguage";
import { getMeditationCopy, getMeditationPracticeTitle } from "@/lib/meditation/meditationLocale";
import { cn } from "@/lib/utils";
import type { MeditationPractice, MantraId } from "@/lib/meditation/meditationTypes";
import type { useMeditationSession } from "@/hooks/useMeditationSession";
import type { AmbienceId } from "@/lib/meditation/meditationTypes";
import { OM } from "@/lib/meditation/unicode";
import { transcriptContainsMantra } from "@/lib/meditation/japaVoice";

type SessionApi = ReturnType<typeof useMeditationSession>;

type MeditationControlsProps = {
  practice: MeditationPractice;
  session: SessionApi;
  mantraOptions: MeditationPractice[];
  showUi: boolean;
  onMantraPracticeChange?: (practice: MeditationPractice) => void;
};

type SpeechRecognitionCtor = new () => {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { resultIndex: number; results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const candidate = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return candidate.SpeechRecognition ?? candidate.webkitSpeechRecognition ?? null;
}

function getDeitySlug(mantraId?: MantraId): string {
  if (mantraId === "jai_shree_ram") return "rama";
  if (mantraId === "radhe_radhe" || mantraId === "hare_krishna") return "krishna";
  return "shiva";
}

export default function MeditationControls({
  practice,
  session,
  mantraOptions,
  showUi,
  onMantraPracticeChange,
}: MeditationControlsProps) {
  const { language } = useLanguage();
  const copy = getMeditationCopy(language);
  const [expanded, setExpanded] = useState(false);
  const [voiceState, setVoiceState] = useState<"idle" | "listening" | "unsupported" | "error">("idle");
  const recognitionRef = useRef<InstanceType<SpeechRecognitionCtor> | null>(null);
  const lastVoiceCountAtRef = useRef(0);
  const { prefs, updatePrefs, phase, active, formattedTime, japaCount, incrementJapa } = session;
  const isPaused = phase === "paused";
  const canStart = phase === "idle" || phase === "paused" || phase === "complete";
  const japaProgress = Math.min(100, Math.round((japaCount / prefs.japaTarget) * 100));

  const selectedMantra = mantraOptions.find((m) => m.mantraId === practice.mantraId);
  const deity = useMemo(() => {
    const slug = getDeitySlug(practice.mantraId);
    return deities.find((d) => d.slug === slug);
  }, [practice.mantraId]);

  useEffect(() => {
    if (active || voiceState !== "listening") return;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setVoiceState("idle");
  }, [active, voiceState]);

  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  const toggleVoiceJapa = () => {
    if (!practice.mantraId) return;
    if (voiceState === "listening") {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setVoiceState("idle");
      return;
    }

    const Recognition = getRecognitionCtor();
    if (!Recognition) {
      setVoiceState("unsupported");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "hi-IN";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      const result = event.results[event.resultIndex];
      const transcript = result?.[0]?.transcript ?? "";
      const now = Date.now();
      if (now - lastVoiceCountAtRef.current < 1100) return;
      if (practice.mantraId && transcriptContainsMantra(practice.mantraId, transcript)) {
        lastVoiceCountAtRef.current = now;
        incrementJapa();
      }
    };
    recognition.onerror = () => {
      recognitionRef.current = null;
      setVoiceState("error");
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setVoiceState((state) => (state === "listening" ? "idle" : state));
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setVoiceState("listening");
    } catch {
      setVoiceState("error");
    }
  };

  return (
    <AnimatePresence>
      {showUi && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 px-3 pb-[max(0.8rem,env(safe-area-inset-bottom))]"
        >
          <div
            className="mx-auto max-w-md overflow-hidden rounded-[1.6rem] border border-amber-200/18 shadow-2xl shadow-black/35 backdrop-blur-xl"
            style={{
              background:
                "linear-gradient(145deg, rgba(46,19,10,0.90) 0%, rgba(18,6,28,0.82) 58%, rgba(3,12,18,0.84) 100%)",
            }}
          >
            <div className="h-px bg-gradient-to-r from-transparent via-amber-200/55 to-transparent" />
            <div className="flex items-center justify-between gap-2 px-4 py-3.5">
              <div className="min-w-0">
                <p className="truncate text-[11px] uppercase tracking-widest text-amber-200/55">
                  {getMeditationPracticeTitle(practice, language)}
                </p>
                <p className="font-mono text-2xl tabular-nums text-amber-50 md:text-3xl">{formattedTime}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                {canStart ? (
                  <button
                    type="button"
                    onClick={session.begin}
                    className="flex h-11 items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 px-4 text-sm font-semibold text-[#260b05] shadow-lg shadow-amber-950/25"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    {isPaused ? copy.controls.resume : copy.controls.begin}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={session.pause}
                    className="flex h-11 items-center gap-1.5 rounded-full border border-amber-300/35 bg-white/5 px-4 text-sm text-amber-100"
                  >
                    <Pause className="h-4 w-4" />
                    {copy.controls.pause}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setExpanded((e) => !e)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-amber-100"
                  aria-expanded={expanded}
                  aria-label={expanded ? "Collapse settings" : "Expand settings"}
                >
                  {expanded ? <ChevronUp className="h-5 w-5" /> : <Settings2 className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {practice.type === "mantra" && active && (
              <div className="border-t border-amber-400/10 px-4 py-3.5">
                <div className="flex items-center gap-3">
                  {deity?.imageUrl ? (
                    <img
                      src={deity.imageUrl}
                      alt=""
                      width={112}
                      height={112}
                      className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-1 ring-amber-200/35"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg text-amber-50">{selectedMantra?.chant}</p>
                    <p className="text-[11px] text-amber-200/55">
                      {voiceState === "listening" ? copy.controls.listening : copy.controls.tapOrVoice}
                    </p>
                  </div>
                  <p className="font-mono text-3xl tabular-nums text-amber-50">
                    {japaCount}
                    <span className="text-sm text-amber-200/45">/{prefs.japaTarget}</span>
                  </p>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-300 via-rose-400 to-teal-300 transition-[width] duration-300"
                    style={{ width: `${japaProgress}%` }}
                  />
                </div>

                <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                  <button
                    type="button"
                    onClick={incrementJapa}
                    disabled={japaCount >= prefs.japaTarget}
                    className="min-h-12 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 px-4 text-sm font-semibold text-[#260b05] shadow-lg shadow-black/20 disabled:from-emerald-500 disabled:to-teal-500 disabled:text-white"
                  >
                    {japaCount >= prefs.japaTarget ? copy.controls.complete : copy.controls.countJapa}
                  </button>
                  <button
                    type="button"
                    onClick={toggleVoiceJapa}
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full border bg-white/5",
                      voiceState === "listening"
                        ? "border-green-300/70 bg-green-500/20 text-green-100"
                        : "border-amber-300/25 text-amber-100",
                    )}
                    aria-label={voiceState === "listening" ? copy.controls.voiceStop : copy.controls.voiceStart}
                  >
                    {voiceState === "listening" ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex gap-1.5">
                    {([27, 54, 108] as const).map((target) => (
                      <button
                        key={target}
                        type="button"
                        onClick={() => updatePrefs({ japaTarget: target })}
                        className={cn(
                          "h-8 rounded-full border px-3 text-xs transition",
                          prefs.japaTarget === target
                            ? "border-amber-300 bg-amber-300/15 text-amber-50"
                            : "border-white/10 text-amber-100/60",
                        )}
                      >
                        {target}
                      </button>
                    ))}
                  </div>
                  {[27, 54, 81, 108].includes(japaCount) ? (
                    <p className="rounded-full bg-amber-300/10 px-2.5 py-1 text-xs text-amber-100">
                      {japaCount} {copy.controls.done}
                    </p>
                  ) : null}
                </div>

                {voiceState === "unsupported" || voiceState === "error" ? (
                  <p className="mt-2 text-center text-[11px] text-amber-200/65">
                    {copy.controls.voiceUnavailable}
                  </p>
                ) : null}
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
                          {d === "open" ? copy.controls.open : `${d} ${copy.controls.minute}`}
                        </button>
                      ))}
                      <button
                        type="button"
                        disabled={active && !isPaused}
                        onClick={() => session.setDuration(prefs.customDurationMinutes)}
                        className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/55"
                      >
                        {copy.controls.custom} {prefs.customDurationMinutes} {copy.controls.minute}
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
                              {getMeditationPracticeTitle(m, language)}
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

                    <p className="text-[10px] uppercase tracking-widest text-amber-200/40">{copy.controls.ambience}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.keys(copy.ambience) as AmbienceId[]).map((id) => (
                        <label key={id} className="flex items-center justify-between text-xs text-amber-100/80">
                          {copy.ambience[id]}
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
                        {copy.controls.endEarly}
                      </button>
                    )}

                    <div className="flex flex-wrap gap-3 text-xs text-amber-100/70">
                      <label className="flex items-center gap-2">
                        <Switch
                          checked={prefs.reducedMotion}
                          onCheckedChange={(on) => updatePrefs({ reducedMotion: on })}
                        />
                        {copy.controls.reducedMotion}
                      </label>
                      <label className="flex items-center gap-2">
                        <Switch
                          checked={prefs.highContrast}
                          onCheckedChange={(on) => updatePrefs({ highContrast: on })}
                        />
                        {copy.controls.highContrast}
                      </label>
                      <label className="flex items-center gap-2">
                        <Switch
                          checked={prefs.endingBellEnabled}
                          onCheckedChange={(on) => updatePrefs({ endingBellEnabled: on })}
                        />
                        {copy.controls.endBell}
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
  const { language } = useLanguage();
  const copy = getMeditationCopy(language);
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
        {copy.controls.back}
      </button>
      <span className="font-display text-lg text-amber-200/50" aria-hidden>
        {OM}
      </span>
      <button
        type="button"
        onClick={onToggleUi}
        className="rounded-full border border-amber-200/20 bg-black/40 px-3 py-2 text-xs text-amber-100/90 backdrop-blur-md"
      >
        {showUi ? copy.controls.hide : copy.controls.show}
      </button>
    </motion.header>
  );
}
