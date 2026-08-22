import { describe, expect, it } from "vitest";
import { transcriptContainsMantra, transcriptMatchesActiveMantra } from "./japaVoice";

describe("japaVoice", () => {
  it("detects Radhe Radhe English and Hindi variants", () => {
    expect(transcriptContainsMantra("radhe_radhe", "radhe radhe")).toBe(true);
    expect(transcriptContainsMantra("radhe_radhe", "radha radha")).toBe(true);
    expect(transcriptContainsMantra("radhe_radhe", "राधे राधे")).toBe(true);
    expect(transcriptContainsMantra("radhe_radhe", "राधा राधा")).toBe(true);
  });

  it("detects selected mantras without matching unrelated speech", () => {
    expect(transcriptContainsMantra("om_namah_shivaya", "om namah shivay")).toBe(true);
    expect(transcriptContainsMantra("jai_shree_ram", "jai shri ram")).toBe(true);
    expect(transcriptContainsMantra("hare_krishna", "radhe radhe")).toBe(false);
  });

  describe("transcriptMatchesActiveMantra", () => {
    it("matches active mantra from English / Hindi names and transliteration", () => {
      expect(
        transcriptMatchesActiveMantra({
          nameEn: "Om Namah Shivaya",
          nameHi: "ॐ नमः शिवाय",
          deity: "shiva",
          mantraTextHi: "ॐ नमः शिवाय",
          mantraTextEn: "Om Namah Shivaya",
          transcript: "om namah shivaya",
        })
      ).toBe(true);

      expect(
        transcriptMatchesActiveMantra({
          nameEn: "Om Namah Shivaya",
          nameHi: "ॐ नमः शिवाय",
          deity: "shiva",
          mantraTextHi: "ॐ नमः शिवाय",
          mantraTextEn: "Om Namah Shivaya",
          transcript: "ॐ नमः शिवाय",
        })
      ).toBe(true);
    });

    it("matches active mantra for Hare Krishna Mahamantra", () => {
      expect(
        transcriptMatchesActiveMantra({
          nameEn: "Hare Krishna Mahamantra",
          nameHi: "हरे कृष्ण महामंत्र",
          deity: "krishna",
          mantraTextHi: "हरे कृष्ण हरे कृष्ण, कृष्ण कृष्ण हरे हरे।\nहरे राम हरे राम, राम राम हरे हरे॥",
          mantraTextEn: "Hare Krishna Hare Krishna, Krishna Krishna Hare Hare\nHare Ram Hare Ram, Ram Ram Hare Hare",
          transcript: "हरे कृष्ण",
        })
      ).toBe(true);
    });

    it("rejects irrelevant noise / speech for active mantra", () => {
      expect(
        transcriptMatchesActiveMantra({
          nameEn: "Jai Shree Ram",
          nameHi: "जय श्री राम",
          deity: "rama",
          mantraTextHi: "जय श्री राम",
          mantraTextEn: "Jai Shree Ram",
          transcript: "what time is it",
        })
      ).toBe(false);
    });
  });
});
