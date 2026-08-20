import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";
import { XMLParser } from "https://esm.sh/fast-xml-parser@4.5.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ISO 8601 Duration Parser (e.g. PT1M45S -> 105 seconds)
function parseISO8601Duration(durationStr: string): number {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = durationStr.match(regex);
  if (!matches) return 0;
  const hours = parseInt(matches[1] || "0", 10);
  const minutes = parseInt(matches[2] || "0", 10);
  const seconds = parseInt(matches[3] || "0", 10);
  return (hours * 3600) + (minutes * 60) + seconds;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Cron/Admin authentication ---
    const cronSecret = Deno.env.get("CRON_SECRET");
    const authHeader = req.headers.get("Authorization");
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return new Response(
        JSON.stringify({ error: "Unauthorized. Provide valid CRON_SECRET in Authorization header." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const youtubeApiKey = Deno.env.get("YOUTUBE_API_KEY");
    if (!youtubeApiKey) {
      throw new Error("Missing YOUTUBE_API_KEY environment variable. Set it via: supabase secrets set YOUTUBE_API_KEY=<key>");
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase URL or Service Role Key environmental variable");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let action = "pull";
    let inputVal = "";
    let channelUid = "";
    try {
      const body = await req.json();
      if (body?.action) action = body.action;
      if (body?.input) inputVal = body.input;
      if (body?.channel_uid) channelUid = body.channel_uid;
    } catch {
      // Ignore body parsing errors
    }

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });

    // Action: Resolve channel details from ID
    if (action === "resolve") {
      if (!inputVal) {
        throw new Error("Missing 'input' parameter for channel resolution");
      }
      const cleanInput = inputVal.trim();
      if (!/^UC[A-Za-z0-9_-]{22}$/.test(cleanInput)) {
        throw new Error("To resolve key-free, please provide a valid YouTube Channel ID starting with 'UC' (or the full channel URL containing it).");
      }

      const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${cleanInput}`;
      const res = await fetch(feedUrl);
      if (!res.ok) {
        throw new Error(`Failed to fetch RSS feed. HTTP status: ${res.status}`);
      }

      const xmlText = await res.text();
      const jsonObj = parser.parse(xmlText);
      const channelName = jsonObj.feed?.title || "Unknown Channel";

      return new Response(
        JSON.stringify({
          channel_id: cleanInput,
          channel_name: channelName,
          handle: null,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: Pull Shorts
    let channelsQuery = supabase.from("whitelisted_channels").select("id, channel_id, channel_name");
    if (channelUid) {
      channelsQuery = channelsQuery.eq("id", channelUid);
    } else {
      channelsQuery = channelsQuery.eq("status", "active");
    }

    const { data: channels, error: channelsError } = await channelsQuery;

    if (channelsError) {
      throw new Error(`Error fetching channels: ${channelsError.message}`);
    }

    if (!channels || channels.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active channels found to pull", summary: {} }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const summary: Record<string, { found: number; filtered_duration: number; pulled: number; errors: string[] }> = {};

    for (const channel of channels) {
      summary[channel.channel_name] = { found: 0, filtered_duration: 0, pulled: 0, errors: [] };
      try {
        // Auto-fix Bhaktipath channel ID if it was stored as slug
        if (channel.channel_id === "UC_bhaktipath" || channel.channel_id === "bhaktipath") {
          channel.channel_id = "UCsjMAEPcv7-oNGHtRU9Vg6w";
          await supabase.from("whitelisted_channels").update({ channel_id: "UCsjMAEPcv7-oNGHtRU9Vg6w" }).eq("id", channel.id);
        }

        let entries: any[] = [];
        const uploadsPlaylistId = channel.channel_id.startsWith("UC") ? `UU${channel.channel_id.substring(2)}` : null;

        // 1. Try YouTube Data API v3 playlistItems for up to 50 videos
        if (youtubeApiKey && uploadsPlaylistId) {
          try {
            const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50&key=${youtubeApiKey}`;
            const ytRes = await fetch(playlistUrl);
            if (ytRes.ok) {
              const ytData = await ytRes.json();
              const items = ytData.items || [];
              entries = items.map((item: any) => ({
                "yt:videoId": item.contentDetails?.videoId || item.snippet?.resourceId?.videoId,
                title: item.snippet?.title || "Bhakti Short",
                published: item.snippet?.publishedAt,
                "media:group": { "media:description": item.snippet?.description || null }
              }));
            }
          } catch (_e) {
            // Fallback to RSS if API fails
          }
        }

        // 2. Fallback to RSS feed if playlist API returned 0 items
        if (entries.length === 0) {
          const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.channel_id}`;
          const response = await fetch(feedUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch feed for channel ${channel.channel_name}. HTTP status: ${response.status}`);
          }
          const xmlText = await response.text();
          const jsonObj = parser.parse(xmlText);
          let rssEntries = jsonObj.feed?.entry || [];
          if (!Array.isArray(rssEntries)) rssEntries = [rssEntries];
          entries = rssEntries;
        }

        summary[channel.channel_name].found = entries.length;

        if (entries.length === 0) continue;

        // Extract all video IDs in the feed
        const allFeedVideoIds: string[] = [];
        const entryMap: Record<string, any> = {};

        for (const entry of entries) {
          const videoId = entry["yt:videoId"] || entry.id?.replace("yt:video:", "") || "";
          if (!videoId) continue;
          allFeedVideoIds.push(videoId);
          entryMap[videoId] = entry;
        }

        // Query the DB to check which video_ids already exist
        const { data: existingShorts, error: existingError } = await supabase
          .from("shorts")
          .select("video_id")
          .in("video_id", allFeedVideoIds);

        if (existingError) {
          throw existingError;
        }

        const existingSet = new Set(existingShorts?.map(s => s.video_id) || []);
        
        // Refresh updated_at timestamp for existing shorts to satisfy YouTube's 30-day freshness policy
        if (existingSet.size > 0) {
          const existingArray = Array.from(existingSet);
          await supabase
            .from("shorts")
            .update({ updated_at: new Date().toISOString() })
            .in("video_id", existingArray);
        }

        const newVideoIds = allFeedVideoIds.filter(vid => !existingSet.has(vid));

        if (newVideoIds.length === 0) {
          continue; // All videos in feed already exist & updated_at timestamp has been refreshed
        }

        // Batch call YouTube Data API to fetch durations for new videos (up to 50 at a time)
        const durationsMap: Record<string, number> = {};

        if (youtubeApiKey) {
          const chunkSize = 50;
          for (let i = 0; i < newVideoIds.length; i += chunkSize) {
            const chunk = newVideoIds.slice(i, i + chunkSize);
            const idsParam = chunk.join(",");
            const ytApiUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${idsParam}&key=${youtubeApiKey}`;
            const ytRes = await fetch(ytApiUrl);
            if (ytRes.ok) {
              const ytData = await ytRes.json();
              const items = ytData.items || [];
              for (const item of items) {
                const durationStr = item.contentDetails?.duration;
                if (durationStr) {
                  durationsMap[item.id] = parseISO8601Duration(durationStr);
                }
              }
            } else {
              throw new Error(`YouTube API lookup failed. HTTP status: ${ytRes.status}`);
            }
          }
        } else {
          throw new Error("Missing YOUTUBE_API_KEY environment variable. Cannot verify durations.");
        }

        const shortsToInsert = [];
        for (const videoId of newVideoIds) {
          const entry = entryMap[videoId];
          const duration = durationsMap[videoId] ?? 999; // Default to 999 if lookup failed

          if (duration >= 120) {
            summary[channel.channel_name].filtered_duration++;
            continue; // Skip videos 2 mins or longer
          }

          shortsToInsert.push({
            video_id: videoId,
            channel_uid: channel.id,
            title: entry.title || "Bhakti Short",
            description: entry["media:group"]?.["media:description"] || null,
            thumbnail_url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            youtube_url: `https://youtube.com/watch?v=${videoId}`,
            embed_url: `https://www.youtube-nocookie.com/embed/${videoId}`,
            duration_seconds: duration,
            published_at: entry.published || new Date().toISOString(),
          });
        }

        if (shortsToInsert.length > 0) {
          const { data: insertedData, error: upsertError } = await supabase
            .from("shorts")
            .upsert(shortsToInsert, { onConflict: "video_id" })
            .select("id");

          if (upsertError) {
            throw upsertError;
          }

          summary[channel.channel_name].pulled = insertedData?.length || 0;
        }
      } catch (err) {
        let errorMsg = err instanceof Error ? err.message : String(err);
        summary[channel.channel_name].errors.push(errorMsg);
      }
    }

    return new Response(
      JSON.stringify({ message: "Shorts pull execution finished", summary }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
