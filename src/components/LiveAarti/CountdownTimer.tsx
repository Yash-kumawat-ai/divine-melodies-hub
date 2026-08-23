import React from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  minutes: number;
  label?: string;
  className?: string;
}

export default function CountdownTimer({ minutes, label = '', className = '' }: CountdownTimerProps) {
  const formatTime = (mins: number) => {
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs}h`;
  };

  return (
    <div className={`inline-flex items-center gap-1.5 text-xs text-[#854D0E] dark:text-amber-300 bg-amber-500/10 dark:bg-amber-400/15 border border-amber-500/25 dark:border-amber-400/30 px-2.5 py-0.5 rounded-full font-bold shadow-2xs ${className}`}>
      <Clock className="w-3.5 h-3.5 text-[#A16207] dark:text-amber-300 shrink-0" />
      <span className="tracking-wide">
        {label ? `${label} ` : ''}
        {formatTime(minutes)}
      </span>
    </div>
  );
}
