import { Link, useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Compass, Flower2, Home, Library, Plus, User } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

type MobileTab = {
  path: string;
  label: string;
  icon: LucideIcon;
  match: (p: string) => boolean;
  accent?: boolean;
};

const TABS: MobileTab[] = [
  { path: "/", label: "Home", icon: Home, match: (p) => p === "/" },
  {
    path: "/meditation",
    label: "Dhyan",
    icon: Flower2,
    match: (p) => p.startsWith("/meditation"),
  },
  {
    path: "/all-bhajans",
    label: "Explore",
    icon: Compass,
    match: (p) =>
      p.startsWith("/all-bhajans") || p.startsWith("/search") || p.startsWith("/deity"),
  },
  {
    path: "/upload-bhajan",
    label: "Add",
    icon: Plus,
    match: (p) => p.startsWith("/upload-bhajan"),
    accent: true,
  },
  {
    path: "/recent-bhajans",
    label: "Library",
    icon: Library,
    match: (p) => p.startsWith("/recent-bhajans") || p.startsWith("/bhajan"),
  },
  {
    path: "/auth/login",
    label: "Profile",
    icon: User,
    match: (p) => p.startsWith("/auth") || p.startsWith("/notifications"),
  },
];

export default function MobileTabBar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-6 overflow-x-hidden border-t border-white/10 bg-[#0A0A0A]/85 px-0.5 pt-2 backdrop-blur-xl"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      aria-label="Main navigation"
    >
      {TABS.map((tab) => {
        const active = tab.match(pathname);
        const Icon = tab.icon;
        const to = tab.label === "Profile" && user ? "/notifications" : tab.path;

        return (
          <Link
            key={tab.label}
            to={to}
            className={cn(
              "flex min-w-0 flex-col items-center justify-end gap-0.5 pb-0.5 transition-transform active:scale-95",
              tab.accent && "-mt-3",
              active && !tab.accent ? "text-[#FFB300]" : "text-white/50",
            )}
          >
            <span
              className={cn(
                "flex items-center justify-center rounded-2xl transition-all",
                tab.accent &&
                  "h-12 w-12 bg-gradient-to-br from-[#FF9F1C] to-[#FFB300] text-[#0A0A0A] shadow-[0_0_24px_rgba(255,159,28,0.55)]",
                !tab.accent && active && "h-9 w-9 bg-[#FF9F1C]/12 shadow-[0_0_14px_rgba(255,179,0,0.3)]",
                !tab.accent && !active && "h-9 w-9",
              )}
            >
              <Icon className={cn("h-5 w-5", tab.accent && "h-6 w-6")} strokeWidth={active ? 2.5 : 2} />
            </span>
            <span className={cn("text-[8px] font-medium leading-none", active && "text-[#FFB300]")}>
              {tab.path === "/meditation" ? t("meditation") : tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
