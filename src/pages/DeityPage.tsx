import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ChevronRight, 
  Loader2, 
  Compass, 
  MapPin, 
  Copy, 
  Check,
  Sparkles,
  Play,
  Music2,
  BookOpen
} from 'lucide-react';
import BhajanCard from '@/components/BhajanCard';
import { bhajans as staticBhajans, Deity, Bhajan } from '@/data/bhajans';
import { 
  resolveDeityBySlug, 
  getDeityUrl, 
  type DeityProfile 
} from '@/lib/deityUrls';
import { 
  getContentUrl, 
  getCanonicalUrl, 
  resolveCanonicalType, 
  getCanonicalTypeLabel,
  getCategoryCollectionUrl,
  type DevotionalCanonicalType 
} from '@/lib/contentUrls';
import { mapUserUploadToBhajan } from '@/lib/mapUserUpload';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import { getPublicSiteUrl } from '@/lib/env';
import { useLanguage } from '@/hooks/useLanguage';
import { useDeities } from '@/hooks/useDeities';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Custom Sacred SVGs
import malaSvg from '@/pages/images/svg/mala.svg';
import bookSvg from '@/pages/images/svg/book.svg';
import headphoneSvg from '@/pages/images/svg/headphone-svgrepo-com.svg';
import posterSvg from '@/pages/images/svg/poster.svg';
import mandalaGoldSvg from '@/pages/images/mandala-gold.svg';
import shareSvg from '@/pages/images/svg/share-2-svgrepo-com.svg';
import omWhiteSvg from '@/pages/images/svg/om white.svg';
import basuriSvg from '@/pages/images/svg/basuri.svg';
import diyaSvg from '@/pages/images/svg/diya.svg';
import ramYellowFlower from '@/pages/images/svg/ram yellow flower.svg';
import radhePinkFlower from '@/pages/images/svg/radhe pink flower.svg';
import shivayyWhiteFlower from '@/pages/images/svg/shivayy white flower.svg';
import shyamBlueFlower from '@/pages/images/svg/shyam blue flower.svg';
import { LotusIcon } from '@/components/icons/LotusIcon';

const getDeityFloralSvg = (slug: string) => {
  switch (slug) {
    case 'rama': return ramYellowFlower;
    case 'krishna': return radhePinkFlower;
    case 'shiva': return shivayyWhiteFlower;
    case 'khatu-shyam': return shyamBlueFlower;
    default: return null;
  }
};

const getCleanDeitySubtitle = (deity: DeityProfile, isHi: boolean) => {
  if (deity.slug === 'rama') return isHi ? 'अयोध्या नरेश • धर्मरक्षक' : 'Lord Rama';
  if (deity.slug === 'shiva') return isHi ? 'देवाधिदेव महादेव • कल्याणकारी' : 'Lord Shiva';
  if (deity.slug === 'ganesh') return isHi ? 'प्रथम पूज्य • विघ्नहर्ता' : 'Lord Ganesha';
  if (deity.slug === 'krishna') return isHi ? 'माखनचोर • गीता उपदेशक' : 'Lord Krishna';
  if (deity.slug === 'hanuman') return isHi ? 'संकटमोचन • अतुलित बलशाली' : 'Lord Hanuman';
  if (deity.slug === 'durga') return isHi ? 'आदिशक्ति • जगदम्बा' : 'Maa Durga';
  if (deity.slug === 'lakshmi') return isHi ? 'धन-समृद्धि दायिनी' : 'Maa Lakshmi';
  if (deity.slug === 'khatu-shyam') return isHi ? 'हारे का सहारा • शीश के दानी' : 'Khatu Shyam';
  return isHi ? (deity.titleHindi ? deity.titleHindi.split('•')[0].trim() : deity.name) : deity.name;
};

interface UserUploadRow {
  id: string;
  title: string;
  title_hindi: string;
  slug?: string;
  deity_id: number;
  content_type?: string;
  sub_type?: string;
  singer_name?: string;
  composer_name?: string;
  image_url?: string;
  youtube_url?: string;
  lyrics_hindi?: string;
  created_at: string;
  status: string;
  play_count?: number;
}

function getSectionTitle(type: DevotionalCanonicalType, isHi: boolean): string {
  switch (type) {
    case 'bhajan':
      return isHi ? 'लोकप्रिय भजन व कीर्तन' : 'Popular Bhajans & Kirtan';
    case 'aarti':
      return isHi ? 'पावन आरती व स्तुति' : 'Sacred Aartis & Stutis';
    case 'chalisa':
      return isHi ? 'चालीसा व नित्य पाठ' : 'Chalisas & Sacred Paath';
    case 'stotra':
      return isHi ? 'दिव्य स्तोत्र' : 'Divine Stotras';
    case 'ashtakam':
      return isHi ? 'पावन अष्टकम्' : 'Sacred Ashtakams';
    case 'mantra':
      return isHi ? 'कल्याणकारी मंत्र व जप' : 'Sacred Mantras & Chants';
    case 'kavach':
      return isHi ? 'दिव्य रक्षा कवच' : 'Protective Kavach';
    case 'katha':
      return isHi ? 'पावन कथा व प्रसंग' : 'Divine Kathas & Leelas';
    case 'doha':
      return isHi ? 'दोहा व चौपाई' : 'Dohas & Chaupais';
    case 'shloka':
      return isHi ? 'वैदिक श्लोक व सूक्त' : 'Vedic Shlokas & Suktams';
    case 'rachana':
    default:
      return isHi ? 'अन्य पावन रचनाएँ' : 'Other Devotional Compositions';
  }
}

