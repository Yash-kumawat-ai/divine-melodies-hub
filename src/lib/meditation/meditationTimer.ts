export type TimerPhase = "idle" | "warmup" | "active" | "paused" | "complete";

export type MeditationTimerConfig = {
  durationSeconds: number | null;
  warmupSeconds: number;
  intervalSeconds: number | null;
};

export type MeditationTimerState = {
  phase: TimerPhase;
  config: MeditationTimerConfig;
  remainingSeconds: number;
  elapsedSeconds: number;
  warmupLeft: number;
  nextIntervalIn: number | null;
  intervalCount: number;
  /** Preserved on pause so resume does not reset */
  startedRemaining: number | null;
};

export function createTimerState(config: MeditationTimerConfig): MeditationTimerState {
  const duration = config.durationSeconds;
  return {
    phase: "idle",
    config,
    remainingSeconds: duration ?? 0,
    elapsedSeconds: 0,
    warmupLeft: config.warmupSeconds,
    nextIntervalIn: config.intervalSeconds,
    intervalCount: 0,
    startedRemaining: null,
  };
}

export function startTimer(state: MeditationTimerState): MeditationTimerState {
  const duration = state.config.durationSeconds;
  const remaining = state.startedRemaining ?? duration ?? 0;
  const warmup = state.config.warmupSeconds;

  if (warmup > 0 && state.phase === "idle") {
    return {
      ...state,
      phase: "warmup",
      warmupLeft: warmup,
      remainingSeconds: remaining,
      startedRemaining: remaining,
      nextIntervalIn: state.config.intervalSeconds,
    };
  }

  return {
    ...state,
    phase: "active",
    remainingSeconds: remaining,
    startedRemaining: remaining,
    warmupLeft: 0,
    nextIntervalIn: state.config.intervalSeconds,
  };
}

export function pauseTimer(state: MeditationTimerState): MeditationTimerState {
  if (state.phase !== "active" && state.phase !== "warmup") return state;
  return {
    ...state,
    phase: "paused",
    startedRemaining: state.remainingSeconds,
    warmupLeft: state.phase === "warmup" ? state.warmupLeft : state.warmupLeft,
  };
}

export function resumeTimer(state: MeditationTimerState): MeditationTimerState {
  if (state.phase !== "paused") return state;
  if (state.warmupLeft > 0 && state.config.warmupSeconds > 0) {
    return { ...state, phase: "warmup" };
  }
  return {
    ...state,
    phase: "active",
    remainingSeconds: state.startedRemaining ?? state.remainingSeconds,
  };
}

export function resetTimerForDuration(
  state: MeditationTimerState,
  durationSeconds: number | null,
  warmupSeconds = state.config.warmupSeconds,
): MeditationTimerState {
  const config: MeditationTimerConfig = {
    ...state.config,
    durationSeconds,
    warmupSeconds,
  };
  return createTimerState(config);
}

export type TimerTickResult = {
  state: MeditationTimerState;
  intervalBell: boolean;
  completed: boolean;
};

export function tickTimer(state: MeditationTimerState): TimerTickResult {
  if (state.phase !== "warmup" && state.phase !== "active") {
    return { state, intervalBell: false, completed: false };
  }

  if (state.phase === "warmup") {
    const warmupLeft = state.warmupLeft - 1;
    if (warmupLeft > 0) {
      return { state: { ...state, warmupLeft }, intervalBell: false, completed: false };
    }
    return {
      state: { ...state, phase: "active", warmupLeft: 0 },
      intervalBell: false,
      completed: false,
    };
  }

  const duration = state.config.durationSeconds;
  const elapsedSeconds = state.elapsedSeconds + 1;
  let remainingSeconds = state.remainingSeconds;
  if (duration !== null) {
    remainingSeconds = Math.max(0, remainingSeconds - 1);
  }

  let intervalBell = false;
  let nextIntervalIn = state.nextIntervalIn;
  let intervalCount = state.intervalCount;

  if (state.config.intervalSeconds && nextIntervalIn !== null) {
    nextIntervalIn -= 1;
    if (nextIntervalIn <= 0) {
      intervalBell = true;
      intervalCount += 1;
      nextIntervalIn = state.config.intervalSeconds;
    }
  }

  const completed = duration !== null && remainingSeconds <= 0;

  return {
    state: {
      ...state,
      elapsedSeconds,
      remainingSeconds,
      nextIntervalIn,
      intervalCount,
      phase: completed ? "complete" : "active",
      startedRemaining: completed ? 0 : remainingSeconds,
    },
    intervalBell,
    completed,
  };
}

export function formatTimerDisplay(
  phase: TimerPhase,
  remainingSeconds: number,
  elapsedSeconds: number,
  durationSeconds: number | null,
  warmupLeft: number,
): string {
  if (phase === "warmup") {
    const m = Math.floor(warmupLeft / 60);
    const s = warmupLeft % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }
  if (durationSeconds === null) {
    const m = Math.floor(elapsedSeconds / 60);
    const s = elapsedSeconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }
  const m = Math.floor(remainingSeconds / 60);
  const s = remainingSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
