/**
 * usePresence — tracks live user count via Supabase Realtime Presence.
 * Joins after idle or first interaction so it does not compete with first paint.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function whenIdleOrInteract(start: () => void): () => void {
  let started = false;
  const run = () => {
    if (started) return;
    started = true;
    start();
  };

  let idleHandle: number | undefined;
  let timeoutHandle: number | undefined;
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    idleHandle = window.requestIdleCallback(run, { timeout: 4000 });
  } else {
    timeoutHandle = window.setTimeout(run, 2500);
  }

  const onInteract = () => run();
  window.addEventListener("pointerdown", onInteract, { once: true, passive: true });
  window.addEventListener("keydown", onInteract, { once: true });
  window.addEventListener("scroll", onInteract, { once: true, passive: true });

  return () => {
    if (idleHandle !== undefined && "cancelIdleCallback" in window) {
      window.cancelIdleCallback(idleHandle);
    }
    if (timeoutHandle !== undefined) {
      window.clearTimeout(timeoutHandle);
    }
    window.removeEventListener("pointerdown", onInteract);
    window.removeEventListener("keydown", onInteract);
    window.removeEventListener("scroll", onInteract);
  };
}

export function usePresence() {
  const [onlineCount, setOnlineCount] = useState<number>(0);

  useEffect(() => {
    let channel: any = null;
    let cancelled = false;

    const cancelWait = whenIdleOrInteract(() => {
      if (cancelled) return;

      const presenceKey = `visitor-${Math.random().toString(36).slice(2)}`;

      channel = (supabase as any)
        .channel("app-presence", { config: { presence: { key: presenceKey } } })
        .on("presence", { event: "sync" }, () => {
          const state: Record<string, unknown[]> = channel.presenceState();
          const count = Object.values(state).reduce(
            (sum: number, arr: unknown[]) => sum + arr.length,
            0
          );
          setOnlineCount(count);
        })
        .subscribe(async (status: string) => {
          if (status === "SUBSCRIBED") {
            await channel.track({ online_at: new Date().toISOString() });
          }
        });
    });

    return () => {
      cancelled = true;
      cancelWait();
      if (!channel) return;
      try {
        channel.untrack();
        channel.unsubscribe();
        void (supabase as any).removeChannel(channel);
      } catch {
        // Ignore cleanup errors
      }
    };
  }, []);

  return { onlineCount };
}
