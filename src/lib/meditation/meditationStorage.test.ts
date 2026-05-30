import { beforeEach, describe, expect, it } from "vitest";
import {
  appendSessionLog,
  computeStats,
  createSessionLog,
  loadPreferences,
  loadSessionLogs,
  savePreferences,
} from "./meditationStorage";
import { DEFAULT_PREFERENCES } from "./meditationTypes";

describe("meditationStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists preferences", () => {
    savePreferences({ ...DEFAULT_PREFERENCES, volume: 0.8, lastPracticeId: "mantra_shiva" });
    const loaded = loadPreferences();
    expect(loaded.volume).toBe(0.8);
    expect(loaded.lastPracticeId).toBe("mantra_shiva");
  });

  it("appends session logs and computes stats", () => {
    appendSessionLog(
      createSessionLog({
        practiceId: "mantra_shiva",
        practiceType: "mantra",
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        durationSeconds: 600,
        completed: true,
      }),
    );
    const logs = loadSessionLogs();
    expect(logs).toHaveLength(1);
    const stats = computeStats(logs);
    expect(stats.totalMindfulMinutes).toBe(10);
    expect(stats.sessionCount).toBe(1);
  });

  it("keeps older logs compatible when japa fields are absent", () => {
    appendSessionLog(
      createSessionLog({
        practiceId: "breath_box",
        practiceType: "breath",
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        durationSeconds: 300,
        completed: true,
      }),
    );

    const [log] = loadSessionLogs();
    expect(log.japaCount).toBeUndefined();
    expect(computeStats([log]).totalMindfulMinutes).toBe(5);
  });
});
