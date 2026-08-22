import { 
  Sparkles, 
  CalendarDays, 
  Flame, 
  Film, 
  MessageSquare, 
  Image, 
  Camera, 
  Users, 
  BookOpen, 
  Landmark, 
  Trophy, 
  Upload, 
  Heart, 
  Music2, 
  BookText, 
  Tv, 
  Bot,
  Search,
  LucideIcon
} from "lucide-react";
import { deities, Bhajan } from "@/data/bhajans";
import { normalizeSearchText, extractWords, calculateSimilarity, bhajanMatchesQuery } from "./searchAlgorithm";
import { latinQueryMatchesHindiTitle } from "./hinglishTransliterate";

export type SearchCategory = 'feature' | 'aarti_chalisa' | 'deity' | 'bhajan';

export interface FeatureSearchItem {
  id: string;
  category: 'feature';
  title: string;
  titleHindi: string;
  description: string;
  descriptionHindi: string;
  path: string;
  badge: string;
  badgeHindi: string;
  iconName: string;
  tags: string[];
  color: string; // Tailored gradient/color accent
}

export interface AartiChalisaSearchItem {
  id: string | number;
  category: 'aarti_chalisa';
  title: string;
  titleHindi: string;
  type: 'aarti' | 'chalisa' | 'stotra' | 'path';
  deityId?: number;
  singerName?: string;
  lyricsSnippet?: string;
  youtubeUrl?: string;
  path?: string;
}

export interface DeitySearchItem {
  id: number;
  category: 'deity';
  slug: string;
  name: string;
  nameHindi: string;
  description: string;
  emoji: string;
  imageUrl?: string;
  path: string;
}

export interface BhajanSearchItem {
  id: number | string;
  category: 'bhajan';
  slug: string;
  title: string;
  titleHindi: string;
  singerName: string;
  deityId: number;
  lyricsHindi?: string;
  path: string;
}

export type UnifiedSearchItem = 
  | FeatureSearchItem 
  | AartiChalisaSearchItem 
  | DeitySearchItem 
  | BhajanSearchItem;

