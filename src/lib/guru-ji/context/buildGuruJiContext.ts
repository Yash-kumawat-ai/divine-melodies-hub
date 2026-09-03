/**
 * GURU JI CONTEXT BUILDER (FROZEN)
 * 
 * Enforces the Server-Trust Boundary:
 * Pre-filters astrological chart data into a strictly typed, sub-category-scoped
 * { facts, appliedRules } payload before sending to the LLM.
 * Devotional queries receive ZERO chart facts.
 * Third-party queries receive the explain-and-stop notice with ZERO chart facts.
 */

import type {
  GuruJiClassification,
  GuruJiContextPayload,
  GuruJiFacts,
  GuruJiAppliedRules,
} from '../types';
import type { CompleteKundliData } from '../../astrology/types';

interface BuildContextOptions {
  classification: GuruJiClassification;
  kundli?: CompleteKundliData | null;
  birthAccuracy?: 'exact' | 'approximate' | 'unknown';
}

export function buildGuruJiContext({
  classification,
  kundli,
  birthAccuracy = 'exact',
}: BuildContextOptions): GuruJiContextPayload {
  const { mainIntent, subCategory, isThirdPartyRequest } = classification;

  // 1. Devotional / Bhakti / Panchang Queries -> Strictly ZERO chart facts
  if (mainIntent === 'devotional' || mainIntent === 'panchang') {
    return {
      facts: {},
      appliedRules: {},
    };
  }

  // 2. Third-Party Requests -> Explain-and-stop notice with ZERO chart facts
  if (isThirdPartyRequest) {
    return {
      facts: {},
      appliedRules: {
        thirdPartyNotice:
          'मेरे पास केवल आपकी अपनी सहेजी गई कुंडली का विवरण है, इसलिए अभी मैं केवल आपकी कुंडली के आधार पर ही मार्गदर्शन दे सकता हूँ। किसी अन्य सदस्य की कुंडली का विश्लेषण अभी उपलब्ध नहीं है — यह जल्द ही एक अलग फीचर के रूप में आएगा।',
      },
    };
  }

  // If no Kundli data is present for an astrological query
  if (!kundli) {
    return {
      facts: {},
      appliedRules: {},
    };
  }

  // 3. Astrological Queries -> Build minimal, sub-category-scoped slice
  const facts: GuruJiFacts = {};
  const appliedRules: GuruJiAppliedRules = {};

  const isUnknownTime = birthAccuracy === 'unknown' || !kundli.ascendant;
  facts.birthTimeKnown = !isUnknownTime;

  if (isUnknownTime) {
    appliedRules.timeAccuracyNote =
      'जन्म समय अज्ञात (Unknown) होने के कारण लग्न व भाव आधारित भविष्यवाणियां सम्मिलित नहीं हैं; मार्गदर्शन चन्द्र राशि एवं महादशा के आधार पर दिया जा रहा है।';
  } else {
    facts.lagna = kundli.ascendant?.rashiName;
    facts.lagnaHi = kundli.ascendant?.rashiNameHi;
    facts.lagnaLord = kundli.ascendant?.lord;
    facts.lagnaLordHi = kundli.ascendant?.lordHi;
  }

  // Common planetary anchors
  const moon = kundli.planets?.Moon;
  const sun = kundli.planets?.Sun;
  facts.moonSign = moon?.sign || (moon as any)?.rashiName;
  facts.moonSignHi = moon?.rashiNameHindi || (moon as any)?.rashiNameHi;
  facts.moonNakshatra = moon?.nakshatra || kundli.panchanga?.nakshatra;
  facts.moonNakshatraPada = moon?.nakshatraPada || kundli.ascendant?.pada;

  facts.sunSign = sun?.sign || (sun as any)?.rashiName;
  facts.sunSignHi = sun?.rashiNameHindi || (sun as any)?.rashiNameHi;

  // Dasha
  const dasha = kundli.dasha;
  if (dasha?.currentMahadasha) {
    facts.activeMahadasha = dasha.currentMahadasha.planet;
    facts.activeMahadashaHi = dasha.currentMahadasha.planetHi || dasha.currentMahadasha.planet;
  }
  if (dasha?.currentAntardasha) {
    facts.activeAntardasha = dasha.currentAntardasha.planet;
    facts.activeAntardashaHi = dasha.currentAntardasha.planetHi || dasha.currentAntardasha.planet;
  }

  // Sub-Category Scoped Facts & Rules
  switch (subCategory) {
    case 'career': {
      if (!isUnknownTime) {
        const tenthHouse = kundli.houses?.find(h => h.number === 10);
        facts.tenthHouseLord = tenthHouse?.lord;
        facts.tenthHouseLordHi = tenthHouse?.lordHi;
        facts.tenthHousePlanets = tenthHouse?.planets || [];
      }
      appliedRules.careerInfluence = `दशम भाव के स्वामी ${facts.tenthHouseLordHi || facts.tenthHouseLord || 'कर्म स्वामी'} एवं सूर्य देव के प्रभाव से आजीविका में परिश्रम व धैर्य से उन्नति के योग हैं।`;
      break;
    }

    case 'marriage': {
      if (!isUnknownTime) {
        const seventhHouse = kundli.houses?.find(h => h.number === 7);
        facts.seventhHouseLord = seventhHouse?.lord;
        facts.seventhHouseLordHi = seventhHouse?.lordHi;
      }
      facts.mangalDoshaPresent = kundli.mangalDosha?.hasDosha ?? false;
      facts.mangalDoshaSeverity = kundli.mangalDosha?.isHigh ? 'high' : (kundli.mangalDosha?.hasDosha ? 'mild' : 'none');
      appliedRules.mangalDoshaMeaning = kundli.mangalDosha?.descriptionHi || kundli.mangalDosha?.description;
      appliedRules.marriageInfluence = `सप्तम भाव एवं गुरु/शुक्र ग्रह के अनुकूल प्रभाव से दांपत्य जीवन में सामंजस्य स्थापित होता है।`;
      break;
    }

    case 'ishta': {
      facts.atmakaraka = kundli.ishtaDevata?.atmakaraka;
      facts.karakamsha = kundli.ishtaDevata?.karakamshaRashiName;
      appliedRules.ishtaDevata = kundli.ishtaDevata?.deity;
      appliedRules.ishtaDevataHi = kundli.ishtaDevata?.deityHi;
      appliedRules.ishtaMantra = kundli.ishtaDevata?.mantra;
      appliedRules.ishtaRationale = kundli.ishtaDevata?.rationaleHi || kundli.ishtaDevata?.rationale;
      break;
    }

    case 'dasha': {
      if (dasha?.currentMahadasha?.endDate) {
        const endYear = new Date(dasha.currentMahadasha.endDate).getFullYear();
        if (!isNaN(endYear)) facts.dashaEndYear = endYear;
      }
      appliedRules.dashaInfluence = `वर्तमान में ${facts.activeMahadashaHi || facts.activeMahadasha} महादशा एवं ${facts.activeAntardashaHi || facts.activeAntardasha} अंतर्दशा का प्रभाव सक्रिय है।`;
      break;
    }

    case 'sade_sati': {
      const sadeSati = (kundli as any).sadeSati;
      if (sadeSati) {
        facts.sadeSatiActive = Boolean(sadeSati.isInSadeSati);
        facts.sadeSatiPhase = sadeSati.phase || 'none';
        appliedRules.sadeSatiMeaning = sadeSati.descriptionHi || sadeSati.description;
      }
      break;
    }

    case 'dosha': {
      facts.mangalDoshaPresent = kundli.mangalDosha?.hasDosha ?? false;
      const kaalSarp = (kundli as any).kaalSarpDosha;
      if (kaalSarp) {
        facts.kaalSarpPresent = Boolean(kaalSarp.hasDosha);
        facts.kaalSarpType = kaalSarp.type || 'none';
      }
      break;
    }

    case 'wealth':
    case 'health':
    case 'general_astro':
    default: {
      appliedRules.ishtaDevata = kundli.ishtaDevata?.deity;
      appliedRules.ishtaDevataHi = kundli.ishtaDevata?.deityHi;
      appliedRules.ishtaMantra = kundli.ishtaDevata?.mantra;
      break;
    }
  }

  return { facts, appliedRules };
}
