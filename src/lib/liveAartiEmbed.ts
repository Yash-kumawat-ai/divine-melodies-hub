import type { Temple } from '@/types/liveAarti';

export function getTempleEmbedUrl(temple: Temple): string | null {
  if (temple.videoId) {
    return `https://www.youtube-nocookie.com/embed/${temple.videoId}?autoplay=1&rel=0`;
  }
  if (temple.youtubeChannelId) {
    return `https://www.youtube-nocookie.com/embed/live_stream?channel=${temple.youtubeChannelId}&autoplay=1&rel=0`;
  }
  return null;
}

export const LIVE_AARTI_CANONICAL = 'https://harikirtan.com/live-aarti';
export const LIVE_AARTI_OG_IMAGE = 'https://harikirtan.com/brand-logo.webp';
