import { ArrowLeft, Music2 } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import { useLanguage } from "@/hooks/useLanguage";
import { mobileFullscreenDialog } from "@/lib/dialogStyles";
import { buildYouTubeEmbedUrl } from "@/lib/youtubeSearch";
import { cn } from "@/lib/utils";

function getThumbnailUrl(videoId?: string) {
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : "";
}

export default function YouTubePlayerHost() {
  const { isOpen, video, closePlayer } = useYouTubePlayer();
  const { t } = useLanguage();
  const thumbnailUrl = getThumbnailUrl(video?.id);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closePlayer()}>
      <DialogContent
        showClose={false}
        overlayClassName="z-[160]"
        className={cn(
          mobileFullscreenDialog,
          "!z-[161]",
          "!flex !flex-col !min-h-0 !gap-0 !overflow-hidden border-white/10 bg-[#0A0A0A] p-0 text-white sm:max-w-4xl",
        )}
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-3xl"
          />
        ) : null}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(255,179,0,0.3),transparent_42%),linear-gradient(180deg,rgba(10,10,10,0.72),#0A0A0A_48%,#050505)]"
        />

        <div className="relative z-10 flex shrink-0 items-center gap-3 border-b border-white/10 bg-black/35 px-3 py-2.5 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur-xl sm:px-4 sm:py-3">
          <DialogClose
            type="button"
            aria-label={t("back")}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white shadow-sm transition-colors hover:bg-white hover:text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 touch-target"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.25} />
          </DialogClose>

          <div className="min-w-0 flex-1 pr-1 text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#FFB300]">Now Playing</p>
            <DialogTitle className="mt-0.5 font-display text-sm font-semibold leading-snug text-white line-clamp-2 sm:text-lg">
              {video?.title || "Bhajan Playback"}
            </DialogTitle>
          </div>
        </div>

        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-3 shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.35)] sm:h-20 sm:w-20">
                {thumbnailUrl ? (
                  <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Music2 className="h-7 w-7 text-[#FFB300]" />
                  </div>
                )}
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="mb-1 inline-flex rounded-full bg-[#FFB300]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#FFB300]">
                  Bhajan
                </p>
                <h2 className="line-clamp-2 text-base font-bold leading-snug text-white sm:text-xl">
                  {video?.title || "Bhajan Playback"}
                </h2>
                {video?.channel ? (
                  <p className="mt-1 truncate text-xs font-medium text-white/55 sm:text-sm">{video.channel}</p>
                ) : null}
              </div>
            </div>

          <div className="aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            {video ? (
              <iframe
                src={buildYouTubeEmbedUrl(video.id)}
                title={`YouTube player for ${video.title}`}
                className="h-full w-full"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : null}
          </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
