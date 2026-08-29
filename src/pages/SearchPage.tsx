import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { 
  Music2, 
  BookText, 
  Loader2, 
  Youtube, 
  ExternalLink, 
  PlayCircle, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  Sparkles,
  CalendarDays,
  Film,
  Bot,
  Image as ImageIcon,
  Camera,
  Users,
  BookOpen,
  Landmark,
  Trophy,
  Upload,
  Flame,
  ArrowRight,
  Copy,
  Check,
  Clock
} from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import BhajanCard from "@/components/BhajanCard";
import { bhajans, deities } from "@/data/bhajans";
import SearchBar from "@/components/SearchBar";
import { 
  searchFeatures, 
  searchAartisAndChalisas, 
  searchDeities,
} from "@/lib/unifiedSearch";
import Pagination from "@/components/Pagination";
import { smartSearchBhajans } from "@/lib/searchAlgorithm";
import { mapUserUploadToBhajan } from "@/lib/mapUserUpload";
import { SEO } from "@/components/SEO";
import { useDeities } from "@/hooks/useDeities";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import { useLanguage } from "@/hooks/useLanguage";
import { searchYouTubeVideos, YouTubeVideoResult } from "@/lib/youtubeSearch";
import { useUserUploads } from "@/hooks/useUserUploads";
import { useBhajanCounts } from "@/hooks/useBhajanCounts";
import { cn } from "@/lib/utils";
import { getDeityUrl } from "@/lib/deityUrls";
import { LotusIcon } from "@/components/icons/LotusIcon";

// SVGs & Feature Artwork
import mandalaGold from "@/pages/images/mandala-gold.svg";
import ramYellowFlower from "@/pages/images/svg/ram yellow flower.svg";
import radhePinkFlower from "@/pages/images/svg/radhe pink flower.svg";
import shivayyWhiteFlower from "@/pages/images/svg/shivayy white flower.svg";
import shyamBlueFlower from "@/pages/images/svg/shyam blue flower.svg";
import diyaSvg from "@/pages/images/svg/diya.svg";
import bookSvg from "@/pages/images/svg/book.svg";
import manjiraSvg from "@/pages/images/svg/manjira.svg";
import prayerSvg from "@/pages/images/svg/prayer.svg";
import omWhiteSvg from "@/pages/images/svg/om white.svg";
import headphoneSvg from "@/pages/images/svg/headphone-svgrepo-com.svg";

// High quality feature illustrations
import liveArtiWebp from "@/pages/images/features webp/live arti.webp";
import darshanWebp from "@/pages/images/features webp/darshan.webp";
import japWebp from "@/pages/images/features webp/jap.webp";
import meditationWebp from "@/pages/images/features webp/meditation (2).webp";
import posterWebp from "@/pages/images/features webp/poster.webp";

// Daily Vedic Shlokas
const DAILY_SHLOKAS = [
  {
    sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
    hindi: "आपका अधिकार केवल कर्म करने में है, फल में कभी नहीं। फल की चिंता किए बिना निष्काम कर्म करें।",
    source: "श्रीमद्भगवद्गीता (२.४७)",
    deity: "श्री कृष्ण",
  },
  {
    sanskrit: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्यlineोर्मुक्षीय मामृतात्॥",
    hindi: "हम त्रिनेत्रधारी भगवान शिव की आराधना करते हैं, जो हमें जीवन व मुक्ति का दिव्य आशीर्वाद प्रदान करते हैं।",
    source: "महामृत्युंजय मंत्र (ऋग्वेद)",
    deity: "भगवान शिव",
  },
  {
    sanskrit: "मंगल भवन अमंगल हारी। द्रवहु सुदसरथ अजिर बिहारी॥",
    hindi: "जो मंगल के धाम और अमंगल का हरण करने वाले हैं, वे श्री राम हम सब पर अपनी कृपा दृष्टि बनाए रखें।",
    source: "श्रीरामचरितमानस",
    deity: "श्री राम",
  },
  {
    sanskrit: "नासे रोग हरे सब पीरा। जपत निरंतर हनुमत बीरा॥",
    hindi: "वीर हनुमान जी के नाम का निरंतर जप करने से समस्त रोग, भय और कष्ट दूर हो जाते हैं।",
    source: "श्री हनुमान चालीसा",
    deity: "हनुमान जी",
  },
  {
    sanskrit: "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥",
    hindi: "करोड़ों सूर्यों के समान तेजस्वी महाकाय भगवान गणेश हमारे सभी कार्यों को सदैव निर्विघ्न संपन्न करें।",
    source: "गणेश वंदना",
    deity: "भगवान गणेश",
  }
];

// Trending Search Suggestions
const TRENDING_SEARCHES = [
  { label: "श्री हनुमान चालीसा", query: "हनुमान चालीसा", icon: "🙏" },
  { label: "महामृत्युंजय मंत्र", query: "महामृत्युंजय मंत्र", icon: "🔱" },
  { label: "राधे राधे", query: "राधे राधे", icon: "🌸" },
  { label: "खाटू श्याम भजन", query: "खाटू श्याम", icon: "✨" },
  { label: "शिव तांडव स्तोत्र", query: "शिव तांडव", icon: "🕉️" },
  { label: "आरती कुंजबिहारी की", query: "आरती कुंजबिहारी", icon: "🪔" },
  { label: "श्री राम स्तुति", query: "राम स्तुति", icon: "🏹" },
  { label: "गणेश वंदना", query: "गणेश", icon: "🐘" },
];

