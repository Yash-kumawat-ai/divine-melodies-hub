import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowLeft, Share2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { getOrComputeAstrologyProfile } from '@/lib/astrology/astrologyClient';
import type { CompleteKundliData, AstrologyProfile, BirthProfile, NormalizedPlanet } from '@/lib/astrology/types';
import { SEO } from '@/components/SEO';
import { toast } from 'sonner';

// Modular Presentation Components (Pure Props / Zero independent astrology calculations)
import { KundliHeroHeader } from '@/components/astrology/KundliHeroHeader';
import { KundliTabBar, type KundliTabId, KUNDLI_TABS } from '@/components/astrology/KundliTabBar';
import { KundliQuickSummary } from '@/components/astrology/KundliQuickSummary';
import { KundliChartContainer } from '@/components/astrology/KundliChartContainer';
import { JanmaPanchangCompact } from '@/components/astrology/JanmaPanchangCompact';
import { NavagrahaTable } from '@/components/astrology/NavagrahaTable';
import { BhavAnalysisSection } from '@/components/astrology/BhavAnalysisSection';
import { VimshottariDashaSection } from '@/components/astrology/VimshottariDashaSection';
import { YogaDoshaSection } from '@/components/astrology/YogaDoshaSection';
import { RemediesSadhanaSection } from '@/components/astrology/RemediesSadhanaSection';
import { GuruJiConsultationSection } from '@/components/astrology/GuruJiConsultationSection';

const VEDIC_PLANET_ORDER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

