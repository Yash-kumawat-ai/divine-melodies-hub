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
  const isFullScreenApp = isKirtanAi;

  useEffect(() => {
    if (!isFullScreenApp) {
      window.scrollTo(0, 0);
    }
  }, [pathname, isFullScreenApp]);

  return (
    <div className="min-h-screen flex flex-col bg-background font-body">
      {!isFullScreenApp && <Header />}
      <main
        className={cn(
          "flex-1",
          !isFullScreenApp && "pb-[calc(5.75rem+env(safe-area-inset-bottom))] md:pb-0",
          isFullScreenApp && "flex min-h-0 flex-col overflow-hidden",
        )}
      >
        <Suspense fallback={<PageContentFallback />}>
          <Outlet />
        </Suspense>
      </main>
      {!isFullScreenApp && <MobileBottomNav />}
      {!isFullScreenApp && (
        <div className="block pb-[calc(5.75rem+env(safe-area-inset-bottom))] md:hidden">
          <LayoutFooter />
        </div>
      )}
      {!isFullScreenApp && (
        <div className="hidden md:block">
          <LayoutFooter />
        </div>
      )}
    </div>
  );
}
