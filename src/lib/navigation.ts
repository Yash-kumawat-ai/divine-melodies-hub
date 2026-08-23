import type { NavigateFunction } from "react-router-dom";

/** React Router v6 stores the stack index on history.state.idx. */
function routerHistoryIdx(): number {
  if (typeof window === "undefined") return 0;
  const idx = (window.history.state as { idx?: number } | null)?.idx;
  return typeof idx === "number" ? idx : 0;
}

/**
 * Go back one in-app entry. If this is the first SPA page (direct load / new tab),
 * use fallback instead of history.length (which is almost always > 1 in Chrome).
 */
export function goBack(navigate: NavigateFunction, fallback = "/"): void {
  if (routerHistoryIdx() > 0) {
    navigate(-1);
    return;
  }
  navigate(fallback);
}

export function prefetchJoinCommunityPage(): void {
  void import("@/pages/JoinCommunityPage");
}
