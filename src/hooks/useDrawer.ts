import { useDrawerContext } from '@/context/DrawerContext';

/**
 * Hook to access drawer open/close state and actions.
 * Must be used inside <DrawerProvider>.
 */
export function useDrawer() {
  return useDrawerContext();
}
