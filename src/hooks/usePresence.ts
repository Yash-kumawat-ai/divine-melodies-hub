/**
 * usePresence — tracks live user count via Supabase Realtime Presence.
 * Every tab/device that renders this hook joins a shared presence channel.
 * The count reflects the number of currently connected clients in real-time.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function usePresence() {
  const [onlineCount, setOnlineCount] = useState<number>(0);

  useEffect(() => {
    // Each visitor gets a unique key so multiple tabs count individually
    const presenceKey = `visitor-${Math.random().toString(36).slice(2)}`;

    const channel = (supabase as any)
      .channel("app-presence", { config: { presence: { key: presenceKey } } })
      .on("presence", { event: "sync" }, () => {
        const state: Record<string, unknown[]> = channel.presenceState();
        // Each key has an array of presences — sum them all
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

    return () => {
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
