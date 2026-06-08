
export interface PanchangInput { 
  tithiNumber: number;       // 1–30 (15=Purnima, 30=Amavasya) 
  varaIndex: number;         // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat 
  nakshatraName: string;     // Hindi name e.g. 'रोहिणी' 
  isRahuKaal: boolean;       // Is current time in Rahu Kaal window? 
  isAbhijitMuhurat: boolean; // Is current time in Abhijit Muhurat? 
  isBrahmaKaal: boolean;     // Is current time 4:00–6:00 AM? 
} 

export interface KaryaItem { 
  name: string; 
  reason: string;      // e.g. "सोमवार + द्वितीया तिथि" 
  source: 'tithi' | 'vara' | 'nakshatra' | 'special'; 
  priority: number;    // 1=highest, 3=lowest — for sorting 
} 

export interface ShubhAshubhResult { 
  shubhKarya: KaryaItem[]; 
  ashubhKarya: KaryaItem[]; 
  todaySummary: string;   // e.g. "आज सोमवार, रोहिणी नक्षत्र, द्वितीया तिथि — विवाह और गृह प्रवेश के लिए अत्यंत शुभ" 
  dominantReason: string; // single most important factor today 
} 

const TITHI_RULES: Record<number, { shubh: string[], ashubh: string[], note: string }> = { 
  1:  { // Pratipada 
    shubh: ['नए व्यापार का शुभारंभ', 'वाहन खरीदना', 'गृह प्रवेश', 'नई नौकरी शुरू करना'], 
    ashubh: ['विवाह', 'यात्रा', 'दवा शुरू करना'], 
    note: 'चंद्र बल मध्यम, नई शुरुआत के लिए शुभ' 
  }, 
  2:  { // Dwitiya 
    shubh: ['विवाह', 'सगाई', 'यात्रा', 'नया कपड़ा पहनना', 'आभूषण खरीदना'], 
    ashubh: ['शल्य चिकित्सा', 'कर्ज लेना'], 
    note: 'द्वितीया तिथि — सौम्य और शुभ' 
  }, 
  3:  { // Tritiya 
    shubh: ['वस्त्र और आभूषण खरीदना', 'संगीत सीखना', 'कला कार्य', 'यात्रा'], 
    ashubh: ['भूमि क्रय', 'निर्माण कार्य'], 
    note: 'तृतीया — गौरी तिथि, सौंदर्य और कला के लिए उत्तम' 
  }, 
  4:  { // Chaturthi 
    shubh: ['शस्त्र खरीदना', 'वाहन मरम्मत', 'साहसिक कार्य'], 
    ashubh: ['विवाह', 'मुंडन', 'गृह प्रवेश', 'नई पढ़ाई शुरू'], 
    note: 'चतुर्थी — विनायक तिथि, मांगलिक कार्यों में वर्जित' 
  }, 
  5:  { // Panchami 
    shubh: ['विद्यारंभ', 'औषधि सेवन', 'चिकित्सा शुरू', 'पूजा-पाठ'], 
    ashubh: ['यात्रा (दक्षिण दिशा)', 'कर्ज लेना'], 
    note: 'पंचमी — नाग तिथि, विद्या और स्वास्थ्य के लिए शुभ' 
  }, 
  6:  { // Shashthi 
    shubh: ['युद्ध/प्रतियोगिता', 'नया व्यापार', 'सेना भर्ती', 'कार्तिकेय पूजा'], 
    ashubh: ['विवाह', 'गृह प्रवेश'], 
    note: 'षष्ठी — कुमार तिथि' 
  }, 
  7:  { // Saptami 
    shubh: ['वाहन खरीदना', 'यात्रा', 'घोड़े/वाहन संबंधी कार्य', 'सूर्य उपासना'], 
    ashubh: ['दवा शुरू करना', 'गर्भाधान'], 
    note: 'सप्तमी — सूर्य तिथि, यात्रा और वाहन के लिए उत्तम' 
  }, 
  8:  { // Ashtami 
    shubh: ['शस्त्र संधान', 'साहसिक कार्य', 'दुर्गा पूजा'], 
    ashubh: ['विवाह', 'नामकरण', 'नई पढ़ाई', 'गृह प्रवेश'], 
    note: 'अष्टमी — रिक्ता तिथि, मांगलिक कार्यों में वर्जित' 
  }, 
  9:  { // Navami 
    shubh: ['शक्ति पूजा', 'नवरात्रि विधि', 'साहस के कार्य'], 
    ashubh: ['विवाह', 'गृह प्रवेश', 'विद्यारंभ'], 
    note: 'नवमी — रिक्ता तिथि' 
  }, 
  10: { // Dashami 
    shubh: ['विवाह', 'गृह प्रवेश', 'व्यापार शुरू', 'यात्रा', 'भूमि क्रय'], 
    ashubh: ['शल्य चिकित्सा'], 
    note: 'दशमी — पूर्ण शुभ तिथि' 
  }, 
  11: { // Ekadashi 
    shubh: ['व्रत', 'पूजा-पाठ', 'दान', 'तीर्थ यात्रा', 'ध्यान-साधना'], 
    ashubh: ['बाल कटाना', 'मांसाहार', 'विवाह', 'नया व्यापार'], 
    note: 'एकादशी — विष्णु तिथि, उपवास और भक्ति के लिए सर्वश्रेष्ठ' 
  }, 
  12: { // Dwadashi 
    shubh: ['दान', 'विवाह', 'गृह प्रवेश', 'व्यापार शुरू', 'यात्रा'], 
    ashubh: ['शल्य चिकित्सा'], 
    note: 'द्वादशी — शुभ तिथि, एकादशी व्रत पारण' 
  }, 
  13: { // Trayodashi 
    shubh: ['आभूषण खरीदना', 'वस्त्र क्रय', 'मनोरंजन', 'संगीत'], 
    ashubh: ['यात्रा', 'कर्ज लेना', 'नई परियोजना'], 
    note: 'त्रयोदशी — कामदेव तिथि' 
  }, 
  14: { // Chaturdashi 
    shubh: ['शिव पूजा', 'काली पूजा', 'साधना', 'तंत्र विद्या'], 
    ashubh: ['विवाह', 'गृह प्रवेश', 'नई शुरुआत', 'मुंडन', 'यात्रा'], 
    note: 'चतुर्दशी — रिक्ता तिथि, शुभ कार्य वर्जित' 
  }, 
  15: { // Purnima 
    shubh: ['व्रत', 'दान', 'पूजा', 'तीर्थ स्नान', 'सत्यनारायण कथा', 'विवाह', 'गृह प्रवेश'], 
    ashubh: ['कर्ज लेना'], 
    note: 'पूर्णिमा — सर्वश्रेष्ठ तिथि' 
  }, 
  16: { // Krishna Pratipada 
    shubh: ['नई शुरुआत', 'व्यापार'], 
    ashubh: ['यात्रा', 'विवाह'], 
    note: 'कृष्ण प्रतिपदा' 
  }, 
  17: { shubh: ['विवाह', 'यात्रा', 'आभूषण'], ashubh: ['शल्य चिकित्सा'], note: 'कृष्ण द्वितीया' }, 
  18: { shubh: ['कला', 'संगीत', 'वस्त्र'], ashubh: ['भूमि क्रय'], note: 'कृष्ण तृतीया' }, 
  19: { // Krishna Chaturthi 
    shubh: ['साहसिक कार्य'], 
    ashubh: ['विवाह', 'मुंडन', 'गृह प्रवेश'], 
    note: 'कृष्ण चतुर्थी — वर्जित तिथि' 
  }, 
  20: { shubh: ['विद्यारंभ', 'औषधि'], ashubh: ['यात्रा दक्षिण'], note: 'कृष्ण पंचमी' }, 
  21: { shubh: ['व्यापार', 'प्रतियोगिता'], ashubh: ['विवाह'], note: 'कृष्ण षष्ठी' }, 
  22: { shubh: ['वाहन', 'यात्रा', 'सूर्य पूजा'], ashubh: ['दवा'], note: 'कृष्ण सप्तमी' }, 
  23: { // Krishna Ashtami — Janmashtami 
    shubh: ['कृष्ण पूजा', 'भजन-कीर्तन', 'व्रत'], 
    ashubh: ['विवाह', 'गृह प्रवेश', 'नामकरण'], 
    note: 'कृष्ण अष्टमी — जन्माष्टमी' 
  }, 
  24: { shubh: ['शक्ति पूजा'], ashubh: ['विवाह', 'गृह प्रवेश'], note: 'कृष्ण नवमी' }, 
  25: { shubh: ['विवाह', 'व्यापार', 'यात्रा'], ashubh: [], note: 'कृष्ण दशमी' }, 
  26: { // Krishna Ekadashi 
    shubh: ['व्रत', 'पूजा', 'दान', 'ध्यान'], 
    ashubh: ['बाल कटाना', 'मांसाहार', 'विवाह'], 
    note: 'कृष्ण एकादशी — उपवास तिथि' 
  }, 
  27: { shubh: ['दान', 'विवाह', 'व्यापार'], ashubh: [], note: 'कृष्ण द्वादशी' }, 
  28: { shubh: ['आभूषण', 'वस्त्र'], ashubh: ['यात्रा', 'कर्ज'], note: 'कृष्ण त्रयोदशी' }, 
  29: { // Krishna Chaturdashi 
    shubh: ['शिव पूजा', 'मासिक शिवरात्रि व्रत'], 
    ashubh: ['विवाह', 'गृह प्रवेश', 'यात्रा', 'मुंडन'], 
    note: 'कृष्ण चतुर्दशी — शिवरात्रि' 
  }, 
  30: { // Amavasya 
    shubh: ['पितृ तर्पण', 'श्राद्ध', 'दान', 'पूजा', 'ध्यान'], 
    ashubh: ['विवाह', 'गृह प्रवेश', 'नई शुरुआत', 'यात्रा', 'बाल कटाना'], 
    note: 'अमावस्या — पितृ तिथि' 
  } 
}; 

