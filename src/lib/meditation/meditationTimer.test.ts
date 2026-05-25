import { describe, expect, it } from "vitest";
import {
  createTimerState,
  pauseTimer,
  resumeTimer,
  startTimer,
  tickTimer,
} from "./meditationTimer";

describe("meditationTimer", () => {
  it("starts with full duration and does not reset on resume", () => {
    let state = createTimerState({
      durationSeconds: 120,
      warmupSeconds: 0,
      intervalSeconds: null,
    });
    state = startTimer(state);
    expect(state.phase).toBe("active");
    expect(state.remainingSeconds).toBe(120);

    state = pauseTimer(state);
    expect(state.phase).toBe("paused");
    state = tickTimer(state).state;
    expect(state.remainingSeconds).toBe(120);

    state = resumeTimer(state);
    expect(state.phase).toBe("active");
    state = tickTimer(state).state;
    expect(state.remainingSeconds).toBe(119);
  });

  it("runs warmup before active", () => {
    let state = createTimerState({
      durationSeconds: 60,
      warmupSeconds: 3,
      intervalSeconds: null,
    });
    state = startTimer(state);
    expect(state.phase).toBe("warmup");
    expect(state.warmupLeft).toBe(3);

    state = tickTimer(state).state;
    expect(state.warmupLeft).toBe(2);
    state = tickTimer(state).state;
    state = tickTimer(state).state;
    expect(state.phase).toBe("active");
  });

  it("completes when remaining hits zero", () => {
    let state = createTimerState({
      durationSeconds: 2,
      warmupSeconds: 0,
      intervalSeconds: null,
    });
    state = startTimer(state);
    state = tickTimer(state).state;
    const result = tickTimer(state);
    expect(result.completed).toBe(true);
    expect(result.state.phase).toBe("complete");
    expect(result.state.remainingSeconds).toBe(0);
  });

  it("open-ended mode counts elapsed without completing", () => {
    let state = createTimerState({
      durationSeconds: null,
      warmupSeconds: 0,
      intervalSeconds: null,
    });
    state = startTimer(state);
    const result = tickTimer(state);
    expect(result.completed).toBe(false);
    expect(result.state.elapsedSeconds).toBe(1);
  });
});
