import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatedBrandLogo } from './AnimatedBrandLogo';
import {
  CalendarDays,
  Camera,
  ChevronDown,
  Clock3,
  Film,
  Flower2,
  Home,
  Image,
  Info,
  Landmark,
  Languages,
  LogIn,
  LogOut,
  Moon,
  MoreHorizontal,
  Music,
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
import { HamburgerButton } from "@/components/navigation/HamburgerButton";

const MeditationIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v6" />
    <path d="M6 10c1.5 2 3.5 3 6 3s4.5-1 6-3" />
    <path d="M4 18c2.5-2.5 5.5-3 8-3s5.5.5 8 3" />
    <path d="M2 20c4-1 16-1 20 0" />
  </svg>
);

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

  const getLinkClass = (path: string) => {
    const active = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
    return cn(
      "inline-flex items-center gap-1.5 px-3 py-1.5 transition-all text-[14px] border-b-2 font-medium",
      active 
        ? "text-brand border-brand rounded-none" 
        : "text-foreground/80 hover:text-brand hover:bg-brand/5 border-transparent rounded-md"
    );
  };
  const { isBhajanModalOpen } = useBhajanModalOpen();
  const primaryRoutes = [
    "/",
    "/all-bhajans",
    "/recent-bhajans",
    "/all-deities",
    "/meditation",
    "/panchang",
    "/kirtan-ai",
    "/temple",
    "/pricing",
    "/blog",
    "/about",
    "/privacy",
    "/terms",
    "/cookies",
    "/community",
    "/shorts",
    "/wallpaper",
    "/upload-bhajan",
    "/aarti",
    "/live-aarti",
    "/poster-maker",
    "/notifications"
  ];
  const showBack = !isHome && !isBhajanModalOpen && !primaryRoutes.includes(location.pathname);

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
    { to: "/community", label: language === 'hi' ? 'समूह' : 'Community', icon: Users, match: (path: string) => path.startsWith("/community") },
    { to: "/recent-bhajans", label: t("recent"), icon: Clock3, match: (path: string) => path.startsWith("/recent-bhajans") },
    { to: "/wallpaper", label: language === 'hi' ? 'वॉलपेपर' : 'Wallpapers', icon: Image, match: (path: string) => path.startsWith("/wallpaper") },
    { to: "/shorts", label: language === 'hi' ? 'शॉर्ट्स' : 'Shorts', icon: Film, match: (path: string) => path.startsWith("/shorts") },
    { to: "/kirtan-ai", label: t("kirtanAi"), icon: Sparkles, match: (path: string) => path.startsWith("/kirtan-ai") },
    { to: "/pricing", label: t("pricing"), icon: Tags, match: (path: string) => path === "/pricing" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FFFDF8] dark:bg-background border-b border-border/30">
      <div className="header-container container mx-auto px-4 flex items-center justify-between h-14 relative">
        <div className="flex items-center gap-1 min-w-0 flex-1 md:flex-initial md:mr-2 lg:mr-4">
          {/* Hamburger — mobile left corner */}
          <span className="inline-flex md:hidden">
            <HamburgerButton />
          </span>
          <Link 
            to="/" 
            className="flex items-center flex-shrink-0 min-w-0 absolute left-[42%] sm:left-1/2 top-1/2 -translate-x-1/2 -translate-y-[52%] md:relative md:left-auto md:top-auto md:translate-x-0 md:translate-y-0 z-10 pb-1.5"
            style={{ height: '44px', display: 'flex', alignItems: 'center' }}
          >
            <AnimatedBrandLogo height={38} className="pb-1" />
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {user && <UserNotificationBell userId={user.id} />}
          <DropdownMenu modal={false} open={mobileLanguageOpen} onOpenChange={handleMobileLanguageOpenChange}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="relative h-8 w-8 rounded-full border border-border/80 bg-[#FFFDF8]/50 dark:bg-background/50 text-foreground hover:bg-brand/5 hover:text-brand hover:border-brand/30 transition-all flex items-center justify-center p-0 focus:outline-none"
                aria-label={t('language')}
              >
                <Languages className="h-4 w-4 text-primary" strokeWidth={2.25} />
                <span className="absolute -bottom-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[8px] font-bold uppercase leading-none text-primary-foreground border border-background shadow-sm">
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
            className="relative h-8 w-8 rounded-full border border-border/80 bg-[#FFFDF8]/50 dark:bg-background/50 text-foreground hover:bg-brand/5 hover:text-brand hover:border-brand/30 transition-all flex items-center justify-center p-0 focus:outline-none"
            aria-label={t('accountMenu')}
          >
            {user ? (
              <Avatar className="h-8 w-8 border-none">
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
        <nav className="hidden md:flex flex-1 justify-center items-center gap-1 text-[13px] font-medium">
          {/* Primary links */}
          <Link to="/" className={getLinkClass('/')}>
            <Home className="w-3.5 h-3.5" />
            {t('home')}
          </Link>
          <Link to="/all-bhajans" className={getLinkClass('/all-bhajans')}>
            <Music className="w-3.5 h-3.5" />
            {t('browse')}
          </Link>
          <Link to="/meditation" className={getLinkClass('/meditation')}>
            <MeditationIcon className="w-3.5 h-3.5" />
            {t('meditation')}
          </Link>
          <Link to="/temple" className={getLinkClass('/temple')}>
            <Landmark className="w-3.5 h-3.5" />
            {t('temple')}
          </Link>
          <Link to="/community" className={getLinkClass('/community')}>
            <Users className="w-3.5 h-3.5" />
            {language === 'hi' ? 'समूह' : 'Community'}
          </Link>

          {/* More ▼ dropdown */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 transition-all text-[14px] border-b-2 font-medium",
                  (location.pathname === '/pricing' || location.pathname === '/about' || location.pathname === '/wallpaper' || location.pathname === '/shorts' || location.pathname === '/recent-bhajans')
                    ? "text-brand border-brand rounded-none"
                    : "text-foreground/80 hover:text-brand hover:bg-brand/5 border-transparent rounded-md"
                )}
              >
                {language === 'hi' ? 'और' : 'More'}
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
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
                <Link to="/shorts" className="flex items-center gap-2">
                  <Film className="h-4 w-4 opacity-60" />{language === 'hi' ? 'शॉर्ट्स' : 'Shorts'}
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
            className="flex items-center justify-center gap-1.5 rounded-full bg-brand text-[11px] font-semibold text-white hover:bg-brand/90 transition-all h-8 px-4 ml-1.5 whitespace-nowrap shadow-sm hover:shadow leading-none py-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t('kirtanAi')}
          </Link>

          {/* Search */}
          <Link 
            to="/search" 
            className="flex items-center justify-center rounded-full border border-border/80 bg-background/50 text-foreground hover:bg-brand/5 hover:text-brand hover:border-brand/30 transition-all h-8 w-8 shrink-0 ml-1.5 p-0"
          >
            <Search className="w-4 h-4" />
          </Link>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center justify-center rounded-full border border-border/80 bg-background/50 text-foreground hover:bg-brand/5 hover:text-brand hover:border-brand/30 transition-all h-8 w-8 shrink-0 p-0 focus:outline-none"
            aria-label={theme === 'dark' ? t('switchToLightMode') : t('switchToDarkMode')}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Notification bell */}
          {user && <UserNotificationBell userId={user.id} />}

          {/* Language dropdown (Desktop Custom Dropdown) */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center justify-center gap-1.5 rounded-full border border-border/80 bg-background/50 text-[13px] font-medium text-foreground hover:bg-brand/5 hover:text-brand hover:border-brand/30 transition-all h-8 px-4 py-0 leading-none focus:outline-none"
              >
                <span>{languageOptions.find(option => option.code === language)?.label || 'Language'}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl">
              {languageOptions.map((option) => (
                <DropdownMenuItem
                  key={option.code}
                  onClick={() => handleLanguageChange(option.code)}
                  className={cn(
                    'cursor-pointer font-medium text-xs',
                    language === option.code && 'bg-brand/10 text-brand',
                  )}
                >
                  {option.label}
                  {language === option.code ? (
                    <span className="ml-auto text-xs text-brand">✓</span>
                  ) : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Avatar + name dropdown */}
          <div className="flex items-center gap-1.5">
            {staffRole && <AdminRoleBadge role={staffRole} className="hidden sm:inline-flex" />}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="relative flex items-center gap-1.5 rounded-full pl-0.5 pr-2 py-0.5 hover:bg-brand/5 hover:text-brand transition-colors focus:outline-none focus:ring-2 focus:ring-brand"
                  aria-label={t('accountMenu')}
                >
                  <Avatar className="border border-brand/25 bg-gradient-to-br from-amber-100 to-orange-100 shadow-sm h-8 w-8">
                    <AvatarImage src={profile?.avatar_url} alt={displayName} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  {user && (
                    <div className="hidden sm:flex flex-col items-start leading-none text-left select-none mr-0.5">
                      <span className="text-[13px] font-bold text-foreground">
                        {displayName.split(' ')[0]}
                      </span>
                      <span className="text-[10px] font-medium text-orange-600 dark:text-orange-400 mt-0.5">
                        {language === 'hi' ? 'भक्त' : 'Devotee'}
                      </span>
                    </div>
                  )}
                  <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-muted-foreground" />
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
                  "tab-item shrink-0 snap-start h-9 rounded-full px-3",
                  active && "tab-active"
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
