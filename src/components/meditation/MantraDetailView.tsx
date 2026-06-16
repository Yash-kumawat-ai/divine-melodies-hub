import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Share2,
  Activity,
  Flame,
  Check,
  Play,
  Pause,
  Clock,
  Volume2,
  Calendar,
  Sparkles,
  TrendingUp,
  Compass,
  ArrowRight,
  ShieldAlert,
  Sun,
  Moon,
  Flower2,
  BookOpen,
  Headphones,
  Target,
  Wind,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import type { Mantra, JapTotal } from "@/lib/mantraJapa/mantraJapaApi";

// ─── CUSTOM ICONS ───────────────────────────────────────────────
const YogiIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="5.5" r="2.5" />
    <path d="M12 8v8" />
    <path d="M5 12c2 1 4 1.5 7 1.5s5-.5 7-1.5" />
    <path d="M5 12L8 15c2.5 1 5.5 1 8 0l3-3" />
    <path d="M6 19c2-1 4-1.5 6-1.5s4 .5 6 1.5" />
    <path d="M3 20.5h18" />
  </svg>
);

const MalaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="10" r="6" strokeDasharray="3 3" />
    <circle cx="12" cy="17" r="1.5" fill="currentColor" />
    <path d="M11 18.5l1 1.5 1-1.5" />
  </svg>
);

const HeartIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

const ShieldCrossIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M12 8v8M9 12h6" />
  </svg>
);

const ConcentricCirclesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" {...props}>
    <circle cx="12" cy="12" r="9" strokeOpacity="0.3" />
    <circle cx="12" cy="12" r="6" strokeOpacity="0.6" />
    <circle cx="12" cy="12" r="3" fill="currentColor" />
  </svg>
);

const japaStepsData = [
  {
    num: 1,
    titleHi: "आराम से बैठें",
    titleEn: "Sit Comfortably",
    descHi: "रीढ़ की हड्डी सीधी और शरीर को ढीला रखें। शांत वातावरण चुनें।",
    descEn: "Keep your spine straight and body relaxed. Choose a quiet spot.",
    img: "/src/pages/images/meditation_high_quality.webp",
  },
  {
    num: 2,
    titleHi: "3 गहरी साँसें लें",
    titleEn: "Take 3 Deep Breaths",
    descHi: "अपने मन और शरीर को शांत करने के लिए गहरी और धीमी साँस लें।",
    descEn: "Inhale deeply and exhale slowly to calm your mind and body.",
    isSvg: true,
  },
  {
    num: 3,
    titleHi: "अर्थ पर ध्यान दें",
    titleEn: "Focus On The Meaning",
    descHi: "मंत्र के दिव्य अर्थ को समझें और अपने हृदय में महसूस करें।",
    descEn: "Understand and feel the sacred meaning of the mantra in your heart.",
    img: "/src/pages/images/red_lotus_lossless.webp",
  },
  {
    num: 4,
    titleHi: "धीरे-धीरे जप करें",
    titleEn: "Chant Slowly",
    descHi: "स्पष्ट उच्चारण करें, प्रत्येक शब्द को शुद्धता और भक्ति से जपें।",
    descEn: "Pronounce clearly and chant each syllable with pure devotion.",
    img: "/src/pages/images/om.webp",
    hasAudio: true,
  },
  {
    num: 5,
    titleHi: "माला से जाप गिनें",
    titleEn: "Count With Mala",
    descHi: "मंत्रों की संख्या गिनने के लिए रुद्राक्ष माला या डिजिटल काउंटर का उपयोग करें।",
    descEn: "Use a rudraksha mala or digital counter to count your chants.",
    img: "/images/mala.png",
  }
];

const MandalaBg = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="currentColor" {...props}>
    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
    <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.3" />
    <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="1 1" />
    <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="0.5" />
    <path d="M50 5 L50 95 M5 50 L95 50 M18 18 L82 82 M18 82 L82 18" stroke="currentColor" strokeWidth="0.2" />
    {Array.from({ length: 8 }).map((_, i) => {
      const angle = (i * 45 * Math.PI) / 180;
      const x = 50 + 35 * Math.cos(angle);
      const y = 50 + 35 * Math.sin(angle);
      return <circle key={i} cx={x} cy={y} r="2" fill="currentColor" />;
    })}
  </svg>
);

// ─── DETAILED MANTRA DATA MAP ────────────────────────────────────
type MantraDetail = {
  meaningHindi: string;
  meaningEnglish: string;
  whyChantHindi: string[];
  whyChantEnglish: string[];
  benefitsHindi: string[];
  benefitsEnglish: string[];
  recommendedCounts: {
    beginner: string;
    advanced: string;
    beginnerTimeHindi: string;
    beginnerTimeEnglish: string;
    advancedTimeHindi: string;
    advancedTimeEnglish: string;
  };
  howToStepsHindi: string[];
  howToStepsEnglish: string[];
  mantraTextHindi?: string;
  transliteration?: string;
};

