/**
 * ASK GITA STREAMING CLIENT & AI ENGINE
 * 
 * Manages SSE streaming communication between GitaChatView and
 * the Supabase Edge Function (/functions/v1/ask-gita).
 * Seamlessly falls back to local offline wisdom repository on network/API failure.
 */

import { supabase } from '@/lib/supabaseClient';
import {
  generateKrishnaResponse as generateKrishnaResponseLocal,
  type GitaChatMessage,
  type EmbeddedShloka,
  type PracticalStep
} from './gitaChatEngine';
import { parseTranslationRange } from '@/components/geeta/CategoryVerseCard';

export interface StreamAskGitaChatOptions {
  userQuery: string;
  userName?: string;
  messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
  preferredLanguage?: 'hi' | 'en';
  onDelta: (delta: string) => void;
  onShloka?: (shloka: EmbeddedShloka) => void;
  onDone: (message: GitaChatMessage) => void;
  onError?: (err: string) => void;
}

export interface ParsedCounselingMessage {
  explanationText: string;
  practicalSteps: PracticalStep[];
  closingText: string;
}

function cleanMarkdown(str: string): string {
  return (str || '').replace(/^[*_#\s]+|[*_#\s]+$/g, '').trim();
}

/**
 * Cleanly separates AI counseling text into:
 * 1. Scripture Explanation / Counseling
 * 2. Practical Guidance (3 Daily Practice steps)
 * 3. Closing Blessing
 */
export function splitCounselingContent(fullText: string): ParsedCounselingMessage {
  if (!fullText) return { explanationText: '', practicalSteps: [], closingText: '' };

  const headerRegex = /(?:\n|^)(?:[*_#\s]*)(?:दैनिक अभ्यास|Daily Practice|3 Practical Actionable Steps|Practical Steps)[^\n]*\n+/i;
  const match = fullText.match(headerRegex);

  if (!match || match.index === undefined) {
    return { explanationText: fullText, practicalSteps: [], closingText: '' };
  }

  const explanationText = fullText.slice(0, match.index).trim();
  const rest = fullText.slice(match.index + match[0].length);

  const lines = rest.split('\n');
  const steps: PracticalStep[] = [];
  const closingLines: string[] = [];
  let finishedSteps = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Matches bullet/numbered formats:
    // "1. **Title:** Action", "1. **Title**: Action", "1. Title: Action", "- **Title**: Action"
    const stepMatch = trimmed.match(/^(?:\d+\.|\*|-)\s*(?:(?:\*\*(.*?)\*\*|\*(.*?)\*|(.*?))[:—–-]\s*(.*)|(?:\*\*(.*?)\*\*|(.*?))\s*[:—–-]\s*(.*))$/);
    if (!finishedSteps && stepMatch) {
      const rawTitle = stepMatch[1] || stepMatch[2] || stepMatch[3] || stepMatch[5] || stepMatch[6] || '';
      const rawAction = stepMatch[4] || stepMatch[7] || '';
      const title = cleanMarkdown(rawTitle);
      const action = cleanMarkdown(rawAction);
      if (title && action) {
        steps.push({ title, action });
        if (steps.length === 3) finishedSteps = true;
        continue;
      }
    }

    if (finishedSteps || (!stepMatch && steps.length > 0)) {
      finishedSteps = true;
      closingLines.push(trimmed);
    }
  }

  return {
    explanationText,
    practicalSteps: steps,
    closingText: cleanMarkdown(closingLines.join('\n\n'))
  };
}

/**
 * Parses markdown bullets / numbered steps from AI output into structured practical steps.
 */
export function parsePracticalStepsFromText(text: string, isHi: boolean = true): PracticalStep[] {
  const parsed = splitCounselingContent(text);
  if (parsed.practicalSteps.length > 0) return parsed.practicalSteps;

  // Fallback steps ONLY when text is empty / unparsable
  return isHi ? [
    { title: 'वर्तमान पर ध्यान दें', action: 'भविष्य की व्यर्थ चिंता त्यागकर आज के कर्तव्य में निष्काम भाव से लीन हो जाएं।' },
    { title: 'मौन और श्वास', action: 'प्रतिदिन 5-10 मिनट शांत बैठकर अपनी श्वास और ॐ के पावन नाद पर ध्यान केंद्रित करें।' },
    { title: 'समर्पण भाव', action: 'कर्म पूरी ईमानदारी से करें और परिणाम का अनावश्यक भार सर्वव्यापी प्रभु पर छोड़ दें।' }
  ] : [
    { title: 'Anchor in the Present', action: 'Focus wholeheartedly on the duty right before you today without anxious anticipation.' },
    { title: 'Pause in Sacred Silence', action: 'Spend 5-10 minutes daily in calm contemplative stillness and conscious breathing.' },
    { title: 'Release Outcomes', action: 'Offer your best sincere effort while surrendering anxious micromanagement to the cosmos.' }
  ];
}

/**
 * Stream conversational Gita guidance from the Ask-Gita Edge Function.
 */
export async function streamAskGitaChat({
  userQuery,
  userName,
  messages = [],
  preferredLanguage = 'hi',
  onDelta,
  onShloka,
  onDone,
  onError,
}: StreamAskGitaChatOptions): Promise<void> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
  const endpoint = `${supabaseUrl}/functions/v1/ask-gita`;

  const isHi = preferredLanguage === 'hi';
  const cleanName = (userName || '').trim() || (isHi ? 'प्रिय मित्र' : 'Dear Friend');
  const greeting = isHi ? `प्रिय ${cleanName},` : `Dear ${cleanName},`;

  try {
    // 1. Session Token & Client Session Identifier
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || anonKey;

    let sessionId = localStorage.getItem('raghavam_gita_session_id');
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem('raghavam_gita_session_id', sessionId);
    }

    // 2. Prepare History Payload
    const historyPayload = messages.slice(-5).map(m => ({ role: m.role, content: m.content }));
    historyPayload.push({ role: 'user', content: userQuery });

    // 3. Initiate Streaming Fetch
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        apikey: anonKey || '',
        'x-session-id': sessionId,
        'x-preferred-language': preferredLanguage,
        'x-dev-mode': import.meta.env.DEV ? 'true' : 'false',
      },
      body: JSON.stringify({
        messages: historyPayload,
        language: preferredLanguage,
        userName: cleanName,
      }),
    });

    if (!resp.ok) {
      throw new Error(`Ask-Gita Edge Function HTTP ${resp.status}`);
    }

    if (!resp.body) {
      throw new Error('Streaming response body missing');
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let accumulatedContent = '';
    let dbShloka: EmbeddedShloka | undefined = undefined;

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
            break;
          }

          try {
            const parsed = JSON.parse(dataStr);

            // Stream delta chunk
            if (parsed.delta) {
              accumulatedContent += parsed.delta;
              onDelta(parsed.delta);
            }

            // Attached verified database shloka
            if (parsed.shloka) {
              const rawShloka = parsed.shloka;
              dbShloka = {
                chapter: rawShloka.chapter,
                verse: rawShloka.verse,
                sanskrit: rawShloka.sanskrit,
                transliteration: rawShloka.transliteration,
                translation: rawShloka.translation,
                translatorName: rawShloka.translatorName,
                parsedRange: parseTranslationRange(rawShloka.translation),
              };
              if (onShloka) onShloka(dbShloka);
            }

            // Development-only telemetry logging (never exposed in UI or production)
            if (parsed.mode === 'dev_telemetry' && import.meta.env.DEV) {
              console.log(
                `Query:\n"${parsed.query}"\n\n` +
                `Input tokens: ${parsed.inputTokens}\n` +
                `Output tokens: ${parsed.outputTokens}\n` +
                `Reasoning tokens: ${parsed.reasoningTokens}\n` +
                `Total tokens: ${parsed.totalTokens}\n` +
                `Cost: ${parsed.cost}\n` +
                `Model: ${parsed.model}`
              );
            }
          } catch {
            // Partial JSON ignored
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    // 4. Construct Final Message
    const parsedCounsel = splitCounselingContent(accumulatedContent);
    const structuredSteps = parsedCounsel.practicalSteps;
    const practicalSteps = structuredSteps.map(s => `${s.title}: ${s.action}`);

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const followUps = isHi ? [
      'इस श्लोक का दैनिक जीवन में अभ्यास कैसे करें?',
      'कर्मफल में आसक्ति त्यागने का सही उपाय क्या है?',
      'मन को शांत और स्थिर रखने की साधना क्या है?'
    ] : [
      'How to practice this verse in daily work?',
      'How to release attachment to outcomes?',
      'What is the best meditation for mental calm?'
    ];

    const completedMessage: GitaChatMessage = {
      id: `krishna-ai-${Date.now()}`,
      role: 'assistant',
      greeting,
      content: accumulatedContent,
      shloka: dbShloka,
      coreTeaching: dbShloka?.translation,
      structuredSteps,
      practicalSteps,
      followUps,
      timestamp: timeStr,
    };

    onDone(completedMessage);

  } catch (err: any) {
    console.warn('[Ask-Gita Client] Edge Function streaming failed, falling back to local wisdom engine:', err);
    if (onError) onError(err?.message || 'Streaming failed');

    // Offline / Network Fallback to Local Repository
    const fallbackMsg = await generateKrishnaResponseLocal(userQuery, userName, preferredLanguage);

    // Stream out fallback smoothly
    onDelta(fallbackMsg.content);
    if (fallbackMsg.shloka && onShloka) onShloka(fallbackMsg.shloka);
    onDone(fallbackMsg);
  }
}
