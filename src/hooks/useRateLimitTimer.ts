import { useState, useEffect } from 'react';

const SIGNUP_COOLDOWN_KEY = 'signupCooldownUntil';

export function useRateLimitTimer() {
  const [retryAfter, setRetryAfter] = useState<number | null>(() => {
    if (typeof window === 'undefined') return null;
    const storedValue = window.localStorage.getItem(SIGNUP_COOLDOWN_KEY);
    if (!storedValue) return null;
    const parsed = Number(storedValue);
    if (!Number.isNaN(parsed) && parsed > Date.now()) {
      return parsed;
    }
    window.localStorage.removeItem(SIGNUP_COOLDOWN_KEY);
    return null;
  });

  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  useEffect(() => {
    if (!retryAfter) {
      setSecondsRemaining(0);
      return;
    }

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((retryAfter - Date.now()) / 1000));
      setSecondsRemaining(remaining);

      if (remaining <= 0) {
        setRetryAfter(null);
        window.localStorage.removeItem(SIGNUP_COOLDOWN_KEY);
      }
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [retryAfter]);

  const setRateLimit = (seconds: number) => {
    const cooldownMs = (seconds || 60) * 1000;
    const cooldownUntil = Date.now() + cooldownMs;
    setRetryAfter(cooldownUntil);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SIGNUP_COOLDOWN_KEY, String(cooldownUntil));
    }
  };

  const isRateLimited = retryAfter !== null && Date.now() < retryAfter;

  return {
    isRateLimited,
    secondsRemaining,
    setRateLimit,
  };
}
