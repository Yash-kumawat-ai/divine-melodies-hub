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
  Bookmark,
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
    <Sheet modal={true} open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto flex max-h-[92vh] sm:max-h-[85vh] w-full max-w-lg flex-col overflow-y-auto overscroll-contain rounded-t-[2.25rem] border-[#E8D8C4] dark:border-amber-500/20 bg-[#FFFDF8] dark:bg-[#120D09] px-6 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-[0_-24px_70px_rgba(101,19,23,0.2)] backdrop-blur-2xl text-stone-900 dark:text-stone-100 z-[120]"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{t('accountSettings')}</SheetTitle>
        </SheetHeader>

        <div className="mb-5 flex items-center gap-3.5 pr-8 border-b border-[#E8D8C4]/60 dark:border-stone-800 pb-4">
          <Avatar className="h-14 w-14 shrink-0 border-2 border-[#E8D8C4] dark:border-amber-500/30 bg-[#FAF0E4] shadow-xs">
            <AvatarImage src={profile?.avatar_url} alt={displayName} />
            <AvatarFallback className="font-extrabold text-[#651317] bg-[#FAF0E4]">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-extrabold text-[#651317] dark:text-amber-100">{displayName}</p>
            <p className="truncate text-xs text-stone-500 dark:text-stone-400 font-medium mt-0.5">{contactLine}</p>
            <span className="inline-block mt-1.5 text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#FAF0E4] dark:bg-amber-500/10 text-[#651317] dark:text-amber-300 border border-[#E8D8C4] dark:border-amber-500/30">
              {user ? t('signedInDevotee') : t('guestDevotee')}
            </span>
          </div>
        </div>

        {user ? (
          <>
            <SheetClose asChild>
              <Link
                to="/account"
                className="mb-4 flex min-h-[52px] items-center gap-3 rounded-2xl border border-[#E8D8C4] dark:border-stone-700 bg-white dark:bg-stone-900 px-4 py-3 shadow-xs active:scale-[0.99] hover:border-[#651317]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF0E4] dark:bg-stone-800 text-[#651317] dark:text-amber-300 font-bold">
                  <Pencil className="h-5 w-5" />
                </span>
                <span className="flex-1 text-sm font-extrabold text-stone-900 dark:text-stone-100">{t('editProfile')}</span>
                <ChevronRight className="h-5 w-5 text-stone-400" />
              </Link>
            </SheetClose>

            <div className="mb-4 rounded-2xl border border-[#E8D8C4] dark:border-amber-500/30 bg-gradient-to-br from-[#FAF0E4]/60 via-white to-[#FFFDF8] dark:from-stone-900 dark:to-stone-950 p-4 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#651317] dark:text-amber-300">{t('currentPlan')}</p>
                  <p className="mt-1 font-display text-lg font-black text-stone-900 dark:text-stone-100">{t('freePlan')}</p>
                  <p className="mt-1 text-xs leading-relaxed text-stone-600 dark:text-stone-400 font-medium">{t('sevaPlanBlurb')}</p>
                </div>
                <Sparkles className="h-6 w-6 shrink-0 text-amber-500" />
              </div>
              <SheetClose asChild>
                <Link
                  to="/pricing"
                  className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#651317] hover:bg-[#8B1A1F] text-sm font-extrabold text-white shadow-md transition-all"
                >
                  {t('viewPlans')}
                </Link>
              </SheetClose>
            </div>

            <nav className="flex flex-col gap-2 overflow-y-auto pb-4">
              <MenuRow to="/account/liked" icon={<Heart className="h-5 w-5" />} label={t('likedBhajans')} />
              <MenuRow to="/account/saved" icon={<Bookmark className="h-5 w-5" />} label={t('savedPosts')} />
              <MenuRow to="/notifications" icon={<Bell className="h-5 w-5" />} label={t('notifications')} />
              <MenuRow to="/pricing" icon={<Sparkles className="h-5 w-5" />} label={t('ourSevaPlan')} />
              <MenuRow to="/account/support" icon={<HelpCircle className="h-5 w-5" />} label={t('helpSupport')} />
              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 flex min-h-[52px] items-center gap-3 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 px-4 py-3 text-sm font-bold text-rose-600 dark:text-rose-400 transition-colors active:scale-[0.99] hover:bg-rose-100/60"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/40">
                  <LogOut className="h-5 w-5" />
                </span>
                <span className="flex-1 text-left">{t('logout')}</span>
              </button>
            </nav>
          </>
        ) : (
          <div className="flex flex-col gap-4 py-3">
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-medium text-center leading-relaxed">
              {t('signInToLike')}
            </p>
            <SheetClose asChild>
              <Button asChild size="lg" className="w-full font-extrabold text-sm uppercase tracking-wider">
                <Link to="/auth/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  {t('login')}
                </Link>
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button asChild variant="outline" className="min-h-12 w-full rounded-2xl border border-[#E8D8C4] dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-bold text-sm hover:bg-[#FAF0E4]">
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
