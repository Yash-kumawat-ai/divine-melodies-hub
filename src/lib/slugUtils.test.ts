import { describe, expect, it } from "vitest";
import {
  formatBhajanDisplayTitle,
  generateBhajanSlug,
  generateDeitySlug,
  generateUploadSlug,
  isStaticCatalogSlug,
  resolveUniqueSlug,
} from "./slugUtils";

describe("slugUtils", () => {
  it("generates consistent deity slugs", () => {
    expect(generateDeitySlug("  Sai Baba  ")).toBe("sai-baba");
    expect(generateDeitySlug("Khatu  Shyam")).toBe("khatu-shyam");
  });

  it("generates clean ASCII bhajan slugs from English/public titles", () => {
    expect(generateBhajanSlug("Maa Baglamukhi Ki Aarti")).toBe("maa-baglamukhi-ki-aarti");
    expect(generateBhajanSlug("Om Jai Shiv Omkara!")).toBe("om-jai-shiv-omkara");
    expect(generateBhajanSlug("Hare   Krishna -- Mahamantra")).toBe("hare-krishna-mahamantra");
    expect(generateBhajanSlug("Jai Shri Ram! 🙏 (Aarti)")).toBe("jai-shri-ram-aarti");
  });

  it("strips YouTube channel formatting and pipe suffixes", () => {
    expect(generateBhajanSlug("Mor Chadi Lehrai || BHAKTIDARSHANJAIPUR")).toBe("mor-chadi-lehrai");
    expect(generateBhajanSlug("Aaja Mere Kanhaiya | T-Series Bhakti")).toBe("aaja-mere-kanhaiya");
  });

  it("shortens YouTube-style titles for display", () => {
    expect(
      formatBhajanDisplayTitle("Mor Chadi Lehrai || BHAKTIDARSHANJAIPUR"),
    ).toBe("Mor Chadi Lehrai");
  });

  describe("Permanent URL Immutability (Published slug never changes on title edit)", () => {
    it("preserves existing published slug even when title is modified by admin", () => {
      // Scenario: Published with slug 'hanuman-chalisa'
      // Admin later edits title to 'Shri Hanuman Chalisa'
      const slug = generateUploadSlug({
        existingSlug: "hanuman-chalisa",
        title: "Shri Hanuman Chalisa",
        id: "record-123",
      });
      expect(slug).toBe("hanuman-chalisa");
    });

    it("preserves existing slug when admin fixes spelling typo in title", () => {
      const slug = generateUploadSlug({
        existingSlug: "shiv-tandav-stotra",
        title: "Shri Shiv Tandav Stotram",
        id: "record-456",
      });
      expect(slug).toBe("shiv-tandav-stotra");
    });
  });

  describe("Global Collision Resolution (Static vs Database)", () => {
    it("identifies slugs that exist in the static catalog", () => {
      expect(isStaticCatalogSlug("hanuman-chalisa")).toBe(true);
      expect(isStaticCatalogSlug("hare-krishna-mahamantra")).toBe(true);
      expect(isStaticCatalogSlug("krishna")).toBe(true);
      expect(isStaticCatalogSlug("live-aarti")).toBe(true);
      expect(isStaticCatalogSlug("brand-new-custom-bhajan-xyz")).toBe(false);
    });

    it("sequentially assigns -2, -3 suffixes when base slug collides", async () => {
      // 1. 'hanuman-chalisa' is occupied by static catalog
      // 2. 'hanuman-chalisa-2' is simulated as occupied in DB
      // 3. Expected available slug: 'hanuman-chalisa-3'
      const resolved = await resolveUniqueSlug("Hanuman Chalisa", async (candidate) => {
        if (candidate === "hanuman-chalisa-2") return true;
        return false;
      });

      expect(resolved).toBe("hanuman-chalisa-3");
    });

    it("returns base slug directly when free in both static and database", async () => {
      const resolved = await resolveUniqueSlug("Maa Baglamukhi Ki Aarti", async () => false);
      expect(resolved).toBe("maa-baglamukhi-ki-aarti");
    });
  });

  describe("Cosmetic vs. Meaningful Title Change Detection", () => {
    it("recognizes cosmetic edits as producing identical slug", () => {
      const originalSlug = "hanuman-chalisa";
      const cosmeticTitleWithEmoji = "Hanuman Chalisa 🙏";
      const cosmeticTitleWithSpaces = "  Hanuman   Chalisa  ";
      const cosmeticTitleWithChannel = "Hanuman Chalisa || T-Series Bhakti";

      expect(generateBhajanSlug(cosmeticTitleWithEmoji)).toBe(originalSlug);
      expect(generateBhajanSlug(cosmeticTitleWithSpaces)).toBe(originalSlug);
      expect(generateBhajanSlug(cosmeticTitleWithChannel)).toBe(originalSlug);
    });

    it("recognizes meaningful title changes as producing a different slug", () => {
      const originalSlug = "hanuman-chalisa";
      const meaningfulTitlePrefix = "Shri Hanuman Chalisa";
      const meaningfulTitleDescriptor = "Shri Hanuman Chalisa With Lyrics";

      expect(generateBhajanSlug(meaningfulTitlePrefix)).not.toBe(originalSlug);
      expect(generateBhajanSlug(meaningfulTitlePrefix)).toBe("shri-hanuman-chalisa");

      const meaningfulTitleVariant = "Shri Hanuman Ashtak";
      expect(generateBhajanSlug(meaningfulTitleVariant)).not.toBe(originalSlug);
      expect(generateBhajanSlug(meaningfulTitleVariant)).toBe("shri-hanuman-ashtak");
    });
  });

  describe("Legacy ID Fallback", () => {
    it("falls back to stable id for legacy records without English title", () => {
      const slug = generateUploadSlug({
        title: "",
        id: "987654321",
      });
      expect(slug).toBe("bhajan-98765432");
    });
  });

  describe("YouTube Delimiter Splitting & Bounded Length Limits", () => {
    it("splits on recognized delimiters like ' I ' while preserving words containing 'i'", () => {
      const rawTitle = "Holi Aayi Holi Aayi Masti Lai I Lakhbir Singh Lakkha";
      const slug = generateBhajanSlug(rawTitle);
      expect(slug).toBe("holi-aayi-holi-aayi-masti-lai");
    });

    it("does NOT split on normal hyphens in devotional titles", () => {
      const hyphenTitle = "Shri Ram - Siya Ram";
      const slug = generateBhajanSlug(hyphenTitle);
      expect(slug).toBe("shri-ram-siya-ram");
    });

    it("strips controlled video noise and hashtags while extracting first clause", () => {
      const rawTitle = "Meri Jo Laj He baba tere hath hai. dukhiya garib ki baba fariyad h sanjay mittal #new shyam bhajan#khatushyambhajan";
      const slug = generateBhajanSlug(rawTitle);
      expect(slug).toBe("meri-jo-laj-he-baba-tere-hath-hai");
    });

    it("preserves meaningful devotional words like chalisa, aarti, stotra, bhajan", () => {
      const aartiTitle = "Shree Krishna Aarti With Lyrics";
      const slug = generateBhajanSlug(aartiTitle);
      expect(slug).toBe("shree-krishna-aarti");
    });

    it("deduplicates consecutive identical word tokens in the slug", () => {
      const repeatedTitle = "Radha Radha Krishna Krishna Hare Hare";
      const slug = generateBhajanSlug(repeatedTitle);
      expect(slug).toBe("radha-krishna-hare");
    });

    it("bounds slug length to 50 characters without cutting words in half", () => {
      const longTitle = "This Is A Very Long Devotional Bhajan Title That Exceeds Fifty Characters And Should Be Bounded Cleanly";
      const slug = generateBhajanSlug(longTitle, 50);
      expect(slug.length).toBeLessThanOrEqual(50);
      expect(slug).not.toMatch(/-$/);
      expect(slug).toBe("this-is-a-very-long-devotional-bhajan-title-that");
    });
  });
});

