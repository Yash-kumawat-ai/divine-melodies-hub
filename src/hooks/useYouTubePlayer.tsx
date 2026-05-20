import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface YouTubePlayerVideo {
  id: string;
  title: string;
  channel?: string;
}

export interface PlaybackState {
  isPlaying: boolean;
  isReady: boolean;
  currentTime: number;
  duration: number;
}

export interface PlayerBridge {
  play: () => void;
  pause: () => void;
  seekTo: (seconds: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
}

interface YouTubePlayerContextValue {
  isOpen: boolean;
  video: YouTubePlayerVideo | null;
  playback: PlaybackState;
  useMobileEmbed: boolean;
  openPlayer: (video: YouTubePlayerVideo) => void;
  closePlayer: () => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  skip: (delta: number) => void;
  registerBridge: (bridge: PlayerBridge | null) => void;
  updatePlayback: (patch: Partial<PlaybackState>) => void;
}

const defaultPlayback: PlaybackState = {
  isPlaying: false,
  isReady: false,
  currentTime: 0,
  duration: 0,
};

const YouTubePlayerContext = createContext<YouTubePlayerContextValue | undefined>(undefined);

function isMobileAppShellActive() {
  return (
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("mobile-app-shell")
  );
}

export function YouTubePlayerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [video, setVideo] = useState<YouTubePlayerVideo | null>(null);
  const [playback, setPlayback] = useState<PlaybackState>(defaultPlayback);
  const [useMobileEmbed, setUseMobileEmbed] = useState(false);
  const bridgeRef = useRef<PlayerBridge | null>(null);

  const updatePlayback = useCallback((patch: Partial<PlaybackState>) => {
    setPlayback((prev) => ({ ...prev, ...patch }));
  }, []);

  const registerBridge = useCallback((bridge: PlayerBridge | null) => {
    bridgeRef.current = bridge;
  }, []);

  const openPlayer = useCallback((nextVideo: YouTubePlayerVideo) => {
    setVideo(nextVideo);
    const mobileShell = isMobileAppShellActive();
    if (mobileShell) {
      setUseMobileEmbed(true);
      setIsOpen(false);
      setPlayback({
        isPlaying: true,
        isReady: false,
        currentTime: 0,
        duration: 0,
      });
      return;
    }
    setUseMobileEmbed(false);
    setIsOpen(true);
  }, []);

  const closePlayer = useCallback(() => {
    setIsOpen(false);
    setVideo(null);
    setUseMobileEmbed(false);
    setPlayback(defaultPlayback);
    bridgeRef.current = null;
  }, []);

  const togglePlay = useCallback(() => {
    const bridge = bridgeRef.current;
    if (!bridge) return;
    if (playback.isPlaying) {
      bridge.pause();
      updatePlayback({ isPlaying: false });
    } else {
      bridge.play();
      updatePlayback({ isPlaying: true });
    }
  }, [playback.isPlaying, updatePlayback]);

  const seek = useCallback(
    (seconds: number) => {
      bridgeRef.current?.seekTo(seconds);
      updatePlayback({ currentTime: seconds });
    },
    [updatePlayback],
  );

  const skip = useCallback(
    (delta: number) => {
      const bridge = bridgeRef.current;
      if (!bridge) return;
      const next = Math.max(0, bridge.getCurrentTime() + delta);
      bridge.seekTo(next);
      updatePlayback({ currentTime: next });
    },
    [updatePlayback],
  );

  useEffect(() => {
    if (!useMobileEmbed || !playback.isPlaying) return;
    const id = window.setInterval(() => {
      const bridge = bridgeRef.current;
      if (!bridge) return;
      updatePlayback({
        currentTime: bridge.getCurrentTime(),
        duration: bridge.getDuration() || playback.duration,
      });
    }, 500);
    return () => window.clearInterval(id);
  }, [useMobileEmbed, playback.isPlaying, playback.duration, updatePlayback]);

  return (
    <YouTubePlayerContext.Provider
      value={{
        isOpen,
        video,
        playback,
        useMobileEmbed,
        openPlayer,
        closePlayer,
        togglePlay,
        seek,
        skip,
        registerBridge,
        updatePlayback,
      }}
    >
      {children}
    </YouTubePlayerContext.Provider>
  );
}

export function useYouTubePlayer() {
  const context = useContext(YouTubePlayerContext);
  if (!context) {
    throw new Error("useYouTubePlayer must be used within YouTubePlayerProvider");
  }
  return context;
}
