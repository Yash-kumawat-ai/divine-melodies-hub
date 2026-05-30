import { deities } from "@/data/bhajans";

export type NaradIntentType =
  | "start_japa"
  | "start_meditation"
  | "offer_flower"
  | "ring_bell"
  | "light_diya"
  | "daily_devotion"
  | "explain_mantra"
  | "show_favorites"
  | "search_bhajan"
  | "find_deity"
  | "unknown";

export type NaradIntent = {
  type: NaradIntentType;
  confidence: number;
  rawText: string;
  entities: {
    deity?: string;
    deitySlug?: string;
    mantra?: string;
    bhajanName?: string;
    mood?: string;
  };
};

export type NaradActionKind =
  | "answer"
  | "bhajan_search"
  | "route"
  | "japa_start"
  | "offering"
  | "daily_devotion";

export type NaradActionResult = {
  kind: NaradActionKind;
  intentType: NaradIntentType;
  title: string;
  displayText: string;
  spokenText: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  route?: string;
  mantra?: string;
  searchQuery?: string;
  deitySlug?: string;
  deityName?: string;
  deityImageUrl?: string;
  offeringType?: "flower" | "bell" | "diya";
};

const DEITY_PATTERNS: Array<[string, string, RegExp]> = [
  ["Hanuman", "hanuman", /hanuman|bajrang|anjani|\u0939\u0928\u0941\u092e\u093e\u0928|\u092c\u091c\u0930\u0902\u0917/i],
  ["Shiva", "shiva", /shiv|shiva|mahadev|bholenath|\u0936\u093f\u0935|\u092e\u0939\u093e\u0926\u0947\u0935/i],
  ["Krishna", "krishna", /krishna|kanha|gopal|govind|\u0915\u0943\u0937\u094d\u0923|\u0915\u093e\u0928\u094d\u0939\u093e/i],
  ["Rama", "rama", /\bram\b|rama|shree ram|\u0930\u093e\u092e/i],
  ["Durga", "durga", /devi|durga|mata|\u0926\u0941\u0930\u094d\u0917\u093e|\u0926\u0947\u0935\u0940/i],
  ["Ganesh", "ganesh", /ganesh|ganpati|vinayak|\u0917\u0923\u0947\u0936|\u0917\u0923\u092a\u0924\u093f/i],
  ["Lakshmi", "lakshmi", /lakshmi|\u0932\u0915\u094d\u0937\u094d\u092e\u0940/i],
  ["Sai Baba", "sai-baba", /sai|\u0938\u093e\u0908\u0902/i],
];

const MANTRA_PATTERNS: Array<[string, RegExp]> = [
  ["Om Namah Shivaya", /om namah shiv|namah shiv|\u0913\u0902 \u0928\u092e\u0903 \u0936\u093f\u0935\u093e\u092f/i],
  ["Hare Krishna Mahamantra", /hare krishna|\u0939\u0930\u0947 \u0915\u0943\u0937\u094d\u0923/i],
  ["Hanuman Chalisa", /hanuman chalisa|\u0939\u0928\u0941\u092e\u093e\u0928 \u091a\u093e\u0932\u0940\u0938\u093e/i],
  ["Gayatri Mantra", /gayatri|\u0917\u093e\u092f\u0924\u094d\u0930\u0940/i],
];

const SAFE_EXPLAIN =
  "Chant slowly with breath awareness. Mantras support devotion and peace — they are not substitutes for medical or legal advice.";

function normalize(input: string) {
  return input.toLowerCase().replace(/\s+/g, " ").trim();
}

function findDeity(rawText: string) {
  for (const [name, slug, pattern] of DEITY_PATTERNS) {
    if (pattern.test(rawText)) {
      const d = deities.find((x) => x.slug === slug);
      return { name, slug, imageUrl: d?.imageUrl };
    }
  }
  return null;
}

function findMantra(text: string) {
  return MANTRA_PATTERNS.find(([, pattern]) => pattern.test(text))?.[0];
}

