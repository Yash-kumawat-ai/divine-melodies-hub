import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  Clock3,
  Compass,
  Flower2,
  Grid3X3,
  Home,
  Image,
  Info,
  Landmark,
  Languages,
  LogIn,
  LogOut,
  Moon,
  Plus,
  Search,
  Sparkles,
  Sun,
  Tags,
  User,
  Users,
} from "lucide-react";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { languageOptions } from "@/constants/languageOptions";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";
import { clearRadixBodyLocks } from "@/lib/clearRadixBodyLocks";
import { cn } from "@/lib/utils";

type NavKey = "home" | "browse" | "upload" | "panchang" | "more";

type PrimaryNavItem = {
  path?: string;
  labelKey: NavKey;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
  accent?: boolean;
  menu?: boolean;
};

type FeatureItem = {
  path: string;
  labelKey:
    | "search"
    | "recent"
    | "meditation"
    | "temple"
    | "kirtanAi"
    | "pricing"
    | "about"
    | "profile"
    | "wallpaper"
    | "community";
  icon: LucideIcon;
  match: (pathname: string) => boolean;
};

const PRIMARY_NAV: PrimaryNavItem[] = [
  { path: "/", labelKey: "home", icon: Home, match: (pathname) => pathname === "/" },
  {
    path: "/all-bhajans",
    labelKey: "browse",
    icon: Compass,
    match: (pathname) =>
      pathname.startsWith("/all-bhajans") ||
      pathname.startsWith("/search") ||
      pathname.startsWith("/deity") ||
      pathname.startsWith("/bhajan"),
  },
  {
    path: "/upload-bhajan",
    labelKey: "upload",
    icon: Plus,
    match: (pathname) => pathname.startsWith("/upload-bhajan"),
    accent: true,
  },
  {
    path: "/panchang",
    labelKey: "panchang",
    icon: CalendarDays,
    match: (pathname) => pathname.startsWith("/panchang"),
  },
  { labelKey: "more", icon: Grid3X3, match: () => false, menu: true },
];

const FEATURE_ITEMS: FeatureItem[] = [
  { path: "/search?q=", labelKey: "search", icon: Search, match: (pathname) => pathname.startsWith("/search") },
  {
    path: "/recent-bhajans",
    labelKey: "recent",
    icon: Clock3,
    match: (pathname) => pathname.startsWith("/recent-bhajans"),
  },
  {
    path: "/meditation",
    labelKey: "meditation",
    icon: Flower2,
    match: (pathname) => pathname.startsWith("/meditation"),
  },
  {
    path: "/community",
    labelKey: "community",
    icon: Users,
    match: (pathname) => pathname.startsWith("/community"),
  },
  {
    path: "/temple",
    labelKey: "temple",
    icon: Landmark,
    match: (pathname) => pathname.startsWith("/temple"),
  },
  {
    path: "/kirtan-ai",
    labelKey: "kirtanAi",
    icon: Sparkles,
    match: (pathname) => pathname.startsWith("/kirtan-ai"),
  },
  { path: "/pricing", labelKey: "pricing", icon: Tags, match: (pathname) => pathname === "/pricing" },
  { path: "/about", labelKey: "about", icon: Info, match: (pathname) => pathname === "/about" },
  {
    path: "/wallpaper",
    labelKey: "wallpaper",
    icon: Image,
    match: (pathname) => pathname.startsWith("/wallpaper"),
  },
];

