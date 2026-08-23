import { lazy, Suspense, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import MeditationPracticeHome from "@/components/meditation/MeditationPracticeHome";
import MantraJapHome from "@/components/meditation/MantraJapHome";
import PremiumJapaCounter from "@/components/meditation/PremiumJapaCounter";
import {
  getPracticeById,
  type MeditationPractice,
} from "@/lib/meditation/meditationTypes";
import { useMantraJapa } from "@/hooks/useMantraJapa";

const MeditationSession = lazy(() => import("@/components/meditation/MeditationSession"));

function MeditationChunkFallback() {
  return (
    <div className="min-h-[60vh] bg-[#090506] flex items-center justify-center">
      <div className="h-10 w-10 rounded-full border-2 border-amber-500/80 border-t-transparent animate-spin" aria-label="Loading Dhyan" />
    </div>
  );
}

function navigateMeditationBack(navigate: ReturnType<typeof useNavigate>) {
  const idx = (window.history.state as { idx?: number } | null)?.idx;
  if (typeof idx === "number" && idx > 0) navigate(-1);
  else navigate("/");
}

export default function MeditationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const practiceId = searchParams.get("practice");
  const practice = practiceId ? getPracticeById(practiceId) || null : null;

  useEffect(() => {
    const lockSession = Boolean(practice) || practiceId === "mantra_japa_counter";
    if (!lockSession) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [practice, practiceId]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [practiceId]);

  const handleSelectPractice = (newPractice: { id: string }) => {
    setSearchParams({ practice: newPractice.id }, { replace: true });
  };

  const handleExit = () => {
    const returnUrl = searchParams.get("returnUrl");
    if (returnUrl) {
      navigate(returnUrl);
      return;
    }
    const groupId = searchParams.get("groupId");
    if (groupId) {
      navigate(-1);
      return;
    }
    if (practiceId) {
      setSearchParams({}, { replace: true });
      return;
    }
    navigateMeditationBack(navigate);
  };

  const handleQuickStart = () => {
    setSearchParams({ practice: "mantra_jap_home" }, { replace: true });
  };

  const handlePracticeChange = (newPractice: MeditationPractice) => {
    setSearchParams({ practice: newPractice.id }, { replace: true });
  };

  if (practiceId === "mantra_jap_home") {
    return <MantraJapHome onBack={handleExit} />;
  }

  if (practiceId === "mantra_japa_counter") {
    return <MantraJapaCounterView />;
  }

  if (practice) {
    return (
      <Suspense fallback={<MeditationChunkFallback />}>
        <MeditationSession
          key={practice.id}
          practice={practice}
          onPracticeChange={handlePracticeChange}
          onExit={handleExit}
        />
      </Suspense>
    );
  }

  return (
    <MeditationPracticeHome
      onSelectPractice={handleSelectPractice}
      onQuickStart={handleQuickStart}
    />
  );
}

function MantraJapaCounterView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const mantraId = searchParams.get("mantraId");
  const targetCount = Number(searchParams.get("targetCount") || "108");
  const practiceMode = (searchParams.get("practiceMode") || "mala") as "mala" | "tap" | "voice" | "guided";
  const sankalpText = searchParams.get("sankalp") || "";
  const groupId = searchParams.get("groupId") || null;
  const returnUrl = searchParams.get("returnUrl");

  const { mantras, completeSession, refresh, mantrasLoading } = useMantraJapa();

  const activeMantra = mantras.find((m) => m.id === mantraId);

  if (mantrasLoading) {
    return (
      <div className="min-h-screen bg-[#090506] flex items-center justify-center text-amber-500 font-display text-lg">
        {searchParams.get("lang") === "hi" ? "मंत्र लोड हो रहा है..." : "Loading Mantra..."}
      </div>
    );
  }

  if (!activeMantra) {
    return (
      <div className="min-h-screen bg-[#090506] flex flex-col items-center justify-center text-amber-500 gap-4">
        <p>Mantra not found.</p>
        <button
          onClick={() => {
            if (returnUrl) {
              navigate(returnUrl);
              return;
            }
            if (groupId) {
              navigate(-1);
              return;
            }
            setSearchParams({ practice: "mantra_jap_home" }, { replace: true });
          }}
          className="px-4 py-2 bg-amber-500 text-black rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <PremiumJapaCounter
      mantra={activeMantra}
      sankalpText={sankalpText}
      targetCount={targetCount}
      practiceMode={practiceMode}
      onClose={(finalMantraId) => {
        const finalMantra = mantras.find((m) => m.id === finalMantraId) || activeMantra;
        setSearchParams(
          {
            practice: "mantra_jap_home",
            mantraId: finalMantra.id,
            ...(groupId ? { groupId } : {}),
            ...(returnUrl ? { returnUrl } : {}),
          },
          { replace: true }
        );
      }}
      onComplete={async (actualCount, durationSeconds, finalMantraId) => {
        const finalMantra = mantras.find((m) => m.id === finalMantraId) || activeMantra;
        try {
          await completeSession({
            mantraId: finalMantra.id,
            mantraLabel: finalMantra.name_english,
            sankalp: sankalpText,
            targetCount: targetCount,
            actualCount: actualCount,
            durationSeconds: durationSeconds,
            groupId: groupId,
          });
        } catch (err) {
          console.error("Error saving Japa session:", err);
        }
        refresh();
        if (returnUrl) {
          navigate(returnUrl);
          return;
        }
        setSearchParams(
          {
            practice: "mantra_jap_home",
            mantraId: finalMantra.id,
            ...(groupId ? { groupId } : {}),
          },
          { replace: true }
        );
      }}
    />
  );
}
