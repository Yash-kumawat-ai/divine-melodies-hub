/**
 * GITA CONVERSATIONAL CHAT ENGINE — "श्रीकृष्ण संवाद" (Krishna Samvad)
 * 
 * Features:
 * 1. Personalized User Address (Uses devotee's name, or 'प्रिय मित्र' / 'सखे' — never blindly hardcodes 'Arjun').
 * 2. Direct Divine Spiritual Authority (No weak "Bhagavad Gita mein kaha gaya hai..." assertions).
 * 3. Exact Canonical Sanskrit Shloka with Devanagari meter, transliteration & Swami Ramsukhdas translation.
 * 4. Practical Real-Life Takeaways ("आज के जीवन में व्यावहारिक कदम").
 * 5. Daily Message Quota tracking with midnight reset.
 * 6. Full Dark and Light theme data compatibility.
 */

import { parseTranslationRange, type ParsedTranslationText } from '@/components/geeta/CategoryVerseCard';

export interface PracticalStep {
  title: string;
  action: string;
}

export interface EmbeddedShloka {
  chapter: number;
  verse: number;
  sanskrit: string;
  transliteration?: string;
  translation: string;
  translatorName: string;
  coreTeaching?: string;
  parsedRange?: ParsedTranslationText;
}

export interface GitaChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string; // Direct divine guidance
  greeting?: string; // "प्रिय yashkumawat,"
  shloka?: EmbeddedShloka; // Sourced canonical shloka
  coreTeaching?: string; // Krishna's distilled teaching
  practicalSteps?: string[]; // Legacy string format
  structuredSteps?: PracticalStep[]; // Step with title and action
  followUps?: string[]; // Contextual quick-reply chips
  timestamp: string;
}

export interface DailyQuotaStatus {
  total: number;
  used: number;
  remaining: number;
  resetHours: number;
  isExhausted: boolean;
}

const GUEST_DAILY_LIMIT = 10;
const USER_DAILY_LIMIT = 25;
const QUOTA_STORAGE_KEY = 'raghavam_gita_chat_quota';

/**
 * Calculates current quota and time remaining until midnight reset.
 */
export function getDailyGitaQuota(isLoggedIn: boolean = false): DailyQuotaStatus {
  const total = isLoggedIn ? USER_DAILY_LIMIT : GUEST_DAILY_LIMIT;
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

  // Calculate hours left until midnight
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const diffMs = midnight.getTime() - now.getTime();
  const resetHours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));

  try {
    const raw = localStorage.getItem(QUOTA_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === todayStr) {
        const used = Number(parsed.count) || 0;
        const remaining = Math.max(0, total - used);
        return {
          total,
          used,
          remaining,
          resetHours,
          isExhausted: remaining <= 0,
        };
      }
    }
  } catch (err) {
    console.warn('Failed to read gita chat quota:', err);
  }

  return {
    total,
    used: 0,
    remaining: total,
    resetHours,
    isExhausted: false,
  };
}

/**
 * Increments quota count. Returns true if allowed, false if quota exceeded.
 */
export function incrementDailyGitaQuota(isLoggedIn: boolean = false): boolean {
  const quota = getDailyGitaQuota(isLoggedIn);
  if (quota.isExhausted) return false;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const newCount = quota.used + 1;

  try {
    localStorage.setItem(
      QUOTA_STORAGE_KEY,
      JSON.stringify({ date: todayStr, count: newCount })
    );
  } catch (err) {
    console.warn('Failed to save gita chat quota:', err);
  }

  return true;
}

/**
 * Curated knowledge base of core Gita verses with authentic Sanskrit & Ramsukhdas translation
 * for rapid zero-latency responses with divine conversational wisdom.
 */
interface VerseWisdomEntry {
  category: string;
  chapter: number;
  verse: number;
  sanskrit: string;
  transliteration: string;
  translation: string;
  translatorName: string;
  greetingHi: (name: string) => string;
  greetingEn: (name: string) => string;
  counselingHi: (name: string, query: string) => string;
  counselingEn: (name: string, query: string) => string;
  coreTeachingHi: string;
  coreTeachingEn: string;
  practicalStepsHi: PracticalStep[];
  practicalStepsEn: PracticalStep[];
  followUpsHi: string[];
  followUpsEn: string[];
  keywords: string[];
}

