import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Max-Age": "86400",
};

// Fallback bhajan recommendations database
const FALLBACK_BHAJANS = {
  en: [
    { name: "Hare Krishna Mahamantra", deity: "Krishna", mood: "meditative", time: "anytime" },
    { name: "Hanuman Chalisa", deity: "Hanuman", mood: "energetic", time: "morning" },
    { name: "Om Jai Shiv Omkara", deity: "Shiva", mood: "meditative", time: "evening" },
    { name: "Raghupati Raghav Raja Ram", deity: "Rama", mood: "peaceful", time: "anytime" },
    { name: "Jai Ganesh Deva", deity: "Ganesh", mood: "joyful", time: "morning" },
    { name: "Shiv Tandav Stotram", deity: "Shiva", mood: "powerful", time: "anytime" },
    { name: "Ram Dhun", deity: "Rama", mood: "calming", time: "night" },
    { name: "Jai Ambe Gauri", deity: "Durga", mood: "powerful", time: "anytime" },
    { name: "Achyutam Keshavam", deity: "Krishna", mood: "devotional", time: "anytime" },
    { name: "Sai Baba Aarti", deity: "Sai Baba", mood: "peaceful", time: "evening" },
  ],
  hi: [
    { name: "हरे कृष्ण महामंत्र", deity: "कृष्ण", mood: "meditative", time: "anytime" },
    { name: "हनुमान चालीसा", deity: "हनुमान", mood: "energetic", time: "morning" },
    { name: "ॐ जय शिव ओंकारा", deity: "शिव", mood: "meditative", time: "evening" },
    { name: "रघुपति राघव राजा राम", deity: "राम", mood: "peaceful", time: "anytime" },
    { name: "जय गणेश देवा", deity: "गणेश", mood: "joyful", time: "morning" },
    { name: "शिव तांडव स्तोत्रम्", deity: "शिव", mood: "powerful", time: "anytime" },
    { name: "राम धुन", deity: "राम", mood: "calming", time: "night" },
    { name: "जय अम्बे गौरी", deity: "दुर्गा", mood: "powerful", time: "anytime" },
    { name: "अच्युतम केशवम्", deity: "कृष्ण", mood: "devotional", time: "anytime" },
    { name: "साईं बाबा आरती", deity: "साईं बाबा", mood: "peaceful", time: "evening" },
  ]
};

const SYSTEM_PROMPT_EN = `You are a warm, knowledgeable spiritual assistant for Raghavam — a devotional music app.

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

const SYSTEM_PROMPT_HI = `आप राघवम् — एक भक्तिमय संगीत ऐप के लिए एक गर्मजोशी से भरे, जानकारी वाले आध्यात्मिक सहायक हैं।

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

// Type definitions
interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface AssistantContext {
  searchQuery?: string;
  searchResults?: Array<{
    title: string;
    source: string;
    confidence?: number;
  }>;
  recentBhajans?: Array<{
    title: string;
    deity?: string;
  }>;
  availableLyricsLocally?: boolean;
}

interface RequestBody {
  messages: Message[];
  language?: "en" | "hi";
  context?: AssistantContext;
}

// Helper: Validate request body
function validateRequest(body: unknown): {
  valid: boolean;
  error?: string;
  data?: { messages: Message[]; language: "en" | "hi"; context?: AssistantContext };
} {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be JSON object" };
  }

  const obj = body as Record<string, unknown>;

  if (!Array.isArray(obj.messages)) {
    return { valid: false, error: "Messages must be an array" };
  }

  if (obj.messages.length === 0) {
    return { valid: false, error: "Messages array cannot be empty" };
  }

  // Validate each message
  for (const msg of obj.messages) {
    if (!msg || typeof msg !== "object") {
      return { valid: false, error: "Each message must be an object" };
    }
    if (!["user", "assistant", "system"].includes((msg as any).role)) {
      return { valid: false, error: "Message role must be 'user', 'assistant', or 'system'" };
    }
    if (typeof (msg as any).content !== "string") {
      return { valid: false, error: "Message content must be a string" };
    }
  }

  const language = obj.language === "hi" ? "hi" : "en";
  const context = obj.context as AssistantContext | undefined;

  return {
    valid: true,
    data: {
      messages: obj.messages as Message[],
      language,
      context,
    },
  };
}

