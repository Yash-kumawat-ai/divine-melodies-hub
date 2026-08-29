/**
 * Canonical Birth Profile Fingerprinting Utility
 * Computes a deterministic SHA-256 hex string from normalized birth inputs.
 */

export interface BirthFingerprintParams {
  dateOfBirth: string; // YYYY-MM-DD
  birthTime: string | null; // HH:mm or HH:mm:ss or null
  lat: number;
  lng: number;
  timezoneIana: string;
  ayanamsa?: string;
}

export function buildCanonicalBirthString(params: BirthFingerprintParams): string {
  const ayanamsa = (params.ayanamsa ?? 'lahiri').trim().toLowerCase();
  const timeStr = params.birthTime && params.birthTime.trim() ? params.birthTime.trim() : 'unknown';
  
  return [
    params.dateOfBirth.trim(),
    timeStr,
    Number(params.lat).toFixed(4),
    Number(params.lng).toFixed(4),
    params.timezoneIana.trim().toLowerCase(),
    ayanamsa,
  ].join('|');
}

export async function computeCanonicalBirthFingerprint(params: BirthFingerprintParams): Promise<string> {
  const canonical = buildCanonicalBirthString(params);
  const encoder = new TextEncoder();
  const data = encoder.encode(canonical);

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Node fallback if running outside browser/Deno
  try {
    const nodeCrypto = await import('crypto');
    return nodeCrypto.createHash('sha256').update(canonical).digest('hex');
  } catch {
    throw new Error('Web Crypto API not available for SHA-256 fingerprint generation');
  }
}
