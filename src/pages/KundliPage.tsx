import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { getOrComputeAstrologyProfile } from '@/lib/astrology/astrologyClient';
import type { CompleteKundliData, AstrologyProfile, BirthProfile, NormalizedPlanet } from '@/lib/astrology/types';
import { SEO } from '@/components/SEO';
import { toast } from 'sonner';

// Modular Presentation Components (Pure Props / Zero independent astrology calculations)
import { KundliHeroHeader } from '@/components/astrology/KundliHeroHeader';
import { KundliStickyNav } from '@/components/astrology/KundliStickyNav';
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
  const isHi = language === 'hi';

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

      <div className="max-w-6xl mx-auto px-3 sm:px-5 lg:px-6 py-4 space-y-4">
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
          onShare={handleShare}
          onEdit={() => navigate('/kundli/setup?edit=1')}
          onBack={() => navigate('/')}
          onPrint={handlePrint}
        />

        {/* 2. STICKY SUB-NAVIGATION BAR (Locks to top-14 on scroll) */}
        <KundliStickyNav isHi={isHi} />

        {/* 3. 3-COLUMN CORE DASHBOARD GRID (Matching image reference) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Left Column: Key Highlights (3 cols on lg) */}
          <div className="lg:col-span-3">
            {kundli && <KundliQuickSummary kundli={kundli} isHi={isHi} />}
          </div>

          {/* Center Column: Chart Visual Centerpiece (6 cols on lg) */}
          <div className="lg:col-span-6">
            <KundliChartContainer
              planets={planets}
              ascendant={ascendant}
              isUnknownTime={isUnknown}
              vargas={vargas}
              isHi={isHi}
            />
          </div>

          {/* Right Column: Janma Panchang (3 cols on lg) */}
          <div className="lg:col-span-3">
            <JanmaPanchangCompact panchanga={panchanga} isHi={isHi} />
          </div>
        </div>

        {/* 4. DETAILED DEEP-DIVE SECTIONS */}
        <main className="space-y-6 sm:space-y-7 pt-2">
          {/* 4. NAVAGRAHA PLANETARY DATA TABLE */}
          <NavagrahaTable planets={planets} isHi={isHi} />

          {/* 5. 12 BHAV / HOUSE ANALYSIS */}
          <BhavAnalysisSection houses={houses} isUnknownTime={isUnknown} isHi={isHi} />

          {/* 6. VIMSHOTTARI DASHA TIMELINE */}
          <VimshottariDashaSection dasha={dasha} isHi={isHi} />

          {/* 7. YOGAS & DOSHAS */}
          <YogaDoshaSection mangalDosha={mangalDosha} isHi={isHi} />

          {/* 8. REMEDIES & DEVOTIONAL SADHANA */}
          <RemediesSadhanaSection
            ishtaDevata={ishtaDevata}
            predictions={predictions}
            isHi={isHi}
          />

          {/* 9. GURU JI DEEP CONSULTATION */}
          <GuruJiConsultationSection isHi={isHi} />
        </main>
      </div>
    </div>
  );
}