const CORE_WISDOM_REPOSITORY: VerseWisdomEntry[] = [
  {
    category: 'freedom_and_surrender',
    chapter: 18,
    verse: 66,
    sanskrit: `सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज ।\nअहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः ॥ १८.६६ ॥`,
    transliteration: 'sarva-dharmān parityajya mām ekaṁ śharaṇaṁ vraja\nahaṁ tvāṁ sarva-pāpebhyo mokṣhayiṣhyāmi mā śhuchaḥ',
    translation: '।।18.66।। संपूर्ण धर्मोंका आश्रय छोड़कर तू केवल मेरी शरणमें आ जा। मैं तुझे संपूर्ण पापोंसे मुक्त कर दूँगा, तू चिन्ता मत कर।',
    translatorName: 'स्वामी रामसुखदास (गीताप्रेस)',
    greetingHi: (name) => `प्रिय ${name},`,
    greetingEn: (name) => `Dear ${name},`,
    counselingHi: (name) =>
      `संसार के समस्त द्वंद्वों और अंतर्द्वंद्वों की मूल जड़ यह है कि तुम्हारा अहंकार हर परिस्थिति और परिणाम को अकेले अपने नियंत्रण में रखने का व्यर्थ प्रयास करता है। जब तुम पूरे ब्रह्मांड का भार अकेले अपने कंधों पर उठाने लगते हो, तो जीवन एक असहनीय बोझ बन जाता है। शांत और पवित्र भाव से अपने वर्तमान कर्तव्य का पालन करो, और अंतिम परिणाम का भार मुझ पर छोड़ दो। जो पूर्ण समर्पण के साथ कर्म करता है, उसे कोई शोक कभी स्पर्श नहीं कर सकता।`,
    counselingEn: (name) =>
      `The root cause of all worldly dilemmas and restless friction is the ego's anxious attempt to micromanage every outcome alone. When you carry the entire universe on your solitary shoulders, life turns into a heavy burden. Discharge your honest duty with purity, and surrender the final consequence into the hands of the supreme order. One who acts with surrender is never touched by grief.`,
    coreTeachingHi: 'सच्ची मुक्ति और शांति तब प्राप्त होती है जब तुम परिणामों का व्यर्थ बोझ मुझ पर छोड़कर, अपने कर्तव्य में निष्काम भाव से लीन हो जाते हो।',
    coreTeachingEn: 'True freedom comes when you surrender the burden of outcomes and focus on your duty with sincerity and devotion.',
    practicalStepsHi: [
      { title: 'परिणाम की आसक्ति छोड़ें', action: 'अपना सर्वोत्तम प्रयास करें और फल की चिंता मुझ पर समर्पित कर दें।' },
      { title: 'मौन में विश्राम लें', action: 'प्रतिदिन कुछ क्षण मौन और प्रार्थना में मन को शांत रखें।' },
      { title: 'कर्म को पूजा बनाएं', action: 'अपने प्रत्येक कार्य को ईश्वर के प्रति एक पावन समर्पण समझकर करें।' }
    ],
    practicalStepsEn: [
      { title: 'Release the outcome', action: 'Do your best and let go of anxious control.' },
      { title: 'Pause in stillness', action: 'Take a few minutes daily in prayer or silent reflection.' },
      { title: 'Offer your actions', action: 'Treat your daily work as a sacred offering to the Divine.' }
    ],
    followUpsHi: [
      'शरणागति का वास्तविक अर्थ क्या है?',
      'भय और चिंता से मुक्त कैसे जिएं?',
      'व्यस्त जीवन में कर्मयोग का अभ्यास कैसे करें?'
    ],
    followUpsEn: [
      'What is the true meaning of surrender?',
      'How can I live without fear?',
      'How to apply this in a busy life?'
    ],
    keywords: [
      'freedom', 'free', 'surrender', 'mukti', 'azadi', 'sharan', 'liberation', 'chhutkara',
      'we want freedom', 'peace', 'burden', 'bojh', 'मुक्ति', 'आजादी', 'शरण', 'शांति'
    ]
  },
  {
    category: 'comparison_and_envy',
    chapter: 6,
    verse: 5,
    sanskrit: `उद्धरेदात्मनात्मानं नात्मानमवसादयेत् ।\nआत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः ॥ ६.५ ॥`,
    transliteration: 'uddhared ātmanātmānaṁ nātmānam avasādayet\nātmaiva hy ātmano bandhur ātmaiva ripur ātmanaḥ',
    translation: '।।6.5।। मनुष्य अपने द्वारा अपना उद्धार करे, अपना पतन न करे; क्योंकि यह मनुष्य आप ही तो अपना मित्र है और आप ही अपना शत्रु है।',
    translatorName: 'स्वामी रामसुखदास (गीताप्रेस)',
    greetingHi: (name) => `प्रिय ${name},`,
    greetingEn: (name) => `Dear ${name},`,
    counselingHi: (name) =>
      `संसार की दौड़ में दूसरों की गति देखकर स्वयं को पीछे समझना केवल मन का एक भ्रम है। इस संपूर्ण ब्रह्मांड में प्रत्येक आत्मा की यात्रा, उसकी गति और उसका समय सर्वथा अद्वितीय है। दूसरों से अपनी तुलना करके तुम अपनी ऊर्जा नष्ट कर रहे हो। स्मरण रखो—तुम्हारा वास्तविक मुकाबला किसी अन्य से नहीं, केवल तुम्हारे बीते हुए कल से है। अपनी आंतरिक शक्ति को पहचानो और स्वयं को उठाओ।`,
    counselingEn: (name) =>
      `Looking at the pace of others and feeling left behind is merely a delusion of the restless mind. In this vast universe, each soul possesses an entirely unique journey and timeline. By comparing yourself to others, you drain your sacred energy. Remember, your only true competition is with who you were yesterday. Elevate yourself through your own mind.`,
    coreTeachingHi: 'दूसरों की तुलना से मुक्त होकर अपनी आत्मा को अपना सच्चा मित्र बनाएं और निरंतर अपने कर्म में आगे बढ़ें।',
    coreTeachingEn: 'Liberate yourself from the trap of comparison; make your own mind your dearest ally and walk your unique path.',
    practicalStepsHi: [
      { title: 'दूसरों पर ध्यान बंद करें', action: 'दूसरों की प्रगति देखने के स्थान पर आज केवल अपने एक कार्य को पूर्ण करने पर ध्यान लगाएं।' },
      { title: 'मन को मित्र बनाएं', action: 'आत्म-निंदा और हीनभावना बंद करें और स्वयं को सखा भाव से उत्साहित करें।' },
      { title: 'निरंतरता बनाए रखें', action: 'यह स्वीकार करें कि अपनी गति से चलना असफलता नहीं, बल्कि सच्ची दृढ़ता है।' }
    ],
    practicalStepsEn: [
      { title: 'Stop monitoring others', action: 'Instead of watching others, focus entirely on finishing one tangible duty today.' },
      { title: 'Befriend your mind', action: 'Halt toxic self-criticism and elevate your inner voice with compassionate encouragement.' },
      { title: 'Honor your pace', action: 'Acknowledge that moving at your own rhythm is not failure; consistency is true mastery.' }
    ],
    followUpsHi: [
      'मन को अपना मित्र कैसे बनाएं?',
      'दूसरों से तुलना करने की आदत कैसे रोकें?',
      'हीनभावना और ईर्ष्या से मुक्ति कैसे पाएं?'
    ],
    followUpsEn: [
      'How do I make my mind my friend?',
      'How to stop comparing myself with others?',
      'How to overcome feelings of inadequacy?'
    ],
    keywords: [
      'piche reh gya', 'aage badh', 'sab aage', 'peeche', 'piche', 'compare', 'comparison', 'jealous',
      'jalan', 'log aage', 'duniya aage', 'dusre aage', 'heenbhavna', 'competition', 'tulna'
    ]
  },
  {
    category: 'confusion_and_lost',
    chapter: 2,
    verse: 47,
    sanskrit: `कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ॥ २.४७ ॥`,
    transliteration: 'karmaṇy-evādhikāras te mā phaleṣhu kadāchana\nmā karma-phala-hetur bhūr mā te saṅgo ’stv akarmaṇi',
    translation: '।।2.47।। तेरा कर्म करने में ही अधिकार है, उसके फलों में कभी नहीं। इसलिये तू कर्मों के फल का हेतु मत हो तथा तेरी कर्म न करने में भी आसक्ति न हो।',
    translatorName: 'स्वामी रामसुखदास (गीताप्रेस)',
    greetingHi: (name) => `प्रिय ${name},`,
    greetingEn: (name) => `Dear ${name},`,
    counselingHi: (name) =>
      `जब जीवन में कुछ समझ न आए, तो इसका अर्थ यह नहीं कि राह समाप्त हो गई है—बल्कि इसका अर्थ है कि तुम परिणाम के बोझ तले दब गए हो। जब तुम बहुत दूर भविष्य को देखने का प्रयास करते हो, तो वर्तमान के कदम धुंधले हो जाते हैं। संपूर्ण जीवन को एक साथ सुलझाने का प्रयास मत करो। केवल उस एक कर्तव्य को चुनो जो अभी, इसी क्षण तुम्हारे सामने उपस्थित है। कर्म तुम्हारा सामर्थ्य है, परिणाम का नियंत्रण समय के हाथ में है।`,
    counselingEn: (name) =>
      `When you feel completely lost and nothing seems clear, it does not mean your path is closed—it simply means you are burdened by the weight of uncertain outcomes. Trying to resolve your entire future at once blinds you to the next immediate step. Select solely the duty right before you in this present moment. Action is your rightful domain; the fruits belong to the cosmic order.`,
    coreTeachingHi: 'कर्म में अपना श्रेष्ठतम सामर्थ्य लगाओ और परिणाम का अनावश्यक भार मुझ पर छोड़कर निश्चिंत हो जाओ।',
    coreTeachingEn: 'Devote your utmost sincerity to the present action, and release the paralyzing grip of distant outcomes.',
    practicalStepsHi: [
      { title: 'आज के कर्म पर ध्यान दें', action: 'भविष्य की चिंता छोड़कर आज के 2 आवश्यक कार्यों को पूर्ण करने में जुट जाएं।' },
      { title: 'कर्म में डूब जाएं', action: 'परिणाम का भय छोड़कर कर्म में एकाग्र हों—कर्म ही मानसिक उलझन की एकमात्र औषधि है।' },
      { title: 'मौन श्वास लें', action: 'जब भी संशय सताए, 5 मिनट शांत बैठकर केवल अपनी श्वास पर ध्यान दें।' }
    ],
    practicalStepsEn: [
      { title: 'Focus on today', action: 'Pause worrying about months ahead; complete 2 clear actions before you today.' },
      { title: 'Immerse in action', action: 'Action is the sole antidote to mental paralysis; take the first step.' },
      { title: 'Pause in breath', action: 'Whenever overwhelmed, sit quietly for 5 minutes and anchor in your breath.' }
    ],
    followUpsHi: [
      'कर्मफल में आसक्ति कैसे त्यागें?',
      'सही निर्णय लेने की स्पष्टता कैसे पाएं?',
      'जब भविष्य का डर सताए तो क्या करें?'
    ],
    followUpsEn: [
      'How to detach from results while working hard?',
      'How to gain clarity when making hard choices?',
      'What to do when fear of the future paralyzes me?'
    ],
    keywords: [
      'smji ni aa rha', 'kuch samajh nahi', 'kya karu', 'samajh nahi aa raha', 'lost', 'confused',
      'directionless', 'duvidha', 'asmanjas', 'uljhan', 'dilemma', 'rasta nahi', 'soch soch'
    ]
  },
  {
    category: 'anger_and_frustration',
    chapter: 2,
    verse: 62,
    sanskrit: `ध्यायतो विषयान्पुंसः सङ्गस्तेषूपजायते ।\nसङ्गात् संजायते कामः कामात्क्रोधोऽभिजायते ॥ २.६२ ॥`,
    transliteration: "dhyāyato viṣhayān puṁsaḥ saṅgas teṣhūpajāyate\nsaṅgāt sañjāyate kāmaḥ kāmāt krodho 'bhijāyate",
    translation: '।।2.62 -- 2.63।। विषयोंका चिन्तन करनेवाले मनुष्यकी उन विषयोंमें आसक्ति पैदा हो जाती है। आसक्तिसे कामना पैदा होती है। कामनासे क्रोध पैदा होता है। क्रोध होनेपर सम्मोह (मूढ़भाव) हो जाता है। सम्मोहसे स्मृति भ्रष्ट हो जाती है। स्मृति भ्रष्ट होनेपर बुद्धिका नाश हो जाता है। बुद्धिका नाश होनेपर मनुष्यका पतन हो जाता है।',
    translatorName: 'स्वामी रामसुखदास (गीताप्रेस)',
    greetingHi: (name) => `प्रिय ${name},`,
    greetingEn: (name) => `Dear ${name},`,
    counselingHi: (name) =>
      `क्रोध तुम्हारा स्वभाव नहीं है; क्रोध केवल तुम्हारी उस अपूर्ण इच्छा की अग्नि है जो बाधित हो गई है। जब कोई परिस्थिति या व्यक्ति तुम्हारी अपेक्षा के अनुसार व्यवहार नहीं करता, तो मन आवेश में आ जाता है। परंतु सावधान रहो—क्रोध किसी दूसरे को हानि पहुँचाने से पहले तुम्हारे स्वयं के विवेक को भस्म कर देता है। आवेश में प्रतिक्रिया देने के बजाय क्षण भर के लिए मौन का आश्रय लो।`,
    counselingEn: (name) =>
      `Anger is not your inherent nature; it is merely the fiery flare of an expectation or desire that met an obstacle. When events or people fail to align with your wishes, the ego reacts with rage. But beware—anger incinerates your own clarity and judgment long before it harms anyone else. In moments of heat, choose intentional silence over reaction.`,
    coreTeachingHi: 'क्रोध विवेक का नाश करता है; जब भी क्रोध उठे, प्रतिक्रिया देने के स्थान पर मौन और विवेक का सहारा लो।',
    coreTeachingEn: 'Anger clouds discrimination and destroys peace; in moments of fury, master stillness rather than reacting.',
    practicalStepsHi: [
      { title: 'प्रतिक्रिया रोकें', action: 'क्रोध आने पर तुरंत उत्तर न दें—10 गहरी सांसें लें और उस स्थान से कुछ देर हट जाएं।' },
      { title: 'दीर्घकालिक सोचें', action: 'स्वयं से पूछें: "क्या यह विवाद 1 वर्ष बाद भी इतना महत्वपूर्ण रहेगा?"' },
      { title: 'चित्त को सुरक्षित रखें', action: 'दूसरे की भूल को अपने मन की शांति चुराने की अनुमति मत दें।' }
    ],
    practicalStepsEn: [
      { title: 'Halt reaction', action: 'Do not react in anger—take 10 slow, deep breaths and step back physically.' },
      { title: 'Seek perspective', action: 'Ask yourself: "Will this issue hold any gravity one year from today?"' },
      { title: 'Protect your peace', action: 'Refuse to let another person\'s behavior shatter the quiet of your inner temple.' }
    ],
    followUpsHi: [
      'क्रोध के वेग को तुरंत कैसे शांत करें?',
      'अपेक्षाओं और इच्छाओं पर नियंत्रण कैसे पाएं?',
      'अपनों के साथ कटुता से कैसे बचें?'
    ],
    followUpsEn: [
      'How to neutralize sudden surges of anger?',
      'How to let go of rigid expectations?',
      'How to avoid conflict with loved ones?'
    ],
    keywords: [
      'gussa', 'anger', 'angry', 'krodh', 'rage', 'irritate', 'chidh', 'nafrat', 'badla',
      'ladai', 'aavesh', 'revenge', 'chidiya'
    ]
  },
  {
    category: 'overthinking_and_anxiety',
    chapter: 6,
    verse: 26,
    sanskrit: `यतो यतो निश्चरति मनश्चञ्चलमस्थिरम् ।\nततस्ततो नियम्यैतदात्मन्येव वशं नयेत् ॥ ६.२६ ॥`,
    transliteration: 'yato yato niścharati manaś chañchalam asthiram\ntatas tato niyamyaitad ātmany eva vaśhaṁ nayet',
    translation: '।।6.26।। यह चंचल और स्थिर न रहनेवाला मन जिन-जिन (शब्दादि) विषयोंमें विचरण करता है, उन-उन विषयोंसे इसको रोककर बार-बार अपने-आपमें ही लगावे।',
    translatorName: 'स्वामी रामसुखदास (गीताप्रेस)',
    greetingHi: (name) => `प्रिय ${name},`,
    greetingEn: (name) => `Dear ${name},`,
    counselingHi: (name) =>
      `मन वायु की भांति चंचल और प्रचंड है, इसलिए इसका इधर-उधर भटकना स्वाभाविक है। जब तुम मन से लड़ते हो, तो वह और अधिक उग्र हो जाता है। मन पर नियंत्रण बलपूर्वक नहीं, अपितु धैर्य और अभ्यास से प्राप्त होता है। जब भी तुम्हारा मन भविष्य के भयों और बीती बातों में भटके, तो क्रोधित मत होओ; एक बालक की भांति उसे पुनः वर्तमान के कर्म में लौटा लाओ।`,
    counselingEn: (name) =>
      `The mind is as elusive and forceful as the wind; its wanderings are completely natural. When you fight your mind violently, you only agitate it further. Mastery of the mind is gained not by force, but through patient, compassionate practice. Whenever your attention drifts into anxious projections or past regrets, gently guide it back to the present moment, like guiding a restless child.`,
    coreTeachingHi: 'मन को बलपूर्वक नहीं, बल्कि धैर्य और निरंतर अभ्यास से बार-बार वर्तमान के सत्य में स्थित करो।',
    coreTeachingEn: 'The mind cannot be conquered by violent force, but by patient, gentle redirection back to the present truth.',
    practicalStepsHi: [
      { title: 'विचारों को लिख लें', action: 'जब विचार चक्रवात बन जाएं, उन्हें डायरी में लिख डालें—लिखने से मन का भार घटता है।' },
      { title: 'जप में मन लगाएं', action: 'प्रतिदिन 10 मिनट मौन होकर प्रभु नाम या ॐ का जप करें।' },
      { title: 'वर्तमान में जिएं', action: 'इस समय जो कार्य कर रहे हैं, अपनी पूरी चेतना केवल उसी एक काम में समर्पित कर दें।' }
    ],
    practicalStepsEn: [
      { title: 'Externalize thoughts', action: 'When thoughts spiral, journal them on paper—externalizing them drains their overwhelming weight.' },
      { title: 'Practice silent japa', action: 'Spend 10 minutes daily chanting or resting in sacred melodic stillness.' },
      { title: 'Anchor in the present', action: 'Engage all senses entirely in the solitary duty you are performing right now.' }
    ],
    followUpsHi: [
      'अशांत मन को 2 मिनट में कैसे स्थिर करें?',
      'ध्यान और जप की सही विधि क्या है?',
      'नकारात्मक विचारों से मुक्ति कैसे पाएं?'
    ],
    followUpsEn: [
      'How to ground a racing mind in 2 minutes?',
      'What is the true method of japa and meditation?',
      'How to break free from intrusive negative thoughts?'
    ],
    keywords: [
      'overthinking', 'mind', 'dimag', 'soch', 'vichar', 'chinta', 'anxiety', 'panic',
      'focus nahi', 'ashant', 'restless', 'bechain', 'dhyan nahi lagta'
    ]
  },
  {
    category: 'loneliness_and_grief',
    chapter: 9,
    verse: 29,
    sanskrit: `समोऽहं सर्वभूतेषु न मे द्वेष्योऽस्ति न प्रियः ।\nये भजन्ति तु मां भक्त्या मयि ते तेषु चाप्यहम् ॥ ९.२९ ॥`,
    transliteration: 'samo ’haṁ sarva-bhūteṣhu na me dveṣhyo ’sti na priyaḥ\nye bhajanti tu māṁ bhaktyā mayi te teṣhu chāpy aham',
    translation: '।।9.29।। मैं सम्पूर्ण प्राणियों में सम हूँ, न कोई मेरा अप्रिय है और न कोई प्रिय है। परन्तु जो प्रेमपूर्वक मेरा भजन करते हैं, वे मुझमें हैं और मैं भी उनमें हूँ।',
    translatorName: 'स्वामी रामसुखदास (गीताप्रेस)',
    greetingHi: (name) => `प्रिय ${name},`,
    greetingEn: (name) => `Dear ${name},`,
    counselingHi: (name) =>
      `संसार में कभी भी स्वयं को अकेला और उपेक्षित मत समझो। बाह्य लोग और संबंध समय के अनुसार आ और जा सकते हैं, परंतु परमात्मा का वास तुम्हारे हृदय में प्रत्येक श्वास के साथ निरंतर है। तुम्हारा अकेलापन वास्तव में तुम्हारे अंतर्मन का वह निमंत्रण है जो तुम्हें सांसारिक कोलाहल से हटाकर अपने वास्तविक आत्म-स्वरूप से जुड़ने के लिए प्रेरित कर रहा है। जब तुम ईश्वर को अपना सखा बना लेते हो, तो अकेलापन एकांत के आनंद में बदल जाता है।`,
    counselingEn: (name) =>
      `Never believe you are truly alone or forsaken. External people and circumstances come and go with the changing seasons of life, but the Divine resides continuously within the sanctuary of your heart. Your loneliness is in fact an invitation to step away from worldly noise and recognize your timeless inner bond. When you behold the Divine as your supreme companion, solitude transforms into sacred communion.`,
    coreTeachingHi: 'परमात्मा सदैव तुम्हारे हृदय में विद्यमान हैं; अकेलेपन को भय नहीं, अपितु ईश्वर से जुड़ने का अवसर समझो।',
    coreTeachingEn: 'The Supreme Companion is seated ever within your heart; transform loneliness into the sacred solace of divine friendship.',
    practicalStepsHi: [
      { title: 'एकांत को साधना बनाएं', action: 'अकेलेपन को अभिशाप नहीं, साधना का अवसर मानकर कुछ समय कीर्तन या स्वाध्याय करें।' },
      { title: 'निस्वार्थ प्रेम बांटें', action: 'संसार से प्रेम की याचना करने के बजाय, किसी जरूरतमंद की निस्वार्थ सहायता करें।' },
      { title: 'ईश्वर को सखा मानें', action: 'अपने सुख-दुःख की प्रत्येक बात श्रीकृष्ण से निसंकोच साझा करें।' }
    ],
    practicalStepsEn: [
      { title: 'Embrace sacred solitude', action: 'View quiet hours as a sacred sanctuary rather than emptiness; listen to kirtan.' },
      { title: 'Offer selfless love', action: 'Instead of seeking external validation, offer unconditional kindness to someone in need.' },
      { title: 'Converse with Krishna', action: 'Open your heart directly to the Divine within; you are eternally held.' }
    ],
    followUpsHi: [
      'भगवान को अपना सच्चा मित्र कैसे बनाएं?',
      'अकेलेपन को आत्म-शक्ति में कैसे बदलें?',
      'शोक और वियोग की पीड़ा कैसे सहें?'
    ],
    followUpsEn: [
      'How to cultivate friendship with the Divine?',
      'How to transform loneliness into spiritual strength?',
      'How to cope with the pain of grief and separation?'
    ],
    keywords: [
      'akela', 'akelapan', 'lonely', 'loneliness', 'alone', 'koi nahi', 'koi apna nahi',
      'empty', 'abandoned', 'shok', 'grief', 'dard', 'viyog', 'rona'
    ]
  },
  {
    category: 'laziness_and_procrastination',
    chapter: 3,
    verse: 8,
    sanskrit: `नियतं कुरु कर्म त्वं कर्म ज्यायो ह्यकर्मणः ।\nशरीरयात्रापि च ते न प्रसिद्ध्येदकर्मणः ॥ ३.८ ॥`,
    transliteration: 'niyataṁ kuru karma tvaṁ karma jyāyo hy akarmaṇaḥ\nśharīra-yātrāpi cha te na prasiddhyed akarmaṇaḥ',
    translation: '।।3.8।। तू शास्त्रविहित कर्तव्यकर्म कर; क्योंकि कर्म न करने की अपेक्षा कर्म करना श्रेष्ठ है तथा कर्म न करने से तेरा शरीर-निर्वाह भी सिद्ध नहीं होगा।',
    translatorName: 'स्वामी रामसुखदास (गीताप्रेस)',
    greetingHi: (name) => `प्रिय ${name},`,
    greetingEn: (name) => `Dear ${name},`,
    counselingHi: (name) =>
      `आलस्य और टालमटोल केवल ऊर्जा की कमी नहीं, बल्कि कर्म से मन के पलायन का नाम है। जब मन किसी कार्य को बहुत कठिन या परिणाम को अनिश्चित मान लेता है, तो वह अकर्म में शरण लेता है। परंतु कर्म न करना कभी भी शांति नहीं दे सकता। कर्म में ही जीवन की गति है। प्रेरणा की प्रतीक्षा मत करो—छोटे से कदम से कर्म का प्रारंभ करो; कर्म करने से ही प्रेरणा का जन्म होता है।`,
    counselingEn: (name) =>
      `Procrastination and inertia are not merely a lack of energy; they are the mind's escape from responsibility. When the mind perceives a task as daunting or outcomes as uncertain, it retreats into inaction. Yet inaction never brings peace; it only magnifies anxiety. Do not wait for perfect motivation—commence action with one modest step; clarity and momentum arise through action itself.`,
    coreTeachingHi: 'अकर्म से कर्म सदा श्रेष्ठ है; आलस्य को त्यागकर छोटे से प्रारंभ से अपने कर्तव्य में जुट जाओ।',
    coreTeachingEn: 'Action is infinitely superior to paralyzing inertia; commence your duty without waiting for ideal motivation.',
    practicalStepsHi: [
      { title: '5 मिनट का नियम', action: 'कार्य को बहुत बड़ा न समझें—अगले केवल 5 मिनट के लिए कार्य शुरू करें, गति अपने आप आ जाएगी।' },
      { title: 'जड़ता तोड़ें', action: 'आलस्य आने पर तुरंत खड़े हों, थोड़ा जल पिएं और शरीर को सक्रिय करें।' },
      { title: 'भय त्यागें', action: 'टालमटोल के पीछे छिपे असफलता के भय को पहचानें और निष्काम भाव से जुटें।' }
    ],
    practicalStepsEn: [
      { title: 'Commit to 5 minutes', action: 'Do not gaze at the entire mountain; commit to just 5 minutes of focused effort right now.' },
      { title: 'Break physical inertia', action: 'Stand up immediately, drink fresh water, and correct your physical posture.' },
      { title: 'Release fear of perfection', action: 'Recognize that procrastination masks fear of imperfection; act with sincere devotion.' }
    ],
    followUpsHi: [
      'टालमटोल की आदत को जड़ से कैसे खत्म करें?',
      'दैनिक दिनचर्या को अनुशासित कैसे बनाएं?',
      'सच्ची कर्मयोग भावना क्या है?'
    ],
    followUpsEn: [
      'How to dissolve procrastination at its root?',
      'How to build joyful, unshakable daily discipline?',
      'What is true Karma Yoga in daily work?'
    ],
    keywords: [
      'alasya', 'aalsi', 'lazy', 'laziness', 'procrastination', 'talmatol', 'mann nahi lagta',
      'sust', 'procrastinate', 'delay', 'kal karunga', 'himmat nahi', 'आलस्य', 'सुस्ती'
    ]
  },
  {
    category: 'exam_and_failure',
    chapter: 2,
    verse: 38,
    sanskrit: `सुखदुःखे समे कृत्वा लाभालाभौ जयाजयौ ।\nततो युद्धाय युज्यस्व नैवं पापमवाप्स्यसि ॥ २.३८ ॥`,
    transliteration: 'sukha-duḥkhe same kṛtvā lābhālābhau jayājayau\ntato yuddhāya yujyasva naivaṁ pāpam avāpsyasi',
    translation: '।।2.38।। जय-पराजय, लाभ-हानि और सुख-दुःख को समान समझकर, उसके बाद तू कर्तव्य के लिये तैयार हो जा; इस प्रकार कर्म करने से तू पतन को प्राप्त नहीं होगा।',
    translatorName: 'स्वामी रामसुखदास (गीताप्रेस)',
    greetingHi: (name) => `प्रिय ${name},`,
    greetingEn: (name) => `Dear ${name},`,
    counselingHi: (name) =>
      `असफलता किसी व्यक्ति की पहचान नहीं होती, वह केवल एक प्रयास का परिणाम मात्र है। जब तुम परीक्षा, परिणाम या समाज की दृष्टि से स्वयं का मूल्यांकन करते हो, तो भयभीत होना स्वाभाविक है। स्मरण रखो—तुम्हारा मूल्य किसी एक परीक्षा के अंकों या सांसारिक जीत-हार से तय नहीं होता। कर्म में अपना शत-प्रतिशत दो, और परिणाम को जीवन का एक अनुभव मानकर स्वीकार करो। जो गिरकर पुनः उठता है, वही वास्तविक विजेता है।`,
    counselingEn: (name) =>
      `Failure is never your identity; it is merely the temporary outcome of a single attempt. When you tie your self-worth to test scores, interview results, or social validation, anxiety is inevitable. Your true essence is infinitely greater than any exam sheet. Offer your absolute best effort in preparation, and accept outcomes with equanimity. The one who rises after every fall is the true victor.`,
    coreTeachingHi: 'जय-पराजय और लाभ-हानि को समान समझकर अपने कर्तव्य में पूरी निष्ठा से लग जाओ।',
    coreTeachingEn: 'Anchor yourself beyond temporary triumph and defeat; discharge your preparation with pure, joyful focus.',
    practicalStepsHi: [
      { title: 'हार का भय छोड़ें', action: 'परिणाम के अंकों की चिंता छोड़कर आज के अध्ययन पर पूर्ण एकाग्रता लगाएं।' },
      { title: 'स्वयं पर विश्वास रखें', action: 'किसी एक परीक्षा से अपनी संपूर्ण क्षमता को मत आंको—निरंतर अभ्यास ही सच्ची विजय है।' },
      { title: 'पुनः उठ खड़े हों', action: 'विफलता को आत्म-सुधार का मार्गदर्शक बनाएं और पुनः दृढ़ संकल्प से जुटें।' }
    ],
    practicalStepsEn: [
      { title: 'Shed fear of defeat', action: 'Immerse yourself entirely in today\'s study without agonizing over scores.' },
      { title: 'Anchor in self-worth', action: 'Refuse to measure your infinite soul by a sheet of paper; consistency is mastery.' },
      { title: 'Rise again with resolve', action: 'Treat setbacks as diagnostic lessons and step forward with unshakable heart.' }
    ],
    followUpsHi: [
      'परीक्षा के तनाव और असफलता के डर को कैसे हटाएं?',
      'अध्ययन में मन की एकाग्रता कैसे बढ़ाएं?',
      'विफलता के बाद पुनः आत्मविश्वास कैसे जगाएं?'
    ],
    followUpsEn: [
      'How to dissolve exam anxiety and fear of failure?',
      'How to cultivate laser focus during study?',
      'How to rebuild self-belief after a setback?'
    ],
    keywords: [
      'exam', 'fail', 'failure', 'marks', 'pariksha', 'asafal', 'asafalta', 'score',
      'interview', 'neet', 'jee', 'upsc', 'result', 'फेल', 'परीक्षा', 'हार'
    ]
  },
  {
    category: 'grief_and_loss',
    chapter: 2,
    verse: 11,
    sanskrit: `अशोच्यानन्वशोचस्त्वं प्रज्ञावादांश्च भाषसे ।\nगतासूनगतासूंश्च नानुशोचन्ति पण्डिताः ॥ २.११ ॥`,
    transliteration: 'aśhochyān anvaśhochas tvaṁ prajñā-vādāṁśh cha bhāṣhase\ngatāsūn agatāsūṁśh cha nānuśhochanti paṇḍitāḥ',
    translation: '।।2.11।। जिनके लिये शोक नहीं करना चाहिये, उनका तू शोक करता है और पण्डितों के से वचनों को कहता है; परन्तु जिनके प्राण चले गये हैं और जिनके प्राण नहीं गये हैं, उनके लिये विवेकीजन शोक नहीं करते।',
    translatorName: 'स्वामी रामसुखदास (गीताप्रेस)',
    greetingHi: (name) => `प्रिय ${name},`,
    greetingEn: (name) => `Dear ${name},`,
    counselingHi: (name) =>
      `प्रियजन का वियोग हृदय को विदीर्ण कर देता है, और यह शोक स्वाभाविक है। परंतु इस संसार का सनातन सत्य यह है कि शरीर नश्वर है, आत्मा अजर-अमर और नित्य है। जो उत्पन्न हुआ है उसका परिवर्तन निश्चित है। जिसे तुमने प्रेम किया, वह केवल एक बाह्य आवरण नहीं था, अपितु एक दिव्य चैतन्य था जो अब भी परमात्मा की गोद में सुरक्षित है। शोक में डूबने के स्थान पर उनके सत्कार्यों और सुंदर स्मृतियों को अपने आचरण में जीवित रखो।`,
    counselingEn: (name) =>
      `The separation from a cherished loved one cuts through the heart, and grief is a natural human emotion. Yet the eternal truth of this cosmos is that the physical vessel is perishable, while the indwelling soul is immortal and eternal. Change is the fundamental law of creation. The soul you loved was never merely flesh and bone, but divine consciousness that now rests peacefully in the Supreme. Honor them by embodying their virtues.`,
    coreTeachingHi: 'आत्मा अजर, अमर और नित्य है; शोक को भक्ति और दिवंगत आत्मा के सम्मान में सत्कर्म का रूप दें।',
    coreTeachingEn: 'The soul never perishes; honor those who passed by living virtuously and trusting their eternal journey.',
    practicalStepsHi: [
      { title: 'सत्य को स्मरण करें', action: 'शोक के आंसुओं को बहने दें, परंतु यह स्मरण रखें कि आत्मा का कभी नाश नहीं होता।' },
      { title: 'सत्कर्म व दान करें', action: 'दिवंगत आत्मा की शांति के लिए प्रार्थना करें और उनके नाम पर निस्वार्थ सेवा करें।' },
      { title: 'कर्तव्य निभाएं', action: 'अपने वर्तमान दायित्वों को उनके आशीर्वाद के रूप में पूरी निष्ठा से पूरा करें।' }
    ],
    practicalStepsEn: [
      { title: 'Anchor in immortality', action: 'Allow tears to flow, but remind yourself that the divine soul never dies.' },
      { title: 'Dedicate selfless acts', action: 'Offer quiet prayer and perform an act of compassionate charity in their memory.' },
      { title: 'Fulfill your duty', action: 'Honor their legacy by walking your life path with dignity and integrity.' }
    ],
    followUpsHi: [
      'अपनों के वियोग की असह्य पीड़ा से कैसे उबरें?',
      'आत्मा की अमरता का गीता में क्या प्रमाण है?',
      'शोक के समय चित्त को शांति कैसे मिले?'
    ],
    followUpsEn: [
      'How to heal from the devastating grief of losing someone?',
      'What does the Gita teach about the immortality of the soul?',
      'How to find quiet comfort in times of profound loss?'
    ],
    keywords: [
      'grief', 'loss', 'died', 'death of', 'passed away', 'shok', 'mrityu', 'viyog',
      'bichhadna', 'rip', 'chhod gaya', 'chali gayi', 'शोक', 'वियोग', 'निधन'
    ]
  },
  {
    category: 'fear_of_death',
    chapter: 2,
    verse: 22,
    sanskrit: `वासांसि जीर्णानि यथा विहाय नवानि गृह्णाति नरोऽपराणि ।\nतथा शरीराणि विहाय जीर्ण्यान्यन्यानि संयाति नवानि देही ॥ २.२२ ॥`,
    transliteration: 'vāsāṁsi jīrṇāni yathā vihāya navāni gṛihṇāti naro ’parāṇi\ntathā śharīrāṇi vihāya jīrṇāny anyāni saṁyāti navāni dehī',
    translation: '।।2.22।। जैसे मनुष्य पुराने वस्त्रों को छोड़कर दूसरे नये वस्त्रों को ग्रहण कर लेता है, वैसे ही जीवात्मा पुराने शरीरों को छोड़कर दूसरे नये शरीरों को प्राप्त हो जाता है।',
    translatorName: 'स्वामी रामसुखदास (गीताप्रेस)',
    greetingHi: (name) => `प्रिय ${name},`,
    greetingEn: (name) => `Dear ${name},`,
    counselingHi: (name) =>
      `मृत्यु का भय वास्तव में अंत का नहीं, बल्कि अनजानी यात्रा और देह के छूटने का भय है। जैसे तुम रात्रि में पुराने वस्त्र उतारकर प्रातः नवीन वस्त्र धारण करते हो, वैसे ही जीवात्मा भी पुरानी देह को त्यागकर नवीन अवस्था प्राप्त करती है। जब तक श्वास है, मृत्यु की चिंता में वर्तमान जीवन को मत गंवाओ। प्रत्येक क्षण को धर्म और प्रेम से जियो; जिसने जीवन को सार्थकता से जी लिया, उसके लिए मृत्यु केवल एक विश्राम बन जाती है।`,
    counselingEn: (name) =>
      `The fear of death is not truly fear of the end, but apprehension of the unknown and clinging to the temporary form. Just as a traveler casts aside worn-out garments to don fresh ones, the eternal soul discards an exhausted physical body to journey onward. Do not waste the precious vitality of today fearing tomorrow\'s inevitable horizon. Live each breath with integrity and love; death becomes merely a serene resting milestone.`,
    coreTeachingHi: 'देह वस्त्र के समान नश्वर है, आत्मा अविनाशी है; मृत्यु के भय को त्यागकर वर्तमान जीवन को सार्थक बनाओ।',
    coreTeachingEn: 'The body is but a temporary garment; the soul is indestructible. Live fearlessly in the present light.',
    practicalStepsHi: [
      { title: 'वर्तमान का सम्मान करें', action: 'मृत्यु के भय को वर्तमान क्षण के अमूल्य होने की प्रेरणा बनाएं और प्रेम से जिएं।' },
      { title: 'आत्मा का चिंतन करें', action: 'देह को साधन समझें, स्वयं को नित्य चेतना के रूप में अनुभव करें।' },
      { title: 'ईश्वर में विश्राम लें', action: 'प्रतिदिन कुछ क्षण निर्भय होकर ईश्वर के पावन नाम का ध्यान करें।' }
    ],
    practicalStepsEn: [
      { title: 'Cherish this breath', action: 'Transform mortality fear into deep reverence for the sacred gift of today.' },
      { title: 'Recognize your true self', action: 'View the body as an instrument for good, while knowing your soul is immortal.' },
      { title: 'Meditate in peace', action: 'Spend quiet moments daily meditating on the fearless, changeless Presence within.' }
    ],
    followUpsHi: [
      'मृत्यु के भय से सर्वथा मुक्त कैसे हों?',
      'जीवात्मा की अमर यात्रा का क्या रहस्य है?',
      'जीवन को सार्थक और भयमुक्त कैसे बनाएं?'
    ],
    followUpsEn: [
      'How to become completely fearless in the face of death?',
      'What is the true journey of the soul across lifetimes?',
      'How to live with fearless purpose every single day?'
    ],
    keywords: [
      'fear of death', 'death', 'dying', 'scared to die', 'mortality', 'mrityu ka bhay',
      'dar', 'marne ka dar', 'bhay', 'marna', 'मृत्यु का भय', 'मौत', 'अनहोनी'
    ]
  },
  {
    category: 'burnout_and_fatigue',
    chapter: 6,
    verse: 17,
    sanskrit: `युक्ताहारविहारस्य युक्तचेष्टस्य कर्मसु ।\nयुक्तस्वप्नावबोधस्य योगो भवति दुःखहा ॥ ६.१७ ॥`,
    transliteration: 'yuktāhāra-vihārasya yukta-cheṣhṭasya karmasu\nyukta-svapnāvabodhasya yogo bhavati duḥkha-hā',
    translation: '।।6.17।। जिसका आहार और विहार (घूमना-फिरना) यथायोग्य है, कर्मों में जिसकी चेष्टा यथायोग्य है तथा जिसका शयन और जागरण यथायोग्य है, उसका योग दुःखों का नाश करने वाला सिद्ध होता है।',
    translatorName: 'स्वामी रामसुखदास (गीताप्रेस)',
    greetingHi: (name) => `प्रिय ${name},`,
    greetingEn: (name) => `Dear ${name},`,
    counselingHi: (name) =>
      `अत्यधिक भागदौड़ और लगातार स्वयं को सिद्ध करने की होड़ ने तुम्हारी आत्मा को थका दिया है। जीवन कोई ऐसी दौड़ नहीं है जिसे समाप्त करने के लिए तुम्हें अपनी ऊर्जा निचोड़नी पड़े। संतुलन ही योग है। जब कार्य, विश्राम, निद्रा और आहार में सामंजस्य नहीं होता, तो शरीर और मन दोनों थककर जवाब दे देते हैं। स्वयं को विश्राम देने में कोई अपराधबोध मत रखो; कुछ क्षण रुकना हार नहीं, बल्कि ऊर्जा का पुनः संचय है।`,
    counselingEn: (name) =>
      `Relentless striving and the constant compulsion to prove yourself have drained your inner reserve. Life is not a frantic marathon where exhaustion is a badge of honor. Moderation and balance are the soul of Yoga. When work, rest, sleep, and nourishment lose harmony, the mind and body inevitably collapse. Give yourself permission to pause without guilt; resting is not quitting—it is sacred replenishment.`,
    coreTeachingHi: 'उचित आहार, विश्राम और कर्म का संतुलन ही योग है; विश्राम को साधना मानकर स्वयं को पुनर्जीवित करो।',
    coreTeachingEn: 'True Yoga is equilibrium in work, rest, and food; honor your need to recharge without guilt.',
    practicalStepsHi: [
      { title: 'पूर्ण विराम लें', action: 'आज कुछ समय के लिए सभी स्क्रीन और तनाव से दूर होकर मौन विश्राम लें।' },
      { title: 'दिनचर्या सुधारें', action: 'उचित समय पर निद्रा, पौष्टिक आहार और शांत वातावरण को प्राथमिकता दें।' },
      { title: 'सीमाओं का सम्मान करें', action: 'यह स्वीकार करें कि तुम एक मनुष्य हो—सीमाओं का आदर करना बुद्धिमानी है।' }
    ],
    practicalStepsEn: [
      { title: 'Unplug completely', action: 'Disconnect from all screens and urgent demands for dedicated restorative silence.' },
      { title: 'Restore biological rhythm', action: 'Prioritize deep sleep, nourishing meals, and a calm daily tempo.' },
      { title: 'Honor your limits', action: 'Accept that you are human; pacing yourself is an act of spiritual wisdom.' }
    ],
    followUpsHi: [
      'बर्नआउट और मानसिक थकान से कैसे उबरें?',
      'कार्य और जीवन में संतुलन कैसे स्थापित करें?',
      'आंतरिक ऊर्जा को पुनः कैसे जागृत करें?'
    ],
    followUpsEn: [
      'How to recover from deep burnout and mental exhaustion?',
      'How to establish true equilibrium between duty and rest?',
      'How to rekindle fresh vitality and inner joy?'
    ],
    keywords: [
      'burnout', 'burned out', 'tired', 'exhausted', 'exhaustion', 'no energy',
      'thak gaya', 'thakan', 'drained', 'fatigue', 'cant go on', 'थकान', 'टूट जाना'
    ]
  },
  {
    category: 'career_and_dharma',
    chapter: 3,
    verse: 35,
    sanskrit: `श्रेयान्स्वधर्मो विगुणः परधर्मात्स्वनुष्ठितात् ।\nस्वधर्मे निधनं श्रेयः परधर्मो भयावहः ॥ ३.३५ ॥`,
    transliteration: 'śhreyān sva-dharmo viguṇaḥ para-dharmāt sv-anuṣhṭhitāt\nsva-dharme nidhanaṁ śhreyaḥ para-dharmo bhayāvahaḥ',
    translation: '।।3.35।। अच्छी तरह आचरण में लाये हुए दूसरे के धर्म (कर्तव्य) की अपेक्षा गुणरहित भी अपना धर्म श्रेष्ठ है। अपने धर्म में मरना भी कल्याणकारक है और दूसरे का धर्म भय को देने वाला है।',
    translatorName: 'स्वामी रामसुखदास (गीताप्रेस)',
    greetingHi: (name) => `प्रिय ${name},`,
    greetingEn: (name) => `Dear ${name},`,
    counselingHi: (name) =>
      `करियर और भविष्य को लेकर भ्रम तब उत्पन्न होता है जब तुम दूसरों की सफलता की नकल करने का प्रयास करते हो। प्रत्येक मनुष्य अपनी विशिष्ट प्रकृति, क्षमता और स्वभाव के साथ उत्पन्न हुआ है। दूसरों की देखा-देखी चुना गया मार्ग चाहे कितना भी आकर्षक लगे, वह कभी आंतरिक तृप्ति नहीं दे सकता। अपने स्वभाव को पहचानो—जिस कार्य में तुम्हारी वास्तविक रुचि और स्वाभाविकता है, वही तुम्हारा स्वधर्म है। उस मार्ग पर दृढ़ता से चलो।`,
    counselingEn: (name) =>
      `Confusion regarding career and calling arises when you attempt to duplicate another person's trajectory. Every soul is born with a distinct disposition, natural strengths, and temperament. A path adopted merely because it looks glamorous or lucrative for others will forever breed inner friction. Discover your innate nature (Swadharma); devote your energy to what aligns organically with your authenticity.`,
    coreTeachingHi: 'दूसरों की नकल करने की अपेक्षा अपने स्वभाव और स्वधर्म के मार्ग पर चलना ही परम कल्याणकारी है।',
    coreTeachingEn: 'It is far better to walk your own authentic calling imperfectly than to live an imitation of another\'s life.',
    practicalStepsHi: [
      { title: 'स्वभाव को पहचानें', action: 'दूसरों के पद या वेतन से आकर्षित होने के बजाय अपनी वास्तविक क्षमताओं का मूल्यांकन करें।' },
      { title: 'कार्य में कौशल लाएं', action: 'अपने वर्तमान कार्य में ईमानदारी और निपुणता लाएं—कौशल से ही नये द्वार खुलते हैं।' },
      { title: 'दृढ़ता से चलें', action: 'अपने चुने हुए क्षेत्र में बिना भय के निष्ठापूर्वक समर्पित रहें।' }
    ],
    practicalStepsEn: [
      { title: 'Know your strengths', action: 'Evaluate your natural inclinations rather than chasing superficial prestige.' },
      { title: 'Refine your craft', action: 'Bring excellence to your current duties—mastery unlocks unexpected doors.' },
      { title: 'Commit with courage', action: 'Stay anchored in your authentic duty without anxiously comparing sideways.' }
    ],
    followUpsHi: [
      'करियर में सही दिशा और स्वधर्म की पहचान कैसे करें?',
      'काम में रुचि और उत्साह कैसे बनाए रखें?',
      'सफल और संतुष्ट जीवन का रहस्य क्या है?'
    ],
    followUpsEn: [
      'How to discern my true calling and Swadharma?',
      'How to maintain relentless enthusiasm in daily work?',
      'What is the secret of profound fulfillment in professional life?'
    ],
    keywords: [
      'career', 'job', 'profession', 'future', 'calling', 'direction', 'lost in life',
      'naukri', 'pesha', 'disha', 'bhavishya', 'career confusion', 'करियर', 'नौकरी'
    ]
  },
  {
    category: 'indecision_and_doubt',
    chapter: 18,
    verse: 63,
    sanskrit: `इति ते ज्ञानमाख्यातं गुह्याद्गुह्यतरं मया ।\nविमृश्यैतदशेषेण यथेच्छसि तथा कुरु ॥ १८.६३ ॥`,
    transliteration: 'iti te jñānam ākhyātaṁ guhyād guhyataraṁ mayā\nvimṛiśhyaitad aśheṣheṇa yathechchhasi tathā kuru',
    translation: '।।18.63।। इस प्रकार यह गोपनीय से भी अति गोपनीय ज्ञान मैंने तुझसे कह दिया। अब तू इस रहस्ययुक्त ज्ञान को पूर्णतया विचार कर, फिर जैसा चाहता है वैसा ही कर।',
    translatorName: 'स्वामी रामसुखदास (गीताप्रेस)',
    greetingHi: (name) => `प्रिय ${name},`,
    greetingEn: (name) => `Dear ${name},`,
    counselingHi: (name) =>
      `द्वंद्व और अनिर्णय की स्थिति मन को पंगु बना देती है। जब तुम गलत निर्णय के भय से कोई भी निर्णय नहीं लेते, तो संशय तुम्हारे समय और आत्मबल को खा जाता है। संपूर्ण ज्ञान और परिस्थितियों पर शांत मन से विचार करो। कोई भी निर्णय शत-प्रतिशत त्रुटिहीन नहीं होता; निर्णय लेने के बाद अपनी निष्ठा और कर्म से उसे सार्थक बनाया जाता है। संशय का त्याग करो और धर्मपूर्वक निर्णय लेकर आगे बढ़ो।`,
    counselingEn: (name) =>
      `Indecision and perpetual second-guessing paralyze the soul. When you postpone choices out of terror of making a mistake, doubt devours your precious time and resolve. Contemplate the situation calmly with all available wisdom. No worldly decision comes with a guaranteed blueprint; you validate a decision through dedicated, righteous follow-through. Cast aside doubt and take courageous action.`,
    coreTeachingHi: 'शांत चित्त से परिस्थितियों का विचार करो और संशय का त्याग करके धर्मपूर्वक निर्णय लो।',
    coreTeachingEn: 'Contemplate with quiet wisdom, let go of chronic hesitation, and act decisively in accordance with truth.',
    practicalStepsHi: [
      { title: 'लाभ-हानि का विश्लेषण', action: 'दोनों विकल्पों के लाभ-हानि को शांत मन से कागज पर लिखें।' },
      { title: 'धर्म को प्राथमिकता दें', action: 'यह देखें कि कौन सा विकल्प सत्य, धर्म और दीर्घकालिक कल्याण के अनुकूल है।' },
      { title: 'पीछे मुड़ना छोड़ें', action: 'एक बार निर्णय लेने के बाद उस पर अडिग रहें और आत्म-संदेह से बचें।' }
    ],
    practicalStepsEn: [
      { title: 'Map both options', action: 'Objectively write out the pros and cons of both choices on paper.' },
      { title: 'Choose integrity', action: 'Ask which path aligns with long-term goodness rather than immediate comfort.' },
      { title: 'Commit wholeheartedly', action: 'Once decided, move forward courageously and cease revisiting doubts.' }
    ],
    followUpsHi: [
      'कठिन परिस्थितियों में स्पष्ट निर्णय कैसे लें?',
      'संशय और असमंजस से मुक्ति कैसे पाएं?',
      'गलत निर्णय के भय को कैसे दूर करें?'
    ],
    followUpsEn: [
      'How to make clear decisions during complex crossroads?',
      'How to liberate oneself from chronic hesitation?',
      'How to conquer the dread of making a wrong choice?'
    ],
    keywords: [
      'indecision', 'decide', 'decision', 'choices', 'confused', 'dilemma', 'asmanjas',
      'nirnay', 'duvidha', 'kya karu', 'निर्णय', 'असमंजस', 'दुविधा', 'द्वंद्व'
    ]
  },
  {
    category: 'relationships_and_harmony',
    chapter: 12,
    verse: 13,
    sanskrit: `अद्वेष्टा सर्वभूतानां मैत्रः करुण एव च ।\nनिर्ममो निरहंकारः समदुःखसुखः क्षमी ॥ १२.१३ ॥`,
    transliteration: 'adveṣhṭā sarva-bhūtānāṁ maitraḥ karuṇa eva cha\nnirmamo nirahaṅkāraḥ sama-duḥkha-sukhaḥ kṣhamī',
    translation: '।।12.13।। जो सम्पूर्ण प्राणियों में द्वेषभाव से रहित, सबका मित्र और दयालु है, ममता-रहित तथा अहंकार-रहित है, सुख-दुःख की प्राप्ति में सम और क्षमाशील है, वह भक्त मुझे प्रिय है।',
    translatorName: 'स्वामी रामसुखदास (गीताप्रेस)',
    greetingHi: (name) => `प्रिय ${name},`,
    greetingEn: (name) => `Dear ${name},`,
    counselingHi: (name) =>
      `संबंधों में कटुता और विवाद का कारण प्रेम की कमी नहीं, बल्कि अहंकार और अपेक्षाओं का टकराव है। जब हम दूसरों को बदलने का हठ करते हैं, तो कलह उत्पन्न होती है। संबंध अधिकार जताने का नहीं, अपितु समझने और क्षमा करने का क्षेत्र है। दूसरे के दोष देखने के स्थान पर अपने भीतर क्षमा, करुणा और मैत्री का भाव लाओ। जो द्वेष से रहित होकर व्यवहार करता है, वह समस्त कलह से मुक्त हो जाता है।`,
    counselingEn: (name) =>
      `Bitterness and friction in relationships stem not from an absence of love, but from the collision of rigid expectations and ego. Conflict ignites when we insist on remaking others in our image. True relationship is a sanctuary of understanding and forgiveness, not possession. Shift your gaze from the flaws of others to cultivating compassion, goodwill, and patience within yourself.`,
    coreTeachingHi: 'द्वेष और अहंकार का त्याग करके सभी के प्रति मैत्री, करुणा और क्षमा का भाव धारण करो।',
    coreTeachingEn: 'Surrender resentment and entitlement; anchor relationships in patience, compassion, and boundless forgiveness.',
    practicalStepsHi: [
      { title: 'जीतने की जिद छोड़ें', action: 'विवाद के समय जीतने का हठ त्यागें—संबंध को सही साबित होने से अधिक महत्व दें।' },
      { title: 'धैर्यपूर्वक सुनें', action: 'दूसरे के दृष्टिकोण को बिना बीच में टोके शांत मन से समझने का प्रयास करें।' },
      { title: 'क्षमा का आश्रय लें', action: 'मन में कड़वाहट न पालें; क्षमा करके अपने हृदय को हल्का रखें।' }
    ],
    practicalStepsEn: [
      { title: 'Release the need to win', action: 'Prioritize preserving love and respect over proving yourself right in arguments.' },
      { title: 'Listen deeply', action: 'Listen attentively to the other person without defensive reactions.' },
      { title: 'Embrace forgiveness', action: 'Release old grudges; forgive generously to keep your inner heart clean.' }
    ],
    followUpsHi: [
      'रिश्तों में कड़वाहट और विवाद को कैसे सुलझाएं?',
      'अपेक्षाओं के बिना प्रेम कैसे करें?',
      'अपनों को क्षमा करने की शक्ति कैसे पाएं?'
    ],
    followUpsEn: [
      'How to resolve deep-seated conflict with loved ones?',
      'How to love selflessly without burdensome expectations?',
      'How to cultivate the grace of profound forgiveness?'
    ],
    keywords: [
      'relationship', 'relationships', 'conflict', 'fight', 'argument', 'matbhed', 'kalah',
      'ladai', 'jhagda', 'husband', 'wife', 'family', 'partner', 'संबंध', 'रिश्ते', 'झगड़ा'
    ]
  },
  {
    category: 'ego_and_pride',
    chapter: 3,
    verse: 27,
    sanskrit: `प्रकृतेः क्रियमाणानि गुणैः कर्माणि सर्वशः ।\nअहंकारविमूढात्मा कर्ताहमिति मन्यते ॥ ३.२७ ॥`,
    transliteration: 'prakṛiteḥ kriyamāṇāni guṇaiḥ karmāṇi sarvaśhaḥ\nahaṅkāra-vimūḍhātmā kartāham iti manyate',
    translation: '।।3.27।। सम्पूर्ण कर्म सब प्रकार से प्रकृति के गुणों द्वारा किये जाते हैं; तो भी जिसका अन्तःकरण अहंकार से मोहित हो रहा है, ऐसा अज्ञानी मनुष्य "मैं कर्ता हूँ"—ऐसा मान लेता है।',
    translatorName: 'स्वामी रामसुखदास (गीताप्रेस)',
    greetingHi: (name) => `प्रिय ${name},`,
    greetingEn: (name) => `Dear ${name},`,
    counselingHi: (name) =>
      `अहंकार वह पर्दा है जो तुम्हारी दृष्टि को अंधा कर देता है। जब तुम सोचने लगते हो कि सब कुछ तुम्हारे कारण ही चल रहा है और तुम ही सर्वेसर्वा हो, तो तुम्हारा पतन प्रारंभ हो जाता है। इस सृष्टि में प्रत्येक शक्ति, बुद्धि और सामर्थ्य परमात्मा की दी हुई धरोहर है। कर्तापन के अभिमान को त्यागो और स्वयं को केवल एक विनम्र सेवक समझो। विनम्रता में ही आत्मा की वास्तविक महानता है।`,
    counselingEn: (name) =>
      `Ego is the veil that blinds spiritual vision. When you imagine that every victory is solely of your own doing and that you are the lone orchestrator, your descent commences. Every ounce of intellect, breath, and talent is a sacred gift on loan from the cosmos. Relinquish the arrogance of authorship; behold yourself as a humble instrument. In genuine humility lies true greatness.`,
    coreTeachingHi: 'कर्तापन का अहंकार त्यागकर स्वयं को परमात्मा का एक विनम्र माध्यम समझो।',
    coreTeachingEn: 'Relinquish the illusion of individual doership; perceive yourself as a humble instrument of the divine.',
    practicalStepsHi: [
      { title: 'कृतज्ञता व्यक्त करें', action: 'अपनी सफलता का श्रेय ईश्वर और उन सभी को दें जिन्होंने आपका सहयोग किया।' },
      { title: 'आत्म-निरीक्षण करें', action: 'दूसरों की कमियां निकालने के स्थान पर अपनी त्रुटियों को सुधारने का प्रयास करें।' },
      { title: 'निस्वार्थ सेवा करें', action: 'प्रतिदिन कोई एक कार्य बिना किसी प्रशंसा या फल की कामना के गुप्त रूप से करें।' }
    ],
    practicalStepsEn: [
      { title: 'Give credit humbly', action: 'Acknowledge the unseen grace and the people who contributed to your wins.' },
      { title: 'Practice self-audit', action: 'Replace criticism of others with honest, compassionate self-improvement.' },
      { title: 'Serve silently', action: 'Perform an act of kindness in secret without expecting acknowledgment.' }
    ],
    followUpsHi: [
      'अहंकार और कर्तापन के भाव से कैसे मुक्त हों?',
      'सच्ची विनम्रता और आत्मसम्मान में क्या अंतर है?',
      'ईश्वर को सब कुछ समर्पित करने की विधि क्या है?'
    ],
    followUpsEn: [
      'How to dissolve pride and the illusion of doership?',
      'What is the difference between genuine humility and low self-esteem?',
      'How to surrender all actions selflessly to the Divine?'
    ],
    keywords: [
      'ego', 'pride', 'proud', 'arrogant', 'ghamand', 'ahankar', 'abhiman', 'superior',
      'credit', 'अहंकार', 'घमंड', 'अभिमान'
    ]
  }
];

