import { Download, Heart, Pause, Play, RotateCcw, RotateCw, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function MobileTopPlayer() {
  const { video, playback, togglePlay, seek, skip } = useYouTubePlayer();
  const hasTrack = Boolean(video);
  const progressPct =
    playback.duration > 0 ? Math.min(100, (playback.currentTime / playback.duration) * 100) : 0;

  const handleProgressChange = (value: number) => {
    if (playback.duration <= 0) return;
    seek((value / 100) * playback.duration);
  };

  const handleShare = async () => {
    if (!video) return;
    const url = `https://www.youtube.com/watch?v=${video.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.info(url);
    }
  };

  if (!hasTrack) {
    return (
      <header className="mobile-top-player relative shrink-0 border-b border-white/5 bg-[#0A0A0A] px-4 py-3 md:hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-30%,rgba(255,159,28,0.2),transparent_55%)]"
        />
        <p className="relative z-10 text-center text-sm text-white/45">Select a bhajan to play</p>
      </header>
    );
  }

  return (
    <header className="mobile-top-player relative shrink-0 overflow-hidden border-b border-white/10 bg-[#0A0A0A] px-4 pb-3 pt-2 md:hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(255,159,28,0.32),transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-24 w-24 -translate-x-1/2 rounded-full bg-[#FFB300]/15 blur-3xl"
      />

      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-3 flex items-center gap-4">
          <button
            type="button"
            aria-label="Rewind 10 seconds"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/75 backdrop-blur-sm active:scale-95"
            onClick={() => skip(-10)}
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            type="button"
            aria-label={playback.isPlaying ? "Pause" : "Play"}
            disabled={!playback.isReady}
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#FF9F1C] to-[#FFB300] text-[#0A0A0A] shadow-[0_0_28px_rgba(255,179,0,0.5)] transition-transform active:scale-95 disabled:opacity-60",
              playback.isPlaying && "shadow-[0_0_36px_rgba(255,179,0,0.65)]",
            )}
            onClick={togglePlay}
          >
            {playback.isPlaying ? (
              <Pause className="h-6 w-6 fill-current" />
            ) : (
              <Play className="h-6 w-6 fill-current pl-0.5" />
            )}
          </button>

          <button
            type="button"
            aria-label="Forward 10 seconds"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/75 backdrop-blur-sm active:scale-95"
            onClick={() => skip(10)}
          >
            <RotateCw className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-2 w-full px-1">
          <input
            type="range"
            min={0}
            max={100}
            value={progressPct}
            disabled={!playback.isReady || playback.duration <= 0}
            onChange={(e) => handleProgressChange(Number(e.target.value))}
            aria-label="Playback progress"
            className="mobile-player-range h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10"
            style={{
              background: `linear-gradient(to right, #FFB300 0%, #FF9F1C ${progressPct}%, rgba(255,255,255,0.1) ${progressPct}%, rgba(255,255,255,0.1) 100%)`,
            }}
          />
          <div className="mt-1 flex justify-between text-[10px] font-medium tabular-nums text-white/45">
            <span>{formatTime(playback.currentTime)}</span>
            <span>{formatTime(playback.duration)}</span>
          </div>
        </div>

        <div className="w-full text-center">
          <h1 className="hindi-text line-clamp-2 text-sm font-bold leading-snug text-white">
            {video?.title}
          </h1>
          {video?.channel ? (
            <p className="mt-0.5 text-[11px] font-semibold tracking-wide text-[#FFB300]">{video.channel}</p>
          ) : null}
        </div>

        <div className="mt-3 flex w-full max-w-sm gap-2">
          {[
            { label: "Like", icon: Heart, onClick: () => toast.info("Coming soon") },
            { label: "Share", icon: Share2, onClick: handleShare },
            { label: "Download", icon: Download, onClick: () => toast.info("Download coming soon") },
          ].map(({ label, icon: Icon, onClick }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              className="flex flex-1 flex-col items-center gap-0.5 rounded-lg bg-white/5 py-2 text-[10px] font-medium text-white/65 backdrop-blur-sm active:scale-95"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
