import { memo } from 'react';
import { motion } from 'framer-motion';
import { useDrawer } from '@/hooks/useDrawer';

interface HamburgerButtonProps {
  className?: string;
}

export const HamburgerButton = memo(function HamburgerButton({ className = '' }: HamburgerButtonProps) {
  const { isOpen, toggleDrawer } = useDrawer();

  return (
    <motion.button
      type="button"
      onClick={toggleDrawer}
      whileTap={{ scale: 0.92 }}
      className={`relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C67A2D] ${className}`}
      style={{
        background: isOpen ? 'rgba(198,122,45,0.14)' : 'rgba(198,122,45,0.07)',
        border: '1px solid rgba(198,122,45,0.2)',
      }}
      aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
      aria-expanded={isOpen}
      aria-controls="mobile-navigation-drawer"
    >
      {/* Animated hamburger lines */}
      <div className="relative flex h-4 w-5 flex-col justify-between">
        <motion.span
          animate={{
            rotate: isOpen ? 45 : 0,
            y: isOpen ? 6 : 0,
          }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
          className="block h-0.5 w-full rounded-full"
          style={{ background: '#C67A2D', transformOrigin: 'center' }}
        />
        <motion.span
          animate={{ opacity: isOpen ? 0 : 1, scaleX: isOpen ? 0 : 1 }}
          transition={{ duration: 0.18 }}
          className="block h-0.5 w-4/5 rounded-full"
          style={{ background: '#C67A2D' }}
        />
        <motion.span
          animate={{
            rotate: isOpen ? -45 : 0,
            y: isOpen ? -6 : 0,
          }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
          className="block h-0.5 w-full rounded-full"
          style={{ background: '#C67A2D', transformOrigin: 'center' }}
        />
      </div>
    </motion.button>
  );
});
