import { memo } from 'react';

interface NotificationBadgeProps {
  count?: number;
  variant?: 'dot' | 'count' | 'new';
}

export const NotificationBadge = memo(function NotificationBadge({
  count,
  variant = 'count',
}: NotificationBadgeProps) {
  if (variant === 'dot') {
    return (
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: '#E53935' }}
        aria-label="New notification"
      />
    );
  }

  if (variant === 'new') {
    return (
      <span
        className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none text-white"
        style={{ background: '#C67A2D' }}
        aria-label="New feature"
      >
        NEW
      </span>
    );
  }

  if (!count || count <= 0) return null;

  return (
    <span
      className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-none text-white"
      style={{ background: '#E53935' }}
      aria-label={`${count} notifications`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
});
