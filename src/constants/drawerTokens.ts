/** Design token constants for the Raghavam Mobile Drawer */

export const DRAWER_COLORS = {
  background: '#FFFDF8',
  backgroundSecondary: '#F9F3E8',
  cardBackground: '#FFF8EF',
  primaryAccent: '#C67A2D',
  darkBrown: '#5A3416',
  primaryText: '#3B2414',
  secondaryText: '#8B6D52',
  border: '#E9DDCF',
  hover: 'rgba(198,122,45,0.08)',
  pressed: 'rgba(198,122,45,0.12)',
  badge: '#E53935',
  overlay: 'rgba(0,0,0,0.45)',
} as const;

export const DRAWER_SIZES = {
  width: '85%',
  maxWidth: '360px',
  height: '100vh',
  borderRadius: '0 28px 28px 0',
} as const;

export const DRAWER_SHADOW = '0 10px 40px rgba(0,0,0,0.08)' as const;

export const DRAWER_ANIMATION = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1] as const,
  overlayDuration: 0.25,
  cardScale: { from: 0.98, to: 1 } as const,
  springConfig: { stiffness: 400, damping: 38 } as const,
} as const;

export const DRAWER_SPACING = {
  headerPadding: '20px 20px 16px',
  sectionGap: '8px',
  itemPadding: '12px 16px',
  groupLabelPadding: '0 16px',
  iconSize: 20,
  chevronSize: 16,
  avatarSize: 48,
} as const;
