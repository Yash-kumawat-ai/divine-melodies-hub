import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import MobileBottomNav from "@/components/MobileBottomNav";
import LayoutFooter from "@/components/layout/Footer";
import PageContentFallback from "@/components/layout/PageContentFallback";
import { cn } from "@/lib/utils";

import { useBhajanModalOpen } from "@/hooks/useBhajanModalOpen";

export default function AppShell() {
  const { pathname, search } = useLocation();
  const searchParams = new URLSearchParams(search || window.location.search);
  const { isBhajanModalOpen } = useBhajanModalOpen();
  
  // Prevent visual flash of header/footer on first mount if router defaults to "/" initially
  const resolvedPath = pathname === "/" && window.location.pathname !== "/" ? window.location.pathname : pathname;

  const isKirtanAi = resolvedPath === "/kirtan-ai";
  const isTemplePage = resolvedPath === "/temple";
  const isLeaderboard = resolvedPath === "/leaderboard";
  const activePracticeId = searchParams.get("practice");
  const hasActivePractice = resolvedPath === "/meditation" && activePracticeId != null && activePracticeId !== "";
  const isFullScreenApp = isKirtanAi || isTemplePage || isLeaderboard || hasActivePractice;
  const isWallpaperPage = resolvedPath === "/wallpaper";
  const isSearchPage = resolvedPath === "/search";
  const isShortsPage = resolvedPath.startsWith("/shorts");
  const isLiveAarti = resolvedPath === "/live-aarti" || resolvedPath === "/aarti";
  const isCommunityPage = resolvedPath.startsWith("/community") || resolvedPath === "/join-community";
  const isUploadPage = resolvedPath === "/upload-bhajan";
  const hideHeaderGlobally = isFullScreenApp || isWallpaperPage || isSearchPage || isShortsPage || isLiveAarti || isUploadPage;
  const hideHeaderMobileOnly = isCommunityPage;

  const isAdminRoute = resolvedPath.startsWith("/admin");
  const isAccountRoute = resolvedPath.startsWith("/account");
  const isNotifications = resolvedPath === "/notifications";
  const hideFooter = isFullScreenApp || isAdminRoute || isAccountRoute || isNotifications || isShortsPage || isBhajanModalOpen;

  const showMobileBottomNav = (!isFullScreenApp || isTemplePage || isShortsPage || resolvedPath.startsWith("/meditation")) && !isBhajanModalOpen;

  useEffect(() => {
    if (!isFullScreenApp && !isShortsPage) {
      window.scrollTo(0, 0);
      
      // Delay reset scroll to top to ensure async/lazy page loads are captured
      const timer = setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [pathname, isFullScreenApp, isShortsPage]);

  return (
    <div
      className={cn(
        "flex flex-col bg-background font-body",
        (isFullScreenApp || isShortsPage) ? "h-dvh overflow-hidden" : "min-h-dvh"
      )}
    >
      {!hideHeaderGlobally && (
        <div className={cn(hideHeaderMobileOnly && "hidden md:block")}>
          <Header />
        </div>
      )}
      <main
        className={cn(
          "flex-1",
          (isFullScreenApp || isShortsPage) && "flex min-h-0 flex-col overflow-hidden",
          (isFullScreenApp && showMobileBottomNav && !isTemplePage) && "pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0",
          isTemplePage && "temple-mobile-layout"
        )}
      >
        <Suspense fallback={<PageContentFallback />}>
          <Outlet />
        </Suspense>
      </main>
      {showMobileBottomNav && (
        <div className="block md:hidden">
          <MobileBottomNav />
        </div>
      )}
      {!hideFooter && <LayoutFooter />}
    </div>
  );
}
