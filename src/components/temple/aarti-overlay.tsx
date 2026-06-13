'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '@/lib/i18n'
import {
  playAartiTick,
  playAartiComplete,
  playBellChime,
} from '@/lib/temple-audio'

const ROTATIONS_NEEDED = 3
const FULL_TURN = Math.PI * 2
/** radians per second — one full round takes ~2.4s */
const SPEED = FULL_TURN / 2.4

/**
 * Auto-rotating ritual orbit: when opened, the ritual item (aarti thali or
 * diya) rises up and automatically circles the deity 3 times, with a tick
 * and glow pulse every quarter turn, finishing in a golden burst.
 */
export function AartiOverlay({
  open,
  image,
  onProgress,
  onComplete,
  onClose,
}: {
  open: boolean
  /** image of the orbiting item — aarti thali or diya */
  image: string
  /** called every quarter turn — pulse the deity glow */
  onProgress: () => void
  /** called once after 3 full rotations */
  onComplete: () => void
  onClose: () => void
}) {
  const { t } = useLang()
  const rafRef = useRef<number | null>(null)
  const angleRef = useRef(Math.PI / 2)
  const accumulatedRef = useRef(0)
  const lastQuarterRef = useRef(0)
  const completedRef = useRef(false)
  const lastTimeRef = useRef<number | null>(null)

  const [plateAngle, setPlateAngle] = useState(Math.PI / 2)
  const [rounds, setRounds] = useState(0)
  const [finishing, setFinishing] = useState(false)

  // Keep latest callbacks without restarting the loop
  const onProgressRef = useRef(onProgress)
  const onCompleteRef = useRef(onComplete)
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onProgressRef.current = onProgress
    onCompleteRef.current = onComplete
    onCloseRef.current = onClose
  })

  // Auto-rotation loop
  useEffect(() => {
    if (!open) return
    // reset
    angleRef.current = Math.PI / 2
    accumulatedRef.current = 0
    lastQuarterRef.current = 0
    completedRef.current = false
    lastTimeRef.current = null
    setPlateAngle(Math.PI / 2)
    setRounds(0)
    setFinishing(false)

    // brief pause while the plate rises in, then begin orbiting
    let started = false
    const startDelay = setTimeout(() => {
      started = true
    }, 650)

    const tick = (time: number) => {
      if (completedRef.current) return
      if (started) {
        if (lastTimeRef.current !== null) {
          const dt = (time - lastTimeRef.current) / 1000
          angleRef.current += SPEED * dt
          accumulatedRef.current += SPEED * dt
          setPlateAngle(angleRef.current)

          const quarter = Math.floor(accumulatedRef.current / (Math.PI / 2))
          if (quarter > lastQuarterRef.current) {
            lastQuarterRef.current = quarter
            playAartiTick()
            onProgressRef.current()
            setRounds(Math.floor(accumulatedRef.current / FULL_TURN))
          }

          if (accumulatedRef.current >= ROTATIONS_NEEDED * FULL_TURN) {
            completedRef.current = true
            setRounds(ROTATIONS_NEEDED)
            setFinishing(true)
            playAartiComplete()
            playBellChime()
            onCompleteRef.current()
            setTimeout(() => onCloseRef.current(), 1400)
            return
          }
        }
        lastTimeRef.current = time
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      clearTimeout(startDelay)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [open])

  const orbitRadius =
    typeof window !== 'undefined'
      ? Math.min(window.innerWidth * 0.34, 170)
      : 140
  const plateX = Math.cos(plateAngle) * orbitRadius
  const plateY = Math.sin(plateAngle) * orbitRadius * 0.82 // slight ellipse

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-40"
        >
          {/* Dim backdrop, deity stays visible through it */}
          <div className="absolute inset-0 bg-black/30" />

          {/* Rotation progress dots */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: finishing ? 0 : 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute top-[16%] right-0 left-0 flex flex-col items-center gap-2 px-6 text-center"
          >
            <div className="flex items-center gap-2">
              {Array.from({ length: ROTATIONS_NEEDED }).map((_, i) => (
                <span
                  key={i}
                  className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                    i < rounds
                      ? 'scale-110 bg-saffron shadow-[0_0_10px_rgba(249,115,22,0.9)]'
                      : 'bg-cream/25'
                  }`}
                />
              ))}
            </div>
          </motion.div>

          {/* Faint orbit guide ring */}
          <div
            className="pointer-events-none absolute left-1/2 aarti-guide-ring"
            style={{
              top: '45%',
              width: orbitRadius * 2,
              height: orbitRadius * 2 * 0.82,
              transform: 'translate(-50%, -50%)',
            }}
          />

          {/* The orbiting ritual item */}
          <motion.div
            initial={{ y: 240, scale: 0.5, opacity: 0 }}
            animate={
              finishing
                ? { scale: 1.35, opacity: 0 }
                : { y: 0, scale: 1, opacity: 1 }
            }
            transition={
              finishing
                ? { duration: 0.7, ease: 'easeOut' }
                : { duration: 0.45, ease: 'easeOut' }
            }
            className="pointer-events-none absolute left-1/2"
            style={{ top: '45%' }}
          >
            <div
              style={{
                transform: `translate(calc(-50% + ${plateX}px), calc(-50% + ${plateY}px))`,
              }}
            >
              <img
                src={image}
                alt="Ritual offering"
                className="aarti-plate-glow h-24 w-24 object-contain sm:h-28 sm:w-28"
              />
            </div>
          </motion.div>

          {/* Golden burst on completion */}
          {finishing && (
            <div className="pointer-events-none absolute left-1/2 top-[45%]">
              {Array.from({ length: 14 }).map((_, i) => (
                <span
                  key={i}
                  className="aarti-burst-spark absolute"
                  style={
                    {
                      '--burst-x': `${Math.cos((i / 14) * FULL_TURN) * (90 + (i % 3) * 40)}px`,
                      '--burst-y': `${Math.sin((i / 14) * FULL_TURN) * (90 + (i % 3) * 40)}px`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
          )}

          {/* Cancel */}
          {!finishing && (
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 bottom-24 rounded-full border border-cream/30 bg-black/40 px-4 py-1.5 font-serif text-xs text-cream backdrop-blur-sm"
            >
              {t('close')}
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
