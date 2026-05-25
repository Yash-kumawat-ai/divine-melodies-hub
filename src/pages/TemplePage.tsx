import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Bell, Flame, Flower2, Sparkles } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { deities } from "@/data/bhajans";
import JapaCounter from "@/components/devotion/JapaCounter";
import OfferingMiniPanel from "@/components/devotion/OfferingMiniPanel";
import { loadDevotionProgress } from "@/lib/devotion/devotionStorage";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

type OfferingType = "flower" | "bell" | "diya";

const TEMPLE_DEITIES = deities.filter((d) => d.imageUrl);

export default function TemplePage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialSlug = searchParams.get("deity") ?? TEMPLE_DEITIES[0]?.slug ?? "krishna";
  const [deitySlug, setDeitySlug] = useState(
    TEMPLE_DEITIES.some((d) => d.slug === initialSlug) ? initialSlug : TEMPLE_DEITIES[0]?.slug ?? "krishna",
  );
  const [showJapa, setShowJapa] = useState(false);
  const [offering, setOffering] = useState<OfferingType | null>(null);
  const [progress, setProgress] = useState(loadDevotionProgress);
  const [reducedMotion, setReducedMotion] = useState(false);

  const deity = TEMPLE_DEITIES.find((d) => d.slug === deitySlug) ?? TEMPLE_DEITIES[0];

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const fromUrl = searchParams.get("deity");
    if (fromUrl && TEMPLE_DEITIES.some((d) => d.slug === fromUrl)) {
      setDeitySlug(fromUrl);
    }
  }, [searchParams]);

  const refreshProgress = useCallback(() => setProgress(loadDevotionProgress()), []);

  if (!deity) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p>{t("templeNoDeity")}</p>
        <Link to="/all-deities" className="mt-4 inline-block text-primary underline">
          {t("allDeities")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-[radial-gradient(ellipse_at_top,#3d1a08_0%,#14001f_45%,#0a0a12_100%)] text-amber-50">
      <div className="container mx-auto max-w-lg px-4 pb-28 pt-6 md:pb-12 md:pt-10">
        <header className="text-center">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-amber-50 md:text-3xl">
            {t("templeTitle")}
          </h1>
          <p className="mt-1 text-sm text-amber-100/70">{t("templeSubtitle")}</p>
          {progress.currentStreak > 0 && (
            <p className="mt-2 inline-flex rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-100">
              {t("templePresence")}: {progress.currentStreak} {t("templeDays")}
            </p>
          )}
        </header>

        <div className="relative mx-auto mt-8 w-fit">
          <div
            className={cn(
              "relative overflow-hidden rounded-3xl ring-2 ring-amber-400/35 shadow-[0_0_48px_rgba(255,160,60,0.35)]",
              !reducedMotion && "animate-[pulse_4s_ease-in-out_infinite]",
            )}
            style={{ animationDuration: reducedMotion ? "0s" : undefined }}
          >
            {deity.imageUrl ? (
              <img
                src={deity.imageUrl}
                alt={deity.name}
                className="h-[min(52vw,280px)] w-[min(52vw,280px)] object-cover md:h-72 md:w-72"
                width={280}
                height={280}
                decoding="async"
              />
            ) : null}
          </div>
          <p className="mt-4 text-center font-display text-xl text-amber-50">{deity.nameHindi || deity.name}</p>
          <p className="text-center text-xs text-amber-200/60">{deity.description}</p>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TEMPLE_DEITIES.map((d) => (
            <button
              key={d.slug}
              type="button"
              onClick={() => setDeitySlug(d.slug)}
              className={cn(
                "flex shrink-0 flex-col items-center gap-1 rounded-xl border px-2 py-2 transition",
                deitySlug === d.slug
                  ? "border-amber-400/60 bg-amber-500/20"
                  : "border-amber-400/15 bg-black/20",
              )}
            >
              {d.imageUrl ? (
                <img src={d.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover" loading="lazy" />
              ) : (
                <span className="flex h-12 w-12 items-center justify-center text-2xl">{d.emoji}</span>
              )}
              <span className="max-w-[4.5rem] truncate text-[10px]">{d.name}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setOffering("flower")}
            className="flex flex-col items-center gap-2 rounded-2xl border border-amber-400/25 bg-black/25 py-4 transition active:scale-95 hover:bg-amber-500/10"
          >
            <Flower2 className="h-6 w-6 text-amber-300" />
            <span className="text-xs font-medium">{t("templeFlower")}</span>
          </button>
          <button
            type="button"
            onClick={() => setOffering("bell")}
            className="flex flex-col items-center gap-2 rounded-2xl border border-amber-400/25 bg-black/25 py-4 transition active:scale-95 hover:bg-amber-500/10"
          >
            <Bell className="h-6 w-6 text-amber-300" />
            <span className="text-xs font-medium">{t("templeBell")}</span>
          </button>
          <button
            type="button"
            onClick={() => setOffering("diya")}
            className="flex flex-col items-center gap-2 rounded-2xl border border-amber-400/25 bg-black/25 py-4 transition active:scale-95 hover:bg-amber-500/10"
          >
            <Flame className="h-6 w-6 text-amber-300" />
            <span className="text-xs font-medium">{t("templeDiya")}</span>
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setShowJapa(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 py-3 text-sm font-semibold text-white"
          >
            <Sparkles className="h-4 w-4" />
            {t("templeJapa")}
          </button>
          <Link
            to="/meditation"
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-amber-400/40 py-3 text-sm font-semibold text-amber-100"
          >
            {t("meditation")}
          </Link>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-amber-200/50">
          {t("templeNaradHint")}
        </p>
        <Link
          to={`/deity/${deity.slug}`}
          className="mt-3 block text-center text-sm font-medium text-amber-300/90 underline-offset-4 hover:underline"
        >
          {t("templeBhajans")} →
        </Link>
      </div>

      <AnimatePresence>
        {showJapa && (
          <JapaCounter
            deitySlug={deity.slug}
            reducedMotion={reducedMotion}
            onClose={() => setShowJapa(false)}
            onComplete={refreshProgress}
          />
        )}
        {offering && (
          <OfferingMiniPanel
            initialType={offering}
            deitySlug={deity.slug}
            reducedMotion={reducedMotion}
            onClose={() => setOffering(null)}
            onDone={() => {
              setOffering(null);
              refreshProgress();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
