import type { CompleteKundliData, NormalizedPlanet } from './types';

export interface GuruJiMantraCard {
  mantra: string;
  mantraHi?: string;
  transliteration?: string;
  deity: string;
  deityHi?: string;
  repetitions: number;
  timing: string;
  timingHi: string;
  japaSlug?: string;
}

export interface GuruJiBhajanRec {
  title: string;
  deityName: string;
  searchQuery: string;
}

export interface GuruJiResponse {
  reply: string;
  domain: string;
  mantraCard?: GuruJiMantraCard;
  bhajanRec?: GuruJiBhajanRec;
  followUps: string[];
}

const VEDIC_PLANET_NAMES_HI: Record<string, string> = {
  Sun: 'सूर्य देव',
  Moon: 'चन्द्र देव',
  Mars: 'मंगल देव',
  Mercury: 'बुध देव',
  Jupiter: 'बृहस्पति (गुरु देव)',
  Venus: 'शुक्र देव',
  Saturn: 'शनि देव',
  Rahu: 'राहु',
  Ketu: 'केतु',
};

/**
 * Intelligent Vedic Astrological Synthesizer for Guru Ji AI
 * Synthesizes user query with authentic Canonical CompleteKundliData.
 */
export function generateGuruJiResponse(
  query: string,
  kundli: CompleteKundliData | null,
  isHi: boolean
): GuruJiResponse {
  const lower = query.toLowerCase().trim();

  // If no Kundli data is present, provide gentle onboarding guidance
  if (!kundli) {
    if (isHi) {
      return {
        reply: `🙏 नमो नारायण! आपकी जन्म कुण्डली का विवरण अभी लोड नहीं हुआ है।\n\nसटीक एवं व्यक्तिगत वैदिक मार्गदर्शन (करियर, दशा, इष्ट देव, विवाह व स्वास्थ्य) प्राप्त करने के लिए कृपया पहले अपना जन्म विवरण (तिथि, समय व स्थान) दर्ज करें।`,
        domain: 'ONBOARDING',
        mantraCard: {
          mantra: 'ॐ गं गणपतये नमः',
          mantraHi: 'ॐ गं गणपतये नमः',
          transliteration: 'Om Gam Ganapataye Namaha',
          deity: 'Lord Ganesha',
          deityHi: 'श्री गणेश',
          repetitions: 108,
          timing: 'Morning during Brahma Muhurta',
          timingHi: 'प्रातःकाल ब्रह्म मुहूर्त में',
          japaSlug: 'shri-ganesha-mantra',
        },
        bhajanRec: {
          title: 'Jai Ganesh Deva',
          deityName: 'Ganesh',
          searchQuery: 'Ganesh Aarti',
        },
        followUps: [
          'जन्म विवरण कैसे भरें?',
          'इष्ट देव के बारे में बताएं',
          'दैनिक मंत्र साधना क्या है?',
        ],
      };
    }
    return {
      reply: `🙏 Namo Narayana! Your birth chart data is not yet linked.\n\nTo receive precise, personalized Vedic astrological guidance on your career, active Mahadasha, Ishta Devata, and remedies, please complete your birth profile.`,
      domain: 'ONBOARDING',
      mantraCard: {
        mantra: 'ॐ गं गणपतये नमः',
        mantraHi: 'ॐ गं गणपतये नमः',
        transliteration: 'Om Gam Ganapataye Namaha',
        deity: 'Lord Ganesha',
        deityHi: 'श्री गणेश',
        repetitions: 108,
        timing: 'Morning during Brahma Muhurta',
        timingHi: 'प्रातःकाल ब्रह्म मुहूर्त में',
        japaSlug: 'shri-ganesha-mantra',
      },
      bhajanRec: {
        title: 'Jai Ganesh Deva',
        deityName: 'Ganesh',
        searchQuery: 'Ganesh Aarti',
      },
      followUps: [
        'How to set up my birth profile?',
        'Tell me about Ishta Devata',
        'What is daily mantra chanting?',
      ],
    };
  }

  // Extract Canonical Astrological Anchors
  const hasExactTime = kundli.birthDetails?.birthTimeAccuracy !== 'unknown';
  const lagnaName = kundli.ascendant?.rashiName || 'Ascendant';
  const lagnaNameHi = kundli.ascendant?.rashiNameHi || 'लग्न';
  const lagnaLord = kundli.ascendant?.lord || 'Jupiter';
  const lagnaLordHi = kundli.ascendant?.lordHi || VEDIC_PLANET_NAMES_HI[lagnaLord] || lagnaLord;

  const moonSign = kundli.planets.Moon?.sign || 'Moon Sign';
  const moonSignHi = kundli.planets.Moon?.rashiNameHindi || 'चन्द्र राशि';
  const nakshatra = kundli.planets.Moon?.nakshatra || kundli.panchanga?.nakshatra || 'Nakshatra';
  const nakPada = kundli.planets.Moon?.nakshatraPada || 1;
  const nakLord = kundli.planets.Moon?.nakshatraLord || 'Ketu';

  const sunSign = kundli.planets.Sun?.sign || 'Sun Sign';
  const sunSignHi = kundli.planets.Sun?.rashiNameHindi || 'सूर्य राशि';

  const ishta = kundli.ishtaDevata?.deity || 'Lord Rama';
  const ishtaHi = kundli.ishtaDevata?.deityHi || 'प्रभु श्री राम';
  const ishtaMantra = kundli.ishtaDevata?.mantra || 'ॐ रां रामाय नमः';
  const ishtaBhajan = kundli.ishtaDevata?.recommendedBhajanQuery || 'Hanuman Chalisa';
  const atmakaraka = kundli.ishtaDevata?.atmakaraka || 'Sun';
  const karakamsha = kundli.ishtaDevata?.karakamshaRashiName || 'Navamsha';

  const currentMD = kundli.dasha?.currentMahadasha?.planet || kundli.dasha?.current_mahadasha || 'Jupiter';
  const currentMDHi = kundli.dasha?.currentMahadasha?.planetHi || VEDIC_PLANET_NAMES_HI[currentMD] || currentMD;
  const currentAD = kundli.dasha?.currentAntardasha?.planet || kundli.dasha?.current_antardasha || 'Saturn';
  const currentADHi = kundli.dasha?.currentAntardasha?.planetHi || VEDIC_PLANET_NAMES_HI[currentAD] || currentAD;
  const dashaEnd = kundli.dasha?.currentMahadasha?.endTime
    ? new Date(kundli.dasha.currentMahadasha.endTime).getFullYear()
    : 2030;

  const hasMangal = Boolean(kundli.mangalDosha?.hasDosha);
  const isHighMangal = Boolean(kundli.mangalDosha?.isHigh);

  // Identify 10th House (Career) and 7th House (Partnership) planets
  const tenthHouse = kundli.houses?.find((h) => h.houseNumber === 10);
  const tenthHouseLord = tenthHouse?.signLord || 'Mercury';
  const tenthHouseLordHi = VEDIC_PLANET_NAMES_HI[tenthHouseLord] || tenthHouseLord;
  const tenthHousePlanets = tenthHouse?.planets || [];

  const seventhHouse = kundli.houses?.find((h) => h.houseNumber === 7);
  const seventhHouseLord = seventhHouse?.signLord || 'Venus';
  const seventhHouseLordHi = VEDIC_PLANET_NAMES_HI[seventhHouseLord] || seventhHouseLord;

  // ── 1. CAREER & PROFESSION ──────────────────────────────────────────────────
  if (
    lower.includes('career') || lower.includes('job') || lower.includes('work') ||
    lower.includes('business') || lower.includes('profession') || lower.includes('करियर') ||
    lower.includes('नौकरी') || lower.includes('व्यापार') || lower.includes('रोजगार') ||
    lower.includes('काम') || lower.includes('पदोन्नति') || lower.includes('प्रमोशन')
  ) {
    const planetsIn10th = tenthHousePlanets.length > 0
      ? (isHi ? `दशम कर्म भाव में ${tenthHousePlanets.map((p) => VEDIC_PLANET_NAMES_HI[p] || p).join(', ')} की उपस्थिति` : `Presence of ${tenthHousePlanets.join(', ')} in the 10th house`)
      : (isHi ? `दशम भाव के स्वामी ${tenthHouseLordHi}` : `10th house lord ${tenthHouseLord}`);

    if (isHi) {
      return {
        reply: `शुभम्! वैदिक ज्योतिष के अनुसार कर्म क्षेत्र का विचार दशम भाव एवं सूर्य से किया जाता है।\n\n` +
          `• **लग्न एवं राशि स्थिति**: आपकी कुण्डली में ${hasExactTime ? `${lagnaNameHi} लग्न एवं ` : ''}${moonSignHi} चन्द्र राशि (${nakshatra} नक्षत्र) है। यह संयोजन आपको कर्मठ और व्यावहारिक बुद्धि प्रदान करता है।\n` +
          `• **दशम कर्म भाव विचार**: ${planetsIn10th} यह संकेत करता है कि आपकी आजीविका में योजनाबद्ध परिश्रम और धैर्य से निरंतर उन्नति के योग हैं।\n` +
          `• **सक्रिय विंशोत्तरी दशा प्रभाव**: वर्तमान में आप **${currentMDHi} महादशा** के अंतर्गत **${currentADHi} अंतर्दशा** के प्रभाव में हैं। यह समयावधि व्यावसायिक कौशल निखारने और नई जिम्मेदारियों को स्वीकार करने के लिए अत्यंत अनुकूल है।\n\n` +
          `**कल्याणकारी उपाय**:\n` +
          `१. प्रतिदिन प्रातःकाल ताम्बे के पात्र से सूर्य देव को अर्घ्य दें।\n` +
          `२. श्री विष्णु सहस्रनाम या 'ॐ नमो भगवते वासुदेवाय' का नियमित जप करें।`,
        domain: 'CAREER',
        mantraCard: {
          mantra: 'ॐ नमो भगवते वासुदेवाय',
          mantraHi: 'ॐ नमो भगवते वासुदेवाय',
          transliteration: 'Om Namo Bhagavate Vasudevaya',
          deity: 'Lord Vishnu',
          deityHi: 'भगवान श्री विष्णु',
          repetitions: 108,
          timing: 'Morning after bathing',
          timingHi: 'प्रातःकाल स्नानोपरांत',
          japaSlug: 'om-namo-narayanaya',
        },
        bhajanRec: {
          title: 'Achyutam Keshavam',
          deityName: 'Krishna',
          searchQuery: 'Achyutam Keshavam',
        },
        followUps: [
          'नौकरी या व्यापार, मेरे लिए क्या उत्तम है?',
          'दशम भाव के स्वामी का क्या फल है?',
          'करियर में पदोन्नति के उपाय बताएं',
        ],
      };
    }

    return {
      reply: `Blessings! In Vedic astrology, professional trajectory is governed by the 10th House (Karmasthana) and Surya Dev (natural Karaka of authority).\n\n` +
        `• **Ascendant & Moon Configuration**: Your chart anchors in ${hasExactTime ? `${lagnaName} Ascendant and ` : ''}${moonSign} Moon (${nakshatra} Nakshatra), endowing you with strong focus and strategic execution.\n` +
        `• **10th House karmic influence**: ${planetsIn10th} points to solid growth through structured discipline and integrity.\n` +
        `• **Active Vimshottari Dasha**: You are currently operating under **${currentMD} Mahadasha** and **${currentAD} Antardasha**. This cycle fosters constructive professional opportunities and skill consolidation.\n\n` +
        `**Recommended Vedic Remedies**:\n` +
        `1. Offer Surya Arghya (water in a copper vessel) at sunrise.\n` +
        `2. Chant the sacred Vishnu mantra daily for clarity and career stability.`,
      domain: 'CAREER',
      mantraCard: {
        mantra: 'ॐ नमो भगवते वासुदेवाय',
        mantraHi: 'ॐ नमो भगवते वासुदेवाय',
        transliteration: 'Om Namo Bhagavate Vasudevaya',
        deity: 'Lord Vishnu',
        deityHi: 'भगवान श्री विष्णु',
        repetitions: 108,
        timing: 'Morning after bathing',
        timingHi: 'प्रातःकाल स्नानोपरांत',
        japaSlug: 'om-namo-narayanaya',
      },
      bhajanRec: {
        title: 'Achyutam Keshavam',
        deityName: 'Krishna',
        searchQuery: 'Achyutam Keshavam',
      },
      followUps: [
        'Job or business: which suits my chart?',
        'How does my 10th house lord impact success?',
        'Vedic remedies for career growth',
      ],
    };
  }

  // ── 2. ISHTA DEVATA & SPIRITUAL SADHANA ─────────────────────────────────────
  if (
    lower.includes('ishta') || lower.includes('deity') || lower.includes('god') ||
    lower.includes('mantra') || lower.includes('sadhana') || lower.includes('pooja') ||
    lower.includes('puja') || lower.includes('इष्ट') || lower.includes('मंत्र') ||
    lower.includes('साधना') || lower.includes('पूजा') || lower.includes('भगवान') ||
    lower.includes('देवता') || lower.includes('आराधना')
  ) {
    if (isHi) {
      return {
        reply: `कल्याणमस्तु! महर्षि जैमिनी के 'वृहत् पराशर होरा शास्त्र' के शास्त्रीय कारकांश सिद्धांत के अनुसार:\n\n` +
          `• **आत्मकारक ग्रह**: आपकी कुण्डली में सर्वाधिक अंशों वाले ग्रह **${VEDIC_PLANET_NAMES_HI[atmakaraka] || atmakaraka}** आत्मकारक हैं।\n` +
          `• **नवमांश (D9) कारकांश**: आत्मकारक नवमांश चक्र में **${karakamsha}** राशि में स्थित हैं, जिसके द्वादश (12वें) भाव के शुभ प्रभाव से आपके अभीष्ट इष्ट देव **${ishtaHi}** निर्दिष्ट होते हैं।\n` +
          `• **सिद्धिदायक मंत्र साधना**: नित्य प्रातः शुद्ध आसन पर बैठकर 108 बार अपने इष्ट मंत्र का जप करें। यह साधना मन के विक्षेपों को शांत कर जीवन में आत्मिक तेज और सकारात्मक ऊर्जा का संचार करती है।`,
        domain: 'ISHTA_DEVATA',
        mantraCard: {
          mantra: ishtaMantra,
          mantraHi: ishtaMantra,
          transliteration: ishtaMantra,
          deity: ishta,
          deityHi: ishtaHi,
          repetitions: 108,
          timing: 'Morning during Brahma Muhurta or Sandhya',
          timingHi: 'प्रातःकाल ब्रह्म मुहूर्त अथवा संध्या काल',
          japaSlug: ishta.toLowerCase().includes('shiva') ? 'om-namah-shivaya' : ishta.toLowerCase().includes('krishna') ? 'hare-krishna-mahamantra' : 'jai-shree-ram',
        },
        bhajanRec: {
          title: `${ishtaHi} भजन एवं संकीर्तन`,
          deityName: ishta,
          searchQuery: ishtaBhajan,
        },
        followUps: [
          'इष्ट मंत्र जप की सही विधि क्या है?',
          '१०८ जप के क्या नियम हैं?',
          'दैनिक पूजा का समय क्या होना चाहिए?',
        ],
      };
    }

    return {
      reply: `Blessings! According to the classical Jaimini Karakamsha tradition from Maharishi Parashara's *Brihat Parashara Hora Shastra*:\n\n` +
        `• **Atmakaraka Planet**: In your chart, **${atmakaraka}** holds the highest planetary longitude as your Atmakaraka (soul significator).\n` +
        `• **D9 Navamsha Karakamsha**: The Atmakaraka occupies **${karakamsha}** in the Navamsha chart. The 12th house of spiritual liberation (Moksha) from Karakamsha indicates your favorable Ishta Devata as **${ishta}**.\n` +
        `• **Sacred Mantra Practice**: Dedicated chanting of your Ishta mantra (108 repetitions daily) harmonizes consciousness, awakens inner peace, and aligns you with divine grace.`,
      domain: 'ISHTA_DEVATA',
      mantraCard: {
        mantra: ishtaMantra,
        mantraHi: ishtaMantra,
        transliteration: ishtaMantra,
        deity: ishta,
        deityHi: ishtaHi,
        repetitions: 108,
        timing: 'Morning during Brahma Muhurta or Sandhya',
        timingHi: 'प्रातःकाल ब्रह्म मुहूर्त अथवा संध्या काल',
        japaSlug: ishta.toLowerCase().includes('shiva') ? 'om-namah-shivaya' : ishta.toLowerCase().includes('krishna') ? 'hare-krishna-mahamantra' : 'jai-shree-ram',
      },
      bhajanRec: {
        title: `${ishta} Sacred Hymns & Bhajans`,
        deityName: ishta,
        searchQuery: ishtaBhajan,
      },
      followUps: [
        'What are the rules for 108 Japa chanting?',
        'Best time of day for Ishta Devata puja?',
        'How to cultivate deeper spiritual focus?',
      ],
    };
  }

  // ── 3. VIMSHOTTARI DASHA & TIMING ──────────────────────────────────────────
  if (
    lower.includes('dasha') || lower.includes('mahadasha') || lower.includes('antardasha') ||
    lower.includes('timing') || lower.includes('period') || lower.includes('दशा') ||
    lower.includes('महादशा') || lower.includes('अंतर्दशा') || lower.includes('समय') ||
    lower.includes('काल') || lower.includes('ग्रह प्रभाव')
  ) {
    if (isHi) {
      return {
        reply: `शुभम्! वैदिक विंशोत्तरी दशा पद्धति जीवन के समयानुसार ग्रह प्रभावों का सटीक दर्पण है:\n\n` +
          `• **सक्रिय महादशा**: वर्तमान समय में आप **${currentMDHi} महादशा** के प्रभाव में हैं (सक्रिय वर्ष ~${dashaEnd} तक)।\n` +
          `• **सक्रिय अंतर्दशा**: इसके अंतर्गत उप-काल **${currentADHi} अंतर्दशा** का चल रहा है।\n` +
          `• **चन्द्र नक्षत्र आधार**: आपका जन्म **${nakshatra} नक्षत्र (चरण ${nakPada})** में हुआ है, जिसके स्वामी **${VEDIC_PLANET_NAMES_HI[nakLord] || nakLord}** हैं।\n\n` +
          `**समय चक्र का सदुपयोग**:\n` +
          `यह समयावधि धैर्यपूर्वक आत्म-विकास, विवेकपूर्ण निर्णयों और आध्यात्मिक साधना के लिए श्रेष्ठ है। जल्दबाजी अथवा संशय से बचें। प्रतिदिन भगवान शिव का पंचाक्षर मंत्र जपें।`,
        domain: 'DASHA_TIMING',
        mantraCard: {
          mantra: 'ॐ नमः शिवाय',
          mantraHi: 'ॐ नमः शिवाय',
          transliteration: 'Om Namah Shivaya',
          deity: 'Lord Shiva',
          deityHi: 'भगवान शिव',
          repetitions: 108,
          timing: 'Morning or Evening',
          timingHi: 'प्रातः अथवा संध्या समय',
          japaSlug: 'om-namah-shivaya',
        },
        bhajanRec: {
          title: 'Shiv Tandav Stotram',
          deityName: 'Shiva',
          searchQuery: 'Shiv Tandav Stotram',
        },
        followUps: [
          'अगली महादशा कब प्रारंभ होगी?',
          'वर्तमान अंतर्दशा के क्या लाभ हैं?',
          'महादशा शांति के वैदिक उपाय',
        ],
      };
    }

    return {
      reply: `Blessings! In the 120-year Vimshottari Dasha system, planetary cycles unfold according to your natal Moon placement:\n\n` +
        `• **Current Mahadasha**: You are currently experiencing the major period of **${currentMD} Mahadasha** (active until ~${dashaEnd}).\n` +
        `• **Current Antardasha**: The active sub-period is **${currentAD} Antardasha**.\n` +
        `• **Birth Nakshatra Foundation**: Born under **${nakshatra} Nakshatra (Pada ${nakPada})** ruled by **${nakLord}**, your consciousness is tuned for deep learning and steady resilience.\n\n` +
        `**Timing Guidance**:\n` +
        `This phase favors balanced deliberation, long-term investments of effort, and devotional grounding. Chanting the sacred Shiva Panchakshara mantra maintains serenity.`,
      domain: 'DASHA_TIMING',
      mantraCard: {
        mantra: 'ॐ नमः शिवाय',
        mantraHi: 'ॐ नमः शिवाय',
        transliteration: 'Om Namah Shivaya',
        deity: 'Lord Shiva',
        deityHi: 'भगवान शिव',
        repetitions: 108,
        timing: 'Morning or Evening',
        timingHi: 'प्रातः अथवा संध्या समय',
        japaSlug: 'om-namah-shivaya',
      },
      bhajanRec: {
        title: 'Shiv Tandav Stotram',
        deityName: 'Shiva',
        searchQuery: 'Shiv Tandav Stotram',
      },
      followUps: [
        'When does my next Mahadasha start?',
        'How to harmonize active Antardasha?',
        'Remedies for planetary transitions',
      ],
    };
  }

  // ── 4. MARRIAGE & RELATIONSHIPS ───────────────────────────────────────────
  if (
    lower.includes('marriage') || lower.includes('relationship') || lower.includes('spouse') ||
    lower.includes('partner') || lower.includes('love') || lower.includes('विवाह') ||
    lower.includes('शादी') || lower.includes('दांपत्य') || lower.includes('संबंध') ||
    lower.includes('पति') || lower.includes('पत्नी') || lower.includes('सगाई')
  ) {
    const mangalDetailHi = hasMangal
      ? (isHighMangal
          ? 'कुण्डली में उच्च मंगल योग है, अतः मंगलवार को हनुमान चालीसा का पाठ और सुंदरकांड श्रवण से शांति मिलती है।'
          : 'कुण्डली में सामान्य मंगल प्रभाव है, जो परस्पर संवाद और आदर से पूर्णतः संतुलित रहता है।')
      : 'आपकी जन्म कुण्डली में कोई प्रतिकूल मंगल दोष नहीं है। दांपत्य जीवन में परस्पर आदर और सामंजस्य रहेगा।';

    const mangalDetailEn = hasMangal
      ? (isHighMangal
          ? 'Your chart exhibits Kuja (Mangal) influence, easily pacified by regular recitation of Sri Hanuman Chalisa on Tuesdays.'
          : 'Your chart has mild Martian placement, naturally balanced through open communication and mutual respect.')
      : 'Your horoscope is free from adverse Mangal Dosha, reflecting harmonious relational foundations.';

    if (isHi) {
      return {
        reply: `शुभम्! दांपत्य एवं वैवाहिक जीवन का विश्लेषण सप्तम भाव, सप्तमेश एवं शुक्र/गुरु से किया जाता है:\n\n` +
          `• **सप्तम भाव व स्वामी**: सप्तम भाव के स्वामी **${seventhHouseLordHi}** दांपत्य में परस्पर समझ और सद्भाव का कारक हैं।\n` +
          `• **मंगल दोष स्थिति**: ${mangalDetailHi}\n` +
          `• **सद्भाव हेतु वैदिक नियम**: वैवाहिक जीवन में मधुरता बनाए रखने के लिए शुक्रवार को माँ महालक्ष्मी की आराधना करें और घर में दीप प्रज्वलित करें।`,
        domain: 'MARRIAGE',
        mantraCard: {
          mantra: 'ॐ श्रीं महालक्ष्म्यै नमः',
          mantraHi: 'ॐ श्रीं महालक्ष्म्यै नमः',
          transliteration: 'Om Shreem Mahalakshmyai Namah',
          deity: 'Goddess Lakshmi',
          deityHi: 'माँ महालक्ष्मी',
          repetitions: 108,
          timing: 'Friday Evening',
          timingHi: 'शुक्रवार संध्या काल',
          japaSlug: 'radhe-radhe',
        },
        bhajanRec: {
          title: 'Om Jai Lakshmi Mata',
          deityName: 'Lakshmi',
          searchQuery: 'Om Jai Lakshmi Mata',
        },
        followUps: [
          'सप्तम भाव का स्वामी क्या संकेत देता है?',
          'मंगल दोष निवारण के उपाय बताएं',
          'दांपत्य सुख के लिए शुक्रवार की पूजा',
        ],
      };
    }

    return {
      reply: `Blessings! In Vedic astrology, marital harmony is examined through the 7th House (Kalatrasthana), its ruler, and natural Karakas Venus/Jupiter:\n\n` +
        `• **7th House & Ruler**: Governed by **${seventhHouseLord}**, highlighting emotional maturity and transparent communication as keys to enduring joy.\n` +
        `• **Mangal Dosha Assessment**: ${mangalDetailEn}\n` +
        `• **Harmony Remedies**: Worshipping Goddess Lakshmi on Fridays and offering prayers together fosters mutual auspiciousness.`,
      domain: 'MARRIAGE',
      mantraCard: {
        mantra: 'ॐ श्रीं महालक्ष्म्यै नमः',
        mantraHi: 'ॐ श्रीं महालक्ष्म्यै नमः',
        transliteration: 'Om Shreem Mahalakshmyai Namah',
        deity: 'Goddess Lakshmi',
        deityHi: 'माँ महालक्ष्मी',
        repetitions: 108,
        timing: 'Friday Evening',
        timingHi: 'शुक्रवार संध्या काल',
        japaSlug: 'radhe-radhe',
      },
      bhajanRec: {
        title: 'Om Jai Lakshmi Mata',
        deityName: 'Lakshmi',
        searchQuery: 'Om Jai Lakshmi Mata',
      },
      followUps: [
        'How does my 7th house lord influence marriage?',
        'Mangal Dosha pacification tips',
        'Friday Lakshmi sadhana for family harmony',
      ],
    };
  }

  // ── 5. WEALTH & FINANCE ───────────────────────────────────────────────────
  if (
    lower.includes('wealth') || lower.includes('finance') || lower.includes('money') ||
    lower.includes('investment') || lower.includes('धन') || lower.includes('संपत्ति') ||
    lower.includes('पैसा') || lower.includes('आर्थिक') || lower.includes('लाभ') ||
    lower.includes('कर्ज') || lower.includes('निवेश')
  ) {
    if (isHi) {
      return {
        reply: `शुभम्! आर्थिक समृद्धि का विचार द्वितीय (धन भाव) एवं एकादश (लाभ भाव) से किया जाता है:\n\n` +
          `• **धन एवं लाभ भाव विचार**: आपकी कुण्डली में ${moonSignHi} चन्द्र राशि एवं लग्न स्थिति धन संचय में विवेकपूर्ण निर्णय लेने की क्षमता दर्शाती है।\n` +
          `• **सक्रिय दशा प्रभाव**: वर्तमान **${currentMDHi} महादशा** आर्थिक स्थिरता एवं योजनाबद्ध निवेश को प्रोत्साहित करती है। अनावश्यक व्यय से बचें।\n` +
          `• **धन समृद्धि उपाय**: शुक्रवार को श्री सूक्त का पाठ करें अथवा 'ॐ श्रीं महालक्ष्म्यै नमः' का जप करें। पक्षियों को अन्न-जल देना धन समृद्धि में सहायक है।`,
        domain: 'WEALTH',
        mantraCard: {
          mantra: 'ॐ श्रीं ह्रीं क्लीं महालक्ष्म्यै नमः',
          mantraHi: 'ॐ श्रीं ह्रीं क्लीं महालक्ष्म्यै नमः',
          transliteration: 'Om Shreem Hreem Kleem Mahalakshmyai Namah',
          deity: 'Maha Lakshmi',
          deityHi: 'माँ महालक्ष्मी',
          repetitions: 108,
          timing: 'Friday Morning or Evening',
          timingHi: 'शुक्रवार प्रातः अथवा संध्या',
          japaSlug: 'radhe-radhe',
        },
        bhajanRec: {
          title: 'Kanakadhara Stotram',
          deityName: 'Lakshmi',
          searchQuery: 'Kanakadhara Stotram',
        },
        followUps: [
          'धन संचय हेतु एकादश भाव क्या कहता है?',
          'कनकधारा स्तोत्र के क्या लाभ हैं?',
          'आर्थिक बाधा निवारण उपाय',
        ],
      };
    }

    return {
      reply: `Blessings! Financial prosperity is analyzed through the 2nd House (Accumulated Wealth) and 11th House (Gains/Income):\n\n` +
        `• **Wealth Indicators**: With your ${moonSign} Moon, your chart supports structured financial discipline and progressive value creation.\n` +
        `• **Active Period**: Your **${currentMD} Mahadasha** favors calculated investments and steady professional gains over speculative shortcuts.\n` +
        `• **Vedic Prosperity Remedies**: Reciting Sri Suktam or chanting the Mahalakshmi mantra on Fridays harmonizes material and spiritual abundance.`,
      domain: 'WEALTH',
      mantraCard: {
        mantra: 'ॐ श्रीं ह्रीं क्लीं महालक्ष्म्यै नमः',
        mantraHi: 'ॐ श्रीं ह्रीं क्लीं महालक्ष्म्यै नमः',
        transliteration: 'Om Shreem Hreem Kleem Mahalakshmyai Namah',
        deity: 'Maha Lakshmi',
        deityHi: 'माँ महालक्ष्मी',
        repetitions: 108,
        timing: 'Friday Morning or Evening',
        timingHi: 'शुक्रवार प्रातः अथवा संध्या',
        japaSlug: 'radhe-radhe',
      },
      bhajanRec: {
        title: 'Kanakadhara Stotram',
        deityName: 'Lakshmi',
        searchQuery: 'Kanakadhara Stotram',
      },
      followUps: [
        'How does my 11th house impact financial gains?',
        'Benefits of Kanakadhara Stotram',
        'Vedic wealth stability practices',
      ],
    };
  }

  // ── 6. HEALTH, PEACE & VITALITY ───────────────────────────────────────────
  if (
    lower.includes('health') || lower.includes('peace') || lower.includes('stress') ||
    lower.includes('mind') || lower.includes('रोग') || lower.includes('स्वास्थ्य') ||
    lower.includes('तनाव') || lower.includes('मानसिक') || lower.includes('शांति') ||
    lower.includes('आरोग्य') || lower.includes('आयु')
  ) {
    if (isHi) {
      return {
        reply: `कल्याणमस्तु! आरोग्य और मानसिक शांति के लिए वैदिक ज्योतिष में लग्न (तनु भाव) एवं चन्द्रमा का विचार प्रमुख है:\n\n` +
          `• **तनु भाव एवं चन्द्रमा**: चन्द्रमा का ${moonSignHi} राशि में स्थित होना यह दर्शाता है कि आपका मन संवेदनशील है। नियमित प्राणायाम और ध्यान से मानसिक शांति सुदृढ़ होगी।\n` +
          `• **आरोग्य रक्षा मंत्र**: महामृत्युंजय मंत्र जीवन में संजीवनी शक्ति, दीर्घायु और आरोग्य प्रदान करने वाला महामंत्र है।\n` +
          `• **दैनिक नियम**: प्रतिदिन 15 मिनट भजन श्रवण एवं संध्या वंदन करें।`,
        domain: 'HEALTH',
        mantraCard: {
          mantra: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात्॥',
          mantraHi: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात्॥',
          transliteration: 'Om Tryambakam Yajamahe Sugandhim Pushti-Vardhanam...',
          deity: 'Lord Shiva (Mahamrityunjaya)',
          deityHi: 'भगवान महामृत्युंजय',
          repetitions: 108,
          timing: 'Morning facing East',
          timingHi: 'प्रातःकाल पूर्व दिशा की ओर मुख करके',
          japaSlug: 'maha-mrityunjaya-mantra',
        },
        bhajanRec: {
          title: 'Maha Mrityunjaya Mantra 108 Times',
          deityName: 'Shiva',
          searchQuery: 'Maha Mrityunjaya Mantra',
        },
        followUps: [
          'महामृत्युंजय मंत्र जप की विधि',
          'मानसिक शांति के लिए प्राणायाम नियम',
          'स्वास्थ्य रक्षा हेतु सूर्य आराधना',
        ],
      };
    }

    return {
      reply: `Blessings of good health and vitality! In Vedic astrology, physical well-being is governed by the 1st House (Lagna/Tanu) and mental peace by Chandra (Moon):\n\n` +
        `• **Vitality & Mind**: Your Moon in ${moonSign} reflects intuitive sensitivity. Daily pranayama and quiet reflection restore inner balance.\n` +
        `• **Healing Vibration**: Chanting the sacred Mahamrityunjaya mantra fosters deep cellular rejuvenation and emotional serenity.\n` +
        `• **Daily Sadhana**: Dedicate 15 minutes to quiet chanting or listening to sacred chants during twilight.`,
      domain: 'HEALTH',
      mantraCard: {
        mantra: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात्॥',
        mantraHi: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात्॥',
        transliteration: 'Om Tryambakam Yajamahe Sugandhim Pushti-Vardhanam...',
        deity: 'Lord Shiva (Mahamrityunjaya)',
        deityHi: 'भगवान महामृत्युंजय',
        repetitions: 108,
        timing: 'Morning facing East',
        timingHi: 'प्रातःकाल पूर्व दिशा की ओर मुख करके',
        japaSlug: 'maha-mrityunjaya-mantra',
      },
      bhajanRec: {
        title: 'Maha Mrityunjaya Mantra 108 Times',
        deityName: 'Shiva',
        searchQuery: 'Maha Mrityunjaya Mantra',
      },
      followUps: [
        'How to chant Mahamrityunjaya Mantra correctly?',
        'Vedic practices for mental serenity',
        'Surya Dev worship for physical vitality',
      ],
    };
  }

  // ── 7. GENERAL COMPREHENSIVE HOROSCOPE GUIDANCE ───────────────────────────
  if (isHi) {
    return {
      reply: `🙏 नमो नारायण! आपकी जन्म कुण्डली का सम्पूर्ण सार इस प्रकार है:\n\n` +
        `• **जन्म कुण्डली आधार**: ${hasExactTime ? `${lagnaNameHi} लग्न (स्वामी: ${lagnaLordHi}), ` : ''}${moonSignHi} चन्द्र राशि (${nakshatra} नक्षत्र, चरण ${nakPada}) एवं ${sunSignHi} सूर्य राशि।\n` +
        `• **सक्रिय विंशोत्तरी काल**: आप **${currentMDHi} महादशा** के अंतर्गत **${currentADHi} अंतर्दशा** के प्रभाव में हैं।\n` +
        `• **शास्त्रीय इष्ट देव**: जैमिनी कारकांश परम्परा अनुसार आपके इष्ट देव **${ishtaHi}** हैं।\n\n` +
        `ईश्वर की कृपा से आपके जीवन में सकारात्मक संभावनाएं हैं। आप करियर, विवाह, दशा प्रभाव, स्वास्थ्य अथवा उपायों पर कोई भी विशिष्ट प्रश्न पूछ सकते हैं।`,
      domain: 'GENERAL',
      mantraCard: {
        mantra: ishtaMantra,
        mantraHi: ishtaMantra,
        transliteration: ishtaMantra,
        deity: ishta,
        deityHi: ishtaHi,
        repetitions: 108,
        timing: 'Morning at sunrise',
        timingHi: 'प्रातः सूर्योदय के समय',
        japaSlug: ishta.toLowerCase().includes('shiva') ? 'om-namah-shivaya' : ishta.toLowerCase().includes('krishna') ? 'hare-krishna-mahamantra' : 'jai-shree-ram',
      },
      bhajanRec: {
        title: `${ishtaHi} अमृतवाणी`,
        deityName: ishta,
        searchQuery: ishtaBhajan,
      },
      followUps: [
        'मेरे करियर में पदोन्नति के क्या योग हैं?',
        'वर्तमान महादशा का शुभ फल कैसे बढ़ाएं?',
        'मेरे इष्ट देव और साधना के नियम बताएं',
      ],
    };
  }

  return {
    reply: `🙏 Namo Narayana! Here is the astrological overview of your birth horoscope:\n\n` +
      `• **Horoscope Foundation**: ${hasExactTime ? `${lagnaName} Ascendant (ruled by ${lagnaLord}), ` : ''}${moonSign} Moon (${nakshatra} Nakshatra, Pada ${nakPada}), and ${sunSign} Sun.\n` +
      `• **Active Vimshottari Dasha**: You are currently progressing through **${currentMD} Mahadasha** with **${currentAD} Antardasha**.\n` +
      `• **Classical Ishta Devata**: Guided by Jaimini Karakamsha tradition, your favorable devotional focus is **${ishta}**.\n\n` +
      `Your birth chart holds strong spiritual and worldly potentials. Feel free to ask about your career, marriage, active dasha periods, or personalized remedies!`,
    domain: 'GENERAL',
    mantraCard: {
      mantra: ishtaMantra,
      mantraHi: ishtaMantra,
      transliteration: ishtaMantra,
      deity: ishta,
      deityHi: ishtaHi,
      repetitions: 108,
      timing: 'Morning at sunrise',
      timingHi: 'प्रातः सूर्योदय के समय',
      japaSlug: ishta.toLowerCase().includes('shiva') ? 'om-namah-shivaya' : ishta.toLowerCase().includes('krishna') ? 'hare-krishna-mahamantra' : 'jai-shree-ram',
    },
    bhajanRec: {
      title: `${ishta} Sacred Stotram & Bhajans`,
      deityName: ishta,
      searchQuery: ishtaBhajan,
    },
    followUps: [
      'What are my career prospects in my chart?',
      'How to maximize active Mahadasha blessings?',
      'Tell me about my Ishta Devata sadhana',
    ],
  };
}
