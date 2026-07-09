import { memo } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface NavigationGroupProps {
  label: string;
  children: ReactNode;
  delay?: number;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04 },
  },
};

export const NavigationGroup = memo(function NavigationGroup({
  label,
  children,
  delay = 0,
}: NavigationGroupProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      transition={{ delay }}
      className="mb-1"
    >
      {label && (
        <p
          className="mb-1 px-4 text-[10px] font-bold uppercase tracking-[0.12em]"
          style={{ color: '#8B6D52' }}
        >
          {label}
        </p>
      )}
      <div role="list" className="flex flex-col gap-0.5 px-2">
        {children}
      </div>
    </motion.div>
  );
});