const MANTRA_DETAILS: Record<string, MantraDetail> = {
  om: {
    mantraTextHindi: "ॐ",
    transliteration: "Om / Aum",
    meaningHindi: "ॐ सृष्टि की मूल ध्वनि है, जो ब्रह्मांड की चेतना और परम सत्य का प्रतीक है।",
    meaningEnglish: "Om is the primordial sound of the universe, representing cosmic consciousness and absolute truth.",
    whyChantHindi: [
      "मन को स्थिर और शांत किया जा सकता है",
      "एकाग्रता और फोकस बढ़ता है",
      "आत्मा और परमात्मा से जुड़ाव गहरा होता है",
      "शरीर की ऊर्जा संतुलित होती है"
    ],
    whyChantEnglish: [
      "Stabilizes and calms the mind",
      "Increases focus and concentration",
      "Deepens connection with the soul and Divine",
      "Balances bodily energies"
    ],
    benefitsHindi: ["मानसिक शांति", "भावनात्मक संतुलन", "आध्यात्मिक विकास", "रक्षा और शक्ति"],
    benefitsEnglish: ["Mental Peace", "Emotional Balance", "Spiritual Growth", "Protection & Power"],
    recommendedCounts: {
      beginner: "108 जप",
      advanced: "1008 जप",
      beginnerTimeHindi: "~12 मिनट",
      beginnerTimeEnglish: "~12 mins",
      advancedTimeHindi: "~90 मिनट",
      advancedTimeEnglish: "~90 mins"
    },
    howToStepsHindi: [
      "संकल्प लें – शांत स्थान पर बैठें और मन को केंद्रित करें",
      "लय में जप करें – 'ॐ' का दीर्घ उच्चारण करते हुए नाभि से ध्वनि निकालें",
      "श्वास पर ध्यान दें – हर उच्चारण के साथ गहरी सांस लें और छोड़ें"
    ],
    howToStepsEnglish: [
      "Take a resolve – Sit in a quiet place and focus your mind.",
      "Chant in rhythm – Recite 'Om' deeply, drawing sound from the navel.",
      "Focus on breath – Breathe in and out deeply with each chant."
    ]
  },
  om_namah_shivaya: {
    mantraTextHindi: "ॐ नमः शिवाय",
    transliteration: "Om Namah Shivaya",
    meaningHindi: "मैं भगवान शिव को नमन करता हूं, जो समस्त चेतना के स्रोत हैं।",
    meaningEnglish: "I bow to Lord Shiva, the source of all consciousness.",
    whyChantHindi: [
      "मन को शांति मिलती है",
      "तनाव और मानसिक थकान कम होती है",
      "आत्मविश्वास और साहस बढ़ता है",
      "आध्यात्मिक विकास होता है"
    ],
    whyChantEnglish: [
      "Calms the mind and releases stress",
      "Reduces anxiety and mental fatigue",
      "Boosts confidence and inner courage",
      "Promotes spiritual advancement"
    ],
    benefitsHindi: ["मानसिक शांति", "भावनात्मक संतुलन", "आध्यात्मिक विकास", "रक्षा और शक्ति"],
    benefitsEnglish: ["Mental Peace", "Emotional Balance", "Spiritual Growth", "Protection & Power"],
    recommendedCounts: {
      beginner: "108 जप",
      advanced: "1008 जप",
      beginnerTimeHindi: "~12 मिनट",
      beginnerTimeEnglish: "~12 mins",
      advancedTimeHindi: "~90 मिनट",
      advancedTimeEnglish: "~90 mins"
    },
    howToStepsHindi: [
      "संकल्प लें – शिवलिंग या शिव की प्रतिमा के सामने बैठें",
      "लय में जप करें – स्पष्ट और शांत स्वर में 'ॐ नमः शिवाय' बोलें",
      "जप ट्रैक करें – माला या काउंटर से गिनती रखें"
    ],
    howToStepsEnglish: [
      "Take a resolve – Sit in front of a Shiva Lingam or deity image.",
      "Chant in rhythm – Recite 'Om Namah Shivaya' in a clear, calm voice.",
      "Track your chants – Keep count using a mala or digital counter."
    ]
  },
  mahamrityunjaya: {
    mantraTextHindi: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्।\nउर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय मामृतात्॥",
    transliteration: "Om Tryambakam Yajamahe Sugandhim Pushti-Vardhanam\nUrvarukamiva Bandhanan Mrityor Mukshiya Maamritat",
    meaningHindi: "हम त्रिनेत्रधारी भगवान शिव की आराधना करते हैं, जो सुगंधमय हैं और सबका पोषण करते हैं। जैसे ककड़ी अपनी बेल से अलग होकर मुक्त होती है, वैसे ही वे हमें मृत्यु के बंधन से मुक्त करें और अमरता प्रदान करें।",
    meaningEnglish: "We worship the three-eyed Lord Shiva, who is fragrant and nourishes all. Just as a cucumber is freed from its bond to the vine, may He liberate us from death and grant us immortality.",
    whyChantHindi: [
      "रोग और भय से मुक्ति मिलती है",
      "दीर्घायु और स्वास्थ्य की प्राप्ति होती है",
      "मृत्यु के भय से मुक्ति मिलती है",
      "कठिन समस्याओं से रक्षा होती है"
    ],
    whyChantEnglish: [
      "Provides relief from ailments and fears",
      "Bestows long life and good health",
      "Removes the deep fear of death",
      "Shields you from severe calamities"
    ],
    benefitsHindi: ["मानसिक शांति", "भावनात्मक संतुलन", "आध्यात्मिक विकास", "रक्षा और शक्ति"],
    benefitsEnglish: ["Mental Peace", "Emotional Balance", "Spiritual Growth", "Protection & Power"],
    recommendedCounts: {
      beginner: "11 जप",
      advanced: "108 जप",
      beginnerTimeHindi: "~10 मिनट",
      beginnerTimeEnglish: "~10 mins",
      advancedTimeHindi: "~45 मिनट",
      advancedTimeEnglish: "~45 mins"
    },
    howToStepsHindi: [
      "संकल्प लें – स्वास्थ्य या किसी की रक्षा हेतु संकल्प के साथ बैठें",
      "शुद्ध उच्चारण करें – प्रत्येक शब्द स्पष्ट और सही उच्चारण के साथ बोलें",
      "एकाग्रता बनाएं – मंत्र के अर्थ पर ध्यान केंद्रित रखें"
    ],
    howToStepsEnglish: [
      "Take a resolve – Sit with a dedication for health or protection.",
      "Pronounce correctly – Chant each Sanskrit word clearly and precisely.",
      "Stay focused – Keep your mind fully centered on the meaning of the mantra."
    ]
  },
  hare_krishna: {
    mantraTextHindi: "हरे कृष्ण हरे कृष्ण, कृष्ण कृष्ण हरे हरे।\nहरे राम हरे राम, राम राम हरे हरे॥",
    transliteration: "Hare Krishna Hare Krishna, Krishna Krishna Hare Hare\nHare Rama Hare Rama, Rama Rama Hare Hare",
    meaningHindi: "हे भगवान कृष्ण और राम, मैं आपकी शरण लेता हूं। यह मंत्र भगवान को प्रेमपूर्वक पुकारने और उनकी कृपा प्राप्त करने का माध्यम है।",
    meaningEnglish: "O Lord Krishna and Lord Rama, I take shelter in you. This mahamantra is a way to lovingly call upon the Divine and receive grace.",
    whyChantHindi: [
      "मन में आनंद और प्रेम का संचार होता है",
      "नकारात्मक विचारों से मुक्ति मिलती है",
      "भक्ति भाव और श्रद्धा बढ़ती है",
      "आत्मा को शुद्धि और शांति मिलती है"
    ],
    whyChantEnglish: [
      "Infuses joy and love into the heart",
      "Frees the mind from negative thinking",
      "Enhances devotional feelings and faith",
      "Purifies the soul and brings inner peace"
    ],
    benefitsHindi: ["मानसिक शांति", "भावनात्मक संतुलन", "आध्यात्मिक विकास", "रक्षा और शक्ति"],
    benefitsEnglish: ["Mental Peace", "Emotional Balance", "Spiritual Growth", "Protection & Power"],
    recommendedCounts: {
      beginner: "108 जप",
      advanced: "1008 जप",
      beginnerTimeHindi: "~15 मिनट",
      beginnerTimeEnglish: "~15 mins",
      advancedTimeHindi: "~90 मिनट",
      advancedTimeEnglish: "~90 mins"
    },
    howToStepsHindi: [
      "संकल्प लें – मन में भगवान कृष्ण की छवि का स्मरण करें",
      "भाव सहित जप करें – प्रेम और भक्ति के भाव से उच्चारण करें",
      "लय बनाएं – कीर्तन या भजन की तरह स्वर में जप करें"
    ],
    howToStepsEnglish: [
      "Take a resolve – Visualize the beautiful form of Lord Krishna.",
      "Chant with emotion – Recite with deep love and devotion.",
      "Establish a rhythm – Chant in a melodious, song-like flow."
    ]
  },
  radhe_radhe: {
    mantraTextHindi: "राधे राधे",
    transliteration: "Radhe Radhe",
    meaningHindi: "राधा रानी का नाम जप, प्रेम, समर्पण और भक्ति की पराकाष्ठा का प्रतीक है। यह जप कृष्ण-प्रेम और निःस्वार्थ भक्ति की भावना जगाता है।",
    meaningEnglish: "Chanting Radha Rani's name symbolizes the peak of divine love and surrender. It awakens selfless devotion and love for Lord Krishna.",
    whyChantHindi: [
      "हृदय में प्रेम और करुणा बढ़ती है",
      "रिश्तों में मधुरता आती है",
      "मन की कठोरता दूर होती है",
      "भक्ति भाव गहरा होता है"
    ],
    whyChantEnglish: [
      "Awakens love and compassion in the heart",
      "Brings sweetness and harmony to relationships",
      "Softens the mind's rigidness",
      "Deepens the mood of devotion"
    ],
    benefitsHindi: ["मानसिक शांति", "भावनात्मक संतुलन", "आध्यात्मिक विकास", "रक्षा और शक्ति"],
    benefitsEnglish: ["Mental Peace", "Emotional Balance", "Spiritual Growth", "Protection & Power"],
    recommendedCounts: {
      beginner: "108 जप",
      advanced: "1008 जप",
      beginnerTimeHindi: "~10 मिनट",
      beginnerTimeEnglish: "~10 mins",
      advancedTimeHindi: "~80 मिनट",
      advancedTimeEnglish: "~80 mins"
    },
    howToStepsHindi: [
      "संकल्प लें – मन में राधा-कृष्ण की युगल छवि का ध्यान करें",
      "भावपूर्ण उच्चारण करें – कोमल स्वर में 'राधे राधे' बोलें",
      "आनंद के साथ जप करें – जप को बोझ न बनाएं, इसे आनंदमय अनुभव बनाएं"
    ],
    howToStepsEnglish: [
      "Take a resolve – Meditate on the divine couple Radha-Krishna.",
      "Chant lovingly – Speak 'Radhe Radhe' in a soft, sweet voice.",
      "Chant with joy – Let it be an ecstatic, light-hearted experience."
    ]
  },
  jai_shree_ram: {
    mantraTextHindi: "जय श्री राम",
    transliteration: "Jai Shree Ram",
    meaningHindi: "भगवान राम की जय हो — यह मंत्र मर्यादा, धर्म, सत्य और साहस के आदर्श पुरुष श्री राम के प्रति श्रद्धा और विजय भाव का उच्चारण है।",
    meaningEnglish: "Victory to Lord Rama — this mantra honors श्री राम as the embodiment of righteousness, truth, and courage.",
    whyChantHindi: [
      "आत्मबल और साहस बढ़ता है",
      "धर्म और सत्य के मार्ग पर चलने की प्रेरणा मिलती है",
      "बाधाओं और भय से मुक्ति मिलती है",
      "मन में अनुशासन और संयम आता है"
    ],
    whyChantEnglish: [
      "Enhances willpower and inner courage",
      "Inspires walking the path of truth and righteousness",
      "Provides relief from obstacles and fears",
      "Brings discipline and self-restraint to the mind"
    ],
    benefitsHindi: ["मानसिक शांति", "भावनात्मक संतुलन", "आध्यात्मिक विकास", "रक्षा और शक्ति"],
    benefitsEnglish: ["Mental Peace", "Emotional Balance", "Spiritual Growth", "Protection & Power"],
    recommendedCounts: {
      beginner: "108 जप",
      advanced: "1008 जप",
      beginnerTimeHindi: "~10 मिनट",
      beginnerTimeEnglish: "~10 mins",
      advancedTimeHindi: "~75 मिनट",
      advancedTimeEnglish: "~75 mins"
    },
    howToStepsHindi: [
      "संकल्प लें – मन में दृढ़ता और साहस का भाव रखें",
      "ओजपूर्ण उच्चारण करें – उत्साह और श्रद्धा के साथ बोलें",
      "नियमितता बनाएं – रोज़ निश्चित संख्या में जप करें"
    ],
    howToStepsEnglish: [
      "Take a resolve – Hold a feeling of strength and courage in the mind.",
      "Chant energetically – Recite with enthusiasm and deep reverence.",
      "Be consistent – Practice a fixed count of chants every day."
    ]
  },
  om_namo_narayanaya: {
    mantraTextHindi: "ॐ नमो नारायणाय",
    transliteration: "Om Namo Narayanaya",
    meaningHindi: "मैं भगवान नारायण (विष्णु) को नमन करता हूं, जो सृष्टि के पालनहार और संरक्षक हैं।",
    meaningEnglish: "I bow to Lord Narayana (Vishnu), the preserver and protector of the universe.",
    whyChantHindi: [
      "जीवन में स्थिरता और संतुलन आता है",
      "आर्थिक और मानसिक सुरक्षा का भाव बढ़ता है",
      "बाधाओं का निवारण होता है",
      "शांति और संतोष की अनुभूति होती है"
    ],
    whyChantEnglish: [
      "Brings stability and balance to life",
      "Enhances feelings of security and mental peace",
      "Helps clear life's obstacles",
      "Grants deep satisfaction and contentment"
    ],
    benefitsHindi: ["मानसिक शांति", "भावनात्मक संतुलन", "आध्यात्मिक विकास", "रक्षा और शक्ति"],
    benefitsEnglish: ["Mental Peace", "Emotional Balance", "Spiritual Growth", "Protection & Power"],
    recommendedCounts: {
      beginner: "108 जप",
      advanced: "1008 जप",
      beginnerTimeHindi: "~12 मिनट",
      beginnerTimeEnglish: "~12 mins",
      advancedTimeHindi: "~85 मिनट",
      advancedTimeEnglish: "~85 mins"
    },
    howToStepsHindi: [
      "संकल्प लें – शांत मन से विष्णु जी का ध्यान करें",
      "स्पष्ट उच्चारण करें – प्रत्येक अक्षर को स्पष्टता से बोलें",
      "श्रद्धा बनाएं – मंत्र को सुरक्षा कवच के रूप में अनुभव करें"
    ],
    howToStepsEnglish: [
      "Take a resolve – Meditate on Lord Vishnu with a quiet mind.",
      "Chant clearly – Pronounce every syllable distinctly.",
      "Feel protected – Experience the mantra as a shield of divine protection."
    ]
  },
  gayatri: {
    mantraTextHindi: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं।\nभर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥",
    transliteration: "Om Bhur Bhuvah Svah Tat Savitur Varenyam\nBhargo Devasya Dhimahi Dhiyo Yo Nah Pracodayat",
    meaningHindi: "हम उस तेजस्वी, दिव्य सूर्य देवता (सविता) का ध्यान करते हैं, जो पृथ्वी, अंतरिक्ष और स्वर्ग में व्याप्त हैं। वे हमारी बुद्धि को प्रकाशित और प्रेरित करें।",
    meaningEnglish: "We meditate on the glowing solar deity (Savitr) who pervades the earth, sky, and heavens. May He illumine and inspire our intellect.",
    whyChantHindi: [
      "बुद्धि और एकाग्रता तेज होती है",
      "ज्ञान और विवेक की प्राप्ति होती है",
      "नकारात्मकता का नाश होता है",
      "आत्मिक प्रकाश और स्पष्टता मिलती है"
    ],
    whyChantEnglish: [
      "Sharpens intellect and concentration",
      "Brings wisdom and discernment",
      "Destroys negativity",
      "Grants spiritual light and mental clarity"
    ],
    benefitsHindi: ["मानसिक शांति", "भावनात्मक संतुलन", "आध्यात्मिक विकास", "रक्षा और शक्ति"],
    benefitsEnglish: ["Mental Peace", "Emotional Balance", "Spiritual Growth", "Protection & Power"],
    recommendedCounts: {
      beginner: "11 जप",
      advanced: "108 जप",
      beginnerTimeHindi: "~10 मिनट",
      beginnerTimeEnglish: "~10 mins",
      advancedTimeHindi: "~45 मिनट",
      advancedTimeEnglish: "~45 mins"
    },
    howToStepsHindi: [
      "संकल्प लें – सूर्य की ओर मुख करके बैठें (विशेषतः सुबह)",
      "शुद्ध संस्कृत उच्चारण करें – मंत्र के सही उच्चारण का अभ्यास करें",
      "ध्यानपूर्वक जप करें – अर्थ पर मनन करते हुए जप करें"
    ],
    howToStepsEnglish: [
      "Take a resolve – Sit facing the sun (especially during morning hours).",
      "Chant Sanskrit correctly – Pay close attention to Vedic pronunciation.",
      "Chant mindfully – Recite while reflecting deeply on the meaning."
    ]
  }
};

