import { memo } from 'react';

interface DrawerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DrawerOverlay = memo(function DrawerOverlay({ isOpen, onClose }: DrawerOverlayProps) {
  return (
    <div
      className={`fixed inset-0 z-[120] bg-black/45 backdrop-blur-[2px] transition-opacity duration-200 ease-out ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
      aria-hidden={!isOpen}
    />
  );
});
