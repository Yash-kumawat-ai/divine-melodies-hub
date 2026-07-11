import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import liveAartisData from "./src/data/liveAartis.json";

const YOUTUBE_SEARCH_UPSTREAMS = [
  "https://inv.nadeko.net",
  "https://invidious.fdn.fr",
  "https://invidious.private.coffee",
];

interface ProxyYouTubeResult {
  type: "video";
  videoId: string;
  title: string;
  author: string;
  lengthSeconds: number;
  viewCountText: string;
  publishedText: string;
  videoThumbnails: Array<{
    quality: string;
    url: string;
  }>;
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/\\u0026/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractYouTubeResultsFromHtml(html: string): ProxyYouTubeResult[] {
  const results: ProxyYouTubeResult[] = [];
  const seen = new Set<string>();
  const idRegex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
  const titleRegex = /"title":\{"runs":\[\{"text":"([^"]+)"\}\]\}/g;
  const channelRegex = /"ownerText":\{"runs":\[\{"text":"([^"]+)"\}/g;

  const ids: string[] = [];
  let idMatch: RegExpExecArray | null;
  while ((idMatch = idRegex.exec(html)) !== null && ids.length < 20) {
    ids.push(idMatch[1]);
  }

  const titles: string[] = [];
  let titleMatch: RegExpExecArray | null;
  while ((titleMatch = titleRegex.exec(html)) !== null && titles.length < 60) {
    titles.push(decodeHtmlEntities(titleMatch[1]));
  }

  const channels: string[] = [];
  let channelMatch: RegExpExecArray | null;
  while ((channelMatch = channelRegex.exec(html)) !== null && channels.length < 60) {
    channels.push(decodeHtmlEntities(channelMatch[1]));
  }

  for (let i = 0; i < ids.length; i += 1) {
    const id = ids[i];
    if (!id || seen.has(id)) continue;
    seen.add(id);

    results.push({
      type: "video",
      videoId: id,
      title: titles[i] || `YouTube Video ${i + 1}`,
      author: channels[i] || "YouTube",
      lengthSeconds: 0,
      viewCountText: "",
      publishedText: "",
      videoThumbnails: [
        {
          quality: "high",
          url: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        },
      ],
    });

    if (results.length >= 12) {
      break;
    }
  }

  return results;
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          query: ["@tanstack/react-query"],
          supabase: ["@supabase/supabase-js"],
          ui: [
            "@radix-ui/react-accordion",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-aspect-ratio",
            "@radix-ui/react-avatar",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-collapsible",
            "@radix-ui/react-context-menu",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-hover-card",
            "@radix-ui/react-label",
            "@radix-ui/react-menubar",
            "@radix-ui/react-navigation-menu",
            "@radix-ui/react-popover",
            "@radix-ui/react-progress",
            "@radix-ui/react-radio-group",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-slider",
            "@radix-ui/react-slot",
            "@radix-ui/react-switch",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
            "@radix-ui/react-toggle",
            "@radix-ui/react-toggle-group",
            "@radix-ui/react-tooltip",
          ],
          motion: ["framer-motion"],
          charts: ["recharts"],
        },
      },
    },
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && {
      name: "youtube-search-dev-proxy",
      configureServer(server) {
        server.middlewares.use("/api/youtube-search", async (req, res) => {
          try {
            const incomingUrl = new URL(req.url || "", "http://localhost:8080");
            const query = (incomingUrl.searchParams.get("q") || "").trim();

            if (query.length < 2) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Query must be at least 2 characters." }));
              return;
            }

            for (const upstream of YOUTUBE_SEARCH_UPSTREAMS) {
              try {
                const upstreamUrl = `${upstream}/api/v1/search?q=${encodeURIComponent(query)}&type=video&page=1`;
                const upstreamResponse = await fetch(upstreamUrl, {
                  headers: {
                    Accept: "application/json",
                  },
                });

                if (!upstreamResponse.ok) {
                  continue;
                }

                const raw = await upstreamResponse.text();
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.setHeader("Cache-Control", "no-store");
                res.end(raw);
                return;
              } catch {
                // Try the next upstream.
              }
            }

            try {
              const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
              const ytResponse = await fetch(ytUrl, {
                headers: {
                  "User-Agent": "Mozilla/5.0",
                  Accept: "text/html",
                },
              });

              if (ytResponse.ok) {
                const html = await ytResponse.text();
                const scraped = extractYouTubeResultsFromHtml(html);
                if (scraped.length > 0) {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.setHeader("Cache-Control", "no-store");
                  res.end(JSON.stringify(scraped));
                  return;
                }
              }
            } catch {
              // Fall through to final 502 response.
            }

            res.statusCode = 502;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "YouTube search upstreams unavailable." }));
          } catch {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Unexpected proxy error." }));
          }
        });

        server.middlewares.use("/api/panchang", async (req, res) => {
          const pathname = (req.url || "").split("?")[0];
          const zoneName = pathname.replace(/^\/+/, "").split("/")[0];
          if (!zoneName) {
            res.statusCode = 404;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Zone required" }));
            return;
          }

          try {
            const { buildPanchangForZone } = await import("./src/lib/panchang/fetchZone");
            const { ZONES } = await import("./src/utils/panchangZone");
            const zone = ZONES.find((item) => item.name === zoneName);
            if (!zone) {
              res.statusCode = 404;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: `Unknown zone: ${zoneName}` }));
              return;
            }

            const data = await buildPanchangForZone(zone);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.setHeader("Cache-Control", "no-store");
            res.end(JSON.stringify(data));
          } catch (error) {
            res.statusCode = 502;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                error: error instanceof Error ? error.message : "Panchang calculation failed",
              }),
            );
          }
        });

        server.middlewares.use("/api/live-aarti/check", async (req, res) => {
          try {
            const incomingUrl = new URL(req.url || "", "http://localhost:8080");
            const templeId = incomingUrl.searchParams.get("templeId");

            if (!templeId) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Missing templeId parameter" }));
              return;
            }

            const temple = liveAartisData.temples.find(t => t.id === templeId);
            if (!temple) {
              res.statusCode = 404;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Unknown templeId" }));
              return;
            }

            const nowStr = new Date().toISOString();
            const getFallbackState = () => {
              return temple.aartiSchedule.length > 0 ? "UPCOMING" : "OFFLINE";
            };

            const targetUrl = temple.youtubeChannelId
              ? `https://www.youtube.com/channel/${temple.youtubeChannelId}/live`
              : `https://www.youtube.com/${temple.youtubeHandle}/live`;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);

            try {
              const ytResponse = await fetch(targetUrl, {
                signal: controller.signal,
                headers: {
                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                  "Accept-Language": "en-US,en;q=0.9",
                  "Cookie": "CONSENT=YES+cb.20210328-17-p0.en+FX+943"
                }
              });
              clearTimeout(timeoutId);

              if (!ytResponse.ok) {
                throw new Error(`HTTP error ${ytResponse.status}`);
              }

              const html = await ytResponse.text();
              const finalUrl = ytResponse.url;

              const isRedirectToWatch = finalUrl.includes("/watch") || finalUrl.includes("?v=");
              const isLiveInHtml = html.includes('"isLive":true') || 
                                   html.includes('"isLiveStream":true') || 
                                   html.includes('{"livePlayables":') ||
                                   html.includes('yt-playertab-active');

              if (isRedirectToWatch || isLiveInHtml) {
                let videoId: string | null = null;
                const videoIdMatch = html.match(/"videoId":"([^"]+)"/) || finalUrl.match(/[?&]v=([^&]+)/);
                if (videoIdMatch) {
                  videoId = videoIdMatch[1];
                }

                const titleMatch = html.match(/<meta name="title" content="([^"]+)"/i) || html.match(/<title>([^<]+)<\/title>/i);
                const liveTitle = titleMatch ? titleMatch[1].replace(/\s*-\s*YouTube/i, "").trim() : "";

                // check content filter if needed
                if (temple.requiresTitleFilter) {
                  const { isTitleDevotional } = await import("./src/utils/contentFilter");
                  const isDevotional = isTitleDevotional(liveTitle);
                  if (!isDevotional) {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify({
                      id: templeId,
                      status: "STREAM_UNAVAILABLE",
                      liveTitle: liveTitle || null,
                      videoId,
                      lastVerifiedAt: nowStr
                    }));
                    return;
                  }
                }

                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({
                  id: templeId,
                  status: "LIVE",
                  liveTitle: liveTitle || null,
                  videoId,
                  lastVerifiedAt: nowStr
                }));
              } else {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({
                  id: templeId,
                  status: getFallbackState(),
                  liveTitle: null,
                  videoId: null,
                  lastVerifiedAt: nowStr
                }));
              }
            } catch (err) {
              console.error(`Live status check failed for ${templeId}:`, err);
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({
                id: templeId,
                status: getFallbackState(),
                liveTitle: null,
                videoId: null,
                lastVerifiedAt: nowStr
              }));
            }
          } catch (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Unexpected check error" }));
          }
        });
      },
    },
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
