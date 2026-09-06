import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function CategoryGridSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full max-w-2xl md:max-w-5xl lg:max-w-6xl mx-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {/* Hero Skeleton */}
      <div className="text-center space-y-3 pt-2 sm:pt-4">
        <Skeleton className="h-5 w-32 mx-auto rounded-full" />
        <Skeleton className="h-10 sm:h-12 w-64 mx-auto rounded-xl" />
        <Skeleton className="h-4 w-72 mx-auto rounded-md" />
      </div>

      {/* Big Search Bar Skeleton */}
      <div className="max-w-2xl md:max-w-3xl mx-auto w-full">
        <Skeleton className="h-14 sm:h-16 w-full rounded-[28px] sm:rounded-[32px]" />
      </div>

      {/* Quote Card Skeleton */}
      <div className="max-w-2xl md:max-w-3xl mx-auto w-full">
        <Skeleton className="h-14 w-full rounded-2xl" />
      </div>

      {/* Popular Chips Skeleton */}
      <div className="flex flex-wrap gap-2 justify-center pt-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-20 rounded-full" />
        ))}
      </div>

      {/* Grid Skeleton (Responsive 2 to 3 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl border border-border/40 bg-card/50"
          >
            <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1 min-w-0">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


export function CategoryDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 py-4">
      {/* Top back bar */}
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-9 w-36 rounded-lg" />
        <Skeleton className="h-8 w-44 rounded-full" />
      </div>

      {/* Situation Header */}
      <div className="space-y-3 pt-2 pb-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-8 w-2/3 rounded-lg" />
            <Skeleton className="h-4 w-1/3 rounded" />
          </div>
        </div>
        <Skeleton className="h-4 w-1/2 rounded mt-2" />
      </div>

      {/* Primary Dominant Verse Card Skeleton */}
      <div className="rounded-2xl border-2 border-saffron/20 bg-card p-6 sm:p-8 space-y-6 shadow-md">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-44 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <div className="space-y-3 py-2">
          <Skeleton className="h-6 w-full rounded" />
          <Skeleton className="h-6 w-4/5 rounded" />
          <Skeleton className="h-4 w-3/5 rounded italic" />
        </div>
        <div className="border-t border-border/50 pt-5 space-y-3">
          <Skeleton className="h-5 w-36 rounded" />
          <Skeleton className="h-4 w-48 rounded" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
        <div className="rounded-xl bg-saffron/5 border border-saffron/20 p-5 space-y-3">
          <Skeleton className="h-5 w-52 rounded" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </div>

      {/* Supporting Verses Skeleton */}
      <div className="space-y-4 pt-4">
        <Skeleton className="h-6 w-48 rounded" />
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
              <Skeleton className="h-5 w-36 rounded-full" />
              <Skeleton className="h-5 w-full rounded" />
              <Skeleton className="h-12 w-full rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
