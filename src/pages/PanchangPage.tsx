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
  ArrowRight,
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
import omImage from './images/om.webp';
import rahuImage from './images/rahu.webp';
import abhijitImg from './images/abhijit muhrat.webp';
import vijayImg from './images/vijay muhrat.webp';
import godhuliImg from './images/godhuli muhrat.webp';
import brahmaImg from './images/bramha muhrat.webp';
import type { FestivalSummary } from '@/types/festival';
import { loadPanchang } from '@/lib/panchang/loadPanchang';
import { todayInIndia, type PanchangData } from '@/lib/panchang/types';
import { panchangKaryaLists, panchangMetaPlaceholders, panchangMuhuratTiles } from '@/data/panchangTemple';
import { computeShubhAshubhKarya, type PanchangInput } from '@/utils/shubhKaryaEngine';
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

const PANCHANG_LOCALIZATION: Record<string, string> = {
  // Paksha
  'Shukla Paksha': 'शुक्ल पक्ष',
  'Krishna Paksha': 'कृष्ण पक्ष',
  
  // Vara (Days)
  'Ravivaar': 'रविवार',
  'Somvaar': 'सोमवार',
  'Mangalvaar': 'मंगलवार',
  'Budhvaar': 'बुधवार',
  'Guruvaar': 'गुरुवार',
  'Shukravaar': 'शुक्रवार',
  'Shanivaar': 'शनिवार',
  'Sunday': 'रविवार',
  'Monday': 'सोमवार',
  'Tuesday': 'मंगलवार',
  'Wednesday': 'बुधवार',
  'Thursday': 'गुरुवार',
  'Friday': 'शुक्रवार',
  'Saturday': 'शनिवार',

  // Tithis
  'Prathama': 'प्रथमा',
  'Dwitiya': 'द्वितीया',
  'Tritiya': 'तृतीया',
  'Chaturthi': 'चतुर्थी',
  'Panchami': 'पंचमी',
  'Panchimi': 'पंचमी',
  'Shashti': 'षष्ठी',
  'Saptami': 'सप्तमी',
  'Ashtami': 'अष्टमी',
  'Navami': 'नवमी',
  'Dashami': 'दशमी',
  'Ekadashi': 'एकादशी',
  'Dwadashi': 'द्वादशी',
  'Trayodashi': 'त्रयोदशी',
  'Chaturdashi': 'चतुर्दशी',
  'Purnima': 'पूर्णिमा',
  'Amavasya': 'अमावस्या',
  'Poornima': 'पूर्णिमा',

  // Nakshatras
  'Ashwini': 'अश्विनी',
  'Bharani': 'भरणी',
  'Krittika': 'कृत्तिका',
  'Rohini': 'रोहिणी',
  'Mrigashira': 'मृगशिरा',
  'Ardra': 'आर्द्रा',
  'Punarvasu': 'पुनर्वसु',
  'Pushya': 'पुष्य',
  'Ashlesha': 'आश्लेषा',
  'Magha': 'मघा',
  'Purva Phalguni': 'पूर्वा फाल्गुनी',
  'Uttara Phalguni': 'उत्तरा फाल्गुनी',
  'Hasta': 'हस्त',
  'Chitra': 'चित्रा',
  'Swati': 'स्वाती',
  'Vishakha': 'विशाखा',
  'Anuradha': 'अनुराधा',
  'Jyeshtha': 'ज्येष्ठा',
  'Mula': 'मूल',
  'Purva Ashadha': 'पूर्वाषाढ़ा',
  'Uttara Ashadha': 'उत्तराषाढ़ा',
  'Shravana': 'श्रवण',
  'Sravana': 'श्रवण',
  'Dhanishta': 'धनिष्ठा',
  'Shatabhisha': 'शतभिषा',
  'Purva Bhadrapada': 'पूर्वाभाद्रपद',
  'Uttara Bhadrapada': 'उत्तराभाद्रपद',
  'Revati': 'रेवती',

  // Rashi
  'Mesha': 'मेष',
  'Vrishabha': 'वृषभ',
  'Mithuna': 'मिथुन',
  'Karka': 'कर्क',
  'Simha': 'सिंह',
  'Kanya': 'कन्या',
  'Tula': 'तुला',
  'Vrishchika': 'वृश्चिक',
  'Dhanu': 'धनु',
  'Makara': 'मकर',
  'Kumbha': 'कुंभ',
  'Meena': 'मीन',
  
  // Ayan
  'Uttarayan': 'उत्तरायण',
  'Dakshinayan': 'दक्षिणायण',
  
  // Ritu
  'Vasanta': 'वसंत',
  'Grishma': 'ग्रीष्म',
  'Varsha': 'वर्षा',
  'Sharad': 'शरद',
  // Yogas
  'Indra': 'इंद्र',
  'Vaidhriti': 'वैधृति',
  'Vishkumbha': 'विष्कुंभ',
  'Priti': 'प्रीति',
  'Ayushman': 'आयुष्मान',
  'Saubhagya': 'सौभाग्य',
  'Shobhana': 'शोभन',
  'Atiganda': 'अतिगण्ड',
  'Sukarma': 'सुकर्मा',
  'Dhriti': 'धृति',
  'Shula': 'शूल',
  'Ganda': 'गण्ड',
  'Vriddhi': 'वृद्धि',
  'Dhruva': 'ध्रुव',
  'Vyaghata': 'व्याघात',
  'Harshana': 'हर्षण',
  'Vajra': 'वज्र',
  'Siddhi': 'सिद्धि',
  'Vyatipata': 'व्यतिपात',
  'Variyana': 'वरीयान',
  'Parigha': 'परिघ',
  'Shiva': 'शिव',
  'Siddha': 'सिद्ध',
  'Sadhya': 'साध्य',
  'Shubha': 'शुभ',
  'Shukla': 'शुक्ल',
  'Brahma': 'ब्रह्म',
  'Aindra': 'ऐन्द्र',

  // Karanas
  'Bava': 'बव',
  'Balava': 'बालव',
  'Kaulava': 'कौलव',
  'Taitila': 'तैतिल',
  'Gara': 'गर',
  'Vanija': 'वणिज',
  'Vishti': 'विष्टि',
  'Shakuni': 'शकुनि',
  'Chatushpada': 'चतुष्पाद',
  'Nagava': 'नाग',
  'Kintughna': 'किस्तुघ्न',
};

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
  const displayValue = (value?: string) => {
    if (!value || value.trim().length === 0) return emptyValue;
    if (lang === 'en') return value;

    // Try exact match
    if (PANCHANG_LOCALIZATION[value]) return PANCHANG_LOCALIZATION[value];

    // Try partial match for things like "Nakshatra - Pada"
    let localized = value;
    Object.entries(PANCHANG_LOCALIZATION).forEach(([en, hi]) => {
      const regex = new RegExp(`\\b${en}\\b`, 'gi');
      localized = localized.replace(regex, hi);
    });

    return localized;
  };
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
    seeMore: lang === 'hi' ? 'और अधिक देखें' : 'See More Details',
    upcomingEvents: lang === 'hi' ? 'आने वाले पर्व और आयोजन' : 'Upcoming Events',
    noUpcomingEvents: lang === 'hi' ? 'अभी कोई आने वाला पर्व सूचीबद्ध नहीं है।' : 'No upcoming events listed.',
    home: lang === 'hi' ? 'होम पर जाएं' : 'Back Home',
  };

  const pakshaText = panchang?.paksha
    ? lang === 'hi'
      ? `${displayValue(panchang.paksha)}`
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

  const muhuratTiles = panchangMuhuratTiles.map((tile) => {
    let img = abhijitImg;
    if (tile.id === 'vijay') img = vijayImg;
    if (tile.id === 'godhuli') img = godhuliImg;
    if (tile.id === 'brahma') img = brahmaImg;

    let time = tile.time;
    if (tile.id === 'brahma' && panchang?.brahma_muhurat) time = panchang.brahma_muhurat;
    if (tile.id === 'abhijit' && panchang?.abhijit_muhurat) time = panchang.abhijit_muhurat;
    if (tile.id === 'vijay' && panchang?.vijay_muhurat) time = panchang.vijay_muhurat;

    return {
      ...tile,
      image: img,
      time,
    };
  });

  const parsePanchangTime = (timeStr?: string): { start: Date; end: Date } | null => {
    if (!timeStr || !timeStr.includes('-')) return null;
    const [startPart, endPart] = timeStr.split('-').map(s => s.trim());
    
    const parseSingle = (part: string) => {
      const match = part.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return null;
      let [_, hours, minutes, ampm] = match;
      let h = parseInt(hours);
      if (ampm.toUpperCase() === 'PM' && h < 12) h += 12;
      if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;
      const d = new Date();
      d.setHours(h, parseInt(minutes), 0, 0);
      return d;
    };

    const start = parseSingle(startPart);
    const end = parseSingle(endPart);
    if (!start || !end) return null;
    return { start, end };
  };

  const checkTimeInWindow = (windowStr?: string): boolean => {
    const window = parsePanchangTime(windowStr);
    if (!window) return false;
    const now = new Date();
    return now >= window.start && now <= window.end;
  };

  const getVaraIndex = (varaStr?: string): number => {
    if (!varaStr) return new Date().getDay();
    const map: Record<string, number> = {
      'Sunday': 0, 'Ravivaar': 0, 'Somvaar': 1, 'Monday': 1,
      'Tuesday': 2, 'Mangalvaar': 2, 'Wednesday': 3, 'Budhvaar': 3,
      'Thursday': 4, 'Guruvaar': 4, 'Friday': 5, 'Shukravaar': 5,
      'Saturday': 6, 'Shanivaar': 6
    };
    return map[varaStr] ?? new Date().getDay();
  };

  const dynamicKarya = panchang ? computeShubhAshubhKarya({
    tithiNumber: panchang.tithi_number || 1,
    varaIndex: getVaraIndex(panchang.vara),
    nakshatraName: panchang.nakshatra?.split(' ')[0] || '',
    isRahuKaal: checkTimeInWindow(panchang.rahu_kaal),
    isAbhijitMuhurat: checkTimeInWindow(muhuratTiles.find(t => t.id === 'abhijit')?.time),
    isBrahmaKaal: checkTimeInWindow(panchang.brahma_muhurat),
  }) : null;

  const detailsSection = isLoading && !panchang ? (
    <LoadingTempleCard />
  ) : (
    <section className="temple-panel p-4 sm:p-7">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-amber-500/10 pb-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              {text.panchangDetails}
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-200/50">
              Sacred Daily Insights
            </p>
          </div>
        </div>
        <div className="px-4 py-1.5 rounded-full bg-amber-500/5 border border-amber-500/10">
          <p className="text-sm font-bold text-amber-100/90">{formatDate(displayDate, lang)}</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-amber-300/35 bg-amber-500/10 p-4 text-sm text-amber-100 flex items-center gap-3">
          <TriangleAlert className="h-5 w-5 text-amber-400 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-2 gap-y-0 sm:gap-4">
        <div className="flex flex-col">
          {leftDetails.map(({ label, value, icon: Icon }) => (
            <div key={label} className="group flex items-center gap-2 py-3 border-b border-amber-500/10 last:border-0 sm:rounded-xl sm:border sm:bg-amber-500/[0.02] sm:p-3.5 sm:mb-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex flex-1 flex-col min-w-0 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-200/70 sm:text-xs">{label}</span>
                <span className="text-sm font-bold text-foreground tracking-wide truncate sm:ml-2">{value}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col">
          {rightDetails.map(({ label, value, icon: Icon }) => (
            <div key={label} className="group flex items-center gap-2 py-3 border-b border-amber-500/10 last:border-0 sm:rounded-xl sm:border sm:bg-amber-500/[0.02] sm:p-3.5 sm:mb-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex flex-1 flex-col min-w-0 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-200/70 sm:text-xs">{label}</span>
                <span className="text-sm font-bold text-foreground tracking-wide truncate sm:ml-2">{value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const muhuratBody = (
    <>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-4">
        {muhuratTiles.map((tile) => (
          <div key={tile.id} className="temple-panel-soft group relative flex min-w-0 items-center justify-between overflow-hidden p-3 sm:p-5">
            <div className="relative z-10 flex-1 min-w-0">
              <p className="text-sm sm:text-lg font-bold uppercase tracking-[0.1em] text-amber-200/90">
                {localized(tile.title)}
              </p>
              <p className="mt-1.5 text-xs sm:text-base font-semibold text-amber-100/80 whitespace-nowrap overflow-hidden text-ellipsis">
                {tile.time}
              </p>
            </div>
            <div className="shrink-0 ml-2">
              <img 
                src={(tile as any).image} 
                alt={localized(tile.title)} 
                className="h-10 w-10 sm:h-14 sm:w-14 object-contain transition-transform duration-300 group-hover:scale-110" 
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-amber-400/35 bg-amber-500/10 p-3 sm:p-5 overflow-hidden relative group">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-2 text-amber-100">
              <TriangleAlert className="h-4 w-4 text-amber-400" />
              <p className="font-display text-base sm:text-xl font-bold">{text.rahuKaal}</p>
            </div>
            <p className="mt-1.5 text-lg sm:text-2xl font-bold text-amber-100 whitespace-nowrap">{displayValue(panchang?.rahu_kaal)}</p>
            <p className="mt-1 text-sm sm:text-sm text-amber-100/70">{text.rahuHint}</p>
          </div>
          <div className="shrink-0">
            <img 
              src={rahuImage} 
              alt="Rahu" 
              className="h-16 w-16 sm:h-28 sm:w-28 object-contain drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-110" 
            />
          </div>
        </div>
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
    <section className="temple-panel p-3 sm:p-8 dark:bg-zinc-900/60 dark:border-white/5 transition-colors duration-300">
      {dynamicKarya && (
        <div className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 dark:bg-amber-900/10 dark:border-amber-700/20">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <p className="text-lg font-bold text-amber-100 dark:text-amber-50">{dynamicKarya.todaySummary}</p>
          </div>
          {dynamicKarya.dominantReason && (
            <p className="mt-2 text-sm text-amber-200/70 dark:text-amber-200/40">
              मुख्य कारक: <span className="text-amber-400 font-bold dark:text-amber-300">{dynamicKarya.dominantReason}</span>
            </p>
          )}
        </div>
      )}

      {dynamicKarya?.ashubhKarya.some(k => k.name === 'सभी शुभ कार्य') && (
        <motion.div 
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mb-8 p-4 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center gap-3 dark:bg-rose-900/20 dark:border-rose-700/30"
        >
          <TriangleAlert className="h-6 w-6 text-rose-400" />
          <p className="text-lg font-bold text-rose-100 dark:text-rose-50">⚠️ अभी राहु काल है — शुभ कार्य वर्जित</p>
        </motion.div>
      )}

      {dynamicKarya?.shubhKarya.some(k => k.reason.includes('अभिजित')) && (
        <div className="mb-8 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-3 dark:bg-emerald-900/20 dark:border-emerald-700/30">
          <Sparkles className="h-6 w-6 text-emerald-400" />
          <p className="text-lg font-bold text-emerald-100 dark:text-emerald-50">✨ अभिजित मुहूर्त — सभी कार्य शुभ</p>
        </div>
      )}

      <div className="relative flex flex-row items-stretch gap-2 sm:gap-12">
        {/* Shubh Karya */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-3 sm:mb-5">
            <div className="flex h-6 w-6 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-emerald-500/10 dark:bg-emerald-900/20">
              <CheckCircle2 className="h-4 w-4 sm:h-6 sm:w-6 text-emerald-400" />
            </div>
            <p className="text-[10px] sm:text-xl font-bold uppercase tracking-[0.15em] text-emerald-300/90 dark:text-emerald-200 truncate">{text.shubhKarya}</p>
          </div>
          <div className="space-y-3 sm:space-y-5">
            {(dynamicKarya?.shubhKarya.slice(0, 4) || panchangKaryaLists.shubh.slice(0, 4).map(i => ({ name: localized(i), reason: 'स्थिर', source: 'tithi', priority: 3 }))).map((item, idx) => (
              <div key={idx} className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-[10px] sm:text-lg text-amber-100/90 dark:text-brand-cream/90">
                  <CheckCircle2 className="h-3 w-3 sm:h-5 sm:w-5 shrink-0 text-emerald-300/60 dark:text-emerald-500/40" />
                  <span className="truncate font-bold">{'name' in item ? item.name : localized(item as any)}</span>
                </div>
                {'reason' in item && (
                  <span className="ml-5 sm:ml-7 text-[8px] sm:text-xs text-amber-200/40 dark:text-amber-200/20 font-medium">{item.reason}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Vertical Separator with Om */}
        <div className="flex flex-col items-center justify-center px-1 sm:px-6">
          <div className="w-[1.5px] h-full bg-gradient-to-b from-transparent via-amber-500/40 to-transparent dark:via-white/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2.5 sm:p-5 bg-[#120c08] dark:bg-[#0a0705] rounded-full border border-amber-500/20 dark:border-white/5 shadow-[0_0_35px_rgba(245,158,11,0.2)] dark:shadow-[0_0_35px_rgba(255,255,255,0.05)] z-10">
            <img src={omImage} alt="Om" className="h-10 w-10 sm:h-20 sm:w-20 object-contain" />
          </div>
        </div>

        {/* Ashubh Karya */}
        <div className="flex-1 min-w-0 text-right sm:text-left">
          <div className="flex items-center justify-end sm:justify-start gap-1.5 mb-3 sm:mb-5">
            <p className="text-[10px] sm:text-xl font-bold uppercase tracking-[0.15em] text-rose-300/90 dark:text-rose-200 truncate order-1 sm:order-2">{text.ashubhKarya}</p>
            <div className="flex h-6 w-6 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-rose-500/10 dark:bg-rose-900/20 order-2 sm:order-1">
              <XCircle className="h-4 w-4 sm:h-6 sm:w-6 text-rose-400" />
            </div>
          </div>
          <div className="space-y-3 sm:space-y-5">
            {(dynamicKarya?.ashubhKarya.slice(0, 4) || panchangKaryaLists.ashubh.slice(0, 4).map(i => ({ name: localized(i), reason: 'स्थिर', source: 'tithi', priority: 3 }))).map((item, idx) => (
              <div key={idx} className="flex flex-col gap-1 items-end sm:items-start">
                <div className="flex items-center justify-end sm:justify-start gap-2 text-[10px] sm:text-lg text-amber-100/90 dark:text-brand-cream/90">
                  <span className="truncate font-bold order-1 sm:order-2">{'name' in item ? item.name : localized(item as any)}</span>
                  <XCircle className="h-3 w-3 sm:h-5 sm:w-5 shrink-0 text-rose-300/60 dark:text-rose-500/40 order-2 sm:order-1" />
                </div>
                {'reason' in item && (
                  <span className="mr-5 sm:mr-0 sm:ml-7 text-[8px] sm:text-xs text-amber-200/40 dark:text-amber-200/20 font-medium">{item.reason}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* See More Details Button */}
      <div className="mt-8 flex justify-center">
        <Link
          to="/panchang/details"
          className="group relative flex items-center gap-3 overflow-hidden rounded-full border border-amber-500/20 bg-amber-500/5 dark:bg-white/5 dark:border-white/10 px-8 py-3.5 text-sm font-bold uppercase tracking-[0.15em] text-amber-200 dark:text-amber-100 backdrop-blur-xl transition-all hover:border-amber-400/40 hover:bg-amber-500/10 dark:hover:bg-white/10 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]"
        >
          <div className="absolute inset-0 translate-y-[100%] bg-gradient-to-t from-amber-500/10 to-transparent dark:from-white/5 transition-transform duration-500 group-hover:translate-y-0" />
          <span className="relative">{text.seeMore}</span>
          <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
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

          <div className="relative flex flex-col items-center text-center gap-6">
            <div className="flex flex-col items-center w-full gap-2">
              <div className="min-w-0 max-w-2xl">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200/70 sm:text-[12px] sm:tracking-[0.4em]">
                  {lang === 'hi' ? '|| श्री गणेशाय नमः ||' : '|| Shri Ganeshay Namah ||'}
                </p>
                <h1 className="mt-4 font-display text-4xl font-bold text-foreground sm:text-6xl tracking-tight">
                  {text.title}
                </h1>
                
                <div className="mt-8 flex items-center justify-center gap-4 text-amber-500/40">
                  <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-current" />
                  <div className="flex items-center gap-3 text-amber-400/90">
                    <span className="text-xl">ॐ</span>
                    <span className="font-display text-xl font-bold tracking-[0.15em]">{lang === 'hi' ? 'जय श्री राम' : 'Jai Shri Ram'}</span>
                    <span className="text-xl">ॐ</span>
                  </div>
                  <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-current" />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="rounded-full border border-amber-300/35 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-100/80">
                  {isStale ? text.updating : text.updated}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 w-full max-w-5xl min-[480px]:grid-cols-2 lg:grid-cols-3">
              {/* Date Card */}
              <div className="temple-panel-soft p-4 flex flex-col items-center justify-center text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-200/60 mb-3">{text.dateLabel}</p>
                <div className="flex items-center gap-4">
                  <span className="text-5xl font-display font-bold text-amber-100">{dateParts.day}</span>
                  <div className="text-left">
                    <p className="text-base font-bold text-amber-100 leading-none">{dateParts.month}</p>
                    <p className="text-sm font-semibold text-amber-100/70 mt-1">{dateParts.year}</p>
                    <p className="text-xs font-bold text-amber-400/90 mt-1">{dateParts.weekday}</p>
                  </div>
                </div>
              </div>

              {/* Vikram Card */}
              <div className="temple-panel-soft p-4 flex flex-col items-center justify-center text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-200/60 mb-2">{text.vikram}</p>
                <p className="text-xl font-bold text-amber-100">{localized(panchangMetaPlaceholders.vikramSamvat)}</p>
                <div className="mt-3 flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                   <span className="text-xs font-bold text-amber-200">{pakshaText}</span>
                </div>
              </div>

              {/* Sun Info Card */}
              <div className="temple-panel-soft p-4 flex flex-col items-center justify-center min-[480px]:col-span-2 lg:col-span-1">
                <div className="grid grid-cols-2 gap-8 w-full">
                  <div className="flex flex-col items-center gap-2">
                    <Sunrise className="h-6 w-6 text-amber-400" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-200/60">{text.sunrise}</p>
                    <p className="text-base font-bold text-amber-100">{displayValue(panchang?.sunrise)}</p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Sunset className="h-6 w-6 text-amber-400" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-200/60">{text.sunset}</p>
                    <p className="text-base font-bold text-amber-100">{displayValue(panchang?.sunset)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 w-full">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/5 border border-amber-500/10 text-amber-400/90">
                <MapPin className="h-3.5 w-3.5" />
                <span className="text-sm font-semibold tracking-wide">{currentZone.city}, {lang === 'hi' ? 'भारत' : 'India'}</span>
              </div>

              <label className="relative block w-full max-w-[320px]">
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200/70">
                  {text.changeZone}
                </span>
                <select
                  value={currentZone.name}
                  onChange={(event) => handleZoneChange(event.target.value)}
                  className="h-11 w-full appearance-none rounded-full border border-amber-300/30 bg-background/70 px-6 pr-10 text-sm font-semibold text-foreground outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20"
                >
                  {ZONES.map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.label} - {item.city}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute bottom-3.5 right-5 h-4 w-4 text-amber-200/70" />
              </label>
            </div>
          </div>
        </motion.section>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
          <div className="min-w-0 space-y-4 sm:space-y-6">
            {detailsSection}
            {muhuratSection}
            {karyaSection}

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
            {upcomingEventsSection}
          </aside>
        </div>
      </div>
    </div>
  );
}
