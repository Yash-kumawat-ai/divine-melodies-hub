/** @deprecated Import from @/lib/meditation/meditationTypes */
export type { MantraId } from "@/lib/meditation/meditationTypes";
export { MANTRA_PRACTICES as MANTRA_OPTIONS } from "@/lib/meditation/meditationTypes";

export const TIMER_PRESETS = [
  { minutes: 2, label: "2 min" },
  { minutes: 5, label: "5 min" },
  { minutes: 11, label: "11 min" },
  { minutes: 21, label: "21 min" },
] as const;
