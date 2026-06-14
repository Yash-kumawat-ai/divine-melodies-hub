'use client'

import { useEffect, useRef } from 'react'
import { deities } from '@/lib/deities'
import { useLang } from '@/lib/i18n'

/**
 * Horizontally scrollable list of all deities at the top of the screen.
 * Tap a name to switch — the temple gates close and reopen on the new god.
 * Built to scale: add more deities in lib/deities.ts and they appear here.
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
      aria-label="Deities"
      className="relative w-full h-8 z-10"
    >
      <ul
        ref={listRef}
        className="no-scrollbar flex h-full items-center gap-6 overflow-x-auto px-4"
      >
        {deities.map((deity, i) => (
          <li key={deity.id} className="shrink-0">
            <button
              type="button"
              onClick={() => onSelect(i)}
              aria-current={i === activeIndex ? 'true' : undefined}
              className="flex flex-col items-center gap-0.5 focus-visible:outline-none"
            >
              <span
                className={`font-serif text-[13px] tracking-wide whitespace-nowrap transition-colors duration-200 ${
                  i === activeIndex
                    ? 'text-[#f2b84b] font-medium drop-shadow-[0_0_8px_rgba(249,184,75,0.4)]'
                    : 'text-[#fcefd2]/65 hover:text-[#fcefd2]'
                }`}
              >
                {lang === 'hi' ? deity.nameHindi : deity.nameEnglish}
              </span>
              {i === activeIndex ? (
                <div className="relative w-full flex items-center justify-center h-1 mt-0.5 shrink-0">
                  <div className="w-1/2 h-[1px] bg-gradient-to-r from-transparent to-[#f2b84b]" />
                  <div className="h-1.5 w-1.5 rounded-full bg-[#f2b84b] shrink-0 mx-0.5 shadow-[0_0_5px_rgba(249,184,75,0.8)]" />
                  <div className="w-1/2 h-[1px] bg-gradient-to-l from-transparent to-[#f2b84b]" />
                </div>
              ) : (
                <div className="h-1 mt-0.5 w-full bg-transparent shrink-0" />
              )}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
