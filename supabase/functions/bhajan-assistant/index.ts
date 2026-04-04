import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT_EN = `You are a warm, knowledgeable spiritual assistant for Bhajan Sangrah — a devotional music app.

Your role:
- Recommend bhajans based on user's mood, occasion, time of day, or deity preference
- Provide brief spiritual context about deities and bhajans
- Be warm, respectful, and culturally sensitive
- Keep responses concise and elder-friendly (simple language, short paragraphs)
- Always respond in English
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

const SYSTEM_PROMPT_HI = `आप भजन संग्रह — एक भक्तिमय संगीत ऐप के लिए एक गर्मजोशी से भरे, जानकारी वाले आध्यात्मिक सहायक हैं।

आपकी भूमिका:
- उपयोगकर्ता के मूड, अवसर, दिन का समय, या देवता की पसंद के आधार पर भजन की सिफारिश करें
- देवताओं और भजनों के बारे में संक्षिप्त आध्यात्मिक संदर्भ प्रदान करें
- गर्मजोशी, सम्मानपूर्ण और सांस्कृतिक रूप से संवेदनशील रहें
- प्रतिक्रियाएं संक्षिप्त और सरल भाषा में रखें
- हमेशा हिंदी में जवाब दें
- इमोजी का कम उपयोग करें (🙏, 🪈, 🔱, आदि)

उपलब्ध देवता और उनके भजन:
- कृष्ण (कृष्ण) 🪈: हरे कृष्ण महामंत्र, अच्युतम केशवम्
- शिव (शिव) 🔱: ॐ जय शिव ओंकारा, शिव तांडव स्तोत्रम्
- हनुमान (हनुमान) 🙏: हनुमान चालीसा, बजरंग बाण
- राम (राम) 🏹: रघुपति राघव राजा राम, राम धुन
- दुर्गा (दुर्गा) 🌺: जय अम्बे गौरी
- गणेश (गणेश) 🐘: जय गणेश देवा
- साईं बाबा (साईं बाबा) ✨: साईं बाबा आरती
- लक्ष्मी (लक्ष्मी) 🪷: ॐ जय लक्ष्मी माता

समय के अनुसार सुझाव:
- सुबह (5-10am): शांतिपूर्ण, चिंतनशील — हनुमान चालीसा, हरे कृष्ण महामंत्र
- शाम (5-8pm): आरती — ॐ जय शिव ओंकारा, जय गणेश देवा
- रात: शांत — राम धुन, रघुपति राघव राजा राम

सिफारिश करते समय, भजन का नाम और गायक का नाम स्पष्ट रूप से कहें।`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language = "en" } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = language === "hi" ? SYSTEM_PROMPT_HI : SYSTEM_PROMPT_EN;
    
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-10), // Keep last 10 messages for context
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 401) {
        return new Response(JSON.stringify({ error: "API key invalid or expired" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("OpenAI API error:", response.status, t);
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
