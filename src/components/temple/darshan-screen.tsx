'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, Bell, ArrowLeft, Video } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
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
import { HangingBells } from './hanging-bells'
import { FlowerParticles } from './flower-particles'
import { AartiOverlay } from './aarti-overlay'
import { WorshipTray, type PujaAction } from './worship-tray'
import { DeityStrip } from './deity-strip'
import { FlowerPicker } from './flower-picker'
import { BhogPicker } from './bhog-picker'
import basuriSvg from '@/pages/images/svg/basuri.svg'
import basuriWithoutFeatherSvg from '@/pages/images/svg/basuri without feather.svg'
import leftFeatherSvg from '@/pages/images/svg/left feather.svg'
import rightFeatherSvg from '@/pages/images/svg/right feather.svg'

const XP_KEY = 'mandir-bhakti-xp'
const GATE_CLOSE_MS = 400
const GATE_REOPEN_DELAY_MS = 100

interface Petal {
  id: number
  x: number // percentage
  delay: number // seconds
  duration: number // seconds
  size: number // pixels
  image: string
}

export function DarshanScreen() {
  const navigate = useNavigate()
  const { t, lang } = useLang()
  const [gatesOpen, setGatesOpen] = useState(true)
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
  const [petals, setPetals] = useState<Petal[]>([])

  const triggerFullFlowerShower = useCallback((selectedImage?: string) => {
    const defaultFlowers = [
      '/images/marigold.png',
      '/images/flowers/rose.png',
      '/images/flower.png',
      '/images/flowers/lily.png',
      '/images/flowers/hibiscus.png',
      '/images/flowers/sunflower.png',
      '/images/flowers/daisy.png',
      '/images/flowers/peony.png'
    ]

    const imageToUse = selectedImage || flowerImage || defaultFlowers[0]

    const newPetals = Array.from({ length: 25 }).map((_, i) => ({
      id: Date.now() + i,
      x: 2 + Math.random() * 88,
      delay: Math.random() * 1.5,
      duration: 3.5 + Math.random() * 2.5,
      size: 28 + Math.random() * 20,
      image: imageToUse
    }))

    setPetals((prev) => [...prev, ...newPetals])
    setTimeout(() => {
      setPetals((prev) => prev.filter(p => !newPetals.includes(p)))
    }, 7000)
  }, [flowerImage])

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

  // Mount effect
  useEffect(() => {
    const timer = setTimeout(() => {
      playBellChime()
    }, 150)
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
   * Deity change: switches deity directly with bell chime.
   */
  const changeDeity = useCallback(
    (index: number) => {
      if (transitioning || index === activeIndex) return
      setTransitioning(true)
      setShowSwipeHint(false)
      setActiveIndex(index)
      playBellChime()
      setTimeout(() => setTransitioning(false), 300)
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
        }, 350)
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
      triggerFullFlowerShower(image)
    },
    [pulseGlow, addXp, triggerFullFlowerShower],
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
    triggerFullFlowerShower()
    setTimeout(() => setIntenseGlow(false), 1100)
  }, [addXp, showToast, t, triggerFullFlowerShower])

  const onDiyaComplete = useCallback(() => {
    setIntenseGlow(true)
    addXp(15)
    showToast(t('diyaLit'))
    triggerFullFlowerShower()
    setTimeout(() => setIntenseGlow(false), 1100)
  }, [addXp, showToast, t, triggerFullFlowerShower])

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
      className="relative mx-auto h-full w-full max-w-md overflow-hidden bg-white dark:bg-[#0d0705] transition-colors duration-300"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onWheel={onWheel}
    >
      {/* LAYER 1: Temple background — pure white top matching scrolling bar */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,#FFFFFF_0%,#FAFAFA_60%,#F3F0EA_100%)] dark:bg-[radial-gradient(ellipse_at_50%_42%,#3d1a08_0%,#1d0e06_55%,#0d0705_100%)] transition-all duration-300" />

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
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,transparent_52%,rgba(95,72,38,0.22)_100%)] dark:bg-[radial-gradient(ellipse_at_50%_38%,transparent_52%,rgba(13,7,5,0.82)_100%)] transition-all duration-300" />
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
            initial={{ opacity: 0, y: -140, scale: 0.65, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.9, x: '-50%' }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
            className="pointer-events-none absolute top-[44%] left-1/2 z-30 w-[48%] max-w-[260px] object-contain drop-shadow-[0_0_28px_rgba(249,160,40,0.45)]"
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

      {/* LAYER 6: Seamless Temple Header */}
      <header className="absolute top-0 right-0 left-0 z-50 flex flex-col px-3 sm:px-4 pt-3.5 pb-0 transition-all duration-300">
        
        {/* Header Contents */}
        <div className="relative z-10 flex flex-col gap-1">
          {/* Top Row: Back Button (Left) | Title & Bansuri (Centered) | Bell Icon (Right) */}
          <div className="relative flex items-center justify-between w-full min-h-[50px] px-1 pt-0.5">
            
            {/* Left: Back Button */}
            <div className="flex items-center justify-start z-10">
              <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label="Go back"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d4a853]/60 bg-[#3D1409]/90 dark:bg-[#1A0804]/95 text-[#FCEFD2] shadow-md backdrop-blur-md transition-all hover:bg-[#581C0E] hover:border-[#f2b84b] hover:scale-105 active:scale-95 cursor-pointer p-2.5"
              >
                <ArrowLeft className="h-5 w-5 text-[#FCEFD2]" />
              </button>
            </div>

            {/* Center: Left Feather + Deity Name Heading & Bansuri Without Feather + Right Feather */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 flex flex-col items-center justify-center text-center z-10 pointer-events-none w-full max-w-[90%] sm:max-w-[82%]">
              <div className="flex items-center justify-center gap-2 sm:gap-3.5 w-full">
                {/* Left Feather */}
                <img
                  src={leftFeatherSvg}
                  alt=""
                  className="h-10 sm:h-14 md:h-16 w-auto object-contain shrink-0 filter drop-shadow-[0_2px_8px_rgba(212,168,83,0.5)] transition-transform duration-300 hover:scale-105"
                />

                {/* Deity Name Heading */}
                <AnimatePresence mode="wait">
                  <motion.h1
                    key={`${deity.id}-name`}
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: gatesOpen ? 1 : 0, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="font-serif text-[24px] sm:text-[28px] md:text-[32px] font-black text-[#5C1217] dark:text-[#f8c968] tracking-wide leading-none py-0.5 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] whitespace-nowrap"
                  >
                    {lang === 'hi' ? deity.nameHindi : deity.nameEnglish}
                  </motion.h1>
                </AnimatePresence>

                {/* Right Feather */}
                <img
                  src={rightFeatherSvg}
                  alt=""
                  className="h-10 sm:h-14 md:h-16 w-auto object-contain shrink-0 filter drop-shadow-[0_2px_8px_rgba(212,168,83,0.5)] transition-transform duration-300 hover:scale-105"
                />
              </div>

              {/* Bansuri Without Feather directly below the deity name */}
              <img
                src={basuriWithoutFeatherSvg}
                alt="Divine Flute"
                className="h-5 sm:h-7 md:h-8 w-[200px] sm:w-[300px] md:w-[360px] max-w-full object-contain -mt-0.5 filter drop-shadow-[0_2px_6px_rgba(212,168,83,0.45)] transition-transform duration-300"
              />
            </div>

            {/* Right: Bell Icon Button */}
            <div className="flex items-center justify-end z-10">
              <button
                type="button"
                onClick={ringHeaderBell}
                disabled={!gatesOpen || aartiOpen || diyaOpen || transitioning || bellActive}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d4a853]/60 bg-[#3D1409]/90 dark:bg-[#1A0804]/95 text-[#FCEFD2] shadow-md backdrop-blur-md transition-all hover:bg-[#581C0E] hover:border-[#f2b84b] hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer p-2.5"
                aria-label="Ring bell"
              >
                <Bell className="h-5 w-5 fill-[#FCEFD2] text-[#FCEFD2] transition-transform duration-300 hover:rotate-12" />
              </button>
            </div>

          </div>

          {/* Bottom Row: Deity Selector Strip Shifted Up */}
          <div className="w-full mt-0.5 translate-y-0.5 sm:translate-y-1 z-20">
            <DeityStrip activeIndex={activeIndex} onSelect={changeDeity} />
          </div>
        </div>

      </header>

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
            className="absolute bottom-24 left-1/2 z-50 w-max max-w-[88%] -translate-x-1/2 rounded-full border border-gold/40 bg-black/75 px-5 py-2.5 text-center font-serif text-sm text-white backdrop-blur-md"
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

      {/* ─── FLOWER PETALS OVERLAY ────────────────────────────────────── */}
      {petals.map((petal) => (
        <img
          key={petal.id}
          src={petal.image}
          alt=""
          className="absolute pointer-events-none z-[100] animate-petal select-none"
          style={{
            left: `${petal.x}%`,
            animationDelay: `${petal.delay}s`,
            animationDuration: `${petal.duration}s`,
            width: `${petal.size}px`,
            height: `${petal.size}px`,
            objectFit: 'contain',
            top: `-50px`,
          }}
        />
      ))}

      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-50px) rotate(0deg);
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(105vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-petal {
          animation: fall linear forwards;
        }
      `}</style>
    </div>
  )
}
