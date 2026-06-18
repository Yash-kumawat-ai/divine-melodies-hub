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
    <div className={`inline-flex items-center gap-1 text-xs text-amber-200/90 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md ${className}`}>
      <Clock className="w-3 h-3 text-amber-400" />
      <span className="font-semibold tracking-wide">
        {label ? `${label} ` : ''}
        {formatTime(minutes)}
      </span>
    </div>
  );
}
