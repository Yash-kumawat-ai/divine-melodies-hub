import { motion } from 'framer-motion';
import { BellRing, CalendarDays, ChevronLeft, ChevronRight, Flame, Moon, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { loadFestivalMonth, getFestivalsForDate, getCurrentFestivalMonth } from '@/services/festivalService';
import type { FestivalData, FestivalMonthData } from '@/types/festival';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';
import {
  findReminder,
  loadFestivalReminders,
  removeFestivalReminder,
  upsertFestivalReminder,
  type FestivalReminder,
} from '@/lib/panchang/festivalReminders';

type CalendarDay = {
  date: string;
  day: number;
  inMonth: boolean;
  festivals: FestivalData[];
};

function formatMonthTitle(month: string, language: 'en' | 'hi') {
  return new Intl.DateTimeFormat(language === 'hi' ? 'hi-IN' : 'en-IN', {
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(`${month}-01T00:00:00+05:30`));
}

function formatDate(date: string, language: 'en' | 'hi') {
  return new Intl.DateTimeFormat(language === 'hi' ? 'hi-IN' : 'en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(`${date}T00:00:00+05:30`));
}

function todayInIndia() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function shiftMonth(month: string, delta: number) {
  const [year, monthNumber] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function buildCalendarDays(month: string, monthData: FestivalMonthData | null): CalendarDay[] {
  const [year, monthNumber] = month.split('-').map(Number);
  const firstDate = new Date(Date.UTC(year, monthNumber - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const mondayStartOffset = (firstDate.getUTCDay() + 6) % 7;
  const days: CalendarDay[] = [];

  for (let index = 0; index < mondayStartOffset; index += 1) {
    days.push({ date: '', day: 0, inMonth: false, festivals: [] });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${month}-${String(day).padStart(2, '0')}`;
    days.push({
      date,
      day,
      inMonth: true,
      festivals: getFestivalsForDate(monthData, date),
    });
  }

  while (days.length % 7 !== 0) {
    days.push({ date: '', day: 0, inMonth: false, festivals: [] });
  }

  return days;
}

function FestivalDetailContent({
  date,
  festivals,
  language,
  reminders,
  onToggleReminder,
}: {
  date: string | null;
  festivals: FestivalData[];
  language: 'en' | 'hi';
  reminders: FestivalReminder[];
  onToggleReminder: (festival: FestivalData) => void;
}) {
  if (!date) return null;

  const emptyText =
    language === 'hi'
      ? 'इस दिन कोई प्रमुख पर्व सूचीबद्ध नहीं है।'
      : 'No major festival is listed for this date.';

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-muted-foreground">{formatDate(date, language)}</p>
      {festivals.length === 0 ? (
        <div className="rounded-xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">{emptyText}</div>
      ) : (
        festivals.map((festival) => (
          <article key={festival.id} className="rounded-xl border border-amber-300/30 bg-background/82 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: festival.color }} />
              <div className="min-w-0 flex-1">
                <h4 className="font-display text-lg font-bold leading-snug text-foreground">
                  {language === 'hi' ? festival.name_hi : festival.name_en}
                </h4>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300">
                  {festival.deity} · {festival.importance}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant={findReminder(reminders, 'festival', festival.date, festival.id) ? 'default' : 'secondary'}
                onClick={() => onToggleReminder(festival)}
                className={cn(
                  'shrink-0 rounded-full font-bold transition',
                  findReminder(reminders, 'festival', festival.date, festival.id)
                    ? 'btn-primary'
                    : 'btn-secondary',
                )}
              >
                <BellRing className="h-3.5 w-3.5" />
                {findReminder(reminders, 'festival', festival.date, festival.id)
                  ? language === 'hi'
                    ? 'मार्क किया'
                    : 'Marked'
                  : language === 'hi'
                    ? 'रिमाइंड'
                    : 'Remind'}
              </Button>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {language === 'hi' ? festival.description_hi : festival.description_en}
            </p>

            {festival.fasting.observed && (
              <div className="mt-3 rounded-lg border border-brand-gold-border bg-brand-primary/10 p-3">
                <p className="flex items-center gap-2 text-sm font-bold text-brand-primary dark:text-amber-100">
                  <Flame className="h-4 w-4" />
                  {language === 'hi' ? 'व्रत' : 'Fasting'}: {festival.fasting.type || (language === 'hi' ? 'पालन' : 'Observed')}
                </p>
                {(festival.fasting.rules_hi || festival.fasting.rules_en) && (
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {language === 'hi' ? festival.fasting.rules_hi || festival.fasting.rules_en : festival.fasting.rules_en}
                  </p>
                )}
              </div>
            )}

            <div className="mt-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {language === 'hi' ? 'विधि' : 'Rituals'}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {festival.rituals.map((ritual) => (
                  <span key={ritual} className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground">
                    {ritual}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))
      )}
    </div>
  );
}

export default function FestivalCalendar() {
  const { language } = useLanguage();
  const lang = language === 'hi' ? 'hi' : 'en';
  const [visibleMonth, setVisibleMonth] = useState(getCurrentFestivalMonth());
  const [monthData, setMonthData] = useState<FestivalMonthData | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedFestivals, setSelectedFestivals] = useState<FestivalData[]>([]);
  const [reminders, setReminders] = useState<FestivalReminder[]>(() => loadFestivalReminders());
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    loadFestivalMonth(2026, visibleMonth)
      .then((data) => {
        if (!isMounted) return;
        setMonthData(data);
        setSelectedDate(null);
        setSelectedFestivals([]);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Unable to load festival data.');
        setMonthData(null);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [visibleMonth]);

  useEffect(() => {
    const syncReminders = () => setReminders(loadFestivalReminders());
    window.addEventListener('hari-kirtan:festival-reminders', syncReminders);
    return () => window.removeEventListener('hari-kirtan:festival-reminders', syncReminders);
  }, []);

  const days = useMemo(() => buildCalendarDays(visibleMonth, monthData), [visibleMonth, monthData]);
  const weekDays = lang === 'hi' ? ['सो', 'मं', 'बु', 'गु', 'शु', 'श', 'र'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = getCurrentFestivalMonth() === visibleMonth ? todayInIndia() : '';

  function selectDate(day: CalendarDay) {
    if (!day.inMonth) return;
    setSelectedDate(day.date);
    setSelectedFestivals(day.festivals);
    setSheetOpen(true);
  }

  function toggleFestivalReminder(festival: FestivalData) {
    const existing = findReminder(reminders, 'festival', festival.date, festival.id);
    if (existing) {
      setReminders(removeFestivalReminder(existing.id));
      return;
    }
    setReminders(upsertFestivalReminder(festival, { leadDays: 1 }));
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      className="festival-calendar temple-panel p-4 backdrop-blur-md sm:p-6 rounded-3xl border border-brand-gold-border/60 bg-surface-raised/95 shadow-md"
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-brand-gold-border/40 pb-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold tracking-wider text-brand-primary dark:text-brand-gold">
            <CalendarDays className="h-4 w-4 text-brand-gold" />
            {lang === 'hi' ? 'हिंदू पर्व एवं व्रत कैलेंडर' : 'Hindu Festival & Vrat Calendar'}
          </p>
          <h3 className="mt-1 font-display text-2xl font-bold text-brand-primary dark:text-brand-gold tracking-wide">
            {formatMonthTitle(visibleMonth, lang)}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" size="icon" variant="outline" className="h-9 w-9 rounded-full border-brand-gold-border/60 text-brand-primary dark:text-brand-gold hover:bg-brand-primary/10" onClick={() => setVisibleMonth(shiftMonth(visibleMonth, -1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button type="button" variant="outline" size="sm" className="rounded-full border-brand-gold-border/60 bg-brand-primary/10 text-brand-primary dark:text-brand-gold px-4 text-xs font-bold hover:bg-brand-primary/20" onClick={() => setVisibleMonth(getCurrentFestivalMonth())}>
            {lang === 'hi' ? 'आज' : 'Today'}
          </Button>
          <Button type="button" size="icon" variant="outline" className="h-9 w-9 rounded-full border-brand-gold-border/60 text-brand-primary dark:text-brand-gold hover:bg-brand-primary/10" onClick={() => setVisibleMonth(shiftMonth(visibleMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && <div className="mb-3 rounded-xl border border-amber-300/40 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-100">{error}</div>}

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {weekDays.map((day) => (
          <div key={day} className="px-1 py-2 text-center text-xs font-bold text-brand-primary dark:text-brand-gold bg-brand-primary/5 dark:bg-brand-gold/10 rounded-xl border border-brand-gold-border/30">
            {day}
          </div>
        ))}
        {days.map((day, index) => {
          const active = selectedDate === day.date;
          const isToday = day.date === today;
          const hasFestivals = day.festivals.length > 0;
          return (
            <button
              key={day.date || `blank-${index}`}
              type="button"
              disabled={!day.inMonth}
              onClick={() => selectDate(day)}
              className={cn(
                'min-h-[5.2rem] rounded-2xl border p-2 text-left transition-all duration-200 sm:min-h-[6.5rem] sm:p-2.5 flex flex-col justify-between relative overflow-hidden',
                day.inMonth
                  ? 'border-brand-gold-border/40 bg-card dark:bg-zinc-900/60 hover:border-brand-gold hover:shadow-md hover:-translate-y-0.5'
                  : 'border-transparent bg-transparent opacity-0 pointer-events-none',
                active && 'border-brand-gold bg-brand-primary/15 dark:bg-amber-950/40 shadow-md ring-2 ring-brand-gold/50',
                isToday && 'border-2 border-brand-gold bg-gradient-to-br from-brand-primary/15 via-brand-gold/15 to-amber-500/10 shadow-[0_0_18px_rgba(212,164,74,0.35)] ring-2 ring-brand-gold/60',
              )}
            >
              {day.inMonth && (
                <>
                  <div className="flex items-center justify-between w-full">
                    <span className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all",
                      isToday
                        ? "bg-gradient-to-r from-[#7A2D28] to-[#5A1F1A] text-white shadow-sm font-extrabold"
                        : "text-foreground"
                    )}>
                      {day.day}
                    </span>
                    {hasFestivals && (
                      <span className="w-2 h-2 rounded-full bg-brand-gold shadow-[0_0_8px_rgba(212,164,74,0.8)] animate-pulse" />
                    )}
                  </div>

                  <div className="mt-1 space-y-1 w-full">
                    {day.festivals.slice(0, 2).map((festival) => (
                      <span
                        key={festival.id}
                        className="block truncate rounded-lg px-2 py-0.5 text-[10px] font-bold leading-tight text-white shadow-xs"
                        style={{ backgroundColor: festival.color || '#7A2D28' }}
                      >
                        {lang === 'hi' ? festival.name_hi : festival.name_en}
                      </span>
                    ))}
                    {day.festivals.length > 2 && (
                      <span className="block text-[10px] font-bold text-brand-primary dark:text-brand-gold pl-0.5">
                        +{day.festivals.length - 2} more
                      </span>
                    )}
                    {!hasFestivals && <Sparkles className="mt-2 h-3.5 w-3.5 text-brand-gold/25" />}
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>

      {isLoading && <p className="mt-3 text-sm text-muted-foreground">{lang === 'hi' ? 'पर्व लोड हो रहे हैं...' : 'Loading festivals...'}</p>}

      <div className="mt-5 hidden md:block">
        <FestivalDetailContent
          date={selectedDate}
          festivals={selectedFestivals}
          language={lang}
          reminders={reminders}
          onToggleReminder={toggleFestivalReminder}
        />
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="max-h-[82vh] overflow-y-auto rounded-t-[1.5rem] border-amber-300/30 p-5 md:hidden">
          <SheetHeader className="pr-8 text-left">
            <SheetTitle className="font-display">{lang === 'hi' ? 'पर्व विवरण' : 'Festival Details'}</SheetTitle>
            <SheetDescription>{selectedDate ? formatDate(selectedDate, lang) : ''}</SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            <FestivalDetailContent
              date={selectedDate}
              festivals={selectedFestivals}
              language={lang}
              reminders={reminders}
              onToggleReminder={toggleFestivalReminder}
            />
          </div>
        </SheetContent>
      </Sheet>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><Moon className="h-3.5 w-3.5 text-amber-600" />{lang === 'hi' ? 'तिथि अनुसार पर्व' : 'Lunar and solar festivals'}</span>
        <span>{monthData?.festivals.length ?? 0} {lang === 'hi' ? 'पर्व' : 'festivals'}</span>
      </div>
    </motion.section>
  );
}
