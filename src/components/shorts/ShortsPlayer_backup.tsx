import { useState, useRef, useEffect, useCallback } from 'react';
import { Heart, MessageCircle, Bookmark, Check, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import youtubeIcon from '@/pages/images/youtube-svgrepo-com.svg';
import telegramIcon from '@/pages/images/telegram-svgrepo-com.svg';

interface ShortsPlayerProps {
  videoId: string;
  title: string;
  description?: string;
  channelName: string;
  channelHandle?: string;
  isActive: boolean;
  liked: boolean;
  saved: boolean;
  likesCount: number;
  commentsCount?: number;
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
}

export default function ShortsPlayer({
  videoId,
  title,
  description,
  channelName,
  channelHandle = '@creator',
  isActive,
  liked,
  saved,
  likesCount,
  commentsCount = 0,
  onLike,
  onSave,
  onShare,
}: ShortsPlayerProps) {
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playPauseAnim, setPlayPauseAnim] = useState<{ show: boolean; isPlay: boolean }>({ show: false, isPlay: true });
  const [progress, setProgress] = useState(5);
  const [currentTime, setCurrentTime] = useState(3);
  const [isDragging, setIsDragging] = useState(false);
  const duration = 59;
  
  const lastTapRef = useRef<number>(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const progressTrackRef = useRef<HTMLDivElement>(null);

  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&autoplay=1&mute=0&loop=1&playlist=${videoId}&controls=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&playsinline=1`;
  const videoUrl = `https://youtube.com/watch?v=${videoId}`;

  // Helper to post seekTo command to YouTube iframe
  const seekToTime = useCallback((targetSeconds: number) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'seekTo', args: [targetSeconds, true] }),
        '*'
      );
    }
  }, []);

  // Handle seeking based on click/drag X position
  const handleSeek = useCallback((clientX: number) => {
    if (!progressTrackRef.current) return;
    const rect = progressTrackRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    setProgress(percentage);
    const targetSeconds = (percentage / 100) * duration;
    setCurrentTime(targetSeconds);
    seekToTime(targetSeconds);
  }, [duration, seekToTime]);

  // Handle global mouse move/up during dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleDragMove = (e: MouseEvent) => {
      handleSeek(e.clientX);
    };

    const handleDragTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleSeek(e.touches[0].clientX);
      }
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleDragTouchMove);
    window.addEventListener('touchend', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleSeek]);

  // Auto-increment timer when playing and active
  useEffect(() => {
    if (!isActive || isDragging || !isPlaying) {
      if (!isActive) {
        setProgress(0);
        setCurrentTime(0);
        setIsPlaying(true);
      }
      return;
    }

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 1;
        if (next >= duration) {
          return 0;
        }
        setProgress((next / duration) * 100);
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, duration, isDragging, isPlaying]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count;
  };

  const handleDoubleTap = () => {
    setShowHeartAnim(true);
    if (!liked) {
      onLike();
    }
    setTimeout(() => {
      setShowHeartAnim(false);
    }, 800);
  };

  // Handle single tap for play/pause with animation, double tap for like
  const handleContainerClick = (e: React.MouseEvent) => {
    // If target is inside interactive controls, skip video tap toggle
    const target = e.target as HTMLElement;
    if (target.closest('.pointer-events-auto') || target.closest('button') || target.closest('a')) {
      return;
    }

    const now = Date.now();
    const DOUBLE_TAP_DELAY = 280;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
      handleDoubleTap();
      lastTapRef.current = 0;
      return;
    }

    lastTapRef.current = now;

    clickTimeoutRef.current = setTimeout(() => {
      setIsPlaying((prev) => {
        const nextState = !prev;
        if (iframeRef.current && iframeRef.current.contentWindow) {
          const func = nextState ? 'playVideo' : 'pauseVideo';
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: func, args: [] }),
            '*'
          );
        }
        setPlayPauseAnim({ show: true, isPlay: nextState });
        setTimeout(() => {
          setPlayPauseAnim({ show: false, isPlay: nextState });
        }, 650);
        return nextState;
      });
    }, DOUBLE_TAP_DELAY);
  };

  return (
    <div 
      onClick={handleContainerClick}
      className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden cursor-pointer select-none"
    >
      {/* Fullscreen Video / Embed */}
      {isActive ? (
        <div className="relative w-full h-full bg-black overflow-hidden pointer-events-none">
          <iframe
            ref={iframeRef}
            src={embedUrl}
            title={title}
            className="w-full h-full border-0 absolute inset-0 object-cover scale-[1.25] origin-center pointer-events-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          {/* Paused state cover overlay to cover YouTube's native 3 icons (prev, play, next) */}
          {!isPlaying && (
            <img
              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
              alt={title}
              onError={(e) => {
                e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
              }}
              className="w-full h-full object-cover absolute inset-0 z-20 pointer-events-none"
            />
          )}
        </div>
      ) : (
        <div className="relative w-full h-full bg-black flex flex-col items-center justify-center overflow-hidden pointer-events-none">
          <img
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt={title}
            onError={(e) => {
              e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            }}
            className="w-full h-full object-cover opacity-70"
          />
        </div>
      )}

      {/* Light gradient overlays at top and bottom so video is clearly visible */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none z-10" />

      {/* Double tap heart pop overlay */}
      {showHeartAnim && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <Heart className="w-24 h-24 text-[#6b1d1d] fill-[#6b1d1d] animate-ping" />
        </div>
      )}

      {/* Single tap Play/Pause pop animation overlay */}
      {playPauseAnim.show && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white border border-white/20 animate-play-pause-pop">
            {playPauseAnim.isPlay ? (
              <Play className="w-8 h-8 fill-white translate-x-0.5" />
            ) : (
              <Pause className="w-8 h-8 fill-white" />
            )}
          </div>
        </div>
      )}

      {/* RIGHT ACTION RAIL (5 Outline Icons - Clean Without Drop Shadows) */}
      <div className="absolute right-4 bottom-[140px] z-30 flex flex-col items-center gap-3.5">
        {/* 1. Like */}
        <div className="flex flex-col items-center gap-0.5 pointer-events-auto">
          <button
            onClick={onLike}
            className="p-1.5 focus:outline-none transition-transform active:scale-90 cursor-pointer"
            aria-label="Like"
          >
            <Heart 
              className={cn(
                "w-7 h-7 stroke-[1.8] transition-colors",
                liked ? "fill-red-500 stroke-red-500" : "stroke-white fill-none"
              )} 
            />
          </button>
          <span className="text-[12px] font-medium text-white">
            {formatCount(likesCount)}
          </span>
        </div>

        {/* 2. Comment */}
        <div className="flex flex-col items-center gap-0.5">
          <button
            className="p-1.5 focus:outline-none transition-transform active:scale-90 cursor-pointer"
            aria-label="Comment"
          >
            <MessageCircle className="w-7 h-7 stroke-[1.8] stroke-white fill-none" />
          </button>
          <span className="text-[12px] font-medium text-white">
            {formatCount(commentsCount)}
          </span>
        </div>

        {/* 3. Save */}
        <div className="flex flex-col items-center gap-0.5">
          <button
            onClick={onSave}
            className="p-1.5 focus:outline-none transition-transform active:scale-90 cursor-pointer"
            aria-label="Save"
          >
            <Bookmark 
              className={cn(
                "w-7 h-7 stroke-[1.8] transition-colors",
                saved ? "fill-white stroke-white" : "stroke-white fill-none"
              )} 
            />
          </button>
          <span className="text-[11px] font-medium text-white">
            {saved ? 'à¤¸à¤¹à¥‡à¤œà¤¾ à¤—à¤¯à¤¾' : 'à¤¸à¥‡à¤µ à¤•à¤°à¥‡à¤‚'}
          </span>
        </div>

        {/* 4. Share (Telegram SVG Icon with white text) */}
        <div className="flex flex-col items-center gap-0.5">
          <button
            onClick={onShare}
            className="p-1.5 focus:outline-none transition-transform active:scale-90 cursor-pointer"
            aria-label="Share"
          >
            <img
              src={telegramIcon}
              alt="Share"
              className="w-7 h-7 object-contain"
            />
          </button>
          <span className="text-[11px] font-medium text-white">
            à¤¶à¥‡à¤¯à¤° à¤•à¤°à¥‡à¤‚
          </span>
        </div>

        {/* 5. Watch on YouTube */}
        <div className="flex flex-col items-center gap-0.5">
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 focus:outline-none transition-transform active:scale-90 cursor-pointer"
            aria-label="Watch on YouTube"
          >
            <img
              src={youtubeIcon}
              alt="Watch on YouTube"
              className="w-7 h-7 object-contain"
            />
          </a>
          <span className="text-[10px] font-medium text-white text-center leading-tight">`n            `u{092F}`u{0942}`u{091F}`u{094D}`u{092F}`u{0942}`u{092C} `u{092A}`u{0930} `u{0926}`u{0947}`u{0916}`u{0947}`u{0902}`n          </span>
        </div>
      </div>`n{/* BOTTOM LEFT CONTENT */}
      <div className="absolute left-4 bottom-[138px] right-20 z-30 flex flex-col gap-2 pointer-events-none">
        {/* Creator Info */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 text-white text-xs flex items-center justify-center font-semibold uppercase">
            {channelName.slice(0, 2)}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                {channelName}
              </span>
              <span className="w-3.5 h-3.5 flex items-center justify-center rounded-full bg-white text-black text-[8px]">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
            </div>
            <span className="text-[10px] font-medium text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
              {channelHandle}
            </span>
          </div>
        </div>
      </div>

      {/* DRAGGABLE & CLICKABLE PROGRESS BAR */}
      <div className="absolute left-4 right-4 bottom-[98px] z-30 flex items-center gap-2.5 select-none">
        <span className="text-[11px] font-mono text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] shrink-0">
          {formatTime(currentTime)}
        </span>

        {/* Clickable & Draggable Track Area */}
        <div 
          ref={progressTrackRef}
          onMouseDown={(e) => {
            setIsDragging(true);

