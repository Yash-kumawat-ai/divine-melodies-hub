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

  useEffect(() => {
    if (!isKirtanAi) {
      window.scrollTo(0, 0);
    }
  }, [pathname, isKirtanAi]);

  return (
    <div className="min-h-screen bg-background flex flex-col font-body">
      <Header />
      <main
        className={cn(
          "flex-1 min-h-0 pb-[calc(3.75rem+env(safe-area-inset-bottom))] md:pb-0",
          isKirtanAi && "flex flex-col overflow-hidden",
        )}
      >
        <Suspense fallback={<PageContentFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <MobileBottomNav />
      {!isKirtanAi && (
        <div className="hidden md:block">
          <LayoutFooter />
        </div>
      )}
    </div>
  );
}
