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
      className="relative w-full h-10 z-10"
    >
      <ul
        ref={listRef}
        className="no-scrollbar flex h-full items-center gap-6 overflow-x-auto px-4"
      >
        {deities.map((deity, i) => (
          <li key={deity.id} className="shrink-0 h-full flex items-center">
            <button
              type="button"
              onClick={() => onSelect(i)}
              aria-current={i === activeIndex ? 'true' : undefined}
              className="relative flex flex-col items-center justify-center h-full px-1 focus-visible:outline-none"
            >
              <span
                className={`font-serif text-[14px] tracking-wide whitespace-nowrap transition-colors duration-200 ${
                  i === activeIndex
                    ? 'text-[#E06D14] dark:text-[#f2b84b] font-semibold drop-shadow-sm'
                    : 'text-[#543D2B]/75 dark:text-[#fcefd2]/65 hover:text-[#E06D14] dark:hover:text-[#fcefd2]'
                }`}
              >
                {lang === 'hi' ? deity.nameHindi : deity.nameEnglish}
              </span>
              {i === activeIndex && (
                <div 
                  className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#E06D14] dark:bg-[#f2b84b] rounded-full shadow-[0_1px_3px_rgba(224,109,20,0.35)] dark:shadow-[0_1px_3px_rgba(242,184,75,0.35)]" 
                />
              )}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
