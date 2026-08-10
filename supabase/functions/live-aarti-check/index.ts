// Supabase Edge Function: live-aarti-check
// Checks if a temple's YouTube channel is currently live-streaming.
// Called by the frontend instead of the Vite dev-only /api/live-aarti/check middleware.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─────────────────────────────────────────────
// Minimal temple data embedded here so the edge
// function does NOT need to import from /src.
// Keep this in sync with liveAartis.json.
// ─────────────────────────────────────────────
const TEMPLES: Record<string, {
  youtubeChannelId?: string;
  youtubeHandle?: string;
  requiresTitleFilter: boolean;
  hasSchedule: boolean;
}> = {
  "somnath-temple":        { youtubeChannelId: "UCc7fKWc8ZKzAMwxmz1OBjXg", requiresTitleFilter: false, hasSchedule: true },
  "kashi-vishwanath":      { youtubeChannelId: "UCT5VGQCG4hgBqFfZmNmKFrg", requiresTitleFilter: false, hasSchedule: true },
  "mayapur-tv":            { youtubeChannelId: "UCVnkFpC8PLubkHJTKFpf0lA", requiresTitleFilter: false, hasSchedule: true },
  "salasar-balaji":        { youtubeChannelId: "UCl33-N5BVx5MRNqXCuaW4Tg", requiresTitleFilter: false, hasSchedule: true },
  "salangpur-hanumanji":   { youtubeChannelId: "UCfr1S4kRNVflB2-lYCpBpbQ", requiresTitleFilter: false, hasSchedule: true },
  "shyam-bhakti-rang":     { youtubeChannelId: "UCPDis9pjXuqyIlchiurwOUQ", requiresTitleFilter: true,  hasSchedule: true },
  "dd-astro":              { youtubeChannelId: "UCnsdyts5oBDPLTpJRJqQPuQ", requiresTitleFilter: true,  hasSchedule: true },
  "doordarshan-national":  { youtubeChannelId: "UCF57Jz_5gcmD6WMxZMt5oOA", requiresTitleFilter: true,  hasSchedule: false },
  "radha-vallabh-vrindavan": { youtubeHandle: "@radhavallabhtemplelive", requiresTitleFilter: false, hasSchedule: true },
};

// Devotional title filter – mirrors src/utils/contentFilter.ts
const ALLOWED_KEYWORDS = [
  "aarti", "arti", "darshan", "bhajan", "kirtan", "pooja", "puja",
  "mantra", "temple", "live", "prayer", "devotional", "bhakti",
  "श्री", "आरती", "दर्शन", "भजन", "पूजा", "मंदिर",
  "jyotirlinga", "mahadev", "shiva", "krishna", "vishnu", "ram",
  "hanuman", "durga", "lakshmi", "ganesh", "saraswati",
  "हनुमान", "राम", "कृष्ण", "शिव",
];

const BLOCKED_KEYWORDS = [
  "news", "debate", "politics", "entertainment", "movie", "cricket",
  "match", "game", "show", "serial", "comedy", "music video",
];

function isTitleDevotional(title: string): boolean {
  const lower = title.toLowerCase();
  if (BLOCKED_KEYWORDS.some((kw) => lower.includes(kw))) return false;
  return ALLOWED_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}

// Simple in-process cache (persists across warm invocations)
const cache: Record<string, { result: unknown; expiresAt: number }> = {};
const CACHE_TTL_MS = 45_000; // 45 seconds

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const url = new URL(req.url);
  const templeId = url.searchParams.get("templeId");

  if (!templeId) {
    return new Response(JSON.stringify({ error: "Missing templeId parameter" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const temple = TEMPLES[templeId];
  if (!temple) {
    return new Response(JSON.stringify({ error: "Unknown templeId" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const nowStr = new Date().toISOString();

  // Serve from cache if still fresh
  const cached = cache[templeId];
  if (cached && Date.now() < cached.expiresAt) {
    return new Response(JSON.stringify(cached.result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "HIT" },
    });
  }

  const getFallback = () => ({
    id: templeId,
    status: temple.hasSchedule ? "UPCOMING" : "OFFLINE",
    liveTitle: null,
    videoId: null,
    lastVerifiedAt: nowStr,
  });

  const targetUrl = temple.youtubeChannelId
    ? `https://www.youtube.com/channel/${temple.youtubeChannelId}/live`
    : `https://www.youtube.com/${temple.youtubeHandle}/live`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const ytRes = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Cookie": "CONSENT=YES+cb.20210328-17-p0.en+FX+943",
      },
    });
    clearTimeout(timeout);

    if (!ytRes.ok) throw new Error(`YouTube returned HTTP ${ytRes.status}`);

    const html = await ytRes.text();
    const finalUrl = ytRes.url;

    const isRedirectToWatch = finalUrl.includes("/watch") || finalUrl.includes("?v=");
    const isLiveInHtml =
      html.includes('"isLive":true') ||
      html.includes('"isLiveStream":true') ||
      html.includes('{"livePlayables":') ||
      html.includes("yt-playertab-active");

    if (isRedirectToWatch || isLiveInHtml) {
      let videoId: string | null = null;
      const vidMatch = html.match(/"videoId":"([^"]+)"/) || finalUrl.match(/[?&]v=([^&]+)/);
      if (vidMatch) videoId = vidMatch[1];

      const titleMatch =
        html.match(/<meta name="title" content="([^"]+)"/i) ||
        html.match(/<title>([^<]+)<\/title>/i);
      const liveTitle = titleMatch
        ? titleMatch[1].replace(/\s*-\s*YouTube/i, "").trim()
        : "";

      if (temple.requiresTitleFilter && !isTitleDevotional(liveTitle)) {
        const result = {
          id: templeId,
          status: "STREAM_UNAVAILABLE",
          liveTitle: liveTitle || null,
          videoId,
          lastVerifiedAt: nowStr,
        };
        cache[templeId] = { result, expiresAt: Date.now() + CACHE_TTL_MS };
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const result = {
        id: templeId,
        status: "LIVE",
        liveTitle: liveTitle || null,
        videoId,
        lastVerifiedAt: nowStr,
      };
      cache[templeId] = { result, expiresAt: Date.now() + CACHE_TTL_MS };
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Not live
    const result = getFallback();
    cache[templeId] = { result, expiresAt: Date.now() + CACHE_TTL_MS };
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(`[live-aarti-check] Failed for ${templeId}:`, err);
    const result = getFallback();
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
