import type { Temple } from '@/types/liveAarti';
import { getPublicSiteUrl } from '@/lib/env';

export function getTempleEmbedUrl(temple: Temple): string | null {
  if (temple.videoId) {
    return `https://www.youtube-nocookie.com/embed/${temple.videoId}?autoplay=1&rel=0`;
  }
  if (temple.youtubeChannelId) {
    return `https://www.youtube-nocookie.com/embed/live_stream?channel=${temple.youtubeChannelId}&autoplay=1&rel=0`;
  }
  return null;
}

export const LIVE_AARTI_CANONICAL = `${getPublicSiteUrl()}/live-aarti`;
export const LIVE_AARTI_OG_IMAGE = `${getPublicSiteUrl()}/og-image.jpg`;
