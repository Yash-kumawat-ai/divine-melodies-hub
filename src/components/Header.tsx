import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Search, Upload, LogOut, User, LogIn, Camera } from "lucide-react";
import { useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { languageOptions, useLanguage } from "@/hooks/useLanguage";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const { user, profile, signOut, updateProfile } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleAvatarFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploadingAvatar(true);
      const avatarUrl = await uploadToCloudinary(file);
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

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="text-2xl md:text-3xl font-display font-bold">
            <span className="text-gradient-saffron">ॐ</span>
          </span>
          <span className="font-display text-lg md:text-xl font-bold text-foreground hidden sm:inline">
            Bhajan Sandhya
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-base font-medium">
          <Link to="/" className="text-foreground hover:text-primary transition-colors">{t('home')}</Link>
          <Link to="/all-bhajans" className="text-foreground hover:text-primary transition-colors">{t('browse')}</Link>
          <Link to="/trending" className="text-foreground hover:text-primary transition-colors">{t('trending')}</Link>
          <Link to="/search" className="text-foreground hover:text-primary transition-colors">{t('search')}</Link>
          <Link
            to="/upload-bhajan"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <Upload className="w-4 h-4" />
            {t('upload')}
          </Link>
          <Link to="/search?q=" className="text-muted-foreground hover:text-primary transition-colors p-2">
            <Search className="w-5 h-5" />
          </Link>

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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary">
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
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarFileChange}
          />
        </nav>

        <button
          className="md:hidden p-2 touch-target"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-3">
          <Link to="/" onClick={() => setMenuOpen(false)} className="block py-3 text-lg font-medium text-foreground">{t('home')}</Link>
          <Link to="/all-bhajans" onClick={() => setMenuOpen(false)} className="block py-3 text-lg font-medium text-foreground">{t('browse')}</Link>
          <Link to="/trending" onClick={() => setMenuOpen(false)} className="block py-3 text-lg font-medium text-foreground">{t('trending')}</Link>
          <Link to="/search" onClick={() => setMenuOpen(false)} className="block py-3 text-lg font-medium text-foreground">{t('search')}</Link>
          <Link to="/upload-bhajan" onClick={() => setMenuOpen(false)} className="block py-3 text-lg font-medium text-primary flex items-center gap-2">
            <Upload className="w-4 h-4" />
            {t('upload')}
          </Link>
          <div className="pt-2">
            <label className="block text-sm text-muted-foreground mb-1">{t('language')}</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as typeof language)}
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
            >
              {languageOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {!user && (
            <button
              onClick={() => {
                navigate('/auth/login');
                setMenuOpen(false);
              }}
              className="block py-3 text-lg font-medium text-primary w-full text-left"
            >
              {t('login')}
            </button>
          )}
          {user && (
            <button
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className="block py-3 text-lg font-medium text-destructive w-full text-left"
            >
              {t('logout')}
            </button>
          )}
        </div>
      )}
    </header>
  );
}
