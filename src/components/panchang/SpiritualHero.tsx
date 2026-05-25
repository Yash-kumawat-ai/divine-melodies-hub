import { motion } from 'framer-motion';
import { CalendarHeart, Sparkles } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export default function SpiritualHero() {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-amber-300/25 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.28),transparent_34%),linear-gradient(135deg,#2a1607,#5b220b_48%,#1a1006)] px-5 py-7 text-brand-cream shadow-[0_30px_90px_-46px_rgba(245,158,11,0.75)] sm:px-7">
      <div className="pointer-events-none absolute right-6 top-5 text-7xl text-amber-200/10">ॐ</div>
      <motion.span
        aria-hidden
        className="absolute left-8 top-8 h-2 w-2 rounded-full bg-amber-200/80 shadow-[0_0_22px_rgba(253,230,138,0.9)]"
        animate={{ y: [0, -8, 0], opacity: [0.45, 1, 0.45] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <div className="relative max-w-2xl">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-amber-100 backdrop-blur">
          <CalendarHeart className="h-4 w-4" />
          {isHi ? 'पंचांग और पर्व' : 'Panchang & Festivals'}
        </div>
        <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
          {isHi ? 'हर दिन की पूजा, व्रत और पर्व एक शांत स्थान पर' : 'A calm daily guide for puja, vrat and sacred festivals'}
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-amber-50/72 sm:text-base">
          {isHi
            ? 'आज का पंचांग, मंत्र, दर्शन और आने वाले हिंदू पर्व — आधुनिक, सरल और मोबाइल पर तेज।'
            : 'Today’s Panchang, mantra, darshan and upcoming Hindu festivals in a modern, lightweight spiritual dashboard.'}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {[isHi ? 'तिथि' : 'Tithi', isHi ? 'नक्षत्र' : 'Nakshatra', isHi ? 'मंत्र' : 'Mantra'].map((item) => (
            <span key={item} className="inline-flex items-center gap-1 rounded-full bg-amber-200/12 px-3 py-1 text-xs text-amber-50/80">
              <Sparkles className="h-3 w-3" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
