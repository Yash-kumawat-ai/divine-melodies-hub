import type { ReactNode } from "react";

interface MobileScrollRegionProps {
  children: ReactNode;
}

export default function MobileScrollRegion({ children }: MobileScrollRegionProps) {
  return (
    <div
      className="mobile-scroll-region min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
      style={{
        paddingBottom: "calc(4.75rem + env(safe-area-inset-bottom))",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {children}
    </div>
  );
}
