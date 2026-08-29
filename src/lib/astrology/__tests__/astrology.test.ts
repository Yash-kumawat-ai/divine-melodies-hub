import { describe, it, expect } from 'vitest';
import { buildCanonicalBirthString, computeCanonicalBirthFingerprint } from '../fingerprint';

describe('Astrology Engine — Fingerprinting & Canonical Normalization', () => {
  it('should build deterministic canonical strings for exact birth time', () => {
    const canonical = buildCanonicalBirthString({
      dateOfBirth: '1995-10-15',
      birthTime: '14:30',
      lat: 26.912411,
      lng: 75.787322,
      timezoneIana: 'Asia/Kolkata',
      ayanamsa: 'Lahiri',
    });

    expect(canonical).toBe('1995-10-15|14:30|26.9124|75.7873|asia/kolkata|lahiri');
  });

  it('should build deterministic canonical strings with "unknown" when birth time is null or empty', () => {
    const canonical = buildCanonicalBirthString({
      dateOfBirth: '1995-10-15',
      birthTime: null,
      lat: 26.9124,
      lng: 75.7873,
      timezoneIana: 'Asia/Kolkata',
    });

    expect(canonical).toBe('1995-10-15|unknown|26.9124|75.7873|asia/kolkata|lahiri');
  });

  it('should compute identical SHA-256 hex hashes for equivalent inputs', async () => {
    const hash1 = await computeCanonicalBirthFingerprint({
      dateOfBirth: '1995-10-15',
      birthTime: '14:30',
      lat: 26.9124,
      lng: 75.7873,
      timezoneIana: 'Asia/Kolkata',
    });

    const hash2 = await computeCanonicalBirthFingerprint({
      dateOfBirth: ' 1995-10-15 ',
      birthTime: '14:30',
      lat: 26.91240,
      lng: 75.78730,
      timezoneIana: 'ASIA/KOLKATA',
      ayanamsa: 'LAHIRI',
    });

    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[a-f0-9]{64}$/);
  });

  it('should produce distinct hashes when date or time changes', async () => {
    const hashA = await computeCanonicalBirthFingerprint({
      dateOfBirth: '1995-10-15',
      birthTime: '14:30',
      lat: 26.9124,
      lng: 75.7873,
      timezoneIana: 'Asia/Kolkata',
    });

    const hashB = await computeCanonicalBirthFingerprint({
      dateOfBirth: '1995-10-15',
      birthTime: null, // Unknown time
      lat: 26.9124,
      lng: 75.7873,
      timezoneIana: 'Asia/Kolkata',
    });

    expect(hashA).not.toBe(hashB);
  });
});