/**
 * Fallback entry when user asks a general spiritual query.
 */
const DEFAULT_WISDOM_ENTRY: VerseWisdomEntry = {
  category: 'general_spiritual_guidance',
  chapter: 18,
  verse: 66,
  sanskrit: `सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज ।\nअहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः ॥ १८.६६ ॥`,
  transliteration: 'sarva-dharmān parityajya mām ekaṁ śharaṇaṁ vraja\nahaṁ tvāṁ sarva-pāpebhyo mokṣhayiṣhyāmi mā śhuchaḥ',
  translation: '।।18.66।। संपूर्ण धर्मोंका आश्रय छोड़कर तू केवल मेरी शरण में आ जा। मैं तुझे संपूर्ण पापों से मुक्त कर दूँगा, तू शोक मत कर।',
  translatorName: 'स्वामी रामसुखदास (गीताप्रेस)',
  greetingHi: (name) => `प्रिय ${name},`,
  greetingEn: (name) => `Dear ${name},`,
  counselingHi: (name) =>
    `जीवन के समस्त संशयों, चिंताओं और द्वंद्वों का मूल कारण कर्तापन का अत्यधिक अहंकार और परिणाम की आसक्ति है। जब तुम सब कुछ स्वयं अकेले नियंत्रित करने का व्यर्थ प्रयास करते हो, तो जीवन एक भारी बोझ प्रतीत होता है। अपनी पूरी ईमानदारी से अपना धर्म निभाओ, और शेष सब कुछ उस परम चेतना के चरणों में समर्पित कर दो। जो समर्पित भाव से कर्तव्य निभाता है, उसे कभी भय या शोक स्पर्श नहीं कर सकता।`,
  counselingEn: (name) =>
    `The root cause of all worldly dilemmas and restless friction is the ego's anxious attempt to micromanage every outcome alone. When you carry the entire universe on your solitary shoulders, life turns into a heavy burden. Discharge your honest duty with purity, and surrender the final consequence into the hands of the supreme order. One who acts with surrender is never touched by grief.`,
  coreTeachingHi: 'सच्ची मुक्ति और शांति तब प्राप्त होती है जब तुम परिणामों का व्यर्थ बोझ मुझ पर छोड़कर, अपने कर्तव्य में निष्काम भाव से लीन हो जाते हो।',
  coreTeachingEn: 'True freedom comes when you surrender the burden of outcomes and focus on your duty with sincerity and devotion.',
  practicalStepsHi: [
    { title: 'परिणाम की आसक्ति छोड़ें', action: 'अपना सर्वोत्तम प्रयास करें और फल की चिंता मुझ पर समर्पित कर दें।' },
    { title: 'मौन में विश्राम लें', action: 'प्रतिदिन कुछ क्षण मौन और प्रार्थना में मन को शांत रखें।' },
    { title: 'कर्म को पूजा बनाएं', action: 'अपने प्रत्येक कार्य को ईश्वर के प्रति एक पावन समर्पण समझकर करें।' }
  ],
  practicalStepsEn: [
    { title: 'Release the outcome', action: 'Do your best and let go of anxious control.' },
    { title: 'Pause in stillness', action: 'Take a few minutes daily in prayer or silent reflection.' },
    { title: 'Offer your actions', action: 'Treat your work as a sacred offering to the Divine.' }
  ],
  followUpsHi: [
    'शरणागति का वास्तविक अर्थ क्या है?',
    'दैनिक जीवन में गीता के सिद्धांतों को कैसे अपनाएं?',
    'आत्म-शांति के लिए श्रेष्ठ साधना क्या है?'
  ],
  followUpsEn: [
    'What is the true meaning of spiritual surrender?',
    'How to integrate Gita principles into a busy workday?',
    'What is the supreme practice for deep inner peace?'
  ],
  keywords: ['dharma', 'gita', 'shlok', 'bhagwan', 'krishna', 'peace', 'shanti', 'moksha', 'sadhana']
};

