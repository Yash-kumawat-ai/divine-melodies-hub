export interface YouTubeVideoResult {
  id: string;
  title: string;
  channel: string;
  duration?: string;
  viewsText?: string;
  thumbnailUrl?: string;
  publishedText?: string;
}

interface InvidiousSearchItem {
  type: string;
  videoId?: string;
  title?: string;
  author?: string;
  lengthSeconds?: number;
  viewCountText?: string;
  publishedText?: string;
  videoThumbnails?: Array<{
    quality: string;
    url: string;
  }>;
}

function toDurationLabel(seconds?: number): string {
  if (!seconds || Number.isNaN(seconds) || seconds < 0) return '';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function getBestThumbnail(item: InvidiousSearchItem): string | undefined {
  const list = item.videoThumbnails || [];
  const sorted = [...list].sort((a, b) => {
    const aScore = a.quality.includes('maxres') ? 3 : a.quality.includes('high') ? 2 : 1;
    const bScore = b.quality.includes('maxres') ? 3 : b.quality.includes('high') ? 2 : 1;
    return bScore - aScore;
  });
  return sorted[0]?.url;
}

async function searchViaProxy(query: string): Promise<YouTubeVideoResult[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const url = `/api/youtube-search?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!response.ok) return [];

    const raw = (await response.json()) as InvidiousSearchItem[];

    return raw
      .filter((item) => item.type === 'video' && item.videoId && item.title)
      .slice(0, 12)
      .map((item) => ({
        id: item.videoId as string,
        title: item.title as string,
        channel: item.author || 'Unknown channel',
        duration: toDurationLabel(item.lengthSeconds),
        viewsText: item.viewCountText || '',
        publishedText: item.publishedText || '',
        thumbnailUrl: getBestThumbnail(item),
      }));
  } finally {
    clearTimeout(timeout);
  }
}

export async function searchYouTubeVideos(query: string): Promise<YouTubeVideoResult[]> {
  const cleaned = query.trim();
  if (cleaned.length < 2) return [];

  try {
    return await searchViaProxy(cleaned);
  } catch {
    return [];
  }
}

export function buildYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
}
