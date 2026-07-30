'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { deities } from '@/lib/deities'
import { useLang } from '@/lib/i18n'

/**
 * Horizontally scrollable list of all deities at the top of the screen.
 * Stretches across the screen with compact height, golden glassmorphic styling, and active pill glow.
 */
export function DeityStrip({
  activeIndex,
  onSelect,
}: {
  activeIndex: number
  onSelect: (index: number) => void
}) {
  const { lang } = useLang()
  const listRef = useRef<HTMLUListElement>(null)

  // Keep the active deity centered in view
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const item = list.children[activeIndex] as HTMLElement | undefined
    if (!item) return
    const target =
      item.offsetLeft - list.clientWidth / 2 + item.clientWidth / 2
    list.scrollTo({ left: target, behavior: 'smooth' })
  }, [activeIndex])

  return (
    <nav
      aria-label="Deities navigation"
      className="relative w-full max-w-[98%] sm:max-w-[96%] mx-auto z-10 px-0.5"
    >
      <div className="w-full rounded-full bg-white/95 dark:bg-[#1A0904]/95 border border-[#D4A853]/60 dark:border-[#D4A853]/40 shadow-[0_4px_20px_rgba(61,20,9,0.12)] backdrop-blur-lg py-0.5 px-1 transition-all">
        <ul
          ref={listRef}
          className="no-scrollbar flex items-center gap-1 sm:gap-1.5 overflow-x-auto px-0.5 py-0.5"
        >
          {deities.map((deity, i) => {
            const isActive = i === activeIndex
            return (
              <li key={deity.id} className="shrink-0 relative flex items-center">
                <button
                  type="button"
                  onClick={() => onSelect(i)}
                  aria-current={isActive ? 'true' : undefined}
                  className="relative flex items-center justify-center px-3.5 sm:px-4.5 py-1.5 focus-visible:outline-none cursor-pointer select-none rounded-full transition-all duration-200"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeDeityPill"
                      className="absolute inset-0 bg-[#3D1409] dark:bg-[#3D1409] border border-[#d4a853]/60 rounded-full shadow-[0_2px_8px_rgba(61,20,9,0.3)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span
                    className={`relative z-10 font-serif text-[13.5px] sm:text-[14.5px] tracking-wide whitespace-nowrap transition-colors duration-200 ${
                      isActive
                        ? 'text-[#FCEFD2] font-bold'
                        : 'text-[#4A2016]/85 dark:text-[#fcefd2]/80 hover:text-[#3D1409] dark:hover:text-[#FCEFD2] font-medium'
                    }`}
                  >
                    {lang === 'hi' ? deity.nameHindi : deity.nameEnglish}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeDeityIndicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-[2.5px] bg-[#D4A853] shadow-[0_0_6px_#D4A853] rounded-full z-20"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
