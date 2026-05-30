import { CHANT, OM } from "@/lib/meditation/unicode";

export type PracticeType = "mantra" | "breath" | "sleep" | "focus";
export type BreathPatternId = "box" | "four_seven_eight" | "sama_vritti" | "anulom_vilom";
export type VisualMode = "full_mandala" | "minimal" | "dim" | "breath_ring";
export type AudioMode = "synth" | "silent";
export type AmbienceId = "tanpura" | "bell" | "rain" | "river" | "flute" | "silence";

export type MantraId = "om_namah_shivaya" | "hare_krishna" | "jai_shree_ram" | "om_namo_narayanaya" | "radhe_radhe";

export type MeditationPractice = {
  id: string;
  type: PracticeType;
  title: string;
  subtitle: string;
  chant?: string;
  mantraId?: MantraId;
  breathPattern?: BreathPatternId;
  defaultDurationMinutes: number;
  durationOptions: (number | "open")[];
  audioMode: AudioMode;
  visualMode: VisualMode;
  difficulty: "beginner" | "gentle" | "deep";
  goalTags: string[];
  deityJourney?: string;
};

export type MeditationPreset = {
  id: string;
  name: string;
  practiceId: string;
  durationMinutes: number | "open";
  warmupSeconds: number;
  intervalMinutes: number | null;
  endingBell: boolean;
  backgroundSound: AmbienceId;
  visualMode: VisualMode;
};

export type MeditationSessionLog = {
  id: string;
  practiceId: string;
  practiceType: PracticeType;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  completed: boolean;
  moodBefore?: string;
  moodAfter?: string;
  journalText?: string;
  sankalp?: string;
  japaCount?: number;
  japaTarget?: 108 | 54 | 27;
  mantraId?: MantraId;
};

export type MeditationPreferences = {
  volume: number;
  reducedMotion: boolean;
  highContrast: boolean;
  lastPracticeId: string | null;
  lastPresetId: string | null;
  favoritePresetIds: string[];
  ambience: Record<AmbienceId, boolean>;
  endingBellEnabled: boolean;
  intervalMinutes: number | null;
  warmupSeconds: number;
  customDurationMinutes: number;
  japaTarget: 108 | 54 | 27;
};

export const DEFAULT_PREFERENCES: MeditationPreferences = {
  volume: 0.55,
  reducedMotion: false,
  highContrast: false,
  lastPracticeId: "mantra_shiva",
  lastPresetId: null,
  favoritePresetIds: [],
  ambience: { tanpura: true, bell: true, rain: false, river: false, flute: false, silence: false },
  endingBellEnabled: true,
  intervalMinutes: null,
  warmupSeconds: 0,
  customDurationMinutes: 15,
  japaTarget: 108,
};

export const BREATH_PATTERNS: Record<
  BreathPatternId,
  { label: string; inhale: number; hold?: number; exhale: number; holdAfter?: number }
> = {
  box: { label: "Box breathing", inhale: 4, hold: 4, exhale: 4, holdAfter: 4 },
  four_seven_eight: { label: "4-7-8 calm", inhale: 4, hold: 7, exhale: 8 },
  sama_vritti: { label: "Sama vritti", inhale: 5, exhale: 5 },
  anulom_vilom: { label: "Alternate nostril pace", inhale: 4, hold: 2, exhale: 4, holdAfter: 2 },
};

