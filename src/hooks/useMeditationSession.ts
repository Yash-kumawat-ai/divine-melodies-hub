import { useCallback, useEffect, useRef, useState } from "react";
import type { MeditationPractice } from "@/lib/meditation/meditationTypes";
import { playCompletionChime, playMeditationBell } from "@/lib/meditation/meditationBell";
import {
  appendSessionLog,
  computeStats,
  createSessionLog,
  loadSessionLogs,
} from "@/lib/meditation/meditationStorage";
import {
  createTimerState,
  formatTimerDisplay,
  pauseTimer,
  resetTimerForDuration,
  resumeTimer,
  startTimer,
  tickTimer,
  type MeditationTimerState,
} from "@/lib/meditation/meditationTimer";
import { useMeditationAudio } from "@/hooks/useMeditationAudio";
import { useMeditationPreferences } from "@/hooks/useMeditationPreferences";

export type SessionCompletePayload = {
  moodAfter?: string;
  journalText?: string;
};

export function useMeditationSession(practice: MeditationPractice) {
  const { prefs, update: updatePrefs } = useMeditationPreferences();
  const [timer, setTimer] = useState<MeditationTimerState>(() =>
    createTimerState({
      durationSeconds: practice.defaultDurationMinutes * 60,
      warmupSeconds: prefs.warmupSeconds,
      intervalSeconds: prefs.intervalMinutes ? prefs.intervalMinutes * 60 : null,
    }),
  );
  const [sankalp, setSankalp] = useState("");
  const [japaCount, setJapaCount] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");
  const startedAtRef = useRef<string | null>(null);

  const isOpen = timer.config.durationSeconds === null;
  const active = timer.phase === "active" || timer.phase === "warmup";

  const { audioEnergy } = useMeditationAudio({
    volume: prefs.volume,
    playing: active,
    mantraId: practice.mantraId,
    visualMode: practice.visualMode,
    ambience: prefs.ambience,
  });

  const setDuration = useCallback(
    (minutes: number | "open") => {
      const seconds = minutes === "open" ? null : minutes * 60;
      setTimer((t) => resetTimerForDuration(t, seconds, prefs.warmupSeconds));
    },
    [prefs.warmupSeconds],
  );

  const begin = useCallback(() => {
    if (timer.phase === "paused") {
      setTimer((t) => resumeTimer(t));
      setLiveMessage("Meditation resumed");
      return;
    }
    if (timer.phase === "complete") {
      setTimer((t) =>
        resetTimerForDuration(t, t.config.durationSeconds, t.config.warmupSeconds),
      );
    }
    startedAtRef.current = new Date().toISOString();
    setTimer((t) => startTimer(t));
    setShowComplete(false);
    setLiveMessage("Meditation began");
    updatePrefs({ lastPracticeId: practice.id });
  }, [practice.id, timer.phase, updatePrefs]);

  const pause = useCallback(() => {
    setTimer((t) => pauseTimer(t));
    setLiveMessage("Meditation paused");
  }, []);

  const stop = useCallback(() => {
    setTimer((t) =>
      resetTimerForDuration(t, t.config.durationSeconds, t.config.warmupSeconds),
    );
    setLiveMessage("Session stopped");
  }, []);

  const incrementJapa = useCallback(() => {
    setJapaCount((c) => {
      if (c >= prefs.japaTarget) return c;
      const next = c + 1;
      if (next >= prefs.japaTarget) {
        setLiveMessage(`${prefs.japaTarget} japa complete`);
      }
      return next;
    });
  }, [prefs.japaTarget]);

  const completeSession = useCallback(() => {
    if (prefs.endingBellEnabled) playCompletionChime(prefs.volume);
    setShowComplete(true);
    setTimer((t) => ({ ...t, phase: "complete" }));
    setLiveMessage("Session complete. Hari Om.");
  }, [prefs.endingBellEnabled, prefs.volume]);

  const finishSession = useCallback(
    (payload: SessionCompletePayload = {}) => {
      const startedAt = startedAtRef.current ?? new Date().toISOString();
      const completedAt = new Date().toISOString();
      const durationSeconds =
        timer.elapsedSeconds > 0
          ? timer.elapsedSeconds
          : practice.defaultDurationMinutes * 60;

      appendSessionLog(
        createSessionLog({
          practiceId: practice.id,
          practiceType: practice.type,
          startedAt,
          completedAt,
          durationSeconds,
          completed: true,
          moodAfter: payload.moodAfter,
          journalText: payload.journalText,
          sankalp: sankalp || undefined,
          japaCount: practice.type === "mantra" ? japaCount : undefined,
          japaTarget: practice.type === "mantra" ? prefs.japaTarget : undefined,
          mantraId: practice.mantraId,
        }),
      );

      setShowComplete(false);
      setLiveMessage("Reflection saved.");
      startedAtRef.current = null;
      setTimer((t) =>
        resetTimerForDuration(t, t.config.durationSeconds, t.config.warmupSeconds),
      );
    },
    [japaCount, practice, prefs.japaTarget, sankalp, timer.elapsedSeconds],
  );

  useEffect(() => {
    if (!active) return;

    const id = window.setInterval(() => {
      setTimer((t) => {
        const { state, intervalBell, completed } = tickTimer(t);
        if (intervalBell && prefs.ambience.bell) {
          playMeditationBell(prefs.volume * 0.6);
        }
        if (completed) {
          window.setTimeout(() => completeSession(), 0);
        }
        return state;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [active, completeSession, prefs.ambience.bell, prefs.volume]);

  const formattedTime = formatTimerDisplay(
    timer.phase,
    timer.remainingSeconds,
    timer.elapsedSeconds,
    timer.config.durationSeconds,
    timer.warmupLeft,
  );

  const stats = computeStats(loadSessionLogs());
  const breath = active ? 1 : 0;

  return {
    prefs,
    updatePrefs,
    timer,
    active,
    isOpen,
    formattedTime,
    audioEnergy,
    breath,
    sankalp,
    setSankalp,
    japaCount,
    incrementJapa,
    showComplete,
    setShowComplete,
    liveMessage,
    begin,
    pause,
    stop,
    setDuration,
    completeSession,
    finishSession,
    stats,
    phase: timer.phase,
    elapsedSeconds: timer.elapsedSeconds,
  };
}
