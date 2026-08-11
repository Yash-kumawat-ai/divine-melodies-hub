import { memo, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Flame, LogIn, Sparkles, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useLanguage } from '@/hooks/useLanguage';
import { useDrawerTheme } from '@/hooks/useDrawerTheme';
import { ROUTES } from '@/config/routes';

interface UserProfileCardProps {
  onClose: () => void;
}

export const UserProfileCard = memo(
  forwardRef<any, UserProfileCardProps>(function UserProfileCard(
    { onClose }: UserProfileCardProps,
    ref
  ) {
    const navigate = useNavigate();
    const { user, signInWithGoogle } = useAuth();
    const profile = useProfile();
    const { t } = useLanguage();
    const { profileCardGradient, border, primaryText, secondaryText, accent } = useDrawerTheme();

    const displayName = profile?.name || t('guestDevotee');
    const initials = displayName
      .split(' ')
      .map((p: string) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const cardStyle = {
      background: profileCardGradient,
      border: `1px solid ${border}`,
      boxShadow: '0 4px 16px rgba(101,19,23,0.08)',
    };

    if (!user) {
      return (
        <div
          ref={ref}
          className="mx-4 my-3 overflow-hidden rounded-2xl transition-colors duration-300"
          style={cardStyle}
        >
          <div className="p-4">
            <div className="mb-3 flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: 'rgba(101,19,23,0.10)' }}
              >
                <User size={22} style={{ color: accent }} />
              </div>
              <div>
                <p className="text-sm font-semibold transition-colors duration-300" style={{ color: primaryText }}>
                  {t('guestDevotee')}
                </p>
                <p className="text-xs transition-colors duration-300" style={{ color: secondaryText }}>
                  {t('manageDevotion')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => { signInWithGoogle(); onClose(); }}
              className="btn-royal-primary btn-full mb-2 h-11 rounded-2xl"
            >
              <Sparkles size={16} />
              Continue with Google
            </button>

            <button
              type="button"
              onClick={() => { navigate(ROUTES.AUTH_LOGIN); onClose(); }}
              className="btn-royal-secondary btn-full h-11 rounded-2xl"
            >
              <LogIn size={16} />
              Login
            </button>
          </div>
        </div>
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => { navigate(ROUTES.PROFILE); onClose(); }}
        className="mx-4 my-3 flex w-[calc(100%-2rem)] items-center gap-3 overflow-hidden rounded-2xl p-4 text-left transition-all active:scale-[0.98] duration-300 cursor-pointer"
        style={cardStyle}
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <Avatar className="h-12 w-12" style={{ border: `2px solid ${accent}` }}>
            <AvatarImage src={profile?.avatarUrl} alt={displayName} />
            <AvatarFallback
              style={{ background: 'linear-gradient(135deg, #651317, #8B1E24)', color: 'white', fontSize: '14px', fontWeight: 600 }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div
            className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full"
            style={{ background: accent, border: '1.5px solid rgba(101,19,23,0.2)' }}
          >
            <Flame size={10} color="white" />
          </div>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium" style={{ color: accent }}>
            🙏 Jai Shri Ram,
          </p>
          <p className="truncate text-sm font-bold leading-tight transition-colors duration-300" style={{ color: primaryText }}>
            {displayName}
          </p>
          <p className="mt-0.5 text-[11px] transition-colors duration-300" style={{ color: secondaryText }}>
            {profile?.level || 'Devotee'} · {profile?.streak || 0} day streak
          </p>
        </div>

        <ChevronRight size={18} style={{ color: secondaryText, flexShrink: 0 }} />
      </button>
    );
  })
);
