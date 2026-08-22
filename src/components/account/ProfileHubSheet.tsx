import React from 'react';
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
  Flame,
  Users,
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
        className="flex min-h-[50px] items-center gap-3 rounded-2xl border border-border/70 bg-card/80 px-4 py-2.5 text-sm font-semibold text-foreground shadow-xs transition-colors active:scale-[0.99] hover:border-primary/25 hover:bg-primary/5"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </span>
        <span className="flex-1 text-left">{label}</span>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </Link>
    </SheetClose>
  );
}

export default function ProfileHubSheet({ open, onOpenChange }: ProfileHubSheetProps) {
  const { user, profile, signOut } = useAuth();
  const { language, t } = useLanguage();
  const isHi = language === 'hi';
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
        className="mx-auto flex max-h-[90vh] sm:max-h-[85vh] w-full max-w-lg flex-col overflow-y-auto overscroll-contain rounded-t-[2rem] border-[#E8D8C4] dark:border-amber-500/20 bg-[#FFFDF8] dark:bg-[#120D09] px-5 sm:px-6 pt-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-[0_-24px_70px_rgba(101,19,23,0.3)] backdrop-blur-2xl text-stone-900 dark:text-stone-100 z-[250]"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{t('accountSettings')}</SheetTitle>
        </SheetHeader>

        {/* Profile Card Header */}
        <div className="mb-4 flex items-center gap-3.5 pr-8 border-b border-[#E8D8C4]/60 dark:border-stone-800 pb-3.5">
          <Avatar className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 border-2 border-[#E8D8C4] dark:border-amber-500/30 bg-[#FAF0E4] shadow-xs">
            <AvatarImage src={profile?.avatar_url} alt={displayName} />
            <AvatarFallback className="font-black text-sm sm:text-base text-[#651317] bg-[#FAF0E4]">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-base font-extrabold text-[#651317] dark:text-amber-100 leading-tight">{displayName}</p>
            <p className="truncate text-xs text-stone-500 dark:text-stone-400 font-medium mt-0.5">{contactLine}</p>
            <span className="inline-block mt-1 text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#FAF0E4] dark:bg-amber-500/10 text-[#651317] dark:text-amber-300 border border-[#E8D8C4] dark:border-amber-500/30">
              {user ? t('signedInDevotee') : t('guestDevotee')}
            </span>
          </div>
        </div>

        {user ? (
          <>
            <SheetClose asChild>
              <Link
                to="/account"
                className="mb-3 flex min-h-[48px] items-center gap-3 rounded-2xl border border-[#E8D8C4] dark:border-stone-700 bg-white dark:bg-stone-900 px-4 py-2.5 shadow-xs active:scale-[0.99] hover:border-[#651317]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF0E4] dark:bg-stone-800 text-[#651317] dark:text-amber-300 font-bold">
                  <Pencil className="h-4 w-4" />
                </span>
                <span className="flex-1 text-sm font-extrabold text-stone-900 dark:text-stone-100 text-left">{t('editProfile')}</span>
                <ChevronRight className="h-4 w-4 text-stone-400" />
              </Link>
            </SheetClose>

            <div className="mb-3 rounded-2xl border border-[#E8D8C4] dark:border-amber-500/30 bg-gradient-to-br from-[#FAF0E4]/60 via-white to-[#FFFDF8] dark:from-stone-900 dark:to-stone-950 p-3.5 shadow-xs text-left">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#651317] dark:text-amber-300">{t('currentPlan')}</p>
                  <p className="mt-0.5 font-display text-base sm:text-lg font-black text-stone-900 dark:text-stone-100">{t('freePlan')}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-stone-600 dark:text-stone-400 font-medium">{t('sevaPlanBlurb')}</p>
                </div>
                <Sparkles className="h-5 w-5 shrink-0 text-amber-500" />
              </div>
              <SheetClose asChild>
                <Link
                  to="/pricing"
                  className="mt-2.5 inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-[#651317] hover:bg-[#8B1A1F] text-xs sm:text-sm font-extrabold text-white shadow-xs transition-all"
                >
                  {t('viewPlans')}
                </Link>
              </SheetClose>
            </div>

            <nav className="flex flex-col gap-2 overflow-y-auto pb-2">
              <MenuRow to="/account/liked" icon={<Heart className="h-4 w-4" />} label={t('likedBhajans')} />
              <MenuRow to="/account/saved" icon={<Bookmark className="h-4 w-4" />} label={t('savedPosts')} />
              <MenuRow to="/notifications" icon={<Bell className="h-4 w-4" />} label={t('notifications')} />
              <MenuRow to="/pricing" icon={<Sparkles className="h-4 w-4" />} label={t('ourSevaPlan')} />
              <MenuRow to="/account/support" icon={<HelpCircle className="h-4 w-4" />} label={t('helpSupport')} />
              <button
                type="button"
                onClick={handleLogout}
                className="mt-1 flex min-h-[48px] items-center gap-3 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 px-4 py-2.5 text-sm font-bold text-rose-600 dark:text-rose-400 transition-colors active:scale-[0.99] hover:bg-rose-100/60 cursor-pointer"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/40">
                  <LogOut className="h-4 w-4" />
                </span>
                <span className="flex-1 text-left">{t('logout')}</span>
              </button>
            </nav>
          </>
        ) : (
          <div className="flex flex-col gap-3 py-1 text-left">
            {/* Devotional Benefits Preview Card */}
            <div className="p-3.5 rounded-2xl border border-[#E8D8C4] dark:border-stone-800 bg-[#FAF0E4]/50 dark:bg-stone-900/60 space-y-2">
              <p className="text-xs font-bold text-[#651317] dark:text-amber-200">
                {isHi ? "लॉग इन करने के लाभ:" : "Sign in benefits:"}
              </p>
              <div className="grid grid-cols-1 gap-1.5 text-xs text-stone-700 dark:text-stone-300">
                <div className="flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{isHi ? "दैनिक मंत्र जप और साधना प्रगति सहेजें" : "Track daily mantra japa & sadhana"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{isHi ? "मनपसंद भजन और आरती का निजी संग्रह" : "Save favorite bhajans & aartis"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{isHi ? "भक्त समूहों में सामूहिक नाम-संकीर्तन" : "Join devotee groups for collective chants"}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-1">
              <SheetClose asChild>
                <Button
                  asChild
                  size="lg"
                  className="w-full h-11 sm:h-12 rounded-2xl bg-[#651317] hover:bg-[#4f0f12] text-white font-extrabold text-sm sm:text-base shadow-[0_4px_14px_rgba(101,19,23,0.3)] cursor-pointer active:scale-[0.98]"
                >
                  <Link to="/auth/login" className="flex items-center justify-center gap-2">
                    <LogIn className="w-4 h-4" />
                    <span>{isHi ? "लॉग इन करें" : "Log In"}</span>
                  </Link>
                </Button>
              </SheetClose>

              <SheetClose asChild>
                <Button
                  asChild
                  variant="outline"
                  className="w-full h-11 sm:h-12 rounded-2xl border border-[#E8D8C4] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#651317] dark:text-amber-200 font-bold text-sm hover:bg-[#FAF0E4] cursor-pointer active:scale-[0.98]"
                >
                  <Link to="/auth/signup" className="flex items-center justify-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    <span>{isHi ? "नया खाता बनाएं (साइन अप)" : "Create New Account (Sign Up)"}</span>
                  </Link>
                </Button>
              </SheetClose>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
