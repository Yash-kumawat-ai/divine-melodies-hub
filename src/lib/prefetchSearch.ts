/**
 * Concurrency-safe SearchPage chunk prefetcher with shared promise and connection-aware guards
 */
let prefetchPromise: Promise<unknown> | null = null;

export function prefetchSearchPage(): Promise<unknown> {
  if (typeof window === 'undefined') return Promise.resolve();

  // Guard: respect user's data-saving preferences and ultra-slow 2G links
  const nav = navigator as any;
  if (nav?.connection?.saveData || nav?.connection?.effectiveType === '2g') {
    return Promise.resolve();
  }

  if (!prefetchPromise) {
    prefetchPromise = import('@/pages/SearchPage').catch((err) => {
      prefetchPromise = null; // Allow retry on error
      console.debug('Search prefetch failed or aborted:', err);
    });
  }

  return prefetchPromise;
}

export function scheduleIdlePrefetch() {
  if (typeof window === 'undefined') return;
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => prefetchSearchPage(), { timeout: 3000 });
  } else {
    setTimeout(prefetchSearchPage, 1200);
  }
}
