import React from 'react';

interface LiveBadgeProps {
  className?: string;
}

export default function LiveBadge({ className = '' }: LiveBadgeProps) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-[10px] font-extrabold tracking-wider uppercase shadow-2xs ${className}`}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]"></span>
      </span>
      <span>LIVE</span>
    </div>
  );
}
