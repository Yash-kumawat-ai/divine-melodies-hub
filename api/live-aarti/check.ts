import data from '../../src/data/liveAartis.json';
import { isTitleDevotional } from '../../src/utils/contentFilter';

export const config = {
  maxDuration: 15,
};

// In-memory cache for Vercel serverless warm instances (persists across short intervals)
const localCache: Record<string, {
  id: string;
  status: 'LIVE' | 'UPCOMING' | 'OFFLINE' | 'STREAM_UNAVAILABLE';
  liveTitle: string | null;
  videoId: string | null;
  lastVerifiedAt: string;
}> = {};

export default async function handler(request: Request): Promise<Response> {
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
  });

  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  }

  const url = new URL(request.url);
  const templeId = url.searchParams.get('templeId');

  if (!templeId) {
    return new Response(JSON.stringify({ error: 'Missing templeId parameter' }), { status: 400, headers });
  }

  const temple = data.temples.find(t => t.id === templeId);
  if (!temple) {
    return new Response(JSON.stringify({ error: 'Unknown templeId' }), { status: 404, headers });
  }

  const nowStr = new Date().toISOString();

  // Serve from hot cache if checked in the last 30 seconds
  const cachedVal = localCache[templeId];
  if (cachedVal && (Date.now() - new Date(cachedVal.lastVerifiedAt).getTime() < 30000)) {
    return new Response(JSON.stringify(cachedVal), { status: 200, headers });
  }

  const getFallbackState = (): 'UPCOMING' | 'OFFLINE' => {
    return temple.aartiSchedule.length > 0 ? 'UPCOMING' : 'OFFLINE';
  };

  const targetUrl = temple.youtubeChannelId
    ? `https://www.youtube.com/channel/${temple.youtubeChannelId}/live`
    : `https://www.youtube.com/${temple.youtubeHandle}/live`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout for YouTube fetch

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cookie': 'CONSENT=YES+cb.20210328-17-p0.en+FX+943'
      }
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const html = await res.text();
    const finalUrl = res.url;

    // Check if the page is currently live on YouTube (either redirected to watch or has live indicators)
    const isRedirectToWatch = finalUrl.includes('/watch') || finalUrl.includes('?v=');
    const isLiveInHtml = html.includes('"isLive":true') || 
                         html.includes('"isLiveStream":true') || 
                         html.includes('{"livePlayables":') ||
                         html.includes('yt-playertab-active');

    if (isRedirectToWatch || isLiveInHtml) {
      // Extract video ID
      let videoId: string | null = null;
      const videoIdMatch = html.match(/"videoId":"([^"]+)"/) || finalUrl.match(/[?&]v=([^&]+)/);
      if (videoIdMatch) {
        videoId = videoIdMatch[1];
      }

      // Extract stream title
      const titleMatch = html.match(/<meta name="title" content="([^"]+)"/i) || html.match(/<title>([^<]+)<\/title>/i);
      const liveTitle = titleMatch ? titleMatch[1].replace(/\s*-\s*YouTube/i, '').trim() : '';

      // For mixed-content channels, validate title keywords
      if (temple.requiresTitleFilter) {
        const isDevotional = isTitleDevotional(liveTitle);
        if (!isDevotional) {
          const result = {
            id: templeId,
            status: 'STREAM_UNAVAILABLE' as const,
            liveTitle: liveTitle || null,
            videoId,
            lastVerifiedAt: nowStr
          };
          localCache[templeId] = result;
          return new Response(JSON.stringify(result), { status: 200, headers });
        }
      }

      const result = {
        id: templeId,
        status: 'LIVE' as const,
        liveTitle: liveTitle || null,
        videoId,
        lastVerifiedAt: nowStr
      };
      localCache[templeId] = result;
      return new Response(JSON.stringify(result), { status: 200, headers });
    } else {
      // Stream is offline
      const result = {
        id: templeId,
        status: getFallbackState(),
        liveTitle: null,
        videoId: null,
        lastVerifiedAt: nowStr
      };
      localCache[templeId] = result;
      return new Response(JSON.stringify(result), { status: 200, headers });
    }
  } catch (error) {
    console.error(`Live status check failed for ${templeId}:`, error);
    // Safe fallback: never show LIVE if verification fails. Show scheduled status.
    const result = {
      id: templeId,
      status: getFallbackState(),
      liveTitle: null,
      videoId: null,
      lastVerifiedAt: nowStr
    };
    return new Response(JSON.stringify(result), { status: 200, headers });
  }
}
