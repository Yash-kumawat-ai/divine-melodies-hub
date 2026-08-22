import type { MantraId } from "@/lib/meditation/meditationTypes";

export const MANTRA_ALIASES: Record<MantraId | string, string[]> = {
  om_namah_shivaya: [
    "om namah shivaya",
    "om namah shivay",
    "om namah shiva",
    "namah shivaya",
    "namah shivay",
    "shivaya",
    "ॐ नमः शिवाय",
    "ओम नमः शिवाय",
    "नमः शिवाय",
  ],
  hare_krishna: [
    "hare krishna",
    "hare krishna hare krishna",
    "hare rama",
    "hare ram",
    "krishna krishna",
    "हरे कृष्ण",
    "हरे कृष्ण हरे कृष्ण",
    "हरे राम",
    "हरे राम हरे कृष्ण",
    "कृष्ण कृष्ण",
  ],
  jai_shree_ram: [
    "jai shree ram",
    "jai sri ram",
    "jai shri ram",
    "shree ram",
    "shri ram",
    "sita ram",
    "ram ram",
    "जय श्री राम",
    "जय सिया राम",
    "जय सीता राम",
    "श्री राम",
    "सिया राम",
    "राम राम",
  ],
  om_namo_narayanaya: [
    "om namo narayanaya",
    "om namo narayana",
    "namo narayanaya",
    "namo narayana",
    "ॐ नमो नारायणाय",
    "ओम नमो नारायणाय",
    "नमो नारायणाय",
  ],
  radhe_radhe: [
    "radhe radhe",
    "radha radha",
    "radhey radhey",
    "radhe krishna",
    "radhe shyam",
    "राधे राधे",
    "राधा राधा",
    "राधे कृष्ण",
    "राधे श्याम",
  ],
  om: [
    "om",
    "aum",
    "ॐ",
    "ओम",
  ],
  mahamrityunjaya: [
    "mahamrityunjaya",
    "mrityunjaya",
    "om tryambakam",
    "tryambakam yajamahe",
    "tryambakam",
    "sugandhim",
    "urvarukamiva",
    "मृत्योर्मुक्षीय",
    "त्र्यम्बकं यजामहे",
    "त्र्यम्बकम",
    "महामृत्युंजय",
  ],
  gayatri: [
    "gayatri",
    "om bhur bhuvah svah",
    "bhur bhuvah svah",
    "tat savitur varenyam",
    "bhargo devasya",
    "dhiyo yo nah",
    "गायत्री",
    "ॐ भूर्भुवः स्वः",
    "तत्सवितुर्वरेण्यं",
    "भर्गो देवस्य",
  ],
  ganesha: [
    "ganesha",
    "ganesh",
    "gam ganapataye",
    "ganapataye namah",
    "om gam ganapataye namaha",
    "om gam ganapataye namah",
    "गणपतये नमः",
    "गं गणपतये",
    "गणेशाय नमः",
    "श्री गणेश",
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

  const aliases = MANTRA_ALIASES[mantraId];
  if (!aliases) return false;

  return aliases.some((alias) => {
    const normalizedAlias = normalizeJapaTranscript(alias);
    return normalized.includes(normalizedAlias);
  });
}

export interface ActiveMantraVoiceParams {
  nameEn?: string | null;
  nameHi?: string | null;
  deity?: string | null;
  mantraTextHi?: string | null;
  mantraTextEn?: string | null;
  transcript: string;
}

export function transcriptMatchesActiveMantra(params: ActiveMantraVoiceParams): boolean {
  const { nameEn, nameHi, deity, mantraTextHi, mantraTextEn, transcript } = params;
  const normalizedTranscript = normalizeJapaTranscript(transcript);
  if (!normalizedTranscript || normalizedTranscript.length < 2) return false;

  // 1. Check known mantra alias keys based on name / deity / texts
  const matchCandidates: string[] = [
    nameEn ?? "",
    nameHi ?? "",
    deity ?? "",
    mantraTextEn ?? "",
    mantraTextHi ?? "",
  ]
    .map(normalizeJapaTranscript)
    .filter(Boolean);

  for (const [key, aliases] of Object.entries(MANTRA_ALIASES)) {
    const normKey = normalizeJapaTranscript(key.replace(/_/g, " "));
    const keyMatched = matchCandidates.some(
      (c) => c.includes(normKey) || aliases.some((a) => c.includes(normalizeJapaTranscript(a)))
    );

    if (keyMatched) {
      const isVoiceMatched = aliases.some((alias) => {
        const normAlias = normalizeJapaTranscript(alias);
        return (
          normalizedTranscript.includes(normAlias) ||
          (normAlias.length >= 3 && normAlias.includes(normalizedTranscript))
        );
      });
      if (isVoiceMatched) return true;
    }
  }

  // 2. Generic phrase matching against text / name
  const targetStrings = [
    mantraTextHi,
    mantraTextEn,
    nameHi,
    nameEn,
  ]
    .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    .map(normalizeJapaTranscript);

  for (const target of targetStrings) {
    if (!target) continue;

    // Direct substring match in either direction
    if (target.includes(normalizedTranscript) || normalizedTranscript.includes(target)) {
      return true;
    }

    // Split target into chunks/phrases
    const subPhrases = target.split(/\s{2,}|\n/).map((p) => p.trim()).filter((p) => p.length >= 3);
    for (const phrase of subPhrases) {
      if (normalizedTranscript.includes(phrase) || phrase.includes(normalizedTranscript)) {
        return true;
      }
    }

    // Significant word token matching
    const transcriptWords = normalizedTranscript.split(" ").filter((w) => w.length >= 3);
    if (transcriptWords.length > 0) {
      const targetWords = new Set(target.split(" ").filter((w) => w.length >= 3));
      const matchCount = transcriptWords.filter((w) => targetWords.has(w)).length;
      if (matchCount >= 2 || (matchCount >= 1 && transcriptWords.length === 1 && targetWords.size <= 4)) {
        return true;
      }
    }
  }

  return false;
}
