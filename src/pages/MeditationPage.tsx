import { lazy, Suspense, useEffect, useState } from "react";
import { useSearchParams, useNavigate, useParams, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import MeditationPracticeHome from "@/components/meditation/MeditationPracticeHome";
import MantraJapHome from "@/components/meditation/MantraJapHome";
import MantraDetailView from "@/components/meditation/MantraDetailView";
import MantraSetupView from "@/components/meditation/MantraSetupView";
import PremiumJapaCounter from "@/components/meditation/PremiumJapaCounter";
import MeditationTopBar from "@/components/meditation/MeditationTopBar";
import {
  getPracticeById,
  type MeditationPractice,
} from "@/lib/meditation/meditationTypes";
import { useMantraJapa, resolveMantraImage } from "@/hooks/useMantraJapa";
import type { Mantra } from "@/lib/mantraJapa/mantraJapaApi";
import {
  getMantraCanonicalPath,
  getMantraCanonicalUrl,
  resolveLegacyMantra,
} from "@/lib/mantraJapa/mantraSlugs";
import { SEO } from "@/components/SEO";

const MeditationSession = lazy(() => import("@/components/meditation/MeditationSession"));

function MeditationChunkFallback() {
  return (
    <div className="min-h-[60vh] bg-[#090506] flex items-center justify-center">
      <div className="h-10 w-10 rounded-full border-2 border-amber-500/80 border-t-transparent animate-spin" aria-label="Loading Dhyan" />
    </div>
  );
}

function getSafeReturnUrl(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("javascript:")) {
    return trimmed;
  }
  return null;
}

type Stage = "detail" | "setup" | "counter";

