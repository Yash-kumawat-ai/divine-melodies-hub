import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { 
  Search as SearchIcon, 
  Music2, 
  BookText, 
  Loader2, 
  Youtube, 
  ExternalLink, 
  PlayCircle, 
  MessageSquare,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Mic,
  Heart,
  Sparkles,
  Play,
  X
} from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BhajanCard from "@/components/BhajanCard";
import BhajanDetailModal from "@/components/BhajanDetailModal";
import { bhajans, deities, Bhajan, getDeityById } from "@/data/bhajans";
import { smartSearchBhajans } from "@/lib/searchAlgorithm";
import { generateBhajanSlug } from "@/lib/slugUtils";
import { supabase } from "@/integrations/supabase/client";
import { useDeities } from "@/hooks/useDeities";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLyricsFallback } from "@/hooks/useLyricsFallback";
import { useAssistantContext } from "@/hooks/useAssistantContext";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import { useLanguage } from "@/hooks/useLanguage";
import { searchYouTubeVideos, YouTubeVideoResult } from "@/lib/youtubeSearch";
import { useLikedBhajans } from "@/hooks/useLikedBhajans";
import { cn } from "@/lib/utils";
import { WALLPAPERS_LIST, POSTER_TEMPLATES } from "@/pages/Blessings/constants";

interface UserBhajan {
  id: string;
  user_id: string;
  title: string;
  title_hindi: string;
  deity_id: number;
  singer_name: string;
  composer_name?: string;
  image_url?: string;
  youtube_url?: string;
  lyrics_hindi: string;
  created_at: string;
  status: string;
}

