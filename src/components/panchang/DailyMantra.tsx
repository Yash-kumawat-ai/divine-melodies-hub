import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { todaysPanchang } from '@/data/panchang';
import { useLanguage } from '@/hooks/useLanguage';

export default function DailyMantra() {
  const { language } = useLanguage();
  const lang = language === 'hi' ? 'hi' : 'en';

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      className="rounded-[1.5rem] border border-amber-300/25 bg-gradient-to-br from-amber-50 to-orange-50 p-5 text-[#3B1F0A] shadow-[0_20px_60px_-36px_rgba(245,158,11,0.8)] dark:from-[#2a1607] dark:to-[#130b05] dark:text-amber-50"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/15 text-lg">ॐ</span>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">
          {todaysPanchang.mantra.title[lang]}
        </p>
      </div>
      <blockquote className="mt-4 font-hindi text-2xl font-bold leading-snug sm:text-3xl">
        {todaysPanchang.mantra.text[lang]}
      </blockquote>
      <p className="mt-3 text-sm leading-relaxed text-[#6b4423] dark:text-amber-100/75">
        {todaysPanchang.mantra.meaning[lang]}
      </p>
      <button
        type="button"
        className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-white/55 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:border-amber-500/50 dark:bg-white/10 dark:text-amber-100"
      >
        <Volume2 className="h-4 w-4" />
        {lang === 'hi' ? 'मंत्र सुनें' : 'Listen to mantra'}
      </button>
    </motion.section>
  );
}
