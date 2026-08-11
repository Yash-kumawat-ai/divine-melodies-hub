import { memo } from 'react';
import { useDrawer } from '@/hooks/useDrawer';

interface HamburgerButtonProps {
  className?: string;
}

export const HamburgerButton = memo(function HamburgerButton({ className = '' }: HamburgerButtonProps) {
  const { isOpen, toggleDrawer } = useDrawer();

  return (
    <button
      type="button"
      onClick={toggleDrawer}
      className={`relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C67A2D] ${className}`}
      style={{
        background: isOpen ? 'rgba(198,122,45,0.14)' : 'rgba(198,122,45,0.07)',
        border: '1px solid rgba(198,122,45,0.2)',
      }}
      aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
      aria-expanded={isOpen}
      aria-controls="mobile-navigation-drawer"
    >
      {/* Animated hamburger lines via CSS */}
      <div className="relative flex h-4 w-5 flex-col justify-between">
        <span
          className={`block h-0.5 w-full rounded-full transition-transform duration-200 ease-in-out ${
            isOpen ? 'rotate-45 translate-y-[6px]' : ''
          }`}
          style={{ background: '#C67A2D', transformOrigin: 'center' }}
        />
        <span
          className={`block h-0.5 w-4/5 rounded-full transition-all duration-150 ease-in-out ${
            isOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'
          }`}
          style={{ background: '#C67A2D' }}
        />
        <span
          className={`block h-0.5 w-full rounded-full transition-transform duration-200 ease-in-out ${
            isOpen ? '-rotate-45 -translate-y-[6px]' : ''
          }`}
          style={{ background: '#C67A2D', transformOrigin: 'center' }}
        />
      </div>
    </button>
  );
});
