import { useEffect, useState } from "react";
import MeditationPracticeHome from "@/components/meditation/MeditationPracticeHome";
import MeditationSession from "@/components/meditation/MeditationSession";
import {
  getPracticeById,
  type MeditationPractice,
} from "@/lib/meditation/meditationTypes";
import { loadPreferences } from "@/lib/meditation/meditationStorage";

export default function MeditationPage() {
  const [practice, setPractice] = useState<MeditationPractice | null>(null);

  useEffect(() => {
    if (!practice) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [practice]);

  const handleQuickStart = () => {
    const prefs = loadPreferences();
    const last = prefs.lastPracticeId ? getPracticeById(prefs.lastPracticeId) : null;
    setPractice(last ?? getPracticeById("mantra_shiva")!);
  };

  if (practice) {
    return (
      <MeditationSession
        key={practice.id}
        practice={practice}
        onPracticeChange={setPractice}
        onExit={() => setPractice(null)}
      />
    );
  }

  return (
    <MeditationPracticeHome
      onSelectPractice={setPractice}
      onQuickStart={handleQuickStart}
    />
  );
}