function DedicatedMantraView({
  mantra,
  isPersonal = false,
}: {
  mantra: Mantra;
  isPersonal?: boolean;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { completeSession, refresh, mantraTotalsMap } = useMantraJapa();

  // Navigation state passed from direct shortcuts (never from searchParams)
  const routerState = (location.state as {
    groupId?: string;
    returnUrl?: string;
    targetCount?: number;
    practiceMode?: "mala" | "tap" | "voice" | "guided";
    sankalpText?: string;
    autoStart?: boolean;
  } | null) || {};

  const safeReturnUrl = getSafeReturnUrl(routerState.returnUrl);

  // Single stage state: "detail" | "setup" | "counter"
  const [stage, setStage] = useState<Stage>(routerState.autoStart ? "counter" : "detail");

  const [sessionOptions, setSessionOptions] = useState({
    targetCount: routerState.targetCount || 108,
    practiceMode: (routerState.practiceMode || "mala") as "mala" | "tap" | "voice" | "guided",
    sankalpText: routerState.sankalpText || "",
    groupId: routerState.groupId || null,
  });

  const handleShare = () => {
    const url = isPersonal
      ? typeof window !== "undefined"
        ? window.location.href
        : ""
      : getMantraCanonicalUrl(mantra.slug);
    const title = mantra.name_hindi || mantra.name_english;
    if (navigator.share && url) {
      navigator.share({ title, url, text: title }).catch(() => {});
    } else if (url) {
      void navigator.clipboard.writeText(url);
    }
  };

  // Lock body scroll ONLY during active full-screen counter
  useEffect(() => {
    if (stage !== "counter") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [stage]);

  // Stage 3: Full-screen Active Counter
  if (stage === "counter") {
    return (
      <PremiumJapaCounter
        mantra={mantra}
        targetCount={sessionOptions.targetCount}
        practiceMode={sessionOptions.practiceMode}
        sankalpText={sessionOptions.sankalpText}
        onClose={() => {
          // Counter -> Close: Return to Detail
          setStage("detail");
        }}
        onComplete={async (actualCount, durationSeconds) => {
          try {
            await completeSession({
              mantraId: mantra.id,
              mantraLabel: mantra.name_english,
              sankalp: sessionOptions.sankalpText,
              targetCount: sessionOptions.targetCount,
              actualCount: actualCount,
              durationSeconds: durationSeconds,
              groupId: sessionOptions.groupId,
            });
          } catch (err) {
            console.error("Error saving Japa session:", err);
          }
          refresh();
          if (safeReturnUrl) {
            navigate(safeReturnUrl);
          } else {
            // Return to Detail on complete
            setStage("detail");
          }
        }}
      />
    );
  }

  // Stages 1 & 2: Detail Guide Page + Setup Popup Sheet
  return (
    <div className="relative flex flex-col h-full min-h-screen bg-[#FAF6EE] dark:bg-[#0c0a08]">
      <MeditationTopBar
        title={mantra.name_hindi || mantra.name_english}
        onBack={() => {
          // Detail -> Back: Return to catalog
          navigate("/meditation/mantra-japa");
        }}
        onShare={handleShare}
      />
      <MantraDetailView
        mantra={mantra}
        image={resolveMantraImage(mantra)}
        stats={mantraTotalsMap[mantra.id]}
        onBack={() => navigate("/meditation/mantra-japa")}
        onStartJapa={() => {
          // Detail -> Start Japa: Open Setup popup
          setStage("setup");
        }}
        isPersonal={isPersonal}
      />
      <AnimatePresence>
        {stage === "setup" && (
          <MantraSetupView
            mantra={mantra}
            initialGroupId={sessionOptions.groupId}
            onBack={() => {
              // Setup -> Back: Return to Detail
              setStage("detail");
            }}
            onStartJapa={(opts) => {
              setSessionOptions((prev) => ({
                ...prev,
                targetCount: opts.targetCount,
                practiceMode: opts.practiceMode,
                sankalpText: opts.sankalpText,
                groupId: opts.groupId || prev.groupId,
              }));
              // Setup -> Begin: Transition to Counter
              setStage("counter");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MeditationPage() {
  const { mantraSlug, personalMantraId } = useParams<{
    mantraSlug?: string;
    personalMantraId?: string;
  }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    mantras,
    mantrasLoading,
    personalMantras,
    personalMantrasLoading,
  } = useMantraJapa();

  const practiceId = searchParams.get("practice");
  const practice = practiceId ? getPracticeById(practiceId) || null : null;

  // Lock body scroll ONLY during full-screen legacy practice session
  useEffect(() => {
    if (!practice) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [practice]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // ── Backward-Compatibility Redirects for Legacy Query Parameters ──
  useEffect(() => {
    if (location.pathname === "/meditation") {
      if (practiceId === "mantra_jap_home") {
        navigate("/meditation/mantra-japa", { replace: true });
        return;
      }
      if (practiceId === "mantra_japa_counter") {
        const legacyMantraId = searchParams.get("mantraId");
        if (legacyMantraId && mantras.length > 0) {
          const matched = resolveLegacyMantra(mantras, legacyMantraId);
          if (matched) {
            navigate(getMantraCanonicalPath(matched.slug), { replace: true });
            return;
          }
        }
        navigate("/meditation/mantra-japa", { replace: true });
        return;
      }
    }

    // If a legacy link with query parameters like ?practice=mantra_jap_home arrives on /meditation/mantra-japa
    if (location.pathname === "/meditation/mantra-japa" && location.search.includes("practice=")) {
      navigate("/meditation/mantra-japa", { replace: true });
    }
  }, [location.pathname, location.search, practiceId, searchParams, mantras, navigate]);

  // ── 1. Personal Mantra View (/meditation/mantra-japa/personal/:personalMantraId) ──
  if (personalMantraId) {
    const personalMantra = personalMantras.find((m) => m.id === personalMantraId);

    if (personalMantra) {
      const mappedMantra: Mantra = {
        id: personalMantra.id,
        slug: personalMantra.id,
        name_hindi: personalMantra.name_hindi,
        name_english: personalMantra.name_english,
        deity: personalMantra.deity ?? "om",
        description_hindi: "व्यक्तिगत साधना मंत्र",
        description_english: "Personal Sadhana Mantra",
        meaning_hindi: null,
        meaning_english: null,
        full_text_hindi: personalMantra.full_text_hindi || personalMantra.name_hindi,
        transliteration: personalMantra.transliteration || personalMantra.name_english,
        image_url: null,
        audio_url: null,
        recommended_counts: [108, 1008],
        sort_order: 999,
        is_active: true,
      };

      return <DedicatedMantraView mantra={mappedMantra} isPersonal={true} />;
    }

    if (personalMantrasLoading) {
      return (
        <div className="min-h-screen bg-[#090506] flex items-center justify-center text-amber-500 font-display text-lg">
          Loading Personal Mantra...
        </div>
      );
    }

    // Not found or unauthorized access (RLS-enforced)
    return (
      <div className="min-h-screen bg-[#090506] flex flex-col items-center justify-center text-amber-500 gap-4 p-4 text-center">
        <SEO
          title="Personal Mantra Not Found"
          description="This personal mantra is private to its creator or has been deleted."
          noindex
        />
        <h2 className="text-xl font-bold font-display">Personal Mantra Not Found</h2>
        <p className="text-sm text-stone-400 max-w-sm">
          This mantra is private to its creator or does not exist.
        </p>
        <button
          type="button"
          onClick={() => navigate("/meditation/mantra-japa")}
          className="px-5 py-2.5 bg-amber-500 text-black font-semibold rounded-full hover:bg-amber-400 transition-colors"
        >
          View My Mantras
        </button>
      </div>
    );
  }

  // ── 2. Dedicated Public Mantra Japa View (/meditation/mantra-japa/:mantraSlug) ──
  if (mantraSlug) {
    // Normal Hot Path: Direct slug lookup
    const activeMantra = mantras.find((m) => m.slug === mantraSlug);

    // If activeMantra is found, render the 3-stage DedicatedMantraView
    if (activeMantra) {
      return <DedicatedMantraView mantra={activeMantra} />;
    }

    // Still loading mantras
    if (mantrasLoading) {
      return (
        <div className="min-h-screen bg-[#090506] flex items-center justify-center text-amber-500 font-display text-lg">
          Loading Mantra...
        </div>
      );
    }

    // Isolated Legacy Fallback Path: attempt alias or legacy UUID resolution
    const legacyMatched = resolveLegacyMantra(mantras, mantraSlug);
    if (legacyMatched) {
      navigate(getMantraCanonicalPath(legacyMatched.slug), { replace: true });
      return <MeditationChunkFallback />;
    }

    // Not found
    return (
      <div className="min-h-screen bg-[#090506] flex flex-col items-center justify-center text-amber-500 gap-4 p-4 text-center">
        <SEO
          title="Mantra Not Found"
          description="The requested mantra could not be found."
          noindex
        />
        <h2 className="text-xl font-bold font-display">Mantra Not Found</h2>
        <p className="text-sm text-stone-400 max-w-sm">
          The mantra you are looking for may have been moved or does not exist.
        </p>
        <button
          type="button"
          onClick={() => navigate("/meditation/mantra-japa")}
          className="px-5 py-2.5 bg-amber-500 text-black font-semibold rounded-full hover:bg-amber-400 transition-colors"
        >
          View All Mantras
        </button>
      </div>
    );
  }

  // ── 2. Mantra Japa Catalog & Dashboard (/meditation/mantra-japa) ──
  if (location.pathname === "/meditation/mantra-japa" || location.pathname === "/meditation/naam-japa") {
    return <MantraJapHome onBack={() => navigate("/meditation")} />;
  }

  // ── 3. Legacy Practice Session (if triggered with ?practice=id) ──
  if (practice) {
    return (
      <Suspense fallback={<MeditationChunkFallback />}>
        <MeditationSession
          key={practice.id}
          practice={practice}
          onPracticeChange={(newPractice) => {
            navigate(`/meditation?practice=${newPractice.id}`, { replace: true });
          }}
          onExit={() => navigate("/meditation")}
        />
      </Suspense>
    );
  }

  // ── 4. Main Meditation Landing Page (/meditation) ──
  return (
    <MeditationPracticeHome
      onSelectPractice={(p) => {
        if (p.id === "mantra_jap_home") {
          navigate("/meditation/mantra-japa");
        } else {
          navigate(`/meditation?practice=${p.id}`);
        }
      }}
      onQuickStart={() => navigate("/meditation/mantra-japa")}
    />
  );
}
