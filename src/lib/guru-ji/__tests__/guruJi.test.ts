import { describe, it, expect } from 'vitest';
import { classifyGuruJiIntent } from '../classifyIntent';
import { buildGuruJiContext } from '../context/buildGuruJiContext';
import { buildGuruJiSystemPrompt } from '../systemPrompt';
import {
  calculateCompleteKundli,
  checkSadeSati,
  checkKaalSarpDosha,
  checkPitraDosha,
} from '../../astrology/kundliEngine';
import { generateGuruJiResponse } from '../../astrology/guruJiEngine';
import type { BirthProfileInput } from '../../astrology/types';

const testBirthInput: BirthProfileInput = {
  date_of_birth: '1995-06-15',
  birth_time: '14:30', // 09:00:00 UTC
  birth_time_accuracy: 'exact',
  gender: 'other',
  place_query: 'Jaipur, Rajasthan',
  place_label: 'Jaipur, Rajasthan, India',
  lat: 26.9124,
  lng: 75.7873,
  elevation: 431,
  timezone_iana: 'Asia/Kolkata',
  utc_offset_at_birth: '+05:30',
};

const kundli = calculateCompleteKundli(testBirthInput);

describe('Guru Ji Intent Classification Suite', () => {
  it('classifies devotional queries correctly', () => {
    const res1 = classifyGuruJiIntent('hanuman chalisa kab padhni chahiye');
    expect(res1.mainIntent).toBe('devotional');
    expect(res1.isThirdPartyRequest).toBe(false);

    const res2 = classifyGuruJiIntent('shiv tandav stotram ka mahatva aur labh');
    expect(res2.mainIntent).toBe('devotional');
  });

  it('classifies astrological sub-categories accurately', () => {
    const career = classifyGuruJiIntent('meri kundli ke anusar career aur naukri kaisa rahega');
    expect(career.mainIntent).toBe('astrological');
    expect(career.subCategory).toBe('career');

    const marriage = classifyGuruJiIntent('shadi kab hogi aur mangal dosha ka prabhav');
    expect(marriage.mainIntent).toBe('astrological');
    expect(marriage.subCategory).toBe('marriage');

    const ishta = classifyGuruJiIntent('mere ishta devata kaun hain');
    expect(ishta.mainIntent).toBe('astrological');
    expect(ishta.subCategory).toBe('ishta');

    const dasha = classifyGuruJiIntent('meri vartaman mahadasha ka samay kab tak hai');
    expect(dasha.mainIntent).toBe('astrological');
    expect(dasha.subCategory).toBe('dasha');

    const sadeSati = classifyGuruJiIntent('kya mujh par shani ki sade sati chal rahi hai');
    expect(sadeSati.mainIntent).toBe('astrological');
    expect(sadeSati.subCategory).toBe('sade_sati');
  });

  it('detects third-party requests and tags relation', () => {
    const son = classifyGuruJiIntent('mere bete ki kundli me naukri ke yog');
    expect(son.isThirdPartyRequest).toBe(true);
    expect(son.thirdPartyRelation).toBe('son');

    const wife = classifyGuruJiIntent('meri patni ka swasthya kaisa rahega');
    expect(wife.isThirdPartyRequest).toBe(true);
    expect(wife.thirdPartyRelation).toBe('wife');
  });

  it('detects sensitive domains and flags non-negotiable categories', () => {
    const health = classifyGuruJiIntent('mujhe bimari hai dava bataiye');
    expect(health.sensitiveDomain).toBe('health');

    const death = classifyGuruJiIntent('meri mrityu kab hogi meri aayu kitni hai');
    expect(death.sensitiveDomain).toBe('death');

    const legal = classifyGuruJiIntent('court case me jeet hogi ya nahi');
    expect(legal.sensitiveDomain).toBe('legal');

    const financial = classifyGuruJiIntent('lottery ka number bataiye satta tips');
    expect(financial.sensitiveDomain).toBe('financial');
  });
});

