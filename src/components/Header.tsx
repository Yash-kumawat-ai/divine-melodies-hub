import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Camera,
  ChevronDown,
  Clock3,
  Flower2,
  Image,
  Info,
  Landmark,
  Languages,
  LogIn,
  LogOut,
  Moon,
  MoreHorizontal,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Tags,
  Upload,
  User,
  Users,
} from "lucide-react";
import MobileBackButton from "@/components/MobileBackButton";
import { useBhajanModalOpen } from "@/hooks/useBhajanModalOpen";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { formatUploadError, uploadToCloudinary } from "@/lib/cloudinary";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/hooks/useLanguage";
import { languageOptions } from "@/constants/languageOptions";
import { AdminRoleBadge } from "@/components/notifications/AdminRoleBadge";
import { UserNotificationBell } from "@/components/notifications/UserNotificationBell";
import ProfileHubSheet from "@/components/account/ProfileHubSheet";
import { clearRadixBodyLocks } from "@/lib/clearRadixBodyLocks";
import { cn } from "@/lib/utils";

export default function Header() {
  const [profileHubOpen, setProfileHubOpen] = useState(false);
  const [mobileLanguageOpen, setMobileLanguageOpen] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const { user, profile, isAdmin, isSuperAdmin, signOut, updateProfile } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { isBhajanModalOpen } = useBhajanModalOpen();
  const showBack = !isHome && !isBhajanModalOpen;

  useEffect(() => {
    if (!mobileLanguageOpen) {
      clearRadixBodyLocks();
    }
  }, [mobileLanguageOpen]);

  const handleMobileLanguageOpenChange = (open: boolean) => {
    setMobileLanguageOpen(open);
    if (!open) {
      clearRadixBodyLocks();
    }
  };

  const handleLanguageChange = (nextLanguage: typeof language) => {
    setLanguage(nextLanguage);
    setMobileLanguageOpen(false);
    clearRadixBodyLocks();
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleAvatarFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploadingAvatar(true);
      const avatarUrl = await uploadToCloudinary(file, 'avatar');
      const { error } = await updateProfile({ avatar_url: avatarUrl });
      if (error) {
        throw new Error(formatUploadError(error, 'Could not save profile photo'));
      }
      toast.success('Profile photo updated');
    } catch (err) {
      console.error('Avatar upload failed:', err);
      toast.error(formatUploadError(err, 'Profile photo upload failed'));
    } finally {
      setIsUploadingAvatar(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const openAvatarPicker = (event: Event) => {
    event.preventDefault();
    fileInputRef.current?.click();
  };

  const displayName = profile?.name || user?.email?.split('@')[0] || 'User';
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const staffRole =
    profile?.role === 'moderator' || profile?.role === 'admin' || profile?.role === 'super_admin'
      ? profile.role
      : null;

  const mobileHeaderLinks = [
    { to: "/panchang", label: t("panchang"), icon: CalendarDays, match: (path: string) => path.startsWith("/panchang") },
    { to: "/meditation", label: t("meditation"), icon: Flower2, match: (path: string) => path.startsWith("/meditation") },
    { to: "/community", label: language === 'hi' ? 'नाम संघ' : 'Naam Sangh', icon: Users, match: (path: string) => path.startsWith("/community") },
    { to: "/recent-bhajans", label: t("recent"), icon: Clock3, match: (path: string) => path.startsWith("/recent-bhajans") },
    { to: "/wallpaper", label: language === 'hi' ? 'वॉलपेपर' : 'Wallpapers', icon: Image, match: (path: string) => path.startsWith("/wallpaper") },
    { to: "/kirtan-ai", label: t("kirtanAi"), icon: Sparkles, match: (path: string) => path.startsWith("/kirtan-ai") },
    { to: "/pricing", label: t("pricing"), icon: Tags, match: (path: string) => path === "/pricing" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="header-container container mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-0 min-w-0 flex-1 md:flex-initial md:mr-2 lg:mr-4">
          {showBack && (
            <span className="inline-flex md:hidden">
              <MobileBackButton />
            </span>
          )}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 min-w-0">
            <img
              src="/brand-logo.webp"
              alt="Raghavam"
              className="w-7 h-7 md:w-8 md:h-8 object-contain shrink-0"
              width={32}
              height={32}
            />
            <span className="font-display text-sm md:text-base font-bold text-foreground hidden sm:inline whitespace-nowrap truncate">
              Raghavam
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {user && <UserNotificationBell userId={user.id} />}
          <DropdownMenu modal={false} open={mobileLanguageOpen} onOpenChange={handleMobileLanguageOpenChange}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="relative flex h-10 min-w-10 items-center justify-center gap-0.5 rounded-full border border-primary/20 bg-card/80 px-2 shadow-sm transition-colors active:scale-95"
                aria-label={t('language')}
              >
                <Languages className="h-4 w-4 text-primary" strokeWidth={2.25} />
                <span className="text-[10px] font-bold uppercase leading-none text-primary">
                  {language}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-xl">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                {t('language')}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {languageOptions.map((option) => (
                <DropdownMenuItem
                  key={option.code}
                  onClick={() => {
                    handleLanguageChange(option.code);
                  }}
                  className={cn(
                    'cursor-pointer font-medium',
                    language === option.code && 'bg-primary/10 text-primary',
                  )}
                >
                  <Languages className="mr-2 h-4 w-4 opacity-70" />
                  {option.label}
                  {language === option.code ? (
                    <span className="ml-auto text-xs text-primary">✓</span>
                  ) : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            type="button"
            onClick={() => setProfileHubOpen(true)}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-card/80 shadow-sm transition-colors active:scale-95"
            aria-label={t('accountMenu')}
          >
            {user ? (
              <Avatar className="h-8 w-8 border border-primary/25">
                <AvatarImage src={profile?.avatar_url} alt={displayName} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
            ) : (
              <User className="h-4 w-4 text-primary" strokeWidth={2.25} />
            )}
          </button>
          <ProfileHubSheet open={profileHubOpen} onOpenChange={setProfileHubOpen} />
        </div>

        {/* ── Desktop Nav ─────────────────────────────────── */}
        <nav className="hidden md:flex flex-1 justify-center items-center gap-0.5 lg:gap-1 text-[13px] font-medium">
          {/* Primary links */}
          <Link to="/" className="px-2.5 py-1.5 rounded-md text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors whitespace-nowrap">{t('home')}</Link>
          <Link to="/all-bhajans" className="px-2.5 py-1.5 rounded-md text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors whitespace-nowrap">{t('browse')}</Link>
          <Link
            to="/meditation"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors whitespace-nowrap"
          >
            <Flower2 className="w-3 h-3" />
            {t('meditation')}
          </Link>
          <Link
            to="/temple"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors whitespace-nowrap"
          >
            <Landmark className="w-3 h-3" />
            {t('temple')}
          </Link>
          <Link
            to="/community"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors whitespace-nowrap"
          >
            <Users className="w-3 h-3" />
            {language === 'hi' ? 'नाम संघ' : 'Naam Sangh'}
          </Link>

          {/* More ▼ dropdown */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors whitespace-nowrap"
              >
                {language === 'hi' ? 'और' : 'More'}
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-44 rounded-xl">
              <DropdownMenuItem asChild>
                <Link to="/pricing" className="flex items-center gap-2">
                  <Tags className="h-4 w-4 opacity-60" />{t('pricing')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/about" className="flex items-center gap-2">
                  <Info className="h-4 w-4 opacity-60" />{t('about')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/wallpaper" className="flex items-center gap-2">
                  <Image className="h-4 w-4 opacity-60" />{language === 'hi' ? 'वॉलपेपर' : 'Wallpapers'}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/recent-bhajans" className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 opacity-60" />{t('recent')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/upload-bhajan" className="flex items-center gap-2 text-primary">
                  <Upload className="h-4 w-4" />{t('upload')}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Kirtan AI pill */}
          <Link
            to="/kirtan-ai"
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-[11px] font-semibold text-white hover:shadow-md hover:shadow-orange-500/30 transition-all h-7 px-3 ml-1 whitespace-nowrap"
          >
            <Sparkles className="w-3 h-3" />
            {t('kirtanAi')}
          </Link>

          {/* Search */}
          <Link to="/search?q=" className="text-muted-foreground hover:text-primary transition-colors p-1.5 shrink-0 ml-0.5">
            <Search className="w-4 h-4" />
          </Link>
          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center justify-center rounded-md border border-border bg-background text-foreground hover:bg-muted transition-colors h-7 w-7"
            aria-label={theme === 'dark' ? t('switchToLightMode') : t('switchToDarkMode')}
          >
            {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>

          {/* Notification bell */}
          {user && <UserNotificationBell userId={user.id} />}

          {/* Language select */}
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as typeof language)}
            className="rounded-md border border-border bg-background text-xs h-7 px-1.5"
            aria-label={t('language')}
          >
            {languageOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Avatar + name dropdown */}
          <div className="flex items-center gap-1.5">
            {staffRole && <AdminRoleBadge role={staffRole} className="hidden sm:inline-flex" />}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="relative flex items-center gap-1.5 rounded-full pl-0.5 pr-2 py-0.5 hover:bg-primary/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label={t('accountMenu')}
                >
                  <Avatar className="border border-primary/25 bg-gradient-to-br from-amber-100 to-orange-100 shadow-sm h-8 w-8">
                    <AvatarImage src={profile?.avatar_url} alt={displayName} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  {user && (
                    <span className="hidden lg:block text-xs font-medium text-foreground max-w-[80px] truncate">
                      {displayName.split(' ')[0]}
                    </span>
                  )}
                  <ChevronDown className="hidden lg:block h-3 w-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 overflow-hidden rounded-xl border-border/80 p-0 shadow-xl">
              <DropdownMenuLabel className="bg-gradient-to-br from-amber-50 via-background to-orange-50 p-4 dark:from-amber-950/30 dark:via-background dark:to-orange-950/20">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border border-primary/25">
                    <AvatarImage src={profile?.avatar_url} alt={displayName} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
                    <p className="truncate text-xs text-muted-foreground">{user?.email || t('guestDevotee')}</p>
                    <p className="mt-1 text-[11px] font-medium text-primary">{user ? t('signedInDevotee') : t('guestDevotee')}</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {user ? (
                <>
                  <DropdownMenuItem onClick={() => navigate('/account')}>
                    <User className="mr-2 h-4 w-4" />
                    {t('openAccount')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={openAvatarPicker} disabled={isUploadingAvatar}>
                    <Camera className="mr-2 h-4 w-4" />
                    {isUploadingAvatar ? t('uploading') : t('setPhoto')}
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/admin/moderation')}>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        {t('adminModeration')}
                      </DropdownMenuItem>
                      {isSuperAdmin && (
                        <DropdownMenuItem onClick={() => navigate('/admin/accounts')}>
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          {t('adminAccounts')}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => navigate('/admin/audit')}>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        {t('auditLog')}
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem onClick={() => navigate('/notifications')}>
                    <User className="mr-2 h-4 w-4" />
                    {t('notifications')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('logout')}
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem asChild>
                  <Link to="/auth/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    {t('login')}
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </nav>

      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        onChange={handleAvatarFileChange}
      />

      <nav
        className="md:hidden border-t border-border/60 bg-background/90 px-4 py-2"
        aria-label="Mobile feature shortcuts"
      >
        <div className="flex snap-x items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {mobileHeaderLinks.map((item) => {
            const Icon = item.icon;
            const active = item.match(location.pathname);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "inline-flex h-9 shrink-0 snap-start items-center gap-2 rounded-full border px-3 text-[11px] font-semibold transition-colors",
                  active
                    ? "bg-orange-500 text-white border-orange-600 shadow-[0_4px_12px_rgba(234,88,12,0.25)]"
                    : "border-border/80 bg-card/70 text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-4 w-4" strokeWidth={2.2} />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

    </header>
  );
}
