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
      className="absolute top-11 right-0 left-0 z-50 h-9"
    >
      <ul
        ref={listRef}
        className="no-scrollbar flex h-full items-center gap-6 overflow-x-auto px-5"
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
                className={`font-serif text-sm whitespace-nowrap transition-colors duration-200 ${
                  i === activeIndex
                    ? 'text-saffron drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]'
                    : 'text-cream-muted'
                }`}
              >
                {lang === 'hi' ? deity.nameHindi : deity.nameEnglish}
              </span>
              <span
                className={`h-1 w-1 rounded-full transition-all duration-200 ${
                  i === activeIndex ? 'bg-saffron' : 'bg-transparent'
                }`}
              />
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
