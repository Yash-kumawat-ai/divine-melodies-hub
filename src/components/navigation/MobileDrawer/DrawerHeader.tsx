import { memo } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDrawerTheme } from '@/hooks/useDrawerTheme';

interface DrawerHeaderProps {
  onClose: () => void;
}

export const DrawerHeader = memo(function DrawerHeader({ onClose }: DrawerHeaderProps) {
  const { headerGradient, border, secondaryText, accent } = useDrawerTheme();

  return (
    <div
      className="relative flex flex-col overflow-hidden transition-colors duration-300"
      style={{
        background: headerGradient,
        padding: '20px 20px 18px',
        borderBottom: `1px solid ${border}`,
      }}
    >
      {/* Decorative mandala */}
      <svg
        className="pointer-events-none absolute -right-8 -top-8 opacity-[0.06]"
        width="160" height="160" viewBox="0 0 200 200"
        fill={accent} aria-hidden="true"
      >
        <circle cx="100" cy="100" r="90" fill="none" stroke={accent} strokeWidth="2" />
        <circle cx="100" cy="100" r="70" fill="none" stroke={accent} strokeWidth="1.5" />
        <circle cx="100" cy="100" r="50" fill="none" stroke={accent} strokeWidth="1" />
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i / 16) * Math.PI * 2;
          const x1 = 100 + 50 * Math.cos(angle);
          const y1 = 100 + 50 * Math.sin(angle);
          const x2 = 100 + 90 * Math.cos(angle);
          const y2 = 100 + 90 * Math.sin(angle);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={accent} strokeWidth="1" />;
        })}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const cx = 100 + 70 * Math.cos(angle);
          const cy = 100 + 70 * Math.sin(angle);
          return <circle key={i} cx={cx} cy={cy} r="4" fill={accent} opacity="0.6" />;
        })}
        <circle cx="100" cy="100" r="8" fill={accent} />
      </svg>

      {/* Temple silhouette */}
      <svg
        className="pointer-events-none absolute bottom-0 left-0 right-0 opacity-[0.04]"
        viewBox="0 0 360 60" preserveAspectRatio="none"
        aria-hidden="true" style={{ width: '100%', height: '60px' }}
      >
        <path
          d="M0 60 L0 40 L20 40 L20 20 L25 10 L30 20 L30 40 L60 40 L60 30 L65 15 L70 5 L75 15 L80 30 L80 40 L130 40 L130 25 L140 10 L150 0 L160 10 L170 25 L170 40 L190 40 L190 25 L200 10 L210 0 L220 10 L230 25 L230 40 L280 40 L280 30 L285 15 L290 5 L295 15 L300 30 L300 40 L330 40 L330 20 L335 10 L340 20 L340 40 L360 40 L360 60 Z"
          fill={accent}
        />
      </svg>

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full transition-colors"
        style={{ background: 'rgba(198,122,45,0.10)', color: secondaryText }}
        aria-label="Close menu"
      >
        <X size={16} strokeWidth={2.5} />
      </button>

      {/* Logo + Brand */}
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
          className="flex h-11 w-11 items-center justify-center rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, #C67A2D 0%, #E89A4A 100%)',
            boxShadow: '0 4px 16px rgba(198,122,45,0.35)',
          }}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="white" aria-hidden="true">
            <text x="50%" y="70%" textAnchor="middle" fontSize="18" fontFamily="serif">ॐ</text>
          </svg>
        </motion.div>

        <motion.div
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          <h1
            className="text-lg font-bold leading-tight tracking-wide transition-colors duration-300"
            style={{
              fontFamily: '"Cinzel", "Georgia", serif',
              color: accent,
              letterSpacing: '0.05em',
            }}
          >
            Raghavam
          </h1>
          <p
            className="mt-0.5 text-[10px] leading-tight transition-colors duration-300"
            style={{ color: secondaryText, fontFamily: 'Inter, sans-serif' }}
          >
            Where Devotion Meets Divine Melodies
          </p>
        </motion.div>
      </div>
    </div>
  );
});
