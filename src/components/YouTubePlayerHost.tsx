import { ArrowLeft, Music2 } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import { useLanguage } from "@/hooks/useLanguage";
import { mobileFullscreenDialog } from "@/lib/dialogStyles";
import { buildYouTubeEmbedUrl } from "@/lib/youtubeSearch";
import { cn } from "@/lib/utils";
import devotionalHeroBg from "@/pages/images/devotional_background_high_quality(1).webp";

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
          "!flex !flex-col !min-h-0 !gap-0 !overflow-hidden border-border bg-[#FAF6F0] dark:bg-[#120E0A] p-0 text-foreground sm:max-w-4xl",
        )}
      >
        {/* Devotional background overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-25 dark:opacity-15 bg-cover bg-right-top"
          style={{ backgroundImage: `url(${devotionalHeroBg})` }}
        />

        {/* Top Header Bar */}
        <div className="relative z-10 flex shrink-0 items-center gap-3 border-b border-[#E8D8C4]/60 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 px-3.5 py-3 pt-[max(0.6rem,env(safe-area-inset-top))] backdrop-blur-md sm:px-4 sm:py-3.5">
          <DialogClose
            type="button"
            aria-label={t("back")}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-white/90 dark:bg-zinc-800/90 text-foreground shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </DialogClose>

          <div className="min-w-0 flex-1 text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#7A2D28] dark:text-[#E8B15C]">
              NOW PLAYING
            </p>
            <DialogTitle className="mt-0.5 font-serif text-sm font-bold leading-snug text-[#32251E] dark:text-[#FFFDF8] line-clamp-1 sm:text-base">
              {video?.title || "Bhajan Playback"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {video?.title || "Bhajan video player modal"}
            </DialogDescription>
          </div>
        </div>

        {/* Body Content */}
        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain p-3.5 sm:p-6">
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            {/* Now Playing Bhajan Card (Light Devotional Style) */}
            <div className="flex items-center gap-3.5 rounded-2xl border border-[#E8D8C4] dark:border-zinc-800 bg-card p-3 shadow-sm select-none sm:p-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-amber-500/10 shadow-sm border border-border sm:h-20 sm:w-20">
                {thumbnailUrl ? (
                  <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Music2 className="h-7 w-7 text-[#7A2D28] dark:text-[#E8B15C]" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <span className="inline-block rounded-full bg-[#7A2D28]/10 dark:bg-[#E8B15C]/15 border border-[#7A2D28]/20 dark:border-[#E8B15C]/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#7A2D28] dark:text-[#E8B15C] mb-1">
                  BHAJAN
                </span>
                <h2 className="line-clamp-2 text-sm sm:text-base font-bold leading-snug text-foreground">
                  {video?.title || "Bhajan Playback"}
                </h2>
                {video?.channel ? (
                  <p className="mt-1 truncate text-xs font-medium text-muted-foreground">{video.channel}</p>
                ) : null}
              </div>
            </div>

            {/* YouTube Video Player Iframe */}
            <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border/80 bg-black shadow-lg">
              {video ? (
                <iframe
                  src={buildYouTubeEmbedUrl(video.id)}
                  title={`YouTube player for ${video.title}`}
                  className="h-full w-full border-0"
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
