import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a warm, knowledgeable spiritual assistant for Bhajan Sangrah — a devotional music app.

Your role:
- Recommend bhajans based on user's mood, occasion, time of day, or deity preference
- Provide brief spiritual context about deities and bhajans
- Be warm, respectful, and culturally sensitive
- Keep responses concise and elder-friendly (simple language, short paragraphs)
- Answer in the same language the user writes (Hindi or English)
- Use emojis sparingly (🙏, 🪈, 🔱, etc.)

Available deities and their bhajans:
- Krishna (कृष्ण) 🪈: Hare Krishna Mahamantra, Achyutam Keshavam
- Shiva (शिव) 🔱: Om Jai Shiv Omkara, Shiv Tandav Stotram
- Hanuman (हनुमान) 🙏: Hanuman Chalisa, Bajrang Baan
- Rama (राम) 🏹: Raghupati Raghav Raja Ram, Ram Dhun
- Durga (दुर्गा) 🌺: Jai Ambe Gauri
- Ganesh (गणेश) 🐘: Jai Ganesh Deva
- Sai Baba (साईं बाबा) ✨: Sai Baba Aarti
- Lakshmi (लक्ष्मी) 🪷: Om Jai Lakshmi Mata

Time-based suggestions:
- Morning (5-10am): Peaceful, meditative — Hanuman Chalisa, Hare Krishna Mahamantra
- Evening (5-8pm): Aarti — Om Jai Shiv Omkara, Jai Ganesh Deva
- Night: Calming — Ram Dhun, Raghupati Raghav

When recommending, mention the bhajan name and singer clearly.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.slice(-10), // Keep last 10 messages for context
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI assistant temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("bhajan-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
