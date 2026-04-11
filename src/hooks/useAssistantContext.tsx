/**
 * Global context for passing information to the Bhajan Assistant
 * Allows any page/component to set context that the assistant should use
 */

import { createContext, useContext, useState, ReactNode } from 'react';
import { AssistantContext } from '@/components/AIAssistant';

interface AssistantContextProviderState {
  context: AssistantContext | null;
  setContext: (context: AssistantContext | null) => void;
  clearContext: () => void;
  updateContext: (updates: Partial<AssistantContext>) => void;
}

const AssistantContextContext = createContext<AssistantContextProviderState | undefined>(undefined);

export function AssistantContextProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<AssistantContext | null>(null);

  const clearContext = () => setContext(null);

  const updateContext = (updates: Partial<AssistantContext>) => {
    setContext(prev => prev ? { ...prev, ...updates } : updates as AssistantContext);
  };

  return (
    <AssistantContextContext.Provider
      value={{
        context,
        setContext,
        clearContext,
        updateContext,
      }}
    >
      {children}
    </AssistantContextContext.Provider>
  );
}

export function useAssistantContext() {
  const context = useContext(AssistantContextContext);
  if (!context) {
    throw new Error('useAssistantContext must be used within AssistantContextProvider');
  }
  return context;
}
