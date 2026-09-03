import React, { useRef, useEffect, memo } from 'react';
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
import { cn } from '@/lib/utils';

export type KundliTabId =
  | 'overview'
  | 'charts'
  | 'panchang'
  | 'planets'
  | 'houses'
  | 'dasha'
  | 'dosha'
  | 'remedies'
  | 'guruji';

export interface KundliTabItem {
  id: KundliTabId;
  labelHi: string;
  labelEn: string;
  icon: React.ReactNode;
}

export const KUNDLI_TABS: KundliTabItem[] = [
  { id: 'overview', labelHi: 'सारांश', labelEn: 'Overview', icon: <Sparkles className="h-3.5 w-3.5" /> },
  { id: 'charts',   labelHi: 'कुंडली', labelEn: 'Charts',   icon: <Compass className="h-3.5 w-3.5" /> },
  { id: 'panchang', labelHi: 'पंचांग', labelEn: 'Panchang', icon: <CalendarDays className="h-3.5 w-3.5" /> },
  { id: 'planets',  labelHi: 'ग्रह',   labelEn: 'Planets',  icon: <Orbit className="h-3.5 w-3.5" /> },
  { id: 'houses',   labelHi: 'भाव',    labelEn: 'Bhavas',   icon: <Home className="h-3.5 w-3.5" /> },
  { id: 'dasha',    labelHi: 'दशा',    labelEn: 'Dasha',    icon: <Clock className="h-3.5 w-3.5" /> },
  { id: 'dosha',    labelHi: 'दोष व योग', labelEn: 'Yogas', icon: <Sun className="h-3.5 w-3.5" /> },
  { id: 'remedies', labelHi: 'उपाय',   labelEn: 'Remedies', icon: <Flame className="h-3.5 w-3.5" /> },
  { id: 'guruji',   labelHi: 'गुरु जी', labelEn: 'Guru Ji',  icon: <UserCheck className="h-3.5 w-3.5" /> },
];

interface KundliTabBarProps {
  activeTab: KundliTabId;
  onChangeTab: (tabId: KundliTabId) => void;
  isHi: boolean;
}

const KundliTabBarInner: React.FC<KundliTabBarProps> = ({
  activeTab,
  onChangeTab,
  isHi,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Auto-scroll active tab into center view on mobile/tablet
  useEffect(() => {
    const activeEl = tabRefs.current[activeTab];
    const container = containerRef.current;
    if (activeEl && container) {
      const containerWidth = container.clientWidth;
      const tabLeft = activeEl.offsetLeft;
      const tabWidth = activeEl.clientWidth;
      const scrollPos = tabLeft - containerWidth / 2 + tabWidth / 2;

      container.scrollTo({
        left: Math.max(0, scrollPos),
        behavior: 'smooth',
      });
    }
  }, [activeTab]);

  return (
    // Static tab bar that flows naturally with document and matches header navigation theme
    <div className="relative w-full bg-background border-b border-brand-gold-border/30 transition-all">
      <div
        ref={containerRef}
        role="tablist"
        aria-label={isHi ? 'कुण्डली अनुभाग' : 'Kundli Sections'}
        className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none px-2 sm:px-4 max-w-6xl mx-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {KUNDLI_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              onClick={() => onChangeTab(tab.id)}
              className={cn(
                'group relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm whitespace-nowrap transition-colors duration-150 focus:outline-none select-none cursor-pointer border-b-2 -mb-[1px]',
                isActive
                  ? 'text-[#651317] dark:text-amber-400 font-semibold border-[#651317] dark:border-amber-400 bg-transparent'
                  : 'text-muted-foreground font-medium hover:text-[#651317] dark:hover:text-amber-400 border-transparent bg-transparent'
              )}
            >
              <span
                className={cn(
                  'transition-colors duration-150 shrink-0',
                  isActive
                    ? 'text-[#651317] dark:text-amber-400'
                    : 'text-muted-foreground group-hover:text-[#651317] dark:group-hover:text-amber-400'
                )}
              >
                {tab.icon}
              </span>
              <span className="leading-none">{isHi ? tab.labelHi : tab.labelEn}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const KundliTabBar = memo(KundliTabBarInner);