// Helper: Build enhanced system prompt with context
function buildSystemPrompt(language: "en" | "hi", context?: AssistantContext): string {
  const basePrompt = language === "hi" ? SYSTEM_PROMPT_HI : SYSTEM_PROMPT_EN;
  
  if (!context) {
    return basePrompt;
  }

  // Build context section
  let contextSection = "";

  if (context.searchQuery) {
    contextSection += language === "en"
      ? `\n\nUser recently searched for: "${context.searchQuery}"`
      : `\n\nउपयोगकर्ता ने हाल ही में खोज की: "${context.searchQuery}"`;
  }

  if (context.searchResults && context.searchResults.length > 0) {
    const resultsText = context.searchResults
      .map(r => `• ${r.title} (${r.source})`)
      .join("\n");
    contextSection += language === "en"
      ? `\n\nAvailable from search:\n${resultsText}`
      : `\n\nखोज से उपलब्ध:\n${resultsText}`;
  }

  if (context.recentBhajans && context.recentBhajans.length > 0) {
    const recentText = context.recentBhajans
      .map(b => `• ${b.title}${b.deity ? ` (${b.deity})` : ""}`)
      .join("\n");
    contextSection += language === "en"
      ? `\n\nRecent bhajans in user app:\n${recentText}`
      : `\n\nउपयोगकर्ता ऐप में हाल के भजन:\n${recentText}`;
  }

  // Add instruction about using available resources
  if (contextSection) {
    contextSection += language === "en"
      ? "\n\n⚡ Prefer to recommend from the above resources. When suggesting outside these, explain why."
      : "\n\n⚡ उपरोक्त संसाधनों से सिफारिश करने के लिए पसंद करें। जब इनके बाहर सुझाते हैं, तो कारण बताएं।";
  }

  return basePrompt + contextSection;
}

async function* generateFallbackResponse(
  userMessage: string,
  language: "en" | "hi"
): AsyncGenerator<string> {
  const bhajans = FALLBACK_BHAJANS[language];

  // Simple keyword matching for recommendations
  const keywords = userMessage.toLowerCase().split(" ");
  const isMorning = keywords.some(k => ["morning", "सुबह", "प्रातः"].includes(k));
  const isEvening = keywords.some(k => ["evening", "शाम", "सायं"].includes(k));
  const isNight = keywords.some(k => ["night", "रात", "राति"].includes(k));
  const isEnergetic = keywords.some(k => ["energy", "energetic", "शक्ति", "मजबूत", "दास्य"].includes(k));
  const isPeaceful = keywords.some(k => ["peace", "calm", "peaceful", "शांति", "प्रशांत"].includes(k));
  const isMeditative = keywords.some(k => ["meditate", "meditation", "ध्यान", "चिंतन"].includes(k));

  const timeFilter = isMorning ? "morning" : isEvening ? "evening" : isNight ? "night" : "anytime";
  const moodFilter = isEnergetic ? "energetic" : isPeaceful ? "peaceful" : isMeditative ? "meditative" : null;

  let recommendations = bhajans.filter(b => b.time === timeFilter || b.time === "anytime");
  if (moodFilter) {
    recommendations = recommendations.filter(b => b.mood.includes(moodFilter) || b.time === "anytime");
  }

  // Shuffle and pick top 3
  recommendations = recommendations.sort(() => Math.random() - 0.5).slice(0, 3);

  const response = language === "en"
    ? `🙏 Here are some bhajans I recommend for you:\n\n${recommendations.map(b => `• ${b.name} (${b.deity})`).join("\n")}\n\nNote: I'm running in offline mode. For more personalized recommendations, please ensure the app is fully configured.`
    : `🙏 यहाँ कुछ भजन हैं जो मैं आपके लिए सुझाता हूँ:\n\n${recommendations.map(b => `• ${b.name} (${b.deity})`).join("\n")}\n\nनोट: मैं ऑफ़लाइन मोड में चल रहा हूँ। अधिक व्यक्तिगत सुझावों के लिए, कृपया सुनिश्चित करें कि ऐप पूरी तरह कॉन्फ़िगर किया गया है।`;

  // Stream response character by character
  for (const char of response) {
    yield char;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    // --- Authentication check ---
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Authentication required. Please log in.' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const validation = validateRequest(await req.json());

    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, language } = validation.data!;
    const context = validation.data?.context;
    const systemPrompt = buildSystemPrompt(language, context);

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    // Check if API key is available
    if (!OPENAI_API_KEY) {
      // Use fallback mode - stream rule-based responses
      const encoder = new TextEncoder();
      const readableStream = new ReadableStream<Uint8Array>({
        async start(controller) {
          try {
            const userMessage = messages[messages.length - 1]?.content || "";
            
            for await (const chunk of generateFallbackResponse(userMessage, language)) {
              const sseMessage = `data: ${JSON.stringify({
                choices: [{ delta: { content: chunk } }],
              })}\n\n`;
              controller.enqueue(encoder.encode(sseMessage));
            }
            
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } catch (error) {
            console.error("Fallback generation error:", error);
            const errorMessage = `data: ${JSON.stringify({
              error: "Fallback response generation failed",
            })}\n\n`;
            controller.enqueue(encoder.encode(errorMessage));
            controller.close();
          }
        },
      });

      return new Response(readableStream, {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
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
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI assistant temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!response.body) {
      return new Response(JSON.stringify({ error: "No response body from API" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("bhajan-assistant error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
