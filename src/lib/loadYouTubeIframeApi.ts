declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
        options: Record<string, unknown>,
      ) => {
        playVideo?: () => void;
        pauseVideo?: () => void;
        seekTo?: (seconds: number, allowSeekAhead: boolean) => void;
        getCurrentTime?: () => number;
        getDuration?: () => number;
        loadVideoById?: (videoId: string) => void;
        destroy?: () => void;
      };
      PlayerState?: { PLAYING: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

type YouTubeIframeApi = NonNullable<Window["YT"]>;

let loadPromise: Promise<YouTubeIframeApi> | null = null;

export function loadYouTubeIframeApi(): Promise<YouTubeIframeApi> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube IFrame API is not available during SSR"));
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>('script[src*="youtube.com/iframe_api"]');
      if (!existing) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        tag.async = true;
        document.head.appendChild(tag);
      }

      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousReady?.();
        if (window.YT?.Player) {
          resolve(window.YT);
        } else {
          reject(new Error("YouTube IFrame API failed to initialize"));
        }
      };

      window.setTimeout(() => {
        if (window.YT?.Player) {
          resolve(window.YT);
        }
      }, 8000);
    });
  }

  return loadPromise;
}
