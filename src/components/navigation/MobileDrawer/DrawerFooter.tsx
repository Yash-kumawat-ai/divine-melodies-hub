import { memo, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useDrawerTheme } from '@/hooks/useDrawerTheme';
import { ROUTES } from '@/config/routes';

interface DrawerFooterProps {
  onClose: () => void;
}

export const DrawerFooter = memo(
  forwardRef<HTMLElement, DrawerFooterProps>(function DrawerFooter(
    { onClose }: DrawerFooterProps,
    ref
  ) {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const { language } = useLanguage();
    const isHi = language === 'hi';
    const { footerBorder, secondaryText } = useDrawerTheme();

    const handleLogout = async () => {
      await signOut();
      onClose();
      navigate(ROUTES.HOME);
    };

    return (
      <footer
        ref={ref}
        className="mt-auto px-4 py-4 transition-colors duration-300"
        style={{ borderTop: `1px solid ${footerBorder}` }}
      >
        {user ? (
          <button
            type="button"
            onClick={handleLogout}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-2xl border border-[#F2C7C0] dark:border-red-900/50 bg-red-50/80 dark:bg-red-950/30 text-[#B42318] dark:text-red-300 text-xs font-bold shadow-sm transition-colors active:scale-[0.98]"
          >
            <LogOut size={16} />
            {isHi ? 'लॉग आउट' : 'Log Out'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('/auth/login');
            }}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 text-primary text-xs font-bold shadow-sm transition-colors active:scale-[0.98]"
          >
            <LogIn size={16} />
            {isHi ? 'लॉग इन करें' : 'Log In'}
          </button>
        )}

        <p
          className="mt-3 text-center text-[10px] transition-colors duration-300"
          style={{ color: secondaryText, fontFamily: 'Inter, sans-serif' }}
        >
          Raghavam · Where Devotion Meets Melodies
        </p>
      </footer>
    );
  })
);
