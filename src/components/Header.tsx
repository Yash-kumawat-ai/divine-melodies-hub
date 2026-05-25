import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Camera,
  Clock3,
  Flower2,
  Info,
  Landmark,
  Languages,
  LogIn,
  LogOut,
  Moon,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Tags,
  Upload,
  User,
} from "lucide-react";
import MobileBackButton from "@/components/MobileBackButton";
import { useBhajanModalOpen } from "@/hooks/useBhajanModalOpen";
import { useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import dhyaanLogo from "@/assets/dhyaan-logo.png";
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
import { cn } from "@/lib/utils";

export default function Header() {
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
      await updateProfile({ avatar_url: avatarUrl });
    } catch (err) {
      console.error('Avatar upload failed:', err);
    } finally {
      setIsUploadingAvatar(false);
      if (event.target) {
        event.target.value = '';
      }
    }
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

  const accountPath = user ? "/notifications" : "/auth/login";
  const accountLabel = user ? t("notifications") : t("profile");
  const accountActive = location.pathname.startsWith("/notifications") || location.pathname.startsWith("/auth");
  const mobileHeaderLinks = [
    { to: "/meditation", label: t("meditation"), icon: Flower2, match: (path: string) => path.startsWith("/meditation") },
    { to: "/recent-bhajans", label: t("recent"), icon: Clock3, match: (path: string) => path.startsWith("/recent-bhajans") },
    { to: "/kirtan-ai", label: t("kirtanAi"), icon: Sparkles, match: (path: string) => path.startsWith("/kirtan-ai"), featured: true },
    { to: "/pricing", label: t("pricing"), icon: Tags, match: (path: string) => path === "/pricing" },
    { to: accountPath, label: accountLabel, icon: user ? Bell : User, match: () => accountActive },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 flex items-center justify-between h-16 md:h-20">
        <div className="flex items-center gap-0 min-w-0 flex-1 md:flex-initial md:mr-4">
          {showBack && <MobileBackButton />}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 min-w-0">
            <img
              src={dhyaanLogo}
              alt="Hari Kirtan"
              className="w-8 h-8 md:w-10 md:h-10 object-contain shrink-0"
              width={40}
              height={40}
            />
            <span className="font-display text-base md:text-lg font-bold text-foreground hidden sm:inline whitespace-nowrap truncate">
              Hari Kirtan
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {user && <UserNotificationBell userId={user.id} />}
        </div>

        <nav className="hidden md:flex items-center gap-3 lg:gap-5 text-sm font-medium">
          <Link to="/" className="text-foreground hover:text-primary transition-colors">{t('home')}</Link>
          <Link to="/all-bhajans" className="text-foreground hover:text-primary transition-colors">{t('browse')}</Link>
          <Link
            to="/temple"
            className="inline-flex items-center gap-1 text-foreground hover:text-primary transition-colors"
          >
            <Landmark className="w-3.5 h-3.5" />
            {t('temple')}
          </Link>
          <Link
            to="/meditation"
            className="inline-flex items-center gap-1 text-foreground hover:text-primary transition-colors"
          >
            <Flower2 className="w-3.5 h-3.5" />
            {t('meditation')}
          </Link>
          <Link to="/pricing" className="text-foreground hover:text-primary transition-colors">{t('pricing')}</Link>
          <Link to="/about" className="text-foreground hover:text-primary transition-colors">{t('about')}</Link>
          <Link
            to="/upload-bhajan"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            {t('upload')}
          </Link>
          <Link
            to="/kirtan-ai"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-3 text-xs font-semibold text-white hover:shadow-lg transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t('kirtanAi')}
          </Link>
          <Link to="/search?q=" className="text-muted-foreground hover:text-primary transition-colors p-2">
            <Search className="w-5 h-5" />
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-foreground hover:bg-muted transition-colors"
            aria-label={theme === 'dark' ? t('switchToLightMode') : t('switchToDarkMode')}
            title={theme === 'dark' ? t('switchToLightMode') : t('switchToDarkMode')}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {user && <UserNotificationBell userId={user.id} />}

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as typeof language)}
            className="h-9 rounded-md border border-border bg-background px-2 text-sm"
            aria-label={t('language')}
          >
            {languageOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            {staffRole && <AdminRoleBadge role={staffRole} className="hidden sm:inline-flex" />}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="relative rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Account menu"
                >
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage src={profile?.avatar_url} alt={displayName} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <p className="font-semibold">{displayName}</p>
                <p className="text-xs text-muted-foreground">{user?.email || t('profile')}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {user ? (
                <>
                  <DropdownMenuItem
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    {isUploadingAvatar ? 'Uploading...' : t('setPhoto')}
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
                <DropdownMenuItem onClick={() => navigate('/auth/login')}>
                  <LogIn className="mr-2 h-4 w-4" />
                  {t('login')}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarFileChange}
          />
        </nav>

      </div>

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
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border/80 bg-card/70 text-foreground",
                  item.featured && "border-orange-300/70 bg-orange-500 text-white shadow-[0_10px_24px_rgba(234,88,12,0.25)]",
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
