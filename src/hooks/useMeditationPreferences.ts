import { useCallback, useEffect, useState } from "react";
import type { MeditationPreferences } from "@/lib/meditation/meditationTypes";
import { loadPreferences, savePreferences } from "@/lib/meditation/meditationStorage";

export function useMeditationPreferences() {
  const [prefs, setPrefs] = useState<MeditationPreferences>(() => loadPreferences());

  useEffect(() => {
    savePreferences(prefs);
  }, [prefs]);

  const update = useCallback((patch: Partial<MeditationPreferences>) => {
    setPrefs((p) => ({ ...p, ...patch }));
  }, []);

  return { prefs, update, setPrefs };
}
