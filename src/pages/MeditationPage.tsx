import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MeditationPracticeHome from "@/components/meditation/MeditationPracticeHome";
import MeditationSession from "@/components/meditation/MeditationSession";
import MantraJapHome from "@/components/meditation/MantraJapHome";
import {
  getPracticeById,
  type MeditationPractice,
} from "@/lib/meditation/meditationTypes";
import { loadPreferences } from "@/lib/meditation/meditationStorage";
import PremiumJapaCounter from "@/components/meditation/PremiumJapaCounter";
import { useMantraJapa } from "@/hooks/useMantraJapa";

export default function MeditationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const practiceId = searchParams.get("practice");
  const practice = practiceId ? getPracticeById(practiceId) || null : null;

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
  }, [practiceId]);

  const handleSelectPractice = (newPractice: { id: string }) => {
    setSearchParams({ practice: newPractice.id });
  };

  const handleExit = () => {
    setSearchParams({});
  };

  const handleQuickStart = () => {
    const prefs = loadPreferences();
    const last = prefs.lastPracticeId ? getPracticeById(prefs.lastPracticeId) : null;
    const targetPractice = last ?? getPracticeById("mantra_shiva")!;
    setSearchParams({ practice: targetPractice.id });
  };

  const handlePracticeChange = (newPractice: MeditationPractice) => {
    setSearchParams({ practice: newPractice.id });
  };

  if (practiceId === "mantra_jap_home") {
    return <MantraJapHome onBack={handleExit} />;
  }

  if (practiceId === "mantra_japa_counter") {
    return <MantraJapaCounterView />;
  }

  if (practice) {
    return (
      <MeditationSession
        key={practice.id}
        practice={practice}
        onPracticeChange={handlePracticeChange}
        onExit={handleExit}
      />
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
  const mantraId = searchParams.get("mantraId");
  const targetCount = Number(searchParams.get("targetCount") || "108");
  const practiceMode = (searchParams.get("practiceMode") || "mala") as "mala" | "tap" | "voice" | "guided";
  const sankalpText = searchParams.get("sankalp") || "";

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
          onClick={() => setSearchParams({ practice: "mantra_jap_home" })}
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
        setSearchParams({
          practice: "mantra_jap_home",
          mantraId: finalMantra.id,
          showSetup: "true",
        });
      }}
      onComplete={(actualCount, durationSeconds, finalMantraId) => {
        const finalMantra = mantras.find((m) => m.id === finalMantraId) || activeMantra;
        completeSession({
          mantraId: finalMantra.id,
          mantraLabel: finalMantra.name_english,
          sankalp: sankalpText,
          targetCount: targetCount,
          actualCount: actualCount,
          durationSeconds: durationSeconds,
        });
        refresh();
        setSearchParams({
          practice: "mantra_jap_home",
          mantraId: finalMantra.id,
        });
      }}
    />
  );
}
