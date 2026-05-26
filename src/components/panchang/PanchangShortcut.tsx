import { CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';

export default function PanchangShortcut() {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  return (
    <div className="border-b border-amber-300/20 bg-background/95 px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/78">
      <div className="container mx-auto flex max-w-6xl justify-center">
        <Link
          to="/panchang"
          className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-full border border-amber-300/35 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-800 shadow-[0_12px_36px_-30px_rgba(245,158,11,0.85)] transition hover:border-amber-400 hover:bg-amber-500/15 dark:text-amber-100"
        >
          <CalendarDays className="h-4 w-4 shrink-0" />
          <span className="truncate">{isHi ? 'आज का पंचांग और पर्व देखें' : "View today's Panchang & festivals"}</span>
        </Link>
      </div>
    </div>
  );
}
