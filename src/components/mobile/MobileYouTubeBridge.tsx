import { useEffect, useRef } from "react";
import { loadYouTubeIframeApi } from "@/lib/loadYouTubeIframeApi";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";

const PLAYER_DIV_ID = "mobile-youtube-player-host";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type YtPlayer = any;

export default function MobileYouTubeBridge() {
  const { video, registerBridge, useMobileEmbed, updatePlayback } = useYouTubePlayer();
  const playerRef = useRef<YtPlayer | null>(null);
  const videoIdRef = useRef<string | null>(null);
  const creatingRef = useRef(false);

  useEffect(() => {
    if (!useMobileEmbed) {
      registerBridge(null);
      return;
    }

    let cancelled = false;

    const attachBridge = () => {
      const p = playerRef.current;
      if (!p) return;
      registerBridge({
        play: () => p.playVideo?.(),
        pause: () => p.pauseVideo?.(),
        seekTo: (seconds: number) => p.seekTo?.(seconds, true),
        getCurrentTime: () => p.getCurrentTime?.() ?? 0,
        getDuration: () => p.getDuration?.() ?? 0,
      });
    };

    loadYouTubeIframeApi().then((YT) => {
      if (cancelled) return;

      if (playerRef.current || creatingRef.current) {
        attachBridge();
        return;
      }

      creatingRef.current = true;
      playerRef.current = new YT.Player(PLAYER_DIV_ID, {
        height: "0",
        width: "0",
        playerVars: {
          playsinline: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            creatingRef.current = false;
            updatePlayback({ isReady: true, duration: playerRef.current?.getDuration?.() ?? 0 });
            attachBridge();
            if (video?.id) {
              playerRef.current?.loadVideoById?.(video.id);
              videoIdRef.current = video.id;
            }
          },
          onStateChange: (e: { data: number }) => {
            const playing = e.data === 1;
            updatePlayback({
              isPlaying: playing,
              isReady: true,
              duration: playerRef.current?.getDuration?.() ?? 0,
            });
          },
        },
      });
    });

    return () => {
      cancelled = true;
      registerBridge(null);
    };
  }, [useMobileEmbed, registerBridge, updatePlayback, video?.id]);

  useEffect(() => {
    if (!useMobileEmbed || !video?.id || !playerRef.current?.loadVideoById) return;
    if (videoIdRef.current === video.id) return;
    videoIdRef.current = video.id;
    playerRef.current.loadVideoById(video.id);
    updatePlayback({ isPlaying: true, currentTime: 0 });
  }, [video?.id, useMobileEmbed, updatePlayback]);

  if (!useMobileEmbed) return null;

  return (
    <div
      id={PLAYER_DIV_ID}
      className="pointer-events-none fixed left-0 top-0 h-px w-px overflow-hidden opacity-0"
      aria-hidden
    />
  );
}