export default function SearchPage() {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialDeityFilter = searchParams.get("deity") || "";
  const shouldAutoVoice = searchParams.get("voice") === "1";

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [selectedDeityFilter, setSelectedDeityFilter] = useState(initialDeityFilter);
  const [youtubeQuery, setYoutubeQuery] = useState(initialQuery);
  const [youtubeResults, setYoutubeResults] = useState<YouTubeVideoResult[]>([]);
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [youtubeError, setYoutubeError] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideoResult | null>(null);
  const [activeMode, setActiveMode] = useState<'bhajans' | 'youtube'>('bhajans');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedShloka, setCopiedShloka] = useState(false);
  const pageSize = 12;

  // React Query cached single-source data hooks
  const { userBhajans } = useUserUploads();
  const { deities: allDeities } = useDeities();
  const { getDeityCount } = useBhajanCounts();
  const deityScrollRef = useRef<HTMLDivElement>(null);
  const filterPillsRef = useRef<HTMLDivElement>(null);
  
  const { openPlayer } = useYouTubePlayer();
  const { language } = useLanguage();

  // Current time slot detection for curated Bhakti recommendations
  const currentHour = new Date().getHours();
  const defaultTimeSlot = useMemo(() => {
    if (currentHour >= 4 && currentHour < 11) return 'morning';
    if (currentHour >= 11 && currentHour < 16) return 'afternoon';
    if (currentHour >= 16 && currentHour < 20) return 'evening';
    return 'night';
  }, [currentHour]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<'morning' | 'afternoon' | 'evening' | 'night'>(defaultTimeSlot);

  // Debounced search query (150ms) for 60fps fluid typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 150);
    return () => clearTimeout(handler);
  }, [query]);

  // Sync URL parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (selectedDeityFilter) params.set("deity", selectedDeityFilter);
    setSearchParams(params, { replace: true });
    setCurrentPage(1);
  }, [query, selectedDeityFilter, setSearchParams]);

  // Results computation
  const results = useMemo(() => {
    const staticBhajans = bhajans.map((b) => ({
      ...b,
      source: 'static' as const,
      sourceKey: String(b.id),
    }));

    const uploadedBhajans = userBhajans.map((ub) =>
      mapUserUploadToBhajan(ub, allDeities)
    );

    const combinedBhajans = [...staticBhajans, ...uploadedBhajans];
    let filtered = combinedBhajans;

    if (selectedDeityFilter) {
      filtered = filtered.filter(b => {
        const matchingDeity = allDeities.find(d => {
          if (d.isCustom) {
            const deitySlug = d.name.toLowerCase().replace(/\s+/g, '-');
            return deitySlug === selectedDeityFilter;
          } else {
            const presetDeity = deities.find(pd => pd.id === d.id);
            return presetDeity?.slug === selectedDeityFilter;
          }
        });

        if (matchingDeity && matchingDeity.id) {
          return b.deityId === matchingDeity.id;
        }
        return false;
      });
    }

    if (debouncedQuery.trim()) {
      filtered = smartSearchBhajans(debouncedQuery, filtered);
    }

    return filtered;
  }, [debouncedQuery, selectedDeityFilter, userBhajans, allDeities]);

  const matchedFeatures = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    return searchFeatures(debouncedQuery);
  }, [debouncedQuery]);

  const matchedAartis = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    return searchAartisAndChalisas(debouncedQuery);
  }, [debouncedQuery]);

  const matchedDeities = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    return searchDeities(debouncedQuery);
  }, [debouncedQuery]);

  const renderFeatureIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'CalendarDays': return <CalendarDays className="w-5 h-5 text-orange-500" />;
      case 'Flame': return <Flame className="w-5 h-5 text-red-500" />;
      case 'Film': return <Film className="w-5 h-5 text-purple-500" />;
      case 'Bot': return <Bot className="w-5 h-5 text-sky-500" />;
      case 'Image': return <ImageIcon className="w-5 h-5 text-emerald-500" />;
      case 'Camera': return <Camera className="w-5 h-5 text-pink-500" />;
      case 'Users': return <Users className="w-5 h-5 text-indigo-500" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-amber-700" />;
      case 'Landmark': return <Landmark className="w-5 h-5 text-yellow-600" />;
      case 'Trophy': return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'Upload': return <Upload className="w-5 h-5 text-emerald-600" />;
      case 'Heart': return <Heart className="w-5 h-5 text-rose-500" />;
      default: return <Sparkles className="w-5 h-5 text-amber-500" />;
    }
  };

  // YouTube discovery runner
  useEffect(() => {
    const run = async () => {
      const q = youtubeQuery.trim();
      if (q.length < 2) {
        setYoutubeResults([]);
        setYoutubeError('');
        return;
      }

      setYoutubeLoading(true);
      setYoutubeError('');
      try {
        const res = await searchYouTubeVideos(q);
        setYoutubeResults(res);
      } catch (error: any) {
        setYoutubeError(error.message || 'Unable to search YouTube right now.');
      } finally {
        setYoutubeLoading(false);
      }
    };

    const timer = setTimeout(run, 350);
    return () => clearTimeout(timer);
  }, [youtubeQuery]);

  const getDeitySlug = (deity: typeof allDeities[number]) => {
    if (deity.isCustom) {
      return deity.name.toLowerCase().replace(/\s+/g, '-');
    }
    return deities.find(d => d.id === deity.id)?.slug || deity.name.toLowerCase();
  };

  const getDeityFloralSvg = (slug: string) => {
    switch (slug) {
      case 'rama': return ramYellowFlower;
      case 'krishna': return radhePinkFlower;
      case 'shiva': return shivayyWhiteFlower;
      case 'khatu-shyam': return shyamBlueFlower;
      default: return null;
    }
  };

  // Voice Search Handler with Insecure Context & LAN Fallback Detection
  const startSpeechRecognition = () => {
    if (typeof window === 'undefined') return;

    if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      toast.error(
        language === 'hi'
          ? 'सुरक्षा कारणों से वॉइस सर्च केवल HTTPS या localhost पर समर्थित है।'
          : 'Voice search requires a secure context (HTTPS or localhost).'
      );
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error(language === 'hi' ? 'आपका ब्राउज़र वॉइस सर्च का समर्थन नहीं करता है।' : "Speech recognition is not supported in your browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        toast.info(language === 'hi' ? 'सुन रहा हूँ... बोलिए' : 'Listening... speak now');
      };
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (activeMode === 'bhajans') {
          setQuery(transcript);
        } else {
          setYoutubeQuery(transcript);
        }
        setIsListening(false);
        toast.success(language === 'hi' ? `सर्च किया: ${transcript}` : `Searched for: ${transcript}`);
      };
      recognition.onerror = (e: any) => {
        console.warn("Speech recognition error:", e);
        setIsListening(false);
        if (e.error === 'not-allowed') {
          toast.error(language === 'hi' ? 'माइक्रोफ़ोन अनुमति ब्लॉक है। कृपया अनुमति दें।' : 'Microphone permission blocked. Please allow microphone access.');
        } else if (e.error !== 'no-speech') {
          toast.error(language === 'hi' ? 'वॉइस सर्च विफल रहा।' : 'Speech recognition failed.');
        }
      };
      recognition.onend = () => {
        setIsListening(false);
      };
      recognition.start();
    } catch (err) {
      setIsListening(false);
      console.error("Speech recognition startup error:", err);
    }
  };

  // Trigger voice recognition automatically if opened via /search?voice=1
  useEffect(() => {
    if (shouldAutoVoice) {
      const timer = setTimeout(() => {
        startSpeechRecognition();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [shouldAutoVoice]);

  const today = new Date();
  const popularBhajansList = useMemo(() => {
    return bhajans.filter(b => [1, 2, 3, 4, 6, 9].includes(Number(b.id)));
  }, []);

  const currentShloka = useMemo(() => {
    const day = today.getDate();
    return DAILY_SHLOKAS[day % DAILY_SHLOKAS.length];
  }, [today]);

  const scrollDeities = (direction: 'left' | 'right') => {
    if (deityScrollRef.current) {
      const containerWidth = deityScrollRef.current.clientWidth;
      const scrollAmt = direction === 'left' ? -containerWidth * 0.8 : containerWidth * 0.8;
      deityScrollRef.current.scrollBy({ left: scrollAmt, behavior: 'smooth' });
    }
  };

  const copyShlokaToClipboard = () => {
    const textToCopy = `✨ ${currentShloka.source} ✨\n\n"${currentShloka.sanskrit}"\n\nभावार्थ: ${currentShloka.hindi}\n\n🙏 Raghavam - Divine Melodies`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedShloka(true);
    toast.success(language === 'hi' ? 'श्लोक कॉपी हो गया!' : 'Shloka copied to clipboard!');
    setTimeout(() => setCopiedShloka(false), 2000);
  };

  // SEO Schema
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Raghavam",
    "url": "https://raghavam.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://raghavam.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] dark:bg-background pb-16 text-[#3A2418] dark:text-[#FFFDF8]">
      <SEO
        title={
          query.trim()
            ? `"${query}" के परिणाम | खोजें - Raghavam`
            : "खोजें - भजन, आरती, चालीसा एवं देव संग्रह (Search Bhajans) | Raghavam"
        }
        description="भगवान कृष्ण, शिव, राम, हनुमान, खाटू श्याम के मधुर भजन, नित्य आरतियां, चालीसा, मंत्र खोजें।"
        noindex={false}
        jsonLd={jsonLdData}
      />

      {/* Hide scrollbars style utility */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}} />

      {/* Sticky Search Header (Back Button + Full Search Input) */}
      <header className="sticky top-0 z-40 bg-[#FFFDF8]/95 dark:bg-background/95 backdrop-blur-xl border-b border-[#E8D8C4]/60 dark:border-[#D4A437]/25 px-2 py-2.5 sm:px-4 sm:py-3.5 md:px-6 shadow-[0_4px_16px_rgba(95,72,38,0.03)]">
        <div className="container mx-auto max-w-5xl flex items-center gap-1.5 sm:gap-3">
          <button
            onClick={() => {
              if (query.trim() || selectedDeityFilter) {
                setQuery("");
                setSelectedDeityFilter("");
              } else {
                navigate(-1);
              }
            }}
            className="p-2 -ml-1 rounded-full hover:bg-[#651317]/8 text-[#651317] dark:text-[#E8B15C] transition-colors cursor-pointer shrink-0"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          
          <div className="flex-1 min-w-0">
            <SearchBar
              value={activeMode === 'bhajans' ? query : youtubeQuery}
              onChange={(val) => {
                if (activeMode === 'bhajans') {
                  setQuery(val);
                } else {
                  setYoutubeQuery(val);
                }
              }}
              placeholder={
                activeMode === 'bhajans'
                  ? (language === 'hi' ? 'भजन, आरती, चालीसा या देव खोजें...' : 'Search bhajans, aartis, chalisas, deities...')
                  : (language === 'hi' ? 'यूट्यूब पर भजन खोजें...' : 'Search bhajans on YouTube...')
              }
              isListening={isListening}
              onMicClick={startSpeechRecognition}
              autoFocus
              enableAutocomplete={false}
              onClear={() => {
                setQuery("");
                setYoutubeQuery("");
                setSelectedDeityFilter("");
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto max-w-5xl px-3.5 sm:px-4 pt-3.5 pb-12 sm:py-5">
        <AnimatePresence mode="wait">
          {!query.trim() ? (
            /* =========================================================================
               EXPLORE DASHBOARD
               (Order: 1. Apne Aradhya Chune -> 2. Spiritual Services -> 3. Time Devotion -> 4. Shloka -> 5. Bhajans)
               ========================================================================= */
            <div className="space-y-7 sm:space-y-9">
              
              {/* SECTION 1: अपने आराध्य चुनें (Immediately Below Header - 0 Unrelated Content Above) */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-[#D4A437] via-[#651317] to-[#D4A437] p-0.5 shadow-xs flex items-center justify-center shrink-0">
                      <img src={omWhiteSvg} alt="ॐ" className="w-full h-full object-contain" />
                    </div>
                    <h2 className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-[#3A2418] dark:text-[#FFFDF8]">
                      {language === 'hi' ? 'अपने आराध्य चुनें' : 'Choose Your Deity'}
                    </h2>
                    <span className="text-[#D4A437] text-xs">✦</span>
                  </div>
                  <Link 
                    to="/all-deities"
                    className="text-xs font-bold text-[#651317] dark:text-[#E8B15C] hover:underline transition-colors cursor-pointer"
                  >
                    {language === 'hi' ? 'सभी देव देखें →' : 'View All Deities →'}
                  </Link>
                </div>
                
                {/* Horizontal Scrolling Deity Deck */}
                <div className="relative flex items-center group/carousel">
                  <button 
                    onClick={() => scrollDeities('left')}
                    className="absolute -left-3.5 z-10 p-2 rounded-full bg-[#FFFDF8] dark:bg-zinc-800 border border-[#E8D8C4] dark:border-zinc-700 text-[#651317] dark:text-[#E8B15C] hover:bg-stone-50 hidden md:flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover/carousel:opacity-100 shadow-md"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div 
                    ref={deityScrollRef}
                    className="flex gap-3 sm:gap-4 overflow-x-auto pb-2.5 pt-1 no-scrollbar scroll-smooth snap-x snap-mandatory touch-pan-x w-full -mx-3.5 px-3.5 sm:mx-0 sm:px-0"
                  >
                    {allDeities.map((deity) => {
                      const slug = getDeitySlug(deity);
                      const floralSvg = getDeityFloralSvg(slug);
                      const count = getDeityCount(deity.id || 0);

                      return (
                        <div
                          key={`${deity.isCustom ? 'custom' : 'preset'}-${deity.id}`}
                          onClick={() => {
                            // Canonical direct navigation to /deity/:slug
                            navigate(getDeityUrl(deity));
                          }}
                          className="w-[125px] sm:w-[145px] md:w-[160px] shrink-0 snap-start rounded-[22px] bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4]/80 dark:border-[#D4A437]/25 p-3.5 flex flex-col items-center text-center shadow-[0_4px_16px_rgba(95,72,38,0.05)] hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer relative overflow-hidden select-none"
                        >
                          {/* Deity Portrait with Gold Halo Ring */}
                          <div className="w-[74px] h-[74px] sm:w-[86px] sm:h-[86px] rounded-full p-[2.5px] bg-gradient-to-b from-[#D4A437] via-[#651317] to-[#D4A437] shadow-md overflow-hidden relative">
                            <div className="w-full h-full rounded-full bg-[#FFFDF8] dark:bg-[#1A120B] flex items-center justify-center overflow-hidden">
                              {deity.imageUrl ? (
                                <img
                                  src={deity.imageUrl}
                                  alt={deity.name}
                                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                                  loading="lazy"
                                />
                              ) : (
                                <span className="text-3xl select-none">{deity.emoji}</span>
                              )}
                            </div>

                            {/* Floral motif watermark */}
                            {floralSvg && (
                              <img 
                                src={floralSvg} 
                                alt="" 
                                className="absolute -bottom-1 -right-1 w-5 h-5 drop-shadow-sm pointer-events-none opacity-90 transition-transform group-hover:rotate-12" 
                              />
                            )}
                          </div>

                          {/* Deity Name */}
                          <h3 className="font-serif text-sm sm:text-base font-bold text-[#3A2418] dark:text-[#FFFDF8] group-hover:text-[#651317] dark:group-hover:text-[#D4A437] transition-colors mt-2.5 truncate w-full">
                            {language === 'hi' ? (deity.nameHindi || deity.name) : deity.name}
                          </h3>

                          {/* Batched Bhajan Count Tag */}
                          <span className="px-2 py-0.5 rounded-full bg-[#651317]/8 dark:bg-[#D4A437]/15 text-[#651317] dark:text-[#E8B15C] text-[10px] sm:text-[11px] font-bold mt-1">
                            {count > 0 ? `${count} भजन` : "भजन संग्रह"}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <button 
                    onClick={() => scrollDeities('right')}
                    className="absolute -right-3.5 z-10 p-2 rounded-full bg-[#FFFDF8] dark:bg-zinc-800 border border-[#E8D8C4] dark:border-zinc-700 text-[#651317] dark:text-[#E8B15C] hover:bg-stone-50 hidden md:flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover/carousel:opacity-100 shadow-md"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </section>

              {/* Trending Devotional Search Chips */}
              <div className="p-3.5 sm:p-4 rounded-[20px] bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4]/70 dark:border-[#D4A437]/20 shadow-[0_2px_8px_rgba(95,72,38,0.03)]">
                <div className="flex items-center gap-2 mb-2.5 text-xs font-bold text-[#786252] dark:text-stone-400">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#D4A437] via-[#651317] to-[#D4A437] p-0.5 shadow-2xs flex items-center justify-center shrink-0">
                    <img src={omWhiteSvg} alt="ॐ" className="w-full h-full object-contain" />
                  </div>
                  <span className="font-serif font-bold text-sm text-[#3A2418] dark:text-[#FFFDF8]">
                    {language === 'hi' ? 'लोकप्रिय खोजें' : 'Trending Searches'}
                  </span>
                  <span className="text-[#D4A437] text-xs">✦</span>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {TRENDING_SEARCHES.map((item) => (
                    <button
                      key={item.query}
                      onClick={() => setQuery(item.query)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF2E8]/70 dark:bg-[#251A10] border border-[#E8D8C4] dark:border-zinc-800 text-[#651317] dark:text-[#E8B15C] text-xs font-bold hover:border-[#C89B3C] hover:bg-[#FAF2E8] shadow-2xs transition-all cursor-pointer active:scale-95"
                    >
                      <span className="text-xs">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION 2: त्वरित आध्यात्मिक सेवाएं (8 Feature Grid) */}
              <section className="space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-[#D4A437] via-[#651317] to-[#D4A437] p-0.5 shadow-xs flex items-center justify-center shrink-0">
                    <img src={omWhiteSvg} alt="ॐ" className="w-full h-full object-contain" />
                  </div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-[#3A2418] dark:text-[#FFFDF8]">
                    {language === 'hi' ? 'त्वरित आध्यात्मिक सेवाएं' : 'Devotional Services'}
                  </h2>
                  <span className="text-[#D4A437] text-xs">✦</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {[
                    { title: language === 'hi' ? 'भजन संग्रह' : 'Bhajan Sangrah', path: '/all-bhajans', imageSrc: manjiraSvg, badge: '500+ भजन', desc: 'मधुर संकीर्तन व धुनें' },
                    { title: language === 'hi' ? 'नित्य आरती' : 'Daily Aarti', path: '/live-aarti', imageSrc: liveArtiWebp, badge: 'दीप आरती', desc: 'आरती संग्रह व दीप वंदना' },
                    { title: language === 'hi' ? 'चालीसा संग्रह' : 'Chalisa & Stotras', path: '/chalisa', imageSrc: bookSvg, badge: 'पवित्र पाठ', desc: 'हनुमान चालीसा, स्तोत्र' },
                    { title: language === 'hi' ? 'नाम जप साधना' : 'Mantra Japa', path: '/meditation/mantra-japa', imageSrc: japWebp, badge: '108 माला', desc: 'माला काउंटर एवं जप' },
                    { title: language === 'hi' ? 'लाइव दर्शन' : 'Live Darshan', path: '/live-aarti', imageSrc: darshanWebp, badge: 'तीर्थ दर्शन', desc: 'प्रमुख तीर्थों के दर्शन' },
                    { title: language === 'hi' ? 'पोस्टर मेकर' : 'Poster Maker', path: '/wallpaper?tab=maker', imageSrc: posterWebp, badge: 'शुभ पोस्टर', desc: 'सुप्रभात व भक्ति पोस्टर' },
                    { title: language === 'hi' ? 'पवित्र ध्यान' : 'Meditation', path: '/meditation', imageSrc: meditationWebp, badge: 'मन की शांति', desc: 'आत्मिक संतुलन एवं संगीत' },
                    { title: language === 'hi' ? 'प्रार्थना संग्रह' : 'Prayers & Blessings', path: '/blessings', imageSrc: prayerSvg, badge: 'आशीर्वाद', desc: 'प्रभु से जुड़ें व प्रार्थना करें' },
                  ].map((item) => (
                    <div
                      key={item.title}
                      onClick={() => navigate(item.path)}
                      className="rounded-[20px] md:rounded-[24px] bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4]/70 dark:border-[#D4A437]/25 shadow-[0_4px_12px_rgba(95,72,38,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.5)] hover:shadow-[0_12px_28px_rgba(95,72,38,0.09)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group flex flex-col justify-between p-3.5 sm:p-4 text-center min-h-[145px] md:min-h-[180px] relative overflow-hidden select-none"
                    >
                      <div className="relative w-full h-[65px] md:h-[95px] flex items-center justify-center overflow-hidden shrink-0">
                        <img
                          src={item.imageSrc}
                          alt={item.title}
                          className="max-w-full max-h-full object-contain object-center group-hover:scale-108 transition-transform duration-300 pointer-events-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.06)]"
                          loading="lazy"
                        />
                      </div>

                      <div className="w-full mt-2">
                        <h3 className="text-[13.5px] sm:text-[15px] md:text-[16px] font-bold font-serif text-[#3A2418] dark:text-[#FFFDF8] leading-tight group-hover:text-[#651317] dark:group-hover:text-[#D4A437] transition-colors truncate">
                          {item.title}
                        </h3>
                        <p className="text-[10.5px] sm:text-[11.5px] text-[#786252] dark:text-stone-400 mt-0.5 truncate">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* SECTION 3: समय अनुसार भक्ति (Time of Day Curated Sadhana) */}
              <section className="bg-[#FFFDF8] dark:bg-[#1A120B] rounded-[24px] border border-[#E8D8C4]/80 dark:border-[#D4A437]/25 p-4 sm:p-6 shadow-[0_8px_24px_rgba(95,72,38,0.05)] text-left relative overflow-hidden">
                <img src={mandalaGold} className="absolute -right-6 -bottom-6 w-24 h-24 opacity-[0.02] pointer-events-none object-contain" alt="" />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#D4A437]" />
                    <h2 className="font-serif text-base sm:text-lg md:text-xl font-bold text-[#3A2418] dark:text-[#FFFDF8]">
                      {language === 'hi' ? 'समय अनुसार पावन भक्ति' : 'Time-of-Day Devotion'}
                    </h2>
                    <span className="text-[#D4A437] text-xs">✦</span>
                  </div>
                  <span className="text-xs text-[#786252] dark:text-stone-400 font-medium">
                    {language === 'hi' ? 'वर्तमान समय के अनुकूल साधना' : 'Curated for this moment'}
                  </span>
                </div>

                {/* 4 Time Slots Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                  {[
                    { id: 'morning', label: 'प्रातःकाल (4-11 AM)', emoji: '🌅', desc: 'प्रभाती व गायत्री' },
                    { id: 'afternoon', label: 'मध्याह्न (11-4 PM)', emoji: '☀️', desc: 'राम नाम व शांति' },
                    { id: 'evening', label: 'संध्याकाल (4-8 PM)', emoji: '🌆', desc: 'संध्या आरती व दीप' },
                    { id: 'night', label: 'रात्रि (8-4 AM)', emoji: '🌙', desc: 'शयन व मानसिक जप' },
                  ].map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedTimeSlot(slot.id as any)}
                      className={cn(
                        "p-3 rounded-2xl border text-left transition-all cursor-pointer",
                        selectedTimeSlot === slot.id
                          ? "bg-[#FAF2E8] dark:bg-[#251A10] border-[#D4A437] shadow-xs"
                          : "bg-[#FFFDF8] dark:bg-[#1A120B] border-[#E8D8C4]/60 dark:border-zinc-800 hover:border-[#D4A437]/50"
                      )}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#651317] dark:text-[#E8B15C]">
                        <span>{slot.emoji}</span>
                        <span className="truncate">{slot.label}</span>
                      </div>
                      <span className="text-[10px] text-[#786252] dark:text-stone-400 block mt-0.5 truncate">{slot.desc}</span>
                    </button>
                  ))}
                </div>

                {/* Slot Suggestion Details */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF2E8]/60 dark:bg-black/20 border border-[#E8D8C4] dark:border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {selectedTimeSlot === 'morning' ? '🌅' : selectedTimeSlot === 'afternoon' ? '☀️' : selectedTimeSlot === 'evening' ? '🌆' : '🌙'}
                    </span>
                    <div className="text-left">
                      <h4 className="font-serif font-bold text-xs sm:text-sm text-[#3A2418] dark:text-[#FFFDF8]">
                        {selectedTimeSlot === 'morning' && (language === 'hi' ? 'प्रातः साधना: गायत्री मंत्र, हनुमान चालीसा व प्रभाती भजन' : 'Morning Sadhana: Gayatri Mantra & Hanuman Chalisa')}
                        {selectedTimeSlot === 'afternoon' && (language === 'hi' ? 'मध्याह्न शांति: श्री राम जय राम, शांत कीर्तन व नाम जप' : 'Afternoon Peace: Sri Ram Naam & Relaxing Kirtan')}
                        {selectedTimeSlot === 'evening' && (language === 'hi' ? 'संध्या वंदन: आरती कुंजबिहारी की, शिव तांडव व दीप आरती' : 'Evening Devotion: Aarti Kunj Bihari & Shiv Tandav')}
                        {selectedTimeSlot === 'night' && (language === 'hi' ? 'रात्रि ध्यान: शयन आरती, सुखद निद्रा मंत्र व मानसिक शांति' : 'Night Calm: Sleep Aarti & Peaceful Meditation')}
                      </h4>
                      <span className="text-[11px] text-[#786252] dark:text-stone-400">
                        {language === 'hi' ? 'क्लिक करके तुरंत सुनें व पाठ करें' : 'Click to explore & listen instantly'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedTimeSlot === 'morning' && (
                      <>
                        <button onClick={() => setQuery("हनुमान चालीसा")} className="px-3.5 py-1.5 bg-white dark:bg-zinc-800 rounded-full border border-[#D4A437]/40 text-xs font-bold text-[#651317] dark:text-[#E8B15C] hover:bg-stone-50 cursor-pointer shadow-2xs">
                          हनुमान चालीसा
                        </button>
                        <button onClick={() => setQuery("गायत्री मंत्र")} className="px-3.5 py-1.5 bg-white dark:bg-zinc-800 rounded-full border border-[#D4A437]/40 text-xs font-bold text-[#651317] dark:text-[#E8B15C] hover:bg-stone-50 cursor-pointer shadow-2xs">
                          गायत्री मंत्र
                        </button>
                      </>
                    )}
                    {selectedTimeSlot === 'afternoon' && (
                      <>
                        <button onClick={() => setQuery("राम")} className="px-3.5 py-1.5 bg-white dark:bg-zinc-800 rounded-full border border-[#D4A437]/40 text-xs font-bold text-[#651317] dark:text-[#E8B15C] hover:bg-stone-50 cursor-pointer shadow-2xs">
                          श्री राम भजन
                        </button>
                        <button onClick={() => setQuery("कृष्ण")} className="px-3.5 py-1.5 bg-white dark:bg-zinc-800 rounded-full border border-[#D4A437]/40 text-xs font-bold text-[#651317] dark:text-[#E8B15C] hover:bg-stone-50 cursor-pointer shadow-2xs">
                          कृष्ण भजन
                        </button>
                      </>
                    )}
                    {selectedTimeSlot === 'evening' && (
                      <>
                        <button onClick={() => setQuery("आरती")} className="px-3.5 py-1.5 bg-white dark:bg-zinc-800 rounded-full border border-[#D4A437]/40 text-xs font-bold text-[#651317] dark:text-[#E8B15C] hover:bg-stone-50 cursor-pointer shadow-2xs">
                          संध्या आरती
                        </button>
                        <button onClick={() => setQuery("शिव")} className="px-3.5 py-1.5 bg-white dark:bg-zinc-800 rounded-full border border-[#D4A437]/40 text-xs font-bold text-[#651317] dark:text-[#E8B15C] hover:bg-stone-50 cursor-pointer shadow-2xs">
                          शिव स्तोत्र
                        </button>
                      </>
                    )}
                    {selectedTimeSlot === 'night' && (
                      <>
                        <button onClick={() => setQuery("ध्यान")} className="px-3.5 py-1.5 bg-white dark:bg-zinc-800 rounded-full border border-[#D4A437]/40 text-xs font-bold text-[#651317] dark:text-[#E8B15C] hover:bg-stone-50 cursor-pointer shadow-2xs">
                          शांति ध्यान
                        </button>
                        <button onClick={() => navigate('/meditation')} className="px-3.5 py-1.5 bg-white dark:bg-zinc-800 rounded-full border border-[#D4A437]/40 text-xs font-bold text-[#651317] dark:text-[#E8B15C] hover:bg-stone-50 cursor-pointer shadow-2xs">
                          माला जप
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </section>

              {/* SECTION 4: आज का पावन विचार एवं श्लोक (Vedic Shloka Card) */}
              <section className="bg-gradient-to-br from-amber-500/10 via-[#FFFDF8] to-orange-500/10 dark:from-amber-950/20 dark:via-[#1A120B] dark:to-orange-950/20 border border-[#D4A437]/40 rounded-[24px] p-4 sm:p-6 shadow-[0_8px_24px_rgba(95,72,38,0.05)] relative overflow-hidden text-left">
                <img src={mandalaGold} className="absolute -left-8 -top-8 w-28 h-28 opacity-[0.06] dark:opacity-[0.03] pointer-events-none object-contain" alt="" />
                
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <img src={bookSvg} alt="" className="w-5 h-5 object-contain" />
                    <h3 className="font-serif text-base sm:text-lg font-bold text-[#651317] dark:text-[#E8B15C]">
                      {language === 'hi' ? 'आज का पावन विचार एवं श्लोक' : 'Vedic Shloka of the Day'}
                    </h3>
                  </div>
                  <button
                    onClick={copyShlokaToClipboard}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-zinc-800 border border-[#D4A437]/30 text-xs font-bold text-[#651317] dark:text-[#E8B15C] hover:bg-stone-50 transition-all cursor-pointer shadow-2xs active:scale-95"
                  >
                    {copiedShloka ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedShloka ? (language === 'hi' ? 'कॉपी हुआ' : 'Copied') : (language === 'hi' ? 'शेयर करें' : 'Share')}</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-white/90 dark:bg-black/30 border border-[#D4A437]/25 backdrop-blur-2xs space-y-2.5">
                  <p className="font-serif text-sm sm:text-base font-bold text-[#651317] dark:text-[#E8B15C] leading-relaxed italic">
                    "{currentShloka.sanskrit}"
                  </p>
                  <p className="text-xs sm:text-sm text-[#554338] dark:text-stone-300 font-medium leading-relaxed">
                    <span className="font-bold text-[#651317] dark:text-[#E8B15C]">{language === 'hi' ? 'भावार्थ:' : 'Meaning:'}</span> {currentShloka.hindi}
                  </p>
                  <div className="flex items-center justify-between pt-1.5 border-t border-[#E8D8C4]/60 dark:border-zinc-800 text-xs text-[#786252] dark:text-stone-400 font-semibold">
                    <span>स्रोत: {currentShloka.source}</span>
                    <span className="text-[#D4A437]">✦ {currentShloka.deity} ✦</span>
                  </div>
                </div>
              </section>

              {/* SECTION 5: लोकप्रिय भजन संग्रह (Direct Link to All Bhajans & Bhajan Pages) */}
              <section className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-[#651317] to-[#80181D] p-1.5 shadow-xs flex items-center justify-center shrink-0">
                      <img src={headphoneSvg} alt="" className="w-full h-full object-contain invert brightness-200" />
                    </div>
                    <h2 className="font-serif text-lg sm:text-xl font-bold text-[#3A2418] dark:text-[#FFFDF8]">
                      {language === 'hi' ? 'लोकप्रिय भजन संग्रह' : 'Popular Bhajans'}
                    </h2>
                    <span className="text-[#D4A437] text-xs">✦</span>
                  </div>
                  <Link to="/all-bhajans" className="text-xs font-bold text-[#651317] dark:text-[#E8B15C] hover:underline">
                    {language === 'hi' ? 'सभी 500+ भजन →' : 'View All →'}
                  </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
                  {popularBhajansList.map((bhajan) => (
                    <div key={`popular-${bhajan.id}`} className="min-w-0">
                      <BhajanCard bhajan={bhajan} />
                    </div>
                  ))}
                </div>
              </section>

            </div>
          ) : (
            /* =========================================================================
               SEARCH RESULTS VIEW (When query search is active)
               ========================================================================= */
            <div className="space-y-6">
              {/* Dual Mode Switch */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setActiveMode('bhajans')}
                  className={cn(
                    "inline-flex items-center gap-2 px-5 py-2 rounded-full border text-xs sm:text-sm font-bold tracking-wide transition-all shadow-2xs cursor-pointer",
                    activeMode === 'bhajans'
                      ? 'bg-[#651317] text-white border-[#651317] shadow-xs'
                      : 'bg-[#FFFDF8] dark:bg-[#1A120B] text-[#651317] dark:text-[#E8D8C4] border-[#E8D8C4] dark:border-zinc-800 hover:bg-[#FAF2E8]'
                  )}
                >
                  <BookText className="w-4 h-4" />
                  <span>{language === 'hi' ? 'भजन व आरतियाँ' : 'In-App Bhajans'}</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">{results.length}</span>
                </button>
                <button
                  onClick={() => setActiveMode('youtube')}
                  className={cn(
                    "inline-flex items-center gap-2 px-5 py-2 rounded-full border text-xs sm:text-sm font-bold tracking-wide transition-all shadow-2xs cursor-pointer",
                    activeMode === 'youtube'
                      ? 'bg-red-700 text-white border-red-700 shadow-xs'
                      : 'bg-[#FFFDF8] dark:bg-[#1A120B] text-[#651317] dark:text-[#E8D8C4] border-[#E8D8C4] dark:border-zinc-800 hover:bg-[#FAF2E8]'
                  )}
                >
                  <Youtube className="w-4 h-4 text-red-500 group-hover:text-white" />
                  <span>{language === 'hi' ? 'यूट्यूब खोज' : 'YouTube Discovery'}</span>
                </button>
              </div>

              {activeMode === 'bhajans' ? (
                <>
                  {/* Matched Features Banner */}
                  {debouncedQuery.trim() && matchedFeatures.length > 0 && (
                    <div className="space-y-3 bg-gradient-to-r from-amber-500/10 via-[#FAF2E8] to-amber-500/5 dark:from-amber-950/20 dark:via-[#1A120B] dark:to-amber-950/10 p-4 sm:p-5 rounded-[24px] border border-[#D4A437]/30 shadow-2xs overflow-hidden w-full">
                      <div className="flex items-center gap-2 px-1">
                        <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <h3 className="font-serif text-sm sm:text-base font-extrabold text-[#3A2418] dark:text-[#FFFDF8]">
                          {language === 'hi' ? 'मिलती-जुलती सेवाएं एवं सुविधाएं' : 'Matching Features & Tools'}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                        {matchedFeatures.map((feat) => (
                          <div
                            key={feat.id}
                            onClick={() => navigate(feat.path)}
                            className="bg-[#FFFDF8] dark:bg-black/30 border border-[#E8D8C4] dark:border-zinc-800 rounded-[20px] p-3.5 sm:p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-2.5 group text-left"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                                  {renderFeatureIcon(feat.iconName)}
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                  <h4 className="font-serif font-extrabold text-xs sm:text-sm text-[#3A2418] dark:text-foreground truncate leading-snug">
                                    {language === 'hi' ? feat.titleHindi : feat.title}
                                  </h4>
                                  <span className="text-[10px] font-semibold text-[#786252] dark:text-muted-foreground/70 truncate">
                                    {language === 'hi' ? 'सुविधा / टूल' : 'Feature / Tool'}
                                  </span>
                                </div>
                              </div>

                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-200 shrink-0">
                                {language === 'hi' ? feat.badgeHindi : feat.badge}
                              </span>
                            </div>

                            <p className="text-[11px] sm:text-xs text-[#786252] dark:text-muted-foreground/80 leading-relaxed line-clamp-2">
                              {language === 'hi' ? feat.descriptionHindi : feat.description}
                            </p>

                            <div className="flex items-center justify-end pt-1.5 border-t border-[#E8D8C4]/60 dark:border-zinc-800/60 w-full">
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#651317] text-white dark:bg-[#D4A437] dark:text-black text-[11px] font-bold shadow-2xs group-hover:scale-[1.02] transition-transform">
                                <span>{language === 'hi' ? 'शुरू करें' : 'Launch'}</span>
                                <ArrowRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matched Aartis & Chalisas */}
                  {debouncedQuery.trim() && matchedAartis.length > 0 && (
                    <div className="space-y-3 bg-red-500/5 dark:bg-red-950/15 p-4 sm:p-5 rounded-[24px] border border-red-500/20 shadow-2xs overflow-hidden w-full">
                      <div className="flex items-center gap-2 px-1">
                        <Flame className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <h3 className="font-serif text-sm sm:text-base font-extrabold text-[#3A2418] dark:text-[#FFFDF8]">
                          {language === 'hi' ? 'आरती एवं चालीसा परिणाम' : 'Matching Aartis & Chalisas'}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                        {matchedAartis.map((ac) => (
                          <div
                            key={ac.id}
                            onClick={() => navigate(ac.path || `/aarti-chalisa`)}
                            className="bg-[#FFFDF8] dark:bg-black/30 border border-[#E8D8C4] dark:border-zinc-800 rounded-[20px] p-3.5 sm:p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-2 group text-left"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                                  <Flame className="w-4 h-4 text-red-600 dark:text-red-400" />
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                  <h4 className="font-serif font-extrabold text-xs sm:text-sm text-[#3A2418] dark:text-foreground truncate leading-snug">
                                    {language === 'hi' ? ac.titleHindi : ac.title}
                                  </h4>
                                  {ac.singerName && (
                                    <span className="text-[10px] font-semibold text-[#786252] dark:text-muted-foreground/70 truncate">
                                      {ac.singerName}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-red-100 text-red-900 dark:bg-red-950/70 dark:text-red-300 border border-red-200 shrink-0">
                                {ac.type === 'chalisa' ? (language === 'hi' ? 'चालीसा' : 'Chalisa') : (language === 'hi' ? 'आरती' : 'Aarti')}
                              </span>
                            </div>

                            {ac.lyricsSnippet && (
                              <p className="text-[11px] text-[#786252] dark:text-muted-foreground/80 leading-relaxed line-clamp-2 italic font-serif">
                                "{ac.lyricsSnippet}"
                              </p>
                            )}

                            <div className="flex items-center justify-end pt-1.5 border-t border-[#E8D8C4]/60 dark:border-zinc-800/60 w-full">
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#651317] text-white dark:bg-[#D4A437] dark:text-black text-[11px] font-bold shadow-2xs">
                                <span>{language === 'hi' ? 'पढ़ें एवं देखें' : 'Read & View'}</span>
                                <ArrowRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matched Deities (Direct Canonical Navigation to /deity/:slug) */}
                  {debouncedQuery.trim() && matchedDeities.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base select-none">🕉️</span>
                        <h3 className="font-serif text-sm sm:text-base font-extrabold text-[#3A2418] dark:text-[#FFFDF8]">
                          {language === 'hi' ? 'संबंधित आराध्य देवता' : 'Matching Deities'}
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {matchedDeities.map((d) => (
                          <div
                            key={d.id}
                            onClick={() => {
                              navigate(getDeityUrl(d));
                            }}
                            className="bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-zinc-800/80 rounded-2xl p-2.5 sm:p-3 flex items-center gap-2.5 shadow-2xs hover:shadow-md cursor-pointer transition-all group"
                          >
                            <span className="text-2xl shrink-0 select-none">{d.emoji}</span>
                            <div className="flex flex-col min-w-0 text-left">
                              <span className="font-bold text-xs text-[#3A2418] dark:text-foreground truncate group-hover:text-[#651317] dark:group-hover:text-[#D4A437]">
                                {language === 'hi' ? d.nameHindi : d.name}
                              </span>
                              <span className="text-[10px] text-[#786252] dark:text-muted-foreground truncate">
                                {language === 'hi' ? 'देव लोक देखें →' : 'View Profile →'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Clean Scrollable Deity Filter Bar */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-sans font-black tracking-wider text-[#651317] dark:text-[#D4A437] uppercase">
                        ⚡ {language === 'hi' ? 'देवता द्वारा फ़िल्टर करें' : 'Filter by Deity'}
                      </span>
                      {(query || selectedDeityFilter) && (
                        <button
                          onClick={() => {
                            setQuery("");
                            setSelectedDeityFilter("");
                          }}
                          className="text-xs font-sans font-bold text-[#FF6A00] hover:underline cursor-pointer"
                        >
                          {language === 'hi' ? 'फ़िल्टर साफ करें' : 'Clear all'}
                        </button>
                      )}
                    </div>
                    
                    <div 
                      ref={filterPillsRef}
                      className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth w-full"
                    >
                      <button
                        onClick={() => setSelectedDeityFilter("")}
                        className={cn(
                          "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs whitespace-nowrap shrink-0",
                          !selectedDeityFilter
                            ? "bg-[#651317] text-white"
                            : "bg-[#FFFDF8] dark:bg-[#1A120B] text-[#651317] dark:text-[#E8D8C4] border border-[#E8D8C4] dark:border-zinc-800 hover:bg-[#FAF2E8]"
                        )}
                      >
                        All
                      </button>
                      {allDeities.map((deity) => {
                        const deitySlug = getDeitySlug(deity);
                        const isSelected = selectedDeityFilter === deitySlug;
                        return (
                          <button
                            key={`${deity.isCustom ? 'custom' : 'preset'}-${deity.id}`}
                            onClick={() => setSelectedDeityFilter(isSelected ? "" : deitySlug)}
                            className={cn(
                              "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs whitespace-nowrap shrink-0",
                              isSelected
                                ? "bg-[#651317] text-white"
                                : "bg-[#FFFDF8] dark:bg-[#1A120B] text-[#651317] dark:text-[#E8D8C4] border border-[#E8D8C4] dark:border-zinc-800 hover:bg-[#FAF2E8]"
                            )}
                          >
                            {language === 'hi' ? (deity.nameHindi || deity.name) : deity.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Results Count Header */}
                  <div className="pt-2 text-left">
                    <h3 className="font-serif text-base sm:text-lg font-bold text-foreground">
                      {language === 'hi' ? 'खोज परिणाम' : 'Search Results'}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <span className="text-[#651317] dark:text-[#D4A437] font-bold">{results.length}</span> {language === 'hi' ? 'भजन मिले' : 'bhajans found'}
                      {debouncedQuery.trim() && (
                        <> {language === 'hi' ? 'के लिए' : 'for'} "<span className="text-foreground font-semibold">{debouncedQuery}</span>"</>
                      )}
                    </p>
                  </div>

                  {/* Search Results Grid */}
                  {results.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 md:gap-5">
                        {results.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((bhajan) => (
                          <div
                            key={`${bhajan.source}-${bhajan.sourceKey}`}
                            className="min-w-0"
                          >
                            <BhajanCard bhajan={bhajan} />
                          </div>
                        ))}
                      </div>

                      <Pagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(results.length / pageSize)}
                        onPageChange={(page) => setCurrentPage(page)}
                      />
                    </>
                  ) : (
                    /* Fallback Empty State */
                    <div className="space-y-6 py-10">
                      <div className="text-center py-6 bg-[#FFFDF8] dark:bg-[#1A120B] border border-dashed border-[#E8D8C4] dark:border-zinc-800 rounded-[24px] p-6">
                        <span className="text-3xl mb-2 block">🪷</span>
                        <p className="text-muted-foreground text-sm font-semibold mb-1">
                          {language === 'hi' ? 'कोई भजन नहीं मिला' : 'No bhajans found'}
                        </p>
                        <p className="text-xs text-muted-foreground mb-4">
                          {language === 'hi' ? 'कृपया अन्य नाम से खोजें या अपनी वैदिक कुंडली देखें' : 'Try searching another name or check your Vedic Kundli'}
                        </p>
                        
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <button
                            onClick={() => {
                              setQuery("");
                              setSelectedDeityFilter("");
                            }}
                            className="px-4 py-2 rounded-full bg-[#651317] text-white text-xs font-bold cursor-pointer"
                          >
                            {language === 'hi' ? 'सभी भजन देखें' : 'View All Bhajans'}
                          </button>
                          <Link
                            to="/kundli"
                            className="px-4 py-2 rounded-full border border-[#D4A437] text-[#651317] dark:text-[#E8B15C] text-xs font-bold inline-flex items-center gap-1"
                          >
                            <span>{language === 'hi' ? 'वैदिक कुंडली देखें' : 'Vedic Kundli'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* YouTube Discovery Grid */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-zinc-800/80 rounded-[24px] p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Youtube className="w-5 h-5 text-red-600" />
                      <h3 className="font-serif text-sm sm:text-base font-bold text-foreground">
                        {language === 'hi' ? 'यूट्यूब भजन परिणाम' : 'YouTube Search Results'}
                      </h3>
                    </div>
                    {youtubeLoading ? (
                      <div className="py-12 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-[#651317]" />
                      </div>
                    ) : youtubeError ? (
                      <div className="space-y-3">
                        <p className="text-xs text-destructive bg-destructive/10 rounded-xl p-3">{youtubeError}</p>
                        {youtubeQuery.trim().length >= 2 && (
                          <a
                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(youtubeQuery.trim())}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-xl border border-border hover:border-[#651317]"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Direct on YouTube
                          </a>
                        )}
                      </div>
                    ) : youtubeResults.length > 0 ? (
                      <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                        {youtubeResults.map((video) => {
                          const thumbUrl = video.thumbnailUrl || `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
                          return (
                            <div
                              key={video.id}
                              className={cn(
                                "p-3 rounded-2xl border transition-all flex gap-3 items-center",
                                selectedVideo?.id === video.id
                                  ? 'border-[#651317] bg-[#651317]/5 dark:bg-[#E8B15C]/10 shadow-xs'
                                  : 'border-[#E8D8C4] dark:border-zinc-800 bg-[#FFFDF8] dark:bg-[#1A120B] hover:border-[#651317]/50'
                              )}
                            >
                              <div 
                                onClick={() => {
                                  setSelectedVideo(video);
                                  openPlayer({
                                    id: video.id,
                                    title: video.title,
                                    channel: video.channel,
                                  });
                                }}
                                className="w-24 sm:w-32 aspect-video rounded-xl overflow-hidden relative shrink-0 bg-stone-900 cursor-pointer group/thumb shadow-2xs"
                              >
                                <img
                                  src={thumbUrl}
                                  alt={video.title}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover/thumb:bg-black/40 transition-colors flex items-center justify-center">
                                  <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
                                    <PlayCircle className="w-4 h-4 text-white" />
                                  </div>
                                </div>
                                {video.duration && (
                                  <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-[8.5px] font-bold text-white">
                                    {video.duration}
                                  </span>
                                )}
                              </div>

                              <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch text-left">
                                <button
                                  onClick={() => {
                                    setSelectedVideo(video);
                                    openPlayer({
                                      id: video.id,
                                      title: video.title,
                                      channel: video.channel,
                                    });
                                  }}
                                  className="text-left group/title cursor-pointer"
                                >
                                  <h4 className="text-xs sm:text-sm font-bold text-foreground group-hover/title:text-[#651317] dark:group-hover/title:text-[#E8B15C] line-clamp-2 leading-snug">
                                    {video.title}
                                  </h4>
                                  <p className="text-[10.5px] text-muted-foreground mt-0.5 font-medium truncate">
                                    {video.channel} {video.viewsText ? `• ${video.viewsText}` : ''}
                                  </p>
                                </button>

                                <div className="mt-2 flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedVideo(video);
                                      openPlayer({
                                        id: video.id,
                                        title: video.title,
                                        channel: video.channel,
                                      });
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[10.5px] rounded-full bg-[#651317] dark:bg-[#D4A437] text-white dark:text-black font-bold shadow-2xs hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
                                  >
                                    <PlayCircle className="w-3.5 h-3.5 shrink-0" />
                                    <span>{language === 'hi' ? 'चलाएं' : 'Play'}</span>
                                  </button>

                                  <a
                                    href={`https://www.youtube.com/watch?v=${video.id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[10.5px] rounded-full border border-border hover:border-[#651317] text-muted-foreground hover:text-foreground font-semibold transition-all"
                                  >
                                    <ExternalLink className="w-3 h-3 shrink-0" />
                                    <span>YouTube</span>
                                  </a>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-8 space-y-3 text-center">
                        <p className="text-xs text-muted-foreground">
                          {language === 'hi' ? 'यूट्यूब पर भजन खोजने के लिए नाम लिखें' : 'Search a bhajan name to discover videos on YouTube.'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-[#FFFDF8] dark:bg-[#1A120B] border border-[#E8D8C4] dark:border-zinc-800/80 rounded-[24px] p-4 sm:p-5 flex flex-col justify-between text-left">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Music2 className="w-5 h-5 text-[#651317] dark:text-[#E8B15C]" />
                        <h3 className="font-serif text-sm sm:text-base font-bold text-foreground">
                          {language === 'hi' ? 'प्लेबैक जानकारी' : 'Playback Info'}
                        </h3>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-2 leading-relaxed">
                        <p>✦ {language === 'hi' ? 'ऐप में ऑडियो बिना विज्ञापन के बैकग्राउंड में सुन सकते हैं।' : 'In-app audio playbacks are ad-free and support background listening.'}</p>
                        <p>✦ {language === 'hi' ? 'यूट्यूब डिस्कवरी सीधे यूट्यूब प्लेयर से स्ट्रीम होती है।' : 'YouTube discovery streams directly from YouTube.'}</p>
                      </div>
                    </div>

                    {selectedVideo ? (
                      <div className="mt-6 p-4 bg-[#FAF2E8]/60 dark:bg-black/30 rounded-2xl border border-[#E8D8C4] dark:border-zinc-800 space-y-2.5">
                        <p className="text-xs font-semibold text-foreground line-clamp-2">{selectedVideo.title}</p>
                        <p className="text-[10px] text-muted-foreground">{selectedVideo.channel}</p>
                        <button
                          onClick={() =>
                            openPlayer({
                              id: selectedVideo.id,
                              title: selectedVideo.title,
                              channel: selectedVideo.channel,
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#651317] text-white text-xs font-bold shadow-2xs cursor-pointer"
                        >
                          <PlayCircle className="w-4 h-4" />
                          <span>{language === 'hi' ? 'प्लेबैक शुरू करें' : 'Start Playback'}</span>
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground py-8 text-center bg-[#FAF2E8]/30 dark:bg-black/10 border border-dashed border-[#E8D8C4] dark:border-zinc-800 rounded-2xl mt-4">
                        {language === 'hi' ? 'प्लेबैक नियंत्रित करने के लिए परिणाम में से कोई वीडियो चुनें।' : 'Select a YouTube video from results to control playback.'}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