// Master registry of website features and tools
export const APP_FEATURES: FeatureSearchItem[] = [
  {
    id: 'feature-meditation',
    category: 'feature',
    title: 'Meditation & Nama Jap',
    titleHindi: 'ध्यान एवं नाम जप',
    description: 'Calm your mind, count 108 mala beads, and play relaxing ambient meditation sounds.',
    descriptionHindi: 'मन को शांत करें, 108 मनके माला जपें और शांतिदायक ध्यान संगीत सुनें।',
    path: '/meditation',
    badge: 'Feature',
    badgeHindi: 'सुविधा',
    iconName: 'Sparkles',
    tags: ['meditation', 'dhyan', 'jap', 'nam jap', 'mala', 'mantra', 'jap counter', 'ध्यान', 'जप', 'नाम जप', 'माला', 'मंत्र', 'ध्यान केंद्रित', 'शांति'],
    color: 'from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-300 border-amber-300/40',
  },
  {
    id: 'feature-panchang',
    category: 'feature',
    title: "Today's Panchang & Tithi",
    titleHindi: 'आज का पंचांग एवं तिथि',
    description: "Check today's tithi, nakshatra, shubh muhurat, rahu kaal and festival dates.",
    descriptionHindi: 'आज की तिथि, नक्षत्र, शुभ मुहूर्त, राहु काल और व्रत त्योहारों का सटीक विवरण देखें।',
    path: '/panchang',
    badge: 'Panchang',
    badgeHindi: 'पंचांग',
    iconName: 'CalendarDays',
    tags: ['panchang', 'tithi', 'muhurat', 'rahu kaal', 'calendar', 'festivals', 'today panchang', 'पंचांग', 'तिथि', 'मुहूर्त', 'राहु काल', 'त्योहार', 'आज का पंचांग'],
    color: 'from-orange-500/20 to-red-500/20 text-orange-700 dark:text-orange-300 border-orange-300/40',
  },
  {
    id: 'feature-live-aarti',
    category: 'feature',
    title: 'Live Aarti & Temple Darshan',
    titleHindi: 'लाइव आरती एवं मंदिर दर्शन',
    description: 'Stream 24x7 live temple darshans and morning/evening live aartis from sacred shrines.',
    descriptionHindi: 'प्रसिद्ध मंदिरों के 24x7 लाइव दर्शन और सुबह-शाम की लाइव आरती का आनंद लें।',
    path: '/live-aarti',
    badge: 'Live',
    badgeHindi: 'लाइव दर्शन',
    iconName: 'Flame',
    tags: ['live aarti', 'live darshan', 'temple live', 'mandir live', 'stream', 'लाइव आरती', 'लाइव दर्शन', 'मंदिर दर्शन', 'लाइव स्ट्रीम'],
    color: 'from-red-500/20 to-rose-500/20 text-red-700 dark:text-red-300 border-red-300/40',
  },
  {
    id: 'feature-aarti-chalisa',
    category: 'feature',
    title: 'Aarti & Chalisa Collection',
    titleHindi: 'आरती एवं चालीसा संग्रह',
    description: 'Read and listen to complete Hanuman Chalisa, Shiv Aarti, Ganesh Aarti, Durga Chalisa and Stotras.',
    descriptionHindi: 'हनुमान चालीसा, शिव आरती, गणेश आरती, दुर्गा चालीसा एवं प्रसिद्ध स्तोत्रों का पाठ करें।',
    path: '/aarti-chalisa',
    badge: 'Collection',
    badgeHindi: 'संग्रह',
    iconName: 'BookText',
    tags: ['aarti', 'chalisa', 'stotra', 'path', 'sangrah', 'आरती', 'चालीसा', 'स्तोत्र', 'पाठ', 'आरती संग्रह', 'चालीसा संग्रह'],
    color: 'from-amber-600/20 to-yellow-500/20 text-amber-800 dark:text-amber-200 border-amber-400/40',
  },
  {
    id: 'feature-shorts',
    category: 'feature',
    title: 'Bhakti Shorts & Reels',
    titleHindi: 'भक्ति शॉर्ट्स एवं रील्स',
    description: 'Watch short devotional video clips, status reels, and viral kirtan moments.',
    descriptionHindi: 'छोटे भक्ति वीडियो, व्हाट्सएप स्टेटस रील्स और मनमोहक कीर्तन क्लिप्स देखें।',
    path: '/shorts',
    badge: 'Video',
    badgeHindi: 'शॉर्ट्स',
    iconName: 'Film',
    tags: ['shorts', 'reels', 'bhakti shorts', 'short videos', 'status', 'viral videos', 'शॉर्ट्स', 'रील्स', 'भक्ति वीडियो', 'वीडियो'],
    color: 'from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-purple-300 border-purple-300/40',
  },
  {
    id: 'feature-kirtan-ai',
    category: 'feature',
    title: 'Narad AI Devotional Assistant',
    titleHindi: 'नारद AI आध्यात्मिक सहायक',
    description: 'Ask spiritual questions, get bhajan recommendations, and chat about holy scriptures with Narad AI.',
    descriptionHindi: 'नारद AI से आध्यात्मिक प्रश्न पूछें, भजन सुझाव पाएं और धर्मग्रंथों पर चर्चा करें।',
    path: '/narad-ai',
    badge: 'AI Tool',
    badgeHindi: 'एआई सहायक',
    iconName: 'Bot',
    tags: ['ai', 'kirtan ai', 'narad', 'assistant', 'bot', 'spiritual chat', 'ask ai', 'नारद', 'एआई', 'कीर्तन AI', 'सहायक', 'बॉट'],
    color: 'from-sky-500/20 to-blue-500/20 text-sky-700 dark:text-sky-300 border-sky-300/40',
  },
  {
    id: 'feature-wallpaper',
    category: 'feature',
    title: 'HD Wallpapers & Blessings',
    titleHindi: 'वॉलपेपर एवं आशीर्वाद',
    description: 'Download high resolution 4K wallpapers of Lord Krishna, Shiva, Hanuman, Durga & Lakshmi.',
    descriptionHindi: 'श्री कृष्ण, शिव, हनुमान, दुर्गा एवं लक्ष्मी मां के सुंदर 4K HD वॉलपेपर डाउनलोड करें।',
    path: '/wallpaper',
    badge: 'Wallpaper',
    badgeHindi: 'वॉलपेपर',
    iconName: 'Image',
    tags: ['wallpaper', 'blessings', 'photos', 'hd wallpaper', 'god images', 'mobile wallpaper', 'वॉलपेपर', 'फोटो', 'आशीर्वाद', 'चित्र'],
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-300/40',
  },
  {
    id: 'feature-poster-maker',
    category: 'feature',
    title: 'Devotional Poster Maker',
    titleHindi: 'भक्ति पोस्टर मेकर',
    description: 'Design customized spiritual greeting cards, Suvichar posters, and festival wishes.',
    descriptionHindi: 'सुंदर भक्ति पोस्टर, शुभप्रभात विचार और त्योहार शुभकामना कार्ड बनाएं।',
    path: '/poster-maker',
    badge: 'Tool',
    badgeHindi: 'मेकर',
    iconName: 'Camera',
    tags: ['poster', 'poster maker', 'greeting card', 'suvichar', 'card maker', 'पोस्टर', 'पोस्टर मेकर', 'ग्रीटिंग', 'सुविचार', 'कार्ड'],
    color: 'from-pink-500/20 to-rose-500/20 text-pink-700 dark:text-pink-300 border-pink-300/40',
  },
  {
    id: 'feature-community',
    category: 'feature',
    title: 'Devotee Community & Satsang',
    titleHindi: 'भक्त समुदाय एवं सत्संग',
    description: 'Connect with fellow devotees, share posts, join kirtan groups, and participate in satsang.',
    descriptionHindi: 'भक्तों के साथ जुड़ें, अपने अनुभव साझा करें, कीर्तन समूहों में भाग लें।',
    path: '/community',
    badge: 'Community',
    badgeHindi: 'समुदाय',
    iconName: 'Users',
    tags: ['community', 'satsang', 'groups', 'devotees', 'forum', 'posts', 'कम्युनिटी', 'समुदाय', 'सत्संग', 'समूह'],
    color: 'from-indigo-500/20 to-violet-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-300/40',
  },
  {
    id: 'feature-katha',
    category: 'feature',
    title: 'Vrat Katha & Religious Stories',
    titleHindi: 'पौराणिक व्रत कथाएं एवं कहानियां',
    description: 'Read authentic fast stories like Satyanarayan Katha, Ekadashi Vrat, Solah Somvar Vrat Katha.',
    descriptionHindi: 'सत्यनारायण कथा, एकादशी व्रत, सोह्र सोमवार व्रत कथा एवं धर्म ग्रंथों की कहानियां पढ़ें।',
    path: '/katha',
    badge: 'Katha',
    badgeHindi: 'कथा',
    iconName: 'BookOpen',
    tags: ['katha', 'vrat katha', 'satyanarayan', 'stories', 'pauranik', 'कथा', 'व्रत कथा', 'कहानी', 'कथाएं'],
    color: 'from-amber-700/20 to-orange-600/20 text-amber-900 dark:text-amber-200 border-amber-500/40',
  },
  {
    id: 'feature-temple',
    category: 'feature',
    title: 'Famous Pilgrimage & Temple Guide',
    titleHindi: 'प्रसिद्ध मंदिर एवं तीर्थ गाइड',
    description: 'Explore holy shrines, Kedarnath, Badrinath, Kashi Vishwanath, Mahakaleshwar temple details.',
    descriptionHindi: 'केदारनाथ, बद्रीनाथ, काशी विश्वनाथ, महाकालेश्वर सहित प्रमुख तीर्थ स्थलों की जानकारी प्राप्त करें।',
    path: '/temple',
    badge: 'Pilgrimage',
    badgeHindi: 'तीर्थ',
    iconName: 'Landmark',
    tags: ['temple', 'mandir', 'pilgrimage', 'kedarnath', 'kashi', 'mahakal', 'dham', 'मंदिर', 'तीर्थ', 'धाम', 'दर्शन गाइड'],
    color: 'from-yellow-600/20 to-amber-600/20 text-yellow-800 dark:text-yellow-200 border-yellow-400/40',
  },
  {
    id: 'feature-leaderboard',
    category: 'feature',
    title: 'Seva Leaderboard & Ranks',
    titleHindi: 'सेवा लीडरबोर्ड एवं अंक',
    description: 'See top spiritual contributors, earn badges for daily chanting, and track your rank.',
    descriptionHindi: 'दैनिक नाम जप और सेवा के आधार पर शीर्ष भक्तों की सूची और अपनी रैंक देखें।',
    path: '/leaderboard',
    badge: 'Ranks',
    badgeHindi: 'लीडरबोर्ड',
    iconName: 'Trophy',
    tags: ['leaderboard', 'ranks', 'points', 'seva', 'badges', 'top devotees', 'लीडरबोर्ड', 'सेवा', 'रैंक', 'अंक'],
    color: 'from-yellow-500/20 to-amber-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-300/40',
  },
  {
    id: 'feature-upload',
    category: 'feature',
    title: 'Upload Bhajan or Lyrics',
    titleHindi: 'भजन या लिरिक्स अपलोड करें',
    description: 'Submit your favorite bhajan, YouTube link, or lyrics to share with the entire community.',
    descriptionHindi: 'अपना पसंदीदा भजन, यूट्यूब लिंक या लिरिक्स सबमिट करके समुदाय से साझा करें।',
    path: '/upload-bhajan',
    badge: 'Upload',
    badgeHindi: 'अपलोड',
    iconName: 'Upload',
    tags: ['upload', 'submit', 'add bhajan', 'share lyrics', 'अपलोड', 'भजन जोड़ें', 'सबमिट', 'लिरिक्स सबमिट'],
    color: 'from-emerald-600/20 to-green-500/20 text-emerald-800 dark:text-emerald-200 border-emerald-400/40',
  },
  {
    id: 'feature-liked',
    category: 'feature',
    title: 'My Liked & Saved Bhajans',
    titleHindi: 'मेरे पसंदीदा भजन',
    description: 'Access your quick collection of bookmarked and favorite devotional songs.',
    descriptionHindi: 'आपके द्वारा पसंद और बुकमार्क किए गए भजनों का व्यक्तिगत संग्रह।',
    path: '/account/liked',
    badge: 'Saved',
    badgeHindi: 'पसंद',
    iconName: 'Heart',
    tags: ['liked', 'saved', 'favorites', 'bookmarks', 'my bhajans', 'पसंद', 'पसंदीदा', 'सेव', 'बुकमार्क'],
    color: 'from-rose-500/20 to-pink-500/20 text-rose-700 dark:text-rose-300 border-rose-300/40',
  }
];