export default function SearchPage() {
  const navigate = useNavigate();
  const { likedBhajans, likedIds } = useLikedBhajans();
  const [isListening, setIsListening] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialDeity = searchParams.get("deity") || "";
  const [query, setQuery] = useState(initialQuery);
  const [youtubeQuery, setYoutubeQuery] = useState(initialQuery);
  const [youtubeResults, setYoutubeResults] = useState<YouTubeVideoResult[]>([]);
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [youtubeError, setYoutubeError] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideoResult | null>(null);
  const [activeMode, setActiveMode] = useState<'bhajans' | 'youtube'>('bhajans');
  const [selectedDeity, setSelectedDeity] = useState(initialDeity);
  const [showAllDeities, setShowAllDeities] = useState(false);
  const [userBhajans, setUserBhajans] = useState<UserBhajan[]>([]);
  const [loadingUserBhajans, setLoadingUserBhajans] = useState(true);
  const [selectedBhajanForDetail, setSelectedBhajanForDetail] = useState<Bhajan | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { deities: allDeities, loading: deitiesLoading } = useDeities();
  const isMobile = useIsMobile();
  const deityScrollRef = useRef<HTMLDivElement>(null);
  
  // Lyrics fallback orchestration
  const lyricsFallback = useLyricsFallback();
  const [showFallbackLyrics, setShowFallbackLyrics] = useState(false);
  
  // Assistant context management
  const { setContext: setAssistantContext } = useAssistantContext();
  const { openPlayer } = useYouTubePlayer();
  const { t, language } = useLanguage();

  // Define results BEFORE using it in useEffect dependency arrays
  const results = useMemo(() => {
    // Keep a stable source key so React list keys are always unique.
    const staticBhajans = bhajans.map((b) => ({
      ...b,
      source: 'static' as const,
      sourceKey: String(b.id),
    }));

    const uploadedBhajans = userBhajans.map((ub, index) => ({
      id: bhajans.length + index + 1,
      slug: generateBhajanSlug(ub.title),
      title: ub.title,
      titleHindi: ub.title_hindi,
      deityId: ub.deity_id,
      singerName: ub.singer_name,
      composerName: ub.composer_name || '',
      youtubeUrl: ub.youtube_url || '',
      imageUrl: ub.image_url || '',
      lyricsHindi: ub.lyrics_hindi,
      lyricsTransliteration: '',
      playCount: 0,
      rating: 0,
      tags: [],
      featured: false,
      source: 'user' as const,
      sourceKey: ub.id,
    }));

    const combinedBhajans = [...staticBhajans, ...uploadedBhajans];

    let filtered = combinedBhajans;

    if (selectedDeity) {
      filtered = filtered.filter(b => {
        // Find the deity by matching slug
        const matchingDeity = allDeities.find(d => {
          if (d.isCustom) {
            // For custom deities, use name-based slug
            const deitySlug = d.name.toLowerCase().replace(/\s+/g, '-');
            return deitySlug === selectedDeity;
          } else {
            // For preset deities, use the slug from static data
            const presetDeity = deities.find(pd => pd.id === d.id);
            return presetDeity?.slug === selectedDeity;
          }
        });

        // Check if bhajan matches the selected deity ID
        if (matchingDeity && matchingDeity.id) {
          return b.deityId === matchingDeity.id;
        }
        return false;
      });
    }

    if (query.trim()) {
      filtered = smartSearchBhajans(query, filtered);
    }

    return filtered;
  }, [query, selectedDeity, userBhajans, allDeities]);

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
        const results = await searchYouTubeVideos(q);
        setYoutubeResults(results);
      } catch (error: any) {
        setYoutubeError(error.message || 'Unable to search YouTube right now.');
      } finally {
        setYoutubeLoading(false);
      }
    };

    const timer = setTimeout(run, 350);
    return () => clearTimeout(timer);
  }, [youtubeQuery]);

  // Fetch user uploads on mount
  useEffect(() => {
    const fetchUserBhajans = async () => {
      try {
        const { data, error } = await supabase
          .from('user_uploads')
          .select('*')
          .eq('status', 'approved')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching user bhajans:', error);
        } else if (data) {
          setUserBhajans(data as UserBhajan[]);
        }
      } catch (err) {
        console.error('Error fetching user bhajans:', err);
      } finally {
        setLoadingUserBhajans(false);
      }
    };

    fetchUserBhajans();
  }, []);

  const handleDeityFilter = (slug: string) => {
    setSelectedDeity(slug === selectedDeity ? "" : slug);
  };

  const getDeitySlug = (deity: typeof allDeities[number]) => {
    if (deity.isCustom) {
      return deity.name.toLowerCase().replace(/\s+/g, '-');
    }
    return deities.find(d => d.id === deity.id)?.slug || deity.name.toLowerCase();
  };

  const visibleDeities = useMemo(() => {
    const mobileLimit = 7;
    if (!isMobile || showAllDeities) return allDeities;

    const limitedDeities = allDeities.slice(0, mobileLimit);
    if (!selectedDeity) return limitedDeities;

    const selectedDeityItem = allDeities.find((deity) => getDeitySlug(deity) === selectedDeity);
    if (!selectedDeityItem) return limitedDeities;

    const alreadyVisible = limitedDeities.some((deity) => getDeitySlug(deity) === selectedDeity);
    return alreadyVisible ? limitedDeities : [...limitedDeities, selectedDeityItem];
  }, [allDeities, isMobile, showAllDeities, selectedDeity]);

  // Speech recognition handler
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error(language === 'hi' ? 'आपका ब्राउज़र वॉइस सर्च का समर्थन नहीं करता है।' : "Speech recognition is not supported in your browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
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
      console.error(e);
      setIsListening(false);
      toast.error(language === 'hi' ? 'वॉइस सर्च विफल रहा।' : 'Speech recognition failed.');
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    recognition.start();
  };

  const getDeityBg = (slug: string) => {
    switch (slug) {
      case 'krishna': return 'bg-sky-100 dark:bg-sky-950/40 text-sky-600 border-sky-200/50';
      case 'shiva': return 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 border-orange-200/50';
      case 'hanuman': return 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 border-amber-200/50';
      case 'rama': return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border-emerald-200/50';
      case 'durga': return 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 border-rose-200/50';
      case 'ganesh': return 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 border-yellow-200/50';
      case 'sai-baba': return 'bg-stone-50 dark:bg-stone-950/30 text-stone-600 border-stone-200/50';
      case 'lakshmi': return 'bg-pink-50 dark:bg-pink-950/30 text-pink-600 border-pink-200/50';
      default: return 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 border-amber-200/50';
    }
  };

  const today = new Date();
  const panchangData = useMemo(() => {
    const day = today.getDay();
    const tithis = [
      { hi: "एकादशी (शुक्ल पक्ष)", en: "Ekadashi (Shukla Paksha)" },
      { hi: "द्वादशी (शुक्ल पक्ष)", en: "Dwadashi (Shukla Paksha)" },
      { hi: "त्रयोदशी (शुक्ल पक्ष)", en: "Trayodashi (Shukla Paksha)" },
      { hi: "चतुर्दशी (शुक्ल पक्ष)", en: "Chaturdashi (Shukla Paksha)" },
      { hi: "पूर्णिमा", en: "Purnima" },
      { hi: "प्रतिपदा (कृष्ण पक्ष)", en: "Pratipada (Krishna Paksha)" },
      { hi: "द्वितीया (कृष्ण पक्ष)", en: "Dwitiya (Krishna Paksha)" },
      { hi: "तृतीया (कृष्ण पक्ष)", en: "Tritiya (Krishna Paksha)" },
      { hi: "चतुर्थी (कृष्ण पक्ष)", en: "Chaturthi (Krishna Paksha)" },
      { hi: "पंचमी (कृष्ण पक्ष)", en: "Panchami (Krishna Paksha)" },
    ];
    const nakshatras = [
      { hi: "रोहिणी", en: "Rohini" },
      { hi: "मृगशिरा", en: "Mrigashira" },
      { hi: "आर्द्रा", en: "Ardra" },
      { hi: "पुनर्वसु", en: "Punarvasu" },
      { hi: "पुष्य", en: "Pushya" },
      { hi: "अश्लेषा", en: "Ashlesha" },
      { hi: "मघा", en: "Magha" },
    ];
    return {
      tithi: tithis[day % tithis.length],
      nakshatra: nakshatras[day % nakshatras.length],
      rahuKaal: day === 0 ? "04:30 PM - 06:00 PM" : day === 1 ? "07:30 AM - 09:00 AM" : "01:30 PM - 03:00 PM",
    };
  }, [today]);

  const popularBhajansList = useMemo(() => {
    return bhajans.filter(b => [1, 2, 3, 6].includes(b.id));
  }, []);

  const scrollDeities = (direction: 'left' | 'right') => {
    if (deityScrollRef.current) {
      const scrollAmt = direction === 'left' ? -200 : 200;
      deityScrollRef.current.scrollBy({ left: scrollAmt, behavior: 'smooth' });
    }
  };

  // Deity-Specific Portal calculations
  const selectedDeityItem = useMemo(() => {
    if (!selectedDeity) return null;
    return allDeities.find(d => {
      if (d.isCustom) {
        return d.name.toLowerCase().replace(/\s+/g, '-') === selectedDeity;
      }
      return deities.find(pd => pd.id === d.id)?.slug === selectedDeity;
    });
  }, [selectedDeity, allDeities]);

  const deityBhajans = useMemo(() => {
    if (!selectedDeityItem) return [];
    return results; // results list is already filtered by selectedDeity
  }, [results, selectedDeityItem]);

  const bhajanCategoryMap = useMemo(() => {
    const map = {
      bhajan: [] as typeof results,
      aarti: [] as typeof results,
      mantra: [] as typeof results,
      kirtan: [] as typeof results,
      chalisa: [] as typeof results,
    };

    deityBhajans.forEach(b => {
      const title = (b.titleHindi + " " + b.title + " " + b.lyricsHindi).toLowerCase();
      if (title.includes("आरती") || title.includes("aarti")) {
        map.aarti.push(b);
      } else if (title.includes("मंत्र") || title.includes("mantra") || title.includes("ॐ")) {
        map.mantra.push(b);
      } else if (title.includes("चालीसा") || title.includes("chalisa")) {
        map.chalisa.push(b);
      } else if (title.includes("कीर्तन") || title.includes("kirtan") || title.includes("धुन")) {
        map.kirtan.push(b);
      } else {
        map.bhajan.push(b);
      }
    });

    return map;
  }, [deityBhajans]);

  const bhajansCount = bhajanCategoryMap.bhajan.length;
  const aartiCount = bhajanCategoryMap.aarti.length;
  const mantraCount = bhajanCategoryMap.mantra.length;
  const kirtanCount = bhajanCategoryMap.kirtan.length;

  const categories = ["सभी", "भजन", "आरती", "मंत्र", "चालीसा", "कीर्तन", "वॉलपेपर", "पोस्टर"];
  const [activeCategory, setActiveCategory] = useState("सभी");

  // Dynamic wallpapers list for selected deity
  const deityWallpapers = useMemo(() => {
    if (!selectedDeityItem) return [];
    
    // Find all static wallpapers matching this deity name
    const matches = WALLPAPERS_LIST.filter(w => 
      w.deity.toLowerCase() === selectedDeityItem.name.toLowerCase() ||
      selectedDeityItem.name.toLowerCase().includes(w.deity.toLowerCase()) ||
      w.deity.toLowerCase().includes(selectedDeityItem.name.toLowerCase())
    );
    
    // If no matching wallpapers are found, fallback to generating mock wallpapers from the deity profile image
    if (matches.length === 0) {
      return [1, 2, 3].map(num => ({
        id: `mock-wp-${selectedDeityItem.id}-${num}`,
        name: `${selectedDeityItem.name} Wallpaper ${num}`,
        nameHindi: `${selectedDeityItem.nameHindi || selectedDeityItem.name} वॉलपेपर ${num}`,
        imageUrl: selectedDeityItem.imageUrl || "",
      }));
    }
    
    return matches;
  }, [selectedDeityItem]);

  // Dynamic posters list for selected deity
  const deityPosters = useMemo(() => {
    if (!selectedDeityItem) return [];
    
    // Find all poster templates matching this deity name
    const matches = POSTER_TEMPLATES.filter(p => 
      p.title.toLowerCase().includes(selectedDeityItem.name.toLowerCase()) ||
      selectedDeityItem.name.toLowerCase().includes(p.title.toLowerCase()) ||
      (p.titleHindi && p.titleHindi.includes(selectedDeityItem.nameHindi || ""))
    );
    
    // If no matching posters are found, fallback to generating mock posters from the deity profile image
    if (matches.length === 0) {
      return [1, 2, 3].map(num => ({
        id: `mock-poster-${selectedDeityItem.id}-${num}`,
        title: `${selectedDeityItem.name} Poster ${num}`,
        titleHindi: `${selectedDeityItem.nameHindi || selectedDeityItem.name} पोस्टर ${num}`,
        imageUrl: selectedDeityItem.imageUrl || "",
      }));
    }
    
    return matches;
  }, [selectedDeityItem]);

  const categoryFilteredBhajans = useMemo(() => {
    if (activeCategory === "सभी") return deityBhajans;
    if (activeCategory === "भजन") return bhajanCategoryMap.bhajan;
    if (activeCategory === "आरती") return bhajanCategoryMap.aarti;
    if (activeCategory === "मंत्र") return bhajanCategoryMap.mantra;
    if (activeCategory === "चालीसा") return bhajanCategoryMap.chalisa;
    if (activeCategory === "कीर्तन") return bhajanCategoryMap.kirtan;
    return [];
  }, [activeCategory, deityBhajans, bhajanCategoryMap]);

  const downloadImage = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name}.webp`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(language === 'hi' ? 'वॉलपेपर डाउनलोड होना शुरू हो गया है।' : 'Wallpaper download started!');
  };

  const playShaniMantra = (e: React.MouseEvent) => {
    e.stopPropagation();
    openPlayer({
      id: "vQ8zD4G_7qE",
      title: "Shani Gayatri Mantra",
      channel: "Divine Melodies",
    });
    toast.success(language === 'hi' ? 'शनि गायत्री मंत्र शुरू हो गया है।' : 'Playing Shani Gayatri Mantra!');
  };

  return (
    <div className="min-h-screen bg-background pb-12">
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

      {/* Search Header Bar (No line/border at bottom) */}
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl px-4 py-3">
        <div className="container mx-auto max-w-5xl flex items-center gap-3">
          <button
            onClick={() => {
              if (query.trim() || selectedDeity) {
                setQuery("");
                setSelectedDeity("");
              } else {
                navigate(-1);
              }
            }}
            className="p-2 -ml-2 rounded-full hover:bg-muted text-foreground transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex-1 relative flex items-center bg-white dark:bg-muted/40 border border-stone-200 dark:border-white/10 hover:border-amber-500/30 focus-within:border-amber-500/60 focus-within:ring-2 focus-within:ring-amber-500/10 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300">
            <SearchIcon className="absolute left-4 text-amber-500 w-4.5 h-4.5 shrink-0" />
            <input
              type="text"
              value={activeMode === 'bhajans' ? query : youtubeQuery}
              onChange={(e) => {
                if (activeMode === 'bhajans') {
                  setQuery(e.target.value);
                } else {
                  setYoutubeQuery(e.target.value);
                }
              }}
              placeholder={
                activeMode === 'bhajans'
                  ? (language === 'hi' ? 'भजन, कीर्तन या कलाकार खोजें...' : 'Search bhajans, artists or tags...')
                  : (language === 'hi' ? 'यूट्यूब पर भजन खोजें...' : 'Search bhajans on YouTube...')
              }
              className="w-full bg-transparent pl-11 pr-28 py-3 rounded-2xl text-xs md:text-sm text-stone-700 dark:text-foreground placeholder:text-stone-400 dark:placeholder:text-muted-foreground/50 focus:outline-none font-sans font-semibold tracking-wide border-none"
              autoFocus
            />
            {/* Clear Button */}
            {query || youtubeQuery ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setYoutubeQuery("");
                }}
                className="absolute right-20 text-stone-400 hover:text-stone-600 dark:hover:text-white transition-colors focus:outline-none cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
            
            {/* Mic and Search Button inside */}
            <div className="absolute right-2.5 flex items-center gap-1.5">
              <button
                type="button"
                onClick={startSpeechRecognition}
                className={cn(
                  "p-1.5 rounded-full text-stone-400 hover:text-amber-500 transition-all duration-200 cursor-pointer hover:bg-stone-100 dark:hover:bg-white/10",
                  isListening && "animate-pulse bg-red-500/10 text-red-500 hover:bg-red-500/20"
                )}
                title="Voice Search"
              >
                {isListening ? <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm shrink-0 select-none">
                <SearchIcon className="w-3 h-3" />
                <span className="hidden sm:inline">{language === 'hi' ? 'खोजें' : 'Search'}</span>
              </div>
            </div>
          </div>
 
        </div>
      </header>

      {/* Main Content Area */}
      <div className="container mx-auto max-w-5xl px-4 py-4">
        <AnimatePresence mode="wait">
          {!query.trim() && !selectedDeity ? (
            /* EXPLORE DASHBOARD (When not searching) */
            <motion.div
              key="explore-dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              {/* Section 1: अपने आराध्य चुनें (Deities Row with scrollbar hidden) */}
              <div className="space-y-3 relative group/carousel">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-lg font-extrabold text-foreground tracking-wide flex items-center gap-1.5">
                    🙏 {language === 'hi' ? 'अपने आराध्य चुनें' : 'Choose Your Deity'}
                  </h2>
                  <button 
                    onClick={() => setShowAllDeities(prev => !prev)}
                    className="text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {language === 'hi' ? 'सभी देखें →' : 'View All →'}
                  </button>
                </div>
                
                {/* Horizontal Scrolling Deities list */}
                <div className="relative flex items-center">
                  {/* Left arrow on desktop */}
                  <button 
                    onClick={() => scrollDeities('left')}
                    className="absolute -left-4 z-10 p-1.5 rounded-full bg-black/75 border border-amber-500/30 text-amber-400 hover:bg-black hover:text-amber-300 hidden md:flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover/carousel:opacity-100"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div 
                    ref={deityScrollRef}
                    className="flex gap-7 md:gap-8 overflow-x-auto pb-2.5 pt-1.5 no-scrollbar scroll-smooth snap-x touch-pan-x w-full"
                  >
                    {allDeities.map((deity) => {
                      const slug = getDeitySlug(deity);
                      const bgClass = getDeityBg(slug);
                      const isActive = selectedDeity === slug;
                      return (
                        <button
                          key={`${deity.isCustom ? 'custom' : 'preset'}-${deity.id}`}
                          onClick={() => {
                            handleDeityFilter(slug);
                            setActiveMode('bhajans');
                          }}
                          className="flex flex-col items-center gap-2 group shrink-0 snap-start focus:outline-none cursor-pointer"
                        >
                          <div className={cn(
                            "w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-3xl border flex items-center justify-center overflow-hidden transition-all duration-300 relative shadow-[0_4px_16px_rgba(0,0,0,0.35)]",
                            isActive 
                              ? "border-amber-500 ring-2 ring-amber-500/40 ring-offset-1 ring-offset-background bg-amber-500/10 shadow-[0_0_16px_rgba(245,158,11,0.4)] scale-105" 
                              : "border-white/10 group-hover:border-amber-500/50 group-hover:scale-105",
                            bgClass
                          )}>
                            {deity.imageUrl ? (
                              <img
                                src={deity.imageUrl}
                                alt={deity.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                            ) : (
                              <span className="text-3xl select-none">{deity.emoji}</span>
                            )}
                            
                            {/* Card gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                            
                            {/* Amber hover effect */}
                            <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/5 transition-all duration-500" />
                          </div>
                          
                          <span className={cn(
                            "text-[10px] sm:text-xs font-sans font-black tracking-wide max-w-[80px] truncate transition-all duration-200 relative pb-0.5",
                            isActive 
                              ? "text-amber-500 font-extrabold after:content-[''] after:absolute after:bottom-0 after:left-1/4 after:right-1/4 after:h-0.5 after:bg-amber-500" 
                              : "text-muted-foreground group-hover:text-amber-500/80"
                          )}>
                            {language === 'hi' ? (deity.nameHindi || deity.name) : deity.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Right arrow on desktop */}
                  <button 
                    onClick={() => scrollDeities('right')}
                    className="absolute -right-4 z-10 p-1.5 rounded-full bg-black/75 border border-amber-500/30 text-amber-400 hover:bg-black hover:text-amber-300 hidden md:flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover/carousel:opacity-100"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                {/* Swipe Helper text */}
                <p className="text-[10px] font-sans font-bold text-center text-amber-500/40 tracking-wider">
                  {language === 'hi' ? "← स्वाइप करें और अधिक देखें →" : "← Swipe to see more deities →"}
                </p>
              </div>

              {/* Expand deities grid if "सभी देखें" is active */}
              {showAllDeities && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-card/50 border border-border/60 rounded-3xl p-5 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4"
                >
                  {allDeities.map((deity) => {
                    const slug = getDeitySlug(deity);
                    const bgClass = getDeityBg(slug);
                    return (
                      <button
                        key={`expand-${deity.id}`}
                        onClick={() => {
                          handleDeityFilter(slug);
                          setShowAllDeities(false);
                        }}
                        className="flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer group"
                      >
                        <div className={cn("w-14 h-14 rounded-2xl border border-white/10 hover:border-amber-500/50 flex items-center justify-center overflow-hidden transition-all duration-300 relative shadow-md", bgClass)}>
                          {deity.imageUrl ? (
                            <img src={deity.imageUrl} alt={deity.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          ) : (
                            <span className="text-xl">{deity.emoji}</span>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />
                        </div>
                        <span className="text-[10px] font-black text-muted-foreground group-hover:text-amber-500 truncate max-w-[65px] transition-colors">
                          {language === 'hi' ? (deity.nameHindi || deity.name) : deity.name}
                        </span>
                      </button>
                    );
                  })}
                </motion.div>
              )}

              {/* Section 2: Dashboard Cards Grid (Side-by-side on mobile and desktop) */}
              <div className="grid grid-cols-2 gap-3.5">
                {/* Left Card: साधना / Japa Sadhana */}
                <div 
                  onClick={() => navigate('/meditation')}
                  className="rounded-3xl p-3.5 md:p-6 text-left flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 border border-purple-500/10 cursor-pointer group/card min-h-[230px] md:min-h-[290px]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(35,16,68,0.9) 0%, rgba(20,9,43,0.95) 50%, rgba(12,5,28,0.98) 100%)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.45)'
                  }}
                >
                  <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover/card:bg-purple-500/15 transition-all duration-500" />
                  
                  <div>
                    <span className="text-[8px] md:text-[10px] uppercase font-sans font-black text-purple-400 tracking-widest leading-none mb-1 md:mb-2 block">
                      {language === 'hi' ? "आपका मंत्र" : "Your Mantra"}
                    </span>
                    <h3 className="font-serif text-sm md:text-xl font-bold text-purple-100 group-hover/card:text-purple-200 transition-colors leading-tight">
                      {language === 'hi' ? "साधना और जाप" : "Slow Sadhana & Japa"}
                    </h3>
                    <p className="text-[9px] md:text-xs text-purple-200/80 font-sans leading-relaxed mt-1 md:mt-2 font-medium">
                      {language === 'hi' ? "सभी समस्याओं का समाधान" : "Solution to all your Problems"}
                    </p>
                  </div>

                  {/* Rocket animated graphic */}
                  <div className="relative w-20 h-20 md:w-26 md:h-26 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center overflow-hidden mx-auto my-1.5 group-hover/card:scale-105 transition-transform duration-500 shrink-0">
                    <svg className="w-10 h-10 md:w-14 md:h-14 animate-bounce duration-3000" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2C12 2 15 5 15 10C15 12.5 13.5 14.5 12 16C10.5 14.5 9 12.5 9 10C9 5 12 2 12 2Z" fill="url(#rocket-grad)" stroke="#d8b4fe" />
                      <path d="M12 16V22" stroke="#a78bfa" strokeLinecap="round" />
                      <path d="M9 13.5L6.5 16.5C6 17 6.5 18 7.5 18H16.5C17.5 18 18 17 17.5 16.5L15 13.5" stroke="#a78bfa" strokeLinejoin="round" />
                      <path d="M12 6V10" stroke="#f43f5e" strokeLinecap="round" />
                      <defs>
                        <linearGradient id="rocket-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#c084fc" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="absolute bottom-1 text-[8px] md:text-[10px] animate-pulse text-amber-400">🚀</span>
                  </div>

                  <div className="flex items-center justify-between z-10">
                    <button className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 active:scale-95 text-white font-sans text-[8px] md:text-xs font-black uppercase rounded-lg transition-all shadow-lg shadow-purple-500/20 cursor-pointer">
                      {language === 'hi' ? "शुरू करें" : "Add Now"}
                    </button>
                  </div>
                </div>

                {/* Right Column Stack: Wallpapers & Liked Bhajans */}
                <div className="grid grid-cols-1 gap-3.5">
                  {/* Top Card: Daily Mantra */}
                  <div 
                    onClick={playShaniMantra}
                    className="rounded-3xl p-3 md:p-5 text-left flex items-center justify-between relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/5 border border-orange-500/10 cursor-pointer group/card"
                    style={{
                      background: 'linear-gradient(135deg, rgba(58,26,14,0.9) 0%, rgba(38,15,6,0.95) 50%, rgba(20,7,1,0.98) 100%)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.45)'
                    }}
                  >
                    <div className="absolute top-0 right-0 w-28 h-28 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="text-[8px] md:text-[9px] uppercase font-sans font-black text-orange-400 tracking-widest leading-none mb-1">
                        {language === 'hi' ? "दैनिक मंत्र" : "Daily Mantra"}
                      </span>
                      <h3 className="font-serif text-[11px] md:text-base font-bold text-orange-100 group-hover/card:text-orange-200 transition-colors truncate">
                        {language === 'hi' ? "शनि गायत्री मंत्र" : "Shani Gayatri Mantra"}
                      </h3>
                      <p className="text-[9px] md:text-[11px] text-orange-200/80 font-sans mt-0.5 truncate max-w-[120px]">
                        {language === 'hi' ? "ॐ नीलांजन समाभासं..." : "Om Neelanjan Samabhasam..."}
                      </p>
                      <button className="w-fit mt-2 md:mt-3 px-3 py-1 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-sans text-[8px] md:text-[10px] font-black uppercase rounded-lg transition-all shadow-md shadow-orange-600/20 cursor-pointer">
                        {language === 'hi' ? "सुनें" : "Play"}
                      </button>
                    </div>

                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 group-hover/card:scale-105 transition-transform duration-500">
                      <svg className="w-6 h-6 md:w-8 md:h-8 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="4" fill="#fb923c" />
                        <path d="M12 2V6M12 18V22M2 12H6M18 12H22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="#f97316" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>

                  {/* Bottom Card: Liked Mantra */}
                  <div 
                    onClick={() => navigate('/account/liked')}
                    className="rounded-3xl p-3 md:p-5 text-left flex items-center justify-between relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/5 border border-pink-500/10 cursor-pointer group/card"
                    style={{
                      background: 'linear-gradient(135deg, rgba(62,18,36,0.9) 0%, rgba(42,9,21,0.95) 50%, rgba(24,3,10,0.98) 100%)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.45)'
                    }}
                  >
                    <div className="absolute top-0 right-0 w-28 h-28 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="text-[8px] md:text-[9px] uppercase font-sans font-black text-pink-400 tracking-widest leading-none mb-1">
                        {language === 'hi' ? "पसंदीदा" : "Favorites"}
                      </span>
                      <h3 className="font-serif text-[11px] md:text-base font-bold text-pink-100 group-hover/card:text-pink-200 transition-colors truncate">
                        {language === 'hi' ? "पसंदीदा मंत्र" : "Liked Mantra"}
                      </h3>
                      <p className="text-[9px] md:text-[11px] text-pink-200/80 font-sans mt-0.5 truncate">
                        {language === 'hi' ? `${likedIds.length} मंत्र व भजन` : `${likedIds.length} liked mantras.`}
                      </p>
                      <button className="w-fit mt-2 md:mt-3 px-3 py-1 bg-pink-600 hover:bg-pink-700 active:scale-95 text-white font-sans text-[8px] md:text-[10px] font-black uppercase rounded-lg transition-all shadow-md shadow-pink-600/20 cursor-pointer">
                        {language === 'hi' ? "खोलें" : "Open"}
                      </button>
                    </div>

                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0 group-hover/card:scale-105 transition-transform duration-500">
                      <Heart className="w-5 h-5 md:w-7 md:h-7 text-pink-400 fill-pink-500/10" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Today's Panchang (Wide banner card) */}
              <div className="space-y-4">
                <h2 className="font-serif text-lg font-extrabold text-foreground tracking-wide flex items-center gap-1.5">
                  📅 {language === 'hi' ? 'दैनिक पंचांग' : 'Today\'s Panchang'}
                </h2>
                
                <div 
                  onClick={() => navigate('/panchang')}
                  className="rounded-3xl p-5 text-left border border-amber-500/20 hover:border-amber-500/35 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 cursor-pointer relative overflow-hidden group/card"
                  style={{
                    background: 'linear-gradient(135deg, rgba(32,20,5,0.85) 0%, rgba(20,11,3,0.92) 50%, rgba(12,5,1,0.97) 100%)',
                    boxShadow: '0 6px 24px rgba(0,0,0,0.4)'
                  }}
                >
                  <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-sans font-black text-amber-500 tracking-wider">
                        {today.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                      <h3 className="font-serif text-base font-bold text-amber-100 flex items-center gap-2">
                        {language === 'hi' ? "आज का शुभ मुहूर्त" : "Today's Auspicious Info"}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="bg-black/40 border border-white/5 rounded-2xl px-3 py-1.5 text-center min-w-[70px]">
                        <span className="block text-[8px] text-muted-foreground uppercase font-sans font-bold">{language === 'hi' ? 'तिथि' : 'Tithi'}</span>
                        <span className="text-[11px] font-semibold text-amber-300">{language === 'hi' ? panchangData.tithi.hi : panchangData.tithi.en}</span>
                      </div>
                      <div className="bg-black/40 border border-white/5 rounded-2xl px-3 py-1.5 text-center min-w-[70px]">
                        <span className="block text-[8px] text-muted-foreground uppercase font-sans font-bold">{language === 'hi' ? 'नक्षत्र' : 'Nakshatra'}</span>
                        <span className="text-[11px] font-semibold text-amber-300">{language === 'hi' ? panchangData.nakshatra.hi : panchangData.nakshatra.en}</span>
                      </div>
                      <div className="bg-black/40 border border-white/5 rounded-2xl px-3 py-1.5 text-center min-w-[70px]">
                        <span className="block text-[8px] text-muted-foreground uppercase font-sans font-bold">{language === 'hi' ? 'राहुकाल' : 'Rahu Kaal'}</span>
                        <span className="text-[11px] font-semibold text-red-400">{panchangData.rahuKaal}</span>
                      </div>
                    </div>
                    
                    <button className="shrink-0 flex items-center justify-center p-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 group-hover/card:bg-amber-500 group-hover/card:text-white transition-all duration-300 cursor-pointer">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 4: Popular Bhajans (Scrollbar hidden) */}
              <div className="space-y-4">
                <h2 className="font-serif text-lg font-extrabold text-foreground tracking-wide flex items-center gap-1.5">
                  🔥 {language === 'hi' ? 'लोकप्रिय भजन' : 'Popular Bhajans'}
                </h2>

                <div className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar snap-x touch-pan-x -mx-4 px-4 sm:mx-0 sm:px-0">
                  {popularBhajansList.map((bhajan) => {
                    const deity = getDeityById(bhajan.deityId);
                    return (
                      <div
                        key={`popular-${bhajan.id}`}
                        onClick={() => {
                          setSelectedBhajanForDetail(bhajan);
                          setIsDetailModalOpen(true);
                        }}
                        className="w-[140px] sm:w-[160px] aspect-[3/4.2] rounded-3xl overflow-hidden relative shadow-lg shadow-black/40 group shrink-0 snap-start cursor-pointer transition-transform duration-300 hover:scale-[1.02] border border-border/5"
                      >
                        {/* Background cover image */}
                        {deity?.imageUrl ? (
                          <img
                            src={deity.imageUrl}
                            alt={bhajan.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-stone-900 flex items-center justify-center text-4xl">
                            ॐ
                          </div>
                        )}

                        {/* Soft Vignette overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

                        {/* Title text overlay at the bottom */}
                        <div className="absolute inset-x-0 bottom-0 p-3.5 flex flex-col justify-end text-left">
                          <span className="text-[8px] uppercase font-sans font-black text-amber-500 tracking-wider">
                            {deity?.nameHindi || deity?.name || "प्रभु"}
                          </span>
                          <h4 className="font-serif text-xs font-bold text-white tracking-wide mt-1.5 leading-tight line-clamp-2 drop-shadow-md">
                            {bhajan.titleHindi || bhajan.title}
                          </h4>
                        </div>

                        {/* Circular Play Button on hover */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                          <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 scale-90 group-hover:scale-100 transition-transform duration-300">
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : selectedDeity && !query.trim() ? (
            /* DEITY PORTAL DASHBOARD (When a deity is clicked) */
            <motion.div
              key={`deity-portal-${selectedDeity}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Deity Title & Back action */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/10 rounded-3xl p-5 shadow-inner">
                <div className="space-y-1 text-left">
                  <span className="text-[10px] uppercase font-sans font-black text-amber-500 tracking-wider">
                    {language === 'hi' ? "विशेष देव लोक" : "Divine Portal"}
                  </span>
                  <h2 className="font-serif text-2xl md:text-3xl font-extrabold text-amber-500 tracking-wide">
                    श्री {selectedDeityItem?.nameHindi || selectedDeityItem?.name} के भजन
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {language === 'hi' ? "मधुर भजनों, आरतियों और मंत्रों का दिव्य संग्रह" : "A divine collection of melodious bhajans, aartis, and mantras"}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDeity("")}
                  className="px-4 py-2 rounded-full border border-amber-500/20 text-amber-500 hover:bg-amber-500/10 text-xs font-bold font-sans uppercase tracking-wider transition-all self-start md:self-center cursor-pointer"
                >
                  {language === 'hi' ? "← सभी देव देखें" : "← All Deities"}
                </button>
              </div>

              {/* Deity Sub-Category Tabs Row */}
              <div className="flex gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar border-b border-border/40">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      if (cat === "वॉलपेपर") {
                        const deityName = selectedDeityItem?.name || "";
                        navigate(`/wallpaper?tab=wallpapers&deity=${encodeURIComponent(deityName)}`);
                      } else if (cat === "पोस्टर") {
                        const deityName = selectedDeityItem?.name || "";
                        navigate(`/wallpaper?tab=maker&deity=${encodeURIComponent(deityName)}`);
                      } else {
                        setActiveCategory(cat);
                      }
                    }}
                    className={cn(
                      "px-4 py-2 rounded-full text-xs font-bold font-sans tracking-wide transition-all whitespace-nowrap cursor-pointer",
                      activeCategory === cat
                        ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                        : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Deity Custom Interactive Grid (Matching Krishna Interaction mockup) */}
              {activeCategory === "सभी" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Left Column: Large Deity Card */}
                  <div 
                    className="md:col-span-1 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[260px] border border-amber-500/10 shadow-lg"
                    style={{
                      background: 'linear-gradient(180deg, rgba(30,20,5,0.7) 0%, rgba(15,8,2,0.95) 100%)'
                    }}
                  >
                    {selectedDeityItem?.imageUrl && (
                      <img 
                        src={selectedDeityItem.imageUrl} 
                        alt={selectedDeityItem.name} 
                        className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none mix-blend-overlay"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
                    
                    <div className="z-10">
                      <span className="text-[9px] uppercase font-sans font-black text-amber-500 tracking-wider">
                        {language === 'hi' ? "विशेष प्रस्तुति" : "Featured Devotion"}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-amber-100 mt-1">
                        {selectedDeityItem?.nameHindi || selectedDeityItem?.name} {language === 'hi' ? "संग्रह" : "Divine Portal"}
                      </h3>
                    </div>

                    <div className="space-y-2.5 z-10 w-full mt-6">
                      <button 
                        onClick={() => setActiveCategory("भजन")}
                        className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-500 text-black font-sans text-xs font-black uppercase transition-all hover:bg-amber-400 active:scale-95 shadow-md shadow-amber-500/10 cursor-pointer"
                      >
                        <span>{language === 'hi' ? `${selectedDeityItem?.nameHindi || selectedDeityItem?.name} भजन` : `${selectedDeityItem?.name} Bhajans`}</span>
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span className="font-bold opacity-80">{bhajansCount} {language === 'hi' ? "भजन" : "songs"}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </button>

                      <button 
                        onClick={() => setActiveCategory("आरती")}
                        className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/15 text-white font-sans text-xs font-bold uppercase transition-all cursor-pointer"
                      >
                        <span>{language === 'hi' ? `${selectedDeityItem?.nameHindi || selectedDeityItem?.name} आरती` : `${selectedDeityItem?.name} Aarti`}</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-amber-400">
                          <span className="font-bold">{aartiCount} {language === 'hi' ? "आरती" : "aarti"}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Right Column: 2x2 Category Cards Grid */}
                  <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    {/* Card 1: मंत्र */}
                    <div 
                      onClick={() => setActiveCategory("मंत्र")}
                      className="rounded-3xl p-5 text-left flex flex-col justify-between border border-amber-500/10 hover:border-amber-500/30 transition-all cursor-pointer relative overflow-hidden group"
                      style={{ background: 'linear-gradient(135deg, rgba(38,15,6,0.9) 0%, rgba(20,7,1,0.98) 100%)' }}
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-all duration-500" />
                      <div className="text-xl text-orange-400">🔥</div>
                      <div className="mt-4">
                        <h4 className="font-serif text-sm font-bold text-orange-100">{language === 'hi' ? `${selectedDeityItem?.nameHindi || selectedDeityItem?.name} मंत्र` : `${selectedDeityItem?.name} Mantras`}</h4>
                        <span className="text-[10px] font-sans font-medium text-orange-400 block mt-1">{mantraCount} {language === 'hi' ? "पवित्र मंत्र" : "holy mantras"}</span>
                      </div>
                    </div>

                    {/* Card 2: वॉलपेपर */}
                    <div 
                      onClick={() => {
                        const deityName = selectedDeityItem?.name || "";
                        navigate(`/wallpaper?tab=wallpapers&deity=${encodeURIComponent(deityName)}`);
                      }}
                      className="rounded-3xl p-5 text-left flex flex-col justify-between border border-amber-500/10 hover:border-amber-500/30 transition-all cursor-pointer relative overflow-hidden group"
                      style={{ background: 'linear-gradient(135deg, rgba(16,28,48,0.9) 0%, rgba(7,14,28,0.98) 100%)' }}
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-all duration-500" />
                      <div className="text-xl text-sky-400">🌸</div>
                      <div className="mt-4">
                        <h4 className="font-serif text-sm font-bold text-sky-100">{language === 'hi' ? "दिव्य वॉलपेपर" : "Wallpapers"}</h4>
                        <span className="text-[10px] font-sans font-medium text-sky-400 block mt-1">{language === 'hi' ? "दर्शन व डाउनलोड" : "View & Download"}</span>
                      </div>
                    </div>

                    {/* Card 3: कीर्तन */}
                    <div 
                      onClick={() => setActiveCategory("कीर्तन")}
                      className="rounded-3xl p-5 text-left flex flex-col justify-between border border-amber-500/10 hover:border-amber-500/30 transition-all cursor-pointer relative overflow-hidden group"
                      style={{ background: 'linear-gradient(135deg, rgba(30,12,38,0.9) 0%, rgba(14,5,20,0.98) 100%)' }}
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all duration-500" />
                      <div className="text-xl text-purple-400">🎶</div>
                      <div className="mt-4">
                        <h4 className="font-serif text-sm font-bold text-purple-100">{language === 'hi' ? `${selectedDeityItem?.nameHindi || selectedDeityItem?.name} कीर्तन` : `${selectedDeityItem?.name} Kirtans`}</h4>
                        <span className="text-[10px] font-sans font-medium text-purple-400 block mt-1">{kirtanCount} {language === 'hi' ? "मधुर धुनें" : "kirtans & tunes"}</span>
                      </div>
                    </div>

                    {/* Card 4: पोस्टर */}
                    <div 
                      onClick={() => {
                        const deityName = selectedDeityItem?.name || "";
                        navigate(`/wallpaper?tab=maker&deity=${encodeURIComponent(deityName)}`);
                      }}
                      className="rounded-3xl p-5 text-left flex flex-col justify-between border border-amber-500/10 hover:border-amber-500/30 transition-all cursor-pointer relative overflow-hidden group"
                      style={{ background: 'linear-gradient(135deg, rgba(48,16,28,0.9) 0%, rgba(28,7,14,0.98) 100%)' }}
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all duration-500" />
                      <div className="text-xl text-rose-400">🎨</div>
                      <div className="mt-4">
                        <h4 className="font-serif text-sm font-bold text-rose-100">{language === 'hi' ? "शुभ पोस्टर" : "Posters"}</h4>
                        <span className="text-[10px] font-sans font-medium text-rose-400 block mt-1">{language === 'hi' ? "दर्शन व शेयर" : "View & Share"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Deity Category Content Results */}
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-foreground text-left">
                  {activeCategory === "सभी" 
                    ? (language === 'hi' ? `सभी भजन संग्रह (${deityBhajans.length})` : `All Devotions (${deityBhajans.length})`)
                    : (language === 'hi' ? `${activeCategory} परिणाम` : `${activeCategory} Results`)}
                </h3>
                
                {/* Wallpapers/Posters custom grid or Bhajans list */}
                {activeCategory === "वॉलपेपर" || activeCategory === "पोस्टर" ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {(activeCategory === "वॉलपेपर" ? deityWallpapers : deityPosters).map((item, idx) => {
                      const titleText = activeCategory === "वॉलपेपर" 
                        ? (language === 'hi' ? item.nameHindi || item.name : item.name)
                        : (language === 'hi' ? (item as any).titleHindi || item.title : item.title);
                      
                      const downloadUrl = item.imageUrl || selectedDeityItem?.imageUrl || "";
                      const slug = selectedDeityItem ? getDeitySlug(selectedDeityItem) : 'deity';
                      
                      return (
                        <div key={item.id} className="rounded-2xl overflow-hidden relative aspect-[9/16] group border border-amber-500/10 shadow-lg">
                          {downloadUrl ? (
                            <img 
                              src={downloadUrl} 
                              alt={titleText} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-stone-900 flex items-center justify-center text-4xl">ॐ</div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
                          <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-white tracking-wide line-clamp-2 text-left">
                              {titleText}
                            </span>
                            <button
                              onClick={() => downloadImage(downloadUrl, `${slug}_${activeCategory === 'वॉलपेपर' ? 'wallpaper' : 'poster'}_${idx + 1}`)}
                              className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-sans text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer shadow-md shadow-amber-500/25"
                            >
                              {language === 'hi' ? "डाउनलोड करें" : "Download"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : categoryFilteredBhajans.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                    {categoryFilteredBhajans.map((bhajan, index) => (
                      <motion.div
                        key={`${bhajan.source}-${bhajan.sourceKey}`}
                        className="min-w-0"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                      >
                        <BhajanCard
                          bhajan={bhajan}
                          onCardClick={(clickedBhajan) => {
                            setSelectedBhajanForDetail(clickedBhajan);
                            setIsDetailModalOpen(true);
                          }}
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-muted/20 border border-dashed border-border/80 rounded-2xl">
                    <p className="text-xs text-muted-foreground font-semibold">
                      {language === 'hi' ? "इस श्रेणी में कोई भजन उपलब्ध नहीं है।" : "No items available in this category."}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            /* SEARCH RESULTS VIEW (When query text search is active) */
            <motion.div
              key="search-results"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Toggle search mode tabs */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setActiveMode('bhajans')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold tracking-wide transition-all ${
                    activeMode === 'bhajans'
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/25'
                      : 'bg-card text-foreground border-border hover:border-primary/50'
                  }`}
                >
                  <BookText className="w-3.5 h-3.5" /> {language === 'hi' ? 'भजन' : 'Bhajans In App'}
                </button>
                <button
                  onClick={() => setActiveMode('youtube')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold tracking-wide transition-all ${
                    activeMode === 'youtube'
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/25'
                      : 'bg-card text-foreground border-border hover:border-primary/50'
                  }`}
                >
                  <Youtube className="w-3.5 h-3.5" /> {language === 'hi' ? 'यूट्यूब' : 'YouTube Discovery'}
                </button>
              </div>

              {activeMode === 'bhajans' ? (
                <>
                  {/* Deity Filter buttons row */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-sans font-black tracking-widest text-muted-foreground uppercase">
                        ⚡ {language === 'hi' ? 'देवता द्वारा फ़िल्टर करें' : 'Filter by Deity'}
                      </span>
                      {(query || selectedDeity) && (
                        <button
                          onClick={() => {
                            setQuery("");
                            setSelectedDeity("");
                          }}
                          className="text-xs font-sans font-bold text-primary hover:underline cursor-pointer"
                        >
                          {language === 'hi' ? 'फ़िल्टर साफ करें' : 'Clear all'}
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedDeity("")}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all touch-target cursor-pointer ${
                          !selectedDeity
                            ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                            : "bg-card text-foreground border border-border hover:border-primary"
                        }`}
                      >
                        All
                      </button>
                      {visibleDeities.map((deity) => {
                        const deitySlug = getDeitySlug(deity);
                        return (
                          <button
                            key={`${deity.isCustom ? 'custom' : 'preset'}-${deity.id}`}
                            onClick={() => handleDeityFilter(deitySlug)}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all touch-target cursor-pointer ${
                              selectedDeity === deitySlug
                                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                                : "bg-card text-foreground border border-border hover:border-primary"
                            }`}
                          >
                            {language === 'hi' ? (deity.nameHindi || deity.name) : deity.name}
                          </button>
                        );
                      })}
                    </div>
                    {isMobile && allDeities.length > 5 && (
                      <div className="mt-3">
                        <button
                          onClick={() => setShowAllDeities((prev) => !prev)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-muted text-foreground hover:bg-muted/80 transition-all touch-target"
                        >
                          {showAllDeities ? (language === 'hi' ? 'कम देखें' : 'View less') : (language === 'hi' ? 'और देखें' : 'View more')}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Results Count Header */}
                  <div>
                    <h3 className="font-serif text-lg font-bold text-foreground">
                      {language === 'hi' ? 'खोज परिणाम' : 'Search Results'}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="text-primary font-bold">{results.length}</span> {language === 'hi' ? 'भजन मिले' : 'bhajans found'}
                      {query.trim() && (
                        <> {language === 'hi' ? 'के लिए' : 'for'} "<span className="text-foreground font-semibold">{query}</span>"</>
                      )}
                    </p>
                  </div>

                  {/* Search Results Grid */}
                  {results.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                      {results.map((bhajan, index) => (
                        <motion.div
                          key={`${bhajan.source}-${bhajan.sourceKey}`}
                          className="min-w-0"
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.04 }}
                        >
                          <BhajanCard
                            bhajan={bhajan}
                            onCardClick={(clickedBhajan) => {
                              setSelectedBhajanForDetail(clickedBhajan);
                              setIsDetailModalOpen(true);
                            }}
                          />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    /* Fallbacks when no local results found */
                    <motion.div
                      className="space-y-6 py-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="text-center py-6">
                        <p className="text-muted-foreground text-sm font-semibold hindi-text mb-2">
                          कोई भजन नहीं मिला • No bhajans found
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Try a different search or clear the filters
                        </p>
                      </div>

                      {showFallbackLyrics && (
                        <motion.div
                          className="bg-gradient-warm/5 border border-primary/20 rounded-3xl p-6"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="flex items-center gap-2 mb-4">
                            <BookText className="w-5 h-5 text-primary" />
                            <h3 className="font-serif text-base font-bold text-foreground">
                              Search Results from External Sources
                            </h3>
                          </div>

                          {lyricsFallback.isLoading ? (
                            <div className="flex items-center justify-center py-8 gap-2">
                              <Loader2 className="w-5 h-5 animate-spin text-primary" />
                              <span className="text-xs text-muted-foreground">Searching lyrics databases...</span>
                            </div>
                          ) : lyricsFallback.error ? (
                            <div className="bg-destructive/5 border border-destructive/15 rounded-xl p-4">
                              <p className="text-xs text-destructive">{lyricsFallback.error}</p>
                            </div>
                          ) : lyricsFallback.result?.lyrics ? (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-muted-foreground">Source:</span>
                                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                                  {lyricsFallback.result.source || 'Unknown'}
                                </span>
                              </div>
                              <pre className="whitespace-pre-wrap text-xs leading-relaxed max-h-[300px] overflow-y-auto p-4 rounded-xl bg-muted/40 font-sans">
                                {lyricsFallback.result.lyrics}
                              </pre>
                            </div>
                          ) : null}
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </>
              ) : (
                /* YouTube discovery list */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-card border border-border/80 rounded-3xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Youtube className="w-5 h-5 text-primary" />
                      <h3 className="font-serif text-base font-bold text-foreground">YouTube Search Results</h3>
                    </div>
                    {youtubeLoading ? (
                      <div className="py-12 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : youtubeError ? (
                      <div className="space-y-3">
                        <p className="text-xs text-destructive bg-destructive/10 rounded-xl p-3">{youtubeError}</p>
                        {youtubeQuery.trim().length >= 2 && (
                          <a
                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(youtubeQuery.trim())}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-xl border border-border hover:border-primary"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Search directly on YouTube
                          </a>
                        )}
                      </div>
                    ) : youtubeResults.length > 0 ? (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                        {youtubeResults.map((video) => (
                          <div
                            key={video.id}
                            className={`p-3 rounded-2xl border transition-colors ${
                              selectedVideo?.id === video.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border/80 hover:border-primary/60'
                            }`}
                          >
                            <button
                              onClick={() => setSelectedVideo(video)}
                              className="w-full text-left"
                            >
                              <p className="text-sm font-semibold text-foreground line-clamp-2">{video.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">{video.channel}</p>
                              <div className="text-[10px] text-muted-foreground mt-1 flex gap-3">
                                {video.duration && <span>{video.duration}</span>}
                                {video.viewsText && <span>{video.viewsText}</span>}
                              </div>
                            </button>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                onClick={() => {
                                  setSelectedVideo(video);
                                  openPlayer({
                                    id: video.id,
                                    title: video.title,
                                    channel: video.channel,
                                  });
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full bg-primary text-primary-foreground font-semibold cursor-pointer"
                              >
                                <PlayCircle className="w-3.5 h-3.5" /> Play
                              </button>
                              <a
                                href={`https://www.youtube.com/watch?v=${video.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border border-border hover:border-primary text-muted-foreground hover:text-foreground"
                              >
                                <ExternalLink className="w-3.5 h-3.5" /> YouTube
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 space-y-3">
                        <p className="text-xs text-muted-foreground">
                          Search a bhajan name to discover videos on YouTube.
                        </p>
                        {youtubeQuery.trim().length >= 2 && (
                          <a
                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(youtubeQuery.trim())}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-xl border border-border hover:border-primary"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Search directly on YouTube
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="bg-card border border-border/80 rounded-3xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Music2 className="w-5 h-5 text-primary" />
                        <h3 className="font-serif text-base font-bold text-foreground">Playback Info</h3>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-2 leading-relaxed">
                        <p>In-app audio playbacks are ad-free and support background listening.</p>
                        <p>YouTube discovery streams directly from YouTube and may include ads.</p>
                      </div>
                    </div>

                    {selectedVideo ? (
                      <div className="mt-6 p-4 bg-muted/40 rounded-2xl border border-border/40 space-y-3">
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
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-md cursor-pointer"
                        >
                          <PlayCircle className="w-4 h-4" /> Start Playback
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground py-8 text-center bg-muted/30 border border-dashed border-border/80 rounded-2xl">
                        Select a YouTube video from the results to control playback.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Detail Modal */}
      <BhajanDetailModal
        bhajan={selectedBhajanForDetail}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedBhajanForDetail(null);
        }}
        allBhajans={results}
      />
    </div>
  );
}
