'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { useLang } from '@/lib/i18n'

const CATEGORIES = [
  { id: 'popular', labelHi: 'लोकप्रिय', labelEn: 'Popular', icon: '📿' },
  { id: 'all', labelHi: 'सभी', labelEn: 'All', icon: '⊞' },
]

const MALA_ITEMS = [
  { id: 'rudraksha', image: '/images/rudraksha.webp', nameHi: 'रुद्राक्ष माला', nameEn: 'Rudraksha Mala', category: 'popular' },
  { id: 'mala-classic', image: '/images/mala.png', nameHi: 'गेंदा पुष्प माला', nameEn: 'Garland Mala', category: 'popular' },
]

export function MalaPicker({
  open,
  onSelect,
  onClose,
}: {
  open: boolean
  onSelect: (malaId: string, image: string) => void
  onClose: () => void
}) {
  const { lang } = useLang()
  const [selectedCategory, setSelectedCategory] = useState('popular')
  const [selectedMalaId, setSelectedMalaId] = useState('rudraksha')

  const filteredItems = MALA_ITEMS.filter((item) => {
    if (selectedCategory === 'all') return true
    return item.category === selectedCategory || selectedCategory === 'popular'
  })

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="absolute inset-0 z-[60] flex items-end justify-center"
          onClick={onClose}
        >
          {/* Backdrop Overlay */}
          <div className="absolute inset-0 bg-black/60" />

          {/* Modal Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-t-[28px] sm:rounded-t-[32px] border-t-2 border-[#D4A853]/70 dark:border-[#D4A853]/50 bg-[#FFF9EE] dark:bg-[#1A0804] px-4 sm:px-5 pt-3 pb-6 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] select-none will-change-transform"
          >
            {/* Drag Handle Accent */}
            <div className="w-10 h-1 rounded-full bg-[#C99C4B]/60 dark:bg-[#D4A853]/40 mx-auto mb-3" />

            {/* Header: Mala Badge + Title & Subtitle + Close Button */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                {/* Om Badge */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#D4A853]/50 bg-[#FFF5EA] dark:bg-[#2A0C05] shadow-[0_2px_10px_rgba(212,168,83,0.25)]">
                  <img src="/images/om.svg" alt="Om" className="h-8 w-8 object-contain drop-shadow-[0_1px_3px_rgba(212,168,83,0.3)] dark:brightness-0 dark:invert" />
                </div>

                {/* Title & Subtitle */}
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-black text-[#3D1409] dark:text-[#FCEFD2] tracking-wide leading-tight">
                    {lang === 'hi' ? 'माला अर्पण' : 'Mala Offering'}
                  </h3>
                  <p className="font-serif text-xs text-[#6D4C3D] dark:text-[#fcefd2]/75 leading-snug">
                    {lang === 'hi' ? 'अपने आराध्य को पावन माला पहनाएं' : 'Adorn your deity with sacred garlands & beads'}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#D4A853]/40 bg-[#FFF5EA] dark:bg-[#2A0C05] text-[#3D1409] dark:text-[#FCEFD2] hover:bg-[#3D1409] hover:text-[#FCEFD2] transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Category Filter Pills Row */}
            <div className="no-scrollbar flex items-center gap-2 sm:gap-2.5 overflow-x-auto my-3 pb-1">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-1.5 shrink-0 px-3.5 py-1.5 rounded-full font-serif text-xs sm:text-sm transition-all duration-200 cursor-pointer select-none ${
                      isActive
                        ? 'bg-gradient-to-r from-[#3D1409] to-[#581C0E] text-[#FCEFD2] border border-[#D4A853]/70 font-bold shadow-md'
                        : 'bg-[#FFF5EA] dark:bg-[#280C05] text-[#4A2016] dark:text-[#FCEFD2]/80 border border-[#D4A853]/35 hover:border-[#D4A853] font-medium'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{lang === 'hi' ? cat.labelHi : cat.labelEn}</span>
                  </button>
                )
              })}
            </div>

            {/* Mala Cards Carousel */}
            <div className="no-scrollbar flex items-center gap-3 overflow-x-auto pt-1 pb-3 px-1">
              {filteredItems.map((item) => {
                const isSelected = selectedMalaId === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedMalaId(item.id)
                      onSelect(item.id, item.image)
                      onClose()
                    }}
                    className={`group relative flex w-[120px] sm:w-[136px] shrink-0 flex-col items-center gap-2 rounded-[20px] p-3 transition-all duration-200 cursor-pointer select-none ${
                      isSelected
                        ? 'border-2 border-[#F2B84B] bg-gradient-to-b from-[#FFFFFF] via-[#FFFDF5] to-[#FFF5EA] dark:from-[#3D1409] dark:to-[#200803] shadow-[0_4px_18px_rgba(242,184,75,0.35)]'
                        : 'border border-[#D4A853]/35 bg-[#FFFBF5] dark:bg-[#240B05] hover:border-[#D4A853]/80 hover:shadow-md'
                    }`}
                  >
                    {/* Selected Checkmark Badge (✓) */}
                    {isSelected && (
                      <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#3D1409] text-[#FCEFD2] border border-[#F2B84B] text-[10px] font-bold shadow-sm z-10">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}

                    {/* Mala Image Plate */}
                    <div className={`relative flex h-20 w-20 sm:h-22 sm:w-22 items-center justify-center rounded-full ${isSelected ? 'bg-white/90 dark:bg-black/40 shadow-inner' : ''}`}>
                      <img
                        src={item.image}
                        alt={item.nameHi}
                        className="h-16 w-16 sm:h-18 sm:w-18 object-contain filter drop-shadow-[0_4px_10px_rgba(61,20,9,0.18)] transition-transform duration-200 group-hover:scale-110"
                      />
                    </div>

                    {/* Hindi Mala Name Label */}
                    <span className="font-serif text-xs sm:text-sm font-bold text-[#3D1409] dark:text-[#FCEFD2] whitespace-nowrap text-center">
                      {lang === 'hi' ? item.nameHi : item.nameEn}
                    </span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
