import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDrawerTheme } from '@/hooks/useDrawerTheme';
import { ABOUT_ITEMS, APP_VERSION } from '@/config/menu.config';

interface AboutGroupProps {
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

export const AboutGroup = memo(function AboutGroup({ onClose }: AboutGroupProps) {
  const { primaryText, secondaryText, hoverBg, iconBg, iconColor } = useDrawerTheme();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col gap-0.5 px-2"
    >
      {ABOUT_ITEMS.map((item) => {
        const Icon = item.icon;

        return (
          <motion.div key={item.id} variants={itemVariants}>
            <Link
              to={item.route || '/'}
              onClick={onClose}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C67A2D]"
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = hoverBg; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <span
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                style={{ background: iconBg, color: iconColor }}
              >
                <Icon size={18} />
              </span>
              <span
                className="flex-1 text-sm font-medium transition-colors duration-300"
                style={{ color: primaryText }}
              >
                {item.titleFallback}
              </span>
              <ExternalLink size={13} className="opacity-30" style={{ color: secondaryText }} />
            </Link>
          </motion.div>
        );
      })}

      <p className="mt-2 px-3 text-[10px] transition-colors duration-300" style={{ color: secondaryText }}>
        Raghavam v{APP_VERSION} · Made with 🙏
      </p>
    </motion.div>
  );
});