describe('Server-Side Context Builder & Boundary Enforcement', () => {
  it('returns empty facts and appliedRules on devotional intent (zero chart leakage)', () => {
    const classification = classifyGuruJiIntent('hanuman chalisa kab padhni chahiye');
    const context = buildGuruJiContext({ classification, kundli });
    expect(Object.keys(context.facts)).toHaveLength(0);
    expect(Object.keys(context.appliedRules)).toHaveLength(0);
  });

  it('returns third-party explain-and-stop notice on third-party requests (zero chart leakage)', () => {
    const classification = classifyGuruJiIntent('mere bete ki kundli me naukri ke yog');
    const context = buildGuruJiContext({ classification, kundli });
    expect(Object.keys(context.facts)).toHaveLength(0);
    expect(context.appliedRules.thirdPartyNotice).toBeDefined();
    expect(context.appliedRules.thirdPartyNotice).toContain('केवल आपकी अपनी सहेजी गई कुंडली');
  });

  it('returns minimal scoped slice for career without leaking irrelevant houses', () => {
    const classification = classifyGuruJiIntent('career me promotion kab hoga');
    const context = buildGuruJiContext({ classification, kundli });
    expect(context.facts.lagna).toBe('Virgo');
    expect(context.facts.lagnaLord).toBe('Mercury');
    expect(context.facts.tenthHouseLord).toBe('Mercury');
    expect(context.facts.seventhHouseLord).toBeUndefined(); // Does not leak marriage 7th house
    expect(context.facts.atmakaraka).toBeUndefined(); // Does not leak Ishta Atmakaraka
  });

  it('omits house lords when birth_time_accuracy is unknown and anchors on Moon sign', () => {
    const classification = classifyGuruJiIntent('career kaisa rahega');
    const context = buildGuruJiContext({ classification, kundli, birthAccuracy: 'unknown' });
    expect(context.facts.birthTimeKnown).toBe(false);
    expect(context.facts.lagna).toBeUndefined();
    expect(context.facts.lagnaLord).toBeUndefined();
    expect(context.facts.tenthHouseLord).toBeUndefined();
    expect(context.facts.moonSign).toBe('Capricorn');
    expect(context.appliedRules.timeAccuracyNote).toBeDefined();
  });
});

describe('System Prompt & Sensitive Domain Directives', () => {
  it('injects health disclaimer when sensitive domain is health', () => {
    const classification = classifyGuruJiIntent('sehat kharab rehti hai');
    const context = buildGuruJiContext({ classification, kundli });
    const prompt = buildGuruJiSystemPrompt({
      context,
      language: 'hi',
      sensitiveDomain: classification.sensitiveDomain,
    });
    expect(prompt).toContain('SAFETY DIRECTIVE (HEALTH)');
    expect(prompt).toContain('medical doctor');
  });

  it('injects death/longevity refusal directive when sensitive domain is death', () => {
    const classification = classifyGuruJiIntent('meri aayu aur death timing');
    const context = buildGuruJiContext({ classification, kundli });
    const prompt = buildGuruJiSystemPrompt({
      context,
      language: 'hi',
      sensitiveDomain: classification.sensitiveDomain,
    });
    expect(prompt).toContain('SAFETY DIRECTIVE (DEATH / LONGEVITY)');
    expect(prompt).toContain('REFUSE to predict lifespan');
  });
});

describe('Live Sade Sati & Classical Doshas Math', () => {
  it('evaluates Sade Sati dynamically without hardcoded dates', () => {
    const today = new Date('2026-09-01T10:00:00Z');
    const resPisces = checkSadeSati(11, today); // Pisces Moon
    expect(resPisces.isInSadeSati).toBe(true);
    expect(resPisces.phase).toBe('peak');
    expect(resPisces.saturnTransitRashi).toBe('Pisces');

    const resCapricorn = checkSadeSati(9, today); // Capricorn Moon
    expect(resCapricorn.isInSadeSati).toBe(false);
    expect(resCapricorn.phase).toBeNull();
  });

  it('evaluates Kaal Sarp and Pitra Dosha deterministically', () => {
    const kaalSarp = checkKaalSarpDosha(kundli.planets);
    expect(kaalSarp.hasDosha).toBeDefined();
    expect(typeof kaalSarp.hasDosha).toBe('boolean');

    const pitra = checkPitraDosha(kundli.planets, kundli.ascendant!);
    expect(pitra.hasDosha).toBeDefined();
    expect(typeof pitra.hasDosha).toBe('boolean');
  });
});

describe('Offline Fallback Engine Parity', () => {
  it('gives pure devotional response without chart data on devotional query', () => {
    const res = generateGuruJiResponse('hanuman chalisa kab padhni chahiye', kundli, true);
    expect(res.domain).toBe('DEVOTIONAL_HANUMAN');
    expect(res.reply).not.toContain('कन्या लग्न');
    expect(res.reply).not.toContain('राहु महादशा');
    expect(res.reply).toContain('हनुमान चालीसा');
  });

  it('gives third-party explain-and-stop notice on third-party query', () => {
    const res = generateGuruJiResponse('mere bete ki kundli', kundli, true);
    expect(res.domain).toBe('THIRD_PARTY_NOTICE');
    expect(res.reply).toContain('केवल आपकी अपनी सहेजी गई कुंडली');
    expect(res.reply).not.toContain('कन्या लग्न');
  });

  it('gives accurate career guidance with Mercury Lagna lord on astrology query', () => {
    const res = generateGuruJiResponse('career kaisa rahega', kundli, true);
    expect(res.domain).toBe('CAREER');
    expect(res.reply).toContain('बुध देव');
    expect(res.reply).not.toContain('बृहस्पति');
  });
});
