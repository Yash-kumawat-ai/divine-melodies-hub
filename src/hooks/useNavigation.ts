import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { MAIN_NAV_ITEMS, PERSONAL_NAV_ITEMS } from '@/config/menu.config';
import type { NavigationItem } from '@/types/navigation';

/**
 * Hook that returns filtered navigation items and active-state helpers.
 */
export function useNavigation() {
  const { pathname } = useLocation();

  const isActive = useCallback(
    (route: string): boolean => {
      if (route === '/') return pathname === '/';
      return pathname.startsWith(route);
    },
    [pathname],
  );

  const mainItems = useMemo<NavigationItem[]>(
    () => MAIN_NAV_ITEMS.filter((item) => item.visible !== false),
    [],
  );

  const personalItems = useMemo<NavigationItem[]>(
    () => PERSONAL_NAV_ITEMS.filter((item) => item.visible !== false),
    [],
  );

  return { mainItems, personalItems, isActive, pathname };
}
