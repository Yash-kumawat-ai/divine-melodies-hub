import { useState, useEffect, useRef } from 'react';

/**
 * High-performance scroll direction hook with hysteresis thresholds:
 * - scrollY < 50px: Always visible (top of page)
 * - Scrolling down with delta > 10px past 80px: Hide navigation
 * - Scrolling up with delta < -10px: Show navigation
 * Uses requestAnimationFrame and passive listeners for 60fps smooth updates without micro-jitter.
 */
export function useScrollDirection() {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const delta = currentScrollY - lastScrollY.current;

        // 1. Top of page always shows navigation
        if (currentScrollY < 50) {
          setIsVisible(true);
        } else if (delta > 10 && currentScrollY > 80) {
          // 2. Scrolling down with significant movement (>10px) past 80px -> hide
          setIsVisible(false);
        } else if (delta < -10) {
          // 3. Scrolling up with significant movement (>10px) -> show
          setIsVisible(true);
        }

        lastScrollY.current = currentScrollY;
        ticking.current = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return isVisible;
}
