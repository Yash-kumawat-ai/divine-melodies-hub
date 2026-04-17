import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type SupportedLanguage = 'en' | 'hi' | 'gu' | 'mr' | 'bn' | 'ta';

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
  | 'changeGod'
  | 'bhajansCount'
  | 'allBhajans'
  | 'browseOurCollection'
  | 'findLyricsAndMeaning'
  | 'bhajansSandhya'
  | 'completeDevotionalMusic'
  | 'featuredBhajans'
  | 'popularBhajans'
  | 'communityBhajans'
  | 'sharedByOurCommunity'
  | 'allDeities'
  | 'exploreDeities'
  | 'browseByDeity'
  | 'devotionalSongs'
  | 'recentBhajans'
  | 'latestUploads'
  | 'trending'
  | 'trendingHour'
  | 'trendingDaily'
  | 'trendingWeekly'
  | 'trendingAllTime'
  | 'plays'
  | 'rating'
  | 'play'
  | 'viewDetails'
  | 'noResults'
  | 'tryAdjustingFilters'
  | 'allRatings'
  | 'stars'
  | 'latest'
  | 'mostPlayed'
  | 'highestRated'
  | 'sortBy'
  | 'filterByDeity'
  | 'clearFilters'
  | 'showing'
  | 'of'
  | 'notifications'
  | 'whatsapp'
  | 'telegram'
  | 'email'
  | 'copyLink'
  | 'copied'
  | 'deity'
  | 'singer'
  | 'tags'
  | 'relatedBhajans'
  | 'shareOnWhatsapp'
  | 'shareOnTelegram'
  | 'shareViaEmail'
  | 'copyShareLink'
  | 'linkCopied'
  | 'kirtanAi'
  | 'elderlyAssistant'
  | 'uploadBhajan'
  | 'adminModeration'
  | 'adminAccounts'
  | 'auditLog'
  | 'admin'
  | 'setProfilePhoto';

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
    bhajansCount: 'Bhajans',
    allBhajans: 'All Bhajans',
    browseOurCollection: 'Browse our collection of sacred songs, stotrams, and mantras',
    findLyricsAndMeaning: 'Find the lyrics and meaning for your daily devotion',
    bhajansSandhya: 'Bhajan Sangrah',
    completeDevotionalMusic: 'Your complete devotional music collection — lyrics, audio & more',
    featuredBhajans: 'Featured Bhajans',
    popularBhajans: 'लोकप्रिय भजन',
    communityBhajans: 'Community Bhajans',
    sharedByOurCommunity: 'समुदाय द्वारा साझा किए गए भजन',
    allDeities: 'All Deities',
    exploreDeities: 'Explore the divine across traditions and stories',
    browseByDeity: 'Browse by Deity',
    devotionalSongs: 'देवता के अनुसार भजन खोजें',
    recentBhajans: 'Recent Bhajans',
    latestUploads: 'Latest uploads from our community',
    trending: 'Trending',
    trendingHour: 'Trending This Hour',
    trendingDaily: 'Trending Today',
    trendingWeekly: 'Trending This Week',
    trendingAllTime: 'All Time Trending',
    plays: 'plays',
    rating: 'rating',
    play: 'Play',
    viewDetails: 'View Details',
    noResults: 'No bhajans found',
    tryAdjustingFilters: 'Try adjusting your filters or search terms',
    allRatings: 'All Ratings',
    stars: 'Stars',
    latest: 'Latest',
    mostPlayed: 'Most Played',
    highestRated: 'Highest Rated',
    sortBy: 'Sort By',
    filterByDeity: 'Filter By Deity',
    clearFilters: 'Clear',
    showing: 'Showing',
    of: 'of',
    notifications: 'Notifications',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    email: 'Email',
    copyLink: 'Copy Link',
    copied: 'Copied!',
    deity: 'Deity',
    singer: 'Singer',
    tags: 'Tags',
    relatedBhajans: 'Related Bhajans',
    shareOnWhatsapp: 'Share on WhatsApp',
    shareOnTelegram: 'Share on Telegram',
    shareViaEmail: 'Share via Email',
    copyShareLink: 'Copy link',
    linkCopied: 'Link copied!',
    kirtanAi: 'Kirtan AI',
    elderlyAssistant: 'Elderly Assistant',
    uploadBhajan: 'Upload',
    adminModeration: 'Moderation Queue',
    adminAccounts: 'Admin Accounts',
    auditLog: 'Audit Log',
    admin: 'Admin',
    setProfilePhoto: 'Set profile photo',
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
    bhajansCount: 'भजन',
    allBhajans: 'सभी भजन',
    browseOurCollection: 'पवित्र गीतों, स्तोत्रों और मंत्रों का हमारा संग्रह ब्राउज़ करें',
    findLyricsAndMeaning: 'अपनी दैनिक पूजा के लिए गीतों और अर्थ खोजें',
    bhajansSandhya: 'भजन संग्रह',
    completeDevotionalMusic: 'आपका पूर्ण भक्तिपूर्ण संगीत संग्रह — गीत, ऑडियो और अधिक',
    featuredBhajans: 'विशेष भजन',
    popularBhajans: 'लोकप्रिय भजन',
    communityBhajans: 'समुदाय भजन',
    sharedByOurCommunity: 'समुदाय द्वारा साझा किए गए भजन',
    allDeities: 'सभी देवता',
    exploreDeities: 'परंपराओं और कहानियों के साथ दिव्य का अन्वेषण करें',
    browseByDeity: 'देवता के अनुसार ब्राउज़ करें',
    devotionalSongs: 'देवता के अनुसार भजन खोजें',
    recentBhajans: 'हाल के भजन',
    latestUploads: 'हमारे समुदाय से नवीनतम अपलोड',
    trending: 'ट्रेंडिंग',
    trendingHour: 'इस घंटे ट्रेंडिंग',
    trendingDaily: 'आज ट्रेंडिंग',
    trendingWeekly: 'इस हफ्ते ट्रेंडिंग',
    trendingAllTime: 'सभी समय की ट्रेंडिंग',
    plays: 'बार चलाया गया',
    rating: 'रेटिंग',
    play: 'चलाएं',
    viewDetails: 'विवरण देखें',
    noResults: 'कोई भजन नहीं मिला',
    tryAdjustingFilters: 'अपने फ़िल्टर या खोज शर्तों को समायोजित करने का प्रयास करें',
    allRatings: 'सभी रेटिंग',
    stars: 'तारके',
    latest: 'नवीनतम',
    mostPlayed: 'सबसे अधिक चलाया गया',
    highestRated: 'सबसे अधिक रेटेड',
    sortBy: 'इसके द्वारा सॉर्ट करें',
    filterByDeity: 'देवता के अनुसार फ़िल्टर करें',
    clearFilters: 'साफ़ करें',
    showing: 'दिखा रहा है',
    of: 'का',
    notifications: 'सूचनाएं',
    whatsapp: 'व्हाट्सएप',
    telegram: 'टेलीग्राम',
    email: 'ईमेल',
    copyLink: 'लिंक कॉपी करें',
    copied: 'कॉपी किया गया!',
    deity: 'देवता',
    singer: 'गायक',
    tags: 'टैग',
    relatedBhajans: 'संबंधित भजन',
    shareOnWhatsapp: 'व्हाट्सएप पर साझा करें',
    shareOnTelegram: 'टेलीग्राम पर साझा करें',
    shareViaEmail: 'ईमेल के माध्यम से साझा करें',
    copyShareLink: 'लिंक कॉपी करें',
    linkCopied: 'लिंक कॉपी किया गया!',
    kirtanAi: 'कीर्तन एआई',
    elderlyAssistant: 'बुजुर्ग सहायक',
    uploadBhajan: 'अपलोड',
    adminModeration: 'संयोजन कतार',
    adminAccounts: 'प्रशासक खाते',
    auditLog: 'ऑडिट लॉग',
    admin: 'प्रशासक',
    setProfilePhoto: 'प्रोफाइल फोटो सेट करें',
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
    bhajansCount: 'ભજનો',
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
    bhajansCount: 'भजने',
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
    bhajansCount: 'ভজন',
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
    bhajansCount: 'பஜன்கள்',
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
