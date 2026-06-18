'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

export type Lang = 'hi' | 'en'

type Dict = Record<string, { hi: string; en: string }>

const STRINGS: Dict = {
  // Header
  changeDeity: { hi: 'देवता बदलें', en: 'Change Deity' },
  // Deity sheet
  chooseDeityTitle: { hi: 'देवता चुनें', en: 'Choose Deity' },
  chooseDeitySubtitle: {
    hi: 'दर्शन के लिए अपने देवता चुनें',
    en: 'Choose your deity for darshan',
  },
  // Ritual labels
  flowers: { hi: 'फूल', en: 'Flowers' },
  aarti: { hi: 'आरती', en: 'Aarti' },
  diya: { hi: 'दीपक', en: 'Diya' },
  shankh: { hi: 'शंख', en: 'Conch' },
  bell: { hi: 'घंटी', en: 'Bell' },
  bhog: { hi: 'भोग', en: 'Bhog' },
  dhoop: { hi: 'धूप', en: 'Dhoop' },
  mala: { hi: 'माला', en: 'Mala' },
  offeringsLabel: { hi: 'पूजा सामग्री', en: 'Puja offerings' },
  // Aarti overlay
  aartiInstruction: { hi: 'उंगली घुमाएं', en: 'Rotate your finger' },
  aartiHint: {
    hi: 'आरती अर्पित करने के लिए उंगली को गोल घुमाएं',
    en: 'Move your finger in circles to offer aarti',
  },
  close: { hi: 'बंद करें', en: 'Close' },
  // Toasts
  aartiDone: {
    hi: '🙏 आरती सम्पन्न — आपको आशीर्वाद मिला',
    en: '🙏 Aarti complete — you are blessed',
  },
  diyaLit: { hi: '🪔 दीप आरती सम्पन्न', en: '🪔 Diya aarti complete' },
  shankhBlown: { hi: '🐚 शंखनाद', en: '🐚 Conch sounded' },
  malaOffered: { hi: '📿 माला अर्पित', en: '📿 Mala offered' },
  bhogOffered: { hi: '🍯 भोग अर्पित', en: '🍯 Bhog offered' },
  bellRung: { hi: '🔔 घंटी बजाई गई', en: '🔔 Bell rung' },
  swipeHint: {
    hi: 'अगले देवता के लिए ऊपर स्वाइप करें',
    en: 'Swipe up for next deity',
  },
}

interface LangContextValue {
  lang: Lang
  toggle: () => void
  t: (key: keyof typeof STRINGS) => string
}

const LangContext = createContext<LangContextValue | null>(null)

const LANG_KEY = 'mandir-lang'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('hi')

  useEffect(() => {
    const saved = localStorage.getItem(LANG_KEY) as Lang | null
    if (saved === 'hi' || saved === 'en') setLang(saved)
  }, [])

  const toggle = useCallback(() => {
    setLang((prev) => {
      const next = prev === 'hi' ? 'en' : 'hi'
      localStorage.setItem(LANG_KEY, next)
      return next
    })
  }, [])

  const t = useCallback(
    (key: keyof typeof STRINGS) => STRINGS[key]?.[lang] ?? String(key),
    [lang],
  )

  return (
    <LangContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}
