import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Clock3,
  Compass,
  Flower2,
  Grid3X3,
  Home,
  Info,
  Landmark,
  Languages,
  Moon,
  Plus,
  Search,
  Sparkles,
  Sun,
  Tags,
  User,
} from "lucide-react";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { languageOptions } from "@/constants/languageOptions";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

type NavKey = "home" | "browse" | "upload" | "temple" | "more";

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
    | "kirtanAi"
    | "pricing"
    | "about"
    | "profile";
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
    path: "/temple",
    labelKey: "temple",
    icon: Landmark,
    match: (pathname) => pathname.startsWith("/temple"),
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
    path: "/kirtan-ai",
    labelKey: "kirtanAi",
    icon: Sparkles,
    match: (pathname) => pathname.startsWith("/kirtan-ai"),
  },
  { path: "/pricing", labelKey: "pricing", icon: Tags, match: (pathname) => pathname === "/pricing" },
  { path: "/about", labelKey: "about", icon: Info, match: (pathname) => pathname === "/about" },
];

export default function MobileBottomNav() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [featuresOpen, setFeaturesOpen] = useState(false);

  const accountPath = user ? "/notifications" : "/auth/login";
  const accountActive = pathname.startsWith("/auth") || pathname.startsWith("/notifications");

  return (
    <>
      <nav
        className="mobile-bottom-nav fixed bottom-2 left-1/2 z-50 grid w-[min(calc(100vw-1rem),28rem)] -translate-x-1/2 grid-cols-5 items-end rounded-[1.65rem] border border-border/80 bg-background/90 px-2 pt-2 shadow-[0_18px_55px_hsl(20_30%_10%/0.22)] backdrop-blur-2xl supports-[backdrop-filter]:bg-background/80 dark:border-white/10 dark:bg-[#0d0b08]/80 dark:shadow-[0_18px_60px_rgba(0,0,0,0.55)] md:hidden"
        style={{ paddingBottom: "max(0.55rem, env(safe-area-inset-bottom))" }}
        aria-label="Main navigation"
      >
        {PRIMARY_NAV.map((item) => {
          const active = item.match(pathname) || (item.menu && featuresOpen);
          const Icon = item.icon;

          const content = (
            <>
              <span
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-2xl border transition-all duration-200",
                  item.accent
                    ? "h-12 w-12 -translate-y-2 border-amber-200/80 bg-gradient-to-br from-amber-300 via-orange-400 to-orange-600 text-white shadow-[0_12px_28px_rgba(234,88,12,0.38)]"
                    : active
                      ? "border-primary/30 bg-primary/10 text-primary shadow-[0_8px_20px_hsl(var(--primary)/0.18)]"
                      : "border-transparent bg-transparent text-muted-foreground",
                )}
              >
                <Icon className={cn("h-5 w-5", item.accent && "h-6 w-6")} strokeWidth={active ? 2.6 : 2.15} />
              </span>
              <span
                className={cn(
                  "mt-0.5 block max-w-full truncate text-[10px] font-semibold leading-none",
                  active ? "text-primary" : "text-muted-foreground",
                  item.accent && "-mt-1 text-[9px]",
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

      <Sheet open={featuresOpen} onOpenChange={setFeaturesOpen}>
        <SheetContent
          side="bottom"
          className="mx-auto max-h-[82vh] w-full max-w-[32rem] rounded-t-[1.75rem] border-border/80 bg-background/95 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 shadow-[0_-24px_70px_hsl(20_30%_10%/0.25)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#0d0b08]/95"
        >
          <SheetHeader className="mb-4 text-left">
            <SheetTitle className="text-base">{t("features")}</SheetTitle>
          </SheetHeader>

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
                    <span className="max-w-full truncate">{t(item.labelKey)}</span>
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
                  {user ? <Bell className="h-5 w-5" strokeWidth={2.25} /> : <User className="h-5 w-5" strokeWidth={2.25} />}
                </span>
                <span className="max-w-full truncate">{user ? t("notifications") : t("profile")}</span>
              </Link>
            </SheetClose>
          </div>

          <div className="mt-4 grid grid-cols-[1fr_auto] gap-2.5">
            <label className="flex min-w-0 items-center gap-3 rounded-2xl border border-border/80 bg-card/75 px-3 py-3">
              <Languages className="h-5 w-5 shrink-0 text-primary" strokeWidth={2.2} />
              <span className="sr-only">{t("language")}</span>
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value as typeof language)}
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-foreground outline-none"
                aria-label={t("language")}
              >
                {languageOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

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
