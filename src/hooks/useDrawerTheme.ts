import { useMemo } from 'react';
import { useTheme } from '@/hooks/useTheme';

/**
 * Returns a complete set of theme-aware color tokens for the drawer.
 * Components consume this hook so a single theme toggle instantly
 * re-renders every colour in the drawer.
 */
export function useDrawerTheme() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return useMemo(() => ({
    isDark,

    /** Drawer panel background */
    drawerBg: isDark ? '#1a1006' : '#FFFDF8',

    /** Card / profile card background */
    cardBg: isDark ? '#231508' : '#FFF8EF',

    /** Slightly darker secondary background */
    secondaryBg: isDark ? '#1E1309' : '#F9F3E8',

    /** Main body text */
    primaryText: isDark ? '#F0E0C8' : '#3B2414',

    /** Subdued / label text */
    secondaryText: isDark ? '#A88B6E' : '#8B6D52',

    /** Border color */
    border: isDark ? '#2E1E10' : '#E9DDCF',

    /** Subtle hover background — burgundy brand */
    hoverBg: isDark ? 'rgba(230,196,106,0.08)' : 'rgba(101,19,23,0.06)',

    /** Active item background */
    activeBg: isDark ? 'rgba(230,196,106,0.12)' : 'rgba(101,19,23,0.10)',

    /** Active indicator bar and accent */
    accent: isDark ? '#E6C46A' : '#651317',

    /** Danger / sign-out */
    danger: '#E53935',
    dangerBg: isDark ? 'rgba(229,57,53,0.12)' : 'rgba(229,57,53,0.07)',
    dangerBorder: isDark ? 'rgba(229,57,53,0.25)' : 'rgba(229,57,53,0.18)',

    /** Section label */
    sectionLabel: isDark ? '#7A5C3E' : '#8B6D52',

    /** Divider */
    divider: isDark ? '#2E1E10' : '#E9DDCF',

    /** Icon container background (resting) */
    iconBg: isDark ? 'rgba(230,196,106,0.10)' : 'rgba(101,19,23,0.07)',

    /** Icon color (resting) */
    iconColor: isDark ? '#E6C46A' : '#651317',

    /** Header gradient */
    headerGradient: isDark
      ? 'linear-gradient(135deg, #1a1006 0%, #231508 50%, #1E130A 100%)'
      : 'linear-gradient(135deg, #FFFDF8 0%, #F9F3E8 50%, #FFF4E0 100%)',

    /** Profile card gradient */
    profileCardGradient: isDark
      ? 'linear-gradient(135deg, #231508 0%, #1a1006 100%)'
      : 'linear-gradient(135deg, #FFF8EF 0%, #F9F3E8 100%)',

    /** Quote card gradient */
    quoteCardGradient: isDark
      ? 'linear-gradient(135deg, #231508 0%, #1E1309 100%)'
      : 'linear-gradient(135deg, #FFF8EF 0%, #F9F0E0 100%)',

    /** Footer border + logout button */
    footerBorder: isDark ? '#2E1E10' : '#E9DDCF',
  }), [isDark]);
}
