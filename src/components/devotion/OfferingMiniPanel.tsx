import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Flame, Flower2, X } from "lucide-react";
import { deities } from "@/data/bhajans";
import { recordOffering } from "@/lib/devotion/devotionStorage";
import { cn } from "@/lib/utils";

type OfferingType = "flower" | "bell" | "diya";

type OfferingMiniPanelProps = {
  initialType?: OfferingType;
  deitySlug?: string;
  reducedMotion?: boolean;
  onClose: () => void;
  onDone?: (streak: number) => void;
};

const OFFERINGS: { id: OfferingType; label: string; icon: typeof Flower2 }[] = [
  { id: "flower", label: "Flower", icon: Flower2 },
  { id: "bell", label: "Bell", icon: Bell },
  { id: "diya", label: "Diya", icon: Flame },
];

/** Lightweight CSS-only offering — no particle spam for smooth mobile. */
export default function OfferingMiniPanel({
  initialType = "flower",
  deitySlug = "krishna",
  reducedMotion,
  onClose,
  onDone,
}: OfferingMiniPanelProps) {
  const [active, setActive] = useState<OfferingType>(initialType);
  const [burst, setBurst] = useState(false);
  const deity = deities.find((d) => d.slug === deitySlug) ?? deities[0];

  const playOffering = useCallback(() => {
    setBurst(true);
    const p = recordOffering();
    window.setTimeout(() => {
      setBurst(false);
      onDone?.(p.currentStreak);
    }, reducedMotion ? 400 : 900);
  }, [onDone, reducedMotion]);

  useEffect(() => {
    playOffering();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      role="dialog"
      aria-label="Virtual offering"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pointer-events-auto fixed inset-0 z-[95] flex items-end justify-center bg-black/55 p-4 sm:items-center"
    >
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-b from-[#2d1200] to-[#0d0d18] shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-black/40 p-2 text-amber-100"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative flex flex-col items-center px-6 pb-6 pt-10">
          <div className="relative">
            {deity.imageUrl ? (
              <img
                src={deity.imageUrl}
                alt={deity.name}
                className="h-36 w-36 rounded-2xl object-cover ring-2 ring-amber-400/40"
                loading="eager"
                decoding="async"
              />
            ) : null}
            <AnimatePresence>
              {burst && active === "flower" && !reducedMotion && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
                >
                  {Array.from({ length: 8 }).map((_, i) => (
                    <span
                      key={i}
                      className="absolute h-2 w-2 rounded-full bg-amber-400"
                      style={{
                        left: `${12 + i * 10}%`,
                        top: "-8%",
                        animation: `narad-fall 1s ease-in ${i * 0.08}s forwards`,
                      }}
                    />
                  ))}
                </motion.div>
              )}
              {burst && active === "diya" && (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -bottom-2 left-1/2 h-8 w-8 -translate-x-1/2 rounded-full bg-amber-400/80 blur-md"
                />
              )}
            </AnimatePresence>
          </div>

          <p className="mt-4 font-display text-lg text-amber-50">{deity.nameHindi || deity.name}</p>
          <p className="mt-1 text-center text-sm text-amber-100/75">
            {active === "flower"
              ? "\u092b\u0942\u0932 \u0915\u0940 \u0905\u0930\u094d\u092a\u0923"
              : active === "bell"
                ? "\u0918\u0902\u091f\u0940 \u092c\u091c\u0940"
                : "\u0926\u0940\u092a \u091c\u0932\u093e"}
          </p>

          <div className="mt-5 flex w-full gap-2">
            {OFFERINGS.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  setActive(o.id);
                  playOffering();
                }}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-xl border py-2.5 text-[11px] transition",
                  active === o.id
                    ? "border-amber-400/60 bg-amber-500/20 text-amber-50"
                    : "border-amber-400/20 text-amber-200/70",
                )}
              >
                <o.icon className="h-4 w-4" />
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes narad-fall {
          to { transform: translateY(160px); opacity: 0; }
        }
      `}</style>
    </motion.div>
  );
}
