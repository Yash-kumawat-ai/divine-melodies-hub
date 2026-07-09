import type { LucideIcon } from 'lucide-react';
import type { SupportedLanguage } from '@/hooks/useLanguage';

export type NavigationGroupId =
  | 'main'
  | 'personal'
  | 'settings'
  | 'about';

export interface NavigationItem {
  id: string;
  titleKey: string;
  titleFallback: string;
  route: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  group: NavigationGroupId;
  badge?: 'notification' | 'new' | 'count';
  badgeCount?: number;
  permission?: 'public' | 'auth' | 'admin';
  visible?: boolean;
  featureFlag?: string;
  /** Whether this item opens an accordion (e.g. language) */
  isAccordion?: boolean;
  accordionId?: string;
}

export interface NavigationGroup {
  id: NavigationGroupId;
  labelKey: string;
  labelFallback: string;
  items: NavigationItem[];
}

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
  flag?: string;
}

export interface AboutItem {
  id: string;
  titleKey: string;
  titleFallback: string;
  route?: string;
  href?: string;
  icon: LucideIcon;
}

export interface SettingsItem {
  id: string;
  titleKey: string;
  titleFallback: string;
  route?: string;
  icon: LucideIcon;
  action?: 'theme' | 'navigate';
}
