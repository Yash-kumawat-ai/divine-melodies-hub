'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, Bell } from 'lucide-react'
import { deities } from '@/lib/deities'
import { useLang } from '@/lib/i18n'
import {
  playBellChime,
  playFlowerTone,
  playAartiTone,
  playBhogTone,
  playDhoopTone,
  playMalaTone,
  playDiyaTone,
  playShankhTone,
} from '@/lib/temple-audio'
import { TempleGates } from './temple-gates'
import { HangingBells } from './hanging-bells'
import { FlowerParticles } from './flower-particles'
import { AartiOverlay } from './aarti-overlay'
import { WorshipTray, type PujaAction } from './worship-tray'
import { DeityStrip } from './deity-strip'
import { FlowerPicker } from './flower-picker'
import { BhogPicker } from './bhog-picker'

const XP_KEY = 'mandir-bhakti-xp'
const GATE_CLOSE_MS = 900
const GATE_REOPEN_DELAY_MS = 280

export function DarshanScreen() {
  const { t, lang, toggle } = useLang()
  const [gatesOpen, setGatesOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [transitioning, setTransitioning] = useState(false)

  // Effects state
  const [shower, setShower] = useState(0)
  const [flowerImage, setFlowerImage] = useState('/images/marigold.png')
  const [burst, setBurst] = useState(0)
  const [glowPulse, setGlowPulse] = useState(false)
  const [intenseGlow, setIntenseGlow] = useState(false)
  const [aartiOpen, setAartiOpen] = useState(false)
  const [diyaOpen, setDiyaOpen] = useState(false)
  const [flowerPickerOpen, setFlowerPickerOpen] = useState(false)
  const [bhogPickerOpen, setBhogPickerOpen] = useState(false)
  const [bhogImage, setBhogImage] = useState<string | null>(null)
  const [dhoopActive, setDhoopActive] = useState(false)
  const [bellActive, setBellActive] = useState(false)
  const [malaActive, setMalaActive] = useState(false)
  const [showSwipeHint, setShowSwipeHint] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const [xp, setXp] = useState(0)

  const glowTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartY = useRef<number | null>(null)
  const wheelLock = useRef(false)
  const deity = deities[activeIndex]

  // Load XP
  useEffect(() => {
    const saved = Number(localStorage.getItem(XP_KEY) || '0')
    setXp(saved)
  }, [])

  const addXp = useCallback((amount: number) => {
    setXp((prev) => {
      const next = prev + amount
      localStorage.setItem(XP_KEY, String(next))
      return next
    })
  }, [])

  // Gate-open hero animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setGatesOpen(true)
      playBellChime()
    }, 600)
    const hintTimer = setTimeout(() => setShowSwipeHint(false), 6000)
    return () => {
      clearTimeout(timer)
      clearTimeout(hintTimer)
    }
  }, [])

  const pulseGlow = useCallback(() => {
    setGlowPulse(true)
    if (glowTimer.current) clearTimeout(glowTimer.current)
    glowTimer.current = setTimeout(() => setGlowPulse(false), 600)
  }, [])

  const showToast = useCallback((message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 2800)
  }, [])

  /**
   * Reel-style deity change: gates close → deity switches behind the
   * closed doors → gates reopen with a bell chime on the new god.
   */
  const changeDeity = useCallback(
    (index: number) => {
      if (transitioning || index === activeIndex) return
      setTransitioning(true)
      setShowSwipeHint(false)
      setGatesOpen(false)
      setTimeout(() => {
        setActiveIndex(index)
        setTimeout(() => {
          setGatesOpen(true)
          playBellChime()
          setTimeout(() => setTransitioning(false), GATE_CLOSE_MS)
        }, GATE_REOPEN_DELAY_MS)
      }, GATE_CLOSE_MS)
    },
    [transitioning, activeIndex],
  )

  const nextDeity = useCallback(
    () => changeDeity((activeIndex + 1) % deities.length),
    [changeDeity, activeIndex],
  )
  const prevDeity = useCallback(
    () => changeDeity((activeIndex - 1 + deities.length) % deities.length),
    [changeDeity, activeIndex],
  )

  const anyOverlayOpen =
    aartiOpen || diyaOpen || flowerPickerOpen || bhogPickerOpen || bellActive

  // Reel-style swipe: up = next deity, down = previous
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }, [])
  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartY.current === null || anyOverlayOpen) return
      const dy = e.changedTouches[0].clientY - touchStartY.current
      touchStartY.current = null
      if (dy < -60) nextDeity()
      else if (dy > 60) prevDeity()
    },
    [nextDeity, prevDeity, anyOverlayOpen],
  )
  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      if (wheelLock.current || transitioning || anyOverlayOpen) return
      if (Math.abs(e.deltaY) > 30) {
        wheelLock.current = true
        if (e.deltaY > 0) nextDeity()
        else prevDeity()
        setTimeout(() => {
          wheelLock.current = false
        }, 1600)
      }
    },
    [transitioning, nextDeity, prevDeity, anyOverlayOpen],
  )

  const handleAction = useCallback(
    (action: PujaAction) => {
      switch (action) {
        case 'flowers':
          setFlowerPickerOpen(true)
          break
        case 'aarti':
          playAartiTone()
          setAartiOpen(true)
          break
        case 'diya':
          playDiyaTone()
          setDiyaOpen(true)
          break
        case 'shankh':
          playShankhTone()
          setIntenseGlow(true)
          addXp(10)
          showToast(t('shankhBlown'))
          setTimeout(() => setIntenseGlow(false), 2200)
          break
        case 'bell':
          setBellActive(true)
          playBellChime()
          pulseGlow()
          addXp(5)
          setTimeout(() => playBellChime(), 700)
          setTimeout(() => playBellChime(), 1400)
          setTimeout(() => setBellActive(false), 2400)
          break
        case 'bhog':
          setBhogPickerOpen(true)
          break
        case 'dhoop':
          playDhoopTone()
          setDhoopActive(true)
          addXp(5)
          setTimeout(() => setDhoopActive(false), 5000)
          break
        case 'mala':
          playMalaTone()
          setMalaActive(true)
          pulseGlow()
          addXp(5)
          showToast(t('malaOffered'))
          setTimeout(() => setMalaActive(false), 3000)
          break
      }
    },
    [pulseGlow, addXp, showToast, t],
  )

  const onFlowerSelect = useCallback(
    (_id: string, image: string) => {
      setFlowerImage(image)
      setShower((s) => s + 1)
      playFlowerTone()
      pulseGlow()
      addXp(5)
    },
    [pulseGlow, addXp],
  )

  const onBhogSelect = useCallback(
    (_id: string, image: string) => {
      setBhogImage(image)
      playBhogTone()
      pulseGlow()
      addXp(5)
      showToast(t('bhogOffered'))
      setTimeout(() => setBhogImage(null), 2600)
    },
    [pulseGlow, addXp, showToast, t],
  )

  const onAartiComplete = useCallback(() => {
    setIntenseGlow(true)
    setBurst((b) => b + 1)
    addXp(20)
    showToast(t('aartiDone'))
    setTimeout(() => setIntenseGlow(false), 1100)
  }, [addXp, showToast, t])

  const onDiyaComplete = useCallback(() => {
    setIntenseGlow(true)
    addXp(15)
    showToast(t('diyaLit'))
    setTimeout(() => setIntenseGlow(false), 1100)
  }, [addXp, showToast, t])

  const ringHeaderBell = useCallback(() => {
    if (aartiOpen || diyaOpen || flowerPickerOpen || bhogPickerOpen || bellActive || !gatesOpen) return
    setBellActive(true)
    playBellChime()
    addXp(10)
    showToast(t('bellRung'))
    setTimeout(() => playBellChime(), 700)
    setTimeout(() => playBellChime(), 1400)
    setTimeout(() => setBellActive(false), 2400)
  }, [aartiOpen, diyaOpen, flowerPickerOpen, bhogPickerOpen, bellActive, gatesOpen, addXp, showToast, t])

  const deityFilter = intenseGlow
    ? 'drop-shadow(0 0 120px rgba(249,115,22,0.7))'
    : glowPulse
      ? 'drop-shadow(0 0 80px rgba(249,115,22,0.6))'
      : `drop-shadow(0 0 40px ${deity.glow})`

  return (
    <div
      className="relative mx-auto h-full w-full max-w-md overflow-hidden bg-[#0d0705]"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onWheel={onWheel}
    >
      {/* LAYER 1: Temple background — subtle radial warmth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,#3d1a08_0%,#1d0e06_55%,#0d0705_100%)]" />

      {/* LAYER 2: Divine rotating light rays behind deity */}
      <div
        aria-hidden="true"
        className="halo-rays absolute top-[42%] left-1/2 h-[140vw] w-[140vw] max-h-[560px] max-w-[560px]"
      />

      {/* LAYER 3: DEITY — fills the entire darshan area, face at top */}
      <div className="absolute top-[112px] right-0 bottom-20 left-0 z-10">
        <AnimatePresence mode="wait">
          <motion.img
            key={deity.id}
            src={deity.image}
            alt={`${deity.nameEnglish} darshan`}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: gatesOpen ? 1 : 0.4, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="h-full w-full object-cover object-top"
            style={{
              filter: deityFilter,
              transition: 'filter 0.3s ease-out',
            }}
          />
        </AnimatePresence>
        {/* Warm vignette so edges melt into the temple darkness */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,transparent_52%,rgba(13,7,5,0.82)_100%)]" />
        {/* Divine glow overlay — pulses on puja actions */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            background:
              'radial-gradient(ellipse at 50% 35%, rgba(249,160,40,0.32) 0%, transparent 58%)',
            opacity: intenseGlow ? 1 : glowPulse ? 0.75 : 0,
          }}
        />
      </div>

      {/* LAYER 4: Thin decorative golden arch — top only */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 left-0 z-20"
      >
        <svg viewBox="0 0 390 100" className="w-full" fill="none">
          <path
            d="M0 0h390v34c-26 0-36 22-62 22-24 0-30-14-52-14-20 0-26 10-46 10h-70c-20 0-26-10-46-10-22 0-28 14-52 14-26 0-36-22-62-22V0z"
            fill="#2a1408"
          />
          <path
            d="M0 34c26 0 36 22 62 22 24 0 30-14 52-14 20 0 26 10 46 10h70c20 0 26-10 46-10 22 0 28 14 52 14 26 0 36-22 62-22"
            stroke="#d4a853"
            strokeWidth="2"
            opacity="0.8"
          />
          {/* Kalash at center */}
          <path d="M195 22l-7 12h14l-7-12z" fill="#d4a853" />
          <circle cx="195" cy="18" r="3.5" fill="#f97316" />
        </svg>
      </div>

      {/* LAYER 5: Hanging bells */}
      <HangingBells onRing={() => addXp(5)} />

      {/* LAYER 6: Flowers — deity zones only */}
      <FlowerParticles shower={shower} flowerImage={flowerImage} burst={burst} />

      {/* Dhoop smoke wisps near deity feet */}
      {dhoopActive && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-24 left-1/2 z-20 -translate-x-1/2"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="smoke-wisp absolute bottom-0"
              style={{
                left: `${(i - 1) * 26}px`,
                animationDelay: `${i * 0.7}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Selected bhog rises to deity feet */}
      <AnimatePresence>
        {bhogImage && (
          <motion.img
            src={bhogImage}
            alt=""
            initial={{ opacity: 0, y: 120, scale: 0.6 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="pointer-events-none absolute bottom-24 left-1/2 z-30 h-28 w-28 -translate-x-1/2 object-contain drop-shadow-[0_0_24px_rgba(249,115,22,0.5)]"
          />
        )}
      </AnimatePresence>

      {/* Mala garland descends onto the deity */}
      <AnimatePresence>
        {malaActive && (
          <motion.img
            src="/images/mala.png"
            alt=""
            initial={{ opacity: 0, y: -180, scale: 0.55, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, x: '-50%' }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
            className="pointer-events-none absolute top-[24%] left-1/2 z-30 w-[58%] object-contain drop-shadow-[0_0_28px_rgba(249,160,40,0.45)]"
          />
        )}
      </AnimatePresence>

      {/* Hand bell rings in from below */}
      <AnimatePresence>
        {bellActive && (
          <motion.div
            initial={{ opacity: 0, y: 260 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 140 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="pointer-events-none absolute inset-x-0 bottom-28 z-40 flex justify-center"
          >
            <img
              src="/images/bell-hand.png"
              alt=""
              className="bell-ring-loop h-44 w-auto object-contain drop-shadow-[0_0_36px_rgba(212,168,83,0.65)]"
              style={{ transformOrigin: 'top center' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* LAYER 6: Beautiful Temple Header */}
      <header className="absolute top-0 right-0 left-0 z-50 flex flex-col bg-gradient-to-b from-black/95 via-[#0d0705]/95 to-[#0d0705]/90 border-b border-[#d4a853]/25 px-4 pt-4 pb-3 gap-2">
        
        {/* Top Row: Language | Jaikara & Lotus Divider | Diya & Bell */}
        <div className="flex items-center justify-between w-full min-h-[44px]">
          
          {/* Left: Language Toggle */}
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle language"
            className="rounded-full border border-[#d4a853]/30 bg-black/40 px-3.5 py-1.5 font-serif text-xs text-[#fcefd2] shadow-inner transition-all hover:border-[#d4a853]/60 active:scale-95"
          >
            {'हिं / EN'}
          </button>

          {/* Center: Jaikara & Lotus Divider */}
          <div className="flex flex-col items-center justify-center text-center flex-1 mx-2">
            <AnimatePresence mode="wait">
              <motion.p
                key={`${deity.id}-jaikara`}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: gatesOpen ? 1 : 0, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.3 }}
                className="font-serif text-[15px] font-bold text-[#f2b84b] drop-shadow-[0_1.5px_4px_rgba(0,0,0,0.95)] tracking-wide leading-none"
              >
                {deity.jaikara}
              </motion.p>
            </AnimatePresence>

            {/* Lotus Divider SVG */}
            <svg
              className="w-36 h-5 text-[#d4a853] mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
              viewBox="0 0 200 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 15 C45 15, 60 20, 85 15 C88 14.5, 89 12, 87 11 C85 10, 81 12, 82 14 C83 16, 88 17, 90 15"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M190 15 C155 15, 140 20, 115 15 C112 14.5, 111 12, 113 11 C115 10, 119 12, 118 14 C117 16, 112 17, 110 15"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="10" cy="15" r="1.5" fill="currentColor" />
              <circle cx="190" cy="15" r="1.5" fill="currentColor" />
              <g transform="translate(88, 3) scale(0.18)" fill="currentColor">
                <path d="M66.7,68.9c0,0-5.8-12.7-5.8-24.9c0-10.7,5.8-21.7,5.8-21.7s5.8,11,5.8,21.7C72.5,56.2,66.7,68.9,66.7,68.9z" />
                <path d="M66.7,68.9c-3.1-2.9-14-11.8-19.1-22.3c-4.4-9.1-3.6-20.5-3.6-20.5s9.6,7.5,15,16.5C64,51,66.7,68.9,66.7,68.9z" />
                <path d="M66.7,68.9c3.1-2.9,14-11.8,19.1-22.3c4.4-9.1,3.6-20.5,3.6-20.5s-9.6,7.5-15,16.5C69.4,51,66.7,68.9,66.7,68.9z" />
                <path d="M66.7,68.9c-5.8-1.5-21-4.8-29.2-12.8C29.4,48,27,37.3,27,37.3s11.5,2.6,21,9c8.2,5.5,18.7,22.6,18.7,22.6z" />
                <path d="M66.7,68.9c5.8-1.5,21-4.8,29.2-12.8C104,48,106.4,37.3,106.4,37.3s-11.5,2.6-21,9C77.2,54.8,66.7,68.9,66.7,68.9z" />
              </g>
            </svg>
          </div>

          {/* Right: Diya/XP Pill & Bell Circle */}
          <div className="flex items-center gap-2">
            {/* Diya / XP Pill */}
            <div className="flex items-center gap-1.5 rounded-full border border-[#d4a853]/30 bg-black/40 px-3 py-1.5 text-xs text-[#fcefd2] shadow-inner select-none">
              <svg className="w-5 h-4 shrink-0" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12,0 C12,0 15,4.5 15,7 C15,8.66 13.66,10 12,10 C10.34,10 9,8.66 9,7 C9,4.5 12,0 12,0 Z" fill="url(#flameGrad)" />
                <path d="M3,9 C3,9 2,11 2,12 C2,14.5 6.5,16 12,16 C17.5,16 22,14.5 22,12 C22,11 21,9 21,9 C19.5,10.5 16,11.5 12,11.5 C8,11.5 4.5,10.5 3,9 Z" fill="url(#diyaGrad)" stroke="#d4a853" strokeWidth="0.5" />
                <defs>
                  <radialGradient id="flameGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="25%" stopColor="#ffee55" />
                    <stop offset="70%" stopColor="#ff7a00" />
                    <stop offset="100%" stopColor="#ff3c00" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="diyaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#d4a853" />
                    <stop offset="50%" stopColor="#aa8844" />
                    <stop offset="100%" stopColor="#665522" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="font-serif font-semibold">{xp}</span>
            </div>

            {/* Bell Circle */}
            <button
              type="button"
              onClick={ringHeaderBell}
              disabled={!gatesOpen || aartiOpen || diyaOpen || transitioning || bellActive}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#d4a853]/30 bg-black/40 text-[#d4a853] transition-all hover:border-[#d4a853]/60 active:scale-90 disabled:opacity-50"
              aria-label="Ring bell"
            >
              <Bell className="h-4.5 w-4.5 fill-[#d4a853] text-[#d4a853]" />
            </button>
          </div>

        </div>

        {/* Bottom Row: Deity Selector Strip */}
        <div className="w-full mt-1">
          <DeityStrip activeIndex={activeIndex} onSelect={changeDeity} />
        </div>

      </header>

      {/* Swipe hint — fades out after a few seconds */}
      <AnimatePresence>
        {showSwipeHint && gatesOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.2 }}
            className="pointer-events-none absolute bottom-24 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-0.5"
          >
            <ChevronUp className="swipe-hint-bounce h-4 w-4 text-cream/70" />
            <p className="text-[11px] text-cream/70">{t('swipeHint')}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Aarti — auto-rotating thali */}
      <AartiOverlay
        open={aartiOpen}
        image="/images/puja-thali.png"
        onProgress={pulseGlow}
        onComplete={onAartiComplete}
        onClose={() => setAartiOpen(false)}
      />

      {/* Diya — auto-rotating like aarti */}
      <AartiOverlay
        open={diyaOpen}
        image="/images/diya-brass.png"
        onProgress={pulseGlow}
        onComplete={onDiyaComplete}
        onClose={() => setDiyaOpen(false)}
      />

      {/* Completion toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="status"
            className="absolute bottom-24 left-1/2 z-50 w-max max-w-[88%] -translate-x-1/2 rounded-full border border-gold/40 bg-black/75 px-5 py-2.5 text-center font-serif text-sm text-cream backdrop-blur-md"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* LAYER 7: Bottom worship tray — scrollable rituals */}
      <WorshipTray
        onAction={handleAction}
        disabled={!gatesOpen || aartiOpen || diyaOpen || transitioning}
      />

      {/* Temple gates (above all darshan layers, below header) */}
      <div className="absolute inset-0 z-[55] pointer-events-none">
        <TempleGates open={gatesOpen} />
      </div>

      {/* Flower & bhog pickers */}
      <FlowerPicker
        open={flowerPickerOpen}
        onSelect={onFlowerSelect}
        onClose={() => setFlowerPickerOpen(false)}
      />
      <BhogPicker
        open={bhogPickerOpen}
        onSelect={onBhogSelect}
        onClose={() => setBhogPickerOpen(false)}
      />
    </div>
  )
}
