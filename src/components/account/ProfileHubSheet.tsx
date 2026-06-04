import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronRight,
  Heart,
  HelpCircle,
  LogIn,
  LogOut,
  Pencil,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
type ProfileHubSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type MenuRowProps = {
  to: string;
  icon: React.ReactNode;
  label: string;
  onNavigate?: () => void;
};

function MenuRow({ to, icon, label, onNavigate }: MenuRowProps) {
  return (
    <SheetClose asChild>
      <Link
        to={to}
        onClick={onNavigate}
        className="flex min-h-[52px] items-center gap-3 rounded-2xl border border-border/70 bg-card/80 px-4 py-3 text-sm font-semibold text-foreground shadow-sm transition-colors active:scale-[0.99] hover:border-primary/25 hover:bg-primary/5"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </span>
        <span className="flex-1 text-left">{label}</span>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
      </Link>
    </SheetClose>
  );
}

export default function ProfileHubSheet({ open, onOpenChange }: ProfileHubSheetProps) {
  const { user, profile, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const displayName = profile?.name || user?.email?.split('@')[0] || t('guestDevotee');
  const contactLine = profile?.phone_number || user?.email || t('manageDevotion');
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    await signOut();
    onOpenChange(false);
    navigate('/');
  };

  return (
    <Sheet modal={false} open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto flex max-h-[92dvh] w-full max-w-lg flex-col overflow-y-auto overscroll-contain rounded-t-[1.75rem] border-border/80 bg-background/95 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 shadow-[0_-24px_70px_hsl(20_30%_10%/0.25)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#0d0b08]/95"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{t('accountSettings')}</SheetTitle>
        </SheetHeader>

        <div className="mb-4 flex items-start gap-3 pr-10">
          <Avatar className="h-14 w-14 shrink-0 border border-primary/25 bg-background">
            <AvatarImage src={profile?.avatar_url} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-foreground">{displayName}</p>
            <p className="truncate text-sm text-muted-foreground">{contactLine}</p>
            <p className="mt-1 text-xs font-medium text-primary">
              {user ? t('signedInDevotee') : t('guestDevotee')}
            </p>
          </div>
        </div>

        {user ? (
          <>
            <SheetClose asChild>
              <Link
                to="/account"
                className="mb-4 flex min-h-[52px] items-center gap-3 rounded-2xl border border-primary/25 bg-gradient-to-r from-amber-50 via-orange-50/80 to-background px-4 py-3 shadow-sm dark:from-amber-950/40 dark:via-orange-950/20 dark:to-background"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Pencil className="h-5 w-5" />
                </span>
                <span className="flex-1 text-sm font-semibold text-foreground">{t('editProfile')}</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            </SheetClose>

            <div className="mb-4 rounded-2xl border border-amber-300/30 bg-gradient-to-br from-amber-50 via-background to-orange-50 p-4 dark:from-amber-950/30 dark:via-background dark:to-orange-950/20">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">{t('currentPlan')}</p>
                  <p className="mt-1 font-display text-lg font-bold text-foreground">{t('freePlan')}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t('sevaPlanBlurb')}</p>
                </div>
                <Sparkles className="h-6 w-6 shrink-0 text-amber-500" />
              </div>
              <SheetClose asChild>
                <Link
                  to="/pricing"
                  className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-sm font-semibold text-white shadow-md"
                >
                  {t('viewPlans')}
                </Link>
              </SheetClose>
            </div>

            <nav className="flex flex-col gap-2 overflow-y-auto">
              <MenuRow to="/account/liked" icon={<Heart className="h-5 w-5" />} label={t('likedBhajans')} />
              <MenuRow to="/notifications" icon={<Bell className="h-5 w-5" />} label={t('notifications')} />
              <MenuRow to="/pricing" icon={<Sparkles className="h-5 w-5" />} label={t('ourSevaPlan')} />
              <MenuRow to="/account/support" icon={<HelpCircle className="h-5 w-5" />} label={t('helpSupport')} />
              <button
                type="button"
                onClick={handleLogout}
                className="mt-1 flex min-h-[52px] items-center gap-3 rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive transition-colors active:scale-[0.99] hover:bg-destructive/10"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
                  <LogOut className="h-5 w-5" />
                </span>
                <span className="flex-1 text-left">{t('logout')}</span>
              </button>
            </nav>
          </>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">{t('signInToLike')}</p>
            <SheetClose asChild>
              <Button asChild className="min-h-12 w-full rounded-xl">
                <Link to="/auth/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  {t('login')}
                </Link>
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button asChild variant="outline" className="min-h-12 w-full rounded-xl">
                <Link to="/auth/signup">
                  <UserPlus className="mr-2 h-4 w-4" />
                  {t('signUp')}
                </Link>
              </Button>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
