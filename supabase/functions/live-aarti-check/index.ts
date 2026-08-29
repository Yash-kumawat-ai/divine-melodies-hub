import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";
import { CONTENT_FILTER, TEMPLES, type TempleConfig } from "./temples.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
  "Cache-Control": "public, max-age=30, s-maxage=60",
};

type LiveStatus = "LIVE" | "UPCOMING" | "OFFLINE" | "STREAM_UNAVAILABLE";

type StatusRow = {
  id: string;
  status: LiveStatus;
  liveTitle: string | null;
  videoId: string | null;
  lastVerifiedAt: string;
  source?: "cache" | "youtube-api" | "scrape" | "fallback";
};

type CachedStatusRow = {
  temple_id: string;
  status: LiveStatus;
  live_title: string | null;
  video_id: string | null;
  last_verified_at: string;
};

const DEFAULT_STALE_MS = 90_000; // 90s — protects YouTube quota
const AARTI_WINDOW_STALE_MS = 45_000; // fresher near scheduled aarti

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders });
}

function isTitleDevotional(title: string): boolean {
  const lower = title.toLowerCase();
  if (CONTENT_FILTER.blockedKeywords.some((kw) => lower.includes(kw.toLowerCase()))) {
    return false;
  }
  return CONTENT_FILTER.allowedKeywords.some((kw) => lower.includes(kw.toLowerCase()));
}

function getISTParts(): { hours: number; minutes: number; totalMinutes: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const hours = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minutes = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return { hours, minutes, totalMinutes: hours * 60 + minutes };
}

function inAartiWindow(temple: TempleConfig, padMinutes = 20): boolean {
  if (!temple.aartiSchedule.length) return false;
  const { totalMinutes: now } = getISTParts();
  return temple.aartiSchedule.some((a) => {
    const [h, m] = a.time.split(":").map(Number);
    const start = h * 60 + m;
    const end = start + a.durationMinutes;
    return now >= start - padMinutes && now <= end + padMinutes;
  });
}

function fallbackStatus(temple: TempleConfig): LiveStatus {
  return temple.aartiSchedule.length > 0 ? "UPCOMING" : "OFFLINE";
}

function applyTitleFilter(
  temple: TempleConfig,
  status: LiveStatus,
  title: string | null,
  videoId: string | null,
): Pick<StatusRow, "status" | "liveTitle" | "videoId"> {
  if (status !== "LIVE") {
    return { status, liveTitle: title, videoId };
  }
  if (!temple.requiresTitleFilter) {
    return { status: "LIVE", liveTitle: title, videoId };
  }
  if (!title || !isTitleDevotional(title)) {
    return { status: "STREAM_UNAVAILABLE", liveTitle: title, videoId };
  }
  return { status: "LIVE", liveTitle: title, videoId };
}

async function checkVideoStillLive(
  apiKey: string,
  videoId: string,
): Promise<{ live: boolean; title: string | null }> {
  const url =
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${encodeURIComponent(videoId)}&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`videos.list ${res.status}`);
  const data = await res.json();
  const item = data.items?.[0];
  if (!item) return { live: false, title: null };
  const details = item.liveStreamingDetails;
  const title = item.snippet?.title ?? null;
  const live = Boolean(details?.actualStartTime) && !details?.actualEndTime;
  return { live, title };
}

