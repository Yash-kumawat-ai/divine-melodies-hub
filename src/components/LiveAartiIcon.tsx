import { cn } from '@/lib/utils';
import playLiveIcon from '@/pages/images/svg/play button live.svg';

interface LiveAartiIconProps {
  className?: string;
}

/** Shared Live Aarti play badge (desktop + mobile). */
export function LiveAartiIcon({ className }: LiveAartiIconProps) {
  return (
    <img
      src={playLiveIcon}
      alt=""
      aria-hidden="true"
      className={cn('h-5 w-5 object-contain shrink-0', className)}
      draggable={false}
    />
  );
}

export default LiveAartiIcon;
