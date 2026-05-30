import type { YouTubePlayerVideo } from '@/hooks/useYouTubePlayer';
import { extractYouTubeVideoId, searchYouTubeVideos } from '@/lib/youtubeSearch';

/** YouTube video ids are typically 11 chars; allow short ids from some URLs. */
const VIDEO_ID_RE = /^[a-zA-Z0-9_-]{6,32}$/;

export type BhajanYouTubeFields = {
  videoEmbedId?: string;
  youtubeUrl?: string;
  title: string;
  singerName: string;
};

/** Resolve a playable YouTube video id for a bhajan (embed, URL, or search). */
export async function resolveBhajanYouTubeVideoId(b: BhajanYouTubeFields): Promise<string | null> {
  const eid = b.videoEmbedId?.trim();
  if (eid && VIDEO_ID_RE.test(eid)) return eid;

  const fromUrl = b.youtubeUrl?.trim() ? extractYouTubeVideoId(b.youtubeUrl) : null;
  if (fromUrl && VIDEO_ID_RE.test(fromUrl)) return fromUrl;

  const q = `${b.title} ${b.singerName}`.trim();
  if (q.length < 2) return null;

  const results = await searchYouTubeVideos(`${q} bhajan`);
  const first = results[0]?.id?.trim();
  if (first && VIDEO_ID_RE.test(first)) return first;

  return null;
}

/** Resolve embedded video metadata for the shared in-app player. */
export async function resolveBhajanYouTubePlayback(
  b: BhajanYouTubeFields,
): Promise<YouTubePlayerVideo | null> {
  const eid = b.videoEmbedId?.trim();
  if (eid && VIDEO_ID_RE.test(eid)) {
    return {
      id: eid,
      title: b.title,
      channel: b.singerName || undefined,
    };
  }

  const fromUrl = b.youtubeUrl?.trim() ? extractYouTubeVideoId(b.youtubeUrl) : null;
  if (fromUrl && VIDEO_ID_RE.test(fromUrl)) {
    return {
      id: fromUrl,
      title: b.title,
      channel: b.singerName || undefined,
    };
  }

  const q = `${b.title} ${b.singerName}`.trim();
  if (q.length < 2) return null;

  const first = (await searchYouTubeVideos(`${q} bhajan`))[0];
  const id = first?.id?.trim();
  if (!id || !VIDEO_ID_RE.test(id)) return null;

  return {
    id,
    title: first.title || b.title,
    channel: first.channel || b.singerName || undefined,
  };
}

/** When in-app embed/search fails, open YouTube in a new tab so playback still works (e.g. Narad on mobile). */
export function openYouTubeSearchFallback(b: BhajanYouTubeFields): void {
  const rawUrl = b.youtubeUrl?.trim();
  if (rawUrl) {
    const url = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }

  const q = `${b.title} ${b.singerName} bhajan`.trim();
  if (q.length < 2) return;
  window.open(
    `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
    '_blank',
    'noopener,noreferrer',
  );
}
