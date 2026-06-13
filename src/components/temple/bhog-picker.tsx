'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '@/lib/i18n'

const BHOG_ITEMS = [
  { id: 'laddu', image: '/images/bhog/laddu.png', nameHi: 'लड्डू', nameEn: 'Laddu' },
  { id: 'gulab-jamun', image: '/images/bhog/gulab-jamun.png', nameHi: 'गुलाब जामुन', nameEn: 'Gulab Jamun' },
  { id: 'rasgulla', image: '/images/bhog/rasgulla.png', nameHi: 'रसगुल्ला', nameEn: 'Rasgulla' },
  { id: 'kaju-barfi', image: '/images/bhog/kaju-barfi.png', nameHi: 'काजू बर्फी', nameEn: 'Kaju Barfi' },
  { id: 'kheer', image: '/images/bhog/kheer.png', nameHi: 'खीर', nameEn: 'Kheer' },
  { id: 'modak', image: '/images/bhog/modak.png', nameHi: 'मोदक', nameEn: 'Modak' },
  { id: 'gujiya', image: '/images/bhog/gujiya.png', nameHi: 'गुजिया', nameEn: 'Gujiya' },
  { id: 'peda', image: '/images/thali.png', nameHi: 'पेड़ा', nameEn: 'Peda' },
]

export function BhogPicker({
  open,
  onSelect,
  onClose,
}: {
  open: boolean
  onSelect: (bhogId: string, image: string) => void
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
              {lang === 'hi' ? 'भोग चुनें' : 'Choose Bhog'}
            </h3>
            <p className="mb-4 text-xs text-cream-muted italic">
              {lang === 'hi' ? 'देवता को अर्पित करने के लिए भोग चुनें' : 'Select prasad to offer'}
            </p>
            <div className="grid grid-cols-4 gap-3">
              {BHOG_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelect(item.id, item.image)
                    onClose()
                  }}
                  className="group flex flex-col items-center gap-1.5"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-gold/10 transition-all duration-150 group-active:scale-90 group-active:border-saffron group-active:bg-saffron/30">
                    <img
                      src={item.image}
                      alt=""
                      className="h-11 w-11 object-contain"
                    />
                  </span>
                  <span className="text-[10px] text-cream-muted">
                    {lang === 'hi' ? item.nameHi : item.nameEn}
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
