import { memo, forwardRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDrawerTheme } from '@/hooks/useDrawerTheme';
import { NotificationBadge } from './NotificationBadge';
import type { NavigationItem } from '@/types/navigation';

interface NavigationItemProps {
  item: NavigationItem;
  isActive: boolean;
  onClose: () => void;
  badgeCount?: number;
}

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.22, ease: 'easeOut' } },
};

export const NavigationItemComponent = memo(
  forwardRef<HTMLDivElement, NavigationItemProps>(function NavigationItemComponent(
    { item, isActive, onClose, badgeCount }: NavigationItemProps,
    ref
  ) {
    const { primaryText, secondaryText, activeBg, hoverBg, iconBg, iconColor, accent } = useDrawerTheme();

    const handleRipple = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
      const el = e.currentTarget;
      const span = document.createElement('span');
      const diameter = Math.max(el.clientWidth, el.clientHeight);
      const radius = diameter / 2;
      const rect = el.getBoundingClientRect();

      span.style.cssText = `
        position: absolute;
        border-radius: 50%;
        width: ${diameter}px;
        height: ${diameter}px;
        left: ${e.clientX - rect.left - radius}px;
        top: ${e.clientY - rect.top - radius}px;
        background: rgba(198,122,45,0.18);
        transform: scale(0);
        animation: drawer-ripple 480ms ease-out forwards;
        pointer-events: none;
      `;
      el.appendChild(span);
      setTimeout(() => span.remove(), 520);
    }, []);

    const Icon = item.icon;

    return (
      <motion.div ref={ref} variants={itemVariants} role="listitem">
        <Link
          to={item.route}
          onClick={(e) => {
            handleRipple(e);
            setTimeout(onClose, 120);
          }}
          aria-current={isActive ? 'page' : undefined}
          className="relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C67A2D]"
          style={{ background: isActive ? activeBg : 'transparent' }}
          onMouseEnter={(e) => {
            if (!isActive) (e.currentTarget as HTMLElement).style.background = hoverBg;
          }}
          onMouseLeave={(e) => {
            if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
          }}
        >
          {/* Active indicator bar */}
          {isActive && (
            <span
              className="absolute inset-y-0 left-0 w-0.5 rounded-full"
              style={{ background: accent }}
              aria-hidden="true"
            />
          )}

          {/* Icon */}
          <span
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-200"
            style={{
              background: isActive ? 'rgba(198,122,45,0.15)' : iconBg,
              color: isActive ? accent : iconColor,
            }}
          >
            <Icon className="h-[18px] w-[18px]" />
          </span>

          {/* Label */}
          <span
            className="flex-1 text-sm leading-tight transition-colors duration-150"
            style={{
              fontFamily: 'Inter, sans-serif',
              color: isActive ? accent : primaryText,
              fontWeight: isActive ? 600 : 500,
            }}
          >
            {item.titleFallback}
          </span>

          {/* Badge */}
          {item.badge === 'notification' && badgeCount !== undefined && badgeCount > 0 && (
            <NotificationBadge count={badgeCount} variant="count" />
          )}
          {item.badge === 'new' && <NotificationBadge variant="new" />}

          {/* Chevron */}
          <ChevronRight
            size={15}
            className="flex-shrink-0 opacity-40 transition-transform duration-150"
            style={{
              color: isActive ? accent : secondaryText,
              transform: isActive ? 'translateX(2px)' : 'translateX(0)',
            }}
          />
        </Link>
      </motion.div>
    );
  })
);
