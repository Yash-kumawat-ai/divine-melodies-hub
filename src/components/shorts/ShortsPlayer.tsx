import { useState } from 'react';
import { Heart, Bookmark, Share2, Youtube, ExternalLink, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ShortsPlayerProps {
  videoId: string;
  title: string;
  channelName: string;
  isActive: boolean;
  liked: boolean;
  saved: boolean;
  likesCount: number;
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
}

export default function ShortsPlayer({
  videoId,
  title,
  channelName,
  isActive,
  liked,
  saved,
  likesCount,
  onLike,
  onSave,
  onShare,
}: ShortsPlayerProps) {
  const [muted, setMuted] = useState(false);

  // Auto-play embed URL from youtube-nocookie.com
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=${muted ? 1 : 0}&loop=1&playlist=${videoId}&controls=1&rel=0&modestbranding=1&iv_load_policy=3`;

  const videoUrl = `https://youtube.com/watch?v=${videoId}`;

  return (
    <div className="relative w-full h-full bg-[#0a0503] flex items-center justify-center overflow-hidden">
      {/* 1. YouTube Iframe (only loaded when active to prevent multiple streams) */}
      {isActive ? (
        <div className="relative w-full h-full aspect-[9/16] bg-black">
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full border-0 absolute inset-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        // Preview placeholder before active state
        <div className="relative w-full h-full bg-stone-950 flex flex-col items-center justify-center">
          <img
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt={title}
            onError={(e) => {
              // Fallback thumbnail if maxresdefault doesn't exist
              e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            }}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/50" />
        </div>
      )}

      {/* 2. Volume control toggle (superimposed on video top-right) */}
      {isActive && (
        <button
          onClick={() => setMuted(!muted)}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all active:scale-95 cursor-pointer"
        >
          {muted ? <VolumeX className="w-5 h-5 text-orange-400" /> : <Volume2 className="w-5 h-5 text-white" />}
        </button>
      )}

      {/* 3. Action Rail (Overlay right side) */}
      <div className="absolute right-3 bottom-20 z-10 flex flex-col items-center gap-4">
        {/* Like Button */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={onLike}
            className={cn(
              "p-3 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white backdrop-blur-md transition-all active:scale-90 cursor-pointer shadow-lg",
              liked && "bg-orange-500/20 text-orange-400 border-orange-500/40"
            )}
          >
            <Heart className={cn("w-6 h-6", liked && "fill-current")} />
          </button>
          <span className="text-[10px] font-bold text-white tracking-wide drop-shadow-md">
            {likesCount}
          </span>
        </div>

        {/* Save Button */}
        <button
          onClick={onSave}
          className={cn(
            "p-3 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white backdrop-blur-md transition-all active:scale-90 cursor-pointer shadow-lg",
            saved && "bg-orange-500/20 text-orange-400 border-orange-500/40"
          )}
        >
          <Bookmark className={cn("w-6 h-6", saved && "fill-current")} />
        </button>

        {/* Share Button */}
        <button
          onClick={onShare}
          className="p-3 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white backdrop-blur-md transition-all active:scale-90 cursor-pointer shadow-lg"
        >
          <Share2 className="w-6 h-6" />
        </button>
      </div>

      {/* 4. Attribution & Metadata (Overlay bottom-left) */}
      <div className="absolute left-4 bottom-4 right-16 z-10 space-y-2 pointer-events-none">
        
        {/* Safe compliant attribution chip (clickable wrapper handled via pointer-events-auto) */}
        <div className="pointer-events-auto inline-flex">
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/65 hover:bg-black/80 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-white shadow-md backdrop-blur-md transition-colors"
          >
            <Youtube className="w-4 h-4 text-red-500 fill-current" />
            <span className="max-w-[120px] truncate">{channelName}</span>
            <span className="text-orange-400">• Watch on YT</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </a>
        </div>

        {/* Short title */}
        <h2 className="text-sm md:text-base font-bold text-stone-100 line-clamp-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.98)] tracking-wide pr-4">
          {title}
        </h2>
      </div>

      {/* Subtle bottom-edge ambient shadow */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-0" />
    </div>
  );
}
