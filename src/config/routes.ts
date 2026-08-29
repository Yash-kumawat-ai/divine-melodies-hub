/** Centralized route constants — never hardcode paths outside this file */
export const ROUTES = {
  HOME: '/',
  BROWSE: '/all-bhajans',
  BHAJANS: '/all-bhajans',
  CHALISA: '/chalisa',
  AARTI: '/aarti',
  KATHA: '/katha',
  STOTRA: '/stotra',
  ASHTAKAM: '/ashtakam',
  KAVACH: '/kavach',
  DOHA: '/doha',
  MANTRA: '/mantra',
  SHLOKA: '/shloka',
  RACHANA: '/rachana',
  MANTRAS: '/mantras',
  AUDIO: '/audio',
  SHORTS: '/shorts',
  WALLPAPER: '/wallpaper',
  POSTERS: '/poster-maker',
  COMMUNITY: '/community',
  MEDITATION: '/meditation',
  PANCHANG: '/panchang',
  TEMPLE: '/temple',
  KIRTAN_AI: '/kirtan-ai',
  KUNDLI: '/kundli',
  KUNDLI_SETUP: '/kundli/setup',
  SEARCH: '/search',

  // Personal
  LIKED: '/account/liked',
  HISTORY: '/recent-bhajans',
  DOWNLOADS: '/downloads',
  LEADERBOARD: '/leaderboard',
  NOTIFICATIONS: '/notifications',
  SAVED: '/account/saved',

  // Account
  ACCOUNT: '/account',
  PROFILE: '/account',
  AUTH_LOGIN: '/auth/login',
  AUTH_SIGNUP: '/auth/signup',
  AUTH_COMPLETE_PROFILE: '/auth/complete-profile',

  // Settings
  SETTINGS: '/account',

  // About
  ABOUT: '/about',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  BLOG: '/blog',
  PRICING: '/pricing',
  SUPPORT: '/account/support',
  UPLOAD: '/upload-bhajan',
} as const;

export type RouteValue = (typeof ROUTES)[keyof typeof ROUTES];
