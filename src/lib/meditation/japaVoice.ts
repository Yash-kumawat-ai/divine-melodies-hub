import type { MantraId } from "@/lib/meditation/meditationTypes";

const MANTRA_ALIASES: Record<MantraId, string[]> = {
  om_namah_shivaya: [
    "om namah shivaya",
    "om namah shivay",
    "om namah shiva",
    "\u0950 \u0928\u092e\u0903 \u0936\u093f\u0935\u093e\u092f",
    "\u0913\u092e \u0928\u092e\u0903 \u0936\u093f\u0935\u093e\u092f",
  ],
  hare_krishna: [
    "hare krishna",
    "hare krishna hare krishna",
    "\u0939\u0930\u0947 \u0915\u0943\u0937\u094d\u0923",
    "\u0939\u0930\u0947 \u0915\u0943\u0937\u094d\u0923 \u0939\u0930\u0947 \u0915\u0943\u0937\u094d\u0923",
  ],
  jai_shree_ram: [
    "jai shree ram",
    "jai sri ram",
    "jai shri ram",
    "\u091c\u092f \u0936\u094d\u0930\u0940 \u0930\u093e\u092e",
  ],
  om_namo_narayanaya: [
    "om namo narayanaya",
    "om namo narayana",
    "\u0950 \u0928\u092e\u094b \u0928\u093e\u0930\u093e\u092f\u0923\u093e\u092f",
    "\u0913\u092e \u0928\u092e\u094b \u0928\u093e\u0930\u093e\u092f\u0923\u093e\u092f",
  ],
  radhe_radhe: [
    "radhe radhe",
    "radha radha",
    "radhey radhey",
    "\u0930\u093e\u0927\u0947 \u0930\u093e\u0927\u0947",
    "\u0930\u093e\u0927\u093e \u0930\u093e\u0927\u093e",
  ],
};

export function normalizeJapaTranscript(value: string): string {
  return value
    .toLocaleLowerCase("hi-IN")
    .replace(/[^\p{L}\p{N}\s\u0950]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function transcriptContainsMantra(mantraId: MantraId, transcript: string): boolean {
  const normalized = normalizeJapaTranscript(transcript);
  if (!normalized) return false;

  return MANTRA_ALIASES[mantraId].some((alias) => {
    const normalizedAlias = normalizeJapaTranscript(alias);
    return normalized.includes(normalizedAlias);
  });
}
