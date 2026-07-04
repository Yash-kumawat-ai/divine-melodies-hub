import { useState, useRef } from 'react';
import { Share2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
}

export default function ShortsPlayer({
  videoId,
  title,
  description,
  channelName,
  channelHandle = '@bhajanmarg',
  isActive,
  liked,
  saved,
  likesCount,
  onLike,
  onSave,
  onShare,
}: ShortsPlayerProps) {
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const lastTapRef = useRef<number>(0);

  // Auto-play embed URL from youtube-nocookie.com
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=0&loop=1&playlist=${videoId}&controls=1&rel=0&modestbranding=1&iv_load_policy=3`;
  const videoUrl = `https://youtube.com/watch?v=${videoId}`;

  // Format likes count (e.g. 24500 -> 24.5K)
  const formatCount = (count: number) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count;
  };

  const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setShowHeartAnim(true);
    if (!liked) {
      onLike();
    }
    setTimeout(() => {
      setShowHeartAnim(false);
    }, 800);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_PRESS_DELAY) {
      handleDoubleTap(e);
    }
    lastTapRef.current = now;
  };

  // Helper to extract or fallback hashtags
  const getHashtags = () => {
    const defaultTags = ['#रामायण', '#भजनमार्ग', '#प्रेरणा', '#शरणागति'];
    if (!description && !title) return defaultTags;
    
    const combined = `${title} ${description || ''}`;
    const matches = combined.match(/#[A-Za-z0-9_\u0900-\u097F]+/g); // Support Hindi/Sanskrit characters in hashtags
    
    if (matches && matches.length > 0) {
      return matches.slice(0, 4);
    }
    return defaultTags;
  };

  return (
    <div 
      onDoubleClick={handleDoubleTap}
      onTouchStart={handleTouchStart}
      className="relative w-full h-full bg-[#0a0503] flex items-center justify-center overflow-hidden"
    >
      <style>{`
        @keyframes heartPop {
          0% { transform: scale(0) rotate(0deg); opacity: 0; }
          15% { transform: scale(1.3) rotate(-15deg); opacity: 0.95; }
          30% { transform: scale(0.9) rotate(10deg); opacity: 0.95; }
          80% { transform: scale(1) rotate(0deg); opacity: 0.9; }
          100% { transform: scale(1.8) translateY(-40px); opacity: 0; }
        }
        .animate-heart-pop-floating {
          animation: heartPop 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        @keyframes iconSpring {
          0% { transform: scale(1); }
          50% { transform: scale(1.35); }
          100% { transform: scale(1); }
        }
        .animate-icon-spring {
          animation: iconSpring 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>

      {/* 1. YouTube Iframe (only loaded when active) */}
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
              e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            }}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/50" />
        </div>
      )}

      {/* 2. Floating Heart Pop Animation Overlay */}
      {showHeartAnim && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <svg viewBox="0 0 24 24" className="w-28 h-28 filter drop-shadow-[0_0_30px_rgba(236,72,153,0.7)] animate-heart-pop-floating">
            <defs>
              <linearGradient id="popPinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>
            <path 
              fill="url(#popPinkGradient)" 
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
            />
          </svg>
        </div>
      )}

      {/* 3. Action Rail (Overlay right side) */}
      <div className="absolute right-3 bottom-[115px] md:bottom-20 z-30 flex flex-col items-center gap-5">
        {/* Like Button */}
        <div className="flex flex-col items-center gap-1.5 group">
          <button
            onClick={onLike}
            className={cn(
              "w-12 h-12 flex items-center justify-center rounded-full bg-black/45 hover:bg-black/65 border border-white/10 text-white backdrop-blur-md transition-all duration-300 scale-100 hover:scale-110 active:scale-95 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.5)]",
              liked && "border-pink-500/30 shadow-[0_0_12px_rgba(236,72,153,0.25)]"
            )}
          >
            <svg viewBox="0 0 24 24" className={cn("w-5.5 h-5.5 transition-transform duration-300 group-hover:scale-110", liked && "animate-icon-spring")}>
              <defs>
                <linearGradient id="pinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#f43f5e" />
                </linearGradient>
              </defs>
              <path 
                fill={liked ? "url(#pinkGradient)" : "none"} 
                stroke={liked ? "none" : "currentColor"} 
                strokeWidth="2" 
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
              />
            </svg>
          </button>
          <span className="text-[10px] font-black text-white tracking-wider drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.85)] uppercase">
            {likesCount < 10 ? 'पहला लाइक' : formatCount(likesCount)}
          </span>
        </div>

        {/* Save Button */}
        <div className="flex flex-col items-center gap-1.5 group">
          <button
            onClick={onSave}
            className={cn(
              "w-12 h-12 flex items-center justify-center rounded-full bg-black/45 hover:bg-black/65 border border-white/10 text-white backdrop-blur-md transition-all duration-300 scale-100 hover:scale-110 active:scale-95 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.5)]",
              saved && "border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
            )}
          >
            <svg viewBox="0 0 24 24" className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", saved && "animate-icon-spring")}>
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
              <path 
                fill={saved ? "url(#goldGradient)" : "none"} 
                stroke={saved ? "none" : "currentColor"} 
                strokeWidth="2" 
                d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" 
              />
            </svg>
          </button>
          <span className="text-[10px] font-black text-stone-200/90 tracking-wider drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.85)]">
            {saved ? 'सहेजा गया' : 'सहेजें'}
          </span>
        </div>

        {/* Share Button */}
        <div className="flex flex-col items-center gap-1.5 group">
          <button
            onClick={onShare}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-black/45 hover:bg-black/65 border border-white/10 text-white backdrop-blur-md transition-all duration-300 scale-100 hover:scale-110 active:scale-95 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.55)]"
          >
            <Share2 className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
          </button>
          <span className="text-[10px] font-black text-stone-200/90 tracking-wider drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.85)]">
            साझा करें
          </span>
        </div>

        {/* Watch on YouTube Button (No Background Circle Container) */}
        <div className="flex flex-col items-center gap-1.5 group">
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 flex items-center justify-center transition-all duration-300 scale-100 hover:scale-115 cursor-pointer"
          >
            <svg viewBox="0 0 461.001 461.001" className="w-10 h-10 filter drop-shadow-[0_2.5px_6px_rgba(0,0,0,0.7)] transition-transform duration-300">
              <path fill="#F61C0D" d="M365.257,67.393H95.744C42.866,67.393,0,110.259,0,163.137v134.728
                c0,52.878,42.866,95.744,95.744,95.744h269.513c52.878,0,95.744-42.866,95.744-95.744V163.137
                C461.001,110.259,418.135,67.393,365.257,67.393z M300.506,237.056l-126.06,60.123c-3.359,1.602-7.239-0.847-7.239-4.568V168.607
                c0-3.774,3.982-6.22,7.348-4.514l126.06,63.881C304.363,229.873,304.298,235.248,300.506,237.056z"/>
            </svg>
          </a>
          <span className="text-[9px] font-black text-stone-200/90 tracking-wider text-center drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.85)] leading-tight max-w-[56px]">
            पर देखें
          </span>
        </div>
      </div>

      {/* 4. Attribution & Metadata (Overlay bottom-left) */}
      <div className="absolute left-4 bottom-[75px] md:bottom-6 right-18 z-20 space-y-2 pointer-events-none">
        {/* Row 1: Channel Info with Avatar & Verified check */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Circular Channel Avatar */}
          <div className="w-9 h-9 rounded-full bg-orange-500/10 border border-orange-500/20 overflow-hidden flex items-center justify-center shadow-md">
            <span className="text-xs font-black text-orange-400 uppercase">{channelName.slice(0, 2)}</span>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-xs font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">{channelName}</span>
              {/* Saffron Checkmark Badge */}
              <span className="w-3.5 h-3.5 flex items-center justify-center rounded-full bg-orange-500 text-white text-[8px] shadow-sm">
                <Check className="w-2.5 h-2.5" strokeWidth={4} />
              </span>
            </div>
            <span className="text-[10px] font-medium text-stone-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">{channelHandle}</span>
          </div>
        </div>

        {/* Row 2: Short description (title) */}
        <h2 className="text-xs md:text-sm font-bold text-stone-100 line-clamp-2 drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.98)] leading-relaxed max-w-full">
          {title}
        </h2>

        {/* Row 3: Devotional hashtags */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {getHashtags().map((tag, i) => (
            <span 
              key={i} 
              className="px-2 py-0.5 rounded bg-black/40 text-[9px] font-bold text-orange-400/90 border border-orange-500/10 drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.8)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Subtle bottom-edge ambient shadow */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none z-0" />
    </div>
  );
}
