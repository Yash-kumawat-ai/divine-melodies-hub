import { motion } from 'framer-motion';
import { CalendarDays, Clock, Moon, Sparkles, Sun } from 'lucide-react';
import { todaysPanchang, type LocalizedText } from '@/data/panchang';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

function pick(text: LocalizedText, language: 'en' | 'hi') {
  return text[language];
}

function formatToday(language: 'en' | 'hi') {
  return new Intl.DateTimeFormat(language === 'hi' ? 'hi-IN' : 'en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

export default function PanchangCard() {
  const { language } = useLanguage();
  const lang = language === 'hi' ? 'hi' : 'en';

  const items = [
    {
      label: lang === 'hi' ? 'तिथि' : 'Tithi',
      value: pick(todaysPanchang.tithi, lang),
      icon: Moon,
    },
    {
      label: lang === 'hi' ? 'नक्षत्र' : 'Nakshatra',
      value: pick(todaysPanchang.nakshatra, lang),
      icon: Sparkles,
    },
    {
      label: lang === 'hi' ? 'सूर्योदय' : 'Sunrise',
      value: todaysPanchang.sunrise,
      icon: Sun,
    },
    {
      label: lang === 'hi' ? 'सूर्यास्त' : 'Sunset',
      value: todaysPanchang.sunset,
      icon: Sun,
    },
    {
      label: lang === 'hi' ? 'पक्ष' : 'Paksha',
      value: pick(todaysPanchang.paksha, lang),
      icon: CalendarDays,
    },
    {
      label: lang === 'hi' ? 'राहु काल' : 'Rahu Kaal',
      value: todaysPanchang.rahuKaal,
      icon: Clock,
    },
  ];

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

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-600 dark:text-amber-300">
            {lang === 'hi' ? 'आज का पंचांग' : "Today's Panchang"}
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold leading-tight text-foreground sm:text-3xl">
            {pick(todaysPanchang.festival, lang)}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{formatToday(lang)}</p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-400/15 text-2xl text-amber-600 shadow-inner dark:text-amber-200">
          ॐ
        </div>
      </div>

      <div className="relative mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map(({ label, value, icon: Icon }) => (
          <motion.div
            key={label}
            whileHover={{ y: -2 }}
            className={cn(
              'rounded-2xl border border-border/70 bg-background/70 p-3',
              'shadow-[0_10px_30px_-24px_rgba(0,0,0,0.45)]',
            )}
          >
            <Icon className="mb-2 h-4 w-4 text-amber-600 dark:text-amber-300" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-bold leading-snug text-foreground">{value}</p>
          </motion.div>
        ))}
      </div>
    </motion.article>
  );
}
