import { describe, expect, it } from "vitest";
import { createNaradActionResult, parseNaradIntent } from "@/lib/narad/naradIntents";

describe("parseNaradIntent", () => {
  it("detects japa", () => {
    const intent = parseNaradIntent("108 baar Om Namah Shivaya jap start karo");
    expect(intent.type).toBe("start_japa");
    expect(intent.confidence).toBeGreaterThan(0.8);
  });

  it("detects meditation", () => {
    expect(parseNaradIntent("meditation start karo").type).toBe("start_meditation");
  });

  it("keeps aarti in the extracted song query", () => {
    const intent = parseNaradIntent("play om jai jagdish aarti");
    expect(intent.type).toBe("search_bhajan");
    expect(intent.entities.bhajanName?.toLowerCase()).toContain("aarti");
    expect(intent.entities.bhajanName?.toLowerCase()).toContain("jagdish");
  });

  it("detects play bhajan and keeps chalisa in the title", () => {
    const intent = parseNaradIntent("Hanuman Chalisa chalao");
    expect(intent.type).toBe("search_bhajan");
    expect(intent.entities.bhajanName?.toLowerCase()).toContain("chalisa");
  });

  it("does not treat start japa as a song search", () => {
    expect(parseNaradIntent("start japa").type).toBe("start_japa");
    const action = createNaradActionResult(parseNaradIntent("start 108 japa"));
    expect(action?.kind).toBe("japa_start");
    expect(action?.route).toContain("/meditation");
  });

  it("does not treat today as devotion when the user named an aarti", () => {
    expect(parseNaradIntent("om jai jagdish aarti").type).toBe("search_bhajan");
  });

  it("routes kundli and shaadi questions to Vedic Kundli", () => {
    expect(parseNaradIntent("meri kundli dekho").type).toBe("open_kundli");
    expect(parseNaradIntent("shaadi kab hogi").type).toBe("open_kundli");
    expect(parseNaradIntent("career guidance").type).toBe("open_kundli");
    const action = createNaradActionResult(parseNaradIntent("janampatri batao"));
    expect(action?.kind).toBe("route");
    expect(action?.route).toBe("/kundli");
  });
});

describe("createNaradActionResult", () => {
  it("returns deity image for japa", () => {
    const intent = parseNaradIntent("Shiva japa 108");
    const action = createNaradActionResult(intent);
    expect(action?.kind).toBe("japa_start");
    expect(action?.deityImageUrl).toBeTruthy();
    expect(action?.deitySlug).toBe("shiva");
  });

  it("returns meditation route", () => {
    const action = createNaradActionResult(parseNaradIntent("dhyan shuru"));
    expect(action?.route).toBe("/meditation");
  });

  it("includes safe disclaimer for explain", () => {
    const action = createNaradActionResult(parseNaradIntent("mantra ka matlab batao"));
    expect(action?.displayText).toMatch(/medical|legal/i);
  });
});
