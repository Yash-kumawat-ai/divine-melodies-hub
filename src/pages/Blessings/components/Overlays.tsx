// ─── LIVE WALLPAPERS PARTICLE OVERLAYS ────────────────────────────
// Stateless overlay components. No props, no side effects.

export const PetalsOverlay = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute text-sm select-none"
          style={{
            left: `${15 + i * 16}%`,
            top: `-20px`,
            animation: `fall linear infinite`,
            animationDelay: `${i * 1.5}s`,
            animationDuration: `${5 + i * 2}s`,
            opacity: 0.8
          }}
        >
          🌸
        </div>
      ))}
    </div>
  );
};

export const AuraOverlay = () => {
  return (
    <div
      className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.22)_0%,transparent_70%)] pointer-events-none z-10 animate-pulse"
      style={{ animationDuration: "3s" }}
    />
  );
};

export const FlameOverlay = () => {
  return (
    <div
      className="absolute inset-x-0 bottom-0 top-[40%] bg-gradient-to-t from-orange-500/15 via-orange-500/5 to-transparent pointer-events-none z-10 animate-pulse"
      style={{ animationDuration: "1.2s" }}
    />
  );
};

export const ShimmerOverlay = () => {
  return (
    <div
      className="absolute inset-0 bg-[linear-gradient(45deg,transparent_20%,rgba(255,255,255,0.08)_50%,transparent_80%)] pointer-events-none z-10 bg-[length:200%_200%] animate-shimmer"
      style={{ animationDuration: "2.5s" }}
    />
  );
};
