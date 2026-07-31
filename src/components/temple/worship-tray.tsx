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
        className="h-10 w-10 sm:h-11 sm:w-11 object-contain drop-shadow-[0_2px_6px_rgba(61,20,9,0.12)] transition-transform duration-200 group-hover:scale-110"
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
        className="h-10 w-10 sm:h-11 sm:w-11 object-contain drop-shadow-[0_2px_6px_rgba(61,20,9,0.12)] transition-transform duration-200 group-hover:scale-110"
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
        className="h-10 w-10 sm:h-11 sm:w-11 object-contain drop-shadow-[0_2px_6px_rgba(61,20,9,0.12)] transition-transform duration-200 group-hover:scale-110"
      />
    ),
  },
  {
    id: 'shankh',
    labelKey: 'shankh',
    icon: (
      <img
        src="/images/conch.png"
        alt=""
        className="h-10 w-10 sm:h-11 sm:w-11 object-contain drop-shadow-[0_2px_6px_rgba(61,20,9,0.12)] transition-transform duration-200 group-hover:scale-110"
      />
    ),
  },
  {
    id: 'bell',
    labelKey: 'bell',
    icon: (
      <img
        src="/images/bell-hand.png"
        alt=""
        className="h-10 w-10 sm:h-11 sm:w-11 object-contain drop-shadow-[0_2px_6px_rgba(61,20,9,0.12)] transition-transform duration-200 group-hover:scale-110"
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
        className="h-10 w-10 sm:h-11 sm:w-11 object-contain drop-shadow-[0_2px_6px_rgba(61,20,9,0.12)] transition-transform duration-200 group-hover:scale-110"
      />
    ),
  },
  {
    id: 'dhoop',
    labelKey: 'dhoop',
    icon: (
      // Incense stick with smoke
      <svg viewBox="0 0 24 24" className="h-10 w-10 sm:h-11 sm:w-11" fill="none" aria-hidden="true">
        <path
          d="M12 21V9"
          stroke="#D4A853"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="7.5" r="2" fill="#f97316" />
        <path
          d="M12 5c-1.2-1.2.8-2 0-3.2M14.5 5.5c-1-.9.6-1.6 0-2.6"
          stroke="#D4A853"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.85"
        />
      </svg>
    ),
  },
  {
    id: 'mala',
    labelKey: 'mala',
    icon: (
      <img
        src="/images/mala.png"
        alt=""
        className="h-10 w-10 sm:h-11 sm:w-11 object-contain drop-shadow-[0_2px_6px_rgba(61,20,9,0.12)] transition-transform duration-200 group-hover:scale-110"
      />
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
      className="absolute right-0 bottom-0 left-0 z-50 rounded-t-[16px] sm:rounded-t-[20px] border-t border-[#D4A853]/60 dark:border-[#D4A853]/40 bg-[#FFF9EE] dark:bg-[#1A0804] shadow-[0_-4px_20px_rgba(61,20,9,0.1)] backdrop-blur-md pb-[calc(0.35rem+env(safe-area-inset-bottom))] transition-all duration-300"
    >
      {/* Top Handle Accent Line */}
      <div className="w-10 h-[3.5px] rounded-full bg-[#C99C4B]/60 dark:bg-[#D4A853]/40 mx-auto mt-1.5 mb-0.5" />

      <ul className="no-scrollbar flex items-center overflow-x-auto px-2 sm:px-4 py-1 justify-start sm:justify-center">
        {ACTIONS.map((action, index) => (
          <li key={action.id} className="flex items-center shrink-0">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onAction(action.id)}
              className="group flex w-[72px] sm:w-[80px] flex-col items-center gap-0.5 focus-visible:outline-none disabled:opacity-40 cursor-pointer select-none py-0.5"
            >
              {/* Direct Floating 3D Image */}
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center">
                {action.icon}
              </div>

              {/* Ritual Text Label */}
              <span className="font-serif text-[12px] sm:text-[13px] font-bold tracking-wide text-[#3D1409] dark:text-[#FCEFD2] whitespace-nowrap transition-colors duration-200 group-hover:text-[#80220A] dark:group-hover:text-[#FFFFFF]">
                {t(action.labelKey)}
              </span>
            </button>

            {/* Thin Golden Vertical Divider Line Between Items */}
            {index < ACTIONS.length - 1 && (
              <div className="h-7 w-[1px] bg-[#D4A853]/40 dark:bg-[#D4A853]/30 shrink-0 self-center mx-1" />
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
