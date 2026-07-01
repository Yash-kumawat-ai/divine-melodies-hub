import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Helper to parse ISO 8601 duration (e.g. PT1M15S, PT45S) into seconds
function parseISO8601Duration(duration: string): number {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = duration.match(regex);
  if (!matches) return 0;
  const hours = parseInt(matches[1] || "0", 10);
  const minutes = parseInt(matches[2] || "0", 10);
  const seconds = parseInt(matches[3] || "0", 10);
  return hours * 3600 + minutes * 60 + seconds;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase URL or Service Role Key environmental variable");
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const youtubeApiKey = Deno.env.get("YOUTUBE_API_KEY");
    if (!youtubeApiKey) {
      throw new Error("Missing YOUTUBE_API_KEY secret");
    }

    let action = "pull";
    let inputVal = "";
    let targetChannelUid = "";
    try {
      const body = await req.json();
      if (body?.action) action = body.action;
      if (body?.input) inputVal = body.input;
      if (body?.channel_uid) targetChannelUid = body.channel_uid;
    } catch {
      // Ignore body parsing errors
    }

    // Action: Resolve channel details from handle or ID
    if (action === "resolve") {
      if (!inputVal) {
        throw new Error("Missing 'input' parameter for channel resolution");
      }
      const cleanInput = inputVal.trim();
      let queryUrl = "";
      if (/^UC[A-Za-z0-9_-]{22}$/.test(cleanInput)) {
        queryUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${cleanInput}&key=${youtubeApiKey}`;
      } else {
        const handle = cleanInput.startsWith("@") ? cleanInput : `@${cleanInput}`;
        queryUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&forHandle=${handle}&key=${youtubeApiKey}`;
      }
      const res = await fetch(queryUrl);
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`YouTube API returned error: ${errText}`);
      }
      const data = await res.json();
      const channelItem = data.items?.[0];
      if (!channelItem) {
        throw new Error(`No YouTube channel found matching input: ${inputVal}`);
      }
      return new Response(
        JSON.stringify({
          channel_id: channelItem.id,
          channel_name: channelItem.snippet?.title || "",
          handle: channelItem.snippet?.customUrl || "",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: Pull Shorts
    let channelsQuery = supabase.from("whitelisted_channels").select("*");
    if (targetChannelUid) {
      channelsQuery = channelsQuery.eq("id", targetChannelUid);
    } else {
      channelsQuery = channelsQuery.eq("status", "active");
    }

    const { data: channels, error: channelsError } = await channelsQuery;
    if (channelsError) {
      throw new Error(`Error fetching channels: ${channelsError.message}`);
    }

    if (!channels || channels.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active channels found to pull", pulledCount: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let totalPulled = 0;
    const logs: string[] = [];

    for (const channel of channels) {
      try {
        logs.push(`Processing channel: ${channel.channel_name} (${channel.channel_id})`);

        // Fetch recent 25 videos from YouTube Channel
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=id,snippet&channelId=${channel.channel_id}&type=video&order=date&maxResults=25&key=${youtubeApiKey}`;
        const searchRes = await fetch(searchUrl);
        if (!searchRes.ok) {
          const errMsg = await searchRes.text();
          logs.push(`  Failed search.list for channel ${channel.channel_name}: ${errMsg}`);
          continue;
        }

        const searchData = await searchRes.json();
        const videoIds = searchData.items?.map((item: any) => item.id?.videoId).filter(Boolean) || [];

        if (videoIds.length === 0) {
          logs.push(`  No recent videos found for channel ${channel.channel_name}`);
          continue;
        }

        // Fetch duration details
        const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds.join(",")}&key=${youtubeApiKey}`;
        const videosRes = await fetch(videosUrl);
        if (!videosRes.ok) {
          const errMsg = await videosRes.text();
          logs.push(`  Failed videos.list for channel ${channel.channel_name}: ${errMsg}`);
          continue;
        }

        const videosData = await videosRes.json();
        const videoItems = videosData.items || [];

        let channelPulledCount = 0;

        for (const video of videoItems) {
          const durationISO = video.contentDetails?.duration || "";
          const durationSeconds = parseISO8601Duration(durationISO);

          // YouTube Shorts are <= 60 seconds
          if (durationSeconds > 0 && durationSeconds <= 60) {
            const { error: upsertError } = await supabase
              .from("shorts_queue")
              .upsert(
                {
                  video_id: video.id,
                  channel_uid: channel.id,
                  title: video.snippet?.title || "Bhakti Short",
                  description: video.snippet?.description || null,
                  thumbnail_url: video.snippet?.thumbnails?.high?.url || video.snippet?.thumbnails?.default?.url || "",
                  duration_seconds: durationSeconds,
                  published_at: video.snippet?.publishedAt || new Date().toISOString(),
                  youtube_url: `https://youtube.com/watch?v=${video.id}`,
                  embed_url: `https://www.youtube-nocookie.com/embed/${video.id}`,
                },
                { onConflict: "video_id", ignoreDuplicates: true }
              );

            if (upsertError) {
              logs.push(`  Error upserting video ${video.id}: ${upsertError.message}`);
            } else {
              channelPulledCount++;
              totalPulled++;
            }
          }
        }

        logs.push(`  Pulled ${channelPulledCount} new shorts for channel ${channel.channel_name}`);
      } catch (channelErr) {
        const msg = channelErr instanceof Error ? channelErr.message : String(channelErr);
        logs.push(`  Error processing channel ${channel.channel_name}: ${msg}`);
      }
    }

    return new Response(
      JSON.stringify({ message: "Shorts pull execution finished", totalPulled, logs }),
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
