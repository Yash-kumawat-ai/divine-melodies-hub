import { describe, expect, it } from "vitest";
import { generateBhajanSlug, generateDeitySlug } from "./slugUtils";

describe("slugUtils", () => {
  it("generates consistent deity slugs", () => {
    expect(generateDeitySlug("  Sai Baba  ")).toBe("sai-baba");
    expect(generateDeitySlug("Khatu  Shyam")).toBe("khatu-shyam");
  });

  it("removes punctuation and collapses spaces for bhajan slugs", () => {
    expect(generateBhajanSlug("Om Jai Shiv Omkara!")).toBe("om-jai-shiv-omkara");
    expect(generateBhajanSlug("Hare   Krishna -- Mahamantra")).toBe("hare-krishna-mahamantra");
  });
});
