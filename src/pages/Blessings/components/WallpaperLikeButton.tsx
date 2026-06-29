import React from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export const WallpaperLikeButton = ({
  wpId,
  isLiked,
  onToggle,
  likesCount,
}: {
  wpId: string;
  isLiked: boolean;
  onToggle: () => void;
  likesCount: number;
}) => {
  const [burst, setBurst] = React.useState(false);
  const [showConfetti, setShowConfetti] = React.useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !isLiked;
    if (next) {
      setBurst(true);
      setShowConfetti(true);
      setTimeout(() => setBurst(false), 550);
      setTimeout(() => setShowConfetti(false), 600);
    }
    onToggle();
  };

  return (
    <div className="relative" style={{ userSelect: 'none' }}>
      {/* Premium circular Confetti Burst */}
      {isLiked && showConfetti && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center" style={{ zIndex: 50 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: i % 2 === 0 ? '#ffffff' : '#fbbf24',
                boxShadow: i % 2 === 0 ? '0 0 4px rgba(255,255,255,0.8)' : '0 0 4px rgba(255,191,36,0.8)',
                animation: 'wp-dot-burst 0.55s cubic-bezier(0.1, 0.8, 0.3, 1) forwards',
                ['--angle' as any]: `${i * 45}deg`,
              }}
            />
          ))}
        </div>
      )}
      <button
        onClick={handleToggle}
        className="flex items-center gap-1.5 text-white filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] active:scale-95 transition-all duration-300 focus:outline-none cursor-pointer"
        style={{
          transform: burst ? 'scale(1.25)' : 'scale(1)',
        }}
      >
        <Heart
          className={cn(
            "w-4 h-4 transition-all duration-300",
            isLiked
              ? "fill-white text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.75)]"
              : "text-white/85 hover:text-white"
          )}
          style={{
            animation: burst ? 'wp-heart-bounce 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' : 'none'
          }}
        />
        <span className="text-[10px] font-sans font-black tracking-wide">
          {likesCount}
        </span>
      </button>
      <style>{`
        @keyframes wp-heart-bounce {
          0% { transform: scale(1); }
          30% { transform: scale(1.4); }
          60% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        @keyframes wp-dot-burst {
          0% {
            transform: rotate(var(--angle)) translateY(0px) scale(1);
            opacity: 1;
          }
          40% {
            opacity: 1;
          }
          100% {
            transform: rotate(var(--angle)) translateY(18px) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
