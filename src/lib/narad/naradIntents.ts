import { deities } from "@/data/bhajans";

export type NaradIntentType =
  | "start_japa"
  | "start_meditation"
  | "daily_devotion"
  | "explain_mantra"
  | "show_favorites"
  | "search_bhajan"
  | "offer_flower"
  | "open_kundli"
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
    .replace(/\b(chalao|play|bajao|sunao|find|search|dhundho|mujhe|please|koi|show me)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasSongCue(rawText: string): boolean {
  return /\b(chalao|play|bajao|sunao|bhajan|aarti|chalisa|\u092d\u091c\u0928|\u0906\u0930\u0924\u0940|\u091a\u093e\u0932\u0940\u0938\u093e)\b/i.test(
    rawText,
  );
}

export function looksLikeDirectSongQuery(rawText: string): boolean {
  const text = rawText.trim();
  if (!text || text.length < 2 || text.length > 80) return false;
  if (/[?]/.test(text)) return false;
  if (/^(hi|hello|hey|namaste|help|ram ram)$/i.test(text)) return false;
  if (/^(kya|kaise|kyun|why|how|what)\b/i.test(text)) return false;
  if (
    /^(find a bhajan|add a bhajan|start 108 japa|start meditation|offer flower|today'?s pick|today'?s devotion|aarti collection|my favorites)$/i.test(
      text,
    )
  ) {
    return false;
  }
  const words = text.split(/\s+/).filter(Boolean);
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  if (words.length === 1 && !hasDevanagari && text.length < 6) return false;
  return true;
}

export function parseNaradIntent(rawText: string): NaradIntent {
  const normalizedRaw = rawText.normalize('NFD');
  const text = normalize(normalizedRaw);
  const deityHit = findDeity(normalizedRaw);
  const mantra = findMantra(normalizedRaw);
  const entities = {
    deity: deityHit?.name,
    deitySlug: deityHit?.slug,
    mantra,
  };

  if (/offer flower|phool chadh|flower offering|offer a flower|diya jalao|ghanti bajao/i.test(normalizedRaw)) {
    return { type: "offer_flower", confidence: 0.9, rawText: normalizedRaw, entities };
  }

  if (
    !hasSongCue(normalizedRaw) &&
    /kundli|kundali|janampatri|horoscope|shaadi|vivah|\bcareer\b|\bmarriage\b|\bnaukri\b|\u0915\u0941\u0902\u0921\u0932\u0940|\u091c\u094d\u092f\u094b\u0924\u093f\u0937/i.test(
      normalizedRaw,
    )
  ) {
    return { type: "open_kundli", confidence: 0.88, rawText: normalizedRaw, entities };
  }

  if (/japa|jaap|jap|chant|108|\u092e\u093e\u0932\u093e|\u091c\u092a|\u091c\u093e\u092a/i.test(normalizedRaw)) {
    return { type: "start_japa", confidence: 0.94, rawText: normalizedRaw, entities };
  }
  if (/meditat|dhyan|\u0927\u094d\u092f\u093e\u0928|shanti|calm/i.test(normalizedRaw)) {
    return { type: "start_meditation", confidence: 0.9, rawText: normalizedRaw, entities };
  }

  if (
    !hasSongCue(normalizedRaw) &&
    /daily|today|aaj|\u0906\u091c|suggestion|sankalp|\u0938\u0902\u0915\u0932\u094d\u092a/i.test(normalizedRaw)
  ) {
    return { type: "daily_devotion", confidence: 0.82, rawText: normalizedRaw, entities };
  }
  if (/meaning|explain|arth|matlab|\u0905\u0930\u094d\u0925|\u092e\u0924\u0932\u092c/i.test(normalizedRaw)) {
    return { type: "explain_mantra", confidence: 0.82, rawText: normalizedRaw, entities };
  }
  if (/favorite|favourite|saved|\u092a\u0938\u0902\u0926/i.test(normalizedRaw)) {
    return { type: "show_favorites", confidence: 0.78, rawText: normalizedRaw, entities };
  }

  if (/\b(chalao|play|bajao|sunao)\b/i.test(normalizedRaw) || /bhajan|aarti|chalisa|\u092d\u091c\u0928/i.test(normalizedRaw)) {
    return {
      type: "search_bhajan",
      confidence: 0.8,
      rawText: normalizedRaw,
      entities: { ...entities, bhajanName: extractBhajanQuery(normalizedRaw) || deityHit?.name || text },
    };
  }
  if (/\b(find|search|dhundho|chahiye)\b/i.test(normalizedRaw)) {
    return {
      type: "search_bhajan",
      confidence: 0.72,
      rawText: normalizedRaw,
      entities: { ...entities, bhajanName: extractBhajanQuery(normalizedRaw) || text },
    };
  }
  if (looksLikeDirectSongQuery(normalizedRaw)) {
    return {
      type: "search_bhajan",
      confidence: 0.71,
      rawText: normalizedRaw,
      entities: { ...entities, bhajanName: extractBhajanQuery(normalizedRaw) || text },
    };
  }

  return { type: "unknown", confidence: 0.2, rawText: normalizedRaw, entities };
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

  if (intent.type === "open_kundli") {
    return {
      kind: "route",
      intentType: intent.type,
      title: "Vedic Kundli",
      displayText: "Open your Vedic Kundli to view your planetary chart and insights.",
      spokenText: "Opening your Vedic Kundli.",
      primaryLabel: "View Kundli",
      route: "/kundli",
      ...deityFields,
    };
  }

  if (intent.type === "start_japa") {
    return {
      kind: "japa_start",
      intentType: intent.type,
      title: "108 Japa",
      displayText: `108-count japa with ${mantra}. Tap each chant; milestones at 27, 54, 81, 108.`,
      spokenText: `Starting 108 japa for ${mantra}. Set your sankalp when ready.`,
      primaryLabel: "Start japa",
      secondaryLabel: "Open chat",
      route: "/meditation/mantra-japa",
      mantra,
      ...deityFields,
    };
  }

  if (intent.type === "offer_flower") {
    return {
      kind: "offering",
      intentType: intent.type,
      title: "Temple offering",
      displayText: "Open the temple to offer a flower, bell, or diya.",
      spokenText: "Opening the temple for your offering.",
      primaryLabel: "Open temple",
      route: "/temple",
      offeringType: "flower",
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

export function resolveNaradActionPath(action: NaradActionResult): string | null {
  if (action.route) return action.route;
  if (action.kind === "japa_start") return "/meditation/mantra-japa";
  if (action.kind === "offering") return "/temple";
  return null;
}
