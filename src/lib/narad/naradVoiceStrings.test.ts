import { describe, expect, it } from "vitest";
import { CHANT, OM } from "@/lib/meditation/unicode";
import { NARAD_HI } from "./naradVoiceStrings";

describe("naradVoiceStrings", () => {
  it("uses valid Devanagari for Narad UI", () => {
    expect(NARAD_HI.listening).toMatch(/[\u0900-\u097F]/);
    expect(NARAD_HI.noSpeech).toMatch(/[\u0900-\u097F]/);
    expect(CHANT.omNamahShivaya).toContain(OM);
  });
});
