import { Link, useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Compass, Home, Library, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

type MobileNavItem = {
  path: string;
  label: string;
  icon: LucideIcon;
  match: (p: string) => boolean;
  accent?: boolean;
};

const NAV_ITEMS: MobileNavItem[] = [
  { path: "/", label: "Home", icon: Home, match: (p) => p === "/" },
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

export default function MobileBottomNav() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  return (
    <nav
      className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-50 grid shrink-0 grid-cols-5 overflow-x-hidden border-t border-[#E8D8C4] bg-[#FFFDF8]/95 dark:border-white/10 dark:bg-[#0d0b08]/90 px-1 pt-2 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      aria-label="Main navigation"
    >
      {NAV_ITEMS.map((item) => {
        const active = item.match(pathname);
        const Icon = item.icon;
        const to = item.label === "Profile" && user ? "/notifications" : item.path;

        return (
          <Link
            key={item.label}
            to={to}
            className={cn(
              "flex min-w-0 flex-col items-center justify-end gap-0.5 pb-0.5 transition-transform active:scale-95",
              item.accent && "-mt-3",
              active && !item.accent ? "text-[#651317]" : "text-[#786252]",
            )}
          >
            <span
              className={cn(
                "flex items-center justify-center rounded-2xl transition-all duration-250",
                item.accent &&
                  "h-12 w-12 bg-[#D88A15] border-2 border-[#FFFDF8] dark:border-[#0d0b08] text-white shadow-[0_4px_20px_rgba(216,138,21,0.35)]",
                !item.accent && active && "h-9 w-9 bg-[rgba(212,164,55,0.12)] text-[#651317]",
                !item.accent && !active && "h-9 w-9 text-[#786252]",
              )}
            >
              <Icon className={cn("h-5 w-5", item.accent ? "h-6 w-6 text-[#FFF9F2]" : active ? "text-[#651317]" : "text-[#786252]")} strokeWidth={active ? 2.5 : 2} />
            </span>
            <span className={cn("text-[9px] font-medium leading-none", active ? "text-[#651317]" : "text-[#786252]")}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
