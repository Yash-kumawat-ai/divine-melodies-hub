import type { ReactNode } from "react";
import MobileTopPlayer from "@/components/mobile/MobileTopPlayer";
import MobileBottomNav from "@/components/mobile/MobileBottomNav";
import MobileScrollRegion from "@/components/mobile/MobileScrollRegion";
import MobileYouTubeBridge from "@/components/mobile/MobileYouTubeBridge";
import { useMobileAppShellLock } from "@/hooks/useMobileStreamingShell";

interface MobileStreamingShellProps {
  children: ReactNode;
}

export default function MobileStreamingShell({ children }: MobileStreamingShellProps) {
  useMobileAppShellLock(true);

  return (
    <div className="mobile-streaming-shell flex h-[100dvh] w-full flex-col overflow-hidden bg-[#0A0A0A] md:contents md:h-auto md:overflow-visible md:bg-transparent">
      <MobileYouTubeBridge />
      <MobileTopPlayer />

      <MobileScrollRegion>
        <div className="mobile-shell-page min-w-0 max-w-full overflow-x-hidden pb-2">{children}</div>
      </MobileScrollRegion>

      <MobileBottomNav />
    </div>
  );
}
