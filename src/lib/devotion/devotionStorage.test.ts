import { beforeEach, describe, expect, it } from "vitest";
import {
  completeJapaSession,
  loadDevotionProgress,
  recordOffering,
} from "./devotionStorage";

describe("devotionStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("tracks completed japa count and same-day streak only once", () => {
    const date = new Date("2026-05-22T08:00:00.000Z");

    const first = completeJapaSession({
      mantra: "Om Namah Shivaya",
      sankalp: "Shanti",
      targetCount: 108,
      completedAt: date.toISOString(),
    }, date);

    const second = completeJapaSession({
      mantra: "Om Namah Shivaya",
      sankalp: "Shanti",
      targetCount: 108,
      completedAt: date.toISOString(),
    }, date);

    expect(first.currentStreak).toBe(1);
    expect(second.currentStreak).toBe(1);
    expect(second.totalJapaCount).toBe(216);
    expect(loadDevotionProgress(date).completedToday).toBe(true);
  });

  it("increments offering count", () => {
    recordOffering(new Date("2026-05-22T08:00:00.000Z"));
    const progress = recordOffering(new Date("2026-05-22T09:00:00.000Z"));

    expect(progress.totalOfferings).toBe(2);
  });
});
