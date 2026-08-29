import React from 'react';

interface LotusIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function LotusIcon({ className = "w-5 h-5", ...props }: LotusIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Outer Petals with subtle semi-transparent fill */}
      <path
        d="M12 3C10.5 6 8 9 4 10C7 12 9 15 12 21C15 15 17 12 20 10C16 9 13.5 6 12 3Z"
        fill="currentColor"
        fillOpacity="0.12"
      />
      {/* Inner Divine Central Petal */}
      <path
        d="M12 21C10 18 8 14 8 11C8 8 10 5 12 3C14 5 16 8 16 11C16 14 14 18 12 21Z"
      />
      {/* Side Grace Flourishes */}
      <path d="M4 10C6.5 11 8.5 13 9.5 16" />
      <path d="M20 10C17.5 11 15.5 13 14.5 16" />
    </svg>
  );
}