export const MANTRA_PRACTICES: MeditationPractice[] = [
  {
    id: "mantra_shiva",
    type: "mantra",
    title: "Om Namah Shivaya",
    subtitle: "Shiva stillness · centering japa",
    chant: CHANT.omNamahShivaya,
    mantraId: "om_namah_shivaya",
    defaultDurationMinutes: 11,
    durationOptions: [5, 11, 21, "open"],
    audioMode: "synth",
    visualMode: "full_mandala",
    difficulty: "beginner",
    goalTags: ["peace", "devotion"],
    deityJourney: "Shiva",
  },
  {
    id: "mantra_krishna",
    type: "mantra",
    title: "Hare Krishna",
    subtitle: "Krishna devotion · mahamantra",
    chant: CHANT.hareKrishna,
    mantraId: "hare_krishna",
    defaultDurationMinutes: 11,
    durationOptions: [5, 11, 21, "open"],
    audioMode: "synth",
    visualMode: "full_mandala",
    difficulty: "gentle",
    goalTags: ["bhakti", "joy"],
    deityJourney: "Krishna",
  },
  {
    id: "mantra_radhe",
    type: "mantra",
    title: "Radhe Radhe",
    subtitle: "Radha-Krishna bhakti - naam japa",
    chant: CHANT.radheRadhe,
    mantraId: "radhe_radhe",
    defaultDurationMinutes: 11,
    durationOptions: [5, 11, 21, "open"],
    audioMode: "synth",
    visualMode: "full_mandala",
    difficulty: "beginner",
    goalTags: ["bhakti", "joy"],
    deityJourney: "Radhe Radhe",
  },
  {
    id: "mantra_ram",
    type: "mantra",
    title: "Jai Shree Ram",
    subtitle: "Rama courage · steadfast heart",
    chant: CHANT.jaiShreeRam,
    mantraId: "jai_shree_ram",
    defaultDurationMinutes: 11,
    durationOptions: [5, 11, 21, "open"],
    audioMode: "synth",
    visualMode: "full_mandala",
    difficulty: "gentle",
    goalTags: ["strength", "dharma"],
    deityJourney: "Rama",
  },
  {
    id: "mantra_narayana",
    type: "mantra",
    title: "Om Namo Narayanaya",
    subtitle: "Narayana peace · surrender",
    chant: CHANT.omNamoNarayanaya,
    mantraId: "om_namo_narayanaya",
    defaultDurationMinutes: 11,
    durationOptions: [5, 11, 21, "open"],
    audioMode: "synth",
    visualMode: "full_mandala",
    difficulty: "deep",
    goalTags: ["peace", "protection"],
    deityJourney: "Narayana",
  },
];

export const BREATH_PRACTICES: MeditationPractice[] = BREATH_PATTERNS
  ? (Object.keys(BREATH_PATTERNS) as BreathPatternId[]).map((id) => ({
      id: `breath_${id}`,
      type: "breath" as const,
      title: BREATH_PATTERNS[id].label,
      subtitle: "Guided pranayama pacing",
      breathPattern: id,
      defaultDurationMinutes: 5,
      durationOptions: [2, 5, 11, "open"],
      audioMode: "synth" as const,
      visualMode: "breath_ring" as const,
      difficulty: "beginner" as const,
      goalTags: ["calm", "breath"],
    }))
  : [];

export const SLEEP_PRACTICE: MeditationPractice = {
  id: "sleep_rest",
  type: "sleep",
  title: "Sleep Dhyan",
  subtitle: "Dim mandala · soft drone · long rest",
  defaultDurationMinutes: 21,
  durationOptions: [11, 21, 45, "open"],
  audioMode: "synth",
  visualMode: "dim",
  difficulty: "gentle",
  goalTags: ["sleep", "rest"],
};

export const FOCUS_PRACTICE: MeditationPractice = {
  id: "focus_clarity",
  type: "focus",
  title: "Focus Sankalp",
  subtitle: "Minimal visuals · interval bells",
  defaultDurationMinutes: 11,
  durationOptions: [5, 11, 21, "open"],
  audioMode: "synth",
  visualMode: "minimal",
  difficulty: "beginner",
  goalTags: ["focus", "clarity"],
};

export const QUICK_PRACTICE: MeditationPractice = {
  id: "quick_two",
  type: "mantra",
  title: "2-Minute Pause",
  subtitle: "When time is short · Hari Om",
  chant: OM,
  mantraId: "om_namah_shivaya",
  defaultDurationMinutes: 2,
  durationOptions: [2],
  audioMode: "synth",
  visualMode: "full_mandala",
  difficulty: "beginner",
  goalTags: ["quick"],
};

export const ALL_PRACTICES: MeditationPractice[] = [
  QUICK_PRACTICE,
  ...MANTRA_PRACTICES,
  ...BREATH_PRACTICES,
  SLEEP_PRACTICE,
  FOCUS_PRACTICE,
];

export function getPracticeById(id: string): MeditationPractice | undefined {
  return ALL_PRACTICES.find((p) => p.id === id);
}

export const DEFAULT_PRESETS: MeditationPreset[] = [
  {
    id: "preset_morning",
    name: "Morning japa",
    practiceId: "mantra_shiva",
    durationMinutes: 11,
    warmupSeconds: 30,
    intervalMinutes: null,
    endingBell: true,
    backgroundSound: "tanpura",
    visualMode: "full_mandala",
  },
  {
    id: "preset_sleep",
    name: "Night rest",
    practiceId: "sleep_rest",
    durationMinutes: 21,
    warmupSeconds: 60,
    intervalMinutes: null,
    endingBell: false,
    backgroundSound: "rain",
    visualMode: "dim",
  },
];
