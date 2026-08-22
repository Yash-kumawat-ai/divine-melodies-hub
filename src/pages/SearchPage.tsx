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
  X,
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
  ArrowRight
} from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BhajanCard from "@/components/BhajanCard";
import BhajanDetailModal from "@/components/BhajanDetailModal";
import { bhajans, deities, Bhajan, getDeityById } from "@/data/bhajans";
import SearchBar from "@/components/SearchBar";
import { 
  searchFeatures, 
  searchAartisAndChalisas, 
  searchDeities,
  FeatureSearchItem,
  AartiChalisaSearchItem,
  DeitySearchItem
} from "@/lib/unifiedSearch";
import Pagination from "@/components/Pagination";
import { smartSearchBhajans } from "@/lib/searchAlgorithm";
import { generateBhajanSlug } from "@/lib/slugUtils";
import { supabase } from "@/integrations/supabase/client";
import { useDeities } from "@/hooks/useDeities";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLyricsFallback } from "@/hooks/useLyricsFallback";
import { useAssistantContext } from "@/hooks/useAssistantContext";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";
import { searchYouTubeVideos, YouTubeVideoResult } from "@/lib/youtubeSearch";
import { useLikedBhajans } from "@/hooks/useLikedBhajans";
import { cn } from "@/lib/utils";
import mandalaGold from "@/pages/images/mandala-gold.svg";
import mandalaBeige from "@/pages/images/mandala-beige.svg";
import manjiraSvg from "@/pages/images/svg/manjira.svg";
import meditationImage from "@/pages/images/meditation_image (1).webp";
import malaBeadsImage from "@/pages/images/mala_beads.webp";
import devotionalImage from "@/pages/images/devotional_image.webp";

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
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    setCurrentPage(1);
  }, [query, selectedDeity]);
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
  const { theme } = useTheme();
  const isDark = theme === "dark";

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

  const matchedFeatures = useMemo(() => {
    if (!query.trim()) return [];
    return searchFeatures(query);
  }, [query]);

  const matchedAartis = useMemo(() => {
    if (!query.trim()) return [];
    return searchAartisAndChalisas(query);
  }, [query]);

  const matchedDeities = useMemo(() => {
    if (!query.trim()) return [];
    return searchDeities(query);
  }, [query]);

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
      const containerWidth = deityScrollRef.current.clientWidth;
      const scrollAmt = direction === 'left' ? -containerWidth : containerWidth;
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

  const deityCategoryContent = useMemo(() => {
    if (activeCategory === "वॉलपेपर" || activeCategory === "पोस्टर") {
      const list = activeCategory === "वॉलपेपर" ? deityWallpapers : deityPosters;
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {list.map((item, idx) => {
            const titleText = activeCategory === "वॉलपेपर" 
              ? (language === 'hi' ? item.nameHindi || item.name : item.name)
              : (language === 'hi' ? (item as any).titleHindi || item.title : item.title);
            const downloadUrl = item.imageUrl || selectedDeityItem?.imageUrl || "";
            const slug = selectedDeityItem ? getDeitySlug(selectedDeityItem) : 'deity';

            return (
              <div key={item.id} className="rounded-2xl overflow-hidden relative aspect-[9/16] group border border-amber-500/10 shadow-lg">
                {downloadUrl ? (
                  <img src={downloadUrl} alt={titleText} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full bg-stone-900 flex items-center justify-center text-4xl">ॐ</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-white tracking-wide line-clamp-2 text-left">{titleText}</span>
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
      );
    }

    if (categoryFilteredBhajans.length > 0) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {categoryFilteredBhajans.map((bhajan) => (
            <div key={`${bhajan.source}-${bhajan.sourceKey}`} className="min-w-0">
              <BhajanCard
                bhajan={bhajan}
                onCardClick={(clickedBhajan) => {
                  setSelectedBhajanForDetail(clickedBhajan);
                  setIsDetailModalOpen(true);
                }}
              />
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="text-center py-10 bg-muted/20 border border-dashed border-border/80 rounded-2xl">
        <p className="text-xs text-muted-foreground font-semibold">
          {language === 'hi' ? "इस श्रेणी में कोई भजन उपलब्ध नहीं है।" : "No items available in this category."}
        </p>
      </div>
    );
  }, [activeCategory, deityWallpapers, deityPosters, categoryFilteredBhajans, language, selectedDeityItem]);

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
    <div className="min-h-screen bg-gradient-to-b from-[#FCF8F2] via-[#F8F3EC] to-[#FDFBF8] dark:from-background dark:via-background/95 dark:to-background pb-12 text-[#32251E] dark:text-[#FFFDF8]">
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
      <header className="sticky top-0 z-40 bg-[#FCF8F2]/90 dark:bg-background/90 backdrop-blur-xl px-1.5 py-2.5 sm:py-4 md:py-5 md:px-4">
        <div className="container mx-auto max-w-5xl flex items-center gap-1 sm:gap-3">
          <button
            onClick={() => {
              if (query.trim() || selectedDeity) {
                setQuery("");
                setSelectedDeity("");
              } else {
                navigate(-1);
              }
            }}
            className="p-2 -ml-1 sm:-ml-2 rounded-full hover:bg-muted text-foreground transition-colors cursor-pointer shrink-0"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6 sm:w-5 sm:h-5" />
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
                  ? (language === 'hi' ? 'भजन, कीर्तन या कलाकार खोजें...' : 'Search bhajans, artists or tags...')
                  : (language === 'hi' ? 'यूट्यूब पर भजन खोजें...' : 'Search bhajans on YouTube...')
              }
              isListening={isListening}
              onMicClick={startSpeechRecognition}
              autoFocus
              onClear={() => {
                setQuery("");
                setYoutubeQuery("");
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="container mx-auto max-w-5xl px-4 pt-1.5 pb-4 sm:py-4">
        <AnimatePresence mode="wait">
          {!query.trim() && !selectedDeity ? (
            /* EXPLORE DASHBOARD (When not searching) */
            <div className="space-y-8">
              {/* Section 1: अपने आराध्य चुनें (Deities Row inside White floating card) */}
              <div className="bg-white dark:bg-[#1E1710] rounded-[28px] border border-[#EFE4D7] dark:border-zinc-800/80 p-3.5 sm:p-5 shadow-[0_12px_40px_rgba(80,45,20,0.06)] relative overflow-hidden space-y-3 sm:space-y-4">
                <img src={mandalaGold} className="absolute -left-6 -bottom-6 w-24 h-24 opacity-[0.02] pointer-events-none object-contain rotate-12" alt="" />
                
                <div className="flex items-center justify-between px-0.5 sm:px-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[#D4A44A] text-[10px] sm:text-xs font-bold">✦</span>
                    <h2 className="font-serif text-[15px] sm:text-[17px] font-bold text-[#32251E] dark:text-[#FFFDF8]">
                      {language === 'hi' ? 'अपने आराध्य चुनें' : 'Choose Your Deity'}
                    </h2>
                    <span className="text-[#D4A44A] text-[10px] sm:text-xs font-bold">✦</span>
                  </div>
                  <button 
                    onClick={() => setShowAllDeities(prev => !prev)}
                    className="text-[11px] sm:text-xs font-bold text-[#6A2C2A] hover:text-[#58211F] transition-colors cursor-pointer"
                  >
                    {language === 'hi' ? 'सभी देखें →' : 'View All →'}
                  </button>
                </div>
                
                {/* Horizontal Scrolling Deities list */}
                <div className="relative flex items-center group/carousel">
                  {/* Left arrow on desktop */}
                  <button 
                    onClick={() => scrollDeities('left')}
                    className="absolute -left-4 z-10 p-1.5 rounded-full bg-white dark:bg-zinc-800 border border-[#EFE4D7] dark:border-zinc-700 text-[#6A2C2A] hover:bg-stone-50 hidden md:flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover/carousel:opacity-100 shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
 
                  <div 
                    ref={deityScrollRef}
                    className="flex overflow-x-auto pb-1.5 pt-1 no-scrollbar scroll-smooth snap-x snap-mandatory touch-pan-x w-full"
                  >
                    {(() => {
                      const groups = [];
                      for (let i = 0; i < allDeities.length; i += 4) {
                        groups.push(allDeities.slice(i, i + 4));
                      }
                      return groups.map((group, groupIdx) => (
                        <div 
                          key={`group-${groupIdx}`} 
                          className="w-full shrink-0 snap-start grid grid-cols-4 gap-1.5 md:gap-3"
                        >
                          {group.map((deity) => {
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
                                className="flex flex-col items-center gap-1.5 group focus:outline-none cursor-pointer w-full"
                              >
                                <div className={cn(
                                  "w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] rounded-full transition-all duration-300 relative flex items-center justify-center shadow-[0_8px_20px_rgba(80,45,20,0.04)] sm:shadow-none",
                                  isActive 
                                    ? "p-[2.5px] bg-[#6A2C2A] dark:bg-[#E8B15C] scale-105 shadow-[0_8px_24px_rgba(106,44,42,0.2)] sm:p-0 sm:bg-transparent sm:border-2 sm:border-[#D4A44A] sm:ring-4 sm:ring-[#D4A44A]/20 sm:scale-105" 
                                    : "p-[2.5px] bg-[#6A2C2A]/20 dark:bg-zinc-800 hover:bg-[#6A2C2A] dark:hover:bg-[#E8B15C] sm:p-0 sm:bg-transparent sm:border-2 sm:border-[#EFE4D7] sm:dark:border-zinc-800 sm:hover:border-[#D4A44A]/60",
                                  bgClass
                                )}>
                                  <div className="w-full h-full rounded-full p-[2px] sm:p-0 bg-white dark:bg-[#1E1710] sm:bg-transparent flex items-center justify-center overflow-hidden relative">
                                    {deity.imageUrl ? (
                                      <img
                                        src={deity.imageUrl}
                                        alt={deity.name}
                                        className="w-full h-full object-cover rounded-full"
                                      />
                                    ) : (
                                      <span className="text-2xl sm:text-3xl select-none">{deity.emoji}</span>
                                    )}
                                    
                                    {/* Card gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none rounded-full" />
                                  </div>
                                </div>
                                
                                <span className={cn(
                                  "text-[13px] font-bold tracking-normal text-center max-w-[80px] truncate transition-colors mt-0.5 sm:text-xs sm:font-semibold sm:max-w-[90px] sm:mt-0",
                                  isActive 
                                    ? "text-[#6A2C2A] dark:text-[#E8B15C] font-extrabold sm:font-bold" 
                                    : "text-[#7A6B60] dark:text-muted-foreground group-hover:text-[#6A2C2A]"
                                )}>
                                  {language === 'hi' ? (deity.nameHindi || deity.name) : deity.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ));
                    })()}
                  </div>
 
                  {/* Right arrow on desktop */}
                  <button 
                    onClick={() => scrollDeities('right')}
                    className="absolute -right-4 z-10 p-1.5 rounded-full bg-white dark:bg-zinc-800 border border-[#EFE4D7] dark:border-zinc-700 text-[#6A2C2A] hover:bg-stone-50 hidden md:flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover/carousel:opacity-100 shadow-sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                {/* Swipe Helper text */}
                <p className="text-xs font-semibold text-center text-[#7A6B60]/70 dark:text-amber-500/40 tracking-wider">
                  {language === 'hi' ? "← स्वाइप करें और अधिक देखें →" : "← Swipe to see more deities →"}
                </p>
              </div>
 
              {/* Expand deities grid if "सभी देखें" is active */}
              {showAllDeities && (
                <div 
                  className="bg-white dark:bg-[#1E1710] border border-[#EFE4D7] dark:border-zinc-800/80 rounded-[28px] p-5 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 shadow-[0_12px_40px_rgba(80,45,20,0.06)]"
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
                        <div className={cn("w-14 h-14 rounded-2xl border border-[#EFE4D7] dark:border-white/10 hover:border-[#D4A44A]/60 flex items-center justify-center overflow-hidden relative shadow-sm", bgClass)}>
                          {deity.imageUrl ? (
                            <img src={deity.imageUrl} alt={deity.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl">{deity.emoji}</span>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />
                        </div>
                        <span className="text-xs font-semibold text-[#7A6B60] group-hover:text-[#6A2C2A] truncate max-w-[65px] transition-colors">
                          {language === 'hi' ? (deity.nameHindi || deity.name) : deity.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
 
              {/* Section 2: त्वरित सेवाएं (Grid Cards with 2 columns) */}
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3.5 mb-2">
                  <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#D4A44A]/60" />
                  <span className="text-[#D4A44A] text-xs font-bold">✦</span>
                  <h2 className="font-serif text-[17px] md:text-[20px] font-bold text-[#32251E] dark:text-[#FFFDF8]">
                    {language === 'hi' ? 'त्वरित सेवाएं' : 'Quick Services'}
                  </h2>
                  <span className="text-[#D4A44A] text-xs font-bold">✦</span>
                  <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#D4A44A]/60" />
                </div>
 
                <div className="grid grid-cols-2 gap-3.5 sm:gap-4 max-w-2xl mx-auto">
                  {/* Card 1: ध्यान करें */}
                  <div 
                    onClick={() => navigate('/meditation')}
                    className="bg-[#FAF2E8] dark:bg-[#1E1710] rounded-[24px] border border-[#EFE4D7] dark:border-zinc-800/80 shadow-[0_12px_40px_rgba(80,45,20,0.06)] hover:-translate-y-1.5 hover:shadow-[0_18px_48px_rgba(80,45,20,0.13)] transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col justify-between min-h-[300px] sm:min-h-[340px]"
                  >
                    {/* Full Hero Image */}
                    <img 
                      src={meditationImage} 
                      className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" 
                      alt="" 
                    />
                    {/* Dark mode overlay */}
                    <div className="absolute inset-0 bg-black/0 dark:bg-black/40 pointer-events-none transition-colors" />
                    
                    {/* Mandala watermark */}
                    <img src={mandalaBeige} className="absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.15] dark:opacity-[0.08] pointer-events-none object-contain rotate-12 transition-transform duration-700 group-hover:rotate-[45deg] z-[1]" alt="" />

                    {/* Top Artwork Spacer - pushes text down below the artwork */}
                    <div className="w-full h-[155px] sm:h-[185px] shrink-0 pointer-events-none" />

                    {/* Content at lower area */}
                    <div className="flex flex-col justify-end px-3.5 sm:px-4 pb-3.5 sm:pb-4 pt-1 gap-1.5 relative z-[2] mt-auto">
                      <h3 className="text-[14.5px] sm:text-[17px] font-extrabold text-[#32251E] dark:text-[#FFFDF8] leading-snug">
                        {language === 'hi' ? "ध्यान करें" : "Meditate"}
                      </h3>
                      <p className="text-[11px] sm:text-[12.5px] text-[#6E5E53] dark:text-[#D4C5B9] font-medium leading-snug line-clamp-2">
                        {language === 'hi' ? "मन को शांति दें और आत्मिक संतुलन पाएं।" : "Calm your mind and find inner balance."}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-0.5">
                        <span className="px-2 py-0.5 text-[9.5px] sm:text-[11px] font-bold bg-[#FAF2E8]/95 dark:bg-amber-950/70 text-[#6A2C2A] dark:text-[#E8B15C] border border-[#EFE4D7] dark:border-amber-950/50 rounded-full backdrop-blur-[2px] shadow-sm">✦ शांत संगीत</span>
                        <span className="px-2 py-0.5 text-[9.5px] sm:text-[11px] font-bold bg-[#FAF2E8]/95 dark:bg-amber-950/70 text-[#6A2C2A] dark:text-[#E8B15C] border border-[#EFE4D7] dark:border-amber-950/50 rounded-full backdrop-blur-[2px] shadow-sm">✦ 5-30 मिनट</span>
                      </div>
                      <div className="flex justify-end pt-1">
                        <button className="w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 rounded-full bg-gradient-to-b from-[#7A2D28] to-[#5A1F1A] hover:from-[#8A3E39] hover:to-[#6A2F2A] text-white flex items-center justify-center transition-all shadow-[0_4px_10px_rgba(106,44,42,0.25)] cursor-pointer">
                          <ChevronRight className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: नाम जप करें */}
                  <div 
                    onClick={() => navigate('/meditation')}
                    className="bg-[#FAF2E8] dark:bg-[#1E1710] rounded-[24px] border border-[#EFE4D7] dark:border-zinc-800/80 shadow-[0_12px_40px_rgba(80,45,20,0.06)] hover:-translate-y-1.5 hover:shadow-[0_18px_48px_rgba(80,45,20,0.13)] transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col justify-between min-h-[300px] sm:min-h-[340px]"
                  >
                    {/* Full Hero Image */}
                    <img 
                      src={malaBeadsImage} 
                      className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" 
                      alt="" 
                    />
                    {/* Dark mode overlay */}
                    <div className="absolute inset-0 bg-black/0 dark:bg-black/40 pointer-events-none transition-colors" />

                    {/* Mandala watermark */}
                    <img src={mandalaBeige} className="absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.15] dark:opacity-[0.08] pointer-events-none object-contain rotate-45 transition-transform duration-700 group-hover:rotate-[90deg] z-[1]" alt="" />

                    {/* Top Artwork Spacer */}
                    <div className="w-full h-[155px] sm:h-[185px] shrink-0 pointer-events-none" />

                    {/* Content at lower area */}
                    <div className="flex flex-col justify-end px-3.5 sm:px-4 pb-3.5 sm:pb-4 pt-1 gap-1.5 relative z-[2] mt-auto">
                      <h3 className="text-[14.5px] sm:text-[17px] font-extrabold text-[#32251E] dark:text-[#FFFDF8] leading-snug">
                        {language === 'hi' ? "नाम जप करें" : "Mantra Chanting"}
                      </h3>
                      <p className="text-[11px] sm:text-[12.5px] text-[#6E5E53] dark:text-[#D4C5B9] font-medium leading-snug line-clamp-2">
                        {language === 'hi' ? "नाम स्मरण से बढ़े आत्मिक शांति और प्रेम।" : "Grow inner peace through mantra chanting."}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-0.5">
                        <span className="px-2 py-0.5 text-[9.5px] sm:text-[11px] font-bold bg-[#FAF2E8]/95 dark:bg-amber-950/70 text-[#6A2C2A] dark:text-[#E8B15C] border border-[#EFE4D7] dark:border-amber-950/50 rounded-full backdrop-blur-[2px] shadow-sm">✦ 108 जाप</span>
                        <span className="px-2 py-0.5 text-[9.5px] sm:text-[11px] font-bold bg-[#FAF2E8]/95 dark:bg-amber-950/70 text-[#6A2C2A] dark:text-[#E8B15C] border border-[#EFE4D7] dark:border-amber-950/50 rounded-full backdrop-blur-[2px] shadow-sm">✦ माला काउंटर</span>
                      </div>
                      <div className="flex justify-end pt-1">
                        <button className="w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 rounded-full bg-gradient-to-b from-[#7A2D28] to-[#5A1F1A] hover:from-[#8A3E39] hover:to-[#6A2F2A] text-white flex items-center justify-center transition-all shadow-[0_4px_10px_rgba(106,44,42,0.25)] cursor-pointer">
                          <ChevronRight className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: प्रार्थना करें */}
                  <div 
                    onClick={() => navigate('/blessings')}
                    className="bg-[#FAF2E8] dark:bg-[#1E1710] rounded-[24px] border border-[#EFE4D7] dark:border-zinc-800/80 shadow-[0_12px_40px_rgba(80,45,20,0.06)] hover:-translate-y-1.5 hover:shadow-[0_18px_48px_rgba(80,45,20,0.13)] transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col justify-between min-h-[300px] sm:min-h-[340px]"
                  >
                    {/* Full Hero Image */}
                    <img 
                      src={devotionalImage} 
                      className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" 
                      alt="" 
                    />
                    {/* Dark mode overlay */}
                    <div className="absolute inset-0 bg-black/0 dark:bg-black/40 pointer-events-none transition-colors" />

                    {/* Mandala watermark */}
                    <img src={mandalaBeige} className="absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.15] dark:opacity-[0.08] pointer-events-none object-contain rotate-90 transition-transform duration-700 group-hover:rotate-[135deg] z-[1]" alt="" />

                    {/* Top Artwork Spacer */}
                    <div className="w-full h-[155px] sm:h-[185px] shrink-0 pointer-events-none" />

                    {/* Content at lower area */}
                    <div className="flex flex-col justify-end px-3.5 sm:px-4 pb-3.5 sm:pb-4 pt-1 gap-1.5 relative z-[2] mt-auto">
                      <h3 className="text-[14.5px] sm:text-[17px] font-extrabold text-[#32251E] dark:text-[#FFFDF8] leading-snug">
                        {language === 'hi' ? "प्रार्थना करें" : "Prayers"}
                      </h3>
                      <p className="text-[11px] sm:text-[12.5px] text-[#6E5E53] dark:text-[#D4C5B9] font-medium leading-snug line-clamp-2">
                        {language === 'hi' ? "ईश्वर से जुड़ें और आशीर्वाद प्राप्त करें।" : "Connect with the divine and receive blessings."}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-0.5">
                        <span className="px-2 py-0.5 text-[9.5px] sm:text-[11px] font-bold bg-[#FAF2E8]/95 dark:bg-amber-950/70 text-[#6A2C2A] dark:text-[#E8B15C] border border-[#EFE4D7] dark:border-amber-950/50 rounded-full backdrop-blur-[2px] shadow-sm">✦ आरती संग्रह</span>
                        <span className="px-2 py-0.5 text-[9.5px] sm:text-[11px] font-bold bg-[#FAF2E8]/95 dark:bg-amber-950/70 text-[#6A2C2A] dark:text-[#E8B15C] border border-[#EFE4D7] dark:border-amber-950/50 rounded-full backdrop-blur-[2px] shadow-sm">✦ आशीर्वाद</span>
                      </div>
                      <div className="flex justify-end pt-1">
                        <button className="w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 rounded-full bg-gradient-to-b from-[#7A2D28] to-[#5A1F1A] hover:from-[#8A3E39] hover:to-[#6A2F2A] text-white flex items-center justify-center transition-all shadow-[0_4px_10px_rgba(106,44,42,0.25)] cursor-pointer">
                          <ChevronRight className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: भजन सुनें */}
                  <div 
                    onClick={() => navigate('/all-bhajans')}
                    className="bg-[#FAF2E8] dark:bg-[#1E1710] rounded-[24px] border border-[#EFE4D7] dark:border-zinc-800/80 shadow-[0_12px_40px_rgba(80,45,20,0.06)] hover:-translate-y-1.5 hover:shadow-[0_18px_48px_rgba(80,45,20,0.13)] transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col justify-between min-h-[300px] sm:min-h-[340px]"
                  >
                    {/* Hero Image — manjira SVG centred on top matching warm bg */}
                    <div className="relative w-full h-[155px] sm:h-[185px] overflow-hidden rounded-t-[24px] shrink-0 flex items-center justify-center p-4 pt-5">
                      <img src={manjiraSvg} className="w-full h-full max-h-[135px] sm:max-h-[155px] object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-sm" alt="" />
                      <img src={mandalaBeige} className="absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.15] dark:opacity-[0.08] pointer-events-none object-contain rotate-[180deg] transition-transform duration-700 group-hover:rotate-[225deg]" alt="" />
                    </div>

                    {/* Content at lower area */}
                    <div className="flex flex-col justify-end px-3.5 sm:px-4 pb-3.5 sm:pb-4 pt-1 gap-1.5 relative z-[2] mt-auto">
                      <h3 className="text-[14.5px] sm:text-[17px] font-extrabold text-[#32251E] dark:text-[#FFFDF8] leading-snug">
                        {language === 'hi' ? "भजन सुनें" : "Listen to Bhajans"}
                      </h3>
                      <p className="text-[11px] sm:text-[12.5px] text-[#6E5E53] dark:text-[#D4C5B9] font-medium leading-snug line-clamp-2">
                        {language === 'hi' ? "भजनों के साथ भक्ति में लीन हों।" : "Immerse yourself in devotion with sacred hymns."}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-0.5">
                        <span className="px-2 py-0.5 text-[9.5px] sm:text-[11px] font-bold bg-[#FAF2E8]/95 dark:bg-amber-950/70 text-[#6A2C2A] dark:text-[#E8B15C] border border-[#EFE4D7] dark:border-amber-950/50 rounded-full backdrop-blur-[2px] shadow-sm">✦ 500+ भजन</span>
                        <span className="px-2 py-0.5 text-[9.5px] sm:text-[11px] font-bold bg-[#FAF2E8]/95 dark:bg-amber-950/70 text-[#6A2C2A] dark:text-[#E8B15C] border border-[#EFE4D7] dark:border-amber-950/50 rounded-full backdrop-blur-[2px] shadow-sm">✦ प्लेलिस्ट</span>
                      </div>
                      <div className="flex justify-end pt-1">
                        <button className="w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 rounded-full bg-gradient-to-b from-[#7A2D28] to-[#5A1F1A] hover:from-[#8A3E39] hover:to-[#6A2F2A] text-white flex items-center justify-center transition-all shadow-[0_4px_10px_rgba(106,44,42,0.25)] cursor-pointer">
                          <ChevronRight className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Today's Panchang (Wide dashboard card) */}
              <div className="space-y-4">
                <div 
                  onClick={() => navigate('/panchang')}
                  className="bg-white dark:bg-[#1E1710] rounded-[28px] border border-[#EFE4D7] dark:border-zinc-800/80 p-5 md:p-6 text-left shadow-[0_12px_40px_rgba(80,45,20,0.06)] hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(80,45,20,0.10)] transition-all duration-300 cursor-pointer relative overflow-hidden group/card"
                >
                  <img src={mandalaGold} className="absolute -right-8 -bottom-8 w-28 h-28 opacity-[0.01] pointer-events-none object-contain rotate-12" alt="" />
                  
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex flex-col text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#D4A44A] text-xs font-bold">✦</span>
                        <h3 className="font-serif text-[17px] md:text-[20px] font-bold text-[#6A2C2A] dark:text-[#E8B15C]">
                          आज का पंचांग
                        </h3>
                        <span className="text-[#D4A44A] text-xs font-bold">✦</span>
                      </div>
                      <p className="text-xs text-[#7A6B60] dark:text-stone-300 font-semibold mt-1 pl-4 sm:pl-0">
                        {today.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    
                    {/* Navigation arrow button */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/panchang');
                      }}
                      className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-b from-[#7A2D28] to-[#5A1F1A] hover:from-[#8A3E39] hover:to-[#6A2F2A] active:scale-[0.98] text-white flex items-center justify-center transition-all shadow-[0_3px_8px_rgba(106,44,42,0.2)] sm:shadow-[0_4px_12px_rgba(106,44,42,0.2)] shrink-0 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </button>
                  </div>
                  
                  {/* Dashboard row of boxes */}
                  <div className="flex sm:grid sm:grid-cols-5 overflow-x-auto sm:overflow-visible gap-3 pb-3 sm:pb-0 snap-x snap-mandatory no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                    {/* Pill 1: Tithi */}
                    <div className="bg-white dark:bg-black/20 border border-[#EFE4D7] dark:border-white/5 rounded-[20px] p-3 flex flex-col items-center justify-center text-center shadow-xs min-h-[120px] w-[110px] sm:w-full shrink-0 snap-align-start">
                      <svg className="w-6 h-6 text-[#D4A44A] mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 3a9 9 0 1 0 9 9 9.75 9.75 0 0 0-9-9z" fill="#D4A44A" opacity="0.1" />
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="#D4A44A" strokeWidth="1.5" />
                      </svg>
                      <span className="text-[11px] md:text-xs text-[#7A6B60] font-semibold mb-1">{language === 'hi' ? 'तिथि' : 'Tithi'}</span>
                      <span className="text-xs md:text-sm font-bold text-[#6A2C2A] dark:text-[#E8B15C] leading-tight">{language === 'hi' ? panchangData.tithi.hi : panchangData.tithi.en}</span>
                    </div>
                    
                    {/* Pill 2: Nakshatra */}
                    <div className="bg-white dark:bg-black/20 border border-[#EFE4D7] dark:border-white/5 rounded-[20px] p-3 flex flex-col items-center justify-center text-center shadow-xs min-h-[120px] w-[110px] sm:w-full shrink-0 snap-align-start">
                      <svg className="w-6 h-6 text-[#D4A44A] mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="#D4A44A" strokeWidth="1.5" />
                      </svg>
                      <span className="text-[11px] md:text-xs text-[#7A6B60] font-semibold mb-1">{language === 'hi' ? 'नक्षत्र' : 'Nakshatra'}</span>
                      <span className="text-xs md:text-sm font-bold text-[#6A2C2A] dark:text-[#E8B15C] leading-tight">{language === 'hi' ? panchangData.nakshatra.hi : panchangData.nakshatra.en}</span>
                    </div>
                    
                    {/* Pill 3: Sunrise */}
                    <div className="bg-white dark:bg-black/20 border border-[#EFE4D7] dark:border-white/5 rounded-[20px] p-3 flex flex-col items-center justify-center text-center shadow-xs min-h-[120px] w-[110px] sm:w-full shrink-0 snap-align-start">
                      <svg className="w-6 h-6 text-[#D4A44A] mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M17 18a5 5 0 0 0-10 0" stroke="#D4A44A" strokeWidth="1.5" fill="#D4A44A" opacity="0.1" />
                        <path d="M12 2v3M4.93 4.93l1.41 1.41M19.07 4.93l-1.41 1.41M2 18h20M12 9v5M8 12.5a4 4 0 0 1 8 0" stroke="#D4A44A" strokeWidth="1.5" />
                      </svg>
                      <span className="text-[11px] md:text-xs text-[#7A6B60] font-semibold mb-1">{language === 'hi' ? 'सूर्योदय' : 'Sunrise'}</span>
                      <span className="text-xs md:text-sm font-bold text-[#6A2C2A] dark:text-[#E8B15C] leading-tight">05:48 AM</span>
                    </div>
                    
                    {/* Pill 4: Sunset */}
                    <div className="bg-white dark:bg-black/20 border border-[#EFE4D7] dark:border-white/5 rounded-[20px] p-3 flex flex-col items-center justify-center text-center shadow-xs min-h-[120px] w-[110px] sm:w-full shrink-0 snap-align-start">
                      <svg className="w-6 h-6 text-[#D4A44A] mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 18a4 4 0 0 0-4-4H8a4 4 0 0 0 8 0" stroke="#D4A44A" strokeWidth="1.5" fill="#D4A44A" opacity="0.1" />
                        <path d="M2 18h20M12 22v-3M4.93 17.07l1.41-1.41M19.07 17.07l-1.41-1.41M12 10v4M8 13.5a4 4 0 0 0 8 0" stroke="#D4A44A" strokeWidth="1.5" />
                      </svg>
                      <span className="text-[11px] md:text-xs text-[#7A6B60] font-semibold mb-1">{language === 'hi' ? 'सूर्यास्त' : 'Sunset'}</span>
                      <span className="text-xs md:text-sm font-bold text-[#6A2C2A] dark:text-[#E8B15C] leading-tight">07:15 PM</span>
                    </div>
                    
                    {/* Pill 5: Rahukaal */}
                    <div className="bg-white dark:bg-black/20 border border-[#EFE4D7] dark:border-white/5 rounded-[20px] p-3 flex flex-col items-center justify-center text-center shadow-xs min-h-[120px] w-[110px] sm:w-full shrink-0 snap-align-start">
                      <svg className="w-6 h-6 text-[#D4A44A] mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="4" stroke="#D4A44A" strokeWidth="1.5" fill="#D4A44A" opacity="0.1" />
                        <path d="M2 17c5-5 15-5 20 0M5 12c3-3 11-3 14 0" stroke="#D4A44A" strokeWidth="1.5" />
                      </svg>
                      <span className="text-[13px] text-[#7A6B60] font-semibold mb-1">{language === 'hi' ? 'राहुकाल' : 'Rahu Kaal'}</span>
                      <span className="text-[11px] md:text-xs font-bold text-[#6A2C2A] dark:text-[#E8B15C] leading-tight">
                        01:30 PM
                        <span className="block text-[10px] md:text-[11px] font-semibold text-[#7A6B60] dark:text-stone-400 mt-0.5">
                          – 03:00 PM
                        </span>
                      </span>
                    </div>
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
                        className="w-[140px] sm:w-[160px] aspect-[3/4.2] rounded-3xl overflow-hidden relative shadow-lg shadow-black/40 group shrink-0 snap-start cursor-pointer border border-border/5"
                      >
                        {/* Background cover image */}
                        {deity?.imageUrl ? (
                          <img
                            src={deity.imageUrl}
                            alt={bhajan.title}
                            className="w-full h-full object-cover"
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
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                          <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 scale-100">
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : selectedDeity && !query.trim() ? (
            /* DEITY PORTAL DASHBOARD (When a deity is clicked) */
            <div className="space-y-6">
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
                
                {/* Deity Category Content Results */}
                {deityCategoryContent}
              </div>
            </div>
          ) : (
            /* SEARCH RESULTS VIEW (When query text search is active) */
            <div className="space-y-6">
              {/* Toggle search mode tabs */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setActiveMode('bhajans')}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm md:text-base font-bold tracking-wide transition-all shadow-sm cursor-pointer ${
                    activeMode === 'bhajans'
                      ? 'bg-[#5C1D0C] text-white border-[#5C1D0C] shadow-md shadow-[#5C1D0C]/10'
                      : 'bg-white dark:bg-[#1E1710] text-[#5C1D0C] dark:text-[#E8D8C4] border-[#E8D8C4] dark:border-zinc-800/80 hover:bg-[#FFF9F2] dark:hover:bg-zinc-800'
                  }`}
                >
                  <BookText className="w-4 h-4" /> {language === 'hi' ? 'भजन' : 'Bhajans In App'}
                </button>
                <button
                  onClick={() => setActiveMode('youtube')}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm md:text-base font-bold tracking-wide transition-all shadow-sm cursor-pointer ${
                    activeMode === 'youtube'
                      ? 'bg-[#5C1D0C] text-white border-[#5C1D0C] shadow-md shadow-[#5C1D0C]/10'
                      : 'bg-white dark:bg-[#1E1710] text-[#5C1D0C] dark:text-[#E8D8C4] border-[#E8D8C4] dark:border-zinc-800/80 hover:bg-[#FFF9F2] dark:hover:bg-zinc-800'
                  }`}
                >
                  <Youtube className="w-4 h-4" /> {language === 'hi' ? 'यूट्यूब' : 'YouTube Discovery'}
                </button>
              </div>

              {activeMode === 'bhajans' ? (
                <>
                  {/* Matched Features Banner */}
                  {query.trim() && matchedFeatures.length > 0 && (
                    <div className="space-y-3 bg-[#FAF2E8]/80 dark:bg-[#1E1710] p-3 sm:p-5 rounded-[24px] border border-[#EFE4D7] dark:border-zinc-800/80 shadow-xs overflow-hidden w-full max-w-full">
                      <div className="flex items-center gap-2.5 px-1">
                        <div className="w-7 h-7 rounded-full bg-amber-500/10 dark:bg-amber-400/10 flex items-center justify-center shrink-0">
                          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="font-serif text-base sm:text-lg font-extrabold text-[#32251E] dark:text-[#FFFDF8]">
                          {language === 'hi' ? 'मिलती-जुलती विशेषताएं एवं सेवाएं' : 'Matching Features & Tools'}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full min-w-0">
                        {matchedFeatures.map((feat) => (
                          <div
                            key={feat.id}
                            onClick={() => navigate(feat.path)}
                            className="bg-white dark:bg-black/30 border border-[#EFE4D7] dark:border-zinc-800 rounded-[20px] p-3.5 sm:p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-2.5 group relative overflow-hidden text-left w-full min-w-0"
                          >
                            <div className="flex items-start justify-between gap-2 w-full min-w-0">
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-xs">
                                  {renderFeatureIcon(feat.iconName)}
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                  <h4 className="font-serif font-extrabold text-xs sm:text-sm md:text-base text-[#32251E] dark:text-foreground truncate leading-snug">
                                    {language === 'hi' ? feat.titleHindi : feat.title}
                                  </h4>
                                  <span className="text-[10px] font-semibold text-[#7A6B60] dark:text-muted-foreground/70 truncate">
                                    {language === 'hi' ? 'विशेषता / सेवा' : 'Feature / Tool'}
                                  </span>
                                </div>
                              </div>

                              <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 shrink-0">
                                {language === 'hi' ? feat.badgeHindi : feat.badge}
                              </span>
                            </div>

                            <p className="text-[11px] sm:text-xs text-[#6E5E53] dark:text-muted-foreground/80 leading-relaxed line-clamp-2 min-w-0">
                              {language === 'hi' ? feat.descriptionHindi : feat.description}
                            </p>

                            <div className="flex items-center justify-end pt-1.5 border-t border-[#EFE4D7]/60 dark:border-zinc-800/60 w-full">
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#6A2C2A] text-white dark:bg-[#E8B15C] dark:text-black text-[11px] sm:text-xs font-bold shadow-xs group-hover:scale-[1.02] transition-transform">
                                <span>{language === 'hi' ? 'शुरू करें' : 'Launch'}</span>
                                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matched Aartis & Chalisas */}
                  {query.trim() && matchedAartis.length > 0 && (
                    <div className="space-y-3 bg-[#FAF2E8]/60 dark:bg-[#1E1710]/60 p-3 sm:p-5 rounded-[24px] border border-[#EFE4D7] dark:border-zinc-800/80 shadow-xs overflow-hidden w-full max-w-full">
                      <div className="flex items-center gap-2.5 px-1">
                        <div className="w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                          <Flame className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="font-serif text-base sm:text-lg font-extrabold text-[#32251E] dark:text-[#FFFDF8]">
                          {language === 'hi' ? 'आरती एवं चालीसा परिणाम' : 'Matching Aartis & Chalisas'}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full min-w-0">
                        {matchedAartis.map((ac) => (
                          <div
                            key={ac.id}
                            onClick={() => navigate(ac.path || `/aarti-chalisa`)}
                            className="bg-white dark:bg-black/30 border border-[#EFE4D7] dark:border-zinc-800 rounded-[20px] p-3.5 sm:p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-2.5 group relative overflow-hidden text-left w-full min-w-0"
                          >
                            <div className="flex items-start justify-between gap-2 w-full min-w-0">
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 shadow-xs">
                                  <Flame className="w-4.5 h-4.5 text-red-600 dark:text-red-400" />
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                  <h4 className="font-serif font-extrabold text-xs sm:text-sm md:text-base text-[#32251E] dark:text-foreground truncate leading-snug">
                                    {language === 'hi' ? ac.titleHindi : ac.title}
                                  </h4>
                                  {ac.singerName && (
                                    <span className="text-[10px] font-semibold text-[#7A6B60] dark:text-muted-foreground/70 truncate">
                                      {ac.singerName}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider bg-red-100 text-red-900 dark:bg-red-950/70 dark:text-red-300 border border-red-200 dark:border-red-800/60 shrink-0">
                                {ac.type === 'chalisa' ? (language === 'hi' ? 'चालीसा' : 'Chalisa') : (language === 'hi' ? 'आरती' : 'Aarti')}
                              </span>
                            </div>

                            {ac.lyricsSnippet && (
                              <p className="text-[11px] sm:text-xs text-[#6E5E53] dark:text-muted-foreground/80 leading-relaxed line-clamp-2 italic font-serif min-w-0">
                                "{ac.lyricsSnippet}"
                              </p>
                            )}

                            <div className="flex items-center justify-end pt-1.5 border-t border-[#EFE4D7]/60 dark:border-zinc-800/60 w-full">
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#6A2C2A] text-white dark:bg-[#E8B15C] dark:text-black text-[11px] sm:text-xs font-bold shadow-xs group-hover:scale-[1.02] transition-transform">
                                <span>{language === 'hi' ? 'पढ़ें एवं देखें' : 'Read & View'}</span>
                                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}


                  {/* Matched Deities */}
                  {query.trim() && matchedDeities.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base select-none">🕉️</span>
                        <h3 className="font-serif text-base font-extrabold text-[#32251E] dark:text-[#FFFDF8]">
                          {language === 'hi' ? 'संबंधित आराध्य देवता' : 'Matching Deities'}
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {matchedDeities.map((d) => (
                          <div
                            key={d.id}
                            onClick={() => {
                              setSelectedDeity(d.slug);
                              setQuery("");
                            }}
                            className="bg-white dark:bg-[#1E1710] border border-[#EFE4D7] dark:border-zinc-800/80 rounded-2xl p-3 flex items-center gap-3 shadow-xs hover:shadow-md cursor-pointer transition-all group"
                          >
                            <span className="text-2xl shrink-0 select-none">{d.emoji}</span>
                            <div className="flex flex-col min-w-0 text-left">
                              <span className="font-bold text-xs text-[#32251E] dark:text-foreground truncate group-hover:text-[#6A2C2A] dark:group-hover:text-[#E8B15C]">
                                {language === 'hi' ? d.nameHindi : d.name}
                              </span>
                              <span className="text-[10px] text-[#7A6B60] dark:text-muted-foreground truncate">
                                {language === 'hi' ? 'देव लोक देखें →' : 'View Portal →'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Deity Filter buttons row */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-sans font-black tracking-widest text-[#5C1D0C] dark:text-muted-foreground uppercase">
                        ⚡ {language === 'hi' ? 'देवता द्वारा फ़िल्टर करें' : 'Filter by Deity'}
                      </span>
                      {(query || selectedDeity) && (
                        <button
                          onClick={() => {
                            setQuery("");
                            setSelectedDeity("");
                          }}
                          className="text-xs font-sans font-bold text-[#FF6A00] hover:underline cursor-pointer"
                        >
                          {language === 'hi' ? 'फ़िल्टर साफ करें' : 'Clear all'}
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => setSelectedDeity("")}
                        className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm ${
                          !selectedDeity
                            ? "bg-[#5C1D0C] text-white border-transparent shadow-md"
                            : "bg-white dark:bg-[#1E1710] text-[#5C1D0C] dark:text-[#E8D8C4] border border-[#E8D8C4] dark:border-zinc-800/80 hover:bg-[#FFF9F2] dark:hover:bg-zinc-800"
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
                            className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm ${
                              selectedDeity === deitySlug
                                ? "bg-[#5C1D0C] text-white border-transparent shadow-md"
                                : "bg-white dark:bg-[#1E1710] text-[#5C1D0C] dark:text-[#E8D8C4] border border-[#E8D8C4] dark:border-zinc-800/80 hover:bg-[#FFF9F2] dark:hover:bg-zinc-800"
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
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                        {results.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((bhajan) => (
                          <div
                            key={`${bhajan.source}-${bhajan.sourceKey}`}
                            className="min-w-0"
                          >
                            <BhajanCard
                              bhajan={bhajan}
                              onCardClick={(clickedBhajan) => {
                                setSelectedBhajanForDetail(clickedBhajan);
                                setIsDetailModalOpen(true);
                              }}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Google-Style Page Numbers Pagination */}
                      <Pagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(results.length / pageSize)}
                        onPageChange={(page) => setCurrentPage(page)}
                      />
                    </>
                  ) : (
                    /* Fallbacks when no local results found */
                    <div className="space-y-6 py-10">
                      <div className="text-center py-6">
                        <p className="text-muted-foreground text-sm font-semibold hindi-text mb-2">
                          कोई भजन नहीं मिला • No bhajans found
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Try a different search or clear the filters
                        </p>
                      </div>

                      {showFallbackLyrics && (
                        <div className="bg-gradient-warm/5 border border-primary/20 rounded-3xl p-6">
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
                        </div>
                      )}
                    </div>
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
                      <div className="space-y-3.5 max-h-[550px] overflow-y-auto pr-1">
                        {youtubeResults.map((video) => {
                          const thumbUrl = video.thumbnailUrl || `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
                          return (
                            <div
                              key={video.id}
                              className={`p-3.5 rounded-2xl border transition-all flex gap-3.5 items-center ${
                                selectedVideo?.id === video.id
                                  ? 'border-[#5C1D0C] bg-[#5C1D0C]/5 dark:bg-[#E8B15C]/10 shadow-sm'
                                  : 'border-border/80 hover:border-[#5C1D0C]/50 bg-white dark:bg-[#1E1710]'
                              }`}
                            >
                              {/* Video Thumbnail */}
                              <div 
                                onClick={() => {
                                  setSelectedVideo(video);
                                  openPlayer({
                                    id: video.id,
                                    title: video.title,
                                    channel: video.channel,
                                  });
                                }}
                                className="w-28 sm:w-36 aspect-video rounded-xl overflow-hidden relative shrink-0 bg-stone-900 cursor-pointer group/thumb shadow-sm"
                              >
                                <img
                                  src={thumbUrl}
                                  alt={video.title}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover/thumb:bg-black/40 transition-colors flex items-center justify-center">
                                  <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
                                    <Play className="w-4 h-4 fill-current ml-0.5" />
                                  </div>
                                </div>
                                {video.duration && (
                                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-bold text-white">
                                    {video.duration}
                                  </span>
                                )}
                              </div>

                              {/* Title, Channel & Action Buttons */}
                              <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
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
                                  <h4 className="text-xs sm:text-sm font-bold text-foreground group-hover/title:text-[#5C1D0C] dark:group-hover/title:text-[#E8B15C] line-clamp-2 leading-snug">
                                    {video.title}
                                  </h4>
                                  <p className="text-[11px] text-muted-foreground mt-1 font-medium truncate">
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
                                    className="inline-flex items-center gap-1 px-3 py-1 text-[11px] rounded-full bg-[#5C1D0C] dark:bg-[#E8B15C] text-white dark:text-black font-bold shadow-sm hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
                                  >
                                    <PlayCircle className="w-3.5 h-3.5 shrink-0" />
                                    {language === 'hi' ? 'चलाएं' : 'Play'}
                                  </button>

                                  <a
                                    href={`https://www.youtube.com/watch?v=${video.id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 px-3 py-1 text-[11px] rounded-full border border-border hover:border-[#5C1D0C] text-muted-foreground hover:text-foreground font-semibold transition-all"
                                  >
                                    <ExternalLink className="w-3 h-3 shrink-0" />
                                    {language === 'hi' ? 'यूट्यूब पर देखें' : 'YouTube'}
                                  </a>
                                </div>
                              </div>
                            </div>
                          );
                        })}
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
            </div>
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