/**
 * Detects whether the query was entered in Hindi (Devanagari script or Hinglish)
 * or English, allowing automatic language parity.
 */
export function detectQueryLanguage(
  query: string,
  fallbackLanguage: 'hi' | 'en' = 'hi'
): 'hi' | 'en' {
  if (!query || !query.trim()) return fallbackLanguage;

  // 1. Devanagari script presence (Hindi)
  if (/[\u0900-\u097F]/.test(query)) {
    return 'hi';
  }

  // 2. Hinglish keywords
  const lower = query.toLowerCase();
  const hinglishTokens = [
    'kya', 'kaise', 'kyu', 'kyun', 'hai', 'hain', 'hu', 'hoon', 'karein', 'kare', 'karo',
    'nahi', 'na', 'karu', 'rha', 'raha', 'rahi', 'mujhe', 'mera', 'meri', 'mere', 'mann',
    'gussa', 'krodh', 'dukha', 'dukh', 'dard', 'shanti', 'bhay', 'dar', 'chinta', 'asafal',
    'pariksha', 'shlok', 'krishna', 'bhagwan', 'apna', 'apne', 'jivan', 'jeevan', 'marna',
    'mrityu', 'batao', 'samjhao', 'alag', 'sab', 'smji', 'ni', 'aa', 'kuch', 'hoga', 'hogi',
    'dimag', 'soch', 'vichar', 'ladai', 'jhagda', 'kalah', 'matbhed', 'thak', 'alasya', 'sust'
  ];

  const words = lower.split(/\s+/).map((w) => w.replace(/[^a-z]/g, ''));
  const matchCount = words.filter((w) => hinglishTokens.includes(w)).length;
  if (matchCount > 0) {
    return 'hi';
  }

  // 3. Fallback to active language selection
  return fallbackLanguage;
}

