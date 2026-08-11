import { memo, forwardRef } from 'react';
import type { ReactNode } from 'react';

interface NavigationGroupProps {
  label: string;
  children: ReactNode;
}

export const NavigationGroup = memo(
  forwardRef<HTMLDivElement, NavigationGroupProps>(function NavigationGroup(
    { label, children }: NavigationGroupProps,
    ref
  ) {
    return (
      <div ref={ref} className="mb-1">
        {label && (
          <p
            className="mb-1 px-4 text-[10px] font-bold uppercase tracking-[0.12em]"
            style={{ color: '#8B6D52' }}
          >
            {label}
          </p>
        )}
        <div role="list" className="flex flex-col gap-1.5 px-2">
          {children}
        </div>
      </div>
    );
  })
);
