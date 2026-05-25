import { describe, expect, it } from "vitest";
import { CHANT, OM } from "./unicode";

describe("meditation unicode", () => {
  it("exports valid Om and Devanagari chants", () => {
    expect(OM).toBe("\u0950");
    expect(CHANT.omNamahShivaya).toContain(OM);
    expect(CHANT.hareKrishna).toMatch(/[\u0900-\u097F]/);
  });
});
