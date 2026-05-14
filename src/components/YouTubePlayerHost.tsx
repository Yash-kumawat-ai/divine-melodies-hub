import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import { buildYouTubeEmbedUrl } from "@/lib/youtubeSearch";

export default function YouTubePlayerHost() {
  const { isOpen, video, closePlayer } = useYouTubePlayer();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closePlayer()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {video?.title || "YouTube Playback"}
          </DialogTitle>
          {video?.channel ? (
            <p className="text-sm text-muted-foreground">{video.channel}</p>
          ) : null}
        </DialogHeader>
        <div className="aspect-video w-full overflow-hidden rounded-lg border border-border bg-black">
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
      </DialogContent>
    </Dialog>
  );
}
