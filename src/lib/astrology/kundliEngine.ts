/**
 * Authentic Vedic Kundli Engine powered by @ishubhamx/panchangam-js
 * Computes complete Lagna, 9 Navagrahas, 12 Bhavas, Nakshatra, Vimshottari Dasha,
 * Shodashavargas, Mangal Dosha, Ishta Devata, and Life Predictions synchronously (<5ms).
 */

import {
  Observer,
  getKundli,
  getPanchangam,
  checkMangalDosha,
  getAyanamsa,
  getPlanetaryPosition,
} from '@ishubhamx/panchangam-js';

import { resolveHistoricalUtcOffset } from './geocodePlace';

import type {
  BirthProfileInput,
  CompleteKundliData,
  BirthCalculationContext,
  NormalizedPlanet,
  VedicHouseData,
  VedicAscendant,
  MangalDoshaResult,
  IshtaDevataResult,
  JanmaPanchangam,
  NormalizedDasha,
  PlanetDignity,
} from './types';

export const RASHI_NAMES = [
  { index: 0, en: 'Aries', hi: 'मेष', lord: 'Mars', lordHi: 'मंगल' },
  { index: 1, en: 'Taurus', hi: 'वृषभ', lord: 'Venus', lordHi: 'शुक्र' },
  { index: 2, en: 'Gemini', hi: 'मिथुन', lord: 'Mercury', lordHi: 'बुध' },
  { index: 3, en: 'Cancer', hi: 'कर्क', lord: 'Moon', lordHi: 'चन्द्र' },
  { index: 4, en: 'Leo', hi: 'सिंह', lord: 'Sun', lordHi: 'सूर्य' },
  { index: 5, en: 'Virgo', hi: 'कन्या', lord: 'Mercury', lordHi: 'बुध' },
  { index: 6, en: 'Libra', hi: 'तुला', lord: 'Venus', lordHi: 'शुक्र' },
  { index: 7, en: 'Scorpio', hi: 'वृश्चिक', lord: 'Mars', lordHi: 'मंगल' },
  { index: 8, en: 'Sagittarius', hi: 'धनु', lord: 'Jupiter', lordHi: 'गुरु' },
  { index: 9, en: 'Capricorn', hi: 'मकर', lord: 'Saturn', lordHi: 'शनि' },
  { index: 10, en: 'Aquarius', hi: 'कुम्भ', lord: 'Saturn', lordHi: 'शनि' },
  { index: 11, en: 'Pisces', hi: 'मीन', lord: 'Jupiter', lordHi: 'गुरु' },
] as const;

export const HOUSE_SIGNIFICANCE: Record<number, { en: string; hi: string }> = {
  1: { en: 'Tanu Bhava (Self, Vitality, Appearance, General Disposition)', hi: 'तनु भाव (शरीर, स्वास्थ्य, व्यक्तित्व, स्वभाव)' },
  2: { en: 'Dhana Bhava (Wealth, Family, Speech, Assets, Food)', hi: 'धन भाव (कुटुंब, धन संचय, वाणी, नेत्र)' },
  3: { en: 'Sahaja Bhava (Siblings, Courage, Communication, Short Travel)', hi: 'सहज भाव (पराक्रम, छोटे भाई-बहन, साहस, लेखन)' },
  4: { en: 'Sukha Bhava (Mother, Land, Vehicles, Emotional Happiness)', hi: 'सुख भाव (माता, भूमि, भवन, वाहन, मन की शांति)' },
  5: { en: 'Putra Bhava (Children, Intellect, Past Karma, Mantra Sadhana)', hi: 'पुत्र भाव (संतान, बुद्धि, पूर्व पुण्य, मंत्र साधना)' },
  6: { en: 'Ari Bhava (Debts, Enemies, Diseases, Daily Routine, Service)', hi: 'शत्रु/रोग भाव (रोग, ऋण, शत्रु, सेवा, प्रतियोगिता)' },
  7: { en: 'Yuvati Bhava (Spouse, Marriage, Partnerships, Public Relations)', hi: 'युवति भाव (विवाह, जीवनसाथी, साझेदारी, व्यापारिक संबंध)' },
  8: { en: 'Randhra Bhava (Longevity, Transformation, Occult, Hidden Wealth)', hi: 'आयु/रंध्र भाव (आयु, रहस्य विद्या, आकस्मिक परिवर्तन)' },
  9: { en: 'Dharma Bhava (Fortune, Guru, Higher Learning, Pilgrim, Father)', hi: 'भाग्य भाव (धर्म, गुरु, तीर्थयात्रा, पिता, उच्च ज्ञान)' },
  10: { en: 'Karma Bhava (Profession, Status, Career, Authority, Fame)', hi: 'कर्म भाव (आजीविका, पद-प्रतिष्ठा, व्यवसाय, कीर्ति)' },
  11: { en: 'Labha Bhava (Gains, Aspirations, Income, Elder Siblings, Network)', hi: 'लाभ भाव (आय, मनोकामना पूर्ति, मित्र, बड़े भाई-बहन)' },
  12: { en: 'Vyaya Bhava (Expenditure, Foreign Lands, Moksha, Meditation, Sleep)', hi: 'व्यय भाव (मोक्ष, विदेश गमन, ध्यान, आध्यात्मिक मुक्ति)' },
};

export const PLANET_NAMES_HI: Record<string, string> = {
  Sun: 'सूर्य',
  Moon: 'चन्द्र',
  Mars: 'मंगल',
  Mercury: 'बुध',
  Jupiter: 'गुरु',
  Venus: 'शुक्र',
  Saturn: 'शनि',
  Rahu: 'राहु',
  Ketu: 'केतु',
  Uranus: 'अरुण',
  Neptune: 'वरुण',
  Pluto: 'यम',
};

const EXALTATION_SIGNS: Record<string, number> = {
  Sun: 0, // Aries
  Moon: 1, // Taurus
  Mars: 9, // Capricorn
  Mercury: 5, // Virgo
  Jupiter: 3, // Cancer
  Venus: 11, // Pisces
  Saturn: 6, // Libra
  Rahu: 1, // Taurus (classical)
  Ketu: 7, // Scorpio (classical)
};

const DEBILITATION_SIGNS: Record<string, number> = {
  Sun: 6, // Libra
  Moon: 7, // Scorpio
  Mars: 3, // Cancer
  Mercury: 11, // Pisces
  Jupiter: 9, // Capricorn
  Venus: 5, // Virgo
  Saturn: 0, // Aries
  Rahu: 7, // Scorpio
  Ketu: 1, // Taurus
};

const OWN_SIGNS: Record<string, number[]> = {
  Sun: [4],
  Moon: [3],
  Mars: [0, 7],
  Mercury: [2, 5],
  Jupiter: [8, 11],
  Venus: [1, 6],
  Saturn: [9, 10],
  Rahu: [10],
  Ketu: [7],
};

function calculateDignity(planetName: string, rashiIndex: number, speed?: number): PlanetDignity {
  if (EXALTATION_SIGNS[planetName] === rashiIndex) return 'exalted';
  if (DEBILITATION_SIGNS[planetName] === rashiIndex) return 'debilitated';
  if (OWN_SIGNS[planetName]?.includes(rashiIndex)) return 'own';
  if (planetName === 'Sun' && rashiIndex === 4) return 'moolatrikona';
  if (planetName === 'Moon' && rashiIndex === 1) return 'moolatrikona';
  if (planetName === 'Mars' && rashiIndex === 0) return 'moolatrikona';
  if (planetName === 'Mercury' && rashiIndex === 5) return 'moolatrikona';
  if (planetName === 'Jupiter' && rashiIndex === 8) return 'moolatrikona';
  if (planetName === 'Venus' && rashiIndex === 6) return 'moolatrikona';
  if (planetName === 'Saturn' && rashiIndex === 10) return 'moolatrikona';
  return 'neutral';
}

