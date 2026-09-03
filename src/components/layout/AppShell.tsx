import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import MobileBottomNav from "@/components/MobileBottomNav";
import LayoutFooter from "@/components/layout/Footer";
import PageContentFallback from "@/components/layout/PageContentFallback";
import { cn } from "@/lib/utils";

import { useBhajanModalOpen } from "@/hooks/useBhajanModalOpen";

import { clearRadixBodyLocks } from "@/lib/clearRadixBodyLocks";

export default function AppShell() {
  const { pathname, search } = useLocation();
  const searchParams = new URLSearchParams(search || window.location.search);
  const { isBhajanModalOpen } = useBhajanModalOpen();
  
  // Prevent visual flash of header/footer on first mount if router defaults to "/" initially
  const resolvedPath = pathname === "/" && window.location.pathname !== "/" ? window.location.pathname : pathname;

  const isKirtanAi = resolvedPath === "/kirtan-ai" || resolvedPath === "/narad-ai";
  const isKundliSetup = resolvedPath === "/kundli/setup";
  const isAskGuruJi = resolvedPath.startsWith("/ask-guru-ji");
  const isTemplePage = resolvedPath === "/temple";
  const activePracticeId = searchParams.get("practice");
  const isMantraJapaSection = resolvedPath.startsWith("/meditation/mantra-japa");
  const isOtherMeditationSession = resolvedPath === "/meditation/breathing" || resolvedPath === "/meditation/meditation-timer" || resolvedPath === "/meditation/naam-japa" || resolvedPath === "/meditation/mala";
  const isRunningPracticeSession = isOtherMeditationSession || (resolvedPath === "/meditation" && (activePracticeId === "mantra_japa_counter" || (activePracticeId != null && activePracticeId !== "" && activePracticeId !== "mantra_jap_home")));
  const isFullScreenApp = isKirtanAi || isKundliSetup || isAskGuruJi || isTemplePage || isRunningPracticeSession;
  const isWallpaperPage = resolvedPath === "/wallpaper";
  const isSearchPage = resolvedPath === "/search";
  const isShortsPage = resolvedPath.startsWith("/shorts");
  const isLiveAarti = resolvedPath === "/live-aarti";
  const isCommunityPage = resolvedPath.startsWith("/community") || resolvedPath === "/join-community";
  const isUploadPage = resolvedPath === "/upload-bhajan";
  const isKundliPage = resolvedPath === "/kundli";
  const hideHeaderGlobally =
    isFullScreenApp ||
    isMantraJapaSection ||
    isWallpaperPage ||
    isSearchPage ||
    isShortsPage ||
    isLiveAarti;
  const hideHeaderMobileOnly = isCommunityPage || isUploadPage || isKundliPage;

  const isAdminRoute = resolvedPath.startsWith("/admin");
  const isAccountRoute = resolvedPath.startsWith("/account");
  const isNotifications = resolvedPath === "/notifications";
  const hideFooter = isFullScreenApp || isAdminRoute || isAccountRoute || isNotifications || isShortsPage || isBhajanModalOpen;

  const showMobileBottomNav = (!isFullScreenApp || isTemplePage || isShortsPage || resolvedPath === "/meditation") && !isBhajanModalOpen && !isAskGuruJi;

  useEffect(() => {
    clearRadixBodyLocks();
  }, [pathname, search]);

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
          (isFullScreenApp || isShortsPage)
            ? "flex min-h-0 flex-col overflow-hidden"
            : "min-h-[calc(100dvh-4.5rem)]",
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
      {!hideFooter && (
        <div className="w-full" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 450px' }}>
          <LayoutFooter />
        </div>
      )}
    </div>
  );
}
