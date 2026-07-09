import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDrawerTheme } from '@/hooks/useDrawerTheme';
import { ROUTES } from '@/config/routes';

interface DrawerFooterProps {
  onClose: () => void;
}

export const DrawerFooter = memo(function DrawerFooter({ onClose }: DrawerFooterProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { footerBorder, secondaryText, danger, dangerBg, dangerBorder } = useDrawerTheme();

  const handleLogout = async () => {
    await signOut();
    onClose();
    navigate(ROUTES.HOME);
  };

  return (
    <footer
      className="mt-auto px-4 py-4 transition-colors duration-300"
      style={{ borderTop: `1px solid ${footerBorder}` }}
    >
      {user ? (
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all active:scale-[0.98] duration-300"
          style={{
            background: dangerBg,
            border: `1px solid ${dangerBorder}`,
            color: danger,
          }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      ) : (
        <div className="text-center">
          <p className="text-[11px] transition-colors duration-300" style={{ color: secondaryText }}>
            🙏 Har Har Mahadev
          </p>
        </div>
      )}

      <p
        className="mt-3 text-center text-[10px] transition-colors duration-300"
        style={{ color: secondaryText, fontFamily: 'Inter, sans-serif' }}
      >
        Raghavam · Where Devotion Meets Melodies
      </p>
    </footer>
  );
});
