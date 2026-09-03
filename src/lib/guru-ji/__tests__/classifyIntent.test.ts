import { describe, it, expect } from 'vitest';
import { classifyGuruJiIntent } from '../classifyIntent';
import { generateGuruJiResponse } from '../../astrology/guruJiEngine';

describe('Guru Ji Phase 1 Intent Classifier & Offline Engine', () => {
  it('classifies "konsa ai use krte ho app" as app_meta', () => {
    const result = classifyGuruJiIntent('konsa ai use krte ho app');
    expect(result.mainIntent).toBe('app_meta');
    expect(result.subCategory).toBe('app_meta');

    const offline = generateGuruJiResponse('konsa ai use krte ho app', null, true);
    expect(offline.domain).toBe('APP_META');
    expect(offline.mantraCard).toBeUndefined();
    expect(offline.bhajanRec).toBeUndefined();
    expect(offline.reply).toContain('गुरु जी');
    expect(offline.reply).toContain('राघवम');
  });

  it('classifies "asdfgh" as unintelligible', () => {
    const result = classifyGuruJiIntent('asdfgh');
    expect(result.mainIntent).toBe('unintelligible');
    expect(result.subCategory).toBe('unintelligible');

    const offline = generateGuruJiResponse('asdfgh', null, true);
    expect(offline.domain).toBe('UNINTELLIGIBLE');
    expect(offline.mantraCard).toBeUndefined();
    expect(offline.bhajanRec).toBeUndefined();
    expect(offline.reply).toContain('मैं आपका संदेश स्पष्ट रूप से समझ नहीं पाया');
  });

  it('classifies out of scope questions as out_of_scope', () => {
    const result = classifyGuruJiIntent('write a python script for binary search');
    expect(result.mainIntent).toBe('out_of_scope');
    expect(result.subCategory).toBe('out_of_scope');

    const offline = generateGuruJiResponse('write a python script for binary search', null, true);
    expect(offline.domain).toBe('OUT_OF_SCOPE');
    expect(offline.mantraCard).toBeUndefined();
    expect(offline.bhajanRec).toBeUndefined();
    expect(offline.reply).toContain('केवल वैदिक ज्योतिष, कुंडली विश्लेषण, धर्मशास्त्र');
  });

  it('preserves astrological intent for career queries', () => {
    const result = classifyGuruJiIntent('mere career me kya hoga');
    expect(result.mainIntent).toBe('astrological');
    expect(result.subCategory).toBe('career');
  });

  it('preserves devotional intent for mantra/chalisa queries', () => {
    const result = classifyGuruJiIntent('hanuman chalisa kab padhe');
    expect(result.mainIntent).toBe('devotional');
  });
});