// Presets of famous Aartis & Chalisas for quick instant search matching
export const FAMOUS_AARTIS_CHALISAS: AartiChalisaSearchItem[] = [
  {
    id: 'ac-1',
    category: 'aarti_chalisa',
    title: 'Hanuman Chalisa',
    titleHindi: 'श्री हनुमान चालीसा',
    type: 'chalisa',
    deityId: 3,
    singerName: 'Hariharan / Gulshan Kumar',
    lyricsSnippet: 'जय हनुमान ज्ञान गुन सागर, जय कपीस तिहुँ लोक उजागर...',
    path: '/bhajan/hanuman-chalisa'
  },
  {
    id: 'ac-2',
    category: 'aarti_chalisa',
    title: 'Om Jai Shiv Omkara',
    titleHindi: 'ॐ जय शिव ओमकारा (शिव आरती)',
    type: 'aarti',
    deityId: 2,
    singerName: 'Anuradha Paudwal',
    lyricsSnippet: 'ॐ जय शिव ओमकारा, स्वामी जय शिव ओमकारा, ब्रह्मा विष्णु सदाशिव अर्धांगी धारा...',
    path: '/bhajan/om-jai-shiv-omkara'
  },
  {
    id: 'ac-3',
    category: 'aarti_chalisa',
    title: 'Jai Ganesh Deva',
    titleHindi: 'जय गणेश जय गणेश देवा (गणेश आरती)',
    type: 'aarti',
    deityId: 6,
    singerName: 'SP Balasubrahmanyam',
    lyricsSnippet: 'जय गणेश जय गणेश जय गणेश देवा, माता जाकी पार्वती पिता महादेवा...',
    path: '/bhajan/ganesh-aarti'
  },
  {
    id: 'ac-4',
    category: 'aarti_chalisa',
    title: 'Jai Ambe Gauri',
    titleHindi: 'जय अम्बे गौरी (दुर्गा आरती)',
    type: 'aarti',
    deityId: 5,
    singerName: 'Anuradha Paudwal',
    lyricsSnippet: 'जय अम्बे गौरी, मैया जय श्यामा गौरी। तुमको निशिदिन ध्यावत, हरि ब्रह्मा शिवरी...',
    path: '/bhajan/jai-ambe-gauri'
  },
  {
    id: 'ac-5',
    category: 'aarti_chalisa',
    title: 'Om Jai Jagdish Hare',
    titleHindi: 'ॐ जय जगदीश हरे (विष्णु आरती)',
    type: 'aarti',
    deityId: 1,
    singerName: 'Anuradha Paudwal',
    lyricsSnippet: 'ॐ जय जगदीश हरे, स्वामी जय जगदीश हरे, भक्त जनों के संकट क्षण में दूर करे...',
    path: '/aarti-chalisa?q=Om+Jai+Jagdish+Hare'
  },
  {
    id: 'ac-6',
    category: 'aarti_chalisa',
    title: 'Shree Ram Chandra Kripalu Bhajman (Ram Stuti)',
    titleHindi: 'श्री रामचंद्र कृपालु भजु मन (राम स्तुति)',
    type: 'stotra',
    deityId: 4,
    singerName: 'Lata Mangeshkar',
    lyricsSnippet: 'श्री रामचंद्र कृपालु भजु मन हरण भवभय दारुणम्...',
    path: '/aarti-chalisa?q=Ram+Stuti'
  },
  {
    id: 'ac-7',
    category: 'aarti_chalisa',
    title: 'Shiv Tandav Stotram',
    titleHindi: 'शिव तांडव स्तोत्रम्',
    type: 'stotra',
    deityId: 2,
    singerName: 'Ravan Stuti / Shankar Mahadevan',
    lyricsSnippet: 'जटाटवीगलज्जलप्रवाहपावितस्थले गलेऽवलम्ब्य लम्बितां भुजङ्गतुङ्गमालिकाम्...',
    path: '/aarti-chalisa?q=Shiv+Tandav'
  },
  {
    id: 'ac-8',
    category: 'aarti_chalisa',
    title: 'Durga Chalisa',
    titleHindi: 'श्री दुर्गा चालीसा',
    type: 'chalisa',
    deityId: 5,
    singerName: 'Anuradha Paudwal',
    lyricsSnippet: 'नमो नमो दुर्गे सुख करनी, नमो नमो अम्बे दुःख हरनी...',
    path: '/aarti-chalisa?q=Durga+Chalisa'
  },
  {
    id: 'ac-9',
    category: 'aarti_chalisa',
    title: 'Lakshmi Aarti (Om Jai Lakshmi Mata)',
    titleHindi: 'ॐ जय लक्ष्मी माता (लक्ष्मी आरती)',
    type: 'aarti',
    deityId: 8,
    singerName: 'Anuradha Paudwal',
    lyricsSnippet: 'ॐ जय लक्ष्मी माता, मैया जय लक्ष्मी माता। तुमको निशिदिन सेवत, हर विष्णु विधाता...',
    path: '/aarti-chalisa?q=Lakshmi+Aarti'
  },
  {
    id: 'ac-10',
    category: 'aarti_chalisa',
    title: 'Gayatri Mantra',
    titleHindi: 'गायत्री मंत्र (ॐ भूर्भुवः स्वः)',
    type: 'path',
    deityId: 1,
    singerName: 'Anuradha Paudwal',
    lyricsSnippet: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्...',
    path: '/aarti-chalisa?q=Gayatri+Mantra'
  }
];

