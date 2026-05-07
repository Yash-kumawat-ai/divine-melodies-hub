import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

interface SkeletonCardProps {
  className?: string;
}

function BhajanCardSkeleton({ className }: SkeletonCardProps) {
  return (
    <div className={cn("rounded-xl border bg-card p-4 space-y-3", className)}>
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

function ListSkeleton({ count = 5, className }: SkeletonCardProps & { count?: number }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}

function PageSkeleton({ className }: SkeletonCardProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <Skeleton className="h-12 w-1/2" />
      <Skeleton className="h-8 w-1/3" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <BhajanCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export { Skeleton, BhajanCardSkeleton, ListSkeleton, PageSkeleton };
