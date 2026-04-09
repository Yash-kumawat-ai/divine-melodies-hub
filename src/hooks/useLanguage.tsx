import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type SupportedLanguage = 'en' | 'hi' | 'gu' | 'mr' | 'bn' | 'ta';

type TranslationKey =
  | 'home'
  | 'browse'
  | 'trending'
  | 'search'
  | 'upload'
  | 'login'
  | 'logout'
  | 'profile'
  | 'setPhoto'
  | 'language'
  | 'addBhajan'
  | 'shareCommunity'
  | 'god'
  | 'lyrics'
  | 'details'
  | 'selectGodForBhajan'
  | 'addAnotherGod'
  | 'addDeityHint'
  | 'changeGod';

const translations: Record<SupportedLanguage, Record<TranslationKey, string>> = {
  en: {
    home: 'Home',
    browse: 'Browse',
    trending: 'Trending',
    search: 'Search',
    upload: 'Upload',
    login: 'Log in',
    logout: 'Log out',
    profile: 'Profile',
    setPhoto: 'Set profile photo',
    language: 'Language',
    addBhajan: 'Add Bhajan',
    shareCommunity: 'Share your favorite devotional songs with our community',
    god: 'God',
    lyrics: 'Lyrics',
    details: 'Details',
    selectGodForBhajan: 'Select God for Bhajan',
    addAnotherGod: 'Add Another God',
    addDeityHint: 'Add a deity not in the list',
    changeGod: 'Change God',
  },
  hi: {
    home: 'होम',
    browse: 'भजन सूची',
    trending: 'ट्रेंडिंग',
    search: 'खोज',
    upload: 'अपलोड',
    login: 'लॉग इन',
    logout: 'लॉग आउट',
    profile: 'प्रोफाइल',
    setPhoto: 'प्रोफाइल फोटो सेट करें',
    language: 'भाषा',
    addBhajan: 'भजन जोड़ें',
    shareCommunity: 'अपने पसंदीदा भजन समुदाय के साथ साझा करें',
    god: 'भगवान',
    lyrics: 'गीत',
    details: 'विवरण',
    selectGodForBhajan: 'भजन के लिए भगवान चुनें',
    addAnotherGod: 'एक और भगवान जोड़ें',
    addDeityHint: 'सूची में न होने पर नया जोड़ें',
    changeGod: 'भगवान बदलें',
  },
  gu: {
    home: 'હોમ',
    browse: 'ભજન',
    trending: 'ટ્રેન્ડિંગ',
    search: 'શોધો',
    upload: 'અપલોડ',
    login: 'લોગ ઇન',
    logout: 'લોગ આઉટ',
    profile: 'પ્રોફાઇલ',
    setPhoto: 'પ્રોફાઇલ ફોટો સેટ કરો',
    language: 'ભાષા',
    addBhajan: 'ભજન ઉમેરો',
    shareCommunity: 'તમારા પ્રિય ભજન સમાજ સાથે શેર કરો',
    god: 'ભગવાન',
    lyrics: 'ગીત',
    details: 'વિગતો',
    selectGodForBhajan: 'ભજન માટે ભગવાન પસંદ કરો',
    addAnotherGod: 'બીજા ભગવાન ઉમેરો',
    addDeityHint: 'યાદીમાં ન હોય તો ઉમેરો',
    changeGod: 'ભગવાન બદલો',
  },
  mr: {
    home: 'मुख्यपृष्ठ',
    browse: 'भजने',
    trending: 'ट्रेंडिंग',
    search: 'शोधा',
    upload: 'अपलोड',
    login: 'लॉग इन',
    logout: 'लॉग आउट',
    profile: 'प्रोफाइल',
    setPhoto: 'प्रोफाइल फोटो सेट करा',
    language: 'भाषा',
    addBhajan: 'भजन जोडा',
    shareCommunity: 'तुमची आवडती भजने समुदायासोबत शेअर करा',
    god: 'देव',
    lyrics: 'गीत',
    details: 'तपशील',
    selectGodForBhajan: 'भजनासाठी देव निवडा',
    addAnotherGod: 'आणखी एक देव जोडा',
    addDeityHint: 'यादीत नसल्यास नवीन जोडा',
    changeGod: 'देव बदला',
  },
  bn: {
    home: 'হোম',
    browse: 'ভজন',
    trending: 'ট্রেন্ডিং',
    search: 'খুঁজুন',
    upload: 'আপলোড',
    login: 'লগ ইন',
    logout: 'লগ আউট',
    profile: 'প্রোফাইল',
    setPhoto: 'প্রোফাইল ছবি সেট করুন',
    language: 'ভাষা',
    addBhajan: 'ভজন যোগ করুন',
    shareCommunity: 'আপনার প্রিয় ভজন কমিউনিটির সাথে শেয়ার করুন',
    god: 'ঈশ্বর',
    lyrics: 'গান',
    details: 'বিস্তারিত',
    selectGodForBhajan: 'ভজনের জন্য ঈশ্বর নির্বাচন করুন',
    addAnotherGod: 'আরও একটি ঈশ্বর যোগ করুন',
    addDeityHint: 'তালিকায় না থাকলে যোগ করুন',
    changeGod: 'ঈশ্বর পরিবর্তন করুন',
  },
  ta: {
    home: 'முகப்பு',
    browse: 'பஜன்கள்',
    trending: 'டிரெண்டிங்',
    search: 'தேடல்',
    upload: 'பதிவேற்று',
    login: 'உள்நுழை',
    logout: 'வெளியேறு',
    profile: 'சுயவிவரம்',
    setPhoto: 'சுயவிவரப் புகைப்படம் அமை',
    language: 'மொழி',
    addBhajan: 'பஜன் சேர்க்கவும்',
    shareCommunity: 'உங்கள் விருப்ப பஜன்களை சமூகத்துடன் பகிரவும்',
    god: 'கடவுள்',
    lyrics: 'வரிகள்',
    details: 'விவரங்கள்',
    selectGodForBhajan: 'பஜனுக்கு கடவுளை தேர்வு செய்யவும்',
    addAnotherGod: 'மற்றொரு கடவுளை சேர்',
    addDeityHint: 'பட்டியலில் இல்லையெனில் புதிதாக சேர்க்கவும்',
    changeGod: 'கடவுளை மாற்று',
  },
};

interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  t: (key: TranslationKey, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    const stored = localStorage.getItem('app_language') as SupportedLanguage | null;
    return stored || 'en';
  });

  useEffect(() => {
    localStorage.setItem('app_language', language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: TranslationKey, fallback?: string) => {
        return translations[language][key] || fallback || key;
      },
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }
  return context;
}

export const languageOptions: Array<{ code: SupportedLanguage; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'mr', label: 'Marathi' },
  { code: 'bn', label: 'Bengali' },
  { code: 'ta', label: 'Tamil' },
];
