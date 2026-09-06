import React from 'react';
import { Sparkles, Info, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DailyQuotaStatus } from '@/lib/geetaGyan/gitaChatEngine';

interface GitaQuotaBannerProps {
  quota: DailyQuotaStatus;
  isHindi: boolean;
  className?: string;
}

export function GitaQuotaBanner({ quota, isHindi, className }: GitaQuotaBannerProps) {
  const percentage = Math.round((quota.remaining / quota.total) * 100);

  return (
    <div
      className={cn(
        'w-full border-b transition-colors py-2 px-4 select-none',
        'bg-[#FBF8F4]/90 dark:bg-[#181310]/90 backdrop-blur-sm border-[#EFE4D7] dark:border-zinc-800/80 text-foreground',
        className
      )}
      role="status"
      aria-label="Daily message quota"
    >
      <div className="max-w-3xl md:max-w-5xl lg:max-w-6xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
        {/* Left: Star + Questions count */}
        <div className="flex items-center gap-2 font-medium text-[#4A3222] dark:text-[#E8C59A]">
          <span className="text-amber-500 flex items-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          </span>
          <span>
            {isHindi
              ? `${quota.remaining} / ${quota.total} प्रश्न आज उपलब्ध`
              : `${quota.remaining} / ${quota.total} questions today`}
          </span>
        </div>

        {/* Right: Progress bar + Info */}
        <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
          {/* Progress bar */}
          <div
            className="w-20 sm:w-28 h-1.5 rounded-full bg-[#E5DACD] dark:bg-zinc-800 overflow-hidden"
            title={`${percentage}% remaining`}
          >
            <div
              className={cn(
                'h-full transition-all duration-500 rounded-full',
                quota.remaining > 3
                  ? 'bg-gradient-to-r from-amber-500 to-[#C4823F]'
                  : 'bg-rose-500'
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <span
            title={
              isHindi
                ? `प्रत्येक 24 घंटे में रीसेट होता है (~${quota.resetHours} घंटे शेष)`
                : `Resets every 24 hours (~${quota.resetHours}h remaining)`
            }
            className="cursor-pointer hover:text-foreground transition-colors p-0.5"
          >
            <Info className="w-3.5 h-3.5 opacity-70 hover:opacity-100" />
          </span>

          {quota.isExhausted && (
            <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {isHindi ? 'सीमा समाप्त' : 'Limit reached'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

