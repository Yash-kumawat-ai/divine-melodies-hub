import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface BhajanModalOpenContextValue {
  isBhajanModalOpen: boolean;
  setBhajanModalOpen: (open: boolean) => void;
}

const BhajanModalOpenContext = createContext<BhajanModalOpenContextValue | null>(null);

export function BhajanModalOpenProvider({ children }: { children: ReactNode }) {
  const [isBhajanModalOpen, setBhajanModalOpen] = useState(false);
  const value = useMemo(
    () => ({ isBhajanModalOpen, setBhajanModalOpen }),
    [isBhajanModalOpen],
  );
  return (
    <BhajanModalOpenContext.Provider value={value}>{children}</BhajanModalOpenContext.Provider>
  );
}

export function useBhajanModalOpen() {
  const context = useContext(BhajanModalOpenContext);
  if (!context) {
    throw new Error("useBhajanModalOpen must be used within BhajanModalOpenProvider");
  }
  return context;
}