function getMantraDetailsKey(mantra: Mantra): string {
  const name = (mantra.name_english || "").trim();
  if (name === "Om Chanting") return "om";
  if (name === "Om Namah Shivaya") return "om_namah_shivaya";
  if (name === "Mahamrityunjaya Mantra") return "mahamrityunjaya";
  if (name === "Hare Krishna Mahamantra") return "hare_krishna";
  if (name === "Radhe Radhe") return "radhe_radhe";
  if (name === "Jai Shree Ram") return "jai_shree_ram";
  if (name === "Om Namo Narayanaya") return "om_namo_narayanaya";
  if (name === "Gayatri Mantra") return "gayatri";

  // Fallback checks
  const nameLower = name.toLowerCase();
  if (nameLower.includes("shiva") || nameLower.includes("shivaya")) return "om_namah_shivaya";
  if (nameLower.includes("mrityunjaya")) return "mahamrityunjaya";
  if (nameLower.includes("krishna")) return "hare_krishna";
  if (nameLower.includes("radhe")) return "radhe_radhe";
  if (nameLower.includes("ram") || nameLower.includes("rama")) return "jai_shree_ram";
  if (nameLower.includes("narayanaya")) return "om_namo_narayanaya";
  if (nameLower.includes("gayatri")) return "gayatri";

  return "om";
}