/** Search feature items against a query string */
export function searchFeatures(query: string): FeatureSearchItem[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  const normQuery = normalizeSearchText(trimmed);

  return APP_FEATURES.filter((feature) => {
    // Title match
    if (
      feature.title.toLowerCase().includes(trimmed) ||
      feature.titleHindi.includes(trimmed) ||
      latinQueryMatchesHindiTitle(trimmed, feature.titleHindi)
    ) {
      return true;
    }

    // Normalized search match
    const normTitle = normalizeSearchText(feature.title + ' ' + feature.titleHindi);
    if (normTitle.includes(normQuery)) return true;

    // Tags match
    const hasTagMatch = feature.tags.some((tag) => {
      const tagLower = tag.toLowerCase();
      return (
        tagLower.includes(trimmed) ||
        trimmed.includes(tagLower) ||
        normalizeSearchText(tagLower).includes(normQuery)
      );
    });

    if (hasTagMatch) return true;

    // Word similarity match
    const queryWords = extractWords(trimmed);
    if (queryWords.length > 0) {
      return queryWords.some((qWord) => {
        return feature.tags.some((tag) => calculateSimilarity(qWord, tag) >= 80);
      });
    }

    return false;
  });
}

/** Search Aartis and Chalisas */
export function searchAartisAndChalisas(query: string, customItems: AartiChalisaSearchItem[] = []): AartiChalisaSearchItem[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const allAartis = [...FAMOUS_AARTIS_CHALISAS, ...customItems];
  const queryLower = trimmed.toLowerCase();
  const queryNorm = normalizeSearchText(trimmed);

  return allAartis.filter((item) => {
    const titleMatch = 
      item.title.toLowerCase().includes(queryLower) || 
      item.titleHindi.includes(trimmed) ||
      latinQueryMatchesHindiTitle(trimmed, item.titleHindi);
    
    if (titleMatch) return true;

    const normTitle = normalizeSearchText(item.title + ' ' + item.titleHindi);
    if (normTitle.includes(queryNorm)) return true;

    if (item.lyricsSnippet && normalizeSearchText(item.lyricsSnippet).includes(queryNorm)) {
      return true;
    }

    return false;
  });
}

