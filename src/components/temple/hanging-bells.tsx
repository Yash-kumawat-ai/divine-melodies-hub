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
}: {
  side: 'left' | 'right'
  onRing: () => void
}) {
  const [ringing, setRinging] = useState(false)
  const [sparks, setSparks] = useState<Spark[]>([])
  const [karma, setKarma] = useState(false)

  const ring = useCallback(() => {
    playBellChime()
    onRing()
    setRinging(true)
    setKarma(true)
    const batch: Spark[] = Array.from({ length: 9 }, () => ({
      id: sparkId++,
      angle: Math.random() * Math.PI * 2,
      dist: 28 + Math.random() * 36,
    }))
    setSparks(batch)
    setTimeout(() => setRinging(false), 1100)
    setTimeout(() => setKarma(false), 1300)
    setTimeout(() => setSparks([]), 900)
  }, [onRing])

  return (
    <button
      type="button"
      onClick={ring}
      aria-label={`Ring ${side} temple bell`}
      className={`pointer-events-auto absolute top-0 z-30 flex flex-col items-center focus-visible:outline-none ${
        side === 'left' ? 'left-[4%]' : 'right-[4%]'
      }`}
    >
      {/* Rope */}
      <span className="block h-7 w-0.5 bg-gradient-to-b from-gold/70 to-gold/30" />
      <span className="relative block">
        <img
          src="/images/bell.png"
          alt=""
          className={`h-24 w-[4.5rem] object-contain drop-shadow-[0_6px_16px_rgba(212,168,83,0.5)] sm:h-28 sm:w-20 ${
            ringing
              ? 'bell-ringing'
              : side === 'left'
                ? 'bell-idle-left'
                : 'bell-idle-right'
          }`}
          style={{ transformOrigin: 'top center' }}
        />
        {/* Golden sparks */}
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
        {/* Floating karma text */}
        {karma && (
          <span className="karma-float absolute -top-2 left-1/2 -translate-x-1/2 font-serif text-sm whitespace-nowrap text-gold">
            {'+5 🙏'}
          </span>
        )}
      </span>
    </button>
  )
}

export function HangingBells({ onRing }: { onRing: () => void }) {
  return (
    <div className="pointer-events-none absolute top-10 right-0 left-0 z-30 h-28">
      <Bell side="left" onRing={onRing} />
      <Bell side="right" onRing={onRing} />
    </div>
  )
}
