import { describe, expect, it } from "vitest";
import { transcriptContainsMantra } from "./japaVoice";

describe("japaVoice", () => {
  it("detects Radhe Radhe English and Hindi variants", () => {
    expect(transcriptContainsMantra("radhe_radhe", "radhe radhe")).toBe(true);
    expect(transcriptContainsMantra("radhe_radhe", "radha radha")).toBe(true);
    expect(transcriptContainsMantra("radhe_radhe", "\u0930\u093e\u0927\u0947 \u0930\u093e\u0927\u0947")).toBe(true);
    expect(transcriptContainsMantra("radhe_radhe", "\u0930\u093e\u0927\u093e \u0930\u093e\u0927\u093e")).toBe(true);
  });

  it("detects selected mantras without matching unrelated speech", () => {
    expect(transcriptContainsMantra("om_namah_shivaya", "om namah shivay")).toBe(true);
    expect(transcriptContainsMantra("jai_shree_ram", "jai shri ram")).toBe(true);
    expect(transcriptContainsMantra("hare_krishna", "radhe radhe")).toBe(false);
  });
});