const VARA_RULES: Record<number, { shubh: string[], ashubh: string[], rulingPlanet: string, deity: string }> = { 
  0: { // Sunday — Ravivar 
    shubh: ['सरकारी कार्य', 'नेतृत्व कार्य', 'सोना खरीदना', 'चिकित्सा शुरू', 'सूर्य उपासना'], 
    ashubh: ['विवाह', 'यात्रा पश्चिम दिशा'], 
    rulingPlanet: 'सूर्य', deity: 'सूर्य देव' 
  }, 
  1: { // Monday — Somvar 
    shubh: ['विवाह', 'गृह प्रवेश', 'यात्रा', 'नई वस्तु खरीदना', 'शिव पूजा', 'जल संबंधी कार्य'], 
    ashubh: ['शल्य चिकित्सा', 'कर्ज लेना'], 
    rulingPlanet: 'चंद्रमा', deity: 'शिव' 
  }, 
  2: { // Tuesday — Mangalvar 
    shubh: ['भूमि क्रय', 'निर्माण', 'शस्त्र खरीदना', 'साहसिक कार्य', 'हनुमान पूजा'], 
    ashubh: ['विवाह', 'दवा शुरू', 'बाल/नाखून काटना', 'यात्रा (उत्तर दिशा)'], 
    rulingPlanet: 'मंगल', deity: 'हनुमान/मंगल देव' 
  }, 
  3: { // Wednesday — Budhvar 
    shubh: ['व्यापार', 'लेखन', 'पढ़ाई', 'संचार', 'यात्रा', 'नई साझेदारी', 'विवाह'], 
    ashubh: ['शल्य चिकित्सा'], 
    rulingPlanet: 'बुध', deity: 'गणेश' 
  }, 
  4: { // Thursday — Guruvar 
    shubh: ['विद्यारंभ', 'गुरु दीक्षा', 'विवाह', 'गृह प्रवेश', 'व्यापार', 'धार्मिक कार्य', 'दान'], 
    ashubh: ['बाल कटाना'], 
    rulingPlanet: 'बृहस्पति', deity: 'विष्णु/बृहस्पति' 
  }, 
  5: { // Friday — Shukravar 
    shubh: ['विवाह', 'आभूषण', 'वस्त्र', 'सौंदर्य', 'कला', 'संगीत', 'प्रेम संबंधी कार्य'], 
    ashubh: ['यात्रा (पूर्व दिशा)', 'कर्ज लेना'], 
    rulingPlanet: 'शुक्र', deity: 'लक्ष्मी' 
  }, 
  6: { // Saturday — Shanivar 
    shubh: ['लोहा/तेल खरीदना', 'भूमि क्रय', 'कृषि', 'पुराने कार्य पूर्ण करना', 'शनि पूजा'], 
    ashubh: ['विवाह', 'गृह प्रवेश', 'नई शुरुआत', 'यात्रा', 'बाल/नाखून काटना', 'तेल मालिश'], 
    rulingPlanet: 'शनि', deity: 'शनि देव' 
  } 
}; 

