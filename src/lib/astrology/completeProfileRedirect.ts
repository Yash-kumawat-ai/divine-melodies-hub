export const AUTH_COMPLETE_PROFILE = '/auth/complete-profile';

export function safeAppPath(value: string | null | undefined, fallback = '/') {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback;
  if (value.startsWith('/auth/')) return fallback;
  return value;
}

export function completeProfileUrl(next?: string | null) {
  const n = safeAppPath(next, '/');
  return `${AUTH_COMPLETE_PROFILE}?next=${encodeURIComponent(n)}`;
}