async function searchChannelLive(
  apiKey: string,
  channelId: string,
): Promise<{ videoId: string | null; title: string | null }> {
  const url =
    `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${encodeURIComponent(channelId)}&eventType=live&type=video&maxResults=1&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`search.list ${res.status}`);
  const data = await res.json();
  const item = data.items?.[0];
  if (!item) return { videoId: null, title: null };
  return {
    videoId: item.id?.videoId ?? null,
    title: item.snippet?.title ?? null,
  };
}

async function scrapeYouTubeLive(temple: TempleConfig): Promise<{
  live: boolean;
  videoId: string | null;
  title: string | null;
}> {
  const targetUrl = temple.youtubeChannelId
    ? `https://www.youtube.com/channel/${temple.youtubeChannelId}/live`
    : `https://www.youtube.com/${temple.youtubeHandle}/live`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Cookie: "CONSENT=YES+cb.20210328-17-p0.en+FX+943",
      },
      redirect: "follow",
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`YouTube HTTP ${res.status}`);

    const html = await res.text();
    const finalUrl = res.url;
    const isRedirectToWatch = finalUrl.includes("/watch") || finalUrl.includes("?v=");
    const isLiveInHtml =
      html.includes('"isLive":true') ||
      html.includes('"isLiveStream":true') ||
      html.includes('{"livePlayables":');

    if (!(isRedirectToWatch || isLiveInHtml)) {
      return { live: false, videoId: null, title: null };
    }

    const videoIdMatch =
      html.match(/"videoId":"([^"]+)"/) || finalUrl.match(/[?&]v=([^&]+)/);
    const titleMatch =
      html.match(/<meta name="title" content="([^"]+)"/i) ||
      html.match(/<title>([^<]+)<\/title>/i);

    return {
      live: true,
      videoId: videoIdMatch?.[1] ?? null,
      title: titleMatch
        ? titleMatch[1].replace(/\s*-\s*YouTube/i, "").trim()
        : null,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function verifyTemple(
  temple: TempleConfig,
  cachedVideoId: string | null,
  youtubeApiKey: string | undefined,
): Promise<StatusRow> {
  const nowIso = new Date().toISOString();

  // 1) Preferred: YouTube Data API (cheap re-check via videos.list)
  if (youtubeApiKey && temple.youtubeChannelId) {
    try {
      if (cachedVideoId) {
        const still = await checkVideoStillLive(youtubeApiKey, cachedVideoId);
        if (still.live) {
          const filtered = applyTitleFilter(temple, "LIVE", still.title, cachedVideoId);
          return {
            id: temple.id,
            ...filtered,
            lastVerifiedAt: nowIso,
            source: "youtube-api",
          };
        }
      }

      const found = await searchChannelLive(youtubeApiKey, temple.youtubeChannelId);
      if (found.videoId) {
        const filtered = applyTitleFilter(temple, "LIVE", found.title, found.videoId);
        return {
          id: temple.id,
          ...filtered,
          lastVerifiedAt: nowIso,
          source: "youtube-api",
        };
      }

      return {
        id: temple.id,
        status: fallbackStatus(temple),
        liveTitle: null,
        videoId: null,
        lastVerifiedAt: nowIso,
        source: "youtube-api",
      };
    } catch (err) {
      console.warn(`YouTube API failed for ${temple.id}, trying scrape:`, err);
    }
  }

  // 2) Fallback: HTML scrape (works without API key; may be blocked on some edge regions)
  try {
    const scraped = await scrapeYouTubeLive(temple);
    if (scraped.live) {
      const filtered = applyTitleFilter(
        temple,
        "LIVE",
        scraped.title,
        scraped.videoId,
      );
      return {
        id: temple.id,
        ...filtered,
        lastVerifiedAt: nowIso,
        source: "scrape",
      };
    }
    return {
      id: temple.id,
      status: fallbackStatus(temple),
      liveTitle: null,
      videoId: null,
      lastVerifiedAt: nowIso,
      source: "scrape",
    };
  } catch (err) {
    console.error(`Scrape failed for ${temple.id}:`, err);
    return {
      id: temple.id,
      status: fallbackStatus(temple),
      liveTitle: null,
      videoId: null,
      lastVerifiedAt: nowIso,
      source: "fallback",
    };
  }
}

function rowFromDb(row: {
  temple_id: string;
  status: LiveStatus;
  live_title: string | null;
  video_id: string | null;
  last_verified_at: string;
}): StatusRow {
  return {
    id: row.temple_id,
    status: row.status,
    liveTitle: row.live_title,
    videoId: row.video_id,
    lastVerifiedAt: row.last_verified_at,
    source: "cache",
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return json({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const youtubeApiKey = Deno.env.get("YOUTUBE_API_KEY") || undefined;

  if (!supabaseUrl || !serviceKey) {
    return json({ error: "Server misconfigured" }, 500);
  }

  const admin = createClient(supabaseUrl, serviceKey);
  const url = new URL(req.url);
  const templeId = url.searchParams.get("templeId");
  const forceRefresh = url.searchParams.get("refresh") === "1";

  const targets = templeId
    ? TEMPLES.filter((t) => t.id === templeId)
    : TEMPLES;

  if (templeId && targets.length === 0) {
    return json({ error: "Unknown templeId" }, 404);
  }

  const { data: cachedRows, error: cacheError } = await admin
    .from("live_aarti_status")
    .select("temple_id, status, live_title, video_id, last_verified_at")
    .in(
      "temple_id",
      targets.map((t) => t.id),
    );

  if (cacheError) {
    console.error("Cache read failed:", cacheError);
  }

  const cacheMap = new Map<string, CachedStatusRow>(
    ((cachedRows ?? []) as CachedStatusRow[]).map((r) => [r.temple_id, r]),
  );

  const results: StatusRow[] = [];
  const missing: TempleConfig[] = [];
  const staleBackground: TempleConfig[] = [];

  for (const temple of targets) {
    const cached = cacheMap.get(temple.id);
    const staleMs = inAartiWindow(temple) ? AARTI_WINDOW_STALE_MS : DEFAULT_STALE_MS;
    const age = cached
      ? Date.now() - new Date(cached.last_verified_at).getTime()
      : Infinity;

    if (cached && !forceRefresh) {
      // Always serve last known status immediately (stale-while-revalidate)
      results.push(rowFromDb(cached));
      if (age >= staleMs) staleBackground.push(temple);
    } else {
      missing.push(temple);
    }
  }

  const refreshTemple = async (temple: TempleConfig) => {
    const cached = cacheMap.get(temple.id);
    const verified = await verifyTemple(
      temple,
      cached?.video_id ?? null,
      youtubeApiKey,
    );
    const { error: upsertError } = await admin.from("live_aarti_status").upsert({
      temple_id: verified.id,
      status: verified.status,
      live_title: verified.liveTitle,
      video_id: verified.videoId,
      last_verified_at: verified.lastVerifiedAt,
      updated_at: new Date().toISOString(),
    });
    if (upsertError) {
      console.error(`Upsert failed for ${verified.id}:`, upsertError);
    }
    return verified;
  };

  const refreshMany = async (temples: TempleConfig[]) => {
    const CONCURRENCY = 3;
    const out: StatusRow[] = [];
    for (let i = 0; i < temples.length; i += CONCURRENCY) {
      const chunk = temples.slice(i, i + CONCURRENCY);
      const verifiedChunk = await Promise.all(chunk.map((t) => refreshTemple(t)));
      out.push(...verifiedChunk);
    }
    return out;
  };

  // Only block the HTTP response for temples with ZERO cache rows.
  if (missing.length > 0) {
    const fresh = await refreshMany(missing);
    for (const row of fresh) {
      const idx = results.findIndex((r) => r.id === row.id);
      if (idx >= 0) results[idx] = row;
      else results.push(row);
    }
  }

  // Refresh stale rows in the background so this request stays fast.
  if (staleBackground.length > 0) {
    const bg = refreshMany(staleBackground);
    const runtime = (globalThis as { EdgeRuntime?: { waitUntil?: (p: Promise<unknown>) => void } })
      .EdgeRuntime;
    if (runtime?.waitUntil) runtime.waitUntil(bg);
    else bg.catch((err) => console.error("Background refresh failed:", err));
  }

  // Single-temple response (backward compatible with current frontend)
  if (templeId) {
    const one = results.find((r) => r.id === templeId)!;
    return json(one);
  }

  // Batch response for Hostinger (one round-trip)
  const statuses: Record<string, StatusRow> = {};
  for (const r of results) statuses[r.id] = r;

  return json({
    statuses,
    refreshed: missing.map((t) => t.id),
    backgroundRefresh: staleBackground.map((t) => t.id),
    youtubeApiConfigured: Boolean(youtubeApiKey),
    serverTime: new Date().toISOString(),
  });
});
