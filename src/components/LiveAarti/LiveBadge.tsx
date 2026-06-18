import React from 'react';
import { motion } from 'framer-motion';

interface LiveBadgeProps {
  className?: string;
}

export default function LiveBadge({ className = '' }: LiveBadgeProps) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-extrabold tracking-wider uppercase ${className}`}>
      <motion.span
        animate={{ scale: [1, 1.35, 1], opacity: [1, 0.5, 1] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]"
      />
      <span>LIVE</span>
    </div>
  );
}
