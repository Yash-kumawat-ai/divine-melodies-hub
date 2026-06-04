import { motion } from 'framer-motion';
import {
  CalendarDays,
  BellRing,
  ChevronDown,
  Clock,
  CheckCircle2,
  Compass,
  Leaf,
  MapPin,
  Moon,
  Plus,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  Trash2,
  TriangleAlert,
  XCircle,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import FestivalCalendar from '@/components/panchang/FestivalCalendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { loadFestivalIndex } from '@/services/festivalService';
import { useLanguage } from '@/hooks/useLanguage';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import type { FestivalSummary } from '@/types/festival';
import { loadPanchang } from '@/lib/panchang/loadPanchang';
import { todayInIndia, type PanchangData } from '@/lib/panchang/types';
import { panchangKaryaLists, panchangMetaPlaceholders, panchangMuhuratTiles } from '@/data/panchangTemple';
import {
  findReminder,
  getDueReminders,
  loadFestivalReminders,
  markRemindersNotified,
  removeFestivalReminder,
  requestNotificationPermission,
  showFestivalNotification,
  todayInIndiaKey,
  upsertCustomReminder,
  upsertFestivalReminder,
  type FestivalReminder,
  type ReminderLeadDays,
} from '@/lib/panchang/festivalReminders';
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

function formatDateParts(date: string, language: 'en' | 'hi') {
  const parts = new Intl.DateTimeFormat(language === 'hi' ? 'hi-IN' : 'en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).formatToParts(new Date(`${date}T00:00:00+05:30`));

  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return {
    day: pick('day'),
    month: pick('month'),
    year: pick('year'),
    weekday: pick('weekday'),
  };
}

function FestivalMiniCard({
  festival,
  language,
  reminder,
  onToggleReminder,
}: {
  festival: FestivalSummary;
  language: 'en' | 'hi';
  reminder?: FestivalReminder;
  onToggleReminder: (festival: FestivalSummary) => void;
}) {
  return (
    <div className="temple-panel-soft min-w-0 p-3 shadow-[0_16px_50px_-40px_rgba(245,158,11,0.7)]">
      <div className="flex min-w-0 flex-col gap-3 min-[380px]:flex-row min-[380px]:items-start">
        <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: festival.color }} />
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-bold leading-snug text-foreground">
            {language === 'hi' ? festival.name_hi : festival.name_en}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {formatDate(festival.date, language)}
          </p>
          {reminder && (
            <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-500/12 px-2 py-1 text-[11px] font-bold text-amber-100">
              <BellRing className="h-3 w-3" />
              {language === 'hi' ? `${reminder.leadDays} दिन पहले` : `${reminder.leadDays} day alert`}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onToggleReminder(festival)}
          className={cn(
            'min-h-10 w-full shrink-0 rounded-full border px-3 text-xs font-bold transition min-[380px]:w-auto',
            reminder
              ? 'border-amber-400 bg-amber-500/15 text-amber-100'
              : 'border-border bg-background text-amber-100/70 hover:border-amber-400 hover:text-amber-100',
          )}
        >
          {reminder ? (language === 'hi' ? 'मार्क किया' : 'Marked') : (language === 'hi' ? 'रिमाइंड' : 'Remind')}
        </button>
      </div>
    </div>
  );
}

function ReminderCenter({
  reminders,
  language,
  notificationStatus,
  onPermission,
  onRemove,
  onCustomAdd,
  variant = 'standalone',
  className,
}: {
  reminders: FestivalReminder[];
  language: 'en' | 'hi';
  notificationStatus: string;
  onPermission: () => void;
  onRemove: (id: string) => void;
  onCustomAdd: (payload: { date: string; title: string; note: string; leadDays: ReminderLeadDays }) => void;
  variant?: 'standalone' | 'embedded';
  className?: string;
}) {
  const [date, setDate] = useState(todayInIndiaKey());
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [leadDays, setLeadDays] = useState<ReminderLeadDays>(1);
  const upcoming = reminders.filter((reminder) => reminder.date >= todayInIndiaKey()).slice(0, 4);
  const due = getDueReminders(reminders);

  const t = {
    title: language === 'hi' ? 'मेरे पर्व रिमाइंडर' : 'My Festival Reminders',
    permission: language === 'hi' ? 'नोटिफिकेशन चालू करें' : 'Enable notifications',
    marked: language === 'hi' ? 'मार्क किए गए' : 'Marked',
    due: language === 'hi' ? 'आज ध्यान दें' : 'Needs attention',
    addDate: language === 'hi' ? 'अपनी तारीख जोड़ें' : 'Add your own date',
    eventName: language === 'hi' ? 'नाम या संकल्प' : 'Name or sankalp',
    note: language === 'hi' ? 'नोट, पूजा सामग्री या तैयारी' : 'Note, puja items or preparation',
    save: language === 'hi' ? 'सेव रिमाइंडर' : 'Save reminder',
    empty: language === 'hi' ? 'अभी कोई रिमाइंडर मार्क नहीं है।' : 'No reminders marked yet.',
    before: language === 'hi' ? 'पहले' : 'before',
  };

  function submitCustom(event: FormEvent) {
    event.preventDefault();
    if (!date || !title.trim()) return;
    onCustomAdd({ date, title, note, leadDays });
    setTitle('');
    setNote('');
  }

  const wrapperClass = cn(
    variant === 'embedded' ? 'temple-panel-soft p-3 sm:p-4' : 'temple-panel p-4 sm:p-5',
    className,
  );

  return (
    <section className={wrapperClass}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-200/80">
            <BellRing className="h-3.5 w-3.5" />
            {t.marked}
          </p>
          <h2 className="mt-1 font-display text-xl font-bold text-foreground">{t.title}</h2>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="w-full rounded-full border-amber-300/40 bg-background/60 text-amber-100 sm:w-auto"
          onClick={onPermission}
        >
          {notificationStatus === 'granted' ? (language === 'hi' ? 'चालू' : 'On') : t.permission}
        </Button>
      </div>

      {due.length > 0 && (
        <div className="mt-4 rounded-2xl border border-orange-300/45 bg-orange-500/10 p-3">
          <p className="text-sm font-bold text-orange-100">{t.due}</p>
          <p className="mt-1 text-xs text-orange-100/70">
            {language === 'hi' ? 'आपके मार्क किए गए पर्व का समय आ गया है।' : 'A marked festival reminder is due.'}
          </p>
        </div>
      )}

      <div className="mt-4 max-h-56 space-y-2 overflow-y-auto pr-1">
        {upcoming.length === 0 ? (
          <p className="rounded-2xl border border-border/70 bg-background/75 p-3 text-sm text-muted-foreground">{t.empty}</p>
        ) : (
          upcoming.map((reminder) => (
            <div key={reminder.id} className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/75 p-3">
              <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: reminder.color }} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">
                  {language === 'hi' ? reminder.titleHi : reminder.titleEn}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(reminder.date, language)} · {reminder.leadDays} {t.before}
                </p>
                {reminder.note && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{reminder.note}</p>}
              </div>
              <button
                type="button"
                onClick={() => onRemove(reminder.id)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground"
                aria-label={language === 'hi' ? 'रिमाइंडर हटाएं' : 'Remove reminder'}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <form onSubmit={submitCustom} className="mt-4 rounded-2xl border border-amber-300/25 bg-amber-500/8 p-3">
        <p className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
          <Plus className="h-4 w-4 text-amber-200" />
          {t.addDate}
        </p>
        <div className="grid gap-2">
          <Input type="date" value={date} min={todayInIndiaKey()} onChange={(event) => setDate(event.target.value)} />
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={t.eventName} maxLength={56} />
          <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder={t.note} maxLength={180} />
          <div className="grid grid-cols-4 gap-2">
            {([0, 1, 3, 7] as const).map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setLeadDays(day)}
                className={cn(
                  'min-h-10 rounded-xl border text-xs font-bold',
                  leadDays === day ? 'border-amber-500 bg-amber-500/15 text-amber-800 dark:text-amber-100' : 'border-border bg-background text-muted-foreground',
                )}
              >
                {day === 0 ? (language === 'hi' ? 'आज' : 'Same') : `${day}d`}
              </button>
            ))}
          </div>
          <Button type="submit" className="h-11 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            {t.save}
          </Button>
        </div>
      </form>
    </section>
  );
}

