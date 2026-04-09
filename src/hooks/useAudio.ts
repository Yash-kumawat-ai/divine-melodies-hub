import { useState, useCallback, useEffect } from 'react';

export interface BhajanTrack {
  id: number;
  title: string;
  titleHindi?: string;
  singerName: string;
  audio_url?: string;
  audio_duration?: number;
  deityId?: number;
}

interface UseAudioReturn {
  currentTrack: BhajanTrack | null;
  queue: BhajanTrack[];
  currentIndex: number;
  isPlaying: boolean;
  setCurrentTrack: (track: BhajanTrack | null) => void;
  setQueue: (tracks: BhajanTrack[]) => void;
  addToQueue: (track: BhajanTrack) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  playNext: () => void;
  playPrevious: () => void;
}

export const useAudio = (): UseAudioReturn => {
  const [currentTrack, setCurrentTrack] = useState<BhajanTrack | null>(null);
  const [queue, setQueue] = useState<BhajanTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedQueue = localStorage.getItem('bhajanQueue');
    const savedIndex = localStorage.getItem('queueIndex');
    if (savedQueue) {
      try {
        setQueue(JSON.parse(savedQueue));
        if (savedIndex) setCurrentIndex(parseInt(savedIndex));
      } catch (e) {
        console.error('Error loading queue:', e);
      }
    }
  }, []);

  // Save to localStorage when queue changes
  useEffect(() => {
    localStorage.setItem('bhajanQueue', JSON.stringify(queue));
    localStorage.setItem('queueIndex', currentIndex.toString());
  }, [queue, currentIndex]);

  const addToQueue = useCallback(
    (track: BhajanTrack) => {
      setQueue((prev) => [...prev, track]);
    },
    []
  );

  const removeFromQueue = useCallback((index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setCurrentIndex(0);
    setCurrentTrack(null);
  }, []);

  const playNext = useCallback(() => {
    if (currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentTrack(queue[nextIndex]);
    }
  }, [currentIndex, queue]);

  const playPrevious = useCallback(() => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentTrack(queue[prevIndex]);
    }
  }, [currentIndex, queue]);

  return {
    currentTrack,
    queue,
    currentIndex,
    isPlaying,
    setCurrentTrack,
    setQueue,
    addToQueue,
    removeFromQueue,
    clearQueue,
    playNext,
    playPrevious,
  };
};

export default useAudio;
