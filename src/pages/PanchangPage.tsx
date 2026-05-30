import { motion } from 'framer-motion';
import {
  CalendarDays,
  ChevronDown,
  Clock,
  Flame,
  MapPin,
  Moon,
  Sparkles,
  Sun,
  TriangleAlert,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import FestivalCalendar from '@/components/panchang/FestivalCalendar';
import { Button } from '@/components/ui/button';
import { loadFestivalIndex } from '@/services/festivalService';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';
import type { FestivalSummary } from '@/types/festival';
import { loadPanchang } from '@/lib/panchang/loadPanchang';
import { todayInIndia, type PanchangData } from '@/lib/panchang/types';
import { getZoneFromBrowser, saveZoneOverride, ZONES, type PanchangZone } from '@/utils/panchangZone';

function formatDate(date: string, language: 'en' | 'hi') {
  return new Intl.DateTimeFormat(language === 'hi' ? 'hi-IN' : 'en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(`${date}T00:00:00+05:30`));
}

function FestivalMiniCard({ festival, language }: { festival: FestivalSummary; language: 'en' | 'hi' }) {
  return (
    <div className="rounded-2xl border border-amber-300/25 bg-background/80 p-3 shadow-[0_12px_36px_-30px_rgba(245,158,11,0.8)]">
      <div className="flex items-start gap-3">
        <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: festival.color }} />
        <div className="min-w-0">
          <p className="font-display text-sm font-bold leading-snug text-foreground">
            {language === 'hi' ? festival.name_hi : festival.name_en}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {formatDate(festival.date, language)}
          </p>
        </div>
      </div>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="rounded-[1.75rem] border border-amber-300/25 bg-card/90 p-4 shadow-[0_24px_80px_-44px_rgba(245,158,11,0.72)]">
      <div className="h-4 w-36 animate-pulse rounded-full bg-amber-500/20" />
      <div className="mt-4 h-10 w-64 max-w-full animate-pulse rounded-full bg-muted" />
      <div className="mt-6 grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-2xl bg-muted/70" />
        ))}
      </div>
    </div>
  );
}

