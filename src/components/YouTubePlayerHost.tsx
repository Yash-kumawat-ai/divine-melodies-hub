import { ArrowLeft } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import { useLanguage } from "@/hooks/useLanguage";
import { mobileFullscreenDialog } from "@/lib/dialogStyles";
import { buildYouTubeEmbedUrl } from "@/lib/youtubeSearch";
import { cn } from "@/lib/utils";

export default function YouTubePlayerHost() {
  const { isOpen, video, closePlayer } = useYouTubePlayer();
  const { t } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closePlayer()}>
      <DialogContent
        showClose={false}
        className={cn(
          mobileFullscreenDialog,
          "!flex !flex-col !min-h-0 !gap-0 !overflow-hidden p-0 sm:max-w-3xl",
        )}
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-border bg-card/95 px-3 py-2.5 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur-md supports-[backdrop-filter]:bg-card/80 sm:px-4 sm:py-3">
          <DialogClose
            type="button"
            aria-label={t("back")}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-primary/10 text-primary shadow-sm transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-target"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.25} />
          </DialogClose>

          <div className="min-w-0 flex-1 pr-1 text-left">
            <DialogTitle className="font-display text-sm font-semibold leading-snug text-foreground line-clamp-2 sm:text-lg">
              {video?.title || "YouTube Playback"}
            </DialogTitle>
            {video?.channel ? (
              <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">{video.channel}</p>
            ) : null}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
          <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-black shadow-inner">
            {video ? (
              <iframe
                src={buildYouTubeEmbedUrl(video.id)}
                title={`YouTube player for ${video.title}`}
                className="h-full w-full"
                sandbox="allow-scripts allow-same-origin allow-presentation"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
