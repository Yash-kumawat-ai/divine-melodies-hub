export interface KirtanChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  options?: string[];
  bhajans?: unknown[];
  appBhajans?: unknown[];
  searchQuery?: string;
  hasMoreResults?: boolean;
  summary?: unknown;
}

export interface KirtanChatSession {
  id: string;
  title: string;
  updatedAt: number;
  messages: KirtanChatMessage[];
}

const STORAGE_KEY = 'kirtan_ai_chat_sessions_v1';

export function loadChatSessions(): KirtanChatSession[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as KirtanChatSession[];
    return Array.isArray(parsed) ? parsed.sort((a, b) => b.updatedAt - a.updatedAt) : [];
  } catch {
    return [];
  }
}

export function saveChatSessions(sessions: KirtanChatSession[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, 40)));
}

export function createChatSession(): KirtanChatSession {
  const now = Date.now();
  return {
    id: `chat-${now}`,
    title: 'New chat',
    updatedAt: now,
    messages: [],
  };
}

export function deriveChatTitle(messages: KirtanChatMessage[]): string {
  const firstUser = messages.find((m) => m.role === 'user' && m.text.trim());
  if (!firstUser) return 'New chat';
  const text = firstUser.text.trim();
  return text.length > 36 ? `${text.slice(0, 35)}…` : text;
}
