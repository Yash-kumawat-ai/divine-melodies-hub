import { motion } from "framer-motion";
import { Bell, Flame, Flower2, Sparkles, Wind } from "lucide-react";
import type { NaradActionResult } from "@/lib/narad/naradIntents";
import { cn } from "@/lib/utils";

type DevotionActionCardProps = {
  action: NaradActionResult;
  compact?: boolean;
  streak?: number;
  reducedMotion?: boolean;
  onPrimary?: () => void;
  onSecondary?: () => void;
  className?: string;
};

export default function DevotionActionCard({
  action,
  compact,
  streak = 0,
  reducedMotion,
  onPrimary,
  onSecondary,
  className,
}: DevotionActionCardProps) {
  const icon =
    action.kind === "offering" ? (
      action.offeringType === "bell" ? (
        <Bell className="h-4 w-4 text-amber-300" />
      ) : action.offeringType === "diya" ? (
        <Flame className="h-4 w-4 text-amber-300" />
      ) : (
        <Flower2 className="h-4 w-4 text-amber-300" />
      )
    ) : action.kind === "route" ? (
      <Wind className="h-4 w-4 text-violet-300" />
    ) : action.kind === "japa_start" ? (
      <Sparkles className="h-4 w-4 text-amber-200" />
    ) : (
      <Flower2 className="h-4 w-4 text-amber-300" />
    );

  return (
    <motion.div
      layout={false}
      initial={reducedMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={cn(
        "rounded-2xl border p-3",
        compact
          ? "border-amber-400/25 bg-gradient-to-br from-[#2a1408]/90 to-[#1a0a20]/90"
          : "border-border bg-muted/30",
        className,
      )}
    >
      <div className="flex gap-3">
        {action.deityImageUrl ? (
          <img
            src={action.deityImageUrl}
            alt=""
            className="h-14 w-14 shrink-0 rounded-xl object-cover ring-2 ring-amber-400/30"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-amber-500/20">{icon}</div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-amber-200/80">{action.title}</p>
          <p className={cn("mt-0.5 leading-snug", compact ? "text-sm text-amber-50" : "text-sm text-foreground")}>
            {action.displayText}
          </p>
          {streak > 0 ? (
            <p className="mt-1 text-[11px] text-amber-200/60">
              {"\u0909\u092a\u0938\u094d\u0925\u093f\u0924\u093f: "}
              {streak} {"\u0926\u093f\u0928"}
            </p>
          ) : null}
        </div>
      </div>
      {(onPrimary || onSecondary) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {onPrimary && action.primaryLabel ? (
            <button
              type="button"
              onClick={onPrimary}
              className="rounded-full bg-amber-500/90 px-3 py-1.5 text-xs font-semibold text-[#1a0f0a]"
            >
              {action.primaryLabel}
            </button>
          ) : null}
          {onSecondary && action.secondaryLabel ? (
            <button
              type="button"
              onClick={onSecondary}
              className="rounded-full border border-amber-400/40 px-3 py-1.5 text-xs text-amber-100"
            >
              {action.secondaryLabel}
            </button>
          ) : null}
        </div>
      )}
    </motion.div>
  );
}
