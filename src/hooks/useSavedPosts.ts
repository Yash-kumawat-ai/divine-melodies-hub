import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'hk_saved_post_ids';

export function useSavedPosts() {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // Load from localStorage on mount & when localStorage changes
  const loadSavedIds = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedIds(parsed.map(String));
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    setSavedIds([]);
  }, []);

  useEffect(() => {
    loadSavedIds();

    // Listen to storage events so it syncs across tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        loadSavedIds();
      }
    };
    // Also listen to custom events for same-window updates
    const handleCustomChange = () => {
      loadSavedIds();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('hk_saved_posts_changed', handleCustomChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('hk_saved_posts_changed', handleCustomChange);
    };
  }, [loadSavedIds]);

  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds]);

  const toggleSave = useCallback((id: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let current: string[] = [];
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          current = parsed.map(String);
        }
      }
      let next: string[];
      let isSavedNow = false;
      if (current.includes(id)) {
        next = current.filter(x => x !== id);
      } else {
        next = [...current, id];
        isSavedNow = true;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSavedIds(next);
      // Dispatch custom event for real-time same-window updates
      window.dispatchEvent(new Event('hk_saved_posts_changed'));
      return isSavedNow;
    } catch (e) {
      console.error(e);
      return false;
    }
  }, []);

  return { savedIds, isSaved, toggleSave };
}
