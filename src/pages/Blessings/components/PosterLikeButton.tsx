import React from "react";

// ─── POSTER LIKE BUTTON ────────────────────────────────────────────
export const PosterLikeButton = ({
  posterId,
  isLiked,
  onToggle,
}: {
  posterId: string;
  isLiked: boolean;
  onToggle: () => void;
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
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                background: i % 2 === 0 ? '#f43f5e' : '#fbbf24',
                boxShadow: i % 2 === 0 ? '0 0 6px rgba(244,63,94,0.8)' : '0 0 6px rgba(251,191,36,0.8)',
                animation: 'hk-dot-burst 0.55s cubic-bezier(0.1, 0.8, 0.3, 1) forwards',
                ['--angle' as any]: `${i * 45}deg`,
              }}
            />
          ))}
        </div>
      )}
      <button
        onClick={handleToggle}
        className="flex items-center justify-center cursor-pointer focus:outline-none transition-all duration-300"
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: isLiked ? 'rgba(244, 63, 94, 0.18)' : 'rgba(15, 7, 3, 0.65)',
          backdropFilter: 'blur(8px)',
          border: isLiked ? '1px solid rgba(244, 63, 94, 0.5)' : '1px solid rgba(251, 191, 36, 0.25)',
          boxShadow: isLiked
            ? '0 0 12px rgba(244, 63, 94, 0.4), inset 0 1px 1px rgba(255,255,255,0.1)'
            : '0 4px 10px rgba(0,0,0,0.45)',
          transform: burst ? 'scale(1.2)' : 'scale(1)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.08)';
          if (isLiked) {
            e.currentTarget.style.boxShadow = '0 0 16px rgba(244, 63, 94, 0.6), inset 0 1px 1px rgba(255,255,255,0.1)';
          } else {
            e.currentTarget.style.border = '1px solid rgba(251, 191, 36, 0.45)';
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
          if (isLiked) {
            e.currentTarget.style.boxShadow = '0 0 12px rgba(244, 63, 94, 0.4), inset 0 1px 1px rgba(255,255,255,0.1)';
          } else {
            e.currentTarget.style.border = '1px solid rgba(251, 191, 36, 0.25)';
          }
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill={isLiked ? "#f43f5e" : "none"}
          stroke={isLiked ? "#f43f5e" : "rgba(255, 255, 255, 0.9)"}
          strokeWidth="2.5"
          className={`w-4 h-4 transition-all duration-300 ${burst ? 'hk-animate-heart-bounce' : ''}`}
          style={{
            filter: isLiked ? 'drop-shadow(0 0 4px rgba(244,63,94,0.65))' : 'none',
          }}
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </button>
      <style>{`
        @keyframes hk-heart-bounce {
          0% { transform: scale(1); }
          30% { transform: scale(1.4); }
          60% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        @keyframes hk-dot-burst {
          0% {
            transform: rotate(var(--angle)) translateY(0px) scale(1);
            opacity: 1;
          }
          40% {
            opacity: 1;
          }
          100% {
            transform: rotate(var(--angle)) translateY(22px) scale(0);
            opacity: 0;
          }
        }
        .hk-animate-heart-bounce {
          animation: hk-heart-bounce 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </div>
  );
};