export default function DeityPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const { deities: allDeities } = useDeities();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [userUploads, setUserUploads] = useState<UserUploadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedMantra, setCopiedMantra] = useState(false);

  // 1. Resolve deity canonically via alias matcher
  const resolvedDeity = useMemo<DeityProfile | undefined>(() => {
    if (!slug) return undefined;
    return resolveDeityBySlug(slug, allDeities);
  }, [slug, allDeities]);

  // 2. Perform 1-hop canonical URL redirection if user visited via an alias (e.g. /deity/shiv -> /deity/shiva)
  useEffect(() => {
    if (resolvedDeity && slug && resolvedDeity.slug !== slug.toLowerCase().trim()) {
      navigate(getDeityUrl(resolvedDeity), { replace: true });
    }
  }, [resolvedDeity, slug, navigate]);

  // 3. Fetch user uploads for this deity
  const fetchDeityUploads = useCallback(async () => {
    if (!resolvedDeity) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_uploads')
        .select('*')
        .eq('status', 'approved')
        .eq('deity_id', resolvedDeity.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Could not fetch uploads for deity:', error);
      }
      setUserUploads((data || []) as UserUploadRow[]);
    } catch (err) {
      console.error('Error fetching deity uploads:', err);
    } finally {
      setLoading(false);
    }
  }, [resolvedDeity]);

  useEffect(() => {
    fetchDeityUploads();
  }, [fetchDeityUploads]);

  // 4. Combine static catalog + user uploads for this deity
  const combinedItems = useMemo<Bhajan[]>(() => {
    if (!resolvedDeity) return [];

    const staticItems = staticBhajans
      .filter((b) => b.deityId === resolvedDeity.id)
      .map((b) => ({
        ...b,
        source: 'static' as const,
        sourceKey: `static-${b.id}`,
      }));

    const mappedUploads = userUploads.map((ub) => {
      const b = mapUserUploadToBhajan(ub, allDeities);
      return {
        ...b,
        source: 'upload' as const,
        sourceKey: `upload-${ub.id}`,
      };
    });

    const staticIds = new Set(staticItems.map((b) => String(b.slug || b.id)));
    const uniqueUploads = mappedUploads.filter((ub) => !staticIds.has(String(ub.slug || ub.id)));

    return [...staticItems, ...uniqueUploads];
  }, [resolvedDeity, userUploads, allDeities]);

  // 5. DYNAMIC CONTENT DERIVATION: Derive sections strictly from actual present content
  const dynamicSections = useMemo(() => {
    const grouped = new Map<DevotionalCanonicalType, Bhajan[]>();

    for (const item of combinedItems) {
      const type = resolveCanonicalType(item);
      const existing = grouped.get(type) || [];
      existing.push(item);
      grouped.set(type, existing);
    }

    const preferredOrder: DevotionalCanonicalType[] = [
      'bhajan',
      'aarti',
      'chalisa',
      'stotra',
      'ashtakam',
      'mantra',
      'kavach',
      'katha',
      'doha',
      'shloka',
      'rachana',
    ];

    return preferredOrder
      .filter((type) => (grouped.get(type) || []).length > 0)
      .map((type) => ({
        type,
        titleHi: getSectionTitle(type, true),
        titleEn: getSectionTitle(type, false),
        badgeLabel: getCanonicalTypeLabel(type, isHi),
        collectionUrl: getCategoryCollectionUrl(type),
        items: grouped.get(type) || [],
      }));
  }, [combinedItems, isHi]);

  // 6. Filtered items when a specific category tab is selected
  const tabFilteredItems = useMemo(() => {
    if (activeTab === 'all') return combinedItems;
    return combinedItems.filter((item) => resolveCanonicalType(item) === activeTab);
  }, [combinedItems, activeTab]);

  // Available non-empty tabs with counts
  const availableTabs = useMemo(() => {
    const countsMap = new Map<string, number>();
    for (const item of combinedItems) {
      const type = resolveCanonicalType(item);
      countsMap.set(type, (countsMap.get(type) || 0) + 1);
    }

    const allPossibleTabs: Array<{ id: string; labelHi: string; labelEn: string; count: number }> = [
      { id: 'all', labelHi: 'सभी रचनाएँ', labelEn: 'All Content', count: combinedItems.length },
      { id: 'bhajan', labelHi: 'भजन', labelEn: 'Bhajans', count: countsMap.get('bhajan') || 0 },
      { id: 'aarti', labelHi: 'आरती', labelEn: 'Aartis', count: countsMap.get('aarti') || 0 },
      { id: 'chalisa', labelHi: 'चालीसा', labelEn: 'Chalisa', count: countsMap.get('chalisa') || 0 },
      { id: 'stotra', labelHi: 'स्तोत्र', labelEn: 'Stotras', count: countsMap.get('stotra') || 0 },
      { id: 'ashtakam', labelHi: 'अष्टकम्', labelEn: 'Ashtakam', count: countsMap.get('ashtakam') || 0 },
      { id: 'mantra', labelHi: 'मंत्र', labelEn: 'Mantras', count: countsMap.get('mantra') || 0 },
      { id: 'kavach', labelHi: 'कवच', labelEn: 'Kavach', count: countsMap.get('kavach') || 0 },
      { id: 'katha', labelHi: 'कथा', labelEn: 'Katha', count: countsMap.get('katha') || 0 },
      { id: 'doha', labelHi: 'दोहा', labelEn: 'Doha', count: countsMap.get('doha') || 0 },
      { id: 'shloka', labelHi: 'श्लोक', labelEn: 'Shloka', count: countsMap.get('shloka') || 0 },
      { id: 'rachana', labelHi: 'अन्य', labelEn: 'Other', count: countsMap.get('rachana') || 0 },
    ];

    return allPossibleTabs;
  }, [combinedItems]);

  // Related deities data
  const relatedDeities = useMemo<DeityProfile[]>(() => {
    if (!resolvedDeity) return [];
    return (resolvedDeity.relatedDeitySlugs || [])
      .map((slugStr) => resolveDeityBySlug(slugStr))
      .filter((d): d is DeityProfile => Boolean(d));
  }, [resolvedDeity]);

  const handleShare = async () => {
    if (!resolvedDeity) return;
    const url = `${getPublicSiteUrl()}/deity/${resolvedDeity.slug}`;
    const title = `${resolvedDeity.nameHindi} (${resolvedDeity.name}) - Raghavam`;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        await navigator.clipboard.writeText(url);
        toast.success(isHi ? 'लिंक कॉपी हो गया!' : 'Link copied to clipboard!');
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success(isHi ? 'लिंक कॉपी हो गया!' : 'Link copied to clipboard!');
    }
  };

  const handleCopyMantra = async (mantraText: string) => {
    if (!mantraText) return;
    await navigator.clipboard.writeText(mantraText);
    setCopiedMantra(true);
    toast.success(isHi ? 'पावन मंत्र कॉपी हो गया!' : 'Sacred mantra copied!');
    setTimeout(() => setCopiedMantra(false), 2000);
  };

  const scrollToFirstContent = () => {
    const firstSection = document.getElementById('deity-content-sections');
    if (firstSection) {
      firstSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6EE] dark:bg-[#0c0a08] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-[#651317] dark:text-amber-300 mx-auto" />
          <p className="text-sm font-semibold text-[#786252] dark:text-stone-400">
            {isHi ? 'देव स्वरूप व रचनाएँ लोड हो रही हैं...' : 'Loading divine profile & compositions...'}
          </p>
        </div>
      </div>
    );
  }

  if (!resolvedDeity) {
    return (
      <div className="min-h-screen bg-[#FAF6EE] dark:bg-[#0c0a08] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white dark:bg-[#140d08] rounded-3xl p-8 border border-[#E8D8C4] dark:border-stone-800 shadow-lg space-y-4">
          <div className="text-5xl">🙏</div>
          <h2 className="font-serif text-2xl font-bold text-[#32251E] dark:text-amber-100">
            {isHi ? 'देवता की जानकारी नहीं मिली' : 'Deity Profile Not Found'}
          </h2>
          <p className="text-xs sm:text-sm text-[#786252] dark:text-stone-400">
            {isHi 
              ? 'यह देव स्वरूप अभी सूची में उपलब्ध नहीं है या यूआरएल में त्रुटि है।' 
              : 'This deity profile could not be found or the URL is invalid.'}
          </p>
          <Button asChild className="rounded-full bg-[#651317] hover:bg-[#520f12] text-white">
            <Link to="/all-deities">
              <Compass className="w-4 h-4 mr-2" />
              {isHi ? 'सभी देवी-देवता देखें' : 'Explore All Deities'}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const baseUrl = getPublicSiteUrl();
  const canonicalUrl = `${baseUrl}/deity/${resolvedDeity.slug}`;
  const seoTitle = `${resolvedDeity.nameHindi} (${resolvedDeity.name}) - भजन, आरती, चालीसा, स्तोत्र व मंत्र | Raghavam`;
  const seoDescription = `${resolvedDeity.nameHindi} (${resolvedDeity.name}) के पावन भजन, प्रसिद्ध आरती, चालीसा, स्तोत्र, मंत्र और कथा संग्रह। राघवम् पर सम्पूर्ण लिरिक्स और वीडियो के साथ पाठ करें।`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${resolvedDeity.name} Devotional Hub`,
    alternateName: resolvedDeity.nameHindi,
    description: seoDescription,
    url: canonicalUrl,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: combinedItems.slice(0, 20).map((b, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: b.title,
        url: getCanonicalUrl(b, baseUrl),
      })),
    },
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] dark:bg-[#0c0a08] text-[#32251E] dark:text-[#FAF6EE] pb-24">
      <SEO
        title={seoTitle}
        description={seoDescription}
        url={canonicalUrl}
        image={resolvedDeity.imageUrl || `${baseUrl}/og-image.jpg`}
        type="website"
        lang={isHi ? 'hi' : 'en'}
        jsonLd={jsonLd}
      />

      {/* TOP HEADER & BREADCRUMB BAR (No ugly truncation on desktop) */}
      <div className="container mx-auto max-w-5xl px-3 sm:px-4 pt-4 sm:pt-6">
        <nav 
          aria-label="Breadcrumb" 
          className="flex items-center justify-between gap-3 text-xs sm:text-sm font-normal text-[#786252] dark:text-stone-400 mb-5 py-1 leading-normal"
        >
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
            <Link
              to="/"
              className="hover:text-[#651317] dark:hover:text-amber-300 transition-colors shrink-0 font-medium py-0.5"
            >
              {isHi ? 'होम' : 'Home'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />
            <Link
              to="/all-deities"
              className="hover:text-[#651317] dark:hover:text-amber-300 transition-colors shrink-0 font-medium py-0.5"
            >
              {isHi ? 'देवी-देवता' : 'All Deities'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />
            <span className="text-[#3A2418] dark:text-amber-200 font-medium max-w-[160px] sm:max-w-none truncate sm:overflow-visible inline-block py-0.5 leading-normal">
              {isHi ? resolvedDeity.nameHindi : resolvedDeity.name}
            </span>
          </div>

          {/* Royal Glassmorphic Share Pill */}
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#E8D8C4] dark:border-stone-800 bg-white/90 dark:bg-[#140d08]/90 hover:bg-[#FAF0E4] dark:hover:bg-stone-900 text-xs font-bold text-[#651317] dark:text-amber-300 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
            aria-label="Share Deity Profile"
          >
            <img src={shareSvg} alt="" className="w-3.5 h-3.5 opacity-80" />
            <span>{isHi ? 'शेयर' : 'Share'}</span>
          </button>
        </nav>

        {/* HERO PROFILE CARD */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#FFFDF8] via-[#FAF3E8] to-[#FFFDF8] dark:from-[#17100a] dark:via-[#130c07] dark:to-[#17100a] border border-[#E8D8C4] dark:border-stone-800 p-6 sm:p-8 text-center shadow-xs">
          {/* Ornate Mandala Aura Watermark */}
          <div className="absolute -top-20 -left-20 w-64 h-64 opacity-5 dark:opacity-10 pointer-events-none">
            <img src={mandalaGoldSvg} alt="" className="w-full h-full object-contain animate-spin-slow" />
          </div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 opacity-5 dark:opacity-10 pointer-events-none">
            <img src={mandalaGoldSvg} alt="" className="w-full h-full object-contain animate-spin-slow" />
          </div>

          {/* Deity Avatar Portrait with Divine Golden Halo Aura */}
          <div className="relative mx-auto mb-4 w-28 h-28 sm:w-32 sm:h-32">
            {/* Ambient Divine Halo Glow */}
            <div className="absolute inset-0 rounded-full blur-xl bg-amber-400/30 dark:bg-amber-500/20 scale-110 pointer-events-none" />

            {/* Golden Halo Ring */}
            <div className="relative w-full h-full rounded-full p-1 bg-gradient-to-tr from-[#D4A437] via-amber-200 to-[#651317] shadow-lg shadow-amber-900/15 ring-4 ring-amber-400/20">
              <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-stone-900 flex items-center justify-center">
                {resolvedDeity.imageUrl ? (
                  <img
                    src={resolvedDeity.imageUrl}
                    alt={resolvedDeity.name}
                    className="w-full h-full object-cover object-center scale-105"
                  />
                ) : (
                  <span className="text-5xl">{resolvedDeity.emoji}</span>
                )}
              </div>
            </div>
          </div>

          {/* Sacred Deity Titles */}
          <div className="space-y-1.5 max-w-2xl mx-auto">
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#32251E] dark:text-[#FFFDF8] tracking-tight">
              {resolvedDeity.nameHindi}
            </h1>
            <p className="font-sans text-sm sm:text-base font-semibold text-[#651317] dark:text-amber-300">
              {resolvedDeity.titleHindi || resolvedDeity.name}
            </p>
            <p className="text-xs sm:text-sm text-[#786252] dark:text-stone-300 pt-2 leading-relaxed max-w-xl mx-auto">
              {isHi ? resolvedDeity.aboutHindi : resolvedDeity.aboutEnglish}
            </p>
          </div>

          {/* UNIFIED HERO ACTION PILLS (Cohesive styling with custom devotional SVGs) */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-6">
            {/* 1. Primary Listen CTA */}
            <button
              onClick={scrollToFirstContent}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#651317] to-[#80181D] hover:from-[#540f13] hover:to-[#6d1519] text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-[#651317]/15 active:scale-95 cursor-pointer"
            >
              <img src={headphoneSvg} alt="" className="w-4 h-4 invert brightness-200" />
              <span>{isHi ? 'भजन व आरती सुनें' : 'Listen Bhajans'}</span>
            </button>

            {/* 2. Read Paath CTA */}
            <button
              onClick={scrollToFirstContent}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#E8D8C4] dark:border-stone-700 bg-white/90 dark:bg-stone-900/90 hover:border-[#D4A44A] dark:hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-stone-800 text-[#32251E] dark:text-stone-200 text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              <img src={bookSvg} alt="" className="w-4 h-4 opacity-85" />
              <span>{isHi ? 'चालीसा व स्तोत्र पाठ' : 'Read Paath'}</span>
            </button>

            {/* 3. Chant Mantra CTA (Cohesive styling, Mala SVG, no weird highlight) */}
            {resolvedDeity.mantraSlug && (
              <Button
                asChild
                variant="outline"
                className="rounded-full border border-[#E8D8C4] dark:border-stone-700 bg-white/90 dark:bg-stone-900/90 hover:border-[#D4A44A] dark:hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-stone-800 text-[#32251E] dark:text-stone-200 text-xs sm:text-sm font-bold h-auto py-2.5 px-4 shadow-2xs"
              >
                <Link to={`/meditation/mantra-japa/${resolvedDeity.mantraSlug}`} className="inline-flex items-center gap-2">
                  <img src={malaSvg} alt="" className="w-4 h-4 opacity-85" />
                  <span>{isHi ? 'मंत्र जप करें' : 'Chant Mantra'}</span>
                </Link>
              </Button>
            )}

            {/* 4. Darshan & Wallpapers CTA */}
            <Button
              asChild
              variant="outline"
              className="rounded-full border border-[#E8D8C4] dark:border-stone-700 bg-white/90 dark:bg-stone-900/90 hover:border-[#D4A44A] dark:hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-stone-800 text-[#32251E] dark:text-stone-200 text-xs sm:text-sm font-bold h-auto py-2.5 px-4 shadow-2xs"
            >
              <Link to={`/wallpaper?tab=wallpapers&deity=${encodeURIComponent(resolvedDeity.name)}`} className="inline-flex items-center gap-2">
                <img src={posterSvg} alt="" className="w-4 h-4 opacity-85" />
                <span>{isHi ? 'दर्शन व वॉलपेपर' : 'Wallpapers'}</span>
              </Link>
            </Button>
          </div>

          {/* BALANCED 3-COLUMN METRICS GRID (Equal height, aligned baselines & sacred SVGs) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-[#E8D8C4]/60 dark:border-stone-800/60 max-w-3xl mx-auto text-center">
            {/* Card 1: Total Works */}
            <div className="flex flex-col items-center justify-between p-3.5 rounded-2xl bg-white/85 dark:bg-stone-900/85 border border-[#E8D8C4]/80 dark:border-stone-800/80 shadow-2xs h-[88px] sm:h-[96px]">
              <div className="inline-flex items-center gap-1.5 text-[11px] text-[#786252] dark:text-stone-400 uppercase tracking-wider font-bold">
                <Music2 className="w-3.5 h-3.5 text-[#651317] dark:text-amber-300" />
                <span>{isHi ? 'कुल रचनाएँ' : 'Total Works'}</span>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-[#651317] dark:text-amber-300 leading-none">
                {combinedItems.length}
              </span>
              <span className="text-[10px] text-[#786252] dark:text-stone-400 font-medium">
                {isHi ? 'भजन, आरती व पाठ' : 'Devotional Compositions'}
              </span>
            </div>

            {/* Card 2: Categories */}
            <div className="flex flex-col items-center justify-between p-3.5 rounded-2xl bg-white/85 dark:bg-stone-900/85 border border-[#E8D8C4]/80 dark:border-stone-800/80 shadow-2xs h-[88px] sm:h-[96px]">
              <div className="inline-flex items-center gap-1.5 text-[11px] text-[#786252] dark:text-stone-400 uppercase tracking-wider font-bold">
                <BookOpen className="w-3.5 h-3.5 text-[#651317] dark:text-amber-300" />
                <span>{isHi ? 'उपलब्ध श्रेणियाँ' : 'Categories'}</span>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-[#651317] dark:text-amber-300 leading-none">
                {dynamicSections.length}
              </span>
              <span className="text-[10px] text-[#786252] dark:text-stone-400 font-medium">
                {isHi ? 'विभिन्न पावन विधाएँ' : 'Sacred Categories'}
              </span>
            </div>

            {/* Card 3: Key Festivals */}
            <div className="flex flex-col items-center justify-between p-3.5 rounded-2xl bg-white/85 dark:bg-stone-900/85 border border-[#E8D8C4]/80 dark:border-stone-800/80 shadow-2xs h-[88px] sm:h-[96px]">
              <div className="inline-flex items-center gap-1.5 text-[11px] text-[#786252] dark:text-stone-400 uppercase tracking-wider font-bold">
                <img src={diyaSvg} alt="" className="w-3.5 h-3.5 object-contain" />
                <span>{isHi ? 'प्रमुख पावन पर्व' : 'Key Festivals'}</span>
              </div>
              <span className="text-xs sm:text-[13px] font-serif font-bold text-[#32251E] dark:text-amber-100 leading-snug line-clamp-2 px-1">
                {resolvedDeity.keyFestivals && resolvedDeity.keyFestivals.length > 0
                  ? resolvedDeity.keyFestivals.slice(0, 2).join(' • ')
                  : (isHi ? 'नित्य सेवा व आराधना' : 'Daily Devotion')}
              </span>
              <span className="text-[10px] text-[#786252] dark:text-stone-400 font-medium">
                {isHi ? 'विशेष पावन तिथियाँ' : 'Auspicious Days'}
              </span>
            </div>
          </div>
        </section>

        {/* INTERACTIVE SUBTYPE FILTER TABS */}
        <section id="deity-content-sections" className="pt-8 space-y-6">
          <div className="flex items-center justify-between gap-3 border-b border-[#E8D8C4] dark:border-stone-800 pb-3">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#32251E] dark:text-[#FFFDF8]">
                {isHi ? `${resolvedDeity.nameHindi} संग्रह` : `${resolvedDeity.name} Sacred Collection`}
              </h2>
              <p className="text-xs text-[#786252] dark:text-stone-400">
                {isHi ? 'समस्त भजन, आरती, चालीसा व स्तोत्र संग्रह' : 'Explore all devotional works for this deity'}
              </p>
            </div>
          </div>

          {/* Subtype Pill Selectors (Centered text with count badges) */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
            {availableTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#651317] text-white shadow-xs'
                      : 'bg-white/90 dark:bg-stone-900/90 border border-[#E8D8C4] dark:border-stone-800 text-[#786252] dark:text-stone-300 hover:border-[#D4A44A] hover:bg-[#FAF0E4] dark:hover:bg-stone-800'
                  }`}
                >
                  <span>{isHi ? tab.labelHi : tab.labelEn}</span>
                  {tab.count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-amber-100 dark:bg-stone-800 text-[#651317] dark:text-amber-300'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* CONTENT PRESENTATION */}
          {activeTab === 'all' ? (
            /* DEFAULT OVERVIEW: Dynamically group and only show non-empty sections */
            <div className="space-y-10">
              {dynamicSections.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-[#140d08] rounded-3xl border border-dashed border-[#E8D8C4] dark:border-stone-800 p-8 max-w-md mx-auto">
                  <img src={bookSvg} alt="" className="w-12 h-12 mx-auto mb-3 opacity-60" />
                  <h3 className="font-serif text-lg font-bold text-[#32251E] dark:text-[#FFFDF8] mb-1">
                    {isHi ? 'रचनाएँ जल्द ही उपलब्ध होंगी' : 'Compositions Coming Soon'}
                  </h3>
                  <p className="text-xs text-[#786252] dark:text-stone-400 mb-4">
                    {isHi 
                      ? `भगवान ${resolvedDeity.nameHindi} से संबंधित रचनाएँ अभी जोड़ी जा रही हैं।`
                      : `Devotional works for ${resolvedDeity.name} are being added.`}
                  </p>
                  <Button asChild variant="outline" className="rounded-full">
                    <Link to="/upload">
                      {isHi ? 'भजन अपलोड करें' : 'Upload Devotional Content'}
                    </Link>
                  </Button>
                </div>
              ) : (
                dynamicSections.map((section) => (
                  <div key={section.type} className="space-y-4">
                    {/* Section Header */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#651317] dark:bg-amber-400" />
                        <h3 className="font-serif text-lg sm:text-xl font-bold text-[#32251E] dark:text-amber-100">
                          {isHi ? section.titleHi : section.titleEn}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-[#651317] dark:text-amber-300 font-bold">
                          {section.items.length}
                        </span>
                      </div>

                      {section.collectionUrl && (
                        <Link
                          to={section.collectionUrl}
                          className="text-xs font-bold text-[#651317] dark:text-amber-300 hover:underline inline-flex items-center gap-0.5"
                        >
                          <span>{isHi ? 'सभी देखें' : 'View All'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>

                    {/* Responsive Cards Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                      {section.items.map((item) => (
                        <div key={`${item.source}-${item.sourceKey || item.id}`} className="min-w-0">
                          <BhajanCard
                            bhajan={item}
                            onCardClick={(selected) => navigate(getContentUrl(selected))}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* TAB-SPECIFIC FILTER VIEW */
            <div>
              {tabFilteredItems.length === 0 ? (
                /* POLISHED EMPTY STATE WHEN USER EXPLICITLY SELECTS A CATEGORY WITH 0 ITEMS */
                <div className="text-center py-16 bg-white dark:bg-[#140d08] rounded-3xl border border-dashed border-[#E8D8C4] dark:border-stone-800 p-8 max-w-md mx-auto space-y-4">
                  <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-950/40 text-[#651317] dark:text-amber-300 flex items-center justify-center mx-auto text-2xl">
                    {resolvedDeity.emoji}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif text-lg font-bold text-[#32251E] dark:text-amber-100">
                      {isHi 
                        ? `${resolvedDeity.nameHindi} से संबंधित ${getCanonicalTypeLabel(activeTab as DevotionalCanonicalType, true)} अभी उपलब्ध नहीं है` 
                        : `No ${getCanonicalTypeLabel(activeTab as DevotionalCanonicalType, false)} available for ${resolvedDeity.name}`}
                    </h3>
                    <p className="text-xs text-[#786252] dark:text-stone-400">
                      {isHi 
                        ? 'अन्य उपलब्ध रचनाओं में दर्शन करें या इस पावन श्रेणी में नया भजन/पाठ जोड़ें।'
                        : 'Explore other compositions for this deity or contribute a new devotional work.'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => setActiveTab('all')}
                      className="px-4 py-2 rounded-full bg-[#651317] hover:bg-[#520f12] text-white text-xs font-bold cursor-pointer"
                    >
                      {isHi ? 'सभी रचनाएँ देखें' : 'View All Compositions'}
                    </button>
                    <Button asChild variant="outline" className="rounded-full text-xs">
                      <Link to="/upload">
                        {isHi ? 'रचना जोड़ें' : 'Upload Content'}
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {tabFilteredItems.map((item) => (
                    <div key={`${item.source}-${item.sourceKey || item.id}`} className="min-w-0">
                      <BhajanCard
                        bhajan={item}
                        onCardClick={(selected) => navigate(getContentUrl(selected))}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* ELEVATED ROYAL ABOUT SECTION (देव महिमा व स्वरूप) */}
        {resolvedDeity.aboutHindi && (
          <section className="pt-12">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFFDF8] via-white to-[#FAF3E8] dark:from-[#17100a] dark:via-[#130c07] dark:to-[#17100a] border border-[#E8D8C4] dark:border-stone-800 p-6 sm:p-8 space-y-5 shadow-xs">
              {/* Subtle Mandala Watermark */}
              <div className="absolute top-0 right-0 w-48 h-48 opacity-5 dark:opacity-10 pointer-events-none">
                <img src={mandalaGoldSvg} alt="" className="w-full h-full object-contain" />
              </div>

              {/* Title with Om SVG Icon */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#651317] to-[#8a1c22] dark:from-amber-500/30 dark:to-amber-600/20 p-1 flex items-center justify-center shrink-0 shadow-xs border border-amber-400/40">
                  <img src={omWhiteSvg} alt="Om" className="w-full h-full object-contain" />
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#32251E] dark:text-amber-100">
                  {isHi ? `${resolvedDeity.nameHindi} की महिमा व स्वरूप` : `About ${resolvedDeity.name}`}
                </h3>
              </div>

              {/* Narrative Description */}
              <p className="text-xs sm:text-sm text-[#543D2B] dark:text-stone-300 leading-relaxed max-w-3xl">
                {isHi ? resolvedDeity.aboutHindi : resolvedDeity.aboutEnglish}
              </p>

              {/* Sacred Mantra Box with Balanced Alignment & Quick Copy */}
              {resolvedDeity.mantra && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 dark:from-amber-950/40 dark:via-amber-950/20 dark:to-amber-950/40 border border-amber-400/30 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-300/30 dark:border-amber-800/30 pb-2.5">
                    <div className="inline-flex items-center gap-2">
                      <img src={malaSvg} alt="" className="w-4 h-4 object-contain" />
                      <span className="text-xs uppercase font-bold text-[#651317] dark:text-amber-300 tracking-wider">
                        {isHi ? 'पावन महामंत्र' : 'Sacred Mahamantra'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCopyMantra(resolvedDeity.mantra!)}
                        className="inline-flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-full bg-white dark:bg-stone-900 border border-amber-400/50 dark:border-amber-700/60 text-xs font-bold text-[#651317] dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-stone-800 transition-all cursor-pointer shadow-2xs active:scale-95"
                        title={isHi ? 'मंत्र कॉपी करें' : 'Copy Mantra'}
                      >
                        {copiedMantra ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span className="leading-none">{copiedMantra ? (isHi ? 'कॉपी हो गया' : 'Copied!') : (isHi ? 'मंत्र कॉपी करें' : 'Copy Mantra')}</span>
                      </button>

                      {resolvedDeity.mantraSlug && (
                        <Link
                          to={`/meditation/mantra-japa/${resolvedDeity.mantraSlug}`}
                          className="inline-flex items-center justify-center gap-1 h-8 px-3.5 rounded-full bg-[#651317] hover:bg-[#520f12] text-white text-xs font-bold shadow-2xs active:scale-95 transition-all cursor-pointer"
                          title={isHi ? 'जप शुरू करें' : 'Start Mantra Japa'}
                        >
                          <span className="leading-none">{isHi ? 'जप करें' : 'Chant'}</span>
                          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="py-1 text-center sm:text-left">
                    <p className="font-serif text-base sm:text-lg font-extrabold text-[#32251E] dark:text-amber-100 leading-relaxed tracking-wide">
                      {resolvedDeity.mantra}
                    </p>
                  </div>
                </div>
              )}

              {/* Holy Abodes / Dhams */}
              {resolvedDeity.sacredAbodes && resolvedDeity.sacredAbodes.length > 0 && (
                <div className="pt-2 flex items-center gap-2 flex-wrap text-xs text-[#786252] dark:text-stone-400">
                  <span className="font-bold flex items-center gap-1 text-[#651317] dark:text-amber-300 shrink-0">
                    <MapPin className="w-3.5 h-3.5" />
                    {isHi ? 'पावन तीर्थ व धाम:' : 'Sacred Abodes:'}
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {resolvedDeity.sacredAbodes.map((abode, i) => (
                      <span 
                        key={i} 
                        className="px-2.5 py-1 rounded-full bg-white dark:bg-stone-900 border border-[#E8D8C4] dark:border-stone-800 text-[11px] font-semibold text-[#32251E] dark:text-stone-300 shadow-2xs"
                      >
                        {abode}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* RADIANT RELATED DEITIES GRID (संबंधित देव व परिवार) */}
        {relatedDeities.length > 0 && (
          <section className="pt-12 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#651317] to-[#8a1c22] dark:from-amber-500/30 dark:to-amber-600/20 p-1 flex items-center justify-center shrink-0 shadow-xs border border-amber-400/40">
                <img src={omWhiteSvg} alt="Om" className="w-full h-full object-contain" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#32251E] dark:text-amber-100">
                {isHi ? 'संबंधित देवी-देवता व परिवार' : 'Related Deities & Family'}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {relatedDeities.map((rel) => {
                const subtitle = getCleanDeitySubtitle(rel, isHi);
                const count = staticBhajans.filter((b) => b.deityId === rel.id).length;

                return (
                  <Link
                    key={rel.slug}
                    to={getDeityUrl(rel)}
                    className="group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-[#160f0a] border border-[#E8D8C4] dark:border-amber-900/40 p-4 sm:p-4.5 shadow-[0_4px_16px_rgba(95,72,38,0.06)] hover:shadow-xl hover:border-amber-400 dark:hover:border-amber-500/60 hover:-translate-y-1 transition-all duration-300 overflow-hidden select-none"
                  >
                    {/* Decorative Sacred Corner Filigree */}
                    <span className="absolute top-2 left-2 w-2.5 h-2.5 border-t border-l border-amber-300/60 dark:border-amber-700/50 pointer-events-none rounded-tl-sm" />
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r border-amber-300/60 dark:border-amber-700/50 pointer-events-none rounded-tr-sm" />
                    <span className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b border-l border-amber-300/60 dark:border-amber-700/50 pointer-events-none rounded-bl-sm" />
                    <span className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b border-r border-amber-300/60 dark:border-amber-700/50 pointer-events-none rounded-br-sm" />

                    {/* Subtle Golden Glow on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    {/* Horizontal Split Body (Left: Ornate Portrait | Right: Titles) */}
                    <div className="flex items-center gap-3.5 sm:gap-4 w-full">
                      {/* Left: Large Ornate Avatar Halo */}
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-full p-1 bg-gradient-to-tr from-[#D4A437] via-amber-200 to-[#8A3324] shadow-md shadow-amber-900/15 ring-2 ring-amber-400/30 group-hover:scale-105 transition-transform duration-300">
                        <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-stone-900 flex items-center justify-center">
                          {rel.imageUrl ? (
                            <img
                              src={rel.imageUrl}
                              alt={rel.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <span className="text-3xl">{rel.emoji}</span>
                          )}
                        </div>
                      </div>

                      {/* Right: Deity Sacred Titles */}
                      <div className="flex-1 min-w-0 flex flex-col items-center justify-center text-center">
                        {/* Deity Main Name Title */}
                        <h4 className="font-serif text-sm sm:text-base font-extrabold text-[#32251E] dark:text-amber-100 group-hover:text-[#651317] dark:group-hover:text-amber-300 transition-colors leading-snug">
                          {isHi ? rel.nameHindi : rel.name}
                        </h4>

                        {/* Meaningful Subtitle */}
                        <p className="text-[11px] text-[#786252] dark:text-stone-400 font-medium leading-normal mt-0.5">
                          {subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Strip: Bhajan Count & Navigation CTA */}
                    <div className="mt-3 pt-2.5 border-t border-[#E8D8C4]/60 dark:border-stone-800/80 w-full flex items-center justify-between px-1">
                      <span className="text-[11px] font-bold text-[#786252] dark:text-stone-400 flex items-center gap-1">
                        <Music2 className="w-3 h-3 text-[#651317] dark:text-amber-300" />
                        <span>
                          {isHi
                            ? count > 0
                              ? `${count} पावन रचनाएँ`
                              : 'भजन संग्रह'
                            : `${count > 0 ? `${count} Bhajans` : 'Bhajan Portal'}`}
                        </span>
                      </span>

                      <span className="inline-flex items-center gap-0.5 text-xs font-bold text-[#651317] dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
                        <span>{isHi ? 'भजन व पाठ सुनें' : 'Listen Bhajans'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
