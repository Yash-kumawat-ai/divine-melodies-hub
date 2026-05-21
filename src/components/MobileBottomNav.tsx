import { Link, useLocation } from "react-router-dom";
import { Search, Sparkles, Upload } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { languageOptions } from "@/constants/languageOptions";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { to: "/", labelKey: "home" as const, match: (p: string) => p === "/" },
  { to: "/all-bhajans", labelKey: "browse" as const, match: (p: string) => p.startsWith("/all-bhajans") },
  { to: "/pricing", labelKey: "pricing" as const, match: (p: string) => p === "/pricing" },
  { to: "/about", labelKey: "about" as const, match: (p: string) => p === "/about" },
  { to: "/search", labelKey: "search" as const, match: (p: string) => p.startsWith("/search") },
];

export default function MobileBottomNav() {
  const { pathname } = useLocation();
  const { language, setLanguage, t } = useLanguage();

  return (
    <nav
      className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-50 hidden max-md:flex border-t border-border bg-background/95 backdrop-blur-md"
      style={{ paddingBottom: "max(10px, env(safe-area-inset-bottom))" }}
      aria-label="Mobile navigation"
    >
      {NAV_LINKS.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "mobile-bottom-nav-item shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors active:scale-95",
              active ? "bg-primary/15 text-primary" : "text-foreground",
            )}
          >
            {item.labelKey === "search" ? (
              <span className="flex items-center gap-1.5">
                <Search className="h-4 w-4 shrink-0" />
                {t(item.labelKey)}
              </span>
            ) : (
              t(item.labelKey)
            )}
          </Link>
        );
      })}

      <Link
        to="/kirtan-ai"
        className={cn(
          "mobile-bottom-nav-item shrink-0 flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-3 py-2 text-sm font-semibold text-white active:scale-95",
          pathname.startsWith("/kirtan-ai") && "ring-2 ring-orange-300/60",
        )}
      >
        <Sparkles className="h-4 w-4 shrink-0" />
        {t("kirtanAi")}
      </Link>

      <Link
        to="/upload-bhajan"
        className={cn(
          "mobile-bottom-nav-item shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-primary active:scale-95",
          pathname.startsWith("/upload-bhajan") && "bg-primary/15",
        )}
      >
        <Upload className="h-4 w-4 shrink-0" />
        {t("upload")}
      </Link>

      <label className="mobile-bottom-nav-item flex shrink-0 flex-col gap-0.5 rounded-lg border border-border bg-background px-2 py-1.5">
        <span className="text-[10px] text-muted-foreground">{t("language")}</span>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as typeof language)}
          className="h-7 min-w-[5.5rem] rounded border-0 bg-transparent px-0 text-xs font-medium text-foreground focus:outline-none focus:ring-0"
          aria-label={t("language")}
        >
          {languageOptions.map((option) => (
            <option key={option.code} value={option.code}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </nav>
  );
}
