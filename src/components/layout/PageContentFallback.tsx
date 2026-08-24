export default function PageContentFallback() {
  return (
    <div aria-busy="true" className="w-full px-4 py-8 min-h-[calc(100dvh-4.5rem)]">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Breadcrumb skeleton */}
        <div className="h-5 w-48 max-w-full bg-muted/60 dark:bg-stone-800/60 rounded-full animate-pulse" />
        
        {/* Title & Metadata Card skeleton */}
        <div className="p-6 rounded-2xl bg-muted/40 dark:bg-stone-900/40 border border-[#E8D8C4]/40 dark:border-stone-800 space-y-4">
          <div className="h-6 w-32 bg-muted/70 dark:bg-stone-800 rounded-full animate-pulse" />
          <div className="h-10 w-3/4 bg-muted/80 dark:bg-stone-800 rounded-xl animate-pulse" />
          <div className="h-4 w-1/2 bg-muted/60 dark:bg-stone-800 rounded-md animate-pulse" />
          <div className="flex gap-2 pt-2">
            <div className="h-9 w-24 bg-muted/70 dark:bg-stone-800 rounded-full animate-pulse" />
            <div className="h-9 w-24 bg-muted/70 dark:bg-stone-800 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Content Card skeleton */}
        <div className="p-6 rounded-2xl bg-muted/30 dark:bg-stone-900/30 border border-[#E8D8C4]/40 dark:border-stone-800 space-y-3 min-h-[300px]">
          <div className="h-6 w-40 bg-muted/70 dark:bg-stone-800 rounded-md animate-pulse" />
          <div className="space-y-2 pt-4">
            <div className="h-4 w-full bg-muted/50 dark:bg-stone-800/60 rounded-sm animate-pulse" />
            <div className="h-4 w-5/6 bg-muted/50 dark:bg-stone-800/60 rounded-sm animate-pulse" />
            <div className="h-4 w-4/5 bg-muted/50 dark:bg-stone-800/60 rounded-sm animate-pulse" />
            <div className="h-4 w-3/4 bg-muted/50 dark:bg-stone-800/60 rounded-sm animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
