import { describe, expect, it } from "vitest";
import {
  OFFLINE_BHAJANS,
  createBhajanFromDraft,
  exactSearchBhajans,
  filterByDeityAndLanguage,
  isDuplicateBhajan,
} from "./offlineKirtan";

describe("offlineKirtan", () => {
  it("uses exact name and alias matching", () => {
    expect(exactSearchBhajans("Achyutam Keshavam", OFFLINE_BHAJANS)).toHaveLength(1);
    expect(exactSearchBhajans("Mahamantra", OFFLINE_BHAJANS)[0]?.name).toBe("Hare Krishna Mahamantra");
  });

  it("allows partial title matches only from the title start with at least 3 characters", () => {
    expect(exactSearchBhajans("Ach", OFFLINE_BHAJANS)[0]?.name).toBe("Achyutam Keshavam");
    expect(exactSearchBhajans("chy", OFFLINE_BHAJANS)).toHaveLength(0);
    expect(exactSearchBhajans("Ac", OFFLINE_BHAJANS)).toHaveLength(0);
    expect(exactSearchBhajans("Hari Gop", OFFLINE_BHAJANS)).toHaveLength(0);
  });

  it("does not return loosely related fallback bhajans", () => {
    expect(exactSearchBhajans("peaceful krishna song", OFFLINE_BHAJANS)).toHaveLength(0);
  });

  it("prevents duplicate added bhajans by name or alias", () => {
    expect(isDuplicateBhajan("hare krishna mahamantra", OFFLINE_BHAJANS)?.name).toBe("Hare Krishna Mahamantra");
    expect(isDuplicateBhajan("Hare Krishna Hare Rama", OFFLINE_BHAJANS)?.name).toBe("Hare Krishna Mahamantra");
  });

  it("filters scripted find results by deity and language", () => {
    const results = filterByDeityAndLanguage(OFFLINE_BHAJANS, "Shiva", "Sanskrit");
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((bhajan) => bhajan.deity === "Shiva" && bhajan.language === "Sanskrit")).toBe(true);
  });

  it("creates saved bhajans from add-flow drafts", () => {
    const bhajan = createBhajanFromDraft({
      name: "Test Bhajan",
      deity: "General",
      language: "Hindi",
      lyrics_preview: "",
      singer: "",
      youtube_link: "",
    });

    expect(bhajan.name).toBe("Test Bhajan");
    expect(bhajan.singer).toBe("Unknown");
    expect(bhajan.id).toContain("custom-test-bhajan");
  });
});
