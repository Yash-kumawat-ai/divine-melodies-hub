export interface DailyDarshan {
  id: string;
  deity: string;
  deityHindi: string;
  imageUrl: string;
  templeName: string;
  templeNameHindi: string;
  quote: string;
  quoteHindi: string;
}

export interface DevotionalWallpaper {
  id: string;
  deity: string;
  name: string;
  nameHindi: string;
  imageUrl: string;
  tier: "free" | "devotee" | "mahabhakt";
  category: "todays" | "festival" | "suprabhat" | "quotes";
}

export interface DevotionalLiveWallpaper {
  id: string;
  deity: string;
  name: string;
  nameHindi: string;
  thumbnailUrl: string;
  effect: "petals" | "aura" | "flame" | "shimmer";
  tier: "free" | "devotee" | "mahabhakt";
  category: "todays" | "festival" | "suprabhat" | "quotes";
}

export interface Petal {
  id: number;
  x: number; // percentage
  delay: number; // seconds
  duration: number; // seconds
  size: number; // pixels
  emoji: string;
}

export interface PosterTemplate {
  id: string;
  title: string;
  titleHindi: string;
  subtitle: string;
  subtitleHindi: string;
  category: "todays" | "festival" | "good_morning";
  imageUrl: string;
  photoPosition: {
    x: number;
    y: number;
    radius: number;
  };
  namePosition: {
    x: number;
    y: number;
  };
  quote: string;
  quoteHindi: string;
  allowShapeChange?: boolean;
  defaultShape?: "circle" | "square" | "rounded-square" | "oval";
}

export interface BlessingsPosterEditorProps {
  isOpen: boolean;
  onClose: () => void;
  poster: PosterTemplate;
  userPhoto: string;
  initialZoom: number;
  initialFrameScale: number;
  initialOffsetX: number;
  initialOffsetY: number;
  initialShape: "circle" | "square" | "rounded-square" | "oval";
  initialRotation?: number;
  onSave: (settings: { zoom: number; frameScale: number; offsetX: number; offsetY: number; shape: "circle" | "square" | "rounded-square" | "oval"; rotation: number }) => void;
  language: string;
}
