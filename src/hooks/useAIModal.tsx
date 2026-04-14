import { createContext, useContext, useState, ReactNode } from 'react';
import { Bhajan } from '@/data/bhajans';

interface AIModalContextType {
  isOpen: boolean;
  openAI: () => void;
  closeAI: () => void;
  selectedBhajan: Bhajan | null;
  setSelectedBhajan: (bhajan: Bhajan | null) => void;
}

const AIModalContext = createContext<AIModalContextType | undefined>(undefined);

export function AIModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBhajan, setSelectedBhajan] = useState<Bhajan | null>(null);

  return (
    <AIModalContext.Provider
      value={{
        isOpen,
        openAI: () => setIsOpen(true),
        closeAI: () => setIsOpen(false),
        selectedBhajan,
        setSelectedBhajan,
      }}
    >
      {children}
    </AIModalContext.Provider>
  );
}

export function useAIModal() {
  const context = useContext(AIModalContext);
  if (!context) {
    throw new Error('useAIModal must be used within AIModalProvider');
  }
  return context;
}