const NAKSHATRA_RULES: Record<string, { shubh: string[], ashubh: string[], quality: 'fixed'|'moveable'|'sharp'|'soft'|'mixed'|'fierce' }> = { 
  'अश्विनी':    { quality: 'moveable', shubh: ['यात्रा', 'वाहन खरीदना', 'चिकित्सा', 'नई शुरुआत'], ashubh: [] }, 
  'भरणी':       { quality: 'fierce',   shubh: ['अग्नि कार्य', 'शस्त्र'], ashubh: ['विवाह', 'गृह प्रवेश', 'यात्रा'] }, 
  'कृत्तिका':   { quality: 'mixed',    shubh: ['अग्नि पूजा', 'पाक कला', 'सोना'], ashubh: ['यात्रा पूर्व दिशा'] }, 
  'रोहिणी':     { quality: 'fixed',    shubh: ['विवाह', 'गृह प्रवेश', 'व्यापार', 'कृषि', 'आभूषण'], ashubh: [] }, 
  'मृगशिरा':    { quality: 'soft',     shubh: ['यात्रा', 'संगीत', 'कला', 'नए मित्र'], ashubh: [] }, 
  'आर्द्रा':    { quality: 'sharp',    shubh: ['शस्त्र कार्य', 'विज्ञान'], ashubh: ['विवाह', 'गृह प्रवेश'] }, 
  'पुनर्वसु':   { quality: 'moveable', shubh: ['यात्रा', 'व्यापार', 'शिक्षा'], ashubh: [] }, 
  'पुष्य':      { quality: 'fixed',    shubh: ['विवाह', 'गृह प्रवेश', 'व्यापार', 'सोना खरीदना', 'गृह निर्माण'], ashubh: [] }, 
  'आश्लेषा':    { quality: 'sharp',    shubh: ['तंत्र विद्या', 'औषधि'], ashubh: ['विवाह', 'यात्रा', 'नई शुरुआत'] }, 
  'मघा':        { quality: 'fierce',   shubh: ['पितृ पूजा', 'श्राद्ध', 'राजकीय कार्य'], ashubh: ['विवाह'] }, 
  'पूर्वाफाल्गुनी': { quality: 'soft', shubh: ['विवाह', 'प्रेम', 'मनोरंजन', 'संगीत', 'कला'], ashubh: [] }, 
  'उत्तराफाल्गुनी': { quality: 'fixed', shubh: ['विवाह', 'गृह प्रवेश', 'व्यापार', 'मित्रता'], ashubh: [] }, 
  'हस्त':       { quality: 'moveable', shubh: ['शिल्प कार्य', 'व्यापार', 'यात्रा', 'कृषि'], ashubh: [] }, 
  'चित्रा':     { quality: 'soft',     shubh: ['वस्त्र', 'आभूषण', 'कला', 'वास्तु'], ashubh: [] }, 
  'स्वाति':     { quality: 'moveable', shubh: ['व्यापार', 'यात्रा', 'नई साझेदारी'], ashubh: [] }, 
  'विशाखा':     { quality: 'mixed',    shubh: ['यज्ञ', 'पूजा', 'व्रत'], ashubh: ['यात्रा'] }, 
  'अनुराधा':    { quality: 'soft',     shubh: ['मित्रता', 'यात्रा', 'व्यापार', 'विवाह'], ashubh: [] }, 
  'ज्येष्ठा':   { quality: 'sharp',    shubh: ['नेतृत्व कार्य', 'शस्त्र'], ashubh: ['विवाह', 'गृह प्रवेश'] }, 
  'मूल':        { quality: 'fierce',   shubh: ['औषधि', 'जड़ी-बूटी', 'उपड़ाव कार्य'], ashubh: ['विवाह', 'नई शुरुआत', 'गृह प्रवेश'] }, 
  'पूर्वाषाढ़ा': { quality: 'moveable', shubh: ['जल यात्रा', 'दान'], ashubh: [] }, 
  'उत्तराषाढ़ा': { quality: 'fixed',   shubh: ['विवाह', 'गृह प्रवेश', 'व्यापार'], ashubh: [] }, 
  'श्रवण':      { quality: 'moveable', shubh: ['शिक्षा', 'यात्रा', 'व्यापार', 'दान'], ashubh: [] }, 
  'धनिष्ठा':    { quality: 'moveable', shubh: ['संगीत', 'यात्रा', 'निर्माण'], ashubh: ['विवाह'] }, 
  'शतभिषा':    { quality: 'mixed',    shubh: ['चिकित्सा', 'औषधि', 'ज्योतिष'], ashubh: ['विवाह', 'यात्रा'] }, 
  'पूर्वाभाद्रपद': { quality: 'fierce', shubh: ['साधना', 'तपस्या'], ashubh: ['विवाह', 'गृह प्रवेश'] }, 
  'उत्तराभाद्रपद': { quality: 'fixed', shubh: ['विवाह', 'गृह प्रवेश', 'दान', 'धर्म कार्य'], ashubh: [] }, 
  'रेवती':      { quality: 'soft',     shubh: ['यात्रा', 'व्यापार', 'आभूषण', 'विवाह'], ashubh: [] } 
}; 

