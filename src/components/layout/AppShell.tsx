import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import MobileBottomNav from "@/components/MobileBottomNav";
import LayoutFooter from "@/components/layout/Footer";
import PageContentFallback from "@/components/layout/PageContentFallback";
import { cn } from "@/lib/utils";

export default function AppShell() {
  const { pathname } = useLocation();
  const isKirtanAi = pathname === "/kirtan-ai";
  const isTemplePage = pathname === "/temple";
  const isLeaderboard = pathname === "/leaderboard";
  const isFullScreenApp = isKirtanAi || isTemplePage || isLeaderboard;
  const isWallpaperPage = pathname === "/wallpaper";
  const isSearchPage = pathname === "/search";
  const hideHeader = isFullScreenApp || isWallpaperPage || isSearchPage;

  const isAdminRoute = pathname.startsWith("/admin");
  const isAccountRoute = pathname.startsWith("/account");
  const isNotifications = pathname === "/notifications";
  const hideFooter = isFullScreenApp || isAdminRoute || isAccountRoute || isNotifications;


  useEffect(() => {
    if (!isFullScreenApp) {
      window.scrollTo(0, 0);
      
      // Delay reset scroll to top to ensure async/lazy page loads are captured
      const timer = setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [pathname, isFullScreenApp]);

  return (
    <div
      className={cn(
        "flex flex-col bg-background font-body",
        isFullScreenApp ? "h-dvh overflow-hidden" : "min-h-screen"
      )}
    >
      {!hideHeader && <Header />}
      <main
        className={cn(
          "flex-1",
          isFullScreenApp && "flex min-h-0 flex-col overflow-hidden",
          isTemplePage && "temple-mobile-layout"
        )}
      >
        <Suspense fallback={<PageContentFallback />}>
          <Outlet />
        </Suspense>
      </main>
      {(!isFullScreenApp || isTemplePage) && (
        <div className="block md:hidden">
          <MobileBottomNav />
        </div>
      )}
      {!hideFooter && <LayoutFooter />}
    </div>
  );
}