export default function MobileBottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [featuresOpen, setFeaturesOpen] = useState(false);

  const accountPath = user ? "/account" : "/auth/login";
  const accountActive = pathname.startsWith("/auth") || pathname.startsWith("/account");
  const displayName = profile?.name || user?.email?.split("@")[0] || t("guestDevotee");
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    await signOut();
    setFeaturesOpen(false);
    navigate("/");
  };

  useEffect(() => {
    if (!featuresOpen) {
      clearRadixBodyLocks();
    }
  }, [featuresOpen]);

  const handleFeaturesOpenChange = (open: boolean) => {
    setFeaturesOpen(open);
    if (!open) {
      clearRadixBodyLocks();
    }
  };

  const handleLanguageChange = (nextLanguage: typeof language) => {
    setLanguage(nextLanguage);
    setFeaturesOpen(false);
    clearRadixBodyLocks();
  };

  return (
    <>
      <nav
        className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-50 grid w-full grid-cols-5 items-end rounded-t-[1.65rem] border-t border-x-0 border-b-0 border-[#E8D8C4] bg-[#FFFDF8]/95 dark:border-white/10 dark:bg-[#0d0b08]/90 px-2 pt-2 shadow-[0_-8px_30px_rgba(74,14,18,0.06)] dark:shadow-[0_-8px_35px_rgba(0,0,0,0.45)] backdrop-blur-2xl md:hidden"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        aria-label="Main navigation"
      >
        {PRIMARY_NAV.map((item) => {
          const active = item.match(pathname) || (item.menu && featuresOpen);
          const Icon = item.icon;

          const content = (
            <>
              <span
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-2xl border transition-all duration-250",
                  item.accent
                    ? "h-12 w-12 -translate-y-3 rounded-full bg-[#D88A15] border-2 border-[#FFFDF8] dark:border-[#0d0b08] text-white shadow-[0_4px_20px_rgba(216,138,21,0.35)]"
                    : active
                      ? "border-[#D4A437]/20 bg-[rgba(212,164,55,0.12)] text-[#651317]"
                      : "border-transparent bg-transparent text-[#786252]",
                )}
              >
                <Icon className={cn("h-5 w-5", item.accent ? "h-6 w-6 text-[#FFF9F2]" : active ? "text-[#651317]" : "text-[#786252]")} strokeWidth={active ? 2.6 : 2.15} />
              </span>
              <span
                className={cn(
                  "mt-0.5 block max-w-full truncate text-[10px] font-semibold leading-none",
                  item.accent ? "-mt-1 text-[9px] text-[#786252]" : active ? "text-[#651317]" : "text-[#786252]",
                )}
              >
                {t(item.labelKey)}
              </span>
            </>
          );

          if (item.menu) {
            return (
              <button
                key={item.labelKey}
                type="button"
                onClick={() => setFeaturesOpen(true)}
                className="flex min-w-0 flex-col items-center justify-end rounded-2xl px-1 pb-0.5 text-center transition-transform active:scale-95"
                aria-label={t("features")}
                aria-expanded={featuresOpen}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.labelKey}
              to={item.path || "/"}
              className="flex min-w-0 flex-col items-center justify-end rounded-2xl px-1 pb-0.5 text-center transition-transform active:scale-95"
              aria-current={active ? "page" : undefined}
            >
              {content}
            </Link>
          );
        })}
      </nav>

      <Sheet modal={false} open={featuresOpen} onOpenChange={handleFeaturesOpenChange}>
        <SheetContent
          side="bottom"
          className="mx-auto max-h-[82dvh] w-full max-w-[32rem] overflow-y-auto overscroll-contain rounded-t-[1.75rem] border-border/80 bg-background/95 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 shadow-[0_-24px_70px_hsl(20_30%_10%/0.25)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#0d0b08]/95"
        >
          <SheetHeader className="mb-4 text-left">
            <SheetTitle className="text-base">{t("features")}</SheetTitle>
          </SheetHeader>

          <div className="mb-4 rounded-2xl border border-primary/15 bg-gradient-to-br from-amber-50 via-background to-orange-50 p-3 shadow-sm dark:from-amber-950/30 dark:via-background dark:to-orange-950/20">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border border-primary/25 bg-background">
                <AvatarImage src={profile?.avatar_url} alt={displayName} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{user ? displayName : t("devoteeProfile")}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email || t("manageDevotion")}</p>
                <p className="mt-1 text-[11px] font-medium text-primary">{user ? t("signedInDevotee") : t("guestDevotee")}</p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <SheetClose asChild>
                <Link
                  to={accountPath}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border/80 bg-background/80 px-3 text-xs font-semibold text-foreground shadow-sm transition-colors active:scale-[0.98]"
                >
                  {user ? <User className="h-4 w-4 text-primary" /> : <LogIn className="h-4 w-4 text-primary" />}
                  <span className="truncate">{user ? t("myAccount") : t("login")}</span>
                </Link>
              </SheetClose>
              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border/80 bg-background/80 px-3 text-xs font-semibold text-foreground shadow-sm transition-colors active:scale-[0.98]"
                >
                  <LogOut className="h-4 w-4 text-primary" />
                  <span className="truncate">{t("logout")}</span>
                </button>
              ) : (
                <SheetClose asChild>
                  <Link
                    to="/auth/signup"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-3 text-xs font-semibold text-primary shadow-sm transition-colors active:scale-[0.98]"
                  >
                    <User className="h-4 w-4" />
                    <span className="truncate">{t("profile")}</span>
                  </Link>
                </SheetClose>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {FEATURE_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = item.match(pathname);

              return (
                <SheetClose key={item.path} asChild>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex min-h-[5.25rem] flex-col items-center justify-center gap-2 rounded-2xl border bg-card/75 px-2 text-center text-xs font-semibold shadow-sm transition-colors active:scale-[0.98]",
                      active
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border/80 text-foreground hover:border-primary/30 hover:bg-primary/10",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-background text-primary shadow-inner">
                      <Icon className="h-5 w-5" strokeWidth={2.25} />
                    </span>
                    <span className="max-w-full truncate">
                      {item.labelKey === "wallpaper" ? (language === "hi" ? "वॉलपेपर" : "Wallpapers") : t(item.labelKey)}
                    </span>
                  </Link>
                </SheetClose>
              );
            })}

            <SheetClose asChild>
              <Link
                to={accountPath}
                className={cn(
                  "flex min-h-[5.25rem] flex-col items-center justify-center gap-2 rounded-2xl border bg-card/75 px-2 text-center text-xs font-semibold shadow-sm transition-colors active:scale-[0.98]",
                  accountActive
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border/80 text-foreground hover:border-primary/30 hover:bg-primary/10",
                )}
                aria-current={accountActive ? "page" : undefined}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-background text-primary shadow-inner">
                  {user ? <User className="h-5 w-5" strokeWidth={2.25} /> : <User className="h-5 w-5" strokeWidth={2.25} />}
                </span>
                <span className="max-w-full truncate">{user ? t("myAccount") : t("profile")}</span>
              </Link>
            </SheetClose>
          </div>

          <div className="mt-4 grid grid-cols-[1fr_auto] gap-2.5">
            <div className="min-w-0 rounded-2xl border border-border/80 bg-card/75 px-3 py-3">
              <div className="mb-2 flex items-center gap-2">
                <Languages className="h-5 w-5 shrink-0 text-primary" strokeWidth={2.2} />
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("language")}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5" role="radiogroup" aria-label={t("language")}>
                {languageOptions.map((option) => {
                  const selected = option.code === language;

                  return (
                    <button
                      key={option.code}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => handleLanguageChange(option.code)}
                      className={cn(
                        "min-h-9 rounded-xl border px-2 text-xs font-semibold transition-colors active:scale-[0.98]",
                        selected
                          ? "border-primary/45 bg-primary/15 text-primary"
                          : "border-border/70 bg-background/65 text-foreground hover:border-primary/30 hover:bg-primary/10",
                      )}
                    >
                      <span className="block truncate">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-full min-h-[3.25rem] w-14 items-center justify-center rounded-2xl border border-border/80 bg-card/75 text-foreground shadow-sm transition-colors active:scale-95"
              aria-label={theme === "dark" ? t("switchToLightMode") : t("switchToDarkMode")}
              title={theme === "dark" ? t("switchToLightMode") : t("switchToDarkMode")}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
