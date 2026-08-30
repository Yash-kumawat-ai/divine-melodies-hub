import { memo, forwardRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useDrawerTheme } from '@/hooks/useDrawerTheme';
import { NotificationBadge } from './NotificationBadge';
import type { NavigationItem } from '@/types/navigation';

interface NavigationItemProps {
  item: NavigationItem;
  isActive: boolean;
  onClose: () => void;
  badgeCount?: number;
}

export const NavigationItemComponent = memo(
  forwardRef<HTMLDivElement, NavigationItemProps>(function NavigationItemComponent(
    { item, isActive, onClose, badgeCount }: NavigationItemProps,
    ref
  ) {
    const { primaryText, secondaryText, activeBg, hoverBg, iconBg, iconColor, accent, border } = useDrawerTheme();

    const Icon = item.icon;

    return (
      <div ref={ref} role="listitem" className="px-1">
        <Link
          to={item.route}
          onClick={() => {
            setTimeout(onClose, 120);
          }}
          aria-current={isActive ? 'page' : undefined}
          className="relative flex items-center gap-3 overflow-hidden rounded-2xl min-h-[52px] px-3.5 py-3 transition-all duration-150 active:scale-[0.98] active:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#651317]/50 border"
          style={{
            background: isActive ? activeBg : 'transparent',
            borderColor: isActive ? 'rgba(101,19,23,0.18)' : border,
          }}
          onMouseEnter={(e) => {
            if (!isActive) (e.currentTarget as HTMLElement).style.background = hoverBg;
          }}
          onMouseLeave={(e) => {
            if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
          }}
        >
          {isActive && (
            <span
              className="absolute inset-y-2 left-0 w-1 rounded-full"
              style={{ background: accent }}
              aria-hidden="true"
            />
          )}

          <span
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-200"
            style={{
              background: isActive ? 'rgba(101,19,23,0.14)' : iconBg,
              color: isActive ? accent : iconColor,
            }}
          >
            <Icon className="h-5 w-5" />
          </span>

          <span
            className="flex-1 text-[15px] leading-tight transition-colors duration-150"
            style={{
              fontFamily: 'Inter, sans-serif',
              color: isActive ? accent : primaryText,
              fontWeight: isActive ? 600 : 500,
            }}
          >
            {item.titleFallback}
          </span>

          {item.badge === 'notification' && badgeCount !== undefined && badgeCount > 0 && (
            <NotificationBadge count={badgeCount} variant="count" />
          )}
          {item.badge === 'new' && <NotificationBadge variant="new" />}

          <ChevronRight
            size={16}
            className="flex-shrink-0 opacity-45 transition-transform duration-150"
            style={{
              color: isActive ? accent : secondaryText,
              transform: isActive ? 'translateX(2px)' : 'translateX(0)',
            }}
          />
        </Link>
      </div>
    );
  })
);