function LoadingTempleCard() {
  return (
    <div className="temple-panel p-5">
      <div className="h-4 w-36 animate-pulse rounded-full bg-amber-500/25" />
      <div className="mt-4 h-10 w-64 max-w-full animate-pulse rounded-full bg-muted/60" />
      <div className="mt-6 grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-2xl bg-muted/50" />
        ))}
      </div>
    </div>
  );
}

export default function PanchangPage() {
  const { language } = useLanguage();
  const lang = language === 'hi' ? 'hi' : 'en';
  const isMobile = useIsMobile();
  const [zone, setZone] = useState<PanchangZone | null>(null);
  const [panchang, setPanchang] = useState<PanchangData | null>(() => {
    try {
      if (typeof window === 'undefined') return null;
      const today = todayInIndia();
      const zoneName = window.sessionStorage.getItem('panchang_zone_cached');
      if (!zoneName) return null;
      const raw = window.sessionStorage.getItem(`panchang_cache_${zoneName}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { data?: PanchangData };
      if (parsed.data?.date === today) return parsed.data;
    } catch {
      // ignore cache read errors
    }
    return null;
  });
  const [upcomingEvents, setUpcomingEvents] = useState<FestivalSummary[]>([]);
  const [reminders, setReminders] = useState<FestivalReminder[]>(() => loadFestivalReminders());
  const [notificationStatus, setNotificationStatus] = useState<string>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
  });
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
    const syncReminders = () => setReminders(loadFestivalReminders());
    window.addEventListener('hari-kirtan:festival-reminders', syncReminders);
    return () => window.removeEventListener('hari-kirtan:festival-reminders', syncReminders);
  }, []);

  useEffect(() => {
    const due = getDueReminders(reminders);
    if (due.length === 0) return;

    void Promise.all(due.map(async (reminder) => ((await showFestivalNotification(reminder, lang)) ? reminder.id : null))).then((ids) => {
      const shownIds = ids.filter((id): id is string => Boolean(id));
      if (shownIds.length > 0) {
        setReminders(markRemindersNotified(loadFestivalReminders(), shownIds));
      }
    });
  }, [lang, reminders]);

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
  const displayDate = panchang?.date ?? today;
  const dateParts = formatDateParts(displayDate, lang);
  const isStale = Boolean(panchang && panchang.date !== today);

  const emptyValue = lang === 'hi' ? 'उपलब्ध नहीं' : 'Not available';
  const displayValue = (value?: string) => (value && value.trim().length > 0 ? value : emptyValue);
  const localized = (value: { en: string; hi: string }) => (lang === 'hi' ? value.hi : value.en);

  const text = {
    title: lang === 'hi' ? 'आज का पंचांग' : "Today's Panchang",
    subtitle:
      lang === 'hi'
        ? 'तिथि, नक्षत्र, मुहूर्त और पर्व — एक शांत दैनिक दृश्य।'
        : 'Tithi, nakshatra, muhurat and festivals in a calm daily view.',
    invocation: lang === 'hi' ? 'जय श्री राम' : 'Jai Shri Ram',
    zone: lang === 'hi' ? 'क्षेत्र' : 'Zone',
    updated: lang === 'hi' ? 'आज अपडेटेड' : 'Updated today',
    updating: lang === 'hi' ? 'अपडेट हो रहा है' : 'Updating',
    changeZone: lang === 'hi' ? 'क्षेत्र बदलें' : 'Change zone',
    dateLabel: lang === 'hi' ? 'तारीख' : 'Date',
    vikram: lang === 'hi' ? 'विक्रम संवत' : 'Vikram Samvat',
    paksha: lang === 'hi' ? 'पक्ष' : 'Paksha',
    sunrise: lang === 'hi' ? 'सूर्योदय' : 'Sunrise',
    sunset: lang === 'hi' ? 'सूर्यास्त' : 'Sunset',
    panchangDetails: lang === 'hi' ? 'पंचांग विवरण' : 'Panchang Details',
    muhurat: lang === 'hi' ? 'शुभ मुहूर्त' : 'Shubh Muhurat',
    rahuKaal: lang === 'hi' ? 'राहु काल' : 'Rahu Kaal',
    rahuHint:
      lang === 'hi' ? 'इस समय कोई शुभ कार्य न करें' : 'Avoid auspicious work during this time',
    shubhKarya: lang === 'hi' ? 'शुभ कार्य' : 'Auspicious Work',
    ashubhKarya: lang === 'hi' ? 'अशुभ कार्य' : 'Inauspicious Work',
    upcomingEvents: lang === 'hi' ? 'आने वाले पर्व और आयोजन' : 'Upcoming Events',
    noUpcomingEvents: lang === 'hi' ? 'अभी कोई आने वाला पर्व सूचीबद्ध नहीं है।' : 'No upcoming events listed.',
    home: lang === 'hi' ? 'होम पर जाएं' : 'Back Home',
  };

  const pakshaText = panchang
    ? lang === 'hi'
      ? `${panchang.paksha} पक्ष`
      : `${panchang.paksha} Paksha`
    : localized(panchangMetaPlaceholders.paksha);

  const leftDetails = [
    { label: lang === 'hi' ? 'तिथि' : 'Tithi', value: displayValue(panchang?.tithi), icon: Moon },
    { label: lang === 'hi' ? 'नक्षत्र' : 'Nakshatra', value: displayValue(panchang?.nakshatra), icon: Sparkles },
    { label: lang === 'hi' ? 'योग' : 'Yoga', value: displayValue(panchang?.yoga), icon: Sparkles },
    { label: lang === 'hi' ? 'करण' : 'Karana', value: displayValue(panchang?.karana), icon: CalendarDays },
    { label: lang === 'hi' ? 'चंद्र राशि' : 'Chandra Rashi', value: localized(panchangMetaPlaceholders.chandraRashi), icon: Moon },
    { label: lang === 'hi' ? 'ऋतु' : 'Ritu', value: localized(panchangMetaPlaceholders.ritu), icon: Leaf },
  ];

  const rightDetails = [
    { label: lang === 'hi' ? 'वार' : 'Vara', value: displayValue(panchang?.vara), icon: Sun },
    { label: lang === 'hi' ? 'सूर्य राशि' : 'Surya Rashi', value: localized(panchangMetaPlaceholders.suryaRashi), icon: Sun },
    { label: lang === 'hi' ? 'पक्ष' : 'Paksha', value: pakshaText, icon: Moon },
    { label: lang === 'hi' ? 'अयन' : 'Ayan', value: localized(panchangMetaPlaceholders.ayan), icon: Compass },
    { label: lang === 'hi' ? 'मास' : 'Maas', value: localized(panchangMetaPlaceholders.maas), icon: CalendarDays },
  ];

  const muhuratTiles = panchangMuhuratTiles.map((tile) =>
    tile.id === 'brahma' && panchang?.brahma_muhurat
      ? { ...tile, time: panchang.brahma_muhurat }
      : tile,
  );

  const detailsSection = isLoading && !panchang ? (
    <LoadingTempleCard />
  ) : (
    <section className="temple-panel p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200/70">{text.panchangDetails}</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-foreground">{text.panchangDetails}</h2>
        </div>
        <p className="text-sm text-amber-100/70">{formatDate(displayDate, lang)}</p>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-amber-300/35 bg-amber-500/10 p-3 text-sm text-amber-100">
          {error}
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-0 md:grid-cols-2">
        <div className="divide-y divide-amber-500/10">
          {leftDetails.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3 py-2.5">
              <Icon className="h-4 w-4 shrink-0 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-200/80">{label}</span>
              <span className="ml-auto text-sm font-semibold text-foreground">{value}</span>
            </div>
          ))}
        </div>
        <div className="divide-y divide-amber-500/10 md:border-l md:border-amber-500/10">
          {rightDetails.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3 py-2.5 md:pl-4">
              <Icon className="h-4 w-4 shrink-0 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-200/80">{label}</span>
              <span className="ml-auto text-sm font-semibold text-foreground">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const muhuratBody = (
    <>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {muhuratTiles.map((tile) => (
          <div key={tile.id} className="temple-panel-soft min-w-0 p-3 sm:p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200/70">
              {localized(tile.title)}
            </p>
            <p className="mt-2 text-lg font-semibold text-amber-100">{tile.time}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-amber-400/35 bg-amber-500/10 p-4">
        <div className="flex items-center gap-2 text-amber-100">
          <TriangleAlert className="h-5 w-5" />
          <p className="font-display text-lg font-bold">{text.rahuKaal}</p>
        </div>
        <p className="mt-2 text-2xl font-bold text-amber-100">{displayValue(panchang?.rahu_kaal)}</p>
        <p className="mt-1 text-sm text-amber-100/70">{text.rahuHint}</p>
      </div>
    </>
  );

  const muhuratSection = (
    <section className="temple-panel p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-amber-200" />
        <h2 className="font-display text-2xl font-bold text-foreground">{text.muhurat}</h2>
      </div>
      {muhuratBody}
    </section>
  );

  const karyaSection = (
    <section className="temple-panel p-4 sm:p-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <div className="temple-panel-soft p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200/70">{text.shubhKarya}</p>
          </div>
          <div className="mt-3 space-y-1 text-xs text-amber-100 sm:text-sm">
            {panchangKaryaLists.shubh.map((item) => (
              <div key={item.hi} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                <span>{localized(item)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="temple-panel-soft p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-rose-300" />
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200/70">{text.ashubhKarya}</p>
          </div>
          <div className="mt-3 space-y-1 text-xs text-amber-100 sm:text-sm">
            {panchangKaryaLists.ashubh.map((item) => (
              <div key={item.hi} className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-rose-300" />
                <span>{localized(item)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  const upcomingEventsList = (
    <div className={cn('mt-4 space-y-3', isMobile ? 'max-h-60 overflow-y-auto pr-1' : 'max-h-[360px] overflow-y-auto pr-1')}>
      {festivalLoading && (
        <p className="temple-panel-soft p-3 text-sm text-amber-100/70">
          {lang === 'hi' ? 'पर्व लोड हो रहे हैं...' : 'Loading festivals...'}
        </p>
      )}
      {!festivalLoading && upcomingEvents.length === 0 && (
        <p className="temple-panel-soft p-3 text-sm text-amber-100/70">{text.noUpcomingEvents}</p>
      )}
      {upcomingEvents.map((festival) => (
        <FestivalMiniCard
          key={festival.id}
          festival={festival}
          language={lang}
          reminder={findReminder(reminders, 'festival', festival.date, festival.id)}
          onToggleReminder={handleToggleFestivalReminder}
        />
      ))}
    </div>
  );

  const upcomingEventsSection = (
    <section className="temple-panel p-4 sm:p-5">
      <h2 className="font-display text-2xl font-bold text-foreground">{text.upcomingEvents}</h2>
      {upcomingEventsList}
    </section>
  );

  const upcomingEventsEmbedded = (
    <div className="temple-panel-soft p-3 sm:p-4">
      <h3 className="text-sm font-semibold text-amber-100">{text.upcomingEvents}</h3>
      {upcomingEventsList}
    </div>
  );

  function handleZoneChange(zoneName: string) {
    const selected = ZONES.find((item) => item.name === zoneName);
    if (!selected) return;
    saveZoneOverride(selected.name);
    setZone(selected);
  }

  async function handleNotificationPermission() {
    const status = await requestNotificationPermission();
    setNotificationStatus(status);
  }

  function handleToggleFestivalReminder(festival: FestivalSummary) {
    const existing = findReminder(reminders, 'festival', festival.date, festival.id);
    if (existing) {
      setReminders(removeFestivalReminder(existing.id));
      return;
    }
    setReminders(upsertFestivalReminder(festival, { leadDays: 1 }));
  }

  function handleCustomReminder(payload: { date: string; title: string; note: string; leadDays: ReminderLeadDays }) {
    setReminders(upsertCustomReminder(payload));
  }

  function handleRemoveReminder(id: string) {
    setReminders(removeFestivalReminder(id));
  }

  return (
    <div className="panchang-temple panchang-temple-bg min-h-screen overflow-x-hidden px-3 py-4 sm:px-4 sm:py-10">
      <SEO
        title={lang === 'hi' ? 'आज का पंचांग - Hari Kirtan' : "Today's Panchang - Hari Kirtan"}
        description="Daily Panchang, sacred timings, vrat and Hindu festival guide."
      />

      <div className="mx-auto w-full max-w-6xl space-y-4 sm:space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="temple-panel relative overflow-hidden p-3 sm:p-7"
        >
          <div className="pointer-events-none absolute -right-14 -top-16 h-40 w-40 rounded-full bg-amber-400/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-6 h-52 w-52 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 max-w-2xl">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200/70 sm:text-[11px] sm:tracking-[0.38em]">
                  {lang === 'hi' ? '|| आज का पंचांग ||' : '|| Daily Panchang ||'}
                </p>
                <h1 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-4xl">
                  {text.title}
                </h1>
                <p className="mt-2 text-xs text-amber-100/70 sm:text-base">{text.subtitle}</p>
                <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full border border-amber-300/20 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-100/80 sm:tracking-[0.2em]">
                  <Sparkles className="h-3.5 w-3.5" />
                  {text.invocation}
                </div>
              </div>

              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                <span className="rounded-full border border-amber-300/35 bg-amber-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-100/80 sm:tracking-[0.2em]">
                  {isStale ? text.updating : text.updated}
                </span>
                <Button asChild variant="outline" className="h-10 flex-1 rounded-full border-amber-300/40 bg-background/60 text-amber-100 min-[380px]:flex-none">
                  <Link to="/">{text.home}</Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 min-[390px]:grid-cols-2 md:grid-cols-[1.15fr_1fr_1fr]">
              <div className="temple-panel-soft p-3 sm:p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200/70">{text.dateLabel}</p>
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="text-3xl font-display font-bold text-amber-100 sm:text-4xl">{dateParts.day}</span>
                  <div>
                    <p className="text-sm font-semibold text-amber-100">
                      {dateParts.month} {dateParts.year}
                    </p>
                    <p className="text-xs text-amber-100/70">{dateParts.weekday}</p>
                  </div>
                </div>
              </div>

              <div className="temple-panel-soft p-3 sm:p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200/70">{text.vikram}</p>
                <p className="mt-1 text-lg font-semibold text-amber-100">
                  {localized(panchangMetaPlaceholders.vikramSamvat)}
                </p>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200/70">{text.paksha}</p>
                <p className="text-sm font-semibold text-amber-100">{pakshaText}</p>
                <p className="text-xs text-amber-100/70">{displayValue(panchang?.tithi)}</p>
              </div>

              <div className="temple-panel-soft p-3 min-[390px]:col-span-2 sm:p-4 md:col-span-1">
                <div className="flex items-center gap-3">
                  <Sunrise className="h-4 w-4 text-amber-200" />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200/70">{text.sunrise}</p>
                    <p className="text-sm font-semibold text-amber-100">{displayValue(panchang?.sunrise)}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <Sunset className="h-4 w-4 text-amber-200" />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200/70">{text.sunset}</p>
                    <p className="text-sm font-semibold text-amber-100">{displayValue(panchang?.sunset)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex min-w-0 items-start gap-2 text-sm text-amber-100/80">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" />
                <span className="min-w-0 break-words">
                  {text.zone}: {currentZone.label} ({currentZone.city})
                </span>
              </div>

              <label className="relative block w-full min-w-0 sm:w-auto sm:min-w-[220px]">
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-amber-200/70 sm:tracking-[0.2em]">
                  {text.changeZone}
                </span>
                <select
                  value={currentZone.name}
                  onChange={(event) => handleZoneChange(event.target.value)}
                  className="h-11 w-full appearance-none rounded-full border border-amber-300/30 bg-background/70 px-4 pr-10 text-sm font-semibold text-foreground outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20"
                >
                  {ZONES.map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.label} - {item.city}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute bottom-3 right-4 h-4 w-4 text-amber-200/70" />
              </label>
            </div>
          </div>
        </motion.section>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
          <div className="min-w-0 space-y-4 sm:space-y-6">
            {isLoading && !panchang ? (
              <LoadingTempleCard />
            ) : (
              <section className="temple-panel p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200/70">
                      {text.panchangDetails}
                    </p>
                    <h2 className="mt-1 font-display text-2xl font-bold text-foreground">
                      {text.panchangDetails}
                    </h2>
                  </div>
                  <p className="text-sm text-amber-100/70">{formatDate(displayDate, lang)}</p>
                </div>

                {error && (
                  <div className="mt-4 rounded-2xl border border-amber-300/35 bg-amber-500/10 p-3 text-sm text-amber-100">
                    {error}
                  </div>
                )}

                <div className="mt-4 grid grid-cols-1 gap-0 md:grid-cols-2">
                  <div className="divide-y divide-amber-500/10">
                    {leftDetails.map(({ label, value, icon: Icon }) => (
                      <div key={label} className="flex items-center gap-3 py-2.5">
                        <Icon className="h-4 w-4 shrink-0 text-amber-400" />
                        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-200/80">{label}</span>
                        <span className="ml-auto text-sm font-semibold text-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="divide-y divide-amber-500/10 md:border-l md:border-amber-500/10">
                    {rightDetails.map(({ label, value, icon: Icon }) => (
                      <div key={label} className="flex items-center gap-3 py-2.5 md:pl-4">
                        <Icon className="h-4 w-4 shrink-0 text-amber-400" />
                        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-200/80">{label}</span>
                        <span className="ml-auto text-sm font-semibold text-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            <section className="temple-panel p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-200" />
                <h2 className="font-display text-2xl font-bold text-foreground">{text.muhurat}</h2>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {muhuratTiles.map((tile) => (
                  <div key={tile.id} className="temple-panel-soft min-w-0 p-3 sm:p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200/70">
                      {localized(tile.title)}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-amber-100">{tile.time}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-amber-400/35 bg-amber-500/10 p-4">
                <div className="flex items-center gap-2 text-amber-100">
                  <TriangleAlert className="h-5 w-5" />
                  <p className="font-display text-lg font-bold">{text.rahuKaal}</p>
                </div>
                <p className="mt-2 text-2xl font-bold text-amber-100">{displayValue(panchang?.rahu_kaal)}</p>
                <p className="mt-1 text-sm text-amber-100/70">{text.rahuHint}</p>
              </div>
            </section>

            <section className="temple-panel p-4 sm:p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <div className="temple-panel-soft p-3 sm:p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200/70">{text.shubhKarya}</p>
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-amber-100 sm:text-sm">
                    {panchangKaryaLists.shubh.map((item) => (
                      <div key={item.hi} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                        <span>{localized(item)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="temple-panel-soft p-3 sm:p-4">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-rose-300" />
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200/70">{text.ashubhKarya}</p>
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-amber-100 sm:text-sm">
                    {panchangKaryaLists.ashubh.map((item) => (
                      <div key={item.hi} className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-rose-300" />
                        <span>{localized(item)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <div className="space-y-4 lg:hidden">
              <ReminderCenter
                reminders={reminders}
                language={lang}
                notificationStatus={notificationStatus}
                onPermission={handleNotificationPermission}
                onRemove={handleRemoveReminder}
                onCustomAdd={handleCustomReminder}
              />
              {upcomingEventsSection}
            </div>

            <FestivalCalendar />
          </div>

          <aside className="hidden min-w-0 space-y-4 sm:space-y-6 lg:block">
            <ReminderCenter
              reminders={reminders}
              language={lang}
              notificationStatus={notificationStatus}
              onPermission={handleNotificationPermission}
              onRemove={handleRemoveReminder}
              onCustomAdd={handleCustomReminder}
            />

            <section className="temple-panel p-4 sm:p-5">
              <h2 className="font-display text-2xl font-bold text-foreground">{text.upcomingEvents}</h2>
              <div className="mt-4 max-h-[360px] space-y-3 overflow-y-auto pr-1">
                {festivalLoading && (
                  <p className="temple-panel-soft p-3 text-sm text-amber-100/70">
                    {lang === 'hi' ? 'पर्व लोड हो रहे हैं...' : 'Loading festivals...'}
                  </p>
                )}
                {!festivalLoading && upcomingEvents.length === 0 && (
                  <p className="temple-panel-soft p-3 text-sm text-amber-100/70">{text.noUpcomingEvents}</p>
                )}
                {upcomingEvents.map((festival) => (
                  <FestivalMiniCard
                    key={festival.id}
                    festival={festival}
                    language={lang}
                    reminder={findReminder(reminders, 'festival', festival.date, festival.id)}
                    onToggleReminder={handleToggleFestivalReminder}
                  />
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