const SPECIAL_WINDOWS = { 
  rahuKaal: { ashubh: ['सभी शुभ कार्य'], note: 'राहु काल — सभी शुभ कार्य वर्जित' }, 
  abhijitMuhurat: { shubh: ['विवाह', 'गृह प्रवेश', 'व्यापार', 'नई शुरुआत'], note: 'अभिजित मुहूर्त — सर्वश्रेष्ठ शुभ मुहूर्त' }, 
  brahmaKaal: { shubh: ['पूजा', 'ध्यान', 'पाठ', 'भजन'], note: 'ब्रह्म मुहूर्त (4–6 AM)' }, 
  guliKaal: { ashubh: ['यात्रा', 'नई शुरुआत'], note: 'गुलिक काल' } 
}; 

const VARA_NAMES = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];

export function computeShubhAshubhKarya(input: PanchangInput): ShubhAshubhResult { 
  const shubhKarya: KaryaItem[] = [];
  const ashubhKarya: KaryaItem[] = [];

  const tithi = TITHI_RULES[input.tithiNumber];
  const vara = VARA_RULES[input.varaIndex];
  const nakshatra = NAKSHATRA_RULES[input.nakshatraName];

  // 1. Collect Tithi Rules
  if (tithi) {
    tithi.shubh.forEach(name => shubhKarya.push({ name, reason: tithi.note, source: 'tithi', priority: 3 }));
    tithi.ashubh.forEach(name => ashubhKarya.push({ name, reason: tithi.note, source: 'tithi', priority: 3 }));
  }

  // 2. Collect Vara Rules
  if (vara) {
    vara.shubh.forEach(name => shubhKarya.push({ name, reason: `${VARA_NAMES[input.varaIndex]} (${vara.rulingPlanet})`, source: 'vara', priority: 2 }));
    vara.ashubh.forEach(name => ashubhKarya.push({ name, reason: `${VARA_NAMES[input.varaIndex]} (${vara.rulingPlanet})`, source: 'vara', priority: 2 }));
  }

  // 3. Collect Nakshatra Rules
  if (nakshatra) {
    nakshatra.shubh.forEach(name => shubhKarya.push({ name, reason: `${input.nakshatraName} नक्षत्र`, source: 'nakshatra', priority: 1 }));
    nakshatra.ashubh.forEach(name => ashubhKarya.push({ name, reason: `${input.nakshatraName} नक्षत्र`, source: 'nakshatra', priority: 1 }));
  }

  // 4. Handle Special Windows
  if (input.isBrahmaKaal) {
    SPECIAL_WINDOWS.brahmaKaal.shubh.forEach(name => shubhKarya.push({ name, reason: SPECIAL_WINDOWS.brahmaKaal.note, source: 'special', priority: 0 }));
  }

  if (input.isAbhijitMuhurat) {
    SPECIAL_WINDOWS.abhijitMuhurat.shubh.forEach(name => shubhKarya.push({ name, reason: SPECIAL_WINDOWS.abhijitMuhurat.note, source: 'special', priority: 0 }));
  }

  // Deduplicate and resolve conflicts
  const processItems = (items: KaryaItem[]) => {
    const map = new Map<string, KaryaItem>();
    items.forEach(item => {
      if (!map.has(item.name) || item.priority < map.get(item.name)!.priority) {
        map.set(item.name, item);
      }
    });
    return Array.from(map.values());
  };

  let finalShubh = processItems(shubhKarya);
  let finalAshubh = processItems(ashubhKarya);

  // Conflict Resolution: if in both, check quality or priority
  finalShubh = finalShubh.filter(s => {
    const conflict = finalAshubh.find(a => a.name === s.name);
    if (!conflict) return true;
    
    // If it's a special window shubh, it usually overrides
    if (s.source === 'special') return true;
    
    // If nakshatra is fierce/sharp, ashubh wins
    if (nakshatra && (nakshatra.quality === 'fierce' || nakshatra.quality === 'sharp')) return false;
    
    return s.priority <= conflict.priority;
  });

  finalAshubh = finalAshubh.filter(a => !finalShubh.find(s => s.name === a.name));

  // 5. Rahu Kaal Override
  if (input.isRahuKaal) {
    finalShubh = [];
    finalAshubh.unshift({ 
      name: 'सभी शुभ कार्य', 
      reason: SPECIAL_WINDOWS.rahuKaal.note, 
      source: 'special', 
      priority: -1 
    });
  }

  // Sorting
  finalShubh.sort((a, b) => a.priority - b.priority);
  finalAshubh.sort((a, b) => a.priority - b.priority);

  // Summary
  const tithiName = tithi ? tithi.note.split(' — ')[0] : `तिथि ${input.tithiNumber}`;
  const summary = `आज ${VARA_NAMES[input.varaIndex]}, ${input.nakshatraName || 'नक्षत्र'}, ${tithiName}`;
  const dominantReason = input.isRahuKaal ? 'राहु काल' : (input.isAbhijitMuhurat ? 'अभिजित मुहूर्त' : (nakshatra ? `${input.nakshatraName} नक्षत्र` : VARA_NAMES[input.varaIndex]));

  return {
    shubhKarya: finalShubh,
    ashubhKarya: finalAshubh,
    todaySummary: summary,
    dominantReason
  };
}
