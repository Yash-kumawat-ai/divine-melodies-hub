'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '@/lib/i18n'

const FLOWERS = [
  { id: 'marigold', image: '/images/marigold.png', nameHi: 'गेंदा', nameEn: 'Marigold' },
  { id: 'rose', image: '/images/flowers/rose.png', nameHi: 'गुलाब', nameEn: 'Rose' },
  { id: 'lotus', image: '/images/flower.png', nameHi: 'कमल', nameEn: 'Lotus' },
  { id: 'lily', image: '/images/flowers/lily.png', nameHi: 'लिली', nameEn: 'Lily' },
  { id: 'hibiscus', image: '/images/flowers/hibiscus.png', nameHi: 'गुड़हल', nameEn: 'Hibiscus' },
  { id: 'sunflower', image: '/images/flowers/sunflower.png', nameHi: 'सूरजमुखी', nameEn: 'Sunflower' },
  { id: 'daisy', image: '/images/flowers/daisy.png', nameHi: 'गुलबहार', nameEn: 'Daisy' },
  { id: 'peony', image: '/images/flowers/peony.png', nameHi: 'पियोनी', nameEn: 'Peony' },
]

export function FlowerPicker({
  open,
  onSelect,
  onClose,
}: {
  open: boolean
  onSelect: (flowerId: string, image: string) => void
  onClose: () => void
}) {
  const { lang } = useLang()
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-60 flex items-end"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full rounded-t-3xl border-t border-gold/30 bg-gradient-to-b from-[#1d0e06] to-[#0d0705] px-5 pb-6 pt-4"
          >
            <div className="mx-auto mb-2 h-1 w-12 rounded-full bg-cream/20" />
            <h3 className="mb-1 font-serif text-lg text-gold">
              {lang === 'hi' ? 'फूल चुनें' : 'Choose Flower'}
            </h3>
            <p className="mb-4 text-xs text-cream-muted italic">
              {lang === 'hi' ? 'देवता को अर्पित करने के लिए फूल चुनें' : 'Select a flower to offer'}
            </p>
            <div className="grid grid-cols-4 gap-3">
              {FLOWERS.map((flower) => (
                <button
                  key={flower.id}
                  type="button"
                  onClick={() => {
                    onSelect(flower.id, flower.image)
                    onClose()
                  }}
                  className="group flex flex-col items-center gap-1.5"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-gold/10 transition-all duration-150 group-active:scale-90 group-active:border-saffron group-active:bg-saffron/30">
                    <img
                      src={flower.image}
                      alt=""
                      className="h-11 w-11 object-contain"
                    />
                  </span>
                  <span className="text-[10px] text-cream-muted">
                    {lang === 'hi' ? flower.nameHi : flower.nameEn}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
