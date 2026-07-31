'use client'

import { useCallback, useState } from 'react'
import { playBellChime } from '@/lib/temple-audio'

interface Spark {
  id: number
  angle: number
  dist: number
}

let sparkId = 0

function Bell({
  side,
  onRing,
  aartiActive,
}: {
  side: 'left' | 'right'
  onRing: () => void
  aartiActive?: boolean
}) {
  const [ringing, setRinging] = useState(false)
  const [sparks, setSparks] = useState<Spark[]>([])
  const [karma, setKarma] = useState(false)

  const ring = useCallback(() => {
    playBellChime()
    onRing()
    setRinging(true)
    setKarma(true)
    const batch: Spark[] = Array.from({ length: 12 }, () => ({
      id: sparkId++,
      angle: Math.random() * Math.PI * 2,
      dist: 28 + Math.random() * 48,
    }))
    setSparks(batch)
    setTimeout(() => setRinging(false), 1200)
    setTimeout(() => setKarma(false), 1400)
    setTimeout(() => setSparks([]), 1000)
  }, [onRing])

  const isRingingActive = aartiActive || ringing

  return (
    <button
      type="button"
      onClick={ring}
      aria-label={`Ring ${side} temple bell`}
      className={`pointer-events-auto absolute top-0 z-20 flex flex-col items-center focus-visible:outline-none cursor-pointer group ${
        side === 'left' ? 'left-[3%] sm:left-[5%]' : 'right-[3%] sm:right-[5%]'
      }`}
    >
      {/* Swinging / Ringing Assembly: Golden Rope + Bell */}
      <div
        className={`flex flex-col items-center ${
          isRingingActive
            ? 'bell-ring-loop'
            : side === 'left'
              ? 'bell-idle-left'
              : 'bell-idle-right'
        }`}
        style={{ transformOrigin: 'top center' }}
      >
        {/* Sleek Golden Rope starting from top-0 (Hides seamlessly behind horizontal DeityStrip bar) */}
        <span className="relative block w-[2.5px] h-44 sm:h-52 bg-gradient-to-b from-[#F2B84B] via-[#D4A853] to-[#B37E28] rounded-full z-10">
          {/* Subtle Rope Texture Accent */}
          <span className="absolute inset-0 bg-[radial-gradient(#FFF9EE_1px,transparent_1px)] [background-size:3px_5px] opacity-30" />
        </span>

        {/* Bottom Golden Connector Ring Knot Junction */}
        <span className="-mt-0.5 block h-3.5 w-3.5 rounded-full border-2 border-[#F2B84B] bg-[#D4A853] z-20" />

        {/* Prominent Larger Temple Brass Bell Image */}
        <div className="relative -mt-0.5 flex items-center justify-center">
          {/* Ambient Glow behind Bell */}
          <div
            className={`absolute inset-0 rounded-full bg-[#F2B84B]/30 blur-md transition-opacity duration-300 ${
              isRingingActive ? 'opacity-100 scale-125' : 'opacity-40 group-hover:opacity-75'
            }`}
          />

          <img
            src="/images/bell.png"
            alt="Temple Bell"
            className="h-36 w-[6.5rem] sm:h-44 sm:w-32 object-contain filter drop-shadow-[0_10px_24px_rgba(61,20,9,0.5)] transition-transform duration-200 group-hover:scale-105"
          />

          {/* Golden Sparks on Ringing */}
          {sparks.map((s) => (
            <span
              key={s.id}
              className="bell-spark absolute top-1/2 left-1/2"
              style={
                {
                  '--spark-x': `${Math.cos(s.angle) * s.dist}px`,
                  '--spark-y': `${Math.sin(s.angle) * s.dist}px`,
                } as React.CSSProperties
              }
            />
          ))}

          {/* Floating Devotional Karma Badge */}
          {karma && (
            <span className="karma-float absolute -top-4 left-1/2 -translate-x-1/2 font-serif text-sm font-bold text-[#F2B84B] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] whitespace-nowrap">
              +5 🙏
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

export function HangingBells({ onRing, aartiActive }: { onRing: () => void; aartiActive?: boolean }) {
  return (
    <div className="pointer-events-none absolute top-0 right-0 left-0 z-20 h-80 sm:h-96 overflow-visible">
      <Bell side="left" onRing={onRing} aartiActive={aartiActive} />
      <Bell side="right" onRing={onRing} aartiActive={aartiActive} />
    </div>
  )
}
