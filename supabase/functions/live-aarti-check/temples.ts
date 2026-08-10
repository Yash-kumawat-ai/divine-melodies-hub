/** Minimal temple config for live verification (mirrors src/data/liveAartis.json). */

export type TempleConfig = {
  id: string;
  youtubeChannelId: string | null;
  youtubeHandle: string;
  requiresTitleFilter: boolean;
  aartiSchedule: { time: string; durationMinutes: number }[];
};

export const CONTENT_FILTER = {
  allowedKeywords: [
    "aarti", "arti", "darshan", "mangala", "mangal", "shayan", "sandhya",
    "rajbhog", "abhishek", "bhasma", "kirtan", "bhajan", "mahakal",
    "mahakaleshwar", "vishwanath", "kashi", "somnath", "hanuman", "balaji",
    "krishna", "radha", "shiv", "shiva", "jyotirlinga", "temple", "mandir",
    "guru puja", "mayapur", "khatu shyam", "shyam baba", "salasar",
    "salangpur", "kashtabhanjan", "radhavallabh", "vrindavan", "live",
  ],
  blockedKeywords: [
    "rashifal", "horoscope", "astrology", "kundli", "prediction",
    "vastu", "numerology", "stock market", "breaking news", "politics",
    "election", "debate", "news", "interview", "podcast", "discussion",
    "राशिफल", "कुंडली", "भविष्यफल",
  ],
};

export const TEMPLES: TempleConfig[] = [
  {
    id: "mayapur-tv",
    youtubeHandle: "@MayapurTVOfficial",
    youtubeChannelId: "UCsSFEZMHnMFq8cMwBtwHUeA",
    requiresTitleFilter: false,
    aartiSchedule: [
      { time: "04:30", durationMinutes: 45 },
      { time: "07:15", durationMinutes: 30 },
      { time: "19:00", durationMinutes: 45 },
    ],
  },
  {
    id: "somnath-temple",
    youtubeHandle: "@SomnathTempleOfficialChannel",
    youtubeChannelId: "UCT1egsvA08YcdMLiEu1DTRg",
    requiresTitleFilter: false,
    aartiSchedule: [
      { time: "06:00", durationMinutes: 45 },
      { time: "19:00", durationMinutes: 45 },
    ],
  },
  {
    id: "kashi-vishwanath",
    youtubeHandle: "@ShreeKashiVishwanathMandir",
    youtubeChannelId: "UCdMj2twWfMHXrWgX5oVdoyA",
    requiresTitleFilter: false,
    aartiSchedule: [
      { time: "03:00", durationMinutes: 45 },
      { time: "12:00", durationMinutes: 30 },
      { time: "19:00", durationMinutes: 45 },
      { time: "22:30", durationMinutes: 30 },
    ],
  },
  {
    id: "salasar-balaji",
    youtubeHandle: "@salasarofficial",
    youtubeChannelId: "UC82-0zBQho_hyV10fFAAeQA",
    requiresTitleFilter: false,
    aartiSchedule: [
      { time: "05:30", durationMinutes: 30 },
      { time: "12:00", durationMinutes: 30 },
      { time: "19:30", durationMinutes: 30 },
      { time: "21:00", durationMinutes: 30 },
    ],
  },
  {
    id: "salangpur-hanumanji",
    youtubeHandle: "@salangpurhanumanji",
    youtubeChannelId: "UCI1r_MNxzyvUPHyTdWDe4NA",
    requiresTitleFilter: false,
    aartiSchedule: [
      { time: "06:00", durationMinutes: 45 },
      { time: "19:00", durationMinutes: 45 },
    ],
  },
  {
    id: "radha-vallabh-vrindavan",
    youtubeHandle: "@ShriRadhaVallabh-kq6hm",
    youtubeChannelId: "UCKbfb6ChkOPCVL4ECcmUNTA",
    requiresTitleFilter: false,
    aartiSchedule: [
      { time: "07:30", durationMinutes: 30 },
      { time: "09:00", durationMinutes: 30 },
      { time: "12:00", durationMinutes: 30 },
      { time: "19:30", durationMinutes: 45 },
      { time: "21:30", durationMinutes: 30 },
    ],
  },
  {
    id: "shyam-bhakti-rang",
    youtubeHandle: "@ShyamBhaktiRang",
    youtubeChannelId: "UCg-mRgmubxFEJchzkDUuq5Q",
    requiresTitleFilter: true,
    aartiSchedule: [
      { time: "05:00", durationMinutes: 30 },
      { time: "19:00", durationMinutes: 30 },
    ],
  },
  {
    id: "dd-astro",
    youtubeHandle: "@DDAstro",
    youtubeChannelId: "UCRlCP3s0DGzfFNZhR6oozRg",
    requiresTitleFilter: true,
    aartiSchedule: [],
  },
  {
    id: "doordarshan-national",
    youtubeHandle: "@DoordarshanNational",
    youtubeChannelId: "UCSjPe5kinQtwcyHcFJyyMfw",
    requiresTitleFilter: true,
    aartiSchedule: [],
  },
];