/** Search Deities */
export function searchDeities(query: string): DeitySearchItem[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  const normQuery = normalizeSearchText(trimmed);

  return deities.map(d => ({
    id: d.id,
    category: 'deity' as const,
    slug: d.slug,
    name: d.name,
    nameHindi: d.nameHindi,
    description: d.description,
    emoji: d.emoji,
    imageUrl: d.imageUrl,
    path: `/deity/${d.slug}`
  })).filter(d => {
    const nameMatch = 
      d.name.toLowerCase().includes(trimmed) || 
      d.nameHindi.includes(query.trim()) ||
      latinQueryMatchesHindiTitle(query.trim(), d.nameHindi);

    if (nameMatch) return true;

    const normName = normalizeSearchText(d.name + ' ' + d.nameHindi + ' ' + d.slug);
    return normName.includes(normQuery);
  });
}

export interface AutocompleteSuggestion {
  id: string;
  type: 'feature' | 'aarti_chalisa' | 'deity' | 'bhajan';
  title: string;
  titleHindi: string;
  subtitle?: string;
  badge: string;
  badgeHindi: string;
  iconName?: string;
  emoji?: string;
  path: string;
  color?: string;
  rawItem: UnifiedSearchItem;
}

/** Returns structured multi-category autocomplete suggestions for SearchBar */
export function getUnifiedAutocompleteSuggestions(
  query: string,
  bhajansList: Bhajan[] = [],
  isHi: boolean = false,
  limit: number = 8
): AutocompleteSuggestion[] {
  const q = query.trim();
  if (!q) return [];

  const suggestions: AutocompleteSuggestion[] = [];
  const seenPaths = new Set<string>();

  // 1. Check Feature Matches
  const matchedFeatures = searchFeatures(q);
  for (const f of matchedFeatures) {
    if (!seenPaths.has(f.path)) {
      seenPaths.add(f.path);
      suggestions.push({
        id: f.id,
        type: 'feature',
        title: f.title,
        titleHindi: f.titleHindi,
        subtitle: isHi ? f.descriptionHindi : f.description,
        badge: f.badge,
        badgeHindi: f.badgeHindi,
        iconName: f.iconName,
        path: f.path,
        color: f.color,
        rawItem: f,
      });
    }
  }

  // 2. Check Deity Matches
  const matchedDeities = searchDeities(q);
  for (const d of matchedDeities) {
    if (!seenPaths.has(d.path)) {
      seenPaths.add(d.path);
      suggestions.push({
        id: `deity-${d.id}`,
        type: 'deity',
        title: d.name,
        titleHindi: d.nameHindi,
        subtitle: isHi ? `${d.description}` : `${d.description}`,
        badge: 'Deity',
        badgeHindi: 'देवता',
        emoji: d.emoji,
        path: d.path,
        rawItem: d,
      });
    }
  }

  // 3. Check Aarti & Chalisa Matches
  const matchedAartis = searchAartisAndChalisas(q);
  for (const ac of matchedAartis) {
    const acPath = ac.path || `/search?q=${encodeURIComponent(ac.title)}`;
    if (!seenPaths.has(acPath)) {
      seenPaths.add(acPath);
      const isChalisa = ac.type === 'chalisa';
      suggestions.push({
        id: String(ac.id),
        type: 'aarti_chalisa',
        title: ac.title,
        titleHindi: ac.titleHindi,
        subtitle: ac.singerName ? `${ac.singerName}` : undefined,
        badge: isChalisa ? 'Chalisa' : 'Aarti',
        badgeHindi: isChalisa ? 'चालीसा' : 'आरती',
        iconName: 'Flame',
        path: acPath,
        rawItem: ac,
      });
    }
  }

  // 4. Check Bhajan Matches
  for (const b of bhajansList) {
    if (bhajanMatchesQuery(b, q)) {
      const bhajanPath = `/bhajan/${b.slug}`;
      if (!seenPaths.has(bhajanPath)) {
        seenPaths.add(bhajanPath);
        suggestions.push({
          id: `bhajan-${b.id}`,
          type: 'bhajan',
          title: b.title,
          titleHindi: b.titleHindi,
          subtitle: b.singerName ? `${b.singerName}` : undefined,
          badge: 'Bhajan',
          badgeHindi: 'भजन',
          iconName: 'Music2',
          path: bhajanPath,
          rawItem: {
            id: b.id,
            category: 'bhajan',
            slug: b.slug,
            title: b.title,
            titleHindi: b.titleHindi,
            singerName: b.singerName,
            deityId: b.deityId,
            lyricsHindi: b.lyricsHindi,
            path: bhajanPath,
          },
        });
      }
    }
    if (suggestions.length >= limit + 4) break;
  }

  return suggestions.slice(0, limit);
}
