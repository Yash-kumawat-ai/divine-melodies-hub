import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const EXCLUDED_PREFIXES = ["/kirtan-ai", "/narad-ai", "/meditation", "/admin"];

export function useMobileStreamingShell(): boolean {
  const { pathname } = useLocation();
  const isMobile = useIsMobile();

  const excluded = EXCLUDED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  return isMobile && !excluded;
}

export function useMobileAppShellLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    document.documentElement.classList.add("mobile-app-shell");
    document.body.classList.add("mobile-app-shell");

    return () => {
      document.documentElement.classList.remove("mobile-app-shell");
      document.body.classList.remove("mobile-app-shell");
    };
  }, [active]);
}
