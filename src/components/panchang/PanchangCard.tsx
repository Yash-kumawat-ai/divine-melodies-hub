import { motion } from 'framer-motion';
import { CalendarDays, Clock, Moon, Sparkles, Sun, TriangleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { loadPanchang } from '@/lib/panchang/loadPanchang';
import { todayInIndia, type PanchangData } from '@/lib/panchang/types';
import { getZoneFromBrowser, saveZoneOverride, ZONES, type PanchangZone } from '@/utils/panchangZone';
import { cn } from '@/lib/utils';

function formatDisplayDate(date: string) {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(`${date}T00:00:00+05:30`));
}

function displayValue(value: string) {
  return value?.trim() || 'Not available';
}

function PanchangSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-amber-300/30 bg-card/90 p-4 shadow-[0_24px_80px_-42px_rgba(245,158,11,0.75)] backdrop-blur-md sm:p-5">
      <div className="h-3 w-36 animate-pulse rounded-full bg-amber-500/20" />
      <div className="mt-3 h-8 w-56 animate-pulse rounded-full bg-muted" />
      <div className="mt-2 h-4 w-40 animate-pulse rounded-full bg-muted/70" />
      <div className="mt-5 grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-border/70 bg-background/70 p-3">
            <div className="mb-3 h-4 w-4 animate-pulse rounded-full bg-amber-500/20" />
            <div className="h-3 w-16 animate-pulse rounded-full bg-muted" />
            <div className="mt-2 h-4 w-24 animate-pulse rounded-full bg-muted/80" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PanchangCard() {
  const [zone, setZone] = useState<PanchangZone | null>(null);
  const [panchang, setPanchang] = useState<PanchangData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    void getZoneFromBrowser().then((detectedZone) => {
      if (isMounted) setZone(detectedZone);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!zone) return;

    const controller = new AbortController();

    async function fetchPanchang() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await loadPanchang(zone.name, controller.signal);
        if (!result?.data) {
          throw new Error('Panchang response unavailable.');
        }
        setPanchang(result.data);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Unable to load Panchang.');
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void fetchPanchang();
    return () => controller.abort();
  }, [zone]);

  function handleZoneChange(zoneName: string) {
    const selected = ZONES.find((item) => item.name === zoneName);
    if (!selected) return;
    saveZoneOverride(selected.name);
    setZone(selected);
  }

  if (isLoading && !panchang) {
    return <PanchangSkeleton />;
  }

  const isStale = Boolean(panchang && panchang.date !== todayInIndia());
  const currentZone = zone ?? ZONES[1];
  const primaryItems = panchang
    ? [
        { label: 'Tithi', value: `${displayValue(panchang.tithi)} (${displayValue(panchang.paksha)} Paksha)`, icon: Moon },
        { label: 'Nakshatra', value: displayValue(panchang.nakshatra), icon: Sparkles },
        { label: 'Yoga', value: displayValue(panchang.yoga), icon: CalendarDays },
        { label: 'Karana', value: displayValue(panchang.karana), icon: CalendarDays },
      ]
    : [];

  const timeItems = panchang
    ? [
        { label: 'Sunrise', value: displayValue(panchang.sunrise), icon: Sun, warning: false },
        { label: 'Sunset', value: displayValue(panchang.sunset), icon: Sun, warning: false },
        { label: 'Rahu Kaal', value: displayValue(panchang.rahu_kaal), icon: TriangleAlert, warning: true },
        { label: 'Brahma Muhurat', value: displayValue(panchang.brahma_muhurat), icon: Clock, warning: false },
      ]
    : [];

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden rounded-[1.75rem] border border-amber-300/30 bg-card/90 p-4 shadow-[0_24px_80px_-42px_rgba(245,158,11,0.75)] backdrop-blur-md sm:p-5"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-4 h-36 w-36 rounded-full bg-orange-500/15 blur-3xl" />

      <div className="relative flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-600 dark:text-amber-300">
                Panchang
              </p>
              {isStale && (
                <span className="rounded-full border border-amber-300/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700 dark:text-amber-200">
                  Updating
                </span>
              )}
            </div>
            <h2 className="mt-2 font-display text-2xl font-bold leading-tight text-foreground sm:text-3xl">
              {panchang ? formatDisplayDate(panchang.date) : 'Panchang unavailable'}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Zone: {currentZone.label} ({currentZone.city})
            </p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-400/15 font-display text-lg font-bold text-amber-600 shadow-inner dark:text-amber-200">
            Om
          </div>
        </div>

        <label className="relative block">
          <span className="sr-only">Change Panchang zone</span>
          <select
            value={currentZone.name}
            onChange={(event) => handleZoneChange(event.target.value)}
            className="h-10 w-full rounded-2xl border border-amber-300/35 bg-background/80 px-3 text-sm font-semibold text-foreground outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          >
            {ZONES.map((item) => (
              <option key={item.name} value={item.name}>
                {item.label} - {item.city}
              </option>
            ))}
          </select>
        </label>

        {error && (
          <div className="rounded-2xl border border-amber-300/35 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-100">
            {error}
          </div>
        )}

        {panchang && (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {primaryItems.map(({ label, value, icon: Icon }) => (
                <motion.div
                  key={label}
                  whileHover={{ y: -2 }}
                  className="min-h-[104px] rounded-2xl border border-border/70 bg-background/70 p-3 shadow-[0_10px_30px_-24px_rgba(0,0,0,0.45)]"
                >
                  <Icon className="mb-2 h-4 w-4 text-amber-600 dark:text-amber-300" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
                  <p className="mt-1 text-base font-bold leading-snug text-foreground">{value}</p>
                </motion.div>
              ))}
            </div>

            <div className="rounded-2xl border border-amber-300/25 bg-amber-50/45 p-3 dark:bg-amber-950/10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Vara</p>
              <p className="mt-1 text-sm font-bold text-foreground">{displayValue(panchang.vara)}</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {timeItems.map(({ label, value, icon: Icon, warning }) => (
                <div
                  key={label}
                  className={cn(
                    'rounded-2xl border p-3',
                    warning
                      ? 'border-amber-400/40 bg-amber-500/10 text-amber-900 dark:text-amber-100'
                      : 'border-border/70 bg-background/70 text-foreground',
                  )}
                >
                  <Icon className={cn('mb-2 h-4 w-4', warning ? 'text-amber-700 dark:text-amber-200' : 'text-amber-600 dark:text-amber-300')} />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
                  <p className="mt-1 text-sm font-bold leading-snug">{value}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.article>
  );
}
