import { memo, forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Globe } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useDrawerTheme } from '@/hooks/useDrawerTheme';
import { DRAWER_LANGUAGE_OPTIONS } from '@/config/menu.config';
import type { SupportedLanguage } from '@/hooks/useLanguage';

export const LanguageAccordion = memo(
  forwardRef<HTMLDivElement, {}>(function LanguageAccordion(_props, ref) {
    const [isOpen, setIsOpen] = useState(false);
    const { language, setLanguage } = useLanguage();
    const { primaryText, secondaryText, border, hoverBg, accent, cardBg, iconBg, iconColor } = useDrawerTheme();

    const currentOption = DRAWER_LANGUAGE_OPTIONS.find((o) => o.code === language);

    const handleSelect = (code: SupportedLanguage) => {
      setLanguage(code);
      setIsOpen(false);
    };

    return (
      <div ref={ref} className="mx-2">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex w-full items-center gap-3 rounded-2xl min-h-[52px] px-3.5 py-3 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#651317]/50"
          style={{ background: isOpen ? 'rgba(101,19,23,0.08)' : 'transparent' }}
          aria-expanded={isOpen}
          aria-label="Change language"
        >
          <span
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
            style={{ background: iconBg, color: iconColor }}
          >
            <Globe size={18} />
          </span>

          <span className="flex-1 text-left">
            <span className="block text-sm font-medium transition-colors duration-300" style={{ color: primaryText }}>
              Language
            </span>
            <span className="block text-[11px] transition-colors duration-300" style={{ color: secondaryText }}>
              {currentOption?.nativeLabel} · {currentOption?.label}
            </span>
          </span>

          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.22 }}
            style={{ color: secondaryText }}
          >
            <ChevronDown size={16} />
          </motion.div>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div
                className="mx-2 mb-1 mt-1 grid grid-cols-2 gap-1.5 rounded-xl p-2 transition-colors duration-300"
                style={{ background: 'rgba(101,19,23,0.05)', border: `1px solid ${border}` }}
              >
                {DRAWER_LANGUAGE_OPTIONS.map((option) => {
                  const selected = option.code === language;
                  return (
                    <button
                      key={option.code}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => handleSelect(option.code)}
                      className="flex flex-col items-center rounded-xl py-2.5 text-center transition-all active:scale-[0.97] duration-150"
                      style={{
                        background: selected ? 'rgba(101,19,23,0.12)' : 'transparent',
                        border: selected ? `1px solid rgba(101,19,23,0.28)` : '1px solid transparent',
                        color: selected ? accent : primaryText,
                      }}
                    >
                      <span
                        className="block text-sm font-bold"
                        style={{ fontFamily: '"Noto Sans Devanagari", sans-serif' }}
                      >
                        {option.nativeLabel}
                      </span>
                      <span className="block text-[10px] opacity-75">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  })
);
