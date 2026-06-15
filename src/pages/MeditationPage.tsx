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
