/**
 * GURU JI STREAMING CLIENT (FROZEN)
 * 
 * Manages SSE streaming communication between AskGuruJiPage.tsx and
 * the Supabase Edge Function (/functions/v1/guru-ji).
 * Seamlessly falls back to local synthesis on network failure or offline mode.
 */

import { supabase } from '../../integrations/supabase/client';
import { generateGuruJiResponse } from './guruJiEngine';
import type { CompleteKundliData } from './types';

export interface StreamGuruJiChatOptions {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  kundli: CompleteKundliData | null;
  language: 'hi' | 'en';
  onDelta: (delta: string) => void;
  onDone: (meta: { mode: 'llm' | 'offline' | 'error' | 'service_unavailable'; action?: string; fullText: string }) => void;
  onError: (err: string) => void;
}

export async function streamGuruJiChat({
  messages,
  kundli,
  language,
  onDelta,
  onDone,
  onError,
}: StreamGuruJiChatOptions): Promise<void> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const endpoint = `${supabaseUrl}/functions/v1/guru-ji`;

  const latestUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content || '';

  try {
    // Get user session token if logged in
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || anonKey;

    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        apikey: anonKey,
      },
      body: JSON.stringify({
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        language,
      }),
    });

    if (!resp.ok) {
      throw new Error(`Edge function returned status ${resp.status}`);
    }

    if (!resp.body) {
      throw new Error('No streaming response body');
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let accumulatedText = '';
    let streamMode: 'llm' | 'offline' | 'error' | 'service_unavailable' = 'llm';
    let streamAction: string | undefined = undefined;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const dataStr = trimmed.slice(6).trim();
          if (dataStr === '[DONE]') {
            onDone({ mode: streamMode, action: streamAction, fullText: accumulatedText });
            return;
          }

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.delta) {
              accumulatedText += parsed.delta;
              onDelta(parsed.delta);
            }
            if (parsed.mode) {
              streamMode = parsed.mode;
            }
            if (parsed.action) {
              streamAction = parsed.action;
            }
          } catch {
            // Ignore partial JSON chunks
          }
        }
      }

      onDone({ mode: streamMode, action: streamAction, fullText: accumulatedText });
    } finally {
      reader.releaseLock();
    }
  } catch (err: any) {
    console.warn('Guru Ji Edge streaming unavailable; invoking local synthesis engine:', err);

    // Offline Parity Fallback
    const offlineRes = generateGuruJiResponse(latestUserMsg, kundli, language === 'hi');
    const fullText = offlineRes.reply;
    
    // Smooth chunk delivery
    let idx = 0;
    const chunkSize = 8;
    const interval = setInterval(() => {
      if (idx < fullText.length) {
        const chunk = fullText.slice(idx, idx + chunkSize);
        onDelta(chunk);
        idx += chunkSize;
      } else {
        clearInterval(interval);
        onDone({ mode: 'offline', fullText });
      }
    }, 25);
  }
}
