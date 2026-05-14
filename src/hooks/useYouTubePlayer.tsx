import { createContext, useContext, useState, type ReactNode } from "react";

export interface YouTubePlayerVideo {
  id: string;
  title: string;
  channel?: string;
}

interface YouTubePlayerContextValue {
  isOpen: boolean;
  video: YouTubePlayerVideo | null;
  openPlayer: (video: YouTubePlayerVideo) => void;
  closePlayer: () => void;
}

const YouTubePlayerContext = createContext<YouTubePlayerContextValue | undefined>(undefined);

export function YouTubePlayerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [video, setVideo] = useState<YouTubePlayerVideo | null>(null);

  const openPlayer = (nextVideo: YouTubePlayerVideo) => {
    setVideo(nextVideo);
    setIsOpen(true);
  };

  const closePlayer = () => {
    setIsOpen(false);
    setVideo(null);
  };

  return (
    <YouTubePlayerContext.Provider
      value={{
        isOpen,
        video,
        openPlayer,
        closePlayer,
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