type MantraDetailViewProps = {
  mantra: Mantra;
  image: string | undefined;
  stats: JapTotal | undefined;
  onBack: () => void;
  onStartJapa: () => void;
};

export default function MantraDetailView({
  mantra,
  image,
  stats,
  onBack,
  onStartJapa,
}: MantraDetailViewProps) {
  const { language } = useLanguage();
  const isHi = language === "hi";

  // State for Audio Player Demo
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Get details
  const detailsKey = getMantraDetailsKey(mantra);
  const detail = MANTRA_DETAILS[detailsKey] || MANTRA_DETAILS["om"];

  // Total and streak
  const totalChants = stats?.total_chants ?? 0;
  const currentStreak = stats?.current_streak ?? 0;

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const startAudio = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Create main carrier oscillator for a deep cosmic "Aum" hum
      const osc = ctx.createOscillator();
      // 136.1 Hz is the frequency of the Earth's year (Cosmic Octave), traditionally associated with Om/Pranava
      osc.type = "sine";
      osc.frequency.setValueAtTime(136.1, ctx.currentTime);

      // Create a second harmonizing oscillator for a richer singing bowl texture (third harmonic)
      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(136.1 * 1.5, ctx.currentTime); // Perfect fifth harmonic (204.15 Hz)

      // Create gain nodes
      const gainNode = ctx.createGain();
      const gainNode2 = ctx.createGain();
      const masterGain = ctx.createGain();

      gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
      gainNode2.gain.setValueAtTime(0.15, ctx.currentTime);

      // Slow fading envelope
      masterGain.gain.setValueAtTime(0.01, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.5); // fade in

      // Connect nodes
      osc.connect(gainNode);
      osc2.connect(gainNode2);
      gainNode.connect(masterGain);
      gainNode2.connect(masterGain);
      masterGain.connect(ctx.destination);

      // Start oscillators
      osc.start();
      osc2.start();

      oscillatorRef.current = osc;
      gainNodeRef.current = masterGain;
      
      // Keep track of the second osc to stop it as well
      (osc as any).subOsc = osc2;

      setIsPlaying(true);
    } catch (err) {
      console.error("Web Audio API not supported or failed:", err);
    }
  };

  const stopAudio = () => {
    if (oscillatorRef.current && gainNodeRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      const osc = oscillatorRef.current;
      const gain = gainNodeRef.current;

      try {
        // Slow fade out
        gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        
        setTimeout(() => {
          try {
            osc.stop();
            if ((osc as any).subOsc) {
              (osc as any).subOsc.stop();
            }
          } catch (e) {}
        }, 350);
      } catch (e) {
        try {
          osc.stop();
        } catch (x) {}
      }

      oscillatorRef.current = null;
      gainNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  const handlePlayToggle = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: isHi ? mantra.name_hindi : mantra.name_english,
        text: isHi 
          ? `चेक करें: ${mantra.name_hindi} - मंत्र साधना विवरण`
          : `Check out: ${mantra.name_english} - Mantra Sadhana Details`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback
      alert(isHi ? "लिंक कॉपी किया गया!" : "Link copied to clipboard!");
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0503] via-[#0d0705] to-[#040202] pb-32 text-amber-50 relative select-none">
      {/* Background soft glowing spots */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(217,119,6,0.12),transparent)]" />

      {/* ─── FLOATING BACK & SHARE BUTTONS ──────────────────────── */}
      <div className="sticky top-0 z-40 bg-[#0a0503]/80 backdrop-blur-md border-b border-white/5 px-4 py-4 flex items-center justify-between w-full">
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 border border-white/10 hover:bg-white/5 hover:border-amber-500/30 text-amber-100 active:scale-95 transition-all"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="text-base md:text-lg font-bold font-display text-white truncate max-w-[60%]">
          {isHi ? mantra.name_hindi : mantra.name_english}
        </h1>

        <button
          onClick={handleShare}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 border border-white/10 hover:bg-white/5 hover:border-amber-500/30 text-amber-100 active:scale-95 transition-all"
          aria-label="Share"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* ─── MAIN SCROLL CONTAINER ──────────────────────────────── */}
      <div className="mx-auto max-w-4xl px-4 mt-6 space-y-6">

        {/* ─── DEITY COVER HEADER SECTION ─────────────────────────── */}
        <section className="relative overflow-hidden rounded-[2.5rem] border border-amber-500/10 bg-gradient-to-r from-[#170e0a] to-[#0d0705] p-5 sm:p-6 shadow-2xl">
          <div className="grid grid-cols-12 gap-6 items-center">
            {/* Left: Rounded Deity Image */}
            <div className="col-span-12 sm:col-span-5 flex justify-center">
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-[2rem] overflow-hidden border border-amber-500/20 shadow-[0_10px_35px_rgba(0,0,0,0.6)] group">
                {image ? (
                  <img
                    src={image}
                    alt=""
                    className="h-full w-full object-cover object-center group-hover:scale-105 transition duration-700"
                  />
                ) : (
                  <div className="h-full w-full bg-[#120a06]/40 flex items-center justify-center">
                    <span className="text-5xl text-orange-400 font-display">ॐ</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Right: Mantra Titles & Badges */}
            <div className="col-span-12 sm:col-span-7 flex flex-col items-center sm:items-start text-center sm:text-left space-y-3 sm:space-y-4">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white tracking-wide leading-tight drop-shadow-md">
                  {isHi ? mantra.name_hindi : mantra.name_english}
                </h2>
                <p className="text-[11px] sm:text-xs text-amber-400/80 font-bold uppercase tracking-wider mt-1">
                  {isHi ? `← ${mantra.name_english} →` : `← ${mantra.name_english} →`}
                </p>
                <p className="text-xs text-white/40 font-medium mt-1">
                  {isHi ? (mantra.type === "mantra" ? "मंत्र साधना" : "ध्यान साधना") : (mantra.type === "mantra" ? "Mantra Sadhana" : "Dhyan Sadhana")}
                </p>
              </div>

              {/* Stats Badges */}
              <div className="flex items-center gap-3 pt-1">
                {/* Total Jap */}
                <div className="flex items-center gap-2 rounded-xl bg-amber-500/[0.03] border border-amber-500/10 px-3.5 py-2">
                  <Activity className="w-4 h-4 text-amber-500 shrink-0" />
                  <div className="text-left">
                    <p className="text-xs sm:text-sm font-bold text-white leading-none">
                      {totalChants.toLocaleString()}
                    </p>
                    <p className="text-[8px] sm:text-[9px] text-white/30 font-bold uppercase tracking-wide mt-1">
                      {isHi ? "कुल जाप" : "Total Jap"}
                    </p>
                  </div>
                </div>

                {/* Day Streak */}
                <div className="flex items-center gap-2 rounded-xl bg-amber-500/[0.03] border border-amber-500/10 px-3.5 py-2">
                  <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                  <div className="text-left">
                    <p className="text-xs sm:text-sm font-bold text-white leading-none">
                      {currentStreak}
                    </p>
                    <p className="text-[8px] sm:text-[9px] text-white/30 font-bold uppercase tracking-wide mt-1">
                      {isHi ? "सिलसिला" : "Day Streak"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ─── CARD 0: MANTRA TEXT ────────────────────────────────── */}
        <section className="bg-[#130d0a]/60 backdrop-blur-xl border border-amber-500/10 rounded-[2rem] p-6 md:p-8 relative overflow-hidden shadow-lg text-center">
          {/* Background Mandalas */}
          <MandalaBg className="absolute -left-16 -bottom-16 w-40 h-40 text-amber-500/[0.02] pointer-events-none" />
          <MandalaBg className="absolute -right-16 -top-16 w-40 h-40 text-amber-500/[0.02] pointer-events-none" />

          <div className="flex flex-col items-center space-y-5 relative z-10">
            <h3 className="text-xs md:text-sm font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <span className="text-xl font-display text-amber-500 leading-none">🕉️</span>
              {isHi ? "मूल मंत्र एवं लिप्यांतरण" : "Sacred Text & Transliteration"}
            </h3>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {/* Devanagari Card */}
              <div className="bg-amber-950/10 border border-amber-500/15 rounded-2xl p-5 md:p-6 flex flex-col justify-center items-center relative group hover:border-amber-500/30 transition-all duration-300">
                <div className="absolute top-2 left-3 text-[9px] font-black uppercase tracking-wider text-amber-500/50">
                  {isHi ? "देवनागरी (संस्कृत)" : "Devanagari (Sanskrit)"}
                </div>
                <p className="font-serif text-2xl md:text-3xl lg:text-4xl text-amber-300 font-bold leading-normal tracking-wide drop-shadow-[0_2px_8px_rgba(245,158,11,0.25)] whitespace-pre-line mt-3 select-all">
                  {detail.mantraTextHindi || mantra.full_text_hindi}
                </p>
              </div>

              {/* Transliteration Card */}
              <div className="bg-black/20 border border-white/5 rounded-2xl p-5 md:p-6 flex flex-col justify-center items-center relative group hover:border-amber-500/20 transition-all duration-300">
                <div className="absolute top-2 left-3 text-[9px] font-black uppercase tracking-wider text-brand-cream/30">
                  {isHi ? "रोमन लिप्यांतरण (रोमन लिपि)" : "Roman Transliteration (English)"}
                </div>
                <p className="text-base md:text-lg text-brand-cream/80 tracking-wider font-sans italic whitespace-pre-line mt-3 select-all">
                  {detail.transliteration || mantra.transliteration}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── CARD 1: MEANING OF MANTRA ─────────────────────────── */}
        <section className="bg-[#130d0a]/60 backdrop-blur-xl border border-amber-500/10 rounded-[2rem] p-6 relative overflow-hidden shadow-lg">
          {/* Background Mandalas */}
          <MandalaBg className="absolute -left-12 -top-12 w-36 h-36 text-amber-500/[0.02] pointer-events-none" />
          <MandalaBg className="absolute -right-12 -bottom-12 w-36 h-36 text-amber-500/[0.02] pointer-events-none" />

          <div className="flex flex-col items-center text-center space-y-4 relative z-10">
            <h3 className="text-sm md:text-base font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-500" />
              {isHi ? "इस मंत्र का अर्थ" : "Meaning of this Mantra"}
            </h3>
            
            <p className="font-serif text-lg md:text-xl text-white font-semibold max-w-2xl leading-relaxed italic px-4">
              “ {isHi ? detail.meaningHindi : detail.meaningEnglish} ”
            </p>
          </div>
        </section>

        {/* ─── CARD 2: WHY CHANT THIS MANTRA ──────────────────────── */}
        <section className="bg-[#130d0a]/60 backdrop-blur-xl border border-amber-500/10 rounded-[2rem] p-6 shadow-lg">
          <div className="space-y-5">
            <h3 className="text-sm md:text-base font-bold text-amber-400 uppercase tracking-widest text-center flex items-center justify-center gap-2">
              <Flower2 className="w-4.5 h-4.5 text-amber-500" />
              {isHi ? "क्यों करें इस मंत्र का जाप?" : "Why Chant this Mantra?"}
            </h3>

            {/* Grid of Reasons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {(isHi ? detail.whyChantHindi : detail.whyChantEnglish).map((reason, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 bg-white/[0.01] border border-white/5 rounded-2xl p-4 transition-all hover:bg-white/[0.02]"
                >
                  <div className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 mt-0.5 shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3px]" />
                  </div>
                  <span className="text-sm text-amber-100/70 font-medium leading-snug">
                    {reason}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── ROW: BENEFITS AND AUDIO LISTEN ────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Card 3: Benefits (इस मंत्र के लाभ) */}
          <section className="bg-[#130d0a]/60 backdrop-blur-xl border border-amber-500/10 rounded-[2rem] p-6 flex flex-col justify-between shadow-lg">
            <h3 className="text-sm md:text-base font-bold text-amber-400 uppercase tracking-widest text-center flex items-center justify-center gap-2 mb-6">
              <Sparkles className="w-4.5 h-4.5 text-amber-500" />
              {isHi ? "इस मंत्र के लाभ" : "Benefits of this Mantra"}
            </h3>

            <div className="grid grid-cols-2 gap-6 max-w-xs mx-auto w-full">
              {/* Yogi / Mental Peace */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.03)]">
                  <YogiIcon className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold text-white/80">
                  {isHi ? detail.benefitsHindi[0] : detail.benefitsEnglish[0]}
                </span>
              </div>

              {/* Heart / Emotional Balance */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.03)]">
                  <HeartIcon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-white/80">
                  {isHi ? detail.benefitsHindi[1] : detail.benefitsEnglish[1]}
                </span>
              </div>

              {/* Lotus / Spiritual Dev */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.03)]">
                  <Flower2 className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold text-white/80">
                  {isHi ? detail.benefitsHindi[2] : detail.benefitsEnglish[2]}
                </span>
              </div>

              {/* Shield / Protection */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.03)]">
                  <ShieldCrossIcon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-white/80">
                  {isHi ? detail.benefitsHindi[3] : detail.benefitsEnglish[3]}
                </span>
              </div>
            </div>
          </section>

          {/* Card 4: Audio listen (मंत्र सुनें) */}
          <section className="bg-[#130d0a]/60 backdrop-blur-xl border border-amber-500/10 rounded-[2rem] p-6 flex flex-col justify-between items-center shadow-lg text-center">
            <h3 className="text-sm md:text-base font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <Headphones className="w-4 h-4 text-amber-500" />
              {isHi ? "मंत्र सुनें" : "Listen to Mantra"}
            </h3>
            <p className="text-[11px] sm:text-xs text-white/40 mt-1 font-medium">
              {isHi ? "शुद्ध उच्चारण सुनें" : "Listen to pure pronunciation"}
            </p>

            {/* Audio Wave & Play Button */}
            <div className="flex items-center justify-center gap-6 my-4 w-full px-4">
              {/* Left Wave */}
              <div className="flex items-end gap-1 h-8 w-14 overflow-hidden">
                {[0.4, 0.7, 0.3, 0.9, 0.5, 0.8, 0.2].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={isPlaying ? { height: ["10%", "90%", "10%"] } : { height: `${h * 100}%` }}
                    transition={isPlaying ? { duration: 1.2, repeat: Infinity, delay: i * 0.15 } : {}}
                    className="w-1.5 rounded-full bg-amber-500/20"
                    style={{ height: `${h * 100}%` }}
                  />
                ))}
              </div>

              {/* Play / Pause Trigger */}
              <button
                onClick={handlePlayToggle}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95 transition-all"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 fill-current" />
                ) : (
                  <Play className="w-7 h-7 fill-current translate-x-[1px]" />
                )}
              </button>

              {/* Right Wave */}
              <div className="flex items-end gap-1 h-8 w-14 overflow-hidden">
                {[0.2, 0.8, 0.5, 0.9, 0.3, 0.7, 0.4].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={isPlaying ? { height: ["10%", "90%", "10%"] } : { height: `${h * 100}%` }}
                    transition={isPlaying ? { duration: 1.2, repeat: Infinity, delay: i * 0.12 } : {}}
                    className="w-1.5 rounded-full bg-amber-500/20"
                    style={{ height: `${h * 100}%` }}
                  />
                ))}
              </div>
            </div>

            <span className="text-xs font-bold text-amber-500/70 tracking-widest mt-1">
              {isHi ? `← ${mantra.name_hindi} →` : `← ${mantra.name_english} →`}
            </span>
          </section>
        </div>

        {/* ─── ROW: BEST TIMES AND RECOMMENDED COUNTS ────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Card 5: Best Times (सर्वश्रेष्ठ समय) */}
          <section className="bg-[#130d0a]/60 backdrop-blur-xl border border-amber-500/10 rounded-[2rem] p-6 shadow-lg flex flex-col justify-between">
            <h3 className="text-sm md:text-base font-bold text-amber-400 uppercase tracking-widest text-center flex items-center justify-center gap-2 mb-6">
              <Clock className="w-4 h-4 text-amber-500" />
              {isHi ? "सर्वश्रेष्ठ समय" : "Best Time to Chant"}
            </h3>

            <div className="grid grid-cols-3 gap-3 w-full">
              {/* Brahm Muhurat */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-400">
                  <Sun className="w-5.5 h-5.5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-white">
                    {isHi ? "ब्रह्म मुहूर्त" : "Brahm Muhurat"}
                  </p>
                  <p className="text-[10px] text-white/50 mt-0.5 leading-none">
                    4:00 AM - 6:00 AM
                  </p>
                  <span className="inline-block text-[8px] bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-full px-2 py-0.5 mt-1 font-bold">
                    {isHi ? "सबसे उत्तम" : "Best"}
                  </span>
                </div>
              </div>

              {/* Sunrise */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-400">
                  <Sun className="w-5.5 h-5.5 animate-pulse" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-white">
                    {isHi ? "सूर्योदय" : "Sunrise"}
                  </p>
                  <p className="text-[10px] text-white/50 mt-0.5 leading-none">
                    6:00 AM - 8:00 AM
                  </p>
                  <span className="inline-block text-[8px] bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-full px-2 py-0.5 mt-1 font-bold">
                    {isHi ? "बहुत शुभ" : "Auspicious"}
                  </span>
                </div>
              </div>

              {/* Sunset */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-400">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-white">
                    {isHi ? "संध्या समय" : "Sunset"}
                  </p>
                  <p className="text-[10px] text-white/50 mt-0.5 leading-none">
                    5:00 PM - 9:00 PM
                  </p>
                  <span className="inline-block text-[8px] bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-full px-2 py-0.5 mt-1 font-bold">
                    {isHi ? "शुभ समय" : "Good Time"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Card 6: Recommended Chants (अनुशंसित जप संख्या) */}
          <section className="bg-[#130d0a]/60 backdrop-blur-xl border border-amber-500/10 rounded-[2rem] p-6 shadow-lg flex flex-col justify-between">
            <h3 className="text-sm md:text-base font-bold text-amber-400 uppercase tracking-widest text-center flex items-center justify-center gap-2 mb-6">
              <Compass className="w-4.5 h-4.5 text-amber-500" />
              {isHi ? "अनुशंसित जप संख्या" : "Recommended Chants"}
            </h3>

            <div className="grid grid-cols-2 gap-4 divide-x divide-white/5 w-full items-center">
              {/* Beginner */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/5 border border-amber-500/20 text-amber-500">
                  <span className="text-xs font-bold font-display">108</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    {isHi ? "Beginner" : "Beginner"}
                  </p>
                  <p className="text-lg font-bold text-amber-500 mt-1 leading-none">
                    {detail.recommendedCounts.beginner}
                  </p>
                  <p className="text-[10px] text-white/40 mt-1 font-medium">
                    {isHi ? detail.recommendedCounts.beginnerTimeHindi : detail.recommendedCounts.beginnerTimeEnglish}
                  </p>
                </div>
              </div>

              {/* Advanced */}
              <div className="flex flex-col items-center text-center space-y-2 pl-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/5 border border-amber-500/20 text-amber-500">
                  <span className="text-xs font-bold font-display">1008</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    {isHi ? "Advanced" : "Advanced"}
                  </p>
                  <p className="text-lg font-bold text-amber-500 mt-1 leading-none">
                    {detail.recommendedCounts.advanced}
                  </p>
                  <p className="text-[10px] text-white/40 mt-1 font-medium">
                    {isHi ? detail.recommendedCounts.advancedTimeHindi : detail.recommendedCounts.advancedTimeEnglish}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

                {/* ─── CARD 7: HOW TO JAPA STEPS FLOW ──────────────────────── */}
        <section className="bg-[#130d0a]/65 backdrop-blur-xl border border-amber-500/10 rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden">
          {/* Decorative background mandala segment */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/[0.02] rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-8">
            {/* Guide Header */}
            <div className="text-center space-y-2.5">
              <h3 className="text-2xl md:text-3xl font-display font-bold text-amber-400 flex items-center justify-center gap-3">
                <span className="text-amber-600/60 font-light">✦</span>
                {isHi ? "अभ्यास कैसे करें" : "How To Practice"}
                <span className="text-amber-600/60 font-light">✦</span>
              </h3>
              <p className="text-xs md:text-sm font-medium text-brand-cream/50 tracking-wider flex items-center justify-center gap-2 uppercase">
                <span className="text-amber-500/40">◆</span>
                {isHi ? "सर्वश्रेष्ठ अनुभव के लिए इन चरणों का पालन करें" : "Follow these steps for the best experience"}
                <span className="text-amber-500/40">◆</span>
              </p>
            </div>

            {/* Steps Container */}
            <div className="grid grid-cols-1 gap-5">
              {japaStepsData.map((step) => (
                <div
                  key={step.num}
                  className="bg-black/35 border border-white/5 hover:border-amber-500/25 rounded-2xl p-4 md:p-5 flex items-center gap-5 transition-all duration-300 group text-left"
                >
                  {/* Left: Illustration */}
                  <div className="shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border border-amber-500/10 flex items-center justify-center bg-black/40 group-hover:border-amber-500/25 transition-colors relative">
                    {step.isSvg ? (
                      <div className="w-full h-full flex items-center justify-center bg-teal-950/10 relative rounded-xl">
                        <div className="absolute inset-0 bg-teal-500/[0.03] rounded-xl" />
                        <svg className="w-12 h-12 text-teal-400/80 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M2 8h10a4 4 0 0 1 0 8H8" strokeLinecap="round" strokeDecode="async" />
                          <path d="M4 12h14a3 3 0 0 0 0-6H14" strokeLinecap="round" />
                          <path d="M1 16h18a2 2 0 0 0 0-4H16" strokeLinecap="round" />
                        </svg>
                      </div>
                    ) : (
                      <img src={step.img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                  </div>

                  {/* Right: Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-6 h-6 rounded-full border border-amber-500/30 flex items-center justify-center text-amber-500 font-display font-bold text-xs shrink-0 bg-amber-500/5">
                        {step.num}
                      </span>
                      <h4 className="font-display font-bold text-base md:text-lg text-amber-400 group-hover:text-amber-300 transition-colors">
                        {isHi ? step.titleHi : step.titleEn}
                      </h4>
                    </div>
                    <p className="text-sm text-brand-cream/65 leading-relaxed group-hover:text-brand-cream/85 transition-colors">
                      {isHi ? step.descHi : step.descEn}
                    </p>
                    {step.hasAudio && (
                      <button 
                        onClick={handlePlayToggle}
                        className="mt-2 inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors select-none"
                      >
                        {isPlaying ? (
                          <>
                            <span className="relative flex h-2 w-2 mr-1">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                              <span className="relative rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                            {isHi ? "रोकें" : "Stop Pronunciation"}
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-current" />
                            {isHi ? "उच्चारण सुनें" : "Play Pronunciation"}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* ─── COMMON MISTAKES SECTION ──────────────────────── */}
            <div className="border-t border-amber-500/10 pt-8 mt-4">
              <h4 className="text-center font-display font-bold text-lg md:text-xl text-amber-400 flex items-center justify-center gap-3 mb-6">
                <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-500/40" />
                {isHi ? "सामान्य गलतियाँ" : "Common Mistakes"}
                <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-500/40" />
              </h4>

              <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-black/20 border border-white/5 rounded-2xl p-5 md:p-6">
                {/* Left side: list of mistakes */}
                <div className="flex-1 space-y-3 w-full text-left">
                  {[
                    { hi: "बहुत तेज़ी से जप करना", en: "Chanting too fast" },
                    { hi: "काम या अन्य बातों के बारे में सोचना", en: "Thinking about work or other things" },
                    { hi: "जप करते समय फोन का उपयोग करना", en: "Using phone while chanting" },
                    { hi: "बिना समझे यंत्रवत् जप करना", en: "Chanting without understanding" }
                  ].map((mistake, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0 text-xs font-bold mt-0.5">
                        ✕
                      </span>
                      <p className="text-sm text-brand-cream/70 font-medium">
                        {isHi ? mistake.hi : mistake.en}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Right side: incense smoke illustration */}
                <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                  {/* Rising smoke wisps using existing .smoke-wisp animation */}
                  <div className="absolute bottom-[3.5rem] w-8 h-20 overflow-visible pointer-events-none flex justify-center z-10">
                    <div className="smoke-wisp absolute bottom-0 w-2 h-16" style={{ animationDelay: '0s' }} />
                    <div className="smoke-wisp absolute bottom-0 w-3 h-14" style={{ animationDelay: '1.5s' }} />
                    <div className="smoke-wisp absolute bottom-0 w-1.5 h-18" style={{ animationDelay: '3s' }} />
                  </div>
                  {/* Brass Diya Image */}
                  <img 
                    src="/images/diya-brass.png" 
                    alt="Incense burner" 
                    className="w-24 h-24 object-contain filter drop-shadow-[0_0_12px_rgba(245,158,11,0.25)] relative z-20" 
                  />
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ─── BOTTOM FLOATING ACTION CTA BUTTON ──────────────────── */}
        <section className="sticky bottom-4 z-30 pt-4 flex flex-col items-center space-y-2 w-full max-w-md mx-auto">
          <button
            onClick={onStartJapa}
            className="w-full group flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 active:scale-98 text-white font-bold px-8 py-4 rounded-3xl shadow-[0_12px_28px_rgba(249,115,22,0.45)] border border-amber-400/20 transition-all duration-300"
          >
            <span className="text-xl font-display text-amber-100 leading-none">ॐ</span>
            <span>
              {isHi ? "जप सीखें और प्रारंभ करें" : "Learn & Start Japa"}
            </span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-[10px] text-white/35 font-bold uppercase tracking-wider flex items-center gap-1.5 justify-center">
            <ShieldCrossIcon className="w-3.5 h-3.5 text-amber-500/70" />
            {isHi ? "आपकी साधना सुरक्षित और निजी है" : "Your Sadhana is Secure & Private"}
          </p>
        </section>

      </div>
    </div>
  );
}
