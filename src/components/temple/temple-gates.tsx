'use client'

interface TempleGatesProps {
  open: boolean
}

/**
 * Two 3D door panels rendered OUTSIDE any overflow-hidden container so they
 * are never clipped while swinging outward. Each panel shows half of the
 * golden temple door image at its native proportions.
 */
export function TempleGates({ open }: TempleGatesProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20"
      style={{ perspective: '1400px' }}
    >
      {/* Left door panel */}
      <div
        className="absolute top-0 left-0 h-full w-1/2 transition-transform ease-in-out"
        style={{
          transformOrigin: 'left center',
          transformStyle: 'preserve-3d',
          backgroundImage: 'url(/images/temple-door.webp)',
          backgroundSize: '200% 100%',
          backgroundPosition: 'left center',
          transform: open ? 'rotateY(-95deg)' : 'rotateY(0deg)',
          transitionDuration: '850ms',
          backfaceVisibility: 'hidden',
          boxShadow: open ? 'none' : '6px 0 24px rgba(0,0,0,0.6)',
        }}
      />
      {/* Right door panel */}
      <div
        className="absolute top-0 right-0 h-full w-1/2 transition-transform ease-in-out"
        style={{
          transformOrigin: 'right center',
          transformStyle: 'preserve-3d',
          backgroundImage: 'url(/images/temple-door.webp)',
          backgroundSize: '200% 100%',
          backgroundPosition: 'right center',
          transform: open ? 'rotateY(95deg)' : 'rotateY(0deg)',
          transitionDuration: '850ms',
          backfaceVisibility: 'hidden',
          boxShadow: open ? 'none' : '-6px 0 24px rgba(0,0,0,0.6)',
        }}
      />
    </div>
  )
}
