/**
 * Environment configuration helper
 */
export function getPublicSiteUrl(): string {
  const envUrl = import.meta.env?.VITE_PUBLIC_SITE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return 'https://raghavam.com';
}