export default function PanchangPage() {
  const { language } = useLanguage();
  const lang = language === 'hi' ? 'hi' : 'en';
  const [zone, setZone] = useState<PanchangZone | null>(null);
  const [panchang, setPanchang] = useState<PanchangData | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<FestivalSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [festivalLoading, setFestivalLoading] = useState(true);
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

    async function loadPanchang() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await loadPanchang(zone.name, controller.signal);
        setPanchang(result.data);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Unable to load Panchang.');
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadPanchang();
    return () => controller.abort();
  }, [zone]);

  useEffect(() => {
    let isMounted = true;
    const today = todayInIndia();
    setFestivalLoading(true);

    loadFestivalIndex(2026)
      .then((index) => {
        if (!isMounted) return;
        setUpcomingEvents(index.festivals.filter((festival) => festival.date >= today).slice(0, 6));
      })
      .catch(() => {
        if (!isMounted) return;
        setUpcomingEvents([]);
      })
      .finally(() => {
        if (isMounted) setFestivalLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const currentZone = zone ?? ZONES[1];
  const today = todayInIndia();
  const isStale = Boolean(panchang && panchang.date !== today);

  const text = {
    title: lang === 'hi' ? 'आज का पंचांग' : "Today's Panchang",
    subtitle:
      lang === 'hi'
        ? 'तिथि, नक्षत्र, मुहूर्त और पर्व एक शांत स्थान पर।'
        : 'Tithi, nakshatra, muhurat and festivals in one calm daily view.',
    zone: lang === 'hi' ? 'क्षेत्र' : 'Zone',
    updated: lang === 'hi' ? 'आज अपडेटेड' : 'Updated today',
    updating: lang === 'hi' ? 'अपडेट हो रहा है' : 'Updating',
    changeZone: lang === 'hi' ? 'क्षेत्र बदलें' : 'Change zone',
    panchangDetails: lang === 'hi' ? 'पंचांग विवरण' : 'Panchang Details',
    sacredTimes: lang === 'hi' ? 'शुभ समय' : 'Sacred Times',
    upcomingEvents: lang === 'hi' ? 'आने वाले पर्व और आयोजन' : 'Upcoming Events',
    noUpcomingEvents: lang === 'hi' ? 'अभी कोई आने वाला पर्व सूचीबद्ध नहीं है।' : 'No upcoming events listed.',
    home: lang === 'hi' ? 'होम पर जाएं' : 'Back Home',
  };

  const detailItems = panchang
    ? [
        { label: lang === 'hi' ? 'तिथि' : 'Tithi', value: `${panchang.tithi} (${panchang.paksha} Paksha)`, icon: Moon, featured: true },
        { label: lang === 'hi' ? 'नक्षत्र' : 'Nakshatra', value: panchang.nakshatra, icon: Sparkles, featured: true },
        { label: lang === 'hi' ? 'योग' : 'Yoga', value: panchang.yoga, icon: CalendarDays },
        { label: lang === 'hi' ? 'करण' : 'Karana', value: panchang.karana, icon: CalendarDays },
        { label: lang === 'hi' ? 'वार' : 'Vara', value: panchang.vara, icon: Sun },
      ]
    : [];

  const timeItems = panchang
    ? [
        { label: lang === 'hi' ? 'सूर्योदय' : 'Sunrise', value: panchang.sunrise, icon: Sun },
        { label: lang === 'hi' ? 'सूर्यास्त' : 'Sunset', value: panchang.sunset, icon: Sun },
        { label: lang === 'hi' ? 'राहु काल' : 'Rahu Kaal', value: panchang.rahu_kaal, icon: TriangleAlert, warning: true },
        { label: lang === 'hi' ? 'ब्रह्म मुहूर्त' : 'Brahma Muhurat', value: panchang.brahma_muhurat, icon: Clock },
      ]
    : [];

  function handleZoneChange(zoneName: string) {
    const selected = ZONES.find((item) => item.name === zoneName);
    if (!selected) return;
    saveZoneOverride(selected.name);
    setZone(selected);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.22),transparent_32rem),linear-gradient(180deg,rgba(255,247,237,0.9),rgba(255,255,255,0.96)_34%,rgba(255,247,237,0.55))] px-4 py-6 dark:bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.16),transparent_30rem),linear-gradient(180deg,#120b05,#060403_48%,#120b05)] sm:py-10">
      <SEO
        title={lang === 'hi' ? 'आज का पंचांग - Hari Kirtan' : "Today's Panchang - Hari Kirtan"}
        description="Daily Panchang, sacred timings, vrat and Hindu festival guide."
      />

      <div className="mx-auto max-w-6xl">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2rem] border border-amber-300/30 bg-card/88 p-5 shadow-[0_28px_90px_-48px_rgba(245,158,11,0.9)] backdrop-blur-md sm:p-8"
        >
          <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-6 h-52 w-52 rounded-full bg-orange-500/15 blur-3xl" />

          <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/35 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-200">
                <Flame className="h-3.5 w-3.5" />
                {isStale ? text.updating : text.updated}
              </div>
              <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-foreground sm:text-5xl">
                {text.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {text.subtitle}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                <span>{text.zone}: {currentZone.label} ({currentZone.city})</span>
              </div>
            </div>

            <div className="grid gap-3">
              <label className="relative block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  {text.changeZone}
                </span>
                <select
                  value={currentZone.name}
                  onChange={(event) => handleZoneChange(event.target.value)}
                  className="h-12 w-full appearance-none rounded-2xl border border-amber-300/35 bg-background/85 px-4 pr-10 text-sm font-semibold text-foreground outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                >
                  {ZONES.map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.label} - {item.city}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute bottom-4 right-4 h-4 w-4 text-muted-foreground" />
              </label>
              <Button asChild variant="outline" className="h-11 rounded-2xl border-amber-300/40 bg-background/65">
                <Link to="/">{text.home}</Link>
              </Button>
            </div>
          </div>
        </motion.section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.86fr]">
          <div className="space-y-5">
            {isLoading && !panchang ? (
              <LoadingCard />
            ) : (
              <section className="rounded-[1.75rem] border border-amber-300/25 bg-card/90 p-4 shadow-[0_24px_80px_-44px_rgba(245,158,11,0.72)] backdrop-blur-md sm:p-5">
                <h2 className="font-display text-xl font-bold text-foreground">{text.panchangDetails}</h2>
                {error && (
                  <div className="mt-4 rounded-2xl border border-amber-300/35 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-100">
                    {error}
                  </div>
                )}
                {panchang && (
                  <>
                    <p className="mt-1 text-sm text-muted-foreground">{formatDate(panchang.date, lang)}</p>
                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {detailItems.map(({ label, value, icon: Icon, featured }) => (
                        <div
                          key={label}
                          className={cn(
                            'rounded-2xl border border-border/70 bg-background/75 p-4',
                            featured && 'border-amber-300/45 bg-amber-50/65 dark:bg-amber-950/15',
                          )}
                        >
                          <Icon className="mb-3 h-5 w-5 text-amber-600 dark:text-amber-300" />
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
                          <p className={cn('mt-1 font-bold leading-snug text-foreground', featured ? 'text-lg' : 'text-base')}>{value}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </section>
            )}

            <section className="rounded-[1.75rem] border border-amber-300/25 bg-card/90 p-4 shadow-[0_24px_80px_-44px_rgba(245,158,11,0.72)] backdrop-blur-md sm:p-5">
              <h2 className="font-display text-xl font-bold text-foreground">{text.sacredTimes}</h2>
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {timeItems.map(({ label, value, icon: Icon, warning }) => (
                  <div
                    key={label}
                    className={cn(
                      'rounded-2xl border p-4',
                      warning
                        ? 'border-amber-400/40 bg-amber-500/10 text-amber-900 dark:text-amber-100'
                        : 'border-border/70 bg-background/75 text-foreground',
                    )}
                  >
                    <Icon className={cn('mb-3 h-5 w-5', warning ? 'text-amber-700 dark:text-amber-200' : 'text-amber-600 dark:text-amber-300')} />
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
                    <p className="mt-1 text-base font-bold leading-snug">{value}</p>
                  </div>
                ))}
              </div>
            </section>

            <FestivalCalendar />
          </div>

          <aside className="space-y-5">
            <section className="rounded-[1.75rem] border border-amber-300/25 bg-card/90 p-4 shadow-[0_24px_80px_-44px_rgba(245,158,11,0.72)] backdrop-blur-md sm:p-5">
              <h2 className="font-display text-xl font-bold text-foreground">{text.upcomingEvents}</h2>
              <div className="mt-4 space-y-3">
                {festivalLoading && <p className="rounded-2xl border border-border/70 bg-background/75 p-3 text-sm text-muted-foreground">{lang === 'hi' ? 'पर्व लोड हो रहे हैं...' : 'Loading festivals...'}</p>}
                {!festivalLoading && upcomingEvents.length === 0 && (
                  <p className="rounded-2xl border border-border/70 bg-background/75 p-3 text-sm text-muted-foreground">{text.noUpcomingEvents}</p>
                )}
                {upcomingEvents.map((festival) => <FestivalMiniCard key={festival.id} festival={festival} language={lang} />)}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
