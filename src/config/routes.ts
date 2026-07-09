/** Centralized route constants — never hardcode paths outside this file */
export const ROUTES = {
  HOME: '/',
  BROWSE: '/all-bhajans',
  BHAJANS: '/all-bhajans',
  CHALISA: '/chalisa',
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
