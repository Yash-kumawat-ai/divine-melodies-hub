import { memo, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { useDrawerTheme } from '@/hooks/useDrawerTheme';
import { SETTINGS_ITEMS } from '@/config/menu.config';

interface SettingsGroupProps {
  onClose: () => void;
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
};

export const SettingsGroup = memo(
  forwardRef<HTMLDivElement, SettingsGroupProps>(function SettingsGroup(
    { onClose }: SettingsGroupProps,
    ref
  ) {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const { primaryText, secondaryText, hoverBg, iconBg, iconColor, accent } = useDrawerTheme();

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="mb-1 flex flex-col gap-1.5 px-2"
      >
        {SETTINGS_ITEMS.map((item) => {
          const Icon = item.icon;
          const isTheme = item.action === 'theme';

          return (
            <motion.button
              key={item.id}
              type="button"
              variants={itemVariants}
              onClick={() => {
                if (isTheme) {
                  toggleTheme();
                } else if (item.route) {
                  navigate(item.route);
                  onClose();
                }
              }}
              className="flex w-full items-center gap-3 rounded-2xl min-h-[52px] px-3.5 py-3 text-left border border-transparent transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#651317]/50"
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = hoverBg; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <span
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                style={{ background: iconBg, color: iconColor }}
              >
                {isTheme ? (
                  theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />
                ) : (
                  <Icon size={18} />
                )}
              </span>

              <span
                className="flex-1 text-[15px] font-medium transition-colors duration-300"
                style={{ color: primaryText }}
              >
                {isTheme
                  ? theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'
                  : item.titleFallback}
              </span>

              {!isTheme && (
                <ChevronRight size={15} className="flex-shrink-0 opacity-40" style={{ color: secondaryText }} />
              )}

              {isTheme && (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{ background: 'rgba(101,19,23,0.10)', color: accent }}
                >
                  {theme === 'dark' ? '🌙' : '☀️'}
                </span>
              )}
            </motion.button>
          );
        })}
      </motion.div>
    );
  })
);
