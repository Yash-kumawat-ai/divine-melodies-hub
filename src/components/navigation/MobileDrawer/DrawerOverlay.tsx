import { memo } from 'react';
import { motion } from 'framer-motion';
import { DRAWER_ANIMATION } from '@/constants/drawerTokens';

interface DrawerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Always mounted — avoids AnimatePresence PopChild `ref` warning on close. */
export const DrawerOverlay = memo(function DrawerOverlay({ isOpen, onClose }: DrawerOverlayProps) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: isOpen ? 1 : 0 }}
      transition={{ duration: DRAWER_ANIMATION.overlayDuration, ease: 'easeOut' }}
      className="fixed inset-0 z-[120] bg-black/45 backdrop-blur-[2px]"
      style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
      onClick={onClose}
      aria-hidden={!isOpen}
    />
  );
});
