import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface YouTubeMetadata {
  title: string;
  artist: string;
  thumbnailUrl: string;
}

// Extract video ID from various YouTube URL formats
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

// Fetch YouTube metadata using oEmbed API (doesn't require API key)
async function fetchYouTubeMetadata(videoId: string): Promise<YouTubeMetadata | null> {
  try {
    // Use YouTube's oEmbed endpoint - no authentication needed
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    
    const response = await fetch(oembedUrl);
    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // Parse the title to extract song name and artist
    // YouTube titles are usually "Song Name - Artist Name" or similar
    const fullTitle = data.title || "";
    let title = fullTitle;
    let artist = data.author_name || "";

    // Try to split by common separators: " - ", " | ", " by "
    const separators = [" - ", " | ", " by "];
    for (const separator of separators) {
      if (fullTitle.includes(separator)) {
        const parts = fullTitle.split(separator);
        if (parts.length === 2) {
          // Typically "Song - Artist"
          title = parts[0].trim();
          if (!artist) {
            artist = parts[1].trim();
          }
        }
        break;
      }
    }

    return {
      title: title,
      artist: artist || data.author_name || "",
      thumbnailUrl: data.thumbnail_url || "",
    };
  } catch (error) {
    console.error("Error fetching YouTube metadata:", error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: "YouTube URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract video ID
    const videoId = extractVideoId(url);
    if (!videoId) {
      return new Response(
        JSON.stringify({ error: "Invalid YouTube URL" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch metadata
    const metadata = await fetchYouTubeMetadata(videoId);
    if (!metadata) {
      return new Response(
        JSON.stringify({ 
          error: "Could not extract metadata from video. Please fill in details manually.",
          title: "",
          artist: ""
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(metadata),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to process request", details: error instanceof Error ? error.message : "" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
