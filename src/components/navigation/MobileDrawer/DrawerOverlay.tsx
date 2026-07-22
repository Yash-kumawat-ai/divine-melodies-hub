import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DRAWER_ANIMATION } from '@/constants/drawerTokens';

interface DrawerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DrawerOverlay = memo(function DrawerOverlay({ isOpen, onClose }: DrawerOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DRAWER_ANIMATION.overlayDuration, ease: 'easeOut' }}
          className="fixed inset-0 z-[120] bg-black/45 backdrop-blur-[2px]"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </AnimatePresence>
  );
});
