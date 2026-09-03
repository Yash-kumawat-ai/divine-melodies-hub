/**
 * GURU JI LLM PROVIDER ADAPTER (FROZEN)
 * 
 * Defines the LLMProvider interface and implements the OpenAI SSE streaming adapter.
 * The edge function calls getActiveProvider().call() — zero direct coupling to OpenAI in index.ts.
 */

export interface LLMCallParams {
  systemPrompt: string;
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  model?: string;
  apiKey?: string;
  onDelta: (token: string) => void;
}

export interface LLMProvider {
  name: string;
  call: (params: LLMCallParams) => Promise<void>;
}

export const openaiProvider: LLMProvider = {
  name: 'openai',
  call: async ({ systemPrompt, messages, model, apiKey, onDelta }) => {
    // In Deno / Edge function or Node runtime:
    const key = apiKey || (typeof Deno !== 'undefined'
      ? Deno.env.get("GURU_JI_LLM_API_KEY") || Deno.env.get("OPENAI_API_KEY")
      : (typeof process !== 'undefined' ? process.env.OPENAI_API_KEY : ''));

    if (!key) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const chosenModel = model || (typeof Deno !== 'undefined' ? Deno.env.get("GURU_JI_MODEL") : null) || 'gpt-4o-mini';

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: chosenModel,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI API error ${res.status}: ${errText}`);
    }

    if (!res.body) {
      throw new Error("No response body received from OpenAI");
    }

    // Parse SSE stream with multi-byte Devanagari UTF-8 support
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          const dataStr = trimmed.slice(6).trim();
          if (dataStr === "[DONE]") return;

          try {
            const parsed = JSON.parse(dataStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              onDelta(delta);
            }
          } catch {
            // Ignore partial JSON chunks
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },
};

export const PROVIDERS: Record<string, LLMProvider> = {
  openai: openaiProvider,
};

export function getActiveProvider(): LLMProvider {
  const providerName = (typeof Deno !== 'undefined' ? Deno.env.get("GURU_JI_LLM_PROVIDER") : null) || 'openai';
  return PROVIDERS[providerName] || openaiProvider;
}
