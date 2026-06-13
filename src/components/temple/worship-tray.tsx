'use client'

import { useLang } from '@/lib/i18n'

export type PujaAction =
  | 'flowers'
  | 'aarti'
  | 'diya'
  | 'shankh'
  | 'bell'
  | 'bhog'
  | 'dhoop'
  | 'mala'

const ACTIONS: {
  id: PujaAction
  labelKey: 'flowers' | 'aarti' | 'diya' | 'shankh' | 'bell' | 'bhog' | 'dhoop' | 'mala'
  icon: React.ReactNode
}[] = [
  {
    id: 'flowers',
    labelKey: 'flowers',
    icon: (
      <img
        src="/images/marigold.png"
        alt=""
        className="h-7 w-7 object-contain"
      />
    ),
  },
  {
    id: 'aarti',
    labelKey: 'aarti',
    icon: (
      <img
        src="/images/puja-thali.png"
        alt=""
        className="h-7 w-7 object-contain"
      />
    ),
  },
  {
    id: 'diya',
    labelKey: 'diya',
    icon: (
      <img
        src="/images/diya-brass.png"
        alt=""
        className="h-7 w-7 object-contain"
      />
    ),
  },
  {
    id: 'shankh',
    labelKey: 'shankh',
    icon: (
      <img src="/images/conch.png" alt="" className="h-7 w-7 object-contain" />
    ),
  },
  {
    id: 'bell',
    labelKey: 'bell',
    icon: (
      <img
        src="/images/bell-hand.png"
        alt=""
        className="h-7 w-7 object-contain"
      />
    ),
  },
  {
    id: 'bhog',
    labelKey: 'bhog',
    icon: (
      <img
        src="/images/bhog/laddu.png"
        alt=""
        className="h-7 w-7 object-contain"
      />
    ),
  },
  {
    id: 'dhoop',
    labelKey: 'dhoop',
    icon: (
      // Incense stick with smoke
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
        <path
          d="M12 21V9"
          stroke="#c9a96e"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="12" cy="7.5" r="1.6" fill="#f97316" />
        <path
          d="M12 5c-1.2-1.2.8-2 0-3.2M14.5 5.5c-1-.9.6-1.6 0-2.6"
          stroke="#c9a96e"
          strokeWidth="1.1"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>
    ),
  },
  {
    id: 'mala',
    labelKey: 'mala',
    icon: (
      <img src="/images/mala.png" alt="" className="h-7 w-7 object-contain" />
    ),
  },
]

export function WorshipTray({
  onAction,
  disabled,
}: {
  onAction: (action: PujaAction) => void
  disabled?: boolean
}) {
  const { t } = useLang()
  return (
    <nav
      aria-label={t('offeringsLabel')}
      className="absolute right-0 bottom-0 left-0 z-50 border-t border-gold/30 bg-gradient-to-t from-[#0d0705] to-[#0d0705]/95"
    >
      <ul className="no-scrollbar flex items-center gap-1 overflow-x-auto px-3 py-2.5">
        {ACTIONS.map((action) => (
          <li key={action.id} className="shrink-0">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onAction(action.id)}
              className="group flex w-[68px] flex-col items-center gap-1 focus-visible:outline-none disabled:opacity-50"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-gold/50 bg-gold/10 transition-all duration-150 group-active:scale-90 group-active:border-saffron group-active:bg-saffron/30">
                {action.icon}
              </span>
              <span className="font-serif text-[11px] whitespace-nowrap text-cream-muted">
                {t(action.labelKey)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