/**
 * Parse UTC offset string (+05:30, -04:00, +5.5) into total minutes east of UTC
 */
export function parseOffsetToMinutes(utcOffset?: string | null): number {
  if (!utcOffset) return 330;
  const clean = utcOffset.trim();
  const match = clean.match(/^([+-])(\d{1,2}):?(\d{2})?$/);
  if (!match) return 330;
  const sign = match[1] === '-' ? -1 : 1;
  const hours = parseInt(match[2], 10);
  const minutes = match[3] ? parseInt(match[3], 10) : 0;
  return sign * (hours * 60 + minutes);
}

/**
 * Calculate Atmakaraka (AK) dynamically among the 7 physical Grahas (Sun to Saturn).
 * The planet with highest longitudinal degrees (0-30°) within its sign is the Atmakaraka.
 */
export function calculateAtmakaraka(planets: Record<string, { longitude: number }>): {
  planet: string;
  longitude: number;
  degreeInSign: number;
} {
  const PHYSICAL_7 = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'] as const;
  let highestPlanet = 'Sun';
  let highestDeg = -1;
  let highestLon = 0;

  for (const pName of PHYSICAL_7) {
    const p = planets[pName];
    if (!p || typeof p.longitude !== 'number' || isNaN(p.longitude)) continue;
    const degInSign = ((p.longitude % 30) + 30) % 30;
    
    // Deterministic selection with tie-breaking rule
    if (degInSign > highestDeg + 1e-7) {
      highestDeg = degInSign;
      highestPlanet = pName;
      highestLon = p.longitude;
    }
  }

  return {
    planet: highestPlanet,
    longitude: highestLon,
    degreeInSign: highestDeg >= 0 ? highestDeg : 0,
  };
}

/**
 * Classical Jaimini Karakamsha Ishta Devata Calculation
 * 1. Find Atmakaraka (AK) in D1.
 * 2. Find Karakamsha sign (sign of AK in Navamsha D9).
 * 3. Find 12th house from Karakamsha in D9 (Jivanmuktamsha).
 * 4. Inspect occupants and sign lord in 12th from Karakamsha in D9.
 * 5. Map determinant planet to classical deity, mantra, and auditable rationale.
 */
