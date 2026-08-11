import { memo, useCallback, useEffect, useRef } from 'react';
import { useDrawer } from '@/hooks/useDrawer';
import { useNavigation } from '@/hooks/useNavigation';
import { useDrawerTheme } from '@/hooks/useDrawerTheme';
import { DrawerOverlay } from './DrawerOverlay';
import { DrawerHeader } from './DrawerHeader';
import { UserProfileCard } from './UserProfileCard';
import { NavigationGroup } from './NavigationGroup';
import { NavigationItemComponent } from './NavigationItem';
import { LanguageAccordion } from './LanguageAccordion';
import { SettingsGroup } from './SettingsGroup';
import { AboutGroup } from './AboutGroup';
import { DivineThoughtCard } from './DivineThoughtCard';
import { DrawerFooter } from './DrawerFooter';

function SectionDivider() {
  const { divider } = useDrawerTheme();
  return (
    <div className="my-2 px-4">
      <div className="h-px transition-colors duration-300" style={{ background: divider }} />
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  const { sectionLabel } = useDrawerTheme();
  return (
    <p
      className="mb-1 mt-3 px-4 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors duration-300"
      style={{ color: sectionLabel }}
    >
      {label}
    </p>
  );
}

export const MobileDrawer = memo(function MobileDrawer() {
  const { isOpen, closeDrawer } = useDrawer();
  const { mainItems, personalItems, isActive } = useNavigation();
  const { drawerBg } = useDrawerTheme();
  const drawerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, closeDrawer]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      if (drawerRef.current && drawerRef.current.contains(document.activeElement)) {
        (document.activeElement as HTMLElement)?.blur();
      }
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const touchStartX = useRef<number>(0);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!isOpen) return;
      const delta = touchStartX.current - e.changedTouches[0].clientX;
      if (delta > 60) closeDrawer();
    },
    [closeDrawer, isOpen],
  );

  useEffect(() => {
    if (!isOpen || !drawerRef.current) {
      if (drawerRef.current && drawerRef.current.contains(document.activeElement)) {
        (document.activeElement as HTMLElement)?.blur();
      }
      return;
    }
    const el = drawerRef.current;
    const focusable = el.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener('keydown', trap);
    
    const timer = setTimeout(() => {
      first?.focus();
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', trap);
      if (el && el.contains(document.activeElement)) {
        (document.activeElement as HTMLElement)?.blur();
      }
    };
  }, [isOpen]);

  return (
    <>
      <DrawerOverlay isOpen={isOpen} onClose={closeDrawer} />

      <div
        ref={drawerRef}
        role="dialog"
        aria-modal={isOpen}
        aria-label="Main navigation menu"
        {...(!isOpen ? { 'aria-hidden': true, inert: '' } : {})}
        className={`fixed inset-y-0 left-0 z-[130] flex flex-col overflow-hidden transition-transform duration-200 ease-out ${
          isOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'
        }`}
        style={{
          width: '85%',
          maxWidth: '360px',
          height: '100dvh',
          borderRadius: '0 28px 28px 0',
          background: drawerBg,
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          willChange: 'transform',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <DrawerHeader onClose={closeDrawer} />

        <div
          className="flex-1 overflow-y-auto overscroll-contain pb-28"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <UserProfileCard onClose={closeDrawer} />
          <SectionDivider />

          <SectionLabel label="Explore" />
          <NavigationGroup label="">
            {mainItems.map((item) => (
              <NavigationItemComponent
                key={item.id}
                item={item}
                isActive={isActive(item.route)}
                onClose={closeDrawer}
              />
            ))}
          </NavigationGroup>

          <SectionDivider />

          <SectionLabel label="Personal" />
          <NavigationGroup label="">
            {personalItems.map((item) => (
              <NavigationItemComponent
                key={item.id}
                item={item}
                isActive={isActive(item.route)}
                onClose={closeDrawer}
              />
            ))}
          </NavigationGroup>

          <SectionDivider />
          <SectionLabel label="Language" />
          <LanguageAccordion />

          <SectionDivider />
          <SectionLabel label="Settings" />
          <SettingsGroup onClose={closeDrawer} />

          <SectionDivider />
          <SectionLabel label="About" />
          <AboutGroup onClose={closeDrawer} />

          <SectionDivider />
          <div className="mb-4 mt-2">
            <DivineThoughtCard />
          </div>

          <DrawerFooter onClose={closeDrawer} />
        </div>
      </div>

      <style>{`
        @keyframes drawer-ripple {
          to { transform: scale(3); opacity: 0; }
        }
        div[aria-label="Main navigation menu"] ::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
});
