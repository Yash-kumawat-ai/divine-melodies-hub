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

  it("detects play bhajan", () => {
    const intent = parseNaradIntent("Hanuman Chalisa chalao");
    expect(intent.type).toBe("search_bhajan");
    expect(intent.entities.bhajanName).toBeTruthy();
  });

  it("detects flower offering", () => {
    expect(parseNaradIntent("phool chadhao").type).toBe("offer_flower");
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