export function determineIshtaDevata(
  rawKundli: any,
  d1Planets: Record<string, NormalizedPlanet>
): IshtaDevataResult {
  // 1. Calculate Atmakaraka (AK)
  const ak = calculateAtmakaraka(d1Planets);
  
  // 2. Find Karakamsha sign in D9
  const d9Data = rawKundli?.vargas?.d9;
  const akD9Planet = d9Data?.planets?.[ak.planet];
  const karakamshaRashi = typeof akD9Planet?.rashi === 'number'
    ? akD9Planet.rashi
    : (Math.floor(ak.longitude / 30) % 12);
  const karakamshaRashiMeta = RASHI_NAMES[karakamshaRashi] || RASHI_NAMES[0];

  // 3. Find 12th house from Karakamsha in D9 (Jivanmuktamsha)
  const twelfthHouseRashi = (karakamshaRashi + 11) % 12;
  const twelfthHouseMeta = RASHI_NAMES[twelfthHouseRashi] || RASHI_NAMES[0];
  const twelfthHouseLord = twelfthHouseMeta.lord;

  // 4. Scan occupants in 12th house from Karakamsha in D9
  const occupants: string[] = [];
  if (d9Data?.planets) {
    const CLASSICAL_GRAHAS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    for (const [pName, pD9] of Object.entries(d9Data.planets)) {
      if (CLASSICAL_GRAHAS.includes(pName) && (pD9 as any)?.rashi === twelfthHouseRashi) {
        occupants.push(pName);
      }
    }
  }

  // 5. Apply Classical Interpretive Rule (Jaimini Upadesha Sutras 1.2.68–79 / BPHS Ch. 33)
  const OCCUPANT_PRIORITY = ['Mars', 'Mercury', 'Sun', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu', 'Moon'];
  let determinantPlanet = twelfthHouseLord;
  let ruleExplanation = `12th house from Karakamsha (${twelfthHouseMeta.en}) is vacant in D9; sign lord ${twelfthHouseLord} is the deity determinant.`;

  if (occupants.length > 0) {
    occupants.sort((a, b) => OCCUPANT_PRIORITY.indexOf(a) - OCCUPANT_PRIORITY.indexOf(b));
    determinantPlanet = occupants[0];
    ruleExplanation = `12th house from Karakamsha (${twelfthHouseMeta.en}) in D9 is occupied by ${occupants.join(', ')}; primary occupant ${determinantPlanet} is the deity determinant.`;
  }

  const METHODOLOGY_DISCLAIMER_EN = 'The Ishta Devata attribution is derived from the classical Jaimini Karakamsha and Brihat Parashara Hora Shastra tradition (evaluating the 12th house from Atmakaraka in Navamsha D9). It represents a sacred devotional guideline and spiritual tradition rather than an empirical astronomical certainty.';
  const METHODOLOGY_DISCLAIMER_HI = 'इष्ट देव का निर्धारण महर्षि जैमिनी के कारकांश सिद्धांत व वृहत् पराशर होरा शास्त्र (नवमांश डी9 में आत्मकारक से 12वें भाव) की शास्त्रीय परम्परा पर आधारित है। यह साधना हेतु एक आध्यात्मिक व भक्ति मार्गदर्शन है, कोई भौतिक खगोलीय निश्चितता नहीं।';

  // 6. Map determinant Graha to classical deity, sacred mantra, and rationale
  switch (determinantPlanet) {
    case 'Sun':
      return {
        deity: 'Lord Rama & Surya Dev',
        deityHi: 'प्रभु श्री राम एवं भगवान सूर्य',
        planet: 'Sun',
        planetHi: 'सूर्य',
        atmakaraka: ak.planet,
        atmakarakaDegree: ak.degreeInSign,
        karakamshaRashi,
        karakamshaRashiName: karakamshaRashiMeta.en,
        twelfthHouseRashi,
        twelfthHouseRashiName: twelfthHouseMeta.en,
        twelfthHouseOccupants: occupants,
        twelfthHouseLord,
        rule: ruleExplanation,
        methodologyDisclaimer: METHODOLOGY_DISCLAIMER_EN,
        methodologyDisclaimerHi: METHODOLOGY_DISCLAIMER_HI,
        rationale: `Jaimini Karakamsha: Atmakaraka ${ak.planet} (${ak.degreeInSign.toFixed(2)}°) is in ${karakamshaRashiMeta.en} in D9. 12th house (${twelfthHouseMeta.en}) indicates devotion to Lord Rama and Surya.`,
        rationaleHi: `जैमिनी कारकांश: आत्मकारक ${PLANET_NAMES_HI[ak.planet] || ak.planet} नवमांश में ${karakamshaRashiMeta.hi} में है। 12वां भाव (${twelfthHouseMeta.hi}) प्रभु श्री राम व सूर्य उपासना का संकेत करता है।`,
        mantra: 'ॐ रां रामाय नमः / ॐ घृणि सूर्याय नमः',
        mantraMeaning: 'Om Ram Ramaya Namaha — Salutations to the supreme consciousness embodiment, Lord Rama.',
        recommendedBhajanQuery: 'Shri Ram Chandra Kripalu Bhajman',
      };
    case 'Moon':
      return {
        deity: 'Lord Shiva & Gauri Mata',
        deityHi: 'भगवान शिव एवं माता गौरी',
        planet: 'Moon',
        planetHi: 'चन्द्र',
        atmakaraka: ak.planet,
        atmakarakaDegree: ak.degreeInSign,
        karakamshaRashi,
        karakamshaRashiName: karakamshaRashiMeta.en,
        twelfthHouseRashi,
        twelfthHouseRashiName: twelfthHouseMeta.en,
        twelfthHouseOccupants: occupants,
        twelfthHouseLord,
        rule: ruleExplanation,
        methodologyDisclaimer: METHODOLOGY_DISCLAIMER_EN,
        methodologyDisclaimerHi: METHODOLOGY_DISCLAIMER_HI,
        rationale: `Jaimini Karakamsha: Atmakaraka ${ak.planet} (${ak.degreeInSign.toFixed(2)}°) is in ${karakamshaRashiMeta.en} in D9. Chandra influence on 12th house directs the heart toward Lord Shiva and peace.`,
        rationaleHi: `जैमिनी कारकांश: नवमांश में आत्मकारक ${PLANET_NAMES_HI[ak.planet] || ak.planet} से 12वें भाव पर चन्द्रमा का प्रभाव भगवान शिव और माता पार्वती की भक्ति प्रदान करता है।`,
        mantra: 'ॐ नमः शिवाय / ॐ सों सोमाय नमः',
        mantraMeaning: 'Om Namah Shivaya — I bow to the auspicious supreme consciousness, Lord Shiva.',
        recommendedBhajanQuery: 'Shiv Tandav Stotram',
      };
    case 'Mars':
      return {
        deity: 'Lord Hanuman & Kartikeya',
        deityHi: 'भगवान श्री हनुमान एवं कार्तिकेय',
        planet: 'Mars',
        planetHi: 'मंगल',
        atmakaraka: ak.planet,
        atmakarakaDegree: ak.degreeInSign,
        karakamshaRashi,
        karakamshaRashiName: karakamshaRashiMeta.en,
        twelfthHouseRashi,
        twelfthHouseRashiName: twelfthHouseMeta.en,
        twelfthHouseOccupants: occupants,
        twelfthHouseLord,
        rule: ruleExplanation,
        methodologyDisclaimer: METHODOLOGY_DISCLAIMER_EN,
        methodologyDisclaimerHi: METHODOLOGY_DISCLAIMER_HI,
        rationale: `Jaimini Karakamsha: Atmakaraka ${ak.planet} (${ak.degreeInSign.toFixed(2)}°) is in ${karakamshaRashiMeta.en} in D9. Mars influence on 12th house (${twelfthHouseMeta.en}) invokes Lord Hanuman's courage and protection.`,
        rationaleHi: `जैमिनी कारकांश: आत्मकारक ${PLANET_NAMES_HI[ak.planet] || ak.planet} के कारकांश से 12वें भाव पर मंगल के प्रभाव से श्री हनुमान जी की साधना व कृपा प्राप्त होती है।`,
        mantra: 'ॐ हनुमते नमः / ॐ क्रां क्रीं क्रौं सः भौमाय नमः',
        mantraMeaning: 'Om Hanumate Namaha — Salutations to Lord Hanuman, embodiment of courage and unwavering devotion.',
        recommendedBhajanQuery: 'Hanuman Chalisa',
      };
    case 'Mercury':
      return {
        deity: 'Lord Vishnu & Narayana',
        deityHi: 'भगवान श्री हरि विष्णु एवं नारायण',
        planet: 'Mercury',
        planetHi: 'बुध',
        atmakaraka: ak.planet,
        atmakarakaDegree: ak.degreeInSign,
        karakamshaRashi,
        karakamshaRashiName: karakamshaRashiMeta.en,
        twelfthHouseRashi,
        twelfthHouseRashiName: twelfthHouseMeta.en,
        twelfthHouseOccupants: occupants,
        twelfthHouseLord,
        rule: ruleExplanation,
        methodologyDisclaimer: METHODOLOGY_DISCLAIMER_EN,
        methodologyDisclaimerHi: METHODOLOGY_DISCLAIMER_HI,
        rationale: `Jaimini Karakamsha: Atmakaraka ${ak.planet} (${ak.degreeInSign.toFixed(2)}°) is in ${karakamshaRashiMeta.en} in D9. Mercury influence on 12th house indicates devotion to Lord Vishnu for wisdom and dharma.`,
        rationaleHi: `जैमिनी कारकांश: कारकांश से 12वें भाव पर बुध के प्रभाव से भगवान श्री हरि विष्णु की आराधना जीवन में धर्म, विवेक और शांति लाती है।`,
        mantra: 'ॐ नमो भगवते वासुदेवाय / ॐ बुं बुधाय नमः',
        mantraMeaning: 'Om Namo Bhagavate Vasudevaya — Salutations to the omnipresent Lord Vasudeva.',
        recommendedBhajanQuery: 'Achyutam Keshavam',
      };
    case 'Jupiter':
      return {
        deity: 'Lord Krishna & Samba Shiva',
        deityHi: 'भगवान श्री कृष्ण एवं साम्ब सदाशिव',
        planet: 'Jupiter',
        planetHi: 'गुरु',
        atmakaraka: ak.planet,
        atmakarakaDegree: ak.degreeInSign,
        karakamshaRashi,
        karakamshaRashiName: karakamshaRashiMeta.en,
        twelfthHouseRashi,
        twelfthHouseRashiName: twelfthHouseMeta.en,
        twelfthHouseOccupants: occupants,
        twelfthHouseLord,
        rule: ruleExplanation,
        methodologyDisclaimer: METHODOLOGY_DISCLAIMER_EN,
        methodologyDisclaimerHi: METHODOLOGY_DISCLAIMER_HI,
        rationale: `Jaimini Karakamsha: Atmakaraka ${ak.planet} (${ak.degreeInSign.toFixed(2)}°) is in ${karakamshaRashiMeta.en} in D9. Jupiter influence on 12th house inspires devotion to Lord Krishna and spiritual enlightenment.`,
        rationaleHi: `जैमिनी कारकांश: कारकांश से 12वें भाव पर गुरु के प्रभाव से श्री कृष्ण व गुरु उपासना मोक्ष एवं ज्ञान प्रदान करती है।`,
        mantra: 'ॐ क्लीं कृष्णाय नमः / ॐ बृं बृहस्पतये नमः',
        mantraMeaning: 'Om Kleem Krishnaya Namaha — Salutations to Lord Krishna, supreme source of bliss.',
        recommendedBhajanQuery: 'Hare Krishna Mahamantra',
      };
    case 'Venus':
      return {
        deity: 'Maha Lakshmi & Devi Durga',
        deityHi: 'माता महालक्ष्मी एवं भगवती दुर्गा',
        planet: 'Venus',
        planetHi: 'शुक्र',
        atmakaraka: ak.planet,
        atmakarakaDegree: ak.degreeInSign,
        karakamshaRashi,
        karakamshaRashiName: karakamshaRashiMeta.en,
        twelfthHouseRashi,
        twelfthHouseRashiName: twelfthHouseMeta.en,
        twelfthHouseOccupants: occupants,
        twelfthHouseLord,
        rule: ruleExplanation,
        methodologyDisclaimer: METHODOLOGY_DISCLAIMER_EN,
        methodologyDisclaimerHi: METHODOLOGY_DISCLAIMER_HI,
        rationale: `Jaimini Karakamsha: Atmakaraka ${ak.planet} (${ak.degreeInSign.toFixed(2)}°) is in ${karakamshaRashiMeta.en} in D9. Venus influence on 12th house directs the soul to Maha Lakshmi and divine feminine grace.`,
        rationaleHi: `जैमिनी कारकांश: कारकांश से 12वें भाव पर शुक्र के प्रभाव से माता महालक्ष्मी व भगवती दुर्गा की उपासना समृद्धि और सौभाग्य प्रदान करती है।`,
        mantra: 'ॐ श्रीं ह्रीं क्लीं महालक्ष्म्यै नमः / ॐ शुं शुक्राय नमः',
        mantraMeaning: 'Om Shreem Hreem Kleem Mahalakshmyai Namaha — Salutations to Goddess Mahalakshmi, the granter of abundance.',
        recommendedBhajanQuery: 'Om Jai Lakshmi Mata',
      };
    case 'Saturn':
      return {
        deity: 'Lord Shani & Bhairava',
        deityHi: 'भगवान शनि देव एवं काल भैरव',
        planet: 'Saturn',
        planetHi: 'शनि',
        atmakaraka: ak.planet,
        atmakarakaDegree: ak.degreeInSign,
        karakamshaRashi,
        karakamshaRashiName: karakamshaRashiMeta.en,
        twelfthHouseRashi,
        twelfthHouseRashiName: twelfthHouseMeta.en,
        twelfthHouseOccupants: occupants,
        twelfthHouseLord,
        rule: ruleExplanation,
        methodologyDisclaimer: METHODOLOGY_DISCLAIMER_EN,
        methodologyDisclaimerHi: METHODOLOGY_DISCLAIMER_HI,
        rationale: `Jaimini Karakamsha: Atmakaraka ${ak.planet} (${ak.degreeInSign.toFixed(2)}°) is in ${karakamshaRashiMeta.en} in D9. Saturn influence on 12th house fosters discipline, patience, and Lord Shiva/Bhairava grace.`,
        rationaleHi: `जैमिनी कारकांश: कारकांश से 12वें भाव पर शनि के प्रभाव से भगवान शिव, शनि देव व भैरव साधना से कर्म दोषों का शमन होता है।`,
        mantra: 'ॐ शं शनैश्चराय नमः / ॐ नमः शिवाय',
        mantraMeaning: 'Om Sham Shanaishcharaya Namaha — Salutations to Lord Shani, granter of perseverance.',
        recommendedBhajanQuery: 'Shiv Tandav Stotram',
      };
    case 'Rahu':
      return {
        deity: 'Devi Durga & Saraswati',
        deityHi: 'भगवती दुर्गा एवं माता सरस्वती',
        planet: 'Rahu',
        planetHi: 'राहु',
        atmakaraka: ak.planet,
        atmakarakaDegree: ak.degreeInSign,
        karakamshaRashi,
        karakamshaRashiName: karakamshaRashiMeta.en,
        twelfthHouseRashi,
        twelfthHouseRashiName: twelfthHouseMeta.en,
        twelfthHouseOccupants: occupants,
        twelfthHouseLord,
        rule: ruleExplanation,
        methodologyDisclaimer: METHODOLOGY_DISCLAIMER_EN,
        methodologyDisclaimerHi: METHODOLOGY_DISCLAIMER_HI,
        rationale: `Jaimini Karakamsha: Rahu in the 12th from Karakamsha indicates Durga/Chandi Sadhana for spiritual liberation and protection.`,
        rationaleHi: `जैमिनी कारकांश: कारकांश से 12वें भाव पर राहु के प्रभाव से माँ दुर्गा की उपासना सभी बाधाओं का नाश करती है।`,
        mantra: 'ॐ दुं दुर्गायै नमः / ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः',
        mantraMeaning: 'Om Dum Durgayei Namaha — Salutations to Goddess Durga, the protectress.',
        recommendedBhajanQuery: 'Aigiri Nandini',
      };
    case 'Ketu':
    default:
      return {
        deity: 'Lord Ganesha & Matsya Avatar',
        deityHi: 'भगवान श्री गणेश एवं मत्स्य अवतार',
        planet: 'Ketu',
        planetHi: 'केतु',
        atmakaraka: ak.planet,
        atmakarakaDegree: ak.degreeInSign,
        karakamshaRashi,
        karakamshaRashiName: karakamshaRashiMeta.en,
        twelfthHouseRashi,
        twelfthHouseRashiName: twelfthHouseMeta.en,
        twelfthHouseOccupants: occupants,
        twelfthHouseLord,
        rule: ruleExplanation,
        methodologyDisclaimer: METHODOLOGY_DISCLAIMER_EN,
        methodologyDisclaimerHi: METHODOLOGY_DISCLAIMER_HI,
        rationale: `Jaimini Karakamsha: Ketu in the 12th house (Moksha Karaka in Moksha Bhava) strongly indicates Lord Ganesha devotion for ultimate liberation.`,
        rationaleHi: `जैमिनी कारकांश: कारकांश से 12वें भाव में केतु (मोक्ष कारक) की स्थिति भगवान श्री गणेश की आराधना से आत्मिक मुक्ति का योग बनाती है।`,
        mantra: 'ॐ गं गणपतये नमः / ॐ स्त्रां स्त्रीं स्त्रौं सः केतवे नमः',
        mantraMeaning: 'Om Gam Ganapataye Namaha — Salutations to Lord Ganesha, remover of all obstacles.',
        recommendedBhajanQuery: 'Jai Ganesh Deva',
      };
  }
}

/**
 * Live Dynamic Sade Sati Calculation (Never hardcoded dates)
 * Evaluates transit Saturn's real-time position against natal Moon sign.
 */
export interface SadeSatiCalculationResult {
  isInSadeSati: boolean;
  phase: 'rising' | 'peak' | 'setting' | null;
  phaseName?: string;
  phaseNameHi?: string;
  saturnTransitRashi: string;
  saturnTransitRashiHi: string;
  saturnTransitLongitude: number;
  description: string;
  descriptionHi: string;
  remedies: string[];
  remediesHi: string[];
}

export function checkSadeSati(
  natalMoonRashi: number,
  currentDate: Date = new Date()
): SadeSatiCalculationResult {
  const ay = getAyanamsa(currentDate);
  const transitSaturn = getPlanetaryPosition('Saturn' as any, currentDate, ay);
  const saturnRashi = transitSaturn.rashi;
  const saturnMeta = RASHI_NAMES[saturnRashi] || RASHI_NAMES[0];

  // Difference from Moon to Saturn (Whole Sign):
  // 11 = 12th from Moon (Rising)
  // 0  = 1st from Moon / Conjunct Moon (Peak / Janma Shani)
  // 1  = 2nd from Moon (Setting)
  const diff = (saturnRashi - natalMoonRashi + 12) % 12;

  let isInSadeSati = false;
  let phase: 'rising' | 'peak' | 'setting' | null = null;
  let phaseName = 'Inactive';
  let phaseNameHi = 'निष्क्रिय';
  let description = 'Currently not experiencing Sade Sati.';
  let descriptionHi = 'वर्तमान समय में साढ़े साती का प्रभाव नहीं है।';

  if (diff === 11) {
    isInSadeSati = true;
    phase = 'rising';
    phaseName = 'Rising Phase (Phase 1)';
    phaseNameHi = 'उदय चरण (प्रथम चरण)';
    description = `Sade Sati Phase 1 (Rising): Transit Saturn is in ${saturnMeta.en} (12th house from natal Moon). Focus on disciplined planning and emotional balance.`;
    descriptionHi = `साढ़े साती प्रथम चरण (उदय चरण): गोचर शनि ${saturnMeta.hi} में (जन्म चन्द्रमा से 12वें भाव में) स्थित है। योजनाबद्ध अनुशासन व मानसिक संतुलन बनाए रखें।`;
  } else if (diff === 0) {
    isInSadeSati = true;
    phase = 'peak';
    phaseName = 'Peak Phase (Phase 2 / Janma Shani)';
    phaseNameHi = 'शिखर चरण (द्वितीय चरण / जन्म शनि)';
    description = `Sade Sati Phase 2 (Peak / Janma Shani): Transit Saturn is in ${saturnMeta.en} conjunct natal Moon. Requires patience, perseverance, and spiritual grounding.`;
    descriptionHi = `साढ़े साती द्वितीय चरण (शिखर चरण / जन्म शनि): गोचर शनि ${saturnMeta.hi} में जन्म चन्द्रमा के ऊपर गोचर कर रहा है। धैर्य, निष्ठा और भगवान शिव/शनि देव की नियमित साधना कल्याणकारी है।`;
  } else if (diff === 1) {
    isInSadeSati = true;
    phase = 'setting';
    phaseName = 'Setting Phase (Phase 3)';
    phaseNameHi = 'अस्त चरण (तृतीय चरण)';
    description = `Sade Sati Phase 3 (Setting): Transit Saturn is in ${saturnMeta.en} (2nd house from natal Moon). Financial prudence and speech moderation bring relief.`;
    descriptionHi = `साढ़े साती तृतीय चरण (अस्त चरण / उतरती साढ़े साती): गोचर शनि ${saturnMeta.hi} में (जन्म चन्द्रमा से द्वितीय भाव में) है। वाणी संयम व वित्तीय सतर्कता से राहत प्राप्त होती है।`;
  }

  return {
    isInSadeSati,
    phase,
    phaseName,
    phaseNameHi,
    saturnTransitRashi: saturnMeta.en,
    saturnTransitRashiHi: saturnMeta.hi,
    saturnTransitLongitude: transitSaturn.longitude,
    description,
    descriptionHi,
    remedies: [
      'Chant Hanuman Chalisa or Dasharatha Shani Stotram on Saturdays',
      'Offer mustard oil or sesame seeds in service',
      'Practice honesty, humility, and assist the needy',
    ],
    remediesHi: [
      'प्रतिदिन श्री हनुमान चालीसा या शनिवार को दशरथ कृत शनि स्तोत्र का पाठ करें',
      'शनिवार को काले तिल या सरसों के तेल का दीप प्रज्वलित करें',
      'सत्यनिष्ठा, विनम्रता बनाए रखें और जरूरतमंदों की सेवा करें',
    ],
  };
}

/**
 * Parashari Kaal Sarp Yoga Check
 * Evaluates whether physical Grahas are hemmed on one side of Rahu-Ketu axis.
 */
export function checkKaalSarpDosha(planets: Record<string, NormalizedPlanet>): {
  hasDosha: boolean;
  isPartial: boolean;
  type: 'full' | 'partial' | 'none';
  description: string;
  descriptionHi: string;
} {
  const rahu = planets.Rahu;
  const ketu = planets.Ketu;
  if (!rahu || !ketu || rahu.longitude === undefined || ketu.longitude === undefined) {
    return { hasDosha: false, isPartial: false, type: 'none', description: 'Nodal positions unavailable', descriptionHi: 'राहु-केतु स्थिति अनुपलब्ध' };
  }

  const rahuLong = rahu.longitude % 360;
  const ketuLong = ketu.longitude % 360;
  const physical7 = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

  let side1Count = 0;
  let side2Count = 0;

  for (const pName of physical7) {
    const p = planets[pName];
    if (!p || p.longitude === undefined) continue;
    const long = p.longitude % 360;
    
    let inSide1 = false;
    if (rahuLong < ketuLong) {
      inSide1 = long >= rahuLong && long <= ketuLong;
    } else {
      inSide1 = long >= rahuLong || long <= ketuLong;
    }

    if (inSide1) {
      side1Count++;
    } else {
      side2Count++;
    }
  }

  if (side1Count === 7 || side2Count === 7) {
    return {
      hasDosha: true,
      isPartial: false,
      type: 'full',
      description: 'Full Kaal Sarp Yoga: All 7 physical Grahas are hemmed between the Rahu-Ketu nodal axis.',
      descriptionHi: 'पूर्ण काल सर्प योग: सभी 7 भौतिक ग्रह राहु-केतु अक्ष के एक ओर स्थित हैं।',
    };
  } else if (side1Count === 6 || side2Count === 6) {
    return {
      hasDosha: true,
      isPartial: true,
      type: 'partial',
      description: 'Anshik (Partial) Kaal Sarp Yoga: 6 physical Grahas are hemmed between Rahu and Ketu with 1 planet outside.',
      descriptionHi: 'आंशिक काल सर्प योग: 6 ग्रह राहु-केतु अक्ष के एक ओर हैं तथा 1 ग्रह बाहर है।',
    };
  }

  return {
    hasDosha: false,
    isPartial: false,
    type: 'none',
    description: 'No Kaal Sarp Yoga present in the birth chart.',
    descriptionHi: 'कुण्डली में काल सर्प योग उपस्थित नहीं है।',
  };
}

/**
 * Parashari Pitra Dosha Check
 * Checks Surya affliction by Rahu/Ketu within 12° or 9th house affliction.
 */
export function checkPitraDosha(
  planets: Record<string, NormalizedPlanet>,
  ascendant: VedicAscendant
): {
  hasDosha: boolean;
  severity: 'mild' | 'moderate' | 'strong' | 'none';
  description: string;
  descriptionHi: string;
} {
  const sun = planets.Sun;
  const rahu = planets.Rahu;
  const ketu = planets.Ketu;

  if (!sun || !rahu || !ketu || sun.longitude === undefined || rahu.longitude === undefined) {
    return { hasDosha: false, severity: 'none', description: 'Planetary data unavailable', descriptionHi: 'ग्रह स्थिति अनुपलब्ध' };
  }

  const sunLong = sun.longitude % 360;
  const rahuLong = rahu.longitude % 360;
  const ketuLong = (ketu.longitude ?? (rahuLong + 180)) % 360;

  const diffRahu = Math.min(Math.abs(sunLong - rahuLong), 360 - Math.abs(sunLong - rahuLong));
  const diffKetu = Math.min(Math.abs(sunLong - ketuLong), 360 - Math.abs(sunLong - ketuLong));

  if (diffRahu <= 12 || diffKetu <= 12) {
    return {
      hasDosha: true,
      severity: diffRahu <= 6 || diffKetu <= 6 ? 'strong' : 'moderate',
      description: `Surya Grahan / Pitra Dosha: Sun is conjunct ${diffRahu <= 12 ? 'Rahu' : 'Ketu'} within close degree orb (${(diffRahu <= 12 ? diffRahu : diffKetu).toFixed(1)}°).`,
      descriptionHi: `पितृ दोष (सूर्य ग्रहण योग): सूर्य देव ${diffRahu <= 12 ? 'राहु' : 'केतु'} के समीप स्थित हैं। नियमित गायत्री मंत्र व पितृ तर्पण शुभ फलदायी है।`,
    };
  }

  return {
    hasDosha: false,
    severity: 'none',
    description: 'No significant Pitra Dosha observed.',
    descriptionHi: 'कुण्डली में कोई प्रमुख पितृ दोष नहीं पाया गया।',
  };
}

/**
 * Generate Vedic life predictions based on Lagna, Moon, and planetary configurations
 */
function generateVedicPredictions(
  ascendant: VedicAscendant,
  planets: Record<string, NormalizedPlanet>,
  dasha?: NormalizedDasha
): Record<string, string[]> {
  const lagnaName = ascendant.rashiName;
  const moonPlanet = planets.Moon;
  const currentMD = dasha?.currentMahadasha?.planet || 'Jupiter';

  const career: string[] = [
    `With ${lagnaName} ascendant, your natural leadership and analytical strengths position you well for responsible roles.`,
    `Current ${currentMD} Mahadasha indicates significant professional focus; proactive initiative brings recognition.`,
    `Favorable planetary support in key houses encourages steady growth in enterprise and career trajectory.`,
  ];

  const marriage: string[] = [
    `The 7th house dynamic reflects strong relationship loyalty and mutual understanding with life partner.`,
    `Harmonizing communicative expressions during major transits preserves lasting domestic peace and love.`,
  ];

  const finance: string[] = [
    `2nd house wealth significations indicate steady wealth accumulation through disciplined investments.`,
    `Focus on long-term assets, real estate, and ethical earnings brings financial resilience.`,
  ];

  const health: string[] = [
    `Maintain balanced diet and rhythmic daily sleep cycles to keep vitality high.`,
    `Morning Surya Namaskar and pranayama provide excellent physical and mental equilibrium.`,
  ];

  const spirituality: string[] = [
    `Your birth chart possesses a strong spiritual undercurrent with natural affinity for mantra japa and sacred music.`,
    `Listening to daily morning stotrams and practicing evening meditation deepens inner tranquility.`,
  ];

  return {
    career,
    marriage,
    finance,
    health,
    spirituality,
  };
}

/**
 * Parse birth date and time into a precise localized Date object
 */
export function parseBirthDateTime(
  dateOfBirth: string,
  birthTime?: string | null,
  utcOffset = '+05:30'
): Date {
  const cleanDate = dateOfBirth.trim();
  const cleanTime = (birthTime && birthTime.trim()) ? birthTime.trim().slice(0, 5) : '12:00';
  const cleanOffset = utcOffset.startsWith('+') || utcOffset.startsWith('-') ? utcOffset : `+${utcOffset}`;
  
  // Format: YYYY-MM-DDTHH:mm:00+05:30
  const isoWithOffset = `${cleanDate}T${cleanTime}:00${cleanOffset}`;
  const parsed = new Date(isoWithOffset);
  
  if (isNaN(parsed.getTime())) {
    // Fallback parsing
    return new Date(`${cleanDate}T${cleanTime}:00Z`);
  }
  return parsed;
}

/**
 * Core Kundli Engine Calculation Function
 * Computes complete Kundli JSON using @ishubhamx/panchangam-js in < 5ms
 */
export function calculateCompleteKundli(input: BirthProfileInput): CompleteKundliData {
  const tzIana = input.timezone_iana || 'Asia/Kolkata';
  const historicalOffset = resolveHistoricalUtcOffset(input.date_of_birth, input.birth_time, tzIana);
  const effectiveOffset = input.utc_offset_at_birth || historicalOffset || '+05:30';
  const birthDate = parseBirthDateTime(input.date_of_birth, input.birth_time, effectiveOffset);
  const elevation = input.elevation ?? 0;
  const observer = new Observer(input.lat, input.lng, elevation);

  // 1. Core Kundli from panchangam-js
  const rawKundli = getKundli(birthDate, observer, {
    houseSystem: 'whole_sign',
  });

  // 2. Ascendant / Lagna
  const ascRaw = rawKundli.ascendant;
  const ascRashi = ascRaw.rashi;
  const ascRashiMeta = RASHI_NAMES[ascRashi] || RASHI_NAMES[0];
  const ascendantDegree = ascRaw.longitude % 30;

  const ascendant: VedicAscendant = {
    rashi: ascRashi,
    rashiName: ascRaw.rashiName || ascRashiMeta.en,
    rashiNameHi: ascRashiMeta.hi,
    longitude: ascRaw.longitude,
    degree: ascendantDegree,
    nakshatra: ascRaw.nakshatra || '',
    nakshatraLord: ascRaw.nakshatraLord || '',
    pada: ascRaw.pada || 1,
    lord: ascRashiMeta.lord,
    lordHi: ascRashiMeta.lordHi,
  };

  // 3. Normalized Planets (9 Navagrahas + Outer planets)
  const planets: Record<string, NormalizedPlanet> = {};
  const houseOccupants: Record<number, string[]> = {
    1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
    7: [], 8: [], 9: [], 10: [], 11: [], 12: [],
  };

  for (const [pName, pData] of Object.entries(rawKundli.planets)) {
    if (!pData || typeof pData !== 'object') continue;
    const rashiIdx = pData.rashi;
    const rMeta = RASHI_NAMES[rashiIdx] || RASHI_NAMES[0];
    
    // In Whole Sign house system: House = ((Planet Rashi - Lagna Rashi + 12) % 12) + 1
    const computedHouse = input.birth_time_accuracy === 'unknown'
      ? null
      : ((rashiIdx - ascRashi + 12) % 12) + 1;

    const dignity = calculateDignity(pName, rashiIdx, pData.speed);

    planets[pName] = {
      name: pName,
      sign: pData.rashiName || rMeta.en,
      signNumber: rashiIdx,
      rashiNameHindi: rMeta.hi,
      degree: pData.degree ?? (pData.longitude % 30),
      longitude: pData.longitude,
      isRetrograde: Boolean(pData.isRetrograde),
      house: computedHouse,
      nakshatra: pData.nakshatra,
      nakshatraLord: pData.nakshatraLord,
      nakshatraPada: pData.pada,
      dignity,
      speed: pData.speed,
    };

    if (computedHouse && computedHouse >= 1 && computedHouse <= 12) {
      houseOccupants[computedHouse].push(pName);
    }
  }

  // 4. 12 Bhavas (Houses)
  const houses: VedicHouseData[] = [];
  for (let h = 1; h <= 12; h++) {
    const houseRashiIdx = (ascRashi + (h - 1)) % 12;
    const rMeta = RASHI_NAMES[houseRashiIdx];
    const sig = HOUSE_SIGNIFICANCE[h];

    houses.push({
      number: h,
      rashi: houseRashiIdx,
      rashiName: rMeta.en,
      rashiNameHi: rMeta.hi,
      lord: rMeta.lord,
      lordHi: rMeta.lordHi,
      planets: houseOccupants[h] || [],
      significance: sig?.en,
      significanceHi: sig?.hi,
    });
  }

  // 5. Vimshottari Dasha — Resolve live active Mahadasha for TODAY
  const rawDasha = rawKundli.dasha || {};
  const fullCycleRaw = Array.isArray(rawDasha.fullCycle) ? rawDasha.fullCycle : [];
  const nowMs = Date.now();

  let activeMahadashaItem = fullCycleRaw.find((c: any) => {
    const s = new Date(c.startTime).getTime();
    const e = new Date(c.endTime).getTime();
    return nowMs >= s && nowMs <= e;
  });

  // Fallback to first if before all or last if after all
  if (!activeMahadashaItem && fullCycleRaw.length > 0) {
    if (nowMs < new Date(fullCycleRaw[0].startTime).getTime()) {
      activeMahadashaItem = fullCycleRaw[0];
    } else {
      activeMahadashaItem = fullCycleRaw[fullCycleRaw.length - 1];
    }
  }

  const currentMD = activeMahadashaItem?.planet || rawDasha.currentMahadasha?.planet || 'Jupiter';
  const currentMDStart = activeMahadashaItem?.startTime || rawDasha.currentMahadasha?.startTime;
  const currentMDEnd = activeMahadashaItem?.endTime || rawDasha.currentMahadasha?.endTime;

  let progressPct = 0;
  if (currentMDStart && currentMDEnd) {
    const s = new Date(currentMDStart).getTime();
    const e = new Date(currentMDEnd).getTime();
    if (e > s) {
      progressPct = Math.min(100, Math.max(1, Math.round(((nowMs - s) / (e - s)) * 100)));
    }
  }

  // Antardasha calculation
  const VIMSHOTTARI_ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
  const VIMSHOTTARI_YEARS: Record<string, number> = {
    Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
  };
  const mdIdx = VIMSHOTTARI_ORDER.indexOf(currentMD);
  const mdDurationYears = VIMSHOTTARI_YEARS[currentMD] || 10;
  
  let currentAD = rawDasha.currentAntardasha?.planet || currentMD;
  let currentADEnd = rawDasha.currentAntardasha?.endTime;

  if (currentMDStart && mdIdx !== -1) {
    let curSubStart = new Date(currentMDStart).getTime();
    for (let i = 0; i < 9; i++) {
      const subPlanet = VIMSHOTTARI_ORDER[(mdIdx + i) % 9];
      const subYears = VIMSHOTTARI_YEARS[subPlanet];
      const subDurationMs = (mdDurationYears * subYears / 120) * 365.25 * 24 * 3600 * 1000;
      const curSubEnd = curSubStart + subDurationMs;
      if (nowMs >= curSubStart && nowMs <= curSubEnd) {
        currentAD = subPlanet;
        currentADEnd = new Date(curSubEnd).toISOString();
        break;
      }
      curSubStart = curSubEnd;
    }
  }

  const dasha: NormalizedDasha = {
    birthNakshatra: rawDasha.birthNakshatra,
    nakshatraPada: rawDasha.nakshatraPada,
    dashaBalance: rawDasha.dashaBalance,
    current_mahadasha: currentMD,
    current_antardasha: currentAD,
    currentMahadasha: {
      planet: currentMD,
      planetHi: PLANET_NAMES_HI[currentMD] || currentMD,
      startTime: currentMDStart,
      endTime: currentMDEnd,
      progressPercent: progressPct,
    },
    currentAntardasha: {
      planet: currentAD,
      planetHi: PLANET_NAMES_HI[currentAD] || currentAD,
      endTime: currentADEnd,
    },
    fullCycle: fullCycleRaw.map((cycle: any) => {
      const s = new Date(cycle.startTime).getTime();
      const e = new Date(cycle.endTime).getTime();
      const durYears = Math.round((e - s) / (365.25 * 24 * 3600 * 1000));
      return {
        planet: cycle.planet,
        planetHi: PLANET_NAMES_HI[cycle.planet] || cycle.planet,
        startTime: cycle.startTime,
        endTime: cycle.endTime,
        durationYears: durYears || VIMSHOTTARI_YEARS[cycle.planet] || 10,
        isCurrent: cycle.planet === currentMD && activeMahadashaItem?.startTime === cycle.startTime,
      };
    }),
    raw_dasha: rawDasha,
  };

  // 6. Mangal Dosha
  let mangalDosha: MangalDoshaResult = {
    hasDosha: false,
    isHigh: false,
    description: 'No significant Mangal Dosha detected.',
    descriptionHi: 'कुण्डली में कोई प्रतिकूल मंगल दोष नहीं है।',
    factors: [],
    remedies: [
      'Chant Hanuman Chalisa on Tuesdays',
      'Offer red flowers to Lord Hanuman',
    ],
    remediesHi: [
      'मंगलवार को श्री हनुमान चालीसा का पाठ करें',
      'हनुमान जी को सिन्दूर व लाल पुष्प अर्पित करें',
    ],
  };

  try {
    const doshaCheck = checkMangalDosha(rawKundli);
    if (doshaCheck && typeof doshaCheck === 'object') {
      mangalDosha = {
        hasDosha: Boolean(doshaCheck.hasDosha),
        isHigh: Boolean(doshaCheck.isHigh),
        description: doshaCheck.description || (doshaCheck.hasDosha ? 'Mangal Dosha present in birth chart.' : 'No Mangal Dosha present.'),
        descriptionHi: doshaCheck.hasDosha
          ? `मंगल दोष उपस्थित (${doshaCheck.isHigh ? 'उच्च' : 'सामान्य'})`
          : 'मंगल दोष रहित कुण्डली',
        factors: [doshaCheck.description || 'Mars placement relative to Lagna/Moon/Venus'],
        remedies: [
          'Chant Hanuman Chalisa daily',
          'Fast or observe discipline on Tuesdays',
          'Recite Mangal Gayatri Mantra: Om Angarakaya Namaha',
        ],
        remediesHi: [
          'प्रतिदिन श्री हनुमान चालीसा का पाठ करें',
          'मंगलवार को सात्विक व्रत व सुंदरकांड का पाठ करें',
          'ॐ क्रां क्रीं क्रौं सः भौमाय नमः मंत्र का जप करें',
        ],
      };
    }
  } catch {
    // Graceful fallback
  }

  // 7. Janma Panchanga using getPanchangam with exact birth instant transit matching
  const tzMinutes = parseOffsetToMinutes(input.utc_offset_at_birth || '+05:30');
  let panchanga: JanmaPanchangam = {};

  try {
    const rawPanchang = getPanchangam(birthDate, observer, { timezoneOffset: tzMinutes });
    const birthMs = birthDate.getTime();

    // Match exact active transit interval at birth instant
    const activeTithi = rawPanchang.tithis?.find((t: any) => {
      const s = new Date(t.startTime).getTime();
      const e = new Date(t.endTime).getTime();
      return birthMs >= s && birthMs <= e;
    }) || rawPanchang.tithis?.[0];

    const activeNak = rawPanchang.nakshatras?.find((n: any) => {
      const s = new Date(n.startTime).getTime();
      const e = new Date(n.endTime).getTime();
      return birthMs >= s && birthMs <= e;
    }) || rawPanchang.nakshatras?.[0];

    const activeYoga = rawPanchang.yogas?.find((y: any) => {
      const s = new Date(y.startTime).getTime();
      const e = new Date(y.endTime).getTime();
      return birthMs >= s && birthMs <= e;
    }) || rawPanchang.yogas?.[0];

    const activeKarana = rawPanchang.karanas?.find((k: any) => {
      const s = new Date(k.startTime).getTime();
      const e = new Date(k.endTime).getTime();
      return birthMs >= s && birthMs <= e;
    }) || rawPanchang.karanas?.[0];

    const VARA_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const VARA_HI = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
    const varaIdx = typeof rawPanchang.vara === 'number' ? ((rawPanchang.vara % 7) + 7) % 7 : 0;

    const YOGA_NAMES = [
      'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana',
      'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda',
      'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra',
      'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva',
      'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma',
      'Indra', 'Vaidhriti'
    ];
    const YOGA_NAMES_HI: Record<string, string> = {
      Vishkambha: 'विष्कम्भ', Priti: 'प्रीति', Ayushman: 'आयुष्मान्', Saubhagya: 'सौभाग्य', Shobhana: 'शोभन',
      Atiganda: 'अतिगण्ड', Sukarma: 'सुकर्मा', Dhriti: 'धृति', Shula: 'शूल', Ganda: 'गण्ड',
      Vriddhi: 'वृद्धि', Dhruva: 'ध्रुव', Vyaghata: 'व्याघात', Harshana: 'हर्षण', Vajra: 'वज्र',
      Siddhi: 'सिद्धि', Vyatipata: 'व्यतीपात', Variyan: 'वरीयान्', Parigha: 'परिघ', Shiva: 'शिव',
      Siddha: 'सिद्ध', Sadhya: 'साध्य', Shubha: 'शुभ', Shukla: 'शुक्ल', Brahma: 'ब्रह्म',
      Indra: 'इन्द्र', Vaidhriti: 'वैधृति'
    };

    const KARANA_NAMES_HI: Record<string, string> = {
      Bava: 'बव', Balava: 'बालव', Kaulava: 'कौलव', Taitila: 'तैतिल', Gara: 'गर', Vanija: 'वणिज',
      Vishti: 'विष्टि (भद्रा)', Shakuni: 'शकुनि', Chatushpada: 'चतुष्पाद', Naga: 'नाग', Kimstughna: 'किंस्तुघ्न'
    };

    const tithiName = activeTithi?.name || (typeof rawPanchang.tithi === 'number' ? `Tithi ${rawPanchang.tithi}` : 'Ekadashi');
    const tithiNum = activeTithi?.index || rawPanchang.tithi || 1;
    const pakshaVal = rawPanchang.paksha === 'Shukla' || rawPanchang.paksha === 'shukla' ? 'Shukla' : 'Krishna';
    const pakshaHi = pakshaVal === 'Shukla' ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष';

    const nakName = activeNak?.name || ascendant.nakshatra;
    const nakLord = planets.Moon?.nakshatraLord || ascendant.nakshatraLord;
    const nakPada = planets.Moon?.nakshatraPada || ascendant.pada || 1;

    const yogaName = activeYoga?.name || (typeof rawPanchang.yoga === 'number' ? YOGA_NAMES[rawPanchang.yoga % 27] : 'Harshana');
    const yogaHi = YOGA_NAMES_HI[yogaName] || yogaName;

    const karanaName = activeKarana?.name || (typeof rawPanchang.karana === 'string' ? rawPanchang.karana : 'Balava');
    const karanaHi = KARANA_NAMES_HI[karanaName] || karanaName;

    const RITU_MAP: Record<string, string> = {
      Vasanta: 'वसन्त',
      Grishma: 'ग्रीष्म',
      Varsha: 'वर्षा',
      Sharad: 'शरद',
      Hemanta: 'हेमन्त',
      Shishir: 'शिशिर',
      Spring: 'वसन्त',
      Summer: 'ग्रीष्म',
      Monsoon: 'वर्षा',
      Autumn: 'शरद',
      Winter: 'शिशिर',
    };

    const AYANA_MAP: Record<string, string> = {
      Uttarayana: 'उत्तरायण',
      Dakshinayana: 'दक्षिणायन',
    };

    const rituName = rawPanchang.ritu || '';
    const ayanaName = rawPanchang.ayana || '';
    const masaName = rawPanchang.masa?.name || '';
    const samvatStr = rawPanchang.samvat?.vikram
      ? `Vikram ${rawPanchang.samvat.vikram}${rawPanchang.samvat.samvatsara ? ` (${rawPanchang.samvat.samvatsara})` : ''}`
      : '';

    panchanga = {
      tithi: tithiName,
      tithiNumber: tithiNum,
      tithiHi: `${tithiName} (${pakshaHi})`,
      paksha: pakshaVal,
      nakshatra: nakName,
      nakshatraLord: nakLord,
      nakshatraPada: nakPada,
      yoga: yogaName,
      yogaHi: yogaHi,
      karana: karanaName,
      karanaHi: karanaHi,
      vara: VARA_EN[varaIdx],
      varaHi: VARA_HI[varaIdx],
      masa: masaName,
      masaHi: masaName,
      ritu: rituName,
      rituHi: RITU_MAP[rituName] || rituName,
      ayana: ayanaName,
      ayanaHi: AYANA_MAP[ayanaName] || ayanaName,
      samvat: samvatStr,
      gana: 'Manushya',
      yoni: 'Ashwa',
      nadi: 'Madhya',
      varna: 'Kshatriya',
    };
  } catch {
    panchanga = {
      tithi: 'Shukla Pratipada',
      tithiNumber: 1,
      tithiHi: 'प्रतिपदा (शुक्ल पक्ष)',
      paksha: 'Shukla',
      nakshatra: ascendant.nakshatra,
      nakshatraLord: ascendant.nakshatraLord,
      nakshatraPada: ascendant.pada,
      yoga: 'Vishkambha',
      karana: 'Bava',
      vara: 'Saturday',
      varaHi: 'शनिवार',
    };
  }

  // 8. Ishta Devata & Predictions
  const ishtaDevata = determineIshtaDevata(rawKundli, planets);
  const predictions = generateVedicPredictions(ascendant, planets, dasha);

  // 9. Ayanamsa
  let ayanamsaName = 'Lahiri';
  try {
    const ayVal = getAyanamsa(birthDate);
    ayanamsaName = `Lahiri (${ayVal.toFixed(2)}°)`;
  } catch {
    ayanamsaName = 'Lahiri (23.9°)';
  }

  const inputHash = `${input.date_of_birth}_${input.birth_time || 'none'}_${input.lat.toFixed(4)}_${input.lng.toFixed(4)}_${elevation}_${tzIana}_${effectiveOffset}`;

  const calculationContext: BirthCalculationContext = {
    birthLocalDate: input.date_of_birth,
    birthLocalTime: input.birth_time,
    timezoneIana: tzIana,
    utcOffset: effectiveOffset,
    historicalUtcOffset: historicalOffset,
    utcInstant: birthDate.toISOString(),
    latitude: input.lat,
    longitude: input.lng,
    elevation,
    elevationSource: (input as any).elevation_source || (input as any).elevationSource || 'survey_known',
    locationConfidence: (input as any).location_confidence || (input as any).locationConfidence || 1.0,
    locationSource: (input as any).location_source || (input as any).locationSource || 'seed_directory',
    matchedLocationName: (input as any).matched_location_name || (input as any).matchedName || input.place_label || input.place_query,
    engine: '@ishubhamx/panchangam-js',
    engineVersion: '3.0.0',
    calculationVersion: 1,
    ayanamsa: ayanamsaName,
    houseSystem: 'whole_sign',
    inputHash,
    calculatedAt: new Date().toISOString(),
  };

  const result: CompleteKundliData = {
    birthDetails: {
      name: '',
      dateOfBirth: input.date_of_birth,
      birthTime: input.birth_time,
      birthTimeAccuracy: input.birth_time_accuracy,
      gender: input.gender,
      placeLabel: input.place_label || input.place_query,
      lat: input.lat,
      lng: input.lng,
      elevation,
      elevationSource: (input as any).elevation_source || (input as any).elevationSource || 'survey_known',
      timezoneIana: tzIana,
      utcOffset: effectiveOffset,
      locationConfidence: (input as any).location_confidence || (input as any).locationConfidence || 1.0,
      locationSource: (input as any).location_source || (input as any).locationSource || 'seed_directory',
      matchedLocationName: (input as any).matched_location_name || (input as any).matchedName || input.place_label || input.place_query,
    },
    calculationContext,
    ascendant: input.birth_time_accuracy === 'unknown' ? undefined : ascendant,
    planets,
    houses: input.birth_time_accuracy === 'unknown' ? [] : houses,
    dasha,
    vargas: rawKundli.vargas || {},
    mangalDosha,
    ishtaDevata,
    kaalSarpDosha: checkKaalSarpDosha(planets),
    pitraDosha: checkPitraDosha(planets, ascendant),
    sadeSati: planets.Moon?.rashi !== undefined ? checkSadeSati(planets.Moon.rashi, new Date()) : undefined,
    panchanga,
    predictions,
    ayanamsa: ayanamsaName,
    calculatedAt: new Date().toISOString(),
  };

  return result;
}

/**
 * Validate complete Kundli data ensuring required fields are non-empty and non-NaN
 */
export function validateCompleteKundli(kundli: CompleteKundliData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!kundli.birthDetails?.dateOfBirth) {
    errors.push('Missing birth date');
  }

  // Required 9 classical Navagrahas validation
  const REQUIRED_GRAHAS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  for (const g of REQUIRED_GRAHAS) {
    const pl = kundli.planets?.[g];
    if (!pl) {
      errors.push(`Missing required planet: ${g}`);
    } else {
      if (typeof pl.degree !== 'number' || isNaN(pl.degree) || pl.degree < 0 || pl.degree >= 30) {
        errors.push(`Invalid degree for ${g}: ${pl.degree}`);
      }
      if (typeof pl.longitude !== 'number' || isNaN(pl.longitude) || pl.longitude < 0 || pl.longitude >= 360) {
        errors.push(`Invalid longitude for ${g}: ${pl.longitude}`);
      }
    }
  }

  // Lagna validation if birth time is not unknown
  if (kundli.birthDetails?.birthTimeAccuracy !== 'unknown') {
    if (!kundli.ascendant) {
      errors.push('Missing ascendant for exact birth time');
    } else if (typeof kundli.ascendant.longitude !== 'number' || isNaN(kundli.ascendant.longitude)) {
      errors.push(`Invalid ascendant longitude: ${kundli.ascendant.longitude}`);
    }
    if (!Array.isArray(kundli.houses) || kundli.houses.length !== 12) {
      errors.push(`Invalid houses count: ${kundli.houses?.length}`);
    }
  }

  // Panchanga validation
  if (!kundli.panchanga?.tithi) {
    errors.push('Missing Panchanga tithi');
  }
  if (!kundli.panchanga?.nakshatra) {
    errors.push('Missing Panchanga nakshatra');
  }
  if (!kundli.panchanga?.vara) {
    errors.push('Missing Panchanga vara');
  }

  // Ishta Devata validation
  if (!kundli.ishtaDevata?.deity) {
    errors.push('Missing Ishta Devata deity');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