export default function KundliPage() {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isHi = language === 'hi';

  const tabParam = searchParams.get('tab') as KundliTabId | null;
  const initialTab: KundliTabId = (tabParam && KUNDLI_TABS.some(t => t.id === tabParam)) ? tabParam : 'overview';
  const [activeTab, setActiveTab] = useState<KundliTabId>(initialTab);

  const handleTabChange = useCallback((tabId: KundliTabId) => {
    setActiveTab(tabId);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tabId === 'overview') {
        next.delete('tab');
      } else {
        next.set('tab', tabId);
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const [birth, setBirth] = useState<BirthProfile | null>(null);
  const [astro, setAstro] = useState<AstrologyProfile | null>(null);
  const [kundli, setKundli] = useState<CompleteKundliData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadedUserIdRef = useRef<string | null>(null);

  const loadData = useCallback(async (isExplicitRetry = false): Promise<boolean> => {
    if (!user?.id) return false;
    if (isExplicitRetry) {
      loadedUserIdRef.current = null;
    }
    setLoading(true);
    setError(null);

    try {
      const result = await getOrComputeAstrologyProfile(user.id);
      if (!result.birth) {
        navigate('/kundli/setup');
        return false;
      }
      setBirth(result.birth);
      setAstro(result.astro);
      setKundli(result.kundli);
      return true;
    } catch (err: any) {
      console.error('KundliPage load error:', err);
      setError(err?.message || (isHi ? 'कुण्डली लोड करने में त्रुटि हुई।' : 'Failed to load Kundli data.'));
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, navigate, isHi]);

  useEffect(() => {
    const uid = user?.id;
    if (!uid || uid === loadedUserIdRef.current) return;

    let isMounted = true;
    void (async () => {
      const success = await loadData();
      if (success && isMounted) {
        loadedUserIdRef.current = uid;
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [user?.id, loadData]);

  // Data Resolution with Memoization
  const isUnknown = birth?.birth_time_accuracy === 'unknown';
  const isApproximate = birth?.birth_time_accuracy === 'approximate';

  const rawPlanets = kundli?.planets || (astro?.core_chart?.planets as Record<string, NormalizedPlanet>) || {};
  const planets = useMemo(() =>
    Object.fromEntries(
      Object.entries(rawPlanets).filter(([k]) => VEDIC_PLANET_ORDER.includes(k))
    ), [rawPlanets]);

  const ascendant = kundli?.ascendant || (typeof astro?.core_chart?.lagna === 'object' ? (astro?.core_chart?.lagna as any) : undefined);
  const houses = useMemo(() => kundli?.houses || (Array.isArray(astro?.core_chart?.houses) ? astro?.core_chart?.houses : []) || [], [kundli?.houses, astro?.core_chart?.houses]);
  const dasha = kundli?.dasha || astro?.dasha;
  const mangalDosha = kundli?.mangalDosha || astro?.mangal_dosha;
  const ishtaDevata = kundli?.ishtaDevata || astro?.ishta_devata;
  const panchanga = kundli?.panchanga || astro?.panchanga_birth;
  const predictions = useMemo(() => kundli?.predictions || astro?.predictions || {}, [kundli?.predictions, astro?.predictions]);
  const vargas = useMemo(() => kundli?.vargas || astro?.vargas || {}, [kundli?.vargas, astro?.vargas]);
  const ayanamsa = kundli?.ayanamsa || astro?.ayanamsa || 'Lahiri (23.93°)';

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: `${profile?.name || user?.user_metadata?.name || 'Vedic'} Kundli | Raghavam`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(isHi ? 'कुण्डली लिंक कॉपी हो गया।' : 'Kundli link copied to clipboard!');
    }
  }, [profile?.name, user?.user_metadata?.name, isHi]);

  const handleMobileBack = useCallback(() => {
    if (window.history.length > 1 && document.referrer) {
      navigate(-1);
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleRetry = useCallback(() => {
    void loadData(true);
  }, [loadData]);

  // Loading State
  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-9 w-9 animate-spin text-brand-primary" />
          <p className="text-sm text-muted-foreground font-display">
            {isHi ? 'वैदिक कुण्डली रिपोर्ट तैयार हो रही है...' : 'Preparing your Vedic Kundli report...'}
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || (!birth && !loading)) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-display font-bold text-foreground">
          {isHi ? 'कुण्डली विवरण उपलब्ध नहीं' : 'Kundli Profile Unavailable'}
        </h2>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          {error || (isHi ? 'कृपया पहले अपनी जन्म तिथि, समय एवं स्थान दर्ज करें।' : 'Please complete your birth profile to view your Kundli.')}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/kundli/setup')}
            className="btn-primary btn-sm"
          >
            {isHi ? 'जन्म विवरण भरें' : 'Set Up Birth Profile'}
          </button>
          <button
            type="button"
            onClick={handleRetry}
            className="btn-secondary btn-sm"
          >
            {isHi ? 'पुनः प्रयास करें' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background text-foreground">
      <SEO
        title="Your Vedic Kundli & Janampatri | Raghavam"
        description="Authentic Vedic Astrology Kundli Report — North & South Indian charts, Vimshottari Dasha, Navagraha placements, Janma Panchangam, and Guru Ji AI guidance."
        noindex={true}
      />

      {/* Dedicated Mobile Top Header with Back, Title, and Share */}
      <header className="block md:hidden sticky top-0 z-40 bg-[#FFFDF9]/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-brand-gold-border/30 px-3.5 py-2.5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleMobileBack}
            aria-label={isHi ? 'पीछे जाएं' : 'Go back'}
            className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-surface-raised border border-brand-gold-border/30 text-foreground active:scale-95 transition-transform cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <h1 className="font-display font-bold text-base text-foreground tracking-wide">
            {isHi ? 'जन्म कुंडली' : 'Kundli'}
          </h1>

          <button
            type="button"
            onClick={handleShare}
            aria-label={isHi ? 'साझा करें' : 'Share Kundli'}
            className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-surface-raised border border-brand-gold-border/30 text-foreground active:scale-95 transition-transform cursor-pointer"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-3 sm:px-5 lg:px-6 pt-2.5 sm:pt-4 pb-6 space-y-3.5 sm:space-y-4">
        {/* 1. HERO HEADER PROFILE BAR (Matching image reference) */}
        <KundliHeroHeader
          birth={birth}
          profile={profile}
          ascendant={ascendant}
          planets={planets}
          isUnknownTime={isUnknown}
          isApproximate={isApproximate}
          ayanamsa={ayanamsa}
          isHi={isHi}
          vara={panchanga?.varaHi || panchanga?.vara}
          onShare={handleShare}
          onEdit={() => navigate('/kundli/setup?edit=1')}
          onBack={handleMobileBack}
          onPrint={handlePrint}
        />

        {/* 2. MODERN HORIZONTAL TAB BAR */}
        <KundliTabBar
          activeTab={activeTab}
          onChangeTab={handleTabChange}
          isHi={isHi}
        />

        {/* 3. DEDICATED TAB CONTENT VIEWS */}
        <main className="pt-2 min-h-[500px]">
          {/* TAB 1: OVERVIEW HUB (3-Column Dashboard + Key Insights Strip) */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* 3-Column Core Centerpiece */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                {/* Left Column: Key Highlights */}
                <div className="lg:col-span-3">
                  {kundli && (
                    <KundliQuickSummary
                      kundli={kundli}
                      isHi={isHi}
                      onSelectTab={handleTabChange}
                    />
                  )}
                </div>

                {/* Center Column: Chart Visual Centerpiece */}
                <div className="lg:col-span-6">
                  <KundliChartContainer
                    planets={planets}
                    ascendant={ascendant}
                    isUnknownTime={isUnknown}
                    vargas={vargas}
                    isHi={isHi}
                  />
                </div>

                {/* Right Column: Janma Panchang */}
                <div className="lg:col-span-3">
                  <JanmaPanchangCompact panchanga={panchanga} isHi={isHi} />
                </div>
              </div>

              {/* 2-Column Key Snapshot Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <VimshottariDashaSection dasha={dasha} isHi={isHi} />
                <YogaDoshaSection mangalDosha={mangalDosha} isHi={isHi} />
              </div>

              {/* Guru Ji AI Deep Guidance */}
              <GuruJiConsultationSection isHi={isHi} />
            </div>
          )}

          {/* TAB 2: CHARTS & DIVISIONAL VARGAS */}
          {activeTab === 'charts' && (
            <div className="max-w-4xl mx-auto">
              <KundliChartContainer
                planets={planets}
                ascendant={ascendant}
                isUnknownTime={isUnknown}
                vargas={vargas}
                isHi={isHi}
              />
            </div>
          )}

          {/* TAB 3: JANMA PANCHANG DETAILS */}
          {activeTab === 'panchang' && (
            <div className="max-w-2xl mx-auto">
              <JanmaPanchangCompact panchanga={panchanga} isHi={isHi} />
            </div>
          )}

          {/* TAB 4: NAVAGRAHA PLANETS TABLE */}
          {activeTab === 'planets' && (
            <div className="max-w-5xl mx-auto">
              <NavagrahaTable planets={planets} isHi={isHi} />
            </div>
          )}

          {/* TAB 5: 12 BHAV / HOUSE ANALYSIS */}
          {activeTab === 'houses' && (
            <div className="max-w-5xl mx-auto">
              <BhavAnalysisSection houses={houses} isUnknownTime={isUnknown} isHi={isHi} />
            </div>
          )}

          {/* TAB 6: VIMSHOTTARI DASHA TIMELINE */}
          {activeTab === 'dasha' && (
            <div className="max-w-3xl mx-auto">
              <VimshottariDashaSection dasha={dasha} isHi={isHi} />
            </div>
          )}

          {/* TAB 7: YOGAS & DOSHAS */}
          {activeTab === 'dosha' && (
            <div className="max-w-3xl mx-auto">
              <YogaDoshaSection mangalDosha={mangalDosha} isHi={isHi} />
            </div>
          )}

          {/* TAB 8: REMEDIES & DEVOTIONAL SADHANA */}
          {activeTab === 'remedies' && (
            <div className="max-w-4xl mx-auto">
              <RemediesSadhanaSection
                ishtaDevata={ishtaDevata}
                predictions={predictions}
                isHi={isHi}
              />
            </div>
          )}

          {/* TAB 9: GURU JI CONSULTATION */}
          {activeTab === 'guruji' && (
            <div className="max-w-3xl mx-auto">
              <GuruJiConsultationSection isHi={isHi} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
