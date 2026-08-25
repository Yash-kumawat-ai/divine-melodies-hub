import { describe, it, expect } from "vitest";
import {
  CANONICAL_MANTRAS_LIST,
  getMantraCanonicalPath,
  getMantraCanonicalUrl,
  getPersonalMantraPath,
  resolveLegacyMantra,
  slugify,
} from "./mantraSlugs";
import type { Mantra } from "./mantraJapaApi";

describe("mantraSlugs utility", () => {
  const mockMantras: Mantra[] = CANONICAL_MANTRAS_LIST.map((def, idx) => ({
    id: def.id,
    slug: def.slug,
    name_hindi: def.name_hindi,
    name_english: def.name_english,
    deity: def.deity,
    description_hindi: null,
    description_english: null,
    meaning_hindi: null,
    meaning_english: null,
    full_text_hindi: def.name_hindi,
    transliteration: def.name_english,
    image_url: null,
    audio_url: null,
    recommended_counts: [108, 1008],
    sort_order: idx + 1,
    is_active: true,
  }));

  describe("getMantraCanonicalPath", () => {
    it("returns clean route path for om-namah-shivaya", () => {
      expect(getMantraCanonicalPath("om-namah-shivaya")).toBe(
        "/meditation/mantra-japa/om-namah-shivaya"
      );
    });

    it("ensures every canonical mantra produces a clean route without query parameters", () => {
      for (const mantra of CANONICAL_MANTRAS_LIST) {
        const path = getMantraCanonicalPath(mantra.slug);
        expect(path).toBe(`/meditation/mantra-japa/${mantra.slug}`);
        expect(path).not.toContain("?");
        expect(path).not.toContain("&");
        expect(path).not.toContain("=");
      }
    });

    it("handles whitespace and casing safely", () => {
      expect(getMantraCanonicalPath(" Maha-Mrityunjaya-Mantra ")).toBe(
        "/meditation/mantra-japa/maha-mrityunjaya-mantra"
      );
    });
  });

  describe("getPersonalMantraPath", () => {
    it("returns private route in the personal namespace with UUID", () => {
      const testUuid = "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d";
      expect(getPersonalMantraPath(testUuid)).toBe(
        "/meditation/mantra-japa/personal/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
      );
    });

    it("does not mix personal namespace into canonical slug path", () => {
      const testUuid = "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d";
      expect(getPersonalMantraPath(testUuid)).toContain("/personal/");
      expect(getMantraCanonicalPath("om-namah-shivaya")).not.toContain("/personal/");
    });
  });

  describe("getMantraCanonicalUrl", () => {
    it("returns absolute URL for gayatri-mantra without query parameters", () => {
      const url = getMantraCanonicalUrl("gayatri-mantra");
      expect(url).toContain("/meditation/mantra-japa/gayatri-mantra");
      expect(url).not.toContain("?");
      expect(url).not.toContain("mantraId");
    });
  });

  describe("slugify", () => {
    it("converts strings with special chars and spaces into clean slugs", () => {
      expect(slugify("Om Namah Shivaya!")).toBe("om-namah-shivaya");
      expect(slugify("Hare Krishna & Rama")).toBe("hare-krishna-rama");
      expect(slugify("Custom_Mantra_123")).toBe("custom-mantra-123");
    });
  });

  describe("resolveLegacyMantra (Fallback Path)", () => {
    it("resolves legacy built-in ID 'om_namah_shivaya' to the canonical mantra", () => {
      const result = resolveLegacyMantra(mockMantras, "om_namah_shivaya");
      expect(result).not.toBeNull();
      expect(result?.slug).toBe("om-namah-shivaya");
    });

    it("resolves legacy built-in ID 'mahamrityunjaya' to the canonical mantra", () => {
      const result = resolveLegacyMantra(mockMantras, "mahamrityunjaya");
      expect(result).not.toBeNull();
      expect(result?.slug).toBe("maha-mrityunjaya-mantra");
    });

    it("resolves legacy built-in ID 'gayatri' to the canonical mantra", () => {
      const result = resolveLegacyMantra(mockMantras, "gayatri");
      expect(result).not.toBeNull();
      expect(result?.slug).toBe("gayatri-mantra");
    });

    it("resolves alias 'shiva-mantra' to Om Namah Shivaya", () => {
      const result = resolveLegacyMantra(mockMantras, "shiva-mantra");
      expect(result).not.toBeNull();
      expect(result?.slug).toBe("om-namah-shivaya");
    });

    it("resolves by internal UUID matching id", () => {
      const customWithUuid: Mantra = {
        id: "d2d0e096-3955-4ccb-828e-4e897931fca6",
        slug: "om-namah-shivaya",
        name_hindi: "ॐ नमः शिवाय",
        name_english: "Om Namah Shivaya",
        deity: "shiva",
        description_hindi: null,
        description_english: null,
        meaning_hindi: null,
        meaning_english: null,
        full_text_hindi: "ॐ नमः शिवाय",
        transliteration: "Om Namah Shivaya",
        image_url: null,
        audio_url: null,
        recommended_counts: [108],
        sort_order: 1,
        is_active: true,
      };

      const result = resolveLegacyMantra(
        [customWithUuid],
        "d2d0e096-3955-4ccb-828e-4e897931fca6"
      );
      expect(result).not.toBeNull();
      expect(result?.slug).toBe("om-namah-shivaya");
    });

    it("returns null for completely unrecognized parameters", () => {
      const result = resolveLegacyMantra(mockMantras, "non-existent-xyz-999");
      expect(result).toBeNull();
    });
  });

  describe("Normal Path lookup", () => {
    it("finds mantra directly by slug === targetSlug", () => {
      const targetSlug = "om-namah-shivaya";
      const found = mockMantras.find((m) => m.slug === targetSlug);
      expect(found).toBeDefined();
      expect(found?.name_english).toBe("Om Namah Shivaya");
    });
  });
});
