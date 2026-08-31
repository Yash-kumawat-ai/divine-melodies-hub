import React, { useEffect, useState, useRef, memo, useCallback } from 'react';
import {
  Sparkles,
  Compass,
  CalendarDays,
  Orbit,
  Home,
  Clock,
  Sun,
  Flame,
  UserCheck,
} from 'lucide-react';

interface NavItem {
  id: string;
  labelHi: string;
  labelEn: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'summary',  labelHi: 'सारांश',    labelEn: 'Summary',   icon: <Sparkles className="h-3.5 w-3.5" /> },
  { id: 'chart',    labelHi: 'कुंडली',    labelEn: 'Chart',     icon: <Compass className="h-3.5 w-3.5" /> },
  { id: 'panchang', labelHi: 'पंचांग',    labelEn: 'Panchang',  icon: <CalendarDays className="h-3.5 w-3.5" /> },
  { id: 'planets',  labelHi: 'ग्रह',      labelEn: 'Planets',   icon: <Orbit className="h-3.5 w-3.5" /> },
  { id: 'houses',   labelHi: 'भाव',       labelEn: 'Bhavas',    icon: <Home className="h-3.5 w-3.5" /> },
  { id: 'dasha',    labelHi: 'दशा',       labelEn: 'Dasha',     icon: <Clock className="h-3.5 w-3.5" /> },
  { id: 'dosha',    labelHi: 'योग',       labelEn: 'Yogas',     icon: <Sun className="h-3.5 w-3.5" /> },
  { id: 'remedies', labelHi: 'उपाय',      labelEn: 'Remedies',  icon: <Flame className="h-3.5 w-3.5" /> },
  { id: 'guidance', labelHi: 'गुरु जी',   labelEn: 'Guru Ji',   icon: <UserCheck className="h-3.5 w-3.5" /> },
];

interface KundliStickyNavProps {
  isHi: boolean;
}

const KundliStickyNavInner: React.FC<KundliStickyNavProps> = ({ isHi }) => {
  const [activeId, setActiveId] = useState<string>('summary');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const navContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const isScrollingByClickRef = useRef(false);

  // Auto-scroll active tab into view on smaller devices
  const scrollActiveTabIntoView = useCallback((id: string) => {
    const el = tabRefs.current[id];
    const container = navContainerRef.current;
    if (el && container && container.scrollWidth > container.clientWidth) {
      el.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, []);

  // Update dynamic scroll gradient indicators
  const updateScrollIndicators = useCallback(() => {
    const el = navContainerRef.current;
    if (el) {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
    }
  }, []);

  // IntersectionObserver for efficient scroll spy
  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      if (isScrollingByClickRef.current) return;

      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (visible.length > 0) {
        const topId = visible[0].target.id;
        if (topId && topId !== activeId) {
          setActiveId(topId);
          scrollActiveTabIntoView(topId);
        }
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: '-110px 0px -55% 0px',
      threshold: [0, 0.2, 0.5],
    });

    NAV_ITEMS.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [activeId, scrollActiveTabIntoView]);

  // Handle Resize and Scroll events for dynamic widths
  useEffect(() => {
    updateScrollIndicators();
    const el = navContainerRef.current;
    if (el) {
      el.addEventListener('scroll', updateScrollIndicators, { passive: true });
      window.addEventListener('resize', updateScrollIndicators);
      return () => {
        el.removeEventListener('scroll', updateScrollIndicators);
        window.removeEventListener('resize', updateScrollIndicators);
      };
    }
  }, [updateScrollIndicators]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      isScrollingByClickRef.current = true;
      const offsetTop = el.getBoundingClientRect().top + window.scrollY - 120;

      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });

      setActiveId(id);
      scrollActiveTabIntoView(id);
      window.history.replaceState(null, '', `#${id}`);

      setTimeout(() => {
        isScrollingByClickRef.current = false;
      }, 700);
    }
  };

  return (
    <nav
      aria-label={isHi ? 'कुंडली अनुभाग तालिका' : 'Kundli report table of contents'}
      className="sticky top-14 z-30 bg-background/95 backdrop-blur-md border-y border-brand-gold-border/35 py-1.5 shadow-2xs print:hidden transition-colors duration-200"
    >
      <div className="relative max-w-5xl mx-auto px-1 sm:px-3 md:px-4">
        {/* Left edge dynamic scroll fade mask on mobile */}
        {canScrollLeft && (
          <div
            className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background via-background/80 to-transparent pointer-events-none z-10 sm:hidden animate-in fade-in"
            aria-hidden="true"
          />
        )}

        {/* Right edge dynamic scroll fade mask on mobile */}
        {canScrollRight && (
          <div
            className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background via-background/80 to-transparent pointer-events-none z-10 sm:hidden animate-in fade-in"
            aria-hidden="true"
          />
        )}

        {/* Dynamic Responsive Container */}
        <div
          ref={navContainerRef}
          className="flex items-center justify-start md:justify-between gap-1 sm:gap-1.5 md:gap-2 overflow-x-auto no-scrollbar py-1 px-1 scroll-smooth"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeId === item.id;
            return (
              <div key={item.id} className="relative flex flex-col items-center shrink-0">
                <a
                  ref={(node) => {
                    tabRefs.current[item.id] = node;
                  }}
                  href={`#${item.id}`}
                  onClick={(e) => handleLinkClick(e, item.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className={`whitespace-nowrap px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-all duration-200 select-none ${
                    isActive
                      ? 'bg-[#5C1D0C] text-white font-bold shadow-xs'
                      : 'text-foreground/80 hover:text-brand-primary dark:hover:text-brand-gold hover:bg-brand-primary/8'
                  }`}
                >
                  <span className={isActive ? 'text-amber-200' : 'text-muted-foreground'}>
                    {item.icon}
                  </span>
                  <span>{isHi ? item.labelHi : item.labelEn}</span>
                </a>

                {/* Bottom Active Indicator Bar matching reference image */}
                {isActive && (
                  <div
                    className="absolute -bottom-1.5 w-8 h-0.5 bg-[#5C1D0C] dark:bg-brand-gold rounded-full transition-all duration-300"
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export const KundliStickyNav = memo(KundliStickyNavInner);
