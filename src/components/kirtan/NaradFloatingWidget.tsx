import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Mic, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import KirtanAIChatCore, { type KirtanAIChatCoreHandle } from "@/components/kirtan/KirtanAIChatCore";

/**
 * Floating “Ask Narad” companion for Hari Kirtan — wraps full offline Kirtan AI (search, flows, lyrics modal).
 */
export default function NaradFloatingWidget() {
  const [open, setOpen] = useState(false);
  const coreRef = useRef<KirtanAIChatCoreHandle>(null);
  const { pathname } = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open || !isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, isMobile]);

  if (pathname === "/kirtan-ai") {
    return null;
  }

  return (
    <>
      <AnimatePresence mode="popLayout">
        {open && (
          <>
            {!isMobile && (
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="pointer-events-auto fixed inset-0 z-[86] bg-[#1a0f0a]/35 backdrop-blur-[2px]"
                aria-label="Close Ask Narad"
                onClick={() => setOpen(false)}
              />
            )}
            <motion.div
              role="dialog"
              aria-labelledby="narad-title"
              aria-describedby="narad-subtitle"
              initial={isMobile ? { opacity: 0, y: "100%" } : { opacity: 0, scale: 0.94, y: 12 }}
              animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1, y: 0 }}
              exit={isMobile ? { opacity: 0, y: "100%" } : { opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className={cn(
                "pointer-events-auto flex flex-col overflow-hidden",
                "border border-[#eab308]/25 bg-[linear-gradient(145deg,hsl(43_92%_95%/0.98),hsl(25_76%_97%/0.92)_40%,hsl(350_52%_98%/0.96))] backdrop-blur-xl",
                isMobile
                  ? "fixed inset-0 z-[100] h-[100dvh] w-full max-h-none rounded-none shadow-none"
                  : "fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-[max(0.75rem,env(safe-area-inset-right))] z-[88] mb-0 max-h-[min(72dvh,580px)] w-[min(340px,calc(100vw-1.25rem))] rounded-2xl shadow-[0_20px_50px_-12px_rgba(114,63,34,0.45)] md:bottom-[calc(1rem+env(safe-area-inset-bottom))] md:right-[max(1rem,env(safe-area-inset-right))]",
              )}
            >
              <div
                className={cn(
                  "relative shrink-0 border-b border-[#eab308]/20 bg-[linear-gradient(90deg,#7f1d1d/8,transparent,#b45309/10)] px-4 py-3",
                  isMobile && "pt-[max(0.75rem,env(safe-area-inset-top))]",
                )}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_-20%,rgba(251,191,36,0.25),transparent_55%)]" />
                <div className="relative flex items-start justify-between gap-2">
                  <div>
                    <h2 id="narad-title" className="font-display text-xl font-semibold tracking-tight text-[#571c1c]">
                      Ask Narad
                    </h2>
                    <p id="narad-subtitle" className="text-xs text-[#6b4423]/85">
                      Your devotional music companion · Hari Kirtan
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full bg-white/50 p-2 text-[#571c1c] transition hover:bg-white/90"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <Link
                  to="/kirtan-ai"
                  className="relative mt-2 inline-block text-[11px] font-medium text-[#b45309] underline-offset-4 hover:underline"
                  onClick={() => setOpen(false)}
                >
                  Open full sacred studio →
                </Link>
              </div>

              <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#fffdf9]/85">
                <KirtanAIChatCore
                  ref={coreRef}
                  variant="compact"
                  className="min-h-0 flex-1"
                  inputPlaceholder="Search bhajans, lyrics, meanings…"
                />
              </div>

              <div
                className={cn(
                  "pointer-events-none flex shrink-0 items-center justify-center gap-1 border-t border-[#eab308]/15 py-2 text-[10px] text-[#92400e]/70",
                  isMobile && "pb-[max(0.5rem,env(safe-area-inset-bottom))]",
                )}
              >
                <Mic className="h-3 w-3 shrink-0" aria-hidden />
                <span>Voice & search work like full Kirtan AI</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div
        className={cn(
          "pointer-events-none fixed z-[88] flex flex-col items-end gap-3",
          isMobile
            ? "bottom-[calc(4.25rem+env(safe-area-inset-bottom))] right-[max(0.75rem,env(safe-area-inset-right))]"
            : "bottom-[calc(4.25rem+env(safe-area-inset-bottom))] right-[max(0.75rem,env(safe-area-inset-right))] md:bottom-[max(1rem,env(safe-area-inset-bottom))] md:right-[max(1rem,env(safe-area-inset-right))]",
        )}
        aria-live="polite"
      >
        {!(open && isMobile) && (
          <motion.button
            type="button"
            aria-expanded={open}
            aria-haspopup="dialog"
            aria-label={open ? "Close devotional companion" : "Open Ask Narad — Hari Kirtan companion"}
            onClick={() => setOpen((v) => !v)}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "pointer-events-auto relative flex h-[3.65rem] w-[3.65rem] shrink-0 items-center justify-center rounded-full",
              "border-2 border-[#fde68a]/90 bg-[linear-gradient(145deg,#ea580c,#b91c1c_45%,#eab308)]",
              "text-[1.55rem] font-semibold leading-none text-[#fffbeb]",
              "outline-none ring-offset-2 ring-offset-[#faf7f2] transition focus-visible:ring-2 focus-visible:ring-[#f59e0b]",
              "narad-fab-breathe",
            )}
          >
            <span className="narad-fab-ring pointer-events-none absolute inset-[-12px] rounded-full border border-[#fbbf24]/50" aria-hidden />
            <span className="relative drop-shadow-[0_2px_3px_rgba(0,0,0,0.25)]" aria-hidden>
              ॐ
            </span>
          </motion.button>
        )}
      </div>
    </>
  );
}
