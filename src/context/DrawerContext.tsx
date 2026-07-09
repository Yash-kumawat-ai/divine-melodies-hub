import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from 'react';
import type { DrawerContextValue, DrawerState, DrawerAction } from '@/types/drawer';

const DrawerContext = createContext<DrawerContextValue | null>(null);

function drawerReducer(state: DrawerState, action: DrawerAction): DrawerState {
  switch (action.type) {
    case 'OPEN':
      return { ...state, isOpen: true };
    case 'CLOSE':
      return { ...state, isOpen: false };
    case 'TOGGLE':
      return { ...state, isOpen: !state.isOpen };
    default:
      return state;
  }
}

const initialState: DrawerState = { isOpen: false };

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(drawerReducer, initialState);

  const openDrawer = useCallback(() => dispatch({ type: 'OPEN' }), []);
  const closeDrawer = useCallback(() => dispatch({ type: 'CLOSE' }), []);
  const toggleDrawer = useCallback(() => dispatch({ type: 'TOGGLE' }), []);

  const value = useMemo<DrawerContextValue>(
    () => ({ isOpen: state.isOpen, openDrawer, closeDrawer, toggleDrawer }),
    [state.isOpen, openDrawer, closeDrawer, toggleDrawer],
  );

  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>;
}

export function useDrawerContext(): DrawerContextValue {
  const ctx = useContext(DrawerContext);
  if (!ctx) {
    throw new Error('useDrawerContext must be used within DrawerProvider');
  }
  return ctx;
}