/**
 * Synthesizes an authoritative, deeply compassionate Krishna Samvad response.
 * Uses the user's name directly (no generic 'Arjun').
 * Does not use weak framing like "Bhagavad Gita mein kaha gaya hai".
 * Operates with 0ms latency without artificial contemplation delay.
 */
export async function generateKrishnaResponse(
  userQuery: string,
  userName?: string,
  preferredLanguage: 'hi' | 'en' = 'hi'
): Promise<GitaChatMessage> {
  const detectedLang = detectQueryLanguage(userQuery, preferredLanguage);
  const isHi = detectedLang === 'hi';

  const cleanName = (userName || '').trim() || (isHi ? 'प्रिय मित्र' : 'Dear Friend');
  const lowerQuery = userQuery.toLowerCase().trim();

  // Find best matched wisdom entry
  let matchedEntry = CORE_WISDOM_REPOSITORY.find((entry) =>
    entry.keywords.some((kw) => lowerQuery.includes(kw.toLowerCase()))
  );

  if (!matchedEntry) {
    matchedEntry = DEFAULT_WISDOM_ENTRY;
  }

  const greeting = isHi
    ? matchedEntry.greetingHi(cleanName)
    : matchedEntry.greetingEn(cleanName);

  const counselingBody = isHi
    ? matchedEntry.counselingHi(cleanName, userQuery)
    : matchedEntry.counselingEn(cleanName, userQuery);

  const fullCounselingText = `${greeting}\n\n${counselingBody}`;

  const coreTeaching = isHi ? matchedEntry.coreTeachingHi : matchedEntry.coreTeachingEn;
  const structuredSteps = isHi ? matchedEntry.practicalStepsHi : matchedEntry.practicalStepsEn;
  const practicalSteps = structuredSteps.map((s) => `${s.title}: ${s.action}`);

  const parsedRange = parseTranslationRange(matchedEntry.translation);

  const shloka: EmbeddedShloka = {
    chapter: matchedEntry.chapter,
    verse: matchedEntry.verse,
    sanskrit: matchedEntry.sanskrit,
    transliteration: matchedEntry.transliteration,
    translation: matchedEntry.translation,
    translatorName: matchedEntry.translatorName,
    coreTeaching,
    parsedRange,
  };

  const followUps = isHi
    ? matchedEntry.followUpsHi
    : matchedEntry.followUpsEn;

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    id: `krishna-${Date.now()}`,
    role: 'assistant',
    greeting,
    content: fullCounselingText,
    shloka,
    coreTeaching,
    practicalSteps,
    structuredSteps,
    followUps,
    timestamp: timeStr,
  };
}