function extractBhajanQuery(rawText: string): string {
  return rawText
    .replace(/\b(chalao|play|bajao|sunao|find|search|mujhe|please|koi)\b/gi, " ")
    .replace(/\b(bhajan|aarti|chalisa)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function looksLikeDirectSongQuery(rawText: string): boolean {
  const text = rawText.trim();
  if (!text || text.length < 2 || text.length > 80) return false;
  if (/[?]/.test(text)) return false;
  if (/^(hi|hello|hey|namaste|help)$/i.test(text)) return false;
  if (/^(kya|kaise|kyun|why|how|what)\b/i.test(text)) return false;
  return true;
}

export function parseNaradIntent(rawText: string): NaradIntent {
  const text = normalize(rawText);
  const deityHit = findDeity(rawText);
  const mantra = findMantra(rawText);
  const entities = {
    deity: deityHit?.name,
    deitySlug: deityHit?.slug,
    mantra,
  };

  if (/japa|jaap|jap|chant|108|\u092e\u093e\u0932\u093e|\u091c\u092a|\u091c\u093e\u092a/i.test(rawText)) {
    return { type: "start_japa", confidence: 0.94, rawText, entities };
  }
  if (/meditat|dhyan|\u0927\u094d\u092f\u093e\u0928|shanti|calm/i.test(rawText)) {
    return { type: "start_meditation", confidence: 0.9, rawText, entities };
  }
  if (/diya|deepak|lamp|\u0926\u0940\u092a/i.test(rawText)) {
    return { type: "light_diya", confidence: 0.88, rawText, entities };
  }
  if (/bell|ghanti|\u0918\u0902\u091f\u0940|\u0936\u0902\u0916|shankh/i.test(rawText)) {
    return { type: "ring_bell", confidence: 0.86, rawText, entities };
  }
  if (/offer|flower|pushp|phool|marigold|\u092b\u0942\u0932|\u092a\u0941\u0937\u094d\u092a|\u091a\u0922\u093c/i.test(rawText)) {
    return { type: "offer_flower", confidence: 0.88, rawText, entities };
  }
  if (/daily|today|aaj|\u0906\u091c|suggestion|sankalp|\u0938\u0902\u0915\u0932\u094d\u092a/i.test(rawText)) {
    return { type: "daily_devotion", confidence: 0.82, rawText, entities };
  }
  if (/meaning|explain|arth|matlab|\u0905\u0930\u094d\u0925|\u092e\u0924\u0932\u092c/i.test(rawText)) {
    return { type: "explain_mantra", confidence: 0.82, rawText, entities };
  }
  if (/favorite|favourite|saved|\u092a\u0938\u0902\u0926/i.test(rawText)) {
    return { type: "show_favorites", confidence: 0.78, rawText, entities };
  }
  if (deityHit && /\b(bhajan|darshan|mandir|deity)\b/i.test(rawText) && !/\b(chalao|play)\b/i.test(rawText)) {
    return { type: "find_deity", confidence: 0.75, rawText, entities };
  }
  if (/\b(chalao|play|bajao|sunao)\b/i.test(rawText) || /bhajan|aarti|chalisa|\u092d\u091c\u0928/i.test(rawText)) {
    return {
      type: "search_bhajan",
      confidence: 0.8,
      rawText,
      entities: { ...entities, bhajanName: extractBhajanQuery(rawText) || deityHit?.name || text },
    };
  }
  if (/\b(find|search|dhundho|chahiye)\b/i.test(rawText)) {
    return {
      type: "search_bhajan",
      confidence: 0.72,
      rawText,
      entities: { ...entities, bhajanName: extractBhajanQuery(rawText) || text },
    };
  }
  if (looksLikeDirectSongQuery(rawText)) {
    return {
      type: "search_bhajan",
      confidence: 0.71,
      rawText,
      entities: { ...entities, bhajanName: extractBhajanQuery(rawText) || text },
    };
  }

  return { type: "unknown", confidence: 0.2, rawText, entities };
}

function defaultMantraForDeity(deity?: string) {
  if (deity === "Hanuman") return "Hanuman Chalisa";
  if (deity === "Shiva") return "Om Namah Shivaya";
  if (deity === "Krishna") return "Hare Krishna Mahamantra";
  if (deity === "Rama") return "Shri Ram Jai Ram";
  if (deity === "Durga") return "Om Dum Durgayei Namaha";
  if (deity === "Ganesh") return "Om Gam Ganapataye Namaha";
  if (deity === "Lakshmi") return "Om Mahalakshmyai Namaha";
  return "Om Namah Shivaya";
}

function withDeity(intent: NaradIntent): Pick<NaradActionResult, "deitySlug" | "deityName" | "deityImageUrl"> {
  const slug = intent.entities.deitySlug ?? "krishna";
  const d = deities.find((x) => x.slug === slug) ?? deities[0];
  return {
    deitySlug: d.slug,
    deityName: d.nameHindi || d.name,
    deityImageUrl: d.imageUrl,
  };
}

export function createNaradActionResult(intent: NaradIntent): NaradActionResult | null {
  if (intent.confidence < 0.7 || intent.type === "unknown") return null;

  const mantra = intent.entities.mantra ?? defaultMantraForDeity(intent.entities.deity);
  const deityFields = withDeity(intent);

  if (intent.type === "start_japa") {
    return {
      kind: "japa_start",
      intentType: intent.type,
      title: "108 Japa",
      displayText: `108-count japa with ${mantra}. Tap each chant; milestones at 27, 54, 81, 108.`,
      spokenText: `Starting 108 japa for ${mantra}. Set your sankalp when ready.`,
      primaryLabel: "Start japa",
      secondaryLabel: "Open chat",
      mantra,
      ...deityFields,
    };
  }

  if (intent.type === "start_meditation") {
    return {
      kind: "route",
      intentType: intent.type,
      title: "Meditation",
      displayText: "Open meditation — mantra, breath, sleep, and focus practices.",
      spokenText: "Opening meditation. Choose a calm practice.",
      primaryLabel: "Start meditation",
      route: "/meditation",
      mantra,
      ...deityFields,
    };
  }

  if (intent.type === "offer_flower") {
    return {
      kind: "offering",
      intentType: intent.type,
      title: "Flower offering",
      displayText: "Offer a flower with devotion — light, respectful, and free.",
      spokenText: "Offering a flower with your devotion.",
      primaryLabel: "Offer flower",
      secondaryLabel: "Start japa",
      offeringType: "flower",
      mantra,
      ...deityFields,
    };
  }

  if (intent.type === "ring_bell") {
    return {
      kind: "offering",
      intentType: intent.type,
      title: "Temple bell",
      displayText: "Ring the bell to begin with focus.",
      spokenText: "Ringing the temple bell.",
      primaryLabel: "Ring bell",
      offeringType: "bell",
      ...deityFields,
    };
  }

  if (intent.type === "light_diya") {
    return {
      kind: "offering",
      intentType: intent.type,
      title: "Light diya",
      displayText: "Light a diya for your prayer.",
      spokenText: "Lighting the diya.",
      primaryLabel: "Light diya",
      offeringType: "diya",
      ...deityFields,
    };
  }

  if (intent.type === "daily_devotion") {
    return {
      kind: "daily_devotion",
      intentType: intent.type,
      title: "Today's devotion",
      displayText: `Begin with ${mantra}, one peaceful bhajan, and a small sankalp today.`,
      spokenText: `For today, begin with ${mantra}, then one peaceful bhajan.`,
      primaryLabel: "Begin 2 min",
      secondaryLabel: "Find bhajan",
      mantra,
      ...deityFields,
    };
  }

  if (intent.type === "explain_mantra") {
    const specific = mantra ? `${mantra}: chant with focus and humility. ` : "";
    return {
      kind: "answer",
      intentType: intent.type,
      title: "Mantra guidance",
      displayText: `${specific}${SAFE_EXPLAIN}`,
      spokenText: `${specific}${SAFE_EXPLAIN}`.slice(0, 200),
      primaryLabel: "Find bhajan",
      ...deityFields,
    };
  }

  if (intent.type === "show_favorites") {
    return {
      kind: "answer",
      intentType: intent.type,
      title: "Favorites",
      displayText: "Showing your saved bhajans.",
      spokenText: "Here are your favorite bhajans.",
      primaryLabel: "View favorites",
      ...deityFields,
    };
  }

  if (intent.type === "find_deity" && intent.entities.deitySlug) {
    return {
      kind: "route",
      intentType: intent.type,
      title: intent.entities.deity ?? "Deity",
      displayText: `Opening ${intent.entities.deity} darshan.`,
      spokenText: `Opening ${intent.entities.deity}.`,
      primaryLabel: "Open",
      route: intent.entities.deitySlug ? `/temple?deity=${intent.entities.deitySlug}` : "/temple",
      ...deityFields,
    };
  }

  if (intent.type === "search_bhajan" && intent.entities.bhajanName) {
    return {
      kind: "bhajan_search",
      intentType: intent.type,
      title: "Bhajan search",
      displayText: `Searching for “${intent.entities.bhajanName}”…`,
      spokenText: `Searching bhajans for ${intent.entities.bhajanName}.`,
      primaryLabel: "See results",
      searchQuery: intent.entities.bhajanName,
      ...deityFields,
    };
  }

  return null;
}
