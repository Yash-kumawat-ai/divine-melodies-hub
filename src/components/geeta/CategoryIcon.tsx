import React from 'react';
import {
  GraduationCap,
  HeartCrack,
  Brain,
  Compass,
  Flame,
  ShieldAlert,
  BatteryLow,
  Sunrise,
  Scale,
  Coins,
  Clock,
  Crown,
  Users,
  Briefcase,
  Sun,
  BookOpen,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, LucideIcon> = {
  GraduationCap,
  HeartCrack,
  Brain,
  Compass,
  Flame,
  ShieldAlert,
  BatteryLow,
  Sunrise,
  Scale,
  Coins,
  Clock,
  Crown,
  Users,
  Briefcase,
  Sun,
  BookOpen,
  Sparkles,
};

interface CategoryIconProps {
  name: string | null;
  className?: string;
  size?: number;
  containerClassName?: string;
}

export function CategoryIcon({
  name,
  className,
  size = 22,
  containerClassName,
}: CategoryIconProps) {
  const IconComponent = (name && ICON_MAP[name]) ? ICON_MAP[name] : BookOpen;

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-xl bg-saffron/10 text-saffron-dark dark:bg-amber-500/15 dark:text-amber-300 transition-colors',
        containerClassName
      )}
      aria-hidden="true"
    >
      <IconComponent size={size} className={cn('shrink-0', className)} />
    </div>
  );
}
