import { describe, it, expect, vi } from 'vitest';
import { streamAskGitaChat } from '../askGitaChat';

// Mock supabaseClient
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
    },
  },
}));

describe('askGitaChat Streaming Client', () => {
  it('falls back to local engine smoothly on network error', async () => {
    // Mock global fetch to simulate network error
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));

    let accumulatedDelta = '';
    let completedMessage: any = null;

    await streamAskGitaChat({
      userQuery: 'mujhe bahut gussa aa raha hai',
      userName: 'Yash',
      preferredLanguage: 'hi',
      onDelta: (delta) => {
        accumulatedDelta += delta;
      },
      onDone: (msg) => {
        completedMessage = msg;
      },
    });

    // Should have called fallback and produced valid message
    expect(completedMessage).not.toBeNull();
    expect(completedMessage.role).toBe('assistant');
    expect(completedMessage.shloka).toBeDefined();
    expect(completedMessage.shloka.chapter).toBe(2);
    expect(completedMessage.shloka.verse).toBe(62);
    expect(accumulatedDelta.length).toBeGreaterThan(0);

    // Restore fetch
    global.fetch = originalFetch;
  });

  it('handles English query fallback gracefully', async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));

    let completedMessage: any = null;

    await streamAskGitaChat({
      userQuery: 'I feel very lonely and sad',
      userName: 'Friend',
      preferredLanguage: 'en',
      onDelta: () => {},
      onDone: (msg) => {
        completedMessage = msg;
      },
    });

    expect(completedMessage).not.toBeNull();
    expect(completedMessage.role).toBe('assistant');
    expect(completedMessage.shloka).toBeDefined();

    global.fetch = originalFetch;
  });
});
