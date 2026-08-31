import type { GuruJiMessageItem } from '@/components/guruJi/GuruJiMessageCard';

export interface GuruJiChatSession {
  id: string;
  title: string;
  updatedAt: number;
  messages: GuruJiMessageItem[];
}

const STORAGE_KEY = 'raghavam_guruji_sessions_v2';
const LEGACY_STORAGE_KEY = 'raghavam_guruji_chat_v1';

export function loadGuruJiChatSessions(): GuruJiChatSession[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as GuruJiChatSession[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => b.updatedAt - a.updatedAt);
      }
    }

    // Migrate legacy single session if present
    const legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      const legacyMsgs = JSON.parse(legacyRaw) as GuruJiMessageItem[];
      if (Array.isArray(legacyMsgs) && legacyMsgs.length > 0) {
        const now = Date.now();
        const initialSession: GuruJiChatSession = {
          id: `session-${now}`,
          title: deriveGuruJiChatTitle(legacyMsgs),
          updatedAt: now,
          messages: legacyMsgs,
        };
        saveGuruJiChatSessions([initialSession]);
        window.localStorage.removeItem(LEGACY_STORAGE_KEY);
        return [initialSession];
      }
    }

    return [];
  } catch {
    return [];
  }
}

export function saveGuruJiChatSessions(sessions: GuruJiChatSession[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, 40)));
  } catch (err) {
    console.error('Error saving Guru Ji chat sessions:', err);
  }
}

export function createGuruJiChatSession(): GuruJiChatSession {
  const now = Date.now();
  return {
    id: `session-${now}-${Math.random().toString(16).slice(2, 8)}`,
    title: 'New consultation',
    updatedAt: now,
    messages: [],
  };
}

export function deriveGuruJiChatTitle(messages: GuruJiMessageItem[]): string {
  const firstUser = messages.find((m) => m.role === 'user' && m.content.trim());
  if (!firstUser) return 'New consultation';
  const text = firstUser.content.trim();
  return text.length > 38 ? `${text.slice(0, 37)}…` : text;
}

export function deleteGuruJiChatSession(id: string, currentSessions: GuruJiChatSession[]): GuruJiChatSession[] {
  const updated = currentSessions.filter((s) => s.id !== id);
  saveGuruJiChatSessions(updated);
  return updated;
}
